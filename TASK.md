# Markdown Blog - Tasks

## To Do

## Current Status

v2.10.0 ready. Semantic search with vector embeddings added to complement keyword search.

## Completed

- [x] Semantic search with vector embeddings
  - [x] Dual search modes: Keyword (exact match) and Semantic (meaning-based)
  - [x] Toggle between modes in search modal (Cmd+K) with TextAa and Brain icons
  - [x] OpenAI text-embedding-ada-002 for generating 1536-dimension embeddings
  - [x] Similarity scores displayed as percentages in search results
  - [x] Graceful fallback when OPENAI_API_KEY not configured
  - [x] Embeddings generated automatically during `npm run sync`
  - [x] New `convex/embeddings.ts` with embedding generation actions
  - [x] New `convex/embeddingsQueries.ts` with queries and mutations for embedding storage
  - [x] New `convex/semanticSearch.ts` with vector search action
  - [x] New `convex/semanticSearchQueries.ts` with internal queries
  - [x] Added `embedding` field and `by_embedding` vector index to posts and pages
  - [x] Updated SearchModal.tsx with mode toggle and semantic search integration
  - [x] Documentation pages: `docs-search.md` and `docs-semantic-search.md`

- [x] Dashboard Cloud CMS features
  - [x] Dual source architecture: `source: "dashboard"` vs `source: "sync"` coexist independently
  - [x] Direct database operations: "Save to DB" in Write sections, "Save Changes" in editor
  - [x] Source badges in Posts and Pages list views (blue Dashboard, gray Synced)
  - [x] Delete button for dashboard-created content only
  - [x] Delete confirmation modal with warning icon and danger button styling
  - [x] Server-side URL import via Firecrawl (direct to database)
  - [x] Export to markdown for backup or file-based workflow conversion
  - [x] Bulk export script: `npm run export:db` and `npm run export:db:prod`
  - [x] New `convex/cms.ts` with CRUD mutations
  - [x] New `convex/importAction.ts` with Firecrawl action
  - [x] New `scripts/export-db-posts.ts` for bulk export
  - [x] Updated sync mutations to preserve dashboard content

- [x] Rich Text Editor (Quill) in Dashboard
  - [x] Three editing modes: Markdown (default), Rich Text (Quill), Preview
  - [x] Quill toolbar: headers, bold, italic, strikethrough, blockquote, code, lists, links
  - [x] Automatic HTML-to-Markdown conversion on mode switch
  - [x] Theme-aware styling using CSS variables

- [x] Dashboard UI fixes
  - [x] Fixed source badge overlap with edit pencil in list rows
  - [x] Adjusted grid column widths for proper badge display
  - [x] Added source-badge CSS styles with proper spacing

- [x] Write page frontmatter sidebar toggle fix
  - [x] Added CSS rules for `.write-layout.frontmatter-collapsed` to adjust grid when sidebar collapsed
  - [x] Added CSS rules for `.write-layout.sidebar-collapsed.frontmatter-collapsed` for both sidebars collapsed
  - [x] Added responsive tablet styles for frontmatter collapsed state
  - [x] Frontmatter toggle now works consistently in both focus mode and normal mode

- [x] Fork configuration improvements
  - [x] Updated `scripts/configure-fork.ts` to update 3 additional files (DocsPage.tsx, mcp.ts, send-newsletter.ts)
  - [x] Improved `updateOpenApiYaml()` to handle all example URLs in OpenAPI spec
  - [x] Changed logoGallery hrefs from hardcoded markdown.fast URLs to relative URLs
  - [x] Updated `FORK_CONFIG.md` with complete file list (14 files, was 11)
  - [x] Updated `content/blog/fork-configuration-guide.md` with accurate file count
  - [x] Added missing options to `fork-config.json.example` (statsPage, mcpServer, imageLightbox)

- [x] Search result highlighting and scroll-to-match
  - [x] Created `useSearchHighlighting.ts` hook with polling mechanism to wait for content load
  - [x] Search query passed via `?q=` URL parameter for highlighting on destination page
  - [x] All matching text highlighted with theme-appropriate colors (dark/light/tan/cloud)
  - [x] First match scrolls into view centered in viewport with header offset
  - [x] Highlights pulse on arrival, fade to subtle after 4 seconds
  - [x] Press Escape to clear highlights
  - [x] Updated SearchModal.tsx, BlogPost.tsx, Post.tsx, global.css

- [x] Update AI service links to use local /raw URLs
  - [x] Changed ChatGPT, Claude, Perplexity links from GitHub raw URLs to `/raw/{slug}.md`
  - [x] Simplified AI prompt to "Read this URL and summarize it:"
  - [x] Removed unused `siteConfig` import and `getGitHubRawUrl` function
  - [x] URLs now constructed using `window.location.origin` for consistency

- [x] Update raw/index.md to include home.md and footer.md content
  - [x] Updated `generateHomepageIndex` function in `scripts/sync-posts.ts`
  - [x] Home intro content (slug: home-intro) now displays at top of index.md
  - [x] Footer content (slug: footer) now displays at bottom of index.md
  - [x] Horizontal rule separators between sections
  - [x] Falls back to generic message if home-intro page not found
  - [x] Mirrors actual homepage structure for AI agents reading raw markdown

- [x] Fix footer not displaying on docs section pages with showFooter: true
  - [x] Added footer.md content query to Post.tsx (matching Home.tsx and Blog.tsx pattern)
  - [x] Updated all 4 Footer component calls to use `post.footer || footerPage?.content` pattern
  - [x] Footer now falls back to footer.md content when no per-post footer is specified
  - [x] Priority order: per-post frontmatter `footer:` > synced footer.md content > siteConfig.footer.defaultContent
  - [x] Updated docs.md, files.md, changelog.md, changelog-page.md with fix documentation

- [x] Centralize defaultTheme in siteConfig.ts
  - [x] Added `defaultTheme` field to siteConfig.ts (type: `Theme`)
  - [x] Added `Theme` type export to siteConfig.ts
  - [x] Updated ThemeContext.tsx to import and use siteConfig.defaultTheme
  - [x] Updated configure-fork.ts to update siteConfig.ts instead of ThemeContext.tsx
  - [x] Renamed `updateThemeContext` to `updateThemeConfig` in configure-fork.ts
  - [x] Updated docs.md Theme section with new siteConfig.ts example
  - [x] Updated setup-guide.md "Change the Default Theme" section
  - [x] Updated FORK_CONFIG.md with new theme configuration instructions
  - [x] Updated fork-configuration-guide.md with siteConfig.ts reference
  - [x] Backward compatible: falls back to "tan" if defaultTheme not set

- [x] Docs sidebar group icons via frontmatter
  - [x] Added `docsSectionGroupIcon` frontmatter field for posts and pages
  - [x] Icon appears left of the group title expand/collapse chevron
  - [x] Uses Phosphor Icons (55 supported icon names)
  - [x] Icon weight: regular, size: 16px
  - [x] Only one item per group needs to specify the icon
  - [x] Graceful fallback if icon name not recognized
  - [x] Updated sync-posts.ts, schema.ts, posts.ts, pages.ts
  - [x] Updated DocsSidebar.tsx with icon mapping and rendering
  - [x] Added CSS styles for group icons
  - [x] Updated frontmatter.md skill with icon documentation
  - [x] Updated docs.md, files.md, setup-guide.md with new field

- [x] Multi-model AI chat and image generation in Dashboard
  - [x] AI Agent section with tab-based UI (Chat and Image Generation tabs)
  - [x] Multi-model selector for text chat (Claude Sonnet 4, GPT-4o, Gemini 2.0 Flash)
  - [x] Lazy API key validation with friendly setup instructions per provider
  - [x] Image generation with Nano Banana (gemini-2.0-flash-exp-image-generation) and Nano Banana Pro (imagen-3.0-generate-002)
  - [x] Aspect ratio selector for images (1:1, 16:9, 9:16, 4:3, 3:4)
  - [x] Generated images stored in Convex storage with session tracking
  - [x] New `aiDashboard` configuration in siteConfig.ts
  - [x] New `convex/aiImageGeneration.ts` for Gemini image generation
  - [x] New `aiGeneratedImages` table in schema for tracking generated images
  - [x] Updated aiChatActions.ts with multi-provider support (Anthropic, OpenAI, Google)
  - [x] Updated AIChatView.tsx with selectedModel prop
  - [x] CSS styles for AI Agent tabs, model selectors, and image display
  - [x] Updated files.md, changelog.md, TASK.md, changelog-page.md

- [x] Social footer icons in header navigation
  - [x] Added `showInHeader` option to `siteConfig.socialFooter` config
  - [x] Exported `platformIcons` from SocialFooter.tsx for reuse
  - [x] Updated Layout.tsx to render social icons in header (left of search)
  - [x] Added CSS styles for `.header-social-links` and `.header-social-link`
  - [x] Added showInHeader to configure-fork.ts for automated setup
  - [x] Updated FORK_CONFIG.md, fork-config.json.example, docs.md, setup-guide.md

- [x] YouTube and Twitter/X embed support with domain whitelisting
  - [x] Added `ALLOWED_IFRAME_DOMAINS` constant for whitelisted domains (YouTube, Twitter/X)
  - [x] Added `iframe` to sanitize schema with allowed attributes
  - [x] Added custom iframe component handler with domain validation
  - [x] Auto-adds `sandbox` and `loading="lazy"` attributes for security
  - [x] Non-whitelisted iframes silently blocked
  - [x] Added `.embed-container` CSS styles for responsive embeds
  - [x] Updated markdown-with-code-examples.md with Embeds section
  - [x] Works on both blog posts and pages
  - [x] Updated files.md, TASK.md, changelog.md, changelog-page.md

- [x] Author pages at `/author/:authorSlug` with post list
  - [x] Added `by_authorName` index to posts table in convex/schema.ts
  - [x] Added `getAllAuthors` and `getPostsByAuthor` queries in convex/posts.ts
  - [x] Created AuthorPage.tsx component with view mode toggle (list/cards)
  - [x] Added `/author/:authorSlug` route in App.tsx
  - [x] Made authorName clickable in Post.tsx (links to author page)
  - [x] Added author link styles and author page styles to global.css
  - [x] Added author pages to sitemap in convex/http.ts
  - [x] Updated files.md with AuthorPage.tsx documentation
  - [x] Saved implementation plan to prds/authorname-blogs.md

- [x] Homepage intro loading flash fix
  - [x] Removed "Loading..." text from Suspense fallback in main.tsx
  - [x] Fixed Home.tsx conditional to render nothing while homeIntro query loads (undefined vs null)
  - [x] Home intro content now appears without any visible loading state or fallback
  - [x] Matches loading pattern used by Post.tsx for docs pages

- [x] ES module compatibility fix for configure-fork.ts
  - [x] Fixed `__dirname is not defined` error when running `npm run configure`
  - [x] Added `fileURLToPath` import from `url` module
  - [x] Created ES module equivalent of `__dirname` using `import.meta.url`
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md

- [x] Footer content via markdown page (footer.md)
  - [x] Created `content/pages/footer.md` for managing footer content via markdown sync
  - [x] Footer content syncs with `npm run sync` without redeploy needed
  - [x] Falls back to `siteConfig.footer.defaultContent` when page not found
  - [x] Updated Home.tsx and Blog.tsx to fetch footer page by slug
  - [x] Updated files.md, changelog.md, changelog-page.md, FORK_CONFIG.md with documentation

- [x] CLAUDE.md and Claude skills documentation
  - [x] Created CLAUDE.md in root with project instructions for Claude Code
  - [x] Created .claude/skills/ directory with three focused skill files
  - [x] frontmatter.md: Complete frontmatter syntax and all 25+ field options
  - [x] convex.md: Convex patterns specific to this app (indexes, idempotent mutations, conflict prevention)
  - [x] sync.md: How sync commands work and content flow from markdown to database
  - [x] Updated sync-discovery-files.ts to automatically update CLAUDE.md during sync
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md with feature documentation

- [x] Image lightbox for blog posts and pages
  - [x] Added ImageLightboxConfig interface to siteConfig.ts with enabled option
  - [x] Created ImageLightbox component in BlogPost.tsx with backdrop, close button, keyboard support
  - [x] Updated img renderer to add click handler and clickable cursor when lightbox enabled
  - [x] Added CSS styles for lightbox backdrop, image, close button, and caption
  - [x] Added imageLightboxEnabled to Dashboard config generator
  - [x] Updated documentation: docs.md, setup-guide.md, files.md, changelog.md, changelog-page.md
  - [x] Images show pointer cursor and hover effect when lightbox is enabled
  - [x] Lightbox closes on backdrop click, Escape key, or close button
  - [x] Alt text displayed as caption in lightbox
  - [x] Default configuration: enabled: true (lightbox active by default)

- [x] Stats page configuration option for public/private access
  - [x] Added StatsPageConfig interface to siteConfig.ts with enabled and showInNav options
  - [x] Updated App.tsx to conditionally render /stats route based on config
  - [x] Updated Stats.tsx to check if enabled and show disabled message if not
  - [x] Updated Layout.tsx to hide stats nav item when disabled
  - [x] Default configuration: enabled: true (public), showInNav: true (visible in nav)
  - [x] Follows same pattern as NewsletterAdmin for consistency
  - [x] Updated files.md with stats page configuration notes
  - [x] Updated changelog.md with v1.43.0 entry
  - [x] Updated TASK.md with completed task

- [x] Honeypot bot protection for contact and newsletter forms
  - [x] Added honeypot state and hidden field to ContactForm.tsx
  - [x] Added honeypot state and hidden field to NewsletterSignup.tsx
  - [x] Hidden "Website" field for contact form bot detection
  - [x] Hidden "Fax" field for newsletter signup bot detection
  - [x] Bots receive fake success message (no data submitted)
  - [x] CSS positioning (position: absolute, left: -9999px) hides fields from users
  - [x] aria-hidden="true" and tabIndex={-1} for accessibility
  - [x] Different field names per form to avoid pattern detection
  - [x] Updated files.md with honeypot protection notes
  - [x] Updated changelog.md with v1.42.0 entry

- [x] Blog heading styles for home intro content
  - [x] Added generateSlug, getTextContent, HeadingAnchor helper functions to Home.tsx
  - [x] Updated ReactMarkdown components to include h1-h6 with blog-h\* classes
  - [x] Added clickable anchor links (#) that appear on hover for each heading
  - [x] Automatic ID generation from heading text for anchor navigation
  - [x] Added blog styling for lists (blog-ul, blog-ol, blog-li), blockquotes (blog-blockquote), horizontal rules (blog-hr), and links (blog-link)
  - [x] Updated files.md, changelog.md, changelog-page.md, TASK.md with feature documentation
  - [x] Home intro headings now match blog post typography and spacing

- [x] Synced home intro content via markdown file (home.md)
  - [x] Created content/pages/home.md (slug: home-intro) for homepage intro text
  - [x] Home.tsx fetches content from Convex via getPageBySlug query
  - [x] Added textAlign frontmatter field for pages (left/center/right, default: left)
  - [x] Added featuredTitle to siteConfig.ts for configurable featured section title
  - [x] Full markdown support with links, headings, lists, blockquotes, horizontal rules
  - [x] External links automatically open in new tab
  - [x] Fallback to siteConfig.bio if home-intro page not found (loading/error states)
  - [x] Content syncs with npm run sync (no redeploy needed for homepage text changes)
  - [x] Updated convex/schema.ts with textAlign field
  - [x] Updated convex/pages.ts with textAlign in queries and mutations
  - [x] Updated scripts/sync-posts.ts to parse textAlign from frontmatter
  - [x] Updated src/styles/global.css with home-intro-content styles
  - [x] Updated files.md, changelog.md, TASK.md documentation

- [x] HTTP-based MCP Server on Netlify
  - [x] Created netlify/edge-functions/mcp.ts with JSON-RPC 2.0 implementation
  - [x] Added @modelcontextprotocol/sdk dependency to package.json
  - [x] Configured Netlify rate limiting (50 req/min public, 1000 req/min authenticated)
  - [x] Implemented optional authentication via Authorization header
  - [x] Added /mcp edge function route to netlify.toml
  - [x] Created blog post "How to Use the MCP Server" with fork setup instructions
  - [x] Updated documentation (docs.md, setup-guide.md, files.md, changelog.md, README.md)
  - [x] Added MCP configuration to siteConfig.ts
  - [x] Seven tools implemented: list_posts, get_post, list_pages, get_page, get_homepage, search_content, export_all
  - [x] CORS support for MCP clients
  - [x] Manual JSON-RPC implementation (no SDK dependency on Deno runtime)

- [x] Newsletter CLI improvements
  - [x] Updated newsletter:send to call scheduleSendPostNewsletter mutation directly
  - [x] Added newsletter:send:stats command for weekly stats summary
  - [x] Created scheduleSendStatsSummary mutation in convex/newsletter.ts
  - [x] Created send-newsletter-stats.ts script
  - [x] Verified all AgentMail features use environment variables (no hardcoded emails)
  - [x] Updated documentation (docs.md, files.md, changelog.md, changelog-page.md, TASK.md)
  - [x] Created blog post "How to use AgentMail with Markdown Sync"

- [x] showImageAtTop frontmatter field for posts and pages
  - [x] Added showImageAtTop optional boolean field to convex/schema.ts for posts and pages
  - [x] Updated scripts/sync-posts.ts to parse showImageAtTop from frontmatter
  - [x] Updated convex/posts.ts and convex/pages.ts queries and mutations to include showImageAtTop
  - [x] Updated src/pages/Post.tsx to conditionally render image at top when showImageAtTop: true
  - [x] Added CSS styles for .post-header-image and .post-header-image-img
  - [x] Updated src/pages/Write.tsx to include showImageAtTop in POST_FIELDS and PAGE_FIELDS
  - [x] Updated documentation: docs.md, how-to-publish.md, using-images-in-posts.md, files.md
  - [x] Image displays full-width above post header with rounded corners
  - [x] Default behavior: image only used for OG and featured cards when showImageAtTop not set

- [x] Blog page featured layout with hero post
  - [x] `blogFeatured` frontmatter field for posts to mark as featured on blog page
  - [x] `BlogHeroCard` component for the hero featured post (first blogFeatured post)
  - [x] Featured row displays remaining blogFeatured posts in 2-column grid with excerpts
  - [x] Regular posts display in 3-column grid without excerpts
  - [x] `getBlogFeaturedPosts` query returns all published posts with `blogFeatured: true`
  - [x] `PostList` component updated with `columns` prop (2 or 3) and `showExcerpts` prop
  - [x] Schema updated with `blogFeatured` field and `by_blogFeatured` index
  - [x] sync-posts.ts updated to parse `blogFeatured` frontmatter
  - [x] Hero card displays landscape image, tags, date, title, excerpt, author info, and read more link
  - [x] Featured row shows excerpts for blogFeatured posts
  - [x] Regular posts hide excerpts for cleaner grid layout
  - [x] Responsive design: hero stacks on mobile, grids adjust columns at breakpoints
  - [x] CSS styles for `.blog-hero-section`, `.blog-hero-card`, `.blog-featured-row`, `.post-cards-2col`
  - [x] Card images use 16:10 landscape aspect ratio matching Giga.ai style
  - [x] Footer support on blog page via `siteConfig.footer.showOnBlogPage`

- [x] AI Chat Write Agent (Agent) integration
  - [x] AIChatView component created with Anthropic Claude API integration
  - [x] Write page AI Agent mode toggle (replaces textarea when active)
  - [x] RightSidebar AI chat support via frontmatter aiChat: true field
  - [x] Per-session, per-context chat history stored in Convex (aiChats table)
  - [x] Page content context support for AI responses
  - [x] Markdown rendering for AI responses with copy functionality
  - [x] Error handling for missing API keys with user-friendly messages
  - [x] System prompt configurable via Convex environment variables
  - [x] Anonymous session authentication using localStorage session ID
  - [x] Chat history limited to last 20 messages for context efficiency
  - [x] Title changes to "Agent" when in AI chat mode on Write page
  - [x] Toggle button text changes between "Agent" and "Text Editor"
  - [x] SiteConfig.aiChat configuration with enabledOnWritePage and enabledOnContent flags
  - [x] Schema updated with aiChats table and aiChat fields on posts/pages tables
  - [x] sync-posts.ts updated to handle aiChat frontmatter field
  - [x] Documentation updated across all files

- [x] Fixed AI chat scroll prevention in Write page
  - [x] Added viewport height constraints (100vh) to write-layout to prevent page-level scrolling
  - [x] Updated write-main with max-height: 100vh and overflow: hidden when AI chat is active
  - [x] Added min-height: 0 to flex children (write-ai-chat-container, ai-chat-view, ai-chat-messages) for proper flex behavior
  - [x] Input container fixed at bottom with flex-shrink: 0
  - [x] Sidebars (left and right) scroll internally with overflow-y: auto
  - [x] Delayed focus in AIChatView (100ms setTimeout) to prevent scroll jump on mount
  - [x] Added preventScroll: true to all focus() calls in AIChatView
  - [x] Toggle button preserves scroll position using requestAnimationFrame
  - [x] useEffect scrolls to top when switching to AI chat mode
  - [x] Messages area scrolls internally while input stays fixed at bottom (ChatGPT-style behavior)

- [x] Custom homepage configuration feature
  - [x] Added HomepageConfig interface to siteConfig.ts
  - [x] Updated App.tsx to conditionally render homepage based on config
  - [x] Updated Post.tsx to accept optional props for homepage mode (slug, isHomepage, homepageType)
  - [x] Back button hidden when Post component is used as homepage
  - [x] Original homepage route accessible at /home when custom homepage is set
  - [x] SEO metadata uses page/post frontmatter when used as homepage
  - [x] Updated configure-fork.ts to support homepage configuration
  - [x] Updated FORK_CONFIG.md with homepage documentation
  - [x] Updated fork-config.json.example with homepage option
  - [x] All existing features (sidebar, footer, right sidebar) work correctly with custom homepage

- [x] Image support in footer component with size control
  - [x] Footer sanitize schema updated to allow width, height, style, class attributes on images
  - [x] Footer image component handler updated to pass through size attributes
  - [x] CSS styles added for footer images (.site-footer-image-wrapper, .site-footer-image, .site-footer-image-caption)
  - [x] Images support lazy loading and optional captions from alt text
  - [x] Security verified: rehypeSanitize sanitizes style attributes to remove dangerous CSS
  - [x] Updated files.md, changelog.md with image support documentation

- [x] Customizable footer component with markdown support
  - [x] Footer component created (src/components/Footer.tsx) with ReactMarkdown rendering
  - [x] Footer configuration added to siteConfig.ts (FooterConfig interface with defaultContent)
  - [x] Footer content can be set in frontmatter footer field (markdown) or siteConfig.defaultContent
  - [x] Footer can be enabled/disabled globally and per-page type
  - [x] showFooter and footer frontmatter fields added for posts and pages
  - [x] Footer renders inside article tag at bottom for posts/pages
  - [x] Footer maintains current position on homepage
  - [x] Updated Home.tsx to use Footer component with defaultContent
  - [x] Updated Post.tsx to render Footer inside article based on showFooter
  - [x] Added CSS styles for site-footer (.site-footer, .site-footer-content, .site-footer-text, .site-footer-link)
  - [x] Updated schema.ts, posts.ts, pages.ts with showFooter and footer fields
  - [x] Updated sync-posts.ts to parse showFooter and footer frontmatter
  - [x] Updated Write.tsx to include showFooter and footer in frontmatter reference
  - [x] Sidebars flush to bottom when footer is enabled (min-height ensures proper extension)
  - [x] Updated files.md, changelog.md with footer feature documentation

- [x] Fixed right sidebar default behavior: now requires explicit `rightSidebar: true` in frontmatter
- [x] Pages/posts without rightSidebar frontmatter render normally with CopyPageDropdown in nav
- [x] Fixed TypeScript errors: Added rightSidebar to syncPosts and syncPostsPublic args validators
- [x] Right sidebar feature with CopyPageDropdown support
- [x] RightSidebar component created
- [x] Three-column layout CSS (left sidebar, main content, right sidebar)
- [x] Right sidebar configuration in siteConfig.ts
- [x] rightSidebar frontmatter field for posts and pages
- [x] Updated Post.tsx to conditionally render right sidebar
- [x] Updated schema.ts, posts.ts, pages.ts to handle rightSidebar field
- [x] Updated sync-posts.ts to parse rightSidebar frontmatter
- [x] Updated Write.tsx to include rightSidebar option
- [x] Responsive behavior: right sidebar hidden below 1135px
- [x] CopyPageDropdown automatically moves from nav to right sidebar when enabled

- [x] Font family configuration system with siteConfig integration
- [x] Added FontContext.tsx for global font state management
- [x] Monospace font option added to FONT SWITCHER (IBM Plex Mono)
- [x] CSS variable --font-family for dynamic font updates
- [x] Write page font switcher updated to support serif/sans/monospace
- [x] Fork configuration support for fontFamily option
- [x] Documentation updated (setup-guide.md, docs.md)
- [x] Font preference persistence with localStorage
- [x] SiteConfig default font detection and override logic

- [x] Plain text code blocks now wrap text properly instead of horizontal overflow
- [x] Updated inline vs block code detection logic in BlogPost.tsx
- [x] Added `pre-wrap` styling for text blocks via SyntaxHighlighter props
- [x] RSS feed validation errors fixed by standardizing URLs to www.markdown.fast
- [x] Updated index.html meta tags (og:url, og:image, twitter:domain, twitter:url, twitter:image, JSON-LD)
- [x] Updated convex/rss.ts and convex/http.ts SITE_URL constants
- [x] Updated public/robots.txt, public/openapi.yaml, and public/llms.txt with www URLs
- [x] RSS exclusions confirmed in netlify.toml for botMeta edge function
- [x] Discovery files sync script (sync-discovery-files.ts)
- [x] Automated updates for AGENTS.md and llms.txt with current app data
- [x] New npm scripts: sync:discovery, sync:discovery:prod, sync:all, sync:all:prod
- [x] Fork configuration updated to support gitHubRepo config
- [x] Backward compatibility for legacy githubUsername/githubRepo fields
- [x] Documentation updated across all files with new sync commands

- [x] Homepage post limit configuration (homePostsLimit in siteConfig.postsDisplay)
- [x] Optional "read more" link below limited post list (homePostsReadMore config)
- [x] Customizable link text and destination URL
- [x] CSS styling for read more link with hover effects
- [x] Conditional rendering logic to show link only when posts are limited
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
