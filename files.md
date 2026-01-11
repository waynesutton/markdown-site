# Markdown Site - File Structure

A brief description of each file in the codebase.

## Root Files

| File                       | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `package.json`             | Dependencies and scripts for the blog                 |
| `tsconfig.json`            | TypeScript configuration                              |
| `vite.config.ts`           | Vite bundler configuration                            |
| `index.html`               | Main HTML entry with SEO meta tags, JSON-LD, critical CSS inline, and resource hints |
| `netlify.toml`             | Netlify deployment and Convex HTTP redirects          |
| `README.md`                | Project documentation (streamlined with links to docs)|
| `AGENTS.md`                | AI coding agent instructions (agents.md spec)         |
| `CLAUDE.md`                | Claude Code instructions for project workflows        |
| `files.md`                 | This file - codebase structure                        |
| `changelog.md`             | Version history and changes                           |
| `TASK.md`                  | Task tracking and project status                      |
| `FORK_CONFIG.md`           | Fork configuration guide (manual + automated options) |
| `fork-config.json.example` | Template JSON config for automated fork setup         |

## Source Files (`src/`)

### Entry Points

| File            | Description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `main.tsx`      | React app entry point with conditional WorkOS providers. When WorkOS is configured (VITE_WORKOS_CLIENT_ID and VITE_WORKOS_REDIRECT_URI set), wraps app with AuthKitProvider and ConvexProviderWithAuthKit. When WorkOS is not configured, uses standard ConvexProvider. Uses lazy loading and Suspense for optional WorkOS integration. Suspense fallback uses invisible div (minHeight: 100vh) to prevent "Loading..." text flash. |
| `App.tsx`       | Main app component with routing (supports custom homepage configuration via siteConfig.homepage). Handles /callback route for WorkOS OAuth redirect. |
| `AppWithWorkOS.tsx` | Wrapper component for WorkOS-enabled app. Provides AuthKitProvider and ConvexProviderWithAuthKit. Only loaded when WorkOS is configured. |
| `vite-env.d.ts` | Vite environment type definitions                                                                |

### Config (`src/config/`)

| File            | Description                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteConfig.ts` | Centralized site configuration (name, logo, blog page, posts display with homepage post limit and read more link, featured section with configurable title via featuredTitle, GitHub contributions, nav order, inner page logo settings, hardcoded navigation items for React routes, GitHub repository config for AI service raw URLs, font family configuration, right sidebar configuration, footer configuration with markdown support, social footer configuration, homepage configuration, AI chat configuration, aiDashboard configuration with multi-model support for text chat and image generation, newsletter configuration with admin and notifications, contact form configuration, weekly digest configuration, stats page configuration with public/private toggle, dashboard configuration with optional WorkOS authentication via requireAuth, image lightbox configuration with enabled toggle, semantic search configuration with enabled toggle and disabled by default to avoid blocking forks without OPENAI_API_KEY, twitter configuration for Twitter Cards meta tags, askAI configuration with enabled toggle, default model, and available models for header Ask AI feature, relatedPosts configuration with defaultViewMode and showViewToggle options) |

### Pages (`src/pages/`)

| File          | Description                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Home.tsx`    | Landing page with featured content and optional post list. Fetches home intro content from `content/pages/home.md` (slug: `home-intro`) for synced markdown intro text. Supports configurable post limit (homePostsLimit) and optional "read more" link (homePostsReadMore) via siteConfig.postsDisplay. Falls back to siteConfig.bio if home-intro page not found. Home intro content uses blog heading styles (blog-h1 through blog-h6) with clickable anchor links, matching blog post typography. Includes helper functions (generateSlug, getTextContent, HeadingAnchor) for heading ID generation and anchor links. Featured section title configurable via siteConfig.featuredTitle (default: "Get started:"). |
| `Blog.tsx`    | Dedicated blog page with featured layout: hero post (first blogFeatured), featured row (remaining blogFeatured in 2 columns with excerpts), and regular posts (3 columns without excerpts). Supports list/card view toggle. Includes back button in navigation                                                                                                    |
| `Post.tsx`    | Individual blog post or page view with optional left sidebar (TOC) and right sidebar (CopyPageDropdown). Includes back button (hidden when used as homepage), tag links, related posts section in footer for blog posts with thumbnail/list view toggle, footer component with markdown support (fetches footer.md content from Convex), and social footer. Supports 3-column layout at 1135px+. Can display image at top when showImageAtTop: true. Can be used as custom homepage via siteConfig.homepage (update SITE_URL/SITE_NAME when forking). SEO: Dynamic canonical URL, hreflang tags, og:url consistency, and twitter:site meta tags. DOM order optimized for SEO (article before sidebar, CSS order for visual layout). Related posts view mode persists in localStorage. |
| `Stats.tsx`   | Real-time analytics dashboard with visitor stats and GitHub stars. Configurable via `siteConfig.statsPage` to enable/disable public access and navigation visibility. Shows disabled message when `enabled: false` (similar to NewsletterAdmin pattern).                                                                                                                                                                 |
| `DocsPage.tsx` | Docs landing page component for `/docs` route. Renders the page/post with `docsLanding: true` in DocsLayout. Fetches landing content via `getDocsLandingPage` and `getDocsLandingPost` queries. Includes Footer component (respects showFooter frontmatter), AI chat support (aiChatEnabled), and fallback to first docs item if no landing page is set. |
| `TagPage.tsx` | Tag archive page displaying posts filtered by a specific tag. Includes view mode toggle (list/cards) with localStorage persistence                                                                                                                                                                                                                                |
| `AuthorPage.tsx` | Author archive page displaying posts by a specific author. Includes view mode toggle (list/cards) with localStorage persistence. Author name clickable in posts links to this page. |
| `Write.tsx`   | Three-column markdown writing page with Cursor docs-style UI, frontmatter reference with copy buttons, theme toggle, font switcher (serif/sans/monospace), localStorage persistence, and optional AI Agent mode (toggleable via siteConfig.aiChat.enabledOnWritePage). When enabled, Agent replaces the textarea with AIChatView component. Includes scroll prevention when switching to Agent mode to prevent page jump. Title changes to "Agent" when in AI chat mode. |
| `Dashboard.tsx` | Centralized dashboard at `/dashboard` for content management and site configuration. **Cloud CMS Features:** Direct database save ("Save to DB" button), source tracking (Dashboard vs Synced badges), delete confirmation modal with warning, CRUD operations for dashboard-created content. **Content Management:** Posts and Pages list views with filtering, search, pagination, items per page selector, source badges, delete buttons (dashboard content only); Post/Page editor with markdown editor, live preview, "Save Changes" button, draggable/resizable frontmatter sidebar (200px-600px), independent scrolling, download markdown, export to markdown; Write Post/Page sections with three editor modes (Markdown, Rich Text via Quill, Preview), full-screen writing interface. **Rich Text Editor:** Quill-based WYSIWYG editor with toolbar (headers, bold, italic, lists, links, code, blockquote), automatic HTML-to-Markdown conversion on mode switch, theme-aware styling. **AI Agent:** Tab-based UI for Chat and Image Generation, multi-model selector (Claude Sonnet 4, GPT-4o, Gemini 2.0 Flash), image generation with Nano Banana models, aspect ratio selection, download button, and MD/HTML copy options with code preview. **Other Features:** Newsletter management (all Newsletter Admin features integrated); Content import (direct database import via Firecrawl, no file sync needed); Site configuration (Config Generator UI with Version Control toggle); Index HTML editor; Analytics (real-time stats dashboard); Sync commands UI with sync server integration; Header sync buttons; Dashboard search; Toast notifications; Command modal; Version history modal for viewing diffs and restoring previous versions; Mobile responsive design. Uses Convex queries for real-time data, localStorage for preferences, ReactMarkdown for preview. Optional WorkOS authentication via siteConfig.dashboard.requireAuth. |
| `Callback.tsx` | OAuth callback handler for WorkOS authentication. Handles redirect from WorkOS after user login, exchanges authorization code for user information, then redirects to dashboard. Only used when WorkOS is configured. |
| `NewsletterAdmin.tsx` | Three-column newsletter admin page for managing subscribers and sending newsletters. Left sidebar with navigation and stats, main area with searchable subscriber list, right sidebar with send newsletter panel and recent sends. Access at /newsletter-admin, configurable via siteConfig.newsletterAdmin. |

### Components (`src/components/`)

| File                      | Description                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Layout.tsx`              | Page wrapper with logo in header (top-left), search button, theme toggle, mobile menu (left-aligned on mobile), and scroll-to-top. Combines Blog link, hardcoded nav items, and markdown pages for navigation. Logo reads from siteConfig.innerPageLogo. Displays social icons in header (left of search) when siteConfig.socialFooter.showInHeader is true.                                                                                                               |
| `ThemeToggle.tsx`         | Theme switcher (dark/light/tan/cloud)                                                                                                                                                                                                                                                                                                                                 |
| `PostList.tsx`            | Year-grouped blog post list or card grid (supports list/cards view modes, columns prop for 2/3 column grids, showExcerpts prop to control excerpt visibility)                                                                                                                                                                                                         |
| `BlogHeroCard.tsx`        | Hero card component for the first blogFeatured post on blog page. Displays landscape image, tags, date, title, excerpt, author info, and read more link                                                                                                                                                                                                               |
| `BlogPost.tsx`            | Markdown renderer with syntax highlighting, collapsible sections (details/summary), text wrapping for plain text code blocks, image lightbox support (click images to magnify in full-screen overlay), and iframe embed support with domain whitelisting (YouTube and Twitter/X only). Routes diff/patch code blocks to DiffCodeBlock for enhanced diff rendering. SEO: H1 headings in markdown demoted to H2 (`.blog-h1-demoted` class) for single H1 per page compliance.                                                                                                                                                                                                                                      |
| `DiffCodeBlock.tsx`       | Enhanced diff/patch code block renderer using @pierre/diffs library. Supports unified and split (side-by-side) view modes with toggle button. Theme-aware (dark/light) with copy button. Used automatically for ```diff and ```patch code blocks in markdown. |
| `CopyPageDropdown.tsx`    | Share dropdown with Copy page (markdown to clipboard), View as Markdown (opens raw .md file), Download as SKILL.md (Anthropic Agent Skills format), Open in AI links (ChatGPT, Claude, Perplexity) using local /raw URLs, and Export as PDF (browser print with clean formatting)                                                                                                                    |
| `Footer.tsx`              | Footer component that renders markdown content from frontmatter footer field or siteConfig.defaultContent. Can be enabled/disabled globally and per-page via frontmatter showFooter field. Renders inside article at bottom for posts/pages, and in current position on homepage. Supports images with size control via HTML attributes (width, height, style, class) |
| `SearchModal.tsx`         | Full text search modal with keyboard navigation. Supports keyword and semantic search modes (toggle with Tab). Semantic mode conditionally shown when `siteConfig.semanticSearch.enabled: true`. When semantic disabled (default), shows keyword search only without mode toggle.                                                                                                                                                                                                                                                                                                                       |
| `FeaturedCards.tsx`       | Card grid for featured posts/pages with excerpts                                                                                                                                                                                                                                                                                                                      |
| `LogoMarquee.tsx`         | Scrolling logo gallery with clickable links                                                                                                                                                                                                                                                                                                                           |
| `MobileMenu.tsx`          | Slide-out drawer menu for mobile navigation with hamburger button. Shows social icons below nav links when `socialFooter.showInHeader` enabled (mobile only, not in header). Includes sidebar table of contents when page has sidebar layout. Uses `platformIcons` from SocialFooter.                                                                                                                                    |
| `ScrollToTop.tsx`         | Configurable scroll-to-top button with Phosphor ArrowUp icon                                                                                                                                                                                                                                                                                                          |
| `GitHubContributions.tsx` | GitHub activity graph with theme-aware colors and year navigation                                                                                                                                                                                                                                                                                                     |
| `VisitorMap.tsx`          | Real-time visitor location map with dotted world display, theme-aware colors, and GPU-composited pulse animations using transform: scale()                                                                                                                                                                                                                            |
| `PageSidebar.tsx`         | Collapsible table of contents sidebar for pages/posts with sidebar layout, extracts headings (H1-H6), active heading highlighting, smooth scroll navigation, localStorage persistence for expanded/collapsed state                                                                                                                                                    |
| `RightSidebar.tsx`        | Right sidebar component that displays CopyPageDropdown or AI chat on posts/pages at 1135px+ viewport width, controlled by siteConfig.rightSidebar.enabled and frontmatter rightSidebar/aiChat fields                                                                                                                                                                  |
| `AIChatView.tsx`          | AI chat interface component (Agent) using Anthropic Claude API. Supports per-page chat history, page content context, markdown rendering, and copy functionality. Used in Write page (replaces textarea when enabled) and optionally in RightSidebar. Requires ANTHROPIC_API_KEY environment variable in Convex. System prompt configurable via CLAUDE_PROMPT_STYLE, CLAUDE_PROMPT_COMMUNITY, CLAUDE_PROMPT_RULES, or CLAUDE_SYSTEM_PROMPT environment variables. Includes error handling for missing API keys. |
| `NewsletterSignup.tsx`    | Newsletter signup form component for email-only subscriptions. Displays configurable title/description, validates email, and submits to Convex. Shows on home, blog page, and posts based on siteConfig.newsletter settings. Supports frontmatter override via newsletter: true/false. Includes honeypot field for bot protection. |
| `ContactForm.tsx`         | Contact form component with name, email, and message fields. Displays when contactForm: true in frontmatter. Submits to Convex which sends email via AgentMail to configured recipient. Requires AGENTMAIL_API_KEY and AGENTMAIL_INBOX environment variables. Includes honeypot field for bot protection. |
| `SocialFooter.tsx`        | Social footer component with social icons on left (GitHub, Twitter/X, LinkedIn, Instagram, YouTube, TikTok, Discord, Website) and copyright on right. Configurable via siteConfig.socialFooter. Shows below main footer on homepage, blog posts, and pages. Supports frontmatter override via showSocialFooter: true/false. Auto-updates copyright year. Exports `platformIcons` for reuse in header. |
| `AskAIModal.tsx`          | Ask AI chat modal for RAG-based Q&A about site content. Opens via header button (Cmd+J) when enabled. Uses Convex Persistent Text Streaming for real-time responses. Supports model selection (Claude, GPT-4o). Features streaming messages with markdown rendering, internal link handling via React Router, and source citations. Requires siteConfig.askAI.enabled and siteConfig.semanticSearch.enabled. |
| `VersionHistoryModal.tsx` | Version history modal for viewing and restoring previous content versions. Shows version list with dates and source badges, diff view using DiffCodeBlock component, preview mode, and one-click restore. Used in Dashboard editor when version control is enabled. |
| `MediaLibrary.tsx`        | Media library component for uploading and managing images. Features drag-and-drop upload, copy as Markdown/HTML/URL, bulk select and delete, file size display, and pagination. Shows configuration warning when Bunny CDN not configured. Uses ConvexFS for storage with Bunny.net Edge Storage and CDN delivery. |
| `ImageUploadModal.tsx`    | Image insert modal for Write Post/Page sections. Two tabs: "Upload New" for uploading images and "Media Library" for selecting existing images. Shows image dimensions with aspect ratio, size presets (Original, Large 1200px, Medium 800px, Small 400px, Thumbnail 200px, Custom), alt text field, and calculated dimensions before insert. Uses HTML img tag with explicit width/height for non-original sizes. |

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
| `workos.ts`          | WorkOS configuration utility. Exports isWorkOSConfigured boolean (checks if VITE_WORKOS_CLIENT_ID and VITE_WORKOS_REDIRECT_URI are set) and workosConfig object with clientId and redirectUri. Used throughout app to conditionally enable WorkOS features. |

### Hooks (`src/hooks/`)

| File                       | Description                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usePageTracking.ts`       | Page view recording and active session heartbeat                                                                                                         |
| `useSearchHighlighting.ts` | Search term highlighting and scroll-to-match. Reads `?q=` URL param, waits for content to load, highlights matches in DOM, scrolls to first match. |

### Styles (`src/styles/`)

| File         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.css` | Global CSS with theme variables, centralized font-size CSS variables for all themes, sidebar styling with alternate background colors, hidden scrollbar, and consistent borders using box-shadow for docs-style layout. Left sidebar (`.post-sidebar-wrapper`) and right sidebar (`.post-sidebar-right`) have separate, independent styles. Footer image styles (`.site-footer-image-wrapper`, `.site-footer-image`, `.site-footer-image-caption`) for responsive image display. Write page layout uses viewport height constraints (100vh) with overflow hidden to prevent page scroll, and AI chat uses flexbox with min-height: 0 for proper scrollable message area. Image lightbox styles (`.image-lightbox-backdrop`, `.image-lightbox-img`, `.image-lightbox-close`, `.image-lightbox-caption`) for full-screen image magnification with backdrop, close button, and caption display. SEO: `.blog-h1-demoted` class for demoted H1s (semantic H2 with H1 styling), CSS `order` properties for article/sidebar DOM order optimization. Core Web Vitals: GPU-composited visitor-pulse animations with `transform: scale()`, docs-skeleton-pulse using pseudo-element with `transform: translateX()`, `will-change` hints on animated elements (theme-toggle, copy-page-menu, search-modal-backdrop, scroll-to-top, image-lightbox-backdrop, search-modal, ai-chat-message, dashboard-toast, ask-ai-modal, docs-article). Docs layout scrollbar hiding: `body:has(.docs-layout)` prevents page-level scroll, `.docs-sidebar-left`, `.docs-sidebar-right`, and `.docs-content` use `scrollbar-width: none` (Firefox), `-ms-overflow-style: none` (IE/Edge), and `::-webkit-scrollbar { width: 0 }` (Chrome/Safari) for invisible scrollbars while preserving scroll functionality |

## Convex Backend (`convex/`)

| File               | Description                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `schema.ts`        | Database schema (posts, pages, viewCounts, pageViews, activeSessions, aiChats, aiGeneratedImages, newsletterSubscribers, newsletterSentPosts, contactMessages, askAISessions, contentVersions, versionControlSettings) with indexes for tag queries (by_tags), AI queries, blog featured posts (by_blogFeatured), source tracking (by_source), vector search (by_embedding), and version history (by_content, by_createdAt). Posts and pages include showSocialFooter, showImageAtTop, blogFeatured, contactForm, source, and embedding fields for frontmatter control, cloud CMS tracking, and semantic search. contentVersions stores snapshots before content updates. versionControlSettings stores the enable/disable toggle. |
| `cms.ts`           | CRUD mutations for dashboard cloud CMS: createPost, updatePost, deletePost, createPage, updatePage, deletePage, exportPostAsMarkdown, exportPageAsMarkdown. Posts/pages created via dashboard have `source: "dashboard"` (protected from sync overwrites). Captures versions before updates when version control is enabled. |
| `importAction.ts`  | Server-side Convex action for direct URL import via Firecrawl API. Scrapes URL, converts to markdown, saves directly to database with `source: "dashboard"`. Requires FIRECRAWL_API_KEY environment variable. |
| `posts.ts`         | Queries and mutations for blog posts, view counts, getAllTags, getPostsByTag, getRelatedPosts (returns image, excerpt, authorName, authorImage for thumbnail view), and getBlogFeaturedPosts. Includes tag-based queries for tag pages and related posts functionality. |
| `pages.ts`         | Queries and mutations for static pages                                                                             |
| `search.ts`        | Full text search queries across posts and pages                                                                    |
| `semanticSearch.ts` | Vector-based semantic search action using OpenAI embeddings                                                       |
| `semanticSearchQueries.ts` | Internal queries for fetching post/page details by IDs for semantic search                                 |
| `embeddings.ts`    | Embedding generation actions using OpenAI text-embedding-ada-002                                                   |
| `embeddingsQueries.ts` | Internal queries and mutations for embedding storage and retrieval                                             |
| `stats.ts`         | Real-time stats with aggregate component for O(log n) counts, page view recording, session heartbeat               |
| `crons.ts`         | Cron jobs for stale session cleanup (every 5 minutes), weekly newsletter digest (Sundays 9am UTC), weekly stats summary (Mondays 9am UTC), and version cleanup (daily 3am UTC). Uses environment variables SITE_URL and SITE_NAME for email content. |
| `http.ts`          | HTTP endpoints: sitemap (includes tag pages), API (update SITE_URL/SITE_NAME when forking, uses www.markdown.fast), Open Graph HTML generation for social crawlers with hreflang and twitter:site meta tags |
| `rss.ts`           | RSS feed generation (update SITE_URL/SITE_TITLE when forking, uses www.markdown.fast)                              |
| `auth.config.ts`  | Convex authentication configuration for WorkOS. Defines JWT providers for WorkOS API and user management. Requires WORKOS_CLIENT_ID environment variable in Convex. Optional - only needed if using WorkOS authentication for dashboard. |
| `aiChats.ts`       | Queries and mutations for AI chat history (per-session, per-context storage). Handles anonymous session IDs, per-page chat contexts, and message history management. Supports page content as context for AI responses.                                                                                                                                           |
| `aiChatActions.ts` | Multi-provider AI chat action supporting Anthropic (Claude Sonnet 4), OpenAI (GPT-4o), and Google (Gemini 2.0 Flash). Requires respective API keys: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_AI_API_KEY. Lazy API key validation only shows errors when user attempts to use a specific model. System prompt configurable via environment variables. Supports page content context and chat history (last 20 messages). |
| `aiImageGeneration.ts` | Gemini image generation action using Google AI API. Supports gemini-2.0-flash-exp-image-generation (Nano Banana) and imagen-3.0-generate-002 (Nano Banana Pro) models. Features aspect ratio selection (1:1, 16:9, 9:16, 4:3, 3:4), Convex storage integration, and session-based image tracking. Requires GOOGLE_AI_API_KEY environment variable. |
| `newsletter.ts`    | Newsletter mutations and queries: subscribe, unsubscribe, getSubscriberCount, getActiveSubscribers, getAllSubscribers (admin), deleteSubscriber (admin), getNewsletterStats, getPostsForNewsletter, wasPostSent, recordPostSent, scheduleSendPostNewsletter, scheduleSendCustomNewsletter, scheduleSendStatsSummary, getStatsForSummary. |
| `newsletterActions.ts` | Newsletter actions (Node.js runtime): sendPostNewsletter, sendCustomNewsletter, sendWeeklyDigest, notifyNewSubscriber, sendWeeklyStatsSummary. Uses AgentMail SDK for email delivery. Includes markdown-to-HTML conversion for custom emails. |
| `contact.ts`       | Contact form mutations and actions: submitContact, sendContactEmail (AgentMail API), markEmailSent. |
| `versions.ts`      | Version control system: isEnabled, setEnabled, createVersion, getVersionHistory, getVersion, restoreVersion, cleanupOldVersions, getStats. Captures content snapshots before updates, provides 3-day history with diff view and restore functionality. |
| `askAI.ts`         | Ask AI session management: createSession mutation (creates streaming session with question/model in DB), getStreamBody query (for database fallback), getSessionByStreamId internal query (retrieves question/model for HTTP action). Uses Persistent Text Streaming component. |
| `askAI.node.ts`    | Ask AI HTTP action for streaming responses (Node.js runtime). Retrieves question from database, performs vector search using existing semantic search embeddings, generates AI response via Anthropic Claude or OpenAI GPT-4o, streams via appendChunk. Includes CORS headers and source citations. |
| `fs.ts`            | ConvexFS instance configuration with Bunny.net Edge Storage integration. Conditionally creates ConvexFS instance only when BUNNY_API_KEY, BUNNY_STORAGE_ZONE, and BUNNY_CDN_HOSTNAME environment variables are set. Exports `isBunnyConfigured` boolean and `fs` instance (or null if not configured). |
| `files.ts`         | File management mutations and queries for media library: commitFile (upload with validation), listFiles (paginated), deleteFile, deleteFiles (bulk), setFileExpiration, getFileInfo, getDownloadUrl, getFileCount, isConfigured. Validates file types (PNG, JPG, GIF, WebP) and size (10MB max). |
| `convex.config.ts` | Convex app configuration with aggregate component registrations (pageViewsByPath, totalPageViews, uniqueVisitors), persistentTextStreaming component, and ConvexFS component for media storage. |
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
| `/ask-ai-stream`              | Ask AI streaming endpoint for RAG-based Q&A (POST with streamId)              |

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
| `unlisted`      | Hide from listings but allow direct access via slug (optional). Set `true` to hide from blog listings, featured sections, tag pages, search results, and related posts. Post remains accessible via direct link. |
| `docsSection`   | Include in docs sidebar (optional). Set `true` to show in the docs section navigation. |
| `docsSectionGroup` | Group name for docs sidebar (optional). Posts with the same group name appear together. |
| `docsSectionOrder` | Order within docs group (optional). Lower numbers appear first within the group. |
| `docsSectionGroupOrder` | Order of the group in docs sidebar (optional). Lower numbers make the group appear first. Groups without this field sort alphabetically. |
| `docsSectionGroupIcon` | Phosphor icon name for docs sidebar group (optional, e.g., "Rocket", "Book", "PuzzlePiece"). Icon appears left of the group title. See [Phosphor Icons](https://phosphoricons.com) for available icons. |
| `docsLanding`   | Use as docs landing page (optional). Set `true` to show this post when navigating to `/docs`. |

## Static Pages (`content/pages/`)

Markdown files for static pages like About, Projects, Contact, Changelog.

**Special pages:**
- `home.md` (slug: `home-intro`): Homepage intro/bio content. Set `showInNav: false` to hide from navigation. Content syncs with `npm run sync` and displays on the homepage without redeploy. Headings (h1-h6) use blog post styling (`blog-h1` through `blog-h6`) with clickable anchor links. Lists, blockquotes, horizontal rules, and links also use blog styling classes for consistent typography. Use `textAlign` frontmatter field to control alignment (left/center/right, default: left). Falls back to `siteConfig.bio` if page not found or while loading.
- `footer.md` (slug: `footer`): Footer content managed via markdown sync. Set `showInNav: false` to hide from navigation. Content syncs with `npm run sync` and displays in the footer component without redeploy. Supports full markdown including links, paragraphs, and line breaks. Falls back to `siteConfig.footer.defaultContent` if page not found or while loading. This allows editing footer content without touching code.

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
| `docsSection`   | Include in docs sidebar (optional). Set `true` to show in the docs section navigation. |
| `docsSectionGroup` | Group name for docs sidebar (optional). Pages with the same group name appear together. |
| `docsSectionOrder` | Order within docs group (optional). Lower numbers appear first within the group. |
| `docsSectionGroupOrder` | Order of the group in docs sidebar (optional). Lower numbers make the group appear first. Groups without this field sort alphabetically. |
| `docsSectionGroupIcon` | Phosphor icon name for docs sidebar group (optional, e.g., "Rocket", "Book", "PuzzlePiece"). Icon appears left of the group title. See [Phosphor Icons](https://phosphoricons.com) for available icons. |
| `docsLanding`   | Use as docs landing page (optional). Set `true` to show this page when navigating to `/docs`. |

## Scripts (`scripts/`)

**Markdown sync v2 complete** - Full markdown content synchronization system with real-time sync from markdown files to Convex database, dashboard UI for content management, and sync server for executing sync commands from UI.

| File                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `sync-posts.ts`           | Syncs markdown files to Convex at build time (markdown sync v2). Generates `raw/index.md` with home.md content at top, posts/pages list, and footer.md content at bottom |
| `sync-discovery-files.ts` | Updates AGENTS.md, CLAUDE.md, and llms.txt with current app data  |
| `import-url.ts`           | Imports external URLs as markdown posts (Firecrawl)   |
| `configure-fork.ts`       | Automated fork configuration (reads fork-config.json, updates 14 files). ES module compatible using fileURLToPath for __dirname equivalent. |
| `send-newsletter.ts`      | CLI tool for sending newsletter posts (npm run newsletter:send <slug>). Calls scheduleSendPostNewsletter mutation directly. |
| `send-newsletter-stats.ts` | CLI tool for sending weekly stats summary (npm run newsletter:send:stats). Calls scheduleSendStatsSummary mutation directly. |
| `sync-server.ts`          | Local HTTP server for executing sync commands from Dashboard UI. Runs on localhost:3001 with optional token authentication. Whitelisted commands only. Part of markdown sync v2. |
| `export-db-posts.ts`      | Exports dashboard-created posts and pages to markdown files in `content/blog/` and `content/pages/`. Only exports content with `source: "dashboard"`. Supports development and production environments via `npm run export:db` and `npm run export:db:prod`. |

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

**Export dashboard content:**

- `npm run export:db` - Export dashboard posts/pages to content folders (development)
- `npm run export:db:prod` - Export dashboard posts/pages (production)

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
| `botMeta.ts` | Edge function for bot detection with configurable arrays for social preview bots, search engine bots, and AI crawlers. Serves pre-rendered HTML with correct canonical URLs and OG tags to social and search bots. Excludes `/raw/*` paths and AI crawlers from interception. Configuration documented at top of file. |
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

## Claude Skills (`.claude/skills/`)

| File           | Description                                          |
| -------------- | ---------------------------------------------------- |
| `frontmatter.md` | Frontmatter syntax and all field options for posts and pages |
| `convex.md`    | Convex patterns specific to this app (indexes, mutations, queries) |
| `sync.md`      | How sync commands work and content flow from markdown to database |

## CLI Package (`packages/create-markdown-sync/`)

NPM CLI package for scaffolding new markdown-sync projects with a single command.

| File | Description |
| ---- | ----------- |
| `package.json` | CLI package config with bin entry point |
| `tsconfig.json` | TypeScript config for CLI |
| `README.md` | NPM package readme |
| `src/index.ts` | Main entry point with CLI argument parsing |
| `src/wizard.ts` | Interactive prompts (13 sections, 50+ prompts) |
| `src/clone.ts` | Repository cloning via giget |
| `src/configure.ts` | Fork config generation and template fixes |
| `src/install.ts` | Dependency installation and dev server |
| `src/convex-setup.ts` | Convex project initialization |
| `src/utils.ts` | Validation helpers, logging, package manager detection |

**Usage:**
```bash
npx create-markdown-sync my-site
```

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

## OpenCode Configuration (`.opencode/`)

OpenCode AI-first development tool integration. Works alongside Claude Code and Cursor.

### Root Config

| File | Description |
| ---- | ----------- |
| `opencode.json` | Root OpenCode project configuration |
| `.opencode/config.json` | OpenCode app configuration |

### Agents (`.opencode/agent/`)

| File | Description |
| ---- | ----------- |
| `orchestrator.md` | Main orchestrator agent - routes tasks to specialists |
| `content-writer.md` | Content creation specialist for posts and pages |
| `sync-manager.md` | Sync and deployment specialist |

### Commands (`.opencode/command/`)

| File | Description |
| ---- | ----------- |
| `sync.md` | `/sync` - Sync content to development |
| `sync-prod.md` | `/sync-prod` - Sync content to production |
| `create-post.md` | `/create-post` - Create new blog post |
| `create-page.md` | `/create-page` - Create new page |
| `import.md` | `/import` - Import content from URL |
| `deploy.md` | `/deploy` - Deploy to production |

### Skills (`.opencode/skill/`)

| File | Description |
| ---- | ----------- |
| `frontmatter.md` | Frontmatter syntax for posts and pages |
| `sync.md` | How the sync system works |
| `convex.md` | Convex patterns and conventions |
| `content.md` | Content management guide |

### Plugins (`.opencode/plugin/`)

| File | Description |
| ---- | ----------- |
| `sync-helper.ts` | Logs reminders when content files change |
