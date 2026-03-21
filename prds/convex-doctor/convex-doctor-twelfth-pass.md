# Convex doctor twelfth pass

Created: 2026-03-20 08:18 UTC
Last Updated: 2026-03-20 08:18 UTC
Status: Done

## Summary

Move semantic search off the direct browser action path by replacing it with a queued job flow that preserves the Search modal UX while clearing the paired performance and auth warnings.

## Problem

`semanticSearch` is still a public Node action called directly from the browser. It is now the top remaining browser-action warning and is also flagged for missing auth-awareness.

## Root cause

The semantic search feature predates the queued-job cleanup pattern used for image generation and URL import. It returns results directly from a public action instead of using a mutation plus persisted job state.

## Proposed solution

- Add a persisted `semanticSearchJobs` table
- Create `convex/semanticSearchJobs.ts` with public request and status functions plus internal completion or failure handlers
- Convert `convex/semanticSearch.ts` into an internal action job processor
- Update `SearchModal.tsx` to debounce requests through the new mutation and subscribe to the current job result
- Convert `isSemanticSearchAvailable` to a query so the file no longer exposes browser-callable public actions

## Files to change

- `convex/schema.ts`
- `convex/semanticSearchJobs.ts`
- `convex/semanticSearch.ts`
- `src/components/SearchModal.tsx`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- The semantic search modal should still feel responsive while the debounced request and job handoff happen
- Empty queries should still short-circuit without generating unnecessary jobs
- If OpenAI is not configured, the failure state should resolve cleanly without hanging the modal

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved the baseline from `81/100` with `1 error / 64 warnings` to `84/100` with `1 error / 60 warnings`

## Related

- `prds/convex-doctor-eleventh-pass.md`
- `prds/convex-doctor-tenth-pass.md`
