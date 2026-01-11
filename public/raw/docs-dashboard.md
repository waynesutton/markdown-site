# Dashboard

---
Type: page
Date: 2026-01-11
---

## Dashboard

The Dashboard at `/dashboard` provides a centralized UI for managing content, configuring the site, and performing sync operations. It's designed for developers who fork the repository to set up and manage their markdown blog.

**Access:** Navigate to `/dashboard` in your browser. The dashboard is not linked in the navigation by default (similar to Newsletter Admin pattern).

**Authentication:** WorkOS authentication is optional. Configure it in `siteConfig.ts`:

```typescript
dashboard: {
  enabled: true,
  requireAuth: false, // Set to true to require WorkOS authentication
},
```

When `requireAuth` is `false`, the dashboard is open access. When `requireAuth` is `true` and WorkOS is configured, users must log in to access the dashboard. See [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos) for authentication setup.

### Content management

**Posts and Pages List Views:**

- View all posts and pages (published and unpublished)
- Filter by status: All, Published, Drafts
- Search by title or content
- Pagination with "First" and "Next" buttons
- Items per page selector (15, 25, 50, 100) - default: 15
- Edit, view, and publish/unpublish options
- WordPress-style UI with date, edit, view, and publish controls
- **Source Badge:** Shows "Dashboard" or "Synced" to indicate content origin
- **Delete Button:** Delete dashboard-created posts/pages directly (synced content protected)

**Post and Page Editor:**

- Markdown editor with live preview
- Frontmatter sidebar on the right with all available fields
- Draggable/resizable frontmatter sidebar (200px-600px width)
- Independent scrolling for frontmatter sidebar
- Preview mode shows content as it appears on the live site
- Download markdown button to generate `.md` files
- Copy markdown to clipboard
- All frontmatter fields editable in sidebar
- Preview uses ReactMarkdown with proper styling
- **Save to Database:** Green "Save" button saves changes directly to the database

**Write Post and Write Page:**

- Full-screen writing interface
- **Three Editor Modes:**
  - **Markdown:** Raw markdown editing (default)
  - **Rich Text:** WYSIWYG Quill editor with toolbar
  - **Preview:** Rendered markdown preview
- Word/line/character counts
- Frontmatter reference panel
- Download markdown button for new content
- **Save to DB:** Save directly to database without file sync
- Content persists in localStorage
- Separate storage for post and page content

### Cloud CMS features

The dashboard functions as a cloud-based CMS similar to WordPress, allowing you to create and edit content directly in the database without requiring the markdown file sync workflow.

**Dual Source Architecture:**

- **Dashboard Content:** Posts/pages created via "Save to DB" are marked with `source: "dashboard"`
- **Synced Content:** Posts/pages from markdown files are marked with `source: "sync"`
- Both coexist independently in the database
- Sync operations only affect synced content (dashboard content is protected)

**Direct Database Operations:**

- Create new posts/pages directly in the database
- Edit any post/page and save changes immediately
- Delete dashboard-created content
- Changes appear instantly (no sync required)

**Export to Markdown:**

- Any post/page can be exported as a `.md` file
- Includes all frontmatter fields
- Use for backup or converting to file-based workflow

**Bulk Export Script:**

```bash
npm run export:db           # Export dashboard posts to content/blog/
npm run export:db:prod      # Export from production database
```

Exports all dashboard-created posts and pages to markdown files in the content folders.

### Rich Text Editor

The Write Post and Write Page sections include a Quill-based rich text editor with three editing modes.

**Editing Modes:**

- **Markdown:** Raw markdown text editing (default mode)
- **Rich Text:** WYSIWYG editor with formatting toolbar
- **Preview:** Rendered preview of the content

**Rich Text Toolbar:**

- Headers (H1, H2, H3)
- Bold, italic, strikethrough
- Blockquote, code block
- Ordered and bullet lists
- Links
- Clear formatting

**Mode Switching:**

- Content automatically converts between HTML and Markdown when switching modes
- Frontmatter is preserved when editing in Rich Text mode
- Preview mode shows how content will appear on the live site

**Theme Integration:**

- Editor styling matches the current theme (dark, light, tan, cloud)
- Toolbar uses CSS variables for consistent appearance

### AI Agent

The Dashboard includes a dedicated AI Agent section with tab-based UI for Chat and Image Generation.

**Chat Tab:**

- Multi-model selector: Claude Sonnet 4, GPT-4o, Gemini 2.0 Flash
- Per-session chat history stored in Convex
- Markdown rendering for AI responses
- Copy functionality for AI responses
- Lazy API key validation (errors only shown when user tries to use a specific model)

**Image Tab:**

- AI image generation with two models:
  - Nano Banana (gemini-2.0-flash-exp-image-generation) - Experimental model
  - Nano Banana Pro (imagen-3.0-generate-002) - Production model
- Aspect ratio selection: 1:1, 16:9, 9:16, 4:3, 3:4
- Images stored in Convex storage with session tracking
- Gallery view of recent generated images

**Environment Variables (Convex):**

| Variable            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Required for Claude Sonnet 4                       |
| `OPENAI_API_KEY`    | Required for GPT-4o                                |
| `GOOGLE_AI_API_KEY` | Required for Gemini 2.0 Flash and image generation |

**Note:** Only configure the API keys for models you want to use. If a key is not set, users see a helpful setup message when they try to use that model.

### Ask AI (header chat)

The Ask AI feature adds a chat button to the site header. Visitors can ask questions about your content and get AI-powered answers with source citations.

**Configuration:**

In `src/config/siteConfig.ts`:

```typescript
askAI: {
  enabled: true, // Enable Ask AI header button
  defaultModel: "claude-sonnet-4-20250514",
  models: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
    { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  ],
},
```

**Requirements:**

- `semanticSearch.enabled: true` for content retrieval
- `OPENAI_API_KEY` in Convex for embeddings
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for the LLM

**Features:**

- Header button opens a chat modal
- Uses RAG (Retrieval Augmented Generation) to find relevant content
- Streaming responses with markdown rendering
- Multi-model selector
- Source citations linking to relevant posts/pages
- Conversation history within session

### Newsletter management

All Newsletter Admin features integrated into the Dashboard:

- **Subscribers:** View, search, filter, and delete subscribers
- **Send Newsletter:** Select a blog post to send as newsletter
- **Write Email:** Compose custom emails with markdown support
- **Recent Sends:** View last 10 newsletter sends (posts and custom emails)
- **Email Stats:** Dashboard with total emails, newsletters sent, active subscribers, retention rate

All newsletter sections are full-width in the dashboard content area.

### Content import

**Direct Database Import:**

The Import URL section uses server-side Firecrawl to import articles directly to the database.

- Enter any article URL to import
- Firecrawl scrapes and converts content to markdown
- Post is saved directly to the database (no file sync needed)
- Optional "Publish immediately" checkbox
- Imported posts tagged with `imported` by default
- Source attribution added automatically
- Success message with link to view the imported post

**Setup:**

Add `FIRECRAWL_API_KEY` to your Convex environment variables:

```bash
npx convex env set FIRECRAWL_API_KEY your-api-key-here
```

Get your API key from [firecrawl.dev](https://firecrawl.dev).

**CLI Import (Alternative):**

You can also import via command line:

```bash
npm run import <url>    # Import URL as local markdown file
```

This creates a file in `content/blog/` that requires syncing.

### Site configuration

**Config Generator:**

- UI to configure all settings in `src/config/siteConfig.ts`
- Generates downloadable `siteConfig.ts` file
- Hybrid approach: dashboard generates config, file-based config continues to work
- Includes all site configuration options:
  - Site name, title, logo, bio, intro
  - Blog page settings
  - Featured section configuration
  - Logo gallery settings
  - GitHub contributions
  - Footer and social footer
  - Newsletter settings
  - Contact form settings
  - Stats page settings
  - And more

**Index HTML Editor:**

- View and edit `index.html` content
- Meta tags, Open Graph, Twitter Cards, JSON-LD
- Download updated HTML file

### Analytics

- Real-time stats dashboard (clone of `/stats` page)
- Active visitors with per-page breakdown
- Total page views and unique visitors
- Views by page sorted by popularity
- Does not follow `siteConfig.statsPage` settings (always accessible in dashboard)

### Sync commands

**Sync Content Section:**

- UI with buttons for all sync operations
- Development sync commands:
  - `npm run sync` - Sync markdown content
  - `npm run sync:discovery` - Update discovery files (AGENTS.md, llms.txt)
  - `npm run sync:all` - Sync content + discovery files together
- Production sync commands:
  - `npm run sync:prod` - Sync markdown content
  - `npm run sync:discovery:prod` - Update discovery files
  - `npm run sync:all:prod` - Sync content + discovery files together
- Server status indicator shows if sync server is online
- Copy and Execute buttons for each command
- Real-time terminal output when sync server is running
- Command modal shows full command output when sync server is offline
- Toast notifications for success/error feedback

**Sync Server:**

- Local HTTP server for executing commands from dashboard
- Start with `npm run sync-server` (runs on localhost:3001)
- Execute commands directly from dashboard with real-time output streaming
- Optional token authentication via `SYNC_TOKEN` environment variable
- Whitelisted commands only for security
- Health check endpoint for server availability detection
- Copy icons for `npm run sync-server` command in dashboard

**Header Sync Buttons:**

- Quick sync buttons in dashboard header (right side)
- `npm run sync:all` (dev) button
- `npm run sync:all:prod` (prod) button
- One-click sync for all content and discovery files
- Automatically use sync server when available, fallback to command modal

### Dashboard features

**Search:**

- Search bar in header
- Search dashboard features, page titles, and post content
- Real-time results as you type

**Theme and Font:**

- Theme toggle (dark, light, tan, cloud)
- Font switcher (serif, sans, monospace)
- Preferences persist across sessions

**Mobile Responsive:**

- Fully responsive design
- Mobile-optimized layout
- Touch-friendly controls
- Collapsible sidebar on mobile

**Toast Notifications:**

- Success, error, info, and warning notifications
- Auto-dismiss after 4 seconds
- Theme-aware styling
- No browser default alerts

**Command Modal:**

- Shows sync command output
- Copy command to clipboard
- Close button to dismiss
- Theme-aware styling

### Technical details

**Database Architecture:**

- Uses Convex queries for real-time data
- All mutations follow Convex best practices (idempotent, indexed queries)
- `source` field tracks content origin ("dashboard" or "sync")
- `by_source` index for efficient filtering by source

**CMS Mutations (convex/cms.ts):**

- `createPost` / `createPage` - Create with `source: "dashboard"`
- `updatePost` / `updatePage` - Update any post/page
- `deletePost` / `deletePage` - Delete any post/page
- `exportPostAsMarkdown` / `exportPageAsMarkdown` - Generate markdown with frontmatter

**Import Action (convex/importAction.ts):**

- Server-side Convex action using Firecrawl
- Scrapes URL, converts to markdown, saves to database
- Handles slug conflicts by appending timestamp

**UI State:**

- Frontmatter sidebar width persisted in localStorage
- Editor content persisted in localStorage
- Independent scrolling for editor and sidebar sections
- Preview uses ReactMarkdown with remark-gfm, remark-breaks, rehype-raw, rehype-sanitize
- Rich text editor uses Quill with Turndown/Showdown for conversion

### Sync commands reference

Sync command scripts are located in `scripts/` (sync-posts.ts, sync-discovery-files.ts).

**Development:**

- <span class="copy-command">npm run sync</span> - Sync markdown content to development Convex
- <span class="copy-command">npm run sync:discovery</span> - Update discovery files (AGENTS.md, llms.txt) with development data
- <span class="copy-command">npm run sync:all</span> - Run both content sync and discovery sync (development)

**Production:**

- <span class="copy-command">npm run sync:prod</span> - Sync markdown content to production Convex
- <span class="copy-command">npm run sync:discovery:prod</span> - Update discovery files with production data
- <span class="copy-command">npm run sync:all:prod</span> - Run both content sync and discovery sync (production)

**Sync Server:**

- <span class="copy-command">npm run sync-server</span> - Start local HTTP server for executing sync commands from dashboard UI

**Content Import:**

- <span class="copy-command">npm run import &lt;url&gt;</span> - Import external URL as markdown post (requires FIRECRAWL_API_KEY in .env.local)

**Database Export:**

- <span class="copy-command">npm run export:db</span> - Export dashboard posts/pages to content folders (development)
- <span class="copy-command">npm run export:db:prod</span> - Export dashboard posts/pages (production)

**Note:** The dashboard provides a UI for these commands. When the sync server is running (`npm run sync-server`), you can execute commands directly from the dashboard with real-time output. Otherwise, the dashboard shows commands in a modal for copying to your terminal.

### Version control

The dashboard includes a Sync version control system that tracks changes to posts, pages, home content, and footer content.

**Features:**

- 3-day version history for all content
- Toggle to enable/disable version control
- View version history with unified diff visualization
- Preview previous versions
- One-click restore with automatic backup
- Automatic cleanup of versions older than 3 days

**Enabling version control:**

1. Navigate to Dashboard > Config
2. Find the "Version Control" card
3. Toggle "Enable version control" on

When enabled, versions are captured:

- Before sync updates (from markdown files)
- Before dashboard edits (Save Changes button)
- Before restoring a previous version

**Viewing version history:**

1. Open any post or page in the Dashboard editor
2. Click the clock (History) button in the editor toolbar
3. Select a version from the list to view details
4. Toggle between "Diff" and "Preview" modes
5. Click "Restore This Version" to revert

**How it works:**

- Versions are stored in the `contentVersions` table
- Settings stored in `versionControlSettings` table (database, not config file)
- Cleanup runs daily at 3:00 AM UTC via cron job
- Restore creates a backup of current content before reverting
- Uses existing DiffCodeBlock component for diff visualization

**Version sources:**

| Source    | When created                 |
| --------- | ---------------------------- |
| sync      | Before markdown sync updates |
| dashboard | Before dashboard edits       |
| restore   | Before restoring a version   |

**Stats display:**

The Version Control card in Config shows:

- Total version count
- Post versions count
- Page versions count

### Environment variables

**Convex Environment Variables:**

| Variable            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Required for Claude Sonnet 4 (AI Agent)            |
| `OPENAI_API_KEY`    | Required for GPT-4o (AI Agent)                     |
| `GOOGLE_AI_API_KEY` | Required for Gemini 2.0 Flash and image generation |
| `FIRECRAWL_API_KEY` | Required for direct URL import                     |

Set Convex environment variables with:

```bash
npx convex env set VARIABLE_NAME value
```

**Local Environment Variables (.env.local):**

| Variable            | Description                               |
| ------------------- | ----------------------------------------- |
| `VITE_CONVEX_URL`   | Your Convex deployment URL (auto-created) |
| `FIRECRAWL_API_KEY` | For CLI import command only               |