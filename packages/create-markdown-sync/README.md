# create-markdown-sync

Create a markdown-sync site with a single command.

## Quick Start

```bash
npx create-markdown-sync my-site
```

This interactive CLI will:

1. Clone the markdown-sync framework
2. Walk through configuration (site name, URL, features, etc.)
3. Install dependencies
4. Set up Convex backend
5. Run initial content sync
6. Open your site in the browser

## Usage

```bash
# Create a new project
npx create-markdown-sync my-blog

# With specific package manager
npx create-markdown-sync my-blog --pm yarn

# Skip Convex setup (configure later)
npx create-markdown-sync my-blog --skip-convex
```

## What You Get

A fully configured markdown-sync site with:

- Real-time content sync via Convex
- Markdown-based blog posts and pages
- Full-text and semantic search
- RSS feeds and sitemap
- AI integrations (Claude, GPT-4, Gemini)
- Newsletter subscriptions (via AgentMail)
- MCP server for AI tool integration
- Dashboard for content management
- Deploy-ready for Netlify

## Requirements

- Node.js 18 or higher
- npm, yarn, pnpm, or bun

## After Setup

```bash
cd my-site
npm run dev      # Start dev server at localhost:5173
npm run sync     # Sync content changes to Convex
```

## Documentation

Full documentation at [markdown.fast/docs](https://www.markdown.fast/docs)

## License

MIT
