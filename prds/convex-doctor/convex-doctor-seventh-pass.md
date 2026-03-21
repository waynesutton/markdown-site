# Convex doctor seventh pass

Created: 2026-03-20 07:50 UTC
Last Updated: 2026-03-20 08:01 UTC
Status: Done

## Summary

Reduce the next obvious `convex-doctor` findings by batching version snapshot scheduling during sync, moving `commitFile` off the public action path, and capping the remaining safe unbounded collects in internal and admin queries.

## Problem

The repo reached `67/100`, but three findings are still straightforward to improve safely:

- sync mutations still call `ctx.scheduler.runAfter` inside loops
- `commitFile` is still a public action used directly from the browser
- several internal and admin-only queries still use raw `.collect()` even though they can tolerate explicit high limits

## Root cause

These are older implementation shapes that predate the queued-action cleanup pattern used in the later remediation passes.

## Proposed solution

- Add a batched `createVersionsBatch` internal mutation in `convex/versions.ts`
- Change `syncPostsPublic` and `syncPagesPublic` to collect snapshot payloads and schedule one batch after the loop
- Convert `commitFile` to a mutation with a real return contract and update the upload UIs to use `useMutation`
- Add explicit high `.take(...)` bounds to the safe remaining internal/admin collects touched in this pass

## Files to change

- `convex/versions.ts`
- `convex/posts.ts`
- `convex/pages.ts`
- `convex/files.ts`
- `convex/newsletter.ts`
- `src/components/ImageUploadModal.tsx`
- `src/components/MediaLibrary.tsx`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Version snapshots must still capture pre-update content, even if scheduling is deferred until after the sync loop
- `commitFile` must keep returning the same shape the upload UIs expect
- Query limits should be generous enough to avoid changing normal project behavior

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] Upload flows still compile against the `commitFile` return shape
- [x] `npx convex-doctor@latest` improved from `67/100` with `17 errors / 98 warnings` to `78/100` with `1 error / 89 warnings`

## Related

- `prds/convex-doctor-sixth-pass.md`
- `prds/convex-doctor-fifth-pass.md`
