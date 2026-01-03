# Documentation

---
Type: page
Date: 2026-01-03
---

## Getting Started

Reference documentation for setting up, customizing, and deploying this markdown framework.

**How publishing works:** Write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so connected browsers update automatically.

**Sync commands:**

**Development:**

- `npm run sync` - Sync markdown content
- `npm run sync:discovery` - Update discovery files (AGENTS.md, llms.txt)
- `npm run sync:all` - Sync content + discovery files together

**Production:**

- `npm run sync:prod` - Sync markdown content
- `npm run sync:discovery:prod` - Update discovery files
- `npm run sync:all:prod` - Sync content + discovery files together

## Quick start

```bash
git clone https://github.com/waynesutton/markdown-site.git
cd markdown-site
npm install
npx convex dev
npm run sync          # development
npm run sync:prod     # production
npm run dev
```

Open `http://localhost:5173` to view locally.

## Requirements

- Node.js 18+
- Convex account (free at convex.dev)
- Netlify account (free at netlify.com)

## Project structure

```
markdown-site/
├── content/
│   ├── blog/           # Blog posts (.md)
│   └── pages/          # Static pages (.md)
├── convex/
│   ├── schema.ts       # Database schema
│   ├── posts.ts        # Post queries/mutations
│   ├── pages.ts        # Page queries/mutations
│   ├── http.ts         # API endpoints
│   └── rss.ts          # RSS generation
├── netlify/
│   └── edge-functions/ # Netlify edge functions
│       ├── rss.ts      # RSS proxy
│       ├── sitemap.ts  # Sitemap proxy
│       ├── api.ts      # API proxy
│       └── botMeta.ts  # OG crawler detection
├── src/
│   ├── components/     # React components
│   ├── context/        # Theme context
│   ├── pages/          # Route components
│   └── styles/         # CSS
├── public/
│   ├── images/         # Static images
│   ├── raw/            # Generated raw markdown files
│   ├── robots.txt      # Crawler rules
│   └── llms.txt        # AI discovery
└── netlify.toml        # Deployment config
```

## Content

**Markdown examples:** For complete markdown syntax examples including code blocks, tables, lists, links, images, collapsible sections, and all formatting options, see [Writing Markdown with Code Examples](/markdown-with-code-examples). That post includes copy-paste examples for every markdown feature.

### Blog posts

Create files in `content/blog/` with frontmatter:

```markdown
---
title: "Post Title"
description: "SEO description"
date: "2025-01-15"
slug: "url-path"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
image: "/images/og-image.png"
---

Content here...
```

| Field                   | Required | Description                                                                                                                                                                                            |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                 | Yes      | Post title                                                                                                                                                                                             |
| `description`           | Yes      | SEO description                                                                                                                                                                                        |
| `date`                  | Yes      | YYYY-MM-DD format                                                                                                                                                                                      |
| `slug`                  | Yes      | URL path (unique)                                                                                                                                                                                      |
| `published`             | Yes      | `true` to show                                                                                                                                                                                         |
| `tags`                  | Yes      | Array of strings                                                                                                                                                                                       |
| `readTime`              | No       | Display time estimate                                                                                                                                                                                  |
| `image`                 | No       | OG image and featured card thumbnail. See [Using Images in Blog Posts](/using-images-in-posts) for markdown and HTML syntax                                                                            |
| `showImageAtTop`        | No       | Set `true` to display the image at the top of the post above the header (default: `false`)                                                                                                             |
| `excerpt`               | No       | Short text for card view                                                                                                                                                                               |
| `featured`              | No       | `true` to show in featured section                                                                                                                                                                     |
| `featuredOrder`         | No       | Order in featured (lower = first)                                                                                                                                                                      |
| `authorName`            | No       | Author display name shown next to date                                                                                                                                                                 |
| `authorImage`           | No       | Round author avatar image URL                                                                                                                                                                          |
| `layout`                | No       | Set to `"sidebar"` for docs-style layout with TOC                                                                                                                                                      |
| `rightSidebar`          | No       | Enable right sidebar with CopyPageDropdown (opt-in, requires explicit `true`)                                                                                                                          |
| `showFooter`            | No       | Show footer on this post (overrides siteConfig default)                                                                                                                                                |
| `footer`                | No       | Per-post footer markdown (overrides `footer.md` and siteConfig.defaultContent)                                                                                                                         |
| `showSocialFooter`      | No       | Show social footer on this post (overrides siteConfig default)                                                                                                                                         |
| `aiChat`                | No       | Enable AI chat in right sidebar. Set `true` to enable (requires `rightSidebar: true` and `siteConfig.aiChat.enabledOnContent: true`). Set `false` to explicitly hide even if global config is enabled. |
| `blogFeatured`          | No       | Show as featured on blog page (first becomes hero, rest in 2-column row)                                                                                                                               |
| `newsletter`            | No       | Override newsletter signup display (`true` to show, `false` to hide)                                                                                                                                   |
| `contactForm`           | No       | Enable contact form on this post                                                                                                                                                                       |
| `unlisted`              | No       | Hide from listings but allow direct access via slug. Set `true` to hide from blog listings, featured sections, tag pages, search results, and related posts. Post remains accessible via direct link.  |
| `docsSection`           | No       | Include in docs sidebar. Set `true` to show in the docs section navigation.                                                                                                                            |
| `docsSectionGroup`      | No       | Group name for docs sidebar. Posts with the same group name appear together.                                                                                                                           |
| `docsSectionOrder`      | No       | Order within docs group. Lower numbers appear first within the group.                                                                                                                                  |
| `docsSectionGroupOrder` | No       | Order of the group in docs sidebar. Lower numbers make the group appear first. Groups without this field sort alphabetically.                                                                          |
| `docsSectionGroupIcon`  | No       | Phosphor icon name for docs sidebar group (e.g., "Rocket", "Book", "PuzzlePiece"). Icon appears left of the group title. See [Phosphor Icons](https://phosphoricons.com) for available icons.         |
| `showImageAtTop`        | No       | Set `true` to display the `image` field at the top of the post above the header (default: `false`)                                                                                                     |

### Static pages

Create files in `content/pages/` with frontmatter:

```markdown
---
title: "Page Title"
slug: "url-path"
published: true
order: 1
---

Content here...
```

### Frontmatter options

| Field                   | Required | Description                                                                                                                                                                                            |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                 | Yes      | Nav link text                                                                                                                                                                                          |
| `slug`                  | Yes      | URL path                                                                                                                                                                                               |
| `published`             | Yes      | `true` to show                                                                                                                                                                                         |
| `order`                 | No       | Nav order (lower = first)                                                                                                                                                                              |
| `showInNav`             | No       | Show in navigation menu (default: `true`)                                                                                                                                                              |
| `excerpt`               | No       | Short text for card view                                                                                                                                                                               |
| `image`                 | No       | Thumbnail for featured card view                                                                                                                                                                       |
| `showImageAtTop`        | No       | Set `true` to display the image at the top of the page above the header (default: `false`)                                                                                                             |
| `featured`              | No       | `true` to show in featured section                                                                                                                                                                     |
| `featuredOrder`         | No       | Order in featured (lower = first)                                                                                                                                                                      |
| `authorName`            | No       | Author display name shown next to date                                                                                                                                                                 |
| `authorImage`           | No       | Round author avatar image URL                                                                                                                                                                          |
| `layout`                | No       | Set to `"sidebar"` for docs-style layout with TOC                                                                                                                                                      |
| `rightSidebar`          | No       | Enable right sidebar with CopyPageDropdown (opt-in, requires explicit `true`)                                                                                                                          |
| `showFooter`            | No       | Show footer on this page (overrides siteConfig default)                                                                                                                                                |
| `footer`                | No       | Per-page footer markdown (overrides `footer.md` and siteConfig.defaultContent)                                                                                                                         |
| `showSocialFooter`      | No       | Show social footer on this page (overrides siteConfig default)                                                                                                                                         |
| `aiChat`                | No       | Enable AI chat in right sidebar. Set `true` to enable (requires `rightSidebar: true` and `siteConfig.aiChat.enabledOnContent: true`). Set `false` to explicitly hide even if global config is enabled. |
| `newsletter`            | No       | Override newsletter signup display (`true` to show, `false` to hide)                                                                                                                                   |
| `contactForm`           | No       | Enable contact form on this page                                                                                                                                                                       |
| `showImageAtTop`        | No       | Set `true` to display the `image` field at the top of the page above the header (default: `false`)                                                                                                     |
| `textAlign`             | No       | Text alignment: "left" (default), "center", or "right". Used by `home.md` for home intro alignment                                                                                                     |
| `docsSection`           | No       | Include in docs sidebar. Set `true` to show in the docs section navigation.                                                                                                                            |
| `docsSectionGroup`      | No       | Group name for docs sidebar. Pages with the same group name appear together.                                                                                                                           |
| `docsSectionOrder`      | No       | Order within docs group. Lower numbers appear first within the group.                                                                                                                                  |
| `docsSectionGroupOrder` | No       | Order of the group in docs sidebar. Lower numbers make the group appear first. Groups without this field sort alphabetically.                                                                          |
| `docsSectionGroupIcon`  | No       | Phosphor icon name for docs sidebar group (e.g., "Rocket", "Book", "PuzzlePiece"). Icon appears left of the group title. See [Phosphor Icons](https://phosphoricons.com) for available icons.         |

**Hide pages from navigation:** Set `showInNav: false` to keep a page published and accessible via direct URL, but hidden from the navigation menu. Pages with `showInNav: false` remain searchable and available via API endpoints. Useful for pages you want to link directly but not show in the main nav.

**Unlisted posts:** Set `unlisted: true` to hide a blog post from all listings while keeping it accessible via direct link. Unlisted posts are excluded from: blog listings (`/blog` page), featured sections (homepage), tag pages (`/tags/[tag]`), search results (Command+K), and related posts. The post remains accessible via direct URL (e.g., `/blog/post-slug`). Useful for draft posts, private content, or posts you want to share via direct link only. Note: `unlisted` only works for blog posts, not pages.

**Show image at top:** Add `showImageAtTop: true` to display the `image` field at the top of the post/page above the header. Default behavior: if `showImageAtTop` is not set or `false`, image only used for Open Graph previews and featured card thumbnails.

**Image lightbox:** Images in blog posts and pages automatically open in a full-screen lightbox when clicked (if enabled in `siteConfig.imageLightbox.enabled`). This allows readers to view images at full size. The lightbox can be closed by clicking outside the image, pressing Escape, or clicking the close button.

**Text alignment:** Use `textAlign` field to control text alignment for page content. Options: `"left"` (default), `"center"`, or `"right"`. Used by `home.md` to control home intro alignment.

### Home intro content

The homepage intro text can be synced from markdown via `content/pages/home.md` (slug: `home-intro`). This allows you to update homepage text without redeploying.

**Create home intro:**

1. Create `content/pages/home.md`:

```markdown
---
title: "Home Intro"
slug: "home-intro"
published: true
showInNav: false
order: -1
textAlign: "left"
---

Your homepage intro text here.

## Features

**Feature one** — Description here.

**Feature two** — Description here.
```

2. Run `npm run sync` to sync to Convex

3. Content appears on homepage instantly (no rebuild needed)

**Blog heading styles:** Headings (h1-h6) in home intro content use the same styling as blog posts (`blog-h1` through `blog-h6` classes). Each heading gets an automatic ID and a clickable anchor link (#) that appears on hover. Lists, blockquotes, horizontal rules, and links also use blog styling classes for consistent typography.

**Fallback:** If `home-intro` page is not found, the homepage falls back to `siteConfig.bio` text.

### Footer content

The footer content can be synced from markdown via `content/pages/footer.md` (slug: `footer`). This allows you to update footer text without touching code.

**Create footer content:**

1. Create `content/pages/footer.md`:

```markdown
---
title: "Footer"
slug: "footer"
published: true
showInNav: false
order: -1
---

Built with [Convex](https://convex.dev) for real-time sync and deployed on [Netlify](https://netlify.com).

Created by [Your Name](https://x.com/yourhandle). Follow on [Twitter/X](https://x.com/yourhandle) and [GitHub](https://github.com/yourusername).
```

2. Run `npm run sync` to sync to Convex

3. Footer content appears on homepage and blog page instantly (no rebuild needed)

**Markdown support:** Footer content supports full markdown including links, paragraphs, line breaks, and images. External links automatically open in new tabs.

**Fallback:** If `footer` page is not found, the footer falls back to `siteConfig.footer.defaultContent`.

**Relationship with siteConfig:** The `content/pages/footer.md` page takes priority over `siteConfig.footer.defaultContent` when present. Use the markdown page for dynamic content that changes frequently, or keep using siteConfig for static footer content.

### Sidebar layout

Posts and pages can use a docs-style layout with a table of contents sidebar. Add `layout: "sidebar"` to the frontmatter:

```markdown
---
title: "Documentation"
slug: "docs"
published: true
layout: "sidebar"
---

# Introduction

## Section One

### Subsection

## Section Two
```

**Features:**

- Left sidebar displays table of contents extracted from H1, H2, H3 headings
- Two-column layout: 220px sidebar + flexible content area
- Sidebar only appears if headings exist in the content
- Active heading highlighting as you scroll
- Smooth scroll navigation when clicking TOC links
- Mobile responsive: stacks to single column below 1024px
- Works for both blog posts and static pages

The sidebar extracts headings automatically from your markdown content. No manual TOC needed.

### Right sidebar

When enabled in `siteConfig.rightSidebar.enabled`, posts and pages can display a right sidebar containing the CopyPageDropdown at 1135px+ viewport width.

**Configuration:**

Enable globally in `src/config/siteConfig.ts`:

```typescript
rightSidebar: {
  enabled: true, // Set to false to disable right sidebar globally
  minWidth: 1135, // Minimum viewport width to show sidebar
},
```

Control per post/page with frontmatter:

```markdown
---
title: "My Post"
rightSidebar: true # Enable right sidebar for this post
---
```

**Features:**

- Right sidebar appears at 1135px+ viewport width
- Contains CopyPageDropdown with all sharing options
- Three-column layout: left sidebar (TOC), main content, right sidebar
- CopyPageDropdown automatically moves from nav to right sidebar when enabled
- Hidden below 1135px breakpoint, CopyPageDropdown returns to nav
- Per-post/page control via `rightSidebar: true` frontmatter field
- Opt-in only: right sidebar only appears when explicitly enabled in frontmatter

**Use cases:**

- Keep CopyPageDropdown accessible on wide screens without cluttering the nav
- Provide quick access to sharing options while reading long content
- Works alongside left sidebar TOC for comprehensive navigation

**Example for blog post:**

```markdown
---
title: "My Tutorial"
description: "A detailed guide"
date: "2025-01-20"
slug: "my-tutorial"
published: true
tags: ["tutorial"]
layout: "sidebar"
---

# Introduction

## Getting Started

### Prerequisites

## Advanced Topics
```

### How frontmatter works

Frontmatter is the YAML metadata at the top of each markdown file between `---` markers. Here is how it flows through the system:

**Content directories:**

- `content/blog/*.md` contains blog posts with frontmatter
- `content/pages/*.md` contains static pages with frontmatter

**Processing flow:**

1. Markdown files in `content/blog/` and `content/pages/` contain YAML frontmatter
2. `scripts/sync-posts.ts` uses `gray-matter` to parse frontmatter and validate required fields
3. Parsed data is sent to Convex mutations (`api.posts.syncPostsPublic`, `api.pages.syncPagesPublic`)
4. `convex/schema.ts` defines the database structure for storing the data

**Adding a new frontmatter field:**

To add a custom frontmatter field, update these files:

1. The interface in `scripts/sync-posts.ts` (`PostFrontmatter` or `PageFrontmatter`)
2. The parsing logic in `parseMarkdownFile()` or `parsePageFile()` functions
3. The schema in `convex/schema.ts`
4. The sync mutation in `convex/posts.ts` or `convex/pages.ts`

### Syncing content

**Development:**

```bash
npm run sync              # Sync markdown content
npm run sync:discovery    # Update discovery files (AGENTS.md, llms.txt)
npm run sync:all          # Sync content + discovery files together
```

**Production:**

```bash
npm run sync:prod              # Sync markdown content
npm run sync:discovery:prod   # Update discovery files
npm run sync:all:prod         # Sync content + discovery files together
```

**Sync everything together:**

```bash
npm run sync:all        # Development: content + discovery
npm run sync:all:prod   # Production: content + discovery
```

### When to sync vs deploy

| What you're changing             | Command                    | Timing                  |
| -------------------------------- | -------------------------- | ----------------------- |
| Blog posts in `content/blog/`    | `npm run sync`             | Instant (no rebuild)    |
| Pages in `content/pages/`        | `npm run sync`             | Instant (no rebuild)    |
| Featured items (via frontmatter) | `npm run sync`             | Instant (no rebuild)    |
| Site config changes              | `npm run sync:discovery`   | Updates discovery files |
| Import external URL              | `npm run import` then sync | Instant (no rebuild)    |
| Images in `public/images/`       | Git commit + push          | Requires rebuild        |
| `siteConfig` in `Home.tsx`       | Redeploy                   | Requires rebuild        |
| Logo gallery config              | Redeploy                   | Requires rebuild        |
| React components/styles          | Redeploy                   | Requires rebuild        |

**Markdown content** syncs instantly to Convex. **Images and source code** require pushing to GitHub for Netlify to rebuild.

## Configuration

### Fork configuration

After forking, you have two options to configure your site:

**Option 1: Automated (Recommended)**

```bash
cp fork-config.json.example fork-config.json
# Edit fork-config.json with your site information
npm run configure
```

This updates all 11 configuration files in one command. See `FORK_CONFIG.md` for the full JSON schema and options.

**Option 2: Manual**

Follow the step-by-step guide in `FORK_CONFIG.md` to update each file manually.

### Files updated by configuration

| File                                | What to update                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, title, intro, bio, blog page, logo gallery, GitHub contributions, right sidebar configuration |
| `src/pages/Home.tsx`                | Intro paragraph text, footer links                                                                       |
| `convex/http.ts`                    | `SITE_URL`, `SITE_NAME`, description strings (3 locations)                                               |
| `convex/rss.ts`                     | `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` (RSS feeds)                                                 |
| `src/pages/Post.tsx`                | `SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE` (OG tags)                                                    |
| `index.html`                        | Title, meta description, OG tags, JSON-LD                                                                |
| `public/llms.txt`                   | Site name, URL, description, topics                                                                      |
| `public/robots.txt`                 | Sitemap URL and header comment                                                                           |
| `public/openapi.yaml`               | API title, server URL, site name in examples                                                             |
| `public/.well-known/ai-plugin.json` | Site name, descriptions                                                                                  |
| `src/context/ThemeContext.tsx`      | Default theme                                                                                            |

### Site title and description metadata

These files contain the main site description text. Update them with your own tagline:

| File                              | What to change                                                 |
| --------------------------------- | -------------------------------------------------------------- |
| `index.html`                      | meta description, og:description, twitter:description, JSON-LD |
| `README.md`                       | Main description at top of file                                |
| `src/config/siteConfig.ts`        | name, title, and bio fields                                    |
| `src/pages/Home.tsx`              | Intro paragraph (hardcoded JSX with links)                     |
| `convex/http.ts`                  | SITE_NAME constant and description strings (3 locations)       |
| `convex/rss.ts`                   | SITE_TITLE and SITE_DESCRIPTION constants                      |
| `public/llms.txt`                 | Header quote, Name, and Description fields                     |
| `public/openapi.yaml`             | API title and example site name                                |
| `AGENTS.md`                       | Project overview section                                       |
| `content/blog/about-this-blog.md` | Title, description, excerpt, and opening paragraph             |
| `content/pages/about.md`          | excerpt field and opening paragraph                            |
| `content/pages/docs.md`           | Opening description paragraph                                  |

**Backend constants** (`convex/http.ts` and `convex/rss.ts`):

```typescript
// convex/http.ts
const SITE_URL = "https://your-site.netlify.app";
const SITE_NAME = "Your Site Name";

// convex/rss.ts
const SITE_URL = "https://your-site.netlify.app";
const SITE_TITLE = "Your Site Name";
const SITE_DESCRIPTION = "Your site description for RSS feeds.";
```

**Post page constants** (`src/pages/Post.tsx`):

```typescript
const SITE_URL = "https://your-site.netlify.app";
const SITE_NAME = "Your Site Name";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

These constants affect RSS feeds, API responses, sitemaps, and social sharing metadata.

### Site settings

Edit `src/config/siteConfig.ts`:

```typescript
export default {
  name: "Site Name",
  title: "Tagline",
  logo: "/images/logo.svg", // null to hide homepage logo
  intro: "Introduction text...",
  bio: "Bio text...",

  // Blog page configuration
  blogPage: {
    enabled: true, // Enable /blog route
    showInNav: true, // Show in navigation
    title: "Blog", // Nav link and page title
    order: 0, // Nav order (lower = first)
  },

  // Hardcoded navigation items for React routes
  hardcodedNavItems: [
    {
      slug: "stats",
      title: "Stats",
      order: 10,
      showInNav: true, // Set to false to hide from nav
    },
    {
      slug: "write",
      title: "Write",
      order: 20,
      showInNav: true,
    },
  ],

  // Inner page logo configuration
  innerPageLogo: {
    enabled: true, // Set to false to hide logo on inner pages
    size: 28, // Logo height in pixels (keeps aspect ratio)
  },

  // Featured section
  featuredViewMode: "list", // 'list' or 'cards'
  showViewToggle: true,

  // Logo gallery (static grid or scrolling marquee)
  logoGallery: {
    enabled: true, // false to hide
    images: [{ src: "/images/logos/logo.svg", href: "https://example.com" }],
    position: "above-footer",
    speed: 30,
    title: "Built with",
    scrolling: false, // false = static grid, true = scrolling marquee
    maxItems: 4, // Number of logos when scrolling is false
  },

  links: {
    docs: "/docs",
    convex: "https://convex.dev",
  },
};
```

**Logo configuration:**

- `logo`: Homepage logo path (set to `null` to hide). Uses `public/images/logo.svg` by default.
- `innerPageLogo`: Logo shown on blog page, posts, and static pages. Desktop: top left. Mobile: top right. Set `enabled: false` to hide on inner pages while keeping homepage logo.

**Navigation structure:**

Navigation combines three sources sorted by `order`:

1. Blog link (if `blogPage.enabled` and `blogPage.showInNav` are true)
2. Hardcoded nav items (React routes from `hardcodedNavItems`)
3. Markdown pages (from `content/pages/` with `showInNav: true`)

All items sort by `order` (lower first), then alphabetically by title.

### Featured items

Posts and pages appear in the featured section when marked with `featured: true` in frontmatter.

**Add to featured section:**

```yaml
# In any post or page frontmatter
featured: true
featuredOrder: 1
excerpt: "Short description for card view."
image: "/images/thumbnail.png"
```

Then run `npm run sync` or `npm run sync:all`. No redeploy needed.

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `featured`      | Set `true` to show in featured section       |
| `featuredOrder` | Order in featured section (lower = first)    |
| `excerpt`       | Short text shown on card view                |
| `image`         | Thumbnail for card view (displays as square) |

**Thumbnail images:** In card view, the `image` field displays as a square thumbnail above the title. Non-square images are automatically cropped to center. Square thumbnails: 400x400px minimum (800x800px for retina).

**Posts without images:** Cards display without the image area. The card shows just the title and excerpt with adjusted padding.

**Ordering:** Items with `featuredOrder` appear first (lower numbers first). Items without `featuredOrder` appear after, sorted by creation time.

**Display options (in siteConfig):**

```typescript
// In src/pages/Home.tsx
const siteConfig = {
  featuredViewMode: "list", // 'list' or 'cards'
  showViewToggle: true, // Let users switch views
};
```

### GitHub contributions graph

Display your GitHub contribution activity on the homepage. Configure in `siteConfig`:

```typescript
gitHubContributions: {
  enabled: true,           // Set to false to hide
  username: "yourusername", // Your GitHub username
  showYearNavigation: true, // Show arrows to navigate between years
  linkToProfile: true,      // Click graph to open GitHub profile
  title: "GitHub Activity", // Optional title above the graph
},
```

| Option               | Description                            |
| -------------------- | -------------------------------------- |
| `enabled`            | `true` to show, `false` to hide        |
| `username`           | Your GitHub username                   |
| `showYearNavigation` | Show prev/next year navigation         |
| `linkToProfile`      | Click graph to visit GitHub profile    |
| `title`              | Text above graph (`undefined` to hide) |

Theme-aware colors match each site theme. Uses public API (no GitHub token required).

### Visitor map

Display real-time visitor locations on a world map on the stats page. Uses Netlify's built-in geo detection (no third-party API needed). Privacy friendly: only stores city, country, and coordinates. No IP addresses stored.

```typescript
visitorMap: {
  enabled: true,        // Set to false to hide
  title: "Live Visitors", // Optional title above the map
},
```

| Option    | Description                          |
| --------- | ------------------------------------ |
| `enabled` | `true` to show, `false` to hide      |
| `title`   | Text above map (`undefined` to hide) |

The map displays with theme-aware colors. Visitor dots pulse to indicate live sessions. Location data comes from Netlify's automatic geo headers at the edge.

### Logo gallery

The homepage includes a logo gallery that can scroll infinitely or display as a static grid. Each logo can link to a URL.

```typescript
// In src/config/siteConfig.ts
logoGallery: {
  enabled: true, // false to hide
  images: [
    { src: "/images/logos/logo1.svg", href: "https://example.com" },
    { src: "/images/logos/logo2.svg", href: "https://another.com" },
  ],
  position: "above-footer", // or 'below-featured'
  speed: 30, // Seconds for one scroll cycle
  title: "Built with", // undefined to hide
  scrolling: false, // false = static grid, true = scrolling marquee
  maxItems: 4, // Number of logos when scrolling is false
},
```

| Option      | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `enabled`   | `true` to show, `false` to hide                            |
| `images`    | Array of `{ src, href }` objects                           |
| `position`  | `'above-footer'` or `'below-featured'`                     |
| `speed`     | Seconds for one scroll cycle (lower = faster)              |
| `title`     | Text above gallery (`undefined` to hide)                   |
| `scrolling` | `true` for infinite scroll, `false` for static grid        |
| `maxItems`  | Max logos to show when `scrolling` is `false` (default: 4) |

**Display modes:**

- `scrolling: true`: Infinite horizontal scroll with all logos
- `scrolling: false`: Static centered grid showing first `maxItems` logos

**To add logos:**

1. Add SVG/PNG files to `public/images/logos/`
2. Update the `images` array with `src` paths and `href` URLs
3. Push to GitHub (requires rebuild)

**To disable:** Set `enabled: false`

**To remove samples:** Delete files from `public/images/logos/` or clear the images array.

### Blog page

The site supports a dedicated blog page at `/blog` with two view modes: list view (year-grouped posts) and card view (thumbnail grid). Configure in `src/config/siteConfig.ts`:

```typescript
blogPage: {
  enabled: true,         // Enable /blog route
  showInNav: true,       // Show in navigation
  title: "Blog",         // Nav link and page title
  order: 0,              // Nav order (lower = first)
  viewMode: "list",      // Default view: "list" or "cards"
  showViewToggle: true,  // Show toggle button to switch views
},
displayOnHomepage: true, // Show posts on homepage
```

| Option              | Description                            |
| ------------------- | -------------------------------------- |
| `enabled`           | Enable the `/blog` route               |
| `showInNav`         | Show Blog link in navigation           |
| `title`             | Text for nav link and page heading     |
| `order`             | Position in navigation (lower = first) |
| `viewMode`          | Default view: `"list"` or `"cards"`    |
| `showViewToggle`    | Show toggle button to switch views     |
| `displayOnHomepage` | Show post list on homepage             |

**View modes:**

- **List view:** Year-grouped posts with titles, read time, and dates
- **Card view:** Grid of cards showing thumbnails, titles, excerpts, and metadata

**Card view details:**

Cards display post thumbnails (from `image` frontmatter field), titles, excerpts (or descriptions), read time, and dates. Posts without images show cards without thumbnail areas. Grid is responsive: 3 columns on desktop, 2 on tablet, 1 on mobile.

**Display options:**

- Homepage only: `displayOnHomepage: true`, `blogPage.enabled: false`
- Blog page only: `displayOnHomepage: false`, `blogPage.enabled: true`
- Both: `displayOnHomepage: true`, `blogPage.enabled: true`

**Navigation order:** The Blog link merges with page links and sorts by order. Pages use the `order` field in frontmatter. Set `blogPage.order: 5` to position Blog after pages with order 0-4.

**View preference:** User's view mode choice is saved to localStorage and persists across page visits.

### Scroll-to-top button

A scroll-to-top button appears after scrolling down. Configure in `src/components/Layout.tsx`:

```typescript
const scrollToTopConfig: Partial<ScrollToTopConfig> = {
  enabled: true, // Set to false to disable
  threshold: 300, // Show after scrolling 300px
  smooth: true, // Smooth scroll animation
};
```

| Option      | Description                                |
| ----------- | ------------------------------------------ |
| `enabled`   | `true` to show, `false` to hide            |
| `threshold` | Pixels scrolled before button appears      |
| `smooth`    | `true` for smooth scroll, `false` for jump |

Uses Phosphor ArrowUp icon and works with all themes.

### Theme

Default: `tan`. Options: `dark`, `light`, `tan`, `cloud`.

Edit `src/context/ThemeContext.tsx`:

```typescript
const DEFAULT_THEME: Theme = "tan";
```

### Font

Configure the font in `src/config/siteConfig.ts`:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  fontFamily: "serif", // Options: "serif", "sans", or "monospace"
};
```

Or edit `src/styles/global.css` directly:

```css
body {
  /* Sans-serif */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Serif (default) */
  font-family: "New York", ui-serif, Georgia, serif;

  /* Monospace */
  font-family: "IBM Plex Mono", "Liberation Mono", ui-monospace, monospace;
}
```

Available options: `serif` (default), `sans`, or `monospace`.

### Font Sizes

All font sizes use CSS variables in `:root`. Customize by editing:

```css
:root {
  --font-size-base: 16px;
  --font-size-sm: 13px;
  --font-size-lg: 17px;
  --font-size-blog-content: 17px;
  --font-size-post-title: 32px;
}
```

Mobile sizes defined in `@media (max-width: 768px)` block.

### Images

| Image            | Location                       | Size     |
| ---------------- | ------------------------------ | -------- |
| Favicon          | `public/favicon.svg`           | 512x512  |
| Site logo        | `public/images/logo.svg`       | 512x512  |
| Default OG image | `public/images/og-default.svg` | 1200x630 |
| Post images      | `public/images/`               | Any      |

**Images require git deploy.** Images are served as static files from your repository, not synced to Convex. After adding images to `public/images/`:

1. Commit the image files to git
2. Push to GitHub
3. Wait for Netlify to rebuild

The `npm run sync` command only syncs markdown text content. Images are deployed when Netlify builds your site. Use `npm run sync:discovery` to update discovery files (AGENTS.md, llms.txt) when site configuration changes.

**Adding images to posts:** You can add images using markdown syntax `![alt](src)` or HTML `<img>` tags. The site uses `rehypeRaw` and `rehypeSanitize` to safely render HTML in markdown content. See [Using Images in Blog Posts](/using-images-in-posts) for complete examples and best practices.

**Logo options:**

- **Homepage logo:** Configured via `logo` in `siteConfig.ts`. Set to `null` to hide.
- **Inner page logo:** Configured via `innerPageLogo` in `siteConfig.ts`. Shows on blog page, posts, and static pages. Desktop: top left corner. Mobile: top right corner (smaller). Set `enabled: false` to hide on inner pages while keeping homepage logo.

## Tag Pages and Related Posts

Tag pages are available at `/tags/[tag]` for each tag used in your posts. They display all posts with that tag in a list or card view with localStorage persistence for view mode preference.

**Related posts:** Individual blog posts show up to 3 related posts in the footer based on shared tags. Posts are sorted by relevance (number of shared tags) then by date. Only appears on blog posts (not static pages).

**Tag links:** Tags in post footers link to their respective tag archive pages.

## Search

Press `Command+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search modal. Click the search icon in the nav or use the keyboard shortcut.

**Features:**

- Real-time results as you type
- Keyboard navigation (arrow keys, Enter, Escape)
- Result snippets with context around matches
- Distinguishes between posts and pages
- Works with all four themes

Search uses Convex full text search indexes. No configuration needed.

## Mobile menu

On mobile and tablet screens, a hamburger menu provides navigation. The menu slides out from the left with:

- Keyboard navigation (Escape to close)
- Focus trap for accessibility
- Auto-close on route change

The menu appears automatically on screens under 768px wide.

## Copy Page dropdown

Each post and page includes a share dropdown with options:

| Option               | Description                                |
| -------------------- | ------------------------------------------ |
| Copy page            | Copies formatted markdown to clipboard     |
| Open in ChatGPT      | Opens ChatGPT with raw markdown URL        |
| Open in Claude       | Opens Claude with raw markdown URL         |
| Open in Perplexity   | Opens Perplexity with raw markdown URL     |
| View as Markdown     | Opens raw `.md` file in new tab            |
| Download as SKILL.md | Downloads skill file for AI agent training |

**Raw markdown URLs:** AI service links use GitHub raw URLs to fetch markdown content. This bypasses Netlify edge functions and provides reliable access for AI services.

**Git push required for AI links:** The "Open in ChatGPT," "Open in Claude," and "Open in Perplexity" options use GitHub raw URLs. For these to work, you must push your content to GitHub with `git push`. The `npm run sync` command syncs content to Convex for your live site, but AI services fetch directly from GitHub.

| What you want                        | Command needed                                    |
| ------------------------------------ | ------------------------------------------------- |
| Content visible on your site         | `npm run sync` or `sync:prod`                     |
| Discovery files updated              | `npm run sync:discovery` or `sync:discovery:prod` |
| AI links (ChatGPT/Claude/Perplexity) | `git push` to GitHub                              |
| Both content and discovery           | `npm run sync:all` or `sync:all:prod`             |

**Download as SKILL.md:** Downloads the content formatted as an Anthropic Agent Skills file with metadata, triggers, and instructions sections.

## Homepage Post Limit

Limit the number of posts shown on the homepage:

```typescript
postsDisplay: {
  showOnHome: true,
  homePostsLimit: 5, // Limit to 5 most recent posts (undefined = show all)
  homePostsReadMore: {
    enabled: true,
    text: "Read more blog posts",
    link: "/blog",
  },
},
```

When posts are limited, an optional "read more" link appears below the list. Only shows when there are more posts than the limit.

## Blog Page Featured Layout

Posts can be marked as featured on the blog page using the `blogFeatured` frontmatter field:

```yaml
---
title: "My Featured Post"
blogFeatured: true
---
```

The first `blogFeatured` post displays as a hero card with landscape image, tags, date, title, excerpt, author info, and read more link. Remaining `blogFeatured` posts display in a 2-column featured row with excerpts. Regular (non-featured) posts display in a 3-column grid without excerpts.

## Homepage Post Limit

Limit the number of posts shown on the homepage:

```typescript
postsDisplay: {
  showOnHome: true,
  homePostsLimit: 5, // Limit to 5 most recent posts (undefined = show all)
  homePostsReadMore: {
    enabled: true,
    text: "Read more blog posts",
    link: "/blog",
  },
},
```

When posts are limited, an optional "read more" link appears below the list. Only shows when there are more posts than the limit.

## Blog Page Featured Layout

Posts can be marked as featured on the blog page using the `blogFeatured` frontmatter field:

```yaml
---
title: "My Featured Post"
blogFeatured: true
---
```

The first `blogFeatured` post displays as a hero card with landscape image, tags, date, title, excerpt, author info, and read more link. Remaining `blogFeatured` posts display in a 2-column featured row with excerpts. Regular (non-featured) posts display in a 3-column grid without excerpts.

## Real-time stats

The `/stats` page displays real-time analytics:

- Active visitors (with per-page breakdown)
- Total page views
- Unique visitors
- Views by page (sorted by count)

All stats update automatically via Convex subscriptions.

## Newsletter Admin

The Newsletter Admin page at `/newsletter-admin` provides a UI for managing subscribers and sending newsletters.

**Features:**

- View and search all subscribers (search bar in header)
- Filter by status (all, active, unsubscribed)
- Delete subscribers
- Send blog posts as newsletters
- Write and send custom emails with markdown support
- View recent newsletter sends (last 10, includes both posts and custom emails)
- Email statistics dashboard with:
  - Total emails sent
  - Newsletters sent count
  - Active subscribers
  - Retention rate
  - Detailed summary table

**Configuration:**

Enable in `src/config/siteConfig.ts`:

```typescript
newsletterAdmin: {
  enabled: true,      // Enable /newsletter-admin route
  showInNav: false,   // Hide from navigation (access via direct URL)
},
```

**Environment Variables (Convex):**

| Variable                  | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `AGENTMAIL_API_KEY`       | Your AgentMail API key                              |
| `AGENTMAIL_INBOX`         | Your AgentMail inbox (e.g., `inbox@agentmail.to`)   |
| `AGENTMAIL_CONTACT_EMAIL` | Optional contact form recipient (defaults to inbox) |

**Note:** If environment variables are not configured, users will see the error message: "AgentMail Environment Variables are not configured in production. Please set AGENTMAIL_API_KEY and AGENTMAIL_INBOX." when attempting to send newsletters or use contact forms.

**Sending Newsletters:**

The admin UI supports two sending modes:

1. **Send Post**: Select a published blog post to send as a newsletter
2. **Write Email**: Compose a custom email with markdown formatting

Custom emails support markdown syntax:

- `# Heading` for headers
- `**bold**` and `*italic*` for emphasis
- `[link text](url)` for links
- `- item` for bullet lists

**CLI Commands:**

You can send newsletters via command line:

```bash
# Send a blog post to all subscribers
npm run newsletter:send <post-slug>

# Send weekly stats summary to your inbox
npm run newsletter:send:stats
```

Example:

```bash
npm run newsletter:send setup-guide
```

The `newsletter:send` command calls the `scheduleSendPostNewsletter` mutation directly and sends emails in the background. Check the Newsletter Admin page or recent sends to see results.

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

### Content Management

**Posts and Pages List Views:**

- View all posts and pages (published and unpublished)
- Filter by status: All, Published, Drafts
- Search by title or content
- Pagination with "First" and "Next" buttons
- Items per page selector (15, 25, 50, 100) - default: 15
- Edit, view, and publish/unpublish options
- WordPress-style UI with date, edit, view, and publish controls

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

**Write Post and Write Page:**

- Full-screen writing interface
- Markdown editor with word/line/character counts
- Frontmatter reference panel
- Download markdown button for new content
- Content persists in localStorage
- Separate storage for post and page content

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

### Newsletter Management

All Newsletter Admin features integrated into the Dashboard:

- **Subscribers:** View, search, filter, and delete subscribers
- **Send Newsletter:** Select a blog post to send as newsletter
- **Write Email:** Compose custom emails with markdown support
- **Recent Sends:** View last 10 newsletter sends (posts and custom emails)
- **Email Stats:** Dashboard with total emails, newsletters sent, active subscribers, retention rate

All newsletter sections are full-width in the dashboard content area.

### Content Import

**Firecrawl Import:**

- Import articles from external URLs using Firecrawl API
- Requires `FIRECRAWL_API_KEY` in `.env.local`
- Creates local markdown drafts in `content/blog/`
- Imported posts are drafts (`published: false`) by default
- Review, edit, set `published: true`, then sync

### Site Configuration

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

### Sync Commands

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

### Dashboard Features

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

### Technical Details

- Uses Convex queries for real-time data
- All mutations follow Convex best practices (idempotent, indexed queries)
- Frontmatter sidebar width persisted in localStorage
- Editor content persisted in localStorage
- Independent scrolling for editor and sidebar sections
- Preview uses ReactMarkdown with remark-gfm, remark-breaks, rehype-raw, rehype-sanitize

### Sync Commands Reference

**Development:**

- `npm run sync` - Sync markdown content to development Convex
- `npm run sync:discovery` - Update discovery files (AGENTS.md, llms.txt) with development data
- `npm run sync:all` - Run both content sync and discovery sync (development)

**Production:**

- `npm run sync:prod` - Sync markdown content to production Convex
- `npm run sync:discovery:prod` - Update discovery files with production data
- `npm run sync:all:prod` - Run both content sync and discovery sync (production)

**Sync Server:**

- `npm run sync-server` - Start local HTTP server for executing sync commands from dashboard UI

**Content Import:**

- `npm run import <url>` - Import external URL as markdown post (requires FIRECRAWL_API_KEY)

**Note:** The dashboard provides a UI for these commands. When the sync server is running (`npm run sync-server`), you can execute commands directly from the dashboard with real-time output. Otherwise, the dashboard shows commands in a modal for copying to your terminal.

## API endpoints

| Endpoint                       | Description                 |
| ------------------------------ | --------------------------- |
| `/stats`                       | Real-time analytics         |
| `/newsletter-admin`            | Newsletter management UI    |
| `/rss.xml`                     | RSS feed (descriptions)     |
| `/rss-full.xml`                | RSS feed (full content)     |
| `/sitemap.xml`                 | XML sitemap                 |
| `/api/posts`                   | JSON post list              |
| `/api/post?slug=xxx`           | Single post (JSON)          |
| `/api/post?slug=xxx&format=md` | Single post (markdown)      |
| `/api/export`                  | All posts with full content |
| `/raw/{slug}.md`               | Static raw markdown file    |
| `/.well-known/ai-plugin.json`  | AI plugin manifest          |
| `/openapi.yaml`                | OpenAPI 3.0 specification   |
| `/llms.txt`                    | AI agent discovery          |

## MCP Server

The site includes an HTTP-based Model Context Protocol (MCP) server for AI tool integration. It allows AI assistants like Cursor and Claude Desktop to access blog content programmatically.

**Endpoint:** `https://www.markdown.fast/mcp`

**Features:**

- 24/7 availability via Netlify Edge Functions
- Public access with rate limiting (50 req/min per IP)
- Optional API key for higher limits (1000 req/min)
- Read-only access to content

**Available tools:**

| Tool             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `list_posts`     | Get all published blog posts with metadata       |
| `get_post`       | Get a single post by slug with full content      |
| `list_pages`     | Get all published pages                          |
| `get_page`       | Get a single page by slug with full content      |
| `get_homepage`   | Get homepage data with featured and recent posts |
| `search_content` | Full text search across posts and pages          |
| `export_all`     | Batch export all content                         |

**Cursor configuration:**

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp"
    }
  }
}
```

**For forks:** The MCP server automatically connects to your Convex deployment. Ensure `VITE_CONVEX_URL` is set in Netlify. Optionally set `MCP_API_KEY` for authenticated access with higher rate limits.

See [How to Use the MCP Server](/how-to-use-mcp-server) for full documentation.

## Raw markdown files

When you run `npm run sync` (development) or `npm run sync:prod` (production), static `.md` files are generated in `public/raw/` for each published post and page. Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together.

**Access pattern:** `/raw/{slug}.md`

**Examples:**

- `/raw/setup-guide.md`
- `/raw/about.md`

These files include a metadata header with type, date, reading time, and tags. Access via the "View as Markdown" option in the Copy Page dropdown.

## Markdown formatting

For complete markdown syntax examples including tables, collapsible sections, code blocks, lists, links, images, and all formatting options, see [Writing Markdown with Code Examples](/markdown-with-code-examples).

**Quick reference:**

- **Tables:** Render with GitHub-style formatting, clean borders, mobile responsive
- **Collapsible sections:** Use HTML `<details>` and `<summary>` tags for expandable content
- **Code blocks:** Support syntax highlighting for TypeScript, JavaScript, bash, JSON, and more
- **Images:** Place in `public/images/` and reference with absolute paths

All markdown features work with all four themes and are styled to match the site design.

## Import external content

Use Firecrawl to import articles from external URLs:

```bash
npm run import https://example.com/article
```

Setup:

1. Get an API key from firecrawl.dev
2. Add `FIRECRAWL_API_KEY=fc-xxx` to `.env.local`

The import command creates local markdown files only. It does not interact with Convex directly.

**After importing:**

- `npm run sync` to push to development
- `npm run sync:prod` to push to production
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together

There is no `npm run import:prod` because import creates local files and sync handles the target environment.

Imported posts are drafts (`published: false`). Review, edit, set `published: true`, then sync.

## Deployment

### Netlify setup

1. Connect GitHub repo to Netlify
2. Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
3. Publish directory: `dist`
4. Add env variables:
   - `CONVEX_DEPLOY_KEY` (from Convex Dashboard > Project Settings > Deploy Key)
   - `VITE_CONVEX_URL` (your production Convex URL, e.g., `https://your-deployment.convex.cloud`)

Both are required: deploy key for builds, URL for edge function runtime.

### Convex production

```bash
npx convex deploy
```

### Edge functions

RSS, sitemap, and API routes are handled by Netlify Edge Functions in `netlify/edge-functions/`. They dynamically read `VITE_CONVEX_URL` from the environment. No manual URL configuration needed.

## Convex schema

```typescript
// convex/schema.ts
export default defineSchema({
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    published: v.boolean(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    image: v.optional(v.string()),
    excerpt: v.optional(v.string()), // For card view
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),

  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
    order: v.optional(v.number()),
    excerpt: v.optional(v.string()), // For card view
    image: v.optional(v.string()), // Thumbnail for featured cards
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),
});
```

## Troubleshooting

**Posts not appearing**

- Check `published: true` in frontmatter
- Run `npm run sync` for development
- Run `npm run sync:prod` for production
- Use `npm run sync:all` or `npm run sync:all:prod` to sync content and update discovery files together
- Verify in Convex dashboard

**RSS/Sitemap errors**

- Verify `VITE_CONVEX_URL` is set in Netlify
- Test Convex HTTP URL: `https://your-deployment.convex.site/rss.xml`
- Check edge functions in `netlify/edge-functions/`

**Build failures**

- Verify `CONVEX_DEPLOY_KEY` is set in Netlify
- Ensure `@types/node` is in devDependencies
- Build command must include `--include=dev`
- Check Node.js version (18+)