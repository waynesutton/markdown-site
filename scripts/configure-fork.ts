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
 * - src/pages/DocsPage.tsx (SITE_URL constant)
 * - convex/http.ts (SITE_URL, SITE_NAME constants)
 * - convex/rss.ts (SITE_URL, SITE_TITLE, SITE_DESCRIPTION)
 * - index.html (meta tags, JSON-LD, title)
 * - public/llms.txt (site info, API endpoints)
 * - public/robots.txt (sitemap URL)
 * - public/openapi.yaml (server URL, site name, example URLs)
 * - public/.well-known/ai-plugin.json (plugin metadata)
 * - netlify/edge-functions/mcp.ts (SITE_URL, SITE_NAME constants)
 * - scripts/send-newsletter.ts (SITE_URL fallback)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Silent mode flag (for CLI usage)
const silent = process.argv.includes("--silent");

// Log helper that respects silent mode
function log(message: string): void {
  if (!silent) log(message);
}

// Warn helper that always shows warnings
function warn(message: string): void {
  warn(message);
}

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
  // New gitHubRepoConfig for AI service raw URLs
  gitHubRepoConfig?: {
    owner: string;
    repo: string;
    branch: string;
    contentPath: string;
  };
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
  fontFamily?: "serif" | "sans" | "monospace";
  homepage?: {
    type: "default" | "page" | "post";
    slug?: string;
    originalHomeRoute?: string;
  };
  socialFooter?: {
    enabled?: boolean;
    showOnHomepage?: boolean;
    showOnPosts?: boolean;
    showOnPages?: boolean;
    showOnBlogPage?: boolean;
    showInHeader?: boolean;
    socialLinks?: Array<{
      platform: string;
      url: string;
    }>;
    copyright?: {
      siteName?: string;
      showYear?: boolean;
    };
  };
}

// Get project root directory
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Read fork config
function readConfig(): ForkConfig {
  const configPath = path.join(PROJECT_ROOT, "fork-config.json");

  if (!fs.existsSync(configPath)) {
    console.error("Error: fork-config.json not found.");
    log("\nTo get started:");
    log("1. Copy fork-config.json.example to fork-config.json");
    log("2. Edit fork-config.json with your site information");
    log("3. Run npm run configure again");
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
    warn(`Warning: ${relativePath} not found, skipping.`);
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
    log(`  Updated: ${relativePath}`);
  } else {
    log(`  No changes: ${relativePath}`);
  }
}

// Update siteConfig.ts
function updateSiteConfig(config: ForkConfig): void {
  log("\nUpdating src/config/siteConfig.ts...");

  const filePath = path.join(PROJECT_ROOT, "src/config/siteConfig.ts");
  let content = fs.readFileSync(filePath, "utf-8");

  // Update site name (match single-quoted or double-quoted strings properly)
  content = content.replace(
    /name: '(?:[^'\\]|\\.)*'/,
    `name: '${config.siteName.replace(/'/g, "\\'")}'`,
  );
  content = content.replace(
    /name: "(?:[^"\\]|\\.)*"/,
    `name: "${config.siteName.replace(/"/g, '\\"')}"`,
  );

  // Update site title (match single-quoted or double-quoted strings properly)
  content = content.replace(
    /title: '(?:[^'\\]|\\.)*'/,
    `title: "${config.siteTitle.replace(/"/g, '\\"')}"`,
  );
  content = content.replace(
    /title: "(?:[^"\\]|\\.)*"/,
    `title: "${config.siteTitle.replace(/"/g, '\\"')}"`,
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

  // Update fontFamily if specified
  if (config.fontFamily) {
    content = content.replace(
      /fontFamily: ['"](?:serif|sans|monospace)['"],\s*\/\/ Options: "serif", "sans", or "monospace"/,
      `fontFamily: "${config.fontFamily}", // Options: "serif", "sans", or "monospace"`,
    );
  }

  // Update homepage configuration if specified
  if (config.homepage) {
    content = content.replace(
      /type: ['"](?:default|page|post)['"],\s*\/\/ Options: "default" \(standard Home component\), "page" \(use a static page\), or "post" \(use a blog post\)/,
      `type: "${config.homepage.type}", // Options: "default" (standard Home component), "page" (use a static page), or "post" (use a blog post)`,
    );
    if (config.homepage.slug !== undefined) {
      content = content.replace(
        /slug: (?:undefined|['"].*?['"]),\s*\/\/ Required if type is "page" or "post" - the slug of the page\/post to use/,
        `slug: ${config.homepage.slug ? `"${config.homepage.slug}"` : "undefined"}, // Required if type is "page" or "post" - the slug of the page/post to use`,
      );
    }
    if (config.homepage.originalHomeRoute !== undefined) {
      content = content.replace(
        /originalHomeRoute: ['"].*?['"],\s*\/\/ Route to access the original homepage when custom homepage is set/,
        `originalHomeRoute: "${config.homepage.originalHomeRoute}", // Route to access the original homepage when custom homepage is set`,
      );
    }
  }

  // Update gitHubRepo config (for AI service raw URLs)
  // Support both new gitHubRepoConfig and legacy githubUsername/githubRepo fields
  const gitHubRepoOwner =
    config.gitHubRepoConfig?.owner || config.githubUsername;
  const gitHubRepoName =
    config.gitHubRepoConfig?.repo || config.githubRepo;
  const gitHubRepoBranch = config.gitHubRepoConfig?.branch || "main";
  const gitHubRepoContentPath =
    config.gitHubRepoConfig?.contentPath || "public/raw";

  content = content.replace(
    /owner: ['"].*?['"],\s*\/\/ GitHub username or organization/,
    `owner: "${gitHubRepoOwner}", // GitHub username or organization`,
  );
  content = content.replace(
    /repo: ['"].*?['"],\s*\/\/ Repository name/,
    `repo: "${gitHubRepoName}", // Repository name`,
  );
  content = content.replace(
    /branch: ['"].*?['"],\s*\/\/ Default branch/,
    `branch: "${gitHubRepoBranch}", // Default branch`,
  );
  content = content.replace(
    /contentPath: ['"].*?['"],\s*\/\/ Path to raw markdown files/,
    `contentPath: "${gitHubRepoContentPath}", // Path to raw markdown files`,
  );

  // Update socialFooter if specified
  if (config.socialFooter) {
    if (config.socialFooter.enabled !== undefined) {
      content = content.replace(
        /socialFooter: \{[\s\S]*?enabled: (?:true|false),\s*\/\/ Global toggle for social footer/,
        `socialFooter: {\n    enabled: ${config.socialFooter.enabled}, // Global toggle for social footer`,
      );
    }
    if (config.socialFooter.showOnHomepage !== undefined) {
      content = content.replace(
        /showOnHomepage: (?:true|false),\s*\/\/ Show social footer on homepage/,
        `showOnHomepage: ${config.socialFooter.showOnHomepage}, // Show social footer on homepage`,
      );
    }
    if (config.socialFooter.showOnPosts !== undefined) {
      content = content.replace(
        /showOnPosts: (?:true|false),\s*\/\/ Default: show social footer on blog posts/,
        `showOnPosts: ${config.socialFooter.showOnPosts}, // Default: show social footer on blog posts`,
      );
    }
    if (config.socialFooter.showOnPages !== undefined) {
      content = content.replace(
        /showOnPages: (?:true|false),\s*\/\/ Default: show social footer on static pages/,
        `showOnPages: ${config.socialFooter.showOnPages}, // Default: show social footer on static pages`,
      );
    }
    if (config.socialFooter.showOnBlogPage !== undefined) {
      content = content.replace(
        /showOnBlogPage: (?:true|false),\s*\/\/ Show social footer on \/blog page/,
        `showOnBlogPage: ${config.socialFooter.showOnBlogPage}, // Show social footer on /blog page`,
      );
    }
    if (config.socialFooter.showInHeader !== undefined) {
      content = content.replace(
        /showInHeader: (?:true|false),\s*\/\/ Show social icons in header/,
        `showInHeader: ${config.socialFooter.showInHeader}, // Show social icons in header`,
      );
    }
    if (config.socialFooter.copyright?.siteName) {
      content = content.replace(
        /siteName: ['"].*?['"],\s*\/\/ Update with your site\/company name/,
        `siteName: "${config.socialFooter.copyright.siteName}", // Update with your site/company name`,
      );
    }
    if (config.socialFooter.copyright?.showYear !== undefined) {
      content = content.replace(
        /showYear: (?:true|false),\s*\/\/ Auto-updates to current year/,
        `showYear: ${config.socialFooter.copyright.showYear}, // Auto-updates to current year`,
      );
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  log(`  Updated: src/config/siteConfig.ts`);
}

// Update Home.tsx
function updateHomeTsx(config: ForkConfig): void {
  log("\nUpdating src/pages/Home.tsx...");

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
  log("\nUpdating src/pages/Post.tsx...");

  updateFile("src/pages/Post.tsx", [
    // Match any existing SITE_URL value (https://...)
    {
      search: /const SITE_URL = "https:\/\/[^"]+";/,
      replace: `const SITE_URL = "${config.siteUrl}";`,
    },
    // Match any existing SITE_NAME value
    {
      search: /const SITE_NAME = "[^"]+";/,
      replace: `const SITE_NAME = "${config.siteName}";`,
    },
  ]);
}

// Update DocsPage.tsx
function updateDocsPageTsx(config: ForkConfig): void {
  log("\nUpdating src/pages/DocsPage.tsx...");

  updateFile("src/pages/DocsPage.tsx", [
    // Match any existing SITE_URL value (https://...)
    {
      search: /const SITE_URL = "https:\/\/[^"]+";/,
      replace: `const SITE_URL = "${config.siteUrl}";`,
    },
  ]);
}

// Update convex/http.ts
function updateConvexHttp(config: ForkConfig): void {
  log("\nUpdating convex/http.ts...");

  updateFile("convex/http.ts", [
    // Match any existing SITE_URL value with process.env fallback
    {
      search: /const SITE_URL = process\.env\.SITE_URL \|\| "https:\/\/[^"]+";/,
      replace: `const SITE_URL = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    // Match any existing SITE_NAME value (line 10)
    {
      search: /const SITE_NAME = "[^"]+";/,
      replace: `const SITE_NAME = "${config.siteName}";`,
    },
    // Match any existing siteUrl in generateMetaHtml function
    {
      search: /const siteUrl = process\.env\.SITE_URL \|\| "https:\/\/[^"]+";/,
      replace: `const siteUrl = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    // Match any existing siteName in generateMetaHtml function
    {
      search: /const siteName = "[^"]+";/,
      replace: `const siteName = "${config.siteName}";`,
    },
    // Update the description in API responses
    {
      search: /"An open-source publishing framework[^"]*"/g,
      replace: `"${config.siteDescription}"`,
    },
  ]);
}

// Update convex/rss.ts
function updateConvexRss(config: ForkConfig): void {
  log("\nUpdating convex/rss.ts...");

  updateFile("convex/rss.ts", [
    // Match any existing SITE_URL value with process.env fallback
    {
      search: /const SITE_URL = process\.env\.SITE_URL \|\| "https:\/\/[^"]+";/,
      replace: `const SITE_URL = process.env.SITE_URL || "${config.siteUrl}";`,
    },
    // Match any existing SITE_TITLE value
    {
      search: /const SITE_TITLE = "[^"]+";/,
      replace: `const SITE_TITLE = "${config.siteName}";`,
    },
    // Match any existing SITE_DESCRIPTION value (multiline)
    {
      search: /const SITE_DESCRIPTION =\s*"[^"]+";/,
      replace: `const SITE_DESCRIPTION =\n  "${config.siteDescription}";`,
    },
  ]);
}

// Update index.html
function updateIndexHtml(config: ForkConfig): void {
  log("\nUpdating index.html...");

  const replacements: Array<{ search: string | RegExp; replace: string }> = [
    // Meta description (match any content)
    {
      search: /<meta\s*name="description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      name="description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Meta author (match any content)
    {
      search: /<meta name="author" content="[^"]*" \/>/,
      replace: `<meta name="author" content="${config.siteName}" />`,
    },
    // Open Graph title (match any content)
    {
      search: /<meta property="og:title" content="[^"]*" \/>/,
      replace: `<meta property="og:title" content="${config.siteName}" />`,
    },
    // Open Graph description (match any content)
    {
      search: /<meta\s*property="og:description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      property="og:description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Open Graph URL (match any https URL)
    {
      search: /<meta property="og:url" content="https:\/\/[^"]*" \/>/,
      replace: `<meta property="og:url" content="${config.siteUrl}/" />`,
    },
    // Open Graph site name (match any content)
    {
      search: /<meta property="og:site_name" content="[^"]*"\s*\/>/,
      replace: `<meta property="og:site_name" content="${config.siteName}" />`,
    },
    // Open Graph site name with newline formatting
    {
      search: /<meta\s*property="og:site_name"\s*content="[^"]*"\s*>/,
      replace: `<meta\n      property="og:site_name"\n      content="${config.siteName}"\n    >`,
    },
    // Open Graph image (match any https URL)
    {
      search: /<meta\s*property="og:image"\s*content="https:\/\/[^"]*"\s*\/>/,
      replace: `<meta\n      property="og:image"\n      content="${config.siteUrl}/images/og-default.png"\n    />`,
    },
    // Twitter domain (match any domain)
    {
      search: /<meta property="twitter:domain" content="[^"]*" \/>/,
      replace: `<meta property="twitter:domain" content="${config.siteDomain}" />`,
    },
    // Twitter URL (match any https URL)
    {
      search: /<meta property="twitter:url" content="https:\/\/[^"]*" \/>/,
      replace: `<meta property="twitter:url" content="${config.siteUrl}/" />`,
    },
    // Twitter title (match any content)
    {
      search: /<meta name="twitter:title" content="[^"]*" \/>/,
      replace: `<meta name="twitter:title" content="${config.siteName}" />`,
    },
    // Twitter description (match any content)
    {
      search: /<meta\s*name="twitter:description"\s*content="[^"]*"\s*\/>/,
      replace: `<meta\n      name="twitter:description"\n      content="${config.siteDescription}"\n    />`,
    },
    // Twitter image (match any https URL)
    {
      search: /<meta\s*name="twitter:image"\s*content="https:\/\/[^"]*"\s*\/>/,
      replace: `<meta\n      name="twitter:image"\n      content="${config.siteUrl}/images/og-default.png"\n    />`,
    },
    // JSON-LD name (match any value)
    {
      search: /"name": "[^"]+",\s*\n\s*"url":/g,
      replace: `"name": "${config.siteName}",\n        "url":`,
    },
    // JSON-LD URL (match any https URL)
    {
      search: /"url": "https:\/\/[^"]+"/g,
      replace: `"url": "${config.siteUrl}"`,
    },
    // JSON-LD description (match any content)
    {
      search: /"description": "[^"]+"/,
      replace: `"description": "${config.siteDescription}"`,
    },
    // JSON-LD search target (match any URL)
    {
      search: /"target": "https:\/\/[^"]+\/\?q=\{search_term_string\}"/,
      replace: `"target": "${config.siteUrl}/?q={search_term_string}"`,
    },
    // Page title (match any title content)
    {
      search: /<title>[^<]+<\/title>/,
      replace: `<title>${config.siteTitle}</title>`,
    },
  ];

  updateFile("index.html", replacements);
}

// Update public/llms.txt
function updateLlmsTxt(config: ForkConfig): void {
  log("\nUpdating public/llms.txt...");

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
  log(`  Updated: public/llms.txt`);
}

// Update public/robots.txt
function updateRobotsTxt(config: ForkConfig): void {
  log("\nUpdating public/robots.txt...");

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
  log(`  Updated: public/robots.txt`);
}

// Update public/openapi.yaml
function updateOpenApiYaml(config: ForkConfig): void {
  log("\nUpdating public/openapi.yaml...");

  const githubUrl = `https://github.com/${config.githubUsername}/${config.githubRepo}`;
  // Extract domain from siteUrl for example URLs (without www. if present)
  const siteUrlForExamples = config.siteUrl.replace(/^https?:\/\/(www\.)?/, "https://");

  updateFile("public/openapi.yaml", [
    // Match any title ending with API
    {
      search: /title: .+ API/,
      replace: `title: ${config.siteName} API`,
    },
    // Match any GitHub contact URL
    {
      search: /url: https:\/\/github\.com\/[^\/]+\/[^\s]+/,
      replace: `url: ${githubUrl}`,
    },
    // Match any server URL (production server line)
    {
      search: /- url: https:\/\/[^\s]+\n\s+description: Production server/,
      replace: `- url: ${config.siteUrl}\n    description: Production server`,
    },
    // Match site name example in schema (line 31)
    {
      search: /example: markdown sync framework/,
      replace: `example: ${config.siteName}`,
    },
    // Match site URL example in schema (line 34)
    {
      search: /example: https:\/\/markdown\.fast\n(\s+)posts:/,
      replace: `example: ${siteUrlForExamples}\n$1posts:`,
    },
    // Match post URL example (line 167)
    {
      search: /example: https:\/\/markdown\.fast\/how-to-build-blog/,
      replace: `example: ${siteUrlForExamples}/how-to-build-blog`,
    },
    // Match markdown URL example (line 170)
    {
      search: /example: https:\/\/markdown\.fast\/api\/post\?slug=how-to-build-blog/,
      replace: `example: ${siteUrlForExamples}/api/post?slug=how-to-build-blog`,
    },
    // Match any remaining markdown.fast URLs
    {
      search: /https:\/\/(www\.)?markdown\.fast/g,
      replace: siteUrlForExamples,
    },
  ]);
}

// Update public/.well-known/ai-plugin.json
function updateAiPluginJson(config: ForkConfig): void {
  log("\nUpdating public/.well-known/ai-plugin.json...");

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
  log(`  Updated: public/.well-known/ai-plugin.json`);
}

// Update default theme in siteConfig.ts
function updateThemeConfig(config: ForkConfig): void {
  if (!config.theme) return;

  log("\nUpdating default theme in src/config/siteConfig.ts...");

  updateFile("src/config/siteConfig.ts", [
    {
      search: /defaultTheme: "(?:dark|light|tan|cloud)"/,
      replace: `defaultTheme: "${config.theme}"`,
    },
  ]);
}

// Update netlify/edge-functions/mcp.ts
function updateMcpEdgeFunction(config: ForkConfig): void {
  log("\nUpdating netlify/edge-functions/mcp.ts...");

  updateFile("netlify/edge-functions/mcp.ts", [
    // Match any existing SITE_URL constant
    {
      search: /const SITE_URL = "https:\/\/[^"]+";/,
      replace: `const SITE_URL = "${config.siteUrl}";`,
    },
    // Match any existing SITE_NAME constant
    {
      search: /const SITE_NAME = "[^"]+";/,
      replace: `const SITE_NAME = "${config.siteName}";`,
    },
    // Match any existing MCP_SERVER_NAME constant (create from site name)
    {
      search: /const MCP_SERVER_NAME = "[^"]+";/,
      replace: `const MCP_SERVER_NAME = "${config.siteName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-mcp";`,
    },
  ]);
}

// Update scripts/send-newsletter.ts
function updateSendNewsletter(config: ForkConfig): void {
  log("\nUpdating scripts/send-newsletter.ts...");

  updateFile("scripts/send-newsletter.ts", [
    // Match any existing SITE_URL fallback in comment
    {
      search: /\*   - SITE_URL: Your site URL \(default: https:\/\/[^)]+\)/,
      replace: `*   - SITE_URL: Your site URL (default: ${config.siteUrl})`,
    },
    // Match any existing SITE_URL fallback in code
    {
      search: /const siteUrl = process\.env\.SITE_URL \|\| "https:\/\/[^"]+";/,
      replace: `const siteUrl = process.env.SITE_URL || "${config.siteUrl}";`,
    },
  ]);
}

// Main function
function main(): void {
  log("Fork Configuration Script");
  log("=========================\n");

  // Read configuration
  const config = readConfig();
  log(`Configuring site: ${config.siteName}`);
  log(`URL: ${config.siteUrl}`);

  // Apply updates to all files
  updateSiteConfig(config);
  updateHomeTsx(config);
  updatePostTsx(config);
  updateDocsPageTsx(config);
  updateConvexHttp(config);
  updateConvexRss(config);
  updateIndexHtml(config);
  updateLlmsTxt(config);
  updateRobotsTxt(config);
  updateOpenApiYaml(config);
  updateAiPluginJson(config);
  updateThemeConfig(config);
  updateMcpEdgeFunction(config);
  updateSendNewsletter(config);

  log("\n=========================");
  log("Configuration complete!");
  log("\nNext steps:");
  log("1. Review the changes with: git diff");
  log("2. Run: npx convex dev (if not already running)");
  log("3. Run: npm run sync (to sync content to development)");
  log("4. Run: npm run dev (to start the dev server)");
  log("5. Deploy to Netlify when ready");
}

main();

