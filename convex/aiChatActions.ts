"use node";

import { v, ConvexError } from "convex/values";
import type { DataModel, Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { GenericActionCtx } from "convex/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  ContentBlockParam,
  TextBlockParam,
  ImageBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages";
import OpenAI from "openai";
import { GoogleGenAI, Content } from "@google/genai";
import FirecrawlApp from "@mendable/firecrawl-js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Model validator for multi-model support
const modelValidator = v.union(
  v.literal("claude-sonnet-4-20250514"),
  v.literal("gpt-4.1-mini"),
  v.literal("gemini-2.0-flash")
);

type AIModel = "claude-sonnet-4-20250514" | "gpt-4.1-mini" | "gemini-2.0-flash";

type ChatAttachment = {
  type: "image" | "link";
  storageId?: Id<"_storage">;
  url?: string;
  scrapedContent?: string;
  title?: string;
};

type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: ChatAttachment[];
};

const attachmentValidator = v.object({
  type: v.union(v.literal("image"), v.literal("link")),
  storageId: v.optional(v.id("_storage")),
  url: v.optional(v.string()),
  scrapedContent: v.optional(v.string()),
  title: v.optional(v.string()),
});

const storedChatMessageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  timestamp: v.number(),
  attachments: v.optional(v.array(attachmentValidator)),
});

type FormattedChatMessage = {
  role: "user" | "assistant";
  content: string | Array<ContentBlockParam>;
};

type AiChatActionCtx = GenericActionCtx<DataModel>;

// Default system prompt for writing assistant
const DEFAULT_SYSTEM_PROMPT = `You are a helpful writing assistant. Help users write clearly and concisely.

Always apply the rule of one:
Focus on one person.
Address one specific problem they are facing.
Identify the single root cause of that problem.
Explain the one thing the solution does differently.
End by asking for one clear action.

Follow these guidelines:
Write in a clear and direct style.
Avoid jargon and unnecessary complexity.
Use short sentences and short paragraphs.
Be concise but thorough.
Do not use em dashes.
Format responses in markdown when appropriate.`;

/**
 * Build system prompt from environment variables
 * Supports split prompts (CLAUDE_PROMPT_STYLE, CLAUDE_PROMPT_COMMUNITY, CLAUDE_PROMPT_RULES)
 * or single prompt (CLAUDE_SYSTEM_PROMPT)
 */
function buildSystemPrompt(): string {
  // Try split prompts first
  const part1 = process.env.CLAUDE_PROMPT_STYLE || "";
  const part2 = process.env.CLAUDE_PROMPT_COMMUNITY || "";
  const part3 = process.env.CLAUDE_PROMPT_RULES || "";

  const parts = [part1, part2, part3].filter((p) => p.trim());

  if (parts.length > 0) {
    return parts.join("\n\n---\n\n");
  }

  // Fall back to single prompt
  return process.env.CLAUDE_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;
}

/**
 * Scrape URL content using Firecrawl (optional)
 */
async function scrapeUrl(url: string): Promise<{
  content: string;
  title?: string;
} | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return null; // Firecrawl not configured
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
    });

    if (!result.success || !result.markdown) {
      return null;
    }

    return {
      content: result.markdown,
      title: result.metadata?.title,
    };
  } catch {
    return null; // Silently fail if scraping fails
  }
}

/**
 * Get provider from model ID
 */
function getProviderFromModel(model: AIModel): "anthropic" | "openai" | "google" {
  if (model.startsWith("claude")) return "anthropic";
  if (model.startsWith("gpt")) return "openai";
  if (model.startsWith("gemini")) return "google";
  return "anthropic"; // Default fallback
}

/**
 * Get API key for a provider, returns null if not configured
 */
function getApiKeyForProvider(provider: "anthropic" | "openai" | "google"): string | null {
  switch (provider) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || null;
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "google":
      return process.env.GOOGLE_AI_API_KEY || null;
  }
}

/**
 * Get not configured message for a provider
 */
function getNotConfiguredMessage(provider: "anthropic" | "openai" | "google"): string {
  const configs = {
    anthropic: {
      name: "Claude (Anthropic)",
      envVar: "ANTHROPIC_API_KEY",
      consoleUrl: "https://console.anthropic.com/",
      consoleName: "Anthropic Console",
    },
    openai: {
      name: "GPT (OpenAI)",
      envVar: "OPENAI_API_KEY",
      consoleUrl: "https://platform.openai.com/api-keys",
      consoleName: "OpenAI Platform",
    },
    google: {
      name: "Gemini (Google)",
      envVar: "GOOGLE_AI_API_KEY",
      consoleUrl: "https://aistudio.google.com/apikey",
      consoleName: "Google AI Studio",
    },
  };

  const config = configs[provider];
  return (
    `**${config.name} is not configured.**\n\n` +
    `To enable this model, add your \`${config.envVar}\` to the Convex environment variables.\n\n` +
    `**Setup steps:**\n` +
    `1. Get an API key from [${config.consoleName}](${config.consoleUrl})\n` +
    `2. Add it to Convex: \`npx convex env set ${config.envVar} your-key-here\`\n` +
    `3. For production, set it in the [Convex Dashboard](https://dashboard.convex.dev/)\n\n` +
    `See the [Convex environment variables docs](https://docs.convex.dev/production/environment-variables) for more details.`
  );
}

function buildSystemPromptWithContext(pageContent?: string): string {
  let systemPrompt = buildSystemPrompt();
  if (pageContent) {
    systemPrompt += `\n\n---\n\nThe user is viewing a page with the following content. Use this as context for your responses:\n\n${pageContent}`;
  }
  return systemPrompt;
}

async function enrichAttachmentsWithScrapedContent(
  attachments: ChatAttachment[] | undefined,
): Promise<ChatAttachment[] | undefined> {
  if (!attachments || attachments.length === 0) {
    return attachments;
  }

  return await Promise.all(
    attachments.map(async (attachment) => {
      if (
        attachment.type === "link" &&
        attachment.url &&
        !attachment.scrapedContent
      ) {
        const scraped = await scrapeUrl(attachment.url);
        if (scraped) {
          return {
            ...attachment,
            scrapedContent: scraped.content,
            title: scraped.title || attachment.title,
          };
        }
      }
      return attachment;
    }),
  );
}

async function enrichMessagesWithScrapedContent(
  messages: StoredChatMessage[],
): Promise<StoredChatMessage[]> {
  return await Promise.all(
    messages.map(async (message) => {
      if (message.role !== "user" || !message.attachments?.length) {
        return message;
      }

      return {
        ...message,
        attachments: await enrichAttachmentsWithScrapedContent(message.attachments),
      };
    }),
  );
}

function collectStorageIds(
  recentMessages: StoredChatMessage[],
): Array<Id<"_storage">> {
  const storageIds = new Set<Id<"_storage">>();

  for (const message of recentMessages) {
    if (message.role !== "user" || !message.attachments) {
      continue;
    }
    for (const attachment of message.attachments) {
      if (attachment.type === "image" && attachment.storageId) {
        storageIds.add(attachment.storageId);
      }
    }
  }

  return Array.from(storageIds);
}

async function resolveStorageUrls(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  storageIds: Array<Id<"_storage">>,
): Promise<Record<string, string | null>> {
  const entries = await Promise.all(
    storageIds.map(async (storageId) => [
      storageId,
      await ctx.storage.getUrl(storageId),
    ] as const),
  );

  const storageUrlMap: Record<string, string | null> = {};
  for (const [storageId, url] of entries) {
    storageUrlMap[storageId] = url;
  }
  return storageUrlMap;
}

function buildLinkText(attachment: ChatAttachment): string {
  let linkText = attachment.url || "";
  if (attachment.scrapedContent) {
    linkText += `\n\nContent from ${attachment.url}:\n${attachment.scrapedContent}`;
  }
  return linkText;
}

function buildUserContent(
  messageText: string,
  attachments: ChatAttachment[] | undefined,
  storageUrlMap: Record<string, string | null>,
): string | Array<ContentBlockParam> {
  const contentParts: Array<TextBlockParam | ImageBlockParam> = [];

  if (messageText) {
    contentParts.push({ type: "text", text: messageText });
  }

  if (attachments) {
    for (const attachment of attachments) {
      if (attachment.type === "image" && attachment.storageId) {
        const imageUrl = storageUrlMap[attachment.storageId];
        if (imageUrl) {
          contentParts.push({
            type: "image",
            source: { type: "url", url: imageUrl },
          });
        }
      } else if (attachment.type === "link") {
        const linkText = buildLinkText(attachment);
        if (linkText) {
          contentParts.push({ type: "text", text: linkText });
        }
      }
    }
  }

  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return contentParts[0].text;
  }

  return contentParts;
}

function buildFormattedMessages(
  recentMessages: StoredChatMessage[],
  storageUrlMap: Record<string, string | null>,
): Array<FormattedChatMessage> {
  const formattedMessages: Array<FormattedChatMessage> = [];

  for (const message of recentMessages) {
    if (message.role === "assistant") {
      formattedMessages.push({ role: "assistant", content: message.content });
      continue;
    }

    formattedMessages.push({
      role: "user",
      content: buildUserContent(
        message.content,
        message.attachments,
        storageUrlMap,
      ),
    });
  }

  return formattedMessages;
}

async function callProviderApi(
  provider: "anthropic" | "openai" | "google",
  apiKey: string,
  model: AIModel,
  systemPrompt: string,
  formattedMessages: Array<FormattedChatMessage>,
): Promise<string> {
  switch (provider) {
    case "anthropic":
      return await callAnthropicApi(apiKey, model, systemPrompt, formattedMessages);
    case "openai":
      return await callOpenAIApi(apiKey, model, systemPrompt, formattedMessages);
    case "google":
      return await callGeminiApi(apiKey, model, systemPrompt, formattedMessages);
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropicApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{
    role: "user" | "assistant";
    content: string | Array<ContentBlockParam>;
  }>
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new ConvexError("No text content in Claude response");
  }

  return textContent.text;
}

/**
 * Call OpenAI GPT API
 */
async function callOpenAIApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{
    role: "user" | "assistant";
    content: string | Array<ContentBlockParam>;
  }>
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  // Convert messages to OpenAI format
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      if (msg.role === "user") {
        openaiMessages.push({ role: "user", content: msg.content });
      } else {
        openaiMessages.push({ role: "assistant", content: msg.content });
      }
    } else {
      // Convert content blocks to OpenAI format
      const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
      for (const block of msg.content) {
        if (block.type === "text") {
          content.push({ type: "text", text: block.text });
        } else if (block.type === "image" && "source" in block && block.source.type === "url") {
          content.push({ type: "image_url", image_url: { url: block.source.url } });
        }
      }
      if (msg.role === "user") {
        openaiMessages.push({
          role: "user",
          content: content.length === 1 && content[0].type === "text" ? content[0].text : content,
        });
      } else {
        // Assistant messages only support string content in OpenAI
        const textContent = content.filter(c => c.type === "text").map(c => (c as { type: "text"; text: string }).text).join("\n");
        openaiMessages.push({ role: "assistant", content: textContent });
      }
    }
  }

  const response = await openai.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: openaiMessages,
  });

  const textContent = response.choices[0]?.message?.content;
  if (!textContent) {
    throw new ConvexError("No text content in OpenAI response");
  }

  return textContent;
}

/**
 * Call Google Gemini API
 */
async function callGeminiApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{
    role: "user" | "assistant";
    content: string | Array<ContentBlockParam>;
  }>
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Convert messages to Gemini format
  const geminiMessages: Content[] = [];

  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : "user";

    if (typeof msg.content === "string") {
      geminiMessages.push({
        role,
        parts: [{ text: msg.content }],
      });
    } else {
      // Convert content blocks to Gemini format
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      for (const block of msg.content) {
        if (block.type === "text") {
          parts.push({ text: block.text });
        }
        // Note: Gemini handles images differently, would need base64 encoding
        // For now, skip image blocks in Gemini
      }
      if (parts.length > 0) {
        geminiMessages.push({ role, parts });
      }
    }
  }

  const response = await ai.models.generateContent({
    model,
    contents: geminiMessages,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 2048,
    },
  });

  const textContent = response.candidates?.[0]?.content?.parts?.find(
    (part: { text?: string }) => part.text
  );

  if (!textContent || !("text" in textContent)) {
    throw new ConvexError("No text content in Gemini response");
  }

  return textContent.text as string;
}

/**
 * Generate AI response for a chat
 * Supports multiple AI providers: Anthropic, OpenAI, Google
 */
export const generateResponse = internalAction({
  args: {
    chatId: v.id("aiChats"),
    model: v.optional(modelValidator),
    pageContext: v.optional(v.string()),
    recentMessages: v.array(storedChatMessageValidator),
  },
  returns: v.string(),
  handler: async (ctx, args) => await generateResponseFromSnapshot(ctx, args),
});

async function generateResponseFromSnapshot(
  ctx: AiChatActionCtx,
  args: {
    chatId: Id<"aiChats">;
    model?: AIModel;
    pageContext?: string;
    recentMessages: StoredChatMessage[];
  },
): Promise<string> {
  try {
    const selectedModel: AIModel = args.model || "claude-sonnet-4-20250514";
    const provider = getProviderFromModel(selectedModel);

    const apiKey = getApiKeyForProvider(provider);
    if (!apiKey) {
      const notConfiguredMessage = getNotConfiguredMessage(provider);
      await ctx.runMutation(internal.aiChats.finalizeGeneration, {
        chatId: args.chatId,
        assistantMessage: notConfiguredMessage,
      });
      return notConfiguredMessage;
    }

    const systemPrompt = buildSystemPromptWithContext(args.pageContext);
    const recentMessages = await enrichMessagesWithScrapedContent(args.recentMessages);
    const storageIds = collectStorageIds(recentMessages);
    const storageUrlMap =
      storageIds.length > 0 ? await resolveStorageUrls(ctx, storageIds) : {};
    const formattedMessages = buildFormattedMessages(recentMessages, storageUrlMap);

    let assistantMessage: string;
    try {
      assistantMessage = await callProviderApi(
        provider,
        apiKey,
        selectedModel,
        systemPrompt,
        formattedMessages,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      assistantMessage = `**Error from ${provider}:** ${errorMessage}`;
    }

    await ctx.runMutation(internal.aiChats.finalizeGeneration, {
      chatId: args.chatId,
      assistantMessage,
    });

    return assistantMessage;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate response";
    await ctx.runMutation(internal.aiChats.finalizeGeneration, {
      chatId: args.chatId,
      error: errorMessage,
    });
    throw new ConvexError(errorMessage);
  }
}
