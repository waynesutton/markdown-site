# Projects

---
Type: page
Date: 2026-01-11
---

This markdown framework is open source and built to be extended. Here is what ships out of the box.

## Core Features

**Real-time sync**
Posts update instantly across all browsers. No rebuild, no redeploy.

**Four themes**
Dark, light, tan, and cloud. Switch with one click.

**Markdown authoring**
Write in your editor. Frontmatter handles metadata.

**Static pages**
About, Projects, Contact. Add your own.

## API Endpoints

The site exposes endpoints for search engines and AI agents:

- `/rss.xml` for RSS readers
- `/rss-full.xml` for LLM ingestion
- `/sitemap.xml` for search engines
- `/api/posts` for JSON access
- `/llms.txt` for AI discovery

## Technical Architecture

```
content/           <- Markdown files
  blog/            <- Blog posts
  pages/           <- Static pages
convex/            <- Backend functions
src/               <- React frontend
```

Convex handles the database, queries, and mutations. The frontend subscribes to data and re-renders when it changes. No REST. No GraphQL. Just reactive functions.

## Extend It

Fork the repo. Add features. The codebase is TypeScript end to end with full type safety from database to UI.