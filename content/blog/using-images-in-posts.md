---
title: "Using Images in Blog Posts"
description: "Learn how to add header images, inline images, and Open Graph images to your markdown posts."
date: "2025-12-14"
slug: "using-images-in-posts"
published: true
featured: false
layout: "sidebar"
featuredOrder: 4
tags: ["images", "tutorial", "markdown", "open-graph"]
readTime: "4 min read"
blogFeatured: true
showImageAtTop: true
authorName: "Markdown"
authorImage: "/images/authors/markdown.png"
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop"
docsSection: true
docsSectionOrder: 3
docsSectionGroup: "Publishing"
docsLanding: true
---

# Using Images in Blog Posts

This post demonstrates how to add images to your blog posts. You can use header images for social sharing, inline images for content, and set Open Graph images for better link previews.

## Header/Open Graph Images

The `image` field in your frontmatter serves multiple purposes:

1. **Open Graph image** for social media previews (Twitter, LinkedIn, Slack)
2. **Thumbnail image** for featured section card view on the homepage
3. **Header image** displayed at the top of the post/page (when `showImageAtTop: true`)

```yaml
---
title: "Your Post Title"
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop"
showImageAtTop: true
---
```

**Recommended dimensions:** 1200x630 pixels (1.91:1 ratio) for social sharing

## Displaying Image at Top of Post/Page

To display the `image` field at the top of your post or page (above the header), add `showImageAtTop: true` to your frontmatter:

```yaml
---
title: "My Post"
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop"
showImageAtTop: true
---
```

**Default behavior:** If `showImageAtTop` is not set or set to `false`, the image will only be used for Open Graph previews and featured card thumbnails, not displayed in the post content.

**Use cases:**

- Hero images for blog posts
- Featured images that introduce the content
- Visual headers for documentation pages

## Featured Section Thumbnails

When a post or page is marked as `featured: true`, the `image` field displays as a square thumbnail in the card view.

```yaml
---
title: "Featured Post"
image: "/images/thumbnail.png"
featured: true
featuredOrder: 1
---
```

**Square display:** Non-square images are automatically cropped to fit the square thumbnail area. The crop centers on the middle of the image. For best results, use images where the main subject is centered.

**Square thumbnails:** 400x400px minimum (800x800px for retina)

## Inline Images

You can add images using markdown syntax or HTML. The site uses `rehypeRaw` and `rehypeSanitize` to safely render HTML in markdown content.

### Markdown Syntax

Add images anywhere in your markdown content using standard syntax:

```markdown
![Alt text description](/images/screenshot.png)
```

Here's an example image from Unsplash:

![Laptop on a wooden desk with coffee and notebook](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop)

The alt text appears as a caption below the image.

### HTML Syntax

You can also use HTML `<img>` tags directly in your markdown:

```html
<img src="/images/screenshot.png" alt="Alt text description" />
```

Or with additional attributes:

```html
<img
  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop"
  alt="Laptop on a wooden desk with coffee and notebook"
  width="800"
  height="450"
/>
```

**HTML images:** HTML `<img>` tags are sanitized for security using `rehypeSanitize`. Allowed attributes include `src`, `alt`, `width`, `height`, `loading`, and `class`. The alt text still appears as a caption below HTML images, matching the markdown behavior.

**Combining markdown and HTML:** You can mix markdown and HTML in the same post. Both syntaxes render images with the same styling and caption behavior.

## Image Sources

You can use images from:

| Source      | Example                           |
| ----------- | --------------------------------- |
| Local files | `/images/my-image.png`            |
| Unsplash    | `https://images.unsplash.com/...` |
| Cloudinary  | `https://res.cloudinary.com/...`  |
| Any CDN     | Full URL to image                 |

### Local Images

Place image files in the `public/images/` directory:

```
public/
  images/
    screenshot.png
    diagram.svg
    photo.jpg
```

Reference them with a leading slash:

```markdown
![Screenshot](/images/screenshot.png)
```

### External Images

Use the full URL for images hosted elsewhere:

```markdown
![Photo](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800)
```

Here's a coding-themed image:

![Code on a screen](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop)

## Best Practices

1. **Use descriptive alt text** for accessibility
2. **Optimize image size** before uploading (compress PNG/JPG)
3. **Use CDN URLs** for external images when possible
4. **Match OG image dimensions** to 1200x630 for social previews
5. **Use SVG** for logos and icons

## Free Image Resources

These sites offer free, high-quality images:

- [Unsplash](https://unsplash.com) - Photos
- [Pexels](https://pexels.com) - Photos and videos
- [unDraw](https://undraw.co) - Illustrations
- [Heroicons](https://heroicons.com) - Icons
- [Phosphor Icons](https://phosphoricons.com/) - Icons
