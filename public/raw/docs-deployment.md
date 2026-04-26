# Deployment

---
Type: page
Date: 2026-04-26
---

## Deployment

This app uses **Convex self-hosting** as the default deployment mode. The static React/Vite build is uploaded to Convex storage and served directly from the Convex CDN. No external hosting provider needed.

The default hosting path uses the [Convex Static Hosting component](https://www.convex.dev/components/static-hosting). In this repo, `@convex-dev/self-hosting` is registered in `convex/convex.config.ts`, exposes upload helpers from `convex/staticHosting.ts`, and registers the static routes from `convex/http.ts`.

### Default: Convex self-hosting

First-time setup:

```bash
npx @convex-dev/self-hosting setup
npx convex dev --once
npm run deploy
```

Ongoing deploys:

```bash
npm run deploy
```

The `deploy` script runs `npx @convex-dev/self-hosting deploy` which builds the app and uploads the static assets to Convex in one step.

Two-step production deploys are also supported:

```bash
npx convex deploy
npm run deploy:static
```

Use the one-step `npm run deploy` path for normal production releases. Use the two-step path when you intentionally want to deploy backend functions separately from static assets.

**Custom domain:** Set your custom domain in the Convex dashboard under Project Settings > Domains. Point your DNS (Cloudflare or registrar) to the records Convex provides. Set `SITE_URL` in your Convex environment variables to match.

**Environment variables (Convex dashboard):**

| Variable | Description |
| -------- | ----------- |
| `SITE_URL` | Your production URL (e.g., `https://yourdomain.com`) |
| `CONVEX_SITE_URL` | Auto-set by Convex (your `.convex.site` URL) |
| `JWT_PRIVATE_KEY` | Ed25519 PKCS8 private key used by `@robelest/convex-auth` to sign session JWTs |
| `JWKS` | Matching OKP Ed25519 public key set for JWT verification |
| `AUTH_SECRET_ENCRYPTION_KEY` | Secret used by Robel Auth for encrypted auth data |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |
| `DASHBOARD_PRIMARY_ADMIN_EMAIL` | The GitHub primary email that gets full dashboard admin access |

### Authentication: Convex auth (default)

Authentication uses `@robelest/convex-auth` with GitHub OAuth by default. The auth provider, sessions, and admin access are all handled inside Convex with no external auth service required.

**GitHub OAuth callback URL** (add to your GitHub OAuth app):

```
https://<your-deployment>.convex.site/api/auth/callback/github
```

See [Dashboard](/docs-dashboard) for admin setup instructions.

For browser apps, use `@robelest/convex-auth/browser`, not the framework-neutral `@robelest/convex-auth/client`. The browser entrypoint supplies local storage, URL handling, and HTTP defaults needed for OAuth callback exchange.

### Convex production deploy

To deploy only the Convex backend functions (without rebuilding static assets):

```bash
npx convex deploy
```

---

### Legacy: Netlify deployment

> Netlify deployment is the legacy hosting mode. It is still fully supported for forks that prefer Netlify or have existing Netlify setups. Set `hosting.mode: "netlify"` in `siteConfig.ts` to use this path.

1. Connect GitHub repo to Netlify
2. Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
3. Publish directory: `dist`
4. Add env variables:
   - `CONVEX_DEPLOY_KEY` (from Convex Dashboard > Project Settings > Deploy Key)
   - `VITE_CONVEX_URL` (your production Convex URL, e.g., `https://your-deployment.convex.cloud`)

Both are required: deploy key for builds, URL for edge function runtime.

RSS, sitemap, and API routes on Netlify are handled by edge functions in `netlify/edge-functions/`. They read `VITE_CONVEX_URL` from the environment automatically.

### Legacy: WorkOS authentication

> WorkOS is the legacy auth mode. Set `auth.mode: "workos"` in `siteConfig.ts` and configure `WORKOS_CLIENT_ID` in Convex environment variables to use it. See [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos).

## Convex schema

```typescript
// convex/schema.ts
export default defineSchema({
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    published: v.boolean(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    image: v.optional(v.string()),
    excerpt: v.optional(v.string()), // For card view
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),

  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
    order: v.optional(v.number()),
    excerpt: v.optional(v.string()), // For card view
    image: v.optional(v.string()), // Thumbnail for featured cards
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),
});
```

## Troubleshooting

**Posts not appearing**

- Check `published: true` in frontmatter
- Run `npm run sync` for development
- Run `npm run sync:prod` for production
- Run `npm run sync:wiki` or `npm run sync:wiki:prod` for wiki
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content, wiki, and discovery files together
- Verify in Convex dashboard

**RSS/Sitemap errors (Convex self-hosting)**

- Test the Convex HTTP URL directly: `https://your-deployment.convex.site/rss.xml`
- Verify `SITE_URL` is set in Convex environment variables

**RSS/Sitemap errors (Netlify legacy)**

- Verify `VITE_CONVEX_URL` is set in Netlify environment variables
- Check edge functions in `netlify/edge-functions/`

**Build failures (Netlify legacy)**

- Verify `CONVEX_DEPLOY_KEY` is set in Netlify
- Ensure `@types/node` is in devDependencies
- Build command must include `--include=dev`
- Check Node.js version (18+)

**Static deploy issues (Convex self-hosting)**

- Run `npx convex dev --once` to push backend state if HTTP actions are disabled
- Run `npm run deploy` again if assets appear stale (clear browser cache too)
- Verify `npx @convex-dev/self-hosting setup` was run at least once
- Confirm the Static Hosting component is registered in `convex/convex.config.ts`
- Confirm `registerStaticRoutes(http, components.selfHosting)` is present in `convex/http.ts`
- Reference the [Convex Static Hosting component docs](https://www.convex.dev/components/static-hosting) for the latest setup path

**GitHub auth callback stuck on `?code=...`**

- Confirm the frontend imports Robel Auth from `@robelest/convex-auth/browser`
- Confirm `JWT_PRIVATE_KEY` and `JWKS` are Ed25519 compatible
- Remove stale `?code=...` from the URL and retry GitHub login
- Verify `DASHBOARD_PRIMARY_ADMIN_EMAIL` matches the GitHub primary email exactly