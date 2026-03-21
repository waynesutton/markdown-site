# Convex doctor eighth pass

Created: 2026-03-20 08:00 UTC
Last Updated: 2026-03-20 08:10 UTC
Status: Done

## Summary

Clear the next high-value `convex-doctor` findings by moving `getDownloadUrl` off the public action path and refactoring RSS handlers to the helper-wrapper pattern already used elsewhere in the app.

## Problem

Two remaining warnings are still obvious and low-risk:

- `files.getDownloadUrl` is a public action, which `convex-doctor` flags as a browser-callable action path
- `rssFeed` still uses the older exported `httpAction(...)` shape and is flagged for syntax and validator issues

## Root cause

These paths still use older Convex handler patterns that were left in place during earlier passes while more impactful issues were addressed first.

## Proposed solution

- Convert `files.getDownloadUrl` to a mutation with the same return shape and auth behavior
- Replace exported `rssFeed` and `rssFullFeed` `httpAction(...)` functions with plain helper functions in `convex/rss.ts`
- Wrap those helpers at route registration time in `convex/http.ts`, matching the existing Ask AI cleanup pattern

## Files to change

- `convex/files.ts` - move `getDownloadUrl` off the public action path
- `convex/rss.ts` - replace exported `httpAction(...)` handlers with plain helpers
- `convex/http.ts` - register RSS routes with `httpAction(...)` wrappers
- `TASK.md` - track the eighth pass
- `changelog.md` - document the pass and score change
- `files.md` - refresh file summaries if needed

## Edge cases and gotchas

- `getDownloadUrl` must keep the same response shape if anything starts using it later
- RSS endpoints must keep their exact XML and cache headers
- The route registration change should not disturb existing `/rss.xml` and `/rss-full.xml` behavior

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved from `78/100` with `1 error / 89 warnings` to `81/100` with `1 error / 84 warnings`

## Related

- `prds/convex-doctor-seventh-pass.md`
- `prds/convex-doctor-sixth-pass.md`
