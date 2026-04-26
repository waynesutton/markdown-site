"use node";

import { v } from "convex/values";
import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import OpenAI from "openai";

const COMPILATION_MODEL = "gpt-4.1-mini";

type WikiPageSpec = {
  slug: string;
  title: string;
  content: string;
  pageType: "concept" | "entity" | "comparison" | "overview" | "synthesis";
  category?: string;
  backlinks: Array<string>;
  sourceSlugs: Array<string>;
};

async function generateEmbedding(text: string, apiKey: string): Promise<number[] | undefined> {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

// Compile wiki from all site content
export const compileWiki = internalAction({
  args: {
    jobId: v.id("wikiCompilationJobs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await finalizeJob(ctx, args.jobId, "failed", 0, 0, "OPENAI_API_KEY not configured");
      return null;
    }

    try {
      // Mark job running + fetch all context in one transaction
      const context = await ctx.runMutation(internal.wiki.markRunningAndGetContext, {
        jobId: args.jobId,
      });

      const contentSummary = buildContentSummary(context);
      const existingPages = context.existingWikiPages.map((p) => `- ${p.title} (${p.pageType}): /wiki/${p.slug}`).join("\n");

      const systemPrompt = `You are a wiki compiler. You read all content from a site and create or update wiki pages that synthesize knowledge across posts, pages, and sources.

Each wiki page should:
- Focus on one concept, entity, or comparison
- Link to source material using [[slug]] syntax
- Be 200-800 words
- Include a clear definition or overview at the top
- Reference related wiki pages with [[wiki:slug]] syntax

Output JSON array of wiki page specs. Each spec has: slug, title, content (markdown), pageType (concept|entity|comparison|overview|synthesis), category (optional), backlinks (array of wiki slugs this page references), sourceSlugs (array of post/page/source slugs this was derived from).`;

      const userPrompt = `Here is all content on the site:

${contentSummary}

${existingPages ? `Existing wiki pages:\n${existingPages}\n\n` : ""}Create or update wiki pages that synthesize the knowledge. Focus on key concepts, technologies, and patterns. Return a JSON array of wiki page specs. Aim for 5-15 pages. If existing pages need updates, include them with the same slug.`;

      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: COMPILATION_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 8000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        await finalizeJob(ctx, args.jobId, "failed", 0, 0, "Empty response from LLM");
        return null;
      }

      let specs: Array<WikiPageSpec>;
      try {
        const parsed = JSON.parse(content);
        specs = parsed.pages || parsed.wikiPages || parsed;
        if (!Array.isArray(specs)) {
          specs = [specs];
        }
      } catch {
        await finalizeJob(ctx, args.jobId, "failed", 0, 0, "Failed to parse LLM response as JSON");
        return null;
      }

      // Generate embeddings for all pages before the batch write
      const preparedPages: Array<{
        slug: string;
        title: string;
        content: string;
        pageType: "concept" | "entity" | "comparison" | "overview" | "synthesis";
        category?: string;
        backlinks: Array<string>;
        sourceSlugs: Array<string>;
        compiledBy: string;
        embedding?: Array<number>;
      }> = [];

      for (const spec of specs) {
        if (!spec.slug || !spec.title || !spec.content) continue;
        const slug = slugify(spec.slug);
        const embedding = await generateEmbedding(`${spec.title}\n\n${spec.content}`, apiKey);
        preparedPages.push({
          slug,
          title: spec.title,
          content: spec.content,
          pageType: normalizePageType(spec.pageType),
          category: spec.category,
          backlinks: spec.backlinks || [],
          sourceSlugs: spec.sourceSlugs || [],
          compiledBy: COMPILATION_MODEL,
          embedding: embedding,
        });
      }

      // Single mutation: upsert pages + regenerate index + finalize job
      await ctx.runMutation(
        internal.wiki.batchUpsertAndRegenerateIndex,
        { pages: preparedPages, jobId: args.jobId },
      );

      return null;
    } catch (error) {
      await finalizeJob(
        ctx,
        args.jobId,
        "failed",
        0,
        0,
        error instanceof Error ? error.message : "Unknown error",
      );
      return null;
    }
  },
});

// Lint wiki for broken links and quality
export const lintWiki = internalAction({
  args: {
    jobId: v.id("wikiCompilationJobs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.wikiJobs.markJobRunning, { jobId: args.jobId });

      // Single mutation: read pages, lint, store report, finalize job
      await ctx.runMutation(internal.wiki.lintAndStoreReport, { jobId: args.jobId });

      return null;
    } catch (error) {
      await finalizeJob(
        ctx,
        args.jobId,
        "failed",
        0,
        0,
        error instanceof Error ? error.message : "Unknown error",
      );
      return null;
    }
  },
});

function normalizePageType(
  raw: string,
): "concept" | "entity" | "comparison" | "overview" | "synthesis" {
  const valid = ["concept", "entity", "comparison", "overview", "synthesis"] as const;
  const lower = (raw || "concept").toLowerCase();
  for (const t of valid) {
    if (lower === t) return t;
  }
  return "concept";
}

function buildContentSummary(context: {
  posts: Array<{ slug: string; title: string; content: string; tags: Array<string> }>;
  pages: Array<{ slug: string; title: string; content: string }>;
  sources: Array<{ slug: string; title: string; content: string; sourceType: string }>;
}): string {
  const sections: Array<string> = [];

  sections.push("## Blog posts");
  for (const post of context.posts.slice(0, 50)) {
    const preview = post.content.slice(0, 300).replace(/\n+/g, " ");
    sections.push(`### ${post.title} (${post.slug})\nTags: ${post.tags.join(", ")}\n${preview}...`);
  }

  sections.push("\n## Pages");
  for (const page of context.pages.slice(0, 30)) {
    const preview = page.content.slice(0, 300).replace(/\n+/g, " ");
    sections.push(`### ${page.title} (${page.slug})\n${preview}...`);
  }

  if (context.sources.length > 0) {
    sections.push("\n## Sources");
    for (const source of context.sources.slice(0, 30)) {
      const preview = source.content.slice(0, 300).replace(/\n+/g, " ");
      sections.push(`### ${source.title} (${source.slug}) [${source.sourceType}]\n${preview}...`);
    }
  }

  return sections.join("\n\n");
}

async function finalizeJob(
  ctx: ActionCtx,
  jobId: Id<"wikiCompilationJobs">,
  status: "completed" | "failed",
  pagesCreated: number,
  pagesUpdated: number,
  error?: string,
) {
  await ctx.runMutation(internal.wikiJobs.finalizeCompilationJob, {
    jobId,
    status,
    pagesCreated,
    pagesUpdated,
    error,
  });
}
