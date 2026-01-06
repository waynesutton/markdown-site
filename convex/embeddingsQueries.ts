import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    return posts
      .filter((post) => !post.embedding)
      .slice(0, args.limit)
      .map((post) => ({
        _id: post._id,
        title: post.title,
        content: post.content,
      }));
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
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    return pages
      .filter((page) => !page.embedding)
      .slice(0, args.limit)
      .map((page) => ({
        _id: page._id,
        title: page.title,
        content: page.content,
      }));
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
      .first();

    if (!post) return null;

    return {
      _id: post._id,
      title: post.title,
      content: post.content,
    };
  },
});
