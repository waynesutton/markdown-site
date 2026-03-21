import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

const semanticSearchResultValidator = v.object({
  _id: v.string(),
  type: v.union(v.literal("post"), v.literal("page")),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  snippet: v.string(),
  score: v.number(),
});

const semanticSearchJobStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);

const semanticSearchJobValidator = v.object({
  _id: v.id("semanticSearchJobs"),
  _creationTime: v.number(),
  ownerSubject: v.optional(v.string()),
  query: v.string(),
  status: semanticSearchJobStatusValidator,
  results: v.optional(v.array(semanticSearchResultValidator)),
  error: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
});

export const requestSemanticSearch = mutation({
  args: {
    query: v.string(),
  },
  returns: v.object({
    jobId: v.id("semanticSearchJobs"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const trimmedQuery = args.query.trim();

    if (!trimmedQuery) {
      throw new ConvexError("Search query is required");
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("semanticSearchJobs", {
      ownerSubject: identity?.subject,
      query: trimmedQuery,
      status: "pending",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.semanticSearch.semanticSearchJob, {
      jobId,
    });

    return { jobId };
  },
});

export const getSemanticSearchJob = query({
  args: {
    jobId: v.id("semanticSearchJobs"),
  },
  returns: v.union(semanticSearchJobValidator, v.null()),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    return await ctx.db.get(args.jobId);
  },
});

export const getSemanticSearchJobInternal = internalQuery({
  args: {
    jobId: v.id("semanticSearchJobs"),
  },
  returns: v.union(semanticSearchJobValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Single finalize mutation for both success and failure outcomes
export const finalizeSemanticSearchJob = internalMutation({
  args: {
    jobId: v.id("semanticSearchJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    results: v.optional(v.array(semanticSearchResultValidator)),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      results: args.results,
      error: args.error,
      completedAt: Date.now(),
    });
    return null;
  },
});
