import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Internal query to get posts without embeddings
export const getPostsWithoutEmbeddings = internalQuery({
  args: { limit: v.number() },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      title: v.string(),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const results: Array<{ _id: Id<"posts">; title: string; content: string }> = [];
    const query = ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true));

    for await (const post of query) {
      if (!post.embedding) {
        results.push({ _id: post._id, title: post.title, content: post.content });
        if (results.length >= args.limit) break;
      }
    }
    return results;
  },
});

// Internal query to get pages without embeddings
export const getPagesWithoutEmbeddings = internalQuery({
  args: { limit: v.number() },
  returns: v.array(
    v.object({
      _id: v.id("pages"),
      title: v.string(),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const results: Array<{ _id: Id<"pages">; title: string; content: string }> = [];
    const query = ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true));

    for await (const page of query) {
      if (!page.embedding) {
        results.push({ _id: page._id, title: page.title, content: page.content });
        if (results.length >= args.limit) break;
      }
    }
    return results;
  },
});

// Internal mutation to save embedding for a post
export const savePostEmbedding = internalMutation({
  args: {
    id: v.id("posts"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { embedding: args.embedding });
  },
});

// Internal mutation to save embedding for a page
export const savePageEmbedding = internalMutation({
  args: {
    id: v.id("pages"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { embedding: args.embedding });
  },
});

// Batch save embeddings for posts in a single transaction
export const savePostEmbeddingsBatch = internalMutation({
  args: {
    items: v.array(v.object({
      id: v.id("posts"),
      embedding: v.array(v.float64()),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.items.map((item) => ctx.db.patch(item.id, { embedding: item.embedding })),
    );
    return null;
  },
});

// Batch save embeddings for pages in a single transaction
export const savePageEmbeddingsBatch = internalMutation({
  args: {
    items: v.array(v.object({
      id: v.id("pages"),
      embedding: v.array(v.float64()),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.items.map((item) => ctx.db.patch(item.id, { embedding: item.embedding })),
    );
    return null;
  },
});

// Internal query to get post by slug
export const getPostBySlug = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      title: v.string(),
      content: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post) return null;

    return {
      _id: post._id,
      title: post.title,
      content: post.content,
    };
  },
});
