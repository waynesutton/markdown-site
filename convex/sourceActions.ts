"use node";

import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

async function generateEmbedding(text: string): Promise<number[] | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return undefined;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.slice(0, 8000),
    });
    return response.data[0].embedding;
  } catch {
    return undefined;
  }
}

function summarize(content: string): string {
  const sentences = content
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20);
  return sentences.slice(0, 3).join(" ").slice(0, 500);
}

// Process an already-inserted source: generate embedding and summary
export const processSource = internalAction({
  args: {
    jobId: v.id("sourceIngestJobs"),
    sourceId: v.id("sources"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const source = await ctx.runQuery(internal.sources.getSourceByIdInternal, {
        sourceId: args.sourceId,
      });
      if (!source) {
        await finalize(ctx, args.jobId, "failed", undefined, "Source not found");
        return null;
      }

      const textToEmbed = `${source.title}\n\n${source.content}`;
      const embedding = await generateEmbedding(textToEmbed);
      const summary = summarize(source.content);

      await ctx.runMutation(internal.sources.markProcessedAndFinalize, {
        sourceId: args.sourceId,
        embedding,
        summary,
        jobId: args.jobId,
        status: "completed" as const,
      });
      return null;
    } catch (error) {
      await finalize(
        ctx,
        args.jobId,
        "failed",
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      );
      return null;
    }
  },
});

// Scrape URL with Firecrawl, insert source, then process
export const scrapeAndProcessSource = internalAction({
  args: {
    jobId: v.id("sourceIngestJobs"),
    url: v.string(),
    title: v.string(),
    sourceType: v.string(),
    tags: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      await finalize(
        ctx,
        args.jobId,
        "failed",
        undefined,
        "FIRECRAWL_API_KEY not configured",
      );
      return null;
    }

    try {
      const firecrawl = new FirecrawlApp({ apiKey });
      const result = await firecrawl.scrapeUrl(args.url, {
        formats: ["markdown"],
      });

      if (!result.success || !result.markdown) {
        await finalize(
          ctx,
          args.jobId,
          "failed",
          undefined,
          result.error || "Failed to scrape URL",
        );
        return null;
      }

      const title = args.title || result.metadata?.title || "Imported source";
      const content = result.markdown.replace(/^\s+|\s+$/g, "").replace(/\n{3,}/g, "\n\n");
      const slug = slugify(title) || `source-${Date.now()}`;

      const sourceId: Id<"sources"> = await ctx.runMutation(
        internal.sources.insertSourceFromScrape,
        {
          slug,
          url: args.url,
          title,
          content,
          sourceType: args.sourceType,
          tags: args.tags,
        },
      );

      const textToEmbed = `${title}\n\n${content}`;
      const embedding = await generateEmbedding(textToEmbed);
      const summary = summarize(content);

      await ctx.runMutation(internal.sources.markProcessedAndFinalize, {
        sourceId,
        embedding,
        summary,
        jobId: args.jobId,
        status: "completed" as const,
      });
      return null;
    } catch (error) {
      await finalize(
        ctx,
        args.jobId,
        "failed",
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      );
      return null;
    }
  },
});

async function finalize(
  ctx: ActionCtx,
  jobId: Id<"sourceIngestJobs">,
  status: "completed" | "failed",
  sourceId?: Id<"sources">,
  error?: string,
) {
  await ctx.runMutation(internal.sources.finalizeIngestJob, {
    jobId,
    status,
    sourceId,
    error,
  });
}
