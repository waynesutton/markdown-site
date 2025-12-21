---
title: "Writing Markdown with Code Examples"
description: "A sample post showing how to write markdown with syntax-highlighted code blocks, tables, and more."
date: "2025-01-17"
slug: "markdown-with-code-examples"
published: true
tags: ["markdown", "tutorial", "code"]
readTime: "5 min read"
featured: false
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

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run sync`      | Sync markdown to Convex (dev)  |
| `npm run sync:prod` | Sync markdown to Convex (prod) |
| `npx convex dev`    | Start Convex dev server        |

## Lists

### Unordered

- Write posts in markdown
- Store in Convex database
- Deploy to Netlify
- Updates sync in real-time

### Ordered

1. Fork the repository
2. Set up Convex backend
3. Configure Netlify
4. Start writing

## Blockquotes

> Markdown files in your repo are simpler than a CMS. Commit changes, review diffs, roll back anytime. AI agents can create posts programmatically. No admin panel needed.

## Links

External links open in new tabs: [Convex Docs](https://docs.convex.dev)

Internal links: [Setup Guide](/setup-guide)

## Emphasis

Use **bold** for strong emphasis and _italics_ for lighter emphasis.

## Horizontal Rule

---

## Images

Place images in `public/` and reference them:

```markdown
![Alt text](/image.png)
```

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
