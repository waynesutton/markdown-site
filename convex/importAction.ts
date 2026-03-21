"use node";

import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import FirecrawlApp from "@mendable/firecrawl-js";

type ImportJobActionArgs = {
  jobId: Id<"importUrlJobs">;
  url: string;
  published: boolean;
};

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

/**
 * Clean up markdown content
 */
function cleanMarkdown(content: string): string {
  return content.replace(/^\s+|\s+$/g, "").replace(/\n{3,}/g, "\n\n");
}

/**
 * Calculate reading time from content
 */
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Import content from a URL using Firecrawl and save directly to database
 */
export const importFromUrlJob = internalAction({
  args: {
    jobId: v.id("importUrlJobs"),
    url: v.string(),
    published: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => await importFromUrlJobFromSnapshot(ctx, args),
});

function addSourceAttribution(content: string, sourceUrl: string): string {
  let hostname: string;
  try {
    hostname = new URL(sourceUrl).hostname;
  } catch {
    hostname = "external source";
  }

  return `${content}\n\n---\n\n*Originally published at [${hostname}](${sourceUrl})*`;
}

async function importFromUrlJobFromSnapshot(
  ctx: ActionCtx,
  args: ImportJobActionArgs,
): Promise<null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return await failImportJob(
      ctx,
      args.jobId,
      "FIRECRAWL_API_KEY not configured. Add it to your Convex environment variables.",
    );
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.scrapeUrl(args.url, {
      formats: ["markdown"],
    });

    if (!result.success || !result.markdown) {
      return await failImportJob(
        ctx,
        args.jobId,
        result.error || "Failed to scrape URL - no content returned",
      );
    }

    const title = result.metadata?.title || "Imported Post";
    const description = result.metadata?.description || "";
    const content = cleanMarkdown(result.markdown);
    const contentWithAttribution = addSourceAttribution(content, args.url);

    await saveImportedPost(ctx, args, {
      title,
      description,
      content,
      contentWithAttribution,
    });

    return null;
  } catch (error) {
    return await failImportJob(
      ctx,
      args.jobId,
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
}

async function saveImportedPost(
  ctx: ActionCtx,
  args: ImportJobActionArgs,
  imported: {
    title: string;
    description: string;
    content: string;
    contentWithAttribution: string;
  },
): Promise<void> {
  const baseSlug = generateSlug(imported.title);
  const slug = baseSlug || `imported-${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];

  await ctx.runMutation(internal.importJobs.completeImportJobWithPost, {
    jobId: args.jobId,
    title: imported.title,
    post: {
      slug,
      title: imported.title,
      description: imported.description,
      content: imported.contentWithAttribution,
      date: today,
      published: args.published,
      tags: ["imported"],
      readTime: calculateReadTime(imported.content),
    },
  });
}

async function failImportJob(
  ctx: ActionCtx,
  jobId: Id<"importUrlJobs">,
  error: string,
): Promise<null> {
  await ctx.runMutation(internal.importJobs.finalizeImportJob, {
    jobId,
    error,
  });
  return null;
}
