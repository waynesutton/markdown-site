import {
  query,
  mutation,
  internalMutation,
  MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { TableAggregate, TableAggregateType } from "@convex-dev/aggregate";
import { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

// Deduplication window: 30 minutes in milliseconds
const DEDUP_WINDOW_MS = 30 * 60 * 1000;

// Session timeout: 2 minutes in milliseconds
const SESSION_TIMEOUT_MS = 2 * 60 * 1000;

// Heartbeat dedup window: 10 seconds (prevents write conflicts from rapid calls)
const HEARTBEAT_DEDUP_MS = 10 * 1000;

// Type definitions for aggregates
type PageViewsTotalAggType = TableAggregateType<null, DataModel, "pageViews">;
type PageViewsByPathAggType = TableAggregateType<string, DataModel, "pageViews">;
type UniqueVisitorsAggType = TableAggregateType<null, DataModel, "visitors">;

// Aggregate for total page view count (O(log n) instead of O(n))
const pageViewsTotalAggregate = new TableAggregate<PageViewsTotalAggType>(
  components.pageViewsTotal,
  {
    sortKey: () => null, // No sorting needed, just counting
    sumValue: () => 1, // Each document counts as 1
  }
);

// Aggregate for page views by path (O(log n) lookups per path)
const pageViewsByPathAggregate = new TableAggregate<PageViewsByPathAggType>(
  components.pageViewsByPath,
  {
    sortKey: (doc) => doc.path, // Group by path
    sumValue: () => 1, // Each document counts as 1
  }
);

// Aggregate for unique visitors count (O(log n))
const uniqueVisitorsAggregate = new TableAggregate<UniqueVisitorsAggType>(
  components.uniqueVisitors,
  {
    sortKey: () => null, // No sorting, just counting
    sumValue: () => 1, // Each visitor counts as 1
  }
);

/**
 * Record a page view event and update aggregates.
 * Idempotent: same session viewing same path within 30min = 1 view.
 */
export const recordPageView = mutation({
  args: {
    path: v.string(),
    pageType: v.string(),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const dedupCutoff = now - DEDUP_WINDOW_MS;

    // Check for recent view from same session on same path
    const recentView = await ctx.db
      .query("pageViews")
      .withIndex("by_session_path", (q) =>
        q.eq("sessionId", args.sessionId).eq("path", args.path)
      )
      .order("desc")
      .first();

    // Early return if already viewed within dedup window
    if (recentView && recentView.timestamp > dedupCutoff) {
      return null;
    }

    // Insert new view event
    const viewId = await ctx.db.insert("pageViews", {
      path: args.path,
      pageType: args.pageType,
      sessionId: args.sessionId,
      timestamp: now,
    });

    // Update aggregates - get the inserted document
    const newView = await ctx.db.get(viewId);
    if (newView) {
      await pageViewsTotalAggregate.insert(ctx, newView);
      await pageViewsByPathAggregate.insert(ctx, newView);
    }

    // Track unique visitor if this is their first view ever
    await trackUniqueVisitor(ctx, args.sessionId, now);

    return null;
  },
});

/**
 * Track unique visitor - creates a record only if session hasn't been seen before.
 */
async function trackUniqueVisitor(
  ctx: MutationCtx,
  sessionId: string,
  timestamp: number
): Promise<void> {
  // Check if this session has been tracked before
  const existingVisitor = await ctx.db
    .query("visitors")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
    .first();

  // Only insert if this is a new visitor
  if (!existingVisitor) {
    const visitorId = await ctx.db.insert("visitors", {
      sessionId,
      firstSeen: timestamp,
    });
    const newVisitor = await ctx.db.get(visitorId);
    if (newVisitor) {
      await uniqueVisitorsAggregate.insert(ctx, newVisitor);
    }
  }
}

/**
 * Update active session heartbeat.
 * Creates or updates session with current path and timestamp.
 * Idempotent: skips update if recently updated with same path (prevents write conflicts).
 */
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    currentPath: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find existing session by sessionId using index
    const existingSession = await ctx.db
      .query("activeSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingSession) {
      // Early return if same path and recently updated (idempotent - prevents write conflicts)
      if (
        existingSession.currentPath === args.currentPath &&
        now - existingSession.lastSeen < HEARTBEAT_DEDUP_MS
      ) {
        return null;
      }

      // Patch directly with new data
      await ctx.db.patch(existingSession._id, {
        currentPath: args.currentPath,
        lastSeen: now,
      });
      return null;
    }

    // Create new session only if none exists
    await ctx.db.insert("activeSessions", {
      sessionId: args.sessionId,
      currentPath: args.currentPath,
      lastSeen: now,
    });

    return null;
  },
});

/**
 * Get all stats for the stats page.
 * Uses O(log n) aggregate lookups instead of O(n) table scans.
 */
export const getStats = query({
  args: {},
  returns: v.object({
    activeVisitors: v.number(),
    activeByPath: v.array(
      v.object({
        path: v.string(),
        count: v.number(),
      })
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
      })
    ),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const sessionCutoff = now - SESSION_TIMEOUT_MS;

    // Get active sessions (heartbeat within last 2 minutes) - still uses collect for real-time data
    const activeSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastSeen", (q) => q.gt("lastSeen", sessionCutoff))
      .collect();

    // Count active visitors by path
    const activeByPathMap: Record<string, number> = {};
    for (const session of activeSessions) {
      activeByPathMap[session.currentPath] =
        (activeByPathMap[session.currentPath] || 0) + 1;
    }
    const activeByPath = Object.entries(activeByPathMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // O(log n) aggregate lookups
    const totalPageViews = await pageViewsTotalAggregate.count(ctx);
    const uniqueVisitorCount = await uniqueVisitorsAggregate.count(ctx);

    // Get tracking start date from first visitor
    const firstVisitor = await ctx.db.query("visitors").order("asc").first();
    const trackingSince = firstVisitor ? firstVisitor.firstSeen : null;

    // Get published posts and pages for titles
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Get unique paths from aggregate bounds
    // For per-path stats, we need to iterate through known paths
    const knownPaths = new Set<string>();

    // Add home and stats pages
    knownPaths.add("/");
    knownPaths.add("/stats");

    // Add paths for all published posts and pages
    for (const post of posts) {
      knownPaths.add(`/${post.slug}`);
    }
    for (const page of pages) {
      knownPaths.add(`/${page.slug}`);
    }

    // Build page stats array with O(log n) lookups per path
    const pageStats: Array<{
      path: string;
      title: string;
      pageType: string;
      views: number;
    }> = [];

    for (const path of knownPaths) {
      // O(log n) count for this specific path
      const views = await pageViewsByPathAggregate.count(ctx, {
        bounds: {
          lower: { key: path, inclusive: true },
          upper: { key: path, inclusive: true },
        },
      });

      if (views > 0) {
        // Match path to post or page
        const slug = path.startsWith("/") ? path.slice(1) : path;
        const post = posts.find((p) => p.slug === slug);
        const page = pages.find((p) => p.slug === slug);

        let title = path;
        let pageType = "other";

        if (path === "/" || path === "") {
          title = "Home";
          pageType = "home";
        } else if (path === "/stats") {
          title = "Stats";
          pageType = "stats";
        } else if (post) {
          title = post.title;
          pageType = "blog";
        } else if (page) {
          title = page.title;
          pageType = "page";
        }

        pageStats.push({
          path,
          title,
          pageType,
          views,
        });
      }
    }

    // Sort by views descending
    pageStats.sort((a, b) => b.views - a.views);

    return {
      activeVisitors: activeSessions.length,
      activeByPath,
      totalPageViews,
      uniqueVisitors: uniqueVisitorCount,
      publishedPosts: posts.length,
      publishedPages: pages.length,
      trackingSince,
      pageStats,
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

    // Get all stale sessions
    const staleSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeen", cutoff))
      .collect();

    // Delete in parallel
    await Promise.all(
      staleSessions.map((session) => ctx.db.delete(session._id))
    );

    return staleSessions.length;
  },
});

/**
 * Internal mutation to backfill aggregates from existing data.
 * Run this once after deploying to populate aggregates from existing pageViews.
 */
export const backfillAggregates = internalMutation({
  args: {},
  returns: v.object({
    pageViews: v.number(),
    visitors: v.number(),
  }),
  handler: async (ctx) => {
    let pageViewCount = 0;
    let visitorCount = 0;

    // Backfill page views aggregates
    const pageViews = await ctx.db.query("pageViews").collect();
    for (const view of pageViews) {
      await pageViewsTotalAggregate.insert(ctx, view);
      await pageViewsByPathAggregate.insert(ctx, view);
      pageViewCount++;
    }

    // Backfill unique visitors - need to dedupe by sessionId
    const seenSessions = new Set<string>();
    for (const view of pageViews) {
      if (!seenSessions.has(view.sessionId)) {
        seenSessions.add(view.sessionId);

        // Check if visitor already exists
        const existingVisitor = await ctx.db
          .query("visitors")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", view.sessionId))
          .first();

        if (!existingVisitor) {
          const visitorId = await ctx.db.insert("visitors", {
            sessionId: view.sessionId,
            firstSeen: view.timestamp,
          });
          const newVisitor = await ctx.db.get(visitorId);
          if (newVisitor) {
            await uniqueVisitorsAggregate.insert(ctx, newVisitor);
            visitorCount++;
          }
        }
      }
    }

    return { pageViews: pageViewCount, visitors: visitorCount };
  },
});
