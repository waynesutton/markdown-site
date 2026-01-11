# Configure your fork in one command

> Two options to set up your forked markdown framework: automated JSON config with npm run configure, or step-by-step manual guide.

---
Type: post
Date: 2025-12-20
Reading time: 4 min read
Tags: configuration, setup, fork, tutorial
---

# Configure your fork in one command

After forking this markdown framework, you need to update configuration files with your site information. This affects your site name, URLs, RSS feeds, social sharing metadata, and AI discovery files.

Previously this meant editing 10+ files manually. Now you have three options.

## Option 1: npx CLI (Recommended)

The fastest way to get started. Run a single command to create a new project:

```bash
npx create-markdown-sync my-site
```

The interactive wizard will:
1. Clone the template repository
2. Walk through all configuration options (site name, URLs, features, etc.)
3. Install dependencies
4. Set up Convex (opens browser for login)
5. Start the dev server and open your browser

After setup, follow the on-screen instructions:

```bash
cd my-site
npx convex dev    # Start Convex (required first time)
npm run sync      # Sync content (in another terminal)
npm run dev       # Start dev server
```

**Resources:**
- Deployment: https://www.markdown.fast/docs-deployment
- WorkOS auth: https://www.markdown.fast/how-to-setup-workos

## Option 2: Automated configuration

Run a single command to configure everything at once.

### Step 1: Copy the example config

```bash
cp fork-config.json.example fork-config.json
```

The file `fork-config.json` is gitignored, so your site configuration stays local and does not get committed. The `.example` file remains in the repo as a template for future forks.

### Step 2: Edit the JSON file

Open `fork-config.json` and update the values:

```json
{
  "siteName": "Your Site Name",
  "siteTitle": "Your Tagline",
  "siteDescription": "A one-sentence description of your site.",
  "siteUrl": "https://yoursite.netlify.app",
  "siteDomain": "yoursite.netlify.app",
  "githubUsername": "yourusername",
  "githubRepo": "your-repo-name",
  "contactEmail": "you@example.com",
  "creator": {
    "name": "Your Name",
    "twitter": "https://x.com/yourhandle",
    "linkedin": "https://www.linkedin.com/in/yourprofile/",
    "github": "https://github.com/yourusername"
  },
  "bio": "Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents.",
  "theme": "tan"
}
```

### Step 3: Run the configure script

```bash
npm run configure
```

The script reads your JSON file and updates all 14 configuration files automatically. You should see output like:

```
Fork Configuration Script
=========================
Reading config from fork-config.json...
Updating src/config/siteConfig.ts...
Updating src/pages/Home.tsx...
Updating src/pages/Post.tsx...
Updating src/pages/DocsPage.tsx...
Updating convex/http.ts...
Updating convex/rss.ts...
Updating netlify/edge-functions/mcp.ts...
Updating scripts/send-newsletter.ts...
Updating index.html...
Updating public/llms.txt...
Updating public/robots.txt...
Updating public/openapi.yaml...
Updating public/.well-known/ai-plugin.json...

Configuration complete!
```

## Option 3: Manual configuration

If you prefer to update files manually, follow the guide in `FORK_CONFIG.md`. It includes:

- Code snippets for each configuration file
- Line numbers and exact locations to update
- An AI agent prompt to paste into Claude or ChatGPT for assisted configuration

## What gets updated

The configuration script updates these files:

| File                                | What changes                                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/config/siteConfig.ts`          | Site name, bio, GitHub username, gitHubRepo config, default theme, features (logo gallery, GitHub contributions, visitor map, blog page, posts display, homepage, right sidebar, footer, social footer, AI chat, newsletter, contact form, newsletter admin, stats page, MCP server, dashboard, image lightbox) |
| `src/pages/Home.tsx`                | Intro paragraph, footer links                                                                                                                                                                                                                                                                    |
| `src/pages/Post.tsx`                | SITE_URL, SITE_NAME constants                                                                                                                                                                                                                                                                    |
| `src/pages/DocsPage.tsx`            | SITE_URL constant                                                                                                                                                                                                                                                                                |
| `convex/http.ts`                    | SITE_URL, SITE_NAME constants                                                                                                                                                                                                                                                                    |
| `convex/rss.ts`                     | SITE_URL, SITE_TITLE, SITE_DESCRIPTION                                                                                                                                                                                                                                                           |
| `netlify/edge-functions/mcp.ts`     | SITE_URL, SITE_NAME, MCP_SERVER_NAME constants                                                                                                                                                                                                                                                   |
| `scripts/send-newsletter.ts`        | Default SITE_URL constant                                                                                                                                                                                                                                                                        |
| `index.html`                        | Meta tags, JSON-LD, page title                                                                                                                                                                                                                                                                   |
| `public/llms.txt`                   | Site info, GitHub link                                                                                                                                                                                                                                                                           |
| `public/robots.txt`                 | Sitemap URL                                                                                                                                                                                                                                                                                      |
| `public/openapi.yaml`               | Server URL, site name, example URLs                                                                                                                                                                                                                                                              |
| `public/.well-known/ai-plugin.json` | Plugin metadata                                                                                                                                                                                                                                                                                  |

## Optional settings

The JSON config file supports additional options:

```json
{
  "gitHubRepoConfig": {
    "owner": "yourusername",
    "repo": "your-repo-name",
    "branch": "main",
    "contentPath": "public/raw"
  },
  "logoGallery": {
    "enabled": true,
    "title": "Built with",
    "scrolling": false,
    "maxItems": 4
  },
  "gitHubContributions": {
    "enabled": true,
    "showYearNavigation": true,
    "linkToProfile": true,
    "title": "GitHub Activity"
  },
  "visitorMap": {
    "enabled": true,
    "title": "Live Visitors"
  },
  "blogPage": {
    "enabled": true,
    "showInNav": true,
    "title": "Blog",
    "description": "All posts from the blog, sorted by date.",
    "order": 2
  },
  "postsDisplay": {
    "showOnHome": true,
    "showOnBlogPage": true,
    "homePostsLimit": 5,
    "homePostsReadMore": {
      "enabled": true,
      "text": "Read more blog posts",
      "link": "/blog"
    }
  },
  "featuredViewMode": "cards",
  "showViewToggle": true,
  "theme": "tan",
  "fontFamily": "serif",
  "homepage": {
    "type": "default",
    "slug": null,
    "originalHomeRoute": "/home"
  },
  "rightSidebar": {
    "enabled": true,
    "minWidth": 1135
  },
  "footer": {
    "enabled": true,
    "showOnHomepage": true,
    "showOnPosts": true,
    "showOnPages": true,
    "showOnBlogPage": true,
    "defaultContent": "Built with [Convex](https://convex.dev) for real-time sync and deployed on [Netlify](https://netlify.com)."
  },
  "socialFooter": {
    "enabled": true,
    "showOnHomepage": true,
    "showOnPosts": true,
    "showOnPages": true,
    "showOnBlogPage": true,
    "socialLinks": [
      {
        "platform": "github",
        "url": "https://github.com/yourusername/your-repo-name"
      },
      {
        "platform": "twitter",
        "url": "https://x.com/yourhandle"
      },
      {
        "platform": "linkedin",
        "url": "https://www.linkedin.com/in/yourprofile/"
      }
    ],
    "copyright": {
      "siteName": "Your Site Name",
      "showYear": true
    }
  },
  "aiChat": {
    "enabledOnWritePage": false,
    "enabledOnContent": false
  },
  "newsletter": {
    "enabled": false,
    "agentmail": {
      "inbox": "newsletter@mail.agentmail.to"
    },
    "signup": {
      "home": {
        "enabled": false,
        "position": "above-footer",
        "title": "Stay Updated",
        "description": "Get new posts delivered to your inbox."
      },
      "blogPage": {
        "enabled": false,
        "position": "above-footer",
        "title": "Subscribe",
        "description": "Get notified when new posts are published."
      },
      "posts": {
        "enabled": false,
        "position": "below-content",
        "title": "Enjoyed this post?",
        "description": "Subscribe for more updates."
      }
    }
  },
  "contactForm": {
    "enabled": false,
    "title": "Get in Touch",
    "description": "Send us a message and we'll get back to you."
  },
  "newsletterAdmin": {
    "enabled": false,
    "showInNav": false
  },
  "newsletterNotifications": {
    "enabled": false,
    "newSubscriberAlert": false,
    "weeklyStatsSummary": false
  },
  "weeklyDigest": {
    "enabled": false,
    "dayOfWeek": 0,
    "subject": "Weekly Digest"
  },
  "statsPage": {
    "enabled": true,
    "showInNav": true
  },
  "mcpServer": {
    "enabled": true,
    "endpoint": "/mcp",
    "publicRateLimit": 50,
    "authenticatedRateLimit": 1000,
    "requireAuth": false
  },
  "dashboard": {
    "enabled": true,
    "requireAuth": false
  },
  "imageLightbox": {
    "enabled": true
  },
  "semanticSearch": {
    "enabled": false
  },
  "askAI": {
    "enabled": false,
    "defaultModel": "claude-sonnet-4-20250514",
    "models": [
      { "id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "anthropic" },
      { "id": "gpt-4o", "name": "GPT-4o", "provider": "openai" }
    ]
  }
}
```

These are optional. If you omit them, the script uses sensible defaults. See `fork-config.json.example` for the complete schema with all available options.

### Configuration details

**GitHub Repo Config**: Used for "Open in AI" links (ChatGPT, Claude, Perplexity). Content must be pushed to GitHub for these links to work.

**Homepage**: Set any page or blog post as your homepage. Options: `"default"` (standard Home component), `"page"` (use a static page), or `"post"` (use a blog post). When using a custom homepage, the original homepage remains accessible at `/home` (or your configured route).

**Newsletter**: Requires `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX` environment variables in Convex dashboard. Signup forms can appear on homepage, blog page, or individual posts.

**Contact Form**: Requires `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX` in Convex dashboard. Optionally set `AGENTMAIL_CONTACT_EMAIL` to override recipient. Enable on specific pages/posts via frontmatter `contactForm: true`.

**Newsletter Admin**: Admin UI at `/newsletter-admin` for managing subscribers and sending newsletters. Hidden from navigation by default for security.

**Newsletter Notifications**: Sends developer emails for new subscribers and weekly stats summaries. Uses `AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX` as recipient.

**Weekly Digest**: Automated weekly email with posts from the past 7 days. Runs via cron job every Sunday at 9:00 AM UTC.

**Stats Page**: Real-time analytics at `/stats` showing page views, active visitors, and popular content.

**MCP Server**: HTTP-based Model Context Protocol server at `/mcp` endpoint for AI tool integration. Set `MCP_API_KEY` in Netlify env vars for authenticated access.

**Dashboard**: Admin dashboard at `/dashboard` for content management and site configuration. Optional WorkOS authentication via `requireAuth: true`. When `requireAuth` is `false`, dashboard is open access.

**Image Lightbox**: Click-to-magnify functionality for images in blog posts and pages. Images open in full-screen overlay when clicked.

**Semantic Search**: AI-powered search using OpenAI embeddings. Requires `OPENAI_API_KEY` in Convex. When disabled, only keyword search is available.

**Ask AI**: Header chat button for RAG-based Q&A about your site content. Requires `semanticSearch.enabled: true` and `OPENAI_API_KEY` for embeddings, plus `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for the LLM.

For detailed configuration instructions, see `FORK_CONFIG.md`.

## After configuring

Once configuration is complete:

1. **Deploy Convex functions**: Run `npx convex deploy` to push the updated backend files
2. **Sync your content**: Run `npm run sync` for development or `npm run sync:prod` for production
3. **Test locally**: Run `npm run dev` and verify your site name, footer, and metadata
4. **Push to git**: Commit all changes and push to trigger a Netlify rebuild

**Important**: Keep your `fork-config.json` file. The `sync:discovery` and `sync:all` commands read from it to update discovery files (`AGENTS.md`, `CLAUDE.md`, `public/llms.txt`) with your configured values. Without it, these files would revert to placeholder values.

## Existing content

The configuration script only updates site-level settings. It does not modify your markdown content in `content/blog/` or `content/pages/`. Your existing posts and pages remain unchanged.

If you want to clear the sample content, delete the markdown files in those directories before syncing.

## Summary

Three options to get started:

1. **npx CLI (Recommended)**: `npx create-markdown-sync my-site` - interactive wizard creates and configures everything
2. **Automated**: `cp fork-config.json.example fork-config.json`, edit JSON, run `npm run configure`
3. **Manual**: Follow `FORK_CONFIG.md` step-by-step or paste the AI prompt into Claude/ChatGPT

The npx CLI is the fastest option for new projects. The automated and manual options work best for existing forks.

Fork it, configure it, ship it.