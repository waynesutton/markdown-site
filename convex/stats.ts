import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Record a page view event
 * Uses event records pattern for conflict-free analytics
 */
export const recordPageView = mutation({
  args: {
    path: v.string(),
    pageType: v.string(),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { path, pageType, sessionId }) => {
    await ctx.db.insert("pageViews", {
      path,
      pageType,
      sessionId,
      timestamp: Date.now(),
    });
    return null;
  },
});

/**
 * Update active session heartbeat
 * Idempotent: updates existing session or creates new one
 */
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    currentPath: v.string(),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (
    ctx,
    { sessionId, currentPath, city, country, latitude, longitude }
  ) => {
    // Check if session exists
    const existing = await ctx.db
      .query("activeSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    const data = {
      sessionId,
      currentPath,
      lastSeen: Date.now(),
      ...(city && { city }),
      ...(country && { country }),
      ...(latitude && { latitude }),
      ...(longitude && { longitude }),
    };

    if (existing) {
      // Update existing session
      await ctx.db.patch(existing._id, {
        currentPath,
        lastSeen: Date.now(),
        ...(city && { city }),
        ...(country && { country }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
      });
    } else {
      // Create new session
      await ctx.db.insert("activeSessions", data);
    }

    return null;
  },
});

/**
 * Get active sessions for visitor map
 * Sessions are considered active if last seen within 2 minutes
 */
export const getActiveSessions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("activeSessions"),
      sessionId: v.string(),
      currentPath: v.string(),
      lastSeen: v.number(),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

    // Use index to efficiently filter by lastSeen
    const sessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastSeen", (q) => q.gte("lastSeen", twoMinutesAgo))
      .collect();

    return sessions;
  },
});

/**
 * Get page view count for a specific path
 */
export const getPageViewCount = query({
  args: {
    path: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, { path }) => {
    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_path", (q) => q.eq("path", path))
      .collect();

    return views.length;
  },
});

/**
 * Get total page views across all pages
 */
export const getTotalPageViews = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const views = await ctx.db.query("pageViews").collect();
    return views.length;
  },
});

/**
 * Clean up stale sessions (older than 10 minutes)
 * Should be called by a cron job
 */
export const cleanupStaleSessions = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const staleSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeen", tenMinutesAgo))
      .collect();

    for (const session of staleSessions) {
      await ctx.db.delete(session._id);
    }

    return staleSessions.length;
  },
});
