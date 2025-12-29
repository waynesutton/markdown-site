---
title: "Writing Markdown with Code Examples"
description: "A complete reference for writing markdown with links, code blocks, images, tables, and formatting. Copy examples directly into your posts."
date: "2025-12-14"
slug: "markdown-with-code-examples"
published: true
tags: ["markdown", "tutorial", "code"]
readTime: "5 min read"
authorName: "Markdown"
authorImage: "/images/authors/markdown.png"
featured: false
layout: "sidebar"
featuredOrder: 5
image: "/images/markdown.png"
---

# Writing Markdown with Code Examples

This post demonstrates how to write markdown content with code blocks, tables, and formatting. Use it as a reference when creating your own posts.

## Frontmatter

Every post starts with frontmatter between `---` delimiters:

```yaml
---
title: "Your Post Title"
description: "A brief description for SEO"
date: "2025-01-17"
slug: "your-url-slug"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
---
```

## Code Blocks

### TypeScript

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      title: v.string(),
      slug: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});
```

### React Component

```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function PostList() {
  const posts = useQuery(api.posts.getPosts);

  if (posts === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post._id}>
          <a href={`/${post.slug}`}>{post.title}</a>
        </li>
      ))}
    </ul>
  );
}
```

### Bash Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Sync posts to Convex (development)
npm run sync

# Sync posts to Convex (production)
npm run sync:prod

# Deploy to production
npm run deploy
```

### JSON

```json
{
  "name": "markdown-blog",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "sync": "npx ts-node scripts/sync-posts.ts"
  }
}
```

## Inline Code

Use backticks for inline code like `npm install` or `useQuery`.

Reference files with inline code: `convex/schema.ts`, `src/pages/Home.tsx`.

## Tables

### Basic table

Copy this markdown to create a table:

```markdown
| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run sync`      | Sync markdown to Convex (dev)  |
| `npm run sync:prod` | Sync markdown to Convex (prod) |
| `npx convex dev`    | Start Convex dev server        |
```

Result:

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run sync`      | Sync markdown to Convex (dev)  |
| `npm run sync:prod` | Sync markdown to Convex (prod) |
| `npx convex dev`    | Start Convex dev server        |

## Lists

### Unordered list

Copy this markdown to create an unordered list:

```markdown
- Write posts in markdown
- Store in Convex database
- Deploy to Netlify
- Updates sync in real-time
```

Result:

- Write posts in markdown
- Store in Convex database
- Deploy to Netlify
- Updates sync in real-time

### Ordered list

Copy this markdown to create an ordered list:

```markdown
1. Fork the repository
2. Set up Convex backend
3. Configure Netlify
4. Start writing
```

Result:

1. Fork the repository
2. Set up Convex backend
3. Configure Netlify
4. Start writing

### List without bullets or numbers

Use HTML with inline styles to create a list without visible bullets or numbers:

```html
<ul style="list-style: none; padding-left: 0;">
  <li>Write posts in markdown</li>
  <li>Store in Convex database</li>
  <li>Deploy to Netlify</li>
  <li>Updates sync in real-time</li>
</ul>
```

Result:

<ul style="list-style: none; padding-left: 0;">
  <li>Write posts in markdown</li>
  <li>Store in Convex database</li>
  <li>Deploy to Netlify</li>
  <li>Updates sync in real-time</li>
</ul>

**Alternative:** If you just need simple text items without list semantics, use plain paragraphs with line breaks:

```markdown
Write posts in markdown  
Store in Convex database  
Deploy to Netlify  
Updates sync in real-time
```

(Each line ends with two spaces for a line break)

## Blockquotes

> Markdown files in your repo are simpler than a CMS. Commit changes, review diffs, roll back anytime. AI agents can create posts programmatically. No admin panel needed.

## Links

Markdown supports several link formats.

### Basic links

```markdown
[Link text](https://example.com)
```

Result: [Convex Docs](https://docs.convex.dev)

### Internal links

Link to other posts and pages using the slug:

```markdown
[Setup Guide](/setup-guide)
[About](/about)
[Changelog](/changelog)
```

Result: [Setup Guide](/setup-guide)

### Links with titles

Add a title that appears on hover:

```markdown
[Convex](https://convex.dev "Real-time backend")
```

Result: [Convex](https://convex.dev "Real-time backend")

### Reference-style links

For cleaner markdown when using the same link multiple times:

```markdown
Read the [Convex docs][convex] or check the [API reference][convex].

[convex]: https://docs.convex.dev
```

### Autolinks

URLs and email addresses in angle brackets become clickable:

```markdown
<https://markdown.fast>
<hello@example.com>
```

### Linking to headings

Link to sections within the same page using the heading ID:

```markdown
[Jump to Code Blocks](#code-blocks)
[See the Tips section](#tips)
```

Result: [Jump to Code Blocks](#code-blocks)

## Emphasis

Use **bold** for strong emphasis and _italics_ for lighter emphasis.

## Horizontal Rule

---

## Images

Place images in `public/images/` and reference them with absolute paths.

### Basic image

```markdown
![Screenshot of the setup guide](/images/setupguide.png)
```

### Image with title

```markdown
![Dashboard view](/images/v17.png "Version 17 dashboard")
```

### Featured images in frontmatter

Add an image to your post frontmatter for card views and social sharing:

```yaml
---
image: "/images/my-post-image.png"
---
```

The image appears as a thumbnail in card view and as the Open Graph image when shared.

### Image sizing

For best results:

- Blog images: 1200x630px (standard OG size)
- Author avatars: 200x200px (displays as circle)
- Card thumbnails: Square images work best (auto-cropped to center)

## Nested lists

Indent with two spaces for nested items:

```markdown
- Parent item
  - Child item
  - Another child
    - Grandchild item
- Back to parent level
```

Result:

- Parent item
  - Child item
  - Another child
    - Grandchild item
- Back to parent level

## Mixed list types

Combine ordered and unordered lists:

```markdown
1. First step
   - Sub-point A
   - Sub-point B
2. Second step
   - Another sub-point
```

Result:

1. First step
   - Sub-point A
   - Sub-point B
2. Second step
   - Another sub-point

## HTML comments

Use HTML comments to add notes that won't appear in the rendered output:

```html
<!-- This is a comment that won't be displayed -->
Your visible content here.
```

Result: Only "Your visible content here." is displayed.

**Note:** HTML comments are automatically stripped from the rendered output. Special comments like `<!-- newsletter -->` and `<!-- contactform -->` are preserved for embedding components.

## Escaping characters

Use backslash to display literal markdown characters:

```markdown
\*not italic\*
\`not code\`
\[not a link\]
```

Result: \*not italic\* and \`not code\`

## Line breaks

End a line with two spaces for a soft break.  
Or use a blank line for a new paragraph.

```markdown
First line with two trailing spaces  
Second line (soft break)

New paragraph (blank line above)
```

## Combining emphasis

Stack formatting for combined effects:

```markdown
**_bold and italic_**
`code with **no bold** inside`
```

Result: **_bold and italic_**

## File Structure Reference

```
content/blog/
├── about-this-blog.md
├── markdown-with-code-examples.md
├── setup-guide.md
└── your-new-post.md
```

## Tips

1. Keep slugs URL-friendly (lowercase, hyphens)
2. Set `published: false` for drafts
3. Run `npm run sync` after adding posts (or `npm run sync:prod` for production)
4. Use descriptive titles for SEO

## Strikethrough

Use double tildes for strikethrough text:

```markdown
~~deleted text~~
```

Result: ~~deleted text~~

## Code in headings

You can include inline code in headings:

```markdown
## Using the `useQuery` hook
```

## Tables with alignment

Control column alignment with colons:

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| L    |   C    |     R |
```

| Left | Center | Right |
| :--- | :----: | ----: |
| L    |   C    |     R |

## Collapsible sections

Use HTML `<details>` and `<summary>` tags to create expandable/collapsible content:

### Basic toggle

```html
<details>
  <summary>Click to expand</summary>

  Hidden content goes here. You can include: - Lists - **Bold** and _italic_
  text - Code blocks - Any markdown content
</details>
```

<details>
<summary>Click to expand</summary>

Hidden content goes here. You can include:

- Lists
- **Bold** and _italic_ text
- Code blocks
- Any markdown content

</details>

### Expanded by default

Add the `open` attribute to start expanded:

```html
<details open>
  <summary>Already expanded</summary>

  This section starts open. Users can click to collapse it.
</details>
```

<details open>
<summary>Already expanded</summary>

This section starts open. Users can click to collapse it.

</details>

### Toggle with code

````html
<details>
  <summary>View the code example</summary>

  ```typescript export const getPosts = query({ args: {}, handler: async (ctx)
  => { return await ctx.db.query("posts").collect(); }, });
</details>
````

</details>
```

<details>
<summary>View the code example</summary>

```typescript
export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});
```

</details>

### Nested toggles

You can nest collapsible sections:

```html
<details>
  <summary>Outer section</summary>

  Some content here.

  <details>
    <summary>Inner section</summary>

    Nested content inside.
  </details>
</details>
```

<details>
<summary>Outer section</summary>

Some content here.

<details>
<summary>Inner section</summary>

Nested content inside.

</details>

</details>

## Multi-line code in lists

Indent code blocks with 4 spaces inside list items:

````markdown
1. First step:

   ```bash
   npm install
   ```

2. Second step:

   ```bash
   npm run dev
   ```
````

## Quick reference

| Syntax              | Result                |
| ------------------- | --------------------- |
| `**bold**`          | **bold**              |
| `_italic_`          | _italic_              |
| `~~strike~~`        | ~~strike~~            |
| `` `code` ``        | `code`                |
| `[link](url)`       | [link](https://x.com) |
| `![alt](image.png)` | image                 |
| `> quote`           | blockquote            |
| `---`               | horizontal rule       |
