---
title: "Team Workflows"
description: "How teams collaborate on markdown content using git, sync to shared Convex deployments, and automate production syncs with CI/CD."
date: "2025-12-29"
slug: "team-workflows-git-version-control"
published: true
tags: ["git", "convex", "ci-cd", "collaboration", "workflow"]
readTime: "6 min read"
image: /images/team-sync.png
featured: false
layout: "sidebar"
showFooter: true
newsletter: true
excerpt: "Learn how teams use git for markdown version control, sync to Convex deployments, and automate production workflows."
docsSection: true
docsSectionOrder: 1
docsSectionGroup: "Setup"
docsLanding: true
---

# Team Workflows with Git Version Control

Teams use this markdown framework by treating markdown files as source code. Content lives in git, gets reviewed via pull requests, and syncs to Convex deployments for instant previews and production updates.

Here's how it works in practice.

## Initial Setup

Each team member clones the repo and sets up their own development environment:

```bash
# Clone the repo
git clone https://github.com/your-org/markdown-site.git
cd markdown-site

# Install dependencies
npm install

# Initialize Convex (creates .env.local with dev deployment URL)
npx convex dev

# Start dev server
npm run dev
```

Each developer gets their own Convex dev deployment. The `.env.local` file contains a unique development URL and stays gitignored. This means everyone can preview changes locally without affecting others.

## Git Version Control

Markdown files are regular files in your git repository. Teams commit, push, and review content changes like any other code.

```bash
# Team member writes a new post
# Creates: content/blog/my-new-post.md

# Commit to git
git add content/blog/my-new-post.md
git commit -m "Add new blog post"
git push origin main
```

The markdown files in `content/blog/` and `content/pages/` are the source of truth. They live in git, get reviewed via pull requests, and can be rolled back like any codebase.

This approach gives you:

- Full version history for all content
- Pull request reviews before publishing
- Easy rollbacks when needed
- Branch-based workflows for drafts
- Conflict resolution through git merge tools

## Syncing to Convex

The sync script reads markdown files from your local filesystem and uploads them to Convex. Development and production use separate deployments.

**Development (each developer):**

```bash
# After pulling latest changes from git
git pull origin main

# Sync markdown files to YOUR dev Convex
npm run sync
```

**Production (shared deployment):**

```bash
# One person (or CI/CD) syncs to production
npm run sync:prod
```

The sync script:

1. Reads all `.md` files from `content/blog/` and `content/pages/`
2. Parses frontmatter using `gray-matter`
3. Uploads to Convex via `api.posts.syncPostsPublic` mutation
4. Generates static files in `public/raw/` for AI access

Sync is idempotent. Running it multiple times is safe. The mutation updates posts by slug, so the last sync wins.

## Environment Files

Two environment files control which Convex deployment receives your content:

| File                    | Purpose         | Git Status | Who Has It                      |
| ----------------------- | --------------- | ---------- | ------------------------------- |
| `.env.local`            | Dev Convex URL  | Gitignored | Each developer (different URLs) |
| `.env.production.local` | Prod Convex URL | Gitignored | Team shares same URL            |

**Team setup:**

1. Create production Convex deployment: `npx convex deploy`
2. Share the production URL with team
3. Each developer creates `.env.production.local`:
   ```
   VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
   ```

Each developer maintains their own dev environment while sharing the production deployment URL.

## Netlify Deployment

Netlify connects to your GitHub repo and auto-deploys on every push.

**Netlify Build Settings:**

- Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
- Publish directory: `dist`

**Netlify Environment Variables:**

- `CONVEX_DEPLOY_KEY` - Deploys Convex functions at build time
- `VITE_CONVEX_URL` - Production Convex URL (same as `.env.production.local`)

**Workflow:**

1. Team pushes markdown to GitHub
2. Netlify auto-builds and deploys
3. Site updates automatically (Convex functions deploy, frontend rebuilds)
4. Content sync happens separately via `npm run sync:prod`

Netlify handles frontend deployment. Content sync is a separate step that updates the Convex database.

## Complete Team Workflow

Here's what happens when a team member adds a new blog post:

```bash
# 1. Create markdown file locally
# content/blog/team-update.md

# 2. Commit to git
git add content/blog/team-update.md
git commit -m "Add team update post"
git push origin main

# 3. Sync to dev Convex (for local preview)
npm run sync

# 4. Netlify auto-deploys from GitHub (frontend rebuilds)

# 5. Sync to production Convex (one person or CI/CD)
npm run sync:prod
```

**Result:**

- Markdown file is in git (version controlled)
- Dev Convex has the post (local preview)
- Production Convex has the post (live site)
- Netlify site is rebuilt (frontend code)

## CI/CD Automation

You can automate production sync with GitHub Actions. This ensures content updates happen automatically when markdown files change.

Create `.github/workflows/sync-production.yml`:

```yaml
name: Sync to Production
on:
  push:
    branches: [main]
    paths:
      - "content/**"

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run sync:prod
        env:
          VITE_CONVEX_URL: ${{ secrets.PROD_CONVEX_URL }}
```

**Setup:**

1. Add `PROD_CONVEX_URL` to GitHub Secrets (Settings > Secrets and variables > Actions)
2. Push the workflow file to your repo
3. Every push to `main` that changes files in `content/` triggers a production sync

**Benefits:**

- No manual sync step required
- Content updates automatically after git push
- Consistent production state
- Works for all team members

**Optional: Sync discovery files too**

If you want to update discovery files (`AGENTS.md`, `llms.txt`) automatically:

```yaml
- run: npm run sync:all:prod
  env:
    VITE_CONVEX_URL: ${{ secrets.PROD_CONVEX_URL }}
```

This syncs both content and discovery files in one step.

## Architecture Overview

The system separates concerns across four layers:

**Git:** Source of truth for markdown files (version controlled)

**Convex Dev:** Each developer's local preview database

**Convex Prod:** Shared production database

**Netlify:** Frontend hosting (auto-deploys from git)

**Why this works:**

- Markdown files are plain text (great for git diffs)
- Convex sync is instant (no rebuild needed for content changes)
- Netlify handles frontend deployment (code changes trigger rebuilds)
- Each developer can preview locally without affecting others

## Team Collaboration Best Practices

**Content changes:** Edit markdown → commit → push → sync to prod

**Code changes:** Edit React/TypeScript → commit → push → Netlify auto-deploys

**Config changes:** Edit `siteConfig.ts` → commit → push → Netlify rebuilds

**Convex schema changes:** Edit `convex/schema.ts` → commit → `npx convex deploy`

**Conflict resolution:**

- Git handles markdown file conflicts (merge/rebase)
- Convex sync is idempotent (safe to run multiple times)
- Last sync wins for content (Convex mutations update by slug)

## Summary

Teams collaborate on markdown content through git version control. Each developer maintains a local dev environment for previews, while production syncs happen automatically via CI/CD or manual commands. Netlify handles frontend deployment separately from content updates.

The workflow gives you version control, pull request reviews, and instant previews without sacrificing the real-time sync that makes content updates immediate.
