# Markdown Site - File Structure

A brief description of each file in the codebase.

## Root Files

| File                       | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `package.json`             | Dependencies and scripts for the blog                 |
| `tsconfig.json`            | TypeScript configuration                              |
| `vite.config.ts`           | Vite bundler configuration                            |
| `index.html`               | Main HTML entry with SEO meta tags and JSON-LD        |
| `netlify.toml`             | Netlify deployment and Convex HTTP redirects          |
| `README.md`                | Project documentation                                 |
| `AGENTS.md`                | AI coding agent instructions (agents.md spec)         |
| `files.md`                 | This file - codebase structure                        |
| `changelog.md`             | Version history and changes                           |
| `TASK.md`                  | Task tracking and project status                      |
| `FORK_CONFIG.md`           | Fork configuration guide (manual + automated options) |
| `fork-config.json.example` | Template JSON config for automated fork setup         |

## Source Files (`src/`)

### Entry Points

| File            | Description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `main.tsx`      | React app entry point with Convex provider                                                       |
| `App.tsx`       | Main app component with routing (supports custom homepage configuration via siteConfig.homepage) |
| `vite-env.d.ts` | Vite environment type definitions                                                                |

### Config (`src/config/`)

| File            | Description                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteConfig.ts` | Centralized site configuration (name, logo, blog page, posts display with homepage post limit and read more link, GitHub contributions, nav order, inner page logo settings, hardcoded navigation items for React routes, GitHub repository config for AI service raw URLs, font family configuration, right sidebar configuration, footer configuration with markdown support, social footer configuration, homepage configuration, AI chat configuration, newsletter configuration with admin and notifications, contact form configuration, weekly digest configuration) |

### Pages (`src/pages/`)

| File          | Description                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Home.tsx`    | Landing page with featured content and optional post list. Fetches home intro content from `content/pages/home.md` (slug: `home-intro`) for synced markdown intro text. Supports configurable post limit (homePostsLimit) and optional "read more" link (homePostsReadMore) via siteConfig.postsDisplay. Falls back to siteConfig.bio if home-intro page not found. Home intro content uses blog heading styles (blog-h1 through blog-h6) with clickable anchor links, matching blog post typography. Includes helper functions (generateSlug, getTextContent, HeadingAnchor) for heading ID generation and anchor links. |
| `Blog.tsx`    | Dedicated blog page with featured layout: hero post (first blogFeatured), featured row (remaining blogFeatured in 2 columns with excerpts), and regular posts (3 columns without excerpts). Supports list/card view toggle. Includes back button in navigation                                                                                                    |
| `Post.tsx`    | Individual blog post or page view with optional left sidebar (TOC) and right sidebar (CopyPageDropdown). Includes back button (hidden when used as homepage), tag links, related posts section in footer for blog posts, footer component with markdown support, and social footer. Supports 3-column layout at 1135px+. Can display image at top when showImageAtTop: true. Can be used as custom homepage via siteConfig.homepage (update SITE_URL/SITE_NAME when forking) |
| `Stats.tsx`   | Real-time analytics dashboard with visitor stats and GitHub stars                                                                                                                                                                                                                                                                                                 |
| `TagPage.tsx` | Tag archive page displaying posts filtered by a specific tag. Includes view mode toggle (list/cards) with localStorage persistence                                                                                                                                                                                                                                |
| `Write.tsx`   | Three-column markdown writing page with Cursor docs-style UI, frontmatter reference with copy buttons, theme toggle, font switcher (serif/sans/monospace), localStorage persistence, and optional AI Agent mode (toggleable via siteConfig.aiChat.enabledOnWritePage). When enabled, Agent replaces the textarea with AIChatView component. Includes scroll prevention when switching to Agent mode to prevent page jump. Title changes to "Agent" when in AI chat mode. |
| `NewsletterAdmin.tsx` | Three-column newsletter admin page for managing subscribers and sending newsletters. Left sidebar with navigation and stats, main area with searchable subscriber list, right sidebar with send newsletter panel and recent sends. Access at /newsletter-admin, configurable via siteConfig.newsletterAdmin. |

### Components (`src/components/`)

| File                      | Description                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Layout.tsx`              | Page wrapper with logo in header (top-left), search button, theme toggle, mobile menu (left-aligned on mobile), and scroll-to-top. Combines Blog link, hardcoded nav items, and markdown pages for navigation. Logo reads from siteConfig.innerPageLogo                                                                                                               |
| `ThemeToggle.tsx`         | Theme switcher (dark/light/tan/cloud)                                                                                                                                                                                                                                                                                                                                 |
| `PostList.tsx`            | Year-grouped blog post list or card grid (supports list/cards view modes, columns prop for 2/3 column grids, showExcerpts prop to control excerpt visibility)                                                                                                                                                                                                         |
| `BlogHeroCard.tsx`        | Hero card component for the first blogFeatured post on blog page. Displays landscape image, tags, date, title, excerpt, author info, and read more link                                                                                                                                                                                                               |
| `BlogPost.tsx`            | Markdown renderer with syntax highlighting, collapsible sections (details/summary), and text wrapping for plain text code blocks                                                                                                                                                                                                                                      |
| `CopyPageDropdown.tsx`    | Share dropdown with Copy page (markdown to clipboard), View as Markdown (opens raw .md file), Download as SKILL.md (Anthropic Agent Skills format), and Open in AI links (ChatGPT, Claude, Perplexity) using GitHub raw URLs with universal prompt                                                                                                                    |
| `Footer.tsx`              | Footer component that renders markdown content from frontmatter footer field or siteConfig.defaultContent. Can be enabled/disabled globally and per-page via frontmatter showFooter field. Renders inside article at bottom for posts/pages, and in current position on homepage. Supports images with size control via HTML attributes (width, height, style, class) |
| `SearchModal.tsx`         | Full text search modal with keyboard navigation                                                                                                                                                                                                                                                                                                                       |
| `FeaturedCards.tsx`       | Card grid for featured posts/pages with excerpts                                                                                                                                                                                                                                                                                                                      |
| `LogoMarquee.tsx`         | Scrolling logo gallery with clickable links                                                                                                                                                                                                                                                                                                                           |
| `MobileMenu.tsx`          | Slide-out drawer menu for mobile navigation with hamburger button, includes sidebar table of contents when page has sidebar layout                                                                                                                                                                                                                                    |
| `ScrollToTop.tsx`         | Configurable scroll-to-top button with Phosphor ArrowUp icon                                                                                                                                                                                                                                                                                                          |
| `GitHubContributions.tsx` | GitHub activity graph with theme-aware colors and year navigation                                                                                                                                                                                                                                                                                                     |
| `VisitorMap.tsx`          | Real-time visitor location map with dotted world display and theme-aware colors                                                                                                                                                                                                                                                                                       |
| `PageSidebar.tsx`         | Collapsible table of contents sidebar for pages/posts with sidebar layout, extracts headings (H1-H6), active heading highlighting, smooth scroll navigation, localStorage persistence for expanded/collapsed state                                                                                                                                                    |
| `RightSidebar.tsx`        | Right sidebar component that displays CopyPageDropdown or AI chat on posts/pages at 1135px+ viewport width, controlled by siteConfig.rightSidebar.enabled and frontmatter rightSidebar/aiChat fields                                                                                                                                                                  |
| `AIChatView.tsx`          | AI chat interface component (Agent) using Anthropic Claude API. Supports per-page chat history, page content context, markdown rendering, and copy functionality. Used in Write page (replaces textarea when enabled) and optionally in RightSidebar. Requires ANTHROPIC_API_KEY environment variable in Convex. System prompt configurable via CLAUDE_PROMPT_STYLE, CLAUDE_PROMPT_COMMUNITY, CLAUDE_PROMPT_RULES, or CLAUDE_SYSTEM_PROMPT environment variables. Includes error handling for missing API keys. |
| `NewsletterSignup.tsx`    | Newsletter signup form component for email-only subscriptions. Displays configurable title/description, validates email, and submits to Convex. Shows on home, blog page, and posts based on siteConfig.newsletter settings. Supports frontmatter override via newsletter: true/false. |
| `ContactForm.tsx`         | Contact form component with name, email, and message fields. Displays when contactForm: true in frontmatter. Submits to Convex which sends email via AgentMail to configured recipient. Requires AGENTMAIL_API_KEY and AGENTMAIL_INBOX environment variables. |
| `SocialFooter.tsx`        | Social footer component with social icons on left (GitHub, Twitter/X, LinkedIn, Instagram, YouTube, TikTok, Discord, Website) and copyright on right. Configurable via siteConfig.socialFooter. Shows below main footer on homepage, blog posts, and pages. Supports frontmatter override via showSocialFooter: true/false. Auto-updates copyright year. |

### Context (`src/context/`)

| File                 | Description                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ThemeContext.tsx`   | Theme state management with localStorage persistence                                                         |
| `FontContext.tsx`    | Font family state management (serif/sans/monospace) with localStorage persistence and siteConfig integration |
| `SidebarContext.tsx` | Shares sidebar headings and active ID between Post and Layout components for mobile menu integration         |

### Utils (`src/utils/`)

| File                 | Description                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `extractHeadings.ts` | Parses markdown content to extract headings (H1-H6), generates slugs, filters out headings inside code blocks |

### Hooks (`src/hooks/`)

| File                 | Description                                      |
| -------------------- | ------------------------------------------------ |
| `usePageTracking.ts` | Page view recording and active session heartbeat |

### Styles (`src/styles/`)

| File         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.css` | Global CSS with theme variables, centralized font-size CSS variables for all themes, sidebar styling with alternate background colors, hidden scrollbar, and consistent borders using box-shadow for docs-style layout. Left sidebar (`.post-sidebar-wrapper`) and right sidebar (`.post-sidebar-right`) have separate, independent styles. Footer image styles (`.site-footer-image-wrapper`, `.site-footer-image`, `.site-footer-image-caption`) for responsive image display. Write page layout uses viewport height constraints (100vh) with overflow hidden to prevent page scroll, and AI chat uses flexbox with min-height: 0 for proper scrollable message area |

## Convex Backend (`convex/`)

| File               | Description                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `schema.ts`        | Database schema (posts, pages, viewCounts, pageViews, activeSessions, aiChats, newsletterSubscribers, newsletterSentPosts, contactMessages) with indexes for tag queries (by_tags), AI queries, and blog featured posts (by_blogFeatured). Posts and pages include showSocialFooter, showImageAtTop, blogFeatured, and contactForm fields for frontmatter control. |
| `posts.ts`         | Queries and mutations for blog posts, view counts, getAllTags, getPostsByTag, getRelatedPosts, and getBlogFeaturedPosts. Includes tag-based queries for tag pages and related posts functionality. |
| `pages.ts`         | Queries and mutations for static pages                                                                             |
| `search.ts`        | Full text search queries across posts and pages                                                                    |
| `stats.ts`         | Real-time stats with aggregate component for O(log n) counts, page view recording, session heartbeat               |
| `crons.ts`         | Cron jobs for stale session cleanup (every 5 minutes), weekly newsletter digest (Sundays 9am UTC), and weekly stats summary (Mondays 9am UTC). Uses environment variables SITE_URL and SITE_NAME for email content. |
| `http.ts`          | HTTP endpoints: sitemap (includes tag pages), API (update SITE_URL/SITE_NAME when forking, uses www.markdown.fast), Open Graph HTML generation for social crawlers |
| `rss.ts`           | RSS feed generation (update SITE_URL/SITE_TITLE when forking, uses www.markdown.fast)                              |
| `aiChats.ts`       | Queries and mutations for AI chat history (per-session, per-context storage). Handles anonymous session IDs, per-page chat contexts, and message history management. Supports page content as context for AI responses.                                                                                                                                           |
| `aiChatActions.ts` | Anthropic Claude API integration action for AI chat responses. Requires ANTHROPIC_API_KEY environment variable in Convex. Uses claude-sonnet-3-5-20240620 model. System prompt configurable via environment variables (CLAUDE_PROMPT_STYLE, CLAUDE_PROMPT_COMMUNITY, CLAUDE_PROMPT_RULES, or CLAUDE_SYSTEM_PROMPT). Includes error handling for missing API keys with user-friendly error messages. Supports page content context and chat history (last 20 messages). |
| `newsletter.ts`    | Newsletter mutations and queries: subscribe, unsubscribe, getSubscriberCount, getActiveSubscribers, getAllSubscribers (admin), deleteSubscriber (admin), getNewsletterStats, getPostsForNewsletter, wasPostSent, recordPostSent, scheduleSendPostNewsletter, scheduleSendCustomNewsletter, scheduleSendStatsSummary, getStatsForSummary. |
| `newsletterActions.ts` | Newsletter actions (Node.js runtime): sendPostNewsletter, sendCustomNewsletter, sendWeeklyDigest, notifyNewSubscriber, sendWeeklyStatsSummary. Uses AgentMail SDK for email delivery. Includes markdown-to-HTML conversion for custom emails. |
| `contact.ts`       | Contact form mutations and actions: submitContact, sendContactEmail (AgentMail API), markEmailSent. |
| `convex.config.ts` | Convex app configuration with aggregate component registrations (pageViewsByPath, totalPageViews, uniqueVisitors)  |
| `tsconfig.json`    | Convex TypeScript configuration                                                                                    |

### HTTP Endpoints (defined in `http.ts`)

| Route                         | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `/stats`                      | Real-time site analytics page                                                 |
| `/rss.xml`                    | RSS feed with descriptions                                                    |
| `/rss-full.xml`               | RSS feed with full content for LLMs                                           |
| `/sitemap.xml`                | Dynamic XML sitemap for search engines (includes posts, pages, and tag pages) |
| `/api/posts`                  | JSON list of all posts                                                        |
| `/api/post`                   | Single post as JSON or markdown                                               |
| `/api/export`                 | Batch export all posts with content                                           |
| `/meta/post`                  | Open Graph HTML for social crawlers                                           |
| `/.well-known/ai-plugin.json` | AI plugin manifest                                                            |
| `/openapi.yaml`               | OpenAPI 3.0 specification                                                     |
| `/llms.txt`                   | AI agent discovery                                                            |

## Content (`content/blog/`)

Markdown files with frontmatter for blog posts. Each file becomes a blog post.

| Field           | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `title`         | Post title                                                              |
| `description`   | Short description for SEO                                               |
| `date`          | Publication date (YYYY-MM-DD)                                           |
| `slug`          | URL path for the post                                                   |
| `published`     | Whether post is public                                                  |
| `tags`          | Array of topic tags                                                     |
| `readTime`      | Estimated reading time                                                  |
| `image`         | Header/Open Graph image URL (optional)                                  |
| `showImageAtTop` | Display image at top of post above header (optional, default: false). When true, image displays full-width with rounded corners above post header. |
| `excerpt`       | Short excerpt for card view (optional)                                  |
| `featured`      | Show in featured section (optional)                                     |
| `featuredOrder` | Order in featured section (optional)                                    |
| `blogFeatured`  | Show as featured on blog page (optional, first becomes hero card with landscape image, rest in 2-column featured row with excerpts) |
| `authorName`    | Author display name (optional)                                          |
| `authorImage`   | Round author avatar image URL (optional)                                |
| `rightSidebar`  | Enable right sidebar with CopyPageDropdown (optional)                   |
| `showFooter`    | Show footer on this post (optional, overrides siteConfig default)       |
| `footer`        | Footer markdown content (optional, overrides siteConfig.defaultContent) |
| `showSocialFooter` | Show social footer on this post (optional, overrides siteConfig default) |
| `aiChat`        | Enable AI Agent chat in right sidebar (optional). Set `true` to enable (requires `rightSidebar: true` and `siteConfig.aiChat.enabledOnContent: true`). Set `false` to explicitly hide even if global config is enabled. |
| `blogFeatured`  | Show as featured on blog page (optional, first becomes hero, rest in 2-column row) |
| `newsletter`    | Override newsletter signup display (optional, true/false) |
| `contactForm`   | Enable contact form on this post (optional). Requires siteConfig.contactForm.enabled: true and AGENTMAIL_API_KEY/AGENTMAIL_INBOX environment variables. |

## Static Pages (`content/pages/`)

Markdown files for static pages like About, Projects, Contact, Changelog.

**Special pages:**
- `home.md` (slug: `home-intro`): Homepage intro/bio content. Set `showInNav: false` to hide from navigation. Content syncs with `npm run sync` and displays on the homepage without redeploy.

| Field           | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `title`         | Page title                                                              |
| `slug`          | URL path for the page                                                   |
| `published`     | Whether page is public                                                  |
| `order`         | Display order in navigation (lower first)                               |
| `showInNav`     | Show in navigation menu (default: true)                                 |
| `excerpt`       | Short excerpt for card view (optional)                                  |
| `image`         | Thumbnail/OG image URL (optional)                                       |
| `showImageAtTop` | Display image at top of page above header (optional, default: false). When true, image displays full-width with rounded corners above page header. |
| `featured`      | Show in featured section (optional)                                     |
| `featuredOrder` | Order in featured section (optional)                                    |
| `authorName`    | Author display name (optional)                                          |
| `authorImage`   | Round author avatar image URL (optional)                                |
| `rightSidebar`  | Enable right sidebar with CopyPageDropdown (optional)                   |
| `showFooter`    | Show footer on this page (optional, overrides siteConfig default)       |
| `footer`        | Footer markdown content (optional, overrides siteConfig.defaultContent) |
| `showSocialFooter` | Show social footer on this page (optional, overrides siteConfig default) |
| `aiChat`        | Enable AI Agent chat in right sidebar (optional). Set `true` to enable (requires `rightSidebar: true` and `siteConfig.aiChat.enabledOnContent: true`). Set `false` to explicitly hide even if global config is enabled. |
| `newsletter`    | Override newsletter signup display (optional, true/false) |
| `contactForm`   | Enable contact form on this page (optional). Requires siteConfig.contactForm.enabled: true and AGENTMAIL_API_KEY/AGENTMAIL_INBOX environment variables. |
| `textAlign`     | Text alignment: "left", "center", "right" (optional, default: "left"). Used by home.md for home intro content alignment |

## Scripts (`scripts/`)

| File                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `sync-posts.ts`           | Syncs markdown files to Convex at build time          |
| `sync-discovery-files.ts` | Updates AGENTS.md and llms.txt with current app data  |
| `import-url.ts`           | Imports external URLs as markdown posts (Firecrawl)   |
| `configure-fork.ts`       | Automated fork configuration (reads fork-config.json) |
| `send-newsletter.ts`      | CLI tool for sending newsletter posts (npm run newsletter:send <slug>). Calls scheduleSendPostNewsletter mutation directly. |
| `send-newsletter-stats.ts` | CLI tool for sending weekly stats summary (npm run newsletter:send:stats). Calls scheduleSendStatsSummary mutation directly. |

### Sync Commands

**Development:**

- `npm run sync` - Sync markdown content to development Convex
- `npm run sync:discovery` - Update discovery files (AGENTS.md, llms.txt) with development data

**Production:**

- `npm run sync:prod` - Sync markdown content to production Convex
- `npm run sync:discovery:prod` - Update discovery files with production data

**Sync everything together:**

- `npm run sync:all` - Run both content sync and discovery sync (development)
- `npm run sync:all:prod` - Run both content sync and discovery sync (production)

### Frontmatter Flow

Frontmatter is the YAML metadata at the top of each markdown file. Here is how it flows through the system:

1. **Content directories** (`content/blog/*.md`, `content/pages/*.md`) contain markdown files with YAML frontmatter
2. **`scripts/sync-posts.ts`** uses `gray-matter` to parse frontmatter and validate required fields
3. **Convex mutations** (`api.posts.syncPostsPublic`, `api.pages.syncPagesPublic`) receive parsed data
4. **`convex/schema.ts`** defines the database structure for storing frontmatter fields

**To add a new frontmatter field**, update:

- `scripts/sync-posts.ts`: Add to `PostFrontmatter` or `PageFrontmatter` interface and parsing logic
- `convex/schema.ts`: Add field to the posts or pages table schema
- `convex/posts.ts` or `convex/pages.ts`: Update sync mutation to handle new field

## Netlify (`netlify/edge-functions/`)

| File         | Description                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `botMeta.ts` | Edge function for social media crawler detection, excludes `/raw/*` paths and AI crawlers from OG interception |
| `rss.ts`     | Proxies `/rss.xml` and `/rss-full.xml` to Convex HTTP                                                          |
| `sitemap.ts` | Proxies `/sitemap.xml` to Convex HTTP                                                                          |
| `api.ts`     | Proxies `/api/posts`, `/api/post`, `/api/export` to Convex                                                     |
| `geo.ts`     | Returns user geo location from Netlify's automatic geo headers for visitor map                                 |
| `mcp.ts`     | HTTP-based MCP server for AI tool integration (Cursor, Claude Desktop). Accessible at /mcp endpoint. Exposes read-only tools: list_posts, get_post, list_pages, get_page, get_homepage, search_content, export_all. Uses Netlify rate limiting (50 req/min public, 1000 req/min with API key). Optional authentication via MCP_API_KEY environment variable. |

## Public Assets (`public/`)

| File           | Description                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `favicon.svg`  | Site favicon                                                                                           |
| `_redirects`   | SPA redirect rules for static files                                                                    |
| `robots.txt`   | Crawler rules for search engines and AI bots (update sitemap URL when forking, uses www.markdown.fast) |
| `llms.txt`     | AI agent discovery file (update site name/URL when forking, uses www.markdown.fast)                    |
| `openapi.yaml` | OpenAPI 3.0 specification (update API title when forking, uses www.markdown.fast)                      |

### Raw Markdown Files (`public/raw/`)

Static markdown files generated during `npm run sync` or `npm run sync:prod`. Each published post and page gets a corresponding `.md` file for direct access by users, search engines, and AI agents.

| File Pattern | Description                             |
| ------------ | --------------------------------------- |
| `{slug}.md`  | Static markdown file for each post/page |

Access via `/raw/{slug}.md` (e.g., `/raw/setup-guide.md`).

Files include a metadata header with type (post/page), date, reading time, and tags. The CopyPageDropdown includes a "View as Markdown" option that links directly to these files.

### AI Plugin (`public/.well-known/`)

| File             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `ai-plugin.json` | AI plugin manifest (update name/description when forking) |

### Images (`public/images/`)

| File             | Description                                  |
| ---------------- | -------------------------------------------- |
| `logo.svg`       | Site logo displayed on homepage              |
| `og-default.svg` | Default Open Graph image for social sharing  |
| `*.png/jpg/svg`  | Blog post images (referenced in frontmatter) |

### Logo Gallery (`public/images/logos/`)

| File                | Description                         |
| ------------------- | ----------------------------------- |
| `sample-logo-1.svg` | Sample logo (replace with your own) |
| `sample-logo-2.svg` | Sample logo (replace with your own) |
| `sample-logo-3.svg` | Sample logo (replace with your own) |
| `sample-logo-4.svg` | Sample logo (replace with your own) |
| `sample-logo-5.svg` | Sample logo (replace with your own) |

## Cursor Rules (`.cursor/rules/`)

| File                         | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `convex-write-conflicts.mdc` | Write conflict prevention patterns for Convex |
| `convex2.mdc`                | Convex function syntax and examples           |
| `dev2.mdc`                   | Development guidelines and best practices     |
| `help.mdc`                   | Core development guidelines                   |
| `rulesforconvex.mdc`         | Convex schema and function best practices     |
| `sec-check.mdc`              | Security guidelines and audit checklist       |
| `task.mdc`                   | Task list management guidelines               |
| `write.mdc`                  | Writing style guide (activate with @write)    |
