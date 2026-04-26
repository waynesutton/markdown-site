# Homepage

Ship **[docs](/docs)**, **[blogs](/blog)**, **[wikis](/wiki)**, **[slides](/slide-template-example)**, and **[knowledge bases](/docs#wiki-and-knowledge-bases)** from markdown. Always in sync.

Open-source publishing framework for developers and AI agents. Write content, run sync, every browser updates instantly.

**[Fork it](https://github.com/waynesutton/markdown-site)** or [npm](https://www.npmjs.com/package/create-markdown-sync) **<span class="copy-command">npx create-markdown-sync my-site</span>**, customize it, ship it.

## Features

**AI agent integration** — API endpoints, raw markdown files, skills.md and MCP server included.

**File-based publishing** — Write markdown locally, content syncs everywhere with version control.

**LLM wiki and knowledge bases** — Build searchable wikis from your content. Upload Obsidian vaults or markdown folders as knowledge base projects with per-KB API access.

**Knowledge graph** — Interactive visualization of how your wiki pages and knowledge bases connect.

**Virtual filesystem** — Shell-like HTTP interface for ls, cat, grep, tree across all site content.

**URL content import** — Import urls to scrape any webpage into markdown with Firecrawl.

**Newsletter automation** — Built-in subscription forms and admin dashboard powered by AgentMail.

**Markdown slides** — Add `slides: true` to frontmatter. Present any post as a fullscreen slide deck with keyboard navigation.

**Multiple output formats** — JSON via API endpoints, raw .md files, and RSS feeds.

**Real-time team sync** — Multiple developers run npm run sync from different machines.

**Sync commands** — Sync content, wiki, and discovery files with one command. Update AGENTS.md, CLAUDE.md, and llms.txt with wiki knowledge base pages.

**Semantic search** — Find content by meaning, not just keywords.

**Ask AI** — Chat with your site content. Get answers with sources.

**Admin dashboard** — Full content management with live preview, analytics, config editor, sync buttons, and knowledge base management.

**Anonymous demo mode** Visitors can explore the dashboard without signing in. Demo content resets every 30 minutes.

---

## Blog Posts (25)

- **[Markdown slides](/raw/markdown-slides.md)** - Turn any markdown post or page into a fullscreen slide presentation with one frontmatter field
  - Date: 2026-04-14 | Reading time: 3 min read | Tags: slides, markdown, features
- **[Slide template example](/raw/slide-template-example.md)** - A working example of markdown slides you can present directly from this page
  - Date: 2026-04-14 | Reading time: 2 min read | Tags: slides, template, markdown
- **[Wiki, knowledge bases, and virtual filesystem](/raw/wiki-knowledge-bases-and-virtual-filesystem.md)** - markdown.fast now compiles your content into a searchable wiki, lets you upload Obsidian vaults as knowledge bases, and exposes everything through a shell-like HTTP API.
  - Date: 2026-04-13 | Reading time: 5 min read | Tags: convex, wiki, knowledge-bases, virtual-filesystem, features
- **[How convex-doctor took markdown.fast from 42 to 100](/raw/convex-doctor-score-42-to-100.md)** - I had the most stars on the convex-doctor benchmark and the worst score. Here's how I fixed 364 findings across 17 passes to reach a perfect 100.
  - Date: 2026-03-20 | Reading time: 7 min read | Tags: convex, developer-tools, code-quality, static-analysis
- **[Convex first: new defaults for markdown.fast](/raw/convex-first-architecture.md)** - Self-hosted static files, built-in auth, and one-command deploys. No external services required.
  - Date: 2026-02-21 | Reading time: 4 min read | Tags: convex, deployment, auth, architecture
- **[OpenCode Integration](/raw/docs-opencode.md)** - This framework includes full OpenCode support with agents, commands, skills, and plugins.
  - Date: 2026-01-10 | Reading time: 4 min read | Tags: opencode, plugins, terminal
- **[How to Use Code Blocks](/raw/how-to-use-code-blocks.md)** - A guide to syntax highlighting, diff rendering, and code formatting in your markdown posts.
  - Date: 2026-01-07 | Reading time: 4 min read | Tags: tutorial, markdown, code, syntax-highlighting
- **[How I added WorkOS to my Convex app with Cursor](/raw/workos-with-convex-cursor.md)** - A timeline of adding WorkOS AuthKit authentication to my markdown blog dashboard using Cursor, prompt engineering, and vibe coding. From PRD import to published feature.
  - Date: 2025-12-30 | Reading time: 8 min read | Tags: cursor, workos, convex, prompt-engineering, ai-coding
- **[How to setup WorkOS with Markdown Sync](/raw/how-to-setup-workos.md)** - Step-by-step guide to configure WorkOS AuthKit authentication for your markdown blog dashboard. WorkOS is optional and can be enabled in siteConfig.ts.
  - Date: 2025-12-29 | Reading time: 10 min read | Tags: workos, authentication, tutorial, dashboard
- **[How to use the Markdown sync dashboard](/raw/how-to-use-the-markdown-sync-dashboard.md)** - Learn how to use the dashboard at /dashboard to manage content, configure your site, and sync markdown files without leaving your browser.
  - Date: 2025-12-29 | Reading time: 8 min read | Tags: dashboard, tutorial, content-management
- **[Team Workflows](/raw/team-workflows-git-version-control.md)** - How teams collaborate on markdown content using git, sync to shared Convex deployments, and automate production syncs with CI/CD.
  - Date: 2025-12-29 | Reading time: 6 min read | Tags: git, convex, ci-cd, collaboration, workflow
- **[How to Use the MCP Server with MarkDown Sync](/raw/how-to-use-mcp-server.md)** - Guide to using the HTTP-based Model Context Protocol(MCP) server at www.markdown.fast/mcp with Cursor and other AI tools
  - Date: 2025-12-28 | Reading time: 5 min read | Tags: mcp, cursor, ai, tutorial, netlify
- **[How to use AgentMail with Markdown Sync](/raw/how-to-use-agentmail.md)** - Complete guide to setting up AgentMail for newsletters and contact forms in your markdown blog
  - Date: 2025-12-27 | Reading time: 6 min read | Tags: agentmail, newsletter, email, setup
- **[How to use Firecrawl with Markdown Sync](/raw/how-to-use-firecrawl.md)** - Import external articles as markdown posts using Firecrawl. Get your API key and configure environment variables for local imports and AI chat.
  - Date: 2025-12-26 | Reading time: 2 min read | Tags: tutorial, firecrawl, import
- **[Happy holidays and thank you](/raw/happy-holidays-2025.md)** - A quick note of thanks for stars, forks, and feedback. More AI-first publishing features coming in 2026.
  - Date: 2025-12-25 | Reading time: 2 min read | Tags: updates, community, ai
- **[Visitor tracking and stats improvements](/raw/visitor-tracking-and-stats-improvements.md)** - Real-time visitor map, write conflict prevention, GitHub Stars integration, and better AI prompts. Updates from v1.18.1 to v1.20.2.
  - Date: 2025-12-21 | Reading time: 5 min read | Tags: features, stats, convex, updates, analytics
- **[Configure your fork in one command](/raw/fork-configuration-guide.md)** - Two options to set up your forked markdown framework: automated JSON config with npm run configure, or step-by-step manual guide.
  - Date: 2025-12-20 | Reading time: 4 min read | Tags: configuration, setup, fork, tutorial
- **[v1.18.0 release: 12 versions of shipping](/raw/raw-markdown-and-copy-improvements.md)** - Everything new from v1.7 to v1.18.0. Automated fork setup, GitHub contributions graph, write page, mobile menu, aggregates, and more.
  - Date: 2025-12-20 | Reading time: 8 min read | Tags: release, features, updates, developer-tools
- **[New features: search, featured section, and logo gallery](/raw/new-features-search-featured-logos.md)** - Three updates that make your markdown framework more useful: Command+K search, frontmatter-controlled featured items, and a scrolling logo gallery.
  - Date: 2025-12-17 | Reading time: 4 min read | Tags: features, search, convex, updates
- **[Git commit message best practices](/raw/git-commit-message-best-practices.md)** - A guide to writing clear, consistent commit messages that help your team understand changes and generate better changelogs.
  - Date: 2025-12-14 | Reading time: 5 min read | Tags: git, development, best-practices, workflow
- **[How to Publish a Blog Post](/raw/how-to-publish.md)** - A quick guide to writing and publishing markdown posts using Cursor after your framework is set up.
  - Date: 2025-12-14 | Reading time: 3 min read | Tags: tutorial, markdown, cursor, IDE, publishing
- **[Writing Markdown with Code Examples](/raw/markdown-with-code-examples.md)** - A complete reference for writing markdown with links, code blocks, images, tables, and formatting. Copy examples directly into your posts.
  - Date: 2025-12-14 | Reading time: 5 min read | Tags: markdown, tutorial, code
- **[How we fixed AI crawlers blocked by Netlify edge functions](/raw/netlify-edge-excludedpath-ai-crawlers.md)** - ChatGPT and Perplexity couldn't fetch /raw/*.md files on Netlify. The fix: Content-Type headers. Here's what we tried and what actually worked.
  - Date: 2025-12-14 | Reading time: 5 min read | Tags: netlify, edge-functions, ai, troubleshooting
- **[Setup Guide](/raw/setup-guide.md)** - Step-by-step guide to fork this markdown sync framework, set up Convex backend, and deploy in under 10 minutes.
  - Date: 2025-12-14 | Reading time: 8 min read | Tags: convex, netlify, tutorial, deployment
- **[Using Images in Blog Posts](/raw/using-images-in-posts.md)** - Learn how to add header images, inline images, and Open Graph images to your markdown posts.
  - Date: 2025-12-14 | Reading time: 4 min read | Tags: images, tutorial, markdown, open-graph

## Pages (18)

- **[Footer](/raw/footer.md)**
- **[Home Intro](/raw/home-intro.md)**
- **[Documentation](/raw/documentation.md)**
- **[Dashboard](/raw/docs-dashboard.md)**
- **[About](/raw/about.md)** - An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs.
- **[Ask AI](/raw/docs-ask-ai.md)**
- **[Content](/raw/docs-content.md)**
- **[Search](/raw/docs-search.md)**
- **[Semantic Search](/raw/docs-semantic-search.md)**
- **[Frontmatter](/raw/docs-frontmatter.md)**
- **[Projects](/raw/projects.md)**
- **[Contact](/raw/contact.md)**
- **[Configuration](/raw/docs-configuration.md)**
- **[Changelog](/raw/changelog.md)**
- **[Deployment](/raw/docs-deployment.md)**
- **[Newsletter](/raw/newsletter.md)**
- **[Wiki resources](/raw/wiki-resources.md)**
- **[Media Upload Setup](/raw/docs-media-setup.md)**

---

**Total Content:** 25 posts, 18 pages

All content is available as raw markdown files at `/raw/{slug}.md`

---

Built with [Convex](https://convex.dev) for real-time sync and deployed with Convex self-hosting by default. Legacy Netlify hosting remains available for compatibility. Read the [project on GitHub](https://github.com/waynesutton/markdown-site) to fork and deploy your own. View [real-time site stats](/stats).

Created by [Wayne](https://x.com/waynesutton) with Convex, Cursor, and Claude. Follow on [Twitter/X](https://x.com/waynesutton), [LinkedIn](https://www.linkedin.com/in/waynesutton/), and [GitHub](https://github.com/waynesutton). This project is licensed under the MIT [License](https://github.com/waynesutton/markdown-site?tab=MIT-1-ov-file).
