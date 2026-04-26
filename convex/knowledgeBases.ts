import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";

const KB_QUERY_LIMIT = 100;

const visibilityValidator = v.union(v.literal("public"), v.literal("private"));
const apiVisibilityValidator = v.union(
  v.literal("public"),
  v.literal("private"),
  v.literal("off"),
);
const sourceTypeValidator = v.union(
  v.literal("site"),
  v.literal("upload"),
  v.literal("obsidian"),
);

const kbReturnValidator = v.object({
  _id: v.id("knowledgeBases"),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  visibility: visibilityValidator,
  apiEnabled: v.boolean(),
  apiVisibility: apiVisibilityValidator,
  sourceType: sourceTypeValidator,
  pageCount: v.optional(v.number()),
  lastCompiledAt: v.optional(v.number()),
  createdAt: v.number(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

// Public: list knowledge bases visible to the current user
export const listKnowledgeBases = query({
  args: {},
  returns: v.array(kbReturnValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    let kbs;
    if (identity) {
      // Admins see all KBs
      kbs = await ctx.db
        .query("knowledgeBases")
        .withIndex("by_createdat")
        .order("desc")
        .take(KB_QUERY_LIMIT);
    } else {
      // Public visitors only see public KBs
      kbs = await ctx.db
        .query("knowledgeBases")
        .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
        .take(KB_QUERY_LIMIT);
    }

    return kbs.map((kb) => ({
      _id: kb._id,
      slug: kb.slug,
      title: kb.title,
      description: kb.description,
      visibility: kb.visibility,
      apiEnabled: kb.apiEnabled,
      apiVisibility: kb.apiVisibility,
      sourceType: kb.sourceType,
      pageCount: kb.pageCount,
      lastCompiledAt: kb.lastCompiledAt,
      createdAt: kb.createdAt,
    }));
  },
});

// Public: get a single KB by slug
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(kbReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const kb = await ctx.db
      .query("knowledgeBases")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!kb) return null;
    // Private KBs require auth
    if (kb.visibility === "private" && !identity) return null;

    return {
      _id: kb._id,
      slug: kb.slug,
      title: kb.title,
      description: kb.description,
      visibility: kb.visibility,
      apiEnabled: kb.apiEnabled,
      apiVisibility: kb.apiVisibility,
      sourceType: kb.sourceType,
      pageCount: kb.pageCount,
      lastCompiledAt: kb.lastCompiledAt,
      createdAt: kb.createdAt,
    };
  },
});

// Public: create a new knowledge base (requires auth)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    visibility: visibilityValidator,
    sourceType: sourceTypeValidator,
  },
  returns: v.id("knowledgeBases"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Authentication required");

    const slug = slugify(args.title);
    if (!slug) throw new ConvexError("Invalid title");

    // Check for duplicate slugs
    const existing = await ctx.db
      .query("knowledgeBases")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new ConvexError("A knowledge base with this slug already exists");

    return await ctx.db.insert("knowledgeBases", {
      slug,
      title: args.title,
      description: args.description,
      ownerSubject: identity.subject,
      visibility: args.visibility,
      apiEnabled: false,
      apiVisibility: "off",
      sourceType: args.sourceType,
      createdAt: Date.now(),
    });
  },
});

// Public: update KB settings (requires auth)
export const update = mutation({
  args: {
    id: v.id("knowledgeBases"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(visibilityValidator),
    apiEnabled: v.optional(v.boolean()),
    apiVisibility: v.optional(apiVisibilityValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Authentication required");

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.visibility !== undefined) patch.visibility = args.visibility;
    if (args.apiEnabled !== undefined) patch.apiEnabled = args.apiEnabled;
    if (args.apiVisibility !== undefined) patch.apiVisibility = args.apiVisibility;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.id, patch);
    }
    return null;
  },
});

// Public: delete a KB and all its pages (requires auth)
export const remove = mutation({
  args: { id: v.id("knowledgeBases") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Authentication required");

    // Delete all wiki pages in this KB
    const pages = await ctx.db
      .query("wikiPages")
      .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.id))
      .take(1000);
    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    // Delete index entries for this KB
    const indexes = await ctx.db
      .query("wikiIndex")
      .withIndex("by_kbid_and_key", (q) => q.eq("kbId", args.id))
      .take(100);
    for (const idx of indexes) {
      await ctx.db.delete(idx._id);
    }

    // Delete upload jobs for this KB
    const jobs = await ctx.db
      .query("kbUploadJobs")
      .withIndex("by_kbid", (q) => q.eq("kbId", args.id))
      .take(100);
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Internal: list public KBs with API enabled (for HTTP /api/kb endpoint)
export const listPublicKbsForApi = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      sourceType: sourceTypeValidator,
      pageCount: v.optional(v.number()),
      lastCompiledAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const kbs = await ctx.db
      .query("knowledgeBases")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .take(KB_QUERY_LIMIT);

    return kbs
      .filter((kb) => kb.apiEnabled && kb.apiVisibility !== "off")
      .map((kb) => ({
        slug: kb.slug,
        title: kb.title,
        description: kb.description,
        sourceType: kb.sourceType,
        pageCount: kb.pageCount,
        lastCompiledAt: kb.lastCompiledAt,
      }));
  },
});

// Internal: get KB by ID (for HTTP endpoints)
export const getByIdInternal = internalQuery({
  args: { id: v.id("knowledgeBases") },
  returns: v.union(
    v.object({
      _id: v.id("knowledgeBases"),
      slug: v.string(),
      title: v.string(),
      visibility: visibilityValidator,
      apiEnabled: v.boolean(),
      apiVisibility: apiVisibilityValidator,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const kb = await ctx.db.get(args.id);
    if (!kb) return null;
    return {
      _id: kb._id,
      slug: kb.slug,
      title: kb.title,
      visibility: kb.visibility,
      apiEnabled: kb.apiEnabled,
      apiVisibility: kb.apiVisibility,
    };
  },
});

// Internal: get KB by slug (for HTTP endpoints)
export const getBySlugInternal = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("knowledgeBases"),
      slug: v.string(),
      title: v.string(),
      visibility: visibilityValidator,
      apiEnabled: v.boolean(),
      apiVisibility: apiVisibilityValidator,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const kb = await ctx.db
      .query("knowledgeBases")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!kb) return null;
    return {
      _id: kb._id,
      slug: kb.slug,
      title: kb.title,
      visibility: kb.visibility,
      apiEnabled: kb.apiEnabled,
      apiVisibility: kb.apiVisibility,
    };
  },
});

// Internal: update page count after sync/upload
export const updatePageCount = internalMutation({
  args: {
    id: v.id("knowledgeBases"),
    pageCount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      pageCount: args.pageCount,
      lastCompiledAt: Date.now(),
    });
    return null;
  },
});

// Internal: list pages for a specific KB (for HTTP API)
export const listPagesForKb = internalQuery({
  args: { kbId: v.id("knowledgeBases") },
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      lastCompiledAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("wikiPages")
      .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.kbId))
      .take(500);

    return pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      pageType: p.pageType,
      category: p.category,
      lastCompiledAt: p.lastCompiledAt,
    }));
  },
});

// Internal: get a page by slug within a KB (for HTTP API)
export const getPageInKb = internalQuery({
  args: {
    kbId: v.id("knowledgeBases"),
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      backlinks: v.optional(v.array(v.string())),
      sourceSlugs: v.optional(v.array(v.string())),
      lastCompiledAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("wikiPages")
      .withIndex("by_kbid_and_slug", (q) =>
        q.eq("kbId", args.kbId).eq("slug", args.slug),
      )
      .first();

    if (!page) return null;
    return {
      slug: page.slug,
      title: page.title,
      content: page.content,
      pageType: page.pageType,
      category: page.category,
      backlinks: page.backlinks,
      sourceSlugs: page.sourceSlugs,
      lastCompiledAt: page.lastCompiledAt,
    };
  },
});
