# Content

---
Type: page
Date: 2026-01-06
---

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

See the [Frontmatter](/docs-frontmatter) page for all available fields.

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

See the [Frontmatter](/docs-frontmatter) page for all available fields.

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

**Feature one** - Description here.

**Feature two** - Description here.
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

3. Footer content appears on homepage, blog page, and all posts/pages instantly (no rebuild needed)

**Markdown support:** Footer content supports full markdown including links, paragraphs, line breaks, and images. External links automatically open in new tabs.

**Fallback:** If `footer` page is not found, the footer falls back to `siteConfig.footer.defaultContent`.

**Priority order:** Per-post/page frontmatter `footer:` field (custom override) > synced footer.md content > siteConfig.footer.defaultContent.

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

## Tag pages and related posts

Tag pages are available at `/tags/[tag]` for each tag used in your posts. They display all posts with that tag in a list or card view with localStorage persistence for view mode preference.

**Related posts:** Individual blog posts show up to 3 related posts in the footer based on shared tags. Posts are sorted by relevance (number of shared tags) then by date. Only appears on blog posts (not static pages).

**Tag links:** Tags in post footers link to their respective tag archive pages.

## Blog page featured layout

Posts can be marked as featured on the blog page using the `blogFeatured` frontmatter field:

```yaml
---
title: "My Featured Post"
blogFeatured: true
---
```

The first `blogFeatured` post displays as a hero card with landscape image, tags, date, title, excerpt, author info, and read more link. Remaining `blogFeatured` posts display in a 2-column featured row with excerpts. Regular (non-featured) posts display in a 3-column grid without excerpts.