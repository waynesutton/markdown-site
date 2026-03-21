import { query, mutation, internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { DataModel, type Doc } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";

// Deduplication window: 30 minutes in milliseconds
const DEDUP_WINDOW_MS = 30 * 60 * 1000;

// Session timeout: 2 minutes in milliseconds
const SESSION_TIMEOUT_MS = 2 * 60 * 1000;

// Heartbeat dedup window: 45 seconds (prevents write conflicts from rapid calls or multiple tabs)
// Must be >= frontend HEARTBEAT_DEBOUNCE_MS to ensure backend catches duplicates
const HEARTBEAT_DEDUP_MS = 45 * 1000;
const STATS_QUERY_LIMIT = 1000;

/**
 * Aggregate for page views by path.
 * Provides O(log n) counts instead of O(n) full table scans.
 * Namespace by path to get per-page view counts efficiently.
 */
const pageViewsByPath = new TableAggregate<{
  Namespace: string; // path
  Key: number; // timestamp
  DataModel: DataModel;
  TableName: "pageViews";
}>(components.pageViewsByPath, {
  namespace: (doc) => doc.path,
  sortKey: (doc) => doc.timestamp,
});

/**
 * Aggregate for total page views.
 * Key is null since we only need a global count.
 */
const totalPageViews = new TableAggregate<{
  Key: null;
  DataModel: DataModel;
  TableName: "pageViews";
}>(components.totalPageViews, {
  sortKey: () => null,
});

/**
 * Aggregate for unique visitors.
 * Uses sessionId as key to count distinct sessions.
 * Each session only counted once (first occurrence).
 */
const uniqueVisitors = new TableAggregate<{
  Key: string; // sessionId
  DataModel: DataModel;
  TableName: "pageViews";
}>(components.uniqueVisitors, {
  sortKey: (doc) => doc.sessionId,
});

/**
 * Aggregate for unique paths.
 * Uses path as key to count distinct pages that have been viewed.
 * Enables O(1) retrieval of all unique paths without table scan.
 */
const uniquePaths = new TableAggregate<{
  Key: string; // path
  DataModel: DataModel;
  TableName: "pageViews";
}>(components.uniquePaths, {
  sortKey: (doc) => doc.path,
});

async function updatePageViewAggregates(
  ctx: MutationCtx,
  doc: Doc<"pageViews">,
  isNewVisitor: boolean,
): Promise<void> {
  await pageViewsByPath.insertIfDoesNotExist(ctx, doc);
  await totalPageViews.insertIfDoesNotExist(ctx, doc);
  await uniquePaths.insertIfDoesNotExist(ctx, doc);
  if (isNewVisitor) {
    await uniqueVisitors.insertIfDoesNotExist(ctx, doc);
  }
}

type TitleMap = Record<string, { title: string }>;

function buildPageStats(
  topPaths: Array<{ path: string; views: number }>,
  postsBySlug: TitleMap,
  pagesBySlug: TitleMap,
): Array<{ path: string; title: string; pageType: string; views: number }> {
  return topPaths.map(({ path, views }) => {
    const slug = path.startsWith("/") ? path.slice(1) : path;
    const post = postsBySlug[slug];
    const page = pagesBySlug[slug];
    let title = path;
    let pageType = "other";
    if (path === "/" || path === "") { title = "Home"; pageType = "home"; }
    else if (path === "/stats") { title = "Stats"; pageType = "stats"; }
    else if (post) { title = post.title; pageType = "blog"; }
    else if (page) { title = page.title; pageType = "page"; }
    return { path, title, pageType, views };
  });
}

type ActiveSession = Doc<"activeSessions">;

function collectVisitorLocations(sessions: Array<ActiveSession>): Array<{
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}> {
  const locations: Array<{ latitude: number; longitude: number; city?: string; country?: string }> = [];
  for (const s of sessions) {
    if (s.latitude == null || s.longitude == null) continue;
    locations.push({ latitude: s.latitude, longitude: s.longitude, city: s.city, country: s.country });
  }
  return locations;
}

async function getTopPathStats(
  ctx: QueryCtx,
  recentPathsSet: Set<string>,
  limit: number,
): Promise<Array<{ path: string; views: number }>> {
  const entries = await Promise.all(
    Array.from(recentPathsSet).map(async (path) => ({
      path,
      views: await pageViewsByPath.count(ctx, { namespace: path }),
    })),
  );
  entries.sort((a, b) => b.views - a.views);
  return entries.slice(0, limit);
}

/**
 * Record a page view event.
 * Idempotent: same session viewing same path within 30min = 1 view.
 * Updates aggregate components for efficient O(log n) counts.
 */
export const recordPageView = mutation({
  args: {
    path: v.string(),
    pageType: v.string(),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const now = Date.now();
    const dedupCutoff = now - DEDUP_WINDOW_MS;

    // Check for recent view from same session on same path
    const recentView = await ctx.db
      .query("pageViews")
      .withIndex("by_sessionid_and_path", (q) =>
        q.eq("sessionId", args.sessionId).eq("path", args.path),
      )
      .order("desc")
      .first();

    // Early return if already viewed within dedup window
    if (recentView && recentView.timestamp > dedupCutoff) {
      return null;
    }

    // Check if this is a new unique visitor (first page view for this session)
    const existingSessionView = await ctx.db
      .query("pageViews")
      .withIndex("by_sessionid_and_path", (q) => q.eq("sessionId", args.sessionId))
      .first();
    const isNewVisitor = !existingSessionView;

    // Insert new view event
    const id = await ctx.db.insert("pageViews", {
      path: args.path,
      pageType: args.pageType,
      sessionId: args.sessionId,
      timestamp: now,
    });
    
    // Get document for aggregate components (required for insertIfDoesNotExist)
    const doc = await ctx.db.get(id);
    if (!doc) {
      return null;
    }

    await updatePageViewAggregates(ctx, doc, isNewVisitor);

    return null;
  },
});

/**
 * Update active session heartbeat.
 * Creates or updates session with current path and timestamp.
 * Accepts optional geo location data from Netlify edge function.
 * Idempotent: skips update if recently updated with same path (prevents write conflicts).
 *
 * Write conflict prevention:
 * - Uses 20-second dedup window to skip redundant updates
 * - Frontend uses matching debounce with jitter to prevent synchronized calls
 * - Early return pattern minimizes conflict window
 */
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    currentPath: v.string(),
    // Optional geo data from Netlify geo headers
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const now = Date.now();

    // Find existing session by sessionId using index
    const existingSession = await ctx.db
      .query("activeSessions")
      .withIndex("by_sessionid", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existingSession) {
      // Early return if recently updated (idempotent - prevents write conflicts)
      // Even if path changed, skip update if within dedup window to reduce conflicts
      if (now - existingSession.lastSeen < HEARTBEAT_DEDUP_MS) {
        return null;
      }

      // Patch directly with new data including location if provided
      await ctx.db.patch(existingSession._id, {
        currentPath: args.currentPath,
        lastSeen: now,
        ...(args.city !== undefined && { city: args.city }),
        ...(args.country !== undefined && { country: args.country }),
        ...(args.latitude !== undefined && { latitude: args.latitude }),
        ...(args.longitude !== undefined && { longitude: args.longitude }),
      });
      return null;
    }

    // Create new session only if none exists (with location data if provided)
    await ctx.db.insert("activeSessions", {
      sessionId: args.sessionId,
      currentPath: args.currentPath,
      lastSeen: now,
      ...(args.city !== undefined && { city: args.city }),
      ...(args.country !== undefined && { country: args.country }),
      ...(args.latitude !== undefined && { latitude: args.latitude }),
      ...(args.longitude !== undefined && { longitude: args.longitude }),
    });

    return null;
  },
});

// Maximum number of page stats to return (top N by views)
const PAGE_STATS_LIMIT = 50;

/**
 * Get all stats for the stats page.
 * Real-time subscription via useQuery.
 * Uses aggregate components for O(log n) counts instead of O(n) table scans.
 * Returns top 50 pages by views and visitor locations for the world map.
 */
export const getStats = query({
  args: {
    now: v.number(),
  },
  returns: v.object({
    activeVisitors: v.number(),
    activeByPath: v.array(
      v.object({
        path: v.string(),
        count: v.number(),
      }),
    ),
    totalPageViews: v.number(),
    uniqueVisitors: v.number(),
    publishedPosts: v.number(),
    publishedPages: v.number(),
    trackingSince: v.union(v.number(), v.null()),
    pageStats: v.array(
      v.object({
        path: v.string(),
        title: v.string(),
        pageType: v.string(),
        views: v.number(),
      }),
    ),
    totalPaths: v.number(),
    visitorLocations: v.array(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const sessionCutoff = args.now - SESSION_TIMEOUT_MS;

    // Get active sessions (heartbeat within last 2 minutes)
    const activeSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastseen", (q) => q.gt("lastSeen", sessionCutoff))
      .take(STATS_QUERY_LIMIT);

    // Count active visitors by path
    const activeByPathMap: Record<string, number> = {};
    for (const session of activeSessions) {
      activeByPathMap[session.currentPath] =
        (activeByPathMap[session.currentPath] || 0) + 1;
    }
    const activeByPath = Object.entries(activeByPathMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // Get aggregate counts (fast O(log n))
    const totalPageViewsCount = await totalPageViews.count(ctx);
    const uniqueVisitorsCount = await uniqueVisitors.count(ctx);
    const totalPathsCount = await uniquePaths.count(ctx);

    // Get earliest page view for tracking since date (single doc fetch)
    const firstView = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp")
      .order("asc")
      .first();
    const trackingSince = firstView ? firstView.timestamp : null;

    // Get published posts and pages for titles (indexed queries, typically small)
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(STATS_QUERY_LIMIT);

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(STATS_QUERY_LIMIT);

    // Build a slug-to-content map for fast title lookups
    const postsBySlug: Record<string, { title: string }> = {};
    for (const post of posts) {
      postsBySlug[post.slug] = { title: post.title };
    }
    const pagesBySlug: Record<string, { title: string }> = {};
    for (const page of pages) {
      pagesBySlug[page.slug] = { title: page.title };
    }

    const recentViews = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp")
      .order("desc")
      .take(1000);

    const recentPathsSet = new Set<string>();
    for (const view of recentViews) recentPathsSet.add(view.path);
    for (const session of activeSessions) recentPathsSet.add(session.currentPath);

    const topPaths = await getTopPathStats(ctx, recentPathsSet, PAGE_STATS_LIMIT);
    const pageStats = buildPageStats(topPaths, postsBySlug, pagesBySlug);
    const visitorLocations = collectVisitorLocations(activeSessions);

    return {
      activeVisitors: activeSessions.length,
      activeByPath,
      totalPageViews: totalPageViewsCount,
      uniqueVisitors: uniqueVisitorsCount,
      publishedPosts: posts.length,
      publishedPages: pages.length,
      trackingSince,
      pageStats,
      totalPaths: totalPathsCount,
      visitorLocations,
    };
  },
});

/**
 * Internal mutation to clean up stale sessions.
 * Called by cron job every 5 minutes.
 */
export const cleanupStaleSessions = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = Date.now() - SESSION_TIMEOUT_MS;

    const staleSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastseen", (q) => q.lt("lastSeen", cutoff))
      .take(500);

    // Delete in parallel
    await Promise.all(
      staleSessions.map((session) => ctx.db.delete(session._id)),
    );

    return staleSessions.length;
  },
});

// Batch size for chunked backfilling (keeps memory usage under 16MB limit)
const BACKFILL_BATCH_SIZE = 500;

/**
 * Internal mutation to backfill aggregates in chunks.
 * Processes BACKFILL_BATCH_SIZE records at a time to avoid memory limits.
 * Schedules itself to continue with the next batch until complete.
 */
export const backfillAggregatesChunk = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    totalProcessed: v.number(),
    seenSessionIds: v.array(v.string()),
  },
  returns: v.object({
    status: v.union(v.literal("in_progress"), v.literal("complete")),
    processed: v.number(),
    uniqueSessions: v.number(),
    cursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    // Paginate through pageViews in batches
    const result = await ctx.db
      .query("pageViews")
      .paginate({ numItems: BACKFILL_BATCH_SIZE, cursor: args.cursor });

    // Track unique sessions and paths (restore from previous chunks)
    const seenSessions = new Set<string>(args.seenSessionIds);

    for (const doc of result.page) {
      await pageViewsByPath.insertIfDoesNotExist(ctx, doc);
      await totalPageViews.insertIfDoesNotExist(ctx, doc);
      await uniquePaths.insertIfDoesNotExist(ctx, doc);
      if (!seenSessions.has(doc.sessionId)) {
        seenSessions.add(doc.sessionId);
        await uniqueVisitors.insertIfDoesNotExist(ctx, doc);
      }
    }

    const newTotalProcessed = args.totalProcessed + result.page.length;

    // If there are more records, schedule the next chunk
    if (!result.isDone) {
      // Convert Set to array for passing to next chunk (limited to prevent arg size issues)
      // Only keep the last 10000 session IDs to prevent argument size explosion
      const sessionArray = Array.from(seenSessions).slice(-10000);

      await ctx.scheduler.runAfter(
        0,
        internal.stats.backfillAggregatesChunk,
        {
          cursor: result.continueCursor,
          totalProcessed: newTotalProcessed,
          seenSessionIds: sessionArray,
        },
      );

      return {
        status: "in_progress" as const,
        processed: newTotalProcessed,
        uniqueSessions: seenSessions.size,
        cursor: result.continueCursor,
      };
    }

    // Backfilling complete
    return {
      status: "complete" as const,
      processed: newTotalProcessed,
      uniqueSessions: seenSessions.size,
      cursor: null,
    };
  },
});

/**
 * Start backfilling aggregates from existing pageViews data.
 * This kicks off the chunked backfill process.
 * Safe to call multiple times (uses insertIfDoesNotExist).
 */
export const backfillAggregates = internalMutation({
  args: {},
  returns: v.object({
    message: v.string(),
  }),
  handler: async (ctx) => {
    // Check if there are any pageViews to backfill
    const firstView = await ctx.db.query("pageViews").first();
    if (!firstView) {
      return { message: "No pageViews to backfill" };
    }

    // Start the chunked backfill process
    await ctx.scheduler.runAfter(
      0,
      internal.stats.backfillAggregatesChunk,
      {
        cursor: null,
        totalProcessed: 0,
        seenSessionIds: [],
      },
    );

    return { message: "Backfill started. Check logs for progress." };
  },
});
