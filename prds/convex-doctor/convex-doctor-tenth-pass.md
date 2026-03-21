# Convex doctor tenth pass

Created: 2026-03-20 08:11 UTC
Last Updated: 2026-03-20 08:24 UTC
Status: Done

## Summary

Remove the next browser-callable action warning by moving Dashboard URL import to a queued job flow, then tighten the last obviously unique config-key lookup that remained after the ninth pass.

## Problem

The current high-value warning is `importFromUrl`, which is still a public Node action called from the Dashboard. A smaller follow-up item is the remaining config-key `.first()` in `versions.getStats`.

## Root cause

The import flow predates the queued-action cleanup pattern used for AI image generation and chat responses. It returns results directly from a public action instead of scheduling background work through a mutation and persisted job record.

## Proposed solution

- Add a persisted `importUrlJobs` table for reactive Dashboard import status
- Create public mutation and query entrypoints in `convex/importJobs.ts`
- Convert `convex/importAction.ts` into an internal action that processes a queued job
- Update `Dashboard.tsx` to request an import job and render success or failure from job state
- Tighten the remaining `versionControlSettings.by_key` lookup in `versions.getStats` from `.first()` to `.unique()`

## Files to change

- `convex/schema.ts` - add persisted URL import job table
- `convex/importJobs.ts` - request, status, and internal completion or failure handlers
- `convex/importAction.ts` - convert to internal queued job processor
- `src/pages/Dashboard.tsx` - use mutation plus query instead of a direct action
- `convex/versions.ts` - tighten the remaining config-key lookup
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- The Dashboard import UX should still show pending, success, and failure clearly
- Firecrawl configuration errors need to surface back through the job record
- Slug conflict fallback must still work after the action becomes queued

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` removed the `importFromUrl` public action warning while landing at `80/100` with `1 error / 68 warnings`

## Related

- `prds/convex-doctor-ninth-pass.md`
- `prds/convex-doctor-eighth-pass.md`
