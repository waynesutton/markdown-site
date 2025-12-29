import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all published pages for navigation
export const getAllPages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      published: v.boolean(),
      order: v.optional(v.number()),
      showInNav: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      layout: v.optional(v.string()),
      rightSidebar: v.optional(v.boolean()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Filter out pages where showInNav is explicitly false
    // Default to true for backwards compatibility (undefined/null = show in nav)
    const visiblePages = pages.filter(
      (page) => page.showInNav !== false,
    );

    // Sort by order (lower numbers first), then by title
    const sortedPages = visiblePages.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    return sortedPages.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      published: page.published,
      order: page.order,
      showInNav: page.showInNav,
      excerpt: page.excerpt,
      image: page.image,
      featured: page.featured,
      featuredOrder: page.featuredOrder,
      authorName: page.authorName,
      authorImage: page.authorImage,
      layout: page.layout,
      rightSidebar: page.rightSidebar,
      showFooter: page.showFooter,
    }));
  },
});

// Get featured pages for the homepage featured section
export const getFeaturedPages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      featuredOrder: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    // Filter to only published pages and sort by featuredOrder
    const featuredPages = pages
      .filter((p) => p.published)
      .sort((a, b) => {
        const orderA = a.featuredOrder ?? 999;
        const orderB = b.featuredOrder ?? 999;
        return orderA - orderB;
      });

    return featuredPages.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      excerpt: page.excerpt,
      image: page.image,
      featuredOrder: page.featuredOrder,
    }));
  },
});

// Get a single page by slug
export const getPageBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      published: v.boolean(),
      order: v.optional(v.number()),
      showInNav: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      showImageAtTop: v.optional(v.boolean()),
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
      contactForm: v.optional(v.boolean()),
      newsletter: v.optional(v.boolean()),
      textAlign: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!page || !page.published) {
      return null;
    }

    return {
      _id: page._id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      published: page.published,
      order: page.order,
      showInNav: page.showInNav,
      excerpt: page.excerpt,
      image: page.image,
      showImageAtTop: page.showImageAtTop,
      featured: page.featured,
      featuredOrder: page.featuredOrder,
      authorName: page.authorName,
      authorImage: page.authorImage,
      layout: page.layout,
      rightSidebar: page.rightSidebar,
      showFooter: page.showFooter,
      footer: page.footer,
      showSocialFooter: page.showSocialFooter,
      aiChat: page.aiChat,
      contactForm: page.contactForm,
      newsletter: page.newsletter,
      textAlign: page.textAlign,
    };
  },
});

// Public mutation for syncing pages from markdown files
export const syncPagesPublic = mutation({
  args: {
    pages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        published: v.boolean(),
        order: v.optional(v.number()),
        showInNav: v.optional(v.boolean()),
        excerpt: v.optional(v.string()),
        image: v.optional(v.string()),
        showImageAtTop: v.optional(v.boolean()),
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
        contactForm: v.optional(v.boolean()),
        newsletter: v.optional(v.boolean()),
        textAlign: v.optional(v.string()),
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
    const incomingSlugs = new Set(args.pages.map((p) => p.slug));

    // Get all existing pages
    const existingPages = await ctx.db.query("pages").collect();
    const existingBySlug = new Map(existingPages.map((p) => [p.slug, p]));

    // Upsert incoming pages
    for (const page of args.pages) {
      const existing = existingBySlug.get(page.slug);

      if (existing) {
        // Update existing page
        await ctx.db.patch(existing._id, {
          title: page.title,
          content: page.content,
          published: page.published,
          order: page.order,
          showInNav: page.showInNav,
          excerpt: page.excerpt,
          image: page.image,
          showImageAtTop: page.showImageAtTop,
          featured: page.featured,
          featuredOrder: page.featuredOrder,
          authorName: page.authorName,
          authorImage: page.authorImage,
          layout: page.layout,
          rightSidebar: page.rightSidebar,
          showFooter: page.showFooter,
          footer: page.footer,
          showSocialFooter: page.showSocialFooter,
          aiChat: page.aiChat,
          contactForm: page.contactForm,
          newsletter: page.newsletter,
          textAlign: page.textAlign,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new page
        await ctx.db.insert("pages", {
          ...page,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete pages that no longer exist in the repo
    for (const existing of existingPages) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});
