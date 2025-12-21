---
title: "New features: search, featured section, and logo gallery"
description: "Three updates that make your markdown framework more useful: Command+K search, frontmatter-controlled featured items, and a scrolling logo gallery."
date: "2025-12-17"
slug: "new-features-search-featured-logos"
published: true
tags: ["features", "search", "convex", "updates"]
readTime: "4 min read"
featured: true
featuredOrder: 5
image: "/images/v16.png"
excerpt: "Search your site with Command+K. Control featured items from frontmatter. Add a logo gallery."
---

## Search with Command+K

Press Command+K (or Ctrl+K on Windows) to open search. Start typing. Results appear as you type.

The search finds matches in titles and content across all posts and pages. Title matches show first. Each result includes a snippet with context around the match.

Navigate with arrow keys. Press Enter to go. Press Escape to close.

Search uses Convex full text indexes. Results are reactive. If you publish a new post while the modal is open, it shows up in results immediately.

## Featured section from frontmatter

The homepage featured section now pulls from your markdown files. No more editing siteConfig to change what appears.

Add this to any post or page frontmatter:

```yaml
featured: true
featuredOrder: 1
excerpt: "Short description for card view."
```

Run `npm run sync`. The item appears in featured. No redeploy needed.

Lower numbers appear first. Posts and pages sort together. If two items have the same order, they sort alphabetically.

The toggle button lets visitors switch between list view and card view. Card view shows the excerpt. List view shows just titles.

## Logo gallery

A scrolling marquee of logos now sits above the footer. Good for showing partners, customers, or tools you use.

Configure it in siteConfig:

```typescript
logoGallery: {
  enabled: true,
  images: [
    { src: "/images/logos/logo1.svg", href: "https://example.com" },
    { src: "/images/logos/logo2.svg" },
  ],
  position: "above-footer",
  speed: 30,
  title: "Trusted by",
},
```

Each logo can link to a URL. Set `href` to make it clickable. Leave it out for a static logo.

The gallery uses CSS animations. No JavaScript. Logos display in grayscale and colorize on hover.

Five sample logos are included. Replace them with your own in `public/images/logos/`.

## What syncs vs what deploys

Quick reference:

| Change              | Command                    | Speed          |
| ------------------- | -------------------------- | -------------- |
| Blog posts          | `npm run sync`             | Instant        |
| Pages               | `npm run sync`             | Instant        |
| Featured items      | `npm run sync`             | Instant        |
| Import external URL | `npm run import` then sync | Instant        |
| Logo gallery config | Redeploy                   | Requires build |
| siteConfig changes  | Redeploy                   | Requires build |

Markdown content syncs instantly through Convex. Source code changes need a push to GitHub so Netlify rebuilds.

## Try it

1. Press Command+K right now. Search for "setup" or "publish".
2. Check the featured section on the homepage. Toggle between views.
3. Look at the logo gallery above the footer.

All three features work with every theme. Dark, light, tan, cloud.
