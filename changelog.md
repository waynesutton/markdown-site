# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
