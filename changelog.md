# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.19.0] - 2026-01-10

### Added

- `npx create-markdown-sync` CLI for scaffolding new projects
  - Interactive wizard with 13 sections covering all configuration options
  - Clones template from GitHub via giget
  - Configures site settings automatically
  - Installs dependencies
  - Sets up Convex project (optional WorkOS auth disabled by default)
  - Starts dev server and opens browser
  - Clear next steps with docs, deployment, and WorkOS setup links

### Technical

- New `packages/create-markdown-sync/` monorepo package
- CLI files: index.ts, wizard.ts, clone.ts, configure.ts, install.ts, convex-setup.ts, utils.ts
- Template fixes for siteConfig.ts embedded quotes
- Empty auth.config.ts when auth not required (prevents WorkOS blocking)
- Added workspaces to root package.json
- Updated .gitignore for packages/*/dist/ and packages/*/node_modules/

## [2.18.2] - 2026-01-10

### Added

- Related posts thumbnail view with toggle
  - New thumbnail view shows post image, title, description, author, and date
  - Toggle button to switch between thumbnail and list views (same icons as homepage featured)
  - View preference saved to localStorage
  - Default view mode and toggle visibility configurable via siteConfig.relatedPosts
  - Dashboard Config section for related posts settings

### Changed

- Updated getRelatedPosts query to return image, excerpt, authorName, authorImage fields
- Related posts section now has header with title and optional toggle button

### Technical

- Added `RelatedPostsConfig` interface to siteConfig.ts
- Added `relatedPosts` configuration to SiteConfig interface
- Updated convex/posts.ts getRelatedPosts query with additional return fields
- Added related posts thumbnail CSS styles (~100 lines)
- Added relatedPostsDefaultViewMode and relatedPostsShowViewToggle to Dashboard ConfigSection

## [2.18.1] - 2026-01-10

### Changed

- README.md streamlined from 609 lines to 155 lines
  - Removed detailed feature documentation (now links to live docs)
  - Kept sync commands, setup, and Netlify deployment sections
  - Added Documentation section with links to markdown.fast/docs
  - Added Guides subsection with links to specific doc pages
  - Simplified Features section with link to About page
  - Simplified Fork Configuration to quick commands with doc link

## [2.18.0] - 2026-01-10

### Added

- OpenCode AI development tool integration
  - Full `.opencode/` directory structure for OpenCode CLI compatibility
  - 3 specialized agents: orchestrator, content-writer, sync-manager
  - 6 commands: /sync, /sync-prod, /create-post, /create-page, /import, /deploy
  - 4 skills: frontmatter, sync, convex, content
  - sync-helper plugin for content change reminders
  - Works alongside Claude Code and Cursor without conflicts

- OpenCode documentation page at /docs-opencode
  - How OpenCode integration works
  - Directory structure reference
  - Command and agent descriptions
  - Getting started guide

### Technical

- `opencode.json` - Root OpenCode project configuration
- `.opencode/config.json` - OpenCode app configuration
- `.opencode/agent/orchestrator.md` - Main routing agent
- `.opencode/agent/content-writer.md` - Content creation specialist
- `.opencode/agent/sync-manager.md` - Sync and deployment specialist
- `.opencode/command/sync.md` - /sync command definition
- `.opencode/command/sync-prod.md` - /sync-prod command
- `.opencode/command/create-post.md` - /create-post command
- `.opencode/command/create-page.md` - /create-page command
- `.opencode/command/import.md` - /import command
- `.opencode/command/deploy.md` - /deploy command
- `.opencode/skill/frontmatter.md` - Frontmatter reference (adapted from .claude/skills/)
- `.opencode/skill/sync.md` - Sync system reference
- `.opencode/skill/convex.md` - Convex patterns reference
- `.opencode/skill/content.md` - Content management guide
- `.opencode/plugin/sync-helper.ts` - Minimal reminder plugin
- `content/pages/docs-opencode.md` - Documentation page
- `files.md` - Added OpenCode Configuration section

## [2.17.0] - 2026-01-10

### Added

- ConvexFS Media Library with Bunny CDN integration
  - Upload images via drag-and-drop or click to upload
  - Copy as Markdown, HTML, or direct URL
  - Bulk select and delete multiple images
  - File size display and pagination
  - Configuration warning when Bunny CDN not configured

- Enhanced Image Insert Modal in Write Post/Page
  - Two tabs: "Upload New" and "Media Library" for selecting existing images
  - Image dimensions display (original size with aspect ratio)
  - Size presets: Original, Large (1200px), Medium (800px), Small (400px), Thumbnail (200px), Custom
  - Custom dimensions input with automatic aspect ratio preservation
  - Alt text field for accessibility
  - Calculated dimensions shown before insert

- File expiration support via ConvexFS
  - `setFileExpiration` action to set time-based auto-deletion
  - Pass `expiresInMs` for automatic cleanup after specified time
  - Pass `null` to remove expiration and make file permanent

### Technical

- `convex/convex.config.ts` - Added ConvexFS component registration
- `convex/fs.ts` - ConvexFS instance with Bunny CDN configuration, conditional instantiation
- `convex/files.ts` - File mutations/queries: commitFile, listFiles, deleteFile, deleteFiles, setFileExpiration, isConfigured
- `convex/http.ts` - ConvexFS routes for /fs/upload and /fs/blobs/{blobId}
- `src/components/MediaLibrary.tsx` - Media library gallery with bulk select/delete
- `src/components/ImageUploadModal.tsx` - Enhanced modal with library selection and size presets
- `src/styles/global.css` - Added ~400 lines for media library and image modal styles
- `content/pages/docs-media-setup.md` - Setup documentation with ConvexFS links

## [2.16.4] - 2026-01-10

### Added

- AI image generation download and copy options
  - Download button to save generated image to computer
  - MD button to copy Markdown code (`![prompt](url)`) to clipboard
  - HTML button to copy HTML code (`<img src="url" alt="prompt" />`) to clipboard
  - Code preview section showing both Markdown and HTML snippets
  - Filename generated from prompt (sanitized and truncated)

### Technical

- `src/pages/Dashboard.tsx` - Added copiedFormat state, getMarkdownCode/getHtmlCode helpers, handleCopyCode, handleDownloadImage functions, updated generated image display JSX
- `src/styles/global.css` - Added CSS for .ai-image-actions, .ai-image-action-btn, .ai-image-code-preview, .ai-image-code-block

## [2.16.3] - 2026-01-10

### Added

- Social icons in hamburger menu (MobileMenu)
  - Social icons now appear below navigation links in mobile menu
  - Only shows when `socialFooter.enabled` and `socialFooter.showInHeader` are true
  - Imported `platformIcons` from SocialFooter for consistent icon rendering

- Dashboard Config options for social and AI features
  - Added `socialFooter.showInHeader` toggle to Social Footer config card
  - Added new Ask AI config card with `askAI.enabled` toggle
  - Generated siteConfig.ts includes both new options

- Configuration alignment documentation for AI/LLMs
  - Added "Configuration alignment" section to CLAUDE.md
  - Added sync comment to top of `src/config/siteConfig.ts`
  - Added JSDoc comment to ConfigSection in Dashboard.tsx
  - Explains relationship between siteConfig.ts and Dashboard Config

### Changed

- Removed social icons from mobile header
  - Social icons no longer display in `mobile-nav-controls` (header on mobile)
  - Social icons now exclusively in hamburger menu for cleaner mobile header
  - Added comment in Layout.tsx noting social icons are in MobileMenu

### Technical

- `src/components/MobileMenu.tsx` - Added social icons section with platformIcons import
- `src/components/Layout.tsx` - Removed social icons from mobile-nav-controls
- `src/pages/Dashboard.tsx` - Added socialFooterShowInHeader and askAIEnabled to ConfigSection
- `src/styles/global.css` - Added mobile-menu-social CSS styles
- `src/config/siteConfig.ts` - Added alignment comment header
- `CLAUDE.md` - Added Configuration alignment section and Dashboard.tsx to key files

## [2.16.2] - 2026-01-10

### Added

- Ask AI configuration documentation alignment
  - Added `askAI` config to `fork-config.json.example` with enabled, defaultModel, and models fields
  - Added Ask AI Configuration section to `FORK_CONFIG.md` with fork-config.json and manual configuration examples
  - Added Ask AI (header chat) section to `docs-dashboard.md` with configuration and requirements
  - Added Ask AI (header chat) section to `how-to-use-the-markdown-sync-dashboard.md` with step-by-step setup

### Technical

- `fork-config.json.example` now includes askAI config matching siteConfig.ts structure
- All dashboard documentation now includes Ask AI feature alongside AI Agent and AI Dashboard sections

## [2.16.1] - 2026-01-10

### Fixed

- Docs layout scrollbar hiding for cleaner UI
  - Hidden scrollbars on left sidebar, right sidebar, and main docs content
  - Scrolling still works via trackpad, mouse wheel, and touch
  - Added `body:has(.docs-layout)` to prevent page-level scrolling on docs pages
  - Cross-browser support: `-ms-overflow-style: none` (IE/Edge), `scrollbar-width: none` (Firefox), `::-webkit-scrollbar { width: 0 }` (Chrome/Safari)

### Technical

- Updated `src/styles/global.css`:
  - Added `body:has(.docs-layout) { overflow: hidden; }` rule
  - Added scrollbar hiding rules for `.docs-sidebar-left`, `.docs-sidebar-right`, `.docs-content`
  - Existing scrollbar thumb/track styles remain but are invisible with width: 0

## [2.16.0] - 2026-01-09

### Added

- Sync version control system
  - 3-day version history for posts, pages, home content, and footer
  - Dashboard toggle to enable/disable version control
  - Version history modal with unified diff visualization using DiffCodeBlock component
  - Preview mode to view previous version content
  - One-click restore with automatic backup of current state
  - Automatic cleanup of versions older than 3 days (daily cron at 3 AM UTC)
  - Version stats display in Config section (total, posts, pages)

### Technical

- New `convex/versions.ts` with 7 functions:
  - `isEnabled` / `setEnabled` - Toggle version control
  - `createVersion` - Capture content snapshot (internal mutation)
  - `getVersionHistory` / `getVersion` - Query version data
  - `restoreVersion` - Restore with backup creation
  - `cleanupOldVersions` - Batch delete old versions
  - `getStats` - Version count statistics
- New `contentVersions` table in schema with indexes:
  - `by_content` - Query by content type and ID
  - `by_slug` - Query by content type and slug
  - `by_createdAt` - For cleanup queries
  - `by_content_createdAt` - Compound index for history
- New `versionControlSettings` table for toggle state
- New `src/components/VersionHistoryModal.tsx` component
- Updated `convex/cms.ts` to capture versions before dashboard edits
- Updated `convex/posts.ts` to capture versions before sync updates
- Updated `convex/pages.ts` to capture versions before sync updates
- Updated `convex/crons.ts` with daily cleanup job
- Added ~370 lines of CSS for version modal UI

## [2.15.3] - 2026-01-09

### Fixed

- Footer not displaying on `/docs` landing page when `showFooter: true` in frontmatter
  - `DocsPage.tsx` was missing the Footer component entirely
  - Added Footer import, footerPage query, and footer rendering logic to DocsPage.tsx
  - Footer now respects `showFooter` frontmatter field on docs landing pages
  - AI chat support added to DocsLayout via `aiChatEnabled` and `pageContent` props

### Changed

- Updated `getDocsLandingPage` query in `convex/pages.ts` to return `showFooter`, `footer`, `excerpt`, and `aiChat` fields
- Updated `getDocsLandingPost` query in `convex/posts.ts` to return `showFooter`, `footer`, and `aiChat` fields

## [2.15.2] - 2026-01-08

### Fixed

- Docs section layout CSS conflict with main-content container
  - Fixed `.main-content` max-width: 800px constraint preventing docs layout from being full width
  - Added `.main-content:has(.docs-layout)` rule to expand to 100% width when docs layout is used
  - Updated Layout.tsx to use `main-content-wide` class for docs pages
  - Fixed left sidebar not flush left and right sidebar not flush right
  - Fixed responsive margins for docs layout (280px desktop, 240px tablet, 0 mobile)

### Technical

- Updated `src/styles/global.css`:
  - Added `.main-content:has(.docs-layout) { max-width: 100%; padding: 0; }`
  - Fixed `.docs-content` margins: 280px left/right for fixed sidebars
  - Added responsive margin adjustments at 1200px, 900px, 768px breakpoints
- Updated `src/components/Layout.tsx`:
  - Added `isDocsPage` check to className logic for main element
  - Docs pages now use `main-content-wide` class for full width layout

## [2.15.1] - 2026-01-08

### Fixed

- Additional Core Web Vitals improvements for CLS and INP
  - Added `aspect-ratio: 16/10` to `.blog-image` to reserve space before images load
  - Added `aspect-ratio: 16/9` to `.post-header-image-img` to prevent layout shift
  - Added `contain: layout style` to `.main-content` and `.main-content-wide` to isolate layout recalculations
  - Added `fetchPriority="high"` to logo image for faster LCP
  - Added `fetchPriority="high"` to header images (`showImageAtTop`) for faster LCP
  - Added `will-change: transform` to continuous spin animations (`.spinner-icon`, `.animate-spin`, `.ai-chat-spinner`, `.ai-image-spinner`, `.spinning`, `.dashboard-import-btn .spin`)
  - Added `will-change: transform` to `.logo-marquee-track` for smoother marquee animation
  - Added `will-change: opacity` to `.visitor-map-badge-dot` for smoother pulse animation

### Technical

- Updated `src/styles/global.css` with CLS prevention and animation optimization
- Updated `src/components/Layout.tsx` with fetchPriority on logo
- Updated `src/pages/Post.tsx` with fetchPriority on header images

## [2.15.0] - 2026-01-07

### Added

- Export as PDF option in CopyPageDropdown
  - Browser-based print dialog for saving pages as PDF
  - Clean formatted output (no markdown syntax visible)
  - Title displayed as proper heading
  - Metadata shown as clean line (date, read time, tags)
  - Content with markdown stripped for readable document
  - Uses Phosphor FilePdf icon
  - Positioned at end of dropdown menu

### Technical

- Added `formatForPrint` function to strip markdown syntax from content
- Added `handleExportPDF` handler with styled print window
- Imports `FilePdf` from `@phosphor-icons/react` (already installed)

## [2.14.1] - 2026-01-07

### Fixed

- Additional Core Web Vitals animation fixes
  - Fixed `docs-skeleton-pulse` animation (converted from `background-position` to `transform: translateX()` via pseudo-element)
  - Added `will-change` hints to 6 more animated elements for GPU compositing

### Technical

- Updated `src/styles/global.css`:
  - Converted docs-loading-skeleton from background animation to pseudo-element with translateX
  - Added `will-change` to `.image-lightbox-backdrop`, `.search-modal`, `.ai-chat-message`, `.dashboard-toast`, `.ask-ai-modal`, `.docs-article`

## [2.14.0] - 2026-01-07

### Fixed

- Core Web Vitals performance optimizations
  - Fixed non-composited animations in visitor map (SVG `r` attribute changed to `transform: scale()`)
  - Removed 5 duplicate `@keyframes spin` definitions from global.css
  - Added `will-change` hints to animated elements for GPU compositing

### Added

- Critical CSS inlined in index.html for faster first paint
  - Theme variables (dark/light/tan/cloud)
  - Reset and base body styles
  - Layout skeleton and navigation styles
- Additional resource hints in index.html
  - Preconnect to convex.site for faster API calls

### Technical

- Updated `src/styles/global.css`:
  - Converted visitor-pulse animations from SVG `r` to `transform: scale()` (GPU-composited)
  - Added `transform-origin`, `transform-box`, and `will-change` to pulse ring elements
  - Added `will-change` to `.theme-toggle`, `.copy-page-menu`, `.search-modal-backdrop`, `.scroll-to-top`
  - Removed duplicate `@keyframes spin` at lines 9194, 10091, 10243, 10651, 13726
- Updated `src/components/VisitorMap.tsx`:
  - Changed pulse ring `r` values from 12/8 to base value 5 (scaling handled by CSS)
- Updated `index.html`:
  - Added inline critical CSS (~2KB) for instant first contentful paint
  - Added preconnect/dns-prefetch for convex.site

## [2.13.0] - 2026-01-07

### Added

- Enhanced diff code block rendering with @pierre/diffs library
  - Diff and patch code blocks now render with Shiki-based syntax highlighting
  - Unified and split (side-by-side) view modes with toggle button
  - Theme-aware colors (dark/light/tan/cloud support)
  - Copy button for diff content
  - Automatic routing: `diff and `patch blocks use enhanced renderer
- New blog post: "How to Use Code Blocks" with syntax highlighting and diff examples
- DiffCodeBlock component (`src/components/DiffCodeBlock.tsx`)

### Technical

- Added `@pierre/diffs` package for enhanced diff visualization
- Updated `BlogPost.tsx` to route diff/patch language blocks to DiffCodeBlock
- Added diff block CSS styles to `global.css`
- Added `vendor-diffs` chunk to Vite config for code splitting
- Updated `files.md` with DiffCodeBlock documentation

## [2.12.0] - 2026-01-07

### Fixed

- Canonical URL mismatch between raw and rendered HTML (GitHub Issue #6)
  - Raw HTML was showing homepage canonical URL instead of page-specific canonical
  - Added search engine bot detection to serve pre-rendered HTML with correct canonical URLs
  - Search engines (Google, Bing, DuckDuckGo, etc.) now receive correct canonical tags in initial HTML

### Added

- SEO Bot Configuration section in FORK_CONFIG.md for developers who fork the app
- SEO and Bot Detection section in setup-guide.md with configuration examples
- `SEARCH_ENGINE_BOTS` array in `netlify/edge-functions/botMeta.ts` for customizable bot detection
- `isSearchEngineBot()` helper function for search engine crawler detection
- Documentation header in botMeta.ts explaining bot detection configuration

### Technical

- Updated `netlify/edge-functions/botMeta.ts`:
  - Added configuration documentation header explaining three bot categories
  - Added SEARCH_ENGINE_BOTS array (googlebot, bingbot, yandexbot, duckduckbot, baiduspider, sogou, yahoo! slurp, applebot)
  - Added isSearchEngineBot() function
  - Updated condition to serve pre-rendered HTML to both social preview and search engine bots

## [2.11.0] - 2026-01-06

### Added

- Ask AI header button with RAG-based Q&A about site content
  - Header button with sparkle icon (before search button, after social icons)
  - Keyboard shortcuts: Cmd+J or Cmd+/ (Mac), Ctrl+J or Ctrl+/ (Windows/Linux)
  - Real-time streaming responses via Convex Persistent Text Streaming
  - Model selector: Claude Sonnet 4 (default) or GPT-4o
  - Markdown rendering with syntax highlighting in responses
  - Internal links use React Router for seamless navigation
  - Source citations with links to referenced posts/pages
  - Copy response button (hover to reveal) for copying AI answers
  - Clear chat button to reset conversation
- AskAIConfig in siteConfig.ts for configuration
  - `enabled`: Toggle Ask AI feature
  - `defaultModel`: Default model ID
  - `models`: Array of available models with id, name, and provider

### How It Works

1. User question stored in database with session ID
2. Query converted to embedding using OpenAI text-embedding-ada-002
3. Vector search finds top 5 relevant posts/pages
4. Content sent to selected AI model with RAG system prompt
5. Response streams in real-time with source citations appended

### Technical

- New component: `src/components/AskAIModal.tsx` with StreamingMessage subcomponent
- New file: `convex/askAI.ts` - Session mutations and queries (regular runtime)
- New file: `convex/askAI.node.ts` - HTTP streaming action (Node.js runtime)
- New table: `askAISessions` with question, streamId, model, createdAt, sources fields
- New HTTP endpoint: `/ask-ai-stream` for streaming responses
- Updated `convex/convex.config.ts` with persistentTextStreaming component
- Updated `convex/http.ts` with /ask-ai-stream route and OPTIONS handler
- Updated `src/components/Layout.tsx` with Ask AI button and modal
- Updated `src/styles/global.css` with Ask AI modal styles

### Requirements

- `semanticSearch.enabled: true` in siteConfig (for embeddings)
- `OPENAI_API_KEY` in Convex (for embedding generation)
- `ANTHROPIC_API_KEY` in Convex (for Claude models)
- Run `npm run sync` to generate embeddings for content

## [2.10.2] - 2026-01-06

### Added

- SEO fixes for GitHub Issue #4 (7 issues resolved)
  - Canonical URL: Client-side dynamic canonical link tags for posts and pages
  - Single H1 per page: Markdown H1s demoted to H2 (`.blog-h1-demoted` class with H1 visual styling)
  - DOM order fix: Article loads before sidebar in DOM for SEO (CSS `order` property maintains visual layout)
  - X-Robots-Tag: HTTP header added via netlify.toml (`index, follow` for public, `noindex` for dashboard/api)
  - Hreflang tags: Self-referencing hreflang (en, x-default) for all pages
  - og:url consistency: Uses same canonicalUrl variable as canonical link
  - twitter:site meta tag: New TwitterConfig in siteConfig.ts for Twitter Cards

### Technical

- New `TwitterConfig` interface in `src/config/siteConfig.ts` with site and creator fields
- Updated `src/pages/Post.tsx` with SEO meta tags for both posts and pages (canonical, hreflang, og:url, twitter)
- Updated `src/pages/Post.tsx` DOM order: article before sidebar with CSS order for visual positioning
- Updated `src/components/BlogPost.tsx` h1 renderer outputs h2 with `.blog-h1-demoted` class
- Updated `src/styles/global.css` with `.blog-h1-demoted` styling and CSS order properties for sidebar
- Updated `convex/http.ts` generateMetaHtml() with hreflang and twitter:site tags
- Updated `netlify.toml` with X-Robots-Tag headers for public, dashboard, and API routes
- Updated `index.html` with canonical, hreflang, and twitter:site placeholder tags
- Updated `fork-config.json.example` with twitter configuration fields

## [2.10.1] - 2026-01-05

### Added

- Optional semantic search configuration via `siteConfig.semanticSearch`
  - New `enabled` toggle (default: `false` to avoid blocking forks without API key)
  - When disabled, search modal shows only keyword search (no mode toggle)
  - Embedding generation skipped during sync when disabled (saves API costs)
  - Existing embeddings preserved in database when disabled (no data loss)
  - Tab key shortcut hints hidden when semantic search is disabled
  - Dashboard config generator includes semantic search toggle

### Technical

- New `SemanticSearchConfig` interface in `src/config/siteConfig.ts`
- Updated `src/components/SearchModal.tsx` to conditionally render mode toggle
- Updated `scripts/sync-posts.ts` to check config before embedding generation
- Updated `src/pages/Dashboard.tsx` with semantic search config option
- Updated `FORK_CONFIG.md` with semantic search configuration section
- Updated `fork-config.json.example` with semanticSearch option
- Updated documentation: `docs-semantic-search.md`, `docs.md`

## [2.10.0] - 2026-01-05

### Added

- Semantic search using vector embeddings to complement existing keyword search
  - Toggle between "Keyword" and "Semantic" modes in search modal (Cmd+K)
  - Keyword search: exact word matching via Convex full-text search indexes (instant, free)
  - Semantic search: finds content by meaning using OpenAI text-embedding-ada-002 embeddings (~300ms, ~$0.0001/query)
  - Similarity scores displayed as percentages (90%+ = very similar, 70-90% = related)
  - Graceful fallback: semantic search returns empty results if OPENAI_API_KEY not configured
- Embedding generation during content sync
  - Embeddings generated automatically for posts and pages during `npm run sync`
  - Title and content combined for embedding generation
  - Content truncated to 8000 characters to stay within token limits
- New documentation pages
  - `docs-search.md`: Keyword search implementation with ASCII flowchart
  - `docs-semantic-search.md`: Semantic search guide with comparison table

### Technical

- New file: `convex/embeddings.ts` - Actions for embedding generation (Node.js runtime)
- New file: `convex/embeddingsQueries.ts` - Queries and mutations for embedding storage
- New file: `convex/semanticSearch.ts` - Vector search action with similarity scoring
- New file: `convex/semanticSearchQueries.ts` - Internal queries for hydrating search results
- Added `embedding` field (optional float64 array) to posts and pages tables in schema
- Added `by_embedding` vector index (1536 dimensions, filterFields: ["published"]) to posts and pages
- Updated `src/components/SearchModal.tsx` with mode toggle (TextAa/Brain icons) and semantic search integration
- Updated `scripts/sync-posts.ts` to call `generateMissingEmbeddings` after content sync
- Added search mode toggle CSS styles (.search-mode-toggle, .search-mode-btn)

### Environment Variables

- `OPENAI_API_KEY`: Required for semantic search (set via `npx convex env set OPENAI_API_KEY sk-xxx`)

## [2.9.0] - 2026-01-04

### Added

- Dashboard Cloud CMS features for WordPress-style content management
  - Dual source architecture: dashboard-created content (`source: "dashboard"`) and synced content (`source: "sync"`) coexist independently
  - Source badges in Posts and Pages list views (blue "Dashboard", gray "Synced")
  - Direct database operations: "Save to DB" button in Write sections, "Save Changes" in editor
  - Delete button for dashboard-created content with confirmation modal
  - Server-side URL import via Firecrawl (direct to database, no file sync needed)
  - Export to markdown functionality for backup or converting to file-based workflow
  - Bulk export script: `npm run export:db` and `npm run export:db:prod`
- Rich Text Editor in Write Post/Page sections
  - Three editing modes: Markdown (default), Rich Text (Quill WYSIWYG), Preview
  - Quill toolbar: headers, bold, italic, strikethrough, blockquote, code, lists, links
  - Automatic HTML-to-Markdown conversion when switching modes
  - Theme-aware styling
- Delete confirmation modal for posts and pages
  - Warning icon and danger-styled delete button
  - Shows item name and type being deleted
  - Backdrop click and Escape key to cancel

### Changed

- Posts and Pages list view grid layout adjusted for source badges
  - Column widths: title (1fr), date (110px), status (170px), actions (110px)
  - Added flex-wrap and gap for status column content
- Sync mutations now preserve dashboard-created content
  - Only affects content with `source: "sync"` or no source field

### Technical

- New file: `convex/cms.ts` with CRUD mutations for dashboard content
- New file: `convex/importAction.ts` with Firecrawl server-side action
- New file: `scripts/export-db-posts.ts` for bulk markdown export
- Added `source` field (optional union: "dashboard" | "sync") to posts and pages tables
- Added `by_source` index to posts and pages tables in schema
- Added ConfirmDeleteModal component with Warning icon from Phosphor
- Added source-badge CSS styles (.source-badge, .source-badge.dashboard, .source-badge.sync)
- Added delete modal styles (.dashboard-modal-delete, .dashboard-modal-icon-warning, .dashboard-modal-btn.danger)

## [2.8.7] - 2026-01-04

### Fixed

- Write page frontmatter sidebar toggle now works outside focus mode
  - Grid layout adjusts properly when frontmatter sidebar is collapsed
  - Previously only worked in focus mode due to missing CSS rules

### Technical

- Added `.write-layout.frontmatter-collapsed` CSS rule (grid-template-columns: 220px 1fr 56px)
- Added `.write-layout.sidebar-collapsed.frontmatter-collapsed` CSS rule for both sidebars collapsed
- Added responsive tablet styles for frontmatter collapsed state

## [2.8.6] - 2026-01-04

### Changed

- Fork configuration script now updates 14 files (was 11)
  - Added `src/pages/DocsPage.tsx` (SITE_URL constant)
  - Added `netlify/edge-functions/mcp.ts` (SITE_URL, SITE_NAME, MCP_SERVER_NAME)
  - Added `scripts/send-newsletter.ts` (default SITE_URL)
  - Improved `public/openapi.yaml` handling for all example URLs
- Logo gallery hrefs now use relative URLs instead of hardcoded markdown.fast URLs
  - Links like `/how-to-use-firecrawl`, `/docs`, `/setup-guide` work on any forked site
- Updated `fork-config.json.example` with missing options (statsPage, mcpServer, imageLightbox)

### Technical

- Updated `scripts/configure-fork.ts` with new update functions: `updateDocsPageTsx()`, `updateMcpEdgeFunction()`, `updateSendNewsletter()`
- Updated `FORK_CONFIG.md` with complete file list and updated AI agent prompt
- Updated `content/blog/fork-configuration-guide.md` with accurate file count and output example

## [2.8.5] - 2026-01-03

### Added

- Search result highlighting and scroll-to-match feature
  - Clicking a search result navigates to the exact match location (not just the heading)
  - All matching text is highlighted with theme-appropriate colors
  - Highlights pulse on arrival, then fade to subtle background after 4 seconds
  - Press Escape to clear highlights
  - Works across all four themes (dark, light, tan, cloud)

### Technical

- Created `src/hooks/useSearchHighlighting.ts` hook with polling mechanism to wait for content load
- Updated `src/components/SearchModal.tsx` to pass search query via `?q=` URL parameter
- Updated `src/components/BlogPost.tsx` with article ref for highlighting
- Updated `src/pages/Post.tsx` to defer scroll handling to highlighting hook when `?q=` present
- Added `.search-highlight` and `.search-highlight-active` CSS styles with theme-specific colors

## [2.8.4] - 2026-01-03

### Changed

- AI service links (ChatGPT, Claude, Perplexity) now use local `/raw/{slug}.md` URLs instead of GitHub raw URLs
- Simplified AI prompt from multi-line instructions to "Read this URL and summarize it:"

### Technical

- Updated `src/components/CopyPageDropdown.tsx` to construct URLs using `window.location.origin`
- Removed unused `siteConfig` import and `getGitHubRawUrl` function

## [2.8.3] - 2026-01-03

### Changed

- `raw/index.md` now includes home.md and footer.md content
  - Home intro content from `content/pages/home.md` (slug: home-intro) displays at top
  - Footer content from `content/pages/footer.md` (slug: footer) displays at bottom
  - Mirrors the actual homepage structure for AI agents reading raw markdown
  - Falls back to generic message if home-intro page not found

### Technical

- Updated `generateHomepageIndex` function in `scripts/sync-posts.ts`
- Finds home-intro and footer pages from published pages array
- Adds horizontal rule separators between sections

## [2.8.2] - 2026-01-03

### Fixed

- Footer not displaying on docs section posts/pages even with `showFooter: true` in frontmatter
  - Post.tsx now fetches footer.md content from Convex (matching Home.tsx and Blog.tsx pattern)
  - Footer falls back to footer.md content when no per-post `footer:` frontmatter is specified
  - Priority order: per-post frontmatter `footer:` field > synced footer.md content > siteConfig.footer.defaultContent

### Technical

- Added `useQuery(api.pages.getPageBySlug, { slug: "footer" })` to Post.tsx
- Updated all 4 Footer component calls to use `post.footer || footerPage?.content` pattern

## [2.8.1] - 2026-01-03

### Changed

- Centralized `defaultTheme` configuration in `siteConfig.ts`
  - Theme is now configured via `defaultTheme` field in siteConfig instead of ThemeContext.tsx
  - ThemeContext.tsx now imports and uses `siteConfig.defaultTheme` with fallback to "tan"
  - Fork configuration script (`configure-fork.ts`) now updates siteConfig.ts for theme changes
  - Backward compatible: existing sites work without changes

### Technical

- Added `Theme` type export to `src/config/siteConfig.ts`
- Added `defaultTheme?: Theme` field to SiteConfig interface
- Updated `src/context/ThemeContext.tsx` to import from siteConfig
- Renamed `updateThemeContext` to `updateThemeConfig` in `scripts/configure-fork.ts`
- Updated documentation: `docs.md`, `setup-guide.md`, `FORK_CONFIG.md`, `fork-configuration-guide.md`

## [2.8.0] - 2026-01-03

### Added

- `docsSectionGroupIcon` frontmatter field for docs sidebar group icons
  - Display Phosphor icons next to docs sidebar group titles
  - Icon appears left of the expand/collapse chevron
  - 55 supported icon names (Rocket, Book, PuzzlePiece, Gear, Code, etc.)
  - Icon weight: regular, size: 16px
  - Only one item per group needs to specify the icon
  - Graceful fallback if icon name not recognized

### Technical

- Updated `convex/schema.ts` to include `docsSectionGroupIcon` field in posts and pages tables
- Updated `convex/posts.ts` and `convex/pages.ts` queries and mutations to handle `docsSectionGroupIcon`
- Updated `scripts/sync-posts.ts` to parse `docsSectionGroupIcon` from frontmatter
- Updated `src/components/DocsSidebar.tsx` with Phosphor icon imports and rendering
- Added CSS styles for `.docs-sidebar-group-icon` in `src/styles/global.css`
- Updated `.claude/skills/frontmatter.md` with icon documentation and supported icon list

## [2.7.0] - 2026-01-02

### Added

- `docsSectionGroupOrder` frontmatter field for controlling docs sidebar group order
  - Groups are sorted by the minimum `docsSectionGroupOrder` value among items in each group
  - Lower numbers appear first, groups without this field sort alphabetically
  - Works alongside `docsSection`, `docsSectionGroup`, and `docsSectionOrder` fields

### Technical

- Updated `convex/schema.ts` to include `docsSectionGroupOrder` field in posts and pages tables
- Updated `convex/posts.ts` and `convex/pages.ts` queries and mutations to handle `docsSectionGroupOrder`
- Updated `scripts/sync-posts.ts` to parse `docsSectionGroupOrder` from frontmatter
- Updated `src/components/DocsSidebar.tsx` to sort groups by `docsSectionGroupOrder`

## [2.6.0] - 2026-01-01

### Added

- Multi-model AI chat support in Dashboard
  - Model dropdown selector to choose between Anthropic (Claude Sonnet 4), OpenAI (GPT-4o), and Google (Gemini 2.0 Flash)
  - Lazy API key validation: errors only shown when user tries to use a specific model
  - Each provider has friendly setup instructions with links to get API keys
- AI Image Generation tab in Dashboard
  - Generate images using Gemini models (Nano Banana and Nano Banana Pro)
  - Aspect ratio selector (1:1, 16:9, 9:16, 4:3, 3:4)
  - Generated images stored in Convex storage with session tracking
  - Markdown-rendered error messages with setup instructions
- New `aiDashboard` configuration in siteConfig
  - `enableImageGeneration`: Toggle image generation tab
  - `defaultTextModel`: Set default AI model for chat
  - `textModels`: Configure available text chat models
  - `imageModels`: Configure available image generation models

### Technical

- Updated `convex/aiChatActions.ts` to support multiple AI providers
  - Added `callAnthropicApi`, `callOpenAIApi`, `callGeminiApi` helper functions
  - Added `getProviderFromModel` to determine provider from model ID
  - Added `getApiKeyForProvider` for lazy API key retrieval
  - Added `getNotConfiguredMessage` for provider-specific setup instructions
- Updated `src/components/AIChatView.tsx` with `selectedModel` prop
- Updated `src/pages/Dashboard.tsx` with new `AIAgentSection`
  - Tab-based UI for Chat and Image Generation
  - Model dropdowns with provider labels
  - Aspect ratio selector for image generation
- Added CSS styles for AI Agent section in `src/styles/global.css`
  - `.ai-agent-tabs`, `.ai-agent-tab` for tab navigation
  - `.ai-model-selector`, `.ai-model-dropdown` for model selection
  - `.ai-aspect-ratio-selector` for aspect ratio options
  - `.ai-generated-image`, `.ai-image-error`, `.ai-image-loading` for image display

### Environment Variables

- `ANTHROPIC_API_KEY`: Required for Claude models
- `OPENAI_API_KEY`: Required for GPT-4o
- `GOOGLE_AI_API_KEY`: Required for Gemini text chat and image generation

## [2.5.0] - 2026-01-01

### Added

- Social footer icons in header navigation
  - New `showInHeader` option in `siteConfig.socialFooter` to display social icons in the header
  - Social icons appear left of the search icon on desktop viewports
  - Uses same icons and links as the social footer component
  - Configurable via siteConfig, FORK_CONFIG.md, and fork-config.json
  - Disabled by default (set `showInHeader: true` to enable)

### Technical

- Exported `platformIcons` from `SocialFooter.tsx` for reuse in Layout component
- Added social icon rendering in `Layout.tsx` header controls
- Added `.header-social-links` and `.header-social-link` CSS styles in `global.css`
- Updated `SocialFooterConfig` interface with `showInHeader: boolean`
- Added socialFooter support to `configure-fork.ts` script
- Updated documentation: FORK_CONFIG.md, fork-config.json.example, docs.md, setup-guide.md

## [2.4.0] - 2026-01-01

### Added

- YouTube and Twitter/X embed support with domain whitelisting
  - Embed YouTube videos and Twitter/X posts directly in markdown
  - Domain whitelisting for security (only trusted domains allowed)
  - Whitelisted domains: `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`, `platform.twitter.com`, `platform.x.com`
  - Auto-adds `sandbox="allow-scripts allow-same-origin allow-popups"` for security
  - Auto-adds `loading="lazy"` for performance
  - Non-whitelisted iframes silently blocked
  - Works on both blog posts and pages
- Embeds section in markdown-with-code-examples.md with YouTube and Twitter/X examples

### Technical

- Added `ALLOWED_IFRAME_DOMAINS` constant in `src/components/BlogPost.tsx`
- Added `iframe` to sanitize schema tagNames with allowed attributes (`src`, `width`, `height`, `allow`, `allowfullscreen`, `frameborder`, `title`, `style`)
- Added custom `iframe` component handler with URL validation against whitelisted domains
- Added `.embed-container` CSS styles to `src/styles/global.css` for responsive embeds

## [2.3.0] - 2025-12-31

### Added

- Author pages at `/author/:authorSlug` with post list
  - Click on any author name in a post to view all their posts
  - View mode toggle (list/cards) with localStorage persistence
  - Mobile responsive layout matching tag pages design
  - Sitemap updated to include all author pages dynamically
- New Convex queries for author data
  - `getAllAuthors`: Returns all unique authors with post counts
  - `getPostsByAuthor`: Returns posts by a specific author slug
- Author name links in post headers
  - Author names now clickable with hover underline effect
  - Works on both blog posts and pages with authorName field

### Technical

- Added `by_authorName` index to posts table in `convex/schema.ts`
- New queries in `convex/posts.ts`: `getAllAuthors`, `getPostsByAuthor`
- New component: `src/pages/AuthorPage.tsx` (based on TagPage.tsx pattern)
- Added route `/author/:authorSlug` in `src/App.tsx`
- Updated `src/pages/Post.tsx` to make authorName a clickable Link
- Added author link and page styles to `src/styles/global.css`
- Added author pages to sitemap in `convex/http.ts`

## [2.2.2] - 2025-12-31

### Fixed

- Homepage intro loading flash
  - Removed "Loading..." text from Suspense fallback in main.tsx to prevent flash on app load
  - Updated Home.tsx to render nothing while homeIntro query loads (prevents bio text flash)
  - Home intro content now appears without any visible loading state or fallback text
  - Matches the same loading pattern used by Post.tsx for docs pages

### Technical

- Updated: `src/main.tsx` - Changed LoadingFallback to render empty div instead of "Loading..." text
- Updated: `src/pages/Home.tsx` - Changed conditional from `homeIntro ?` to `homeIntro === undefined ? null : homeIntro ?`

## [2.2.1] - 2025-12-31

### Fixed

- ES module compatibility for configure-fork.ts
  - Fixed `__dirname is not defined` error when running `npm run configure`
  - Added `fileURLToPath` import from `url` module
  - Created ES module equivalent of `__dirname` using `import.meta.url`
  - Script now works correctly with `"type": "module"` in package.json

### Technical

- Updated: `scripts/configure-fork.ts` - Added ES module compatible \_\_dirname using fileURLToPath

## [2.2.0] - 2025-12-30

### Added

- Footer content via markdown page
  - New `content/pages/footer.md` for managing footer content via markdown sync
  - Footer content syncs with `npm run sync` without redeploy needed
  - Edit footer text, links, and formatting through markdown instead of code
  - Falls back to `siteConfig.footer.defaultContent` when page not found
  - Set `showInNav: false` to hide from navigation (page remains accessible via direct URL)
  - Supports full markdown including links, paragraphs, and line breaks

### Changed

- `src/pages/Home.tsx`: Fetches footer page by slug "footer" and passes content to Footer component
- `src/pages/Blog.tsx`: Fetches footer page by slug "footer" and passes content to Footer component
- Footer component now prioritizes page content over siteConfig.defaultContent

### Technical

- New file: `content/pages/footer.md` with frontmatter (slug: "footer", showInNav: false)
- Uses existing `api.pages.getPageBySlug` query to fetch footer content
- Pattern matches `home-intro` page for consistent content management

## [2.1.0] - 2025-12-30

### Added

- CLAUDE.md for Claude Code project instructions
  - Project context and quick start guide
  - All available npm commands and workflows
  - Code conventions and "do not" list
  - Key file references and project structure
  - Links to detailed skills documentation
- Claude skills documentation in `.claude/skills/` directory
  - `frontmatter.md`: Complete frontmatter syntax with all 25+ field options for posts and pages
  - `convex.md`: Convex patterns specific to this app (indexes, idempotent mutations, write conflict prevention)
  - `sync.md`: How sync commands work and content flow from markdown to Convex database
- Automated CLAUDE.md updates via sync-discovery-files.ts
  - CLAUDE.md status comment updated during `npm run sync:discovery`
  - Includes current site name, post count, page count, and last updated timestamp
- Unlisted posts feature
  - New `unlisted` frontmatter field for blog posts
  - Set `unlisted: true` to hide posts from listings while keeping them accessible via direct link
  - Unlisted posts are excluded from: blog listings, featured sections, tag pages, search results, and related posts
  - Posts remain accessible via direct URL (e.g., `/blog/post-slug`)
  - Useful for draft posts, private content, or posts you want to share via direct link only

### Technical

- New file: `CLAUDE.md` in project root
- New directory: `.claude/skills/` with three markdown files
- Updated: `scripts/sync-discovery-files.ts` to update CLAUDE.md alongside AGENTS.md and llms.txt
- Updated: `convex/schema.ts` - Added `unlisted` optional boolean field to posts table
- Updated: `convex/posts.ts` - All listing queries filter out unlisted posts (getAllPosts, getBlogFeaturedPosts, getFeaturedPosts, getAllTags, getPostsByTag, getRelatedPosts, getRecentPostsInternal)
- Updated: `convex/search.ts` - Search excludes unlisted posts from results
- Updated: `scripts/sync-posts.ts` - Added `unlisted` to PostFrontmatter and ParsedPost interfaces and parsing logic
- Updated: `src/pages/Write.tsx` - Added `unlisted` to POST_FIELDS frontmatter reference
- Updated documentation: `.claude/skills/frontmatter.md`, `content/pages/docs.md`, `content/blog/setup-guide.md`, `files.md`

## [2.0.0] - 2025-12-29

### Added

- Markdown sync v2 complete
  - Full markdown content synchronization system
  - Real-time sync from markdown files to Convex database
  - Dashboard UI for content management
  - Sync server for executing sync commands from UI
  - Complete type safety across all Convex functions
  - Security improvements and optimizations

### Technical

- Optimized `recordPageView` mutation to reduce unnecessary reads
- All mutations follow Convex best practices for write conflict prevention
- Type-safe Convex functions with proper validators
- Security review completed with all endpoints properly secured

## [1.47.0] - 2025-12-29

### Added

- Image lightbox for blog posts and pages
  - Images automatically open in full-screen lightbox when clicked (if enabled)
  - Lightbox includes dark backdrop, close button (X icon), and caption display
  - Keyboard support: Press Escape to close lightbox
  - Click outside image (backdrop) to close
  - Alt text displayed as caption below image in lightbox
  - Images show pointer cursor (`zoom-in`) and subtle hover effect when lightbox is enabled
  - Configurable via `siteConfig.imageLightbox.enabled` (default: `true`)
  - Dashboard config generator includes image lightbox toggle
  - Responsive design: lightbox adapts to mobile screens

### Technical

- New component: `ImageLightbox` in `src/components/BlogPost.tsx`
- New interface: `ImageLightboxConfig` in `src/config/siteConfig.ts`
- Updated: `src/components/BlogPost.tsx` - Added lightbox state management and click handlers
- Updated: `src/styles/global.css` - Added lightbox styles (`.image-lightbox-backdrop`, `.image-lightbox-img`, `.image-lightbox-close`, `.image-lightbox-caption`)
- Updated: `src/pages/Dashboard.tsx` - Added image lightbox configuration option
- Updated: `content/pages/docs.md` - Added image lightbox documentation
- Updated: `content/blog/setup-guide.md` - Added image lightbox documentation

## [1.46.0] - 2025-12-29

### Added

- Dashboard sync server for executing sync commands from UI
  - Local HTTP server (`scripts/sync-server.ts`) runs on localhost:3001
  - Execute sync commands directly from dashboard without opening terminal
  - Real-time output streaming in dashboard terminal view
  - Server status indicator (online/offline) in dashboard sync section
  - Copy and Execute buttons for each sync command
  - Optional token authentication via `SYNC_TOKEN` environment variable
  - Whitelisted commands only (sync, sync:prod, sync:discovery, sync:discovery:prod, sync:all, sync:all:prod)
  - Health check endpoint at `/health` for server availability
  - CORS enabled for localhost:5173 (dev server)
  - Header sync buttons use sync server when available, fallback to command modal
  - Copy icons for `npm run sync-server` command in dashboard sync settings

### Technical

- New file: `scripts/sync-server.ts` - Local HTTP server using Node.js http module
- New npm script: `sync-server` - Start the local sync server
- Updated: `src/pages/Dashboard.tsx` - Sync server integration with health checks, execute functionality, and terminal output display
- Updated: `src/styles/global.css` - Styles for sync server status, terminal output, and copy buttons

## [1.45.0] - 2025-12-29

### Added

- Dashboard and WorkOS authentication integration
  - Dashboard supports optional WorkOS authentication via `siteConfig.dashboard.requireAuth`
  - WorkOS is optional - dashboard works with or without WorkOS configured
  - When `requireAuth` is `false`, dashboard is open access
  - When `requireAuth` is `true` and WorkOS is configured, dashboard requires login
  - Shows setup instructions if `requireAuth` is `true` but WorkOS is not configured
  - Warning banner displayed when authentication is not enabled
- Blog posts
  - "How to use the Markdown sync dashboard" - Complete guide to dashboard features and usage
  - "How to setup WorkOS" - Step-by-step WorkOS AuthKit setup guide
- Documentation updates
  - README.md: Added dashboard and WorkOS section with links to blog posts
  - docs.md: Added dashboard and WorkOS authentication sections
  - setup-guide.md: Added dashboard and WorkOS authentication sections
  - FORK_CONFIG.md: Added dashboard configuration information
  - fork-config.json.example: Added dashboard configuration option
  - files.md: Updated with dashboard and WorkOS file descriptions

### Technical

- New file: `src/utils/workos.ts` - WorkOS configuration utility
- Updated: `src/main.tsx` - Conditional WorkOS providers with lazy loading
- Updated: `src/App.tsx` - Callback route handling for WorkOS OAuth
- Updated: `src/pages/Dashboard.tsx` - Optional WorkOS authentication integration
- Updated: `src/pages/Callback.tsx` - OAuth callback handler for WorkOS
- Updated: `convex/auth.config.ts` - Convex authentication configuration for WorkOS
- Updated: `src/config/siteConfig.ts` - Dashboard configuration with requireAuth option

## [1.44.0] - 2025-12-29

### Added

- Dashboard at `/dashboard` for centralized content management and site configuration
  - Content management: Posts and Pages list views with filtering, search, pagination, and items per page selector (15, 25, 50, 100)
  - Post and Page editor: Markdown editor with live preview, draggable/resizable frontmatter sidebar (200px-600px), independent scrolling, download markdown, copy to clipboard
  - Write Post and Write Page: Full-screen writing interface with markdown editor, frontmatter reference, download markdown, localStorage persistence
  - AI Agent section: Dedicated AI chat separate from Write page, uses Anthropic Claude API, per-session chat history, markdown rendering
  - Newsletter management: All Newsletter Admin features integrated (subscribers, send newsletter, write email, recent sends, email stats)
  - Content import: Firecrawl import UI for importing external URLs as markdown drafts
  - Site configuration: Config Generator UI for all `siteConfig.ts` settings, generates downloadable config file
  - Index HTML editor: View and edit `index.html` content with meta tags, Open Graph, Twitter Cards, JSON-LD
  - Analytics: Real-time stats dashboard (clone of `/stats` page, always accessible in dashboard)
  - Sync commands: UI with buttons for all sync operations (sync, sync:discovery, sync:all for dev and prod)
  - Header sync buttons: Quick sync buttons in dashboard header for `npm run sync:all` (dev and prod)
  - Dashboard search: Search bar in header to search dashboard features, page titles, and post content
  - Toast notifications: Success, error, info, and warning notifications with auto-dismiss
  - Command modal: Shows sync command output with copy to clipboard functionality
  - Mobile responsive: Fully responsive design with mobile-optimized layout
  - Theme and font: Theme toggle and font switcher with persistent preferences

### Technical

- New page: `src/pages/Dashboard.tsx` (4736 lines)
- Dashboard uses Convex queries for real-time data
- All mutations follow Convex best practices (idempotent, indexed queries)
- Frontmatter sidebar width persisted in localStorage
- Editor content persisted in localStorage
- Independent scrolling for editor and sidebar sections
- Preview uses ReactMarkdown with remark-gfm, remark-breaks, rehype-raw, rehype-sanitize
- CSS styles added for dashboard layout, tables, editor, frontmatter sidebar, config generator, newsletter sections, stats sections, sync sections, toast notifications, command modal
- Mobile responsive breakpoints for all dashboard sections

## [1.43.0] - 2025-12-29

### Added

- Stats page configuration option for public/private access
  - New `StatsPageConfig` interface in `siteConfig.ts` with `enabled` and `showInNav` options
  - Stats page can be made private by setting `enabled: false` (similar to NewsletterAdmin pattern)
  - When disabled, route shows "Stats page is disabled" message instead of analytics
  - Navigation item automatically hidden when stats page is disabled
  - Default configuration: `enabled: true` (public), `showInNav: true` (visible in nav)

### Technical

- Updated: `src/config/siteConfig.ts` (added StatsPageConfig interface and default config)
- Updated: `src/App.tsx` (conditionally renders /stats route based on config)
- Updated: `src/pages/Stats.tsx` (checks if enabled, shows disabled message if not)
- Updated: `src/components/Layout.tsx` (hides stats nav item when disabled)

## [1.42.0] - 2025-12-29

### Added

- Honeypot bot protection for contact and newsletter forms
  - Hidden honeypot fields invisible to humans but visible to bots
  - Contact form uses hidden "Website" field for bot detection
  - Newsletter signup uses hidden "Fax" field for bot detection
  - Bots that fill hidden fields receive fake success message (no data submitted)
  - No external dependencies required (client-side only protection)
  - Works with all four themes (dark, light, tan, cloud)

### Technical

- Updated: `src/components/ContactForm.tsx` (added honeypot state, hidden field, bot detection logic)
- Updated: `src/components/NewsletterSignup.tsx` (added honeypot state, hidden field, bot detection logic)
- Honeypot fields use CSS positioning (position: absolute, left: -9999px) to hide from users
- Fields include aria-hidden="true" and tabIndex={-1} for accessibility
- Different field names per form (website/fax) to avoid pattern detection

## [1.41.0] - 2025-12-28

### Added

- Blog heading styles for home intro content
  - Headings (h1-h6) in `content/pages/home.md` now use same styling as blog posts
  - Classes: `blog-h1`, `blog-h2`, `blog-h3`, `blog-h4`, `blog-h5`, `blog-h6`
  - Clickable anchor links (#) appear on hover for each heading
  - Automatic ID generation from heading text for anchor navigation
- Additional blog styling for home intro
  - Lists (`ul`, `ol`, `li`) use `blog-ul`, `blog-ol`, `blog-li` classes
  - Blockquotes use `blog-blockquote` class
  - Horizontal rules use `blog-hr` class
  - Links use `blog-link` class

### Changed

- `src/pages/Home.tsx`: Added custom ReactMarkdown components for headings and other elements
- Home intro headings now match blog post typography and spacing

### Technical

- Updated: `src/pages/Home.tsx` (added generateSlug, getTextContent, HeadingAnchor helper functions, custom ReactMarkdown components for h1-h6, ul, ol, li, blockquote, hr, and updated a component to use blog-link class)
- Headings in home intro content now have IDs and anchor links matching blog post behavior

## [1.40.0] - 2025-12-28

### Added

- Synced home intro content via markdown file
  - New `content/pages/home.md` file for homepage intro/bio text
  - Home intro content now syncs with `npm run sync` like other pages
  - No redeploy needed for homepage text changes
  - Full markdown support: links, headings, lists, blockquotes, horizontal rules
  - External links automatically open in new tab
  - Fallback to `siteConfig.bio` if page not found or while loading
- New `textAlign` frontmatter field for pages
  - Control text alignment: "left", "center", "right"
  - Default: "left" (previously was always centered)
  - Used by `home.md` to control home intro alignment
- New `featuredTitle` config option in siteConfig.ts
  - Customize the featured section title (e.g., "Get started:", "Featured", "Popular")
  - Previously hardcoded as "Get started:" in Home.tsx

### Changed

- `src/pages/Home.tsx`: Now fetches home intro from Convex instead of hardcoded JSX
- Combined `home-intro` and `home-bio` into single markdown-powered section
- Home intro content defaults to left alignment (can be set to center/right via frontmatter)

### Technical

- New file: `content/pages/home.md` (slug: `home-intro`, `showInNav: false`, `textAlign: left`)
- Updated: `src/pages/Home.tsx` (added ReactMarkdown, useQuery for home-intro, textAlign support, featuredTitle from siteConfig)
- Updated: `src/styles/global.css` (added `.home-intro-content` styles)
- Updated: `convex/schema.ts` (added `textAlign` field to pages table)
- Updated: `convex/pages.ts` (added `textAlign` to getPageBySlug and syncPagesPublic)
- Updated: `scripts/sync-posts.ts` (added `textAlign` to PageFrontmatter and ParsedPage)
- Updated: `src/config/siteConfig.ts` (added `featuredTitle` to SiteConfig interface and config object)

## [1.39.0] - 2025-12-28

### Added

- HTTP-based MCP (Model Context Protocol) server deployed on Netlify Edge Functions
  - Accessible 24/7 at `https://www.markdown.fast/mcp`
  - Public access with Netlify built-in rate limiting (50 req/min per IP)
  - Optional API key authentication for higher limits (1000 req/min)
  - Read-only access to blog posts, pages, homepage, and search
  - 7 tools: `list_posts`, `get_post`, `list_pages`, `get_page`, `get_homepage`, `search_content`, `export_all`
  - JSON-RPC 2.0 protocol over HTTP POST
  - CORS support for MCP clients
  - No local machine required (unlike stdio-based MCP servers)
- Blog post: "How to Use the MCP Server" with client configuration examples
- MCP Server section in documentation (docs.md)
- MCP configuration in siteConfig.ts (`mcpServer` object)

### Changed

- Updated setup-guide.md with MCP server section
- Added `@modelcontextprotocol/sdk` to package.json dependencies

### Technical

- New file: `netlify/edge-functions/mcp.ts` (MCP server implementation)
- New file: `content/blog/how-to-use-mcp-server.md`
- Updated: `netlify.toml` (added /mcp edge function route)
- Updated: `src/config/siteConfig.ts` (MCPServerConfig interface and config)
- Updated: `files.md` (mcp.ts entry)

## [1.38.0] - 2025-12-27

### Added

- Newsletter CLI improvements
  - `newsletter:send` now calls `scheduleSendPostNewsletter` mutation directly
  - New `newsletter:send:stats` command to send weekly stats summary
  - Both commands provide clear success/error feedback
- New mutation `scheduleSendStatsSummary` for CLI stats sending
- Blog post: "How to use AgentMail with Markdown Sync" with complete setup guide

### Changed

- `scripts/send-newsletter.ts`: Now calls mutation directly instead of printing instructions
- `convex/newsletter.ts`: Added `scheduleSendStatsSummary` mutation

### Technical

- New script: `scripts/send-newsletter-stats.ts`
- All AgentMail features verified to use environment variables (no hardcoded emails)

## [1.37.0] - 2025-12-27

### Added

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
- Weekly Digest automation
  - Cron job runs every Sunday at 9:00 AM UTC
  - Automatically sends all posts published in the last 7 days
  - Uses AgentMail SDK for email delivery
  - Configurable via `siteConfig.weeklyDigest`
- Developer Notifications
  - New subscriber alerts sent via email when someone subscribes
  - Weekly stats summary sent every Monday at 9:00 AM UTC
  - Uses `AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX` as recipient
  - Configurable via `siteConfig.newsletterNotifications`
- Admin queries and mutations for newsletter management
  - `getAllSubscribers`: Paginated subscriber list with search/filter
  - `deleteSubscriber`: Remove subscriber from database
  - `getNewsletterStats`: Stats for admin dashboard
  - `getPostsForNewsletter`: List of posts with sent status

### Changed

- `convex/newsletter.ts`: Added admin queries (getAllSubscribers, deleteSubscriber, getNewsletterStats, getPostsForNewsletter, getStatsForSummary) and scheduleSendCustomNewsletter mutation
- `convex/newsletterActions.ts`: Added sendWeeklyDigest, notifyNewSubscriber, sendWeeklyStatsSummary, sendCustomNewsletter actions with markdown-to-HTML conversion
- `convex/posts.ts`: Added getRecentPostsInternal query for weekly digest
- `convex/crons.ts`: Added weekly digest (Sunday 9am) and stats summary (Monday 9am) cron jobs
- `src/config/siteConfig.ts`: Added NewsletterAdminConfig, NewsletterNotificationsConfig, WeeklyDigestConfig interfaces
- `src/App.tsx`: Added /newsletter-admin route
- `src/styles/global.css`: Added newsletter admin styles with responsive design

### Technical

- New page: `src/pages/NewsletterAdmin.tsx`
- Newsletter admin hidden from navigation by default (security through obscurity)
- All admin features togglable via siteConfig
- Uses Convex internal actions for email sending (Node.js runtime with AgentMail SDK)
- Cron jobs use environment variables: SITE_URL, SITE_NAME

## [1.36.0] - 2025-12-27

### Added

- Social footer component with customizable social links and copyright
  - Displays social icons on the left (GitHub, Twitter/X, LinkedIn, and more)
  - Shows copyright symbol, site name, and auto-updating year on the right
  - Configurable via `siteConfig.socialFooter` in `src/config/siteConfig.ts`
  - Supports 8 platform types: github, twitter, linkedin, instagram, youtube, tiktok, discord, website
  - Uses Phosphor icons for consistent styling
  - Appears below the main footer on homepage, blog posts, and pages
  - Can work independently of the main footer when set via frontmatter
- Frontmatter control for social footer visibility
  - `showSocialFooter` field for posts and pages to override siteConfig defaults
  - Set `showSocialFooter: false` to hide on specific posts/pages
  - Works like existing `showFooter` field pattern
- Social footer configuration options
  - `enabled`: Global toggle for social footer
  - `showOnHomepage`, `showOnPosts`, `showOnPages`, `showOnBlogPage`: Per-location visibility
  - `socialLinks`: Array of social link objects with platform and URL
  - `copyright.siteName`: Site/company name for copyright display
  - `copyright.showYear`: Toggle for auto-updating year

### Changed

- `src/config/siteConfig.ts`: Added `SocialLink`, `SocialFooterConfig` interfaces and `socialFooter` configuration
- `convex/schema.ts`: Added `showSocialFooter` optional boolean field to posts and pages tables
- `convex/posts.ts` and `convex/pages.ts`: Updated queries and mutations to include `showSocialFooter` field
- `scripts/sync-posts.ts`: Updated to parse `showSocialFooter` from frontmatter for both posts and pages
- `src/pages/Home.tsx`: Added SocialFooter component below Footer
- `src/pages/Post.tsx`: Added SocialFooter component below Footer for both posts and pages
- `src/pages/Blog.tsx`: Added SocialFooter component below Footer
- `src/styles/global.css`: Added social footer styles with flexbox layout and mobile responsive design

### Technical

- New component: `src/components/SocialFooter.tsx`
- Uses Phosphor icons: GithubLogo, TwitterLogo, LinkedinLogo, InstagramLogo, YoutubeLogo, TiktokLogo, DiscordLogo, Globe
- Responsive design: stacks vertically on mobile (max-width: 480px)
- Year automatically updates using `new Date().getFullYear()`

## [1.35.0] - 2025-12-26

### Added

- `showImageAtTop` frontmatter field for posts and pages
  - Set `showImageAtTop: true` to display the `image` field at the top of the post/page above the header
  - Image displays full-width with rounded corners above the post header
  - Default behavior: if `showImageAtTop` is not set or `false`, image only used for Open Graph previews and featured card thumbnails
  - Works for both blog posts and static pages
  - Image appears above the post header when enabled

### Changed

- `convex/schema.ts`: Added `showImageAtTop` optional boolean field to posts and pages tables
- `scripts/sync-posts.ts`: Updated to parse `showImageAtTop` from frontmatter for both posts and pages
- `convex/posts.ts` and `convex/pages.ts`: Updated queries and mutations to include `showImageAtTop` field
- `src/pages/Post.tsx`: Added conditional rendering to display image at top when `showImageAtTop: true`
- `src/pages/Write.tsx`: Added `showImageAtTop` to POST_FIELDS and PAGE_FIELDS frontmatter reference
- `src/styles/global.css`: Added `.post-header-image` and `.post-header-image-img` styles for header image display
- Documentation updated: `content/pages/docs.md`, `content/blog/how-to-publish.md`, `content/blog/using-images-in-posts.md`, `files.md`

### Technical

- Header image displays with full-width responsive layout
- Image appears above post header with 32px bottom margin
- Rounded corners (8px border-radius) for modern appearance
- Maintains aspect ratio with `object-fit: cover`

## [1.34.0] - 2025-12-26

### Added

- Blog page featured layout with hero post
  - `blogFeatured` frontmatter field for posts to mark as featured on blog page
  - First `blogFeatured` post displays as hero card with landscape image, tags, date, title, excerpt, author info, and read more link
  - Remaining `blogFeatured` posts display in 2-column featured row with excerpts
  - Regular (non-featured) posts display in 3-column grid without excerpts
  - New `BlogHeroCard` component (`src/components/BlogHeroCard.tsx`) for hero display
  - New `getBlogFeaturedPosts` query returns all published posts with `blogFeatured: true` sorted by date
  - `PostList` component updated with `columns` prop (2 or 3) and `showExcerpts` prop
  - Card images use 16:10 landscape aspect ratio
  - Footer support on blog page via `siteConfig.footer.showOnBlogPage`

### Changed

- `convex/schema.ts`: Added `blogFeatured` field to posts table with `by_blogFeatured` index
- `convex/posts.ts`: Added `getBlogFeaturedPosts` query, updated sync mutations to handle `blogFeatured` field
- `scripts/sync-posts.ts`: Updated to parse `blogFeatured` from post frontmatter
- `src/pages/Blog.tsx`: Refactored to display hero, featured row, and regular posts sections
- `src/components/PostList.tsx`: Added `columns` and `showExcerpts` props for layout control
- `src/styles/global.css`: Added styles for `.blog-hero-section`, `.blog-hero-card`, `.blog-featured-row`, `.post-cards-2col`

### Technical

- Hero card responsive design: stacks content on mobile, side-by-side on desktop
- Featured row uses 2-column grid with excerpts visible
- Regular posts grid uses 3-column layout without excerpts for cleaner appearance
- Responsive breakpoints: 2 columns at 768px, 1 column at 480px
- Layout class names updated: `blog-page-cards` and `blog-page-list` for view modes

## [1.33.1] - 2025-12-26

### Changed

- Article centering in sidebar layouts
  - Article content now centers in the middle column when sidebars are present
  - Left sidebar stays flush left, right sidebar stays flush right
  - Article uses `margin-left: auto; margin-right: auto` within its `1fr` grid column
  - Works with both two-column (left sidebar only) and three-column (both sidebars) layouts
  - Consistent `max-width: 800px` for article content across all sidebar configurations

### Technical

- Updated `.post-article-with-sidebar` in `src/styles/global.css` with auto margins for centering
- Added `padding-right: 48px` to match left padding for balanced spacing

## [1.33.0] - 2025-12-26

### Added

- AI Chat Write Agent integration with Anthropic Claude
  - New `AIChatView` component (`src/components/AIChatView.tsx`) for AI-powered chat interface
  - AI chat can be toggled on Write page via siteConfig.aiChat.enabledOnWritePage
  - AI chat can appear in RightSidebar on posts/pages via frontmatter `aiChat: true` field
  - Per-session, per-context chat history stored in Convex (aiChats table)
  - Supports page content as context for AI responses
  - Markdown rendering for AI responses with copy functionality
  - Theme-aware styling that matches the site's design system
  - Uses Phosphor Icons for all UI elements

- Convex backend for AI chat
  - New `convex/aiChats.ts` with queries and mutations for chat history
  - New `convex/aiChatActions.ts` with Claude API integration (requires ANTHROPIC_API_KEY environment variable)
  - System prompt configurable via Convex environment variables:
    - `CLAUDE_PROMPT_STYLE`, `CLAUDE_PROMPT_COMMUNITY`, `CLAUDE_PROMPT_RULES` (split prompts, joined with separators)
    - `CLAUDE_SYSTEM_PROMPT` (single prompt, fallback if split prompts not set)
  - Chat history limited to last 20 messages for context efficiency
  - Error handling: displays "API key is not set" message when ANTHROPIC_API_KEY is missing in Convex environment variables

- New configuration options
  - `siteConfig.aiChat` interface with `enabledOnWritePage` and `enabledOnContent` boolean flags
  - Both flags default to false (opt-in feature)
  - New `aiChat` frontmatter field for posts and pages (requires rightSidebar: true)

### Changed

- Write page now supports AI Agent mode toggle (replaces textarea when active)
  - Title changes from "Blog Post" or "Page" to "Agent" when in AI chat mode
  - Toggle button text changes between "Agent" and "Text Editor"
  - Page scroll prevention when switching modes (no page jump)
- RightSidebar component updated to conditionally render AIChatView
- Post.tsx passes pageContent and slug to RightSidebar for AI context
- Schema updated with aiChats table and aiChat fields on posts/pages tables
- sync-posts.ts updated to handle aiChat frontmatter field
- AIChatView displays user-friendly error messages when API key is not configured

### Technical

- Added `@anthropic-ai/sdk` dependency for Claude API integration
- Anonymous session authentication using localStorage session ID
- AI chat CSS styles in global.css with theme variable support
- New convex schema: aiChats table with indexes (by_sessionId_contextId, by_contextId)

## [1.32.0] - 2025-12-25

### Added

- Custom homepage configuration
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

### Changed

- `src/App.tsx`: Conditionally renders Home or Post component based on `siteConfig.homepage` configuration
- `src/pages/Post.tsx`: Added optional `slug`, `isHomepage`, and `homepageType` props to support homepage mode
- `src/config/siteConfig.ts`: Added `HomepageConfig` interface and default homepage configuration

### Technical

- New interface: `HomepageConfig` in `src/config/siteConfig.ts`
- Conditional routing in `App.tsx` checks `homepage.type` and `homepage.slug` to determine homepage component
- Post component accepts optional props for homepage mode (hides back button when `isHomepage` is true)
- Original homepage route dynamically added when custom homepage is active

## [1.31.1] - 2025-12-25

### Added

- Image support in footer component with size control
  - Footer markdown now supports images using standard markdown syntax or HTML
  - Images can be sized using `width`, `height`, `style`, or `class` HTML attributes
  - Image attributes are sanitized by rehypeSanitize for security (removes dangerous CSS)
  - Footer images support lazy loading and optional captions from alt text
  - CSS styles added for footer images (`.site-footer-image-wrapper`, `.site-footer-image`, `.site-footer-image-caption`)

### Changed

- Footer sanitize schema updated to allow `width`, `height`, `style`, and `class` attributes on images
- Footer image component handler updated to pass through size attributes from HTML

## [1.31.0] - 2025-12-25

### Added

- Customizable footer component with markdown support
  - New `Footer` component (`src/components/Footer.tsx`) that renders markdown content
  - Footer content can be set in frontmatter `footer` field (markdown) or use `siteConfig.footer.defaultContent`
  - Footer can be enabled/disabled globally via `siteConfig.footer.enabled`
  - Footer visibility controlled per-page type via `siteConfig.footer.showOnHomepage`, `showOnPosts`, `showOnPages`
  - New `showFooter` frontmatter field for posts and pages to override siteConfig defaults
  - New `footer` frontmatter field for posts and pages to provide custom markdown content
  - Footer renders inside article at bottom for posts/pages, maintains current position on homepage
  - Footer supports markdown formatting (links, paragraphs, line breaks)
  - Sidebars flush to bottom when footer is enabled (using min-height)

### Changed

- Homepage footer section now uses the new `Footer` component instead of hardcoded HTML
- Post and page views now render footer inside article tag (before closing `</article>`)
- Footer component simplified to accept markdown content instead of structured link arrays
- Footer configuration in `siteConfig.ts` now uses `defaultContent` (markdown string) instead of `builtWith`/`createdBy` objects

## [1.30.2] - 2025-12-25

### Fixed

- Right sidebar no longer appears on pages/posts without explicit `rightSidebar: true` in frontmatter
  - Changed default behavior: right sidebar is now opt-in only
  - Pages like About and Contact now render without the right sidebar as expected
  - `CopyPageDropdown` correctly appears in nav bar when right sidebar is disabled
- Logic in `Post.tsx` changed from `(page.rightSidebar ?? true)` to `page.rightSidebar === true`

## [1.30.1] - 2025-12-25

### Fixed

- TypeScript error in `convex/posts.ts` where `rightSidebar` was used in mutation handlers but missing from args validators
  - Added `rightSidebar: v.optional(v.boolean())` to `syncPosts` args validator
  - Added `rightSidebar: v.optional(v.boolean())` to `syncPostsPublic` args validator

## [1.30.0] - 2025-12-25

### Added

- Right sidebar feature for posts and pages
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
  - Defaults to true when `siteConfig.rightSidebar.enabled` is true
  - Added to Write page frontmatter reference with copy button

### Changed

- `Post.tsx`: Updated to support three-column layout with conditional right sidebar rendering
- CSS refactoring: Separated left and right sidebar styles
  - `.post-sidebar-wrapper` is now left-specific with `margin-left` and right border
  - `.post-sidebar-right` has complete independent styles with `margin-right` and left border
  - Both sidebars maintain consistent styling (sticky positioning, background, borders, scrollbar hiding)
- `src/styles/global.css`: Added CSS for right sidebar positioning and 3-column grid layout
- `convex/schema.ts`: Added `rightSidebar` field to posts and pages tables
- `convex/posts.ts` and `convex/pages.ts`: Updated queries and mutations to handle `rightSidebar` field
- `scripts/sync-posts.ts`: Updated parsing logic to include `rightSidebar` frontmatter field
- `src/pages/Write.tsx`: Added `rightSidebar` field to POST_FIELDS and PAGE_FIELDS arrays

### Technical

- Right sidebar uses sticky positioning with top offset matching left sidebar
- CSS grid automatically adjusts from 2-column to 3-column layout when right sidebar is present
- Main content padding adjusts when right sidebar is enabled
- Mobile responsive: right sidebar hidden below 1135px breakpoint

## [1.29.0] - 2025-12-25

### Added

- Font family configuration system
  - Added `fontFamily` option to `siteConfig.ts` with three options: "serif" (New York), "sans" (system fonts), "monospace" (IBM Plex Mono)
  - Created `FontContext.tsx` for global font state management with localStorage persistence
  - Font preference persists across page reloads
  - SiteConfig default font is respected and overrides localStorage when siteConfig changes
  - CSS variable `--font-family` dynamically updates based on selected font
- Monospace font option
  - Added monospace font family to FONT SWITCHER options in `global.css`
  - Monospace uses "IBM Plex Mono", "Liberation Mono", ui-monospace, monospace
  - Write page font switcher now supports all three font options (serif/sans/monospace)
- Fork configuration support for fontFamily
  - Added `fontFamily` field to `fork-config.json.example`
  - Updated `configure-fork.ts` to handle fontFamily configuration

### Changed

- `src/styles/global.css`: Updated body font-family to use CSS variable `--font-family` with fallback
- `src/main.tsx`: Added FontProvider wrapper around app
- `src/pages/Write.tsx`: Updated font switcher to cycle through serif/sans/monospace options
- `content/blog/setup-guide.md`: Updated font configuration documentation with siteConfig option
- `content/pages/docs.md`: Updated font configuration documentation

### Technical

- New context: `src/context/FontContext.tsx` with `useFont()` hook
- Font detection logic compares siteConfig default with localStorage to detect changes
- CSS variable updates synchronously on mount for immediate font application
- Write page font state syncs with global font on initial load

## [1.28.2] - 2025-12-25

### Fixed

- Plain text code blocks now wrap text properly
  - Code blocks without a language specifier were causing horizontal overflow
  - Updated detection logic to distinguish inline code from block code
  - Inline code: short content (< 80 chars), no newlines, no language
  - Block code: longer content or has language specifier
  - Text block wrapping uses `pre-wrap` styling via SyntaxHighlighter `customStyle` and `codeTagProps`
  - Long error messages and prose in code blocks now display correctly

### Technical

- Updated `src/components/BlogPost.tsx`: New detection logic for inline vs block code, added `textBlockStyle` with wrapping properties
- Updated `src/styles/global.css`: Added `.code-block-text` class for CSS fallback wrapping

## [1.28.1] - 2025-12-25

### Fixed

- RSS feed validation errors resolved
  - Standardized all URLs to `www.markdown.fast` across the application
  - Fixed `atom:link rel="self"` attribute mismatch that caused RSS validation failures
  - Updated `index.html` meta tags (og:url, og:image, twitter:domain, twitter:url, twitter:image, JSON-LD)
  - Updated `convex/rss.ts` and `convex/http.ts` SITE_URL constants to use www.markdown.fast
  - Updated `public/robots.txt`, `public/openapi.yaml`, and `public/llms.txt` with www URLs
  - RSS exclusions already present in `netlify.toml` for botMeta edge function

### Technical

- All URL references now consistently use `https://www.markdown.fast`
- RSS feed `rel="self"` attribute now matches actual feed URL
- Build passes successfully with URL standardization

## [1.28.0] - 2025-12-25

### Added

- Discovery files sync script
  - New `sync-discovery-files.ts` script that updates AGENTS.md and llms.txt with current app data
  - Reads from siteConfig.ts and queries Convex for post/page counts and latest post date
  - Preserves existing AGENTS.md instructional content while updating dynamic sections
  - Regenerates llms.txt with current site information and GitHub URLs
- New npm sync commands
  - `npm run sync:discovery` - Update discovery files (development)
  - `npm run sync:discovery:prod` - Update discovery files (production)
  - `npm run sync:all` - Sync content + discovery files together (development)
  - `npm run sync:all:prod` - Sync content + discovery files together (production)
- Fork configuration support for gitHubRepo
  - Added `gitHubRepoConfig` to fork-config.json.example
  - Updated configure-fork.ts to handle gitHubRepo with backward compatibility
  - Legacy githubUsername/githubRepo fields still work

### Changed

- `fork-config.json.example`: Added gitHubRepoConfig object with owner, repo, branch, contentPath
- `scripts/configure-fork.ts`: Added gitHubRepo update logic with legacy field fallback
- `FORK_CONFIG.md`: Added gitHubRepo documentation and sync:discovery command reference
- `files.md`: Added sync-discovery-files.ts entry and sync commands documentation
- Documentation updated across all files with new sync commands

### Technical

- New script: `scripts/sync-discovery-files.ts`
- Uses ConvexHttpClient to query live data from Convex
- Regex-based siteConfig.ts parsing for gitHubRepo extraction
- Selective AGENTS.md updates preserve instructional content
- Error handling with graceful fallbacks for missing data

## [1.27.0] - 2025-12-24

### Added

- Homepage post limit configuration
  - Configurable limit for number of posts shown on homepage via `siteConfig.postsDisplay.homePostsLimit`
  - Default limit set to 10 most recent posts
  - Set to `undefined` to show all posts (no limit)
- Optional "read more" link below limited post list
  - Configurable via `siteConfig.postsDisplay.homePostsReadMore`
  - Customizable link text and destination URL
  - Only appears when posts are limited and there are more posts than the limit
  - Default links to `/blog` page
  - Can be disabled by setting `enabled: false`

### Changed

- `src/config/siteConfig.ts`: Added `homePostsLimit` and `homePostsReadMore` to `PostsDisplayConfig` interface
- `src/pages/Home.tsx`: Post list now respects `homePostsLimit` configuration and shows "read more" link when applicable
- `src/styles/global.css`: Added styles for `.home-posts-read-more` and `.home-posts-read-more-link` with centered button styling and hover effects

### Technical

- New interface: `HomePostsReadMoreConfig` in `src/config/siteConfig.ts`
- Post limiting logic uses `.slice()` to limit array before passing to `PostList` component
- Conditional rendering ensures "read more" link only shows when needed

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
