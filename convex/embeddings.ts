"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Generate embedding for text using OpenAI text-embedding-ada-002
export const generateEmbedding = internalAction({
  args: { text: v.string() },
  returns: v.array(v.float64()),
  handler: async (_ctx, { text }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured in Convex environment");
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.slice(0, 8000), // Truncate to stay within token limit
    });

    return response.data[0].embedding;
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

    let processed = 0;
    for (const post of posts) {
      try {
        // Combine title and content for embedding
        const textToEmbed = `${post.title}\n\n${post.content}`;
        const embedding = await ctx.runAction(internal.embeddings.generateEmbedding, {
          text: textToEmbed,
        });
        await ctx.runMutation(internal.embeddingsQueries.savePostEmbedding, {
          id: post._id,
          embedding,
        });
        processed++;
      } catch (error) {
        console.error(`Failed to generate embedding for post ${post._id}:`, error);
      }
    }

    return { processed };
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

    let processed = 0;
    for (const page of pages) {
      try {
        // Combine title and content for embedding
        const textToEmbed = `${page.title}\n\n${page.content}`;
        const embedding = await ctx.runAction(internal.embeddings.generateEmbedding, {
          text: textToEmbed,
        });
        await ctx.runMutation(internal.embeddingsQueries.savePageEmbedding, {
          id: page._id,
          embedding,
        });
        processed++;
      } catch (error) {
        console.error(`Failed to generate embedding for page ${page._id}:`, error);
      }
    }

    return { processed };
  },
});

// Public action to generate missing embeddings for all content
// Called from sync script or manually
export const generateMissingEmbeddings = action({
  args: {},
  returns: v.object({
    postsProcessed: v.number(),
    pagesProcessed: v.number(),
    skipped: v.boolean(),
  }),
  handler: async (ctx): Promise<{
    postsProcessed: number;
    pagesProcessed: number;
    skipped: boolean;
  }> => {
    // Check for API key first - gracefully skip if not configured
    if (!process.env.OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY not set, skipping embedding generation");
      return { postsProcessed: 0, pagesProcessed: 0, skipped: true };
    }

    const postsResult: { processed: number } = await ctx.runAction(
      internal.embeddings.generatePostEmbeddings,
      {}
    );
    const pagesResult: { processed: number } = await ctx.runAction(
      internal.embeddings.generatePageEmbeddings,
      {}
    );

    return {
      postsProcessed: postsResult.processed,
      pagesProcessed: pagesResult.processed,
      skipped: false,
    };
  },
});

// Public action to regenerate embedding for a specific post
export const regeneratePostEmbedding = action({
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
      const embedding = await ctx.runAction(internal.embeddings.generateEmbedding, {
        text: textToEmbed,
      });
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
