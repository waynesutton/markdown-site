# Documentation

---
Type: page
Date: 2026-04-27
---

## Getting started

Reference documentation for setting up, customizing, and deploying this markdown framework.

**How publishing works:** Write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so connected browsers update automatically.

**Sync commands:**

Sync command scripts are located in `scripts/` (sync-posts.ts, sync-discovery-files.ts).

**Development:**

- <span class="copy-command">npm run sync</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery</span> - Update AGENTS.md, CLAUDE.md, llms.txt (includes wiki pages, copies AGENTS.md to public/)
- <span class="copy-command">npm run sync:wiki</span> - Sync wiki from content/blog and content/pages
- <span class="copy-command">npm run sync:all</span> - Sync content + wiki + discovery files together

**Production:**

- <span class="copy-command">npm run sync:prod</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery:prod</span> - Update discovery files
- <span class="copy-command">npm run sync:wiki:prod</span> - Sync wiki to production
- <span class="copy-command">npm run sync:all:prod</span> - Sync content + wiki + discovery files together
- <span class="copy-command">npm run deploy</span> - Build and upload static assets with the <a href="https://www.convex.dev/components/static-hosting" target="_blank" rel="noopener noreferrer">Convex Static Hosting component</a>

**Knowledge base sync:**

- <span class="copy-command">npm run sync:wiki -- --kb=&lt;id&gt;</span> - Sync wiki into a specific knowledge base

**Export dashboard content:**

- <span class="copy-command">npm run export:db</span> - Export dashboard posts/pages to content folders (development)
- <span class="copy-command">npm run export:db:prod</span> - Export dashboard posts/pages (production)

## Quick start

```bash
git clone https://github.com/waynesutton/markdown-site.git
cd markdown-site
npm install
npx convex dev
npm run sync          # development
npm run sync:prod     # production
npm run dev
```

Open `http://localhost:5173` to view locally.

Default production hosting uses the <a href="https://www.convex.dev/components/static-hosting" target="_blank" rel="noopener noreferrer">Convex Static Hosting component</a>. Markdown content syncs with `npm run sync:prod`. Source code, styles, images in `public/`, and static assets deploy with `npm run deploy`.

## Requirements

- Node.js 18+
- Convex account (free at convex.dev)
- Netlify account (optional, only for legacy Netlify hosting mode)

## Project structure

```
markdown-site/
├── content/
│   ├── blog/           # Blog posts (.md)
│   └── pages/          # Static pages (.md)
├── convex/
│   ├── schema.ts       # Database schema
│   ├── posts.ts        # Post queries/mutations
│   ├── pages.ts        # Page queries/mutations
│   ├── http.ts         # API endpoints
│   ├── rss.ts          # RSS generation
│   ├── wiki.ts         # Wiki pages and sync
│   ├── knowledgeBases.ts # Knowledge base CRUD
│   ├── kbUpload.ts     # KB file upload processing
│   ├── virtualFs.ts    # Virtual filesystem
│   ├── sources.ts      # Source ingest pipeline
│   └── demo.ts         # Anonymous demo mode
├── netlify/            # Legacy hosting support only
│   └── edge-functions/ # Netlify edge functions (legacy mode)
├── src/
│   ├── components/     # React components
│   ├── context/        # Theme context
│   ├── pages/          # Route components
│   └── styles/         # CSS
├── public/
│   ├── images/         # Static images
│   ├── raw/            # Generated raw markdown files
│   ├── robots.txt      # Crawler rules
│   └── llms.txt        # AI discovery
└── netlify.toml        # Netlify deployment config (legacy mode)
```

## Search

Press `Command+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search modal. Click the search icon in the nav or use the keyboard shortcut.

**Features:**

- Real-time results as you type
- Keyboard navigation (arrow keys, Enter, Escape)
- Result snippets with context around matches
- Distinguishes between posts and pages
- Works with all four themes
- Two search modes: [Keyword](/docs-search) (exact match) and [Semantic](/docs-semantic-search) (meaning-based)

Search uses Convex full text search indexes. No configuration needed for keyword search.

**Semantic search configuration:** Requires `OPENAI_API_KEY` in Convex. Can be disabled via `siteConfig.semanticSearch.enabled: false`. See [Semantic Search](/docs-semantic-search) for details.

## Copy Page dropdown

Each post and page includes a share dropdown with options:

| Option               | Description                                |
| -------------------- | ------------------------------------------ |
| Copy page            | Copies formatted markdown to clipboard     |
| Open in ChatGPT      | Opens ChatGPT with raw markdown URL        |
| Open in Claude       | Opens Claude with raw markdown URL         |
| Open in Perplexity   | Opens Perplexity with raw markdown URL     |
| View as Markdown     | Opens raw `.md` file in new tab            |
| Download as SKILL.md | Downloads skill file for AI agent training |

**Raw markdown URLs:** AI service links use GitHub raw URLs to fetch markdown content. This keeps AI link behavior stable across both Convex self-hosting and legacy Netlify hosting modes.

**Git push required for AI links:** The "Open in ChatGPT," "Open in Claude," and "Open in Perplexity" options use GitHub raw URLs. For these to work, you must push your content to GitHub with `git push`. The `npm run sync` command syncs content to Convex for your live site, but AI services fetch directly from GitHub.

| What you want                        | Command needed                                    |
| ------------------------------------ | ------------------------------------------------- |
| Content visible on your site         | `npm run sync` or `sync:prod`                     |
| Discovery files updated              | `npm run sync:discovery` or `sync:discovery:prod` |
| AI links (ChatGPT/Claude/Perplexity) | `git push` to GitHub                              |
| Both content, wiki, and discovery    | `npm run sync:all` or `sync:all:prod`             |
| Wiki only                            | `npm run sync:wiki` or `sync:wiki:prod`           |
| Wiki into a knowledge base           | `npm run sync:wiki -- --kb=<id>`                  |

**Download as SKILL.md:** Downloads the content formatted as an Anthropic Agent Skills file with metadata, triggers, and instructions sections.

## Homepage post limit

Limit the number of posts shown on the homepage. Configure in `src/config/siteConfig.ts`:

```typescript
postsDisplay: {
  showOnHome: true,
  homePostsLimit: 5, // Limit to 5 most recent posts (undefined = show all)
  homePostsReadMore: {
    enabled: true,
    text: "Read more blog posts",
    link: "/blog",
  },
},
```

When posts are limited, an optional "read more" link appears below the list. Only shows when there are more posts than the limit.

## Real-time stats

The `/stats` page displays real-time analytics:

- Active visitors (with per-page breakdown)
- Total page views
- Unique visitors
- Views by page (sorted by count)

All stats update automatically via Convex subscriptions.

**Configuration:** Enable or disable in `src/config/siteConfig.ts`:

```typescript
statsPage: {
  enabled: true,      // Enable /stats route
  showInNav: false,   // Hide from navigation (access via direct URL)
},
```

## Newsletter Admin

The Newsletter Admin page at `/newsletter-admin` provides a UI for managing subscribers and sending newsletters.

**Features:**

- View and search all subscribers (search bar in header)
- Filter by status (all, active, unsubscribed)
- Delete subscribers
- Send blog posts as newsletters
- Write and send custom emails with markdown support
- View recent newsletter sends (last 10, includes both posts and custom emails)
- Email statistics dashboard with:
  - Total emails sent
  - Newsletters sent count
  - Active subscribers
  - Retention rate
  - Detailed summary table

**Configuration:** Enable in `src/config/siteConfig.ts`:

```typescript
newsletterAdmin: {
  enabled: true,      // Enable /newsletter-admin route
  showInNav: false,   // Hide from navigation (access via direct URL)
},
```

**Environment Variables (Convex):**

| Variable                  | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `AGENTMAIL_API_KEY`       | Your AgentMail API key                              |
| `AGENTMAIL_INBOX`         | Your AgentMail inbox (e.g., `inbox@agentmail.to`)   |
| `AGENTMAIL_CONTACT_EMAIL` | Optional contact form recipient (defaults to inbox) |

**Note:** If environment variables are not configured, users will see the error message: "AgentMail Environment Variables are not configured in production. Please set AGENTMAIL_API_KEY and AGENTMAIL_INBOX." when attempting to send newsletters or use contact forms.

**Sending Newsletters:**

The admin UI supports two sending modes:

1. **Send Post**: Select a published blog post to send as a newsletter
2. **Write Email**: Compose a custom email with markdown formatting

Custom emails support markdown syntax:

- `# Heading` for headers
- `**bold**` and `*italic*` for emphasis
- `[link text](url)` for links
- `- item` for bullet lists

**CLI Commands:**

You can send newsletters via command line:

```bash
# Send a blog post to all subscribers
npm run newsletter:send <post-slug>

# Send weekly stats summary to your inbox
npm run newsletter:send:stats
```

Example:

```bash
npm run newsletter:send setup-guide
```

The `newsletter:send` command calls the `scheduleSendPostNewsletter` mutation directly and sends emails in the background. Check the Newsletter Admin page or recent sends to see results.

## API endpoints

All public endpoints are rate limited via `@convex-dev/rate-limiter`. Exceeding limits returns HTTP 429 with a `Retry-After` header.

| Endpoint                       | Description                 | Rate limit |
| ------------------------------ | --------------------------- | ---------- |
| `/stats`                       | Real-time analytics         |            |
| `/newsletter-admin`            | Newsletter management UI    |            |
| `/rss.xml`                     | RSS feed (descriptions)     | 30/min     |
| `/rss-full.xml`                | RSS feed (full content)     | 20/min     |
| `/sitemap.xml`                 | XML sitemap                 | 10/min     |
| `/api/posts`                   | JSON post list              | 60/min     |
| `/api/post?slug=xxx`           | Single post (JSON)          | 60/min     |
| `/api/post?slug=xxx&format=md` | Single post (markdown)      | 60/min     |
| `/api/export`                  | All posts with full content | 10/min     |
| `/raw/{slug}.md`               | Static raw markdown file    | 60/min     |
| `/vfs/tree`                    | Virtual filesystem tree     | 30/min     |
| `/vfs/exec`                    | VFS command execution       | 30/min     |
| `/api/kb`                      | List public knowledge bases | 30/min     |
| `/api/kb/pages?slug=xxx`       | Pages in a knowledge base   | 30/min     |
| `/api/kb/page?kb=xxx&slug=yyy` | Single KB page content      | 30/min     |
| `/ask-ai-stream`               | AI Q&A streaming            | 10/min/user|
| `/.well-known/ai-plugin.json`  | AI plugin manifest          |            |
| `/openapi.yaml`                | OpenAPI 3.0 specification   |            |
| `/llms.txt`                    | AI agent discovery          |            |

## MCP Server

The site includes an HTTP-based Model Context Protocol (MCP) server for AI tool integration. It allows AI assistants like Cursor and Claude Desktop to access blog content programmatically.

**Endpoint:** `https://www.markdown.fast/mcp`

**Features:**

- 24/7 availability via Convex HTTP endpoints by default
- Public access with rate limiting (50 req/min per IP)
- Optional API key for higher limits (1000 req/min)
- Read-only access to content

**Available tools:**

| Tool             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `list_posts`     | Get all published blog posts with metadata       |
| `get_post`       | Get a single post by slug with full content      |
| `list_pages`     | Get all published pages                          |
| `get_page`       | Get a single page by slug with full content      |
| `get_homepage`   | Get homepage data with featured and recent posts |
| `search_content` | Full text search across posts and pages          |
| `export_all`     | Batch export all content                         |

**Cursor configuration:**

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp"
    }
  }
}
```

**For forks:** The MCP server connects to your Convex deployment. In default Convex self-hosted mode, deploy with `npm run deploy`. In legacy Netlify mode, ensure `VITE_CONVEX_URL` is set in Netlify. Optionally set `MCP_API_KEY` for authenticated access with higher rate limits.

See [How to Use the MCP Server](/how-to-use-mcp-server) for full documentation.

## Wiki and knowledge bases

The `/wiki` page displays a searchable, interlinked wiki compiled from your site content. Run `npm run sync:wiki` to build it from `content/blog/` and `content/pages/`.

**Features:**

- Categorized sidebar navigation with page counts
- Full-text search across wiki pages
- Interactive knowledge graph showing how pages connect
- "On This Page" table of contents for long articles
- Backlink tracking between wiki pages

**Knowledge bases:** Create separate wikis for different projects. Upload markdown files or Obsidian vaults from the dashboard, or sync from the CLI with `npm run sync:wiki -- --kb=<id>`.

Each knowledge base has:

- Public or private visibility
- Per-KB API access (public, private, or off) at `/api/kb`, `/api/kb/pages`, `/api/kb/page`
- Its own knowledge graph visualization
- Independent search scoping

Manage knowledge bases from the Dashboard under Knowledge > Knowledge Bases.

**Accessing wiki data:**

There are two ways to read wiki content, and they have different auth requirements:

| Method | Auth required | Best for |
| --- | --- | --- |
| Convex client queries (`api.wiki.*`) | Yes, logged-in user | React frontend, dashboard UI |
| VFS HTTP endpoints (`/vfs/exec`) | No | External agents, scripts, CLI tools |

The Convex queries (`listWikiPages`, `getWikiPageBySlug`, `getWikiIndex`, `searchWikiPages`, `getGraphData`) all check `ctx.auth.getUserIdentity()` and require an authenticated session. Use these from the React app with `useQuery`.

For unauthenticated access, use the virtual filesystem. Wiki pages live under the `/wiki` directory:

```bash
# List all wiki pages
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /wiki"}'

# Read a specific wiki page
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "cat /wiki/convex.md"}'

# Search wiki content
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "grep authentication /wiki"}'
```

Knowledge bases with API access enabled also have dedicated public endpoints at `/api/kb`, `/api/kb/pages`, and `/api/kb/page`.

## Virtual filesystem

The virtual filesystem exposes all site content through a shell-like HTTP interface. AI agents and CLI tools can browse posts, pages, sources, and wiki content as if navigating a directory tree.

**Endpoints:**

| Route | Method | Description |
| --- | --- | --- |
| `/vfs/tree` | GET | Full directory tree of all content |
| `/vfs/exec` | POST | Execute commands: `ls`, `cat`, `grep`, `find`, `tree`, `pwd`, `cd`, `head`, `wc` |

**Example:**

```bash
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /blog"}'
```

The VFS reads from the same Convex database as the live site. No extra sync step needed. VFS endpoints are rate limited to 30 requests per minute.

## Anonymous demo mode

Visitors can explore the dashboard at `/dashboard` without signing in. Demo mode provides full read access to all dashboard features and lets users create temporary content.

- Demo posts and pages are tagged with `source: "demo"`
- Content is sanitized (scripts, iframes, event handlers stripped)
- A cron job runs every 30 minutes to clean up all demo content
- Upgrade to full admin by signing in with GitHub

## Raw markdown files

When you run `npm run sync` (development) or `npm run sync:prod` (production), static `.md` files are generated in `public/raw/` for each published post and page. Use `npm run sync:all` or `npm run sync:all:prod` to sync content, wiki, and discovery files together.

**Access pattern:** `/raw/{slug}.md`

**Examples:**

- `/raw/setup-guide.md`
- `/raw/about.md`

These files include a metadata header with type, date, reading time, and tags. Access via the "View as Markdown" option in the Copy Page dropdown.

## Markdown formatting

For complete markdown syntax examples including tables, collapsible sections, code blocks, lists, links, images, and all formatting options, see [Writing Markdown with Code Examples](/markdown-with-code-examples).

**Quick reference:**

- **Tables:** Render with GitHub-style formatting, clean borders, mobile responsive
- **Collapsible sections:** Use HTML `<details>` and `<summary>` tags for expandable content
- **Code blocks:** Support syntax highlighting for TypeScript, JavaScript, bash, JSON, and more
- **Images:** Place in `public/images/` and reference with absolute paths

All markdown features work with all four themes and are styled to match the site design.

## Import external content

Use Firecrawl to import articles from external URLs. See [How to Use Firecrawl](/how-to-use-firecrawl) for detailed setup instructions.

```bash
npm run import https://example.com/article
```

**Quick setup:**

1. Get an API key from firecrawl.dev
2. Add `FIRECRAWL_API_KEY=fc-xxx` to `.env.local`

The import command creates local markdown files only. It does not interact with Convex directly.

**After importing:**

- `npm run sync` to push to development
- `npm run sync:prod` to push to production
- Use `npm run sync:wiki` or `npm run sync:wiki:prod` for wiki
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content, wiki, and discovery files together

There is no `npm run import:prod` because import creates local files and sync handles the target environment.

Imported posts are drafts (`published: false`). Review, edit, set `published: true`, then sync.