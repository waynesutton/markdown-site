import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireDashboardAdmin } from "./dashboardAuth";

const ADMIN_POST_QUERY_LIMIT = 2000;
const PUBLIC_POST_QUERY_LIMIT = 1000;
const SYNC_POST_QUERY_LIMIT = 5000;

function compareIsoDateDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

function compareFeaturedOrder(
  a: { featuredOrder?: number },
  b: { featuredOrder?: number },
): number {
  const orderA = a.featuredOrder ?? 999;
  const orderB = b.featuredOrder ?? 999;
  return orderA - orderB;
}

function compareDocsOrder(
  a: { docsSectionOrder?: number; title: string },
  b: { docsSectionOrder?: number; title: string },
): number {
  const orderA = a.docsSectionOrder ?? 999;
  const orderB = b.docsSectionOrder ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return a.title.localeCompare(b.title);
}

function authorSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function countSharedTags(a: string[], b: string[]): number {
  let shared = 0;
  for (const tag of a) {
    if (b.some((other) => other.toLowerCase() === tag.toLowerCase())) {
      shared += 1;
    }
  }
  return shared;
}

// Get all posts (published and unpublished) for dashboard admin view
export const listAll = query({
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
      source: v.optional(v.union(v.literal("dashboard"), v.literal("sync"), v.literal("demo"))),
    }),
  ),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    const posts = await ctx.db.query("posts").take(ADMIN_POST_QUERY_LIMIT);

    // Sort by date descending
    const sortedPosts = posts.sort(
      (a, b) => compareIsoDateDesc(a.date, b.date),
    );

    return sortedPosts.map((post) => ({
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      featured: post.featured,
      featuredOrder: post.featuredOrder,
      authorName: post.authorName,
      authorImage: post.authorImage,
      source: post.source,
    }));
  },
});

// Get all published posts, sorted by date descending
export const getAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
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
      layout: v.optional(v.string()),
      rightSidebar: v.optional(v.boolean()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      blogFeatured: v.optional(v.boolean()),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const listedPosts: typeof posts = [];
    for (const post of posts) {
      if (!post.unlisted) {
        listedPosts.push(post);
      }
    }

    // Sort by date descending
    const sortedPosts = listedPosts.sort(
      (a, b) => compareIsoDateDesc(a.date, b.date),
    );

    // Return without content for list view
    return sortedPosts.map((post) => ({
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      featured: post.featured,
      featuredOrder: post.featuredOrder,
      authorName: post.authorName,
      authorImage: post.authorImage,
      layout: post.layout,
      rightSidebar: post.rightSidebar,
      showFooter: post.showFooter,
      blogFeatured: post.blogFeatured,
    }));
  },
});

// Get all blog featured posts for the /blog page (hero + featured row)
// Returns posts with blogFeatured: true, sorted by date descending
export const getBlogFeaturedPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_blogfeatured", (q) => q.eq("blogFeatured", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const publishedFeatured: typeof posts = [];
    for (const post of posts) {
      // Demo posts are never eligible for the blog featured section.
      if (post.source === "demo") continue;
      if (post.published && !post.unlisted) {
        publishedFeatured.push(post);
      }
    }
    publishedFeatured.sort((a, b) => compareIsoDateDesc(a.date, b.date));

    return publishedFeatured.map((post) => ({
      _id: post._id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      authorName: post.authorName,
      authorImage: post.authorImage,
    }));
  },
});

// Get featured posts for the homepage featured section
export const getFeaturedPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      excerpt: v.optional(v.string()),
      description: v.string(),
      image: v.optional(v.string()),
      featuredOrder: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const featuredPosts: typeof posts = [];
    for (const post of posts) {
      // Demo posts are never eligible for the homepage featured section.
      if (post.source === "demo") continue;
      if (post.published && !post.unlisted) {
        featuredPosts.push(post);
      }
    }
    featuredPosts.sort(compareFeaturedOrder);

    return featuredPosts.map((post) => ({
      _id: post._id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      description: post.description,
      image: post.image,
      featuredOrder: post.featuredOrder,
    }));
  },
});

// Get a single post by slug
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
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
      showImageAtTop: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      layout: v.optional(v.string()),
      rightSidebar: v.optional(v.boolean()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      showSocialFooter: v.optional(v.boolean()),
      aiChat: v.optional(v.boolean()),
      newsletter: v.optional(v.boolean()),
      contactForm: v.optional(v.boolean()),
      docsSection: v.optional(v.boolean()),
      slides: v.optional(v.boolean()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) {
      return null;
    }

    return {
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      showImageAtTop: post.showImageAtTop,
      excerpt: post.excerpt,
      featured: post.featured,
      featuredOrder: post.featuredOrder,
      authorName: post.authorName,
      authorImage: post.authorImage,
      layout: post.layout,
      rightSidebar: post.rightSidebar,
      showFooter: post.showFooter,
      footer: post.footer,
      showSocialFooter: post.showSocialFooter,
      aiChat: post.aiChat,
      newsletter: post.newsletter,
      contactForm: post.contactForm,
      docsSection: post.docsSection,
      slides: post.slides,
    };
  },
});

// Internal query to get post by slug (for newsletter sending)
// Returns post details needed for newsletter content
export const getPostBySlugInternal = internalQuery({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      excerpt: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) {
      return null;
    }

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      excerpt: post.excerpt,
    };
  },
});

// Internal query to get recent posts (for weekly digest)
// Returns published posts with date >= since parameter
export const getRecentPostsInternal = internalQuery({
  args: {
    since: v.string(), // Date string in YYYY-MM-DD format
  },
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      excerpt: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const recentPosts = [];
    for (const post of posts) {
      if (post.date >= args.since && !post.unlisted) {
        recentPosts.push({
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: post.date,
          excerpt: post.excerpt,
        });
      }
    }
    recentPosts.sort((a, b) => b.date.localeCompare(a.date));

    return recentPosts;
  },
});

// Internal mutation for syncing posts from markdown files
export const syncPosts = internalMutation({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        content: v.string(),
        date: v.string(),
        published: v.boolean(),
        tags: v.array(v.string()),
        readTime: v.optional(v.string()),
        image: v.optional(v.string()),
        showImageAtTop: v.optional(v.boolean()),
        excerpt: v.optional(v.string()),
        featured: v.optional(v.boolean()),
        featuredOrder: v.optional(v.number()),
        authorName: v.optional(v.string()),
        authorImage: v.optional(v.string()),
        layout: v.optional(v.string()),
        rightSidebar: v.optional(v.boolean()),
        showFooter: v.optional(v.boolean()),
        footer: v.optional(v.string()),
        showSocialFooter: v.optional(v.boolean()),
        aiChat: v.optional(v.boolean()),
        blogFeatured: v.optional(v.boolean()),
        newsletter: v.optional(v.boolean()),
        contactForm: v.optional(v.boolean()),
        unlisted: v.optional(v.boolean()),
        docsSection: v.optional(v.boolean()),
        docsSectionGroup: v.optional(v.string()),
        docsSectionOrder: v.optional(v.number()),
        docsSectionGroupOrder: v.optional(v.number()),
        docsSectionGroupIcon: v.optional(v.string()),
        docsLanding: v.optional(v.boolean()),
      }),
    ),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    deleted: v.number(),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    const now = Date.now();
    const incomingSlugs = new Set(args.posts.map((p) => p.slug));

    // Get all existing posts
    const existingPosts = await ctx.db.query("posts").take(SYNC_POST_QUERY_LIMIT);
    const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

    // Upsert incoming posts
    for (const post of args.posts) {
      const existing = existingBySlug.get(post.slug);

      if (existing) {
        // Update existing post
        await ctx.db.patch(existing._id, {
          title: post.title,
          description: post.description,
          content: post.content,
          date: post.date,
          published: post.published,
          tags: post.tags,
          readTime: post.readTime,
          image: post.image,
          showImageAtTop: post.showImageAtTop,
          excerpt: post.excerpt,
          featured: post.featured,
          featuredOrder: post.featuredOrder,
          authorName: post.authorName,
          authorImage: post.authorImage,
          layout: post.layout,
          rightSidebar: post.rightSidebar,
          showFooter: post.showFooter,
          footer: post.footer,
          showSocialFooter: post.showSocialFooter,
          aiChat: post.aiChat,
          blogFeatured: post.blogFeatured,
          newsletter: post.newsletter,
          contactForm: post.contactForm,
          unlisted: post.unlisted,
          docsSection: post.docsSection,
          docsSectionGroup: post.docsSectionGroup,
          docsSectionOrder: post.docsSectionOrder,
          docsSectionGroupOrder: post.docsSectionGroupOrder,
          docsSectionGroupIcon: post.docsSectionGroupIcon,
          docsLanding: post.docsLanding,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new post
        await ctx.db.insert("posts", {
          ...post,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete posts that no longer exist in the repo
    for (const existing of existingPosts) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});

// Public mutation wrapper for sync script (no auth required for build-time sync)
// Respects source field: only syncs posts where source !== "dashboard"
export const syncPostsPublic = mutation({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        content: v.string(),
        date: v.string(),
        published: v.boolean(),
        tags: v.array(v.string()),
        readTime: v.optional(v.string()),
        image: v.optional(v.string()),
        showImageAtTop: v.optional(v.boolean()),
        excerpt: v.optional(v.string()),
        featured: v.optional(v.boolean()),
        featuredOrder: v.optional(v.number()),
        authorName: v.optional(v.string()),
        authorImage: v.optional(v.string()),
        layout: v.optional(v.string()),
        rightSidebar: v.optional(v.boolean()),
        showFooter: v.optional(v.boolean()),
        footer: v.optional(v.string()),
        showSocialFooter: v.optional(v.boolean()),
        aiChat: v.optional(v.boolean()),
        blogFeatured: v.optional(v.boolean()),
        newsletter: v.optional(v.boolean()),
        contactForm: v.optional(v.boolean()),
        unlisted: v.optional(v.boolean()),
        docsSection: v.optional(v.boolean()),
        docsSectionGroup: v.optional(v.string()),
        docsSectionOrder: v.optional(v.number()),
        docsSectionGroupOrder: v.optional(v.number()),
        docsSectionGroupIcon: v.optional(v.string()),
        docsLanding: v.optional(v.boolean()),
        slides: v.optional(v.boolean()),
      }),
    ),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    deleted: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let skipped = 0;
    const versionsToCreate: Array<{
      contentType: "post";
      contentId: string;
      slug: string;
      title: string;
      content: string;
      description?: string;
      source: "sync";
    }> = [];

    const now = Date.now();
    const incomingSlugs = new Set(args.posts.map((p) => p.slug));

    // Get all existing posts
    const existingPosts = await ctx.db.query("posts").take(SYNC_POST_QUERY_LIMIT);
    const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

    // Upsert incoming posts (only if source !== "dashboard")
    for (const post of args.posts) {
      const existing = existingBySlug.get(post.slug);

      if (existing) {
        // Skip dashboard-created and demo posts - don't overwrite them
        if (existing.source === "dashboard" || existing.source === "demo") {
          skipped++;
          continue;
        }
        versionsToCreate.push({
          contentType: "post",
          contentId: existing._id,
          slug: existing.slug,
          title: existing.title,
          content: existing.content,
          description: existing.description,
          source: "sync",
        });
        // Update existing sync post
        await ctx.db.patch(existing._id, {
          title: post.title,
          description: post.description,
          content: post.content,
          date: post.date,
          published: post.published,
          tags: post.tags,
          readTime: post.readTime,
          image: post.image,
          showImageAtTop: post.showImageAtTop,
          excerpt: post.excerpt,
          featured: post.featured,
          featuredOrder: post.featuredOrder,
          authorName: post.authorName,
          authorImage: post.authorImage,
          layout: post.layout,
          rightSidebar: post.rightSidebar,
          showFooter: post.showFooter,
          footer: post.footer,
          showSocialFooter: post.showSocialFooter,
          aiChat: post.aiChat,
          blogFeatured: post.blogFeatured,
          newsletter: post.newsletter,
          contactForm: post.contactForm,
          unlisted: post.unlisted,
          docsSection: post.docsSection,
          docsSectionGroup: post.docsSectionGroup,
          docsSectionOrder: post.docsSectionOrder,
          docsSectionGroupOrder: post.docsSectionGroupOrder,
          docsSectionGroupIcon: post.docsSectionGroupIcon,
          docsLanding: post.docsLanding,
          source: "sync",
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new post with source: "sync"
        await ctx.db.insert("posts", {
          ...post,
          source: "sync",
          lastSyncedAt: now,
        });
        created++;
      }
    }

    if (versionsToCreate.length > 0) {
      await ctx.scheduler.runAfter(0, internal.versions.createVersionsBatch, {
        versions: versionsToCreate,
      });
    }

    // Delete posts that no longer exist in the repo (but not dashboard or demo posts)
    for (const existing of existingPosts) {
      if (!incomingSlugs.has(existing.slug) && existing.source !== "dashboard" && existing.source !== "demo") {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted, skipped };
  },
});

// Public mutation for incrementing view count
export const incrementViewCount = mutation({
  args: {
    slug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const existing = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    } else {
      await ctx.db.insert("viewCounts", {
        slug: args.slug,
        count: 1,
      });
    }

    return null;
  },
});

// Get view count for a post
export const getViewCount = query({
  args: {
    slug: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const viewCount = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return viewCount?.count ?? 0;
  },
});

// Get all unique tags from published posts
export const getAllTags = query({
  args: {},
  returns: v.array(
    v.object({
      tag: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    // Count occurrences of each tag
    const tagCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.unlisted) {
        continue;
      }
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Convert to array and sort by count (descending), then alphabetically
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.tag.localeCompare(b.tag);
      });
  },
});

// Get posts filtered by a specific tag
export const getPostsByTag = query({
  args: {
    tag: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
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
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const filteredPosts: typeof posts = [];
    for (const post of posts) {
      if (post.unlisted) {
        continue;
      }
      if (post.tags.some((tag) => tag.toLowerCase() === args.tag.toLowerCase())) {
        filteredPosts.push(post);
      }
    }

    // Sort by date descending
    const sortedPosts = filteredPosts.sort(
      (a, b) => compareIsoDateDesc(a.date, b.date),
    );

    // Return without content for list view
    return sortedPosts.map((post) => ({
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      featured: post.featured,
      featuredOrder: post.featuredOrder,
      authorName: post.authorName,
      authorImage: post.authorImage,
    }));
  },
});

// Get related posts that share tags with the current post
export const getRelatedPosts = query({
  args: {
    currentSlug: v.string(),
    tags: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      sharedTags: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const maxResults = args.limit ?? 3;

    // Skip if no tags provided
    if (args.tags.length === 0) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const relatedPosts = [];
    for (const post of posts) {
      if (post.slug === args.currentSlug || post.unlisted) {
        continue;
      }
      const sharedTags = countSharedTags(post.tags, args.tags);
      if (sharedTags === 0) {
        continue;
      }
      relatedPosts.push({
        _id: post._id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        tags: post.tags,
        readTime: post.readTime,
        image: post.image,
        excerpt: post.excerpt,
        authorName: post.authorName,
        authorImage: post.authorImage,
        sharedTags,
      });
    }
    relatedPosts.sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      return compareIsoDateDesc(a.date, b.date);
    });

    return relatedPosts.slice(0, maxResults);
  },
});

// Get all unique authors with post counts (for author pages)
export const getAllAuthors = query({
  args: {},
  returns: v.array(
    v.object({
      name: v.string(),
      slug: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    // Count posts per author
    const authorCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.unlisted || !post.authorName) {
        continue;
      }
      if (post.authorName) {
        const count = authorCounts.get(post.authorName) || 0;
        authorCounts.set(post.authorName, count + 1);
      }
    }

    // Convert to array with slugs, sorted by count then name
    return Array.from(authorCounts.entries())
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
  },
});

// Get posts filtered by author slug
export const getPostsByAuthor = query({
  args: {
    authorSlug: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
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
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const filteredPosts: typeof posts = [];
    for (const post of posts) {
      if (!post.authorName || post.unlisted) {
        continue;
      }
      if (authorSlug(post.authorName) === args.authorSlug) {
        filteredPosts.push(post);
      }
    }

    // Sort by date descending
    const sortedPosts = filteredPosts.sort(
      (a, b) => compareIsoDateDesc(a.date, b.date),
    );

    // Return without content for list view
    return sortedPosts.map((post) => ({
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      featured: post.featured,
      featuredOrder: post.featuredOrder,
      authorName: post.authorName,
      authorImage: post.authorImage,
    }));
  },
});

// Get all posts marked for docs section navigation
// Used by DocsSidebar to build the left navigation
export const getDocsPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
      docsSectionGroupOrder: v.optional(v.number()),
      docsSectionGroupIcon: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_docssection", (q) => q.eq("docsSection", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const publishedDocs: typeof posts = [];
    for (const post of posts) {
      if (post.published) {
        publishedDocs.push(post);
      }
    }

    const sortedDocs = publishedDocs.sort(compareDocsOrder);

    return sortedDocs.map((post) => ({
      _id: post._id,
      slug: post.slug,
      title: post.title,
      docsSectionGroup: post.docsSectionGroup,
      docsSectionOrder: post.docsSectionOrder,
      docsSectionGroupOrder: post.docsSectionGroupOrder,
      docsSectionGroupIcon: post.docsSectionGroupIcon,
    }));
  },
});

// Get the docs landing page (post with docsLanding: true)
// Returns null if no landing page is set
export const getDocsLandingPost = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      showImageAtTop: v.optional(v.boolean()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      aiChat: v.optional(v.boolean()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    // Get all docs posts and find one with docsLanding: true
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_docssection", (q) => q.eq("docsSection", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    let landing: (typeof posts)[number] | undefined;
    for (const post of posts) {
      if (post.published && post.docsLanding) {
        landing = post;
        break;
      }
    }

    if (!landing) return null;

    return {
      _id: landing._id,
      slug: landing.slug,
      title: landing.title,
      description: landing.description,
      content: landing.content,
      date: landing.date,
      tags: landing.tags,
      readTime: landing.readTime,
      image: landing.image,
      showImageAtTop: landing.showImageAtTop,
      authorName: landing.authorName,
      authorImage: landing.authorImage,
      docsSectionGroup: landing.docsSectionGroup,
      docsSectionOrder: landing.docsSectionOrder,
      showFooter: landing.showFooter,
      footer: landing.footer,
      aiChat: landing.aiChat,
    };
  },
});

// ---------------------------------------------------------------------------
// Internal query equivalents for server-to-server calls (httpActions, rss, etc.)
// These mirror the public queries but are not exposed on the public API surface.
// ---------------------------------------------------------------------------

export const getAllPostsInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const listedPosts: typeof posts = [];
    for (const post of posts) {
      if (!post.unlisted) {
        listedPosts.push(post);
      }
    }

    const sortedPosts = listedPosts.sort(
      (a, b) => compareIsoDateDesc(a.date, b.date),
    );

    return sortedPosts.map((post) => ({
      _id: post._id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      authorName: post.authorName,
    }));
  },
});

export const getPostBySlugWithContent = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      showSocialFooter: v.optional(v.boolean()),
      aiChat: v.optional(v.boolean()),
      newsletter: v.optional(v.boolean()),
      contactForm: v.optional(v.boolean()),
      docsSection: v.optional(v.boolean()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) {
      return null;
    }

    return {
      _id: post._id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      authorName: post.authorName,
      authorImage: post.authorImage,
      showFooter: post.showFooter,
      footer: post.footer,
      showSocialFooter: post.showSocialFooter,
      aiChat: post.aiChat,
      newsletter: post.newsletter,
      contactForm: post.contactForm,
      docsSection: post.docsSection,
    };
  },
});

export const getAllTagsInternal = internalQuery({
  args: {},
  returns: v.array(v.object({ tag: v.string(), count: v.number() })),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const tagCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.unlisted) {
        continue;
      }
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.tag.localeCompare(b.tag);
      });
  },
});

// Returns all published posts with full content (for export/RSS batch endpoints)
export const getAllPostsWithContentInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      authorName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const listedPosts: typeof posts = [];
    for (const post of posts) {
      if (!post.unlisted) {
        listedPosts.push(post);
      }
    }

    return listedPosts.sort((a, b) => compareIsoDateDesc(a.date, b.date)).map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      authorName: post.authorName,
    }));
  },
});

export const getAllAuthorsInternal = internalQuery({
  args: {},
  returns: v.array(v.object({ name: v.string(), slug: v.string(), count: v.number() })),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_POST_QUERY_LIMIT);

    const authorCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.unlisted || !post.authorName) {
        continue;
      }
      if (post.authorName) {
        authorCounts.set(post.authorName, (authorCounts.get(post.authorName) || 0) + 1);
      }
    }

    return Array.from(authorCounts.entries())
      .map(([name, count]) => ({
        name,
        slug: authorSlug(name),
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
  },
});
