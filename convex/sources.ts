import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";

const SOURCE_QUERY_LIMIT = 200;

const sourceTypeValidator = v.union(
  v.literal("article"),
  v.literal("paper"),
  v.literal("repo"),
  v.literal("note"),
  v.literal("transcript"),
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

// Public: request source ingest via queued job
export const requestIngestSource = mutation({
  args: {
    url: v.optional(v.string()),
    title: v.string(),
    content: v.optional(v.string()),
    sourceType: sourceTypeValidator,
    tags: v.optional(v.array(v.string())),
  },
  returns: v.object({ jobId: v.id("sourceIngestJobs") }),
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    await rateLimiter.limit(ctx, "sourceIngest", {
      key: identity.subject,
      throws: true,
    });

    const now = Date.now();

    const jobId = await ctx.db.insert("sourceIngestJobs", {
      ownerSubject: identity.subject,
      url: args.url?.trim() || undefined,
      title: args.title.trim(),
      sourceType: args.sourceType,
      status: "pending",
      createdAt: now,
    });

    // If content was provided directly, create the source immediately
    if (args.content) {
      const slug = slugify(args.title);
      const sourceId = await ctx.db.insert("sources", {
        slug,
        url: args.url?.trim() || undefined,
        title: args.title.trim(),
        content: args.content,
        sourceType: args.sourceType,
        tags: args.tags || [],
        ingestedAt: now,
        processed: false,
      });

      await ctx.db.patch(jobId, {
        sourceId,
        status: "running" as const,
      });

      // Schedule embedding generation
      await ctx.scheduler.runAfter(0, internal.sourceActions.processSource, {
        jobId,
        sourceId,
      });
    } else if (args.url) {
      // Schedule Firecrawl scrape + embedding
      await ctx.scheduler.runAfter(0, internal.sourceActions.scrapeAndProcessSource, {
        jobId,
        url: args.url.trim(),
        title: args.title.trim(),
        sourceType: args.sourceType,
        tags: args.tags || [],
      });
    } else {
      throw new ConvexError("Either content or url is required");
    }

    return { jobId };
  },
});

// Public: get ingest job status
export const getIngestJobStatus = query({
  args: { jobId: v.id("sourceIngestJobs") },
  returns: v.union(
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      sourceId: v.optional(v.id("sources")),
      error: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;
    return {
      status: job.status,
      sourceId: job.sourceId,
      error: job.error,
    };
  },
});

// Public: list sources
export const listSources = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sources"),
      slug: v.string(),
      title: v.string(),
      sourceType: v.string(),
      url: v.optional(v.string()),
      summary: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      ingestedAt: v.number(),
      processed: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_ingestedat")
      .order("desc")
      .take(SOURCE_QUERY_LIMIT);

    return sources.map((s) => ({
      _id: s._id,
      slug: s.slug,
      title: s.title,
      sourceType: s.sourceType,
      url: s.url,
      summary: s.summary,
      tags: s.tags,
      ingestedAt: s.ingestedAt,
      processed: s.processed,
    }));
  },
});

// Public: get single source by slug
export const getSourceBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("sources"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      sourceType: v.string(),
      url: v.optional(v.string()),
      summary: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      ingestedAt: v.number(),
      processed: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const source = await ctx.db
      .query("sources")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!source) return null;
    return {
      _id: source._id,
      slug: source.slug,
      title: source.title,
      content: source.content,
      sourceType: source.sourceType,
      url: source.url,
      summary: source.summary,
      tags: source.tags,
      ingestedAt: source.ingestedAt,
      processed: source.processed,
    };
  },
});

// Internal: get single source by ID for processing
export const getSourceByIdInternal = internalQuery({
  args: { sourceId: v.id("sources") },
  returns: v.union(
    v.object({
      _id: v.id("sources"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      sourceType: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) return null;
    return {
      _id: source._id,
      slug: source.slug,
      title: source.title,
      content: source.content,
      sourceType: source.sourceType,
    };
  },
});

// Internal: get all sources for wiki compilation
export const getAllSourcesInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sources"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      sourceType: v.string(),
      tags: v.optional(v.array(v.string())),
    }),
  ),
  handler: async (ctx) => {
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_processed", (q) => q.eq("processed", true))
      .take(SOURCE_QUERY_LIMIT);

    return sources.map((s) => ({
      _id: s._id,
      slug: s.slug,
      title: s.title,
      content: s.content,
      sourceType: s.sourceType,
      tags: s.tags,
    }));
  },
});

// Internal: finalize a source ingest job
export const finalizeIngestJob = internalMutation({
  args: {
    jobId: v.id("sourceIngestJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    sourceId: v.optional(v.id("sources")),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      sourceId: args.sourceId,
      error: args.error,
      completedAt: Date.now(),
    });
    return null;
  },
});

// Internal: mark source as processed with embedding
export const markSourceProcessed = internalMutation({
  args: {
    sourceId: v.id("sources"),
    embedding: v.optional(v.array(v.float64())),
    summary: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.sourceId, {
      processed: true,
      embedding: args.embedding,
      summary: args.summary,
    });
    return null;
  },
});

// Internal: mark source processed + finalize job in one transaction
export const markProcessedAndFinalize = internalMutation({
  args: {
    sourceId: v.id("sources"),
    embedding: v.optional(v.array(v.float64())),
    summary: v.optional(v.string()),
    jobId: v.id("sourceIngestJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.sourceId, {
      processed: true,
      embedding: args.embedding,
      summary: args.summary,
    });
    await ctx.db.patch(args.jobId, {
      status: args.status,
      sourceId: args.sourceId,
      error: args.error,
      completedAt: Date.now(),
    });
    return null;
  },
});

// Internal: insert source from scrape action
export const insertSourceFromScrape = internalMutation({
  args: {
    slug: v.string(),
    url: v.string(),
    title: v.string(),
    content: v.string(),
    sourceType: v.string(),
    tags: v.array(v.string()),
  },
  returns: v.id("sources"),
  handler: async (ctx: MutationCtx, args) => {
    return await ctx.db.insert("sources", {
      slug: args.slug,
      url: args.url,
      title: args.title,
      content: args.content,
      sourceType: args.sourceType,
      tags: args.tags,
      ingestedAt: Date.now(),
      processed: false,
    });
  },
});
