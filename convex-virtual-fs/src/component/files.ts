import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server.js";
import { fileValidator } from "./schema.js";

const MAX_LIST_ITEMS = 1000;

// --- Public API (accessible from parent app via component reference) ---

/**
 * Upsert a file at the given path. Creates or replaces.
 */
export const upsert = mutation({
  args: {
    path: v.string(),
    title: v.string(),
    content: v.string(),
    contentType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const normalized = normalizePath(args.path);
    const existing = await ctx.db
      .query("files")
      .withIndex("by_path", (q) => q.eq("path", normalized))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        contentType: args.contentType,
        metadata: args.metadata,
      });
    } else {
      await ctx.db.insert("files", {
        path: normalized,
        title: args.title,
        content: args.content,
        contentType: args.contentType,
        metadata: args.metadata,
      });
    }
    return null;
  },
});

/**
 * Batch upsert multiple files in a single transaction.
 */
export const batchUpsert = mutation({
  args: {
    files: v.array(fileValidator),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const file of args.files) {
      const normalized = normalizePath(file.path);
      const existing = await ctx.db
        .query("files")
        .withIndex("by_path", (q) => q.eq("path", normalized))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: file.title,
          content: file.content,
          contentType: file.contentType,
          metadata: file.metadata,
        });
      } else {
        await ctx.db.insert("files", {
          path: normalized,
          title: file.title,
          content: file.content,
          contentType: file.contentType,
          metadata: file.metadata,
        });
      }
      count++;
    }
    return count;
  },
});

/**
 * Remove a file by path.
 */
export const remove = mutation({
  args: { path: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const normalized = normalizePath(args.path);
    const existing = await ctx.db
      .query("files")
      .withIndex("by_path", (q) => q.eq("path", normalized))
      .first();

    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});

/**
 * Remove all files under a directory prefix.
 */
export const removeDir = mutation({
  args: { prefix: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const normalized = normalizePath(args.prefix);
    const all = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_LIST_ITEMS);

    let count = 0;
    for (const file of all) {
      if (file.path.startsWith(normalized + "/") || file.path === normalized) {
        await ctx.db.delete(file._id);
        count++;
      }
    }
    return count;
  },
});

/**
 * Get a single file by exact path.
 */
export const get = query({
  args: { path: v.string() },
  returns: v.union(
    v.object({
      path: v.string(),
      title: v.string(),
      content: v.string(),
      contentType: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const normalized = normalizePath(args.path);
    const file = await ctx.db
      .query("files")
      .withIndex("by_path", (q) => q.eq("path", normalized))
      .first();

    if (!file) return null;
    return {
      path: file.path,
      title: file.title,
      content: file.content,
      contentType: file.contentType,
      metadata: file.metadata,
    };
  },
});

/**
 * List all files (internal, used by shell commands).
 */
export const listAll = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      path: v.string(),
      title: v.string(),
      size: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_LIST_ITEMS);

    return files.map((f) => ({
      path: f.path,
      title: f.title,
      size: f.content.length,
    }));
  },
});

/**
 * Count all files in the component.
 */
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_LIST_ITEMS);
    return files.length;
  },
});

/**
 * Clear all files. Use with caution.
 */
export const clear = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_LIST_ITEMS);

    for (const file of files) {
      await ctx.db.delete(file._id);
    }
    return files.length;
  },
});

function normalizePath(p: string): string {
  const segments = p.split("/").filter(Boolean);
  return "/" + segments.join("/");
}
