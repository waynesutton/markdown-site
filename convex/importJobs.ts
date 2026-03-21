import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

const importJobStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);

const importedPostValidator = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.string(),
  date: v.string(),
  published: v.boolean(),
  tags: v.array(v.string()),
  readTime: v.string(),
});

async function requireAuthenticatedIdentity(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }
  return identity;
}

export const requestImportFromUrl = mutation({
  args: {
    url: v.string(),
    published: v.optional(v.boolean()),
  },
  returns: v.object({
    jobId: v.id("importUrlJobs"),
  }),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const url = args.url.trim();
    if (!url) {
      throw new ConvexError("URL is required");
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("importUrlJobs", {
      ownerSubject: identity.subject,
      url,
      published: args.published ?? false,
      status: "pending",
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.importAction.importFromUrlJob, {
      jobId,
      url,
      published: args.published ?? false,
    });

    return { jobId };
  },
});

export const getImportJob = query({
  args: {
    jobId: v.id("importUrlJobs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("importUrlJobs"),
      url: v.string(),
      published: v.boolean(),
      status: importJobStatusValidator,
      slug: v.optional(v.string()),
      title: v.optional(v.string()),
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

    return {
      _id: job._id,
      url: job.url,
      published: job.published,
      status: job.status,
      slug: job.slug,
      title: job.title,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

export const finalizeImportJob = internalMutation({
  args: {
    jobId: v.id("importUrlJobs"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    const now = Date.now();
    if (args.slug && args.title) {
      if (
        job.status === "completed" &&
        job.slug === args.slug &&
        job.title === args.title
      ) {
        return null;
      }

      await ctx.db.patch(args.jobId, {
        status: "completed",
        slug: args.slug,
        title: args.title,
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

export const completeImportJobWithPost = internalMutation({
  args: {
    jobId: v.id("importUrlJobs"),
    title: v.string(),
    post: importedPostValidator,
  },
  returns: v.object({
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new ConvexError("Import job not found");
    }

    const slug = await createImportedPostRecord(ctx, args.post);
    await ctx.db.patch(args.jobId, {
      status: "completed",
      slug,
      title: args.title,
      error: undefined,
      completedAt: Date.now(),
    });

    return { slug };
  },
});

async function createImportedPostRecord(
  ctx: MutationCtx,
  post: {
    slug: string;
    title: string;
    description: string;
    content: string;
    date: string;
    published: boolean;
    tags: Array<string>;
    readTime: string;
  },
): Promise<string> {
  const existing = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", post.slug))
    .unique();

  const finalSlug = existing ? `${post.slug}-${Date.now()}` : post.slug;
  await ctx.db.insert("posts", {
    ...post,
    slug: finalSlug,
    source: "dashboard",
    lastSyncedAt: Date.now(),
  });

  return finalSlug;
}
