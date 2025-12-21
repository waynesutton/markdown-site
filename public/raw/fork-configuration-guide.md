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

Previously this meant editing 10+ files manually. Now you have two options.

## Option 1: Automated configuration

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

The script reads your JSON file and updates all 11 configuration files automatically. You should see output like:

```
Fork Configuration Script
=========================
Reading config from fork-config.json...
Updating src/config/siteConfig.ts...
Updating src/pages/Home.tsx...
Updating src/pages/Post.tsx...
Updating convex/http.ts...
Updating convex/rss.ts...
Updating index.html...
Updating public/llms.txt...
Updating public/robots.txt...
Updating public/openapi.yaml...
Updating public/.well-known/ai-plugin.json...
Updating src/context/ThemeContext.tsx...

Configuration complete!
```

## Option 2: Manual configuration

If you prefer to update files manually, follow the guide in `FORK_CONFIG.md`. It includes:

- Code snippets for each configuration file
- Line numbers and exact locations to update
- An AI agent prompt to paste into Claude or ChatGPT for assisted configuration

## What gets updated

The configuration script updates these files:

| File                                | What changes                              |
| ----------------------------------- | ----------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, bio, GitHub username, features |
| `src/pages/Home.tsx`                | Intro paragraph, footer links             |
| `src/pages/Post.tsx`                | SITE_URL, SITE_NAME constants             |
| `convex/http.ts`                    | SITE_URL, SITE_NAME constants             |
| `convex/rss.ts`                     | SITE_URL, SITE_TITLE, SITE_DESCRIPTION    |
| `index.html`                        | Meta tags, JSON-LD, page title            |
| `public/llms.txt`                   | Site info, GitHub link                    |
| `public/robots.txt`                 | Sitemap URL                               |
| `public/openapi.yaml`               | Server URL, site name                     |
| `public/.well-known/ai-plugin.json` | Plugin metadata                           |
| `src/context/ThemeContext.tsx`      | Default theme                             |

## Optional settings

The JSON config file supports additional options:

```json
{
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
  "blogPage": {
    "enabled": true,
    "showInNav": true,
    "title": "Blog",
    "description": "Latest posts",
    "order": 0
  },
  "postsDisplay": {
    "showOnHome": true,
    "showOnBlogPage": true
  },
  "featuredViewMode": "cards",
  "showViewToggle": true,
  "theme": "tan"
}
```

These are optional. If you omit them, the script uses sensible defaults.

## After configuring

Once configuration is complete:

1. **Deploy Convex functions**: Run `npx convex deploy` to push the updated backend files
2. **Sync your content**: Run `npm run sync` for development or `npm run sync:prod` for production
3. **Test locally**: Run `npm run dev` and verify your site name, footer, and metadata
4. **Push to git**: Commit all changes and push to trigger a Netlify rebuild

## Existing content

The configuration script only updates site-level settings. It does not modify your markdown content in `content/blog/` or `content/pages/`. Your existing posts and pages remain unchanged.

If you want to clear the sample content, delete the markdown files in those directories before syncing.

## Summary

Two options after forking:

1. **Automated**: `cp fork-config.json.example fork-config.json`, edit JSON, run `npm run configure`
2. **Manual**: Follow `FORK_CONFIG.md` step-by-step or paste the AI prompt into Claude/ChatGPT

Both approaches update the same 11 files. The automated option takes about 30 seconds. The manual option gives you more control over each change.

Fork it, configure it, ship it.