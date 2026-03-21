import { v, ConvexError } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { components } from "./_generated/api";
import { PersistentTextStreaming, StreamIdValidator, StreamId } from "@convex-dev/persistent-text-streaming";

// Initialize Persistent Text Streaming component (works in Convex runtime)
const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

async function requireAuthenticatedIdentity(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }
  return identity;
}

// Create a new Ask AI session with streaming
export const createSession = mutation({
  args: {
    question: v.string(),
    model: v.optional(v.string()),
  },
  returns: v.object({
    sessionId: v.id("askAISessions"),
    streamId: v.string(),
  }),
  handler: async (ctx, { question, model }) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const streamId = await streaming.createStream(ctx);
    const sessionId = await ctx.db.insert("askAISessions", {
      ownerSubject: identity.subject,
      question,
      streamId,
      model: model || "claude-sonnet-4-20250514",
      createdAt: Date.now(),
    });
    return { sessionId, streamId };
  },
});

// Get stream body for database fallback (used by useStream hook)
export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  returns: v.any(),
  handler: async (ctx, { streamId }) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const session = await ctx.db
      .query("askAISessions")
      .withIndex("by_streamid", (q) => q.eq("streamId", streamId))
      .unique();
    if (!session) {
      throw new ConvexError("Session not found");
    }
    if (session.ownerSubject && session.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }
    return await streaming.getStreamBody(ctx, streamId as StreamId);
  },
});

// Internal query to get session by streamId (used by HTTP action)
export const getSessionByStreamId = internalQuery({
  args: {
    streamId: v.string(),
  },
  returns: v.union(
    v.object({
      ownerSubject: v.optional(v.string()),
      question: v.string(),
      model: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, { streamId }) => {
    const session = await ctx.db
      .query("askAISessions")
      .withIndex("by_streamid", (q) => q.eq("streamId", streamId))
      .unique();
    if (!session) return null;
    return {
      ownerSubject: session.ownerSubject,
      question: session.question,
      model: session.model,
    };
  },
});
