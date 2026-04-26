import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const MAX_FILES_PER_UPLOAD = 100;
const MAX_FILE_SIZE = 50_000; // 50KB per file

const uploadFileValidator = v.object({
  filename: v.string(),
  content: v.string(),
});

// Public: upload markdown files to a knowledge base
export const uploadFiles = mutation({
  args: {
    kbId: v.id("knowledgeBases"),
    files: v.array(uploadFileValidator),
  },
  returns: v.object({ jobId: v.id("kbUploadJobs") }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Authentication required");

    const kb = await ctx.db.get(args.kbId);
    if (!kb) throw new ConvexError("Knowledge base not found");

    if (args.files.length > MAX_FILES_PER_UPLOAD) {
      throw new ConvexError(`Maximum ${MAX_FILES_PER_UPLOAD} files per upload`);
    }

    for (const file of args.files) {
      if (file.content.length > MAX_FILE_SIZE) {
        throw new ConvexError(`File "${file.filename}" exceeds ${MAX_FILE_SIZE / 1000}KB limit`);
      }
    }

    const jobId = await ctx.db.insert("kbUploadJobs", {
      kbId: args.kbId,
      ownerSubject: identity.subject,
      status: "pending",
      fileCount: args.files.length,
      processedCount: 0,
      createdAt: Date.now(),
    });

    // Schedule processing
    await ctx.scheduler.runAfter(0, internal.kbUpload.processUploadedFiles, {
      jobId,
      kbId: args.kbId,
      files: args.files,
    });

    return { jobId };
  },
});

// Public: get upload job status
export const getUploadJobStatus = query({
  args: { jobId: v.id("kbUploadJobs") },
  returns: v.union(
    v.object({
      status: v.string(),
      fileCount: v.optional(v.number()),
      processedCount: v.optional(v.number()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;
    return {
      status: job.status,
      fileCount: job.fileCount,
      processedCount: job.processedCount,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

// Internal: process uploaded markdown files into wiki pages
export const processUploadedFiles = internalMutation({
  args: {
    jobId: v.id("kbUploadJobs"),
    kbId: v.id("knowledgeBases"),
    files: v.array(uploadFileValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "running" as const });

    try {
      let processedCount = 0;

      for (const file of args.files) {
        const { slug, title, content, category } = parseMarkdownFile(file.filename, file.content);

        // Upsert: check if page already exists in this KB
        const existing = await ctx.db
          .query("wikiPages")
          .withIndex("by_kbid_and_slug", (q) =>
            q.eq("kbId", args.kbId).eq("slug", slug),
          )
          .first();

        const now = Date.now();

        if (existing) {
          await ctx.db.patch(existing._id, {
            title,
            content,
            category,
            lastCompiledAt: now,
            lastCompiledBy: "upload",
          });
        } else {
          await ctx.db.insert("wikiPages", {
            slug,
            title,
            content,
            pageType: "concept",
            category,
            backlinks: extractBacklinks(content),
            sourceSlugs: [],
            lastCompiledAt: now,
            lastCompiledBy: "upload",
            kbId: args.kbId,
          });
        }
        processedCount++;
      }

      // Count total pages in KB
      const allPages = await ctx.db
        .query("wikiPages")
        .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.kbId))
        .take(1000);

      // Update KB page count
      await ctx.db.patch(args.kbId, {
        pageCount: allPages.length,
        lastCompiledAt: Date.now(),
      });

      // Generate index for this KB
      await regenerateKbIndex(ctx, args.kbId, allPages);

      // Mark job complete
      await ctx.db.patch(args.jobId, {
        status: "completed" as const,
        processedCount,
        completedAt: Date.now(),
      });
    } catch (error) {
      await ctx.db.patch(args.jobId, {
        status: "failed" as const,
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: Date.now(),
      });
    }

    return null;
  },
});

// Parses a markdown file to extract slug, title, content, and category from frontmatter/filename
function parseMarkdownFile(
  filename: string,
  rawContent: string,
): { slug: string; title: string; content: string; category: string | undefined } {
  // Derive slug from filename (strip path separators and .md extension)
  const basename = filename.replace(/\\/g, "/").split("/").pop() || filename;
  const slug = basename
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "") || "untitled";

  // Extract category from folder path
  const parts = filename.replace(/\\/g, "/").split("/");
  const category = parts.length > 1 ? parts[parts.length - 2] : undefined;

  // Try to extract title from frontmatter or first heading
  let title = slug;
  let content = rawContent;

  // Check for YAML frontmatter
  const fmMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    content = fmMatch[2].trim();
    const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) title = titleMatch[1];
  }

  // Fall back to first h1
  if (title === slug) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1].trim();
  }

  // Capitalize slug as fallback title
  if (title === slug) {
    title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return { slug, title, content, category };
}

// Extract [[wiki-link]] style backlinks from content
function extractBacklinks(content: string): Array<string> {
  const matches = content.match(/\[\[([^\]]+)\]\]/g);
  if (!matches) return [];
  const slugs = new Set<string>();
  for (const m of matches) {
    const inner = m.slice(2, -2).split("|")[0].trim();
    const linkSlug = inner
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    if (linkSlug) slugs.add(linkSlug);
  }
  return Array.from(slugs);
}

// Regenerate wiki index for a specific KB
async function regenerateKbIndex(
  ctx: { db: { query: any; patch: any; insert: any } },
  kbId: any,
  pages: Array<{ slug: string; title: string; pageType: string; category?: string }>,
) {
  const categories = new Map<string, Array<{ slug: string; title: string; pageType: string }>>();
  for (const page of pages) {
    const cat = page.category || "Uncategorized";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push({ slug: page.slug, title: page.title, pageType: page.pageType });
  }

  const lines: Array<string> = [
    "# Wiki index",
    "",
    `${pages.length} pages.`,
    "",
  ];

  for (const [category, catPages] of Array.from(categories.entries()).sort()) {
    lines.push(`## ${category}`, "");
    for (const page of catPages.sort((a, b) => a.title.localeCompare(b.title))) {
      lines.push(`- [${page.title}](/wiki/${page.slug}) (${page.pageType})`);
    }
    lines.push("");
  }

  const indexContent = lines.join("\n");
  const existing = await ctx.db
    .query("wikiIndex")
    .withIndex("by_kbid_and_key", (q: any) => q.eq("kbId", kbId).eq("key", "main"))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      content: indexContent,
      lastUpdatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("wikiIndex", {
      key: "main",
      content: indexContent,
      lastUpdatedAt: Date.now(),
      kbId,
    });
  }
}
