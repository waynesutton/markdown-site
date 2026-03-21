---
name: convex-doctor
description: Run convex-doctor static analysis, interpret findings, and fix issues across security, performance, correctness, schema, and architecture categories. Use when running convex-doctor, fixing convex-doctor warnings or errors, improving the convex-doctor score, or when asked about Convex code quality, static analysis, or linting Convex functions.
---

# Convex doctor workflow

This skill codifies the full convex-doctor remediation workflow used in this codebase (score 42 to 100 across 17 passes). Follow it whenever running convex-doctor or fixing its findings.

## What is convex-doctor

[convex-doctor](https://github.com/nooesc/convex-doctor) is a static analysis tool for Convex backends. It scores your codebase 0 to 100 across five categories: security, correctness, performance, schema, and architecture.

Run it with:

```bash
npx convex-doctor@latest
```

## Configuration

This project has a `convex-doctor.toml` at the repo root with intentional suppressions. Always check it before working on findings.

### Current suppressions and rationale

| Rule | Level | Rationale |
|------|-------|-----------|
| `correctness/generated-code-modified` | off | Working tree is always dirty after codegen |
| `schema/optional-field-no-default-handling` | off | 94 optional fields by design for markdown frontmatter |
| `correctness/missing-unique` | off | Remaining `.first()` calls are intentional ordered picks |
| `schema/deep-nesting` | off | 4-level validators needed for chat attachments |
| `schema/array-relationships` | off | Flagged on function args, not table columns |
| `perf/missing-index-on-foreign-key` | off | Remaining FK is inside nested array (not indexable) |
| `arch/duplicated-auth` | off | Auth awareness is intentional per public handler |
| `arch/monolithic-file` | off | Files organized by domain |
| `arch/large-handler` | off | Email templates, sync, and search are inherently multi-step |

### Ignored files

- `convex/_generated/**` (generated code)
- `convex/authComponent.ts` (thin auth component forwarders)

## Fix priority order

When convex-doctor reports findings, fix them in this order:

1. **Security errors** (highest priority)
   - Add auth to HTTP actions and public endpoints
   - Convert `api.*` server-to-server calls to `internal.*`
   - Move public actions to mutation-scheduled internal actions

2. **Correctness errors**
   - Remove `Date.now()` from queries (breaks caching and reactivity)
   - Convert `.first()` to `.unique()` only where the index enforces uniqueness
   - Fix `collect then filter` patterns with indexed queries

3. **Performance warnings**
   - Replace unbounded `.collect()` with `.take(n)` or pagination
   - Batch sequential `ctx.run*` calls into single internal queries
   - Eliminate N+1 patterns in HTTP and RSS endpoints

4. **Schema warnings**
   - Add missing indexes for foreign keys where query patterns exist
   - Rename indexes to `by_field` snake_case convention
   - Remove redundant indexes (prefixes of compound indexes)

5. **Architecture warnings**
   - Extract helper functions from large handlers
   - Split provider modules from orchestration logic
   - Replace `throw new Error(...)` with `ConvexError` in user-facing handlers

## Common fix patterns

### Convert public action to queued job

Instead of calling a public action from the browser, create a job table and mutation-scheduled internal action:

1. Add a job table to `convex/schema.ts` with status, result, and error fields
2. Create a public mutation that inserts a pending job and schedules the internal action
3. Create a public query that returns job status for the UI
4. Convert the action to `internalAction` that updates the job record on completion or failure
5. Update the frontend to call the mutation and poll the query

This pattern was used for: AI image generation, AI chat responses, URL imports.

### Convert api.* to internal.*

When a Convex function calls another Convex function on the server side:

1. Create an `internal*` version if only a public version exists
2. Replace `api.module.fn` with `internal.module.fn` in the caller
3. If the function needs both public and internal access, keep both and have the public version call the internal one

### Batch sequential ctx.run* calls

When an action makes multiple `ctx.runQuery` calls for independent data:

1. Create a single internal query that returns all needed data in one object
2. Replace the sequential calls with one `ctx.runQuery` to the batched query
3. This reduces transaction overhead and eliminates the `sequential-run-calls` warning

### Remove Date.now() from queries

Queries must be deterministic. Replace `Date.now()` with a timestamp argument:

1. Add a `now: v.number()` argument to the query
2. Pass `Date.now()` from the frontend or from the action/mutation that calls the query
3. For reactive subscriptions, round the timestamp (e.g., 60-second intervals) to keep reactivity stable

### Auth component helper conversion

When `components.auth.public.*` triggers `direct-function-ref` warnings:

1. Create helper functions in `convex/authComponent.ts` that call the component API
2. Import helpers directly instead of using `ctx.runQuery(internal.authComponent.*)`
3. Add `convex/authComponent.ts` to the `[ignore]` section of `convex-doctor.toml`

## Verification checklist

After every fix pass:

- [ ] `npx convex codegen` passes
- [ ] `npx tsc --noEmit` passes (or `npx convex codegen` covers this)
- [ ] `npm run build` succeeds
- [ ] `npx convex-doctor@latest` shows improved score or fewer findings
- [ ] Existing functionality still works (AI chat, search, dashboard, RSS, stats)

## Score history

| Pass | Score | Errors | Warnings | Key changes |
|------|-------|--------|----------|-------------|
| Initial | 42/100 | 73 | 243 | Baseline |
| 1 (remediation) | ~55 | ~50 | ~221 | Security: auth on HTTP, api to internal |
| 2 | ~60 | ~40 | ~200 | AI action flow, HTTP hardening |
| 3 | 68/100 | - | - | collect-then-filter, auth signals |
| 10 | 80/100 | 1 | 68 | Import URL queued job, unique lookups |
| 15 | 91/100 | 0 | 43 | Newsletter batching, auth forwarders, toml config |
| 16 | 92/100 | 0 | 39 | Semantic search batching, auth helpers |
| 17 | 100/100 | 0 | 0 | Stats helpers, contact helpers, final toml tuning |

## When to suppress vs fix

**Fix it** when:
- The finding points to a real bug or security gap
- The fix is low risk and improves code quality
- The pattern can be changed without affecting product behavior

**Suppress it** when:
- The finding is a tool false positive (e.g., component function refs)
- The pattern is intentional by design (e.g., per-handler auth checks)
- The fix would add more complexity than the warning is worth
- Generated code triggers the finding

Always document suppressions with rationale in `convex-doctor.toml`.

## Related PRDs

All remediation PRDs are in `prds/convex-doctor/`:

- `convex-doctor-remediation.md` (initial plan, 5 phases)
- `convex-doctor-second-pass.md` through `convex-doctor-seventeenth-pass.md`

## Related files

- `convex-doctor.toml` (suppression config)
- `convex/schema.ts` (indexes and table definitions)
- `convex/authComponent.ts` (auth component forwarders)
- `convex/importJobs.ts` (queued job pattern example)
- `convex/aiImageJobs.ts` (queued job pattern example)
- `convex/semanticSearchJobs.ts` (queued job pattern example)
