import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Example app schema. The VFS component has its own isolated schema.
export default defineSchema({
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),
});
