import { mutation, query, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const MAX_CONTENT_LENGTH = 50_000; // 50KB
const MAX_DEMO_ITEMS_PER_TABLE = 50; // Cap total demo items to prevent abuse
const CLEANUP_BATCH_SIZE = 200;

// Strip dangerous HTML from markdown content
function sanitizeContent(content: string): string {
  let sanitized = content;
  // Remove script, iframe, object, embed, form, input tags (and their content for script)
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/<\/?script[^>]*>/gi, "");
  sanitized = sanitized.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<\/?iframe[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?object[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?embed[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?form[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?input[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?textarea[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?select[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/?button[^>]*>/gi, "");
  // Remove on* event handler attributes
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*\S+/gi, "");
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  // Remove data: URLs (potential vector for embedded scripts)
  sanitized = sanitized.replace(/src\s*=\s*["']data:text\/html[^"']*["']/gi, 'src=""');
  return sanitized;
}

function ensureDemoSlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (trimmed.startsWith("demo-")) {
    return trimmed;
  }
  return `demo-${trimmed}`;
}

function validateDemoContent(content: string): string {
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new ConvexError(
      `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`,
    );
  }
  return sanitizeContent(content);
}

// Shared validators for demo post/page fields
const demoPostValidator = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.string(),
  date: v.string(),
  published: v.boolean(),
  tags: v.array(v.string()),
  readTime: v.optional(v.string()),
  image: v.optional(v.string()),
  excerpt: v.optional(v.string()),
  authorName: v.optional(v.string()),
});

const demoPageValidator = v.object({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  published: v.boolean(),
  excerpt: v.optional(v.string()),
  image: v.optional(v.string()),
  authorName: v.optional(v.string()),
});

export const createDemoPost = mutation({
  args: { post: demoPostValidator },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const slug = ensureDemoSlug(args.post.slug);
    const content = validateDemoContent(args.post.content);
    const description = sanitizeContent(args.post.description);
    const title = sanitizeContent(args.post.title);

    // Check slug collision
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) {
      throw new ConvexError(`Post with slug "${slug}" already exists`);
    }

    // Cap total demo posts
    const demoCount = await ctx.db
      .query("posts")
      .withIndex("by_source", (q) => q.eq("source", "demo"))
      .take(MAX_DEMO_ITEMS_PER_TABLE + 1);
    if (demoCount.length >= MAX_DEMO_ITEMS_PER_TABLE) {
      throw new ConvexError(
        "Demo post limit reached. Content resets every 30 minutes.",
      );
    }

    return await ctx.db.insert("posts", {
      slug,
      title,
      description,
      content,
      date: args.post.date,
      published: args.post.published,
      tags: args.post.tags,
      readTime: args.post.readTime,
      image: args.post.image,
      excerpt: args.post.excerpt ? sanitizeContent(args.post.excerpt) : undefined,
      authorName: args.post.authorName
        ? sanitizeContent(args.post.authorName)
        : undefined,
      unlisted: true,
      source: "demo",
      demo: true,
      lastSyncedAt: Date.now(),
    });
  },
});

export const createDemoPage = mutation({
  args: { page: demoPageValidator },
  returns: v.id("pages"),
  handler: async (ctx, args) => {
    const slug = ensureDemoSlug(args.page.slug);
    const content = validateDemoContent(args.page.content);
    const title = sanitizeContent(args.page.title);

    const existing = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) {
      throw new ConvexError(`Page with slug "${slug}" already exists`);
    }

    const demoCount = await ctx.db
      .query("pages")
      .withIndex("by_source", (q) => q.eq("source", "demo"))
      .take(MAX_DEMO_ITEMS_PER_TABLE + 1);
    if (demoCount.length >= MAX_DEMO_ITEMS_PER_TABLE) {
      throw new ConvexError(
        "Demo page limit reached. Content resets every 30 minutes.",
      );
    }

    return await ctx.db.insert("pages", {
      slug,
      title,
      content,
      published: args.page.published,
      showInNav: false,
      excerpt: args.page.excerpt ? sanitizeContent(args.page.excerpt) : undefined,
      image: args.page.image,
      authorName: args.page.authorName
        ? sanitizeContent(args.page.authorName)
        : undefined,
      source: "demo",
      demo: true,
      lastSyncedAt: Date.now(),
    });
  },
});

export const updateDemoPost = mutation({
  args: {
    id: v.id("posts"),
    post: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      content: v.optional(v.string()),
      date: v.optional(v.string()),
      published: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Post not found");
    }
    if (existing.source !== "demo") {
      throw new ConvexError("Only demo content can be edited in demo mode");
    }

    const patch: Record<string, unknown> = {};
    if (args.post.title !== undefined)
      patch.title = sanitizeContent(args.post.title);
    if (args.post.description !== undefined)
      patch.description = sanitizeContent(args.post.description);
    if (args.post.content !== undefined)
      patch.content = validateDemoContent(args.post.content);
    if (args.post.date !== undefined) patch.date = args.post.date;
    if (args.post.published !== undefined)
      patch.published = args.post.published;
    if (args.post.tags !== undefined) patch.tags = args.post.tags;
    if (args.post.readTime !== undefined) patch.readTime = args.post.readTime;
    if (args.post.image !== undefined) patch.image = args.post.image;
    if (args.post.excerpt !== undefined)
      patch.excerpt = sanitizeContent(args.post.excerpt);
    if (args.post.authorName !== undefined)
      patch.authorName = sanitizeContent(args.post.authorName);
    patch.lastSyncedAt = Date.now();

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const updateDemoPage = mutation({
  args: {
    id: v.id("pages"),
    page: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      published: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      authorName: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Page not found");
    }
    if (existing.source !== "demo") {
      throw new ConvexError("Only demo content can be edited in demo mode");
    }

    const patch: Record<string, unknown> = {};
    if (args.page.title !== undefined)
      patch.title = sanitizeContent(args.page.title);
    if (args.page.content !== undefined)
      patch.content = validateDemoContent(args.page.content);
    if (args.page.published !== undefined)
      patch.published = args.page.published;
    if (args.page.excerpt !== undefined)
      patch.excerpt = sanitizeContent(args.page.excerpt);
    if (args.page.image !== undefined) patch.image = args.page.image;
    if (args.page.authorName !== undefined)
      patch.authorName = sanitizeContent(args.page.authorName);
    patch.lastSyncedAt = Date.now();

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const deleteDemoPost = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Post not found");
    }
    if (existing.source !== "demo") {
      throw new ConvexError("Only demo content can be deleted in demo mode");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const deleteDemoPage = mutation({
  args: { id: v.id("pages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Page not found");
    }
    if (existing.source !== "demo") {
      throw new ConvexError("Only demo content can be deleted in demo mode");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

const DEMO_LIST_LIMIT = 500;

// Public list queries for demo mode (no auth required, mirrors admin listAll shape)
export const listAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      published: v.boolean(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      source: v.optional(
        v.union(v.literal("dashboard"), v.literal("sync"), v.literal("demo")),
      ),
      demo: v.optional(v.boolean()),
    }),
  ),
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").take(DEMO_LIST_LIMIT);
    const sorted = posts.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });
    return sorted.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      date: p.date,
      published: p.published,
      tags: p.tags,
      readTime: p.readTime,
      image: p.image,
      excerpt: p.excerpt,
      featured: p.featured,
      featuredOrder: p.featuredOrder,
      authorName: p.authorName,
      authorImage: p.authorImage,
      source: p.source,
      demo: p.demo,
    }));
  },
});

export const listAllPages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pages"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      published: v.boolean(),
      order: v.optional(v.number()),
      showInNav: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      source: v.optional(
        v.union(v.literal("dashboard"), v.literal("sync"), v.literal("demo")),
      ),
      demo: v.optional(v.boolean()),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").take(DEMO_LIST_LIMIT);
    const sorted = pages.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });
    return sorted.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      slug: p.slug,
      title: p.title,
      content: p.content,
      published: p.published,
      order: p.order,
      showInNav: p.showInNav,
      excerpt: p.excerpt,
      image: p.image,
      featured: p.featured,
      featuredOrder: p.featuredOrder,
      authorName: p.authorName,
      authorImage: p.authorImage,
      source: p.source,
      demo: p.demo,
    }));
  },
});

// Query to check if a post/page is demo content (used by frontend)
export const isDemoContent = query({
  args: { id: v.union(v.id("posts"), v.id("pages")) },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    return doc?.source === "demo";
  },
});

// Internal mutation called by cron to clean up demo content
export const cleanupDemoContent = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    let deletedPosts = 0;
    let deletedPages = 0;

    const demoPosts = await ctx.db
      .query("posts")
      .withIndex("by_source", (q) => q.eq("source", "demo"))
      .take(CLEANUP_BATCH_SIZE);
    for (const post of demoPosts) {
      await ctx.db.delete(post._id);
      deletedPosts++;
    }

    const demoPages = await ctx.db
      .query("pages")
      .withIndex("by_source", (q) => q.eq("source", "demo"))
      .take(CLEANUP_BATCH_SIZE);
    for (const page of demoPages) {
      await ctx.db.delete(page._id);
      deletedPages++;
    }

    if (deletedPosts > 0 || deletedPages > 0) {
      console.log(
        `Demo cleanup: deleted ${deletedPosts} posts and ${deletedPages} pages`,
      );
    }

    return null;
  },
});
