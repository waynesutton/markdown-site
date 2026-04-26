#!/usr/bin/env npx tsx
/**
 * Discovery Files Sync Script
 *
 * Reads fork-config.json (if available), siteConfig.ts, and Convex data to update discovery files.
 * Run with: npm run sync:discovery (dev) or npm run sync:discovery:prod (prod)
 *
 * This script updates:
 * - AGENTS.md (project overview and current status sections)
 * - CLAUDE.md (current status section for Claude Code)
 * - public/llms.txt (site info, API endpoints, GitHub links)
 *
 * IMPORTANT: If fork-config.json exists, it will be used as the source of truth.
 * This ensures that after running `npm run configure`, subsequent sync:discovery
 * commands will use your configured values.
 */

import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables based on SYNC_ENV
const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  dotenv.config({ path: ".env.production.local" });
  console.log("Syncing discovery files for PRODUCTION...\n");
} else {
  dotenv.config({ path: ".env.local" });
  console.log("Syncing discovery files for DEVELOPMENT...\n");
}
dotenv.config();

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const ROOT_DIR = PROJECT_ROOT;

// Fork config interface (matches fork-config.json structure)
interface ForkConfig {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  siteDomain: string;
  githubUsername: string;
  githubRepo: string;
  contactEmail?: string;
  bio?: string;
  gitHubRepoConfig?: {
    owner: string;
    repo: string;
    branch: string;
    contentPath: string;
  };
}

// Load fork-config.json if it exists
function loadForkConfig(): ForkConfig | null {
  try {
    const configPath = path.join(PROJECT_ROOT, "fork-config.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(content) as ForkConfig;
      console.log("Using configuration from fork-config.json");
      return config;
    }
  } catch (error) {
    console.warn("Could not load fork-config.json, falling back to siteConfig.ts");
  }
  return null;
}

// Site config data structure
interface SiteConfigData {
  name: string;
  title: string;
  bio: string;
  description?: string;
  siteUrl?: string;  // Added to pass URL from fork-config.json
  gitHubRepo?: {
    owner: string;
    repo: string;
    branch: string;
    contentPath: string;
  };
}

// Cached fork config
let cachedForkConfig: ForkConfig | null | undefined = undefined;

// Get fork config (cached)
function getForkConfig(): ForkConfig | null {
  if (cachedForkConfig === undefined) {
    cachedForkConfig = loadForkConfig();
  }
  return cachedForkConfig;
}

// Load site config - prioritizes fork-config.json over siteConfig.ts
function loadSiteConfig(): SiteConfigData {
  // First try fork-config.json
  const forkConfig = getForkConfig();
  if (forkConfig) {
    return {
      name: forkConfig.siteName,
      title: forkConfig.siteTitle,
      bio: forkConfig.bio || forkConfig.siteDescription,
      description: forkConfig.siteDescription,
      siteUrl: forkConfig.siteUrl,
      gitHubRepo: forkConfig.gitHubRepoConfig || {
        owner: forkConfig.githubUsername,
        repo: forkConfig.githubRepo,
        branch: "main",
        contentPath: "public/raw",
      },
    };
  }

  // Fall back to siteConfig.ts
  console.log("No fork-config.json found, reading from siteConfig.ts");
  try {
    const configPath = path.join(
      PROJECT_ROOT,
      "src",
      "config",
      "siteConfig.ts",
    );
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");

      // Extract config values using regex
      const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
      const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      const bioMatch =
        content.match(/bio:\s*`([^`]+)`/) ||
        content.match(/bio:\s*['"]([^'"]+)['"]/);

      // Extract GitHub repo config
      const gitHubOwnerMatch = content.match(
        /owner:\s*['"]([^'"]+)['"],\s*\/\/ GitHub username or organization/,
      );
      const gitHubRepoMatch = content.match(
        /repo:\s*['"]([^'"]+)['"],\s*\/\/ Repository name/,
      );
      const gitHubBranchMatch = content.match(
        /branch:\s*['"]([^'"]+)['"],\s*\/\/ Default branch/,
      );
      const gitHubContentPathMatch = content.match(
        /contentPath:\s*['"]([^'"]+)['"],\s*\/\/ Path to raw markdown files/,
      );

      const gitHubRepo =
        gitHubOwnerMatch &&
        gitHubRepoMatch &&
        gitHubBranchMatch &&
        gitHubContentPathMatch
          ? {
              owner: gitHubOwnerMatch[1],
              repo: gitHubRepoMatch[1],
              branch: gitHubBranchMatch[1],
              contentPath: gitHubContentPathMatch[1],
            }
          : undefined;

      return {
        name: nameMatch?.[1] || "Your Site Name",
        title: titleMatch?.[1] || "Your Site Title",
        bio:
          bioMatch?.[1] ||
          "Your site description here.",
        description:
          bioMatch?.[1] ||
          "Your site description here.",
        gitHubRepo,
      };
    }
  } catch (error) {
    console.warn("Could not load siteConfig.ts, using defaults");
  }

  return {
    name: "Your Site Name",
    title: "Your Site Title",
    bio: "Your site description here.",
    description: "Your site description here.",
  };
}

// Get site URL from fork-config.json, environment, or siteConfig
function getSiteUrl(siteConfig?: SiteConfigData): string {
  // 1. Check fork-config.json (via siteConfig)
  if (siteConfig?.siteUrl) {
    return siteConfig.siteUrl;
  }
  // 2. Check fork-config.json directly
  const forkConfig = getForkConfig();
  if (forkConfig?.siteUrl) {
    return forkConfig.siteUrl;
  }
  // 3. Check environment variables
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  if (process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL;
  }
  // 4. Return placeholder (user should configure)
  return "https://yoursite.example.com";
}

// Build GitHub URL from repo config or fork-config.json
function getGitHubUrl(siteConfig: SiteConfigData): string {
  if (siteConfig.gitHubRepo) {
    return `https://github.com/${siteConfig.gitHubRepo.owner}/${siteConfig.gitHubRepo.repo}`;
  }
  // Check fork-config.json directly
  const forkConfig = getForkConfig();
  if (forkConfig) {
    return `https://github.com/${forkConfig.githubUsername}/${forkConfig.githubRepo}`;
  }
  // Check environment variable
  if (process.env.GITHUB_REPO_URL) {
    return process.env.GITHUB_REPO_URL;
  }
  // Return placeholder
  return "https://github.com/yourusername/your-repo";
}

// Update CLAUDE.md with current status
function updateClaudeMd(
  content: string,
  siteConfig: SiteConfigData,
  _siteUrl: string,
  postCount: number,
  pageCount: number,
  _latestPostDate?: string,
): string {
  // Build status comment to insert after "## Project context"
  const statusComment = `<!-- Auto-updated by sync:discovery -->
<!-- Site: ${siteConfig.name} | Posts: ${postCount} | Pages: ${pageCount} | Updated: ${new Date().toISOString()} -->`;

  // Check if status comment exists
  const commentRegex = /<!-- Auto-updated by sync:discovery -->[\s\S]*?<!-- Site:.*?-->/;
  if (content.match(commentRegex)) {
    // Replace existing comment
    content = content.replace(commentRegex, statusComment);
  } else {
    // Insert after "## Project context" line
    const contextIndex = content.indexOf("## Project context");
    if (contextIndex > -1) {
      const nextLineIndex = content.indexOf("\n", contextIndex);
      if (nextLineIndex > -1) {
        content =
          content.slice(0, nextLineIndex + 1) +
          "\n" +
          statusComment +
          "\n" +
          content.slice(nextLineIndex + 1);
      }
    }
  }

  return content;
}

// Update AGENTS.md with app-specific data
function updateAgentsMd(
  content: string,
  siteConfig: SiteConfigData,
  siteUrl: string,
  postCount: number,
  pageCount: number,
  latestPostDate?: string,
  wikiPages?: Array<{ slug: string; title: string; pageType: string; category?: string }>,
): string {
  const wikiCount = wikiPages?.length ?? 0;

  // Update Project overview section
  const projectOverviewRegex = /## Project overview\n\n([^\n]+)/;
  const newOverview = `## Project overview\n\n${siteConfig.description || siteConfig.bio}. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.`;

  content = content.replace(projectOverviewRegex, newOverview);

  // Build Current Status section
  const statusSection = `\n## Current Status\n\n- **Site Name**: ${siteConfig.name}\n- **Site Title**: ${siteConfig.title}\n- **Site URL**: ${siteUrl}\n- **Total Posts**: ${postCount}\n- **Total Pages**: ${pageCount}\n- **Wiki Pages**: ${wikiCount}${latestPostDate ? `\n- **Latest Post**: ${latestPostDate}` : ""}\n- **Last Updated**: ${new Date().toISOString()}\n`;

  // Check if Current Status section exists
  if (content.includes("## Current Status")) {
    // Replace existing Current Status section
    const statusRegex = /## Current Status\n\n([\s\S]*?)(?=\n## |$)/;
    content = content.replace(statusRegex, statusSection.trim() + "\n");
  } else {
    // Insert after Project overview (find the next ## section)
    const overviewIndex = content.indexOf("## Project overview");
    if (overviewIndex > -1) {
      // Find the next ## after Project overview
      const afterOverview = content.indexOf("\n## ", overviewIndex + 20);
      if (afterOverview > -1) {
        content =
          content.slice(0, afterOverview) +
          statusSection +
          content.slice(afterOverview);
      } else {
        content = content + statusSection;
      }
    }
  }

  // Build and insert/replace Wiki Pages section
  if (wikiPages && wikiPages.length > 0) {
    const grouped: Record<string, Array<{ slug: string; title: string }>> = {};
    for (const page of wikiPages) {
      const key = page.category || page.pageType || "general";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ slug: page.slug, title: page.title });
    }

    let wikiSection = `## Wiki knowledge base\n\n${wikiCount} compiled wiki pages. Access via VFS:\n\n\`\`\`bash\ncurl -X POST ${siteUrl}/vfs/exec -H "Content-Type: application/json" -d '{"command": "ls /wiki"}'\n\`\`\`\n\n`;
    for (const [category, pages] of Object.entries(grouped)) {
      wikiSection += `**${category}:**\n`;
      for (const page of pages) {
        wikiSection += `- ${page.title} (\`/wiki/${page.slug}\`)\n`;
      }
      wikiSection += "\n";
    }

    // Replace existing section or insert before "## Content import" or at end
    if (content.includes("## Wiki knowledge base")) {
      const wikiRegex = /## Wiki knowledge base\n\n([\s\S]*?)(?=\n## |$)/;
      content = content.replace(wikiRegex, wikiSection.trim() + "\n");
    } else {
      // Insert before "## Content import" if it exists, otherwise before "## Environment files"
      const insertBefore = content.indexOf("## Content import") > -1
        ? content.indexOf("## Content import")
        : content.indexOf("## Environment files") > -1
          ? content.indexOf("## Environment files")
          : content.length;
      content =
        content.slice(0, insertBefore) +
        "\n" + wikiSection +
        content.slice(insertBefore);
    }
  }

  return content;
}

// Generate llms.txt content
function generateLlmsTxt(
  siteConfig: SiteConfigData,
  siteUrl: string,
  postCount: number,
  latestPostDate?: string,
  wikiPages?: Array<{ slug: string; title: string; pageType: string; category?: string }>,
): string {
  const githubUrl = getGitHubUrl(siteConfig);
  const wikiCount = wikiPages?.length ?? 0;

  // Build wiki section if pages exist
  let wikiSection = "";
  if (wikiPages && wikiPages.length > 0) {
    const grouped: Record<string, Array<{ slug: string; title: string }>> = {};
    for (const page of wikiPages) {
      const key = page.category || page.pageType || "general";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ slug: page.slug, title: page.title });
    }

    wikiSection = `\n# Wiki Knowledge Base (${wikiCount} pages)\n\nCompiled knowledge base with interlinked wiki pages.\nAccess via: /vfs/exec with {"command": "cat /wiki/{slug}.md"}\n`;

    for (const [category, pages] of Object.entries(grouped)) {
      wikiSection += `\n## ${category}\n`;
      for (const page of pages) {
        wikiSection += `- ${page.title} (/wiki/${page.slug})\n`;
      }
    }
  }

  return `# llms.txt - Information for AI assistants and LLMs
# Learn more: https://llmstxt.org/
# Last updated: ${new Date().toISOString()}

> ${siteConfig.description || siteConfig.bio}

# Site Information
- Name: ${siteConfig.name}
- URL: ${siteUrl}
- Description: ${siteConfig.description || siteConfig.bio} Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.
- Topics: Markdown, Convex, React, TypeScript, Netlify, Open Source, AI, LLM, AEO, GEO
- Total Posts: ${postCount}
- Wiki Pages: ${wikiCount}
${latestPostDate ? `- Latest Post: ${latestPostDate}\n` : ""}- GitHub: ${githubUrl}

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

## Virtual Filesystem
GET /vfs/tree
Returns JSON tree of all content paths (blog, pages, docs, sources, wiki).

POST /vfs/exec
Execute shell-like commands against all site content.
Send JSON body: {"command": "ls /blog"} or {"command": "grep convex /blog"}
Supported commands: ls, cat, grep, find, tree, head, wc, pwd, cd

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
4. Use /vfs/tree to browse the full content tree
5. Use /vfs/exec with shell commands to search and read specific content
${wikiSection}
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

# Discovery Files
- /llms.txt - This file (LLM discovery)
- /AGENTS.md - AI agent instructions and codebase overview

# Links
- GitHub: ${githubUrl}
- Convex: https://convex.dev
- Netlify: https://netlify.com
`;
}

// Main sync function
async function syncDiscoveryFiles() {
  console.log("Starting discovery files sync...\n");

  // Get Convex URL from environment
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error(
      "Error: VITE_CONVEX_URL or CONVEX_URL environment variable is not set",
    );
    process.exit(1);
  }

  // Initialize Convex client
  const client = new ConvexHttpClient(convexUrl);

  // Load site configuration (uses fork-config.json if available)
  const siteConfig = loadSiteConfig();
  const siteUrl = getSiteUrl(siteConfig);

  console.log(`Site: ${siteConfig.name}`);
  console.log(`Title: ${siteConfig.title}`);
  console.log(`URL: ${siteUrl}`);
  if (siteConfig.gitHubRepo) {
    console.log(`GitHub: ${getGitHubUrl(siteConfig)}`);
  }
  console.log();

  // Query Convex for content statistics
  let postCount = 0;
  let pageCount = 0;
  let latestPostDate: string | undefined;

  let wikiPages: Array<{ slug: string; title: string; pageType: string; category?: string }> = [];

  try {
    const [posts, pages] = await Promise.all([
      client.query(api.posts.getAllPosts),
      client.query(api.pages.getAllPages),
    ]);

    postCount = posts.length;
    pageCount = pages.length;

    if (posts.length > 0) {
      // Sort by date descending to get latest
      const sortedPosts = [...posts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      latestPostDate = sortedPosts[0].date;
    }

    // Fetch wiki pages for discovery files
    try {
      const wikiResult = await client.query(api.wiki.listWikiPages, {});
      wikiPages = wikiResult.map((p) => ({
        slug: p.slug,
        title: p.title,
        pageType: p.pageType,
        category: p.category,
      }));
    } catch {
      console.warn("Could not fetch wiki pages (wiki may not be compiled yet)");
    }

    console.log(`Found ${postCount} published posts`);
    console.log(`Found ${pageCount} published pages`);
    console.log(`Found ${wikiPages.length} wiki pages`);
    if (latestPostDate) {
      console.log(`Latest post: ${latestPostDate}`);
    }
    console.log();
  } catch (error) {
    console.warn("Could not fetch content from Convex, using defaults");
    console.warn("Error:", error);
  }

  // Read existing AGENTS.md
  const agentsPath = path.join(ROOT_DIR, "AGENTS.md");
  let agentsContent = "";

  if (fs.existsSync(agentsPath)) {
    agentsContent = fs.readFileSync(agentsPath, "utf-8");
    console.log("Read existing AGENTS.md");
  } else {
    console.warn("AGENTS.md not found, creating minimal template...");
    agentsContent =
      "# AGENTS.md\n\nInstructions for AI coding agents working on this codebase.\n\n## Project overview\n\nAn open-source publishing framework.\n";
  }

  // Update AGENTS.md with app-specific data (including wiki pages)
  console.log("Updating AGENTS.md with current app data...");
  const updatedAgentsContent = updateAgentsMd(
    agentsContent,
    siteConfig,
    siteUrl,
    postCount,
    pageCount,
    latestPostDate,
    wikiPages,
  );
  fs.writeFileSync(agentsPath, updatedAgentsContent, "utf-8");
  console.log(`  Updated: ${agentsPath}`);

  // Copy AGENTS.md to public/ so it's web-accessible at /AGENTS.md
  const publicAgentsPath = path.join(PUBLIC_DIR, "AGENTS.md");
  fs.writeFileSync(publicAgentsPath, updatedAgentsContent, "utf-8");
  console.log(`  Copied:  ${publicAgentsPath}`);

  // Read and update CLAUDE.md
  const claudePath = path.join(ROOT_DIR, "CLAUDE.md");
  if (fs.existsSync(claudePath)) {
    console.log("Updating CLAUDE.md with current status...");
    const claudeContent = fs.readFileSync(claudePath, "utf-8");
    const updatedClaudeContent = updateClaudeMd(
      claudeContent,
      siteConfig,
      siteUrl,
      postCount,
      pageCount,
      latestPostDate,
    );
    fs.writeFileSync(claudePath, updatedClaudeContent, "utf-8");
    console.log(`  Updated: ${claudePath}`);
  }

  // Generate llms.txt (including wiki pages)
  console.log("\nGenerating llms.txt...");
  const llmsContent = generateLlmsTxt(
    siteConfig,
    siteUrl,
    postCount,
    latestPostDate,
    wikiPages,
  );
  const llmsPath = path.join(PUBLIC_DIR, "llms.txt");
  fs.writeFileSync(llmsPath, llmsContent, "utf-8");
  console.log(`  Updated: ${llmsPath}`);

  console.log("\nDiscovery files sync complete!");
  console.log(`  Updated AGENTS.md with app-specific context (${wikiPages.length} wiki pages)`);
  console.log(`  Copied AGENTS.md to public/ for web access`);
  console.log(`  Updated CLAUDE.md with current status`);
  console.log(`  Updated llms.txt with ${postCount} posts and ${wikiPages.length} wiki pages`);
}

// Run the sync
syncDiscoveryFiles().catch((error) => {
  console.error("Error syncing discovery files:", error);
  process.exit(1);
});
