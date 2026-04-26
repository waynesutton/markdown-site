---
description: Deploy changes to production
---

# /deploy

Full deployment workflow for pushing changes to production.

## Deployment steps

### 1. Sync content to production

```bash
npm run sync:all:prod
```

This syncs:
- All posts and pages
- Wiki from content/blog and content/pages
- Discovery files (AGENTS.md, CLAUDE.md, llms.txt with wiki pages)
- Raw markdown files

### 2. Deploy Convex functions

```bash
npx convex deploy
```

This pushes any changes to:
- Mutations and queries
- Schema changes
- HTTP endpoints
- Cron jobs

### 3. Build and deploy frontend

If using Netlify (automatic):
- Push to main branch triggers build
- Netlify runs: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`

If manual:
```bash
npm run build
```

## Verification checklist

After deployment:

- [ ] Production site loads correctly
- [ ] New content appears
- [ ] Existing content still works
- [ ] No console errors
- [ ] RSS feed updates
- [ ] Sitemap includes new pages

## Environment requirements

| File | Purpose |
|------|---------|
| `.env.production.local` | Production Convex URL |
| Netlify env vars | API keys, Convex deployment |

## Rollback

If something goes wrong:

1. Check Convex dashboard for function errors
2. Redeploy previous Convex version if needed
3. Check Netlify for build logs
4. Trigger a redeploy in Netlify dashboard
