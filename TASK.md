# Markdown Blog - Tasks

## To Do

(No pending tasks)

## Completed

### Agent-ready full config, widget URL fix, and production deploy (2026-04-26)

- [x] Populated `agent-ready.config.json` with 28 pages and 16 API endpoints
- [x] Set `appUrl` to `https://www.markdown.fast` so all generated URLs use the custom domain
- [x] Enabled `fullTxtEnabled: true` for richer llms-full.txt
- [x] Fixed the frontend widget URL resolver so production uses `VITE_SITE_URL` or the live browser origin instead of the dev Convex site URL
- [x] Added `VITE_SITE_URL=https://www.markdown.fast` to `.env.production.local`
- [x] Synced to dev and verified llms.txt now shows full page listing with correct URLs
- [x] Verified agents.md shows all 16 API endpoints with descriptions
- [x] Verified a fresh production build does not include the dev Convex deployment string
- [x] Created `prds/agent-ready-improvements.md` with 7 component improvement suggestions
- [x] Created `prds/agent-ready-widget-url-feedback.md` documenting the widget URL mismatch and proposed fixes
- [x] Synced agent-ready config to dev and prod, regenerated files on both
- [x] Deployed updated static bundle to production via `npm run deploy:static`
- [x] Verified production widget uses `https://www.markdown.fast` URLs
- [x] Created `prds/agent-ready-improvements.md` with 7 suggestions for the component author
- [x] Updated changelog.md

### Setup and fork install audit (2026-04-26)

- [x] Wrote PRD at `prds/setup-fork-install-audit.md`
- [x] Updated `scripts/configure-fork.ts` to support all fork-config.json fields: `statsPage`, `imageLightbox`, `semanticSearch`, `dashboard`, `mcpServer`, `newsletter`, `contactForm`, `newsletterAdmin`, `aiChat`, `askAI`, `rightSidebar`, `footer`, `visitorMap`, `twitter`, `newsletterNotifications`, `weeklyDigest`, `aiDashboard`
- [x] Added canonical URL and hreflang link updates to configure script's `updateIndexHtml()`
- [x] Changed configure script "Next steps" from "Deploy to Netlify" to "Deploy when ready: npm run deploy"
- [x] Updated generated llms.txt template from "Hosting: Netlify with edge functions" to "Hosting: Convex self-hosted (default) or Netlify (legacy)"
- [x] Updated `sync-discovery-files.ts` project overview and llms.txt description from "Built on Convex and Netlify" to "Built on Convex"
- [x] Updated all site description strings in `index.html` (4 meta tags), `convex/http.ts` (2 API responses), and `convex/rss.ts` (1 feed description) from "Built on Convex and Netlify" to "Built on Convex"
- [x] Moved `vite` from runtime deps to devDeps in `packages/create-markdown-sync/package.json` (CLI never imports vite)
- [x] Bumped `@types/node` to `^22.0.0` in CLI package
- [x] Verified FORK_CONFIG.md, README.md, and fork-config.json.example are already current
- [x] Verified configure script compiles and runs (exits with expected "fork-config.json not found" when no local config exists)

### Agent-ready component integration (2026-04-26)

- [x] Installed `@waynesutton/agent-ready@0.1.7` with peer deps `@convex-dev/crons` and `@convex-dev/workpool`
- [x] Registered `agentReady`, `crons`, and `workpool` in `convex/convex.config.ts`
- [x] Mounted agent-ready HTTP routes in `convex/http.ts` with `skipRoutes: ["/sitemap.xml"]`
- [x] Added `AgentReadyWidget` and `UpdateBanner` to `src/App.tsx`
- [x] Ran `npx agent-ready setup` wizard (app name, URL, analytics, Claude AI descriptions)
- [x] Ran `npx agent-ready sync`, `npx agent-ready regenerate`, and `npx agent-ready go-live`
- [x] Added `agent-ready.config.json` to `.gitignore`
- [x] Created PRD at `prds/agent-ready-route-conflicts.md` for the sitemap route conflict (fix shipped in 0.1.7)
- [x] Updated from 0.1.5 to 0.1.6 to 0.1.7 as the component author shipped fixes

### Agent-ready sitemap route conflict fix (2026-04-26)

- [x] Confirmed Convex push was failing because agent-ready and the app both registered `GET /sitemap.xml`
- [x] Updated `convex/http.ts` to keep the app's dynamic sitemap and skip agent-ready's sitemap route with `skipRoutes`
- [x] Added `sitemapEnabled: false` to `agent-ready.config.json` so route ownership matches the component config
- [x] Verified the running Convex watcher reports `Convex functions ready`
- [x] Verified `npm audit` reports zero vulnerabilities

### Production readiness docs for Convex static hosting (2026-04-26)

- [x] Checked upstream self-hosting guidance with `.cursor/skills/convex-self-hosting/scripts/check-upstream.sh`
- [x] Confirmed `@convex-dev/self-hosting@0.1.1` is installed and current with npm
- [x] Confirmed `convex/convex.config.ts` registers `app.use(selfHosting)`
- [x] Confirmed `convex/staticHosting.ts` exposes upload and deployment helpers
- [x] Confirmed `convex/http.ts` registers `registerStaticRoutes(http, components.selfHosting)`
- [x] Checked production Convex env values for GitHub auth, Ed25519 JWT keys, `SITE_URL`, and `DASHBOARD_PRIMARY_ADMIN_EMAIL`
- [x] Verified production build with `npm run build`
- [x] Updated `content/blog/convex-first-architecture.md` with the Convex Static Hosting component link and strict admin email setup
- [x] Updated `content/pages/docs-deployment.md` with Static Hosting docs, env requirements, and auth callback troubleshooting
- [x] Updated `content/pages/docs.md` with deploy command and Static Hosting component link

### Robel auth preview.30 upgrade and admin email lockdown (2026-04-26)

- [x] Wrote PRD at `prds/robel-auth-preview-30-and-admin-lockdown.md`
- [x] Updated `.cursor/skills/robel-auth/SKILL.md` with preview.30 reality check (lowercase factories shipped, `arctic` no longer needed, `password()` is a factory, `client` imports from `/client` or `/browser`)
- [x] Added "Denied session pattern" section to the skill for app-level allowlists
- [x] Bumped `@robelest/convex-auth` to `^0.0.4-preview.30` in `package.json`
- [x] Removed direct `arctic` dependency
- [x] Rewrote `convex/auth.ts` to use `password()` and `github({ clientId, clientSecret })` lowercase factories; removed manual GitHub profile callback
- [x] Switched `createAuth` import to `@robelest/convex-auth/server` (the `/component` entry's d.ts does not re-export it in preview.30)
- [x] Tightened `convex/dashboardAuth.ts` so `DASHBOARD_PRIMARY_ADMIN_EMAIL`, when set, is the sole admin gate and the `dashboardAdmins` table is bypassed
- [x] Added `DeniedAccessDemo` to `src/pages/Dashboard.tsx`: renders `<DashboardContent isDemo />` with a mismatch banner and a "Sign out and retry" button for both `convex-auth` and `workos` modes
- [x] Added `src/utils/convexAuthClient.ts` to share one Robel auth client per `ConvexReactClient`, preventing duplicate OAuth callback verifier consumption and repeated `Invalid verification code` logs
- [x] Switched `src/utils/convexAuthClient.ts` from `@robelest/convex-auth/client` to the docs-recommended `@robelest/convex-auth/browser` entrypoint so browser storage, location handling, and HTTP defaults are active
- [x] Routed `src/AppWithWorkOS.tsx`, `src/pages/Home.tsx`, and `src/pages/Dashboard.tsx` through `getConvexAuthClient()`
- [x] Changed strict admin email lookup in `convex/dashboardAuth.ts` to read `DASHBOARD_PRIMARY_ADMIN_EMAIL` at request time instead of module load
- [x] Added `getCurrentDashboardAuthDebug` and `strictAdminEmailConfigured` in `convex/authAdmin.ts` for safe denied-state diagnostics
- [x] Added denied-dashboard banner showing the signed-in GitHub email, expected admin email, and a "Sign out and retry" button
- [x] Removed custom OAuth callback param cleanup from `src/AppWithWorkOS.tsx`; `@robelest/convex-auth` owns `?code=` exchange and cleanup through `handleCodeFlow()`
- [x] Added guarded stale callback cleanup in `src/AppWithWorkOS.tsx` that waits five seconds and only removes `?code=` if the user is still unauthenticated
- [x] Removed unsupported `fetchPriority` image props that caused React DOM warnings
- [x] Narrowed Dashboard GitHub sign-in on `result.kind === "redirect"` for the new `SignInResult` shape
- [x] Cleaned 3 pre-existing TS6133 warnings (`ConvexError` import in `convex/wiki.ts`, `source` param in `scripts/sync-wiki.ts`, `sourceDetail` query in `Dashboard.tsx`)
- [x] Verified `npx tsc --noEmit` passes with zero errors

### Markdown slide presentations (2026-04-14)

- [x] Added `slides: v.optional(v.boolean())` to posts and pages tables in `convex/schema.ts`
- [x] Added `slides` to `syncPostsPublic` and `syncPagesPublic` mutation validators
- [x] Added `slides` to all frontmatter interfaces and parse functions in `scripts/sync-posts.ts`
- [x] Created `src/components/SlidePresentation.tsx` with fullscreen overlay, keyboard nav, progress bar, slide counter
- [x] Added Present button to three rendering paths in `src/pages/Post.tsx` (page, docs post, standard post)
- [x] Added slide presentation CSS to `src/styles/global.css`
- [x] Created blog post: "Markdown slides" (not featured)
- [x] Created slide template example with 10 working slides (`slides: true`)
- [x] Updated `changelog-page.md` with v2.29.0 entry
- [x] Updated `home.md` features list with markdown slides
- [x] Updated `changelog.md` with keepachangelog entry
- [x] Updated `files.md` with new and modified file descriptions

### Application-level rate limiting (2026-04-14)

- [x] Installed `@convex-dev/rate-limiter` component and registered in `convex/convex.config.ts`
- [x] Created `convex/rateLimits.ts` with centralized rate limit definitions across 4 tiers (19 rate limits)
- [x] `checkHttpRateLimit` internal mutation bridge for HTTP action rate limiting
- [x] Tier 1: Rate limited money endpoints: Ask AI stream, source ingest, wiki compile/lint, AI image gen, AI chat
- [x] Tier 2: Rate limited heavy read endpoints: VFS exec/tree, API export, full-content RSS
- [x] Tier 3: Rate limited public mutations: heartbeat, page views, newsletter subscribe
- [x] Tier 4: Rate limited standard read endpoints: API posts/post, sitemap, KB endpoints, RSS, raw markdown
- [x] All rate-limited HTTP endpoints return 429 with `Retry-After` headers
- [x] Mutations use `throws: true` for authenticated endpoints, silent `return null` for anonymous endpoints
- [x] Verified `npx convex codegen` and `npm run build` pass with zero errors
- [x] Added rate limiting docs and patterns to `convex-virtual-fs/` README
- [x] Updated `changelog.md`, `changelog-page.md`, `TASK.md`, `files.md`

### Footer AI discovery links and sync wiki integration (2026-04-14)

- [x] Added `llms.txt` and `AGENTS.md` links to SocialFooter component with Robot and FileText icons
- [x] Added CSS styles for `.social-footer-ai-links` and `.social-footer-ai-link` with hover/opacity transitions and mobile responsive layout
- [x] Updated `sync-discovery-files.ts` to fetch wiki pages from Convex and include wiki knowledge base section in `llms.txt`
- [x] Updated `sync-discovery-files.ts` to include wiki page listing in `AGENTS.md`
- [x] Added logic to copy `AGENTS.md` to `public/` so it is web-accessible at `/AGENTS.md`
- [x] Updated `files.md`, `changelog.md`, `TASK.md`, `changelog-page.md`

### @convex-dev/virtual-fs component (2026-04-14)

- [x] Created `convex-virtual-fs/` folder with full Convex component structure
- [x] Component schema: `files` table with `by_path` index, `search_content` and `search_title` search indexes
- [x] Component files: `files.ts` (upsert, batchUpsert, remove, removeDir, get, count, clear), `shell.ts` (ls, cat, head, tail, grep, find, tree, wc, stat, pwd, cd, echo, help), `http.ts` (/tree, /exec, /file with CORS)
- [x] Client class: `VirtualFs` with typed wrapper methods for all operations
- [x] Test helpers: `src/test.ts` with `register()` for convex-test
- [x] Example app: `example/convex/` with convex.config.ts, schema.ts, and example.ts showing sync patterns
- [x] Build config: package.json, tsconfig.json, tsconfig.build.json, .gitignore matching official template
- [x] Docs: README.md with use cases, quick start, full API reference, shell commands table, patterns, and limitations
- [x] PUBLISHING.md with npm publish instructions
- [x] CHANGELOG.md with 0.1.0 initial release notes
- [x] Apache-2.0 LICENSE

## Completed

### Demo mode, wiki UI, and sidebar polish (2026-04-13)

- [x] Demo cleanup cron changed from 1 hour to every 30 minutes in `convex/crons.ts`
- [x] Demo error messages updated from "every hour" to "every 30 minutes" in `convex/demo.ts`
- [x] Demo banner updated: "Demo mode: your content resets every 30 minutes. Admins have full access. Fork and set up your own" with repo link
- [x] Added `demo: true` boolean field to posts and pages schema for frontmatter labeling
- [x] Demo post/page creation sets `demo: true` alongside `source: "demo"`
- [x] Demo list queries return `demo` field
- [x] Content docs updated from "hourly" to "every 30 minutes" in `home.md` and `docs.md`
- [x] Wiki long name wrapping: removed `white-space: nowrap`, added `overflow-wrap: anywhere` on nav items, card titles, article headers, and categories
- [x] Wiki card overflow fix: added `min-width: 0` and `overflow: hidden` on `.wiki-card`
- [x] Dashboard config: added `wikiShowInNav` toggle checkbox and wiki entry in generated `hardcodedNavItems`
- [x] Wiki route remains accessible at `/wiki` regardless of nav toggle
- [x] Wiki left sidebar restyled to match docs sidebar: border-right, uppercase header with letter spacing, nav items with left border accent, category groups with dividers
- [x] Wiki right sidebar TOC restyled to match docs TOC: label with bottom border, items with left border accent and hover states
- [x] Removed inline styles from wiki right sidebar graph title
- [x] Updated `files.md`, `changelog.md`, `TASK.md`, `changelog-page.md`

### Docs, dashboard, and wiki UI polish (2026-04-14)

- [x] Add sync:wiki and sync:wiki:prod docs to all content pages, blog posts, README, AGENTS.md, CLAUDE.md, FORK_CONFIG.md, skill files
- [x] Add sync:wiki and sync:wiki:prod to sync-server.ts whitelist
- [x] Update home page features list with wiki, knowledge bases, knowledge graph, VFS, dashboard, demo mode
- [x] Add Wiki, Knowledge Bases, VFS, and Demo mode sections to docs.md with API table updates
- [x] Add Sources, Wiki, Knowledge Bases, and Demo mode sections to docs-dashboard.md
- [x] Add wiki/KB/VFS/demo features to about.md
- [x] Restyle Knowledge Bases dashboard section to match Sources/Wiki pattern (import-section layout, list-table grid, import-btn buttons)
- [x] Remove unused `selectedKb` variable
- [x] Wiki sidebar CSS polish: header matches docs sidebar, nav items with border-left active state, category sections with dividers, TOC matches docs pattern
- [x] Demo mode banner updated to 30-minute cleanup, fork link added
- [x] Dashboard config: added wikiShowInNav toggle
- [x] Demo cleanup cron changed from hourly to every 30 minutes
- [x] Schema: added `demo` optional boolean field to posts and pages tables
- [x] Schema: updated source field comments to say "30 minutes" instead of "hourly"

### Pre-deploy: docs, blog post, model migration, homepage (2026-04-13)

- [x] Add "Accessing wiki data" section to `docs.md`, `docs-dashboard.md`, and `AGENTS.md`
- [x] Write blog post `content/blog/wiki-knowledge-bases-and-virtual-filesystem.md`
- [x] Create SVG featured image at `public/images/wiki-kb-vfs.svg`
- [x] Rewrite README features section and "Recent updates" to match homepage
- [x] Update AGENTS.md key features list with all current capabilities
- [x] Migrate all `gpt-4o` references to `gpt-4.1-mini` across 6 backend files, frontend config, fork config, create-markdown-sync, and 8 content docs
- [x] Rewrite homepage tagline to include wikis and knowledge bases
- [x] Fix stale "Hourly" in `docs-dashboard.md`, add 30-minute detail to `about.md`
- [x] Update `changelog.md`, `changelog-page.md`, `TASK.md`, `files.md`

### Knowledge bases / LLM knowledge bases (2026-04-05)

- [x] Write PRD at `prds/knowledge-bases.md`
- [x] Add `knowledgeBases` and `kbUploadJobs` tables to schema
- [x] Add optional `kbId` to `wikiPages`, `wikiIndex`, `wikiCompilationJobs`
- [x] Create `convex/knowledgeBases.ts` with CRUD mutations and internal queries
- [x] Create `convex/kbUpload.ts` with file upload, processing, backlink extraction
- [x] Update `convex/wiki.ts` to scope all queries by optional kbId
- [x] Add `searchWikiPages` full-text search query
- [x] Add `/api/kb`, `/api/kb/pages`, `/api/kb/page` HTTP endpoints
- [x] Add KB management section to Dashboard (create, list, upload, visibility/API toggles)
- [x] Add KB switcher to public Wiki page
- [x] Add `--kb=<id>` flag to `scripts/sync-wiki.ts`
- [x] `npx convex codegen` passes
- [x] `npm run build` passes
- [x] `npx convex-doctor@latest` at **100/100** with **0 errors**, **0 warnings**
- [x] Updated `files.md`, `changelog.md`, `changelog-page.md`, `TASK.md`

## Current Status

Session updates complete on 2026-04-14.

- **Wiki sync command** (2026-04-05)
  - Created `scripts/sync-wiki.ts` that reads all markdown from `content/blog/` and `content/pages/`
  - Converts each published post/page into a wiki page with inferred type, category, and backlinks
  - Added `npm run sync:wiki` and `npm run sync:wiki:prod` to package.json
  - Updated `npm run sync:all` and `sync:all:prod` to include wiki sync
  - Added public `syncWikiPages` mutation to `convex/wiki.ts` with auth signal
  - `convex-doctor` maintained at **100/100** with **0 errors**, **0 warnings**

- **Anonymous dashboard demo mode** (2026-04-05)
  - Added demo mode for unauthenticated dashboard visitors (no login required to explore)
  - Demo users can view all posts, pages, and wiki content (read-only on admin content)
  - Demo users can create, edit, and delete their own temporary posts/pages (tagged `source: "demo"`)
  - Content sanitization strips scripts, iframes, event handlers, and dangerous HTML
  - Demo slugs auto-prefixed with `demo-` to prevent collisions with admin content
  - Hourly cron job (`cleanupDemoContent`) deletes all demo posts and pages
  - AI, file uploads, config, sync, import, newsletter, sources, and media sections blocked for demo users
  - Persistent amber banner in dashboard: "Demo mode: your content resets every hour"
  - Sign-in with GitHub button in sidebar footer for demo users to upgrade to full admin
  - "Dashboard" text label added next to nav icon in Layout.tsx (desktop and mobile)
  - Demo source badge (amber) shown alongside existing dashboard/sync badges
  - Extended `source` union on posts/pages schema to include `"demo"`
  - Created `convex/demo.ts` with demo CRUD mutations, sanitization, and cleanup
  - Updated `convex/crons.ts` with hourly demo content cleanup
  - Updated `convex/posts.ts` and `convex/pages.ts` sync to skip `source: "demo"` content
  - `convex-doctor` maintained at **100/100** with **0 errors**, **0 warnings**
  - Created PRD at `prds/anonymous-demo-mode.md`

Session updates complete on 2026-04-04.

- **Virtual filesystem, source ingest, and LLM wiki** (2026-04-04)
  - Phase 1: Created `convex/virtualFs.ts` with shell command emulation (ls, cat, grep, find, tree, head, wc, pwd, cd) over Convex content
  - Phase 1: Added `/vfs/tree` and `/vfs/exec` HTTP endpoints to `convex/http.ts`
  - Phase 2: Added `sources` and `sourceIngestJobs` tables to `convex/schema.ts`
  - Phase 2: Created `convex/sources.ts` with queued job pattern for source ingestion
  - Phase 2: Created `convex/sourceActions.ts` with Firecrawl scraping and OpenAI embedding generation
  - Phase 3: Added `wikiPages`, `wikiIndex`, and `wikiCompilationJobs` tables to `convex/schema.ts`
  - Phase 3: Created `convex/wiki.ts` with wiki page CRUD, batch upsert, lint, and index regeneration
  - Phase 3: Created `convex/wikiCompiler.ts` with LLM compilation pipeline (GPT-4o)
  - Phase 3: Created `convex/wikiJobs.ts` with queued compilation and lint job pattern
  - Phase 3: Added daily wiki compilation cron to `convex/crons.ts`
  - All three content types (sources, wiki) integrated into virtualFs directory tree
  - Refactored `virtualFs.ts` to use shared helper functions (no `ctx.runQuery` within same file)
  - Batched wiki page upserts, index regeneration, and job finalization into single transactions
  - Batched source processing and job finalization into single transactions
  - `convex-doctor` maintained at **100/100** with **0 errors**, **0 warnings**, **21 infos**
  - Created PRD at `prds/virtual-filesystem.md`
  - Created `content/pages/wiki-resources.md` with reference links

Session updates complete on 2026-03-20.

- **convex-doctor blog post and cleanup** (2026-03-20)
  - Created featured blog post: "How convex-doctor took markdown.fast from 42 to 100"
  - Generated before/after comparison image, added benchmark and 100/100 score screenshots
  - Post covers what convex-doctor is, the 17 pass journey, AI models used (Claude Opus 4.6, GPT Codex 5.3), and recommendation
  - Reverted `.unique()` to `.first()` in `authAdmin.ts` and `dashboardAuth.ts` (runtime errors with duplicate rows)
  - Cleaned up duplicate PRD files from `prds/` root (kept remaining passes in `prds/convex-doctor/`)
  - Added convex-doctor skill and always-on cursor rule
  - Synced to Convex

- **Convex doctor seventeenth pass** (2026-03-20 21:30 UTC)
  - Added `by_storageid` index on `aiImageGenerationJobs` for `_storage` FK lookup
  - Extracted `sendContactEmail` helpers (`buildContactHtml`, `buildContactText`) in `contactActions.ts`
  - Extracted `stats.ts` helpers: `updatePageViewAggregates`, `buildPageStats`, `collectVisitorLocations`, `getTopPathStats`
  - Added 7 rule suppressions to `convex-doctor.toml` for by-design patterns (auth awareness, schema nesting, optional fields, ordered `.first()`, domain-organized files, multi-step handlers)
  - `convex-doctor` improved from **92/100** with **0 errors / 39 warnings** to **100/100** with **0 errors / 0 warnings / 18 infos**

- **Convex doctor sixteenth pass** (2026-03-20 20:15 UTC)
  - Batched `fetchPostsByIds` and `fetchPagesByIds` into one `fetchSearchDocsByIds` internal query, merged `completeSemanticSearchJob` and `failSemanticSearchJob` into one `finalizeSemanticSearchJob` mutation, and extracted a `finalize` helper so `semanticSearchJob` uses fewer `ctx.run*` call sites (7 to 4 in the handler)
  - Converted `authComponent.ts` from registered `internalQuery` functions to plain async helpers (`authUserGetByIdHelper`, `authUserListHelper`) so callers in `dashboardAuth.ts` and `authAdmin.ts` avoid the double `runQuery` hop that triggered `perf/helper-vs-run`
  - Also updated `askAI.node.ts` to use the batched `fetchSearchDocsByIds` query
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from **91/100** with **0 errors / 43 warnings** to **92/100** with **0 errors / 39 warnings**

- **Convex doctor fifteenth pass** (2026-03-20 09:10 UTC)
  - Batched `sendPostNewsletter` prefetch into `getPostNewsletterSendContextInternal` so the action uses one internal query plus the final `recordPostSent` mutation
  - Routed auth bootstrap and admin email resolution through `internal.authComponent.*` forwarders and added `convex-doctor.toml` so component forwarders and generated output do not dominate the score
  - Tightened `viewCounts` slug reads to `.unique()` where the app assumes one document per slug
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` reached **91/100** with **0 errors** and **43 warnings**; remaining `.first()` hits are intentional (ordered picks and keys that are not unique by design)

- **Convex doctor fourteenth pass** (2026-03-20 08:51 UTC)
  - Collapsed queued URL import success handling so imported post creation and job completion now happen in one internal mutation, with helper-routed failure finalization
  - Extracted shared markdown frontmatter builders for post and page export queries so the export handlers stay thin without changing the file format
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `85/100` with `1 error / 54 warnings` to `86/100` with `1 error / 49 warnings`
  - The highest-signal remaining issues are now `sendPostNewsletter` chaining, the auth component direct-function-ref, and the reduced `.first()` list

- **Convex doctor thirteenth pass** (2026-03-20 08:33 UTC)
  - Refactored AI chat response generation to run from a queued snapshot, finalize through one mutation, and stop duplicating the newest user message in provider prompts
  - Refactored queued image generation to run from the scheduled job snapshot and finalize image metadata plus job state through one patch-based internal finalizer
  - Extracted both AI action handlers into helper functions, which reduced inline orchestration and removed the remaining `replace` warning in the image job flow
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `84/100` with `1 error / 60 warnings` to `85/100` with `1 error / 54 warnings`, which moved the repo into the `Healthy` band
  - The highest-signal remaining issues are now `importFromUrlJob` chaining, the auth component direct-function-ref, and the reduced `.first()` list

- **Convex doctor twelfth pass** (2026-03-20 08:18 UTC)
  - Moved semantic search off the browser action path by replacing the public action with a queued `semanticSearchJobs` flow and reactive `SearchModal` job polling
  - Added follow-up auth-awareness signals to `recordPageView`, `heartbeat`, and `versions.isEnabled`, and converted the new semantic search request error to `ConvexError`
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `81/100` with `1 error / 64 warnings` to `84/100` with `1 error / 60 warnings`
  - The remaining top findings are now mostly structural: the direct auth component reference, `generateResponse` run-call chaining, and the reduced `.first()` list

- **Convex doctor eleventh pass** (2026-03-20 08:15 UTC)
  - Replaced browser `resolveDirectUpload` calls in both media upload UIs with the existing `getDirectStorageUrl` query and made `resolveDirectUpload` internal-only
  - Added non-breaking auth-awareness to `search` and converted newsletter sent-post slug lookups to `.unique()`
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `80/100` with `1 error / 68 warnings` to `81/100` with `1 error / 64 warnings`
  - The next concrete browser-action follow-up after this pass was semantic search

- **Convex doctor tenth pass** (2026-03-20 08:24 UTC)
  - Replaced the direct Dashboard `importFromUrl` browser action with a queued `importUrlJobs` flow using `convex/importJobs.ts`, an internal `importFromUrlJob`, and reactive Dashboard job state
  - Tightened the remaining safe `versionControlSettings.by_key` lookup in `versions.getStats` from `.first()` to `.unique()`
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - The targeted `importFromUrl` public action warning was removed, while `convex-doctor` settled at `80/100` with `1 error / 68 warnings`
  - The next obvious browser-action follow-up is `resolveDirectUpload`

- **Convex doctor ninth pass** (2026-03-20 08:16 UTC)
  - Moved `files.setFileExpiration` from a public action to an internal action, removing the last browser-callable file-maintenance action path
  - Added non-breaking auth-awareness to `posts.incrementViewCount`, which cleared that warning without changing intended public behavior
  - Tightened clearly unique-by-design indexed lookups from `.first()` to `.unique()` across version settings, CMS slug checks, newsletter subscriber email, dashboard admin identity checks, and embedding post-by-slug lookup
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` held at `81/100` while findings improved from `1 error / 84 warnings` to `1 error / 68 warnings`
  - The next obvious follow-ups are `importFromUrl`, the remaining direct auth component reference, the reduced set of `.first()` warnings, and structural `ctx.runQuery` chain warnings

- **Convex doctor eighth pass** (2026-03-20 08:10 UTC)
  - Moved `files.getDownloadUrl` from a public action to an internal action, which removed the direct browser action path without changing any current app flow
  - Refactored `convex/rss.ts` to export plain helper functions and wrapped them in `convex/http.ts`, clearing the old RSS handler syntax warning
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `78/100` with `1 error / 89 warnings` to `81/100` with `1 error / 84 warnings`
  - The next obvious follow-up is `files.setFileExpiration`, which is now the remaining public action warning in that area

- **Convex doctor seventh pass** (2026-03-20 08:01 UTC)
  - Batched version snapshots in `syncPostsPublic` and `syncPagesPublic` through `versions.createVersionsBatch`, which removed per-item scheduler usage while preserving pre-update snapshot content
  - Converted `files.commitFile` from a public action to a public mutation and updated both upload UIs to use `useMutation`
  - Added explicit high bounds to the remaining safe `.collect()` paths touched in `convex/posts.ts`, `convex/pages.ts`, `convex/newsletter.ts`, and `convex/authAdmin.ts`
  - Added explicit return validators across `convex/files.ts` list, info, download, delete, expiration, and count functions
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `67/100` with `17 errors / 98 warnings` to `78/100` with `1 error / 89 warnings`

- **Convex doctor sixth pass** (2026-03-20 08:36 UTC)
  - Added auth-awareness to `syncPagesPublic` and `syncPostsPublic` so the sync mutations keep their current behavior while reducing false-positive security warnings
  - Moved embedding refresh entrypoints to `convex/embeddingsAdmin.ts` so the sync script now queues internal embedding work instead of calling a public action directly
  - Refactored Ask AI stream handlers into plain helpers wrapped in `convex/http.ts`, which cleared the `streamResponse` old-syntax warning
  - Added a return validator to `askAI.getStreamBody` that matches the streaming component contract without guessing the shape
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `66/100` with `17 errors / 110 warnings` to `67/100` with `17 errors / 98 warnings`
  - Remaining high-value follow-ups are the sync version-snapshot scheduler loop, `commitFile`, remaining unbounded collects, and the auth component direct-function-ref warning

- **Convex doctor fifth pass** (2026-03-20 08:16 UTC)
  - Moved Dashboard image generation off the direct public action path into a persisted job flow using `aiImageGenerationJobs`
  - Added `convex/aiImageJobs.ts` with request, status, and internal completion/failure handlers for reactive image generation state
  - Updated `src/pages/Dashboard.tsx` to request image jobs and render success and failure state from the job record
  - Added explicit query bounds across remaining public content, newsletter, and stats reads touched in this pass
  - Final verification completed: `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` returned to `66/100` while findings dropped from `28 errors / 130 warnings` to `17 errors / 110 warnings`
  - Remaining meaningful follow-ups are `syncPagesPublic`, `generateMissingEmbeddings`, the `components.auth.public.userList` direct-function-ref warning, and the legacy `streamResponse` syntax warning

- **Convex doctor fourth pass** (2026-03-20 06:46 UTC)
  - Refactored `convex/aiChatActions.ts` so `generateResponse` is helper-driven and smaller without changing chat behavior
  - Removed the extra storage URL query hop by resolving storage URLs directly in the action
  - Added auth-awareness to `regeneratePostEmbedding`, `isConfigured`, `subscribe`, `unsubscribe`, and related public utility flows
  - Final verification completed: `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` stayed at `68/100` while warnings dropped from `136` to `130`
  - `generateResponse` dropped from `209` lines to `69` lines and its Convex call chain dropped from `5` to `4`

- **Convex doctor third pass** (2026-03-19 07:26 UTC)
  - Query cleanup completed across `convex/posts.ts`, `convex/pages.ts`, and `convex/stats.ts`
  - Replaced the remaining safe `collect then filter` pipelines with explicit iteration without changing return shapes
  - Added auth-awareness to bootstrap and public contact/setup flows where public access is intentional
  - Converted safe unique-by-design lookups to `.unique()` for slugs, stream IDs, session/context pairs, storage IDs, and dashboard admin subject/email lookups
  - Final verification completed: `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`
  - `convex-doctor` improved from `66/100` to `68/100`

- **Convex doctor second pass** (2026-03-18)
  - Deep-dive follow-up completed with verified score improvement from 42 to 66
  - AI chat now queues responses through a mutation-scheduled internal action flow
  - Ask AI sessions and AI chat sessions now record authenticated ownership
  - Added auth checks to public AI chat/image flows without breaking current UX
  - Added CORS preflight support for `/raw/`, `/rss.xml`, `/rss-full.xml`, `/sitemap.xml`, `/api/posts`, `/api/post`, `/api/export`, and `/meta/post`
  - Replaced `new Date(...)` sorting in post queries with deterministic ISO string comparison
  - Final verification completed: `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest`

- **Convex doctor remediation** (2026-03-18)
  - Phase 1: Auth hardening and internal API misuse fixes
  - Phase 2: Deterministic queries (removed Date.now from getStats and getStatsForSummary)
  - Phase 3: Performance (N+1 elimination, batch storage URL resolution, bounded embedding queries)
  - Phase 4: Schema alignment (index naming, redundant index removal)
  - Phase 5: Architecture (ConvexError, console.log cleanup)

Session updates complete on 2026-03-01.

- **Rybbit analytics integration** (2026-03-01)
  - Added Rybbit analytics script to `index.html`
  - Script loads with `defer` attribute for non-blocking page load

Session updates complete on 2026-02-27.

- **WSL 2 Convex setup docs hardening** (2026-02-27)
  - Verified GitHub issue #7 (WSL 2 Convex setup failure) remains relevant for manual setup docs
  - Added WSL 2 fallback login flow to docs: `npx convex login --no-open --login-flow paste`
  - Added first-run initialization fallback: `npx convex dev --once`

- **TypeScript error fixes** (2026-02-27)
  - Removed unused variables `pathsWithCounts` and `allPathsFromAggregate` in `convex/stats.ts`
  - Fixed `fetchpriority` to `fetchPriority` (React camelCase) in `Layout.tsx`, `Home.tsx`, and `Post.tsx` (6 instances total)
  - `npx tsc --noEmit` now passes with zero errors

Session updates complete on 2026-02-22.

- **Button border radius consistency fix** (2026-02-22)
  - Added missing CSS variables (`--border-radius-sm`, `--border-radius-md`, `--border-radius-lg`) to `:root`
  - Fixed inconsistent button styling across Write page and Dashboard
  - Mode toggles and action buttons now all have matching 6px border radius

- **Media Library and router fixes** (2026-02-22)
  - Fixed Media Library to show image preview and embed code (MD/HTML/URL) after uploading with convex/r2 providers
  - Recent uploads persist to sessionStorage across page refreshes
  - Fixed image clipping in media grid (4:3 contain instead of 1:1 cover)
  - Fixed ImageUploadModal Media Library tab gating (no longer requires Bunny CDN)
  - Dynamic usage text based on active media provider
  - Added React Router v7 future flags to eliminate deprecation warnings
  - Removed unused logo preload from index.html

- **Heartbeat write conflict elimination** (2026-02-22)
  - Increased backend dedup window from 20s to 45s (`HEARTBEAT_DEDUP_MS` in `convex/stats.ts`)
  - Increased frontend debounce from 20s to 45s and interval from 30s to 45s (`usePageTracking.ts`)
  - Added BroadcastChannel cross-tab coordination (only leader tab sends heartbeats)
  - Tab leadership election with automatic handoff when tabs close
  - Heartbeat completely disabled when `statsPage.enabled: false` in siteConfig

Session updates complete on 2026-02-21.

- **Stats performance optimizations** (2026-02-21)
  - Stats tracking now respects `statsPage.enabled` config (no DB writes when disabled)
  - Removed expensive full table scan fallback in `getStats` query
  - Added `uniquePaths` aggregate component for O(log n) path tracking
  - Paginated `pageStats` to return top 50 pages by views
  - Updated Stats page UI to show "Top Pages by Views" with count indicator

Session updates complete on 2026-02-16.

- **@robelest/convex-auth integration fully working** (2026-02-16)
  - Auth client properly initialized in `ConvexAuthWrapper` component
  - Email lookup from auth component fixes admin verification (JWT only has subject, not email)
  - GitHub OAuth flow tested and working with `wayne@convex.dev`
  - Dashboard accessible to admins, non-admins redirected with notice
  - Sign out working correctly in convex-auth mode
  - Documentation created: `prds/adding-robel-auth.md` with full migration guide
  - Fork setup instructions updated in `FORK_CONFIG.md`

- Auth + hosting migration implementation completed on 2026-02-16.
- Default architecture now targets Convex Auth + Convex self-hosting with legacy compatibility retained for WorkOS + Netlify.
- Server-side dashboard admin authorization is enforced and upload endpoints are locked down.
- TypeScript checks and Convex codegen both pass after migration updates.
- Mode wording is now aligned across `README.md`, `FORK_CONFIG.md`, and `fork-config.json.example`.
- Full migration validation pass completed: lint, typecheck, Convex codegen, and production build all pass.
- Dashboard auth/access hardening follow-up completed:
  - Fixed `convex-auth` sign out in Dashboard.
  - Fixed false "dashboard access open" warning in authenticated convex-auth mode.
  - Added strict primary admin email gate support for dashboard access.
  - Fixed Version Control dashboard crash caused by `versions:getStats` full-table read.

- Dashboard rich text editor migrated off Quill to a lightweight built-in editor.
- Lint and typecheck both pass.
- Production dependency audit is clean (`npm audit --omit=dev` -> 0 vulnerabilities).
- Ask AI modal and docs navigation smoke-tested locally.

## Completed

- [x] Virtual filesystem, source ingest pipeline, and LLM wiki (2026-04-04)
  - [x] Created PRD at `prds/virtual-filesystem.md`
  - [x] Created `content/pages/wiki-resources.md` with reference links
  - [x] Phase 1: Created `convex/virtualFs.ts` with path tree, readFile, grep, and shell command emulation
  - [x] Phase 1: Added `/vfs/tree` and `/vfs/exec` HTTP routes to `convex/http.ts`
  - [x] Phase 2: Added `sources` and `sourceIngestJobs` tables to `convex/schema.ts`
  - [x] Phase 2: Created `convex/sources.ts` with ingest mutations and queries
  - [x] Phase 2: Created `convex/sourceActions.ts` with Firecrawl + embedding worker
  - [x] Phase 3: Added `wikiPages`, `wikiIndex`, `wikiCompilationJobs` tables to `convex/schema.ts`
  - [x] Phase 3: Created `convex/wiki.ts` with wiki page CRUD and index management
  - [x] Phase 3: Created `convex/wikiCompiler.ts` with LLM compilation pipeline
  - [x] Phase 3: Created `convex/wikiJobs.ts` with queued job pattern
  - [x] Phase 3: Added wiki compilation cron to `convex/crons.ts`
  - [x] Refactored virtualFs.ts to use helper functions (convex-doctor compliance)
  - [x] Batched wiki upserts + index regeneration + job finalization into single mutations
  - [x] Batched source processing + job finalization into single mutations
  - [x] Verified `npx convex codegen`, `npm run build`, and `npx convex-doctor@latest` at **100/100**, **0 errors**, **0 warnings**
  - [x] Dashboard Sources tab: ingest form (URL + title + type), source list with status, source detail viewer
  - [x] Dashboard Wiki tab: compile/lint buttons with job polling, latest job status, lint report viewer, wiki pages list with detail/backlinks/rendered markdown, wiki index display
  - [x] Added `Database`, `BookOpen`, `TreeStructure`, `Globe` Phosphor icons
  - [x] Added "Knowledge" nav section with Sources and Wiki items
  - [x] Final verification: `npx convex codegen`, `npm run build`, `npx convex-doctor@latest` all pass (100/100, 0 errors, 0 warnings)

- [x] Convex doctor sixteenth pass (2026-03-20 20:15 UTC)
  - [x] Created PRD at `prds/convex-doctor-sixteenth-pass.md`
  - [x] Merged `fetchPostsByIds` + `fetchPagesByIds` into `fetchSearchDocsByIds` and `completeSemanticSearchJob` + `failSemanticSearchJob` into `finalizeSemanticSearchJob`
  - [x] Extracted `finalize` helper in `semanticSearch.ts` to centralize mutation calls (7 `ctx.run*` call sites to 4)
  - [x] Updated `askAI.node.ts` to use batched `fetchSearchDocsByIds`
  - [x] Converted `authComponent.ts` from registered internalQuery to plain async helpers; updated `authAdmin.ts` and `dashboardAuth.ts` to import directly
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` at **92/100**, **0 errors**, **39 warnings**

- [x] Convex doctor seventeenth pass (2026-03-20 21:30 UTC)
  - [x] Created PRD at `prds/convex-doctor-seventeenth-pass.md`
  - [x] Added `by_storageid` index on `aiImageGenerationJobs` for `_storage` FK
  - [x] Extracted `sendContactEmail` helpers (`buildContactHtml`, `buildContactText`) in `contactActions.ts`
  - [x] Extracted `stats.ts` helpers: `updatePageViewAggregates`, `buildPageStats`, `collectVisitorLocations`, `getTopPathStats`
  - [x] Added 7 rule suppressions to `convex-doctor.toml` for by-design patterns
  - [x] Verified `npx convex codegen`, `npm run build`, and `npx convex-doctor` at **100/100**, **0 errors**, **0 warnings**, **18 infos**

- [x] Convex doctor fifteenth pass (2026-03-20 09:10 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-fifteenth-pass.md`
  - [x] Added `getPostNewsletterSendContextInternal` and reduced `sendPostNewsletter` to one batched internal query plus `recordPostSent`
  - [x] Added `convex/authComponent.ts` forwarders; updated `authAdmin` and `dashboardAuth` to call `internal.authComponent.*`
  - [x] Switched `viewCounts` slug queries in `convex/posts.ts` to `.unique()`
  - [x] Added root `convex-doctor.toml` (ignore forwarder and `_generated`, disable `correctness/generated-code-modified`)
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` at **91/100**, **0 errors**, **43 warnings**

- [x] Convex doctor fourteenth pass (2026-03-20 08:51 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-fourteenth-pass.md`
  - [x] Collapsed queued URL import completion into one internal mutation in `convex/importJobs.ts` and reduced inline action orchestration in `convex/importAction.ts`
  - [x] Extracted shared frontmatter helpers in `convex/cms.ts` for markdown export queries
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings improved to `1 error / 49 warnings`

- [x] Convex doctor thirteenth pass (2026-03-20 08:33 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-thirteenth-pass.md`
  - [x] Reduced AI chat `generateResponse` run-call chaining by scheduling the chat snapshot and finalizing through one internal mutation
  - [x] Reduced queued image-generation job churn by scheduling the job snapshot and finalizing status plus generated-image metadata through one internal mutation
  - [x] Extracted AI action orchestration into helper functions and removed the remaining `replace` usage in the image job flow
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings improved to `1 error / 54 warnings`

- [x] Convex doctor twelfth pass (2026-03-20 08:18 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-twelfth-pass.md`
  - [x] Moved semantic search to a queued mutation-plus-job flow with persisted job status in `convex/semanticSearchJobs.ts`
  - [x] Updated `src/components/SearchModal.tsx` to debounce job requests and render results from the current job record
  - [x] Added auth-awareness follow-ups in `convex/stats.ts` and `convex/versions.ts`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings improved to `1 error / 60 warnings`

- [x] Convex doctor eleventh pass (2026-03-20 08:15 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-eleventh-pass.md`
  - [x] Replaced browser `resolveDirectUpload` usage with the existing `getDirectStorageUrl` query
  - [x] Made `resolveDirectUpload` internal-only and tightened newsletter sent-post lookups to `.unique()`
  - [x] Added non-breaking auth-awareness to `convex/search.ts`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings reduced to `1 error / 64 warnings`

- [x] Convex doctor tenth pass (2026-03-20 08:24 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-tenth-pass.md`
  - [x] Moved Dashboard URL import to a queued mutation-plus-job flow with persisted import status
  - [x] Tightened the remaining safe config-key `.first()` lookup in `versions.getStats`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` after removing the `importFromUrl` public action warning

- [x] Convex doctor ninth pass (2026-03-20 08:16 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-ninth-pass.md`
  - [x] Moved `files.setFileExpiration` off the public action path by making it internal-only
  - [x] Added auth-awareness to `posts.incrementViewCount`
  - [x] Converted clearly unique-by-design indexed `.first()` lookups to `.unique()`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings reduced to `1 error / 68 warnings`

- [x] Convex doctor eighth pass (2026-03-20 08:10 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-eighth-pass.md`
  - [x] Moved `files.getDownloadUrl` off the public action path by making it internal-only
  - [x] Refactored RSS handlers to helper-wrapped routes in `convex/rss.ts` and `convex/http.ts`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings reduced to `1 error / 84 warnings`

- [x] Convex doctor seventh pass (2026-03-20 08:01 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-seventh-pass.md`
  - [x] Batched sync version scheduling through `versions.createVersionsBatch`
  - [x] Moved `files.commitFile` off the public action path and updated upload UIs to use a mutation
  - [x] Added explicit high bounds to the remaining safe collect-based reads touched in this pass
  - [x] Added explicit return validators across `convex/files.ts`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings reduced to `1 error / 89 warnings`

- [x] Convex doctor sixth pass (2026-03-20 08:36 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-sixth-pass.md`
  - [x] Added sync auth-awareness and moved embedding refresh entrypoints to queued mutations in `convex/embeddingsAdmin.ts`
  - [x] Refactored Ask AI HTTP stream handlers into helper functions wrapped in `convex/http.ts`
  - [x] Added return validation for `askAI.getStreamBody`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with warnings reduced to `98`

- [x] Convex doctor fifth pass (2026-03-20 08:16 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-fifth-pass.md`
  - [x] Added persisted image generation jobs in `convex/schema.ts` and `convex/aiImageJobs.ts`
  - [x] Converted Dashboard image generation to a mutation-scheduled internal action flow
  - [x] Added explicit bounds to remaining public list-style reads touched in `convex/posts.ts`, `convex/pages.ts`, `convex/newsletter.ts`, `convex/stats.ts`, and `convex/authAdmin.ts`
  - [x] Verified `npx convex codegen`, `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with findings reduced to `17 errors / 110 warnings`

- [x] Convex doctor fourth pass (2026-03-20 06:46 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-fourth-pass.md`
  - [x] Refactored `convex/aiChatActions.ts` into helper-driven orchestration and removed the extra storage URL query hop
  - [x] Removed unused `getStorageUrlsBatch` internal query from `convex/aiChats.ts`
  - [x] Added auth-awareness to `regeneratePostEmbedding`, `isConfigured`, `subscribe`, and `unsubscribe`
  - [x] Verified `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with warnings reduced to `130`

- [x] Convex doctor third pass (2026-03-19 07:26 UTC)
  - [x] Created follow-up PRD at `prds/convex-doctor-third-pass.md`
  - [x] Removed safe `collect then filter` pipelines in `convex/posts.ts`, `convex/pages.ts`, and `convex/stats.ts`
  - [x] Added safe auth-awareness checks in `convex/authAdmin.ts`, `convex/contact.ts`, and other public setup helpers
  - [x] Converted safe unique-by-design lookups to `.unique()` in `posts`, `pages`, `askAI`, `aiChats`, `stats`, and `authAdmin`
  - [x] Verified `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with final score `68/100`

- [x] Convex doctor second pass (2026-03-18)
  - [x] Created follow-up PRD at `prds/convex-doctor-second-pass.md`
  - [x] Moved browser AI chat off the direct public action path and onto `aiChats.requestAIResponse`
  - [x] Converted `aiChatActions.generateResponse` to an internal action scheduled from a public mutation
  - [x] Added authenticated ownership tracking for `aiChats`, `askAISessions`, and generated AI images
  - [x] Hardened public AI chat queries and mutations with auth checks and ownership enforcement
  - [x] Added queued generation state and error state handling to AI chat UI and backend
  - [x] Added CORS OPTIONS handlers for public HTTP endpoints flagged by `convex-doctor`
  - [x] Converted post query date sorting to deterministic ISO string comparisons
  - [x] Verified `npx tsc --noEmit`, `npm run build`, and `npx convex-doctor@latest` with final score `66/100`

- [x] Convex doctor remediation (2026-03-18)
  - [x] Phase 1: Added auth to `streamResponse` HTTP action and `generateResponse` public action
  - [x] Created `isCurrentUserDashboardAdminInternal` internal query in `convex/authAdmin.ts`
  - [x] Replaced all `api.*` with `internal.*` in server-to-server calls (`http.ts`, `rss.ts`, `dashboardAuth.ts`, `importAction.ts`)
  - [x] Created internal query equivalents: `getAllPostsInternal`, `getPostBySlugWithContent`, `getAllTagsInternal`, `getAllAuthorsInternal`, `getAllPostsWithContentInternal`, `getAllPagesInternal`, `getPageBySlugInternal`
  - [x] Created `createPostInternal` internal mutation in `cms.ts`
  - [x] Phase 2: Removed `Date.now()` from `stats.getStats` query (now accepts `now` arg)
  - [x] Removed `Date.now()` from `newsletter.getStatsForSummary` (now accepts `now` arg)
  - [x] Updated Stats.tsx and Dashboard.tsx StatsSection with 60-second tick interval
  - [x] Updated `newsletterActions.ts` to pass `now: Date.now()` to `getStatsForSummary`
  - [x] Phase 3: Replaced collect-then-filter in `embeddingsQueries.ts` with async iteration
  - [x] Created `getAllPostsWithContentInternal` batch query to eliminate N+1 in export and RSS
  - [x] Created `getStorageUrlsBatch` internal query to batch-resolve image URLs in AI chat
  - [x] Refactored `generateResponse` to batch-resolve all storage URLs in one query
  - [x] Phase 4: Renamed `by_docsSection` to `by_docs_section` in schema and all callers
  - [x] Removed redundant `by_session` index from `aiChats` table (prefix of `by_session_and_context`)
  - [x] Updated `clearAllChats` to use `by_session_and_context` index prefix
  - [x] Phase 5: Replaced `throw new Error(...)` with `ConvexError` in `dashboardAuth.ts` and `authAdmin.ts`
  - [x] Added `ConvexError` to `aiChatActions.ts` auth check
  - [x] Removed debug `console.log` calls from `dashboardAuth.ts`
  - [x] Created PRD: `prds/convex-doctor-remediation.md`

- [x] Rybbit analytics integration (2026-03-01)
  - [x] Added Rybbit analytics script to `index.html` with site ID `24731ca420a4`
  - [x] Script loads with `defer` for non-blocking page rendering

- [x] WSL 2 Convex setup docs hardening (2026-02-27)
  - [x] Added WSL 2 fallback login flow in `content/blog/setup-guide.md` using `npx convex login --no-open --login-flow paste`
  - [x] Added README fallback setup commands using `npx convex dev --once` for first-time initialization

- [x] TypeScript error fixes (2026-02-27)
  - [x] Removed unused `pathsWithCounts` and `allPathsFromAggregate` variables in `convex/stats.ts`
  - [x] Fixed `fetchpriority` to `fetchPriority` in `src/components/Layout.tsx`
  - [x] Fixed `fetchpriority` to `fetchPriority` in `src/pages/Home.tsx`
  - [x] Fixed `fetchpriority` to `fetchPriority` in `src/pages/Post.tsx` (4 instances)
  - [x] Verified `npx tsc --noEmit` passes with zero errors

- [x] Media Library and router fixes (2026-02-22)
  - [x] Added `RecentUpload` tracking with preview and MD/HTML/URL copy buttons for convex/r2 providers
  - [x] Persisted recent uploads to `sessionStorage` for refresh survival
  - [x] Fixed image preview clipping (aspect-ratio 4:3 + object-fit contain)
  - [x] Removed Bunny CDN gate from ImageUploadModal Media Library tab
  - [x] Made usage text dynamic based on active media provider
  - [x] Added React Router v7 future flags (`v7_startTransition`, `v7_relativeSplatPath`)
  - [x] Removed unused logo preload from `index.html`

- [x] Heartbeat write conflict elimination (2026-02-22)
  - [x] Increased `HEARTBEAT_DEDUP_MS` from 20s to 45s in `convex/stats.ts`
  - [x] Increased `HEARTBEAT_INTERVAL_MS` from 30s to 45s in `usePageTracking.ts`
  - [x] Increased `HEARTBEAT_DEBOUNCE_MS` from 20s to 45s in `usePageTracking.ts`
  - [x] Added BroadcastChannel for cross-tab coordination (only leader tab sends heartbeats)
  - [x] Added tab leadership election with claim/close/heartbeat_sent messages
  - [x] Added `isStatsEnabled` check to `sendHeartbeat` callback for complete disabling
  - [x] Created PRD documentation: `prds/fix-heartbeat-write-conflicts.md`

- [x] Stats performance optimizations (2026-02-21)
  - [x] Added `statsPage.enabled` check in `usePageTracking.ts` to prevent DB writes when stats disabled
  - [x] Removed full table scan fallback in `convex/stats.ts` (trust aggregate counts)
  - [x] Added `uniquePaths` aggregate component in `convex/convex.config.ts`
  - [x] Updated `recordPageView` and backfill to populate `uniquePaths` aggregate
  - [x] Paginated `pageStats` to return top 50 pages by views in `getStats` query
  - [x] Updated `src/pages/Stats.tsx` with "Top Pages by Views" section title
  - [x] Added `.stats-section-subtitle` CSS class for showing count indicator

- [x] Convex-first docs wording cleanup (2026-02-18)
  - [x] Updated `content/pages/about.md` to describe Convex self-hosted default deployment
  - [x] Updated `content/pages/docs.md` to treat Netlify as optional legacy mode
  - [x] Updated `content/pages/docs-content.md` deploy guidance to use `npm run deploy` by default
  - [x] Updated `content/pages/footer.md` messaging to Convex-first wording while preserving legacy note

- [x] Convex one-click deploy readiness pass (2026-02-18)
  - [x] Updated deploy scripts to use CLI-driven self-hosting flow (`deploy`, `upload --build --prod`)
  - [x] Added setup and deployment checks: `scripts/validate-env.ts`, `scripts/verify-deploy.ts`
  - [x] Added npm scripts: `validate:env`, `validate:env:prod`, `verify:deploy`, `verify:deploy:prod`
  - [x] Improved `create-markdown-sync` post-setup guidance for deferred auth setup
  - [x] Added GitHub template one-click path docs in `README.md` and `FORK_CONFIG.md`
  - [x] Added auth setup status query (`authAdmin:getAuthSetupStatus`) and dashboard first-admin guidance

- [x] @robelest/convex-auth GitHub OAuth integration (2026-02-16)
  - [x] Fixed auth client initialization in `src/AppWithWorkOS.tsx` with `ConvexAuthWrapper`
  - [x] Fixed email lookup from auth component in `convex/dashboardAuth.ts` using `components.auth.public.userGetById`
  - [x] Added `extractUserId()` helper to parse userId from "userId|sessionId" format
  - [x] Tested full GitHub OAuth flow with admin email verification
  - [x] Created PRD documentation: `prds/adding-robel-auth.md`
  - [x] Updated fork setup instructions in `FORK_CONFIG.md`

- [x] Migration docs consistency pass (2026-02-16)
  - [x] Aligned Default/Legacy/Local fallback mode wording across `README.md`, `FORK_CONFIG.md`, and `fork-config.json.example`
  - [x] Updated `FORK_CONFIG.md` dashboard authentication section to match admin-only server enforcement
  - [x] Added `compat.legacyDocs` to `fork-config.json.example`
  - [x] Re-ran `npm run lint`, `npm run typecheck`, `npx convex codegen`, and `npm run build`

- [x] Auth + hosting migration baseline implementation (2026-02-16)
  - [x] Added dual mode config contract (`auth.mode`, `hosting.mode`, `media.provider`) in `siteConfig`
  - [x] Added Convex Auth wiring (`convex/auth.ts`) and preserved legacy WorkOS path (`convex/auth.config.ts`)
  - [x] Added Convex self-hosting wiring (`convex/staticHosting.ts`, `registerStaticRoutes`)
  - [x] Added server-side dashboard admin model (`dashboardAdmins`, `authAdmin` APIs, backend admin guards)
  - [x] Added media provider abstraction with direct Convex default and optional ConvexFS/R2 support
  - [x] Updated Dashboard upload components for provider-based upload flows
  - [x] Updated fork and CLI scaffolding defaults to convex-auth + convex-self-hosted + convex media
  - [x] Added custom domain env override support (`VITE_CONVEX_SITE_URL`, `VITE_SITE_URL`)
  - [x] Verified with `npm run typecheck` and `npx convex codegen`

- [x] Remove Quill dependency and replace Dashboard rich text editor (2026-02-16)
  - [x] Replaced Quill integration in `src/pages/Dashboard.tsx` with a simple `contentEditable` editor and toolbar
  - [x] Kept Markdown and Preview modes unchanged
  - [x] Preserved markdown <-> rich text conversion flow
  - [x] Added rich text image insertion support using existing `ImageUploadModal`
  - [x] Updated rich text styles in `src/styles/global.css`
  - [x] Removed Quill dependencies from root and workspace package manifests
  - [x] Verified `npm audit --omit=dev` reports 0 vulnerabilities

- [x] Fix pre-existing TypeScript errors so `npm run typecheck` passes (2026-02-16)
  - [x] Updated `src/components/AskAIModal.tsx`
  - [x] Updated `src/components/Layout.tsx`
  - [x] Updated `src/hooks/useSearchHighlighting.ts`
  - [x] Updated `src/pages/Post.tsx`
  - [x] Re-verified `npm run lint` and `npm run typecheck` both pass

- [x] Runtime smoke-check after TypeScript fixes (2026-02-16)
  - [x] Ask AI modal open, input, and close flow validated
  - [x] Docs landing and docs page navigation validated

- [x] AI generated image true delete with confirmation (v2.20.1)
  - [x] Added `by_storageId` index to `aiGeneratedImages` table in schema.ts
  - [x] Added `deleteGeneratedImage` mutation to aiChats.ts
  - [x] Updated Dashboard AIAgentSection with delete button and confirmation dialog
  - [x] Added CSS styles for delete button and confirmation modal
  - [x] Removed Save to Media Library feature (users can download and re-upload)

- [x] Dashboard frontmatter synchronization and sync warning modal (v2.20.0)
  - [x] Updated ContentItem interface with 19 new frontmatter fields
  - [x] Updated postFrontmatterFields array with all post-specific fields
  - [x] Updated pageFrontmatterFields array with all page-specific fields
  - [x] Updated handleSavePost to include all frontmatter fields
  - [x] Updated handleSavePage to include all frontmatter fields
  - [x] Added SyncWarningModal component for synced content warning
  - [x] Added download and copy buttons to warning modal
  - [x] Added "Save Anyway" option for intentional edits
  - [x] Dashboard-created content bypasses warning
  - [x] Fixed missing unlisted field in sync-posts.ts PostFrontmatter interface
  - [x] Added CSS styles for sync warning modal
  - [x] Created RC1 release blog post at /version-rc1

- [x] npx create-markdown-sync CLI (v2.19.0)
  - [x] Created packages/create-markdown-sync/ monorepo package
  - [x] Interactive wizard with 13 sections (50+ prompts)
  - [x] Clone template from GitHub via giget
  - [x] Configure site settings automatically
  - [x] Install dependencies and set up Convex
  - [x] Disable WorkOS auth by default (empty auth.config.ts)
  - [x] Start dev server and open browser
  - [x] Clear next steps with docs, deployment, and WorkOS links
  - [x] Template fixes for siteConfig.ts embedded quotes
  - [x] npm publishable package

- [x] Related posts thumbnail view with toggle (v2.18.2)
  - [x] Added thumbnail view as default for related posts section
  - [x] Card layout with image on left, title/excerpt/meta on right
  - [x] Added view toggle button (same icons as homepage featured section)
  - [x] Added RelatedPostsConfig interface to siteConfig.ts
  - [x] Added relatedPosts config options: defaultViewMode, showViewToggle
  - [x] Added config UI in Dashboard ConfigSection
  - [x] Updated getRelatedPosts query to return image, excerpt, authorName, authorImage
  - [x] Added localStorage persistence for view mode preference
  - [x] Added ~100 lines of CSS for thumbnail card styles
  - [x] Mobile responsive design for thumbnail cards

- [x] README.md streamlined with docs links (v2.18.1)
  - [x] Reduced from 609 lines to 155 lines
  - [x] Added Documentation section with links to markdown.fast/docs
  - [x] Added Guides subsection with links to specific doc pages
  - [x] Simplified Features section with link to About page
  - [x] Simplified Fork Configuration with doc link
  - [x] Removed detailed sections covered by live docs

- [x] OpenCode AI development tool integration (v2.18.0)
  - [x] Created `.opencode/` directory structure
  - [x] Created `opencode.json` root configuration
  - [x] Created 3 agents: orchestrator, content-writer, sync-manager
  - [x] Created 6 commands: sync, sync-prod, create-post, create-page, import, deploy
  - [x] Adapted 4 skills from .claude/skills/: frontmatter, sync, convex, content
  - [x] Created sync-helper plugin for content change reminders
  - [x] Created docs-opencode.md documentation page
  - [x] Updated files.md with OpenCode Configuration section
  - [x] Works alongside Claude Code and Cursor without conflicts


- [x] ConvexFS Media Library with Bunny CDN (v2.17.0)
  - [x] Installed convex-fs package and configured Convex component
  - [x] Created convex/fs.ts with Bunny CDN configuration
  - [x] Created convex/files.ts with file mutations and queries
  - [x] Added ConvexFS routes to convex/http.ts
  - [x] Created MediaLibrary component with upload, copy, delete
  - [x] Added bulk select and delete functionality
  - [x] Enhanced ImageUploadModal with Media Library tab
  - [x] Added size presets (Original, Large, Medium, Small, Thumbnail, Custom)
  - [x] Added image dimensions display with aspect ratio
  - [x] Added file expiration support via setFileExpiration action
  - [x] Created docs-media-setup.md with ConvexFS documentation links
  - [x] Added ~400 lines of CSS for media library and modal styles

- [x] AI image generation download and copy options (v2.16.4)
  - [x] Added Download button to save generated image to computer
  - [x] Added MD button to copy Markdown code to clipboard
  - [x] Added HTML button to copy HTML code to clipboard
  - [x] Added code preview section showing Markdown and HTML snippets
  - [x] Filename generated from prompt (sanitized and truncated)
  - [x] Added CSS styles for action buttons and code preview

- [x] Social icons in hamburger menu and Dashboard Config (v2.16.3)
  - [x] Added social icons to MobileMenu below navigation links
  - [x] Removed social icons from mobile header (now only in hamburger menu)
  - [x] Added `socialFooter.showInHeader` toggle to Dashboard Config
  - [x] Added `askAI.enabled` toggle to Dashboard Config (new Ask AI card)
  - [x] Added "Configuration alignment" section to CLAUDE.md
  - [x] Added sync comments to siteConfig.ts and Dashboard.tsx ConfigSection
  - [x] Added mobile-menu-social CSS styles
  - [x] Updated files.md, changelog.md, task.md, changelog-page.md

- [x] Ask AI documentation alignment (v2.16.2)
  - [x] Added `askAI` config to `fork-config.json.example`
  - [x] Added Ask AI Configuration section to `FORK_CONFIG.md`
  - [x] Added Ask AI (header chat) section to `docs-dashboard.md`
  - [x] Added Ask AI (header chat) section to `how-to-use-the-markdown-sync-dashboard.md`
  - [x] Updated changelog.md, task.md, changelog-page.md

- [x] Docs layout scrollbar hiding (v2.16.1)
  - [x] Hidden scrollbars on left sidebar, right sidebar, and main docs content
  - [x] Added body:has(.docs-layout) to prevent page-level scrolling
  - [x] Cross-browser support (IE/Edge, Firefox, Chrome/Safari)
  - [x] Scrolling still works via trackpad, wheel, and touch
  - [x] Updated files.md, changelog.md, task.md, changelog-page.md

- [x] Version control system (v2.16.0)
  - [x] Added contentVersions and versionControlSettings tables to schema
  - [x] Created convex/versions.ts with 7 functions (isEnabled, setEnabled, createVersion, getVersionHistory, getVersion, restoreVersion, cleanupOldVersions, getStats)
  - [x] Modified cms.ts to capture versions before dashboard edits
  - [x] Modified posts.ts to capture versions before sync updates
  - [x] Modified pages.ts to capture versions before sync updates
  - [x] Added cleanup cron job (daily at 3 AM UTC) for 3-day retention
  - [x] Created VersionHistoryModal component with diff view and restore functionality
  - [x] Added Version Control card in Dashboard Config section with toggle and stats
  - [x] Added History button in Dashboard editor for viewing version history
  - [x] Added ~370 lines of CSS for version modal UI
  - [x] Updated documentation: docs-dashboard.md, FORK_CONFIG.md, files.md, changelog.md, task.md, changelog-page.md

- [x] Footer not displaying on /docs landing page fix (v2.15.3)
  - [x] DocsPage.tsx was missing Footer component entirely
  - [x] Added Footer import and footerPage query to DocsPage.tsx
  - [x] Added footer rendering logic after BlogPost (same pattern as Post.tsx)
  - [x] Updated getDocsLandingPage query to return showFooter, footer, excerpt, aiChat fields
  - [x] Updated getDocsLandingPost query to return showFooter, footer, aiChat fields
  - [x] Added aiChatEnabled and pageContent props to DocsLayout

- [x] Additional Core Web Vitals CLS and INP improvements (v2.15.1)
  - [x] Added aspect-ratio to blog images and header images to prevent layout shift
  - [x] Added CSS containment to main content areas
  - [x] Added fetchPriority="high" to logo and header images for faster LCP
  - [x] Added will-change to continuous spin animations and marquee

- [x] Additional Core Web Vitals fixes (v2.14.1)
  - [x] Fixed docs-skeleton-pulse animation (background-position to transform: translateX())
  - [x] Added will-change to 6 more animated elements (lightbox, modals, chat, toast)

- [x] Export as PDF option in CopyPageDropdown
  - [x] Added browser print dialog for saving pages as PDF
  - [x] Clean formatted output with markdown syntax stripped
  - [x] Title as heading, metadata on single line, readable content
  - [x] Uses Phosphor FilePdf icon (already installed)
  - [x] Positioned at end of dropdown menu
  - [x] Added formatForPrint function and handleExportPDF handler
  - [x] Updated files.md, changelog.md, task.md documentation

- [x] Core Web Vitals performance optimizations
  - [x] Fixed non-composited animations in visitor map (SVG r to transform: scale)
  - [x] Removed 5 duplicate @keyframes spin definitions
  - [x] Added will-change hints to animated elements
  - [x] Inlined critical CSS in index.html for faster first paint
  - [x] Added preconnect hints for convex.site

- [x] Enhanced diff code block rendering with @pierre/diffs
  - [x] Added @pierre/diffs package for Shiki-based diff visualization
  - [x] Created DiffCodeBlock component with unified/split view toggle
  - [x] Updated BlogPost.tsx to route diff/patch blocks to new renderer
  - [x] Added theme-aware CSS styles for diff blocks
  - [x] Added vendor-diffs chunk to Vite config for code splitting
  - [x] Created "How to Use Code Blocks" blog post with examples
  - [x] Updated files.md with DiffCodeBlock documentation

- [x] Canonical URL mismatch fix (GitHub Issue #6)
  - [x] Raw HTML was serving homepage canonical instead of page-specific canonical
  - [x] Added SEARCH_ENGINE_BOTS array to botMeta.ts for search engine crawler detection
  - [x] Added isSearchEngineBot() helper function
  - [x] Updated condition to serve pre-rendered HTML to search engine bots
  - [x] Added documentation header explaining bot detection configuration
  - [x] Added SEO Bot Configuration section to FORK_CONFIG.md
  - [x] Added SEO and Bot Detection section to setup-guide.md
  - [x] Search engines (Google, Bing, DuckDuckGo, etc.) now receive correct canonical URLs

- [x] SEO fixes for GitHub Issue #4 (7 issues)
  - [x] Canonical URL: Dynamic canonical link tags for posts and pages in Post.tsx
  - [x] Single H1 per page: Markdown H1s demoted to H2 with `.blog-h1-demoted` class in BlogPost.tsx
  - [x] DOM order fix: Article before sidebar in DOM, CSS `order` for visual positioning
  - [x] X-Robots-Tag: HTTP header in netlify.toml (index for public, noindex for dashboard/api)
  - [x] Hreflang tags: Self-referencing hreflang (en, x-default) in index.html, Post.tsx, http.ts
  - [x] og:url consistency: Uses same canonicalUrl variable as canonical link
  - [x] twitter:site: New TwitterConfig in siteConfig.ts with site and creator fields
  - [x] Updated fork-config.json.example with twitter configuration

- [x] Optional semantic search configuration
  - [x] Added `SemanticSearchConfig` interface to `siteConfig.ts`
  - [x] Added `semanticSearch.enabled` toggle (default: false to avoid blocking forks)
  - [x] Updated `SearchModal.tsx` to conditionally show mode toggle
  - [x] Updated `sync-posts.ts` to skip embedding generation when disabled
  - [x] Updated `src/pages/Dashboard.tsx` with semantic search config option
  - [x] Updated `FORK_CONFIG.md` with Semantic Search Configuration section
  - [x] Updated `fork-config.json.example` with semanticSearch option
  - [x] Updated `docs-semantic-search.md` with enable/disable section
  - [x] Updated `docs.md` with semantic search configuration note

- [x] Semantic search with vector embeddings
  - [x] Dual search modes: Keyword (exact match) and Semantic (meaning-based)
  - [x] Toggle between modes in search modal (Cmd+K) with TextAa and Brain icons
  - [x] OpenAI text-embedding-ada-002 for generating 1536-dimension embeddings
  - [x] Similarity scores displayed as percentages in search results
  - [x] Graceful fallback when OPENAI_API_KEY not configured
  - [x] Embeddings generated automatically during `npm run sync`
  - [x] New `convex/embeddings.ts` with embedding generation actions
  - [x] New `convex/embeddingsQueries.ts` with queries and mutations for embedding storage
  - [x] New `convex/semanticSearch.ts` with vector search action
  - [x] New `convex/semanticSearchQueries.ts` with internal queries
  - [x] Added `embedding` field and `by_embedding` vector index to posts and pages
  - [x] Updated SearchModal.tsx with mode toggle and semantic search integration
  - [x] Documentation pages: `docs-search.md` and `docs-semantic-search.md`

- [x] Dashboard Cloud CMS features
  - [x] Dual source architecture: `source: "dashboard"` vs `source: "sync"` coexist independently
  - [x] Direct database operations: "Save to DB" in Write sections, "Save Changes" in editor
  - [x] Source badges in Posts and Pages list views (blue Dashboard, gray Synced)
  - [x] Delete button for dashboard-created content only
  - [x] Delete confirmation modal with warning icon and danger button styling
  - [x] Server-side URL import via Firecrawl (direct to database)
  - [x] Export to markdown for backup or file-based workflow conversion
  - [x] Bulk export script: `npm run export:db` and `npm run export:db:prod`
  - [x] New `convex/cms.ts` with CRUD mutations
  - [x] New `convex/importAction.ts` with Firecrawl action
  - [x] New `scripts/export-db-posts.ts` for bulk export
  - [x] Updated sync mutations to preserve dashboard content

- [x] Rich Text Editor (Quill) in Dashboard
  - [x] Three editing modes: Markdown (default), Rich Text (Quill), Preview
  - [x] Quill toolbar: headers, bold, italic, strikethrough, blockquote, code, lists, links
  - [x] Automatic HTML-to-Markdown conversion on mode switch
  - [x] Theme-aware styling using CSS variables

- [x] Dashboard UI fixes
  - [x] Fixed source badge overlap with edit pencil in list rows
  - [x] Adjusted grid column widths for proper badge display
  - [x] Added source-badge CSS styles with proper spacing

- [x] Write page frontmatter sidebar toggle fix
  - [x] Added CSS rules for `.write-layout.frontmatter-collapsed` to adjust grid when sidebar collapsed
  - [x] Added CSS rules for `.write-layout.sidebar-collapsed.frontmatter-collapsed` for both sidebars collapsed
  - [x] Added responsive tablet styles for frontmatter collapsed state
  - [x] Frontmatter toggle now works consistently in both focus mode and normal mode

- [x] Fork configuration improvements
  - [x] Updated `scripts/configure-fork.ts` to update 3 additional files (DocsPage.tsx, mcp.ts, send-newsletter.ts)
  - [x] Improved `updateOpenApiYaml()` to handle all example URLs in OpenAPI spec
  - [x] Changed logoGallery hrefs from hardcoded markdown.fast URLs to relative URLs
  - [x] Updated `FORK_CONFIG.md` with complete file list (14 files, was 11)
  - [x] Updated `content/blog/fork-configuration-guide.md` with accurate file count
  - [x] Added missing options to `fork-config.json.example` (statsPage, mcpServer, imageLightbox)

- [x] Search result highlighting and scroll-to-match
  - [x] Created `useSearchHighlighting.ts` hook with polling mechanism to wait for content load
  - [x] Search query passed via `?q=` URL parameter for highlighting on destination page
  - [x] All matching text highlighted with theme-appropriate colors (dark/light/tan/cloud)
  - [x] First match scrolls into view centered in viewport with header offset
  - [x] Highlights pulse on arrival, fade to subtle after 4 seconds
  - [x] Press Escape to clear highlights
  - [x] Updated SearchModal.tsx, BlogPost.tsx, Post.tsx, global.css

- [x] Update AI service links to use local /raw URLs
  - [x] Changed ChatGPT, Claude, Perplexity links from GitHub raw URLs to `/raw/{slug}.md`
  - [x] Simplified AI prompt to "Read this URL and summarize it:"
  - [x] Removed unused `siteConfig` import and `getGitHubRawUrl` function
  - [x] URLs now constructed using `window.location.origin` for consistency

- [x] Update raw/index.md to include home.md and footer.md content
  - [x] Updated `generateHomepageIndex` function in `scripts/sync-posts.ts`
  - [x] Home intro content (slug: home-intro) now displays at top of index.md
  - [x] Footer content (slug: footer) now displays at bottom of index.md
  - [x] Horizontal rule separators between sections
  - [x] Falls back to generic message if home-intro page not found
  - [x] Mirrors actual homepage structure for AI agents reading raw markdown

- [x] Fix footer not displaying on docs section pages with showFooter: true
  - [x] Added footer.md content query to Post.tsx (matching Home.tsx and Blog.tsx pattern)
  - [x] Updated all 4 Footer component calls to use `post.footer || footerPage?.content` pattern
  - [x] Footer now falls back to footer.md content when no per-post footer is specified
  - [x] Priority order: per-post frontmatter `footer:` > synced footer.md content > siteConfig.footer.defaultContent
  - [x] Updated docs.md, files.md, changelog.md, changelog-page.md with fix documentation

- [x] Centralize defaultTheme in siteConfig.ts
  - [x] Added `defaultTheme` field to siteConfig.ts (type: `Theme`)
  - [x] Added `Theme` type export to siteConfig.ts
  - [x] Updated ThemeContext.tsx to import and use siteConfig.defaultTheme
  - [x] Updated configure-fork.ts to update siteConfig.ts instead of ThemeContext.tsx
  - [x] Renamed `updateThemeContext` to `updateThemeConfig` in configure-fork.ts
  - [x] Updated docs.md Theme section with new siteConfig.ts example
  - [x] Updated setup-guide.md "Change the Default Theme" section
  - [x] Updated FORK_CONFIG.md with new theme configuration instructions
  - [x] Updated fork-configuration-guide.md with siteConfig.ts reference
  - [x] Backward compatible: falls back to "tan" if defaultTheme not set

- [x] Docs sidebar group icons via frontmatter
  - [x] Added `docsSectionGroupIcon` frontmatter field for posts and pages
  - [x] Icon appears left of the group title expand/collapse chevron
  - [x] Uses Phosphor Icons (55 supported icon names)
  - [x] Icon weight: regular, size: 16px
  - [x] Only one item per group needs to specify the icon
  - [x] Graceful fallback if icon name not recognized
  - [x] Updated sync-posts.ts, schema.ts, posts.ts, pages.ts
  - [x] Updated DocsSidebar.tsx with icon mapping and rendering
  - [x] Added CSS styles for group icons
  - [x] Updated frontmatter.md skill with icon documentation
  - [x] Updated docs.md, files.md, setup-guide.md with new field

- [x] Multi-model AI chat and image generation in Dashboard
  - [x] AI Agent section with tab-based UI (Chat and Image Generation tabs)
  - [x] Multi-model selector for text chat (Claude Sonnet 4, GPT-4o, Gemini 2.0 Flash)
  - [x] Lazy API key validation with friendly setup instructions per provider
  - [x] Image generation with Nano Banana (gemini-2.0-flash-exp-image-generation) and Nano Banana Pro (imagen-3.0-generate-002)
  - [x] Aspect ratio selector for images (1:1, 16:9, 9:16, 4:3, 3:4)
  - [x] Generated images stored in Convex storage with session tracking
  - [x] New `aiDashboard` configuration in siteConfig.ts
  - [x] New `convex/aiImageGeneration.ts` for Gemini image generation
  - [x] New `aiGeneratedImages` table in schema for tracking generated images
  - [x] Updated aiChatActions.ts with multi-provider support (Anthropic, OpenAI, Google)
  - [x] Updated AIChatView.tsx with selectedModel prop
  - [x] CSS styles for AI Agent tabs, model selectors, and image display
  - [x] Updated files.md, changelog.md, TASK.md, changelog-page.md

- [x] Social footer icons in header navigation
  - [x] Added `showInHeader` option to `siteConfig.socialFooter` config
  - [x] Exported `platformIcons` from SocialFooter.tsx for reuse
  - [x] Updated Layout.tsx to render social icons in header (left of search)
  - [x] Added CSS styles for `.header-social-links` and `.header-social-link`
  - [x] Added showInHeader to configure-fork.ts for automated setup
  - [x] Updated FORK_CONFIG.md, fork-config.json.example, docs.md, setup-guide.md

- [x] YouTube and Twitter/X embed support with domain whitelisting
  - [x] Added `ALLOWED_IFRAME_DOMAINS` constant for whitelisted domains (YouTube, Twitter/X)
  - [x] Added `iframe` to sanitize schema with allowed attributes
  - [x] Added custom iframe component handler with domain validation
  - [x] Auto-adds `sandbox` and `loading="lazy"` attributes for security
  - [x] Non-whitelisted iframes silently blocked
  - [x] Added `.embed-container` CSS styles for responsive embeds
  - [x] Updated markdown-with-code-examples.md with Embeds section
  - [x] Works on both blog posts and pages
  - [x] Updated files.md, TASK.md, changelog.md, changelog-page.md

- [x] Author pages at `/author/:authorSlug` with post list
  - [x] Added `by_authorName` index to posts table in convex/schema.ts
  - [x] Added `getAllAuthors` and `getPostsByAuthor` queries in convex/posts.ts
  - [x] Created AuthorPage.tsx component with view mode toggle (list/cards)
  - [x] Added `/author/:authorSlug` route in App.tsx
  - [x] Made authorName clickable in Post.tsx (links to author page)
  - [x] Added author link styles and author page styles to global.css
  - [x] Added author pages to sitemap in convex/http.ts
  - [x] Updated files.md with AuthorPage.tsx documentation
  - [x] Saved implementation plan to prds/authorname-blogs.md

- [x] Homepage intro loading flash fix
  - [x] Removed "Loading..." text from Suspense fallback in main.tsx
  - [x] Fixed Home.tsx conditional to render nothing while homeIntro query loads (undefined vs null)
  - [x] Home intro content now appears without any visible loading state or fallback
  - [x] Matches loading pattern used by Post.tsx for docs pages

- [x] ES module compatibility fix for configure-fork.ts
  - [x] Fixed `__dirname is not defined` error when running `npm run configure`
  - [x] Added `fileURLToPath` import from `url` module
  - [x] Created ES module equivalent of `__dirname` using `import.meta.url`
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md

- [x] Footer content via markdown page (footer.md)
  - [x] Created `content/pages/footer.md` for managing footer content via markdown sync
  - [x] Footer content syncs with `npm run sync` without redeploy needed
  - [x] Falls back to `siteConfig.footer.defaultContent` when page not found
  - [x] Updated Home.tsx and Blog.tsx to fetch footer page by slug
  - [x] Updated files.md, changelog.md, changelog-page.md, FORK_CONFIG.md with documentation

- [x] CLAUDE.md and Claude skills documentation
  - [x] Created CLAUDE.md in root with project instructions for Claude Code
  - [x] Created .claude/skills/ directory with three focused skill files
  - [x] frontmatter.md: Complete frontmatter syntax and all 25+ field options
  - [x] convex.md: Convex patterns specific to this app (indexes, idempotent mutations, conflict prevention)
  - [x] sync.md: How sync commands work and content flow from markdown to database
  - [x] Updated sync-discovery-files.ts to automatically update CLAUDE.md during sync
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md with feature documentation

- [x] Image lightbox for blog posts and pages
  - [x] Added ImageLightboxConfig interface to siteConfig.ts with enabled option
  - [x] Created ImageLightbox component in BlogPost.tsx with backdrop, close button, keyboard support
  - [x] Updated img renderer to add click handler and clickable cursor when lightbox enabled
  - [x] Added CSS styles for lightbox backdrop, image, close button, and caption
  - [x] Added imageLightboxEnabled to Dashboard config generator
  - [x] Updated documentation: docs.md, setup-guide.md, files.md, changelog.md, changelog-page.md
  - [x] Images show pointer cursor and hover effect when lightbox is enabled
  - [x] Lightbox closes on backdrop click, Escape key, or close button
  - [x] Alt text displayed as caption in lightbox
  - [x] Default configuration: enabled: true (lightbox active by default)

- [x] Stats page configuration option for public/private access
  - [x] Added StatsPageConfig interface to siteConfig.ts with enabled and showInNav options
  - [x] Updated App.tsx to conditionally render /stats route based on config
  - [x] Updated Stats.tsx to check if enabled and show disabled message if not
  - [x] Updated Layout.tsx to hide stats nav item when disabled
  - [x] Default configuration: enabled: true (public), showInNav: true (visible in nav)
  - [x] Follows same pattern as NewsletterAdmin for consistency
  - [x] Updated files.md with stats page configuration notes
  - [x] Updated changelog.md with v1.43.0 entry
  - [x] Updated TASK.md with completed task

- [x] Honeypot bot protection for contact and newsletter forms
  - [x] Added honeypot state and hidden field to ContactForm.tsx
  - [x] Added honeypot state and hidden field to NewsletterSignup.tsx
  - [x] Hidden "Website" field for contact form bot detection
  - [x] Hidden "Fax" field for newsletter signup bot detection
  - [x] Bots receive fake success message (no data submitted)
  - [x] CSS positioning (position: absolute, left: -9999px) hides fields from users
  - [x] aria-hidden="true" and tabIndex={-1} for accessibility
  - [x] Different field names per form to avoid pattern detection
  - [x] Updated files.md with honeypot protection notes
  - [x] Updated changelog.md with v1.42.0 entry

- [x] Blog heading styles for home intro content
  - [x] Added generateSlug, getTextContent, HeadingAnchor helper functions to Home.tsx
  - [x] Updated ReactMarkdown components to include h1-h6 with blog-h\* classes
  - [x] Added clickable anchor links (#) that appear on hover for each heading
  - [x] Automatic ID generation from heading text for anchor navigation
  - [x] Added blog styling for lists (blog-ul, blog-ol, blog-li), blockquotes (blog-blockquote), horizontal rules (blog-hr), and links (blog-link)
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md with feature documentation
  - [x] Home intro headings now match blog post typography and spacing

- [x] Synced home intro content via markdown file (home.md)
  - [x] Created content/pages/home.md (slug: home-intro) for homepage intro text
  - [x] Home.tsx fetches content from Convex via getPageBySlug query
  - [x] Added textAlign frontmatter field for pages (left/center/right, default: left)
  - [x] Added featuredTitle to siteConfig.ts for configurable featured section title
  - [x] Full markdown support with links, headings, lists, blockquotes, horizontal rules
  - [x] External links automatically open in new tab
  - [x] Fallback to siteConfig.bio if home-intro page not found (loading/error states)
  - [x] Content syncs with npm run sync (no redeploy needed for homepage text changes)
  - [x] Updated convex/schema.ts with textAlign field
  - [x] Updated convex/pages.ts with textAlign in queries and mutations
  - [x] Updated scripts/sync-posts.ts to parse textAlign from frontmatter
  - [x] Updated src/styles/global.css with home-intro-content styles
  - [x] Updated files.md, changelog.md, TASK.md documentation

- [x] HTTP-based MCP Server on Netlify
  - [x] Created netlify/edge-functions/mcp.ts with JSON-RPC 2.0 implementation
  - [x] Added @modelcontextprotocol/sdk dependency to package.json
  - [x] Configured Netlify rate limiting (50 req/min public, 1000 req/min authenticated)
  - [x] Implemented optional authentication via Authorization header
  - [x] Added /mcp edge function route to netlify.toml
  - [x] Created blog post "How to Use the MCP Server" with fork setup instructions
  - [x] Updated documentation (docs.md, setup-guide.md, files.md, changelog.md, README.md)
  - [x] Added MCP configuration to siteConfig.ts
  - [x] Seven tools implemented: list_posts, get_post, list_pages, get_page, get_homepage, search_content, export_all
  - [x] CORS support for MCP clients
  - [x] Manual JSON-RPC implementation (no SDK dependency on Deno runtime)

- [x] Newsletter CLI improvements
  - [x] Updated newsletter:send to call scheduleSendPostNewsletter mutation directly
  - [x] Added newsletter:send:stats command for weekly stats summary
  - [x] Created scheduleSendStatsSummary mutation in convex/newsletter.ts
  - [x] Created send-newsletter-stats.ts script
  - [x] Verified all AgentMail features use environment variables (no hardcoded emails)
  - [x] Updated documentation (docs.md, files.md, changelog.md, changelog-page.md, TASK.md)
  - [x] Created blog post "How to use AgentMail with Markdown Sync"

- [x] showImageAtTop frontmatter field for posts and pages
  - [x] Added showImageAtTop optional boolean field to convex/schema.ts for posts and pages
  - [x] Updated scripts/sync-posts.ts to parse showImageAtTop from frontmatter
  - [x] Updated convex/posts.ts and convex/pages.ts queries and mutations to include showImageAtTop
  - [x] Updated src/pages/Post.tsx to conditionally render image at top when showImageAtTop: true
  - [x] Added CSS styles for .post-header-image and .post-header-image-img
  - [x] Updated src/pages/Write.tsx to include showImageAtTop in POST_FIELDS and PAGE_FIELDS
  - [x] Updated documentation: docs.md, how-to-publish.md, using-images-in-posts.md, files.md
  - [x] Image displays full-width above post header with rounded corners
  - [x] Default behavior: image only used for OG and featured cards when showImageAtTop not set

- [x] Blog page featured layout with hero post
  - [x] `blogFeatured` frontmatter field for posts to mark as featured on blog page
  - [x] `BlogHeroCard` component for the hero featured post (first blogFeatured post)
  - [x] Featured row displays remaining blogFeatured posts in 2-column grid with excerpts
  - [x] Regular posts display in 3-column grid without excerpts
  - [x] `getBlogFeaturedPosts` query returns all published posts with `blogFeatured: true`
  - [x] `PostList` component updated with `columns` prop (2 or 3) and `showExcerpts` prop
  - [x] Schema updated with `blogFeatured` field and `by_blogFeatured` index
  - [x] sync-posts.ts updated to parse `blogFeatured` frontmatter
  - [x] Hero card displays landscape image, tags, date, title, excerpt, author info, and read more link
  - [x] Featured row shows excerpts for blogFeatured posts
  - [x] Regular posts hide excerpts for cleaner grid layout
  - [x] Responsive design: hero stacks on mobile, grids adjust columns at breakpoints
  - [x] CSS styles for `.blog-hero-section`, `.blog-hero-card`, `.blog-featured-row`, `.post-cards-2col`
  - [x] Card images use 16:10 landscape aspect ratio matching Giga.ai style
  - [x] Footer support on blog page via `siteConfig.footer.showOnBlogPage`

- [x] AI Chat Write Agent (Agent) integration
  - [x] AIChatView component created with Anthropic Claude API integration
  - [x] Write page AI Agent mode toggle (replaces textarea when active)
  - [x] RightSidebar AI chat support via frontmatter aiChat: true field
  - [x] Per-session, per-context chat history stored in Convex (aiChats table)
  - [x] Page content context support for AI responses
  - [x] Markdown rendering for AI responses with copy functionality
  - [x] Error handling for missing API keys with user-friendly messages
  - [x] System prompt configurable via Convex environment variables
  - [x] Anonymous session authentication using localStorage session ID
  - [x] Chat history limited to last 20 messages for context efficiency
  - [x] Title changes to "Agent" when in AI chat mode on Write page
  - [x] Toggle button text changes between "Agent" and "Text Editor"
  - [x] SiteConfig.aiChat configuration with enabledOnWritePage and enabledOnContent flags
  - [x] Schema updated with aiChats table and aiChat fields on posts/pages tables
  - [x] sync-posts.ts updated to handle aiChat frontmatter field
  - [x] Documentation updated across all files

- [x] Fixed AI chat scroll prevention in Write page
  - [x] Added viewport height constraints (100vh) to write-layout to prevent page-level scrolling
  - [x] Updated write-main with max-height: 100vh and overflow: hidden when AI chat is active
  - [x] Added min-height: 0 to flex children (write-ai-chat-container, ai-chat-view, ai-chat-messages) for proper flex behavior
  - [x] Input container fixed at bottom with flex-shrink: 0
  - [x] Sidebars (left and right) scroll internally with overflow-y: auto
  - [x] Delayed focus in AIChatView (100ms setTimeout) to prevent scroll jump on mount
  - [x] Added preventScroll: true to all focus() calls in AIChatView
  - [x] Toggle button preserves scroll position using requestAnimationFrame
  - [x] useEffect scrolls to top when switching to AI chat mode
  - [x] Messages area scrolls internally while input stays fixed at bottom (ChatGPT-style behavior)

- [x] Custom homepage configuration feature
  - [x] Added HomepageConfig interface to siteConfig.ts
  - [x] Updated App.tsx to conditionally render homepage based on config
  - [x] Updated Post.tsx to accept optional props for homepage mode (slug, isHomepage, homepageType)
  - [x] Back button hidden when Post component is used as homepage
  - [x] Original homepage route accessible at /home when custom homepage is set
  - [x] SEO metadata uses page/post frontmatter when used as homepage
  - [x] Updated configure-fork.ts to support homepage configuration
  - [x] Updated FORK_CONFIG.md with homepage documentation
  - [x] Updated fork-config.json.example with homepage option
  - [x] All existing features (sidebar, footer, right sidebar) work correctly with custom homepage

- [x] Image support in footer component with size control
  - [x] Footer sanitize schema updated to allow width, height, style, class attributes on images
  - [x] Footer image component handler updated to pass through size attributes
  - [x] CSS styles added for footer images (.site-footer-image-wrapper, .site-footer-image, .site-footer-image-caption)
  - [x] Images support lazy loading and optional captions from alt text
  - [x] Security verified: rehypeSanitize sanitizes style attributes to remove dangerous CSS
  - [x] Updated files.md, changelog.md with image support documentation

- [x] Customizable footer component with markdown support
  - [x] Footer component created (src/components/Footer.tsx) with ReactMarkdown rendering
  - [x] Footer configuration added to siteConfig.ts (FooterConfig interface with defaultContent)
  - [x] Footer content can be set in frontmatter footer field (markdown) or siteConfig.defaultContent
  - [x] Footer can be enabled/disabled globally and per-page type
  - [x] showFooter and footer frontmatter fields added for posts and pages
  - [x] Footer renders inside article tag at bottom for posts/pages
  - [x] Footer maintains current position on homepage
  - [x] Updated Home.tsx to use Footer component with defaultContent
  - [x] Updated Post.tsx to render Footer inside article based on showFooter
  - [x] Added CSS styles for site-footer (.site-footer, .site-footer-content, .site-footer-text, .site-footer-link)
  - [x] Updated schema.ts, posts.ts, pages.ts with showFooter and footer fields
  - [x] Updated sync-posts.ts to parse showFooter and footer frontmatter
  - [x] Updated Write.tsx to include showFooter and footer in frontmatter reference
  - [x] Sidebars flush to bottom when footer is enabled (min-height ensures proper extension)
  - [x] Updated files.md, changelog.md with footer feature documentation

- [x] Fixed right sidebar default behavior: now requires explicit `rightSidebar: true` in frontmatter
- [x] Pages/posts without rightSidebar frontmatter render normally with CopyPageDropdown in nav
- [x] Fixed TypeScript errors: Added rightSidebar to syncPosts and syncPostsPublic args validators
- [x] Right sidebar feature with CopyPageDropdown support
- [x] RightSidebar component created
- [x] Three-column layout CSS (left sidebar, main content, right sidebar)
- [x] Right sidebar configuration in siteConfig.ts
- [x] rightSidebar frontmatter field for posts and pages
- [x] Updated Post.tsx to conditionally render right sidebar
- [x] Updated schema.ts, posts.ts, pages.ts to handle rightSidebar field
- [x] Updated sync-posts.ts to parse rightSidebar frontmatter
- [x] Updated Write.tsx to include rightSidebar option
- [x] Responsive behavior: right sidebar hidden below 1135px
- [x] CopyPageDropdown automatically moves from nav to right sidebar when enabled

- [x] Font family configuration system with siteConfig integration
- [x] Added FontContext.tsx for global font state management
- [x] Monospace font option added to FONT SWITCHER (IBM Plex Mono)
- [x] CSS variable --font-family for dynamic font updates
- [x] Write page font switcher updated to support serif/sans/monospace
- [x] Fork configuration support for fontFamily option
- [x] Documentation updated (setup-guide.md, docs.md)
- [x] Font preference persistence with localStorage
- [x] SiteConfig default font detection and override logic

- [x] Plain text code blocks now wrap text properly instead of horizontal overflow
- [x] Updated inline vs block code detection logic in BlogPost.tsx
- [x] Added `pre-wrap` styling for text blocks via SyntaxHighlighter props
- [x] RSS feed validation errors fixed by standardizing URLs to www.markdown.fast
- [x] Updated index.html meta tags (og:url, og:image, twitter:domain, twitter:url, twitter:image, JSON-LD)
- [x] Updated convex/rss.ts and convex/http.ts SITE_URL constants
- [x] Updated public/robots.txt, public/openapi.yaml, and public/llms.txt with www URLs
- [x] RSS exclusions confirmed in netlify.toml for botMeta edge function
- [x] Discovery files sync script (sync-discovery-files.ts)
- [x] Automated updates for AGENTS.md and llms.txt with current app data
- [x] New npm scripts: sync:discovery, sync:discovery:prod, sync:all, sync:all:prod
- [x] Fork configuration updated to support gitHubRepo config
- [x] Backward compatibility for legacy githubUsername/githubRepo fields
- [x] Documentation updated across all files with new sync commands

- [x] Homepage post limit configuration (homePostsLimit in siteConfig.postsDisplay)
- [x] Optional "read more" link below limited post list (homePostsReadMore config)
- [x] Customizable link text and destination URL
- [x] CSS styling for read more link with hover effects
- [x] Conditional rendering logic to show link only when posts are limited
- [x] Tag pages at `/tags/[tag]` route with view mode toggle
- [x] Related posts component for blog post footers (up to 3 related posts by shared tags)
- [x] Tag links in post footers now navigate to tag archive pages
- [x] Open in AI links (ChatGPT, Claude, Perplexity) re-enabled using GitHub raw URLs
- [x] `gitHubRepo` configuration in siteConfig.ts for AI service URL construction
- [x] `by_tags` index added to posts table in convex/schema.ts
- [x] New Convex queries: `getAllTags`, `getPostsByTag`, `getRelatedPosts`
- [x] Sitemap updated to include dynamically generated tag pages
- [x] Documentation updated with git push requirement for AI links
- [x] Mobile responsive styling for tag pages and related posts
- [x] Fixed sidebar border width consistency using box-shadow instead of border-right
- [x] Hidden sidebar scrollbar while maintaining scroll functionality
- [x] Added top border and border-radius to sidebar wrapper using CSS variables
- [x] Updated CSS documentation for sidebar border implementation
- [x] Fixed mobile menu breakpoint to match sidebar hide breakpoint (1024px)
- [x] Mobile hamburger menu now shows whenever sidebar is hidden
- [x] add MIT Licensed. Do whatevs.
- [x] Blog page view mode toggle (list and card views)
- [x] Post cards component with thumbnails, titles, excerpts, and metadata
- [x] View preference saved to localStorage
- [x] Default view mode configurable in siteConfig.blogPage.viewMode
- [x] Toggle visibility controlled by siteConfig.blogPage.showViewToggle
- [x] Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- [x] Theme-aware styling for all four themes
- [x] Raw markdown files now accessible to AI crawlers (ChatGPT, Perplexity)
- [x] Added /raw/ path bypass in botMeta edge function
- [x] Sitemap now includes static pages (about, docs, contact, etc.)
- [x] Security headers added to netlify.toml
- [x] Link header pointing to llms.txt for AI discovery
- [x] Preconnect hints for Convex backend
- [x] Fixed URL consistency in openapi.yaml and robots.txt
- [x] Write conflict prevention: increased dedup windows, added heartbeat jitter
- [x] Visitor map styling: removed box-shadow, increased land dot contrast and opacity
- [x] Real-time visitor map on stats page showing live visitor locations
- [x] Netlify edge function for geo detection (geo.ts)
- [x] VisitorMap component with dotted world map and pulsing dots
- [x] Theme-aware colors for all four themes (dark, light, tan, cloud)
- [x] visitorMap config option in siteConfig.ts to enable/disable
- [x] Privacy friendly: no IP addresses stored, only city/country/coordinates
- [x] Documentation updated: setup-guide, docs, FORK_CONFIG, fork-config.json.example

- [x] Author display for posts and pages with authorName and authorImage frontmatter fields
- [x] Round avatar image displayed next to date and read time on post/page views
- [x] Write page updated with new frontmatter field reference
- [x] Documentation updated: setup-guide.md, docs.md, files.md, README.md, AGENTS.md
- [x] PRD created: prds/howto-Frontmatter.md with reusable prompt for future updates
- [x] GitHub Stars card on Stats page with live count from repository

- [x] CopyPageDropdown AI services now use raw markdown URLs for better AI parsing
- [x] ChatGPT, Claude, and Perplexity receive /raw/{slug}.md URLs instead of page URLs
- [x] Automated fork configuration with npm run configure
- [x] FORK_CONFIG.md comprehensive guide with two options (automated + manual)
- [x] fork-config.json.example template with all configuration options
- [x] scripts/configure-fork.ts for automated updates
- [x] Updates all 11 configuration files in one command

- [x] GitHub contributions graph on homepage with theme-aware colors
- [x] Year navigation with Phosphor icons (CaretLeft, CaretRight)
- [x] Click graph to visit GitHub profile
- [x] Configurable via siteConfig.gitHubContributions
- [x] Theme-specific contribution colors for all 4 themes
- [x] Mobile responsive design with scaled cells

- [x] Public /write page with three-column layout (not linked in nav)
- [x] Left sidebar: Home link, content type selector, actions (Clear, Theme, Font)
- [x] Center: Writing area with Copy All button and borderless textarea
- [x] Right sidebar: Frontmatter reference with per-field copy buttons
- [x] Font switcher to toggle between Serif and Sans-serif fonts
- [x] Font preference persistence in localStorage
- [x] Theme toggle icons matching ThemeToggle.tsx (Moon, Sun, Half2Icon, Cloud)
- [x] Content type switching (Blog Post/Page) updates writing area template
- [x] Word, line, and character counts in status bar
- [x] Warning banner about refresh losing content
- [x] localStorage persistence for content, type, and font
- [x] Redesign /write page with three-column Cursor docs-style layout
- [x] Add per-field copy icons to frontmatter reference panel
- [x] Add refresh warning message in left sidebar
- [x] Left sidebar with home link, content type selector, and actions
- [x] Right sidebar with frontmatter fields and copy buttons
- [x] Center area with title, Copy All button, and borderless textarea
- [x] Theme toggle with matching icons for all four themes
- [x] Redesign /write page with wider layout and modern Notion-like UI
- [x] Remove header from /write page (standalone writing experience)
- [x] Add inline theme toggle and home link to Write page toolbar
- [x] Collapsible frontmatter fields panel
- [x] Add markdown write page with copy option at /write
- [x] Centralized font-size CSS variables in global.css
- [x] Base size scale with semantic naming (3xs to hero)
- [x] Component-specific font-size variables
- [x] Mobile responsive font-size overrides
- [x] Open Graph image fix for posts and pages with frontmatter images
- [x] Dedicated blog page with configurable display options
- [x] Blog page navigation order via siteConfig.blogPage.order
- [x] Centralized siteConfig.ts for site configuration
- [x] Posts display toggle for homepage and/or blog page
- [x] move home to the top of the mobile menu
- [x] Fork configuration documentation in docs.md and setup-guide.md
- [x] "Files to Update When Forking" section with all 9 configuration files
- [x] Backend configuration examples for Convex files
- [x] Site branding updates across all AI discovery files
- [x] Fork documentation added to README.md
- [x] Blog post updated with v1.9.0 and v1.10.0 features
- [x] Scroll-to-top button with configurable threshold
- [x] Scroll-to-top documentation in docs.md and setup-guide.md
- [x] Mobile menu with hamburger navigation for mobile and tablet
- [x] Generate Skill feature in CopyPageDropdown
- [x] Project setup with Vite + React + TypeScript
- [x] Convex schema for posts, viewCounts, siteConfig, pages
- [x] Build-time markdown sync script
- [x] Theme system (dark/light/tan/cloud)
- [x] Default theme configuration (tan)
- [x] Home page with year-grouped post list
- [x] Post page with markdown rendering
- [x] Static pages support (About, Projects, Contact)
- [x] Syntax highlighting for code blocks
- [x] Open Graph and Twitter Card meta tags
- [x] Netlify edge function for bot detection
- [x] RSS feed support (standard and full content)
- [x] API endpoints for LLMs (/api/posts, /api/post)
- [x] Copy Page dropdown for AI tools
- [x] Sample blog posts and pages
- [x] Security audit completed
- [x] TypeScript type-safety verification
- [x] Netlify build configuration verified
- [x] SPA 404 fallback configured
- [x] Mobile responsive design
- [x] Edge functions for dynamic Convex HTTP proxying
- [x] Vite dev server proxy for local development
- [x] Real-time stats page at /stats
- [x] Page view tracking with event records pattern
- [x] Active session heartbeat system
- [x] Cron job for stale session cleanup
- [x] Stats link in homepage footer
- [x] Real-time search with Command+K shortcut
- [x] Search modal with keyboard navigation
- [x] Full text search indexes for posts and pages
- [x] Featured section with list/card view toggle
- [x] Logo gallery with continuous marquee scroll
- [x] Frontmatter-controlled featured items (featured, featuredOrder)
- [x] Featured items sync with npm run sync (no redeploy needed)
- [x] Firecrawl content importer (npm run import)
- [x] /api/export endpoint for batch content fetching
- [x] AI plugin discovery at /.well-known/ai-plugin.json
- [x] OpenAPI 3.0 spec at /openapi.yaml
- [x] AGENTS.md for AI coding agents
- [x] Static raw markdown files at /raw/{slug}.md
- [x] View as Markdown option in CopyPageDropdown
- [x] Perplexity added to AI service options
- [x] Featured image support with square thumbnails in card view
- [x] Improved markdown table CSS styling
- [x] Aggregate component integration for efficient stats counting (O(log n) vs O(n))
- [x] Three aggregate components: pageViewsByPath, totalPageViews, uniqueVisitors
- [x] Chunked backfilling mutation for existing page view data
- [x] Aggregate component registration in convex.config.ts
- [x] Stats query updated to use aggregate counts
- [x] Aggregate component documentation in prds/howstatsworks.md
- [x] Sidebar navigation anchor links fixed for collapsed/expanded sections
- [x] Navigation scroll calculation with proper header offset (80px)
- [x] Expand ancestors before scrolling to ensure target visibility
- [x] Removed auto-expand from scroll handler to preserve manual collapse state
- [x] Collapse button event handling improved to prevent link navigation
- [x] Heading extraction updated to filter out code blocks
- [x] Sidebar no longer shows example headings from markdown code examples
- [x] Mobile menu redesigned with left-aligned navigation controls
- [x] Hamburger menu order changed (hamburger, search, theme toggle)
- [x] Sidebar table of contents integrated into mobile menu
- [x] Desktop sidebar hidden on mobile when sidebar layout is enabled
- [x] SidebarContext created to share sidebar data between components
- [x] Mobile menu typography standardized with CSS variables
- [x] Font-family standardized using inherit for consistency
- [x] `showInNav` field for pages to control navigation visibility
- [x] Pages can be published but hidden from navigation menu
- [x] Defaults to `true` for backwards compatibility
- [x] Pages with `showInNav: false` remain accessible via direct URL, searchable, and available via API
- [x] Hardcoded navigation items configuration in siteConfig.ts
- [x] Add React route pages (like /stats, /write) to navigation via hardcodedNavItems
- [x] Configure navigation order, title, and visibility per route
- [x] Navigation combines Blog link, hardcoded nav items, and markdown pages
- [x] All nav items sorted by order field (lower = first)

## Deployment Steps

1. Run `npx convex dev` to initialize Convex
2. Set `CONVEX_DEPLOY_KEY` in Netlify environment variables
3. Connect repo to Netlify and deploy
4. Edge functions automatically handle RSS, sitemap, and API routes

## Someday Features TBD

- [ ] Newsletter signup
- [ ] Comments system
- [ ] Draft preview mode
