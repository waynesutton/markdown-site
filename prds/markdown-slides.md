# Markdown slides

## Problem

Users want to create presentations directly from markdown content, similar to Obsidian's Slides plugin. Currently the only way to present content is as a standard blog post or page. There is no way to turn markdown into a fullscreen slide deck.

## Proposed solution

Add a `slides: true` frontmatter option that enables presentation mode on any post or page. Content is split on `---` (horizontal rules) into individual slides. A "Present" button appears in the post header. Clicking it enters fullscreen slide presentation mode with keyboard navigation.

This works with the existing `npm run sync` pipeline since `slides` is just another frontmatter boolean, same pattern as `featured`, `aiChat`, etc.

## How it works

1. Author adds `slides: true` to frontmatter
2. Post renders normally by default (standard reading view)
3. A "Present" button appears near the post title
4. Clicking "Present" enters fullscreen mode
5. Content splits on `---` (markdown horizontal rules) into slides
6. Each slide is rendered as full-viewport centered content via ReactMarkdown
7. Arrow keys / space navigate forward/back, Escape exits
8. Slide counter shows current position (e.g. "3 / 12")

## Files to change

### Schema and sync pipeline
- `convex/schema.ts`: Add `slides: v.optional(v.boolean())` to posts and pages tables
- `convex/posts.ts`: Add `slides` to syncPostsPublic validator
- `convex/pages.ts`: Add `slides` to syncPagesPublic validator
- `scripts/sync-posts.ts`: Add `slides` to PostFrontmatter, ParsedPost, PageFrontmatter, ParsedPage, and both parse functions

### Frontend
- `src/components/SlidePresentation.tsx`: New component for fullscreen slide rendering
- `src/pages/Post.tsx`: Add "Present" button when slides: true, render SlidePresentation overlay
- `src/styles/global.css`: Slide presentation styles

### Content
- `content/blog/markdown-slides.md`: Blog post about the feature (not featured)
- `content/blog/slide-template-example.md`: Example slide deck linked from the blog post

### Docs and project files
- `content/pages/changelog-page.md`: New version entry
- `content/pages/home.md`: Add slides to features list
- `files.md`: Add new file entries
- `changelog.md`: Add keepachangelog entry

## Edge cases

- Posts without `---` separators: entire content becomes a single slide
- Empty slides from consecutive `---`: skip them
- Long content on a single slide: CSS overflow scroll within the slide
- Code blocks containing `---`: splitting happens on markdown `<hr>` elements, not raw string matching, so fenced code blocks are safe
- Mobile: touch swipe support is out of scope for v1, arrow buttons visible on mobile

## Implementation notes

- Split content by regex matching standalone `---` lines (not inside code blocks)
- Use ReactMarkdown for each slide segment (same renderer as BlogPost)
- Portal-based fullscreen overlay to escape any parent CSS constraints
- No new npm dependencies needed
