# About

---
Type: page
Date: 2026-01-06
---

An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.

## What makes it a dev sync system?

**File-based content.** All posts and pages live in `content/blog/` and `content/pages/` as markdown files with frontmatter. No database UI. No admin panel. Just files in your repo.

**CLI publishing workflow.** Write markdown locally, then run `npm run sync` (dev) or `npm run sync:prod` (production). Content appears instantly via Convex real-time sync. Images require git commit and push since they are served as static files from Netlify.

**Sync commands:**

**Development:**

- <span class="copy-command">npm run sync</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery</span> - Update discovery files (AGENTS.md, llms.txt)
- <span class="copy-command">npm run sync:all</span> - Sync content + discovery files together

**Production:**

- <span class="copy-command">npm run sync:prod</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery:prod</span> - Update discovery files
- <span class="copy-command">npm run sync:all:prod</span> - Sync content + discovery files together

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

<a href="https://convex.dev"><img src="/images/logos/convex-wordmark-black.svg" alt="Convex" width="120" /></a>

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

**Themes and UI:**

- Four theme options (dark, light, tan, cloud)
- Font switcher (serif, sans, monospace) with localStorage persistence
- Mobile menu with hamburger navigation on smaller screens
- Image lightbox for full-screen image viewing when clicked
- Scroll-to-top button with configurable threshold

**Content and navigation:**

- Sidebar layout for docs-style pages with table of contents
- Right sidebar with CopyPageDropdown on wide screens
- Featured section with list/card view toggle and excerpts
- Dedicated blog page with hero cards and featured rows
- Tag pages at `/tags/{tag}` with related posts in footer
- Homepage configuration to use any page or post as homepage

**Search and discovery:**

- Dual search modes: Keyword (exact match) and Semantic (meaning-based) with Cmd+K toggle
- Semantic search uses OpenAI embeddings for finding conceptually similar content
- Full text search with Command+K shortcut and result highlighting
- Static raw markdown files at `/raw/{slug}.md`
- RSS feeds (`/rss.xml` and `/rss-full.xml`) and sitemap for SEO
- API endpoints for AI/LLM access (`/api/posts`, `/api/export`)
- HTTP-based MCP server at `/mcp` for AI tool integration (Cursor, Claude Desktop)

**Sharing and AI integration:**

- Copy to ChatGPT, Claude, and Perplexity sharing buttons
- Generate Skill option for AI agent training
- View as Markdown option in share dropdown

**Content creation:**

- Markdown writing page at `/write` with frontmatter reference
- AI Agent chat powered by Anthropic Claude (toggle in Write page or right sidebar)
- Firecrawl content importer (`npm run import <url>`) for external articles

**Dashboard and admin:**

- Dashboard at `/dashboard` for content management and site configuration
- Posts and pages editor with live preview and frontmatter sidebar
- Sync commands UI for executing syncs from browser
- Newsletter management with AgentMail integration and admin UI
- Real-time analytics at `/stats` with visitor map

**Newsletter and contact:**

- Newsletter signup forms on homepage, blog page, and posts
- Contact forms on pages/posts via frontmatter with AgentMail delivery
- Email notifications for new subscribers and weekly stats

**Developer and AI agent support:**

- CLAUDE.md for Claude Code instructions and workflows
- AGENTS.md for AI coding agent context (agents.md spec)
- Skills files in `.claude/skills/` (frontmatter, convex, sync)
- Sync discovery commands to update AGENTS.md, CLAUDE.md, and llms.txt
- Optional WorkOS authentication for dashboard access
- GitHub contributions graph with year navigation
- Logo gallery with clickable links and static grid or marquee scroll

## Who this is for

- Developers who want version-controlled content
- Teams comfortable with markdown and CLI
- Projects where AI agents generate content programmatically
- Sites that need real-time updates without full rebuilds

## Fork configuration

After forking, configure your site with a single command:

```bash
cp fork-config.json.example fork-config.json
# Edit fork-config.json
npm run configure
```

Or follow the manual guide in `FORK_CONFIG.md`. Both options update all 11 configuration files with your site information.

Fork it, customize it, ship it.