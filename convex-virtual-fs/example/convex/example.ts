import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { VirtualFs } from "@convex-dev/virtual-fs";

const vfs = new VirtualFs(components.virtualFs);

/**
 * Sync a post into the virtual filesystem.
 * Call this after creating or updating a post.
 */
export const syncPostToVfs = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await vfs.upsert(ctx, {
      path: `/blog/${args.slug}.md`,
      title: args.title,
      content: `# ${args.title}\n\n${args.content}`,
      contentType: "text/markdown",
    });
    return null;
  },
});

/**
 * Batch sync all published posts into VFS.
 */
export const syncAllPostsToVfs = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(500);

    const files = posts.map((post) => ({
      path: `/blog/${post.slug}.md`,
      title: post.title,
      content: `# ${post.title}\n\n${post.content}`,
      contentType: "text/markdown" as const,
    }));

    return await vfs.batchUpsert(ctx, files);
  },
});

/**
 * Remove a post from the virtual filesystem.
 */
export const removePostFromVfs = mutation({
  args: { slug: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return await vfs.remove(ctx, `/blog/${args.slug}.md`);
  },
});

/**
 * Execute a shell command against the VFS.
 */
export const execVfsCommand = query({
  args: {
    command: v.string(),
    cwd: v.optional(v.string()),
  },
  returns: v.object({
    stdout: v.string(),
    stderr: v.string(),
    exitCode: v.number(),
  }),
  handler: async (ctx, args) => {
    return await vfs.exec(ctx, args.command, args.cwd);
  },
});

/**
 * Get file count in the VFS.
 */
export const vfsFileCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return await vfs.count(ctx);
  },
});
