# Wiki, knowledge bases, and virtual filesystem

> markdown.fast now compiles your content into a searchable wiki, lets you upload Obsidian vaults as knowledge bases, and exposes everything through a shell-like HTTP API.

---
Type: post
Date: 2026-04-13
Reading time: 5 min read
Tags: convex, wiki, knowledge-bases, virtual-filesystem, features
---

# Wiki, knowledge bases, and virtual filesystem

Three features shipped in the same stretch of work. Each one started as a separate idea. They ended up connected in ways I didn't plan.

The wiki compiles your existing content into interlinked pages. Knowledge bases let you bring in external content. The virtual filesystem makes all of it accessible over HTTP without authentication. Together they turn a markdown publishing framework into something closer to a programmable knowledge layer.

## The LLM wiki

Every post and page you publish feeds into a wiki compilation pipeline. GPT-4.1 mini reads your content, identifies topics, and generates wiki pages with categories, backlinks, and a master index. The compiler runs daily at 4 AM UTC via a Convex cron job. You can also trigger it from the dashboard whenever you want.

The result lives at `/wiki`. Pages are categorized, searchable, and linked to each other through backlinks that the compiler extracts automatically. There's an interactive knowledge graph that shows how everything connects visually.

A lint report catches broken backlinks, pages that are too short (under 50 characters), pages that are too long (over 5,000 characters), and missing titles. It runs in a single Convex mutation so the read and the report write happen atomically.

The sync command builds wiki pages from your local markdown files without the LLM step:

```bash
npm run sync:wiki         # development
npm run sync:wiki:prod    # production
```

The script reads `content/blog/` and `content/pages/`, infers types and categories from frontmatter, extracts `[[backlinks]]` from the content, and upserts everything into the wiki table.

## Knowledge bases

The wiki works great for your own site content. But I kept wanting to bring in external material. Research notes from Obsidian. Documentation from other projects. Reference collections that don't belong as blog posts.

Knowledge bases solve that. Each one is a separate container with its own pages, search index, and knowledge graph. You create them from the dashboard, give them a title and visibility setting, then upload markdown files or entire Obsidian vaults.

The upload pipeline parses frontmatter, extracts titles and categories from folder structure, finds backlinks, and upserts pages into the selected KB. Progress tracking shows you which files have been processed.

Each KB has independent controls:

- **Visibility**: public or private
- **API access**: public, private, or off
- **Dedicated endpoints**: `/api/kb`, `/api/kb/pages`, `/api/kb/page`

The public wiki page at `/wiki` includes a KB switcher so visitors can browse between the site wiki and any public knowledge bases.

You can also sync from the CLI:

```bash
npm run sync:wiki -- --kb=<id>
```

## Virtual filesystem

This is the part that ties everything together for AI agents.

The VFS exposes all site content through two HTTP endpoints. No authentication required. No API keys. Just curl.

```bash
# See the full content tree
curl https://yoursite.example.com/vfs/tree

# List wiki pages
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /wiki"}'

# Read a specific page
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "cat /wiki/convex.md"}'

# Search across everything
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "grep authentication /wiki"}'
```

Supported commands: `ls`, `cat`, `grep`, `find`, `tree`, `head`, `wc`, `pwd`, `cd`.

Directories: `/blog`, `/pages`, `/docs`, `/sources`, `/wiki`.

The VFS reads from the same Convex database as the live site. When you sync content or compile the wiki, the VFS reflects it immediately. No extra step.

This matters because the Convex client queries for wiki data (`listWikiPages`, `getWikiPageBySlug`, `searchWikiPages`) all require authentication. They power the React frontend. But external agents and scripts need unauthenticated access. The VFS provides that. It's the public read layer for everything in the database.

## Anonymous demo mode

One more thing that shipped alongside these features. Visitors can explore the full dashboard at `/dashboard` without signing in. Demo mode gives read access to everything and lets users create temporary posts and pages to test the editing experience.

Demo content is tagged with `source: "demo"` and `demo: true`. A cron job runs every 30 minutes to clean up all temporary content. Sign in with GitHub to upgrade to full admin access.

## What this means for the framework

markdown.fast started as a way to sync markdown files to a real-time database. It still does that. But now it also:

- Compiles your content into a structured wiki with backlinks and categories
- Accepts external knowledge bases from Obsidian vaults or markdown folders
- Exposes everything through a shell-like HTTP interface for agents
- Lets visitors try the dashboard before they fork

The publishing workflow hasn't changed. Write markdown, run sync, content appears. The new features build on top of that foundation.

If you're running a fork, pull the latest and run:

```bash
npm install
npx convex dev --once
npm run sync:all
```

Wiki, knowledge bases, and VFS will be ready.

## Try it

- Browse the wiki at [markdown.fast/wiki](https://www.markdown.fast/wiki)
- Fork the project at [github.com/waynesutton/markdown-site](https://github.com/waynesutton/markdown-site)
- Run `npx create-markdown-sync my-site` to start fresh