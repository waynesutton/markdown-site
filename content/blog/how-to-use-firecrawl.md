---
title: "How to use Firecrawl with Markdown Sync"
description: "Import external articles as markdown posts using Firecrawl. Get your API key and configure environment variables for local imports and AI chat."
date: "2025-12-26"
slug: "how-to-use-firecrawl"
published: true
featured: true
featuredOrder: 6
image: /images/firecrwall-blog.png
tags: ["tutorial", "firecrawl", "import"]
docsSection: true
docsSectionOrder: 2
docsSectionGroup: "Components"
docsLanding: true
---

# How to use Firecrawl

You found an article you want to republish or reference. Copying content manually takes time. Firecrawl scrapes web pages and converts them to markdown automatically.

## What it is

Firecrawl is a web scraping service that turns any URL into clean markdown. This app uses it in two places: the import script for creating draft posts, and the AI chat feature for fetching page content.

## Who it's for

Developers who want to import external articles without manual copying. If you republish content or need to reference external sources, Firecrawl saves time.

## The problem it solves

Manually copying content from websites is slow. You copy text, fix formatting, add frontmatter, and handle images. Firecrawl does this automatically.

## How it works

The import script scrapes a URL, extracts the title and description, converts HTML to markdown, and creates a draft post in `content/blog/`. The AI chat feature uses Firecrawl to fetch page content when you share URLs in conversations.

## How to try it

**Step 1: Get your API key**

Visit [firecrawl.dev](https://firecrawl.dev) and sign up. Copy your API key. It starts with `fc-`.

**Step 2: Set up local imports**

Add the key to `.env.local` in your project root:

```
FIRECRAWL_API_KEY=fc-your-api-key-here
```

Now you can import articles:

```bash
npm run import https://example.com/article
```

This creates a draft post in `content/blog/`. Review it, set `published: true`, then run `npm run sync`.

**Step 3: Enable AI chat scraping**

If you use the AI chat feature, set the same key in your Convex Dashboard:

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Open Settings > Environment Variables
4. Add `FIRECRAWL_API_KEY` with your key value
5. Deploy: `npx convex deploy`

The AI chat can now fetch content from URLs you share.

That's it. One API key, two places to set it, and you're done.
