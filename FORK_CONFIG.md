# Fork Configuration Guide

After forking this repo, update these files with your site information. Choose one of three options:

**Important**: Keep your `fork-config.json` file after configuring. The `sync:discovery` commands will use it to update discovery files (`AGENTS.md`, `CLAUDE.md`, `public/llms.txt`) with your configured values.

---

## Option 1: npx CLI (Recommended)

Run a single command to scaffold and configure your project with an interactive wizard:

```bash
npx create-markdown-sync my-site
```

The interactive wizard will:

1. Clone the repository
2. Walk through all configuration options (site name, URL, features, etc.)
3. Install dependencies
4. Set up Convex backend (opens browser for login)
5. Run initial content sync
6. Open your site in the browser

### After setup

```bash
cd my-site
npm run dev      # Start dev server at localhost:5173
npm run sync     # Sync content changes
```

### CLI Options

```bash
npx create-markdown-sync my-site --force       # Overwrite existing directory
npx create-markdown-sync my-site --skip-convex # Skip Convex setup
npx create-markdown-sync my-site --skip-open   # Don't open browser after setup
```

---

## Option 2: Automated Script

Run a single command to configure all files automatically.

### Step 1: Create your config file

```bash
cp fork-config.json.example fork-config.json
```

The file `fork-config.json` is gitignored, so your configuration stays local and is not committed. The `.example` file remains as a template.

**Keep this file**: Even after running `npm run configure`, keep the `fork-config.json` file. Future sync commands will use it to maintain your configuration.

### Step 2: Edit fork-config.json

```json
{
  "siteName": "Your Site Name",
  "siteTitle": "Your Tagline",
  "siteDescription": "A one-sentence description of your site.",
  "siteUrl": "https://yoursite.netlify.app",
  "siteDomain": "yoursite.netlify.app",
  "githubUsername": "yourusername",
  "githubRepo": "your-repo-name",
  "contactEmail": "you@example.com",
  "creator": {
    "name": "Your Name",
    "twitter": "https://x.com/yourhandle",
    "linkedin": "https://www.linkedin.com/in/yourprofile/",
    "github": "https://github.com/yourusername"
  },
  "bio": "Your bio text here.",
  "theme": "tan"
}
```

### Step 3: Run the configuration script

```bash
npm run configure
```

This updates all 14 configuration files automatically:

- `src/config/siteConfig.ts` (site name, bio, GitHub username, gitHubRepo config, default theme)
- `src/pages/Home.tsx` (intro paragraph, footer links)
- `src/pages/Post.tsx` (SITE_URL, SITE_NAME constants)
- `src/pages/DocsPage.tsx` (SITE_URL constant for CopyPageDropdown)
- `convex/http.ts` (SITE_URL, SITE_NAME constants)
- `convex/rss.ts` (SITE_URL, SITE_TITLE, SITE_DESCRIPTION)
- `netlify/edge-functions/mcp.ts` (SITE_URL, SITE_NAME, MCP_SERVER_NAME)
- `scripts/send-newsletter.ts` (default SITE_URL)
- `index.html` (meta tags, JSON-LD, page title)
- `public/llms.txt` (site info, GitHub link)
- `public/robots.txt` (sitemap URL)
- `public/openapi.yaml` (server URL, site name, example URLs)
- `public/.well-known/ai-plugin.json` (plugin metadata)

### Step 4: Review and deploy

```bash
git diff                    # Review changes
npx convex dev              # Start Convex (if not running)
npm run sync                # Sync content
npm run dev                 # Test locally
```

---

## Option 3: Manual Configuration

Edit each file individually following the guide below.

### Files to Update

| File                                | What to Update                                                              |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, bio, GitHub username, gitHubRepo config, default theme, features |
| `src/pages/Home.tsx`                | Intro paragraph, footer links                                               |
| `src/pages/Post.tsx`                | `SITE_URL`, `SITE_NAME` constants                                           |
| `src/pages/DocsPage.tsx`            | `SITE_URL` constant                                                         |
| `convex/http.ts`                    | `SITE_URL`, `SITE_NAME` constants                                           |
| `convex/rss.ts`                     | `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`                                |
| `netlify/edge-functions/mcp.ts`     | `SITE_URL`, `SITE_NAME`, `MCP_SERVER_NAME` constants                        |
| `scripts/send-newsletter.ts`        | Default `SITE_URL` constant                                                 |
| `index.html`                        | Meta tags, JSON-LD, page title                                              |
| `public/llms.txt`                   | Site info, GitHub link                                                      |
| `public/robots.txt`                 | Sitemap URL                                                                 |
| `public/openapi.yaml`               | Server URL, site name, example URLs                                         |
| `public/.well-known/ai-plugin.json` | Plugin metadata                                                             |

---

## Manual Configuration Details

### 1. src/config/siteConfig.ts

Update the main site configuration:

```typescript
export const siteConfig: SiteConfig = {
  name: "YOUR SITE NAME",
  title: "YOUR TAGLINE",
  logo: "/images/logo.svg", // or null to hide
  intro: null,
  bio: `YOUR BIO TEXT HERE.`,

  // Featured section
  featuredViewMode: "cards", // 'list' or 'cards'
  featuredTitle: "Get started:", // Featured section title (e.g., "Get started:", "Featured", "Popular")
  showViewToggle: true,

  // Logo gallery (set enabled: false to hide)
  logoGallery: {
    enabled: true,
    images: [
      { src: "/images/logos/your-logo.svg", href: "https://example.com" },
    ],
    position: "above-footer",
    speed: 30,
    title: "Built with",
    scrolling: false,
    maxItems: 4,
  },

  // GitHub contributions graph
  gitHubContributions: {
    enabled: true,
    username: "YOURUSERNAME",
    showYearNavigation: true,
    linkToProfile: true,
    title: "GitHub Activity",
  },

  // Visitor map (stats page)
  visitorMap: {
    enabled: true,
    title: "Live Visitors",
  },

  // Blog page
  blogPage: {
    enabled: true,
    showInNav: true,
    title: "Blog",
    description: "All posts from the blog, sorted by date.",
    order: 2,
  },

  // Posts display
  postsDisplay: {
    showOnHome: true,
    showOnBlogPage: true,
  },

  // Homepage configuration
  // Set any page or blog post to serve as the homepage
  homepage: {
    type: "default", // Options: "default" (standard Home component), "page" (use a static page), or "post" (use a blog post)
    slug: undefined, // Required if type is "page" or "post" - the slug of the page/post to use
    originalHomeRoute: "/home", // Route to access the original homepage when custom homepage is set
  },

  links: {
    docs: "/setup-guide",
    convex: "https://convex.dev",
    netlify: "https://netlify.com",
  },

  // GitHub repository config (for AI service links)
  // Used by ChatGPT, Claude, Perplexity "Open in AI" buttons
  gitHubRepo: {
    owner: "YOURUSERNAME", // GitHub username or organization
    repo: "YOUR-REPO-NAME", // Repository name
    branch: "main", // Default branch
    contentPath: "public/raw", // Path to raw markdown files
  },

  // Stats page configuration (optional)
  statsPage: {
    enabled: true, // Global toggle for stats page
    showInNav: true, // Show link in navigation (controlled via hardcodedNavItems)
  },

  // Image lightbox configuration (optional)
  imageLightbox: {
    enabled: true, // Enable click-to-magnify for images in posts/pages
  },

  // MCP Server configuration (optional)
  mcpServer: {
    enabled: true, // Global toggle for MCP server
    endpoint: "/mcp", // Endpoint path
    publicRateLimit: 50, // Requests per minute for public access
    authenticatedRateLimit: 1000, // Requests per minute with API key
    requireAuth: false, // Require API key for all requests
  },
};
```

### 2. src/pages/Home.tsx

Update the intro paragraph (lines 96-108):

```tsx
<p className="home-intro">
  YOUR SITE DESCRIPTION HERE.{" "}
  <a
    href="https://github.com/YOURUSERNAME/YOUR-REPO"
    target="_blank"
    rel="noopener noreferrer"
    className="home-text-link"
  >
    Fork it
  </a>
  , customize it, ship it.
</p>
```

Update the footer section (lines 203-271):

```tsx
<section className="home-footer">
  <p className="home-footer-text">
    Built with{" "}
    <a href={siteConfig.links.convex} target="_blank" rel="noopener noreferrer">
      Convex
    </a>{" "}
    for real-time sync and deployed on{" "}
    <a
      href={siteConfig.links.netlify}
      target="_blank"
      rel="noopener noreferrer"
    >
      Netlify
    </a>
    . Read the{" "}
    <a
      href="https://github.com/YOURUSERNAME/YOUR-REPO"
      target="_blank"
      rel="noopener noreferrer"
    >
      project on GitHub
    </a>{" "}
    to fork and deploy your own. View{" "}
    <a href="/stats" className="home-text-link">
      real-time site stats
    </a>
    .
  </p>
  <p></p>
  <br></br>
  <p className="home-footer-text">
    Created by{" "}
    <a
      href="https://x.com/YOURHANDLE"
      target="_blank"
      rel="noopener noreferrer"
    >
      YOUR NAME
    </a>{" "}
    with Convex, Cursor, and Claude. Follow on{" "}
    <a
      href="https://x.com/YOURHANDLE"
      target="_blank"
      rel="noopener noreferrer"
    >
      Twitter/X
    </a>
    ,{" "}
    <a
      href="https://www.linkedin.com/in/YOURPROFILE/"
      target="_blank"
      rel="noopener noreferrer"
    >
      LinkedIn
    </a>
    , and{" "}
    <a
      href="https://github.com/YOURUSERNAME"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>
    .
  </p>
</section>
```

### 3. src/pages/Post.tsx

Update the site constants (lines 11-13):

```typescript
const SITE_URL = "https://YOURSITE.netlify.app";
const SITE_NAME = "YOUR SITE NAME";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

### 4. convex/http.ts

Update the site configuration (lines 9-10):

```typescript
const SITE_URL = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const SITE_NAME = "YOUR SITE NAME";
```

Also update the `generateMetaHtml` function (lines 233-234):

```typescript
const siteUrl = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const siteName = "YOUR SITE NAME";
```

### 5. convex/rss.ts

Update the RSS configuration (lines 5-8):

```typescript
const SITE_URL = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const SITE_TITLE = "YOUR SITE NAME";
const SITE_DESCRIPTION = "YOUR SITE DESCRIPTION HERE.";
```

### 6. index.html

Update all meta tags and JSON-LD structured data:

```html
<!-- SEO Meta Tags -->
<meta name="description" content="YOUR SITE DESCRIPTION" />
<meta name="author" content="YOUR SITE NAME" />

<!-- Open Graph -->
<meta property="og:title" content="YOUR SITE NAME" />
<meta property="og:description" content="YOUR SITE DESCRIPTION" />
<meta property="og:url" content="https://YOURSITE.netlify.app/" />
<meta property="og:site_name" content="YOUR SITE NAME" />
<meta
  property="og:image"
  content="https://YOURSITE.netlify.app/images/og-default.svg"
/>

<!-- Twitter Card -->
<meta property="twitter:domain" content="YOURSITE.netlify.app" />
<meta property="twitter:url" content="https://YOURSITE.netlify.app/" />
<meta name="twitter:title" content="YOUR SITE NAME" />
<meta name="twitter:description" content="YOUR SITE DESCRIPTION" />
<meta
  name="twitter:image"
  content="https://YOURSITE.netlify.app/images/og-default.svg"
/>

<!-- JSON-LD -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "YOUR SITE NAME",
    "url": "https://YOURSITE.netlify.app",
    "description": "YOUR SITE DESCRIPTION"
  }
</script>

<title>YOUR SITE TITLE</title>
```

### 7. public/llms.txt

Update site information:

```
# Site Information
- Name: YOUR SITE NAME
- URL: https://YOURSITE.netlify.app
- Description: YOUR SITE DESCRIPTION

# Links
- GitHub: https://github.com/YOURUSERNAME/YOUR-REPO
```

### 8. public/robots.txt

Update the header and sitemap URL:

```
# robots.txt for YOUR SITE NAME

Sitemap: https://YOURSITE.netlify.app/sitemap.xml
```

### 9. public/openapi.yaml

Update API title and server URL:

```yaml
info:
  title: YOUR SITE NAME API
  contact:
    url: https://github.com/YOURUSERNAME/YOUR-REPO

servers:
  - url: https://YOURSITE.netlify.app
```

### 10. public/.well-known/ai-plugin.json

Update plugin metadata:

```json
{
  "name_for_human": "YOUR SITE NAME",
  "name_for_model": "your_site_name",
  "description_for_human": "YOUR SITE DESCRIPTION",
  "contact_email": "you@example.com"
}
```

### 11. Default Theme (in siteConfig.ts)

Change the default theme in `src/config/siteConfig.ts`:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  defaultTheme: "tan", // Options: "dark", "light", "tan", "cloud"
};
```

---

## Homepage Configuration

You can set any page or blog post to serve as your homepage instead of the default Home component.

### In fork-config.json

```json
{
  "homepage": {
    "type": "page",
    "slug": "about",
    "originalHomeRoute": "/home"
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
homepage: {
  type: "page", // Options: "default", "page", or "post"
  slug: "about", // Required if type is "page" or "post" - the slug of the page/post to use
  originalHomeRoute: "/home", // Route to access the original homepage when custom homepage is set
},
```

### Options

- `type`: `"default"` (standard Home component), `"page"` (use a static page), or `"post"` (use a blog post)
- `slug`: The slug of the page or post to use (required if type is "page" or "post")
- `originalHomeRoute`: Route to access the original homepage (default: "/home")

### Behavior

- Custom homepage uses the page/post's full content and features (sidebar, copy dropdown, footer, etc.)
- Featured section is NOT shown on custom homepage (only on default Home component)
- SEO metadata comes from the page/post's frontmatter
- Original homepage remains accessible at `/home` (or configured route) when custom homepage is set
- Back button is hidden when a page/post is used as the homepage

### Examples

**Use a static page as homepage:**

```typescript
homepage: {
  type: "page",
  slug: "about",
  originalHomeRoute: "/home",
},
```

**Use a blog post as homepage:**

```typescript
homepage: {
  type: "post",
  slug: "welcome-post",
  originalHomeRoute: "/home",
},
```

**Switch back to default homepage:**

```typescript
homepage: {
  type: "default",
  slug: undefined,
  originalHomeRoute: "/home",
},
```

---

## Newsletter Configuration

The newsletter feature integrates with AgentMail for email subscriptions and sending. It is disabled by default.

### Environment Variables

Set these in the Convex dashboard:

| Variable            | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `AGENTMAIL_API_KEY` | Your AgentMail API key                                    |
| `AGENTMAIL_INBOX`   | Your inbox address (e.g., `newsletter@mail.agentmail.to`) |

### In fork-config.json

```json
{
  "newsletter": {
    "enabled": true,
    "agentmail": {
      "inbox": "newsletter@mail.agentmail.to"
    },
    "signup": {
      "home": {
        "enabled": true,
        "position": "above-footer",
        "title": "Stay Updated",
        "description": "Get new posts delivered to your inbox."
      },
      "blogPage": {
        "enabled": true,
        "position": "above-footer",
        "title": "Subscribe",
        "description": "Get notified when new posts are published."
      },
      "posts": {
        "enabled": true,
        "position": "below-content",
        "title": "Enjoyed this post?",
        "description": "Subscribe for more updates."
      }
    }
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
newsletter: {
  enabled: true, // Master switch for newsletter feature
  agentmail: {
    inbox: "newsletter@mail.agentmail.to",
  },
  signup: {
    home: {
      enabled: true,
      position: "above-footer", // or "below-intro"
      title: "Stay Updated",
      description: "Get new posts delivered to your inbox.",
    },
    blogPage: {
      enabled: true,
      position: "above-footer", // or "below-posts"
      title: "Subscribe",
      description: "Get notified when new posts are published.",
    },
    posts: {
      enabled: true,
      position: "below-content",
      title: "Enjoyed this post?",
      description: "Subscribe for more updates.",
    },
  },
},
```

### Frontmatter Override

Hide or show newsletter signup on specific posts using frontmatter:

```yaml
---
title: My Post
newsletter: false # Hide newsletter signup on this post
---
```

Or force show it even if posts default is disabled:

```yaml
---
title: Special Offer Post
newsletter: true # Show newsletter signup on this post
---
```

### Sending Newsletters

To send a newsletter for a specific post:

```bash
npm run newsletter:send setup-guide
```

Or use the Convex CLI directly:

```bash
npx convex run newsletter:sendPostNewsletter '{"postSlug":"setup-guide","siteUrl":"https://yoursite.com","siteName":"Your Site"}'
```

### Subscriber Management

View subscriber count on the `/stats` page. Subscribers are stored in the `newsletterSubscribers` table in Convex.

### Newsletter Admin

The Newsletter Admin UI at `/newsletter-admin` provides a management interface for subscribers and sending newsletters.

**Configuration:**

In `src/config/siteConfig.ts`:

```typescript
newsletterAdmin: {
  enabled: true,      // Enable /newsletter-admin route
  showInNav: false,   // Hide from navigation (access via direct URL)
},
```

**Features:**

- View and search all subscribers
- Filter by status (all, active, unsubscribed)
- Delete subscribers
- Send blog posts as newsletters
- Write and send custom emails with markdown support
- View recent newsletter sends
- Email statistics dashboard

**CLI Commands:**

```bash
# Send a blog post to all subscribers
npm run newsletter:send <post-slug>

# Send weekly stats summary
npm run newsletter:send:stats
```

### Newsletter Notifications

Configure developer notifications for subscriber events:

In `src/config/siteConfig.ts`:

```typescript
newsletterNotifications: {
  enabled: true,              // Global toggle for notifications
  newSubscriberAlert: true,   // Send email when new subscriber signs up
  weeklyStatsSummary: true,   // Send weekly stats summary email
},
```

Uses `AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX` as recipient.

### Weekly Digest

Automated weekly email with posts from the past 7 days:

In `src/config/siteConfig.ts`:

```typescript
weeklyDigest: {
  enabled: true,      // Global toggle for weekly digest
  dayOfWeek: 0,       // 0 = Sunday, 6 = Saturday
  subject: "Weekly Digest", // Email subject prefix
},
```

Runs automatically via cron job every Sunday at 9:00 AM UTC.

### Dashboard

The dashboard at `/dashboard` provides a centralized UI for managing content, configuring the site, and performing sync operations.

**Configuration:**

In `src/config/siteConfig.ts`:

```typescript
dashboard: {
  enabled: true,        // Global toggle for dashboard page
  requireAuth: false,   // Set to true to require WorkOS authentication
},
```

**Authentication:**

WorkOS authentication is optional. When `requireAuth` is `false`, the dashboard is open access. When `requireAuth` is `true` and WorkOS is configured, users must log in to access the dashboard.

**WorkOS Setup:**

To enable WorkOS authentication:

1. Create a WorkOS account at [workos.com](https://workos.com)
2. Set `VITE_WORKOS_CLIENT_ID` in your `.env.local` file
3. Set `VITE_WORKOS_REDIRECT_URI` (e.g., `http://localhost:5173/callback`)
4. Add `WORKOS_CLIENT_ID` to Convex environment variables
5. Configure redirect URI in WorkOS dashboard
6. Set `requireAuth: true` in `siteConfig.ts`

See [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos) for complete setup instructions.

**Features:**

- Content management: Edit posts and pages with live preview
- Sync commands: Run sync operations from the browser
- Site configuration: Configure all settings via UI
- Newsletter management: Integrated subscriber and email management
- AI Agent: Writing assistance powered by Claude
- Analytics: Real-time stats dashboard

See [How to use the Markdown sync dashboard](https://www.markdown.fast/how-to-use-the-markdown-sync-dashboard) for complete usage guide.

### Dashboard Sync Server

The dashboard includes a sync server feature that allows executing sync commands directly from the browser UI without opening a terminal.

**Setup:**

1. Start the sync server locally:

```bash
npm run sync-server
```

2. The server runs on `localhost:3001` and is automatically detected by the dashboard
3. Optional: Set `SYNC_TOKEN` environment variable for authentication

**Features:**

- Execute sync commands from dashboard UI
- Real-time output streaming in dashboard terminal view
- Server status indicator (online/offline)
- Whitelisted commands only (sync, sync:prod, sync:discovery, sync:discovery:prod, sync:all, sync:all:prod)

---

## Stats Page Configuration

Control access to the `/stats` route for viewing site analytics.

### In fork-config.json

```json
{
  "statsPage": {
    "enabled": true,
    "showInNav": true
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
statsPage: {
  enabled: true, // Global toggle for stats page
  showInNav: true, // Show link in navigation (controlled via hardcodedNavItems)
},
```

**Note:** Navigation visibility is controlled via `hardcodedNavItems` configuration. Set `showInNav: false` on the stats nav item to hide it.

---

## Image Lightbox Configuration

Enable click-to-magnify functionality for images in blog posts and pages.

### In fork-config.json

```json
{
  "imageLightbox": {
    "enabled": true
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
imageLightbox: {
  enabled: true, // Enable click-to-magnify for images
},
```

**Features:**

- Click any image in a post/page to open in full-screen lightbox
- Dark backdrop with close button (X icon)
- Keyboard support: Press Escape to close
- Click outside image (backdrop) to close
- Alt text displayed as caption below image
- Images show pointer cursor (`zoom-in`) when enabled

---

## Semantic Search Configuration

Enable AI-powered semantic search using OpenAI embeddings. When disabled, only keyword search is available.

### In fork-config.json

```json
{
  "semanticSearch": {
    "enabled": false
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
semanticSearch: {
  enabled: true, // Enable semantic search (requires OPENAI_API_KEY)
},
```

**Requirements:**

When enabled, set the OpenAI API key in Convex:

```bash
npx convex env set OPENAI_API_KEY sk-your-key-here
```

**Features:**

- Toggle between Keyword and Semantic modes in search modal (Cmd+K)
- Keyword search: exact word matching (instant, free)
- Semantic search: finds content by meaning (~300ms, ~$0.0001/query)
- Similarity scores displayed as percentages
- Embeddings generated automatically during `npm run sync`

**Default:** `enabled: false` (keyword search only, no API key required)

See [Semantic Search](/docs-semantic-search) for detailed documentation.

---

## MCP Server Configuration

HTTP-based Model Context Protocol server for AI tool integration (Cursor, Claude Desktop).

### In fork-config.json

```json
{
  "mcpServer": {
    "enabled": true,
    "endpoint": "/mcp",
    "publicRateLimit": 50,
    "authenticatedRateLimit": 1000,
    "requireAuth": false
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
mcpServer: {
  enabled: true, // Global toggle for MCP server
  endpoint: "/mcp", // Endpoint path
  publicRateLimit: 50, // Requests per minute for public access
  authenticatedRateLimit: 1000, // Requests per minute with API key
  requireAuth: false, // Require API key for all requests
},
```

**Environment Variables:**

Set `MCP_API_KEY` in Netlify environment variables for authenticated access.

**Features:**

- Accessible 24/7 at `https://yoursite.com/mcp`
- Public access with Netlify built-in rate limiting (50 req/min per IP)
- Optional API key authentication for higher limits (1000 req/min)
- Read-only access to blog posts, pages, homepage, and search
- 7 tools: `list_posts`, `get_post`, `list_pages`, `get_page`, `get_homepage`, `search_content`, `export_all`
- JSON-RPC 2.0 protocol over HTTP POST

See [How to Use the MCP Server](https://www.markdown.fast/how-to-use-mcp-server) for client configuration examples.

---

## Contact Form Configuration

Enable contact forms on any page or post via frontmatter. Messages are sent via AgentMail.

### Environment Variables

Set these in the Convex dashboard:

| Variable                  | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `AGENTMAIL_API_KEY`       | Your AgentMail API key                                                      |
| `AGENTMAIL_INBOX`         | Your inbox address for sending (e.g., `newsletter@mail.agentmail.to`)       |
| `AGENTMAIL_CONTACT_EMAIL` | Optional: recipient for contact form messages (defaults to AGENTMAIL_INBOX) |

### Site Config

In `src/config/siteConfig.ts`:

```typescript
contactForm: {
  enabled: true, // Global toggle for contact form feature
  title: "Get in Touch",
  description: "Send us a message and we'll get back to you.",
},
```

**Note:** Recipient email is configured via Convex environment variables (`AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX`). Never hardcode email addresses in code.

### Frontmatter Usage

Enable contact form on any page or post:

```yaml
---
title: Contact Us
slug: contact
contactForm: true
---
```

The form includes name, email, and message fields. Submissions are stored in Convex and sent via AgentMail to the configured recipient.

---

## Footer Configuration

The footer component displays markdown content and can be configured globally or per-page.

### In fork-config.json

```json
{
  "footer": {
    "enabled": true,
    "showOnHomepage": true,
    "showOnPosts": true,
    "showOnPages": true,
    "showOnBlogPage": true,
    "defaultContent": "Built with [Convex](https://convex.dev) for real-time sync."
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
footer: {
  enabled: true,              // Global toggle for footer
  showOnHomepage: true,       // Show footer on homepage
  showOnPosts: true,          // Default: show footer on blog posts
  showOnPages: true,          // Default: show footer on static pages
  showOnBlogPage: true,       // Show footer on /blog page
  defaultContent: "...",      // Default markdown content
},
```

**Frontmatter Override:**

Set `showFooter: false` in post/page frontmatter to hide footer on specific pages. Set `footer: "..."` to provide custom markdown content.

---

## Social Footer Configuration

Display social icons and copyright information below the main footer. Icons can also appear in the header.

### In fork-config.json

```json
{
  "socialFooter": {
    "enabled": true,
    "showOnHomepage": true,
    "showOnPosts": true,
    "showOnPages": true,
    "showOnBlogPage": true,
    "showInHeader": true,
    "socialLinks": [
      {
        "platform": "github",
        "url": "https://github.com/yourusername/your-repo-name"
      },
      {
        "platform": "twitter",
        "url": "https://x.com/yourhandle"
      }
    ],
    "copyright": {
      "siteName": "Your Site Name",
      "showYear": true
    }
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
socialFooter: {
  enabled: true,
  showOnHomepage: true,
  showOnPosts: true,
  showOnPages: true,
  showOnBlogPage: true,
  showInHeader: true, // Show social icons in header (left of search icon)
  socialLinks: [
    { platform: "github", url: "https://github.com/username" },
    { platform: "twitter", url: "https://x.com/handle" },
    { platform: "linkedin", url: "https://linkedin.com/in/profile" },
  ],
  copyright: {
    siteName: "Your Site Name",
    showYear: true, // Auto-updates to current year
  },
},
```

**Supported Platforms:** github, twitter, linkedin, instagram, youtube, tiktok, discord, website

**Header Social Icons:**

When `showInHeader: true`, social icons appear in the navigation header to the left of the search icon on desktop. This provides additional visibility for your social links while maintaining the footer placement.

**Frontmatter Override:**

Set `showSocialFooter: false` in post/page frontmatter to hide social footer on specific pages.

---

## Right Sidebar Configuration

Enable a right sidebar on posts and pages that displays CopyPageDropdown at wide viewport widths.

### In fork-config.json

```json
{
  "rightSidebar": {
    "enabled": true,
    "minWidth": 1135
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
rightSidebar: {
  enabled: true,      // Set to false to disable globally
  minWidth: 1135,    // Minimum viewport width to show sidebar
},
```

**Frontmatter Usage:**

Enable right sidebar on specific posts/pages:

```yaml
---
title: My Post
rightSidebar: true
---
```

**Features:**

- Right sidebar appears at 1135px+ viewport width
- Contains CopyPageDropdown with sharing options
- Three-column layout: left sidebar (TOC), main content, right sidebar
- Hidden below 1135px, CopyPageDropdown returns to nav

---

## AI Chat Configuration

Configure the AI writing assistant. The Dashboard AI Agent supports multiple providers (Anthropic, OpenAI, Google) and includes image generation.

### In fork-config.json

```json
{
  "aiChat": {
    "enabledOnWritePage": false,
    "enabledOnContent": false
  },
  "aiDashboard": {
    "enableImageGeneration": true,
    "defaultTextModel": "claude-sonnet-4-20250514",
    "textModels": [
      {
        "id": "claude-sonnet-4-20250514",
        "name": "Claude Sonnet 4",
        "provider": "anthropic"
      },
      { "id": "gpt-4o", "name": "GPT-4o", "provider": "openai" },
      {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "provider": "google"
      }
    ],
    "imageModels": [
      {
        "id": "gemini-2.0-flash-exp-image-generation",
        "name": "Nano Banana",
        "provider": "google"
      },
      {
        "id": "imagen-3.0-generate-002",
        "name": "Nano Banana Pro",
        "provider": "google"
      }
    ]
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
aiChat: {
  enabledOnWritePage: true,  // Show AI chat toggle on /write page
  enabledOnContent: true,    // Allow AI chat on posts/pages via frontmatter
},
aiDashboard: {
  enableImageGeneration: true, // Enable image generation tab in Dashboard AI Agent
  defaultTextModel: "claude-sonnet-4-20250514", // Default model for chat
  textModels: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
    { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
  ],
  imageModels: [
    { id: "gemini-2.0-flash-exp-image-generation", name: "Nano Banana", provider: "google" },
    { id: "imagen-3.0-generate-002", name: "Nano Banana Pro", provider: "google" },
  ],
},
```

**Environment Variables (Convex):**

| Variable            | Provider  | Features                                 |
| ------------------- | --------- | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | Anthropic | Claude Sonnet 4 chat                     |
| `OPENAI_API_KEY`    | OpenAI    | GPT-4o chat                              |
| `GOOGLE_AI_API_KEY` | Google    | Gemini 2.0 Flash chat + image generation |

**Optional system prompt variables:**

- `CLAUDE_PROMPT_STYLE`, `CLAUDE_PROMPT_COMMUNITY`, `CLAUDE_PROMPT_RULES` (optional): Split system prompts
- `CLAUDE_SYSTEM_PROMPT` (optional): Single system prompt fallback

**Note:** Only configure the API keys for providers you want to use. If a key is not set, users see a helpful setup message when they try to use that model.

**Frontmatter Usage:**

Enable AI chat on posts/pages:

```yaml
---
title: My Post
rightSidebar: true
aiChat: true
---
```

Requires `rightSidebar: true` and `siteConfig.aiChat.enabledOnContent: true`.

**Dashboard AI Agent Features:**

- **Chat Tab:** Multi-model selector with lazy API key validation
- **Image Tab:** AI image generation with aspect ratio selection (1:1, 16:9, 9:16, 4:3, 3:4)
- Images stored in Convex storage with session tracking
- Gallery view of recent generated images

---

## Ask AI Configuration

Enable an Ask AI header chat button that opens a modal for asking questions about site content. Uses RAG (Retrieval Augmented Generation) with streaming responses.

### In fork-config.json

```json
{
  "askAI": {
    "enabled": true,
    "defaultModel": "claude-sonnet-4-20250514",
    "models": [
      { "id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "anthropic" },
      { "id": "gpt-4o", "name": "GPT-4o", "provider": "openai" }
    ]
  }
}
```

### Manual Configuration

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
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for the LLM (depending on selected model)

**Features:**

- Header button opens a chat modal
- Retrieves relevant content using semantic search
- Streaming responses with markdown rendering
- Multi-model selector (Claude Sonnet 4, GPT-4o)
- Conversation history within session

---

## Posts Display Configuration

Control where posts appear and limit homepage display.

### In fork-config.json

```json
{
  "postsDisplay": {
    "showOnHome": true,
    "showOnBlogPage": true,
    "homePostsLimit": 5,
    "homePostsReadMore": {
      "enabled": true,
      "text": "Read more blog posts",
      "link": "/blog"
    }
  }
}
```

### Manual Configuration

In `src/config/siteConfig.ts`:

```typescript
postsDisplay: {
  showOnHome: true,           // Show post list on homepage
  showOnBlogPage: true,       // Show post list on /blog page
  homePostsLimit: 5,          // Limit posts on homepage (undefined = show all)
  homePostsReadMore: {
    enabled: true,            // Show "read more" link when limited
    text: "Read more blog posts",
    link: "/blog",
  },
},
```

---

## AI Agent Prompt

Copy this prompt to have an AI agent apply all changes:

```
I just forked the markdown-site repo. Please update all configuration files with my site information:

Site Name: [YOUR SITE NAME]
Site Title/Tagline: [YOUR TAGLINE]
Site Description: [YOUR DESCRIPTION]
Site URL: https://[YOURSITE].netlify.app
GitHub Username: [YOURUSERNAME]
GitHub Repo: [YOUR-REPO]
Contact Email: [your@email.com]

Creator Info:
- Name: [YOUR NAME]
- Twitter: https://x.com/[YOURHANDLE]
- LinkedIn: https://www.linkedin.com/in/[YOURPROFILE]/
- GitHub: https://github.com/[YOURUSERNAME]

GitHub Repo Config (for AI service links):
- Owner: [YOURUSERNAME]
- Repo: [YOUR-REPO]
- Branch: main
- Content Path: public/raw

Update these files:
1. src/config/siteConfig.ts - site name, bio, GitHub username, gitHubRepo config, defaultTheme
2. src/pages/Home.tsx - intro paragraph and footer section with all creator links
3. src/pages/Post.tsx - SITE_URL and SITE_NAME constants
4. src/pages/DocsPage.tsx - SITE_URL constant
5. convex/http.ts - SITE_URL and SITE_NAME constants
6. convex/rss.ts - SITE_URL, SITE_TITLE, SITE_DESCRIPTION
7. netlify/edge-functions/mcp.ts - SITE_URL, SITE_NAME, MCP_SERVER_NAME constants
8. scripts/send-newsletter.ts - default SITE_URL constant
9. index.html - all meta tags, JSON-LD, title
10. public/llms.txt - site info and GitHub link
11. public/robots.txt - header comment and sitemap URL
12. public/openapi.yaml - API title, server URL, contact URL, example URLs
13. public/.well-known/ai-plugin.json - plugin metadata and contact email
```

---

## After Configuration

1. Run `npx convex dev` to initialize Convex
2. Run `npm run sync` to sync content to development
3. Run `npm run dev` to test locally
4. Deploy to Netlify when ready

**Note**: Keep your `fork-config.json` file. When you run `npm run sync:discovery` or `npm run sync:all`, it reads from `fork-config.json` to update discovery files with your site information.

---

## Syncing Discovery Files

Discovery files (`AGENTS.md`, `CLAUDE.md`, and `public/llms.txt`) can be automatically updated with your current app data.

**How it works**: The sync:discovery script reads from `fork-config.json` (if it exists) to get your site name, URL, and GitHub info. This ensures your configured values are preserved when updating discovery files.

### Commands

| Command                       | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| `npm run sync:discovery`      | Update discovery files with local Convex data         |
| `npm run sync:discovery:prod` | Update discovery files with production Convex data    |
| `npm run sync:all`            | Sync content + discovery files together (development) |
| `npm run sync:all:prod`       | Sync content + discovery files together (production)  |

### When to run

- **`npm run sync`**: Run when you add, edit, or remove markdown content
- **`npm run sync:discovery`**: Run when you change site configuration or want to update discovery files with latest post counts
- **`npm run sync:all`**: Run both syncs together (recommended for complete updates)

### What gets updated

| File              | Updated Content                                                     |
| ----------------- | ------------------------------------------------------------------- |
| `AGENTS.md`       | Project overview, current status (site name, URL, post/page counts) |
| `public/llms.txt` | Site info, total posts, latest post date, GitHub URL                |

The script reads from `siteConfig.ts` and queries Convex for live content statistics.

---

## Optional: Content Files

Replace example content in:

| File                           | Purpose                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `content/blog/*.md`            | Blog posts                                                                                   |
| `content/pages/*.md`           | Static pages (About, etc.)                                                                   |
| `content/pages/home.md`        | Homepage intro content (slug: `home-intro`, uses blog heading styles)                        |
| `content/pages/footer.md`      | Footer content (slug: `footer`, syncs via markdown, falls back to siteConfig.defaultContent) |
| `public/images/logo.svg`       | Site logo                                                                                    |
| `public/images/og-default.svg` | Default social share image                                                                   |
| `public/images/logos/*.svg`    | Logo gallery images                                                                          |

---

## SEO Bot Configuration

The site serves pre-rendered HTML with correct canonical URLs and meta tags to search engines and social preview bots. Configure bot detection in `netlify/edge-functions/botMeta.ts`.

### How It Works

The edge function detects different types of bots and serves appropriate responses:

| Bot Type            | Response                                 | Examples                             |
| ------------------- | ---------------------------------------- | ------------------------------------ |
| Social preview bots | Pre-rendered HTML with OG tags           | Twitter, Facebook, LinkedIn, Discord |
| Search engine bots  | Pre-rendered HTML with correct canonical | Google, Bing, DuckDuckGo             |
| AI crawlers         | Normal SPA (can render JavaScript)       | GPTBot, ClaudeBot, PerplexityBot     |
| Regular browsers    | Normal SPA                               | Chrome, Firefox, Safari              |

### Customizing Bot Lists

Edit the arrays at the top of `netlify/edge-functions/botMeta.ts`:

```typescript
// Add or remove social preview bots
const SOCIAL_PREVIEW_BOTS = [
  "facebookexternalhit",
  "twitterbot",
  // ... add your own
];

// Add or remove search engine bots
const SEARCH_ENGINE_BOTS = [
  "googlebot",
  "bingbot",
  // ... add your own
];

// Add or remove AI crawlers
const AI_CRAWLERS = [
  "gptbot",
  "claudebot",
  // ... add your own
];
```

### Testing Bot Detection

Test with curl to simulate different bots:

```bash
# Test Googlebot (should get pre-rendered HTML with correct canonical)
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" \
  https://yoursite.com/your-post | grep canonical

# Test normal browser (should get SPA with homepage canonical)
curl https://yoursite.com/your-post | grep canonical
```

### Why This Matters

Single-page apps (SPAs) update meta tags via JavaScript after the page loads. Search engines that check raw HTML before rendering may see incorrect canonical URLs. By serving pre-rendered HTML to search engine bots, we ensure they see the correct canonical URL for each page.

---

## Version Control Configuration

The dashboard includes a built-in Sync version control system. Unlike most features, version control is configured via the Dashboard UI, not `siteConfig.ts` or `fork-config.json`.

### How to enable

1. Navigate to `/dashboard`
2. Go to the **Config** section
3. Find the **Version Control** card
4. Toggle **Enable version control** on

### Features

- **3-day version history** for all posts, pages, home content, and footer
- **Diff visualization** using unified diff format
- **One-click restore** with automatic backup of current content
- **Automatic cleanup** of versions older than 3 days (runs daily at 3 AM UTC)

### When versions are captured

| Source    | When created                                  |
| --------- | --------------------------------------------- |
| sync      | Before markdown sync updates (`npm run sync`) |
| dashboard | Before saving edits in Dashboard              |
| restore   | Before restoring a previous version           |

### Viewing version history

1. Open any post or page in the Dashboard editor
2. Click the **History** button (clock icon) in the editor toolbar
3. Select a version from the list
4. View diff or preview
5. Click **Restore This Version** to revert

### Technical details

- Versions stored in `contentVersions` table in Convex
- Settings stored in `versionControlSettings` table
- Cleanup via cron job in `convex/crons.ts`
- Version capture is async (non-blocking via `ctx.scheduler.runAfter`)

### Why database-based?

Version control settings are stored in the Convex database rather than config files because:

1. **Toggle requires real-time state** - UI needs to reflect current setting immediately
2. **Shared across environments** - Same setting for all users of the dashboard
3. **No redeploy needed** - Toggle works instantly without rebuilding
