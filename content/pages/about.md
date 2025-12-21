---
title: "About"
slug: "about"
published: true
order: 2
excerpt: "An open-source publishing framework for AI agents and developers."
---

An open-source publishing framework for AI agents and developers. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.

## What makes it a dev sync system

**File-based content.** All posts and pages live in `content/blog/` and `content/pages/` as markdown files with frontmatter. No database UI. No admin panel. Just files in your repo.

**CLI publishing workflow.** Write markdown locally, then run `npm run sync` (dev) or `npm run sync:prod` (production). Content appears instantly via Convex real-time sync. Images require git commit and push since they are served as static files from Netlify.

**Version controlled.** Markdown source files live in your repo alongside code. Commit changes, review diffs, roll back like any codebase. The sync command pushes content to the database.

```bash
# Edit a post, then commit and sync
git add content/blog/my-post.md
git commit -m "Update intro paragraph"
npm run sync        # dev
npm run sync:prod   # production
```

**No admin interface.** No web UI for creating or editing content. You use your code editor and terminal.

## The real-time twist

[![](/images/logos/convex-wordmark-black.svg)](https://convex.dev)

What separates this from a static site generator is the Convex real-time database. Once you sync content:

- All connected browsers update immediately
- No rebuild or redeploy needed
- Search, stats, and RSS update automatically

It's a hybrid: developer workflow for publishing + real-time delivery like a dynamic CMS.

## The stack

| Layer    | Technology         |
| -------- | ------------------ |
| Frontend | React + TypeScript |
| Backend  | Convex             |
| Styling  | CSS variables      |
| Hosting  | Netlify            |
| Content  | Markdown           |

## Features

- Four theme options (dark, light, tan, cloud)
- Mobile menu with hamburger navigation on smaller screens
- Full text search with Command+K shortcut
- Featured section with list/card view toggle and excerpts
- Logo gallery with clickable links and marquee scroll
- GitHub contributions graph with year navigation
- Dedicated blog page with configurable navigation order
- Real-time analytics at `/stats`
- RSS feeds and sitemap for SEO
- Static raw markdown files at `/raw/{slug}.md`
- API endpoints for AI/LLM access
- Copy to ChatGPT, Claude, and Perplexity sharing
- Generate Skill option for AI agent training
- View as Markdown option in share dropdown
- Markdown writing page at `/write` with frontmatter reference

## Who this is for

- Developers who want version-controlled content
- Teams comfortable with markdown and CLI
- Projects where AI agents generate content programmatically
- Sites that need real-time updates without full rebuilds

Fork it, customize it, ship it.
