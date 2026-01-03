# AGENTS.md

Instructions for AI coding agents working on this codebase.

## Project overview

Your content is instantly available to browsers, LLMs, and AI agents.. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.

**Key features:**
- Markdown posts with frontmatter
- Four themes (dark, light, tan, cloud)
- Full text search with Command+K
- Real-time analytics at `/stats`
- RSS feeds and sitemap for SEO
- API endpoints for AI/LLM access

## Current Status

- **Site Name**: markdown 
- **Site Title**: markdown sync framework
- **Site URL**: https://yoursite.example.com
- **Total Posts**: 17
- **Total Pages**: 0
- **Latest Post**: 2025-12-29
- **Last Updated**: 2026-01-03T18:25:46.581Z

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Convex (real-time serverless database) |
| Styling | CSS variables, no preprocessor |
| Hosting | Netlify with edge functions |
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
npm run import <url>           # Import external URL as markdown post
```

Content syncs instantly. No rebuild needed for markdown changes.

## Build and deploy

```bash
npm run build                  # Build for production
npx convex deploy              # Deploy Convex functions to production
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
│   ├── http.ts            # HTTP endpoints (sitemap, API)
│   ├── rss.ts             # RSS feed generation
│   └── crons.ts           # Scheduled cleanup jobs
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
```

## HTTP endpoints

| Route | Description |
|-------|-------------|
| /rss.xml | RSS feed with descriptions |
| /rss-full.xml | Full content RSS for LLMs |
| /sitemap.xml | Dynamic XML sitemap |
| /api/posts | JSON list of all posts |
| /api/post?slug=xxx | Single post JSON or markdown |
| /api/export | Batch export all posts with content |
| /stats | Real-time analytics page |
| /.well-known/ai-plugin.json | AI plugin manifest |
| /openapi.yaml | OpenAPI 3.0 specification |
| /llms.txt | AI agent discovery |

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

- Escape HTML in all HTTP endpoint outputs using `escapeHtml()`
- Escape XML in RSS feeds using `escapeXml()` or CDATA
- Use indexed queries, never scan full tables
- External links must use `rel="noopener noreferrer"`
- No console statements in production code
- Validate frontmatter before syncing content

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

