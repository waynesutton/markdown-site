# AGENTS.md

Instructions for AI coding agents working on this codebase.

## Project overview

Your content is instantly available to browsers, LLMs, and AI agents.. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.

## Default and legacy modes

- Default auth mode: `convex-auth`
- Default hosting mode: `convex-self-hosted`
- Legacy compatibility mode: `workos` auth + `netlify` hosting

**Key features:**
- Markdown posts with frontmatter
- Four themes (dark, light, tan, cloud)
- Full text search with Command+K
- Semantic search with OpenAI embeddings and Ask AI (Cmd+J)
- Real-time analytics at `/stats`
- RSS feeds and sitemap for SEO
- API endpoints for AI/LLM access
- Virtual filesystem HTTP interface (`/vfs/tree`, `/vfs/exec`) with no auth required
- Source ingest pipeline with Firecrawl scraping and OpenAI embeddings
- LLM wiki compilation with GPT-4.1 mini driven synthesis and daily cron
- Knowledge bases with Obsidian vault uploads, per-KB API access, and visibility controls
- Interactive knowledge graph visualization per wiki and KB
- Anonymous demo mode at `/dashboard` with 30-minute auto-cleanup
- Admin dashboard with content management, config editor, sync buttons, and KB management
- Newsletter automation with AgentMail integration

## Current Status

- **Site Name**: markdown sync
- **Site Title**: markdown sync framework
- **Site URL**: https://yoursite.example.com
- **Total Posts**: 24
- **Total Pages**: 4
- **Wiki Pages**: 43
- **Latest Post**: 2026-04-14
- **Last Updated**: 2026-04-26T22:56:14.178Z

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Convex (real-time serverless database) |
| Styling | CSS variables, no preprocessor |
| Hosting | Convex self-hosting (default) or Netlify (legacy) |
| Auth | @robelest/convex-auth (default) or WorkOS (legacy) |
| Content | Markdown with gray-matter frontmatter |

## Setup commands

```bash
npm install                    # Install dependencies
npx convex dev                 # Initialize Convex (creates .env.local)
npm run dev                    # Start dev server at http://localhost:5173
```

## Content sync commands

```bash
npm run sync                   # Sync markdown to development Convex
npm run sync:prod              # Sync markdown to production Convex
npm run sync:wiki              # Sync wiki from content/blog and content/pages
npm run sync:wiki:prod         # Sync wiki to production
npm run sync:wiki -- --kb=<id> # Sync wiki into a specific knowledge base
npm run sync:all               # Sync content + wiki + discovery (dev)
npm run sync:all:prod          # Sync content + wiki + discovery (prod)
npm run import <url>           # Import external URL as markdown post
```

Content syncs instantly. No rebuild needed for markdown changes.

## Build and deploy

```bash
npm run build                  # Build for production
npx convex deploy              # Deploy Convex functions to production
npm run deploy                 # Deploy with Convex self-hosting
```

**Netlify build command:**
```bash
npm ci --include=dev && npx convex deploy --cmd 'npm run build'
```

## Code style guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Convex validators for all function arguments and returns
- Always return `v.null()` when functions don't return values
- Use CSS variables for theming (no hardcoded colors)
- No emoji in UI or documentation
- No em dashes between words
- Sentence case for headings

## Convex patterns (read this)

### Always use validators

Every Convex function needs argument and return validators:

```typescript
export const myQuery = query({
  args: { slug: v.string() },
  returns: v.union(v.object({...}), v.null()),
  handler: async (ctx, args) => {
    // ...
  },
});
```

### Always use indexes

Never use `.filter()` on queries. Define indexes in schema and use `.withIndex()`:

```typescript
// Good
const post = await ctx.db
  .query("posts")
  .withIndex("by_slug", (q) => q.eq("slug", args.slug))
  .first();

// Bad - causes table scans
const post = await ctx.db
  .query("posts")
  .filter((q) => q.eq(q.field("slug"), args.slug))
  .first();
```

### Make mutations idempotent

Mutations should be safe to call multiple times:

```typescript
export const heartbeat = mutation({
  args: { sessionId: v.string(), currentPath: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("activeSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      // Early return if recently updated with same data
      if (existing.currentPath === args.currentPath && 
          now - existing.lastSeen < 10000) {
        return null;
      }
      await ctx.db.patch(existing._id, { currentPath: args.currentPath, lastSeen: now });
      return null;
    }

    await ctx.db.insert("activeSessions", { ...args, lastSeen: now });
    return null;
  },
});
```

### Patch directly without reading

When you only need to update fields, patch directly:

```typescript
// Good - patch directly
await ctx.db.patch(args.id, { content: args.content });

// Bad - unnecessary read creates conflict window
const doc = await ctx.db.get(args.id);
if (!doc) throw new Error("Not found");
await ctx.db.patch(args.id, { content: args.content });
```

### Use event records for counters

Never increment counters on documents. Use separate event records:

```typescript
// Good - insert event record
await ctx.db.insert("pageViews", { path, sessionId, timestamp: Date.now() });

// Bad - counter updates cause write conflicts
await ctx.db.patch(pageId, { views: page.views + 1 });
```

### Frontend debouncing

Debounce rapid mutations from the frontend. Use refs to prevent duplicate calls:

```typescript
const isHeartbeatPending = useRef(false);
const lastHeartbeatTime = useRef(0);

const sendHeartbeat = useCallback(async (path: string) => {
  if (isHeartbeatPending.current) return;
  if (Date.now() - lastHeartbeatTime.current < 5000) return;
  
  isHeartbeatPending.current = true;
  lastHeartbeatTime.current = Date.now();
  
  try {
    await heartbeatMutation({ sessionId, currentPath: path });
  } finally {
    isHeartbeatPending.current = false;
  }
}, [heartbeatMutation]);
```

## Project structure

```
markdown-blog/
├── content/
│   ├── blog/              # Markdown blog posts
│   └── pages/             # Static pages (About, Docs, etc.)
├── convex/
│   ├── schema.ts          # Database schema with indexes
│   ├── posts.ts           # Post queries and mutations
│   ├── pages.ts           # Page queries and mutations
│   ├── stats.ts           # Analytics (conflict-free patterns)
│   ├── search.ts          # Full text search
│   ├── http.ts            # HTTP endpoints (sitemap, API, VFS)
│   ├── rss.ts             # RSS feed generation
│   ├── crons.ts           # Scheduled cleanup and wiki compilation
│   ├── virtualFs.ts       # Virtual filesystem (shell commands over HTTP)
│   ├── sources.ts         # Source ingest CRUD and queued jobs
│   ├── sourceActions.ts   # Firecrawl scraping + OpenAI embeddings
│   ├── wiki.ts            # Wiki page CRUD, batch upsert, lint
│   ├── wikiCompiler.ts    # LLM wiki compilation action (GPT-4.1 mini)
│   └── wikiJobs.ts        # Wiki compilation queued job pattern
├── netlify/
│   └── edge-functions/    # Proxies for RSS, sitemap, API
├── public/
│   ├── images/            # Static images and logos
│   ├── robots.txt         # Crawler rules
│   └── llms.txt           # AI agent discovery
├── scripts/
│   └── sync-posts.ts      # Markdown to Convex sync
└── src/
    ├── components/        # React components
    ├── context/           # Theme context
    ├── hooks/             # Custom hooks (usePageTracking)
    ├── pages/             # Route components
    └── styles/            # Global CSS with theme variables
```

## Frontmatter fields

### Blog posts (content/blog/)

| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Post title |
| description | Yes | SEO description |
| date | Yes | YYYY-MM-DD format |
| slug | Yes | URL path (unique) |
| published | Yes | true to show |
| tags | Yes | Array of strings |
| featured | No | true for featured section |
| featuredOrder | No | Display order (lower first) |
| excerpt | No | Short text for card view |
| image | No | OG image path |
| authorName | No | Author display name |
| authorImage | No | Round author avatar URL |

### Static pages (content/pages/)

| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Page title |
| slug | Yes | URL path |
| published | Yes | true to show |
| order | No | Nav order (lower first) |
| featured | No | true for featured section |
| featuredOrder | No | Display order (lower first) |
| authorName | No | Author display name |
| authorImage | No | Round author avatar URL |

## Database schema

Key tables and their indexes:

```typescript
posts: defineTable({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.string(),
  date: v.string(),
  published: v.boolean(),
  tags: v.array(v.string()),
  // ... optional fields
})
  .index("by_slug", ["slug"])
  .index("by_published", ["published"])
  .index("by_featured", ["featured"])
  .searchIndex("search_title", { searchField: "title" })
  .searchIndex("search_content", { searchField: "content" })

pages: defineTable({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  published: v.boolean(),
  // ... optional fields
})
  .index("by_slug", ["slug"])
  .index("by_published", ["published"])
  .index("by_featured", ["featured"])

pageViews: defineTable({
  path: v.string(),
  pageType: v.string(),
  sessionId: v.string(),
  timestamp: v.number(),
})
  .index("by_path", ["path"])
  .index("by_timestamp", ["timestamp"])
  .index("by_session_path", ["sessionId", "path"])

activeSessions: defineTable({
  sessionId: v.string(),
  currentPath: v.string(),
  lastSeen: v.number(),
})
  .index("by_sessionId", ["sessionId"])
  .index("by_lastSeen", ["lastSeen"])

sources: defineTable({
  url: v.string(),
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  contentType: v.string(),
  scrapedAt: v.number(),
  processed: v.boolean(),
  embedding: v.optional(v.array(v.float64())),
})
  .index("by_slug", ["slug"])
  .index("by_processed", ["processed"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536 })

wikiPages: defineTable({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  backlinks: v.array(v.string()),
  lastCompiled: v.number(),
  embedding: v.optional(v.array(v.float64())),
})
  .index("by_slug", ["slug"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536 })
  .searchIndex("search_content", { searchField: "content" })
```

## HTTP endpoints

All public HTTP endpoints are rate limited using `@convex-dev/rate-limiter`. Exceeding limits returns HTTP 429 with a `Retry-After` header. Rates are global unless noted.

| Route | Description | Rate limit |
|-------|-------------|------------|
| /rss.xml | RSS feed with descriptions | 30/min |
| /rss-full.xml | Full content RSS for LLMs | 20/min |
| /sitemap.xml | Dynamic XML sitemap | 10/min |
| /api/posts | JSON list of all posts | 60/min |
| /api/post?slug=xxx | Single post JSON or markdown | 60/min |
| /api/export | Batch export all posts with content | 10/min |
| /api/kb | List public knowledge bases | 30/min |
| /api/kb/pages?slug=xxx | Pages in a knowledge base | 30/min |
| /api/kb/page?kb=xxx&slug=yyy | Single KB page content | 30/min |
| /raw/{slug}.md | Raw markdown file | 60/min |
| /stats | Real-time analytics page | (no limit) |
| /ask-ai-stream | AI Q&A streaming | 10/min per user |
| /.well-known/ai-plugin.json | AI plugin manifest | (static) |
| /openapi.yaml | OpenAPI 3.0 specification | (static) |
| /llms.txt | AI agent discovery | (static) |
| /vfs/tree | GET: JSON tree of all content paths | 30/min |
| /vfs/exec | POST: Execute shell commands (ls, cat, grep, find, tree, head, wc, pwd, cd) | 30/min |

## Virtual filesystem

The virtual filesystem exposes all site content via shell-like HTTP endpoints. Agents can browse and search content without direct database access.

```bash
# List content tree
curl https://yoursite.example.com/vfs/tree

# Execute a command
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /blog"}'

# Search content
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "grep convex /blog"}'
```

Supported commands: `ls`, `cat`, `grep`, `find`, `tree`, `head`, `wc`, `pwd`, `cd`

Directories: `/blog`, `/pages`, `/docs`, `/sources`, `/wiki`

Implementation: `convex/virtualFs.ts` with helper functions for path tree, file reading, and grep (uses Convex search indexes for coarse filtering, then regex refinement).

## Source ingest pipeline

External URLs can be ingested as sources with automatic scraping and embedding generation.

**Queued job pattern:**
1. Public mutation `requestIngestSource` inserts a pending job and schedules processing
2. Internal action `scrapeAndProcessSource` uses Firecrawl to scrape the URL to markdown
3. OpenAI `text-embedding-ada-002` generates a 1536-dimension vector embedding
4. Batched mutation stores the source and finalizes the job in one transaction

Tables: `sources` (with `by_slug`, `by_processed`, `by_embedding` indexes), `sourceIngestJobs`

Implementation: `convex/sources.ts`, `convex/sourceActions.ts`

Requires `FIRECRAWL_API_KEY` and `OPENAI_API_KEY` environment variables.

## LLM wiki

An incrementally built, interlinked knowledge base compiled by GPT-4.1 mini from all site content.

**Compilation flow:**
1. Public mutation `requestCompilation` inserts a pending job
2. Combined mutation `markRunningAndGetContext` fetches all posts, pages, sources, and existing wiki pages in one transaction
3. Internal action `compileWiki` sends context to GPT-4.1 mini with structured output instructions
4. Batched mutation `batchUpsertAndRegenerateIndex` upserts all wiki pages, regenerates the master index, and finalizes the job in one transaction

**Linting flow:**
1. Public mutation `requestLint` inserts a pending job
2. Internal action `lintWiki` calls `lintAndStoreReport` which reads all pages, checks backlinks/content length/titles, and stores the report in one transaction

**Cron:** Daily compilation at 4:00 AM UTC via `convex/crons.ts`

Tables: `wikiPages` (with `by_slug`, `by_embedding`, `search_content` indexes), `wikiIndex`, `wikiCompilationJobs`

Implementation: `convex/wiki.ts`, `convex/wikiCompiler.ts`, `convex/wikiJobs.ts`

Requires `OPENAI_API_KEY` environment variable.

**Accessing wiki data:**

The Convex client queries (`api.wiki.listWikiPages`, `getWikiPageBySlug`, `getWikiIndex`, `searchWikiPages`, `getGraphData`) all require authentication. External agents should use the VFS HTTP endpoints instead, which are public and unauthenticated:

```bash
# List wiki pages
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /wiki"}'

# Read a wiki page
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "cat /wiki/convex.md"}'

# Search wiki content
curl -X POST https://yoursite.example.com/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "grep authentication /wiki"}'
```

Knowledge bases with API enabled also have public endpoints at `/api/kb`, `/api/kb/pages`, `/api/kb/page`.


## Wiki knowledge base

43 compiled wiki pages. Access via VFS:

```bash
curl -X POST https://yoursite.example.com/vfs/exec -H "Content-Type: application/json" -d '{"command": "ls /wiki"}'
```

**General:**
- Wiki resources (`/wiki/wiki-wiki-resources`)
- Projects (`/wiki/wiki-projects`)
- Newsletter (`/wiki/wiki-newsletter`)
- Home Intro (`/wiki/wiki-home-intro`)
- Footer (`/wiki/wiki-footer`)
- Documentation (`/wiki/wiki-documentation`)
- Semantic Search (`/wiki/wiki-docs-semantic-search`)
- Search (`/wiki/wiki-docs-search`)
- Media Upload Setup (`/wiki/wiki-docs-media-setup`)
- Frontmatter (`/wiki/wiki-docs-frontmatter`)
- Deployment (`/wiki/wiki-docs-deployment`)
- Dashboard (`/wiki/wiki-docs-dashboard`)
- Content (`/wiki/wiki-docs-content`)
- Configuration (`/wiki/wiki-docs-configuration`)
- Ask AI (`/wiki/wiki-docs-ask-ai`)
- Contact (`/wiki/wiki-contact`)
- Changelog (`/wiki/wiki-changelog`)
- About (`/wiki/wiki-about`)

**Convex:**
- Wiki, knowledge bases, and virtual filesystem (`/wiki/wiki-wiki-knowledge-bases-and-virtual-filesystem`)
- Setup Guide (`/wiki/wiki-setup-guide`)
- Convex first: new defaults for markdown.fast (`/wiki/wiki-convex-first-architecture`)
- How convex-doctor took markdown.fast from 42 to 100 (`/wiki/wiki-convex-doctor-score-42-to-100`)

**Features:**
- Visitor tracking and stats improvements (`/wiki/wiki-visitor-tracking-and-stats-improvements`)
- New features: search, featured section, and logo gallery (`/wiki/wiki-new-features-search-featured-logos`)

**Images:**
- Using Images in Blog Posts (`/wiki/wiki-using-images-in-posts`)

**Git:**
- Team Workflows (`/wiki/wiki-team-workflows-git-version-control`)
- Git commit message best practices (`/wiki/wiki-git-commit-message-best-practices`)

**Slides:**
- Slide template example (`/wiki/wiki-slide-template-example`)
- Markdown slides (`/wiki/wiki-markdown-slides`)

**Release:**
- v1.18.0 release: 12 versions of shipping (`/wiki/wiki-raw-markdown-and-copy-improvements`)

**Netlify:**
- How we fixed AI crawlers blocked by Netlify edge functions (`/wiki/wiki-netlify-edge-excludedpath-ai-crawlers`)

**Markdown:**
- Writing Markdown with Code Examples (`/wiki/wiki-markdown-with-code-examples`)

**Dashboard:**
- How to use the Markdown sync dashboard (`/wiki/wiki-how-to-use-the-markdown-sync-dashboard`)

**Mcp:**
- How to Use the MCP Server with MarkDown Sync (`/wiki/wiki-how-to-use-mcp-server`)

**Tutorial:**
- How to use Firecrawl with Markdown Sync (`/wiki/wiki-how-to-use-firecrawl`)
- How to Use Code Blocks (`/wiki/wiki-how-to-use-code-blocks`)
- How to Publish a Blog Post (`/wiki/wiki-how-to-publish`)

**Agentmail:**
- How to use AgentMail with Markdown Sync (`/wiki/wiki-how-to-use-agentmail`)

**Workos:**
- How to setup WorkOS with Markdown Sync (`/wiki/wiki-how-to-setup-workos`)

**Cursor:**
- How I added WorkOS to my Convex app with Cursor (`/wiki/wiki-workos-with-convex-cursor`)

**Updates:**
- Happy holidays and thank you (`/wiki/wiki-happy-holidays-2025`)

**Configuration:**
- Configure your fork in one command (`/wiki/wiki-fork-configuration-guide`)

**Opencode:**
- OpenCode Integration (`/wiki/wiki-docs-opencode`)

## Content import

Import external URLs as markdown posts using Firecrawl:

```bash
npm run import https://example.com/article
```

Requires `FIRECRAWL_API_KEY` in `.env.local`. Get a key from firecrawl.dev.

## Environment files

| File | Purpose |
|------|---------|
| .env.local | Development Convex URL (auto-created by `npx convex dev`) |
| .env.production.local | Production Convex URL (create manually) |

Both are gitignored.

## Security considerations

- All public HTTP endpoints are rate limited via `@convex-dev/rate-limiter` (see HTTP endpoints table for per-route limits)
- LLM-calling endpoints (Ask AI, wiki compilation, AI chat, image generation) are rate limited per user to prevent cost amplification
- Public mutations (heartbeat, page views, newsletter) have per-session rate limits stacked on top of existing dedup windows
- Escape HTML in all HTTP endpoint outputs using `escapeHtml()`
- Escape XML in RSS feeds using `escapeXml()` or CDATA
- Use indexed queries, never scan full tables
- External links must use `rel="noopener noreferrer"`
- No console statements in production code
- Validate frontmatter before syncing content
- Rate limit definitions live in `convex/rateLimits.ts` with an internal mutation bridge for HTTP actions

## Testing

No automated test suite. Manual testing:

1. Run `npm run sync` after content changes
2. Verify content appears at http://localhost:5173
3. Check Convex dashboard for function errors
4. Test search with Command+K
5. Verify stats page updates in real-time

## Write conflict prevention

This codebase implements specific patterns to avoid Convex write conflicts:

**Backend (convex/stats.ts):**
- 10-second dedup window for heartbeats
- Early return when session was recently updated
- Indexed queries for efficient lookups

**Frontend (src/hooks/usePageTracking.ts):**
- 5-second debounce window using refs
- Pending state tracking prevents overlapping calls
- Path tracking skips redundant heartbeats

See `prds/howtoavoidwriteconflicts.md` for full details.

## Configuration

Site config lives in `src/config/siteConfig.ts`:

```typescript
export default {
  name: "Site Name",
  title: "Tagline",
  logo: "/images/logo.svg",  // null to hide
  blogPage: {
    enabled: true,           // Enable /blog route
    showInNav: true,         // Show in navigation
    title: "Blog",           // Nav link and page title
    order: 0,                // Nav order (lower = first)
  },
  displayOnHomepage: true,   // Show posts on homepage
  featuredViewMode: "list",  // 'list' or 'cards'
  showViewToggle: true,
  logoGallery: {
    enabled: true,
    images: [{ src: "/images/logos/logo.svg", href: "https://..." }],
    position: "above-footer",
    speed: 30,
    title: "Trusted by",
  },
};
```

Theme default in `src/context/ThemeContext.tsx`:

```typescript
const DEFAULT_THEME: Theme = "tan";  // dark, light, tan, cloud
```

## Resources

- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex Write Conflicts](https://docs.convex.dev/error#1)
- [Convex TypeScript](https://docs.convex.dev/understanding/best-practices/typescript)
- [Project README](./README.md)
- [Changelog](./changelog.md)
- [Files Reference](./files.md)

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
