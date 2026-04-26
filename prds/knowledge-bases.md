# Knowledge bases (LLM wiki projects)

## Problem

The wiki currently operates as a single flat namespace. Users cannot create separate knowledge bases for different projects or import markdown collections from tools like Obsidian. There is no way to control API access per knowledge base or mark collections as public vs private.

## Proposed solution

Add a `knowledgeBases` table that acts as a parent container for wiki pages. Each KB has its own visibility (public/private), API settings (public/private/off), and knowledge graph. The existing site wiki becomes the default KB (kbId = undefined for backward compatibility).

### Schema changes

1. New `knowledgeBases` table with slug, title, description, visibility, API settings, source type
2. New `kbUploadJobs` table for tracking file upload processing
3. Add optional `kbId` foreign key to `wikiPages`, `wikiIndex`, `wikiCompilationJobs`
4. New compound indexes on `wikiPages` for scoped queries

### Backend changes

1. `convex/knowledgeBases.ts`: CRUD mutations/queries for KBs
2. `convex/wiki.ts`: Add kbId filter to all public queries and graph data
3. `convex/http.ts`: Add `/api/kb` and `/api/kb/:slug` endpoints
4. `convex/wikiJobs.ts`: Scope compilation jobs by kbId

### Frontend changes

1. `src/pages/Wiki.tsx`: Add KB switcher tabs
2. `src/pages/Dashboard.tsx`: Add KB management section with upload UI

### CLI changes

1. `scripts/sync-wiki.ts`: Optional `--kb` flag

## Edge cases

- Existing wiki pages with no kbId are the "site wiki" (backward compat)
- Slug uniqueness is per-KB (compound index by_kbid_and_slug)
- Private KBs only visible to authenticated admins
- API endpoints check apiEnabled and apiVisibility per KB
- Upload limits: 50KB per file, 100 files per upload batch
- Search indexes need kbId as filter field (requires schema migration)

## Verification

- `npx convex codegen` passes
- `npm run build` passes
- `npx convex-doctor@latest` stays at 100/100
- Existing wiki functionality works unchanged
- New KB CRUD works from dashboard
- Per-KB API endpoints work with visibility controls
