# Convex doctor eleventh pass

Created: 2026-03-20 08:15 UTC
Last Updated: 2026-03-20 08:15 UTC
Status: Done

## Summary

Remove the next browser-callable action warning by replacing `resolveDirectUpload` client calls with the existing authenticated storage URL query, then clear the next smallest safe warnings in `search` and newsletter sent-post uniqueness checks.

## Problem

The next low-risk warnings are:

- `resolveDirectUpload` is still a public action used directly from the browser
- `search` is still flagged for missing auth-awareness
- newsletter sent-post lookups still use `.first()` even though the app treats post slug sends as unique by convention

## Root cause

These are leftover earlier patterns from before the broader queued-action cleanup and uniqueness audit passes.

## Proposed solution

- Replace `resolveDirectUpload` usage in the upload UIs with `convex.query(api.media.getDirectStorageUrl, ...)`
- Make `resolveDirectUpload` internal-only so it is no longer browser-callable
- Add a non-breaking `ctx.auth.getUserIdentity()` signal to `search`
- Convert newsletter sent-post slug lookups from `.first()` to `.unique()`

## Files to change

- `convex/media.ts`
- `src/components/ImageUploadModal.tsx`
- `src/components/MediaLibrary.tsx`
- `convex/search.ts`
- `convex/newsletter.ts`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Direct upload success handling must still receive a usable storage URL immediately after upload
- `search` should keep its current public behavior even after the auth-awareness signal is added
- Newsletter sent-post uniqueness should only be tightened where duplicate records would indicate broken state

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved the baseline from `80/100` with `1 error / 68 warnings` to `81/100` with `1 error / 64 warnings`

## Related

- `prds/convex-doctor-tenth-pass.md`
- `prds/convex-doctor-ninth-pass.md`
