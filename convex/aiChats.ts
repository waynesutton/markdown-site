import { v, ConvexError } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";

// Message validator for reuse
const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  timestamp: v.number(),
  attachments: v.optional(
    v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("link")),
        storageId: v.optional(v.id("_storage")),
        url: v.optional(v.string()),
        scrapedContent: v.optional(v.string()),
        title: v.optional(v.string()),
      }),
    ),
  ),
});

const attachmentValidator = v.object({
  type: v.union(v.literal("image"), v.literal("link")),
  storageId: v.optional(v.id("_storage")),
  url: v.optional(v.string()),
  scrapedContent: v.optional(v.string()),
  title: v.optional(v.string()),
});

const modelValidator = v.union(
  v.literal("claude-sonnet-4-20250514"),
  v.literal("gpt-4.1-mini"),
  v.literal("gemini-2.0-flash"),
);

async function requireAuthenticatedIdentity(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required to use AI chat");
  }
  return identity;
}

/**
 * Get storage URL for an image attachment
 */
export const getStorageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireAuthenticatedIdentity(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get AI chat by session and context
 * Returns null if no chat exists
 */
export const getAIChatByContext = query({
  args: {
    sessionId: v.string(),
    contextId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("aiChats"),
      _creationTime: v.number(),
      ownerSubject: v.optional(v.string()),
      sessionId: v.string(),
      contextId: v.string(),
      messages: v.array(messageValidator),
      pageContext: v.optional(v.string()),
      lastMessageAt: v.optional(v.number()),
      generating: v.optional(v.boolean()),
      lastError: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db
      .query("aiChats")
      .withIndex("by_sessionid_and_contextid", (q) =>
        q.eq("sessionId", args.sessionId).eq("contextId", args.contextId),
      )
      .unique();

    if (chat && chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    return chat;
  },
});

/**
 * Get storage URL for an image attachment (internal)
 */
export const getStorageUrlInternal = internalQuery({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get or create AI chat for session and context
 * Returns the chat ID (creates new chat if needed)
 */
export const getOrCreateAIChat = mutation({
  args: {
    sessionId: v.string(),
    contextId: v.string(),
  },
  returns: v.id("aiChats"),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    // Check for existing chat
    const existing = await ctx.db
      .query("aiChats")
      .withIndex("by_sessionid_and_contextid", (q) =>
        q.eq("sessionId", args.sessionId).eq("contextId", args.contextId),
      )
      .unique();

    if (existing) {
      if (existing.ownerSubject && existing.ownerSubject !== identity.subject) {
        throw new ConvexError("Unauthorized");
      }
      if (!existing.ownerSubject) {
        await ctx.db.patch(existing._id, { ownerSubject: identity.subject });
      }
      return existing._id;
    }

    // Create new chat
    const chatId = await ctx.db.insert("aiChats", {
      ownerSubject: identity.subject,
      sessionId: args.sessionId,
      contextId: args.contextId,
      messages: [],
      lastMessageAt: Date.now(),
      generating: false,
    });

    return chatId;
  },
});

/**
 * Add user message to chat
 * Returns the updated chat
 */
export const addUserMessage = mutation({
  args: {
    chatId: v.id("aiChats"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    const now = Date.now();
    const newMessage = {
      role: "user" as const,
      content: args.content,
      timestamp: now,
    };

    await ctx.db.patch(args.chatId, {
      messages: [...chat.messages, newMessage],
      lastMessageAt: now,
      lastError: undefined,
    });

    return null;
  },
});

/**
 * Add user message with attachments
 * Used when sending images or links
 */
export const addUserMessageWithAttachments = mutation({
  args: {
    chatId: v.id("aiChats"),
    content: v.string(),
    attachments: v.optional(
      v.array(attachmentValidator),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    const now = Date.now();
    const newMessage = {
      role: "user" as const,
      content: args.content,
      timestamp: now,
      attachments: args.attachments,
    };

    await ctx.db.patch(args.chatId, {
      messages: [...chat.messages, newMessage],
      lastMessageAt: now,
      lastError: undefined,
    });

    return null;
  },
});

/**
 * Generate upload URL for image attachments
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAuthenticatedIdentity(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const finalizeGeneration = internalMutation({
  args: {
    chatId: v.id("aiChats"),
    assistantMessage: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return null;
    }

    const now = Date.now();
    if (args.assistantMessage !== undefined) {
      const newMessage = {
        role: "assistant" as const,
        content: args.assistantMessage,
        timestamp: now,
      };

      await ctx.db.patch(args.chatId, {
        messages: [...chat.messages, newMessage],
        lastMessageAt: now,
        generating: false,
        lastError: undefined,
      });
      return null;
    }

    await ctx.db.patch(args.chatId, {
      generating: false,
      lastError: args.error,
      lastMessageAt: now,
    });
    return null;
  },
});

export const requestAIResponse = mutation({
  args: {
    chatId: v.id("aiChats"),
    userMessage: v.string(),
    model: v.optional(modelValidator),
    pageContext: v.optional(v.string()),
    attachments: v.optional(v.array(attachmentValidator)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);

    await rateLimiter.limit(ctx, "aiChatResponse", {
      key: identity.subject,
      throws: true,
    });

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      ownerSubject: chat.ownerSubject ?? identity.subject,
      generating: true,
      lastError: undefined,
      pageContext: args.pageContext ?? chat.pageContext,
      lastMessageAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.aiChatActions.generateResponse, {
      chatId: args.chatId,
      model: args.model,
      pageContext: args.pageContext ?? chat.pageContext,
      recentMessages: chat.messages.slice(-20),
    });
    return null;
  },
});

/**
 * Clear all messages from a chat
 */
export const clearChat = mutation({
  args: {
    chatId: v.id("aiChats"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return null; // Idempotent - no error if chat doesn't exist
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      messages: [],
      pageContext: undefined,
      lastMessageAt: Date.now(),
      generating: false,
      lastError: undefined,
    });

    return null;
  },
});

/**
 * Set page context for a chat (loads page markdown for AI context)
 */
export const setPageContext = mutation({
  args: {
    chatId: v.id("aiChats"),
    pageContext: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      pageContext: args.pageContext,
    });

    return null;
  },
});

/**
 * Delete entire chat session
 */
export const deleteChat = mutation({
  args: {
    chatId: v.id("aiChats"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return null; // Idempotent
    }
    if (chat.ownerSubject && chat.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.chatId);
    return null;
  },
});

/**
 * Get all chats for a session (for potential future chat history feature)
 */
export const getChatsBySession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("aiChats"),
      _creationTime: v.number(),
      ownerSubject: v.optional(v.string()),
      sessionId: v.string(),
      contextId: v.string(),
      messages: v.array(messageValidator),
      pageContext: v.optional(v.string()),
      lastMessageAt: v.optional(v.number()),
      generating: v.optional(v.boolean()),
      lastError: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const chats = await ctx.db
      .query("aiChats")
      .withIndex("by_sessionid_and_contextid", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100);

    return chats.filter(
      (chat) => !chat.ownerSubject || chat.ownerSubject === identity.subject,
    );
  },
});

/**
 * Get recent generated images for a session (internal - called from action)
 */
export const getRecentImagesInternal = internalQuery({
  args: {
    sessionId: v.string(),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("aiGeneratedImages"),
      _creationTime: v.number(),
      ownerSubject: v.optional(v.string()),
      sessionId: v.string(),
      prompt: v.string(),
      model: v.string(),
      storageId: v.id("_storage"),
      mimeType: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("aiGeneratedImages")
      .withIndex("by_sessionid", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(args.limit);

    return images;
  },
});

/**
 * Delete a generated image from database and storage
 */
export const deleteGeneratedImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    // Find and delete from aiGeneratedImages table
    const image = await ctx.db
      .query("aiGeneratedImages")
      .withIndex("by_storageid", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (image?.ownerSubject && image.ownerSubject !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    if (image) {
      await ctx.db.delete(image._id);
    }

    // Delete from Convex Storage
    await ctx.storage.delete(args.storageId);

    return { success: true };
  },
});

