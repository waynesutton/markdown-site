---
title: "How to use the Markdown sync dashboard"
description: "Learn how to use the dashboard at /dashboard to manage content, configure your site, and sync markdown files without leaving your browser."
date: "2025-12-29"
slug: "how-to-use-the-markdown-sync-dashboard"
published: true
tags: ["dashboard", "tutorial", "content-management"]
readTime: "8 min read"
featured: true
layout: "sidebar"
featuredOrder: 2
image: /images/dashboard.png
excerpt: "A complete guide to using the dashboard for managing your markdown blog without leaving your browser."
docsSection: true
docsSectionOrder: 2
docsSectionGroup: "Components"
docsLanding: true
---

# How to use the Markdown sync dashboard

![Dashboard home](/images/dashboard1.png)

The dashboard at `/dashboard` gives you a centralized interface for managing your markdown blog. You can edit posts, sync content, configure settings, and more without switching between your editor and terminal.

## Accessing the dashboard

Navigate to `/dashboard` in your browser. The dashboard isn't linked in the navigation by default, so you'll access it directly via URL.

### Authentication

The dashboard supports optional WorkOS authentication. Configure it in `siteConfig.ts`:

```typescript
dashboard: {
  enabled: true,
  requireAuth: false, // Set to true to require WorkOS authentication
},
```

When `requireAuth` is `false`, the dashboard is open to anyone who knows the URL. For production sites, set `requireAuth: true` and configure WorkOS authentication. See [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos) for authentication setup.

If WorkOS isn't configured and `requireAuth` is `true`, the dashboard shows setup instructions instead of the login prompt.

## Content management

### Posts and pages list

View all your posts and pages in one place. Each list includes:

- Filter by status: All, Published, Drafts
- Search by title or content
- Pagination with "First" and "Next" buttons
- Items per page selector (15, 25, 50, 100)
- Quick actions: Edit, View, Publish/Unpublish

Posts and pages display with their titles, publication status, and last modified dates. Click any item to open the editor.

### Post and page editor

![editor](/images/dashboard3.png)

Edit markdown content with a live preview. The editor includes:

- Markdown editor on the left
- Live preview on the right showing how content appears on your site
- Draggable frontmatter sidebar (200px-600px width)
- Independent scrolling for editor and preview sections
- Download markdown button to save changes locally
- Copy to clipboard for quick sharing

The frontmatter sidebar shows all available fields with descriptions. Edit values directly, and changes appear in the preview immediately.

### Write post and write page

Create new content without leaving the dashboard. The write interface includes:

- Full-screen markdown editor
- Frontmatter reference panel with copy buttons
- Word, line, and character counts
- Download markdown button
- Content persists in localStorage

Write your content, fill in frontmatter fields, then download the markdown file. Save it to `content/blog/` or `content/pages/`, then sync to Convex.

## AI Agent

![AI Agent](/images/dashboard4.png)

The dashboard includes a dedicated AI chat section separate from the Write page. Use it for:

- Writing assistance
- Content suggestions
- Editing help
- Answering questions about your content

The AI Agent uses Anthropic Claude API and requires `ANTHROPIC_API_KEY` in your Convex environment variables. Chat history is stored per-session in Convex.

## Newsletter management

![Newsletter management](/images/dashboard5.png)
All Newsletter Admin features are integrated into the dashboard:

- Subscribers: View, search, filter, and delete subscribers
- Send newsletter: Select a blog post to send to all active subscribers
- Write email: Compose custom emails with markdown support
- Recent sends: View the last 10 newsletter sends (posts and custom emails)
- Email stats: Dashboard with total emails sent, newsletters sent, active subscribers, and retention rate

Newsletter features require AgentMail configuration. Set `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX` in your Convex environment variables.

## Content import

Import articles from external URLs using Firecrawl:

1. Enter the URL you want to import
2. Click "Import"
3. Review the imported markdown draft
4. Edit if needed, then sync to Convex

Imported posts are created as drafts (`published: false`) by default. Review, edit, set `published: true`, then sync.

Firecrawl import requires `FIRECRAWL_API_KEY` in your `.env.local` file.

## Site configuration

![site config](/images/dashboard6.png)

The Config Generator UI lets you configure all `siteConfig.ts` settings from the dashboard:

- Site name, title, logo, bio
- Blog page settings
- Featured section configuration
- Logo gallery settings
- GitHub contributions
- Footer and social footer
- Newsletter settings
- Contact form settings
- Stats page settings
- Dashboard settings

Make changes in the UI, then download the generated `siteConfig.ts` file. Replace your existing config file with the downloaded version.

## Index HTML editor

View and edit `index.html` content directly:

- Meta tags
- Open Graph tags
- Twitter Cards
- JSON-LD structured data

Edit values in the UI, then download the updated HTML file. Replace your existing `index.html` with the downloaded version.

## Analytics

The dashboard includes a real-time stats section (clone of `/stats` page):

- Active visitors with per-page breakdown
- Total page views
- Unique visitors
- Views by page sorted by popularity

Stats update automatically via Convex subscriptions. No page refresh needed.

## Sync commands

![Sync commands](/images/dashboard7.png)

Run sync operations from the dashboard without opening a terminal:

**Development:**

- `npm run sync` - Sync markdown content
- `npm run sync:discovery` - Update discovery files (AGENTS.md, llms.txt)
- `npm run sync:all` - Sync content + discovery files together

**Production:**

- `npm run sync:prod` - Sync markdown content
- `npm run sync:discovery:prod` - Update discovery files
- `npm run sync:all:prod` - Sync content + discovery files together

### Sync server

For the best experience, start the sync server to execute commands directly from the dashboard:

```bash
npm run sync-server
```

This starts a local HTTP server on `localhost:3001` that allows the dashboard to execute sync commands and stream output in real-time.

**When sync server is running:**

- Server status shows "Online" in the sync section
- "Execute" buttons appear for each sync command
- Clicking Execute runs the command and streams output to the terminal view
- Real-time output appears as the command runs
- No need to copy commands to your terminal

**When sync server is offline:**

- Server status shows "Offline" in the sync section
- Only "Copy" buttons appear for each sync command
- Clicking Copy shows the command in a modal for copying to your terminal
- Copy icon appears next to `npm run sync-server` command to help you start the server

**Security:**

- Server binds to localhost only (not accessible from network)
- Optional token authentication via `SYNC_TOKEN` environment variable
- Only whitelisted commands can be executed
- CORS enabled for localhost:5173 (dev server)

### Header sync buttons

Quick sync buttons in the dashboard header let you run `npm run sync:all` (dev and prod) with one click. These buttons automatically use the sync server when available, or show the command in a modal when the server is offline.

## Dashboard features

### Search

The search bar in the dashboard header searches:

- Dashboard features and sections
- Page titles
- Post content

Results appear as you type. Click any result to navigate to that section or content.

### Theme and font

Toggle between themes (dark, light, tan, cloud) and switch fonts (serif, sans, monospace) from the dashboard. Preferences persist across sessions.

### Toast notifications

Success, error, info, and warning notifications appear in the top-right corner. They auto-dismiss after 4 seconds and are theme-aware.

### Command modal

When you run sync commands, output appears in a modal. You can:

- View full command output
- Copy command to clipboard
- Close the modal

### Mobile responsive

The dashboard works on mobile devices with:

- Collapsible sidebar
- Touch-friendly controls
- Responsive tables and forms
- Mobile-optimized layout

## Best practices

1. Use the editor for quick edits and previews
2. Download markdown files for version control
3. Sync regularly to keep content up to date
4. Use the AI Agent for writing assistance
5. Check analytics to see what content performs well
6. Configure WorkOS authentication for production sites

## Troubleshooting

**Dashboard not loading:**

- Check that `dashboard.enabled: true` in `siteConfig.ts`
- Verify Convex is running (`npx convex dev`)
- Check browser console for errors

**Sync commands failing:**

- Ensure you're in the project root directory
- Check that Convex environment variables are set
- Verify `.env.local` or `.env.production.local` exists

**Authentication not working:**

- Verify WorkOS environment variables are set
- Check that `requireAuth: true` in `siteConfig.ts`
- See [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos) for setup instructions

The dashboard makes managing your markdown blog easier. You can edit content, sync files, and configure settings all from one place.
