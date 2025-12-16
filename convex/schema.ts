import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Blog posts table
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    published: v.boolean(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    image: v.optional(v.string()), // Header/OG image URL
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_published", ["published"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["published"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published"],
    }),

  // Static pages (about, projects, contact, etc.)
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
    order: v.optional(v.number()), // Display order in nav
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  // View counts for analytics
  viewCounts: defineTable({
    slug: v.string(),
    count: v.number(),
  }).index("by_slug", ["slug"]),

  // Site configuration (about content, links, etc.)
  siteConfig: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  // Page view events for analytics (event records pattern)
  pageViews: defineTable({
    path: v.string(),
    pageType: v.string(), // "blog" | "page" | "home" | "stats"
    sessionId: v.string(),
    timestamp: v.number(),
  })
    .index("by_path", ["path"])
    .index("by_timestamp", ["timestamp"])
    .index("by_session_path", ["sessionId", "path"]),

  // Active sessions for real-time visitor tracking
  activeSessions: defineTable({
    sessionId: v.string(),
    currentPath: v.string(),
    lastSeen: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_lastSeen", ["lastSeen"]),

  // Unique visitors tracking (for aggregate counting)
  visitors: defineTable({
    sessionId: v.string(),
    firstSeen: v.number(),
  }).index("by_sessionId", ["sessionId"]),
});
