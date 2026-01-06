---
title: "How we fixed AI crawlers blocked by Netlify edge functions"
description: "ChatGPT and Perplexity couldn't fetch /raw/*.md files on Netlify. The fix: Content-Type headers. Here's what we tried and what actually worked."
date: "2025-12-14"
slug: "netlify-edge-excludedpath-ai-crawlers"
published: true
tags: ["netlify", "edge-functions", "ai", "troubleshooting"]
readTime: "5 min read"
featured: false
---

## The fix

Add explicit `Content-Type` headers for your raw markdown files in `netlify.toml`:

```toml
[[headers]]
  for = "/raw/*"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600"
```

Thanks to [KP](https://x.com/thisiskp_) for pointing us in the right direction.

## The problem

AI crawlers could not access static markdown files at `/raw/*.md` on Netlify, even with `excludedPath` configured. ChatGPT and Perplexity returned errors. Claude worked.

## What we're building

A markdown blog framework that generates static `.md` files in `public/raw/` during build. Users can share posts with AI tools via a Copy Page dropdown that sends raw markdown URLs.

The goal: AI services fetch `/raw/{slug}.md` and parse clean markdown without HTML.

## The errors

**ChatGPT:**

```
I attempted to load and read the raw markdown at the URL you provided but was unable to fetch the content from that link. The page could not be loaded directly and I cannot access its raw markdown.
```

**Perplexity:**

```
The page could not be loaded with the tools currently available, so its raw markdown content is not accessible.
```

**Claude:**
Works. Loads and reads the markdown successfully.

## Attempted solutions log

### December 24, 2025

**Attempt 1: excludedPath in netlify.toml**

Added array of excluded paths to the edge function declaration:

```toml
[[edge_functions]]
  path = "/*"
  function = "botMeta"
  excludedPath = [
    "/raw/*",
    "/assets/*",
    "/api/*",
    "/.netlify/*",
    "/favicon.ico",
    "/favicon.svg",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/openapi.yaml"
  ]
```

Result: ChatGPT and Perplexity still blocked.

**Attempt 2: Hard bypass in botMeta.ts**

Added early return at top of handler to guarantee static markdown is never intercepted:

```typescript
const url = new URL(request.url);
if (
  url.pathname.startsWith("/raw/") ||
  url.pathname.startsWith("/assets/") ||
  url.pathname.startsWith("/api/") ||
  url.pathname.startsWith("/.netlify/") ||
  url.pathname.endsWith(".md")
) {
  return context.next();
}
```

Result: ChatGPT and Perplexity still blocked.

**Attempt 3: AI crawler whitelist**

Added explicit bypass for known AI user agents:

```typescript
const AI_CRAWLERS = [
  "gptbot",
  "chatgpt",
  "chatgpt-user",
  "oai-searchbot",
  "claude-web",
  "claudebot",
  "anthropic",
  "perplexitybot",
];

if (isAICrawler(userAgent)) {
  return context.next();
}
```

Result: ChatGPT and Perplexity still blocked.

**Attempt 4: Netlify Function at /api/raw/:slug**

Created a serverless function to serve markdown files directly:

```javascript
// netlify/functions/raw.js
exports.handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  // Read from dist/raw/${slug}.md or public/raw/${slug}.md
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: markdownContent,
  };
};
```

With redirect rule:

```toml
[[redirects]]
  from = "/api/raw/*"
  to = "/.netlify/functions/raw?slug=:splat"
  status = 200
  force = true
```

Result: Netlify build failures due to function bundling issues and `package-lock.json` dependency conflicts.

**Attempt 5: Header adjustments**

Removed `Link` header from global scope to prevent header merging on `/raw/*`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    # Link header removed from global scope

[[headers]]
  for = "/index.html"
  [headers.values]
    Link = "</llms.txt>; rel=\"author\""
```

Removed `X-Robots-Tag = "noindex"` from `/raw/*` headers.

Result: ChatGPT and Perplexity still blocked.

### Why these attempts failed

The core issue appears to be how ChatGPT and Perplexity fetch URLs. Their tools receive 400 or 403 responses even when `curl` from the command line works. This suggests:

1. Netlify may handle AI crawler user agents differently at the CDN level
2. The edge function exclusions work for browsers but not for AI fetch tools
3. There may be rate limiting or bot protection enabled by default

## Why Content-Type matters

Without an explicit `Content-Type` header, Netlify serves files based on extension. The `.md` extension gets served as `text/markdown` or similar, which AI fetch tools may reject or misinterpret.

Setting `Content-Type = "text/plain; charset=utf-8"` tells the CDN and AI crawlers exactly what to expect. The `Access-Control-Allow-Origin = "*"` header ensures cross-origin requests work.

## What works now

Users can share content with AI tools via:

1. **Copy page** copies markdown to clipboard
2. **View as Markdown** opens the raw `.md` file in browser
3. **Open in ChatGPT/Claude/Perplexity** sends the URL directly (now working)

## Working features

Despite AI crawler issues, these features work correctly:

- `/raw/*.md` files load in browsers
- `llms.txt` discovery file is accessible
- `openapi.yaml` API spec loads properly
- Sitemap and RSS feeds generate correctly
- Social preview bots (Twitter, Facebook, LinkedIn) receive OG metadata
- Claude's web fetcher can access raw markdown

## Help needed

If you've solved this or have suggestions, open an issue. We've tried:

- netlify.toml excludedPath arrays
- Code-level path checks in edge functions
- AI crawler user agent whitelisting
- Netlify Functions as an alternative endpoint
- Header configuration adjustments

None have worked for ChatGPT or Perplexity. GitHub raw URLs remain the most reliable option for AI consumption, but require additional repository configuration when forking.
