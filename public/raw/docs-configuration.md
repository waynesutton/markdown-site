# Configuration

---
Type: page
Date: 2026-01-06
---

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
| `src/config/siteConfig.ts`          | Default theme (`defaultTheme` field)                                                                     |

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

Configure in `src/config/siteConfig.ts`:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  defaultTheme: "tan",
};
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

### Font sizes

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