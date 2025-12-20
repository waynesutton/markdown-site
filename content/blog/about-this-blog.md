---
title: "About This Markdown Site"
description: "How this open source site works with Convex for real-time sync and Netlify for deployment."
date: "2025-01-16"
slug: "about-this-blog"
published: true
tags: ["convex", "netlify", "open-source", "markdown"]
readTime: "4 min read"
featured: false
featuredOrder: 3
excerpt: "Learn how this open source site works with real-time sync and instant updates."
---

# About This Markdown Site

An open-source markdown sync site for developers and AI agents. Publish from the terminal with `npm run sync`. Write locally, sync instantly with real-time updates. Powered by Convex and Netlify.

## How It Works

The architecture is straightforward:

1. **Markdown files** live in `content/blog/`
2. **Convex** stores posts in a real-time database
3. **React** renders the frontend
4. **Netlify** handles deployment and edge functions

When you add a new markdown file and run the sync script, your post appears instantly. No rebuild required.

## The Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React + TypeScript        |
| Backend  | Convex                    |
| Styling  | CSS (no framework)        |
| Hosting  | Netlify                   |
| Content  | Markdown with frontmatter |

## Why Convex?

Convex provides real-time sync out of the box. When you update a post, every connected browser sees the change immediately.

```typescript
// Fetching posts is one line
const posts = useQuery(api.posts.getAllPosts);
```

No REST endpoints. No cache invalidation. No WebSocket setup. The data stays in sync automatically.

## Why Markdown?

Markdown files in your repo are simpler than a CMS:

- Version controlled in git (commit, diff, roll back)
- Edit with any text editor
- AI agents can create and modify posts
- No separate login or admin panel

## Features

This site includes:

- **Real-time updates** via Convex subscriptions
- **Static pages** for About, Projects, Contact (optional)
- **RSS feeds** at `/rss.xml` and `/rss-full.xml`
- **Sitemap** at `/sitemap.xml`
- **JSON API** at `/api/posts` and `/api/post?slug=xxx`
- **Theme switching** between dark, light, tan, and cloud
- **SEO optimization** with meta tags and structured data
- **AI discovery** via `llms.txt`

## Fork and Deploy

The setup takes about 10 minutes:

1. Fork the repo
2. Run `npx convex dev` to set up your backend
3. Run `npm run sync` to upload posts (development) or `npm run sync:prod` (production)
4. Deploy to Netlify

**Development vs Production:** Use `npm run sync` when testing locally against your dev Convex deployment. Use `npm run sync:prod` when deploying content to your live production site.

**Import external content:** Run `npm run import <url>` to scrape and create local markdown drafts. Then sync to dev or prod. There is no separate import command for production because import creates local files only.

Read the [setup guide](/setup-guide) for detailed steps.

## Customization

Edit `src/pages/Home.tsx` to change:

- Site name and description
- Featured posts
- Footer links

Edit `src/styles/global.css` to change:

- Colors and typography
- Theme variables
- Layout spacing

## Links

- [Convex Documentation](https://docs.convex.dev)
- [Netlify Documentation](https://docs.netlify.com)
- [Setup Guide](/setup-guide)
