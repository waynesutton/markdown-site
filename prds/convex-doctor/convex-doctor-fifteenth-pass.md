# Convex doctor fifteenth pass

Created: 2026-03-20 09:10 UTC
Last Updated: 2026-03-20 09:10 UTC
Status: Done

## Summary

Clear the remaining top `convex-doctor` targets: post newsletter action chaining, auth component call-site references, safe `viewCounts` uniqueness, and noisy generated or component forwarder findings via supported `convex-doctor.toml` configuration.

## Problem

After the fourteenth pass, the highest-signal items were:

- `sendPostNewsletter` used four separate `ctx.runQuery` calls before sending mail
- `authAdmin` and `dashboardAuth` called `components.auth.public.*` directly, which triggers `correctness/direct-function-ref`
- `viewCounts` slug lookups still used `.first()` though the model is one row per slug
- `correctness/generated-code-modified` stayed red whenever `_generated` differed from git after codegen

## Root cause

The newsletter action prefetched independent internal query results in sequence instead of one batched internal read. Auth component functions are not exposed as `internal.myModule.*` symbols, so call sites used `components.auth.public.*`. The doctor rule for dirty generated output is git based and fires often during local codegen.

## Proposed solution

- Add `getPostNewsletterSendContextInternal` to batch sent check, subscribers, and post preview fields in one internal query; keep a single `recordPostSent` mutation at the end of the action
- Add `convex/authComponent.ts` internal forwarders and switch call sites to `internal.authComponent.*`
- Use `.unique()` for `viewCounts` queries keyed by slug
- Add `convex-doctor.toml` with `[rules]` off for `correctness/generated-code-modified` and `[ignore]` for `convex/_generated/**` and the forwarder file

## Files to change

- `convex/newsletter.ts`
- `convex/newsletterActions.ts`
- `convex/authComponent.ts` (new)
- `convex/authAdmin.ts`
- `convex/dashboardAuth.ts`
- `convex/posts.ts`
- `convex-doctor.toml` (new)
- `prds/convex-doctor-fifteenth-pass.md`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Batched newsletter context must match prior behavior: unpublished or missing posts still return `post: null`
- Duplicate `viewCounts` rows for the same slug will now throw at `.unique()`; the schema intent is one counter per slug
- Ignoring `convex/authComponent.ts` in doctor avoids duplicate `direct-function-ref` noise on the forwarder itself; call sites no longer use `components.auth.public.*`

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` reports **0 errors**, score **91/100**, **43 warnings** (remaining `.first()` sites are intentional: ordered picks and multi match keys)

## Related

- `prds/convex-doctor-fourteenth-pass.md`
- https://github.com/nooesc/convex-doctor#configuration
