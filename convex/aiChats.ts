import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

// Get or create an AI chat session
export const getOrCreateAIChat = mutation({
  args: {
    sessionId: v.string(),
    contextId: v.string(),
  },
  handler: async (ctx, { sessionId, contextId }) => {
    // Check if a chat already exists for this session and context
    const existingChat = await ctx.db
      .query("aiChats")
      .withIndex("by_session_and_context", (q) =>
        q.eq("sessionId", sessionId).eq("contextId", contextId),
      )
      .first();

    if (existingChat) {
      return existingChat._id;
    }

    // Create a new chat if one doesn't exist
    return await ctx.db.insert("aiChats", {
      sessionId,
      contextId,
      messages: [],
      lastMessageAt: Date.now(),
    });
  },
});

// Get AI chat by ID
export const get = query({
    args: { id: v.id("aiChats") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

// Get AI chat by context
export const getAIChatByContext = query({
  args: {
    sessionId: v.string(),
    contextId: v.string(),
  },
  handler: async (ctx, { sessionId, contextId }) => {
    return await ctx.db
      .query("aiChats")
      .withIndex("by_session_and_context", (q) =>
        q.eq("sessionId", sessionId).eq("contextId", contextId),
      )
      .first();
  },
});

// Add a user message to the chat
export const addUserMessage = mutation({
  args: {
    chatId: v.id("aiChats"),
    content: v.string(),
  },
  handler: async (ctx, { chatId, content }) => {
    await ctx.db.patch(chatId, {
      messages: [
        ...(await ctx.db.get(chatId))!.messages,
        {
          role: "user",
          content,
          timestamp: Date.now(),
        },
      ],
      lastMessageAt: Date.now(),
    });
  },
});

// Add user message with attachments
export const addUserMessageWithAttachments = mutation({
  args: {
    chatId: v.id("aiChats"),
    content: v.string(),
    attachments: v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("link")),
        storageId: v.optional(v.id("_storage")),
        url: v.optional(v.string()),
        scrapedContent: v.optional(v.string()),
        title: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { chatId, content, attachments }) => {
    await ctx.db.patch(chatId, {
      messages: [
        ...(await ctx.db.get(chatId))!.messages,
        {
          role: "user",
          content,
          timestamp: Date.now(),
          attachments,
        },
      ],
      lastMessageAt: Date.now(),
    });
  },
});

// Generate a URL for file uploads
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get URL for a stored file
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Clear all messages from a chat
export const clearChat = mutation({
  args: {
    chatId: v.id("aiChats"),
  },
  handler: async (ctx, { chatId }) => {
    await ctx.db.patch(chatId, {
      messages: [],
      pageContext: undefined,
      lastMessageAt: Date.now(),
    });
  },
});

// Set page context for a chat
export const setPageContext = mutation({
  args: {
    chatId: v.id("aiChats"),
    pageContext: v.string(),
  },
  handler: async (ctx, { chatId, pageContext }) => {
    await ctx.db.patch(chatId, {
      pageContext,
    });
  },
});

// Update assistant message (for streaming)
export const updateAssistantMessage = mutation({
    args: {
        chatId: v.id("aiChats"),
        assistantResponse: v.string(),
    },
    handler: async(ctx, {chatId, assistantResponse}) => {
        const chat = await ctx.db.get(chatId);
        if(!chat) return;

        const lastMessage = chat.messages[chat.messages.length - 1];

        if(lastMessage?.role === 'assistant') {
            await ctx.db.patch(chatId, {
                messages: [
                    ...chat.messages.slice(0, -1),
                    {...lastMessage, content: assistantResponse}
                ]
            })
        } else {
             await ctx.db.patch(chatId, {
                messages: [
                    ...chat.messages,
                    {
                        role: "assistant",
                        content: assistantResponse,
                        timestamp: Date.now()
                    }
                ]
            })
        }
    }
});

// Internal mutation to save generated image metadata
export const saveGeneratedImage = internalMutation({
  args: {
    sessionId: v.string(),
    prompt: v.string(),
    model: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiGeneratedImages", {
      sessionId: args.sessionId,
      prompt: args.prompt,
      model: args.model,
      storageId: args.storageId,
      mimeType: args.mimeType,
      createdAt: Date.now(),
    });
  },
});

// Internal query to get recent images for a session
export const getRecentImagesInternal = internalQuery({
  args: {
    sessionId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiGeneratedImages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(args.limit);
  },
});