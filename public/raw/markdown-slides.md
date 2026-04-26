# Markdown slides

> Turn any markdown post or page into a fullscreen slide presentation with one frontmatter field

---
Type: post
Date: 2026-04-14
Reading time: 3 min read
Tags: slides, markdown, features
---

You can now turn any markdown post or page into a fullscreen slide deck. No extra tools, no export step, no separate file format. Write your content in markdown, add one frontmatter field, and present it.

## The setup

Add `slides: true` to your frontmatter:

```yaml
---
title: "My presentation"
slug: "my-presentation"
published: true
slides: true
tags: ["talk"]
---
```

Separate slides with `---` (standard markdown horizontal rules). Each section between rules becomes one slide.

```markdown
# Slide one

Your opening content here.

---

## Slide two

More content on the next slide.

---

## Slide three

And so on.
```

That is the entire setup. The post renders normally as a readable article by default. When you want to present, click the **Present** button that appears in the post header.

## Navigation

Once in presentation mode:

| Key | Action |
|-----|--------|
| Right arrow or Space | Next slide |
| Left arrow | Previous slide |
| Escape | Exit presentation |
| Home | Jump to first slide |
| End | Jump to last slide |

Arrow buttons also appear at the bottom for mouse and touch navigation.

A progress bar at the top shows your position in the deck. The slide counter displays something like "3 / 12" so you always know where you are.

## What renders on slides

Everything markdown supports works on slides:

- Headings (H1 for title slides, H2 for sections)
- Code blocks with syntax highlighting
- Tables
- Images (auto-scaled to fit)
- Blockquotes
- Bold, italic, inline code
- Links
- Nested lists

Code blocks inside slides will not accidentally split on `---` characters. The parser skips horizontal rules inside fenced code blocks.

## Try the template

There is a working example you can view right now: [Slide template example](/slide-template-example). Open it and click Present to see the slide mode in action. Copy the markdown source as a starting point for your own decks.

## Syncing slides

Slides work with the existing sync commands. No new commands needed.

```bash
npm run sync        # dev
npm run sync:prod   # production
```

The `slides` frontmatter field flows through the same pipeline as every other field. Write your deck locally, sync it, present from the browser.

## When to use this

Slide mode is useful when you want a single markdown file to serve two purposes: a readable article and a presentable deck. Write the content once, read it as a post, present it in meetings. The same URL works both ways.

It is not a replacement for dedicated presentation tools. If you need animations, speaker notes, or complex layouts, use something built for that. But for dev talks, internal presentations, and quick demos where the content matters more than the polish, markdown slides get the job done.