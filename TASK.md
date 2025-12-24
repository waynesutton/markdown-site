# Markdown Blog - Tasks

## To Do

- [ ] Newsletter signup
- [ ] Comments system
- [ ] Draft preview mode

## Current Status

v1.26.0 ready. Added tag pages, related posts, and re-enabled AI service links using GitHub raw URLs.

## Completed

- [x] Tag pages at `/tags/[tag]` route with view mode toggle
- [x] Related posts component for blog post footers (up to 3 related posts by shared tags)
- [x] Tag links in post footers now navigate to tag archive pages
- [x] Open in AI links (ChatGPT, Claude, Perplexity) re-enabled using GitHub raw URLs
- [x] `gitHubRepo` configuration in siteConfig.ts for AI service URL construction
- [x] `by_tags` index added to posts table in convex/schema.ts
- [x] New Convex queries: `getAllTags`, `getPostsByTag`, `getRelatedPosts`
- [x] Sitemap updated to include dynamically generated tag pages
- [x] Documentation updated with git push requirement for AI links
- [x] Mobile responsive styling for tag pages and related posts
- [x] Fixed sidebar border width consistency using box-shadow instead of border-right
- [x] Hidden sidebar scrollbar while maintaining scroll functionality
- [x] Added top border and border-radius to sidebar wrapper using CSS variables
- [x] Updated CSS documentation for sidebar border implementation
- [x] Fixed mobile menu breakpoint to match sidebar hide breakpoint (1024px)
- [x] Mobile hamburger menu now shows whenever sidebar is hidden
- [x] add MIT Licensed. Do whatevs.
- [x] Blog page view mode toggle (list and card views)
- [x] Post cards component with thumbnails, titles, excerpts, and metadata
- [x] View preference saved to localStorage
- [x] Default view mode configurable in siteConfig.blogPage.viewMode
- [x] Toggle visibility controlled by siteConfig.blogPage.showViewToggle
- [x] Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- [x] Theme-aware styling for all four themes
- [x] Raw markdown files now accessible to AI crawlers (ChatGPT, Perplexity)
- [x] Added /raw/ path bypass in botMeta edge function
- [x] Sitemap now includes static pages (about, docs, contact, etc.)
- [x] Security headers added to netlify.toml
- [x] Link header pointing to llms.txt for AI discovery
- [x] Preconnect hints for Convex backend
- [x] Fixed URL consistency in openapi.yaml and robots.txt
- [x] Write conflict prevention: increased dedup windows, added heartbeat jitter
- [x] Visitor map styling: removed box-shadow, increased land dot contrast and opacity
- [x] Real-time visitor map on stats page showing live visitor locations
- [x] Netlify edge function for geo detection (geo.ts)
- [x] VisitorMap component with dotted world map and pulsing dots
- [x] Theme-aware colors for all four themes (dark, light, tan, cloud)
- [x] visitorMap config option in siteConfig.ts to enable/disable
- [x] Privacy friendly: no IP addresses stored, only city/country/coordinates
- [x] Documentation updated: setup-guide, docs, FORK_CONFIG, fork-config.json.example

- [x] Author display for posts and pages with authorName and authorImage frontmatter fields
- [x] Round avatar image displayed next to date and read time on post/page views
- [x] Write page updated with new frontmatter field reference
- [x] Documentation updated: setup-guide.md, docs.md, files.md, README.md, AGENTS.md
- [x] PRD created: prds/howto-Frontmatter.md with reusable prompt for future updates
- [x] GitHub Stars card on Stats page with live count from repository

- [x] CopyPageDropdown AI services now use raw markdown URLs for better AI parsing
- [x] ChatGPT, Claude, and Perplexity receive /raw/{slug}.md URLs instead of page URLs
- [x] Automated fork configuration with npm run configure
- [x] FORK_CONFIG.md comprehensive guide with two options (automated + manual)
- [x] fork-config.json.example template with all configuration options
- [x] scripts/configure-fork.ts for automated updates
- [x] Updates all 11 configuration files in one command

- [x] GitHub contributions graph on homepage with theme-aware colors
- [x] Year navigation with Phosphor icons (CaretLeft, CaretRight)
- [x] Click graph to visit GitHub profile
- [x] Configurable via siteConfig.gitHubContributions
- [x] Theme-specific contribution colors for all 4 themes
- [x] Mobile responsive design with scaled cells

- [x] Public /write page with three-column layout (not linked in nav)
- [x] Left sidebar: Home link, content type selector, actions (Clear, Theme, Font)
- [x] Center: Writing area with Copy All button and borderless textarea
- [x] Right sidebar: Frontmatter reference with per-field copy buttons
- [x] Font switcher to toggle between Serif and Sans-serif fonts
- [x] Font preference persistence in localStorage
- [x] Theme toggle icons matching ThemeToggle.tsx (Moon, Sun, Half2Icon, Cloud)
- [x] Content type switching (Blog Post/Page) updates writing area template
- [x] Word, line, and character counts in status bar
- [x] Warning banner about refresh losing content
- [x] localStorage persistence for content, type, and font
- [x] Redesign /write page with three-column Cursor docs-style layout
- [x] Add per-field copy icons to frontmatter reference panel
- [x] Add refresh warning message in left sidebar
- [x] Left sidebar with home link, content type selector, and actions
- [x] Right sidebar with frontmatter fields and copy buttons
- [x] Center area with title, Copy All button, and borderless textarea
- [x] Theme toggle with matching icons for all four themes
- [x] Redesign /write page with wider layout and modern Notion-like UI
- [x] Remove header from /write page (standalone writing experience)
- [x] Add inline theme toggle and home link to Write page toolbar
- [x] Collapsible frontmatter fields panel
- [x] Add markdown write page with copy option at /write
- [x] Centralized font-size CSS variables in global.css
- [x] Base size scale with semantic naming (3xs to hero)
- [x] Component-specific font-size variables
- [x] Mobile responsive font-size overrides
- [x] Open Graph image fix for posts and pages with frontmatter images
- [x] Dedicated blog page with configurable display options
- [x] Blog page navigation order via siteConfig.blogPage.order
- [x] Centralized siteConfig.ts for site configuration
- [x] Posts display toggle for homepage and/or blog page
- [x] move home to the top of the mobile menu
- [x] Fork configuration documentation in docs.md and setup-guide.md
- [x] "Files to Update When Forking" section with all 9 configuration files
- [x] Backend configuration examples for Convex files
- [x] Site branding updates across all AI discovery files
- [x] Fork documentation added to README.md
- [x] Blog post updated with v1.9.0 and v1.10.0 features
- [x] Scroll-to-top button with configurable threshold
- [x] Scroll-to-top documentation in docs.md and setup-guide.md
- [x] Mobile menu with hamburger navigation for mobile and tablet
- [x] Generate Skill feature in CopyPageDropdown
- [x] Project setup with Vite + React + TypeScript
- [x] Convex schema for posts, viewCounts, siteConfig, pages
- [x] Build-time markdown sync script
- [x] Theme system (dark/light/tan/cloud)
- [x] Default theme configuration (tan)
- [x] Home page with year-grouped post list
- [x] Post page with markdown rendering
- [x] Static pages support (About, Projects, Contact)
- [x] Syntax highlighting for code blocks
- [x] Open Graph and Twitter Card meta tags
- [x] Netlify edge function for bot detection
- [x] RSS feed support (standard and full content)
- [x] API endpoints for LLMs (/api/posts, /api/post)
- [x] Copy Page dropdown for AI tools
- [x] Sample blog posts and pages
- [x] Security audit completed
- [x] TypeScript type-safety verification
- [x] Netlify build configuration verified
- [x] SPA 404 fallback configured
- [x] Mobile responsive design
- [x] Edge functions for dynamic Convex HTTP proxying
- [x] Vite dev server proxy for local development
- [x] Real-time stats page at /stats
- [x] Page view tracking with event records pattern
- [x] Active session heartbeat system
- [x] Cron job for stale session cleanup
- [x] Stats link in homepage footer
- [x] Real-time search with Command+K shortcut
- [x] Search modal with keyboard navigation
- [x] Full text search indexes for posts and pages
- [x] Featured section with list/card view toggle
- [x] Logo gallery with continuous marquee scroll
- [x] Frontmatter-controlled featured items (featured, featuredOrder)
- [x] Featured items sync with npm run sync (no redeploy needed)
- [x] Firecrawl content importer (npm run import)
- [x] /api/export endpoint for batch content fetching
- [x] AI plugin discovery at /.well-known/ai-plugin.json
- [x] OpenAPI 3.0 spec at /openapi.yaml
- [x] AGENTS.md for AI coding agents
- [x] Static raw markdown files at /raw/{slug}.md
- [x] View as Markdown option in CopyPageDropdown
- [x] Perplexity added to AI service options
- [x] Featured image support with square thumbnails in card view
- [x] Improved markdown table CSS styling
- [x] Aggregate component integration for efficient stats counting (O(log n) vs O(n))
- [x] Three aggregate components: pageViewsByPath, totalPageViews, uniqueVisitors
- [x] Chunked backfilling mutation for existing page view data
- [x] Aggregate component registration in convex.config.ts
- [x] Stats query updated to use aggregate counts
- [x] Aggregate component documentation in prds/howstatsworks.md
- [x] Sidebar navigation anchor links fixed for collapsed/expanded sections
- [x] Navigation scroll calculation with proper header offset (80px)
- [x] Expand ancestors before scrolling to ensure target visibility
- [x] Removed auto-expand from scroll handler to preserve manual collapse state
- [x] Collapse button event handling improved to prevent link navigation
- [x] Heading extraction updated to filter out code blocks
- [x] Sidebar no longer shows example headings from markdown code examples
- [x] Mobile menu redesigned with left-aligned navigation controls
- [x] Hamburger menu order changed (hamburger, search, theme toggle)
- [x] Sidebar table of contents integrated into mobile menu
- [x] Desktop sidebar hidden on mobile when sidebar layout is enabled
- [x] SidebarContext created to share sidebar data between components
- [x] Mobile menu typography standardized with CSS variables
- [x] Font-family standardized using inherit for consistency
- [x] `showInNav` field for pages to control navigation visibility
- [x] Pages can be published but hidden from navigation menu
- [x] Defaults to `true` for backwards compatibility
- [x] Pages with `showInNav: false` remain accessible via direct URL, searchable, and available via API
- [x] Hardcoded navigation items configuration in siteConfig.ts
- [x] Add React route pages (like /stats, /write) to navigation via hardcodedNavItems
- [x] Configure navigation order, title, and visibility per route
- [x] Navigation combines Blog link, hardcoded nav items, and markdown pages
- [x] All nav items sorted by order field (lower = first)

## Deployment Steps

1. Run `npx convex dev` to initialize Convex
2. Set `CONVEX_DEPLOY_KEY` in Netlify environment variables
3. Connect repo to Netlify and deploy
4. Edge functions automatically handle RSS, sitemap, and API routes

## Someday Features TBD

- [ ] Newsletter signup
- [ ] Comments system
- [ ] Draft preview mode
