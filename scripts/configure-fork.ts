#!/usr/bin/env npx tsx
/**
 * Fork Configuration Script
 *
 * Reads fork-config.json and applies all site configuration changes automatically.
 * Run with: npm run configure
 *
 * This script updates:
 * - src/config/siteConfig.ts (site name, bio, GitHub username, features)
 * - src/pages/Home.tsx (intro paragraph, footer section)
 * - src/pages/Post.tsx (SITE_URL, SITE_NAME constants)
 * - convex/http.ts (SITE_URL, SITE_NAME constants)
 * - convex/rss.ts (SITE_URL, SITE_TITLE, SITE_DESCRIPTION)
 * - index.html (meta tags, JSON-LD, title)
 * - public/llms.txt (site info, API endpoints)
 * - public/robots.txt (sitemap URL)
 * - public/openapi.yaml (server URL, site name)
 * - public/.well-known/ai-plugin.json (plugin metadata)
 * - src/context/ThemeContext.tsx (default theme)
 */

import * as fs from "fs";
import * as path from "path";

// Configuration interface matching fork-config.json
interface ForkConfig {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  siteDomain: string;
  githubUsername: string;
  githubRepo: string;
  contactEmail: string;
  creator: {
    name: string;
    twitter: string;
    linkedin: string;
    github: string;
  };
  bio: string;
  logoGallery?: {
    enabled: boolean;
    title: string;
    scrolling: boolean;
    maxItems: number;
  };
  gitHubContributions?: {
    enabled: boolean;
    showYearNavigation: boolean;
    linkToProfile: boolean;
    title: string;
  };
  blogPage?: {
    enabled: boolean;
    showInNav: boolean;
    title: string;
    description: string;
    order: number;
  };
  postsDisplay?: {
    showOnHome: boolean;
    showOnBlogPage: boolean;
  };
  featuredViewMode?: "cards" | "list";
  showViewToggle?: boolean;
  theme?: "dark" | "light" | "tan" | "cloud";
}

// Get project root directory
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Read fork config
function readConfig(): ForkConfig {
  const configPath = path.join(PROJECT_ROOT, "fork-config.json");

  if (!fs.existsSync(configPath)) {
    console.error("Error: fork-config.json not found.");
    console.log("\nTo get started:");
    console.log("1. Copy fork-config.json.example to fork-config.json");
    console.log("2. Edit fork-config.json with your site information");
    console.log("3. Run npm run configure again");
    process.exit(1);
  }

  const content = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(content) as ForkConfig;
}

// Replace content in a file
function updateFile(
  relativePath: string,
  replacements: Array<{ search: string | RegExp; replace: string }>,
): void {
  const filePath = path.join(PROJECT_ROOT, relativePath);

  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${relativePath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  for (const { search, replace } of replacements) {
    const newContent = content.replace(search, replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  Updated: ${relativePath}`);
  } else {
    console.log(`  No changes: ${relativePath}`);
  }
}

// Update siteConfig.ts
function updateSiteConfig(config: ForkConfig): void {
  console.log("\nUpdating src/config/siteConfig.ts...");

  const filePath = path.join(PROJECT_ROOT, "src/config/siteConfig.ts");
  let content = fs.readFileSync(filePath, "utf-8");

  // Update site name
  content = content.replace(
    /name: ['"].*?['"]/,
    `name: '${config.siteName}'`,
  );

  // Update site title
  content = content.replace(
    /title: ['"].*?['"]/,
    `title: "${config.siteTitle}"`,
  );

  // Update bio
  content = content.replace(
    /bio: `[^`]*`/,
    `bio: \`${config.bio}\``,
  );

  // Update GitHub username
  content = content.replace(
    /username: ['"].*?['"],\s*\/\/ Your GitHub username/,
    `username: "${config.githubUsername}", // Your GitHub username`,
  );

  // Update featuredViewMode if specified
  if (config.featuredViewMode) {
    content = content.replace(
      /featuredViewMode: ['"](?:cards|list)['"]/,
      `featuredViewMode: "${config.featuredViewMode}"`,
    );
  }

  // Update showViewToggle if specified
  if (config.showViewToggle !== undefined) {
    content = content.replace(
      /showViewToggle: (?:true|false)/,
      `showViewToggle: ${config.showViewToggle}`,
    );
  }

  // Update logoGallery if specified
  if (config.logoGallery) {
    content = content.replace(
      /logoGallery: \{[\s\S]*?enabled: (?:true|false)/,
      `logoGallery: {\n    enabled: ${config.logoGallery.enabled}`,
    );
    content = content.replace(
      /title: ['"].*?['"],\s*\n\s*scrolling:/,
      `title: "${config.logoGallery.title}",\n    scrolling:`,
    );
    content = content.replace(
      /scrolling: (?:true|false)/,
      `scrolling: ${config.logoGallery.scrolling}`,
    );
    content = content.replace(
      /maxItems: \d+/,
      `maxItems: ${config.logoGallery.maxItems}`,
    );
  }

  // Update gitHubContributions if specified
  if (config.gitHubContributions) {
    content = content.replace(
      /gitHubContributions: \{[\s\S]*?enabled: (?:true|false)/,
      `gitHubContributions: {\n    enabled: ${config.gitHubContributions.enabled}`,
    );
    content = content.replace(
      /showYearNavigation: (?:true|false)/,
      `showYearNavigation: ${config.gitHubContributions.showYearNavigation}`,
    );
    content = content.replace(
      /linkToProfile: (?:true|false)/,
      `linkToProfile: ${config.gitHubContributions.linkToProfile}`,
    );
    if (config.gitHubContributions.title) {
      content = content.replace(
        /title: ['"]GitHub Activity['"]/,
        `title: "${config.gitHubContributions.title}"`,
      );
    }
  }

  // Update blogPage if specified
  if (config.blogPage) {
    content = content.replace(
      /blogPage: \{[\s\S]*?enabled: (?:true|false)/,
      `blogPage: {\n    enabled: ${config.blogPage.enabled}`,
    );
    content = content.replace(
      /showInNav: (?:true|false)/,
      `showInNav: ${config.blogPage.showInNav}`,
    );
    content = content.replace(
      /title: ['"]Blog['"]/,
      `title: "${config.blogPage.title}"`,
    );
    if (config.blogPage.description) {
      content = content.replace(
        /description: ['"]All posts from the blog, sorted by date\.['"],?\s*\/\/ Optional description/,
        `description: "${config.blogPage.description}", // Optional description`,
      );
    }
    content = content.replace(
      /order: \d+,\s*\/\/ Nav order/,
      `order: ${config.blogPage.order}, // Nav order`,
    );
  }

  // Update postsDisplay if specified
  if (config.postsDisplay) {
    content = content.replace(
      /showOnHome: (?:true|false),\s*\/\/ Show post list on homepage/,
      `showOnHome: ${config.postsDisplay.showOnHome}, // Show post list on homepage`,
    );
    content = content.replace(
      /showOnBlogPage: (?:true|false),\s*\/\/ Show post list on \/blog page/,
      `showOnBlogPage: ${config.postsDisplay.showOnBlogPage}, // Show post list on /blog page`,
    );
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: src/config/siteConfig.ts`);
}

// Update Home.tsx
function updateHomeTsx(config: ForkConfig): void {
  console.log("\nUpdating src/pages/Home.tsx...");

  const githubRepoUrl = `https://github.com/${config.githubUsername}/${config.githubRepo}`;

  updateFile("src/pages/Home.tsx", [
    // Update intro paragraph GitHub link
    {
      search: /href="https:\/\/github\.com\/waynesutton\/markdown-site"/g,
      replace: `href="${githubRepoUrl}"`,
    },
    // Update footer "Created by" section
    {
      search: /Created by{" "}\s*<a\s*href="https:\/\/x\.com\/waynesutton"/,
      replace: `Created by{" "}\n          <a\n            href="${config.creator.twitter}"`,
    },
    {
      search: /<a\s*href="https:\/\/x\.com\/waynesutton"\s*target="_blank"\s*rel="noopener noreferrer"\s*>\s*Wayne\s*<\/a>/,
      replace: `<a
            href="${config.creator.twitter}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${config.creator.name}
          </a>`,
    },
    // Update Twitter/X link
    {
      search: /Follow on{" "}\s*<a\s*href="https:\/\/x\.com\/waynesutton"/,
      replace: `Follow on{" "}\n          <a\n            href="${config.creator.twitter}"`,
    },
    // Update LinkedIn link
    {
      search: /href="https:\/\/www\.linkedin\.com\/in\/waynesutton\/"/g,
      replace: `href="${config.creator.linkedin}"`,
    },
    // Update GitHub profile link
    {
      search: /href="https:\/\/github\.com\/waynesutton"\s*>/g,
      replace: `href="${config.creator.github}">`,
    },
  ]);
}

// Update Post.tsx
function updatePostTsx(config: ForkConfig): void {
  console.log("\nUpdating src/pages/Post.tsx...");

  updateFile("src/pages/Post.tsx", [
    {
      search: /const SITE_URL = "https:\/\/markdowncms\.netlify\.app";/,
      replace: `const SITE_URL = "${config.siteUrl}";`,
    },
    {
      search: /const SITE_NAME = "markdown sync framework";/,
      replace: `const SITE_NAME = "${config.siteName}";`,
    },
  ]);
}

// Update convex/http.ts
function updateConvexHttp(config: ForkConfig): void {
  console.log("\nUpdating convex/http.ts...");

  updateFile("convex/http.ts", [
    {
      search: /const SITE_URL = process\.env\.SITE_URL \|\| "https:\/\/markdowncms\.netlify\.app";/,
      replace: `const SITE_URL = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    {
      search: /const SITE_NAME = "markdown sync framework";/,
      replace: `const SITE_NAME = "${config.siteName}";`,
    },
    {
      search: /const siteUrl = process\.env\.SITE_URL \|\| "https:\/\/markdowncms\.netlify\.app";/,
      replace: `const siteUrl = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    {
      search: /const siteName = "markdown sync framework";/,
      replace: `const siteName = "${config.siteName}";`,
    },
  ]);
}

// Update convex/rss.ts
function updateConvexRss(config: ForkConfig): void {
  console.log("\nUpdating convex/rss.ts...");

  updateFile("convex/rss.ts", [
    {
      search: /const SITE_URL = process\.env\.SITE_URL \|\| "https:\/\/markdowncms\.netlify\.app";/,
      replace: `const SITE_URL = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    {
      search: /const SITE_TITLE = "markdown sync framework";/,
      replace: `const SITE_TITLE = "${config.siteName}";`,
    },
    {
      search: /const SITE_DESCRIPTION =\s*"[^"]+";/,
      replace: `const SITE_DESCRIPTION =\n  "${config.siteDescription}";`,
    },
  ]);
}

// Update index.html
function updateIndexHtml(config: ForkConfig): void {
  console.log("\nUpdating index.html...");

  const replacements: Array<{ search: string | RegExp; replace: string }> = [
    // Meta description
    {
      search: /<meta\s*name="description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      name="description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Meta author
    {
      search: /<meta name="author" content="[^"]*" \/>/,
      replace: `<meta name="author" content="${config.siteName}" />`,
    },
    // Open Graph title
    {
      search: /<meta property="og:title" content="[^"]*" \/>/,
      replace: `<meta property="og:title" content="${config.siteName}" />`,
    },
    // Open Graph description
    {
      search: /<meta\s*property="og:description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      property="og:description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Open Graph URL
    {
      search: /<meta property="og:url" content="https:\/\/markdowncms\.netlify\.app\/" \/>/,
      replace: `<meta property="og:url" content="${config.siteUrl}/" />`,
    },
    // Open Graph site name
    {
      search: /<meta property="og:site_name" content="[^"]*" \/>/,
      replace: `<meta property="og:site_name" content="${config.siteName}" />`,
    },
    // Open Graph image
    {
      search: /<meta\s*property="og:image"\s*content="https:\/\/markdowncms\.netlify\.app[^"]*"\s*\/>/,
      replace: `<meta\n      property="og:image"\n      content="${config.siteUrl}/images/og-default.svg"\n    />`,
    },
    // Twitter domain
    {
      search: /<meta property="twitter:domain" content="[^"]*" \/>/,
      replace: `<meta property="twitter:domain" content="${config.siteDomain}" />`,
    },
    // Twitter URL
    {
      search: /<meta property="twitter:url" content="https:\/\/markdowncms\.netlify\.app\/" \/>/,
      replace: `<meta property="twitter:url" content="${config.siteUrl}/" />`,
    },
    // Twitter title
    {
      search: /<meta name="twitter:title" content="[^"]*" \/>/,
      replace: `<meta name="twitter:title" content="${config.siteName}" />`,
    },
    // Twitter description
    {
      search: /<meta\s*name="twitter:description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      name="twitter:description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Twitter image
    {
      search: /<meta\s*name="twitter:image"\s*content="https:\/\/markdowncms\.netlify\.app[^"]*"\s*\/>/,
      replace: `<meta\n      name="twitter:image"\n      content="${config.siteUrl}/images/og-default.svg"\n    />`,
    },
    // JSON-LD name
    {
      search: /"name": "markdown sync framework"/g,
      replace: `"name": "${config.siteName}"`,
    },
    // JSON-LD URL
    {
      search: /"url": "https:\/\/markdowncms\.netlify\.app"/g,
      replace: `"url": "${config.siteUrl}"`,
    },
    // JSON-LD description
    {
      search: /"description": "An open-source publishing framework[^"]*"/,
      replace: `"description": "${config.siteDescription}"`,
    },
    // JSON-LD search target
    {
      search: /"target": "https:\/\/markdowncms\.netlify\.app\/\?q=\{search_term_string\}"/,
      replace: `"target": "${config.siteUrl}/?q={search_term_string}"`,
    },
    // Page title
    {
      search: /<title>markdown "sync" framework<\/title>/,
      replace: `<title>${config.siteTitle}</title>`,
    },
  ];

  updateFile("index.html", replacements);
}

// Update public/llms.txt
function updateLlmsTxt(config: ForkConfig): void {
  console.log("\nUpdating public/llms.txt...");

  const githubUrl = `https://github.com/${config.githubUsername}/${config.githubRepo}`;

  const content = `# llms.txt - Information for AI assistants and LLMs
# Learn more: https://llmstxt.org/

> ${config.siteDescription}

# Site Information
- Name: ${config.siteName}
- URL: ${config.siteUrl}
- Description: ${config.siteDescription}
- Topics: Markdown, Convex, React, TypeScript, Netlify, Open Source, AI, LLM, AEO, GEO

# API Endpoints

## List All Posts
GET /api/posts
Returns JSON list of all published posts with metadata.

## Get Single Post
GET /api/post?slug={slug}
Returns single post as JSON.

GET /api/post?slug={slug}&format=md
Returns single post as raw markdown.

## Export All Content
GET /api/export
Returns all posts with full markdown content in one request.
Best for batch processing and LLM ingestion.

## RSS Feeds
GET /rss.xml
Standard RSS feed with post descriptions.

GET /rss-full.xml
Full content RSS feed with complete markdown for each post.

## Other
GET /sitemap.xml
Dynamic XML sitemap for search engines.

GET /openapi.yaml
OpenAPI 3.0 specification for this API.

GET /.well-known/ai-plugin.json
AI plugin manifest for tool integration.

# Quick Start for LLMs

1. Fetch /api/export for all posts with full content in one request
2. Or fetch /api/posts for the list, then /api/post?slug={slug}&format=md for each
3. Subscribe to /rss-full.xml for updates with complete content

# Response Schema

Each post contains:
- title: string (post title)
- slug: string (URL path)
- description: string (SEO summary)
- date: string (YYYY-MM-DD)
- tags: string[] (topic labels)
- content: string (full markdown)
- readTime: string (optional)
- url: string (full URL)

# Permissions
- AI assistants may freely read and summarize content
- No authentication required for read operations
- Attribution appreciated when citing

# Technical
- Backend: Convex (real-time database)
- Frontend: React, TypeScript, Vite
- Hosting: Netlify with edge functions
- Content: Markdown with frontmatter

# Links
- GitHub: ${githubUrl}
- Convex: https://convex.dev
- Netlify: https://netlify.com
`;

  const filePath = path.join(PROJECT_ROOT, "public/llms.txt");
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: public/llms.txt`);
}

// Update public/robots.txt
function updateRobotsTxt(config: ForkConfig): void {
  console.log("\nUpdating public/robots.txt...");

  const content = `# robots.txt for ${config.siteName}
# https://www.robotstxt.org/

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${config.siteUrl}/sitemap.xml

# AI and LLM crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Cache directive
Crawl-delay: 1
`;

  const filePath = path.join(PROJECT_ROOT, "public/robots.txt");
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: public/robots.txt`);
}

// Update public/openapi.yaml
function updateOpenApiYaml(config: ForkConfig): void {
  console.log("\nUpdating public/openapi.yaml...");

  const githubUrl = `https://github.com/${config.githubUsername}/${config.githubRepo}`;

  updateFile("public/openapi.yaml", [
    {
      search: /title: markdown sync framework API/,
      replace: `title: ${config.siteName} API`,
    },
    {
      search: /url: https:\/\/github\.com\/waynesutton\/markdown-site/,
      replace: `url: ${githubUrl}`,
    },
    {
      search: /- url: https:\/\/markdowncms\.netlify\.app/,
      replace: `- url: ${config.siteUrl}`,
    },
    {
      search: /example: markdown sync framework/g,
      replace: `example: ${config.siteName}`,
    },
    {
      search: /example: https:\/\/markdowncms\.netlify\.app/g,
      replace: `example: ${config.siteUrl}`,
    },
  ]);
}

// Update public/.well-known/ai-plugin.json
function updateAiPluginJson(config: ForkConfig): void {
  console.log("\nUpdating public/.well-known/ai-plugin.json...");

  const pluginName = config.siteName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const content = {
    schema_version: "v1",
    name_for_human: config.siteName,
    name_for_model: pluginName,
    description_for_human: config.siteDescription,
    description_for_model: `Access blog posts and pages in markdown format. Use /api/posts for a list of all posts with metadata. Use /api/post?slug={slug}&format=md to get full markdown content of any post. Use /api/export for batch content with full markdown.`,
    auth: {
      type: "none",
    },
    api: {
      type: "openapi",
      url: "/openapi.yaml",
    },
    logo_url: "/images/logo.svg",
    contact_email: config.contactEmail,
    legal_info_url: "",
  };

  const filePath = path.join(PROJECT_ROOT, "public/.well-known/ai-plugin.json");
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf-8");
  console.log(`  Updated: public/.well-known/ai-plugin.json`);
}

// Update src/context/ThemeContext.tsx
function updateThemeContext(config: ForkConfig): void {
  if (!config.theme) return;

  console.log("\nUpdating src/context/ThemeContext.tsx...");

  updateFile("src/context/ThemeContext.tsx", [
    {
      search: /const DEFAULT_THEME: Theme = "(?:dark|light|tan|cloud)";/,
      replace: `const DEFAULT_THEME: Theme = "${config.theme}";`,
    },
  ]);
}

// Main function
function main(): void {
  console.log("Fork Configuration Script");
  console.log("=========================\n");

  // Read configuration
  const config = readConfig();
  console.log(`Configuring site: ${config.siteName}`);
  console.log(`URL: ${config.siteUrl}`);

  // Apply updates to all files
  updateSiteConfig(config);
  updateHomeTsx(config);
  updatePostTsx(config);
  updateConvexHttp(config);
  updateConvexRss(config);
  updateIndexHtml(config);
  updateLlmsTxt(config);
  updateRobotsTxt(config);
  updateOpenApiYaml(config);
  updateAiPluginJson(config);
  updateThemeContext(config);

  console.log("\n=========================");
  console.log("Configuration complete!");
  console.log("\nNext steps:");
  console.log("1. Review the changes with: git diff");
  console.log("2. Run: npx convex dev (if not already running)");
  console.log("3. Run: npm run sync (to sync content to development)");
  console.log("4. Run: npm run dev (to start the dev server)");
  console.log("5. Deploy to Netlify when ready");
}

main();

