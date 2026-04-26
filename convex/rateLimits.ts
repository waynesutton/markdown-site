import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Centralized rate limit definitions across 4 tiers.
// Tier 1: money endpoints (LLM calls, external APIs)
// Tier 2: heavy read endpoints (VFS, export, full RSS)
// Tier 3: public mutations (heartbeat, page views, newsletter)
// Tier 4: standard read endpoints (API, sitemap, KB)

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // -- Tier 1: Money endpoints (cost real dollars per request) --

  // Ask AI streaming: authenticated, calls Claude/OpenAI
  askAiStream: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 3 },

  // Source ingest: Firecrawl scraping + OpenAI embeddings
  sourceIngest: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 2 },

  // Wiki compilation: GPT-4.1 mini with full context window
  wikiCompile: { kind: "fixed window", rate: 3, period: HOUR },

  // Wiki lint: reads all pages but no LLM call
  wikiLint: { kind: "fixed window", rate: 10, period: HOUR },

  // AI image generation: Gemini/Imagen API
  aiImageGen: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 3 },

  // AI chat response: LLM chat completions
  aiChatResponse: { kind: "token bucket", rate: 15, period: MINUTE, capacity: 5 },

  // -- Tier 2: Heavy read endpoints (free but compute-expensive) --

  // VFS command execution: loads all content into memory
  vfsExec: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },

  // VFS directory tree: scans all tables
  vfsTree: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },

  // Batch export: returns all posts with full content
  apiExport: { kind: "fixed window", rate: 10, period: MINUTE },

  // Full-content RSS: serializes all post bodies into XML
  rssFullFeed: { kind: "fixed window", rate: 20, period: MINUTE },

  // -- Tier 3: Public mutations (some dedup but still abusable) --

  // Session heartbeat: already has 45s backend dedup
  heartbeat: { kind: "token bucket", rate: 4, period: MINUTE, capacity: 2 },

  // Page view recording: already has 30min dedup window
  pageView: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },

  // Newsletter subscribe: prevent signup spam
  newsletterSubscribe: { kind: "fixed window", rate: 5, period: MINUTE },

  // -- Tier 4: Standard read endpoints (cheap, cacheable) --

  // JSON post list
  apiPosts: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },

  // Single post JSON/markdown
  apiPost: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },

  // Sitemap generation
  sitemap: { kind: "fixed window", rate: 10, period: MINUTE },

  // Knowledge base API endpoints
  kbApi: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },

  // RSS description-only feed
  rssFeed: { kind: "fixed window", rate: 30, period: MINUTE },

  // Raw markdown file serving
  rawMarkdown: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
});

// Known rate limit names extracted from our config above
type RateLimitName =
  | "askAiStream" | "sourceIngest" | "wikiCompile" | "wikiLint"
  | "aiImageGen" | "aiChatResponse"
  | "vfsExec" | "vfsTree" | "apiExport" | "rssFullFeed"
  | "heartbeat" | "pageView" | "newsletterSubscribe"
  | "apiPosts" | "apiPost" | "sitemap" | "kbApi" | "rssFeed" | "rawMarkdown";

// Internal mutation for rate limiting from HTTP actions.
// HTTP actions cannot call rateLimiter.limit() directly because it needs
// a mutation context. This bridge lets httpActions check rate limits
// via ctx.runMutation().
export const checkHttpRateLimit = internalMutation({
  args: {
    name: v.string(),
    key: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfter: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const result = await rateLimiter.limit(ctx, args.name as RateLimitName, {
      key: args.key,
      count: args.count,
    });
    return {
      ok: result.ok,
      retryAfter: result.retryAfter ?? undefined,
    };
  },
});
