import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";

const WIKI_PAGE_QUERY_LIMIT = 500;

const wikiPageTypeValidator = v.union(
  v.literal("concept"),
  v.literal("entity"),
  v.literal("comparison"),
  v.literal("overview"),
  v.literal("synthesis"),
);

// Public: list wiki pages, optionally scoped to a knowledge base
// kbId=undefined returns site wiki pages (backward compatible)
export const listWikiPages = query({
  args: {
    pageType: v.optional(v.string()),
    kbId: v.optional(v.id("knowledgeBases")),
  },
  returns: v.array(
    v.object({
      _id: v.id("wikiPages"),
      slug: v.string(),
      title: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      lastCompiledAt: v.number(),
      kbId: v.optional(v.id("knowledgeBases")),
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    let pages;
    if (args.kbId) {
      // Scoped to a specific KB
      pages = await ctx.db
        .query("wikiPages")
        .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.kbId!))
        .take(WIKI_PAGE_QUERY_LIMIT);
    } else if (args.pageType) {
      pages = await ctx.db
        .query("wikiPages")
        .withIndex("by_pagetype", (q) => q.eq("pageType", args.pageType!))
        .take(WIKI_PAGE_QUERY_LIMIT);
    } else {
      // Default: site wiki (kbId is undefined)
      pages = await ctx.db
        .query("wikiPages")
        .withIndex("by_lastcompiledat")
        .order("desc")
        .take(WIKI_PAGE_QUERY_LIMIT);
    }

    return pages.map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      pageType: p.pageType,
      category: p.category,
      lastCompiledAt: p.lastCompiledAt,
      kbId: p.kbId,
    }));
  },
});

// Public: get a single wiki page by slug (public read)
export const getWikiPageBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("wikiPages"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      backlinks: v.optional(v.array(v.string())),
      sourceSlugs: v.optional(v.array(v.string())),
      lastCompiledAt: v.number(),
      lastCompiledBy: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const page = await ctx.db
      .query("wikiPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!page) return null;
    return {
      _id: page._id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      pageType: page.pageType,
      category: page.category,
      backlinks: page.backlinks,
      sourceSlugs: page.sourceSlugs,
      lastCompiledAt: page.lastCompiledAt,
      lastCompiledBy: page.lastCompiledBy,
    };
  },
});

// Public: get wiki index (main TOC page)
export const getWikiIndex = query({
  args: { key: v.optional(v.string()) },
  returns: v.union(
    v.object({
      key: v.string(),
      content: v.string(),
      lastUpdatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const indexKey = args.key || "main";
    const indexDoc = await ctx.db
      .query("wikiIndex")
      .withIndex("by_key", (q) => q.eq("key", indexKey))
      .first();
    if (!indexDoc) return null;
    return {
      key: indexDoc.key,
      content: indexDoc.content,
      lastUpdatedAt: indexDoc.lastUpdatedAt,
    };
  },
});

// Public: get graph data (nodes + edges) from wiki pages for knowledge graph visualization
// Optionally scoped to a specific KB
export const getGraphData = query({
  args: {
    kbId: v.optional(v.id("knowledgeBases")),
  },
  returns: v.object({
    nodes: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        pageType: v.string(),
        category: v.optional(v.string()),
        inboundLinks: v.number(),
        outboundLinks: v.array(v.string()),
      }),
    ),
    edges: v.array(
      v.object({
        source: v.string(),
        target: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    let pages;
    if (args.kbId) {
      pages = await ctx.db
        .query("wikiPages")
        .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.kbId!))
        .take(WIKI_PAGE_QUERY_LIMIT);
    } else {
      pages = await ctx.db
        .query("wikiPages")
        .withIndex("by_lastcompiledat")
        .take(WIKI_PAGE_QUERY_LIMIT);
    }

    const slugSet = new Set(pages.map((p) => p.slug));

    // Count inbound links per slug
    const inboundCount: Record<string, number> = {};
    for (const slug of slugSet) {
      inboundCount[slug] = 0;
    }

    const edges: Array<{ source: string; target: string }> = [];

    for (const page of pages) {
      const backlinks = page.backlinks ?? [];
      for (const target of backlinks) {
        if (slugSet.has(target) && target !== page.slug) {
          edges.push({ source: page.slug, target });
          inboundCount[target] = (inboundCount[target] ?? 0) + 1;
        }
      }
    }

    const nodes = pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      pageType: p.pageType,
      category: p.category,
      inboundLinks: inboundCount[p.slug] ?? 0,
      outboundLinks: (p.backlinks ?? []).filter(
        (b) => slugSet.has(b) && b !== p.slug,
      ),
    }));

    return { nodes, edges };
  },
});

// Public: search wiki pages by content (full text search)
export const searchWikiPages = query({
  args: {
    searchQuery: v.string(),
    kbId: v.optional(v.id("knowledgeBases")),
  },
  returns: v.array(
    v.object({
      _id: v.id("wikiPages"),
      slug: v.string(),
      title: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      lastCompiledAt: v.number(),
      kbId: v.optional(v.id("knowledgeBases")),
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    if (!args.searchQuery.trim()) return [];

    let searchBuilder;
    if (args.kbId) {
      searchBuilder = ctx.db
        .query("wikiPages")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.searchQuery).eq("kbId", args.kbId!),
        );
    } else {
      searchBuilder = ctx.db
        .query("wikiPages")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.searchQuery),
        );
    }

    const pages = await searchBuilder.take(20);

    return pages.map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      pageType: p.pageType,
      category: p.category,
      lastCompiledAt: p.lastCompiledAt,
      kbId: p.kbId,
    }));
  },
});

// Internal: get all wiki pages for compilation
export const getAllWikiPagesInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("wikiPages"),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      pageType: v.string(),
      category: v.optional(v.string()),
      backlinks: v.optional(v.array(v.string())),
      sourceSlugs: v.optional(v.array(v.string())),
    }),
  ),
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("wikiPages")
      .withIndex("by_lastcompiledat")
      .take(WIKI_PAGE_QUERY_LIMIT);

    return pages.map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      pageType: p.pageType,
      category: p.category,
      backlinks: p.backlinks,
      sourceSlugs: p.sourceSlugs,
    }));
  },
});

// Internal: mark job as running + get all content for compilation in one transaction
export const markRunningAndGetContext = internalMutation({
  args: { jobId: v.id("wikiCompilationJobs") },
  returns: v.object({
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
      }),
    ),
    pages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
      }),
    ),
    sources: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        sourceType: v.string(),
      }),
    ),
    existingWikiPages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        pageType: v.string(),
      }),
    ),
  }),
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.jobId, { status: "running" as const });
    return await getCompilationContextHelper(ctx);
  },
});

async function getCompilationContextHelper(ctx: { db: { query: MutationCtx["db"]["query"] } }) {
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_published", (q) => q.eq("published", true))
    .take(WIKI_PAGE_QUERY_LIMIT);

  const pages = await ctx.db
    .query("pages")
    .withIndex("by_published", (q) => q.eq("published", true))
    .take(WIKI_PAGE_QUERY_LIMIT);

  const sources = await ctx.db
    .query("sources")
    .withIndex("by_processed", (q) => q.eq("processed", true))
    .take(WIKI_PAGE_QUERY_LIMIT);

  const wikiPages = await ctx.db
    .query("wikiPages")
    .withIndex("by_lastcompiledat")
    .take(WIKI_PAGE_QUERY_LIMIT);

  return {
    posts: posts
      .filter((p) => !p.unlisted)
      .map((p) => ({ slug: p.slug, title: p.title, content: p.content, tags: p.tags })),
    pages: pages.map((p) => ({ slug: p.slug, title: p.title, content: p.content })),
    sources: sources.map((s) => ({
      slug: s.slug,
      title: s.title,
      content: s.content,
      sourceType: s.sourceType,
    })),
    existingWikiPages: wikiPages.map((w) => ({
      slug: w.slug,
      title: w.title,
      pageType: w.pageType,
    })),
  };
}

// Internal: get all content for compilation context (standalone query version)
export const getCompilationContext = internalQuery({
  args: {},
  returns: v.object({
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
      }),
    ),
    pages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
      }),
    ),
    sources: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        sourceType: v.string(),
      }),
    ),
    existingWikiPages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        pageType: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    return await getCompilationContextHelper(ctx);
  },
});

// Internal: upsert a wiki page
export const upsertWikiPage = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    pageType: wikiPageTypeValidator,
    category: v.optional(v.string()),
    backlinks: v.optional(v.array(v.string())),
    sourceSlugs: v.optional(v.array(v.string())),
    compiledBy: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
  },
  returns: v.object({
    id: v.id("wikiPages"),
    created: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("wikiPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        pageType: args.pageType,
        category: args.category,
        backlinks: args.backlinks,
        sourceSlugs: args.sourceSlugs,
        lastCompiledAt: now,
        lastCompiledBy: args.compiledBy,
        embedding: args.embedding,
      });
      return { id: existing._id, created: false };
    }

    const id = await ctx.db.insert("wikiPages", {
      slug: args.slug,
      title: args.title,
      content: args.content,
      pageType: args.pageType,
      category: args.category,
      backlinks: args.backlinks,
      sourceSlugs: args.sourceSlugs,
      lastCompiledAt: now,
      lastCompiledBy: args.compiledBy,
      embedding: args.embedding,
    });
    return { id, created: true };
  },
});

// Internal: update wiki index
export const updateWikiIndex = internalMutation({
  args: {
    key: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("wikiIndex")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        lastUpdatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("wikiIndex", {
        key: args.key,
        content: args.content,
        lastUpdatedAt: Date.now(),
      });
    }
    return null;
  },
});

// Internal: delete a wiki page by slug (admin action)
export const deleteWikiPage = internalMutation({
  args: { slug: v.string() },
  returns: v.boolean(),
  handler: async (ctx: MutationCtx, args) => {
    const page = await ctx.db
      .query("wikiPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!page) return false;
    await ctx.db.delete(page._id);
    return true;
  },
});

const batchPageSpec = v.object({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  pageType: wikiPageTypeValidator,
  category: v.optional(v.string()),
  backlinks: v.optional(v.array(v.string())),
  sourceSlugs: v.optional(v.array(v.string())),
  compiledBy: v.optional(v.string()),
  embedding: v.optional(v.array(v.float64())),
});

// Batch upsert pages + regenerate wiki index + finalize job in one transaction
export const batchUpsertAndRegenerateIndex = internalMutation({
  args: {
    pages: v.array(batchPageSpec),
    jobId: v.optional(v.id("wikiCompilationJobs")),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    let created = 0;
    let updated = 0;

    for (const spec of args.pages) {
      const existing = await ctx.db
        .query("wikiPages")
        .withIndex("by_slug", (q) => q.eq("slug", spec.slug))
        .first();

      const now = Date.now();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: spec.title,
          content: spec.content,
          pageType: spec.pageType,
          category: spec.category,
          backlinks: spec.backlinks,
          sourceSlugs: spec.sourceSlugs,
          lastCompiledAt: now,
          lastCompiledBy: spec.compiledBy,
          embedding: spec.embedding,
        });
        updated++;
      } else {
        await ctx.db.insert("wikiPages", {
          slug: spec.slug,
          title: spec.title,
          content: spec.content,
          pageType: spec.pageType,
          category: spec.category,
          backlinks: spec.backlinks,
          sourceSlugs: spec.sourceSlugs,
          lastCompiledAt: now,
          lastCompiledBy: spec.compiledBy,
          embedding: spec.embedding,
        });
        created++;
      }
    }

    // Regenerate wiki index in the same transaction
    const allPages = await ctx.db
      .query("wikiPages")
      .withIndex("by_lastcompiledat")
      .take(WIKI_PAGE_QUERY_LIMIT);

    const categories = new Map<string, Array<{ slug: string; title: string; pageType: string }>>();
    for (const page of allPages) {
      const cat = page.category || "Uncategorized";
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push({ slug: page.slug, title: page.title, pageType: page.pageType });
    }

    const lines: Array<string> = [
      "# Wiki index",
      "",
      `${allPages.length} pages compiled.`,
      "",
    ];

    for (const [category, catPages] of Array.from(categories.entries()).sort()) {
      lines.push(`## ${category}`, "");
      for (const page of catPages.sort((a, b) => a.title.localeCompare(b.title))) {
        lines.push(`- [${page.title}](/wiki/${page.slug}.md) (${page.pageType})`);
      }
      lines.push("");
    }

    const indexContent = lines.join("\n");
    const existingIndex = await ctx.db
      .query("wikiIndex")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (existingIndex) {
      await ctx.db.patch(existingIndex._id, {
        content: indexContent,
        lastUpdatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("wikiIndex", {
        key: "main",
        content: indexContent,
        lastUpdatedAt: Date.now(),
      });
    }

    // Finalize the compilation job in the same transaction if provided
    if (args.jobId) {
      await ctx.db.patch(args.jobId, {
        status: "completed" as const,
        pagesCreated: created,
        pagesUpdated: updated,
        completedAt: Date.now(),
      });
    }

    return { created, updated };
  },
});

// Lint all wiki pages and store the report in one transaction
export const lintAndStoreReport = internalMutation({
  args: {
    jobId: v.optional(v.id("wikiCompilationJobs")),
  },
  returns: v.string(),
  handler: async (ctx: MutationCtx, args) => {
    const wikiPages = await ctx.db
      .query("wikiPages")
      .withIndex("by_lastcompiledat")
      .take(WIKI_PAGE_QUERY_LIMIT);

    const slugSet = new Set(wikiPages.map((p) => p.slug));
    const issues: Array<string> = [];

    for (const page of wikiPages) {
      if (page.backlinks) {
        for (const link of page.backlinks) {
          if (!slugSet.has(link)) {
            issues.push(`[${page.slug}] broken backlink to "${link}"`);
          }
        }
      }
      if (page.content.length < 50) {
        issues.push(`[${page.slug}] content too short (${page.content.length} chars)`);
      }
      if (page.content.length > 5000) {
        issues.push(`[${page.slug}] content too long (${page.content.length} chars), consider splitting`);
      }
      if (!page.title.trim()) {
        issues.push(`[${page.slug}] missing title`);
      }
    }

    const report = issues.length > 0
      ? `Wiki lint found ${issues.length} issue(s):\n\n${issues.join("\n")}`
      : "Wiki lint passed with no issues.";

    const existingLint = await ctx.db
      .query("wikiIndex")
      .withIndex("by_key", (q) => q.eq("key", "lint"))
      .first();

    if (existingLint) {
      await ctx.db.patch(existingLint._id, {
        content: report,
        lastUpdatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("wikiIndex", {
        key: "lint",
        content: report,
        lastUpdatedAt: Date.now(),
      });
    }

    // Finalize the lint job in the same transaction if provided
    if (args.jobId) {
      await ctx.db.patch(args.jobId, {
        status: "completed" as const,
        completedAt: Date.now(),
      });
    }

    return report;
  },
});

const syncPageValidator = v.object({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  pageType: v.union(
    v.literal("concept"),
    v.literal("entity"),
    v.literal("overview"),
    v.literal("synthesis"),
    v.literal("comparison"),
  ),
  category: v.optional(v.string()),
  backlinks: v.optional(v.array(v.string())),
  sourceSlugs: v.optional(v.array(v.string())),
});

// Public: sync wiki pages from CLI script (upsert + regenerate index)
// kbId is optional: omit to sync into the site wiki, or pass a KB ID for project-specific sync
export const syncWikiPages = mutation({
  args: {
    pages: v.array(syncPageValidator),
    kbId: v.optional(v.id("knowledgeBases")),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    let created = 0;
    let updated = 0;
    const now = Date.now();

    for (const spec of args.pages) {
      // Look up by kbId + slug if KB-scoped, otherwise by slug alone
      let existing;
      if (args.kbId) {
        existing = await ctx.db
          .query("wikiPages")
          .withIndex("by_kbid_and_slug", (q) =>
            q.eq("kbId", args.kbId!).eq("slug", spec.slug),
          )
          .first();
      } else {
        existing = await ctx.db
          .query("wikiPages")
          .withIndex("by_slug", (q) => q.eq("slug", spec.slug))
          .first();
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: spec.title,
          content: spec.content,
          pageType: spec.pageType,
          category: spec.category,
          backlinks: spec.backlinks || [],
          sourceSlugs: spec.sourceSlugs || [],
          lastCompiledAt: now,
          lastCompiledBy: "sync",
        });
        updated++;
      } else {
        await ctx.db.insert("wikiPages", {
          slug: spec.slug,
          title: spec.title,
          content: spec.content,
          pageType: spec.pageType,
          category: spec.category,
          backlinks: spec.backlinks || [],
          sourceSlugs: spec.sourceSlugs || [],
          lastCompiledAt: now,
          lastCompiledBy: "sync",
          kbId: args.kbId,
        });
        created++;
      }
    }

    // Regenerate wiki index scoped to this KB (or site wiki)
    let allPages;
    if (args.kbId) {
      allPages = await ctx.db
        .query("wikiPages")
        .withIndex("by_kbid_and_slug", (q) => q.eq("kbId", args.kbId!))
        .take(WIKI_PAGE_QUERY_LIMIT);
    } else {
      allPages = await ctx.db
        .query("wikiPages")
        .withIndex("by_lastcompiledat")
        .order("desc")
        .take(WIKI_PAGE_QUERY_LIMIT);
    }

    const indexLines: Array<string> = [`# Wiki Index\n`, `${allPages.length} pages compiled.\n`];
    const byCategory: Record<string, Array<string>> = {};

    for (const p of allPages) {
      const cat = p.category || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(`- **${p.title}** (/${p.slug})`);
    }

    for (const [cat, entries] of Object.entries(byCategory).sort()) {
      indexLines.push(`\n## ${cat}\n`);
      for (const e of entries) indexLines.push(e);
    }

    const indexContent = indexLines.join("\n");

    // Use kbId-scoped index if applicable
    let existingIndex;
    if (args.kbId) {
      existingIndex = await ctx.db
        .query("wikiIndex")
        .withIndex("by_kbid_and_key", (q) =>
          q.eq("kbId", args.kbId!).eq("key", "main"),
        )
        .first();
    } else {
      existingIndex = await ctx.db
        .query("wikiIndex")
        .withIndex("by_key", (q) => q.eq("key", "main"))
        .first();
    }

    if (existingIndex) {
      await ctx.db.patch(existingIndex._id, {
        content: indexContent,
        lastUpdatedAt: now,
      });
    } else {
      await ctx.db.insert("wikiIndex", {
        key: "main",
        content: indexContent,
        lastUpdatedAt: now,
        kbId: args.kbId,
      });
    }

    // Update KB page count if scoped
    if (args.kbId) {
      await ctx.db.patch(args.kbId, {
        pageCount: allPages.length,
        lastCompiledAt: now,
      });
    }

    return { created, updated, total: args.pages.length };
  },
});
