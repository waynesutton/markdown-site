import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

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
    }),
  ),
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();

    // Sort by date descending
    const sortedPosts = posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted posts
    const listedPosts = posts.filter((p) => !p.unlisted);

    // Sort by date descending
    const sortedPosts = listedPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_blogFeatured", (q) => q.eq("blogFeatured", true))
      .collect();

    // Filter to only published posts and sort by date descending
    const publishedFeatured = posts
      .filter((p) => p.published && !p.unlisted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    // Filter to only published posts and sort by featuredOrder
    const featuredPosts = posts
      .filter((p) => p.published && !p.unlisted)
      .sort((a, b) => {
        const orderA = a.featuredOrder ?? 999;
        const orderB = b.featuredOrder ?? 999;
        return orderA - orderB;
      });

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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

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
      .first();

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
      .collect();

    // Filter posts by date and sort descending, excluding unlisted
    const recentPosts = posts
      .filter((post) => post.date >= args.since && !post.unlisted)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        excerpt: post.excerpt,
      }));

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
    const existingPosts = await ctx.db.query("posts").collect();
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
    const existingPosts = await ctx.db.query("posts").collect();
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

// Get view count for a post
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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out unlisted posts
    const listedPosts = posts.filter((p) => !p.unlisted);

    // Count occurrences of each tag
    const tagCounts = new Map<string, number>();
    for (const post of listedPosts) {
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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter posts that have the specified tag and are not unlisted
    const filteredPosts = posts.filter(
      (post) =>
        !post.unlisted &&
        post.tags.some((t) => t.toLowerCase() === args.tag.toLowerCase()),
    );

    // Sort by date descending
    const sortedPosts = filteredPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
      sharedTags: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const maxResults = args.limit ?? 3;

    // Skip if no tags provided
    if (args.tags.length === 0) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Find posts that share tags, excluding current post and unlisted posts
    const relatedPosts = posts
      .filter((post) => post.slug !== args.currentSlug && !post.unlisted)
      .map((post) => {
        const sharedTags = post.tags.filter((tag) =>
          args.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
        ).length;
        return {
          _id: post._id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: post.date,
          tags: post.tags,
          readTime: post.readTime,
          sharedTags,
        };
      })
      .filter((post) => post.sharedTags > 0)
      .sort((a, b) => {
        // Sort by shared tags count first, then by date
        if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, maxResults);

    return relatedPosts;
  },
});
