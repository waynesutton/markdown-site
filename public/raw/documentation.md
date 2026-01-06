# Documentation

---
Type: page
Date: 2026-01-06
---

## Getting started

Reference documentation for setting up, customizing, and deploying this markdown framework.

**How publishing works:** Write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so connected browsers update automatically.

**Sync commands:**

**Development:**

- <span class="copy-command">npm run sync</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery</span> - Update discovery files (AGENTS.md, llms.txt)
- <span class="copy-command">npm run sync:all</span> - Sync content + discovery files together

**Production:**

- <span class="copy-command">npm run sync:prod</span> - Sync markdown content
- <span class="copy-command">npm run sync:discovery:prod</span> - Update discovery files
- <span class="copy-command">npm run sync:all:prod</span> - Sync content + discovery files together

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

## Requirements

- Node.js 18+
- Convex account (free at convex.dev)
- Netlify account (free at netlify.com)

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
│   └── rss.ts          # RSS generation
├── netlify/
│   └── edge-functions/ # Netlify edge functions
│       ├── rss.ts      # RSS proxy
│       ├── sitemap.ts  # Sitemap proxy
│       ├── api.ts      # API proxy
│       └── botMeta.ts  # OG crawler detection
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
└── netlify.toml        # Deployment config
```

## Search

Press `Command+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search modal. Click the search icon in the nav or use the keyboard shortcut.

**Features:**

- Real-time results as you type
- Keyboard navigation (arrow keys, Enter, Escape)
- Result snippets with context around matches
- Distinguishes between posts and pages
- Works with all four themes

Search uses Convex full text search indexes. No configuration needed.

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

**Raw markdown URLs:** AI service links use GitHub raw URLs to fetch markdown content. This bypasses Netlify edge functions and provides reliable access for AI services.

**Git push required for AI links:** The "Open in ChatGPT," "Open in Claude," and "Open in Perplexity" options use GitHub raw URLs. For these to work, you must push your content to GitHub with `git push`. The `npm run sync` command syncs content to Convex for your live site, but AI services fetch directly from GitHub.

| What you want                        | Command needed                                    |
| ------------------------------------ | ------------------------------------------------- |
| Content visible on your site         | `npm run sync` or `sync:prod`                     |
| Discovery files updated              | `npm run sync:discovery` or `sync:discovery:prod` |
| AI links (ChatGPT/Claude/Perplexity) | `git push` to GitHub                              |
| Both content and discovery           | `npm run sync:all` or `sync:all:prod`             |

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

| Endpoint                       | Description                 |
| ------------------------------ | --------------------------- |
| `/stats`                       | Real-time analytics         |
| `/newsletter-admin`            | Newsletter management UI    |
| `/rss.xml`                     | RSS feed (descriptions)     |
| `/rss-full.xml`                | RSS feed (full content)     |
| `/sitemap.xml`                 | XML sitemap                 |
| `/api/posts`                   | JSON post list              |
| `/api/post?slug=xxx`           | Single post (JSON)          |
| `/api/post?slug=xxx&format=md` | Single post (markdown)      |
| `/api/export`                  | All posts with full content |
| `/raw/{slug}.md`               | Static raw markdown file    |
| `/.well-known/ai-plugin.json`  | AI plugin manifest          |
| `/openapi.yaml`                | OpenAPI 3.0 specification   |
| `/llms.txt`                    | AI agent discovery          |

## MCP Server

The site includes an HTTP-based Model Context Protocol (MCP) server for AI tool integration. It allows AI assistants like Cursor and Claude Desktop to access blog content programmatically.

**Endpoint:** `https://www.markdown.fast/mcp`

**Features:**

- 24/7 availability via Netlify Edge Functions
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

**For forks:** The MCP server automatically connects to your Convex deployment. Ensure `VITE_CONVEX_URL` is set in Netlify. Optionally set `MCP_API_KEY` for authenticated access with higher rate limits.

See [How to Use the MCP Server](/how-to-use-mcp-server) for full documentation.

## Raw markdown files

When you run `npm run sync` (development) or `npm run sync:prod` (production), static `.md` files are generated in `public/raw/` for each published post and page. Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together.

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
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together

There is no `npm run import:prod` because import creates local files and sync handles the target environment.

Imported posts are drafts (`published: false`). Review, edit, set `published: true`, then sync.