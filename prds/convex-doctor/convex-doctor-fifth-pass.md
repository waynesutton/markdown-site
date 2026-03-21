# Convex doctor fifth pass

Created: 2026-03-20 06:56 UTC
Last Updated: 2026-03-20 08:16 UTC
Status: Done

## Summary

Continue reducing true-positive `convex-doctor` findings by moving image generation off the direct client action path and bounding the remaining public list queries that still use unbounded collects.

## Problem

The repo is holding at `68/100`, but a few meaningful issues remain:

- `generateImage` is still a direct client-called public action
- several public list queries still rely on unbounded `.collect()`
- remaining public utility warnings keep surfacing as the broader cleanup removes nearby noise

## Root cause

Image generation was originally implemented as a direct browser-to-action flow, while several content list queries were designed for convenience rather than bounded delivery. Both patterns are functional, but they keep showing up in the performance and security buckets.

## Proposed solution

- Add persisted image generation jobs with a public mutation plus internal action flow
- Update the Dashboard AI image UI to request a job and reactively read its status
- Add generous but explicit bounds to public post/page list queries that still use `.collect()`
- Clear the next low-risk public query auth-awareness warning if it remains after the structural changes

## Files to change

- `convex/schema.ts`
- `convex/aiImageGeneration.ts`
- `convex/posts.ts`
- `convex/pages.ts`
- `convex/newsletter.ts`
- `src/pages/Dashboard.tsx`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- The image UI should keep showing loading, success, and error states without blocking on a direct action result
- Existing generated images and delete behavior must keep working
- Public list bounds must be high enough to avoid changing normal site behavior
- Additive schema changes only in this pass; no destructive schema rewrites

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] Dashboard image generation flow now uses persisted job state without a direct browser action
- [x] `convex-doctor` warning volume improved from `130` to `110`
- [x] `convex-doctor` returned to `66/100` after new generated API refs and follow-up cleanup
- [x] Public post/page/newsletter/stats queries now use explicit limits where this pass touched list reads

## Outcome

- Added `aiImageGenerationJobs` plus a mutation-scheduled internal action flow for image generation
- Updated the Dashboard image UI to request jobs and reactively read completion/error state
- Removed the last direct client image generation action path
- Reduced `convex-doctor` findings from `28 errors / 130 warnings` at the start of the pass to `17 errors / 110 warnings` at the end
- Remaining high-value follow-ups are `syncPagesPublic`, `generateMissingEmbeddings`, the direct component function reference in `authAdmin`, and legacy `streamResponse` syntax

## Related

- `prds/convex-doctor-remediation.md`
- `prds/convex-doctor-third-pass.md`
- `prds/convex-doctor-fourth-pass.md`
