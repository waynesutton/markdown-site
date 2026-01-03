# Frontmatter skill

How to write frontmatter for markdown-blog posts and pages.

## Blog post frontmatter

Location: `content/blog/*.md`

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| title | string | Post title |
| description | string | SEO description |
| date | string | YYYY-MM-DD format |
| slug | string | URL path (must be unique) |
| published | boolean | true to show publicly |
| tags | string[] | Array of topic tags |

### Optional fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| featured | boolean | false | Show in featured section |
| featuredOrder | number | - | Display order (lower = first) |
| image | string | - | OG/header image path |
| showImageAtTop | boolean | false | Display image at top of post |
| excerpt | string | - | Short text for card view |
| readTime | string | auto | Reading time (auto-calculated if omitted) |
| authorName | string | - | Author display name |
| authorImage | string | - | Author avatar URL (round) |
| layout | string | - | "sidebar" for docs-style layout |
| rightSidebar | boolean | true | Show right sidebar |
| aiChat | boolean | false | Enable AI chat in sidebar |
| blogFeatured | boolean | false | Hero featured on /blog page |
| newsletter | boolean | - | Override newsletter signup |
| contactForm | boolean | false | Enable contact form |
| unlisted | boolean | false | Hide from listings but allow direct access via slug |
| showFooter | boolean | - | Override footer display |
| footer | string | - | Custom footer markdown |
| showSocialFooter | boolean | - | Override social footer |

### Example blog post

```markdown
---
title: "How to write a blog post"
description: "A guide to writing posts with frontmatter"
date: "2025-01-15"
slug: "how-to-write-a-blog-post"
published: true
tags: ["tutorial", "markdown"]
featured: true
featuredOrder: 1
image: "/images/my-post.png"
excerpt: "Learn how to create blog posts"
authorName: "Your Name"
authorImage: "/images/authors/you.png"
---

Your content here...
```

## Page frontmatter

Location: `content/pages/*.md`

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| title | string | Page title |
| slug | string | URL path (must be unique) |
| published | boolean | true to show publicly |

### Optional fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| order | number | - | Nav order (lower = first) |
| showInNav | boolean | true | Show in navigation menu |
| featured | boolean | false | Show in featured section |
| featuredOrder | number | - | Display order (lower = first) |
| image | string | - | Thumbnail/OG image for cards |
| showImageAtTop | boolean | false | Display image at top |
| excerpt | string | - | Short text for card view |
| authorName | string | - | Author display name |
| authorImage | string | - | Author avatar URL |
| layout | string | - | "sidebar" for docs-style |
| rightSidebar | boolean | true | Show right sidebar |
| aiChat | boolean | false | Enable AI chat |
| contactForm | boolean | false | Enable contact form |
| newsletter | boolean | - | Override newsletter signup |
| textAlign | string | "left" | "left", "center", "right" |
| showFooter | boolean | - | Override footer display |
| footer | string | - | Custom footer markdown |
| showSocialFooter | boolean | - | Override social footer |

### Example page

```markdown
---
title: "About"
slug: "about"
published: true
order: 1
showInNav: true
featured: true
featuredOrder: 2
excerpt: "Learn about this site"
---

Page content here...
```

## Common patterns

### Featured post on homepage

```yaml
featured: true
featuredOrder: 1  # Lower numbers appear first
```

### Hero post on /blog page

```yaml
blogFeatured: true
image: "/images/hero.png"
```

### Docs-style page with sidebar

```yaml
layout: "sidebar"
rightSidebar: true
```

### Hide from navigation

```yaml
showInNav: false
```

### Unlisted post (hidden from listings)

```yaml
published: true
unlisted: true
```

Post remains accessible via direct link but hidden from all listings, search, and related posts.

### Enable contact form

```yaml
contactForm: true
```

### Custom footer content

```yaml
showFooter: true
footer: "Custom footer text in **markdown**"
```

## Docs section navigation

Posts and pages can appear in the docs sidebar navigation using these fields:

| Field | Type | Description |
|-------|------|-------------|
| docsSection | boolean | Include in docs navigation |
| docsSectionGroup | string | Sidebar group name |
| docsSectionOrder | number | Order within group (lower = first) |
| docsSectionGroupOrder | number | Order of group itself (lower = first) |
| docsSectionGroupIcon | string | Phosphor icon name for group (e.g., "Rocket", "Book") |
| docsLanding | boolean | Use as /docs landing page |

### Example docs post

```yaml
---
title: "Getting Started"
slug: "getting-started"
published: true
docsSection: true
docsSectionGroup: "Quick Start"
docsSectionOrder: 1
docsSectionGroupOrder: 1
docsSectionGroupIcon: "Rocket"
layout: "sidebar"
---
```

### Supported icons

The following Phosphor icon names are supported for `docsSectionGroupIcon`:

House, Book, Gear, Folder, Code, FileText, Question, Lightbulb, Rocket, Star, Heart, Bell, Calendar, User, ArrowRight, Check, Warning, Info, Lightning, Database, Globe, Lock, Key, Shield, Terminal, Package, PuzzlePiece, Flag, Target, Compass, MapPin, Bookmark, Tag, Hash, Link, At, Play, Pause, Plus, Minus, X, List, MagnifyingGlass, FunnelSimple, SortAscending, Download, Upload, Share, Copy, Clipboard, PencilSimple, Trash, Archive, Eye, EyeClosed

Only one item per group needs to specify the icon. If multiple items in a group have different icons, the first one found will be used.

## Validation

The sync script validates:

- Required fields must be present
- `slug` must be unique across all posts/pages
- `date` should be YYYY-MM-DD format
- `published` must be boolean

Missing required fields will cause the file to be skipped with a warning.
