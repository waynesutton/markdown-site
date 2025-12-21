# Markdown Site - File Structure

A brief description of each file in the codebase.

## Root Files

| File             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `package.json`   | Dependencies and scripts for the blog          |
| `tsconfig.json`  | TypeScript configuration                       |
| `vite.config.ts` | Vite bundler configuration                     |
| `index.html`     | Main HTML entry with SEO meta tags and JSON-LD |
| `netlify.toml`   | Netlify deployment and Convex HTTP redirects   |
| `README.md`      | Project documentation                          |
| `AGENTS.md`      | AI coding agent instructions (agents.md spec)  |
| `files.md`       | This file - codebase structure                 |
| `changelog.md`   | Version history and changes                    |
| `TASK.md`        | Task tracking and project status               |

## Source Files (`src/`)

### Entry Points

| File            | Description                                |
| --------------- | ------------------------------------------ |
| `main.tsx`      | React app entry point with Convex provider |
| `App.tsx`       | Main app component with routing            |
| `vite-env.d.ts` | Vite environment type definitions          |

### Config (`src/config/`)

| File            | Description                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `siteConfig.ts` | Centralized site configuration (name, logo, blog page, posts display, GitHub contributions, nav order) |

### Pages (`src/pages/`)

| File        | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| `Home.tsx`  | Landing page with featured content and optional post list         |
| `Blog.tsx`  | Dedicated blog page with post list (configurable via siteConfig.blogPage) |
| `Post.tsx`  | Individual blog post view (update SITE_URL/SITE_NAME when forking) |
| `Stats.tsx` | Real-time analytics dashboard with visitor stats                  |
| `Write.tsx` | Three-column markdown writing page with Cursor docs-style UI, frontmatter reference with copy buttons, theme toggle, font switcher (serif/sans-serif), and localStorage persistence (not linked in nav) |

### Components (`src/components/`)

| File                      | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `Layout.tsx`              | Page wrapper with search button, theme toggle, mobile menu, and scroll-to-top |
| `ThemeToggle.tsx`         | Theme switcher (dark/light/tan/cloud)                      |
| `PostList.tsx`            | Year-grouped blog post list                                |
| `BlogPost.tsx`            | Markdown renderer with syntax highlighting                 |
| `CopyPageDropdown.tsx`    | Share dropdown for LLMs (ChatGPT, Claude, Perplexity) with View as Markdown and Generate Skill options |
| `SearchModal.tsx`         | Full text search modal with keyboard navigation            |
| `FeaturedCards.tsx`       | Card grid for featured posts/pages with excerpts           |
| `LogoMarquee.tsx`         | Scrolling logo gallery with clickable links                |
| `MobileMenu.tsx`          | Slide-out drawer menu for mobile navigation with hamburger button |
| `ScrollToTop.tsx`         | Configurable scroll-to-top button with Phosphor ArrowUp icon |
| `GitHubContributions.tsx` | GitHub activity graph with theme-aware colors and year navigation |

### Context (`src/context/`)

| File               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `ThemeContext.tsx` | Theme state management with localStorage persistence |

### Hooks (`src/hooks/`)

| File                 | Description                                   |
| -------------------- | --------------------------------------------- |
| `usePageTracking.ts` | Page view recording and active session heartbeat |

### Styles (`src/styles/`)

| File         | Description                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| `global.css` | Global CSS with theme variables, centralized font-size CSS variables for all themes |

## Convex Backend (`convex/`)

| File               | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `schema.ts`        | Database schema (posts, pages, viewCounts, pageViews, activeSessions) |
| `posts.ts`         | Queries and mutations for blog posts, view counts                    |
| `pages.ts`         | Queries and mutations for static pages                               |
| `search.ts`        | Full text search queries across posts and pages                      |
| `stats.ts`         | Real-time stats with aggregate component for O(log n) counts, page view recording, session heartbeat |
| `crons.ts`         | Cron job for stale session cleanup                                   |
| `http.ts`          | HTTP endpoints: sitemap, API (update SITE_URL/SITE_NAME when forking) |
| `rss.ts`           | RSS feed generation (update SITE_URL/SITE_TITLE when forking)        |
| `convex.config.ts` | Convex app configuration with aggregate component registrations (pageViewsByPath, totalPageViews, uniqueVisitors) |
| `tsconfig.json`    | Convex TypeScript configuration                                      |

### HTTP Endpoints (defined in `http.ts`)

| Route                      | Description                            |
| -------------------------- | -------------------------------------- |
| `/stats`                   | Real-time site analytics page          |
| `/rss.xml`                 | RSS feed with descriptions             |
| `/rss-full.xml`            | RSS feed with full content for LLMs    |
| `/sitemap.xml`             | Dynamic XML sitemap for search engines |
| `/api/posts`               | JSON list of all posts                 |
| `/api/post`                | Single post as JSON or markdown        |
| `/api/export`              | Batch export all posts with content    |
| `/meta/post`               | Open Graph HTML for social crawlers    |
| `/.well-known/ai-plugin.json` | AI plugin manifest                  |
| `/openapi.yaml`            | OpenAPI 3.0 specification              |
| `/llms.txt`                | AI agent discovery                     |

## Content (`content/blog/`)

Markdown files with frontmatter for blog posts. Each file becomes a blog post.

| Field           | Description                                 |
| --------------- | ------------------------------------------- |
| `title`         | Post title                                  |
| `description`   | Short description for SEO                   |
| `date`          | Publication date (YYYY-MM-DD)               |
| `slug`          | URL path for the post                       |
| `published`     | Whether post is public                      |
| `tags`          | Array of topic tags                         |
| `readTime`      | Estimated reading time                      |
| `image`         | Header/Open Graph image URL (optional)      |
| `excerpt`       | Short excerpt for card view (optional)      |
| `featured`      | Show in featured section (optional)         |
| `featuredOrder` | Order in featured section (optional)        |

## Static Pages (`content/pages/`)

Markdown files for static pages like About, Projects, Contact, Changelog.

| Field           | Description                               |
| --------------- | ----------------------------------------- |
| `title`         | Page title                                |
| `slug`          | URL path for the page                     |
| `published`     | Whether page is public                    |
| `order`         | Display order in navigation (lower first) |
| `excerpt`       | Short excerpt for card view (optional)    |
| `featured`      | Show in featured section (optional)       |
| `featuredOrder` | Order in featured section (optional)      |

## Scripts (`scripts/`)

| File            | Description                                       |
| --------------- | ------------------------------------------------- |
| `sync-posts.ts` | Syncs markdown files to Convex at build time      |
| `import-url.ts` | Imports external URLs as markdown posts (Firecrawl) |

## Netlify (`netlify/edge-functions/`)

| File         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `botMeta.ts` | Edge function for social media crawler detection             |
| `rss.ts`     | Proxies `/rss.xml` and `/rss-full.xml` to Convex HTTP        |
| `sitemap.ts` | Proxies `/sitemap.xml` to Convex HTTP                        |
| `api.ts`     | Proxies `/api/posts`, `/api/post`, `/api/export` to Convex   |

## Public Assets (`public/`)

| File           | Description                                    |
| -------------- | ---------------------------------------------- |
| `favicon.svg`  | Site favicon                                   |
| `_redirects`   | SPA redirect rules for static files            |
| `robots.txt`   | Crawler rules for search engines and AI bots (update sitemap URL when forking) |
| `llms.txt`     | AI agent discovery file (update site name/URL when forking) |
| `openapi.yaml` | OpenAPI 3.0 specification (update API title when forking) |

### Raw Markdown Files (`public/raw/`)

Static markdown files generated during `npm run sync`. Each published post and page gets a corresponding `.md` file for direct access by users, search engines, and AI agents.

| File Pattern   | Description                                    |
| -------------- | ---------------------------------------------- |
| `{slug}.md`    | Static markdown file for each post/page        |

Access via `/raw/{slug}.md` (e.g., `/raw/setup-guide.md`).

Files include a metadata header with type (post/page), date, reading time, and tags. The CopyPageDropdown includes a "View as Markdown" option that links directly to these files.

### AI Plugin (`public/.well-known/`)

| File              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `ai-plugin.json`  | AI plugin manifest (update name/description when forking) |

### Images (`public/images/`)

| File             | Description                                  |
| ---------------- | -------------------------------------------- |
| `logo.svg`       | Site logo displayed on homepage              |
| `og-default.svg` | Default Open Graph image for social sharing  |
| `*.png/jpg/svg`  | Blog post images (referenced in frontmatter) |

### Logo Gallery (`public/images/logos/`)

| File                 | Description                              |
| -------------------- | ---------------------------------------- |
| `sample-logo-1.svg`  | Sample logo (replace with your own)      |
| `sample-logo-2.svg`  | Sample logo (replace with your own)      |
| `sample-logo-3.svg`  | Sample logo (replace with your own)      |
| `sample-logo-4.svg`  | Sample logo (replace with your own)      |
| `sample-logo-5.svg`  | Sample logo (replace with your own)      |

## Cursor Rules (`.cursor/rules/`)

| File                       | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `convex-write-conflicts.mdc` | Write conflict prevention patterns for Convex  |
| `convex2.mdc`              | Convex function syntax and examples              |
| `dev2.mdc`                 | Development guidelines and best practices        |
| `help.mdc`                 | Core development guidelines                      |
| `rulesforconvex.mdc`       | Convex schema and function best practices        |
| `sec-check.mdc`            | Security guidelines and audit checklist          |
| `task.mdc`                 | Task list management guidelines                  |
| `write.mdc`                | Writing style guide (activate with @write)       |
