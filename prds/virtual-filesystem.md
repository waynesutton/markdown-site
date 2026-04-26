# Virtual filesystem and LLM wiki

## Problem

AI agents interacting with the site can only use JSON API endpoints or raw markdown URLs. There is no way for an agent to explore content with familiar shell commands (ls, cat, grep, find). There is also no mechanism to ingest external sources or compile accumulated knowledge into a persistent, interlinked wiki.

## Proposed solution

Three additive phases that do not modify existing features:

### Phase 1: Virtual filesystem endpoint

Add `/fs/exec` HTTP POST and `/fs/tree` GET endpoints in `convex/http.ts`. A new `convex/virtualFs.ts` file provides:

- `buildPathTree` internal query: reads posts/pages by published index, returns a path tree mapping directories to children.
- `readFile` internal query: given a path like `/blog/setup-guide.md`, resolves slug via `posts.by_slug` or `pages.by_slug`, returns full markdown.
- `grepCoarse` internal query: translates a search pattern into a Convex `searchIndex("search_content")` query as a coarse filter, then does in-memory regex for fine filtering.
- Command dispatcher: parses ls, cat, grep, find, cd, pwd, tree commands and routes to the correct query.

Virtual directory structure:
```
/
  blog/{slug}.md       (24 posts)
  pages/{slug}.md      (17 pages)
  docs/{slug}.md       (docs section items)
  sources/{slug}.md    (Phase 2)
  wiki/{slug}.md       (Phase 3)
  index.md             (auto-generated TOC)
```

Grep optimization: `searchIndex("search_content")` acts as coarse filter (same role as Chroma in Mintlify's ChromaFs). Fine filtering uses in-memory regex on matched content.

### Phase 2: Source ingest pipeline

New `sources` table in `convex/schema.ts` with slug, url, title, content, sourceType, summary, tags, processed, embedding, and search/vector indexes.

- `convex/sources.ts`: public `ingestSource` mutation (queued job pattern), queries for listing, internal queries for virtualFs and wiki compiler.
- `convex/sourceActions.ts`: internal action that scrapes via Firecrawl (reuses existing dependency), generates embedding via OpenAI, updates source record.
- VirtualFs extended to serve `/sources/` directory.

### Phase 3: Wiki compilation (Convex-native)

New tables: `wikiPages` (slug, title, content, pageType, category, backlinks, sourceSlugs, embedding), `wikiIndex` (key/content pairs for index.md and log.md), `wikiCompilationJobs` (queued job status).

- `convex/wiki.ts`: CRUD for wiki pages, index management, internal queries.
- `convex/wikiCompiler.ts` (use node): LLM reads all content, identifies concepts/entities/connections, creates/updates wiki pages, regenerates index, appends to log. Also includes `lintWiki` for health checks.
- `convex/wikiJobs.ts`: queued job pattern for compilation and lint.
- Cron in `convex/crons.ts` for periodic compilation.
- VirtualFs extended to serve `/wiki/` directory.

Wiki pages are public reads (same as posts/pages). Admin-only: compile, lint, delete.

## Files to create

| File | Phase | Purpose |
|------|-------|---------|
| `convex/virtualFs.ts` | 1 | Path tree, file reader, grep optimizer |
| `convex/sources.ts` | 2 | Source ingest mutations and queries |
| `convex/sourceActions.ts` | 2 | Firecrawl scraper + embedding worker |
| `convex/wiki.ts` | 3 | Wiki page CRUD and index management |
| `convex/wikiCompiler.ts` | 3 | LLM compilation pipeline + lint |
| `convex/wikiJobs.ts` | 3 | Queued job pattern for compilation |
| `content/pages/wiki-resources.md` | 1 | Resource page with reference links |

## Files to modify

| File | Phase | Changes |
|------|-------|---------|
| `convex/schema.ts` | 2+3 | Add sources, wikiPages, wikiIndex, wikiCompilationJobs tables |
| `convex/http.ts` | 1 | Add /fs/exec, /fs/tree routes |
| `convex/crons.ts` | 3 | Add wiki compilation cron |

## Edge cases

- Empty content: `cat` on a non-existent path returns 404-style error in stdout.
- Grep with no matches: returns empty stdout with exitCode 1.
- Large result sets: grep and find results capped with `.take(100)`.
- Wiki compilation with no OPENAI_API_KEY or ANTHROPIC_API_KEY: early return with error in job record.
- Source ingest without FIRECRAWL_API_KEY: only raw content paste works, URL scraping returns error.
- Concurrent compilations: `requestCompilation` checks for running jobs and returns early if one exists.

## Convex-doctor compliance

- All functions get `args` + `returns` validators
- All queries use `.withIndex()` never `.filter()`
- Public endpoints include non-blocking `ctx.auth.getUserIdentity()` calls
- Queued job pattern for all background work
- Internal functions for server-to-server calls
- Results bounded with `.take(n)`
- New tables get proper indexes with `by_` prefix naming

## Verification

- `npx convex codegen` passes
- `npm run build` succeeds
- `npx convex-doctor@latest` maintains 100/100
- Existing features unaffected (search, dashboard, RSS, stats, AI chat)
