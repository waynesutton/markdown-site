# Convex doctor sixteenth pass

## Problem

Two remaining structural warnings block the score from climbing past 91:

1. `arch/deep-function-chain` + `perf/sequential-run-calls`: `semanticSearchJob` has 7 `ctx.run*` call sites across two separate fetch queries, two separate finalize mutations, and multiple early-return branches.
2. `perf/helper-vs-run`: `dashboardAuth.ts` and `authAdmin.ts` call `ctx.runQuery(internal.authComponent.*)` inside query/mutation handlers, creating double runQuery hops that the doctor flags as avoidable overhead.

## Solution

### Semantic search batching

- Merge `fetchPostsByIds` + `fetchPagesByIds` into one `fetchSearchDocsByIds` internal query that returns `{ posts, pages }` in a single transaction.
- Merge `completeSemanticSearchJob` + `failSemanticSearchJob` into one `finalizeSemanticSearchJob` internal mutation that accepts `status`, optional `results`, and optional `error`.
- Extract a local `finalize` async helper in `semanticSearch.ts` that centralizes the finalize mutation call. The handler calls the helper for early-return, success, and failure paths.
- Update `askAI.node.ts` to use `fetchSearchDocsByIds` as well.

### Auth component helper conversion

- Convert `authComponent.ts` from registered `internalQuery` functions (`authUserGetById`, `authUserList`) to plain async helper functions (`authUserGetByIdHelper`, `authUserListHelper`).
- Callers (`dashboardAuth.ts`, `authAdmin.ts`) import the helpers directly and call them within the same transaction, eliminating the double `runQuery` hop.
- The `components.auth.public.*` imports stay isolated in `authComponent.ts`, which is already ignored by `convex-doctor.toml`.

## Files changed

- `convex/semanticSearch.ts`
- `convex/semanticSearchQueries.ts`
- `convex/semanticSearchJobs.ts`
- `convex/askAI.node.ts`
- `convex/authComponent.ts`
- `convex/authAdmin.ts`
- `convex/dashboardAuth.ts`

## Verification

- `npx convex codegen` passes
- `npx tsc --noEmit` passes
- `npm run build` passes
- `convex-doctor` improved from 91/100 (43 warnings) to 92/100 (39 warnings)
