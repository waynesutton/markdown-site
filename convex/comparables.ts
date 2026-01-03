import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Get all comparables (published and unpublished) for dashboard admin view
export const listAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    }),
  ),
  handler: async (ctx) => {
    const comparables = await ctx.db.query("comparables").collect();

    // Sort by date descending
    const sortedComparables = comparables.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return sortedComparables.map((comparable) => ({
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      content: comparable.content,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
    }));
  },
});

// Get all published comparables, sorted by date descending
export const getAllComparables = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted comparables
    const listedComparables = comparables.filter((p) => !p.unlisted);

    // Sort by date descending
    const sortedComparables = listedComparables.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Return without content for list view
    return sortedComparables.map((comparable) => ({
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
      layout: comparable.layout,
      rightSidebar: comparable.rightSidebar,
      showFooter: comparable.showFooter,
      blogFeatured: comparable.blogFeatured,
    }));
  },
});

// Get all published comparables, sorted by date descending (alias for backwards compatibility)
export const getAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted comparables
    const listedComparables = comparables.filter((p) => !p.unlisted);

    // Sort by date descending
    const sortedComparables = listedComparables.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Return without content for list view
    return sortedComparables.map((comparable) => ({
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
      layout: comparable.layout,
      rightSidebar: comparable.rightSidebar,
      showFooter: comparable.showFooter,
      blogFeatured: comparable.blogFeatured,
    }));
  },
});

// Get all blog featured comparables for the /blog page (hero + featured row)
// Returns comparables with blogFeatured: true, sorted by date descending
export const getBlogFeaturedPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_blogFeatured", (q) => q.eq("blogFeatured", true))
      .collect();

    // Filter to only published comparables and sort by date descending
    const publishedFeatured = comparables
      .filter((p) => p.published && !p.unlisted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return publishedFeatured.map((comparable) => ({
      _id: comparable._id,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      date: comparable.date,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
    }));
  },
});

// Get featured comparables for the homepage featured section
export const getFeaturedPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
      slug: v.string(),
      title: v.string(),
      excerpt: v.optional(v.string()),
      description: v.string(),
      image: v.optional(v.string()),
      featuredOrder: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    // Filter to only published comparables and sort by featuredOrder
    const featuredComparables = comparables
      .filter((p) => p.published && !p.unlisted)
      .sort((a, b) => {
        const orderA = a.featuredOrder ?? 999;
        const orderB = b.featuredOrder ?? 999;
        return orderA - orderB;
      });

    return featuredComparables.map((comparable) => ({
      _id: comparable._id,
      slug: comparable.slug,
      title: comparable.title,
      excerpt: comparable.excerpt,
      description: comparable.description,
      image: comparable.image,
      featuredOrder: comparable.featuredOrder,
    }));
  },
});

// Get a single comparable by slug
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("comparables"),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const comparable = await ctx.db
      .query("comparables")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!comparable || !comparable.published) {
      return null;
    }

    return {
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      content: comparable.content,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      showImageAtTop: comparable.showImageAtTop,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
      layout: comparable.layout,
      rightSidebar: comparable.rightSidebar,
      showFooter: comparable.showFooter,
      footer: comparable.footer,
      showSocialFooter: comparable.showSocialFooter,
      aiChat: comparable.aiChat,
      newsletter: comparable.newsletter,
      contactForm: comparable.contactForm,
    };
  },
});

// Internal query to get comparable by slug (for newsletter sending)
// Returns comparable details needed for newsletter content
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
    const comparable = await ctx.db
      .query("comparables")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!comparable || !comparable.published) {
      return null;
    }

    return {
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      content: comparable.content,
      excerpt: comparable.excerpt,
    };
  },
});

// Internal query to get recent comparables (for weekly digest)
// Returns published comparables with date >= since parameter
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter comparables by date and sort descending, excluding unlisted
    const recentComparables = comparables
      .filter((comparable) => comparable.date >= args.since && !comparable.unlisted)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((comparable) => ({
        slug: comparable.slug,
        title: comparable.title,
        description: comparable.description,
        date: comparable.date,
        excerpt: comparable.excerpt,
      }));

    return recentComparables;
  },
});

// Internal mutation for syncing comparables from markdown files
export const syncPosts = internalMutation({
  args: {
    comparables: v.array(
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
    const incomingSlugs = new Set(args.comparables.map((p) => p.slug));

    // Get all existing comparables
    const existingComparables = await ctx.db.query("comparables").collect();
    const existingBySlug = new Map(existingComparables.map((p) => [p.slug, p]));

    // Upsert incoming comparables
    for (const comparable of args.comparables) {
      const existing = existingBySlug.get(comparable.slug);

      if (existing) {
        // Update existing comparable
        await ctx.db.patch(existing._id, {
          title: comparable.title,
          description: comparable.description,
          content: comparable.content,
          date: comparable.date,
          published: comparable.published,
          tags: comparable.tags,
          readTime: comparable.readTime,
          image: comparable.image,
          showImageAtTop: comparable.showImageAtTop,
          excerpt: comparable.excerpt,
          featured: comparable.featured,
          featuredOrder: comparable.featuredOrder,
          authorName: comparable.authorName,
          authorImage: comparable.authorImage,
          layout: comparable.layout,
          rightSidebar: comparable.rightSidebar,
          showFooter: comparable.showFooter,
          footer: comparable.footer,
          showSocialFooter: comparable.showSocialFooter,
          aiChat: comparable.aiChat,
          blogFeatured: comparable.blogFeatured,
          newsletter: comparable.newsletter,
          contactForm: comparable.contactForm,
          unlisted: comparable.unlisted,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new comparable
        await ctx.db.insert("comparables", {
          ...comparable,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete comparables that no longer exist in the repo
    for (const existing of existingComparables) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});

// Public mutation wrapper for sync script (no auth required for build-time sync)
export const syncComparablesPublic = mutation({
  args: {
    comparables: v.array(
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
    const incomingSlugs = new Set(args.comparables.map((p) => p.slug));

    // Get all existing comparables
    const existingComparables = await ctx.db.query("comparables").collect();
    const existingBySlug = new Map(existingComparables.map((p) => [p.slug, p]));

    // Upsert incoming comparables
    for (const comparable of args.comparables) {
      const existing = existingBySlug.get(comparable.slug);

      if (existing) {
        // Update existing comparable
        await ctx.db.patch(existing._id, {
          title: comparable.title,
          description: comparable.description,
          content: comparable.content,
          date: comparable.date,
          published: comparable.published,
          tags: comparable.tags,
          readTime: comparable.readTime,
          image: comparable.image,
          showImageAtTop: comparable.showImageAtTop,
          excerpt: comparable.excerpt,
          featured: comparable.featured,
          featuredOrder: comparable.featuredOrder,
          authorName: comparable.authorName,
          authorImage: comparable.authorImage,
          layout: comparable.layout,
          rightSidebar: comparable.rightSidebar,
          showFooter: comparable.showFooter,
          footer: comparable.footer,
          showSocialFooter: comparable.showSocialFooter,
          aiChat: comparable.aiChat,
          blogFeatured: comparable.blogFeatured,
          newsletter: comparable.newsletter,
          contactForm: comparable.contactForm,
          unlisted: comparable.unlisted,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new comparable
        await ctx.db.insert("comparables", {
          ...comparable,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete comparables that no longer exist in the repo
    for (const existing of existingComparables) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});

// Public mutation for incrementing view count
export const incrementViewCount = mutation({
  args: {
    slug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

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

// Get view count for a comparable
export const getViewCount = query({
  args: {
    slug: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const viewCount = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return viewCount?.count ?? 0;
  },
});

// Get all unique tags from published comparables
export const getAllTags = query({
  args: {},
  returns: v.array(
    v.object({
      tag: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted comparables
    const listedComparables = comparables.filter((p) => !p.unlisted);

    // Count occurrences of each tag
    const tagCounts = new Map<string, number>();
    for (const comparable of listedComparables) {
      for (const tag of comparable.tags) {
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

// Get comparables filtered by a specific tag
export const getPostsByTag = query({
  args: {
    tag: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter comparables that have the specified tag and are not unlisted
    const filteredComparables = comparables.filter(
      (comparable) =>
        !comparable.unlisted &&
        comparable.tags.some((t) => t.toLowerCase() === args.tag.toLowerCase()),
    );

    // Sort by date descending
    const sortedComparables = filteredComparables.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Return without content for list view
    return sortedComparables.map((comparable) => ({
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
    }));
  },
});

// Get a single comparable by slug (alias for getPostBySlug for consistency)
export const getComparableBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("comparables"),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const comparable = await ctx.db
      .query("comparables")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!comparable || !comparable.published) {
      return null;
    }

    return {
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      content: comparable.content,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      showImageAtTop: comparable.showImageAtTop,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
      layout: comparable.layout,
      rightSidebar: comparable.rightSidebar,
      showFooter: comparable.showFooter,
      footer: comparable.footer,
      showSocialFooter: comparable.showSocialFooter,
      aiChat: comparable.aiChat,
      newsletter: comparable.newsletter,
      contactForm: comparable.contactForm,
    };
  },
});

// Get related comparables that share tags with the current comparable
export const getRelatedPosts = query({
  args: {
    currentSlug: v.string(),
    tags: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      sharedTags: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const maxResults = args.limit ?? 3;

    // Skip if no tags provided
    if (args.tags.length === 0) {
      return [];
    }

    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Find comparables that share tags, excluding current comparable and unlisted comparables
    const relatedComparables = comparables
      .filter((comparable) => comparable.slug !== args.currentSlug && !comparable.unlisted)
      .map((comparable) => {
        const sharedTags = comparable.tags.filter((tag) =>
          args.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
        ).length;
        return {
          _id: comparable._id,
          slug: comparable.slug,
          title: comparable.title,
          description: comparable.description,
          date: comparable.date,
          tags: comparable.tags,
          readTime: comparable.readTime,
          sharedTags,
        };
      })
      .filter((comparable) => comparable.sharedTags > 0)
      .sort((a, b) => {
        // Sort by shared tags count first, then by date
        if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, maxResults);

    return relatedComparables;
  },
});

// Get related comparables (alias for getRelatedPosts for consistency)
export const getRelatedComparables = query({
  args: {
    currentSlug: v.string(),
    tags: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      sharedTags: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const maxResults = args.limit ?? 3;

    // Skip if no tags provided
    if (args.tags.length === 0) {
      return [];
    }

    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Find comparables that share tags, excluding current comparable and unlisted comparables
    const relatedComparables = comparables
      .filter((comparable) => comparable.slug !== args.currentSlug && !comparable.unlisted)
      .map((comparable) => {
        const sharedTags = comparable.tags.filter((tag) =>
          args.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
        ).length;
        return {
          _id: comparable._id,
          slug: comparable.slug,
          title: comparable.title,
          description: comparable.description,
          date: comparable.date,
          tags: comparable.tags,
          readTime: comparable.readTime,
          sharedTags,
        };
      })
      .filter((comparable) => comparable.sharedTags > 0)
      .sort((a, b) => {
        // Sort by shared tags count first, then by date
        if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, maxResults);

    return relatedComparables;
  },
});

// Get all unique authors with comparable counts (for author pages)
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted comparables and comparables without author
    const publishedComparables = comparables.filter((p) => !p.unlisted && p.authorName);

    // Count comparables per author
    const authorCounts = new Map<string, number>();
    for (const comparable of publishedComparables) {
      if (comparable.authorName) {
        const count = authorCounts.get(comparable.authorName) || 0;
        authorCounts.set(comparable.authorName, count + 1);
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

// Get comparables filtered by author slug
export const getPostsByAuthor = query({
  args: {
    authorSlug: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("comparables"),
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
    const comparables = await ctx.db
      .query("comparables")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter comparables by author slug match and not unlisted
    const filteredComparables = comparables.filter((comparable) => {
      if (!comparable.authorName || comparable.unlisted) return false;
      const slug = comparable.authorName.toLowerCase().replace(/\s+/g, "-");
      return slug === args.authorSlug;
    });

    // Sort by date descending
    const sortedComparables = filteredComparables.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Return without content for list view
    return sortedComparables.map((comparable) => ({
      _id: comparable._id,
      _creationTime: comparable._creationTime,
      slug: comparable.slug,
      title: comparable.title,
      description: comparable.description,
      date: comparable.date,
      published: comparable.published,
      tags: comparable.tags,
      readTime: comparable.readTime,
      image: comparable.image,
      excerpt: comparable.excerpt,
      featured: comparable.featured,
      featuredOrder: comparable.featuredOrder,
      authorName: comparable.authorName,
      authorImage: comparable.authorImage,
    }));
  },
});
