import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isBunnyConfigured } from "./fs";
import {
  requireDashboardAdmin,
  requireDashboardAdminAction,
} from "./dashboardAuth";

function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_BUCKET &&
      process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY,
  );
}

export const getUploadSettings = query({
  args: {},
  returns: v.object({
    provider: v.union(v.literal("convex"), v.literal("convexfs"), v.literal("r2")),
    providers: v.object({
      convex: v.boolean(),
      convexfs: v.boolean(),
      r2: v.boolean(),
    }),
  }),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    const configuredProvider = process.env.MEDIA_PROVIDER;
    const provider: "convex" | "convexfs" | "r2" =
      configuredProvider === "convexfs" || configuredProvider === "r2"
        ? configuredProvider
        : "convex";

    return {
      provider,
      providers: {
        convex: true,
        convexfs: isBunnyConfigured,
        r2: isR2Configured(),
      },
    };
  },
});

export const generateDirectUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getDirectStorageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const resolveDirectUpload = internalAction({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireDashboardAdminAction(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

