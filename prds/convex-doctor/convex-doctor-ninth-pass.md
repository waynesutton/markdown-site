# Convex doctor ninth pass

Created: 2026-03-20 08:05 UTC
Last Updated: 2026-03-20 08:16 UTC
Status: Done

## Summary

Reduce the next safe `convex-doctor` warnings by removing the remaining public file-maintenance action, adding a non-breaking auth-awareness signal to `incrementViewCount`, and converting clearly unique-by-design indexed `.first()` lookups to `.unique()`.

## Problem

The highest-signal remaining warnings after the eighth pass are:

- `files.setFileExpiration` is still a public action
- `posts.incrementViewCount` is still flagged for missing auth-awareness
- several indexed `.first()` lookups still represent unique-by-design keys like config keys, slugs, and subscriber email

## Root cause

These are mostly older Convex patterns that were safe enough to defer until the higher-impact browser-action and unbounded-query warnings were removed.

## Proposed solution

- Make `files.setFileExpiration` internal-only, matching the `getDownloadUrl` cleanup
- Add `await ctx.auth.getUserIdentity()` to `incrementViewCount` without changing its intended public behavior
- Replace `.first()` with `.unique()` only where the app clearly models the field as unique by convention:
  - version control setting key
  - post and page slugs
  - newsletter subscriber email
  - internal post-by-slug embedding lookup
  - dashboard admin subject and email checks

## Files to change

- `convex/files.ts` - remove the remaining public action warning in file maintenance
- `convex/posts.ts` - add auth-awareness to `incrementViewCount`
- `convex/versions.ts` - tighten setting-key lookups to `.unique()`
- `convex/cms.ts` - tighten slug conflict checks to `.unique()`
- `convex/newsletter.ts` - tighten subscriber-email lookups to `.unique()`
- `convex/embeddingsQueries.ts` - tighten internal post-by-slug lookup to `.unique()`
- `convex/dashboardAuth.ts` - tighten dashboard admin subject/email lookups to `.unique()`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Do not convert `.first()` when duplicates are plausible or expected, such as counters, event rows, or dedup scans
- `incrementViewCount` should remain usable as a public behavior even after the auth-awareness signal is added
- Internal-only file actions are safe only if there are no active client call sites

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` held at `81/100` while findings improved from `1 error / 84 warnings` to `1 error / 68 warnings`

## Related

- `prds/convex-doctor-eighth-pass.md`
- `prds/convex-doctor-seventh-pass.md`
