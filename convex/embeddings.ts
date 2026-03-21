"use node";

import { v, ConvexError } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

async function generateEmbeddingHelper(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ConvexError("OPENAI_API_KEY not configured in Convex environment");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text.slice(0, 8000),
  });

  return response.data[0].embedding;
}

// Registered action wrapper for external callers
export const generateEmbedding = internalAction({
  args: { text: v.string() },
  returns: v.array(v.float64()),
  handler: async (_ctx, { text }) => {
    return await generateEmbeddingHelper(text);
  },
});

// Internal action to generate embeddings for posts without them
export const generatePostEmbeddings = internalAction({
  args: {},
  returns: v.object({ processed: v.number() }),
  handler: async (ctx) => {
    const posts = await ctx.runQuery(
      internal.embeddingsQueries.getPostsWithoutEmbeddings,
      { limit: 10 }
    );

    const batch: Array<{ id: string; embedding: number[] }> = [];
    for (const post of posts) {
      try {
        const textToEmbed = `${post.title}\n\n${post.content}`;
        const embedding = await generateEmbeddingHelper(textToEmbed);
        batch.push({ id: post._id, embedding });
      } catch (error) {
        console.error(`Failed to generate embedding for post ${post._id}:`, error);
      }
    }

    if (batch.length > 0) {
      await ctx.runMutation(internal.embeddingsQueries.savePostEmbeddingsBatch, {
        items: batch as any,
      });
    }

    return { processed: batch.length };
  },
});

// Internal action to generate embeddings for pages without them
export const generatePageEmbeddings = internalAction({
  args: {},
  returns: v.object({ processed: v.number() }),
  handler: async (ctx) => {
    const pages = await ctx.runQuery(
      internal.embeddingsQueries.getPagesWithoutEmbeddings,
      { limit: 10 }
    );

    const batch: Array<{ id: string; embedding: number[] }> = [];
    for (const page of pages) {
      try {
        const textToEmbed = `${page.title}\n\n${page.content}`;
        const embedding = await generateEmbeddingHelper(textToEmbed);
        batch.push({ id: page._id, embedding });
      } catch (error) {
        console.error(`Failed to generate embedding for page ${page._id}:`, error);
      }
    }

    if (batch.length > 0) {
      await ctx.runMutation(internal.embeddingsQueries.savePageEmbeddingsBatch, {
        items: batch as any,
      });
    }

    return { processed: batch.length };
  },
});

// Internal action to regenerate embedding for a specific post
export const regeneratePostEmbeddingJob = internalAction({
  args: { slug: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      return { success: false, error: "OPENAI_API_KEY not configured" };
    }

    // Find the post by slug
    const post = await ctx.runQuery(internal.embeddingsQueries.getPostBySlug, {
      slug: args.slug,
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    try {
      const textToEmbed = `${post.title}\n\n${post.content}`;
      const embedding = await generateEmbeddingHelper(textToEmbed);
      await ctx.runMutation(internal.embeddingsQueries.savePostEmbedding, {
        id: post._id,
        embedding,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
});
