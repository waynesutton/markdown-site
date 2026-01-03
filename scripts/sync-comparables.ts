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

const CONTENT_DIR = path.join(process.cwd(), "content", "comparables");
const RAW_OUTPUT_DIR = path.join(process.cwd(), "public", "raw");

interface ComparableFrontmatter {
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
  blogFeatured?: boolean; // Show as hero featured post on /comparables page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  contactForm?: boolean; // Enable contact form on this post
}

interface ParsedComparable {
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
  blogFeatured?: boolean; // Show as hero featured post on /comparables page
  newsletter?: boolean; // Override newsletter signup display (true/false)
  contactForm?: boolean; // Enable contact form on this post
  unlisted?: boolean; // Hide from listings but allow direct access via slug
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
}

// Calculate reading time based on word count
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Parse a single markdown file
function parseMarkdownFile(filePath: string): ParsedComparable | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as Partial<ComparableFrontmatter>;

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
      blogFeatured: frontmatter.blogFeatured, // Show as hero featured post on /comparables page
      newsletter: frontmatter.newsletter, // Override newsletter signup display
      contactForm: frontmatter.contactForm, // Enable contact form on this post
      unlisted: frontmatter.unlisted, // Hide from listings but allow direct access
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

// Generate raw markdown files for API access
function generateRawMarkdownFiles(comparables: ParsedComparable[]): void {
  // Ensure raw output directory exists
  if (!fs.existsSync(RAW_OUTPUT_DIR)) {
    fs.mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
  }

  // Generate individual comparable files
  for (const comparable of comparables) {
    const filename = `${comparable.slug}.md`;
    const filepath = path.join(RAW_OUTPUT_DIR, filename);
    
    // Build frontmatter
    const frontmatterLines = [
      `Type: Comparable`,
      `Date: ${comparable.date}`,
      `Reading time: ${comparable.readTime}`,
      `Tags: ${comparable.tags.join(", ")}`,
    ];
    
    const rawContent = [
      `# ${comparable.title}`,
      ``,
      ...frontmatterLines.map(line => `**${line}**`),
      ``,
      comparable.content,
    ].join("\n");

    fs.writeFileSync(filepath, rawContent, "utf-8");
  }

  console.log(`\nGenerated ${comparables.length} raw markdown files in ${RAW_OUTPUT_DIR}`);
}

async function main() {
  try {
    // Get Convex URL from environment
    const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

    if (!convexUrl) {
      throw new Error("VITE_CONVEX_URL or CONVEX_URL environment variable is required");
    }

    console.log("Connecting to Convex...");
    const client = new ConvexHttpClient(convexUrl);

    // Parse all markdown files
    console.log(`Reading comparables from ${CONTENT_DIR}...\n`);
    const markdownFiles = getAllMarkdownFiles();
    const comparables = markdownFiles
      .map(parseMarkdownFile)
      .filter((p): p is ParsedComparable => p !== null);

    console.log(`Found ${comparables.length} comparables\n`);

    // Sync to Convex
    console.log("Syncing comparables to Convex...");
    const result = await client.mutation(api.comparables.syncComparablesPublic, {
      comparables,
    });

    console.log(`\n✓ Sync complete!`);
    console.log(`  Created: ${result.created}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Deleted: ${result.deleted}`);

    // Generate raw markdown files
    generateRawMarkdownFiles(comparables);

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Sync failed:", error);
    process.exit(1);
  }
}

main();
