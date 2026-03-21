import { mutation, query, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { fs, isBunnyConfigured } from "./fs";
import {
  requireDashboardAdmin,
  requireDashboardAdminAction,
} from "./dashboardAuth";

// Allowed image MIME types
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storedFileValidator = v.object({
  path: v.string(),
  blobId: v.string(),
  contentType: v.string(),
  size: v.number(),
});

// Check if media uploads are configured
export const isConfigured = query({
  args: {},
  returns: v.object({ configured: v.boolean() }),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    return { configured: isBunnyConfigured };
  },
});

// Commit uploaded file to storage path
export const commitFile = mutation({
  args: {
    blobId: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.object({
    path: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      throw new ConvexError(
        "Media uploads not configured. Set BUNNY_API_KEY, BUNNY_STORAGE_ZONE, and BUNNY_CDN_HOSTNAME in Convex Dashboard."
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(args.contentType)) {
      throw new ConvexError(
        `Invalid file type: ${args.contentType}. Allowed: ${ALLOWED_TYPES.join(", ")}`
      );
    }

    // Validate file size
    if (args.size > MAX_FILE_SIZE) {
      throw new ConvexError(
        `File too large: ${(args.size / 1024 / 1024).toFixed(2)}MB. Max: 10MB`
      );
    }

    // Sanitize filename (remove special chars, preserve extension)
    const sanitizedName = args.filename
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    // Create unique path with timestamp
    const timestamp = Date.now();
    const path = `/uploads/${timestamp}-${sanitizedName}`;

    // Commit file to ConvexFS
    await fs.commitFiles(ctx, [{ path, blobId: args.blobId }]);

    return {
      path,
      filename: sanitizedName,
      contentType: args.contentType,
      size: args.size,
      width: args.width,
      height: args.height,
    };
  },
});

// List files with pagination
export const listFiles = query({
  args: {
    prefix: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(storedFileValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      // Return empty results when not configured
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    return await fs.list(ctx, {
      prefix: args.prefix ?? "/uploads/",
      paginationOpts: args.paginationOpts,
    });
  },
});

// Get file info by path
export const getFileInfo = query({
  args: { path: v.string() },
  returns: v.union(storedFileValidator, v.null()),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      return null;
    }

    const file = await fs.stat(ctx, args.path);

    if (!file) {
      return null;
    }

    return {
      path: file.path,
      blobId: file.blobId,
      contentType: file.contentType,
      size: file.size,
    };
  },
});

// Get signed download URL for a file
export const getDownloadUrl = internalAction({
  args: { path: v.string() },
  returns: v.object({
    url: v.string(),
    expiresIn: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdminAction(ctx);

    if (!fs) {
      throw new ConvexError("Media uploads not configured");
    }

    const file = await fs.stat(ctx, args.path);

    if (!file) {
      throw new ConvexError("File not found");
    }

    // Generate time-limited signed URL
    const url = await fs.getDownloadUrl(ctx, file.blobId);

    return { url, expiresIn: 3600 };
  },
});

// Delete file by path
export const deleteFile = mutation({
  args: { path: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      throw new ConvexError("Media uploads not configured");
    }

    await fs.delete(ctx, args.path);
    return { success: true };
  },
});

// Delete multiple files at once
export const deleteFiles = mutation({
  args: { paths: v.array(v.string()) },
  returns: v.object({
    success: v.boolean(),
    deleted: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      throw new ConvexError("Media uploads not configured");
    }

    let deleted = 0;
    for (const path of args.paths) {
      await fs.delete(ctx, path);
      deleted++;
    }
    return { success: true, deleted };
  },
});

// Set file expiration
export const setFileExpiration = internalAction({
  args: {
    path: v.string(),
    expiresInMs: v.optional(v.number()), // null to remove expiration
  },
  returns: v.object({
    success: v.boolean(),
    expiresAt: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdminAction(ctx);

    if (!fs) {
      throw new ConvexError("Media uploads not configured");
    }

    // Get current file info
    const file = await fs.stat(ctx, args.path);
    if (!file) {
      throw new ConvexError("File not found");
    }

    const expiresAt = args.expiresInMs ? Date.now() + args.expiresInMs : null;

    await fs.transact(ctx, [
      {
        op: "setAttributes",
        source: file,
        attributes: { expiresAt },
      },
    ]);

    return { success: true, expiresAt };
  },
});

// Get total file count
export const getFileCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    if (!fs) {
      return 0;
    }

    const result = await fs.list(ctx, {
      prefix: "/uploads/",
      paginationOpts: { numItems: 1000, cursor: null },
    });
    return result.page.length;
  },
});
