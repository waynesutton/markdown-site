# Wiki resources

---
Type: page
Date: 2026-04-26
---

Reference links for the virtual filesystem and LLM wiki features.

## Inspiration

- [Mintlify ChromaFs](https://x.com/AshleyBlackley3/status/1904260020093952412): Virtual filesystem built on just-bash and ChromaDB for AI agent file browsing
- [Andrej Karpathy LLM Wiki](https://x.com/karpathy/status/1904244802823557308): LLM reads sources, incrementally builds interlinked wiki pages, lints for quality
- [just-bash](https://github.com/nicholasgasior/just-bash): TypeScript reimplementation of bash that ChromaFs uses for command parsing

## Convex documentation

- [Convex best practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex TypeScript](https://docs.convex.dev/understanding/best-practices/typescript)
- [Convex search indexes](https://docs.convex.dev/search/text-search)
- [Convex vector search](https://docs.convex.dev/search/vector-search)
- [Convex HTTP endpoints](https://docs.convex.dev/functions/http-actions)
- [Convex cron jobs](https://docs.convex.dev/scheduling/cron-jobs)
- [Convex file storage](https://docs.convex.dev/file-storage/upload-files)
- [Convex write conflicts](https://docs.convex.dev/error#1)

## AI and embedding APIs

- [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings): text-embedding-ada-002 for 1536-dimension vectors
- [OpenAI chat completions](https://platform.openai.com/docs/guides/text-generation): GPT-4.1 mini for wiki compilation
- [Anthropic Claude API](https://docs.anthropic.com/en/docs/build-with-claude/text-generation): Claude Sonnet for compilation alternative

## Related tools

- [Firecrawl](https://www.firecrawl.dev/): URL scraping for source ingestion (already integrated)
- [ChromaDB](https://www.trychroma.com/): Vector database used in Mintlify's approach (Convex vector search replaces this)
- [Obsidian](https://obsidian.md/): Local-first knowledge base for wiki inspiration
- [convex-doctor](https://github.com/nooesc/convex-doctor): Static analysis for Convex backends

## Existing agent interfaces

The site already exposes content through multiple interfaces:

| Endpoint | Description |
|----------|-------------|
| `/api/posts` | JSON list of all published posts |
| `/api/post?slug=x` | Single post as JSON or markdown |
| `/api/export` | Batch export all posts with content |
| `/raw/{slug}.md` | Raw markdown for any post or page |
| `/rss.xml` | RSS feed with descriptions |
| `/rss-full.xml` | Full content RSS for LLMs |
| `/sitemap.xml` | Dynamic XML sitemap |
| `/.well-known/ai-plugin.json` | AI plugin manifest |
| `/openapi.yaml` | OpenAPI 3.0 spec |
| `/llms.txt` | AI agent discovery file |
| `/mcp` | MCP JSON-RPC 2.0 server |

## New endpoints (virtual filesystem)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vfs/tree` | GET | Full directory tree as JSON |
| `/vfs/exec` | POST | Execute shell commands (ls, cat, grep, find) |

## Architecture

The virtual filesystem uses Convex search indexes as the coarse filter (replacing ChromaDB in Mintlify's approach) with in-memory regex for fine filtering. Wiki compilation runs as a queued job through Convex's scheduler, compiling content with an LLM and storing results in real-time Convex tables.