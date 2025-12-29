# Changelog

---
Type: page
Date: 2025-12-29
---

All notable changes to this project.
![](https://img.shields.io/badge/License-MIT-yellow.svg)

## v1.39.0

Released December 28, 2025

**HTTP-based MCP Server**

- Model Context Protocol (MCP) server deployed on Netlify Edge Functions
  - Accessible 24/7 at `https://www.markdown.fast/mcp`
  - No local machine required (unlike stdio-based MCP servers)
  - Works with Cursor, Claude Desktop, and other MCP-compatible clients
- Public access with Netlify built-in rate limiting (50 req/min per IP)
- Optional API key authentication for higher limits (1000 req/min)
  - Set `MCP_API_KEY` in Netlify environment variables
  - Add `Authorization: Bearer <key>` header to requests
- Read-only access to blog content:
  - `list_posts`: Get all published posts with metadata
  - `get_post`: Get single post by slug with full content
  - `list_pages`: Get all published pages
  - `get_page`: Get single page by slug with full content
  - `get_homepage`: Get homepage data with featured and recent posts
  - `search_content`: Full text search across posts and pages
  - `export_all`: Batch export all content

**Documentation**

- Blog post: "How to Use the MCP Server" with client configuration examples
- MCP Server section added to docs.md
- MCP configuration added to siteConfig.ts
- Setup guide updated with MCP server section

**Configuration**

Add to Cursor (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp"
    }
  }
}
```

Updated files: `netlify/edge-functions/mcp.ts`, `netlify.toml`, `package.json`, `src/config/siteConfig.ts`, `content/blog/how-to-use-mcp-server.md`, `content/pages/docs.md`, `content/blog/setup-guide.md`, `files.md`, `changelog.md`, `content/pages/changelog-page.md`

## v1.38.0

Released December 27, 2025

**Newsletter CLI improvements**

- `newsletter:send` now calls `scheduleSendPostNewsletter` mutation directly
  - Sends emails in the background instead of printing instructions
  - Provides clear success/error feedback
  - Shows helpful messages about checking Newsletter Admin for results
- New `newsletter:send:stats` command
  - Sends weekly stats summary to your inbox on demand
  - Uses `scheduleSendStatsSummary` mutation
  - Email sent to AGENTMAIL_INBOX or AGENTMAIL_CONTACT_EMAIL
- New mutation `scheduleSendStatsSummary` in `convex/newsletter.ts`
  - Allows CLI to trigger stats summary sending
  - Schedules `sendWeeklyStatsSummary` internal action

**Documentation**

- Blog post: "How to use AgentMail with Markdown Sync"
  - Complete setup guide for AgentMail integration
  - Environment variables configuration
  - Newsletter and contact form features
  - CLI commands documentation
  - Troubleshooting section
- Updated docs.md with new CLI commands
- Updated files.md with new script reference
- Verified all AgentMail features use environment variables (no hardcoded emails)

Updated files: `scripts/send-newsletter.ts`, `scripts/send-newsletter-stats.ts`, `convex/newsletter.ts`, `package.json`, `content/blog/how-to-use-agentmail.md`, `content/pages/docs.md`, `files.md`, `changelog.md`, `content/pages/changelog-page.md`, `TASK.md`

## v1.37.0

Released December 27, 2025

**Newsletter Admin UI**

- Newsletter Admin UI at `/newsletter-admin`
  - Three-column layout similar to Write page
  - View all subscribers with search and filter (all/active/unsubscribed)
  - Stats showing active, total, and sent newsletter counts
  - Delete subscribers directly from admin
  - Send newsletter panel with two modes:
    - Send Post: Select a blog post to send as newsletter
    - Write Email: Compose custom email with markdown support
  - Markdown-to-HTML conversion for custom emails (headers, bold, italic, links, lists)
  - Copy icon on success messages to copy CLI commands
  - Theme-aware success/error styling (no hardcoded green)
  - Recent newsletters list showing sent history
  - Configurable via `siteConfig.newsletterAdmin`

**Weekly Digest automation**

- Cron job runs every Sunday at 9:00 AM UTC
- Automatically sends all posts published in the last 7 days
- Uses AgentMail SDK for email delivery
- Configurable via `siteConfig.weeklyDigest`

**Developer Notifications**

- New subscriber alerts sent via email when someone subscribes
- Weekly stats summary sent every Monday at 9:00 AM UTC
- Uses `AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX` as recipient
- Configurable via `siteConfig.newsletterNotifications`

**Admin queries and mutations**

- `getAllSubscribers`: Paginated subscriber list with search/filter
- `deleteSubscriber`: Remove subscriber from database
- `getNewsletterStats`: Stats for admin dashboard
- `getPostsForNewsletter`: List of posts with sent status

Updated files: `convex/newsletter.ts`, `convex/newsletterActions.ts`, `convex/posts.ts`, `convex/crons.ts`, `src/config/siteConfig.ts`, `src/App.tsx`, `src/styles/global.css`, `src/pages/NewsletterAdmin.tsx`

## v1.36.0

Released December 27, 2025

**Social footer component**

- Social footer component with customizable social links and copyright
  - Displays social icons on the left (GitHub, Twitter/X, LinkedIn, and more)
  - Shows copyright symbol, site name, and auto-updating year on the right
  - Configurable via `siteConfig.socialFooter` in `src/config/siteConfig.ts`
  - Supports 8 platform types: github, twitter, linkedin, instagram, youtube, tiktok, discord, website
  - Uses Phosphor icons for consistent styling
  - Appears below the main footer on homepage, blog posts, and pages
  - Can work independently of the main footer when set via frontmatter

**Frontmatter control for social footer**

- `showSocialFooter` field for posts and pages to override siteConfig defaults
- Set `showSocialFooter: false` to hide on specific posts/pages
- Works like existing `showFooter` field pattern

**Social footer configuration options**

- `enabled`: Global toggle for social footer
- `showOnHomepage`, `showOnPosts`, `showOnPages`, `showOnBlogPage`: Per-location visibility
- `socialLinks`: Array of social link objects with platform and URL
- `copyright.siteName`: Site/company name for copyright display
- `copyright.showYear`: Toggle for auto-updating year

Updated files: `src/config/siteConfig.ts`, `convex/schema.ts`, `convex/posts.ts`, `convex/pages.ts`, `scripts/sync-posts.ts`, `src/pages/Home.tsx`, `src/pages/Post.tsx`, `src/pages/Blog.tsx`, `src/styles/global.css`, `src/components/SocialFooter.tsx`

## v1.35.0

Released December 26, 2025

**Image support at top of posts and pages**

- `showImageAtTop` frontmatter field for posts and pages
  - Set `showImageAtTop: true` to display the `image` field at the top of the post/page above the header
  - Image displays full-width with rounded corners above the post header
  - Default behavior: if `showImageAtTop` is not set or `false`, image only used for Open Graph previews and featured card thumbnails
  - Works for both blog posts and static pages
  - Image appears above the post header when enabled

Updated files: `convex/schema.ts`, `scripts/sync-posts.ts`, `convex/posts.ts`, `convex/pages.ts`, `src/pages/Post.tsx`, `src/pages/Write.tsx`, `src/styles/global.css`

Documentation updated: `content/pages/docs.md`, `content/blog/how-to-publish.md`, `content/blog/using-images-in-posts.md`, `files.md`

## v1.34.0

Released December 26, 2025

**Blog page featured layout with hero post**

- `blogFeatured` frontmatter field for posts to mark as featured on blog page
  - First `blogFeatured` post displays as hero card with landscape image, tags, date, title, excerpt, author info, and read more link
  - Remaining `blogFeatured` posts display in 2-column featured row with excerpts
  - Regular (non-featured) posts display in 3-column grid without excerpts
  - New `BlogHeroCard` component (`src/components/BlogHeroCard.tsx`) for hero display
  - New `getBlogFeaturedPosts` query returns all published posts with `blogFeatured: true` sorted by date
  - `PostList` component updated with `columns` prop (2 or 3) and `showExcerpts` prop
  - Card images use 16:10 landscape aspect ratio
  - Footer support on blog page via `siteConfig.footer.showOnBlogPage`

Updated files: `convex/schema.ts`, `convex/posts.ts`, `scripts/sync-posts.ts`, `src/pages/Blog.tsx`, `src/components/PostList.tsx`, `src/styles/global.css`

## v1.33.1

Released December 26, 2025

**Article centering in sidebar layouts**

- Article content now centers in the middle column when sidebars are present
  - Left sidebar stays flush left, right sidebar stays flush right
  - Article uses `margin-left: auto; margin-right: auto` within its `1fr` grid column
  - Works with both two-column (left sidebar only) and three-column (both sidebars) layouts
  - Consistent `max-width: 800px` for article content across all sidebar configurations

Updated files: `src/styles/global.css`

## v1.33.0

Released December 26, 2025

**AI Chat Write Agent (Agent) integration**

- AI Agent chat interface powered by Anthropic Claude API
  - New `AIChatView` component for AI-powered chat interface
  - Available on Write page (replaces textarea when enabled) and optionally in RightSidebar on posts/pages
  - Per-session, per-context chat history stored in Convex (aiChats table)
  - Supports page content as context for AI responses
  - Markdown rendering for AI responses with copy functionality
  - Theme-aware styling matching the site's design system
  - Uses Phosphor Icons for all UI elements
- Convex backend for AI chat
  - New `convex/aiChats.ts` with queries and mutations for chat history
  - New `convex/aiChatActions.ts` with Claude API integration (requires ANTHROPIC_API_KEY environment variable)
  - System prompt configurable via Convex environment variables:
    - `CLAUDE_PROMPT_STYLE`, `CLAUDE_PROMPT_COMMUNITY`, `CLAUDE_PROMPT_RULES` (split prompts, joined with separators)
    - `CLAUDE_SYSTEM_PROMPT` (single prompt, fallback if split prompts not set)
  - Chat history limited to last 20 messages for context efficiency
  - Error handling: displays "API key is not set" message when ANTHROPIC_API_KEY is missing in Convex environment variables
- Configuration options
  - `siteConfig.aiChat` interface with `enabledOnWritePage` and `enabledOnContent` boolean flags
  - Both flags default to false (opt-in feature)
  - New `aiChat` frontmatter field for posts and pages (requires rightSidebar: true)
- Write page AI Agent mode
  - Title changes from "Blog Post" or "Page" to "Agent" when in AI chat mode
  - Toggle button text changes between "Agent" and "Text Editor"
  - Page scroll prevention when switching modes (no page jump)
- RightSidebar AI chat support
  - Conditionally renders AIChatView when enabled via frontmatter `aiChat: true` field
  - Requires both `siteConfig.aiChat.enabledOnContent` and frontmatter `aiChat: true`
  - Passes page content as context for AI responses

Updated files: `src/components/AIChatView.tsx`, `src/components/RightSidebar.tsx`, `src/pages/Write.tsx`, `src/pages/Post.tsx`, `src/config/siteConfig.ts`, `convex/schema.ts`, `convex/aiChats.ts`, `convex/aiChatActions.ts`, `convex/posts.ts`, `convex/pages.ts`, `scripts/sync-posts.ts`, `src/styles/global.css`, `package.json`

Documentation updated: `files.md`, `changelog.md`, `README.md`, `content/blog/setup-guide.md`, `public/raw/docs.md`

## v1.32.0

Released December 25, 2025

**Custom homepage configuration**

- Set any page or blog post to serve as the homepage instead of the default Home component
- Configure via `siteConfig.homepage` with `type` ("default", "page", or "post"), `slug` (required for page/post), and `originalHomeRoute` (default: "/home")
- Custom homepage retains all Post component features (sidebar, copy dropdown, author info, footer) but without the featured section
- Original homepage remains accessible at `/home` route (or configured `originalHomeRoute`) when custom homepage is set
- SEO metadata uses the page/post's frontmatter when used as homepage
- Back button hidden when Post component is used as homepage
- Fork configuration support for homepage
  - Added `homepage` field to `fork-config.json.example`
  - Updated `configure-fork.ts` to handle homepage configuration
  - Documentation added to `FORK_CONFIG.md` with usage examples

Updated files: `src/App.tsx`, `src/pages/Post.tsx`, `src/config/siteConfig.ts`, `scripts/configure-fork.ts`, `fork-config.json.example`, `FORK_CONFIG.md`

## v1.31.1

Released December 25, 2025

**Image support in footer component**

- Footer markdown now supports images using standard markdown syntax or HTML
- Images can be sized using `width`, `height`, `style`, or `class` HTML attributes
- Image attributes are sanitized by rehypeSanitize for security (removes dangerous CSS)
- Footer images support lazy loading and optional captions from alt text
- CSS styles added for footer images

Updated files: `src/components/Footer.tsx`, `src/styles/global.css`

## v1.31.0

Released December 25, 2025

**Customizable footer component with markdown support**

- New `Footer` component that renders markdown content
- Footer content can be set in frontmatter `footer` field (markdown) or use `siteConfig.footer.defaultContent`
- Footer can be enabled/disabled globally via `siteConfig.footer.enabled`
- Footer visibility controlled per-page type via `siteConfig.footer.showOnHomepage`, `showOnPosts`, `showOnPages`
- New `showFooter` frontmatter field for posts and pages to override siteConfig defaults
- New `footer` frontmatter field for posts and pages to provide custom markdown content
- Footer renders inside article at bottom for posts/pages, maintains current position on homepage
- Footer supports markdown formatting (links, paragraphs, line breaks)
- Sidebars flush to bottom when footer is enabled

Updated files: `src/components/Footer.tsx`, `src/pages/Home.tsx`, `src/pages/Post.tsx`, `src/config/siteConfig.ts`, `src/styles/global.css`, `convex/schema.ts`, `convex/posts.ts`, `convex/pages.ts`, `scripts/sync-posts.ts`, `src/pages/Write.tsx`

Documentation updated: `files.md`, `changelog.md`

## v1.30.2

Released December 25, 2025

**Right sidebar default behavior fix**

- Right sidebar no longer appears on pages/posts without explicit `rightSidebar: true` in frontmatter
  - Changed default behavior: right sidebar is now opt-in only
  - Pages like About and Contact now render without the right sidebar as expected
  - `CopyPageDropdown` correctly appears in nav bar when right sidebar is disabled
- Logic in `Post.tsx` changed from `(page.rightSidebar ?? true)` to `page.rightSidebar === true`

Updated files: `src/pages/Post.tsx`

## v1.30.1

Released December 25, 2025

**TypeScript error fix**

- TypeScript error in `convex/posts.ts` where `rightSidebar` was used in mutation handlers but missing from args validators
  - Added `rightSidebar: v.optional(v.boolean())` to `syncPosts` args validator
  - Added `rightSidebar: v.optional(v.boolean())` to `syncPostsPublic` args validator

Updated files: `convex/posts.ts`

## v1.30.0

Released December 25, 2025

**Right sidebar feature for posts and pages**

- New `RightSidebar` component that displays `CopyPageDropdown` in a right sidebar
  - Appears at 1135px+ viewport width when enabled
  - Controlled by `siteConfig.rightSidebar.enabled` (global toggle)
  - Per-post/page control via `rightSidebar: true` frontmatter field (opt-in only)
  - Three-column layout support: left sidebar (TOC), main content, right sidebar (CopyPageDropdown)
  - CopyPageDropdown automatically moves from nav to right sidebar when enabled
  - Responsive: right sidebar hidden below 1135px, CopyPageDropdown returns to nav
- Right sidebar configuration in siteConfig
  - `rightSidebar.enabled`: Global toggle for right sidebar feature
  - `rightSidebar.minWidth`: Minimum viewport width to show sidebar (default: 1135px)
- `rightSidebar` frontmatter field
  - Available for both blog posts and pages
  - Optional boolean field to enable/disable right sidebar per post/page
  - Added to Write page frontmatter reference with copy button

Updated files: `src/components/RightSidebar.tsx`, `src/pages/Post.tsx`, `src/config/siteConfig.ts`, `src/styles/global.css`, `convex/schema.ts`, `convex/posts.ts`, `convex/pages.ts`, `scripts/sync-posts.ts`, `src/pages/Write.tsx`

Documentation updated: `content/blog/setup-guide.md`, `content/pages/docs.md`, `files.md`, `changelog.md`

## v1.29.0

Released December 25, 2025

**Font family configuration system**

- Font family configuration via siteConfig.ts
  - Three font options: "serif" (New York), "sans" (system fonts), "monospace" (IBM Plex Mono)
  - Configure default font in `src/config/siteConfig.ts` with `fontFamily` option
  - Font preference persists in localStorage across page reloads
  - SiteConfig default font overrides localStorage when siteConfig changes
- Monospace font option added
  - Added monospace to FONT SWITCHER options in global.css
  - Uses "IBM Plex Mono", "Liberation Mono", ui-monospace, monospace
  - Write page font switcher now cycles through all three options
- Fork configuration support
  - Added fontFamily field to fork-config.json.example
  - Automated fork configuration script supports fontFamily option

Updated files: `src/config/siteConfig.ts`, `src/context/FontContext.tsx`, `src/main.tsx`, `src/pages/Write.tsx`, `src/styles/global.css`, `scripts/configure-fork.ts`, `fork-config.json.example`

Documentation updated: `content/blog/setup-guide.md`, `content/pages/docs.md`, `files.md`

## v1.28.2

Released December 25, 2025

**Plain text code block wrapping**

- Code blocks without a language specifier now wrap text properly
- Fixed horizontal overflow for long error messages and prose in code blocks
- Updated inline vs block code detection logic
  - Inline code: short content (< 80 chars), no newlines, no language class
  - Block code: longer content or has language specifier
- Text wrapping uses `pre-wrap` styling applied via SyntaxHighlighter props

Updated files: `src/components/BlogPost.tsx`, `src/styles/global.css`

## v1.28.1

Released December 25, 2025

**RSS feed validation fixes**

- Standardized all URLs to `www.markdown.fast` across the application
- Fixed `atom:link rel="self"` attribute mismatch that caused RSS validation failures
- Updated `index.html` meta tags (og:url, og:image, twitter:domain, twitter:url, twitter:image, JSON-LD)
- Updated `convex/rss.ts` and `convex/http.ts` SITE_URL constants to use www.markdown.fast
- Updated `public/robots.txt`, `public/openapi.yaml`, and `public/llms.txt` with www URLs
- RSS exclusions already present in `netlify.toml` for botMeta edge function

All URL references now consistently use `https://www.markdown.fast`. RSS feed `rel="self"` attribute now matches actual feed URL. Build passes successfully.

## v1.28.0

Released December 25, 2025

**Discovery files sync automation**

- New discovery files sync script
  - Automatically updates AGENTS.md and llms.txt with current app data
  - Reads from siteConfig.ts and queries Convex for post/page counts
  - Preserves existing AGENTS.md instructional content
  - Regenerates llms.txt with current site information
- New npm sync commands
  - `npm run sync:discovery` - Update discovery files (development)
  - `npm run sync:discovery:prod` - Update discovery files (production)
  - `npm run sync:all` - Sync content + discovery files together (development)
  - `npm run sync:all:prod` - Sync content + discovery files together (production)
- Fork configuration support for gitHubRepo
  - Added gitHubRepoConfig to fork-config.json.example
  - Updated configure-fork.ts with backward compatibility for legacy fields

Updated files: `scripts/sync-discovery-files.ts`, `package.json`, `fork-config.json.example`, `scripts/configure-fork.ts`, `FORK_CONFIG.md`, `files.md`

Documentation updated: `README.md`, `docs.md`, `setup-guide.md`, `about.md`, `about-this-blog.md`

## v1.27.0

Released December 24, 2025

**Homepage post limit and optional read more link**

- Configurable post limit for homepage via `siteConfig.postsDisplay.homePostsLimit`
  - Default limit set to 10 most recent posts
  - Set to `undefined` to show all posts (no limit)
- Optional "read more" link below limited post list
  - Configurable via `siteConfig.postsDisplay.homePostsReadMore`
  - Customizable link text and destination URL
  - Only appears when posts are limited and there are more posts than the limit
  - Default links to `/blog` page
  - Can be disabled by setting `enabled: false`

Updated files: `src/config/siteConfig.ts`, `src/pages/Home.tsx`, `src/styles/global.css`

## v1.26.0

Released December 24, 2025

**Tag pages, related posts, and AI service links re-enabled**

- Tag pages at `/tags/[tag]` route
  - Dynamic tag archive pages showing all posts with a specific tag
  - View mode toggle (list/cards) with localStorage persistence
  - Mobile responsive layout matching existing blog page design
  - Sitemap updated to include all tag pages dynamically
- Related posts component for blog post footers
  - Shows up to 3 related posts based on shared tags
  - Sorted by relevance (number of shared tags) then by date
  - Only displays on blog posts (not static pages)
- Improved tag links in post footers
  - Tags now link to `/tags/[tag]` archive pages
  - Visual styling consistent with existing theme
- Open in AI service links re-enabled in CopyPageDropdown
  - Uses GitHub raw URLs instead of Netlify paths (bypasses edge function issues)
  - ChatGPT, Claude, and Perplexity links with universal prompt
  - "Requires git push" hint for users (npm sync alone doesn't update GitHub)
  - Visual divider separating AI options from other menu items

Updated files: `src/config/siteConfig.ts`, `convex/schema.ts`, `convex/posts.ts`, `convex/http.ts`, `src/pages/TagPage.tsx`, `src/pages/Post.tsx`, `src/components/CopyPageDropdown.tsx`, `src/styles/global.css`, `src/App.tsx`

Documentation updated: `content/pages/docs.md`, `content/blog/setup-guide.md`

## v1.25.2

Released December 24, 2025

**AI service links disabled due to Netlify edge function issues**

- Direct links to ChatGPT, Claude, and Perplexity removed from CopyPageDropdown
  - AI crawlers cannot reliably fetch `/raw/*.md` files despite multiple configuration attempts
  - Netlify edge functions intercept requests before static files are served
  - Multiple solutions attempted: excludedPath, code-level bypasses, AI crawler whitelisting, Netlify Functions, header adjustments
  - None resolved the issue for ChatGPT or Perplexity (Claude works)

- Workaround for users
  - Copy page: copies markdown to clipboard, paste directly into any AI tool
  - View as Markdown: opens raw `.md` file in browser for manual copying
  - Download as SKILL.md: downloads in Anthropic Agent Skills format

- Removed Netlify Function at `/api/raw/:slug`
  - Caused build failures and dependency conflicts
  - Static `/raw/*.md` files still work in browsers

Updated files: `src/components/CopyPageDropdown.tsx`, `netlify.toml`

Documentation: `content/blog/netlify-edge-excludedpath-ai-crawlers.md` updated with detailed log of all attempted solutions

## v1.25.1

Released December 24, 2025

**Logo moved to top navigation header**

- Logo now appears in header bar (top-left) on all pages
- Separate from back button and navigation links
- Reads from `siteConfig.innerPageLogo` and `siteConfig.logo`
- Mobile responsive: logo positioned on left in header

Updated files: `src/components/Layout.tsx`, `src/pages/Post.tsx`, `src/pages/Blog.tsx`, `src/styles/global.css`

## v1.25.0

Released December 24, 2025

**Sidebar styling updated to match Cursor docs style**

- Sidebar has alternate background color for visual separation
- Vertical border line on right side of sidebar
- Theme-aware colors for all four themes
- Sidebar width increased to 240px
- Mobile responsive: sidebar hidden below 1024px

Updated files: `src/styles/global.css`

## v1.24.4

Released December 23, 2025

**Navigation visibility control and hardcoded nav items**

- `showInNav` field for pages to control navigation visibility
  - Pages can be published and accessible but hidden from navigation menu
  - Set `showInNav: false` in page frontmatter to hide from nav
  - Defaults to `true` for backwards compatibility (all existing pages show in nav)
  - Pages with `showInNav: false` remain:
    - Published and accessible via direct URL
    - Searchable via search indexes
    - Available via API endpoints
    - Just hidden from the navigation menu
  - Matches the pattern used for `blogPage.showInNav` in siteConfig.ts

- Hardcoded navigation items configuration for React routes
  - Add React route pages (like `/stats`, `/write`) to navigation via `siteConfig.hardcodedNavItems`
  - Configure navigation order, title, and visibility per route
  - Set `showInNav: false` to hide from nav while keeping route accessible
  - Navigation combines Blog link, hardcoded nav items, and markdown pages
  - All nav items sorted by `order` field (lower = first)

Example configuration:

```typescript
// src/config/siteConfig.ts
hardcodedNavItems: [
  {
    slug: "stats",
    title: "Stats",
    order: 10,
    showInNav: true,
  },
  {
    slug: "write",
    title: "Write",
    order: 20,
    showInNav: true,
  },
],
```

Updated files: `convex/schema.ts`, `convex/pages.ts`, `scripts/sync-posts.ts`, `src/pages/Write.tsx`, `src/config/siteConfig.ts`, `src/components/Layout.tsx`

Documentation updated: `content/pages/docs.md`, `content/blog/setup-guide.md`

## v1.24.3

Released December 23, 2025

**Inner page logo configuration**

- Logo displays in header on blog page, individual posts, and static pages
- Desktop: logo positioned on the left (before back button)
- Mobile: logo positioned on the right (smaller size for compact header)
- Configurable via `siteConfig.innerPageLogo.enabled` and `siteConfig.innerPageLogo.size`
- Does not affect homepage logo (controlled separately)
- Logo links to homepage when clicked

Configuration:

```typescript
// src/config/siteConfig.ts
innerPageLogo: {
  enabled: true,  // Set to false to hide logo on inner pages
  size: 28,      // Logo height in pixels (keeps aspect ratio)
},
```

Updated files: `src/config/siteConfig.ts`, `src/pages/Blog.tsx`, `src/pages/Post.tsx`, `src/styles/global.css`

## v1.24.2

Released December 23, 2025

**Mobile menu redesign with sidebar integration**

- Mobile navigation controls moved to left side
  - Hamburger menu, search, and theme toggle now positioned on the left
  - Order: hamburger first, then search, then theme toggle
  - Consistent left-aligned navigation on mobile devices

- Sidebar table of contents in mobile menu
  - When a page or blog post has sidebar layout, the TOC appears in the mobile menu
  - Desktop sidebar hidden on mobile (max-width: 768px) since accessible via hamburger
  - Back button and CopyPageDropdown remain visible above main content on mobile
  - Sidebar headings displayed with same collapsible tree structure as desktop

- Typography standardization
  - All mobile menu elements use CSS variables for font sizes
  - Font-family standardized using `inherit` to match body font
  - Mobile menu TOC links use consistent sizing with desktop sidebar
  - Added CSS variables: `--font-size-mobile-toc-title` and `--font-size-mobile-toc-link`

New files: `src/context/SidebarContext.tsx`

Updated files: `src/components/Layout.tsx`, `src/components/MobileMenu.tsx`, `src/pages/Post.tsx`, `src/styles/global.css`

## v1.24.1

Released December 23, 2025

**Sidebar navigation fixes**

- Fixed anchor link navigation when sidebar sections are collapsed or expanded
  - Navigation now correctly scrolls to target headings with proper header offset
  - Sections expand automatically when navigating to nested headings
  - Collapse button works reliably without triggering navigation
  - Manual collapse/expand state persists during scrolling

- Fixed heading extraction to ignore code blocks
  - Sidebar no longer shows example headings from markdown code examples
  - Only actual page headings appear in the table of contents
  - Filters out fenced code blocks (```) and indented code blocks

Updated files: `src/components/PageSidebar.tsx`, `src/utils/extractHeadings.ts`

## v1.24.0

Released December 23, 2025

**Sidebar layout for blog posts**

- Blog posts now support `layout: "sidebar"` frontmatter field
- Previously only available for static pages, now works for posts too
- Enables docs-style layout with table of contents sidebar for long-form content
- Same features as page sidebar: automatic TOC extraction, active heading highlighting, smooth scroll navigation
- Mobile responsive: stacks to single column below 1024px

Add `layout: "sidebar"` to any blog post frontmatter to enable the sidebar layout. The sidebar extracts headings (H1, H2, H3) automatically and only appears if headings exist in the content.

Example:

```yaml
---
title: "My Tutorial"
description: "A detailed guide"
date: "2025-01-20"
slug: "my-tutorial"
published: true
tags: ["tutorial"]
layout: "sidebar"
---
```

Updated files: `convex/schema.ts`, `scripts/sync-posts.ts`, `convex/posts.ts`, `src/pages/Post.tsx`, `src/pages/Write.tsx`

Documentation updated: `docs.md`, `setup-guide.md`, `how-to-publish.md`

## v1.23.0

Released December 23, 2025

**Collapsible sections in markdown**

- Create expandable/collapsible content using HTML `<details>` and `<summary>` tags
- Use `<details open>` attribute for sections that start expanded by default
- Supports nested collapsible sections for multi-level content
- Theme-aware styling for all four themes (dark, light, tan, cloud)
- Works with all markdown content inside: lists, code blocks, bold, italic, links, etc.

Example usage:

```html
<details>
  <summary>Click to expand</summary>

  Hidden content here with **markdown** support.
</details>
```

New packages: `rehype-raw`, `rehype-sanitize`

Updated files: `src/components/BlogPost.tsx`, `src/styles/global.css`

Documentation updated: `markdown-with-code-examples.md`, `docs.md`

## v1.22.0

Released December 21, 2025

**Sidebar layout for pages**

- Pages can now use a docs-style layout with table of contents sidebar
- Add `layout: "sidebar"` to page frontmatter to enable
- Left sidebar displays TOC extracted from H1, H2, H3 headings automatically
- Two-column grid layout: 220px sidebar + flexible content area
- Active heading highlighting on scroll
- Smooth scroll navigation to sections
- Sidebar only appears if headings exist in content
- Mobile responsive: stacks to single column below 1024px
- CopyPageDropdown remains in top navigation for sidebar pages

New files: `src/utils/extractHeadings.ts`, `src/components/PageSidebar.tsx`

Updated files: `convex/schema.ts`, `scripts/sync-posts.ts`, `convex/pages.ts`, `src/pages/Post.tsx`, `src/styles/global.css`

## v1.21.0

Released December 21, 2025

**Blog page view mode toggle**

- Blog page now supports two view modes: list view and card view
- Toggle button in blog header switches between views
- List view: year-grouped posts with titles, read time, and dates
- Card view: 3-column grid with thumbnails, titles, excerpts, and metadata
- Default view configurable via `siteConfig.blogPage.viewMode`
- Toggle visibility controlled by `siteConfig.blogPage.showViewToggle`
- View preference saved to localStorage and persists across visits
- Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Theme-aware styling for all four themes (dark, light, tan, cloud)
- Cards display post thumbnails from `image` frontmatter field
- Posts without images show cards without thumbnail areas

Updated files: `src/pages/Blog.tsx`, `src/components/PostList.tsx`, `src/config/siteConfig.ts`, `src/styles/global.css`

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