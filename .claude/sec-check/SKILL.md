---
name: sec-check
description: Security review checklist for Convex functions, auth logic, public queries, admin routes, webhooks, uploads, and AI-generated code. Use when reviewing code that touches user data, PII, or access control.
---

# Security Review Skill

Use this skill when reviewing Convex functions, auth logic, public query shapes, admin routes, webhooks, uploads, or any AI generated code that touches user data.

## When to use it

Reach for this skill when:

- a mutation writes user or admin data
- a public query returns package or user data
- an internal function should be separated from a public wrapper
- a form collects names, emails, or other contact info
- a webhook, upload, or API key flow is added
- AI generated code needs a security pass before shipping

## Auth and ownership checks

- Call `ctx.auth.getUserIdentity()` before authenticated writes.
- Never trust client supplied user ids for ownership.
- Prefer indexed ownership checks over fetch then compare patterns.
- Use `internalQuery`, `internalMutation`, and `internalAction` for sensitive backend work.
- Keep public wrappers thin. Do auth and access checks there, then call internal functions.
- Return generic `Not found` style errors when you should not reveal existence.

## Data exposure rules

- Public queries should return public safe shapes only.
- Strip PII like email, name, Discord handle, internal notes, AI review details, or admin metadata unless the caller is allowed to see them.
- Add explicit return validators on public functions so the response shape stays tight.
- Mutations should return minimal data, usually ids or `null`, not the submitted object.
- Treat everything returned by a query as visible in browser DevTools and WebSocket traffic.

## Sensitive integrations

- Keep secrets in server side environment variables only.
- Validate webhook signatures before processing.
- Restrict CORS for sensitive endpoints.
- Validate upload types and file sizes server side.
- Do not send user PII into AI prompts when it is not required for the task.
- Use simple actor labels like `AI` or `System`, not fake email addresses, for automated actions.

## AI generated code checks

- Watch for missing `returns` validators.
- Watch for public `query` or `mutation` usage where `internal*` should be used.
- Watch for `ctx.db.get()` plus client supplied ids in ownership checks.
- Watch for full objects returned from public queries or mutations.
- Watch for vague or over detailed error messages that leak internal state.

## Verification checklist

- Open the browser network panel and inspect WebSocket or XHR responses for sensitive fields.
- Hard refresh after deploying security changes so cached subscriptions do not fool the test.
- Verify public queries exclude PII and internal metadata.
- Verify admin queries require auth and admin checks before returning full data.
- Verify mutations return minimal data.
- Verify any new action or integration logs full errors only on the server side.
