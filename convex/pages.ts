import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireDashboardAdmin } from "./dashboardAuth";

const ADMIN_PAGE_QUERY_LIMIT = 500;
const PUBLIC_PAGE_QUERY_LIMIT = 250;
const SYNC_PAGE_QUERY_LIMIT = 2000;

function comparePageOrder(a: { order?: number; title: string }, b: { order?: number; title: string }): number {
  const orderA = a.order ?? 999;
  const orderB = b.order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return a.title.localeCompare(b.title);
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
    await requireDashboardAdmin(ctx);

    const pages = await ctx.db.query("pages").take(ADMIN_PAGE_QUERY_LIMIT);

    // Sort by order, then by title
    const sortedPages = pages.sort(comparePageOrder);

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
    await ctx.auth.getUserIdentity();
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_PAGE_QUERY_LIMIT);

    const visiblePages: typeof pages = [];
    for (const page of pages) {
      // Default to visible for backwards compatibility.
      if (page.showInNav !== false) {
        visiblePages.push(page);
      }
    }

    const sortedPages = visiblePages.sort(comparePageOrder);

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
    await ctx.auth.getUserIdentity();
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(PUBLIC_PAGE_QUERY_LIMIT);

    const featuredPages: typeof pages = [];
    for (const page of pages) {
      if (page.published) {
        featuredPages.push(page);
      }
    }
    featuredPages.sort(compareFeaturedOrder);

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
    await ctx.auth.getUserIdentity();
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

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
    await ctx.auth.getUserIdentity();
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_docssection", (q) => q.eq("docsSection", true))
      .take(PUBLIC_PAGE_QUERY_LIMIT);

    const publishedDocs: typeof pages = [];
    for (const page of pages) {
      if (page.published) {
        publishedDocs.push(page);
      }
    }

    const sortedDocs = publishedDocs.sort(compareDocsOrder);

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
      excerpt: v.optional(v.string()),
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
    // Get all docs pages and find one with docsLanding: true
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_docssection", (q) => q.eq("docsSection", true))
      .take(PUBLIC_PAGE_QUERY_LIMIT);

    let landing: (typeof pages)[number] | undefined;
    for (const page of pages) {
      if (page.published && page.docsLanding) {
        landing = page;
        break;
      }
    }

    if (!landing) return null;

    return {
      _id: landing._id,
      slug: landing.slug,
      title: landing.title,
      content: landing.content,
      excerpt: landing.excerpt,
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
    await ctx.auth.getUserIdentity();
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let skipped = 0;
    const versionsToCreate: Array<{
      contentType: "page";
      contentId: string;
      slug: string;
      title: string;
      content: string;
      description?: string;
      source: "sync";
    }> = [];

    const now = Date.now();
    const incomingSlugs = new Set(args.pages.map((p) => p.slug));

    // Get all existing pages
    const existingPages = await ctx.db.query("pages").take(SYNC_PAGE_QUERY_LIMIT);
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
        versionsToCreate.push({
          contentType: "page",
          contentId: existing._id,
          slug: existing.slug,
          title: existing.title,
          content: existing.content,
          source: "sync",
        });
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

    if (versionsToCreate.length > 0) {
      await ctx.scheduler.runAfter(0, internal.versions.createVersionsBatch, {
        versions: versionsToCreate,
      });
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

// ---------------------------------------------------------------------------
// Internal query equivalents for server-to-server calls (httpActions, rss, etc.)
// ---------------------------------------------------------------------------

export const getAllPagesInternal = internalQuery({
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
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(PUBLIC_PAGE_QUERY_LIMIT);

    const visiblePages: typeof pages = [];
    for (const page of pages) {
      if (page.showInNav !== false) {
        visiblePages.push(page);
      }
    }

    const sortedPages = visiblePages.sort(comparePageOrder);

    return sortedPages.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      published: page.published,
      order: page.order,
      showInNav: page.showInNav,
      excerpt: page.excerpt,
      image: page.image,
    }));
  },
});

export const getPageBySlugInternal = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      published: v.boolean(),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!page || !page.published) {
      return null;
    }

    return {
      _id: page._id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      published: page.published,
      excerpt: page.excerpt,
      image: page.image,
    };
  },
});
