# Convex doctor remediation

## Summary

Address the 73 errors, 243 warnings, and 48 infos flagged by convex-doctor v0.3.3 (score 42/100) without breaking existing product behavior. AI chat and streaming endpoints will move from public/anonymous to authenticated access.

## Problem

The codebase has accumulated static analysis debt across security, correctness, performance, schema, and architecture categories. The highest impact issues are:

- HTTP actions and public actions missing authentication (security errors)
- Server-to-server calls using `api.*` instead of `internal.*` (security errors)
- `Date.now()` inside query functions breaking caching and determinism (perf/correctness errors)
- Unbounded `.collect()` calls and N+1 query patterns (perf errors)
- Large monolithic handlers and mixed public/internal exports (arch warnings)

## Root cause

Organic feature growth without periodic static analysis. Many patterns were valid during early development but became anti-patterns as the codebase scaled.

## Proposed solution

Five phased passes, each independently testable:

### Phase 1: Security and correctness

- Add auth to `streamResponse` in `convex/askAI.node.ts`
- Convert `generateResponse` from public action to mutation-scheduled internal action
- Replace all `api.*` references in server-to-server calls with `internal.*` equivalents
- Create `internal.authAdmin.isCurrentUserDashboardAdminInternal` for backend use
- Audit `.first()` calls on unique-by-design indexes and convert to `.unique()` where safe

### Phase 2: Deterministic queries

- Remove `Date.now()` from `stats.getStats` by accepting `now` as an argument
- Remove `Date.now()` from `newsletter.getStatsForSummary` by accepting `now` as an argument
- Update all call sites (frontend hooks, cron callers, action callers) to pass timestamps

### Phase 3: Performance

- Extract helper functions from `generateResponse` to reduce `ctx.run*` chain depth
- Replace `.collect().filter().slice()` in embedding queries with bounded index reads
- Add internal batch query helpers for HTTP/RSS endpoints to eliminate N+1 patterns
- Bound or paginate public `.collect()` queries

### Phase 4: Schema alignment

- Rename camelCase indexes to snake_case convention (`by_docsSection` to `by_docs_section`)
- Remove redundant `by_session` index on `aiChats` (prefix of `by_session_and_context`)
- Add `_storage` foreign key indexes only where actual query patterns exist

### Phase 5: Architecture cleanup

- Split `aiChatActions.ts` into provider modules and an orchestration file
- Replace `throw new Error(...)` with `ConvexError` in user-facing handlers
- Remove debug `console.log` calls in `dashboardAuth.ts`

## Files to change

- `convex/askAI.node.ts` - add auth to streaming endpoint
- `convex/aiChatActions.ts` - refactor generateResponse, split into modules
- `convex/dashboardAuth.ts` - replace api.* call, remove console.log
- `convex/authAdmin.ts` - add internal query variant, fix component ref
- `convex/http.ts` - switch to internal.* references, add CORS OPTIONS handlers
- `convex/rss.ts` - switch to internal.* references, batch queries
- `convex/importAction.ts` - switch api.cms.* to internal.*
- `convex/stats.ts` - make getStats deterministic
- `convex/newsletter.ts` - make getStatsForSummary deterministic, bound collects
- `convex/posts.ts` - bound collects, add internal helpers
- `convex/pages.ts` - bound collects, add internal helpers
- `convex/embeddings.ts` - reduce ctx.runAction chain
- `convex/embeddingsQueries.ts` - replace collect-then-filter
- `convex/versions.ts` - minor .first() audit
- `convex/schema.ts` - rename indexes, remove redundant index
- `src/pages/Stats.tsx` or `src/hooks/usePageTracking.ts` - pass timestamp to query
- `src/pages/Dashboard.tsx` - pass timestamp to newsletter stats if needed

## Edge cases and gotchas

- `stats.getStats` uses `Date.now()` for active session cutoff. Passing `now` from the client means the reactive subscription will update on each render. Use a 60-second rounded timestamp to keep reactivity stable.
- `by_session` index on `aiChats` may be used by cleanup crons or session listing. Verify all callers before removing.
- Switching `api.*` to `internal.*` in `http.ts` requires creating internal equivalents of every public query called there.
- The `components.auth.public.userList` call is a component API, not a regular function reference. It may not be fixable without changes to the auth component.
- `.first()` to `.unique()` conversions can throw at runtime if data has duplicates. Only convert where the index enforces uniqueness by design.

## Verification

- [ ] Dashboard login, admin check, and upload flow work after Phase 1
- [ ] Ask AI streaming requires auth after Phase 1
- [ ] AI chat in dashboard and sidebar requires auth after Phase 1
- [ ] RSS, sitemap, API endpoints return same data after Phase 1
- [ ] Stats page shows correct active visitors after Phase 2
- [ ] Newsletter stats load correctly after Phase 2
- [ ] Embedding generation processes content after Phase 3
- [ ] `/api/export` returns all posts with content after Phase 3
- [ ] All indexes renamed without breaking queries after Phase 4
- [ ] `convex-doctor` score improves after each phase
- [ ] `npx tsc --noEmit` passes after all phases
- [ ] `npm run build` succeeds after all phases

## Related

- [convex-doctor](https://github.com/nooesc/convex-doctor) - static analysis tool
- [Convex write conflicts PRD](prds/howtoavoidwriteconflicts.md)
- [Stats architecture PRD](prds/howstatsworks.md)
