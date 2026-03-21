# Convex doctor second pass

## Summary

Address the remaining high value `convex-doctor` findings after the first remediation pass, with emphasis on true positive errors and warnings that can be fixed without changing product behavior.

## Problem

The first pass removed the largest security and schema problems, but the current scan still reports 50 errors and 221 warnings. Many are now concentrated in a smaller set of patterns:

- Public AI chat action flow still triggers `perf/action-from-client`
- `askAI.node.ts` HTTP handlers still trigger old syntax, auth, CORS, and return validator findings
- Some `.collect()` and `ctx.scheduler.runAfter(...)` patterns are true positives worth restructuring
- A subset of correctness warnings need audit to separate true positives from analyzer false positives

## Root cause

The remaining findings are less about obvious misuse and more about architecture choices that were valid early on but now collide with stricter Convex specific static analysis. Several warnings are also tool limitations or false positives around HTTP preflight and component APIs.

## Proposed solution

### Phase A: AI action flow and handler decomposition

- Convert the public `generateResponse` browser entrypoint from direct action usage into a mutation scheduled flow where practical
- Split provider specific AI response building into helper functions and keep the exported handler focused on orchestration
- Reduce sequential `ctx.run*` calls where a helper or batch mutation can preserve behavior

### Phase B: HTTP endpoint hardening

- Audit `convex/askAI.node.ts` for current handler syntax and whether route local wrappers can avoid the analyzer noise
- Add explicit CORS handling for `/api/export` preflight
- Review where return validators are applicable versus false positives on `httpAction`

### Phase C: Query and collect audit

- Reduce remaining public query `.collect()` usage where a safe bound or pagination fits existing UX
- Replace true positive `collect then filter` cases when indexes already make a better query possible
- Keep intentionally bounded admin and sync flows unchanged when changing them would add risk

### Phase D: Warning triage

- Audit `.first()` sites and convert only unique by design lookups to `.unique()`
- Document known false positives such as component function refs and unauthenticated CORS preflight if they remain

## Files to change

- `convex/aiChatActions.ts` - restructure AI response flow and helpers
- `convex/aiChats.ts` - add scheduled mutation entrypoint if needed
- `convex/askAI.node.ts` - CORS, auth, and handler cleanup
- `convex/http.ts` - explicit OPTIONS support for export and related HTTP routes
- `convex/posts.ts` - bound public list queries where safe
- `convex/pages.ts` - bound public list queries where safe
- `convex/newsletter.ts` - continue collect and filter cleanup where low risk
- `TASK.md` - track second pass tasks
- `changelog.md` - record second pass remediation work
- `files.md` - update descriptions if new files or roles change

## Edge cases and gotchas

- `streamResponseOptions` is a CORS preflight route and should remain callable without user auth
- `httpAction` does not support the same return validator pattern as query or mutation functions, so some tool warnings may be false positives
- Converting public actions to scheduled mutations changes the client call path and must not break existing UI hooks
- Some `.collect()` calls are intentional for sync jobs or bounded admin tables; these should be left alone if the fix adds more risk than value

## Verification

- [ ] `npx tsc --noEmit` passes after each change set
- [ ] `npm run build` succeeds
- [ ] AI chat still works for authenticated users
- [ ] Ask AI streaming still works for authenticated users
- [ ] `/api/export` still returns the same data and responds to preflight
- [ ] Public post and page listing routes still return expected content
- [ ] `convex-doctor` score improves again or the remaining findings are clearly false positives

## Related

- `prds/convex-doctor-remediation.md`
- [convex-doctor](https://github.com/nooesc/convex-doctor)
