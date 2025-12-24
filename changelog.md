# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.26.0] - 2025-12-24

### Added

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

### Changed

- `src/config/siteConfig.ts`: Added `gitHubRepo` configuration for constructing raw GitHub URLs
- `convex/schema.ts`: Added `by_tags` index to posts table for efficient tag queries
- `convex/posts.ts`: Added `getAllTags`, `getPostsByTag`, and `getRelatedPosts` queries
- `convex/http.ts`: Sitemap now includes dynamically generated tag pages
- Updated `content/pages/docs.md` and `content/blog/setup-guide.md` with git push requirement for AI links

### Technical

- New component: `src/pages/TagPage.tsx`
- New route: `/tags/:tag` in `src/App.tsx`
- CSS styles for tag pages, related posts, and post tag links in `src/styles/global.css`
- Mobile responsive breakpoints for all new components

## [1.25.4] - 2025-12-24

### Fixed

- Sidebar border width now consistent across all pages
  - Fixed border appearing thicker on changelog page when sidebar scrolls
  - Changed from `border-right` to `box-shadow: inset` for consistent 1px width regardless of scrollbar presence
  - Border now renders correctly on both docs and changelog pages

### Changed

- Sidebar scrollbar hidden while maintaining scroll functionality
  - Scrollbar no longer visible but scrolling still works
  - Applied cross-browser scrollbar hiding (Chrome/Safari/Edge, Firefox, IE)
  - Cleaner sidebar appearance matching Cursor docs style

- Sidebar styling improvements
  - Added top border using CSS variable (`var(--border-sidebar)`) for theme consistency
  - Added border-radius for rounded corners
  - Updated CSS comments to document border implementation approach

### Technical

- `src/styles/global.css`: Changed `.post-sidebar-wrapper` border from `border-right` to `box-shadow: inset -1px 0 0`
- `src/styles/global.css`: Added scrollbar hiding with `-ms-overflow-style: none`, `scrollbar-width: none`, and `::-webkit-scrollbar`
- `src/styles/global.css`: Added `border-top: 1px solid var(--border-sidebar)` and `border-radius: 8px` to sidebar wrapper
- `src/styles/global.css`: Updated CSS comments to explain border implementation choices

## [1.25.3] - 2025-12-24

### Fixed

- Mobile menu now appears correctly at all breakpoints where sidebar is hidden
  - Changed mobile hamburger menu breakpoint from `max-width: 768px` to `max-width: 1024px`
  - Changed desktop hide breakpoint from `min-width: 769px` to `min-width: 1025px`
  - Mobile menu now shows whenever sidebar is hidden (matches sidebar breakpoint)
  - Fixed gap where users had no navigation between 769px and 1024px viewport widths

### Technical

- `src/styles/global.css`: Updated mobile nav controls media query to `max-width: 1024px`
- `src/styles/global.css`: Updated desktop hide media query to `min-width: 1025px`
- `src/styles/global.css`: Updated tablet drawer width breakpoint to `max-width: 1024px`

## [1.25.2] - 2025-12-24

### Changed

- Disabled AI service links (ChatGPT, Claude, Perplexity) in CopyPageDropdown
  - Direct links to AI services removed due to Netlify edge function interception issues
  - AI crawlers cannot reliably fetch `/raw/*.md` files despite multiple configuration attempts
  - Users can still copy markdown and paste directly into AI tools manually
  - "Copy page", "View as Markdown", and "Download as SKILL.md" options remain available

### Removed

- Netlify Function at `/api/raw/:slug` endpoint
  - Removed due to build failures and dependency conflicts
  - Static `/raw/*.md` files still work in browsers but not for AI crawler fetch tools

### Technical

- `src/components/CopyPageDropdown.tsx`: Commented out AI service buttons, kept manual copy/view/download options
- `netlify.toml`: Removed `/api/raw/*` redirect rule
- `netlify/functions/raw.js`: Deleted Netlify Function file
- `content/blog/netlify-edge-excludedpath-ai-crawlers.md`: Updated with detailed log of all attempted solutions and timestamps

## [1.25.1] - 2025-12-24

### Changed

- Logo moved to top navigation header on all pages
  - Logo now appears in the header bar (top-left) on blog posts, pages, and blog page
  - Logo is separate from back button and navigation links
  - Reads from `siteConfig.innerPageLogo` and `siteConfig.logo` configuration
  - Works consistently across all pages (with and without sidebar)
  - Mobile responsive: logo positioned on left in header

### Technical

- `src/components/Layout.tsx`: Added logo to top navigation header, reads from siteConfig
- `src/pages/Post.tsx`: Removed logo from post navigation (was next to back button)
- `src/pages/Blog.tsx`: Removed logo from blog navigation
- `src/styles/global.css`: Added `.top-nav-logo-link` and `.top-nav-logo` styles, updated `.top-nav` layout to span left-to-right, removed old `.inner-page-logo` styles

## [1.25.0] - 2025-12-24

### Changed

- Sidebar styling updated to match Cursor docs style
  - Sidebar now has alternate background color (`--sidebar-alt-bg`) for visual separation
  - Vertical border line on right side of sidebar
  - Theme-aware colors for all four themes (dark, light, tan, cloud)
  - Sidebar width increased to 240px for better readability
  - Mobile responsive: sidebar hidden on screens below 1024px

### Technical

- `src/styles/global.css`: Added `--sidebar-alt-bg` CSS variables for each theme, updated `.post-sidebar-wrapper` with alternate background and right border, adjusted grid layout for wider sidebar

## [1.24.9] - 2025-12-24

### Added

- Safety-net raw markdown endpoint for AI tools (`/api/raw/:slug`)
  - New Netlify Function at `netlify/functions/raw.ts`
  - Returns `text/plain` with minimal headers for reliable AI ingestion
  - Reads from `dist/raw/` (production) or `public/raw/` (dev/preview)
  - Handles 400 (missing slug), 404 (not found), and 200 (success) responses
  - No Link, X-Robots-Tag, or SEO headers that cause AI fetch failures

### Changed

- AI service links (ChatGPT, Claude, Perplexity) now use `/api/raw/:slug` instead of `/raw/:slug.md`
  - Netlify Function endpoint more reliable for AI crawler fetch
  - "View as Markdown" menu item still uses `/raw/:slug.md` for browser viewing

### Technical

- `netlify/functions/raw.ts`: New Netlify Function to serve raw markdown
- `netlify.toml`: Added redirect from `/api/raw/*` to the function
- `src/components/CopyPageDropdown.tsx`: AI services use `/api/raw/:slug` endpoint
- `package.json`: Added `@netlify/functions` dev dependency

## [1.24.8] - 2025-12-23

### Fixed

- Raw markdown URL construction now uses `window.location.origin` instead of `props.url`
  - Prevents incorrect URLs when `props.url` points to canonical/deploy preview domains
  - Uses `new URL()` constructor for proper absolute URL building
  - Ensures raw URLs always match the current page origin
  - Applied to both AI service links and "View as Markdown" option

### Technical

- `src/components/CopyPageDropdown.tsx`: Changed raw URL construction from `new URL(props.url).origin` to `window.location.origin` with `new URL()` constructor

## [1.24.7] - 2025-12-23

### Fixed

- Removed `Link` header from `/raw/*` endpoints to fix AI crawler fetch failures
  - Netlify merges headers, so global `Link` header was being applied to `/raw/*` despite specific block
  - Moved `Link` header from global `/*` scope to `/index.html` only
  - Removed `X-Robots-Tag = "noindex"` from `/raw/*` to allow AI crawlers to index raw content
  - Raw markdown files now have clean headers optimized for AI consumption

### Technical

- `netlify.toml`: Removed `Link` from global headers, added specific `/index.html` block, removed `noindex` from `/raw/*`

## [1.24.6] - 2025-12-23

### Added

- Homepage raw markdown index file (`/raw/index.md`)
  - Automatically generated during `npm run sync` and `npm run sync:prod`
  - Lists all published posts sorted by date (newest first)
  - Lists all published pages sorted by order or alphabetically
  - Includes post metadata: date, reading time, tags, description
  - Provides direct links to all raw markdown files
  - AI crawlers can now access homepage content as markdown

### Technical

- Updated `scripts/sync-posts.ts`: Added `generateHomepageIndex()` function to create `index.md` in `public/raw/`

## [1.24.5] - 2025-12-23

### Fixed

- AI crawlers (ChatGPT, Perplexity) can now fetch raw markdown from `/raw/*.md` URLs
  - Added explicit `/raw/*` redirect passthrough in `netlify.toml` before SPA fallback
  - Expanded `excludedPath` array to cover all static file patterns
  - Refactored `botMeta.ts` edge function:
    - Added hard bypass at top of handler for static file paths
    - Separated social preview bots from AI crawlers
    - AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) now bypass OG interception
    - Only social preview bots (Facebook, Twitter, LinkedIn, etc.) receive OG metadata HTML

### Technical

- `netlify.toml`: Added `force = true` to `/raw/*` redirect, expanded `excludedPath` array
- `botMeta.ts`: Complete refactor with `SOCIAL_PREVIEW_BOTS` and `AI_CRAWLERS` lists, hard path bypass

## [1.24.4] - 2025-12-23

### Added

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
  - Example: Configure `/stats` and `/write` routes in `siteConfig.ts`

### Technical

- Updated `convex/schema.ts`: Added optional `showInNav` field to pages table
- Updated `convex/pages.ts`: `getAllPages` query filters out pages where `showInNav === false`
- Updated `scripts/sync-posts.ts`: Parses `showInNav` from page frontmatter
- Updated `src/pages/Write.tsx`: Added `showInNav` field to page template and PAGE_FIELDS reference
- Updated `src/config/siteConfig.ts`: Added `HardcodedNavItem` interface and `hardcodedNavItems` config array
- Updated `src/components/Layout.tsx`: Reads `hardcodedNavItems` from siteConfig and combines with Blog link and pages

### Documentation

- Updated `content/pages/docs.md`: Added `showInNav` to static pages frontmatter table
- Updated `content/blog/setup-guide.md`: Added `showInNav` to static pages frontmatter table

## [1.24.3] - 2025-12-23

### Added

- Inner page logo configuration
  - Logo displays in header on blog page, individual posts, and static pages
  - Desktop: logo positioned on the left (before back button)
  - Mobile: logo positioned on the right (smaller size for compact header)
  - Configurable via `siteConfig.innerPageLogo.enabled` and `siteConfig.innerPageLogo.size`
  - Does not affect homepage logo (controlled separately)
  - Logo links to homepage when clicked

### Technical

- Updated `src/config/siteConfig.ts`: Added `InnerPageLogoConfig` interface and `innerPageLogo` config option
- Updated `src/pages/Blog.tsx`: Added logo to header navigation
- Updated `src/pages/Post.tsx`: Added logo to header navigation for both posts and pages
- Updated `src/styles/global.css`: Added CSS for desktop (left) and mobile (right) logo positioning with responsive sizing

## [1.24.2] - 2025-12-23

### Changed

- Mobile menu redesigned for better sidebar integration
  - Mobile navigation controls moved to left side (hamburger, search, theme toggle)
  - Hamburger menu order: hamburger first, then search, then theme toggle
  - Sidebar table of contents now appears in mobile menu when page has sidebar layout
  - Desktop sidebar hidden on mobile (max-width: 768px) since it's accessible via hamburger menu
  - Back button and CopyPageDropdown remain visible above main content on mobile
- Mobile menu typography standardized
  - All mobile menu elements now use CSS variables for font sizes
  - Font-family standardized using `inherit` to match body font from global.css
  - Mobile menu TOC links use consistent font sizing with desktop sidebar
  - Added CSS variables: `--font-size-mobile-toc-title` and `--font-size-mobile-toc-link`

### Technical

- Updated `src/components/Layout.tsx`: Reordered mobile nav controls, added sidebar context integration
- Updated `src/components/MobileMenu.tsx`: Added sidebar headings rendering in mobile menu
- Updated `src/pages/Post.tsx`: Provides sidebar headings to context for mobile menu
- Updated `src/context/SidebarContext.tsx`: New context for sharing sidebar data between components
- Updated `src/styles/global.css`: Mobile menu positioning, sidebar hiding on mobile, font standardization

## [1.24.1] - 2025-12-23

### Fixed

- Sidebar navigation anchor links now work correctly when sections are collapsed or expanded
  - Fixed navigation scroll calculation to use proper header offset (80px)
  - Expand ancestors before scrolling to ensure target is visible
  - Use requestAnimationFrame to ensure DOM updates complete before scrolling
  - Removed auto-expand from scroll handler to prevent interfering with manual collapse/expand
  - Collapse button now properly isolated from link clicks with event handlers

### Changed

- Updated `extractHeadings.ts` to filter out headings inside code blocks
  - Prevents sidebar from showing example headings from markdown code examples
  - Removes fenced code blocks (```) and indented code blocks before extracting headings
  - Ensures sidebar only shows actual page headings, not code examples

### Technical

- Updated `src/components/PageSidebar.tsx`: Improved navigation logic and collapse button event handling
- Updated `src/utils/extractHeadings.ts`: Added `removeCodeBlocks` function to filter code before heading extraction

## [1.24.0] - 2025-12-23

### Added

- Sidebar layout support for blog posts
  - Blog posts can now use `layout: "sidebar"` frontmatter field (previously only available for pages)
  - Enables docs-style layout with table of contents sidebar for long-form posts
  - Same features as page sidebar: automatic TOC extraction, active heading highlighting, smooth scroll navigation
  - Mobile responsive: stacks to single column below 1024px

### Changed

- Updated `Post.tsx` to handle sidebar layout for both posts and pages
- Updated `Write.tsx` to include `layout` field in blog post frontmatter reference

### Technical

- Updated `convex/schema.ts`: Added optional `layout` field to posts table
- Updated `scripts/sync-posts.ts`: Parses `layout` field from post frontmatter
- Updated `convex/posts.ts`: Includes `layout` field in queries, mutations, and sync operations
- Reuses existing sidebar components and CSS (no new components needed)

### Documentation

- Updated `docs.md`: Added `layout` field to blog posts frontmatter table, updated sidebar layout section
- Updated `setup-guide.md`: Clarified sidebar layout works for both posts and pages
- Updated `how-to-publish.md`: Added `layout` field to frontmatter reference table

## [1.23.0] - 2025-12-23

### Added

- Collapsible sections in markdown using HTML `<details>` and `<summary>` tags
  - Create expandable/collapsible content in blog posts and pages
  - Use `<details open>` attribute for sections that start expanded
  - Supports nested collapsible sections
  - Theme-aware styling for all four themes (dark, light, tan, cloud)
  - Works with all markdown content inside: lists, code blocks, bold, italic, etc.

### Technical

- Added `rehype-raw` package to allow raw HTML pass-through in react-markdown
- Added `rehype-sanitize` package to strip dangerous tags while allowing safe ones
- Custom sanitize schema allows `details`, `summary` tags and the `open` attribute
- Updated `src/components/BlogPost.tsx` with rehype plugins
- CSS styles for collapsible sections in `src/styles/global.css`

### Documentation

- Updated `markdown-with-code-examples.md` with collapsible section examples
- Updated `docs.md` with collapsible sections documentation
- Updated `files.md` with BlogPost.tsx description change

## [1.22.0] - 2025-12-21

### Added

- Sidebar layout for pages with table of contents
  - Add `layout: "sidebar"` to page frontmatter to enable docs-style layout
  - Left sidebar displays table of contents extracted from H1, H2, H3 headings
  - Two-column grid layout: 220px sidebar + flexible content area
  - Sidebar only appears if headings exist in the page content
  - Active heading highlighting on scroll
  - Smooth scroll navigation to sections
  - CopyPageDropdown remains in top navigation for sidebar pages
  - Mobile responsive: stacks to single column below 1024px

### Technical

- New utility: `src/utils/extractHeadings.ts` for parsing markdown headings
- New component: `src/components/PageSidebar.tsx` for TOC navigation
- Updated `convex/schema.ts`: Added optional `layout` field to pages table
- Updated `scripts/sync-posts.ts`: Parses `layout` field from page frontmatter
- Updated `convex/pages.ts`: Includes `layout` field in queries and mutations
- Updated `src/pages/Post.tsx`: Conditionally renders sidebar layout
- CSS grid layout with sticky sidebar positioning
- Full-width container breaks out of main-content constraints

## [1.21.0] - 2025-12-21

### Added

- Blog page view mode toggle (list and card views)
  - Toggle button in blog header to switch between list and card views
  - Card view displays posts in a 3-column grid with thumbnails, titles, excerpts, and metadata
  - List view shows year-grouped posts (existing behavior)
  - View preference saved to localStorage
  - Default view mode configurable via `siteConfig.blogPage.viewMode`
  - Toggle visibility controlled by `siteConfig.blogPage.showViewToggle`
- Post cards component
  - Displays post thumbnails, titles, excerpts, read time, and dates
  - Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
  - Theme-aware styling for all four themes (dark, light, tan, cloud)
  - Square thumbnails with hover zoom effect
  - Cards without images display with adjusted padding

### Changed

- Updated `PostList` component to support both list and card view modes
- Updated `Blog.tsx` to include view toggle button and state management
- Updated `siteConfig.ts` with `blogPage.viewMode` and `blogPage.showViewToggle` options

### Technical

- New CSS classes: `.post-cards`, `.post-card`, `.post-card-image-wrapper`, `.post-card-content`, `.post-card-meta`
- Reuses featured card styling patterns for consistency
- Mobile responsive with adjusted grid columns and image aspect ratios

## [1.20.3] - 2025-12-21

### Fixed

- Raw markdown files now accessible to AI crawlers (ChatGPT, Perplexity)
  - Added `/raw/` path bypass in botMeta edge function
  - AI services were receiving HTML instead of markdown content

### Added

- SEO and AEO improvements
  - Sitemap now includes static pages (about, docs, contact, etc.)
  - Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy
  - Link header pointing to llms.txt for AI discovery
  - Raw markdown files served with proper Content-Type and CORS headers
  - Preconnect hints for Convex backend (faster API calls)

### Changed

- Fixed URL consistency: openapi.yaml and robots.txt now use www.markdown.fast

## [1.20.2] - 2025-12-21

### Fixed

- Write conflict prevention for heartbeat mutation
  - Increased backend dedup window from 10s to 20s
  - Increased frontend debounce from 10s to 20s to match backend
  - Added random jitter (±5s) to heartbeat intervals to prevent synchronized calls across tabs
  - Simplified early return to skip ANY update within dedup window (not just same path)
  - Prevents "Documents read from or written to the activeSessions table changed" errors

## [1.20.1] - 2025-12-21

### Changed

- Visitor map styling improvements
  - Removed box-shadow from map wrapper for cleaner flat design
  - Increased land dot contrast for better globe visibility on all themes
  - Increased land dot opacity from 0.6 to 0.85
  - Darker/more visible land colors for light, tan, and cloud themes
  - Lighter land color for dark theme to stand out on dark background

## [1.20.0] - 2025-12-21

### Added

- Real-time visitor map on stats page
  - Displays live visitor locations on a dotted world map
  - Uses Netlify's built-in geo detection via edge function (no third-party API needed)
  - Privacy friendly: stores city, country, and coordinates only (no IP addresses)
  - Theme-aware colors for all four themes (dark, light, tan, cloud)
  - Animated pulsing dots for active visitors
  - Visitor count badge showing online visitors
  - Configurable via `siteConfig.visitorMap`
- New Netlify edge function: `netlify/edge-functions/geo.ts`
  - Returns user geo data from Netlify's automatic geo headers
  - Endpoint: `/api/geo`
- New React component: `src/components/VisitorMap.tsx`
  - SVG-based world map with simplified continent outlines
  - Lightweight (no external map library needed)
  - Responsive design scales on mobile

### Changed

- Updated `convex/schema.ts`: Added optional location fields to `activeSessions` table (city, country, latitude, longitude)
- Updated `convex/stats.ts`: Heartbeat mutation accepts geo args, getStats returns visitor locations
- Updated `src/hooks/usePageTracking.ts`: Fetches geo data once on mount, passes to heartbeat
- Updated `src/pages/Stats.tsx`: Displays VisitorMap above "Currently Viewing" section
- Updated `src/config/siteConfig.ts`: Added `VisitorMapConfig` interface and `visitorMap` config option

### Documentation

- Updated setup-guide.md with Visitor Map section
- Updated docs.md with Visitor Map configuration
- Updated FORK_CONFIG.md with visitorMap config
- Updated fork-config.json.example with visitorMap option
- Updated fork-configuration-guide.md with visitorMap example

## [1.19.1] - 2025-12-21

### Added

- GitHub Stars card on Stats page
  - Displays live star count from `waynesutton/markdown-site` repository
  - Fetches from GitHub public API (no token required)
  - Uses Phosphor GithubLogo icon
  - Updates on page load

### Changed

- Stats page now displays 6 cards in a single row (previously 5)
- Updated CSS grid for 6-column layout on desktop
- Responsive breakpoints adjusted for 6 cards (3x2 tablet, 2x3 mobile, 1x6 small mobile)

### Technical

- Added `useState` and `useEffect` to `src/pages/Stats.tsx` for GitHub API fetch
- Added `GithubLogo` import from `@phosphor-icons/react`
- Updated `.stats-cards-modern` grid to `repeat(6, 1fr)`
- Updated responsive nth-child selectors for proper borders

## [1.19.0] - 2025-12-21

### Added

- Author display for posts and pages
  - New optional `authorName` and `authorImage` frontmatter fields
  - Round avatar image displayed next to date and read time
  - Works on individual post and page views (not on blog list)
  - Example: `authorName: "Your Name"` and `authorImage: "/images/authors/photo.png"`
- Author images directory at `public/images/authors/`
  - Place author avatar images here
  - Recommended: square images (they display as circles)
- Write page updated with new frontmatter field reference
  - Shows `authorName` and `authorImage` options for both posts and pages

### Technical

- Updated `convex/schema.ts` with authorName and authorImage fields
- Updated `scripts/sync-posts.ts` interfaces and parsing
- Updated `convex/posts.ts` and `convex/pages.ts` queries and mutations
- Updated `src/pages/Post.tsx` to render author info
- Updated `src/pages/Write.tsx` with new field definitions
- CSS styles for `.post-author`, `.post-author-image`, `.post-author-name`

### Documentation

- Updated frontmatter tables in setup-guide.md, docs.md, files.md, README.md
- Added example usage in about-this-blog.md

## [1.18.1] - 2025-12-21

### Changed

- CopyPageDropdown AI services now use raw markdown URLs for better AI parsing
  - ChatGPT, Claude, and Perplexity receive `/raw/{slug}.md` URLs instead of page URLs
  - AI services can fetch and parse clean markdown content directly
  - Includes metadata headers (type, date, reading time, tags) for structured parsing
  - No HTML parsing required by AI services

### Technical

- Renamed `buildUrlFromPageUrl` to `buildUrlFromRawMarkdown` in AIService interface
- Handler builds raw markdown URL from page origin and slug
- Updated prompt text to reference "raw markdown file URL"

## [1.18.0] - 2025-12-20

### Added

- Automated fork configuration with `npm run configure`
  - Copy `fork-config.json.example` to `fork-config.json`
  - Edit JSON with your site information
  - Run `npm run configure` to apply all changes automatically
  - Updates all 11 configuration files in one command
- Two options for fork setup
  - **Option 1: Automated** (recommended): JSON config + single command
  - **Option 2: Manual**: Follow step-by-step guide in `FORK_CONFIG.md`
- `FORK_CONFIG.md` comprehensive fork guide
  - YAML template for AI agent configuration
  - Manual code snippets for each file
  - AI agent prompt for automated updates
- `fork-config.json.example` template with all configuration options
  - Site name, URL, description
  - Creator social links (Twitter, LinkedIn, GitHub)
  - Bio and intro text
  - Logo gallery settings
  - GitHub contributions config
  - Blog page and theme options

### Technical

- New script: `scripts/configure-fork.ts`
- New npm command: `npm run configure`
- Reads JSON config and updates 11 files with string replacements
- Updates: siteConfig.ts, Home.tsx, Post.tsx, http.ts, rss.ts, index.html, llms.txt, robots.txt, openapi.yaml, ai-plugin.json, ThemeContext.tsx

## [1.17.0] - 2025-12-20

### Added

- GitHub contributions graph on homepage
  - Displays yearly contribution activity with theme-aware colors
  - Fetches data from public API (no GitHub token required)
  - Year navigation with Phosphor icons (CaretLeft, CaretRight)
  - Click graph to visit GitHub profile
  - Configurable via `siteConfig.gitHubContributions`
- Theme-specific contribution colors
  - Dark theme: GitHub green on dark background
  - Light theme: Standard GitHub green
  - Tan theme: Warm brown tones matching site palette
  - Cloud theme: Gray-blue tones
- Mobile responsive design
  - Scales down on tablets and phones
  - Day labels hidden on small screens for space
  - Touch-friendly navigation buttons

### Technical

- New component: `src/components/GitHubContributions.tsx`
- Uses `github-contributions-api.jogruber.de` public API
- CSS variables for contribution level colors per theme
- Configuration interface: `GitHubContributionsConfig`
- Set `enabled: false` in siteConfig to disable

## [1.16.0] - 2025-12-21

### Added

- Public markdown writing page at `/write` (not linked in navigation)
  - Three-column Cursor docs-style layout
  - Left sidebar: Home link, content type selector (Blog Post/Page), actions (Clear, Theme, Font)
  - Center: Full-height writing area with title, Copy All button, and borderless textarea
  - Right sidebar: Frontmatter reference with copy icon for each field
- Font switcher in Actions section
  - Toggle between Serif and Sans-serif fonts
  - Font preference saved to localStorage
- Theme toggle matching the rest of the app (Moon, Sun, Half2Icon, Cloud)
- localStorage persistence for content, type, and font preference
- Word, line, and character counts in status bar
- Warning banner: "Refresh loses content"
- Grammarly and browser spellcheck compatible
- Works with all four themes (dark, light, tan, cloud)

### Technical

- New component: `src/pages/Write.tsx`
- Route: `/write` (added to `src/App.tsx`)
- Three localStorage keys: `markdown_write_content`, `markdown_write_type`, `markdown_write_font`
- CSS Grid layout (220px | 1fr | 280px)
- Uses Phosphor icons: House, Article, File, Trash, CopySimple, Warning, Check
- Uses lucide-react and radix-ui icons for theme toggle (consistent with ThemeToggle.tsx)

## [1.15.1] - 2025-12-21

### Fixed

- Theme toggle icons on `/write` page now match `ThemeToggle.tsx` component
  - dark: Moon icon (lucide-react)
  - light: Sun icon (lucide-react)
  - tan: Half2Icon (radix-ui) - consistent with rest of app
  - cloud: Cloud icon (lucide-react)
- Content type switching (Blog Post/Page) now always updates writing area template

### Technical

- Replaced Phosphor icons (Moon, Sun, Leaf, CloudSun) with lucide-react and radix-ui icons
- `handleTypeChange` now always regenerates template when switching types

## [1.15.0] - 2025-12-21

### Changed

- Redesigned `/write` page with three-column Cursor docs-style layout
  - Left sidebar: Home link, content type selector (Blog Post/Page), actions (Clear, Theme)
  - Center: Full-height writing area with title, Copy All button, and borderless textarea
  - Right sidebar: Frontmatter reference with copy icon for each field
- Frontmatter fields panel with per-field copy buttons
  - Each frontmatter field shows name, example value, and copy icon
  - Click to copy individual field syntax to clipboard
  - Required fields marked with red asterisk
  - Fields update dynamically when switching between Blog Post and Page
- Warning banner for unsaved content
  - "Refresh loses content" warning in left sidebar with warning icon
  - Helps users remember localStorage persistence limitations
- Enhanced status bar
  - Word, line, and character counts in sticky footer
  - Save hint with content directory path

### Technical

- Three-column CSS Grid layout (220px sidebar | 1fr main | 280px right sidebar)
- Theme toggle cycles through dark, light, tan, cloud with matching icons
- Collapsible sidebars on mobile (stacked layout)
- Uses Phosphor icons: House, Article, File, Trash, CopySimple, Warning, Check

## [1.14.0] - 2025-12-20

### Changed

- Redesigned `/write` page with Notion-like minimal UI
  - Full-screen distraction-free writing experience
  - Removed site header for focused writing environment
  - Wider writing area (900px max-width centered)
  - Borderless textarea with transparent background
  - Own minimal header with home link, type selector, and icon buttons
- Improved toolbar design
  - Home icon link to return to main site
  - Clean dropdown for content type selection (no borders)
  - Collapsible frontmatter fields panel (hidden by default)
  - Theme toggle in toolbar (cycles through dark, light, tan, cloud)
  - Icon buttons with subtle hover states
  - Copy button with inverted theme colors
- Enhanced status bar
  - Sticky footer with word/line/character counts
  - Save hint with content directory path
  - Dot separators between stats

### Technical

- Write page now renders without Layout component wrapper
- Added Phosphor icons: House, Sun, Moon, CloudSun, Leaf, Info, X
- CSS restructured for minimal aesthetic (`.write-wrapper`, `.write-header`, etc.)
- Mobile responsive with hidden copy text and save hint on small screens

## [1.13.0] - 2025-12-20

### Added

- Public markdown writing page at `/write` (not linked in navigation)
  - Dropdown to select between "Blog Post" and "Page" content types
  - Frontmatter fields reference panel with required/optional indicators
  - Copy button using Phosphor CopySimple icon
  - Clear button to reset content to template
  - Status bar showing lines, words, and characters count
  - Usage hint with instructions for saving content
- localStorage persistence for writing session
  - Content persists across page refreshes within same browser
  - Each browser has isolated content (session privacy)
  - Content type selection saved separately
- Auto-generated frontmatter templates
  - Blog post template with all common fields
  - Page template with navigation fields
  - Current date auto-populated in templates

### Technical

- New component: `src/pages/Write.tsx`
- Route: `/write` (added to `src/App.tsx`)
- CSS styles added to `src/styles/global.css`
- Works with all four themes (dark, light, tan, cloud)
- Plain textarea for Grammarly and browser spellcheck compatibility
- Mobile responsive design with adjusted layout for smaller screens
- No Convex backend required (localStorage only)

## [1.12.2] - 2025-12-20

### Added

- Centralized font-size configuration using CSS variables in `global.css`
  - Base size scale from 10px to 64px with semantic names
  - Component-specific variables for consistent sizing
  - Mobile responsive overrides at 768px breakpoint
- All hardcoded font sizes converted to CSS variables for easier customization

### Technical

- Font sizes defined in `:root` selector with `--font-size-*` naming convention
- Mobile breakpoint uses same variables with smaller values
- Base scale: 3xs (10px), 2xs (11px), xs (12px), sm (13px), md (14px), base (16px), lg (17px), xl (18px), 2xl (20px), 3xl (24px), 4xl (28px), 5xl (32px), 6xl (36px), hero (64px)

## [1.12.1] - 2025-12-20

### Fixed

- Open Graph images now use post/page `image` field from frontmatter
  - Posts with images in frontmatter display their specific OG image
  - Posts without images fall back to `og-default.svg`
  - Pages now supported with appropriate `og:type` set to "website"
  - Relative image paths resolved to absolute URLs

### Changed

- Renamed `generatePostMetaHtml` to `generateMetaHtml` in `convex/http.ts`
- `/meta/post` endpoint now checks for pages if no post found
- Meta HTML generation accepts optional `image` and `type` parameters

### Technical

- Updated `convex/http.ts` with image resolution logic
- Handles both absolute URLs and relative paths for images
- Deployed to production Convex

## [1.12.0] - 2025-12-20

### Added

- Dedicated blog page at `/blog` with configurable display
  - Enable/disable via `siteConfig.blogPage.enabled`
  - Show/hide from navigation via `siteConfig.blogPage.showInNav`
  - Custom page title via `siteConfig.blogPage.title`
  - Navigation order via `siteConfig.blogPage.order` (lower = first)
- Centralized site configuration in `src/config/siteConfig.ts`
  - Moved all site settings from `Home.tsx` to dedicated config file
  - Easier to customize when forking
- Flexible post display options
  - `displayOnHomepage`: Show posts on the homepage
  - `blogPage.enabled`: Show posts on dedicated `/blog` page
  - Both can be enabled for dual display

### Changed

- Navigation now combines Blog link with pages and sorts by order
  - Blog link position controlled by `siteConfig.blogPage.order`
  - Pages sorted by frontmatter `order` field (lower = first)
  - Items without order default to 999 (appear last, alphabetically)
- `Home.tsx` imports siteConfig instead of defining inline
- `Layout.tsx` uses unified nav item sorting for desktop and mobile

### Technical

- New file: `src/config/siteConfig.ts`
- New page: `src/pages/Blog.tsx`
- Updated: `src/App.tsx` (conditional blog route)
- Updated: `src/components/Layout.tsx` (nav item ordering)
- Updated: `src/styles/global.css` (blog page styles)

## [1.11.1] - 2025-12-20

### Fixed

- Stats page now shows all historical page views correctly
  - Changed `getStats` to use direct counting until aggregates are fully backfilled
  - Ensures accurate stats display even if aggregate backfilling is incomplete

### Changed

- Chunked backfilling for aggregate component
  - Backfill mutation now processes 500 records at a time
  - Prevents memory limit issues with large datasets (16MB Convex limit)
  - Schedules itself to continue processing until complete
  - Progress visible in Convex dashboard logs

### Technical

- `backfillAggregatesChunk` internal mutation handles pagination
- Uses `ctx.scheduler.runAfter` to chain batch processing
- Tracks seen session IDs across chunks for unique visitor counting

## [1.11.0] - 2025-12-20

### Added

- Aggregate component for efficient O(log n) stats counts
  - Replaces O(n) table scans with pre-computed denormalized counts
  - Uses `@convex-dev/aggregate` package for TableAggregate
  - Three aggregates: totalPageViews, pageViewsByPath, uniqueVisitors
- Backfill mutation for existing page view data
  - `stats:backfillAggregates` populates counts from existing data
  - Idempotent and safe to run multiple times

### Changed

- `recordPageView` mutation now updates aggregate components
  - Inserts into pageViewsByPath aggregate for per-page counts
  - Inserts into totalPageViews aggregate for global count
  - Inserts into uniqueVisitors aggregate for new sessions only
- `getStats` query now uses aggregate counts
  - O(log n) count operations instead of O(n) table scans
  - Consistent fast response times regardless of data size
  - Still queries posts/pages for title matching

### Technical

- New file: `convex/convex.config.ts` (updated with aggregate component registrations)
- Three TableAggregate instances with different namespacing strategies
- Performance improvement scales better with growing page view data

### Documentation

- Updated `prds/howstatsworks.md` with old vs new implementation comparison
- Added aggregate component usage examples and configuration

## [1.10.0] - 2025-12-20

### Added

- Fork configuration documentation
  - "Files to Update When Forking" section in docs.md and setup-guide.md
  - Lists all 9 files with site-specific configuration
  - Backend configuration examples for Convex files
  - Code snippets for `convex/http.ts`, `convex/rss.ts`, `src/pages/Post.tsx`
- Same documentation added to README.md for discoverability

### Changed

- Updated site branding across all configuration files
  - `public/robots.txt`: Updated sitemap URL and header
  - `public/llms.txt`: Updated site name and description
  - `public/.well-known/ai-plugin.json`: Updated name and description for AI plugins
  - `public/openapi.yaml`: Updated API title and site name example
  - `convex/http.ts`: Updated SITE_URL and SITE_NAME constants

### Documentation

- Setup guide table of contents now includes fork configuration sections
- Docs page configuration section expanded with backend file list
- All AI discovery files reflect new "markdown sync site" branding

## [1.9.0] - 2025-12-20

### Added

- Scroll-to-top button
  - Appears after scrolling 300px (configurable)
  - Uses Phosphor ArrowUp icon for consistency
  - Smooth scroll animation (configurable)
  - Works with all four themes (dark, light, tan, cloud)
  - Enabled by default (can be disabled in Layout.tsx)
  - Fade-in animation when appearing
  - Responsive sizing for mobile devices

### Technical

- New component: `src/components/ScrollToTop.tsx`
  - Configurable via `ScrollToTopConfig` interface
  - Exports `defaultScrollToTopConfig` for customization
  - Uses passive scroll listener for performance
- Configuration options in Layout.tsx `scrollToTopConfig`
- CSS styles added to global.css with theme-specific shadows

## [1.8.0] - 2025-12-20

### Added

- Mobile menu with hamburger navigation
  - Slide-out drawer on mobile and tablet views
  - Accessible with keyboard navigation (Escape to close)
  - Focus trap for screen reader support
  - Smooth CSS transform animations
  - Page links and Home link in drawer
  - Auto-closes on route change
- Generate Skill option in CopyPageDropdown
  - Formats post/page content as an AI agent skill file
  - Downloads as `{slug}-skill.md` with skill structure
  - Includes metadata, when to use, and instructions sections
  - Uses Download icon from lucide-react

### Changed

- Layout.tsx now includes hamburger button and MobileMenu component
- Desktop navigation hidden on mobile, mobile menu hidden on desktop
- Improved responsive navigation across all breakpoints

### Technical

- New component: `src/components/MobileMenu.tsx`
- HamburgerButton exported from MobileMenu for Layout use
- New `formatAsSkill()` function for skill file generation
- New `handleDownloadSkill()` handler with blob download logic
- Uses browser File API for client-side file download
- CSS styles for mobile menu in global.css

## [1.7.0] - 2025-12-20

### Added

- Static raw markdown files at `/raw/{slug}.md`
  - Generated during `npm run sync` (development) or `npm run sync:prod` (production) in `public/raw/` directory
  - Each published post and page gets a corresponding static `.md` file
  - SEO indexable and accessible to AI agents
  - Includes metadata header (type, date, reading time, tags)
- View as Markdown option in CopyPageDropdown
  - Opens raw `.md` file in new tab
  - Available on all post and page views
- Perplexity added to AI service options in CopyPageDropdown
  - Sends full markdown content via URL parameter
  - Research articles directly in Perplexity
- Featured image support for posts and pages
  - `image` field in frontmatter displays as square thumbnail in card view
  - Non-square images automatically cropped to center
  - Recommended size: 400x400px minimum (800x800px for retina)

### Changed

- CopyPageDropdown now accepts `slug` prop for raw file links
- Updated `_redirects` to serve `/raw/*` files directly
- Improved markdown table CSS styling
  - GitHub-style tables with proper borders
  - Mobile responsive with horizontal scroll
  - Theme-aware alternating row colors
  - Hover states for better readability

### Technical

- Updated `scripts/sync-posts.ts` to generate `public/raw/` files
- Files are regenerated on each sync (old files cleaned up)
- Only published posts and pages generate raw files
- CopyPageDropdown uses FileText icon from lucide-react for View as Markdown

## [1.6.1] - 2025-12-18

### Added

- AGENTS.md with codebase instructions for AI coding agents

### Changed

- Added Firecrawl import to all "When to sync vs deploy" tables in docs
- Clarified import workflow: creates local files only, no `import:prod` needed
- Updated README, setup-guide, how-to-publish, docs page, about-this-blog
- Renamed `content/pages/changelog.md` to `changelog-page.md` to avoid confusion with root changelog

## [1.6.0] - 2025-12-18

### Added

- Firecrawl content importer for external URLs
  - New `npm run import <url>` command
  - Scrapes URLs and converts to local markdown drafts
  - Creates drafts in `content/blog/` with frontmatter
  - Uses Firecrawl API (requires `FIRECRAWL_API_KEY` in `.env.local`)
  - Then sync to dev (`npm run sync`) or prod (`npm run sync:prod`)
  - No separate `import:prod` command needed (import creates local files only)
- New API endpoint `/api/export` for batch content fetching
  - Returns all posts with full markdown content
  - Single request for LLM ingestion
- AI plugin discovery at `/.well-known/ai-plugin.json`
  - Standard format for AI tool integration
- OpenAPI 3.0 specification at `/openapi.yaml`
  - Full API documentation
  - Describes all endpoints, parameters, and responses
- Enhanced `llms.txt` with complete API documentation
  - Added all new endpoints
  - Improved quick start section
  - Added response schema documentation

### Technical

- New script: `scripts/import-url.ts`
- New package dependency: `@mendable/firecrawl-js`
- Updated `netlify/edge-functions/api.ts` for `/api/export` proxy
- Updated `convex/http.ts` with export endpoint
- Created `public/.well-known/` directory

## [1.5.0] - 2025-12-17

### Added

- Frontmatter-controlled featured items
  - Add `featured: true` to any post or page frontmatter
  - Use `featuredOrder` to control display order (lower = first)
  - Featured items sync instantly with `npm run sync` (no redeploy needed)
- New Convex queries for featured content
  - `getFeaturedPosts`: returns posts with `featured: true`
  - `getFeaturedPages`: returns pages with `featured: true`
- Schema updates with `featured` and `featuredOrder` fields
  - Added `by_featured` index for efficient queries

### Changed

- Home.tsx now queries featured items from Convex instead of siteConfig
- FeaturedCards component uses Convex queries for real-time updates
- Removed hardcoded `featuredItems` and `featuredEssays` from siteConfig

### Technical

- Updated sync script to parse `featured` and `featuredOrder` from frontmatter
- Added index on `featured` field in posts and pages tables
- Both list and card views now use frontmatter data

## [1.4.0] - 2025-12-17

### Added

- Featured section with list/card view toggle
  - Card view displays title and excerpt in a responsive grid
  - Toggle button in featured header to switch between views
  - View preference saved to localStorage
- Logo gallery with continuous marquee scroll
  - Clickable logos with configurable URLs
  - CSS only animation for smooth infinite scrolling
  - Configurable speed, position, and title
  - Grayscale logos with color on hover
  - Responsive sizing across breakpoints
  - 5 sample logos included for easy customization
- New `excerpt` field for posts and pages frontmatter
  - Used for card view descriptions
  - Falls back to description field for posts
- Expanded `siteConfig` in Home.tsx
  - `featuredViewMode`: 'list' or 'cards'
  - `showViewToggle`: enable user toggle
  - `logoGallery`: full configuration object

### Technical

- New components: `FeaturedCards.tsx`, `LogoMarquee.tsx`
- Updated schema with optional excerpt field
- Updated sync script to parse excerpt from frontmatter
- CSS uses theme variables for all four themes
- Mobile responsive grid (3 to 2 to 1 columns for cards)

## [1.3.0] - 2025-12-17

### Added

- Real-time search with Command+K keyboard shortcut
  - Search icon in top nav using Phosphor Icons
  - Modal with keyboard navigation (arrow keys, Enter, Escape)
  - Full text search across posts and pages using Convex search indexes
  - Result snippets with context around search matches
  - Distinguishes between posts and pages with type badges
- Search indexes for pages table (title and content)
- New `@phosphor-icons/react` dependency for search icon

### Technical

- Uses Convex full text search with reactive queries
- Deduplicates results from title and content searches
- Sorts results with title matches first
- Mobile responsive modal design
- All four themes supported (dark, light, tan, cloud)

## [1.2.0] - 2025-12-15

### Added

- Real-time stats page at `/stats` with live visitor tracking
  - Active visitors count with per-page breakdown
  - Total page views and unique visitors
  - Views by page sorted by popularity
- Page view tracking via event records pattern (no write conflicts)
- Active session heartbeat system (30s interval, 2min timeout)
- Cron job for stale session cleanup every 5 minutes
- New Convex tables: `pageViews` and `activeSessions`
- Stats link in homepage footer

### Technical

- Uses anonymous session UUIDs (no PII stored)
- All stats update in real-time via Convex subscriptions
- Mobile responsive stats grid (4 to 2 to 1 columns)
- Theme support with CSS variables (dark, light, tan, cloud)

## [1.1.0] - 2025-12-14

### Added

- Netlify Edge Functions for dynamic Convex HTTP proxying
  - `rss.ts` proxies `/rss.xml` and `/rss-full.xml`
  - `sitemap.ts` proxies `/sitemap.xml`
  - `api.ts` proxies `/api/posts` and `/api/post`
- Vite dev server proxy for RSS, sitemap, and API endpoints

### Changed

- Replaced hardcoded Convex URLs in netlify.toml with edge functions
- Edge functions dynamically read `VITE_CONVEX_URL` from environment
- Updated setup guide, docs, and README with edge function documentation

### Fixed

- RSS feeds and sitemap now work without manual URL configuration
- Local development properly proxies API routes to Convex

## [1.0.0] - 2025-12-14

### Added

- Initial project setup with Vite, React, TypeScript
- Convex backend with posts, pages, viewCounts, and siteConfig tables
- Markdown blog post support with frontmatter parsing
- Static pages support (About, Projects, Contact) with navigation
- Four theme options: Dark, Light, Tan (default), Cloud
- Font configuration option in global.css with serif (New York) as default
- Syntax highlighting for code blocks using custom Prism themes
- Year-grouped post list on home page
- Individual post pages with share buttons
- SEO optimization with dynamic sitemap at `/sitemap.xml`
- JSON-LD structured data injection for blog posts
- RSS feeds at `/rss.xml` and `/rss-full.xml` (full content for LLMs)
- AI agent discovery with `llms.txt` following llmstxt.org standard
- `robots.txt` with rules for AI crawlers
- API endpoints for LLM access:
  - `/api/posts` - JSON list of all posts
  - `/api/post?slug=xxx` - Single post as JSON or markdown
- Copy Page dropdown for sharing to ChatGPT, Claude
- Open Graph and Twitter Card meta tags
- Netlify edge function for social media crawler detection
- Build-time markdown sync from `content/blog/` to Convex
- Responsive design for mobile, tablet, and desktop

### Security

- All HTTP endpoints properly escape HTML and XML output
- Convex queries use indexed lookups
- External links use rel="noopener noreferrer"
- No console statements in production code

### Technical Details

- React 18 with TypeScript
- Convex for real-time database
- react-markdown for rendering
- react-syntax-highlighter for code blocks
- date-fns for date formatting
- lucide-react for icons
- Netlify deployment with edge functions
- SPA 404 fallback configured
