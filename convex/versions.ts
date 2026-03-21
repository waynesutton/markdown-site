import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireDashboardAdmin } from "./dashboardAuth";

// Retention period: 3 days in milliseconds
const RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

const versionSnapshotValidator = v.object({
  contentType: v.union(v.literal("post"), v.literal("page")),
  contentId: v.string(),
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  description: v.optional(v.string()),
  source: v.union(
    v.literal("sync"),
    v.literal("dashboard"),
    v.literal("restore"),
  ),
});

// Check if version control is enabled
export const isEnabled = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const setting = await ctx.db
      .query("versionControlSettings")
      .withIndex("by_key", (q) => q.eq("key", "enabled"))
      .unique();
    return setting?.value === true;
  },
});

// Toggle version control on/off
export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const existing = await ctx.db
      .query("versionControlSettings")
      .withIndex("by_key", (q) => q.eq("key", "enabled"))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.enabled });
    } else {
      await ctx.db.insert("versionControlSettings", {
        key: "enabled",
        value: args.enabled,
      });
    }
    return null;
  },
});

// Create a version snapshot (called before updates)
// This is an internal mutation to be called from other mutations
export const createVersion = internalMutation({
  args: versionSnapshotValidator,
  returns: v.union(v.id("contentVersions"), v.null()),
  handler: async (ctx, args) => {
    // Check if version control is enabled
    const setting = await ctx.db
      .query("versionControlSettings")
      .withIndex("by_key", (q) => q.eq("key", "enabled"))
      .unique();

    if (setting?.value !== true) {
      return null;
    }

    // Create version snapshot
    const versionId = await ctx.db.insert("contentVersions", {
      contentType: args.contentType,
      contentId: args.contentId,
      slug: args.slug,
      title: args.title,
      content: args.content,
      description: args.description,
      createdAt: Date.now(),
      source: args.source,
    });

    return versionId;
  },
});

export const createVersionsBatch = internalMutation({
  args: {
    versions: v.array(versionSnapshotValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.versions.length === 0) {
      return null;
    }

    const setting = await ctx.db
      .query("versionControlSettings")
      .withIndex("by_key", (q) => q.eq("key", "enabled"))
      .unique();

    if (setting?.value !== true) {
      return null;
    }

    for (const version of args.versions) {
      await ctx.db.insert("contentVersions", {
        contentType: version.contentType,
        contentId: version.contentId,
        slug: version.slug,
        title: version.title,
        content: version.content,
        description: version.description,
        createdAt: Date.now(),
        source: version.source,
      });
    }

    return null;
  },
});

// Get version history for a piece of content
export const getVersionHistory = query({
  args: {
    contentType: v.union(v.literal("post"), v.literal("page")),
    contentId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("contentVersions"),
      title: v.string(),
      createdAt: v.number(),
      source: v.union(
        v.literal("sync"),
        v.literal("dashboard"),
        v.literal("restore")
      ),
      contentPreview: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const versions = await ctx.db
      .query("contentVersions")
      .withIndex("by_contenttype_and_contentid_and_createdat", (q) =>
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .order("desc")
      .take(100);

    return versions.map((v) => ({
      _id: v._id,
      title: v.title,
      createdAt: v.createdAt,
      source: v.source,
      contentPreview:
        v.content.slice(0, 150) + (v.content.length > 150 ? "..." : ""),
    }));
  },
});

// Get a specific version's full content
export const getVersion = query({
  args: { versionId: v.id("contentVersions") },
  returns: v.union(
    v.object({
      _id: v.id("contentVersions"),
      contentType: v.union(v.literal("post"), v.literal("page")),
      contentId: v.string(),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      description: v.optional(v.string()),
      createdAt: v.number(),
      source: v.union(
        v.literal("sync"),
        v.literal("dashboard"),
        v.literal("restore")
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const version = await ctx.db.get(args.versionId);
    if (!version) return null;

    return {
      _id: version._id,
      contentType: version.contentType,
      contentId: version.contentId,
      slug: version.slug,
      title: version.title,
      content: version.content,
      description: version.description,
      createdAt: version.createdAt,
      source: version.source,
    };
  },
});

// Restore a previous version
export const restoreVersion = mutation({
  args: { versionId: v.id("contentVersions") },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      return { success: false, message: "Version not found" };
    }

    // Get current content to create a backup before restoring
    let currentContent;
    if (version.contentType === "post") {
      currentContent = await ctx.db.get(
        version.contentId as Id<"posts">
      );
    } else {
      currentContent = await ctx.db.get(
        version.contentId as Id<"pages">
      );
    }

    if (!currentContent) {
      return { success: false, message: "Original content not found" };
    }

    // Create backup version of current state before restoring
    await ctx.db.insert("contentVersions", {
      contentType: version.contentType,
      contentId: version.contentId,
      slug: version.slug,
      title: currentContent.title,
      content: currentContent.content,
      description:
        "description" in currentContent ? currentContent.description : undefined,
      createdAt: Date.now(),
      source: "restore",
    });

    // Restore the content
    if (version.contentType === "post") {
      await ctx.db.patch(version.contentId as Id<"posts">, {
        title: version.title,
        content: version.content,
        description: version.description || "",
        lastSyncedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(version.contentId as Id<"pages">, {
        title: version.title,
        content: version.content,
        lastSyncedAt: Date.now(),
      });
    }

    return { success: true, message: "Version restored successfully" };
  },
});

// Clean up versions older than 3 days
// Called by cron job
export const cleanupOldVersions = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_MS;

    // Get old versions using the createdAt index
    const oldVersions = await ctx.db
      .query("contentVersions")
      .withIndex("by_createdat", (q) => q.lt("createdAt", cutoff))
      .take(1000);

    // Delete the batch
    await Promise.all(oldVersions.map((version) => ctx.db.delete(version._id)));

    return oldVersions.length;
  },
});

// Get version control stats (for dashboard display)
export const getStats = query({
  args: {},
  returns: v.object({
    enabled: v.boolean(),
    totalVersions: v.union(v.number(), v.null()),
    oldestVersion: v.union(v.number(), v.null()),
    newestVersion: v.union(v.number(), v.null()),
  }),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    const setting = await ctx.db
      .query("versionControlSettings")
      .withIndex("by_key", (q) => q.eq("key", "enabled"))
      .unique();

    // Avoid full-table scans. contentVersions documents include full markdown content,
    // so collecting all rows can exceed Convex's 16 MB read limit.
    const oldestVersion = await ctx.db
      .query("contentVersions")
      .withIndex("by_createdat")
      .first();

    const newestVersion = await ctx.db
      .query("contentVersions")
      .withIndex("by_createdat")
      .order("desc")
      .first();

    const hasVersions = Boolean(oldestVersion);

    return {
      enabled: setting?.value === true,
      // Returning null here avoids expensive counting logic for large datasets.
      totalVersions: hasVersions ? null : 0,
      oldestVersion: oldestVersion?.createdAt ?? null,
      newestVersion: newestVersion?.createdAt ?? null,
    };
  },
});
