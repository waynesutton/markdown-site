---
title: "Changelog"
slug: "changelog"
published: true
order: 5
---

All notable changes to this project.

## v1.20.3

Released December 21, 2025

**SEO, AEO, and GEO improvements**

- Raw markdown files now accessible to AI crawlers (ChatGPT, Perplexity)
- Added `/raw/` path bypass in botMeta edge function so AI services receive markdown, not HTML
- Sitemap now includes static pages (about, docs, contact, etc.)
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy
- Link header pointing to llms.txt for AI discovery
- Raw markdown files served with proper Content-Type and CORS headers
- Preconnect hints for Convex backend (faster API calls)
- Fixed URL consistency: openapi.yaml and robots.txt now use www.markdown.fast

## v1.20.2

Released December 21, 2025

**Write conflict prevention for heartbeat mutation**

- Increased backend dedup window from 10s to 20s
- Increased frontend debounce from 10s to 20s to match backend
- Added random jitter (±5s) to heartbeat intervals to prevent synchronized calls across tabs
- Simplified early return to skip ANY update within dedup window
- Prevents "Documents read from or written to the activeSessions table changed" errors

## v1.20.1

Released December 21, 2025

**Visitor map styling improvements**

- Removed box-shadow from map wrapper for cleaner flat design
- Increased land dot contrast for better globe visibility on all themes
- Increased land dot opacity from 0.6 to 0.85
- Darker/more visible land colors for light, tan, and cloud themes
- Lighter land color for dark theme to stand out on dark background

## v1.20.0

Released December 21, 2025

**Real-time visitor map on stats page**

- Displays live visitor locations on a dotted world map
- Uses Netlify's built-in geo detection via edge function (no third-party API needed)
- Privacy friendly: stores city, country, and coordinates only (no IP addresses)
- Theme-aware colors for all four themes (dark, light, tan, cloud)
- Animated pulsing dots for active visitors
- Configurable via `siteConfig.visitorMap`

New files:

- `netlify/edge-functions/geo.ts`: Edge function returning geo data from Netlify headers
- `src/components/VisitorMap.tsx`: SVG world map component with visitor dots

Configuration:

```typescript
// src/config/siteConfig.ts
visitorMap: {
  enabled: true,        // Set to false to hide
  title: "Live Visitors", // Optional title above the map
},
```

Updated files: `convex/schema.ts`, `convex/stats.ts`, `src/hooks/usePageTracking.ts`, `src/pages/Stats.tsx`, `src/config/siteConfig.ts`, `src/styles/global.css`

Documentation updated: setup-guide.md, docs.md, FORK_CONFIG.md, fork-config.json.example, fork-configuration-guide.md

## v1.19.2

Released December 21, 2025

**Improved AI service prompts in CopyPageDropdown**

- Updated ChatGPT, Claude, and Perplexity prompts with clearer instructions
- AI now attempts to load raw markdown URL and provides fallback behavior
- If content loads: provides concise summary and asks how to help
- If content fails: states page could not be loaded without guessing content

Updated file: `src/components/CopyPageDropdown.tsx`

## v1.19.1

Released December 21, 2025

**GitHub Stars on Stats page**

- New GitHub Stars card displays live star count from repository
- Fetches from GitHub public API (no token required)
- Uses Phosphor GithubLogo icon
- Stats page now shows 6 cards in a single row
- Responsive layout: 3x2 on tablet, 2x3 on mobile, stacked on small screens

Updated files: `src/pages/Stats.tsx`, `src/styles/global.css`

## v1.19.0

Released December 21, 2025

**Author display for posts and pages**

- New optional `authorName` and `authorImage` frontmatter fields
- Round avatar image displayed next to date and read time
- Works on individual post and page views (not on blog list)
- Write page updated with new frontmatter field reference

Example frontmatter:

```yaml
authorName: "Your Name"
authorImage: "/images/authors/photo.png"
```

Place author avatar images in `public/images/authors/`. Recommended: square images (they display as circles).

Updated files: `convex/schema.ts`, `scripts/sync-posts.ts`, `convex/posts.ts`, `convex/pages.ts`, `src/pages/Post.tsx`, `src/pages/Write.tsx`, `src/styles/global.css`

Documentation updated: setup-guide.md, docs.md, files.md, README.md, AGENTS.md

New PRD: `prds/howto-Frontmatter.md` with reusable prompt for future frontmatter updates.

## v1.18.1

Released December 21, 2025

**CopyPageDropdown raw markdown URLs**

- AI services (ChatGPT, Claude, Perplexity) now receive raw markdown file URLs instead of page URLs
- URL format: `/raw/{slug}.md` (e.g., `/raw/setup-guide.md`)
- AI services can fetch and parse clean markdown content directly
- Includes metadata headers for structured parsing
- No HTML parsing required by AI services

## v1.18.0

Released December 20, 2025

**Automated fork configuration**

- New `npm run configure` command for one-step fork setup
- Copy `fork-config.json.example` to `fork-config.json`
- Edit the JSON file with your site information
- Run `npm run configure` to apply all changes automatically

Two options for fork setup:

1. **Automated** (recommended): JSON config file + `npm run configure`
2. **Manual**: Follow step-by-step instructions in `FORK_CONFIG.md`

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

New files: `FORK_CONFIG.md`, `fork-config.json.example`, `scripts/configure-fork.ts`

## v1.17.0

Released December 20, 2025

**GitHub contributions graph**

- GitHub activity graph on homepage with theme-aware colors
- Year navigation with Phosphor CaretLeft/CaretRight icons
- Click graph to visit GitHub profile
- Configurable via `siteConfig.gitHubContributions`
- Uses public API (no GitHub token required)

Theme-specific contribution colors:

- Dark theme: GitHub green on dark background
- Light theme: Standard GitHub green
- Tan theme: Warm brown tones
- Cloud theme: Gray-blue tones

New component: `src/components/GitHubContributions.tsx`

Set `enabled: false` in siteConfig to disable.

## v1.15.2

Released December 20, 2025

**Write page font switcher**

- Font switcher in `/write` page Actions section
- Toggle between Serif and Sans-serif fonts in the writing area
- Font preference saved to localStorage and persists across sessions
- Uses same font families defined in global.css

## v1.15.1

Released December 20, 2025

**Write page theme and content fixes**

- Fixed theme toggle icons on `/write` page to match `ThemeToggle.tsx` (Moon, Sun, Half2Icon, Cloud)
- Content type switching now always updates the template in the writing area

## v1.15.0

Released December 20, 2025

**Write page three-column layout**

- Redesigned `/write` page with Cursor docs-style three-column layout
- Left sidebar: content type selector (Blog Post/Page) and action buttons (Clear, Theme)
- Center: full-screen writing area with Copy All button
- Right sidebar: frontmatter field reference with individual copy buttons for each field
- Warning message about refresh losing content
- Stats bar showing words, lines, and characters

## v1.14.0

Released December 20, 2025

**Write page Notion-like UI**

- Redesigned `/write` page with full-screen, distraction-free writing experience
- Floating header with home link, type selector, and action buttons
- Collapsible frontmatter panel on the right
- Removed borders from writing area for cleaner look
- Improved typography and spacing

## v1.13.0

Released December 20, 2025

**Markdown write page**

- New `/write` page for drafting markdown content (not linked in navigation)
- Content type selector for Blog Post or Page with appropriate frontmatter templates
- Frontmatter reference with copy buttons for each field
- Theme toggle matching site themes
- Word, line, and character counts
- localStorage persistence for content, type, and font preference
- Works with Grammarly and browser spellcheck
- Copy all button for easy content transfer
- Clear button to reset content

Access at `yourdomain.com/write`. Content stored in localStorage only.

## v1.12.2

Released December 20, 2025

**Centralized font-size CSS variables**

- All font sizes now use CSS variables for easier customization
- Base scale from `--font-size-3xs` (10px) to `--font-size-hero` (64px)
- Component-specific variables for blog headings, navigation, search, stats, and more
- Mobile responsive overrides at 768px breakpoint

Edit `src/styles/global.css` to customize font sizes across the entire site by changing the `:root` variables.

## v1.12.1

Released December 20, 2025

**Open Graph image fix**

- Posts with `image` in frontmatter now display their specific OG image when shared
- Posts without images fall back to `og-default.svg`
- Pages now supported with `og:type` set to "website" instead of "article"
- Relative image paths (like `/images/v17.png`) resolve to absolute URLs

The `/meta/post` endpoint in `convex/http.ts` now passes the `image` field from posts and pages to the meta HTML generator. If no post matches the slug, it checks for a page with that slug.

## v1.12.0

Released December 20, 2025

**Dedicated blog page with configurable navigation**

- New `/blog` page for dedicated post listing
- Enable/disable via `siteConfig.blogPage.enabled`
- Control navigation position with `siteConfig.blogPage.order`
- Centralized site configuration in `src/config/siteConfig.ts`
- Flexible post display: homepage only, blog page only, or both

Configuration options:

```typescript
// src/config/siteConfig.ts
blogPage: {
  enabled: true,         // Enable /blog route
  showInNav: true,       // Show in navigation
  title: "Blog",         // Page title
  order: 0,              // Nav order (lower = first)
},
displayOnHomepage: true, // Show posts on homepage
```

The Blog link now integrates with page navigation ordering. Set `order: 5` to place it after pages with order 0-4, or `order: 0` to keep it first.

New files: `src/config/siteConfig.ts`, `src/pages/Blog.tsx`

## v1.11.1

Released December 20, 2025

**Fix historical stats display and chunked backfilling**

- Stats page now shows all historical page views correctly
- Changed `getStats` to use direct counting until aggregates are fully backfilled
- Backfill mutation now processes 500 records at a time (chunked)
- Prevents memory limit issues with large datasets (16MB Convex limit)
- Schedules itself to continue processing until complete

## v1.11.0

Released December 20, 2025

**Aggregate component for efficient stats**

- Replaced O(n) table scans with O(log n) aggregate counts
- Uses `@convex-dev/aggregate` package for TableAggregate
- Three aggregates: totalPageViews, pageViewsByPath, uniqueVisitors
- Backfill mutation for existing page view data
- Updated `convex/convex.config.ts` with aggregate component registration
- Updated `convex/stats.ts` to use aggregate counts in getStats query
- Updated `prds/howstatsworks.md` with old vs new implementation comparison

Performance improvement: Stats queries now use pre-computed counts instead of scanning all page view records.

## v1.10.0

Released December 20, 2025

**Fork configuration documentation**

- Added "Files to Update When Forking" section to docs and setup guide
- Lists all 9 configuration files users need to update when forking
- Includes backend configuration examples for Convex files
- Code snippets for `convex/http.ts`, `convex/rss.ts`, `src/pages/Post.tsx`

**Site branding updates**

- Updated `public/robots.txt` with sitemap URL and header
- Updated `public/llms.txt` with site name and description
- Updated `public/.well-known/ai-plugin.json` for AI plugins
- Updated `public/openapi.yaml` API title and site name
- Updated `convex/http.ts` SITE_URL and SITE_NAME constants

Same fork documentation added to README.md for discoverability.

## v1.9.0

Released December 20, 2025

**Scroll-to-top button**

- Appears after scrolling 300px (configurable)
- Uses Phosphor ArrowUp icon for consistency
- Smooth scroll animation (configurable)
- Works with all four themes (dark, light, tan, cloud)
- Enabled by default (can be disabled in Layout.tsx)
- Fade-in animation when appearing
- Responsive sizing for mobile devices

New component: `src/components/ScrollToTop.tsx`

Configuration via `ScrollToTopConfig` interface in `src/components/Layout.tsx`. Uses passive scroll listener for performance.

## v1.8.0

Released December 20, 2025

**Mobile menu and Generate Skill feature**

- Mobile menu with hamburger navigation
  - Slide-out drawer on mobile and tablet views
  - Accessible with keyboard navigation (Escape to close)
  - Focus trap for screen reader support
  - Page links and Home link in drawer
  - Auto-closes on route change
- Generate Skill option in CopyPageDropdown
  - Formats post/page content as an AI agent skill file
  - Downloads as `{slug}-skill.md` with skill structure
  - Includes metadata, when to use, and instructions sections

New component: `MobileMenu.tsx` with HamburgerButton

## v1.7.0

Released December 20, 2025

**Raw markdown files and CopyPageDropdown improvements**

- Static raw markdown files at `/raw/{slug}.md`
  - Generated during `npm run sync` and `npm run sync:prod` in `public/raw/` directory
  - Each published post and page gets a corresponding static `.md` file
  - Includes metadata header (type, date, reading time, tags)
- View as Markdown option in CopyPageDropdown
  - Opens raw `.md` file in new tab
  - Available on all post and page views
- Perplexity added to AI service options in CopyPageDropdown
  - Research articles directly in Perplexity with full content
- Featured image support for posts and pages
  - `image` field displays as square thumbnail in card view
  - Non-square images automatically cropped to center
- Improved markdown table CSS styling
  - GitHub-style tables with proper borders
  - Mobile responsive with horizontal scroll
  - Theme-aware alternating row colors

New files: `public/raw/*.md` (generated), updated `_redirects`

## v1.6.1

Released December 18, 2025

**Documentation updates**

- Added AGENTS.md with codebase instructions for AI coding agents
- Added Firecrawl import to all "When to sync vs deploy" tables
- Clarified import workflow: creates local files only, no `import:prod` needed
- Updated docs: README, setup-guide, how-to-publish, docs page, about-this-blog
- Renamed `content/pages/changelog.md` to `changelog-page.md` to avoid confusion with root changelog

## v1.6.0

Released December 18, 2025

**Content import and LLM API enhancements**

- Firecrawl content importer for external URLs
  - `npm run import <url>` scrapes and creates local markdown drafts
  - Creates drafts in `content/blog/` with frontmatter
  - Then sync to dev (`npm run sync`) or prod (`npm run sync:prod`)
  - No separate `import:prod` command (import creates local files only)
- New `/api/export` endpoint for batch content fetching
- AI plugin discovery at `/.well-known/ai-plugin.json`
- OpenAPI 3.0 specification at `/openapi.yaml`
- Enhanced `llms.txt` with complete API documentation

New dependencies: `@mendable/firecrawl-js`

New files: `scripts/import-url.ts`, `public/.well-known/ai-plugin.json`, `public/openapi.yaml`

## v1.5.0

Released December 17, 2025

**Frontmatter-controlled featured items**

- Add `featured: true` to any post or page frontmatter
- Use `featuredOrder` to control display order (lower = first)
- Featured items sync instantly with `npm run sync` (no redeploy needed)

New Convex queries:

- `getFeaturedPosts`: returns posts with `featured: true`
- `getFeaturedPages`: returns pages with `featured: true`

Schema updates with `featured` and `featuredOrder` fields and `by_featured` index.

## v1.4.0

Released December 17, 2025

**Featured section with list/card view toggle**

- Card view displays title and excerpt in a responsive grid
- Toggle button in featured header to switch between views
- View preference saved to localStorage

**Logo gallery with continuous marquee scroll**

- Clickable logos with configurable URLs
- CSS only animation for smooth infinite scrolling
- Configurable speed, position, and title
- Grayscale logos with color on hover
- Responsive sizing across breakpoints
- 5 sample logos included

**New frontmatter field**

- `excerpt` field for posts and pages
- Used for card view descriptions
- Falls back to description field for posts

## v1.3.0

Released December 17, 2025

**Real-time search with Command+K**

- Search icon in top nav using Phosphor Icons
- Modal with keyboard navigation (arrow keys, Enter, Escape)
- Full text search across posts and pages using Convex search indexes
- Result snippets with context around search matches
- Distinguishes between posts and pages with type badges

Search uses Convex full text search with reactive queries. Results deduplicate from title and content searches. Title matches sort first.

## v1.2.0

Released December 15, 2025

**Real-time stats page at /stats**

- Active visitors count with per-page breakdown
- Total page views and unique visitors
- Views by page sorted by popularity

Page view tracking via event records pattern (no write conflicts). Active session heartbeat system with 30s interval and 2min timeout. Cron job for stale session cleanup every 5 minutes.

New Convex tables: `pageViews` and `activeSessions`.

## v1.1.0

Released December 14, 2025

**Netlify Edge Functions for dynamic Convex HTTP proxying**

- `rss.ts` proxies `/rss.xml` and `/rss-full.xml`
- `sitemap.ts` proxies `/sitemap.xml`
- `api.ts` proxies `/api/posts` and `/api/post`

Vite dev server proxy for RSS, sitemap, and API endpoints. Edge functions dynamically read `VITE_CONVEX_URL` from environment.

## v1.0.0

Released December 14, 2025

**Initial release**

- Markdown posts with frontmatter parsing
- Static pages support (About, Projects, Contact)
- Four theme options: Dark, Light, Tan (default), Cloud
- Syntax highlighting for code blocks
- Year-grouped post list on home page
- Individual post pages with share buttons

**SEO and discovery**

- Dynamic sitemap at `/sitemap.xml`
- JSON-LD structured data for blog posts
- RSS feeds at `/rss.xml` and `/rss-full.xml`
- AI agent discovery with `llms.txt`
- `robots.txt` with rules for AI crawlers

**API endpoints**

- `/api/posts` for JSON list of all posts
- `/api/post?slug=xxx` for single post as JSON or markdown

**Copy Page dropdown** for sharing to ChatGPT and Claude.

**Technical stack**

- React 18 with TypeScript
- Convex for real-time database
- react-markdown for rendering
- react-syntax-highlighter for code blocks
- Netlify deployment with edge functions
