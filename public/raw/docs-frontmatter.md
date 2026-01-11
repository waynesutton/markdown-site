# Frontmatter

---
Type: page
Date: 2026-01-11
---

## Frontmatter

Frontmatter is the YAML metadata at the top of each markdown file between `---` markers. It controls how content is displayed, organized, and discovered.

## Blog post fields

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
| `docsLanding`           | No       | Set `true` to use this post as the docs landing page (shown when navigating to `/docs`).                                                                                                               |

## Page fields

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
| `textAlign`             | No       | Text alignment: "left" (default), "center", or "right". Used by `home.md` for home intro alignment                                                                                                     |
| `docsSection`           | No       | Include in docs sidebar. Set `true` to show in the docs section navigation.                                                                                                                            |
| `docsSectionGroup`      | No       | Group name for docs sidebar. Pages with the same group name appear together.                                                                                                                           |
| `docsSectionOrder`      | No       | Order within docs group. Lower numbers appear first within the group.                                                                                                                                  |
| `docsSectionGroupOrder` | No       | Order of the group in docs sidebar. Lower numbers make the group appear first. Groups without this field sort alphabetically.                                                                          |
| `docsSectionGroupIcon`  | No       | Phosphor icon name for docs sidebar group (e.g., "Rocket", "Book", "PuzzlePiece"). Icon appears left of the group title. See [Phosphor Icons](https://phosphoricons.com) for available icons.         |
| `docsLanding`           | No       | Set `true` to use this page as the docs landing page (shown when navigating to `/docs`).                                                                                                               |

## Common patterns

### Hide pages from navigation

Set `showInNav: false` to keep a page published and accessible via direct URL, but hidden from the navigation menu. Pages with `showInNav: false` remain searchable and available via API endpoints. Useful for pages you want to link directly but not show in the main nav.

### Unlisted posts

Set `unlisted: true` to hide a blog post from all listings while keeping it accessible via direct link. Unlisted posts are excluded from: blog listings (`/blog` page), featured sections (homepage), tag pages (`/tags/[tag]`), search results (Command+K), and related posts. The post remains accessible via direct URL (e.g., `/blog/post-slug`). Useful for draft posts, private content, or posts you want to share via direct link only. Note: `unlisted` only works for blog posts, not pages.

### Show image at top

Add `showImageAtTop: true` to display the `image` field at the top of the post/page above the header. Default behavior: if `showImageAtTop` is not set or `false`, image only used for Open Graph previews and featured card thumbnails.

### Image lightbox

Images in blog posts and pages automatically open in a full-screen lightbox when clicked (if enabled in `siteConfig.imageLightbox.enabled`). This allows readers to view images at full size. The lightbox can be closed by clicking outside the image, pressing Escape, or clicking the close button.

### Text alignment

Use `textAlign` field to control text alignment for page content. Options: `"left"` (default), `"center"`, or `"right"`. Used by `home.md` to control home intro alignment.

### Docs section

To add content to the docs sidebar:

1. Add `docsSection: true` to frontmatter
2. Optionally set `docsSectionGroup` to group related content
3. Use `docsSectionOrder` to control order within groups
4. Use `docsSectionGroupOrder` to control group order
5. Add `docsSectionGroupIcon` for visual icons (Phosphor icons)

### Docs landing page

Set `docsLanding: true` on one post or page to make it the docs landing page. This content displays when navigating to `/docs`.