---
name: robel-auth
description: Integrate and maintain Robelest Convex Auth in apps by always checking upstream before implementation. Use when adding auth setup, updating auth wiring, migrating between upstream patterns, or troubleshooting @robelest/convex-auth behavior across projects.
---

# Robel auth skill

Use this skill when a user asks to implement, update, or debug auth based on `robelest/convex-auth`.

This skill is designed to be copied into other repos.

## Non negotiable upstream check before any auth change

Run this every time before proposing code or commands.

Preferred command:

```bash
bash .cursor/skills/robel-auth/scripts/check-upstream.sh
```

Manual checklist if script is unavailable:

1. Read official docs: `https://auth.estifanos.com/getting-started/installation/`
2. Read latest `main` README: `https://raw.githubusercontent.com/robelest/convex-auth/main/README.md`
3. Read latest `release` README: `https://raw.githubusercontent.com/robelest/convex-auth/release/README.md`
4. Check branch level differences: `https://github.com/robelest/convex-auth/compare/release...main`
5. Read current self hosting docs if portal or static hosting is involved:
   - `https://raw.githubusercontent.com/get-convex/self-hosting/main/INTEGRATION.md`
   - `https://github.com/get-convex/self-hosting`

If `main` and `release` conflict, prefer the branch requested by the user. If unspecified, use `release` for stability and explain that choice.

## Important assumptions for this skill

- Treat the official docs site (`auth.estifanos.com`) and GitHub as sources of truth every time.
- Do not assume npm package availability.
- Validate package availability at execution time.
- If npm is unavailable, use a GitHub source install pinned to a branch or commit.
- Keep all Convex code type safe and validator complete.

## Published package reality check (critical)

The docs site (`auth.estifanos.com`) and `main` branch sometimes describe APIs ahead of the latest preview release on npm. Before writing imports, always inspect what the installed version actually exports:

```bash
ls node_modules/@robelest/convex-auth/dist/providers/
cat node_modules/@robelest/convex-auth/dist/providers/index.js
cat node_modules/@robelest/convex-auth/dist/component/index.d.ts
```

### As of `0.0.4-preview.30`

The published package now matches the docs site for the common cases:

- Lowercase factory exports from `@robelest/convex-auth/providers`: `github`, `google`, `apple`, `microsoft`, `password`, `passkey`, `credentials`, `anonymous`, `device`, `email`, `phone`, `sso`, `totp`, `custom`.
- `github`, `google`, `apple`, `microsoft` are first-party factories with built-in profile fetch. No `arctic` wrapping required.
- `password` is a factory function. Call it as `password()`, not `new Password()`.
- `createAuth` is exported from `@robelest/convex-auth/component`.
- Client factory: `import { client } from "@robelest/convex-auth/client"` (or `/browser` for the browser-tuned variant). Both require `api` in SPA mode: `client({ convex, api: api.auth })`. Omitting `api` throws `"The \`api\` option is required when \`proxyPath\` is not set. Pass { api: api.auth }."` at first `signIn`/`signOut`/`verifyCode` call. Only `proxyPath` mode can skip it.

### Older releases (legacy notes)

- `0.0.4-preview.25` and earlier shipped PascalCase classes (`Password`, `OAuth`, etc.) and required `arctic` for OAuth providers.
- If you find code on the older API, the upgrade path is: bump to `^0.0.4-preview.30`, remove `arctic`, switch `OAuth(new GitHub(...), { profile })` to `github({ clientId, clientSecret })`, and switch `new Password()` to `password()`.

If the installed version drifts from the docs site, follow the installed exports and note the drift to the user. Do not blindly copy doc examples.

## Clarifying questions to ask first

Ask these before editing:

1. Which branch is source of truth for this task, `release` or `main`.
2. Is this a new integration or an update to an existing auth setup.
3. Which framework is used: Vite, Next.js, SvelteKit, TanStack Start, Expo web, or other.
4. Is self hosted portal/static delivery needed now.
5. Are they okay pinning dependency to a specific Git commit for reproducibility.

## Install and dependency strategy

Never assume one install path.

1. Try package registry lookup:
   - `npm view @robelest/convex-auth version`
2. If package is unavailable or blocked, install from GitHub:
   - `npm install github:robelest/convex-auth#release`
3. For deterministic builds, pin a commit SHA:
   - `npm install github:robelest/convex-auth#<commit-sha>`

If the project uses pnpm or bun, translate the same GitHub dependency pinning pattern.

## Quick setup (CLI wizard)

The recommended setup flow:

1. Install `@robelest/convex-auth`
2. Start a Convex deployment with `convex dev`
3. Run the auth setup wizard

The wizard handles key generation, `convex.config.ts`, `auth.ts`, and `http.ts` automatically.

## Core wiring (3 files)

### 1. Register the component

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import auth from "@robelest/convex-auth/convex.config";

const app = defineApp();
app.use(auth);
export default app;
```

### 2. Configure auth

```typescript
// convex/auth.ts
import { createAuth } from "@robelest/convex-auth/component";
import { components } from "./_generated/api";
import { github } from "@robelest/convex-auth/providers/github";

const auth = createAuth(components.auth, {
  providers: [
    github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
});

export { auth };
export const { signIn, signOut, store } = auth;
```

### 3. Wire up HTTP routes

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.http.add(http);
export default http;
```

`auth.http.add` registers OAuth callbacks and JWKS endpoints in one call.

## API layers

Client auth flow: `signIn`, `signOut`, and `store` are the only required client-callable auth functions. Frontends use them through `client({ convex, api: api.auth })`.

Server helpers: `auth.user.*`, `auth.session.*`, `auth.account.*`, `auth.group.*`, `auth.member.*`, `auth.invite.*`, `auth.key.*`, `auth.http.*`, `auth.group.sso.*`, and `auth.group.sso.scim.*` are server-side helpers for Convex code. They are not automatically public RPC.

Optional group SSO RPC: If your app wants client-callable group SSO admin APIs, expose app-owned wrappers such as `convex/auth/group.ts`.

## Available providers

All providers import from `@robelest/convex-auth/providers`:

```typescript
import {
  anonymous,
  apple,
  custom,
  email,
  github,
  google,
  microsoft,
  passkey,
  password,
  phone,
  sso,
  totp,
} from "@robelest/convex-auth/providers";
```

### OAuth providers

| Provider | Factory | Required env vars |
|----------|---------|-------------------|
| GitHub | `github({ clientId, clientSecret })` | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Google | `google({ clientId, clientSecret })` | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Apple | `apple({ clientId, teamId, keyId, privateKey })` | `AUTH_APPLE_ID`, `AUTH_APPLE_TEAM_ID`, `AUTH_APPLE_KEY_ID`, `AUTH_APPLE_PRIVATE_KEY` |
| Microsoft | `microsoft({ tenant, clientId, clientSecret? })` | `AUTH_MICROSOFT_TENANT_ID`, `AUTH_MICROSOFT_ID` |

All OAuth wrappers derive callback URL from `CONVEX_SITE_URL` automatically.

### Custom OAuth

Use `custom()` for providers without a first-party wrapper:

```typescript
custom({
  id: "discord",
  clientId: process.env.AUTH_DISCORD_ID!,
  clientSecret: process.env.AUTH_DISCORD_SECRET!,
  scopes: ["identify", "email"],
  authorization: { url: "https://discord.com/oauth2/authorize", pkce: "optional" },
  token: { url: "https://discord.com/api/oauth2/token", authMethod: "body" },
  profile: async ({ accessToken }) => {
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await res.json();
    return { id: String(user.id), email: user.email, name: user.username };
  },
})
```

### Non-OAuth providers

| Provider | Factory | Notes |
|----------|---------|-------|
| Password | `password()` | Built-in password auth |
| Magic links | `email({ from, send })` | Requires email transport (e.g. Resend) |
| Passkeys | `passkey()` | WebAuthn based |
| TOTP | `totp({ issuer })` | Authenticator app codes |
| Anonymous | `anonymous()` | Guest sessions |
| Phone/SMS | `phone({ send })` | Requires SMS transport (e.g. Twilio) |
| Group SSO | `sso()` | Enables OIDC, SAML 2.0, SCIM 2.0 |

## Configuration options

```typescript
const auth = createAuth(components.auth, {
  providers: [/* ... */],
  session: {
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,   // 30 days
    inactiveDurationMs: 7 * 24 * 60 * 60 * 1000,  // 7 days
  },
  jwt: {
    durationMs: 60 * 1000,  // 1 minute
  },
  signIn: {
    max_failed_attempts_per_hour: 10,
  },
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, { userId, existingUser }) => { /* ... */ },
  },
  authorization: {
    roles,  // from defineRoles()
  },
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providers` | `AuthProviderConfig[]` | required | Auth methods to enable |
| `session.totalDurationMs` | `number` | 30 days | Maximum session lifetime |
| `session.inactiveDurationMs` | `number` | varies | Inactive session timeout |
| `jwt.durationMs` | `number` | 60s | JWT token lifetime |
| `signIn.max_failed_attempts_per_hour` | `number` | 10 | Rate limit for failed sign-in attempts |
| `callbacks.afterUserCreatedOrUpdated` | `function` | none | Post sign-in hook |
| `authorization.roles` | `Record` | `{}` | App-defined role definitions and grants |

## Multi-access patterns

Every auth path resolves to the same `userId`. Three access patterns:

| Pattern | Context | How userId is available |
|---------|---------|------------------------|
| App code (query/mutation/action) | `auth.ctx()` | `ctx.auth.userId` and `ctx.auth.user` |
| Raw HTTP (session or API key) | `auth.http.context(ctx, request)` | `authContext.userId` |
| API key HTTP | `auth.http.action(...)` | `ctx.key.userId` |

### Auth-aware custom functions

```typescript
// convex/functions.ts
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const authQuery = customQuery(query, auth.ctx());
export const authMutation = customMutation(mutation, auth.ctx());
```

Use `auth.ctx({ optional: true })` when the same handler should work for both guests and signed-in users.

### Raw HTTP mixed auth

```typescript
http.route({
  path: "/api/data",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authContext = await auth.http.context(ctx, request, { optional: true });
    if (authContext.userId === null) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const data = await ctx.runQuery(internal.data.forUser, { userId: authContext.userId });
    return Response.json(data);
  }),
});
```

## Authorization patterns

### Define roles with grants

```typescript
import { defineRoles } from "@robelest/convex-auth/authorization";

export const roles = defineRoles({
  orgAdmin: {
    label: "Organization Admin",
    grants: ["members.create", "members.update", "members.delete", "sso.connection.manage", "scim.manage"],
  },
  support: {
    label: "Support",
    grants: ["members.read", "tickets.manage"],
  },
  member: {
    label: "Member",
    grants: [],
  },
});
```

### Assign roles via memberships

```typescript
await auth.member.create(ctx, { userId, groupId: orgId, roleIds: [roles.orgAdmin.id] });
await auth.member.update(ctx, memberId, { roleIds: [roles.support.id] });
await auth.invite.create(ctx, { groupId: orgId, email: "new@example.com", roleIds: [roles.member.id] });
```

### Check grants (not role names)

```typescript
// Boolean check
const result = await auth.member.inspect(ctx, { userId: ctx.auth.userId, groupId: orgId });
if (result.grants.includes("members.read")) { /* authorized */ }

// Throwing check
await auth.member.require(ctx, { userId: ctx.auth.userId, groupId: orgId, grants: ["sso.connection.manage"] });
```

## auth.user API

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `(ctx, userId)` | `Doc<"User"> \| null` | Fetch user by ID |
| `list` | `(ctx, { where?, limit?, cursor? })` | Paginated list | List users with filtering |
| `update` | `(ctx, userId, data)` | `{ userId }` | Update user fields |
| `viewer` | `(ctx)` | `Doc<"User"> \| null` | Current session user document |
| `delete` | `(ctx, userId, { cascade? })` | `{ userId }` | Delete user; cascade removes sessions, accounts, memberships, keys |
| `setActiveGroup` | `(ctx, { userId, groupId })` | `{ userId, groupId }` | Set active group |
| `getActiveGroup` | `(ctx, { userId })` | `Id<"Group"> \| null` | Get active group ID |

## Group SSO

Adding `sso()` to providers enables `auth.group.sso.*` namespace. Without it, the namespace is a TypeScript error.

| Protocol | Purpose | Namespace |
|----------|---------|-----------|
| OIDC | OpenID Connect identity provider login | `auth.group.sso.oidc` |
| SAML 2.0 | Security Assertion Markup Language login | `auth.group.sso.saml` |
| SCIM 2.0 | Cross-domain user/group provisioning | `auth.group.sso.scim` |

All SSO configuration is per-tenant runtime state stored in the Convex database. No app-level config file needed.

Optional SSO hooks:

```typescript
const auth = createAuth(components.auth, {
  providers: [sso()],
  sso: {
    hooks: {
      profileResolved: async ({ protocol, profile }) => profile,
      beforeProvision: async ({ protocol, profile }) => profile,
      afterProvision: async ({ protocol, userId }) => {},
      allowLink: async ({ protocol, userId, profile }) => true,
    },
  },
});
```

## GitHub OAuth setup instructions for end users

Required link: `https://github.com/settings/developers`

1. Go to GitHub Developer Settings: `https://github.com/settings/developers`
2. Create a new OAuth App.
3. Set:
   - Homepage URL = app frontend URL (same as `SITE_URL`)
   - Authorization callback URL = `https://<deployment>.convex.site/api/auth/callback/github`
4. Copy Client ID and Client Secret.
5. Set Convex env vars: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
6. Confirm `SITE_URL` and `CONVEX_SITE_URL` are configured.
7. Deploy and test sign in.

In this codebase, GitHub OAuth is conditionally enabled only when `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `CONVEX_SITE_URL` are present.

## Denied session pattern (app-level allowlists)

Provider authentication and app-level authorization are separate decisions. When a user successfully completes OAuth but the app refuses access (allowlist miss, billing gate, role check), do not just redirect or render an "access denied" screen. Sign them out so the auth runtime stops refreshing a session your app does not intend to use:

```typescript
useEffect(() => {
  if (isAuthenticated && !isAllowed) {
    void authClient.signOut();
  }
}, [isAuthenticated, isAllowed, authClient]);
```

Render the denied UI immediately. The sign-out resolves the session in the background. Stash any data you want to display (denied email, reason) in component state before sign-out completes if your UI needs to survive the unauthenticated rerender.

This pattern is what `auth.estifanos.com/guides/authorization/` recommends for app-level allowlists. It is the right shape for "only one admin email can use the dashboard, everyone else sees the demo view."

## Migration guardrails

When upgrading existing apps:

1. Snapshot current auth wiring before edits.
2. Update one surface at a time: config, auth module, then HTTP routes.
3. Keep old and new API mismatch notes in task output.
4. Verify sign in flow and callback routes before moving on.
5. Keep migrations minimal and focused to auth wiring only.

## Self hosting decision point

Use `get-convex/self-hosting` only when:

- user asks for self hosted static assets, or
- auth portal hosting requires it in the selected upstream version.

When needed, follow the latest upstream integration docs:

- `https://github.com/get-convex/self-hosting`
- `https://raw.githubusercontent.com/get-convex/self-hosting/main/INTEGRATION.md`

## Output requirements for any task using this skill

Before finishing, always report:

1. Retrieval timestamp for upstream docs.
2. Which branch was used as source of truth and why.
3. Install path selected, npm or GitHub pin, and why.
4. Exact files changed.
5. Exact commands the user should run next.

Never claim completion without these five items.

## Source links

- `https://auth.estifanos.com/getting-started/installation/` (official docs)
- `https://auth.estifanos.com/getting-started/providers/`
- `https://auth.estifanos.com/guides/multi-access/`
- `https://auth.estifanos.com/guides/authorization/`
- `https://auth.estifanos.com/api/user/`
- `https://auth.estifanos.com/reference/config/`
- `https://auth.estifanos.com/sso/overview/`
- `https://github.com/robelest/convex-auth`
- `https://github.com/robelest/convex-auth/tree/release`
- `https://raw.githubusercontent.com/robelest/convex-auth/main/README.md`
- `https://raw.githubusercontent.com/robelest/convex-auth/release/README.md`
- `https://github.com/get-convex/self-hosting`
- `https://raw.githubusercontent.com/get-convex/self-hosting/main/INTEGRATION.md`
- `https://agentskills.io/home`
