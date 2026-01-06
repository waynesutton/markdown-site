import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables based on SYNC_ENV
const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  // Production: load .env.production.local first
  dotenv.config({ path: ".env.production.local" });
  console.log("Syncing to PRODUCTION deployment...\n");
} else {
  // Development: load .env.local
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const RAW_OUTPUT_DIR = path.join(process.cwd(), "public", "raw");

interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
  published: boolean;
  tags: string[];
  readTime?: string;
  image?: string; // Header/OG image URL
  showImageAtTop?: boolean; // Display image at top of post (default: false)
  excerpt?: string; // Short excerpt for card view
  featured?: boolean; // Show in featured section
  featuredOrder?: number; // Order in featured section (lower = first)
  authorName?: string; // Author display name
  authorImage?: string; // Author avatar image URL (round)
  layout?: string; // Layout type: "sidebar" for docs-style layout
  rightSidebar?: boolean; // Enable right sidebar with CopyPageDropdown (default: true when siteConfig.rightSidebar.enabled)
  showFooter?: boolean; // Show footer on this post (overrides siteConfig default)
  footer?: string; // Footer markdown content (overrides siteConfig defaultContent)
  showSocialFooter?: boolean; // Show social footer on this post (overrides siteConfig default)
  aiChat?: boolean; // Enable AI chat in right sidebar (requires rightSidebar: true)
  blogFeatured?: boolean; // Show as hero featured post on /blog page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  contactForm?: boolean; // Enable contact form on this post
  docsSection?: boolean; // Include in docs navigation
  docsSectionGroup?: string; // Sidebar group name in docs
  docsSectionOrder?: number; // Order within group (lower = first)
  docsSectionGroupOrder?: number; // Order of group itself (lower = first)
  docsSectionGroupIcon?: string; // Phosphor icon name for sidebar group
  docsLanding?: boolean; // Use as /docs landing page
}

interface ParsedPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  published: boolean;
  tags: string[];
  readTime?: string;
  image?: string; // Header/OG image URL
  showImageAtTop?: boolean; // Display image at top of post (default: false)
  excerpt?: string; // Short excerpt for card view
  featured?: boolean; // Show in featured section
  featuredOrder?: number; // Order in featured section (lower = first)
  authorName?: string; // Author display name
  authorImage?: string; // Author avatar image URL (round)
  layout?: string; // Layout type: "sidebar" for docs-style layout
  rightSidebar?: boolean; // Enable right sidebar with CopyPageDropdown (default: true when siteConfig.rightSidebar.enabled)
  showFooter?: boolean; // Show footer on this post (overrides siteConfig default)
  footer?: string; // Footer markdown content (overrides siteConfig defaultContent)
  showSocialFooter?: boolean; // Show social footer on this post (overrides siteConfig default)
  aiChat?: boolean; // Enable AI chat in right sidebar (requires rightSidebar: true)
  blogFeatured?: boolean; // Show as hero featured post on /blog page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  contactForm?: boolean; // Enable contact form on this post
  unlisted?: boolean; // Hide from listings but allow direct access via slug
  docsSection?: boolean; // Include in docs navigation
  docsSectionGroup?: string; // Sidebar group name in docs
  docsSectionOrder?: number; // Order within group (lower = first)
  docsSectionGroupOrder?: number; // Order of group itself (lower = first)
  docsSectionGroupIcon?: string; // Phosphor icon name for sidebar group
  docsLanding?: boolean; // Use as /docs landing page
}

// Page frontmatter (for static pages like About, Projects, Contact)
interface PageFrontmatter {
  title: string;
  slug: string;
  published: boolean;
  order?: number; // Display order in navigation
  showInNav?: boolean; // Show in navigation menu (default: true)
  excerpt?: string; // Short excerpt for card view
  image?: string; // Thumbnail/OG image URL for featured cards
  showImageAtTop?: boolean; // Display image at top of page (default: false)
  featured?: boolean; // Show in featured section
  featuredOrder?: number; // Order in featured section (lower = first)
  authorName?: string; // Author display name
  authorImage?: string; // Author avatar image URL (round)
  layout?: string; // Layout type: "sidebar" for docs-style layout
  rightSidebar?: boolean; // Enable right sidebar with CopyPageDropdown (default: true when siteConfig.rightSidebar.enabled)
  showFooter?: boolean; // Show footer on this page (overrides siteConfig default)
  footer?: string; // Footer markdown content (overrides siteConfig defaultContent)
  showSocialFooter?: boolean; // Show social footer on this page (overrides siteConfig default)
  aiChat?: boolean; // Enable AI chat in right sidebar (requires rightSidebar: true)
  contactForm?: boolean; // Enable contact form on this page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  textAlign?: string; // Text alignment: "left", "center", "right" (default: "left")
  docsSection?: boolean; // Include in docs navigation
  docsSectionGroup?: string; // Sidebar group name in docs
  docsSectionOrder?: number; // Order within group (lower = first)
  docsSectionGroupOrder?: number; // Order of group itself (lower = first)
  docsSectionGroupIcon?: string; // Phosphor icon name for sidebar group
  docsLanding?: boolean; // Use as /docs landing page
}

interface ParsedPage {
  slug: string;
  title: string;
  content: string;
  published: boolean;
  order?: number;
  showInNav?: boolean; // Show in navigation menu (default: true)
  excerpt?: string; // Short excerpt for card view
  image?: string; // Thumbnail/OG image URL for featured cards
  showImageAtTop?: boolean; // Display image at top of page (default: false)
  featured?: boolean; // Show in featured section
  featuredOrder?: number; // Order in featured section (lower = first)
  authorName?: string; // Author display name
  authorImage?: string; // Author avatar image URL (round)
  layout?: string; // Layout type: "sidebar" for docs-style layout
  rightSidebar?: boolean; // Enable right sidebar with CopyPageDropdown (default: true when siteConfig.rightSidebar.enabled)
  showFooter?: boolean; // Show footer on this page (overrides siteConfig default)
  footer?: string; // Footer markdown content (overrides siteConfig defaultContent)
  showSocialFooter?: boolean; // Show social footer on this page (overrides siteConfig default)
  aiChat?: boolean; // Enable AI chat in right sidebar (requires rightSidebar: true)
  contactForm?: boolean; // Enable contact form on this page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  textAlign?: string; // Text alignment: "left", "center", "right" (default: "left")
  docsSection?: boolean; // Include in docs navigation
  docsSectionGroup?: string; // Sidebar group name in docs
  docsSectionOrder?: number; // Order within group (lower = first)
  docsSectionGroupOrder?: number; // Order of group itself (lower = first)
  docsSectionGroupIcon?: string; // Phosphor icon name for sidebar group
  docsLanding?: boolean; // Use as /docs landing page
}

// Calculate reading time based on word count
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Parse a single markdown file
function parseMarkdownFile(filePath: string): ParsedPost | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as Partial<PostFrontmatter>;

    // Validate required fields
    if (!frontmatter.title || !frontmatter.date || !frontmatter.slug) {
      console.warn(`Skipping ${filePath}: missing required frontmatter fields`);
      return null;
    }

    return {
      slug: frontmatter.slug,
      title: frontmatter.title,
      description: frontmatter.description || "",
      content: content.trim(),
      date: frontmatter.date,
      published: frontmatter.published ?? true,
      tags: frontmatter.tags || [],
      readTime: frontmatter.readTime || calculateReadTime(content),
      image: frontmatter.image, // Header/OG image URL
      showImageAtTop: frontmatter.showImageAtTop, // Display image at top of post
      excerpt: frontmatter.excerpt, // Short excerpt for card view
      featured: frontmatter.featured, // Show in featured section
      featuredOrder: frontmatter.featuredOrder, // Order in featured section
      authorName: frontmatter.authorName, // Author display name
      authorImage: frontmatter.authorImage, // Author avatar image URL
      layout: frontmatter.layout, // Layout type: "sidebar" for docs-style layout
      rightSidebar: frontmatter.rightSidebar, // Enable right sidebar with CopyPageDropdown
      showFooter: frontmatter.showFooter, // Show footer on this post
      footer: frontmatter.footer, // Footer markdown content
      showSocialFooter: frontmatter.showSocialFooter, // Show social footer on this post
      aiChat: frontmatter.aiChat, // Enable AI chat in right sidebar
      blogFeatured: frontmatter.blogFeatured, // Show as hero featured post on /blog page
      newsletter: frontmatter.newsletter, // Override newsletter signup display
      contactForm: frontmatter.contactForm, // Enable contact form on this post
      unlisted: frontmatter.unlisted, // Hide from listings but allow direct access
      docsSection: frontmatter.docsSection, // Include in docs navigation
      docsSectionGroup: frontmatter.docsSectionGroup, // Sidebar group name
      docsSectionOrder: frontmatter.docsSectionOrder, // Order within group
      docsSectionGroupOrder: frontmatter.docsSectionGroupOrder, // Order of group itself
      docsSectionGroupIcon: frontmatter.docsSectionGroupIcon, // Phosphor icon name for sidebar group
      docsLanding: frontmatter.docsLanding, // Use as docs landing page
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// Get all markdown files from the content directory
function getAllMarkdownFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`Creating content directory: ${CONTENT_DIR}`);
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(CONTENT_DIR, file));
}

// Parse a single page markdown file
function parsePageFile(filePath: string): ParsedPage | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as Partial<PageFrontmatter>;

    // Validate required fields
    if (!frontmatter.title || !frontmatter.slug) {
      console.warn(
        `Skipping page ${filePath}: missing required frontmatter fields`,
      );
      return null;
    }

    return {
      slug: frontmatter.slug,
      title: frontmatter.title,
      content: content.trim(),
      published: frontmatter.published ?? true,
      order: frontmatter.order,
      showInNav: frontmatter.showInNav, // Show in navigation menu (default: true)
      excerpt: frontmatter.excerpt, // Short excerpt for card view
      image: frontmatter.image, // Thumbnail/OG image URL for featured cards
      showImageAtTop: frontmatter.showImageAtTop, // Display image at top of page
      featured: frontmatter.featured, // Show in featured section
      featuredOrder: frontmatter.featuredOrder, // Order in featured section
      authorName: frontmatter.authorName, // Author display name
      authorImage: frontmatter.authorImage, // Author avatar image URL
      layout: frontmatter.layout, // Layout type: "sidebar" for docs-style layout
      rightSidebar: frontmatter.rightSidebar, // Enable right sidebar with CopyPageDropdown
      showFooter: frontmatter.showFooter, // Show footer on this page
      footer: frontmatter.footer, // Footer markdown content
      showSocialFooter: frontmatter.showSocialFooter, // Show social footer on this page
      aiChat: frontmatter.aiChat, // Enable AI chat in right sidebar
      contactForm: frontmatter.contactForm, // Enable contact form on this page
      newsletter: frontmatter.newsletter, // Override newsletter signup display
      textAlign: frontmatter.textAlign, // Text alignment: "left", "center", "right"
      docsSection: frontmatter.docsSection, // Include in docs navigation
      docsSectionGroup: frontmatter.docsSectionGroup, // Sidebar group name
      docsSectionOrder: frontmatter.docsSectionOrder, // Order within group
      docsSectionGroupOrder: frontmatter.docsSectionGroupOrder, // Order of group itself
      docsSectionGroupIcon: frontmatter.docsSectionGroupIcon, // Phosphor icon name for sidebar group
      docsLanding: frontmatter.docsLanding, // Use as docs landing page
    };
  } catch (error) {
    console.error(`Error parsing page ${filePath}:`, error);
    return null;
  }
}

// Get all page markdown files from the pages directory
function getAllPageFiles(): string[] {
  if (!fs.existsSync(PAGES_DIR)) {
    // Pages directory is optional, don't create it automatically
    return [];
  }

  const files = fs.readdirSync(PAGES_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(PAGES_DIR, file));
}

// Main sync function
async function syncPosts() {
  console.log("Starting post sync...\n");

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

  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  if (markdownFiles.length === 0) {
    console.log("No markdown files found. Creating sample post...");
    createSamplePost();
    // Re-read files after creating sample
    const newFiles = getAllMarkdownFiles();
    markdownFiles.push(...newFiles);
  }

  // Parse all markdown files
  const posts: ParsedPost[] = [];
  for (const filePath of markdownFiles) {
    const post = parseMarkdownFile(filePath);
    if (post) {
      posts.push(post);
      console.log(`Parsed: ${post.title} (${post.slug})`);
    }
  }

  console.log(`\nSyncing ${posts.length} posts to Convex...\n`);

  // Sync posts to Convex
  try {
    const result = await client.mutation(api.posts.syncPostsPublic, { posts });
    console.log("Sync complete!");
    console.log(`  Created: ${result.created}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Deleted: ${result.deleted}`);
  } catch (error) {
    console.error("Error syncing posts:", error);
    process.exit(1);
  }

  // Sync pages if pages directory exists
  const pageFiles = getAllPageFiles();
  const pages: ParsedPage[] = [];

  if (pageFiles.length > 0) {
    console.log(`\nFound ${pageFiles.length} page files\n`);

    for (const filePath of pageFiles) {
      const page = parsePageFile(filePath);
      if (page) {
        pages.push(page);
        console.log(`Parsed page: ${page.title} (${page.slug})`);
      }
    }

    if (pages.length > 0) {
      console.log(`\nSyncing ${pages.length} pages to Convex...\n`);

      try {
        const pageResult = await client.mutation(api.pages.syncPagesPublic, {
          pages,
        });
        console.log("Pages sync complete!");
        console.log(`  Created: ${pageResult.created}`);
        console.log(`  Updated: ${pageResult.updated}`);
        console.log(`  Deleted: ${pageResult.deleted}`);
      } catch (error) {
        console.error("Error syncing pages:", error);
        process.exit(1);
      }
    }
  }

  // Generate embeddings for semantic search (if OPENAI_API_KEY is configured)
  console.log("\nGenerating embeddings for semantic search...");
  try {
    const embeddingResult = await client.action(
      api.embeddings.generateMissingEmbeddings,
      {}
    );
    if (embeddingResult.skipped) {
      console.log("  Skipped: OPENAI_API_KEY not configured");
    } else {
      console.log(`  Posts: ${embeddingResult.postsProcessed} embeddings generated`);
      console.log(`  Pages: ${embeddingResult.pagesProcessed} embeddings generated`);
    }
  } catch (error) {
    // Non-fatal - continue even if embedding generation fails
    console.log("  Warning: Could not generate embeddings:", error);
  }

  // Generate static raw markdown files in public/raw/
  generateRawMarkdownFiles(posts, pages);
}

// Create a sample post if none exist
function createSamplePost() {
  const samplePost = `---
title: "Hello World"
description: "Welcome to my blog. This is my first post."
date: "${new Date().toISOString().split("T")[0]}"
slug: "hello-world"
published: true
tags: ["introduction", "blog"]
---

# Hello World

Welcome to my blog! This is my first post.

## What to Expect

I'll be writing about:

- **Development**: Building applications with modern tools
- **AI**: Exploring artificial intelligence and machine learning
- **Productivity**: Tips and tricks for getting things done

## Code Example

Here's a simple TypeScript example:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Stay Tuned

More posts coming soon. Thanks for reading!
`;

  const filePath = path.join(CONTENT_DIR, "hello-world.md");
  fs.writeFileSync(filePath, samplePost);
  console.log(`Created sample post: ${filePath}`);
}

// Generate static markdown file in public/raw/ directory
function generateRawMarkdownFile(
  slug: string,
  title: string,
  description: string,
  content: string,
  date: string,
  tags: string[],
  readTime?: string,
  type: "post" | "page" = "post",
): void {
  // Ensure raw output directory exists
  if (!fs.existsSync(RAW_OUTPUT_DIR)) {
    fs.mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
  }

  // Build metadata section
  const metadataLines: string[] = [];
  metadataLines.push(`Type: ${type}`);
  metadataLines.push(`Date: ${date}`);
  if (readTime) metadataLines.push(`Reading time: ${readTime}`);
  if (tags && tags.length > 0) metadataLines.push(`Tags: ${tags.join(", ")}`);

  // Build the full markdown document
  let markdown = `# ${title}\n\n`;

  // Add description if available
  if (description) {
    markdown += `> ${description}\n\n`;
  }

  // Add metadata block
  markdown += `---\n${metadataLines.join("\n")}\n---\n\n`;

  // Add main content
  markdown += content;

  // Write to file
  const filePath = path.join(RAW_OUTPUT_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, markdown);
}

// Generate homepage index markdown file listing all posts
function generateHomepageIndex(posts: ParsedPost[], pages: ParsedPage[]): void {
  const publishedPosts = posts.filter((p) => p.published);
  const publishedPages = pages.filter((p) => p.published);

  // Sort posts by date (newest first)
  const sortedPosts = [...publishedPosts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Find the home-intro page for homepage content
  const homeIntroPage = publishedPages.find((p) => p.slug === "home-intro");
  // Find the footer page for footer content
  const footerPage = publishedPages.find((p) => p.slug === "footer");

  // Build markdown content
  let markdown = `# Homepage\n\n`;

  // Include home intro content if available
  if (homeIntroPage && homeIntroPage.content) {
    markdown += `${homeIntroPage.content}\n\n`;
    markdown += `---\n\n`;
  } else {
    markdown += `This is the homepage index of all published content.\n\n`;
  }

  // Add posts section
  if (sortedPosts.length > 0) {
    markdown += `## Blog Posts (${sortedPosts.length})\n\n`;
    for (const post of sortedPosts) {
      markdown += `- **[${post.title}](/raw/${post.slug}.md)**`;
      if (post.description) {
        markdown += ` - ${post.description}`;
      }
      markdown += `\n  - Date: ${post.date}`;
      if (post.readTime) {
        markdown += ` | Reading time: ${post.readTime}`;
      }
      if (post.tags && post.tags.length > 0) {
        markdown += ` | Tags: ${post.tags.join(", ")}`;
      }
      markdown += `\n`;
    }
    markdown += `\n`;
  }

  // Add pages section
  if (publishedPages.length > 0) {
    markdown += `## Pages (${publishedPages.length})\n\n`;
    // Sort pages by order if available, otherwise alphabetically
    const sortedPages = [...publishedPages].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a.title.localeCompare(b.title);
    });

    for (const page of sortedPages) {
      markdown += `- **[${page.title}](/raw/${page.slug}.md)**`;
      if (page.excerpt) {
        markdown += ` - ${page.excerpt}`;
      }
      markdown += `\n`;
    }
    markdown += `\n`;
  }

  // Add summary
  markdown += `---\n\n`;
  markdown += `**Total Content:** ${sortedPosts.length} posts, ${publishedPages.length} pages\n`;
  markdown += `\nAll content is available as raw markdown files at \`/raw/{slug}.md\`\n`;

  // Add footer content if available
  if (footerPage && footerPage.content) {
    markdown += `\n---\n\n`;
    markdown += `${footerPage.content}\n`;
  }

  // Write index.md file
  const indexPath = path.join(RAW_OUTPUT_DIR, "index.md");
  fs.writeFileSync(indexPath, markdown);
  console.log("Generated homepage index: index.md");
}

// Generate all raw markdown files during sync
function generateRawMarkdownFiles(
  posts: ParsedPost[],
  pages: ParsedPage[],
): void {
  console.log("\nGenerating static markdown files in public/raw/...");

  // Clear existing raw files
  if (fs.existsSync(RAW_OUTPUT_DIR)) {
    const existingFiles = fs.readdirSync(RAW_OUTPUT_DIR);
    for (const file of existingFiles) {
      if (file.endsWith(".md")) {
        fs.unlinkSync(path.join(RAW_OUTPUT_DIR, file));
      }
    }
  }

  // Generate files for published posts
  const publishedPosts = posts.filter((p) => p.published);
  for (const post of publishedPosts) {
    generateRawMarkdownFile(
      post.slug,
      post.title,
      post.description,
      post.content,
      post.date,
      post.tags,
      post.readTime,
      "post",
    );
  }

  // Generate files for published pages
  const publishedPages = pages.filter((p) => p.published);
  for (const page of publishedPages) {
    generateRawMarkdownFile(
      page.slug,
      page.title,
      "", // pages don't have description
      page.content,
      new Date().toISOString().split("T")[0], // pages don't have date
      [], // pages don't have tags
      undefined,
      "page",
    );
  }

  // Generate homepage index markdown file
  generateHomepageIndex(posts, pages);

  console.log(
    `Generated ${publishedPosts.length} post files, ${publishedPages.length} page files, and 1 index file`,
  );
}

// Run the sync
syncPosts().catch(console.error);
