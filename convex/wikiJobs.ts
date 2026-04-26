import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";

const jobStatusValidator = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

async function requireAuth(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }
  return identity;
}

// Public: request wiki compilation
export const requestCompilation = mutation({
  args: {
    scope: v.optional(v.string()),
  },
  returns: v.object({ jobId: v.id("wikiCompilationJobs") }),
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    await rateLimiter.limit(ctx, "wikiCompile", {
      key: identity.subject,
      throws: true,
    });

    // Check for running jobs to prevent concurrent compilations
    const runningJobs = await ctx.db
      .query("wikiCompilationJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .take(1);

    if (runningJobs.length > 0) {
      throw new ConvexError("A wiki compilation is already running");
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("wikiCompilationJobs", {
      ownerSubject: identity.subject,
      status: "pending",
      trigger: "manual",
      scope: args.scope || "full",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.wikiCompiler.compileWiki, { jobId });
    return { jobId };
  },
});

// Public: request wiki lint
export const requestLint = mutation({
  args: {},
  returns: v.object({ jobId: v.id("wikiCompilationJobs") }),
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);

    await rateLimiter.limit(ctx, "wikiLint", {
      key: identity.subject,
      throws: true,
    });

    const now = Date.now();
    const jobId = await ctx.db.insert("wikiCompilationJobs", {
      ownerSubject: identity.subject,
      status: "pending",
      trigger: "lint",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.wikiCompiler.lintWiki, { jobId });
    return { jobId };
  },
});

// Public: get compilation job status
export const getCompilationJobStatus = query({
  args: { jobId: v.id("wikiCompilationJobs") },
  returns: v.union(
    v.object({
      status: jobStatusValidator,
      trigger: v.string(),
      scope: v.optional(v.string()),
      pagesCreated: v.optional(v.number()),
      pagesUpdated: v.optional(v.number()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;
    return {
      status: job.status,
      trigger: job.trigger,
      scope: job.scope,
      pagesCreated: job.pagesCreated,
      pagesUpdated: job.pagesUpdated,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

// Public: get latest compilation job
export const getLatestCompilationJob = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("wikiCompilationJobs"),
      status: jobStatusValidator,
      trigger: v.string(),
      pagesCreated: v.optional(v.number()),
      pagesUpdated: v.optional(v.number()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const job = await ctx.db
      .query("wikiCompilationJobs")
      .withIndex("by_createdat")
      .order("desc")
      .first();
    if (!job) return null;
    return {
      _id: job._id,
      status: job.status,
      trigger: job.trigger,
      pagesCreated: job.pagesCreated,
      pagesUpdated: job.pagesUpdated,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

// Internal: mark job as running
export const markJobRunning = internalMutation({
  args: { jobId: v.id("wikiCompilationJobs") },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.jobId, { status: "running" as const });
    return null;
  },
});

// Internal: finalize compilation job
export const finalizeCompilationJob = internalMutation({
  args: {
    jobId: v.id("wikiCompilationJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    pagesCreated: v.optional(v.number()),
    pagesUpdated: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      pagesCreated: args.pagesCreated,
      pagesUpdated: args.pagesUpdated,
      error: args.error,
      completedAt: Date.now(),
    });
    return null;
  },
});

// Internal: scheduled compilation (for cron)
export const scheduledCompilation = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    // Check for running jobs
    const runningJobs = await ctx.db
      .query("wikiCompilationJobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .take(1);

    if (runningJobs.length > 0) return null;

    const now = Date.now();
    const jobId = await ctx.db.insert("wikiCompilationJobs", {
      status: "pending",
      trigger: "cron",
      scope: "full",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.wikiCompiler.compileWiki, { jobId });
    return null;
  },
});
