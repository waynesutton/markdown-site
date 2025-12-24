# Setup Guide - Fork and Deploy Your Own Markdown Framework

> Step-by-step guide to fork this markdown sync framework, set up Convex backend, and deploy to Netlify in under 10 minutes.

---
Type: post
Date: 2025-12-14
Reading time: 8 min read
Tags: convex, netlify, tutorial, deployment
---

# Fork and Deploy Your Own Markdown Framework

This guide walks you through forking [this markdown framework](https://github.com/waynesutton/markdown-site), setting up your Convex backend, and deploying to Netlify. The entire process takes about 10 minutes.

**How publishing works:** Once deployed, you write posts in markdown, run `npm run sync` for development or `npm run sync:prod` for production, and they appear on your live site immediately. No rebuild or redeploy needed. Convex handles real-time data sync, so all connected browsers update automatically.

## Table of Contents

- [Fork and Deploy Your Own Markdown Framework](#fork-and-deploy-your-own-markdown-framework)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Step 1: Fork the Repository](#step-1-fork-the-repository)
  - [Step 2: Set Up Convex](#step-2-set-up-convex)
    - [Create a Convex Project](#create-a-convex-project)
    - [Verify the Schema](#verify-the-schema)
  - [Step 3: Sync Your Blog Posts](#step-3-sync-your-blog-posts)
  - [Step 4: Run Locally](#step-4-run-locally)
  - [Step 5: Get Your Convex HTTP URL](#step-5-get-your-convex-http-url)
  - [Step 6: Verify Edge Functions](#step-6-verify-edge-functions)
  - [Step 7: Deploy to Netlify](#step-7-deploy-to-netlify)
    - [Option A: Netlify CLI](#option-a-netlify-cli)
    - [Option B: Netlify Dashboard](#option-b-netlify-dashboard)
    - [Netlify Build Configuration](#netlify-build-configuration)
  - [Step 8: Set Up Production Convex](#step-8-set-up-production-convex)
  - [Writing Blog Posts](#writing-blog-posts)
    - [Frontmatter Fields](#frontmatter-fields)
    - [How Frontmatter Works](#how-frontmatter-works)
    - [Adding Images](#adding-images)
    - [Sync After Adding Posts](#sync-after-adding-posts)
    - [Environment Files](#environment-files)
    - [When to Sync vs Deploy](#when-to-sync-vs-deploy)
  - [Customizing Your Framework](#customizing-your-framework)
    - [Fork Configuration Options](#fork-configuration-options)
      - [Option 1: Automated (Recommended)](#option-1-automated-recommended)
      - [Option 2: Manual](#option-2-manual)
    - [Files to Update When Forking](#files-to-update-when-forking)
    - [Site title and description metadata](#site-title-and-description-metadata)
    - [Update Backend Configuration](#update-backend-configuration)
    - [Change the Favicon](#change-the-favicon)
    - [Change the Site Logo](#change-the-site-logo)
    - [Change the Default Open Graph Image](#change-the-default-open-graph-image)
    - [Update Site Configuration](#update-site-configuration)
    - [Featured Section](#featured-section)
    - [GitHub Contributions Graph](#github-contributions-graph)
    - [Visitor Map](#visitor-map)
    - [Logo Gallery](#logo-gallery)
    - [Blog page](#blog-page)
    - [Scroll-to-top button](#scroll-to-top-button)
    - [Change the Default Theme](#change-the-default-theme)
    - [Change the Font](#change-the-font)
    - [Change Font Sizes](#change-font-sizes)
    - [Add Static Pages (Optional)](#add-static-pages-optional)
    - [Update SEO Meta Tags](#update-seo-meta-tags)
    - [Update llms.txt and robots.txt](#update-llmstxt-and-robotstxt)
  - [Search](#search)
    - [Using Search](#using-search)
    - [How It Works](#how-it-works)
  - [Real-time Stats](#real-time-stats)
  - [Mobile Navigation](#mobile-navigation)
  - [Copy Page Dropdown](#copy-page-dropdown)
  - [API Endpoints](#api-endpoints)
  - [Import External Content](#import-external-content)
  - [Troubleshooting](#troubleshooting)
    - [Posts not appearing](#posts-not-appearing)
    - [RSS/Sitemap not working](#rsssitemap-not-working)
    - [Build failures on Netlify](#build-failures-on-netlify)
  - [Project Structure](#project-structure)
  - [Write Page](#write-page)
  - [Next Steps](#next-steps)

## Prerequisites

Before you start, make sure you have:

- Node.js 18 or higher installed
- A GitHub account
- A Convex account (free at [convex.dev](https://convex.dev))
- A Netlify account (free at [netlify.com](https://netlify.com))

## Step 1: Fork the Repository

Fork the repository to your GitHub account:

```bash
# Clone your forked repo
git clone https://github.com/waynesutton/markdown-site.git
cd markdown-site

# Install dependencies
npm install
```

## Step 2: Set Up Convex

Convex is the backend that stores your blog posts and serves the API endpoints.

### Create a Convex Project

Run the Convex development command:

```bash
npx convex dev
```

This will

1. Prompt you to log in to Convex (opens browser)
2. Ask you to create a new project or select an existing one
3. Generate a `.env.local` file with your `VITE_CONVEX_URL`

Keep this terminal running during development. It syncs your Convex functions automatically.

### Verify the Schema

The schema is already defined in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    excerpt: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    featuredOrder: v.optional(v.number()),
    authorName: v.optional(v.string()),
    authorImage: v.optional(v.string()),
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
    excerpt: v.optional(v.string()),
    image: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    featuredOrder: v.optional(v.number()),
    authorName: v.optional(v.string()),
    authorImage: v.optional(v.string()),
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),

  viewCounts: defineTable({
    slug: v.string(),
    count: v.number(),
  }).index("by_slug", ["slug"]),
});
```

## Step 3: Sync Your Blog Posts

Blog posts live in `content/blog/` as markdown files. Sync them to Convex:

```bash
npm run sync
```

This reads all markdown files, parses the frontmatter, and uploads them to your Convex database.

## Step 4: Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see your blog.

## Step 5: Get Your Convex HTTP URL

Your Convex deployment has two URLs:

- **Client URL**: `https://your-deployment.convex.cloud` (for the React app)
- **HTTP URL**: `https://your-deployment.convex.site` (for API endpoints)

Find your deployment name in the Convex dashboard or check `.env.local`:

```bash
# Your .env.local contains something like:
VITE_CONVEX_URL=https://happy-animal-123.convex.cloud
```

The HTTP URL uses `.convex.site` instead of `.convex.cloud`:

```
https://happy-animal-123.convex.site
```

## Step 6: Verify Edge Functions

The blog uses Netlify Edge Functions to dynamically proxy RSS, sitemap, and API requests to your Convex HTTP endpoints. No manual URL configuration is needed.

Edge functions in `netlify/edge-functions/`:

- `rss.ts` - Proxies `/rss.xml` and `/rss-full.xml`
- `sitemap.ts` - Proxies `/sitemap.xml`
- `api.ts` - Proxies `/api/posts` and `/api/post`
- `botMeta.ts` - Serves Open Graph HTML to social media crawlers

These functions automatically read `VITE_CONVEX_URL` from your environment and convert it to the Convex HTTP site URL (`.cloud` becomes `.site`).

## Step 7: Deploy to Netlify

For detailed Convex + Netlify integration, see the official [Convex Netlify Deployment Guide](https://docs.convex.dev/production/hosting/netlify).

### Option A: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
npm run deploy
```

### Option B: Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" then "wImport an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
   - Publish directory: `dist`
5. Add environment variables:
   - `CONVEX_DEPLOY_KEY`: Generate from [Convex Dashboard](https://dashboard.convex.dev) > Project Settings > Deploy Key
   - `VITE_CONVEX_URL`: Your production Convex URL (e.g., `https://your-deployment.convex.cloud`)
6. Click "Deploy site"

The `CONVEX_DEPLOY_KEY` deploys functions at build time. The `VITE_CONVEX_URL` is required for edge functions to proxy RSS, sitemap, and API requests at runtime.

### Netlify Build Configuration

The `netlify.toml` file includes the correct build settings:

```toml
[build]
  command = "npm ci --include=dev && npx convex deploy --cmd 'npm run build'"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

Key points:

- `npm ci --include=dev` forces devDependencies to install even when `NODE_ENV=production`
- The build script uses `npx vite build` to resolve vite from node_modules
- `@types/node` is required for TypeScript to recognize `process.env`

## Step 8: Set Up Production Convex

For production, deploy your Convex functions:

```bash
npx convex deploy
```

This creates a production deployment. Update your Netlify environment variable with the production URL if different.

## Writing Blog Posts

Create new posts in `content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A brief description for SEO and social sharing"
date: "2025-01-15"
slug: "your-post-url"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
image: "/images/my-post-image.png"
---

Your markdown content here...
```

### Frontmatter Fields

| Field           | Required | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `title`         | Yes      | Post title                                |
| `description`   | Yes      | Short description for SEO                 |
| `date`          | Yes      | Publication date (YYYY-MM-DD)             |
| `slug`          | Yes      | URL path (must be unique)                 |
| `published`     | Yes      | Set to `true` to publish                  |
| `tags`          | Yes      | Array of topic tags                       |
| `readTime`      | No       | Estimated reading time                    |
| `image`         | No       | Header/Open Graph image URL               |
| `excerpt`       | No       | Short excerpt for card view               |
| `featured`      | No       | Set `true` to show in featured section    |
| `featuredOrder` | No       | Order in featured section (lower = first) |
| `authorName`    | No       | Author display name shown next to date    |
| `authorImage`   | No       | Round author avatar image URL             |

### How Frontmatter Works

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

### Adding Images

Place images in `public/images/` and reference them in your posts:

**Header/OG Image (in frontmatter):**

```yaml
image: "/images/my-header.png"
```

This image appears when sharing on social media. Recommended: 1200x630 pixels.

**Inline Images (in content):**

```markdown
![Alt text description](/images/screenshot.png)
```

**External Images:**

```markdown
![Photo](https://images.unsplash.com/photo-xxx?w=800)
```

**Images require git deploy.** Images are served as static files from your repository, not synced to Convex. After adding images to `public/images/`:

1. Commit the image files to git
2. Push to GitHub
3. Wait for Netlify to rebuild

The `npm run sync` command only syncs markdown text content. Images are deployed when Netlify builds your site.

### Sync After Adding Posts

After adding or editing posts, sync to Convex.

**Development sync:**

```bash
npm run sync
```

**Production sync:**

First, create `.env.production.local` in your project root:

```
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

Get your production URL from the [Convex Dashboard](https://dashboard.convex.dev) by selecting your project and switching to the Production deployment.

Then sync:

```bash
npm run sync:prod
```

### Environment Files

| File                    | Purpose             | Created by                   |
| ----------------------- | ------------------- | ---------------------------- |
| `.env.local`            | Dev deployment URL  | `npx convex dev` (automatic) |
| `.env.production.local` | Prod deployment URL | You (manual)                 |

Both files are gitignored. Each developer creates their own local environment files.

### When to Sync vs Deploy

| What you're changing             | Command                    | Timing               |
| -------------------------------- | -------------------------- | -------------------- |
| Blog posts in `content/blog/`    | `npm run sync`             | Instant (no rebuild) |
| Pages in `content/pages/`        | `npm run sync`             | Instant (no rebuild) |
| Featured items (via frontmatter) | `npm run sync`             | Instant (no rebuild) |
| Import external URL              | `npm run import` then sync | Instant (no rebuild) |
| Images in `public/images/`       | Git commit + push          | Requires rebuild     |
| `siteConfig` in `Home.tsx`       | Redeploy                   | Requires rebuild     |
| Logo gallery config              | Redeploy                   | Requires rebuild     |
| React components/styles          | Redeploy                   | Requires rebuild     |

**Markdown content** syncs instantly via Convex. **Images and source code** require pushing to GitHub for Netlify to rebuild.

**Featured items** can now be controlled via markdown frontmatter. Add `featured: true` and `featuredOrder: 1` to any post or page, then run `npm run sync`.

## Customizing Your Framework

### Fork Configuration Options

After forking, you have two options to configure your site:

#### Option 1: Automated (Recommended)

Run a single command to configure all files automatically:

```bash
# Copy the example config
cp fork-config.json.example fork-config.json

# Edit fork-config.json with your site information
# Then apply all changes
npm run configure
```

The `fork-config.json` file includes:

```json
{
  "siteName": "Your Site Name",
  "siteTitle": "Your Tagline",
  "siteDescription": "Your site description.",
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

This updates all 11 configuration files in one step. See `FORK_CONFIG.md` for the full JSON schema.

#### Option 2: Manual

Follow the step-by-step guide in `FORK_CONFIG.md` to update each file manually. The guide includes code snippets for each file and an AI agent prompt for assisted configuration.

### Files to Update When Forking

| File                                | What to update                                                              |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, title, intro, bio, blog page, logo gallery, GitHub contributions |
| `src/pages/Home.tsx`                | Intro paragraph text, footer links                                          |
| `convex/http.ts`                    | `SITE_URL`, `SITE_NAME`, description strings (3 locations)                  |
| `convex/rss.ts`                     | `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` (RSS feeds)                    |
| `src/pages/Post.tsx`                | `SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE` (OG tags)                       |
| `index.html`                        | Title, meta description, OG tags, JSON-LD                                   |
| `public/llms.txt`                   | Site name, URL, description, topics                                         |
| `public/robots.txt`                 | Sitemap URL and header comment                                              |
| `public/openapi.yaml`               | API title, server URL, site name in examples                                |
| `public/.well-known/ai-plugin.json` | Site name, descriptions                                                     |
| `src/context/ThemeContext.tsx`      | Default theme                                                               |

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

### Update Backend Configuration

These constants affect RSS feeds, API responses, sitemaps, and social sharing metadata.

**convex/http.ts:**

```typescript
const SITE_URL = "https://your-site.netlify.app";
const SITE_NAME = "Your Site Name";
```

**convex/rss.ts:**

```typescript
const SITE_URL = "https://your-site.netlify.app";
const SITE_TITLE = "Your Site Name";
const SITE_DESCRIPTION = "Your site description for RSS feeds.";
```

**src/pages/Post.tsx:**

```typescript
const SITE_URL = "https://your-site.netlify.app";
const SITE_NAME = "Your Site Name";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

### Change the Favicon

Replace `public/favicon.svg` with your own SVG icon. The default is a rounded square with the letter "m":

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="32" y="32" width="448" height="448" rx="96" ry="96" fill="#000000"/>
  <text x="256" y="330" text-anchor="middle" font-size="300" font-weight="800" fill="#ffffff">m</text>
</svg>
```

To use a different letter or icon, edit the SVG directly or replace the file.

### Change the Site Logo

The site uses two logo configurations:

**Homepage logo:** Edit `src/config/siteConfig.ts`:

```typescript
export default {
  logo: "/images/logo.svg", // Set to null to hide the logo
  // ...
};
```

Replace `public/images/logo.svg` with your own logo file. Recommended: SVG format, 512x512 pixels.

**Inner page logo:** Shows on blog page, individual posts, and static pages. Configure in `src/config/siteConfig.ts`:

```typescript
innerPageLogo: {
  enabled: true, // Set to false to hide logo on inner pages
  size: 28, // Logo height in pixels (keeps aspect ratio)
},
```

The inner page logo appears in the top left corner on desktop and top right on mobile. It uses the same logo file as the homepage logo. Set `enabled: false` to hide it on inner pages while keeping the homepage logo.

### Change the Default Open Graph Image

The default OG image is used when a post does not have an `image` field in its frontmatter. Replace `public/images/og-default.svg` with your own image.

Recommended dimensions: 1200x630 pixels. Supported formats: PNG, JPG, or SVG.

Update the reference in `src/pages/Post.tsx`:

```typescript
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

### Update Site Configuration

Edit `src/config/siteConfig.ts` to customize:

```typescript
export default {
  name: "Your Name",
  title: "Your Title",
  logo: "/images/logo.svg", // null to hide homepage logo
  intro: "Your introduction...",
  bio: "Your bio...",

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

  // Featured section options
  featuredViewMode: "list", // 'list' or 'cards'
  showViewToggle: true, // Let users switch between views

  // Logo gallery (static grid or scrolling marquee with clickable links)
  logoGallery: {
    enabled: true, // Set false to hide
    images: [
      { src: "/images/logos/logo1.svg", href: "https://example.com" },
      { src: "/images/logos/logo2.svg", href: "https://another.com" },
    ],
    position: "above-footer", // or 'below-featured'
    speed: 30, // Seconds for one scroll cycle
    title: "Built with",
    scrolling: false, // false = static grid, true = scrolling marquee
    maxItems: 4, // Number of logos when scrolling is false
  },

  links: {
    docs: "/setup-guide",
    convex: "https://convex.dev",
  },
};
```

### Featured Section

The homepage featured section shows posts and pages marked with `featured: true` in their frontmatter. It supports two display modes:

1. **List view** (default): Bullet list of links
2. **Card view**: Grid of cards showing title and excerpt

**Add a post to featured section:**

Add these fields to any post or page frontmatter:

```yaml
featured: true
featuredOrder: 1
excerpt: "A short description that appears on the card."
image: "/images/my-thumbnail.png"
```

Then run `npm run sync`. The post appears in the featured section instantly. No redeploy needed.

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `featured`      | Set `true` to show in featured section       |
| `featuredOrder` | Order in featured section (lower = first)    |
| `excerpt`       | Short text shown on card view                |
| `image`         | Thumbnail for card view (displays as square) |

**Thumbnail images:** In card view, the `image` field displays as a square thumbnail above the title. Non-square images are automatically cropped to center. Square thumbnails: 400x400px minimum (800x800px for retina).

**Posts without images:** Cards display without the image area. The card shows just the title and excerpt with adjusted padding.

**Order featured items:**

Use `featuredOrder` to control display order. Lower numbers appear first. Posts and pages are sorted together. Items without `featuredOrder` appear after numbered items, sorted by creation time.

**Toggle view mode:**

Users can toggle between list and card views using the icon button next to "Get started:". To change the default view, set `featuredViewMode: "cards"` in siteConfig.

### GitHub Contributions Graph

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

| Option               | Description                                   |
| -------------------- | --------------------------------------------- |
| `enabled`            | `true` to show, `false` to hide               |
| `username`           | Your GitHub username                          |
| `showYearNavigation` | Show prev/next year buttons                   |
| `linkToProfile`      | Click graph to visit GitHub profile           |
| `title`              | Text above graph (set to `undefined` to hide) |

The graph displays with theme-aware colors that match each site theme (dark, light, tan, cloud). Uses the public `github-contributions-api.jogruber.de` API (no GitHub token required).

### Visitor Map

Display real-time visitor locations on a world map on the stats page. Uses Netlify's built-in geo detection (no third-party API needed). Privacy friendly: only stores city, country, and coordinates. No IP addresses stored.

Configure in `siteConfig`:

```typescript
visitorMap: {
  enabled: true,        // Set to false to hide the visitor map
  title: "Live Visitors", // Optional title above the map
},
```

| Option    | Description                                 |
| --------- | ------------------------------------------- |
| `enabled` | `true` to show, `false` to hide             |
| `title`   | Text above map (set to `undefined` to hide) |

The map displays with theme-aware colors. Visitor dots pulse to indicate live sessions. Location data comes from Netlify's automatic geo headers at the edge.

### Logo Gallery

The homepage includes a logo gallery that can scroll infinitely or display as a static grid. Customize or disable it in siteConfig:

**Disable the gallery:**

```typescript
logoGallery: {
  enabled: false, // Set to false to hide
  // ...
},
```

**Replace with your own logos:**

1. Add your logo images to `public/images/logos/` (SVG recommended)
2. Update the images array with your logos and links:

```typescript
logoGallery: {
  enabled: true,
  images: [
    { src: "/images/logos/your-logo-1.svg", href: "https://example.com" },
    { src: "/images/logos/your-logo-2.svg", href: "https://anothersite.com" },
  ],
  position: "above-footer",
  speed: 30,
  title: "Built with",
  scrolling: false, // false = static grid, true = scrolling marquee
  maxItems: 4, // Number of logos to show when scrolling is false
},
```

Each logo object supports:

- `src`: Path to the logo image (required)
- `href`: URL to link to when clicked (optional)

**Remove sample logos:**

Delete the sample files from `public/images/logos/` and clear the images array, or replace them with your own.

**Configuration options:**

| Option      | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `enabled`   | `true` to show, `false` to hide                            |
| `images`    | Array of logo objects with `src` and optional `href`       |
| `position`  | `'above-footer'` or `'below-featured'`                     |
| `speed`     | Seconds for one scroll cycle (lower = faster)              |
| `title`     | Text above gallery (set to `undefined` to hide)            |
| `scrolling` | `true` for infinite scroll, `false` for static grid        |
| `maxItems`  | Max logos to show when `scrolling` is `false` (default: 4) |

**Display modes:**

- **Scrolling marquee** (`scrolling: true`): Infinite horizontal scroll animation. All logos display in a continuous loop.
- **Static grid** (`scrolling: false`): Centered grid showing the first `maxItems` logos without animation.

Logos display in grayscale and colorize on hover.

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

### Hardcoded Navigation Items

Add React route pages (like `/stats`, `/write`) to the navigation menu via `siteConfig.ts`. These pages are React components, not markdown files.

Configure in `src/config/siteConfig.ts`:

```typescript
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
```

Navigation combines three sources in this order:

1. Blog link (if `blogPage.enabled` and `blogPage.showInNav` are true)
2. Hardcoded nav items (from `hardcodedNavItems` array)
3. Markdown pages (from `content/pages/` with `showInNav: true`)

All items sort by `order` field (lower numbers first), then alphabetically by title.

**Hide from navigation:** Set `showInNav: false` to keep a route accessible but hidden from the nav menu. The route still works at its URL, just won't appear in navigation links.

### Scroll-to-top button

A scroll-to-top button appears after scrolling down on posts and pages. Configure it in `src/components/Layout.tsx`:

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

The button uses Phosphor ArrowUp icon and works with all four themes. It uses a passive scroll listener for performance.

### Change the Default Theme

Edit `src/context/ThemeContext.tsx`:

```typescript
const DEFAULT_THEME: Theme = "tan"; // Options: "dark", "light", "tan", "cloud"
```

### Change the Font

The blog uses a serif font by default. To switch to sans-serif, edit `src/styles/global.css`:

```css
body {
  /* Sans-serif */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Serif (default) */
  font-family:
    "New York",
    -apple-system-ui-serif,
    ui-serif,
    Georgia,
    serif;
}
```

### Change Font Sizes

All font sizes use CSS variables defined in `:root`. Customize sizes by editing these variables in `src/styles/global.css`:

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

Mobile responsive sizes are defined in a `@media (max-width: 768px)` block.

### Add Static Pages (Optional)

Create optional pages like About, Projects, or Contact. These appear as navigation links in the top right corner.

1. Create a `content/pages/` directory
2. Add markdown files with frontmatter:

```markdown
---
title: "About"
slug: "about"
published: true
order: 1
---

Your page content here...
```

| Field         | Required | Description                                       |
| ------------- | -------- | ------------------------------------------------- |
| `title`       | Yes      | Page title (shown in nav)                         |
| `slug`        | Yes      | URL path (e.g., `/about`)                         |
| `published`   | Yes      | Set `true` to show                                |
| `order`       | No       | Display order (lower = first)                     |
| `showInNav`   | No       | Show in navigation menu (default: `true`)         |
| `authorName`  | No       | Author display name shown next to date            |
| `authorImage` | No       | Round author avatar image URL                     |
| `layout`      | No       | Set to `"sidebar"` for docs-style layout with TOC |

3. Run `npm run sync` to sync pages

Pages appear automatically in the navigation when published.

**Hide pages from navigation:** Set `showInNav: false` in page frontmatter to keep a page published and accessible via direct URL, but hidden from the navigation menu. Useful for pages like `/projects` that you want to link directly but not show in the main nav. Pages with `showInNav: false` remain searchable and available via API endpoints.

**Sidebar layout:** Add `layout: "sidebar"` to any post or page frontmatter to enable a docs-style layout with a table of contents sidebar. The sidebar extracts headings (H1, H2, H3) automatically and provides smooth scroll navigation. Only appears if headings exist in the content.

### Update SEO Meta Tags

Edit `index.html` to update:

- Site title
- Meta description
- Open Graph tags
- JSON-LD structured data

### Update llms.txt and robots.txt

Edit `public/llms.txt` and `public/robots.txt` with your site information.

## Search

Your blog includes full text search with Command+K keyboard shortcut.

### Using Search

Press `Command+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search modal. You can also click the search icon in the top navigation.

**Features:**

- Real-time results as you type
- Keyboard navigation with arrow keys
- Press Enter to select, Escape to close
- Result snippets with context around matches
- Distinguishes between posts and pages with type badges
- Works with all four themes

### How It Works

Search uses Convex full text search indexes on the posts and pages tables. The search queries both title and content fields, deduplicates results, and sorts with title matches first.

Search is automatically available once you deploy. No additional configuration needed.

## Real-time Stats

Your blog includes a real-time analytics page at `/stats`:

- **Active visitors**: See who is currently on your site and which pages they are viewing
- **Total page views**: All-time view count across the site
- **Unique visitors**: Count based on anonymous session IDs
- **Views by page**: Every page and post ranked by view count

Stats update automatically without refreshing. Powered by Convex subscriptions.

How it works:

- Page views are recorded as event records (not counters) to prevent write conflicts
- Active sessions use a heartbeat system (30 second interval)
- Sessions expire after 2 minutes of inactivity
- A cron job cleans up stale sessions every 5 minutes
- No personal data is stored (only anonymous UUIDs)

## Mobile Navigation

On mobile and tablet screens (under 768px), a hamburger menu provides navigation. The menu slides out from the left with keyboard navigation (Escape to close) and a focus trap for accessibility. It auto-closes when you navigate to a new route.

## Copy Page Dropdown

Each post and page includes a share dropdown with options for AI tools:

| Option               | Description                                       |
| -------------------- | ------------------------------------------------- |
| Copy page            | Copies formatted markdown to clipboard            |
| Open in ChatGPT      | Opens ChatGPT with raw markdown URL               |
| Open in Claude       | Opens Claude with raw markdown URL                |
| Open in Perplexity   | Opens Perplexity with raw markdown URL            |
| View as Markdown     | Opens raw `.md` file in new tab                   |
| Download as SKILL.md | Downloads skill file for AI agent training        |

**Git push required for AI links:** The "Open in ChatGPT," "Open in Claude," and "Open in Perplexity" options use GitHub raw URLs to fetch content. For these to work, your content must be pushed to GitHub with `git push`. The `npm run sync` command syncs content to Convex for your live site, but AI services fetch directly from GitHub.

| What you want                        | Command needed                 |
| ------------------------------------ | ------------------------------ |
| Content visible on your site         | `npm run sync` or `sync:prod`  |
| AI links (ChatGPT/Claude/Perplexity) | `git push` to GitHub           |
| Both                                 | `npm run sync` then `git push` |

**Download as SKILL.md** formats the content as an Anthropic Agent Skills file with metadata, triggers, and instructions sections.

## API Endpoints

Your blog includes these API endpoints for search engines and AI:

| Endpoint                       | Description                 |
| ------------------------------ | --------------------------- |
| `/stats`                       | Real-time site analytics    |
| `/rss.xml`                     | RSS feed with descriptions  |
| `/rss-full.xml`                | RSS feed with full content  |
| `/sitemap.xml`                 | Dynamic XML sitemap         |
| `/api/posts`                   | JSON list of all posts      |
| `/api/post?slug=xxx`           | Single post as JSON         |
| `/api/post?slug=xxx&format=md` | Single post as raw markdown |
| `/api/export`                  | Batch export all posts      |
| `/raw/{slug}.md`               | Static raw markdown file    |
| `/.well-known/ai-plugin.json`  | AI plugin manifest          |
| `/openapi.yaml`                | OpenAPI 3.0 specification   |
| `/llms.txt`                    | AI agent discovery          |

## Import External Content

Use Firecrawl to import articles from external URLs as markdown posts:

```bash
npm run import https://example.com/article
```

**Setup:**

1. Get an API key from [firecrawl.dev](https://firecrawl.dev)
2. Add to `.env.local`:

```
FIRECRAWL_API_KEY=fc-your-api-key
```

The import script will:

1. Scrape the URL and convert to markdown
2. Create a draft post in `content/blog/` locally
3. Extract title and description from the page

**Why no `npm run import:prod`?** The import command only creates local markdown files. It does not interact with Convex directly. After importing:

- Run `npm run sync` to push to development
- Run `npm run sync:prod` to push to production

Imported posts are created as drafts (`published: false`). Review, edit, set `published: true`, then sync to your target environment.

## Troubleshooting

### Posts not appearing

1. Check that `published: true` in frontmatter
2. Run `npm run sync` to sync posts to development
3. Run `npm run sync:prod` to sync posts to production
4. Verify posts exist in Convex dashboard

### RSS/Sitemap not working

1. Verify `VITE_CONVEX_URL` is set in Netlify environment variables
2. Check that Convex HTTP endpoints are deployed (`npx convex deploy`)
3. Test the Convex HTTP URL directly: `https://your-deployment.convex.site/rss.xml`
4. Verify edge functions exist in `netlify/edge-functions/`

### Build failures on Netlify

Common errors and fixes:

**"vite: not found" or "Cannot find package 'vite'"**

Netlify sets `NODE_ENV=production` which skips devDependencies. Fix by using `npm ci --include=dev` in your build command:

```toml
[build]
  command = "npm ci --include=dev && npx convex deploy --cmd 'npm run build'"
```

Also ensure your build script uses `npx`:

```json
"build": "npx vite build"
```

**"Cannot find name 'process'"**

Add `@types/node` to devDependencies:

```bash
npm install --save-dev @types/node
```

**General checklist:**

1. Verify `CONVEX_DEPLOY_KEY` environment variable is set in Netlify
2. Check that `@types/node` is in devDependencies
3. Ensure Node.js version is 20 or higher
4. Verify build command includes `--include=dev`

See [netlify-deploy-fix.md](https://github.com/waynesutton/markdown-site/blob/main/netlify-deploy-fix.md) for detailed troubleshooting.

## Project Structure

```
markdown-site/
├── content/
│   ├── blog/           # Markdown posts
│   └── pages/          # Static pages (About, Docs, etc.)
├── convex/             # Convex backend functions
│   ├── http.ts         # HTTP endpoints
│   ├── posts.ts        # Post queries/mutations
│   ├── pages.ts        # Page queries/mutations
│   ├── rss.ts          # RSS feed generation
│   ├── stats.ts        # Analytics functions
│   └── schema.ts       # Database schema
├── netlify/
│   └── edge-functions/ # Netlify edge functions
│       ├── rss.ts      # RSS proxy
│       ├── sitemap.ts  # Sitemap proxy
│       ├── api.ts      # API proxy
│       └── botMeta.ts  # OG crawler detection
├── public/
│   ├── images/         # Static images
│   ├── raw/            # Generated raw markdown files
│   ├── robots.txt      # Crawler rules
│   └── llms.txt        # AI agent discovery
├── src/
│   ├── components/     # React components
│   ├── context/        # Theme context
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   └── styles/         # Global CSS
├── netlify.toml        # Netlify configuration
└── package.json        # Dependencies
```

## Write Page

A markdown writing page is available at `/write` (not linked in navigation). Use it to draft content before saving to your markdown files.

**Features:**

- Three-column Cursor docs-style layout
- Content type selector (Blog Post or Page) with dynamic frontmatter templates
- Frontmatter field reference with individual copy buttons
- Font switcher (Serif/Sans-serif)
- Theme toggle matching site themes
- Word, line, and character counts
- localStorage persistence for content, type, and font preference
- Works with Grammarly and browser spellcheck

**Workflow:**

1. Go to `yourdomain.com/write`
2. Select content type (Blog Post or Page)
3. Write your content using the frontmatter reference
4. Click "Copy All" to copy the markdown
5. Save to `content/blog/` or `content/pages/`
6. Run `npm run sync` or `npm run sync:prod`

Content is stored in localStorage only and not synced to the database. Refreshing the page preserves your content, but clearing browser data will lose it.

## Next Steps

After deploying:

1. Add your own blog posts
2. Customize the theme colors in `global.css`
3. Update the featured essays list
4. Submit your sitemap to Google Search Console
5. Share your first post

Your blog is now live with real-time updates, SEO optimization, and AI-friendly APIs. Every time you sync new posts, they appear immediately without redeploying.