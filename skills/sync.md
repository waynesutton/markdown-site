# Sync skill

How the content sync system works in this markdown-blog project.

## Overview

Content flows from markdown files to Convex database via sync scripts. Changes appear instantly on the site because Convex provides real-time updates.

```
content/blog/*.md  ──┐
                     ├──▶ npm run sync ──▶ Convex DB ──▶ Site
content/pages/*.md ──┘
```

## Sync commands

| Command | Environment | What it syncs |
|---------|-------------|---------------|
| `npm run sync` | Development | Posts + pages to dev Convex |
| `npm run sync:prod` | Production | Posts + pages to prod Convex |
| `npm run sync:discovery` | Development | AGENTS.md + llms.txt |
| `npm run sync:discovery:prod` | Production | AGENTS.md + llms.txt |
| `npm run sync:all` | Development | Everything |
| `npm run sync:all:prod` | Production | Everything |

## How sync works

### Content sync (sync-posts.ts)

1. Reads all `.md` files from `content/blog/` and `content/pages/`
2. Parses frontmatter with `gray-matter`
3. Validates required fields (title, slug, etc.)
4. Calculates reading time if not provided
5. Calls Convex mutations to upsert content
6. Generates raw markdown files in `public/raw/`

### Discovery sync (sync-discovery-files.ts)

1. Reads site configuration from `src/config/siteConfig.ts`
2. Queries Convex for post/page counts
3. Updates `AGENTS.md` with current status
4. Generates `public/llms.txt` with API info

## File locations

| Script | Purpose |
|--------|---------|
| `scripts/sync-posts.ts` | Syncs markdown content |
| `scripts/sync-discovery-files.ts` | Updates discovery files |
| `scripts/import-url.ts` | Imports external URLs |

## Environment variables

The sync scripts use these environment files:

| File | Used by |
|------|---------|
| `.env.local` | Development sync (default) |
| `.env.production.local` | Production sync (with SYNC_ENV=production) |

Both files contain `VITE_CONVEX_URL` pointing to the Convex deployment.

## What gets synced

### Posts (content/blog/)

- Frontmatter fields (title, description, date, tags, etc.)
- Full markdown content
- Calculated reading time

### Pages (content/pages/)

- Frontmatter fields (title, slug, order, etc.)
- Full markdown content

### Generated files (public/raw/)

For each published post/page, a static markdown file is generated at `public/raw/{slug}.md`. Also generates `public/raw/index.md` listing all content.

## Sync mutations

The sync scripts call these Convex mutations:

```typescript
// Posts
api.posts.syncPostsPublic({ posts: ParsedPost[] })

// Pages
api.pages.syncPagesPublic({ pages: ParsedPage[] })
```

These mutations handle create/update/delete in a single transaction.

## Adding a new frontmatter field

1. Add to interface in `scripts/sync-posts.ts`
2. Add to Convex schema in `convex/schema.ts`
3. Add to sync mutation in `convex/posts.ts` or `convex/pages.ts`
4. Add to return validators in queries
5. Run `npm run sync` to apply

## Import from URL

Import external articles as markdown:

```bash
npm run import https://example.com/article
```

Requires `FIRECRAWL_API_KEY` in `.env.local`. The script:

1. Fetches and converts HTML to markdown via Firecrawl
2. Generates frontmatter from page metadata
3. Creates file in `content/blog/`
4. You still need to run `npm run sync` after

## Troubleshooting

### "VITE_CONVEX_URL not set"

Run `npx convex dev` first to create `.env.local`.

### Posts not appearing

1. Check `published: true` in frontmatter
2. Verify required fields are present
3. Check Convex dashboard for errors
4. Run `npm run sync` again

### Sync to wrong environment

Check which env file exists:
- `.env.local` for development
- `.env.production.local` for production

Use `SYNC_ENV=production` prefix for prod sync.
