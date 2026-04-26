import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  dotenv.config({ path: ".env.production.local" });
  console.log("Syncing wiki to PRODUCTION deployment...\n");
} else {
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PAGES_DIR = path.join(process.cwd(), "content", "pages");

type PageType = "concept" | "entity" | "overview" | "synthesis" | "comparison";

interface WikiPage {
  slug: string;
  title: string;
  content: string;
  pageType: PageType;
  category?: string;
  backlinks?: string[];
  sourceSlugs?: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

function inferPageType(tags?: string[]): PageType {
  if (!tags || tags.length === 0) return "overview";
  const tagStr = tags.join(" ").toLowerCase();
  if (tagStr.includes("comparison") || tagStr.includes("vs")) return "comparison";
  if (tagStr.includes("guide") || tagStr.includes("tutorial")) return "overview";
  if (tagStr.includes("concept") || tagStr.includes("pattern")) return "concept";
  return "overview";
}

function inferCategory(tags?: string[]): string {
  if (!tags || tags.length === 0) return "General";
  return tags[0].charAt(0).toUpperCase() + tags[0].slice(1);
}

function extractBacklinks(content: string, allSlugs: Set<string>): string[] {
  const links: Set<string> = new Set();
  const linkPattern = /\[([^\]]+)\]\(\/([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const slug = match[2];
    if (allSlugs.has(slug)) {
      links.add(slug);
    }
  }
  return Array.from(links);
}

function readMarkdownFiles(dir: string, _source: "blog" | "pages"): WikiPage[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const pages: WikiPage[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);

      if (!data.title || !data.published) continue;

      const slug = data.slug || slugify(data.title);
      const tags = Array.isArray(data.tags) ? data.tags : [];

      pages.push({
        slug: `wiki-${slug}`,
        title: data.title,
        content: content.trim(),
        pageType: inferPageType(tags),
        category: inferCategory(tags),
        sourceSlugs: [slug],
      });
    } catch (err) {
      console.warn(`  Skipping ${file}: ${err}`);
    }
  }

  return pages;
}

async function main() {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error("Missing VITE_CONVEX_URL or CONVEX_URL. Run npx convex dev first.");
    process.exit(1);
  }

  // Parse --kb flag for KB-scoped sync
  const kbIdArg = process.argv.find((a) => a.startsWith("--kb="));
  const kbId = kbIdArg ? kbIdArg.split("=")[1] : undefined;

  if (kbId) {
    console.log(`Syncing wiki to knowledge base: ${kbId}`);
  }

  console.log(`Reading markdown from content/blog/ and content/pages/...`);

  const blogPages = readMarkdownFiles(BLOG_DIR, "blog");
  const staticPages = readMarkdownFiles(PAGES_DIR, "pages");
  const allPages = [...blogPages, ...staticPages];

  if (allPages.length === 0) {
    console.log("No published content found. Nothing to sync.");
    return;
  }

  // Build backlink graph
  const allSlugs = new Set(allPages.map((p) => p.slug));
  for (const page of allPages) {
    page.backlinks = extractBacklinks(page.content, allSlugs);
  }

  console.log(`  Found ${blogPages.length} blog posts, ${staticPages.length} pages`);
  console.log(`  Total: ${allPages.length} wiki pages to sync\n`);

  const client = new ConvexHttpClient(convexUrl);

  // Batch in chunks of 20 to stay within mutation limits
  const BATCH_SIZE = 20;
  let totalCreated = 0;
  let totalUpdated = 0;

  for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
    const batch = allPages.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allPages.length / BATCH_SIZE);

    console.log(`  Syncing batch ${batchNum}/${totalBatches} (${batch.length} pages)...`);

    const result = await client.mutation(api.wiki.syncWikiPages, {
      pages: batch,
      ...(kbId ? { kbId: kbId as any } : {}),
    });

    totalCreated += result.created;
    totalUpdated += result.updated;
  }

  console.log(`\nWiki sync complete.`);
  console.log(`  Created: ${totalCreated}`);
  console.log(`  Updated: ${totalUpdated}`);
  console.log(`  Total: ${allPages.length}`);
  if (kbId) {
    console.log(`  Knowledge Base: ${kbId}`);
  }
}

main().catch((err) => {
  console.error("Wiki sync failed:", err);
  process.exit(1);
});
