import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables
const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  dotenv.config({ path: ".env.production.local" });
  console.log("Exporting from PRODUCTION deployment...\n");
} else {
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const BLOG_OUTPUT_DIR = path.join(process.cwd(), "content", "blog");
const PAGES_OUTPUT_DIR = path.join(process.cwd(), "content", "pages");

const convexUrl = process.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error("Error: VITE_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

interface Post {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  published: boolean;
  tags: string[];
  readTime?: string;
  image?: string;
  showImageAtTop?: boolean;
  excerpt?: string;
  featured?: boolean;
  featuredOrder?: number;
  authorName?: string;
  authorImage?: string;
  layout?: string;
  rightSidebar?: boolean;
  showFooter?: boolean;
  footer?: string;
  showSocialFooter?: boolean;
  aiChat?: boolean;
  blogFeatured?: boolean;
  newsletter?: boolean;
  contactForm?: boolean;
  unlisted?: boolean;
  docsSection?: boolean;
  docsSectionGroup?: string;
  docsSectionOrder?: number;
  docsSectionGroupOrder?: number;
  docsSectionGroupIcon?: string;
  docsLanding?: boolean;
  source?: "dashboard" | "sync";
}

interface Page {
  _id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  order?: number;
  showInNav?: boolean;
  excerpt?: string;
  image?: string;
  showImageAtTop?: boolean;
  featured?: boolean;
  featuredOrder?: number;
  authorName?: string;
  authorImage?: string;
  layout?: string;
  rightSidebar?: boolean;
  showFooter?: boolean;
  footer?: string;
  showSocialFooter?: boolean;
  aiChat?: boolean;
  contactForm?: boolean;
  newsletter?: boolean;
  textAlign?: string;
  docsSection?: boolean;
  docsSectionGroup?: string;
  docsSectionOrder?: number;
  docsSectionGroupOrder?: number;
  docsSectionGroupIcon?: string;
  docsLanding?: boolean;
  source?: "dashboard" | "sync";
}

function generatePostMarkdown(post: Post): string {
  const frontmatter: string[] = ["---"];
  frontmatter.push(`title: "${post.title.replace(/"/g, '\\"')}"`);
  frontmatter.push(`description: "${post.description.replace(/"/g, '\\"')}"`);
  frontmatter.push(`date: "${post.date}"`);
  frontmatter.push(`slug: "${post.slug}"`);
  frontmatter.push(`published: ${post.published}`);
  frontmatter.push(`tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`);

  // Optional fields
  if (post.readTime) frontmatter.push(`readTime: "${post.readTime}"`);
  if (post.image) frontmatter.push(`image: "${post.image}"`);
  if (post.showImageAtTop !== undefined)
    frontmatter.push(`showImageAtTop: ${post.showImageAtTop}`);
  if (post.excerpt)
    frontmatter.push(`excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`);
  if (post.featured !== undefined) frontmatter.push(`featured: ${post.featured}`);
  if (post.featuredOrder !== undefined)
    frontmatter.push(`featuredOrder: ${post.featuredOrder}`);
  if (post.authorName) frontmatter.push(`authorName: "${post.authorName}"`);
  if (post.authorImage) frontmatter.push(`authorImage: "${post.authorImage}"`);
  if (post.layout) frontmatter.push(`layout: "${post.layout}"`);
  if (post.rightSidebar !== undefined)
    frontmatter.push(`rightSidebar: ${post.rightSidebar}`);
  if (post.showFooter !== undefined)
    frontmatter.push(`showFooter: ${post.showFooter}`);
  if (post.footer)
    frontmatter.push(`footer: "${post.footer.replace(/"/g, '\\"')}"`);
  if (post.showSocialFooter !== undefined)
    frontmatter.push(`showSocialFooter: ${post.showSocialFooter}`);
  if (post.aiChat !== undefined) frontmatter.push(`aiChat: ${post.aiChat}`);
  if (post.blogFeatured !== undefined)
    frontmatter.push(`blogFeatured: ${post.blogFeatured}`);
  if (post.newsletter !== undefined)
    frontmatter.push(`newsletter: ${post.newsletter}`);
  if (post.contactForm !== undefined)
    frontmatter.push(`contactForm: ${post.contactForm}`);
  if (post.unlisted !== undefined) frontmatter.push(`unlisted: ${post.unlisted}`);
  if (post.docsSection !== undefined)
    frontmatter.push(`docsSection: ${post.docsSection}`);
  if (post.docsSectionGroup)
    frontmatter.push(`docsSectionGroup: "${post.docsSectionGroup}"`);
  if (post.docsSectionOrder !== undefined)
    frontmatter.push(`docsSectionOrder: ${post.docsSectionOrder}`);
  if (post.docsSectionGroupOrder !== undefined)
    frontmatter.push(`docsSectionGroupOrder: ${post.docsSectionGroupOrder}`);
  if (post.docsSectionGroupIcon)
    frontmatter.push(`docsSectionGroupIcon: "${post.docsSectionGroupIcon}"`);
  if (post.docsLanding !== undefined)
    frontmatter.push(`docsLanding: ${post.docsLanding}`);

  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${post.content}`;
}

function generatePageMarkdown(page: Page): string {
  const frontmatter: string[] = ["---"];
  frontmatter.push(`title: "${page.title.replace(/"/g, '\\"')}"`);
  frontmatter.push(`slug: "${page.slug}"`);
  frontmatter.push(`published: ${page.published}`);

  // Optional fields
  if (page.order !== undefined) frontmatter.push(`order: ${page.order}`);
  if (page.showInNav !== undefined)
    frontmatter.push(`showInNav: ${page.showInNav}`);
  if (page.excerpt)
    frontmatter.push(`excerpt: "${page.excerpt.replace(/"/g, '\\"')}"`);
  if (page.image) frontmatter.push(`image: "${page.image}"`);
  if (page.showImageAtTop !== undefined)
    frontmatter.push(`showImageAtTop: ${page.showImageAtTop}`);
  if (page.featured !== undefined) frontmatter.push(`featured: ${page.featured}`);
  if (page.featuredOrder !== undefined)
    frontmatter.push(`featuredOrder: ${page.featuredOrder}`);
  if (page.authorName) frontmatter.push(`authorName: "${page.authorName}"`);
  if (page.authorImage) frontmatter.push(`authorImage: "${page.authorImage}"`);
  if (page.layout) frontmatter.push(`layout: "${page.layout}"`);
  if (page.rightSidebar !== undefined)
    frontmatter.push(`rightSidebar: ${page.rightSidebar}`);
  if (page.showFooter !== undefined)
    frontmatter.push(`showFooter: ${page.showFooter}`);
  if (page.footer)
    frontmatter.push(`footer: "${page.footer.replace(/"/g, '\\"')}"`);
  if (page.showSocialFooter !== undefined)
    frontmatter.push(`showSocialFooter: ${page.showSocialFooter}`);
  if (page.aiChat !== undefined) frontmatter.push(`aiChat: ${page.aiChat}`);
  if (page.contactForm !== undefined)
    frontmatter.push(`contactForm: ${page.contactForm}`);
  if (page.newsletter !== undefined)
    frontmatter.push(`newsletter: ${page.newsletter}`);
  if (page.textAlign) frontmatter.push(`textAlign: "${page.textAlign}"`);
  if (page.docsSection !== undefined)
    frontmatter.push(`docsSection: ${page.docsSection}`);
  if (page.docsSectionGroup)
    frontmatter.push(`docsSectionGroup: "${page.docsSectionGroup}"`);
  if (page.docsSectionOrder !== undefined)
    frontmatter.push(`docsSectionOrder: ${page.docsSectionOrder}`);
  if (page.docsSectionGroupOrder !== undefined)
    frontmatter.push(`docsSectionGroupOrder: ${page.docsSectionGroupOrder}`);
  if (page.docsSectionGroupIcon)
    frontmatter.push(`docsSectionGroupIcon: "${page.docsSectionGroupIcon}"`);
  if (page.docsLanding !== undefined)
    frontmatter.push(`docsLanding: ${page.docsLanding}`);

  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${page.content}`;
}

async function main() {
  console.log("Exporting dashboard content to markdown files...\n");

  // Ensure output directories exist
  if (!fs.existsSync(BLOG_OUTPUT_DIR)) {
    fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(PAGES_OUTPUT_DIR)) {
    fs.mkdirSync(PAGES_OUTPUT_DIR, { recursive: true });
  }

  // Get all posts
  const posts = (await client.query(api.posts.listAll)) as Post[];
  const dashboardPosts = posts.filter((p) => p.source === "dashboard");

  console.log(`Found ${dashboardPosts.length} dashboard posts to export\n`);

  let exportedPosts = 0;
  for (const post of dashboardPosts) {
    const markdown = generatePostMarkdown(post);
    const filePath = path.join(BLOG_OUTPUT_DIR, `${post.slug}.md`);
    fs.writeFileSync(filePath, markdown, "utf-8");
    console.log(`  Exported: ${post.slug}.md`);
    exportedPosts++;
  }

  // Get all pages
  const pages = (await client.query(api.pages.listAll)) as Page[];
  const dashboardPages = pages.filter((p) => p.source === "dashboard");

  console.log(`\nFound ${dashboardPages.length} dashboard pages to export\n`);

  let exportedPages = 0;
  for (const page of dashboardPages) {
    const markdown = generatePageMarkdown(page);
    const filePath = path.join(PAGES_OUTPUT_DIR, `${page.slug}.md`);
    fs.writeFileSync(filePath, markdown, "utf-8");
    console.log(`  Exported: ${page.slug}.md`);
    exportedPages++;
  }

  console.log("\n-------------------------------------------");
  console.log(`Export complete!`);
  console.log(`  Posts exported: ${exportedPosts}`);
  console.log(`  Pages exported: ${exportedPages}`);
  console.log("-------------------------------------------\n");

  if (exportedPosts + exportedPages > 0) {
    console.log("Next steps:");
    console.log("  1. Review the exported files in content/blog/ and content/pages/");
    console.log("  2. Run 'npm run sync' to sync them back (they will keep source: 'sync')");
    console.log("  3. Delete the dashboard originals if you want to switch to file-based workflow");
  }
}

main().catch(console.error);
