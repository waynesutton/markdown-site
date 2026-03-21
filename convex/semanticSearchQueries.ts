import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

const postRowValidator = v.object({
  _id: v.id("posts"),
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.string(),
  unlisted: v.optional(v.boolean()),
});

const pageRowValidator = v.object({
  _id: v.id("pages"),
  slug: v.string(),
  title: v.string(),
  content: v.string(),
});

// Batched fetch for both post and page docs in one transaction
export const fetchSearchDocsByIds = internalQuery({
  args: {
    postIds: v.array(v.id("posts")),
    pageIds: v.array(v.id("pages")),
  },
  returns: v.object({
    posts: v.array(postRowValidator),
    pages: v.array(pageRowValidator),
  }),
  handler: async (ctx, args) => {
    const posts = [];
    for (const id of args.postIds) {
      const doc = await ctx.db.get(id);
      if (doc && doc.published && !doc.unlisted) {
        posts.push({
          _id: doc._id,
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          content: doc.content,
          unlisted: doc.unlisted,
        });
      }
    }

    const pages = [];
    for (const id of args.pageIds) {
      const doc = await ctx.db.get(id);
      if (doc && doc.published) {
        pages.push({
          _id: doc._id,
          slug: doc.slug,
          title: doc.title,
          content: doc.content,
        });
      }
    }

    return { posts, pages };
  },
});
