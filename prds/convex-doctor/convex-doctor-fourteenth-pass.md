# Convex doctor fourteenth pass

Created: 2026-03-20 08:51 UTC
Last Updated: 2026-03-20 08:51 UTC
Status: Done

## Summary

Reduce the next highest-signal `convex-doctor` findings by shrinking the queued URL import worker and extracting markdown export frontmatter assembly into shared helpers without changing runtime behavior.

## Problem

The remaining structural findings after the thirteenth pass were concentrated in a few places:

- `importFromUrlJob` still carried a deep `ctx.run*` chain warning
- `exportPostAsMarkdown` still kept its frontmatter assembly inline as a large handler
- The import flow still split post creation and job completion across multiple internal writes

## Root cause

The queued import worker still repeated finalization calls inline, and the markdown export queries still owned all string-building logic inside the handlers instead of delegating that work to helpers.

## Proposed solution

- Pass the import job snapshot directly into the scheduled internal action
- Collapse imported post creation plus job completion into one internal mutation
- Route import failure handling through one helper so the action body stays small
- Extract shared post and page frontmatter builders in `convex/cms.ts`
- Re-run full verification and record the new doctor baseline

## Files to change

- `convex/importJobs.ts`
- `convex/importAction.ts`
- `convex/cms.ts`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Firecrawl failures and missing `FIRECRAWL_API_KEY` must still end in a failed import job instead of throwing uncaught action errors
- Imported post slugs still need the timestamp fallback when the base slug already exists
- Markdown export output must stay byte-for-byte compatible in structure even after frontmatter assembly moves into helpers

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved the baseline from `85/100` with `1 error / 54 warnings` to `86/100` with `1 error / 49 warnings`

## Related

- `prds/convex-doctor-thirteenth-pass.md`
- `prds/convex-doctor-twelfth-pass.md`
