# CLAUDE.md

Project instructions for Claude Code.

## Project context

<!-- Auto-updated by sync:discovery -->
<!-- Site: markdown sync | Posts: 24 | Pages: 4 | Updated: 2026-04-27T00:51:30.966Z -->

Markdown sync framework. Write markdown in `content/`, run sync commands, content appears instantly via Convex real-time database. Built for developers and AI agents.

## Quick start

```bash
npm install                    # Install dependencies
npx convex dev                 # Start Convex (creates .env.local)
npm run dev                    # Dev server at localhost:5173
npm run sync                   # Sync markdown to Convex
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run sync` | Sync markdown to dev Convex |
| `npm run sync:prod` | Sync markdown to prod Convex |
| `npm run sync:discovery` | Update AGENTS.md, CLAUDE.md, llms.txt (includes wiki pages) |
| `npm run sync:discovery:prod` | Update discovery files for production |
| `npm run sync:wiki` | Sync wiki from content/blog and content/pages |
| `npm run sync:wiki:prod` | Sync wiki to production |
| `npm run sync:wiki -- --kb=<id>` | Sync wiki into a specific knowledge base |
| `npm run sync:all` | Sync content + wiki + discovery files |
| `npm run sync:all:prod` | Sync all to production |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npx convex dev` | Start Convex dev watcher |
| `npx convex deploy` | Deploy Convex to production |
| `npm run deploy` | Deploy static app with Convex self-hosting |
| `npm run import <url>` | Import external URL as post |

## Default and legacy modes

- Default auth mode: `convex-auth`
- Default hosting mode: `convex-self-hosted`
- Legacy compatibility mode: `workos` auth + `netlify` hosting

## Workflows

### Adding a blog post

1. Create `content/blog/my-post.md` with frontmatter (see `.claude/skills/frontmatter.md`)
2. Run `npm run sync`
3. Content appears at localhost:5173/my-post

### Adding a page

1. Create `content/pages/my-page.md` with frontmatter
2. Run `npm run sync`
3. Page appears at localhost:5173/my-page

### Modifying Convex functions

1. Edit files in `convex/`
2. `npx convex dev` watches and deploys automatically
3. Always add validators for args and returns (see `.claude/skills/convex.md`)

### Deploying to production

```bash
npm run sync:all:prod          # Sync content + wiki + discovery to prod
npx convex deploy              # Deploy Convex functions
npm run deploy                 # Deploy static assets via Convex self-hosting
```

Netlify build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`

## AI assistance

- Always use Context7 MCP for library/API documentation, code generation, setup or configuration steps
- Proactively look up documentation without explicit requests when working with libraries
- Use Context7 for up-to-date API references and best practices

## Code conventions

- TypeScript strict mode
- Convex validators on all functions (args + returns)
- Use indexes, never `.filter()` on queries
- Make mutations idempotent with early returns
- Patch directly without reading first when possible
- Use event records for counters, not increments
- No emoji in code or docs
- No em dashes between words
- Sentence case for headings
- CSS variables for theming (no hardcoded colors)

## Do not

- Use `.filter()` in Convex queries (use `.withIndex()`)
- Increment counters directly (use event records)
- Read before patching unless necessary
- Leave console.log in production
- Break existing functionality
- Over-engineer solutions
- Add features not requested
- Use browser default modals/alerts

## Configuration alignment

**Important:** `src/config/siteConfig.ts` and the Dashboard Config section (`src/pages/Dashboard.tsx` ConfigSection) must stay in sync.

When adding or modifying a configuration option:
1. Add the option to `siteConfig.ts` with proper TypeScript types
2. Add corresponding state, generated code, and UI in Dashboard.tsx ConfigSection
3. Keep option names consistent (e.g., `socialFooter.showInHeader` in siteConfig maps to `socialFooterShowInHeader` in Dashboard state)

The Dashboard Config generates downloadable siteConfig.ts code. Users can configure via either file editing or the dashboard UI. Both paths should produce equivalent results.

## Key files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema with indexes |
| `convex/posts.ts` | Post queries and mutations |
| `convex/pages.ts` | Page queries and mutations |
| `convex/stats.ts` | Analytics (conflict-free patterns) |
| `convex/rateLimits.ts` | Rate limit definitions (4 tiers) and HTTP action bridge |
| `convex/http.ts` | HTTP endpoints with rate limiting |
| `src/config/siteConfig.ts` | Site configuration |
| `src/pages/Dashboard.tsx` | Dashboard including ConfigSection |
| `scripts/sync-posts.ts` | Markdown to Convex sync |
| `scripts/sync-discovery-files.ts` | Updates AGENTS.md, CLAUDE.md, llms.txt with wiki pages. Copies AGENTS.md to public/. |

## Project structure

```
content/
  blog/           # Markdown blog posts
  pages/          # Static pages
convex/           # Convex functions and schema
netlify/
  edge-functions/ # RSS, sitemap, API proxies
public/
  images/         # Static images
  raw/            # Generated raw markdown files
scripts/          # Sync and utility scripts
src/
  components/     # React components
  config/         # Site configuration
  context/        # React context (theme, sidebar)
  hooks/          # Custom hooks
  pages/          # Route components
  styles/         # Global CSS
```

## Skills reference

Detailed documentation in `.claude/skills/`:

- `frontmatter.md` - Frontmatter syntax for posts and pages
- `convex.md` - Convex patterns specific to this app
- `sync.md` - How sync commands work

## Resources

- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex TypeScript](https://docs.convex.dev/understanding/best-practices/typescript)
- [Convex Write Conflicts](https://docs.convex.dev/error#1)
- [Project README](./README.md)
- [AGENTS.md](./AGENTS.md)

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
