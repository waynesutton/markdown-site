---
title: "v1.18.0 release: 12 versions of shipping"
description: "Everything new from v1.7 to v1.18.0. Automated fork setup, GitHub contributions graph, write page, mobile menu, aggregates, and more."
date: "2025-12-20"
slug: "raw-markdown-and-copy-improvements"
published: true
tags: ["release", "features", "updates", "developer-tools"]
readTime: "8 min read"
featured: true
featuredOrder: 2
image: "/images/v17.png"
excerpt: "12 versions of new features: automated fork config, GitHub graph, write page, mobile menu, stats aggregates, and more."
---

## What shipped from v1.7 to v1.18

This post covers 12 versions of updates to the markdown sync framework. From raw markdown files to automated fork configuration, here is everything that changed.

## Automated fork configuration (v1.18.0)

Fork setup now takes one command:

```bash
cp fork-config.json.example fork-config.json
# Edit fork-config.json with your site info
npm run configure
```

The configure script updates all 11 configuration files:

| File                                | What it updates                        |
| ----------------------------------- | -------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, bio, GitHub, features       |
| `src/pages/Home.tsx`                | Intro paragraph, footer links          |
| `src/pages/Post.tsx`                | SITE_URL, SITE_NAME constants          |
| `convex/http.ts`                    | SITE_URL, SITE_NAME constants          |
| `convex/rss.ts`                     | SITE_URL, SITE_TITLE, SITE_DESCRIPTION |
| `index.html`                        | Meta tags, JSON-LD, page title         |
| `public/llms.txt`                   | Site info, GitHub link                 |
| `public/robots.txt`                 | Sitemap URL                            |
| `public/openapi.yaml`               | Server URL, site name                  |
| `public/.well-known/ai-plugin.json` | Plugin metadata                        |
| `src/context/ThemeContext.tsx`      | Default theme                          |

Two options for fork setup:

1. **Automated** (recommended): JSON config file + `npm run configure`
2. **Manual**: Follow step-by-step instructions in `FORK_CONFIG.md`

## GitHub contributions graph (v1.17.0)

The homepage now displays a GitHub-style contribution graph. Configure it in siteConfig:

```typescript
gitHubContributions: {
  enabled: true,
  username: "your-github-username",
  showYearNavigation: true,
  linkToProfile: true,
  title: "Contributions",
}
```

Features:

- Theme-aware colors (dark, light, tan, cloud each have unique palettes)
- Year navigation with Phosphor CaretLeft/CaretRight icons
- Click the graph to visit the GitHub profile
- Uses public API (no GitHub token required)
- Mobile responsive with scaled cells

## Write page (v1.13.0 to v1.16.0)

A markdown writing page now lives at `/write`. Not linked in navigation. Access it directly.

Three-column layout:

- **Left sidebar**: Home link, content type selector (Blog Post/Page), actions (Clear, Theme, Font)
- **Center**: Full-height writing area with Copy All button
- **Right sidebar**: Frontmatter reference with per-field copy buttons

Features across iterations:

- Font switcher toggles between Serif and Sans-serif
- Theme toggle matches the rest of the app
- localStorage persistence for content, type, and font preference
- Word, line, and character counts in status bar
- Warning banner about refresh losing content
- Works with Grammarly and browser spellcheck
- Mobile responsive with stacked layout

The write page does not connect to Convex. It stores content locally. Copy your markdown and paste it into a file in `content/blog/` or `content/pages/`, then run `npm run sync`.

## Stats aggregates (v1.11.0)

The stats page now uses O(log n) aggregate counts instead of O(n) table scans.

Before: Every stats query scanned the entire pageViews table.

After: Three TableAggregate instances provide pre-computed counts:

- `totalPageViews`: Global view count
- `pageViewsByPath`: Per-page view counts
- `uniqueVisitors`: Distinct session count

Run the backfill after deploying:

```bash
npx convex run stats:backfillAggregates
```

The backfill processes 500 records at a time to stay under the 16MB Convex memory limit. It schedules itself to continue until complete.

Stats queries now respond consistently fast regardless of how many page views exist.

## Dedicated blog page (v1.12.0)

A dedicated `/blog` page now exists. Configure it in siteConfig:

```typescript
blogPage: {
  enabled: true,         // Enable /blog route
  showInNav: true,       // Show in navigation
  title: "Blog",         // Page title
  order: 0,              // Nav order (lower = first)
},
displayOnHomepage: true, // Also show posts on homepage
```

Navigation combines the Blog link with page links and sorts by order. Set `order: 5` to place Blog after pages with order 0-4.

Centralized configuration now lives in `src/config/siteConfig.ts` instead of scattered across components.

## Fork configuration documentation (v1.10.0)

The docs, setup guide, and README now include a "Files to Update When Forking" section listing all 9 configuration files:

- Frontend: `siteConfig.ts`, `Home.tsx`, `Post.tsx`
- Backend: `http.ts`, `rss.ts`
- HTML: `index.html`
- AI discovery: `llms.txt`, `robots.txt`, `openapi.yaml`, `ai-plugin.json`

## Scroll-to-top button (v1.9.0)

A scroll-to-top button appears after scrolling 300px. Configure it in `src/components/Layout.tsx`:

```typescript
const scrollToTopConfig: Partial<ScrollToTopConfig> = {
  enabled: true, // Set false to disable
  threshold: 300, // Pixels before showing
  smooth: true, // Smooth scroll animation
};
```

Uses Phosphor ArrowUp icon. Works with all four themes. Passive scroll listener for performance.

## Mobile menu (v1.8.0)

Hamburger navigation for mobile and tablet screens. Tap the icon to open a slide-out drawer with page links.

Features:

- Smooth CSS transform animations
- Keyboard accessible (Escape to close)
- Focus trap for screen reader support
- Home link at the bottom of the drawer
- Auto-closes when navigating

Desktop navigation stays unchanged. Mobile menu only appears below 1024px.

## Generate Skill (v1.8.0)

The CopyPageDropdown now includes a Generate Skill option. Click to download the current post or page as an AI agent skill file.

The skill file includes:

- Metadata section with title, description, and tags
- When to use section describing scenarios
- Instructions section with full content

Downloads as `{slug}-skill.md`. Use these files to train AI agents or add context to workflows.

## Static raw markdown files (v1.7.0)

Every published post and page now gets a static `.md` file at `/raw/{slug}.md`. Generated during `npm run sync`.

Example URLs:

- `/raw/setup-guide.md`
- `/raw/about.md`
- `/raw/how-to-publish.md`

Each file includes a metadata header with type, date, reading time, and tags.

Use cases:

- Share raw markdown with AI agents
- Link directly to source content for LLM ingestion
- View the markdown source of any post

## View as Markdown (v1.7.0)

The Copy Page dropdown now includes "View as Markdown" to open the raw `.md` file in a new tab.

Other dropdown options:

- Copy page (formatted markdown to clipboard)
- Open in ChatGPT
- Open in Claude
- Open in Perplexity

## Perplexity integration (v1.7.0)

Perplexity is now available as an AI service option. Click to send full article content to Perplexity for research and analysis.

If the URL gets too long, content copies to clipboard and Perplexity opens in a new tab. Paste to continue.

## Featured images (v1.7.0)

Posts and pages can include a featured image that displays in card view:

```yaml
image: "/images/my-thumbnail.png"
featured: true
featuredOrder: 1
```

The image displays as a square thumbnail above the title. Non-square images crop to center. Recommended: 400x400px minimum (800x800px for retina).

## Open Graph image fix (v1.12.1)

Posts with `image` in frontmatter now display their specific OG image when shared. Posts without images fall back to `og-default.svg`. Pages now supported with `og:type` set to "website".

Relative image paths (like `/images/v17.png`) resolve to absolute URLs automatically.

## Centralized font sizes (v1.12.2)

All font sizes now use CSS variables in `global.css`:

```css
:root {
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 16px;
  --font-size-lg: 17px;
  /* ... */
}
```

Edit `:root` variables to customize font sizes across the entire site. Mobile responsive overrides at 768px breakpoint.

## Improved table styling (v1.7.0)

Tables render with GitHub-style formatting:

| Feature | Status                  |
| ------- | ----------------------- |
| Borders | Clean lines             |
| Mobile  | Horizontal scroll       |
| Hover   | Row highlighting        |
| Themes  | Dark, light, tan, cloud |

Alternating row colors and hover states adapt to each theme.

## Quick reference: sync vs deploy

| Change                  | Command                    | Speed          |
| ----------------------- | -------------------------- | -------------- |
| Blog posts              | `npm run sync`             | Instant        |
| Pages                   | `npm run sync`             | Instant        |
| Featured items          | `npm run sync`             | Instant        |
| Import external URL     | `npm run import` then sync | Instant        |
| siteConfig changes      | Redeploy                   | Requires build |
| Logo gallery config     | Redeploy                   | Requires build |
| React components/styles | Redeploy                   | Requires build |
| Fork configuration      | `npm run configure`        | Instant        |

Markdown content syncs instantly via Convex. Source code changes require pushing to GitHub for Netlify to rebuild.

## Upgrade path

If upgrading from an earlier version:

1. Pull the latest code
2. Run `npm install` for new dependencies
3. Run `npx convex dev` to sync schema changes
4. Run `npx convex run stats:backfillAggregates` if using stats
5. Check `siteConfig.ts` for new configuration options

All features work across all four themes and are mobile responsive.
