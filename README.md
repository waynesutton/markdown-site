# markdown "sync" framework

An open-source publishing framework for AI agents and developers. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.

Write markdown locally, run `npm run sync` (dev) or `npm run sync:prod` (production), and content appears instantly across all connected browsers. Built with React, Convex, and Vite. Optimized for AEO, GEO, and LLM discovery.

**How publishing works:** Write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so all connected browsers update automatically.

**How versioning works:** Markdown files live in `content/blog/` and `content/pages/`. These are regular files in your git repo. Commit changes, review diffs, roll back like any codebase. The sync command pushes content to Convex.

```bash
# Edit, commit, sync
git add content/blog/my-post.md
git commit -m "Update post"
npm run sync        # dev
npm run sync:prod   # production
```

## Features

- Markdown-based blog posts with frontmatter
- Syntax highlighting for code blocks
- Four theme options: Dark, Light, Tan (default), Cloud
- Real-time data with Convex
- Fully responsive design
- Real-time analytics at `/stats`
- Full text search with Command+K shortcut
- Featured section with list/card view toggle
- Logo gallery with continuous marquee scroll
- GitHub contributions graph with year navigation
- Static raw markdown files at `/raw/{slug}.md`
- Dedicated blog page with configurable navigation order
- Markdown writing page at `/write` with frontmatter reference

### SEO and Discovery

- RSS feeds at `/rss.xml` and `/rss-full.xml` (with full content)
- Dynamic sitemap at `/sitemap.xml`
- JSON-LD structured data for Google rich results
- Open Graph and Twitter Card meta tags
- `robots.txt` with AI crawler rules
- `llms.txt` for AI agent discovery

### AI and LLM Access

- `/api/posts` - JSON list of all posts for agents
- `/api/post?slug=xxx` - Single post JSON or markdown
- `/api/export` - Batch export all posts with full content
- `/raw/{slug}.md` - Static raw markdown files for each post and page
- `/rss-full.xml` - Full content RSS for LLM ingestion
- `/.well-known/ai-plugin.json` - AI plugin manifest
- `/openapi.yaml` - OpenAPI 3.0 specification
- Copy Page dropdown for sharing to ChatGPT, Claude, Perplexity

### Content Import

- Import external URLs as markdown posts using Firecrawl
- Run `npm run import <url>` to scrape and create draft posts locally
- Then sync to dev or prod with `npm run sync` or `npm run sync:prod`

## Files to Update When Forking

When you fork this project, update these files with your site information:

| File                                | What to update                                              |
| ----------------------------------- | ----------------------------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, title, intro, bio, blog page, logo gallery, GitHub contributions |
| `src/pages/Home.tsx`                | Intro paragraph text (hardcoded JSX)                        |
| `convex/http.ts`                    | `SITE_URL`, `SITE_NAME`, description strings (3 locations)  |
| `convex/rss.ts`                     | `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` (RSS feeds)    |
| `src/pages/Post.tsx`                | `SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE` (OG tags)       |
| `index.html`                        | Title, meta description, OG tags, JSON-LD                   |
| `public/llms.txt`                   | Site name, URL, description, topics                         |
| `public/robots.txt`                 | Sitemap URL and header comment                              |
| `public/openapi.yaml`               | API title, server URL, site name in examples                |
| `public/.well-known/ai-plugin.json` | Site name, descriptions                                     |

See the [Setup Guide](/setup-guide) for detailed configuration examples.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Convex account

### Setup

1. Install dependencies:

```bash
npm install
```

2. Initialize Convex:

```bash
npx convex dev
```

This will create your Convex project and generate the `.env.local` file.

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:5173

## Writing Blog Posts

Create markdown files in `content/blog/` with frontmatter:

## Static Pages (Optional)

Create optional pages like About, Projects, or Contact in `content/pages/`:

```markdown
---
title: "About"
slug: "about"
published: true
order: 1
---

Your page content here...
```

Pages appear as navigation links in the top right, next to the theme toggle. The `order` field controls display order (lower numbers first).

```markdown
---
title: "Your Post Title"
description: "A brief description"
date: "2025-01-15"
slug: "your-post-slug"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
image: "/images/my-header.png"
excerpt: "Short text for featured cards"
---

Your markdown content here...
```

## Images

### Open Graph Images

Add an `image` field to frontmatter for social media previews:

```yaml
image: "/images/my-header.png"
```

Recommended dimensions: 1200x630 pixels. Images can be local (`/images/...`) or external URLs.

### Inline Images

Add images in markdown content:

```markdown
![Alt text description](/images/screenshot.png)
```

Place image files in `public/images/`. The alt text displays as a caption.

### Image deployment

Images are served as static files from your git repository, not synced to Convex. After adding images:

1. Add image files to `public/images/`
2. Reference in frontmatter (`image: "/images/my-image.png"`) or markdown (`![Alt](/images/my-image.png)`)
3. Commit and push to git
4. Netlify rebuilds and serves the images

The `npm run sync` command only syncs markdown text content. Images require a full deploy via git push.

### Site Logo

Edit `src/pages/Home.tsx` to set your site logo:

```typescript
const siteConfig = {
  logo: "/images/logo.svg", // Set to null to hide
  // ...
};
```

Replace `public/images/logo.svg` with your own logo file.

## Featured Section

Posts and pages with `featured: true` in frontmatter appear in the featured section.

### Add to Featured

Add these fields to any post or page frontmatter:

```yaml
featured: true
featuredOrder: 1
excerpt: "A short description for the card view."
image: "/images/thumbnail.png"
```

Then run `npm run sync` (dev) or `npm run sync:prod` (production). No redeploy needed.

| Field           | Description                               |
| --------------- | ----------------------------------------- |
| `featured`      | Set `true` to show in featured section    |
| `featuredOrder` | Order in featured section (lower = first) |
| `excerpt`       | Short description for card view           |
| `image`         | Thumbnail for card view (displays square) |

### Display Modes

The featured section supports two display modes:

- **List view** (default): Bullet list of links
- **Card view**: Grid of cards with thumbnail, title, and excerpt

Users can toggle between views. To change the default:

```typescript
const siteConfig = {
  featuredViewMode: "cards", // 'list' or 'cards'
  showViewToggle: true, // Allow users to switch views
};
```

### Thumbnail Images

In card view, the `image` field displays as a square thumbnail above the title. Non-square images are automatically cropped to center. The list view shows links only (no images).

Square thumbnails: 400x400px minimum (800x800px for retina). The same image can serve as both the OG image for social sharing and the featured card thumbnail.

## Blog Page

The site supports a dedicated blog page at `/blog`. Configure in `src/config/siteConfig.ts`:

```typescript
blogPage: {
  enabled: true,         // Enable /blog route
  showInNav: true,       // Show in navigation
  title: "Blog",         // Nav link and page title
  order: 0,              // Nav order (lower = first)
},
displayOnHomepage: true, // Show posts on homepage
```

| Option              | Description                            |
| ------------------- | -------------------------------------- |
| `enabled`           | Enable the `/blog` route               |
| `showInNav`         | Show Blog link in navigation           |
| `title`             | Text for nav link and page heading     |
| `order`             | Position in navigation (lower = first) |
| `displayOnHomepage` | Show post list on homepage             |

**Display options:**

- Homepage only: `displayOnHomepage: true`, `blogPage.enabled: false`
- Blog page only: `displayOnHomepage: false`, `blogPage.enabled: true`
- Both: `displayOnHomepage: true`, `blogPage.enabled: true`

**Navigation order:** The Blog link merges with page links and sorts by order. Pages use the `order` field in frontmatter. Set `blogPage.order: 5` to position Blog after pages with order 0-4.

## Logo Gallery

The homepage includes a scrolling logo gallery with sample logos. Configure in `siteConfig`:

### Disable the gallery

```typescript
logoGallery: {
  enabled: false,
  // ...
},
```

### Replace with your own logos

1. Add logo images to `public/images/logos/` (SVG recommended)
2. Update the images array with logos and links:

```typescript
logoGallery: {
  enabled: true,
  images: [
    { src: "/images/logos/your-logo-1.svg", href: "https://example.com" },
    { src: "/images/logos/your-logo-2.svg", href: "https://anothersite.com" },
  ],
  position: "above-footer", // or "below-featured"
  speed: 30, // Seconds for one scroll cycle
  title: "Trusted by", // Set to undefined to hide
},
```

Each logo object supports:

- `src`: Path to the logo image (required)
- `href`: URL to link to when clicked (optional)

### Remove sample logos

Delete sample files from `public/images/logos/` and replace the images array with your own logos, or set `enabled: false` to hide the gallery entirely.

The gallery uses CSS animations for smooth infinite scrolling. Logos appear grayscale and colorize on hover.

## GitHub Contributions Graph

Display your GitHub contribution activity on the homepage. Configure in `src/config/siteConfig.ts`:

```typescript
gitHubContributions: {
  enabled: true,           // Set to false to hide
  username: "yourusername", // Your GitHub username
  showYearNavigation: true, // Show arrows to navigate between years
  linkToProfile: true,      // Click graph to open GitHub profile
  title: "GitHub Activity", // Optional title above the graph
},
```

| Option               | Description                                   |
| -------------------- | --------------------------------------------- |
| `enabled`            | `true` to show, `false` to hide               |
| `username`           | Your GitHub username                          |
| `showYearNavigation` | Show prev/next year navigation buttons        |
| `linkToProfile`      | Click graph to visit GitHub profile           |
| `title`              | Text above graph (set to `undefined` to hide) |

The graph displays with theme-aware colors that match each site theme:

- **Dark**: GitHub green on dark background
- **Light**: Standard GitHub green
- **Tan**: Warm brown tones
- **Cloud**: Gray-blue tones

Uses the public `github-contributions-api.jogruber.de` API (no GitHub token required).

### Favicon

Replace `public/favicon.svg` with your own icon. The default is a rounded square with the letter "m". Edit the SVG to change the letter or style.

### Default Open Graph Image

The default OG image is used when posts do not have an `image` field. Replace `public/images/og-default.svg` with your own image (1200x630 recommended).

Update the reference in `src/pages/Post.tsx`:

```typescript
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

## Syncing Posts

Posts are synced to Convex. The sync script reads markdown files from `content/blog/` and `content/pages/`, then uploads them to your Convex database.

### Environment Files

| File                    | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `.env.local`            | Development deployment URL (created by `npx convex dev`) |
| `.env.production.local` | Production deployment URL (create manually)              |

Both files are gitignored. Each developer creates their own.

### Sync Commands

| Command             | Target      | When to use                 |
| ------------------- | ----------- | --------------------------- |
| `npm run sync`      | Development | Local testing, new posts    |
| `npm run sync:prod` | Production  | Deploy content to live site |

**Development sync:**

```bash
npm run sync
```

**Production sync:**

First, create `.env.production.local` with your production Convex URL:

```
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

Then sync:

```bash
npm run sync:prod
```

## Deployment

### Netlify

[![Netlify Status](https://api.netlify.com/api/v1/badges/d8c4d83d-7486-42de-844b-6f09986dc9aa/deploy-status)](https://app.netlify.com/projects/markdowncms/deploys)

For detailed setup, see the [Convex Netlify Deployment Guide](https://docs.convex.dev/production/hosting/netlify).

1. Deploy Convex functions to production:

```bash
npx convex deploy
```

Note the production URL (e.g., `https://your-deployment.convex.cloud`).

2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `CONVEX_DEPLOY_KEY` - Generate from [Convex Dashboard](https://dashboard.convex.dev) > Project Settings > Deploy Key
   - `VITE_CONVEX_URL` - Your production Convex URL (e.g., `https://your-deployment.convex.cloud`)

The `CONVEX_DEPLOY_KEY` deploys functions at build time. The `VITE_CONVEX_URL` is required for edge functions (RSS, sitemap, API) to proxy requests at runtime.

**Build issues?** Netlify sets `NODE_ENV=production` which skips devDependencies. The `--include=dev` flag fixes this. See [netlify-deploy-fix.md](./netlify-deploy-fix.md) for detailed troubleshooting.

## Project Structure

```
markdown-site/
├── content/blog/      # Markdown blog posts
├── convex/            # Convex backend
│   ├── http.ts        # HTTP endpoints (sitemap, API, RSS)
│   ├── posts.ts       # Post queries and mutations
│   ├── rss.ts         # RSS feed generation
│   └── schema.ts      # Database schema
├── netlify/           # Netlify edge functions
│   └── edge-functions/
│       ├── rss.ts     # RSS feed proxy
│       ├── sitemap.ts # Sitemap proxy
│       ├── api.ts     # API endpoint proxy
│       └── botMeta.ts # OG crawler detection
├── public/            # Static assets
│   ├── images/        # Blog images and OG images
│   ├── robots.txt     # Crawler rules
│   └── llms.txt       # AI agent discovery
├── scripts/           # Build scripts
└── src/
    ├── components/    # React components
    ├── context/       # Theme context
    ├── pages/         # Page components
    └── styles/        # Global CSS
```

## Scripts Reference

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start Vite dev server                          |
| `npm run dev:convex`  | Start Convex dev backend                       |
| `npm run sync`        | Sync posts to dev deployment                   |
| `npm run sync:prod`   | Sync posts to production deployment            |
| `npm run import`      | Import URL as local markdown draft (then sync) |
| `npm run build`       | Build for production                           |
| `npm run deploy`      | Sync + build (for manual deploys)              |
| `npm run deploy:prod` | Deploy Convex functions + sync to production   |

## Tech Stack

- React 18
- TypeScript
- Vite
- Convex
- react-markdown
- react-syntax-highlighter
- date-fns
- lucide-react
- @phosphor-icons/react
- Netlify

## Search

Press `Command+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search modal. The search uses Convex full text search to find posts and pages by title and content.

Features:

- Real-time results as you type
- Keyboard navigation (arrow keys, Enter, Escape)
- Result snippets with context around matches
- Distinguishes between posts and pages
- Works with all four themes

The search icon appears in the top navigation bar next to the theme toggle.

## Real-time Stats

The `/stats` page shows real-time analytics powered by Convex:

- **Active visitors**: Current visitors on the site with per-page breakdown
- **Total page views**: All-time view count
- **Unique visitors**: Based on anonymous session IDs
- **Views by page**: List of all pages sorted by view count

Stats update automatically via Convex subscriptions. No page refresh needed.

How it works:

- Page views are recorded as event records (not counters) to avoid write conflicts
- Active sessions use heartbeat presence (30s interval, 2min timeout)
- A cron job cleans up stale sessions every 5 minutes
- No PII stored (only anonymous session UUIDs)

## API Endpoints

| Endpoint                       | Description                         |
| ------------------------------ | ----------------------------------- |
| `/stats`                       | Real-time site analytics            |
| `/rss.xml`                     | RSS feed with post descriptions     |
| `/rss-full.xml`                | RSS feed with full post content     |
| `/sitemap.xml`                 | Dynamic XML sitemap                 |
| `/api/posts`                   | JSON list of all posts              |
| `/api/post?slug=xxx`           | Single post as JSON                 |
| `/api/post?slug=xxx&format=md` | Single post as markdown             |
| `/api/export`                  | Batch export all posts with content |
| `/meta/post?slug=xxx`          | Open Graph HTML for crawlers        |
| `/.well-known/ai-plugin.json`  | AI plugin manifest                  |
| `/openapi.yaml`                | OpenAPI 3.0 specification           |
| `/llms.txt`                    | AI agent discovery                  |

## Import External Content

Use Firecrawl to import articles from external URLs as markdown posts:

```bash
npm run import https://example.com/article
```

This will:

1. Scrape the URL using Firecrawl API
2. Convert to clean markdown
3. Create a draft post in `content/blog/` locally
4. Add frontmatter with title, description, and today's date

**Setup:**

1. Get an API key from [firecrawl.dev](https://firecrawl.dev)
2. Add to `.env.local`:

```
FIRECRAWL_API_KEY=fc-your-api-key
```

**Why no `npm run import:prod`?** The import command only creates local markdown files. It does not interact with Convex. After importing, sync to your target environment:

- `npm run sync` for development
- `npm run sync:prod` for production

Imported posts are created as drafts (`published: false`). Review, edit, set `published: true`, then sync.

## How Blog Post Slugs Work

Slugs are defined in the frontmatter of each markdown file:

```markdown
---
slug: "my-post-slug"
---
```

The slug becomes the URL path: `yourdomain.com/my-post-slug`

Rules:

- Slugs must be unique across all posts
- Use lowercase letters, numbers, and hyphens
- The sync script reads the `slug` field from frontmatter
- Posts are queried by slug using a Convex index

## Theme Configuration

The default theme is Tan. Users can cycle through themes using the toggle:

- Dark (Moon icon)
- Light (Sun icon)
- Tan (Half icon) - default
- Cloud (Cloud icon)

To change the default theme, edit `src/context/ThemeContext.tsx`:

```typescript
const DEFAULT_THEME: Theme = "tan"; // Change to "dark", "light", or "cloud"
```

## Font Configuration

The blog uses a serif font (New York) by default. To switch fonts, edit `src/styles/global.css`:

```css
body {
  /* Sans-serif option */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;

  /* Serif option (default) */
  font-family:
    "New York",
    -apple-system-ui-serif,
    ui-serif,
    Georgia,
    Cambria,
    "Times New Roman",
    Times,
    serif;
}
```

Replace the `font-family` property with your preferred font stack.

### Font Sizes

All font sizes use CSS variables defined in `:root`. Customize sizes by editing the variables:

```css
:root {
  /* Base size scale */
  --font-size-base: 16px;
  --font-size-sm: 13px;
  --font-size-lg: 17px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;

  /* Component-specific (examples) */
  --font-size-blog-content: 17px;
  --font-size-post-title: 32px;
  --font-size-nav-link: 14px;
}
```

Mobile responsive sizes are defined in a `@media (max-width: 768px)` block with smaller values.

## Write Page

A public markdown writing page at `/write` (not linked in navigation). Features:

- Three-column Cursor docs-style layout
- Content type selector (Blog Post or Page) with dynamic frontmatter templates
- Frontmatter reference panel with copy buttons for each field
- Font switcher (Serif/Sans-serif) with localStorage persistence
- Theme toggle matching the site themes (Moon, Sun, Half2Icon, Cloud)
- Word, line, and character counts
- localStorage persistence for content, content type, and font preference
- Works with Grammarly and browser spellcheck
- Warning message about refresh losing content

Access directly at `yourdomain.com/write`. Content is stored in localStorage only (not synced to database). Use it to draft posts, then copy the content to a markdown file in `content/blog/` or `content/pages/` and run `npm run sync`.

## Source

Fork this project: [github.com/waynesutton/markdown-site](https://github.com/waynesutton/markdown-site)
