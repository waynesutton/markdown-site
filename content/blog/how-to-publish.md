---
title: "How to Publish a Blog Post"
description: "A quick guide to writing and publishing markdown posts using Cursor after your framework is set up."
date: "2025-12-14"
slug: "how-to-publish"
published: true
tags: ["tutorial", "markdown", "cursor", "IDE", "publishing"]
readTime: "3 min read"
featured: false
layout: "sidebar"
featuredOrder: 3
authorName: "Markdown"
blogFeatured: true
authorImage: "/images/authors/markdown.png"
image: "/images/matthew-smith-Rfflri94rs8-unsplash.jpg"
excerpt: "Quick guide to writing and publishing markdown posts with npm run sync."
aiChat: true
docsSection: true
docsSectionGroup: "Publishing"
docsSectionGroupIcon: "User"
docsSectionOrder: 3
docsSectionGroupOrder: 3
---

---

# How to Publish a Blog Post

![nature](/images/matthew-smith-Rfflri94rs8-unsplash.jpg)

Your blog is set up. Now you want to publish. This guide walks through writing a markdown post and syncing it to your live site using Cursor or your favorite IDE.

## Use the Write Page

Before creating files manually, try the built-in writing tool at [/write](/write). This page is not linked in navigation. Access it directly by typing the URL.

The Write page has three columns:

| Column        | Purpose                                                                |
| ------------- | ---------------------------------------------------------------------- |
| Left sidebar  | Content type selector (Blog Post/Page), Clear, Theme, and Font buttons |
| Center        | Full-height writing area with Copy All button                          |
| Right sidebar | Frontmatter field reference with copy buttons for each field           |

Features:

- **Font switcher**: Toggle between Serif and Sans fonts
- **Theme toggle**: Matches the rest of the site (dark, light, tan, cloud)
- **localStorage persistence**: Content saves automatically as you type
- **Stats bar**: Word count, line count, and character count
- **Frontmatter reference**: See all available fields with examples and copy them individually

The Write page does not connect to Convex. It stores content in your browser only. When you finish writing:

1. Click **Copy All** to copy the full markdown
2. Create a new file in `content/blog/` or `content/pages/`
3. Paste the content
4. Run `npm run sync`

This workflow works well for drafting posts before committing them to your repo.

## Create a New Post

In Cursor or your favorite IDE, create a new file in `content/blog/`:

```
content/blog/my-new-post.md
```

The filename can be anything. The URL comes from the `slug` field in the frontmatter.

## Add Frontmatter

Every post starts with frontmatter between triple dashes:

```markdown
---
title: "Your Post Title"
description: "A one-sentence summary for SEO and social sharing"
date: "2025-01-17"
slug: "your-post-url"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
---
```

| Field            | Required | What It Does                                                                               |
| ---------------- | -------- | ------------------------------------------------------------------------------------------ |
| `title`          | Yes      | Displays as the post heading                                                               |
| `description`    | Yes      | Shows in search results and sharing                                                        |
| `date`           | Yes      | Publication date (YYYY-MM-DD)                                                              |
| `slug`           | Yes      | Becomes the URL path                                                                       |
| `published`      | Yes      | Set `true` to show, `false` to hide                                                        |
| `tags`           | Yes      | Topic labels for the post                                                                  |
| `readTime`       | No       | Estimated reading time                                                                     |
| `image`          | No       | OG image for social sharing and featured card thumb                                        |
| `showImageAtTop` | No       | Set `true` to display the image at the top of the post above the header (default: `false`) |
| `featured`       | No       | Set `true` to show in featured section                                                     |
| `featuredOrder`  | No       | Order in featured section (lower first)                                                    |
| `excerpt`        | No       | Short description for card view                                                            |
| `layout`         | No       | Set to `"sidebar"` for docs-style layout with TOC                                          |

## Write Your Content

Below the frontmatter, write your post in markdown:

```markdown
# Your Post Title

Opening paragraph goes here.

## First Section

Content for the first section.

### Subheading

More details here.

- Bullet point one
- Bullet point two

## Code Example

\`\`\`typescript
const greeting = "Hello, world";
console.log(greeting);
\`\`\`

## Conclusion

Wrap up your thoughts.
```

## Sync to Convex

Open Cursor's or your dev terminal and run:

```bash
npm run sync
```

This reads all markdown files in `content/blog/`, parses the frontmatter, and uploads them to your Convex database.

You should see output like:

```
Syncing posts to Convex...
Synced: my-new-post
Done! Synced 1 post(s).
```

Your post is now live. No rebuild. No redeploy. The site updates in real time.

## Publish to Production

If you have separate dev and prod Convex deployments, sync to production.

**First-time setup:** Create `.env.production.local` in your project root:

```
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

Get your production URL from the [Convex Dashboard](https://dashboard.convex.dev) by selecting your project and switching to the Production deployment.

**Sync to production:**

```bash
npm run sync:prod
```

### Environment Files

| File                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `.env.local`            | Dev deployment (created by `npx convex dev`) |
| `.env.production.local` | Prod deployment (create manually)            |

Both files are gitignored.

## Quick Workflow in Cursor or other IDE

Here is the full workflow:

1. **Create file**: `content/blog/my-post.md`
2. **Add frontmatter**: Title, description, date, slug, published, tags
3. **Write content**: Markdown with headings, lists, code blocks
4. **Sync**: Run `npm run sync` in development and `npm run sync:prod` in production in terminal
5. **View**: Open your site and navigate to `/your-slug`

## Tips

**Draft posts**: Set `published: false` to save a post without showing it on the site.

**Update existing posts**: Edit the markdown file and run `npm run sync` again. Changes appear instantly.

**Delete posts**: Remove the markdown file from `content/blog/` and run sync. The post will be removed from the database.

**Unique slugs**: Each post needs a unique slug. The sync will fail if two posts share the same slug.

**Date format**: Use YYYY-MM-DD format for the date field.

## Adding Images

Place images in `public/images/` and reference them in your post:

```markdown
![Screenshot of the dashboard](/images/dashboard.png)
```

For the Open Graph image (social sharing), add to frontmatter:

```yaml
image: "/images/my-post-og.png"
```

## Checking Your Post

After syncing, verify your post:

1. Open your local dev server: `http://localhost:5173`
2. Your post should appear in the post list
3. Click through to check formatting
4. Test code blocks and images render correctly

## Adding Static Pages

You can also create static pages like About, Projects, or Contact. These appear as navigation links in the top right.

1. Create a file in `content/pages/`:

```
content/pages/about.md
```

2. Add frontmatter:

```markdown
---
title: "About"
slug: "about"
published: true
order: 1
---

Your page content here...
```

3. Run `npm run sync`

The page will appear in the navigation. Use `order` to control the display sequence (lower numbers appear first).

## Sync vs Deploy

Not all changes use `npm run sync`. Here's when to sync vs redeploy:

| What you're changing             | Command                    | Timing               |
| -------------------------------- | -------------------------- | -------------------- |
| Blog posts in `content/blog/`    | `npm run sync`             | Instant (no rebuild) |
| Pages in `content/pages/`        | `npm run sync`             | Instant (no rebuild) |
| Featured items (via frontmatter) | `npm run sync`             | Instant (no rebuild) |
| Import external URL              | `npm run import` then sync | Instant (no rebuild) |
| `siteConfig` in `Home.tsx`       | Redeploy                   | Requires rebuild     |
| Logo gallery config              | Redeploy                   | Requires rebuild     |
| React components/styles          | Redeploy                   | Requires rebuild     |

**Markdown content** syncs instantly via Convex. **Source code changes** (like siteConfig) require pushing to GitHub so Netlify rebuilds.

## Adding to Featured Section

To show a post or page in the homepage featured section, add these fields to frontmatter:

```yaml
featured: true
featuredOrder: 1
excerpt: "A short description for the card view."
image: "/images/my-thumbnail.png"
```

Then run `npm run sync`. The item appears in the featured section instantly. No redeploy needed.

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `featured`      | Set `true` to show in featured section       |
| `featuredOrder` | Order in featured section (lower = first)    |
| `excerpt`       | Short text shown on card view                |
| `image`         | Thumbnail for card view (displays as square) |

**Thumbnail images:** In card view, the `image` field displays as a square thumbnail above the title. Non-square images are automatically cropped to fit. Square thumbnails: 400x400px minimum (800x800px for retina).

## Updating siteConfig

To change the logo gallery or site info, edit `src/pages/Home.tsx`:

```typescript
const siteConfig = {
  name: "Your Site Name",
  title: "Your Tagline",

  // Featured section display options
  featuredViewMode: "cards", // 'list' or 'cards'
  showViewToggle: true, // Let users switch between views

  // Logo gallery
  logoGallery: {
    enabled: true,
    images: [
      { src: "/images/logos/logo1.svg", href: "https://example.com" },
      { src: "/images/logos/logo2.svg", href: "https://another.com" },
    ],
    position: "above-footer",
    speed: 30,
    title: "Trusted by",
  },
};
```

After editing siteConfig, push to GitHub. Netlify will rebuild automatically.

## Import External Content

You can also import articles from external URLs using Firecrawl:

```bash
npm run import https://example.com/article
```

This creates a draft markdown file in `content/blog/` locally. It does not push to Convex directly.

**After importing:**

- Run `npm run sync` to push to development
- Run `npm run sync:prod` to push to production

There is no `npm run import:prod` because the import step only creates local files. The sync step handles pushing to your target environment.

**Setup:** Add `FIRECRAWL_API_KEY=fc-xxx` to `.env.local`. Get a key from [firecrawl.dev](https://firecrawl.dev).

## Raw Markdown Files

When you run `npm run sync` (development) or `npm run sync:prod` (production), the script also generates static `.md` files in `public/raw/`. These are accessible at `/raw/{slug}.md` for any post or page.

**Example URLs:**

- `/raw/setup-guide.md`
- `/raw/about.md`
- `/raw/how-to-publish.md`

**Use cases:**

- Share raw markdown with AI agents
- View the source of any post
- Link directly to markdown for LLM ingestion

The Copy Page dropdown on each post includes a "View as Markdown" option that opens the raw file.

## Summary

Publishing is three steps:

1. Write markdown in `content/blog/` or `content/pages/`
2. Run `npm run sync`
3. Done

The Convex database updates immediately. Static raw markdown files are generated. Your site reflects changes in real time. No waiting for builds or deployments.
