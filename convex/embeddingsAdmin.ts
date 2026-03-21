import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Public mutation that queues missing embeddings generation
// Called from the sync script or manually after content updates
export const generateMissingEmbeddings = mutation({
  args: {},
  returns: v.object({
    queued: v.boolean(),
    postsScheduled: v.boolean(),
    pagesScheduled: v.boolean(),
    skipped: v.boolean(),
  }),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();

    if (!process.env.OPENAI_API_KEY) {
      return {
        queued: false,
        postsScheduled: false,
        pagesScheduled: false,
        skipped: true,
      };
    }

    await ctx.scheduler.runAfter(0, internal.embeddings.generatePostEmbeddings, {});
    await ctx.scheduler.runAfter(0, internal.embeddings.generatePageEmbeddings, {});

    return {
      queued: true,
      postsScheduled: true,
      pagesScheduled: true,
      skipped: false,
    };
  },
});

export const regeneratePostEmbedding = mutation({
  args: { slug: v.string() },
  returns: v.object({
    queued: v.boolean(),
    skipped: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    if (!process.env.OPENAI_API_KEY) {
      return {
        queued: false,
        skipped: true,
        error: "OPENAI_API_KEY not configured",
      };
    }

    await ctx.scheduler.runAfter(0, internal.embeddings.regeneratePostEmbeddingJob, {
      slug: args.slug,
    });

    return {
      queued: true,
      skipped: false,
    };
  },
});
