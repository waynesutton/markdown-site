# Deployment

---
Type: page
Date: 2026-01-11
---

## Deployment

### Netlify setup

1. Connect GitHub repo to Netlify
2. Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
3. Publish directory: `dist`
4. Add env variables:
   - `CONVEX_DEPLOY_KEY` (from Convex Dashboard > Project Settings > Deploy Key)
   - `VITE_CONVEX_URL` (your production Convex URL, e.g., `https://your-deployment.convex.cloud`)

Both are required: deploy key for builds, URL for edge function runtime.

### Convex production

```bash
npx convex deploy
```

### Edge functions

RSS, sitemap, and API routes are handled by Netlify Edge Functions in `netlify/edge-functions/`. They dynamically read `VITE_CONVEX_URL` from the environment. No manual URL configuration needed.

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

**RSS/Sitemap errors**

- Verify `VITE_CONVEX_URL` is set in Netlify
- Test Convex HTTP URL: `https://your-deployment.convex.site/rss.xml`
- Check edge functions in `netlify/edge-functions/`

**Build failures**

- Verify `CONVEX_DEPLOY_KEY` is set in Netlify
- Ensure `@types/node` is in devDependencies
- Build command must include `--include=dev`
- Check Node.js version (18+)