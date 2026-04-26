import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";

const imageModelValidator = v.union(
  v.literal("gemini-2.0-flash-exp-image-generation"),
  v.literal("imagen-3.0-generate-002"),
);

const aspectRatioValidator = v.union(
  v.literal("1:1"),
  v.literal("16:9"),
  v.literal("9:16"),
  v.literal("4:3"),
  v.literal("3:4"),
);

const jobStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);

async function requireAuthenticatedIdentity(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }
  return identity;
}

export const requestImageGeneration = mutation({
  args: {
    sessionId: v.string(),
    prompt: v.string(),
    model: imageModelValidator,
    aspectRatio: v.optional(aspectRatioValidator),
  },
  returns: v.object({
    jobId: v.id("aiImageGenerationJobs"),
  }),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);

    await rateLimiter.limit(ctx, "aiImageGen", {
      key: identity.subject,
      throws: true,
    });

    const prompt = args.prompt.trim();
    if (!prompt) {
      throw new ConvexError("Prompt is required");
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("aiImageGenerationJobs", {
      ownerSubject: identity.subject,
      sessionId: args.sessionId,
      prompt,
      model: args.model,
      aspectRatio: args.aspectRatio,
      status: "pending",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.aiImageGeneration.generateImage, {
      jobId,
      ownerSubject: identity.subject,
      sessionId: args.sessionId,
      prompt,
      model: args.model,
      aspectRatio: args.aspectRatio,
    });

    return { jobId };
  },
});

export const getImageGenerationJob = query({
  args: {
    jobId: v.id("aiImageGenerationJobs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("aiImageGenerationJobs"),
      prompt: v.string(),
      model: v.string(),
      status: jobStatusValidator,
      storageId: v.optional(v.id("_storage")),
      url: v.union(v.string(), v.null()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    if (job.ownerSubject && job.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    const url = job.storageId ? await ctx.storage.getUrl(job.storageId) : null;

    return {
      _id: job._id,
      prompt: job.prompt,
      model: job.model,
      status: job.status,
      storageId: job.storageId,
      url,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

export const finalizeImageGeneration = internalMutation({
  args: {
    jobId: v.id("aiImageGenerationJobs"),
    ownerSubject: v.optional(v.string()),
    sessionId: v.string(),
    prompt: v.string(),
    model: v.string(),
    storageId: v.optional(v.id("_storage")),
    mimeType: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    const now = Date.now();
    if (args.storageId && args.mimeType) {
      if (job.status === "completed" && job.storageId === args.storageId) {
        return null;
      }

      await ctx.db.insert("aiGeneratedImages", {
        ownerSubject: args.ownerSubject,
        sessionId: args.sessionId,
        prompt: args.prompt,
        model: args.model,
        storageId: args.storageId,
        mimeType: args.mimeType,
        createdAt: now,
      });

      await ctx.db.patch(args.jobId, {
        status: "completed",
        storageId: args.storageId,
        mimeType: args.mimeType,
        error: undefined,
        completedAt: now,
      });
      return null;
    }

    if (job.status === "failed" && job.error === args.error) {
      return null;
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      completedAt: now,
    });
    return null;
  },
});
