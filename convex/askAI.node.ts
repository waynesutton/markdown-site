"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { PersistentTextStreaming, StreamId } from "@convex-dev/persistent-text-streaming";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { v } from "convex/values";

// Initialize Persistent Text Streaming component
const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

// System prompt for RAG-based Q&A
const RAG_SYSTEM_PROMPT = `You are a helpful assistant that answers questions about this website's content.

Guidelines:
- Answer questions based ONLY on the provided context
- If the context doesn't contain relevant information, say so honestly
- Cite sources by mentioning the page/post title when referencing specific content
- Be concise but thorough
- Format responses in markdown when appropriate
- Do not make up information not present in the context`;

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// HTTP handler for streaming AI responses (requires authentication)
export async function handleStreamResponse(
  ctx: GenericActionCtx<DataModel>,
  request: Request,
): Promise<Response> {
  // Verify caller is authenticated
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  let body: { streamId?: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { streamId } = body;

  if (!streamId) {
    return new Response(JSON.stringify({ error: "Missing streamId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Get the question and model from the database
  const session = await ctx.runQuery(internal.askAI.getSessionByStreamId, { streamId });

  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (session.ownerSubject && session.ownerSubject !== identity.subject) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { question, model } = session;

  // Pre-fetch search results before starting the stream
  let searchResults: Array<{ title: string; slug: string; type: string; content: string }> = [];
  let searchError: string | null = null;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      searchError = "OPENAI_API_KEY not configured. Please add it to your Convex dashboard environment variables.";
    } else {
      const openai = new OpenAI({ apiKey });

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: question.trim(),
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Search posts
      const postResults = await ctx.vectorSearch("posts", "by_embedding", {
        vector: queryEmbedding,
        limit: 5,
        filter: (q) => q.eq("published", true),
      });

      // Search pages
      const pageResults = await ctx.vectorSearch("pages", "by_embedding", {
        vector: queryEmbedding,
        limit: 5,
        filter: (q) => q.eq("published", true),
      });

      const docs = await ctx.runQuery(internal.semanticSearchQueries.fetchSearchDocsByIds, {
        postIds: postResults.map((r) => r._id),
        pageIds: pageResults.map((r) => r._id),
      });
      const posts = docs.posts;
      const pages = docs.pages;

      // Build results
      const results: Array<{ title: string; slug: string; type: string; content: string; score: number }> = [];

      for (const result of postResults) {
        const post = posts.find((p) => p._id === result._id);
        if (post) {
          results.push({
            title: post.title,
            slug: post.slug,
            type: "post",
            content: post.content,
            score: result._score,
          });
        }
      }

      for (const result of pageResults) {
        const page = pages.find((p) => p._id === result._id);
        if (page) {
          results.push({
            title: page.title,
            slug: page.slug,
            type: "page",
            content: page.content,
            score: result._score,
          });
        }
      }

      results.sort((a, b) => b.score - a.score);
      searchResults = results.slice(0, 5);

    }
  } catch (error) {
    console.error("Search error:", error);
    searchError = error instanceof Error ? error.message : "Search failed";
  }

  // Now start the streaming with pre-fetched results
  const generateAnswer = async (
    _ctx: unknown,
    _request: unknown,
    _streamId: unknown,
    appendChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      // Handle search errors
      if (searchError) {
        await appendChunk(`**Error:** ${searchError}`);
        return;
      }

      if (searchResults.length === 0) {
        await appendChunk("I couldn't find any relevant content to answer your question. Please make sure:\n\n1. Semantic search is enabled in siteConfig.ts\n2. Content has been synced with `npm run sync`\n3. OPENAI_API_KEY is configured in Convex dashboard");
        return;
      }

      // Build context from search results
      const contextParts = searchResults.map(
        (r) => `## ${r.title}\nURL: /${r.slug}\n\n${r.content.slice(0, 2000)}`
      );
      const context = contextParts.join("\n\n---\n\n");

      const fullPrompt = `Based on the following content from the website, answer this question: "${question}"

CONTEXT:
${context}

Please provide a helpful answer based on the context above.`;

      // Generate response with selected model
      if (model === "gpt-4o") {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          await appendChunk("**Error:** OPENAI_API_KEY not configured.");
          return;
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: RAG_SYSTEM_PROMPT },
            { role: "user", content: fullPrompt },
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            await appendChunk(content);
          }
        }
      } else {
        // Use Anthropic (default)
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicApiKey) {
          await appendChunk("**Error:** ANTHROPIC_API_KEY not configured in Convex dashboard.");
          return;
        }

        const anthropic = new Anthropic({ apiKey: anthropicApiKey });

        // Use non-streaming for more reliable error handling
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: RAG_SYSTEM_PROMPT,
          messages: [{ role: "user", content: fullPrompt }],
        });

        // Extract text from response
        for (const block of response.content) {
          if (block.type === "text") {
            // Stream word by word for better UX
            const words = block.text.split(/(\s+)/);
            for (const word of words) {
              await appendChunk(word);
            }
          }
        }
      }

      // Add source citations
      await appendChunk("\n\n---\n\n**Sources:**\n");
      for (const source of searchResults) {
        await appendChunk(`- [${source.title}](/${source.slug})\n`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Generation error:", error);

      try {
        await appendChunk(`\n\n**Error:** ${errorMessage}`);
      } catch {
        // Stream may already be closed, ignore
      }
    }
  };

  const response = await streaming.stream(
    ctx as unknown as GenericActionCtx<GenericDataModel>,
    request,
    streamId as StreamId,
    generateAnswer
  );

  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Vary", "Origin");

  return response;
}

// CORS preflight handler
export async function handleStreamResponseOptions(
  ctx: GenericActionCtx<DataModel>,
  request: Request,
): Promise<Response> {
  await ctx.auth.getUserIdentity();
  const authHeader = request.headers.get("Authorization");
  if (authHeader && !authHeader.startsWith("Bearer ")) {
    return new Response(null, {
      status: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Check if Ask AI is properly configured (environment variables set)
export const checkConfiguration = internalAction({
  args: {},
  returns: v.object({
    configured: v.boolean(),
    hasOpenAI: v.boolean(),
    hasAnthropic: v.boolean(),
    missingKeys: v.array(v.string()),
  }),
  handler: async () => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    const missingKeys: string[] = [];
    if (!hasOpenAI) missingKeys.push("OPENAI_API_KEY");
    if (!hasAnthropic) missingKeys.push("ANTHROPIC_API_KEY");

    // Ask AI requires at least OPENAI_API_KEY for embeddings
    // and either ANTHROPIC_API_KEY or OPENAI_API_KEY for LLM
    const configured = hasOpenAI && (hasAnthropic || hasOpenAI);

    return {
      configured,
      hasOpenAI,
      hasAnthropic,
      missingKeys,
    };
  },
});
