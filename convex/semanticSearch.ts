"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Search result type matching existing search.ts format
const searchResultValidator = v.object({
  _id: v.string(),
  type: v.union(v.literal("post"), v.literal("page")),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  snippet: v.string(),
  score: v.number(), // Similarity score from vector search
});

// Main semantic search action
export const semanticSearch = action({
  args: { query: v.string() },
  returns: v.array(searchResultValidator),
  handler: async (ctx, args) => {
    // Return empty for empty queries
    if (!args.query.trim()) {
      return [];
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Gracefully return empty if not configured
      console.log("OPENAI_API_KEY not set, semantic search unavailable");
      return [];
    }

    // Generate embedding for search query
    const openai = new OpenAI({ apiKey });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: args.query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search posts using vector index
    const postResults = await ctx.vectorSearch("posts", "by_embedding", {
      vector: queryEmbedding,
      limit: 10,
      filter: (q) => q.eq("published", true),
    });

    // Search pages using vector index
    const pageResults = await ctx.vectorSearch("pages", "by_embedding", {
      vector: queryEmbedding,
      limit: 10,
      filter: (q) => q.eq("published", true),
    });

    // Fetch full document details
    const posts: Array<{
      _id: string;
      slug: string;
      title: string;
      description: string;
      content: string;
      unlisted?: boolean;
    }> = await ctx.runQuery(internal.semanticSearchQueries.fetchPostsByIds, {
      ids: postResults.map((r) => r._id),
    });
    const pages: Array<{
      _id: string;
      slug: string;
      title: string;
      content: string;
    }> = await ctx.runQuery(internal.semanticSearchQueries.fetchPagesByIds, {
      ids: pageResults.map((r) => r._id),
    });

    // Build results with scores
    const results: Array<{
      _id: string;
      type: "post" | "page";
      slug: string;
      title: string;
      description?: string;
      snippet: string;
      score: number;
    }> = [];

    // Map posts with scores
    for (const result of postResults) {
      const post = posts.find((p) => p._id === result._id);
      if (post) {
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
    }

    // Map pages with scores
    for (const result of pageResults) {
      const page = pages.find((p) => p._id === result._id);
      if (page) {
        results.push({
          _id: String(page._id),
          type: "page",
          slug: page.slug,
          title: page.title,
          snippet: createSnippet(page.content, 120),
          score: result._score,
        });
      }
    }

    // Sort by score descending (higher = more similar)
    results.sort((a, b) => b.score - a.score);

    // Limit to top 15 results
    return results.slice(0, 15);
  },
});

// Check if semantic search is available (API key configured)
export const isSemanticSearchAvailable = action({
  args: {},
  returns: v.boolean(),
  handler: async () => {
    return !!process.env.OPENAI_API_KEY;
  },
});

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
