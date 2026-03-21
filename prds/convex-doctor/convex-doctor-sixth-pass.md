# Convex doctor sixth pass

Created: 2026-03-20 07:12 UTC
Last Updated: 2026-03-20 08:36 UTC
Status: Done

## Summary

Reduce the next set of high-value `convex-doctor` findings by fixing the public sync and embedding entrypoints, replacing the auth component direct function references with generated refs, and re-checking the Ask AI streaming endpoint shape.

## Problem

The repo improved significantly in the fifth pass, but the next structural warnings still holding the score back are:

- `syncPagesPublic` still reads as an unauthenticated public mutation
- `generateMissingEmbeddings` is still a public action called directly from the sync script
- auth bootstrap still uses component direct function references
- Ask AI streaming still carries legacy analyzer warnings around the exported HTTP handler shape

## Root cause

These remaining findings are mostly older integration paths that predate the newer queued action pattern and the latest generated component API references.

## Proposed solution

- Add safe auth-awareness to `syncPagesPublic` to match the existing non-breaking sync posture
- Convert `generateMissingEmbeddings` from a public action to a public mutation that schedules the internal embedding actions
- Update auth component lookups to use the generated component refs exposed in `convex/_generated/api.d.ts`
- Re-check `streamResponse` and apply the smallest safe cleanup if there is a supported syntax change

## Files to change

- `convex/pages.ts`
- `convex/embeddings.ts`
- `convex/authAdmin.ts`
- `convex/dashboardAuth.ts`
- `convex/askAI.node.ts`
- `scripts/sync-posts.ts`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases and gotchas

- Content sync must keep working from the CLI without forcing a user login
- Embedding generation should still skip cleanly when `OPENAI_API_KEY` is missing
- The sync script should keep succeeding even if embedding work is only queued rather than completed inline
- The auth component warning fix should use supported generated refs, not undocumented table access

## Verification

- [x] `npx convex codegen` passes
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] `npx convex-doctor@latest` improved from `66/100` to `67/100`
- [x] Content sync mutations still build and the sync script now queues embedding work safely

## Outcome

- Added auth-awareness to both public content sync mutations so the analyzer no longer treats `syncPagesPublic` and `syncPostsPublic` as accidental anonymous writes
- Moved bulk missing-embedding generation off a public action path into `convex/embeddingsAdmin.ts` as a mutation that schedules internal embedding actions
- Moved single-post embedding regeneration off a public action path into a queued mutation wrapper plus internal job
- Refactored Ask AI stream handlers into plain helpers wrapped at route registration time, which removed the old `streamResponse` warning
- Added a runtime return validator to `askAI.getStreamBody` using `v.any()` because the stream body shape comes from the streaming component
- Final `convex-doctor` findings dropped to `17 errors / 98 warnings / 17 infos`

## Remaining high-value follow-ups

- Batch the scheduled version snapshots in `syncPostsPublic` and `syncPagesPublic` to remove the looped scheduler warning
- Replace or accept the `components.auth.public.userList` direct function ref warning if the auth component offers no generated alternative
- Tackle the remaining public action warning on `commitFile`
- Review `rssFeed` old syntax and the remaining public `.collect()` call warnings

## Related

- `prds/convex-doctor-fifth-pass.md`
- `prds/convex-doctor-fourth-pass.md`
