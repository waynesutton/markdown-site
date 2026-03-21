"use node";

import { v } from "convex/values";
import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import type { Id } from "./_generated/dataModel";

export const semanticSearchJob = internalAction({
  args: {
    jobId: v.id("semanticSearchJobs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.semanticSearchJobs.getSemanticSearchJobInternal, {
      jobId: args.jobId,
    });

    if (!job) {
      return null;
    }

    const trimmedQuery = job.query.trim();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!trimmedQuery || !apiKey) {
      await finalize(ctx, args.jobId, { status: "completed" as const, results: [] });
      return null;
    }

    try {
      const queryEmbedding = await generateQueryEmbedding(trimmedQuery, apiKey);
      const [postResults, pageResults] = await Promise.all([
        ctx.vectorSearch("posts", "by_embedding", {
          vector: queryEmbedding,
          limit: 10,
          filter: (q) => q.eq("published", true),
        }),
        ctx.vectorSearch("pages", "by_embedding", {
          vector: queryEmbedding,
          limit: 10,
          filter: (q) => q.eq("published", true),
        }),
      ]);

      const docs = await ctx.runQuery(internal.semanticSearchQueries.fetchSearchDocsByIds, {
        postIds: postResults.map((r) => r._id),
        pageIds: pageResults.map((r) => r._id),
      });

      const results = buildSemanticSearchResults(postResults, pageResults, docs.posts, docs.pages);
      await finalize(ctx, args.jobId, { status: "completed" as const, results });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Semantic search failed";
      await finalize(ctx, args.jobId, { status: "failed" as const, error: message });
    }

    return null;
  },
});

type FinalizeOutcome =
  | { status: "completed"; results: Array<{ _id: string; type: "post" | "page"; slug: string; title: string; description?: string; snippet: string; score: number }> }
  | { status: "failed"; error: string };

async function finalize(
  ctx: Pick<ActionCtx, "runMutation">,
  jobId: Id<"semanticSearchJobs">,
  outcome: FinalizeOutcome,
): Promise<void> {
  await ctx.runMutation(internal.semanticSearchJobs.finalizeSemanticSearchJob, {
    jobId,
    ...outcome,
  });
}

type PostSearchRow = {
  _id: Id<"posts">;
  slug: string;
  title: string;
  description: string;
  content: string;
  unlisted?: boolean;
};

type PageSearchRow = {
  _id: Id<"pages">;
  slug: string;
  title: string;
  content: string;
};

type VectorSearchMatch = {
  _id: string;
  _score: number;
};

async function generateQueryEmbedding(queryText: string, apiKey: string): Promise<Array<number>> {
  const openai = new OpenAI({ apiKey });
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: queryText,
  });
  return embeddingResponse.data[0].embedding;
}

function buildSemanticSearchResults(
  postResults: Array<VectorSearchMatch>,
  pageResults: Array<VectorSearchMatch>,
  posts: Array<PostSearchRow>,
  pages: Array<PageSearchRow>,
): Array<{
  _id: string;
  type: "post" | "page";
  slug: string;
  title: string;
  description?: string;
  snippet: string;
  score: number;
}> {
  const postsById = new Map(posts.map((post) => [String(post._id), post]));
  const pagesById = new Map(pages.map((page) => [String(page._id), page]));
  const results: Array<{
    _id: string;
    type: "post" | "page";
    slug: string;
    title: string;
    description?: string;
    snippet: string;
    score: number;
  }> = [];

  for (const result of postResults) {
    const post = postsById.get(String(result._id));
    if (!post) {
      continue;
    }

    results.push({
      _id: String(post._id),
      type: "post",
      slug: post.slug,
      title: post.title,
      description: post.description,
      snippet: createSnippet(post.content, 120),
      score: result._score,
    });
  }

  for (const result of pageResults) {
    const page = pagesById.get(String(result._id));
    if (!page) {
      continue;
    }

    results.push({
      _id: String(page._id),
      type: "page",
      slug: page.slug,
      title: page.title,
      snippet: createSnippet(page.content, 120),
      score: result._score,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 15);
}

// Helper to create snippet from content (same logic as search.ts)
function createSnippet(content: string, maxLength: number): string {
  // Remove markdown syntax for cleaner snippets
  const cleanContent = content
    .replace(/#{1,6}\s/g, "") // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Images
    .replace(/\n+/g, " ") // Newlines to spaces
    .replace(/\s+/g, " ") // Multiple spaces to single
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  return cleanContent.slice(0, maxLength) + "...";
}
