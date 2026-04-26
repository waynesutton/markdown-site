import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileValidator = v.object({
  path: v.string(),
  title: v.string(),
  content: v.string(),
  contentType: v.optional(v.string()),
  metadata: v.optional(v.any()),
});

export default defineSchema({
  files: defineTable({
    path: v.string(),
    title: v.string(),
    content: v.string(),
    contentType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_path", ["path"])
    .searchIndex("search_content", {
      searchField: "content",
    })
    .searchIndex("search_title", {
      searchField: "title",
    }),
});
