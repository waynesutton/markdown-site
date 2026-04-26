# Slide template example

> A working example of markdown slides you can present directly from this page

---
Type: post
Date: 2026-04-14
Reading time: 2 min read
Tags: slides, template, markdown
---

# Welcome to markdown slides

Write your presentation in markdown. Separate slides with `---` horizontal rules.

Click the **Present** button above to enter presentation mode.

---

## How it works

1. Add `slides: true` to your frontmatter
2. Write content separated by `---` between slides
3. Click Present to go fullscreen
4. Arrow keys to navigate, Escape to exit

---

## Code blocks work too

```typescript
// Convex query example
export const listPosts = query({
  args: {},
  returns: v.array(v.object({
    title: v.string(),
    slug: v.string(),
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(20);
  },
});
```

---

## Tables and formatting

| Feature | Status |
|---------|--------|
| Headings | Supported |
| Code blocks | Supported |
| Tables | Supported |
| Images | Supported |
| Blockquotes | Supported |
| Lists | Supported |

---

## Blockquotes

> The best way to predict the future is to invent it.
>
> Alan Kay

Use blockquotes for emphasis or attribution on a slide.

---

## Bullet points

Things you can put on a slide:

- Text with **bold** and *italic* formatting
- `inline code` for technical terms
- [Links](/) to other pages
- Nested lists
  - Like this one
  - And this one

---

## Images

Include images the same way you would in any markdown post:

![Markdown sync](/images/logo.svg)

Images auto-scale to fit the slide viewport.

---

## Tips for good slides

**One idea per slide.** Keep slides focused. If you need more space, add another slide.

**Use headings.** H1 for title slides, H2 for section headers, H3 for sub-points.

**Less text, more impact.** Slides are for presenting, not reading. Let the speaker fill in context.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Right arrow / Space | Next slide |
| Left arrow | Previous slide |
| Escape | Exit presentation |
| Home | First slide |
| End | Last slide |

---

# Thank you

This template is a starting point. Copy the markdown source and edit it for your own presentations.

Every slide is just markdown between `---` separators.