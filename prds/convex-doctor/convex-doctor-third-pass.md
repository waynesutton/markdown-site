# Convex doctor third pass

Created: 2026-03-19 07:26 UTC
Last Updated: 2026-03-19 07:26 UTC
Status: Done

## Summary

Continue reducing remaining high-signal `convex-doctor` findings after the first two passes, focusing on low-risk query cleanup and safe auth signal improvements.

## Problem

The repo is now at `66/100`, but the remaining report still has a noisy cluster of:

- `collect then filter` query patterns in `posts.ts` and `pages.ts`
- public setup/bootstrap queries missing auth checks
- `.first()` warnings where some lookups are unique by design

## Root cause

The remaining findings are concentrated in older content listing queries that were written for convenience rather than strict analyzer-friendly indexing and iteration patterns.

## Proposed solution

- Replace `collect().filter()` patterns with direct iteration over indexed query results where safe
- Add auth signals to intentional public bootstrap helpers without breaking setup flows
- Convert only the safest unique-by-design `.first()` lookups to `.unique()`
- Avoid broader schema or frontend contract changes in this pass

## Files to change

- `convex/posts.ts`
- `convex/pages.ts`
- `convex/authAdmin.ts`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Navigation queries still rely on `showInNav !== false`, so some filter logic may need to stay unless the schema is normalized further
- `.unique()` conversions should only be used where duplicate rows would indicate broken invariants, not a normal fallback path
- Bootstrap queries must still work before the dashboard admin model is fully initialized

## Verification

- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] Dashboard login/bootstrap flows still work
- [x] Public page and post listing behavior stays unchanged
- [x] `convex-doctor` score improved again to `68/100`

## Related

- `prds/convex-doctor-remediation.md`
- `prds/convex-doctor-second-pass.md`
