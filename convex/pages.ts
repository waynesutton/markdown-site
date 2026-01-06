import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all pages (published and unpublished) for dashboard admin view
export const listAll = query({
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
      source: v.optional(v.union(v.literal("dashboard"), v.literal("sync"))),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").collect();

    // Sort by order, then by title
    const sortedPages = pages.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    return sortedPages.map((page) => ({
      _id: page._id,
      _creationTime: page._creationTime,
      slug: page.slug,
      title: page.title,
      content: page.content,
      published: page.published,
      order: page.order,
      showInNav: page.showInNav,
      excerpt: page.excerpt,
      image: page.image,
      featured: page.featured,
      featuredOrder: page.featuredOrder,
      authorName: page.authorName,
      authorImage: page.authorImage,
      source: page.source,
    }));
  },
});

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
      docsSection: v.optional(v.boolean()),
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
      docsSection: page.docsSection,
    };
  },
});

// Get all pages marked for docs section navigation
// Used by DocsSidebar to build the left navigation
export const getDocsPages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
      docsSectionGroupOrder: v.optional(v.number()),
      docsSectionGroupIcon: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_docsSection", (q) => q.eq("docsSection", true))
      .collect();

    // Filter to only published pages
    const publishedDocs = pages.filter((p) => p.published);

    // Sort by docsSectionOrder, then by title
    const sortedDocs = publishedDocs.sort((a, b) => {
      const orderA = a.docsSectionOrder ?? 999;
      const orderB = b.docsSectionOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    return sortedDocs.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      docsSectionGroup: page.docsSectionGroup,
      docsSectionOrder: page.docsSectionOrder,
      docsSectionGroupOrder: page.docsSectionGroupOrder,
      docsSectionGroupIcon: page.docsSectionGroupIcon,
    }));
  },
});

// Get the docs landing page (page with docsLanding: true)
// Returns null if no landing page is set
export const getDocsLandingPage = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      image: v.optional(v.string()),
      showImageAtTop: v.optional(v.boolean()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    // Get all docs pages and find one with docsLanding: true
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_docsSection", (q) => q.eq("docsSection", true))
      .collect();

    const landing = pages.find((p) => p.published && p.docsLanding);

    if (!landing) return null;

    return {
      _id: landing._id,
      slug: landing.slug,
      title: landing.title,
      content: landing.content,
      image: landing.image,
      showImageAtTop: landing.showImageAtTop,
      authorName: landing.authorName,
      authorImage: landing.authorImage,
      docsSectionGroup: landing.docsSectionGroup,
      docsSectionOrder: landing.docsSectionOrder,
    };
  },
});

// Public mutation for syncing pages from markdown files
// Respects source field: only syncs pages where source !== "dashboard"
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
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let skipped = 0;

    const now = Date.now();
    const incomingSlugs = new Set(args.pages.map((p) => p.slug));

    // Get all existing pages
    const existingPages = await ctx.db.query("pages").collect();
    const existingBySlug = new Map(existingPages.map((p) => [p.slug, p]));

    // Upsert incoming pages (only if source !== "dashboard")
    for (const page of args.pages) {
      const existing = existingBySlug.get(page.slug);

      if (existing) {
        // Skip dashboard-created pages - don't overwrite them
        if (existing.source === "dashboard") {
          skipped++;
          continue;
        }
        // Update existing sync page
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
          docsSection: page.docsSection,
          docsSectionGroup: page.docsSectionGroup,
          docsSectionOrder: page.docsSectionOrder,
          docsSectionGroupOrder: page.docsSectionGroupOrder,
          docsSectionGroupIcon: page.docsSectionGroupIcon,
          docsLanding: page.docsLanding,
          source: "sync",
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new page with source: "sync"
        await ctx.db.insert("pages", {
          ...page,
          source: "sync",
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete pages that no longer exist in the repo (but not dashboard pages)
    for (const existing of existingPages) {
      if (!incomingSlugs.has(existing.slug) && existing.source !== "dashboard") {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted, skipped };
  },
});
