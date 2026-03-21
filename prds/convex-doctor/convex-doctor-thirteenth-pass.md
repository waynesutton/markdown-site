# Convex doctor thirteenth pass

Created: 2026-03-20 08:33 UTC
Last Updated: 2026-03-20 08:33 UTC
Status: Done

## Summary

Reduce the remaining highest-signal structural `convex-doctor` warnings by shrinking the AI chat and AI image action transaction chains without changing the existing queued UX.

## Problem

The remaining highest-signal structural warnings were concentrated in the AI action flows:

- `generateResponse` still triggered deep `ctx.run*` chain and large handler findings
- `generateImage` still re-queried persisted job state and completed through multiple internal writes

## Root cause

Both internal actions were still reloading or re-stitching state that their queueing mutations already knew, and they finalized work through multiple separate internal writes.

## Proposed solution

- Move the recent chat snapshot and effective page context into the scheduled `generateResponse` args inside `requestAIResponse`
- Replace separate assistant-success and generation-failure write paths with one internal finalize mutation
- Stop appending the newest user message twice when formatting the provider prompt
- Pass the image job snapshot directly into `generateImage` and collapse generated-image plus job-status writes into one finalizer
- Extract action orchestration into helper functions so handler bodies stay thin

## Files to change

- `convex/aiChats.ts`
- `convex/aiChatActions.ts`
- `convex/aiImageJobs.ts`
- `convex/aiImageGeneration.ts`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- The queued chat action must still work when the selected provider is not configured
- The latest user message must still be included exactly once in the provider request
- Chat and image finalization must always clear their pending state whether the provider succeeds or fails

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved the baseline from `84/100` with `1 error / 60 warnings` to `85/100` with `1 error / 54 warnings`

## Related

- `prds/convex-doctor-twelfth-pass.md`
- `prds/convex-doctor-eleventh-pass.md`
