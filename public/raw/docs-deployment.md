# Deployment

---
Type: page
Date: 2026-03-21
---

## Deployment

This app uses **Convex self-hosting** as the default deployment mode. The static React/Vite build is uploaded to Convex storage and served directly from the Convex CDN. No external hosting provider needed.

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

**Custom domain:** Set your custom domain in the Convex dashboard under Project Settings > Domains. Point your DNS (Cloudflare or registrar) to the records Convex provides. Set `SITE_URL` in your Convex environment variables to match.

**Environment variables (Convex dashboard):**

| Variable | Description |
| -------- | ----------- |
| `SITE_URL` | Your production URL (e.g., `https://yourdomain.com`) |
| `CONVEX_SITE_URL` | Auto-set by Convex (your `.convex.site` URL) |

### Authentication: Convex auth (default)

Authentication uses `@robelest/convex-auth` with GitHub OAuth by default. The auth provider, sessions, and admin access are all handled inside Convex with no external auth service required.

**GitHub OAuth callback URL** (add to your GitHub OAuth app):

```
https://<your-deployment>.convex.site/api/auth/callback/github
```

See [Dashboard](/docs-dashboard) for admin setup instructions.

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
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together
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