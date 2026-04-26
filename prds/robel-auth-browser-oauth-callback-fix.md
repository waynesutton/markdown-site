# Robel Auth browser OAuth callback fix

## Summary

This PRD documents the debugging path and final fix for GitHub OAuth with `@robelest/convex-auth` preview.30 in a React and Convex app. The goal is to prevent future apps from getting stuck at `/dashboard?code=...`, failing to persist sessions, or missing the `DASHBOARD_PRIMARY_ADMIN_EMAIL` admin gate.

## Problem

GitHub login appeared to work at the provider level, but the app returned to:

```text
http://localhost:5174/dashboard?code=38702521
```

The dashboard stayed in demo mode. The app did not show the denied admin banner, which meant Convex believed the user was unauthenticated rather than signed in but unauthorized.

Observed symptoms:

1. `auth:store` logged repeated `Invalid verification code`.
2. `auth:signIn` initially failed with `Invalid Ed25519 private key`.
3. The browser URL kept the OAuth `code` param.
4. `DASHBOARD_PRIMARY_ADMIN_EMAIL` was set correctly, but the app never reached the signed-in admin check.
5. React warned about unsupported `fetchPriority` props on DOM image elements.

## Root cause

There were multiple issues, but only one was the final blocker.

1. The local Convex env had an RSA `JWKS` and invalid `JWT_PRIVATE_KEY` for preview.30. Robel Auth signs session JWTs with `EdDSA`, so `JWT_PRIVATE_KEY` must be an Ed25519 PKCS8 private key and `JWKS` must expose an OKP Ed25519 public key.
2. The app created more than one Robel auth client. Multiple clients can try to consume the same OAuth callback code or verifier, causing duplicate `Invalid verification code` logs.
3. The app used `@robelest/convex-auth/client`, the framework-neutral entrypoint. For browser apps, the docs recommend `@robelest/convex-auth/browser`, which supplies browser storage, location handling, sync, mutex, passkey adapters, and `ConvexHttpClient` defaults.
4. A custom callback cleanup function removed `?code=` too early. Robel Auth's client needs the code in `handleCodeFlow()` to exchange it, store the JWT and refresh token, then clean the URL itself.
5. `DASHBOARD_PRIMARY_ADMIN_EMAIL` was originally captured at module load. Reading it at request time is safer during local env changes.

## Proposed solution

Use one browser configured auth client per `ConvexReactClient`.

```typescript
import { client as createConvexAuthClient } from "@robelest/convex-auth/browser";
```

Store the client in a `WeakMap` so the same Convex client gets the same auth client instance across app wrapper, dashboard sign-in, denied access, and sign-out flows.

Let Robel Auth own the OAuth callback code exchange. Do not remove `?code=` before the library handles it. If a bad stale callback remains after a failed old attempt, remove it only after a delay and only when auth is still unauthenticated.

Use `DASHBOARD_PRIMARY_ADMIN_EMAIL` as the sole strict admin gate when set. Read it at request time and compare it against the authenticated user's GitHub email from the Robel Auth user record.

## Files changed

1. `src/utils/convexAuthClient.ts`
   Shared singleton auth helper. Uses `@robelest/convex-auth/browser`, `InferClientApi<typeof convexAuth>`, and `WeakMap<ConvexReactClient, AppConvexAuthClient>`.

2. `src/AppWithWorkOS.tsx`
   Uses `getConvexAuthClient()` during app auth bootstrap. Removes early OAuth callback cleanup. Adds guarded stale callback cleanup that waits five seconds and only cleans old `code` params if the user remains unauthenticated.

3. `src/pages/Dashboard.tsx`
   Uses the shared auth client for demo sign-in, denied sign-out, and admin sign-out. Shows a denied admin banner with the actual GitHub email and expected strict admin email.

4. `src/pages/Home.tsx`
   Uses the shared auth client for sign out.

5. `convex/dashboardAuth.ts`
   Reads `DASHBOARD_PRIMARY_ADMIN_EMAIL` at request time through `getStrictDashboardAdminEmail()`.

6. `convex/authAdmin.ts`
   Adds `getCurrentDashboardAuthDebug` and `strictAdminEmailConfigured` so strict email mode does not fall into first admin bootstrap.

7. `src/components/Layout.tsx`, `src/pages/Home.tsx`, `src/pages/Post.tsx`
   Removes unsupported `fetchPriority` props.

8. Convex environment variables
   Rotated local dev auth keys to Ed25519 compatible values:

```text
JWT_PRIVATE_KEY: Ed25519 PKCS8 private key
JWKS: OKP Ed25519 public key set
AUTH_SECRET_ENCRYPTION_KEY: present
SITE_URL: http://localhost:5174
DASHBOARD_PRIMARY_ADMIN_EMAIL: expected GitHub primary email
```

## Edge cases and gotchas

1. `@robelest/convex-auth/client` is not enough for browser apps unless all browser runtime pieces are manually supplied. Use `@robelest/convex-auth/browser`.
2. Do not manually delete OAuth `code` during initial auth loading. The library needs it.
3. Old failed callback URLs can be stale. Clean them only after auth settles as unauthenticated.
4. Multiple auth clients can cause verifier and code reuse bugs. Keep one auth client per Convex client.
5. `Invalid verification code` can mean the code was already consumed, the verifier is missing, or the browser kept stale auth storage.
6. `DASHBOARD_ADMIN_BOOTSTRAP_KEY` is unrelated to strict GitHub email login. It only supports manual admin row setup when strict email mode is not used.
7. GitHub admin matching uses the GitHub primary or verified email returned by the provider. `DASHBOARD_PRIMARY_ADMIN_EMAIL` must match that email exactly after lowercase and trim.
8. Preview package docs and installed exports can drift. Always inspect installed package exports when types or runtime behavior disagree.

## Verification

1. Start Convex dev and Vite.
2. Confirm relevant env values:

```bash
npx convex env get SITE_URL
npx convex env get DASHBOARD_PRIMARY_ADMIN_EMAIL
npx convex env get JWT_PRIVATE_KEY
npx convex env get JWKS
```

3. Open `http://localhost:5174/dashboard`.
4. Remove any old `?code=...` from the URL before a fresh attempt.
5. Click `Sign in with GitHub`.
6. Confirm the URL returns to `/dashboard` without staying stuck on `?code=...`.
7. Confirm one of these outcomes:
   1. Full dashboard if GitHub primary email matches `DASHBOARD_PRIMARY_ADMIN_EMAIL`.
   2. Demo dashboard with mismatch banner if it does not match.
8. Run:

```bash
npx tsc --noEmit
```

## Related

1. `prds/robel-auth-preview-30-and-admin-lockdown.md`
2. `https://auth.estifanos.com/llms.txt`
3. `.cursor/skills/robel-auth/SKILL.md`
