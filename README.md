# markdown "sync" framework

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Convex](https://img.shields.io/badge/Convex-enabled-ff6b6b.svg)
![Convex](https://img.shields.io/badge/Convex-self--hosted-ff6b6b.svg)

An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex.

Write markdown locally, run `npm run sync` (dev) or `npm run sync:prod` (production), and content appears instantly across all connected browsers. Built with React, Convex, and Vite. Optimized for AEO, GEO, and LLM discovery.

**How publishing works:** Write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so all connected browsers update automatically.

**Sync commands:**

Sync command scripts are located in `scripts/` (sync-posts.ts, sync-discovery-files.ts).

**Development:**

- `npm run sync` - Sync markdown content
- `npm run sync:discovery` - Update AGENTS.md, CLAUDE.md, llms.txt (includes wiki pages, copies AGENTS.md to public/)
- `npm run sync:wiki` - Sync wiki from content/blog and content/pages
- `npm run sync:all` - Sync content + wiki + discovery files together

**Production:**

- `npm run sync:prod` - Sync markdown content
- `npm run sync:discovery:prod` - Update discovery files
- `npm run sync:wiki:prod` - Sync wiki to production
- `npm run sync:all:prod` - Sync content + wiki + discovery files together

**Knowledge base sync:**

- `npm run sync:wiki -- --kb=<id>` - Sync wiki into a specific knowledge base

**Export dashboard content:**

- `npm run export:db` - Export dashboard posts/pages to content folders (development)
- `npm run export:db:prod` - Export dashboard posts/pages (production)

**How versioning works:** Markdown files live in `content/blog/` and `content/pages/`. These are regular files in your git repo. Commit changes, review diffs, roll back like any codebase. The sync command pushes content to Convex.

```bash
# Edit, commit, sync
git add content/blog/my-post.md
git commit -m "Update post"
npm run sync        # dev
npm run sync:prod   # production
```

## Documentation

Full documentation is available at **[markdown.fast/docs](https://www.markdown.fast/docs)**

### Guides

- [Setup Guide](https://www.markdown.fast/setup-guide) - Complete fork and deployment guide
- [Fork Configuration Guide](https://www.markdown.fast/fork-configuration-guide) - Automated or manual fork setup
- [Dashboard Guide](https://www.markdown.fast/how-to-use-the-markdown-sync-dashboard) - Content management and site configuration
- [MCP Server](https://www.markdown.fast/how-to-use-mcp-server) - AI tool integration for Cursor and Claude Desktop
- [AgentMail Setup](https://www.markdown.fast/blog/how-to-use-agentmail) - Newsletter and contact form integration
- [WorkOS Setup](https://www.markdown.fast/how-to-setup-workos) - Legacy authentication mode (use `auth.mode: "workos"` in siteConfig)

### AI Development Tools

The project includes documentation optimized for AI coding assistants:

- **CLAUDE.md** - Project instructions for Claude Code CLI with workflows, commands, and conventions
- **AGENTS.md** - General AI agent instructions for understanding the codebase structure
- **llms.txt** - AI agent discovery file at `/llms.txt`
- **.cursor/skills/** - Focused skill documentation:
  - `frontmatter.md` - Complete frontmatter syntax and all field options
  - `convex.md` - Convex patterns specific to this app
  - `sync.md` - How sync commands work and content flow
  - `robel-auth/SKILL.md` - `@robelest/convex-auth` integration patterns
  - `convex-self-hosting/SKILL.md` - Convex static self hosting setup

These files are automatically updated during `npm run sync:discovery` with current site statistics.

## Features

**AI agent integration** - API endpoints, raw markdown files, skills.md and MCP server included.

**File-based publishing** - Write markdown locally, content syncs everywhere with version control.

**LLM wiki and knowledge bases** - Build searchable wikis from your content. Upload Obsidian vaults or markdown folders as knowledge base projects with per-KB API access.

**Knowledge graph** - Interactive visualization of how your wiki pages and knowledge bases connect.

**Virtual filesystem** - Shell-like HTTP interface for `ls`, `cat`, `grep`, `tree` across all site content at `/vfs/exec`. No auth required.

**URL content import** - Import and scrape any webpage into markdown with Firecrawl.

**Newsletter automation** - Built-in subscription forms and admin dashboard powered by AgentMail.

**Multiple output formats** - JSON via API endpoints, raw `.md` files, and RSS feeds.

**Real-time team sync** - Multiple developers run `npm run sync` from different machines. All connected browsers update instantly.

**Sync commands** - Sync content, wiki, and discovery files with one command. Update AGENTS.md, CLAUDE.md, and llms.txt automatically.

**Semantic search** - Find content by meaning, not just keywords, with OpenAI embeddings.

**Ask AI** - Chat with your site content. Get answers with sources via Cmd+J.

**Admin dashboard** - Full content management with live preview, analytics, config editor, sync buttons, and knowledge base management.

**Anonymous demo mode** - Visitors can explore the dashboard without signing in. Demo content resets every 30 minutes.

**Four themes** - Dark, light, tan, and cloud with font switcher (serif, sans, monospace).

**Full text search** - Command+K shortcut with result highlighting across posts, pages, and wiki.

See the full feature list on the [About page](https://www.markdown.fast/about).

## Fork Configuration

After forking, run the automated configuration:

```bash
cp fork-config.json.example fork-config.json
# Edit fork-config.json with your site info
npm run configure
```

The `fork-config.json.example` includes all configurable options:

- **Site settings**: name, title, description, URL, domain
- **Auth mode**: `convex-auth` (default), `workos` (legacy), or `none` (local dev)
- **Hosting mode**: `convex-self-hosted` (default) or `netlify` (legacy)
- **Media provider**: `convex` (default), `convexfs`, or `r2`
- **Creator info**: name, social links, bio
- **Feature toggles**: newsletter, dashboard, stats page, AI chat, etc.

See the [Fork Configuration Guide](https://www.markdown.fast/fork-configuration-guide) for detailed instructions and [FORK_CONFIG.md](./FORK_CONFIG.md) for the complete reference.

## One click setup paths

Use either path to get your own clone + Convex backend quickly:

1. GitHub template flow:
   - Click [Use this template](https://github.com/waynesutton/markdown-site/generate)
   - Clone your new repo
   - Run `npm install`, `npx convex dev --once`, `npm run sync`, `npm run deploy`
2. CLI flow:
   - Run `npx create-markdown-sync my-site`
   - Follow prompts and open your site when setup finishes
3. Website setup guide:
   - Follow [markdown.fast/fork-configuration-guide](https://www.markdown.fast/fork-configuration-guide)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Convex account

### Setup

1. Install dependencies:

```bash
npm install
```

2. Initialize Convex:

```bash
npx convex dev
```

This will create your Convex project and generate the `.env.local` file.

If you are using WSL 2 and browser auth does not open, run:

```bash
npx convex login --no-open --login-flow paste
npx convex dev --once
```

Then start normal watch mode:

```bash
npx convex dev
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:5173

### Validation scripts

Verify your environment and deployment:

```bash
npm run validate:env       # Check local env readiness
npm run validate:env:prod  # Check production env
npm run verify:deploy      # Verify deployed endpoints
npm run verify:deploy:prod # Verify production endpoints
```

## Deployment

### Default deployment (Convex self hosted)

```bash
npx @convex-dev/self-hosting setup
npx convex dev --once
npm run deploy
```

`npm run deploy` runs the full one-shot flow through `@convex-dev/self-hosting` and builds for the target Convex deployment automatically.

### Custom domain setup

- Set your Convex custom domain to `markdown.fast` in the Convex dashboard.
- Point DNS from Cloudflare to Convex using the records Convex provides.
- Set `VITE_CONVEX_SITE_URL` (or `VITE_SITE_URL`) for frontend HTTP route overrides.
- Keep `VITE_CONVEX_URL` for the Convex client URL.

### Legacy deployment (Netlify)

[![Netlify Status](https://api.netlify.com/api/v1/badges/d8c4d83d-7486-42de-844b-6f09986dc9aa/deploy-status)](https://app.netlify.com/projects/markdowncms/deploys)

1. Deploy Convex functions to production:

```bash
npx convex deploy
```

2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `CONVEX_DEPLOY_KEY` - Generate from [Convex Dashboard](https://dashboard.convex.dev) > Project Settings > Deploy Key
   - `VITE_CONVEX_URL` - Your production Convex URL

For detailed setup, see the [Convex Netlify Deployment Guide](https://docs.convex.dev/production/hosting/netlify) and [netlify-deploy-fix.md](./netlify-deploy-fix.md) for troubleshooting.

## Auth modes

Default mode:

- `auth.mode: "convex-auth"` - GitHub OAuth via `@robelest/convex-auth`
- `hosting.mode: "convex-self-hosted"` - Static assets via `@convex-dev/self-hosting`
- `media.provider: "convex"` - Direct Convex storage

Legacy mode:

- `auth.mode: "workos"` for WorkOS AuthKit compatibility
- `hosting.mode: "netlify"` for Netlify deployment
- `media.provider: "convexfs"` or `media.provider: "r2"` for optional media backends

Local fallback mode:

- `auth.mode: "none"` for local development only

## Dashboard admin access

Dashboard access is server enforced when `dashboard.requireAuth: true`.

### Setting up GitHub OAuth (required for fork users)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to your frontend URL (e.g., `http://localhost:5173`)
4. Set Authorization callback URL to: `https://<your-deployment>.convex.site/api/auth/callback/github`
5. Copy Client ID and Client Secret

### Set environment variables

```bash
npx convex env set AUTH_GITHUB_ID "your-github-client-id"
npx convex env set AUTH_GITHUB_SECRET "your-github-client-secret"
npx convex env set DASHBOARD_ADMIN_BOOTSTRAP_KEY "choose-a-long-random-secret"
```

### Bootstrap your admin

```bash
npx convex run authAdmin:bootstrapDashboardAdmin \
  '{"bootstrapKey":"choose-a-long-random-secret","email":"your-email@example.com"}'
```

### Grant additional admins

```bash
npx convex run authAdmin:grantDashboardAdmin '{"email":"colleague@example.com"}'
```

### Optional strict email gate

```bash
npx convex env set DASHBOARD_PRIMARY_ADMIN_EMAIL "your-email@example.com"
```

See [FORK_CONFIG.md](./FORK_CONFIG.md#setting-up-your-admin-email-required-for-fork-users) for complete admin setup instructions.

## Tech Stack

React 18, TypeScript, Vite, Convex (self hosted), `@robelest/convex-auth`, `@convex-dev/self-hosting`. Legacy mode: Netlify + WorkOS.

## Recent updates

- **Application-level rate limiting** across all public endpoints using `@convex-dev/rate-limiter` with 4-tier protection (LLM cost, heavy reads, public mutations, standard reads)
- **LLM wiki** compiled by GPT-4.1 mini from your site content with backlinks, categories, and knowledge graph
- **Knowledge bases** for uploading Obsidian vaults or markdown folders with per-KB API access and visibility controls
- **Virtual filesystem** at `/vfs/tree` and `/vfs/exec` for unauthenticated shell-like access to all content
- **Anonymous demo mode** at `/dashboard` with 30-minute auto-cleanup
- **Wiki sync commands** (`npm run sync:wiki`, `npm run sync:all`) for CLI-driven wiki population
- **Convex self hosting** as default deployment via `@convex-dev/self-hosting`
- **@robelest/convex-auth** as default authentication with GitHub OAuth
- **convex-doctor score: 100/100** across security, performance, correctness, schema, and architecture

See the [Changelog](https://www.markdown.fast/changelog) for the full version history.

## Source

Fork this project: [github.com/waynesutton/markdown-site](https://github.com/waynesutton/markdown-site)

## License

This project is licensed under the [MIT License](https://github.com/waynesutton/markdown-site/blob/main/LICENSE).
