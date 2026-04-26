import { mutation, query, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  getStrictDashboardAdminEmail,
  isDashboardAdmin,
  requireDashboardAdmin,
} from "./dashboardAuth";
import { authUserGetByIdHelper, authUserListHelper } from "./authComponent";

const DASHBOARD_ADMIN_QUERY_LIMIT = 25;

function normalizeEmail(email: string | undefined): string | undefined {
  if (!email) {
    return undefined;
  }
  const value = email.toLowerCase().trim();
  return value.length > 0 ? value : undefined;
}

function normalizeSubject(subject: string | undefined): string | undefined {
  if (!subject) {
    return undefined;
  }
  const value = subject.trim();
  return value.length > 0 ? value : undefined;
}

export const isCurrentUserDashboardAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    return await isDashboardAdmin(ctx, identity);
  },
});

// Internal variant for server-to-server calls (httpActions, actions, other mutations)
export const isCurrentUserDashboardAdminInternal = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    return await isDashboardAdmin(ctx, identity);
  },
});

export const isCurrentUserAuthenticated = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity !== null;
  },
});

export const getCurrentDashboardAuthDebug = query({
  args: {},
  returns: v.object({
    isAuthenticated: v.boolean(),
    isDashboardAdmin: v.boolean(),
    identityEmail: v.optional(v.string()),
    authUserEmail: v.optional(v.string()),
    strictAdminEmail: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const strictAdminEmail = getStrictDashboardAdminEmail();
    if (!identity) {
      return {
        isAuthenticated: false,
        isDashboardAdmin: false,
        strictAdminEmail,
      };
    }

    const delimiterIndex = identity.subject.indexOf("|");
    const userId =
      delimiterIndex > 0
        ? identity.subject.slice(0, delimiterIndex)
        : identity.subject;
    const authUser = await authUserGetByIdHelper(ctx, userId);

    return {
      isAuthenticated: true,
      isDashboardAdmin: await isDashboardAdmin(ctx, identity),
      identityEmail: identity.email ?? undefined,
      authUserEmail: authUser?.email,
      strictAdminEmail,
    };
  },
});

export const getDashboardLoginOptions = query({
  args: {},
  returns: v.object({
    githubEnabled: v.boolean(),
    oauthBaseConfigured: v.boolean(),
  }),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const githubEnabled = Boolean(
      process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
    );
    const oauthBaseConfigured = Boolean(
      process.env.CUSTOM_AUTH_SITE_URL ||
        process.env.CONVEX_SITE_URL ||
        process.env.SITE_URL,
    );
    return { githubEnabled, oauthBaseConfigured };
  },
});

export const getAuthSetupStatus = query({
  args: {},
  returns: v.object({
    githubEnabled: v.boolean(),
    oauthBaseConfigured: v.boolean(),
    bootstrapKeyConfigured: v.boolean(),
    strictAdminEmailConfigured: v.boolean(),
    adminCount: v.number(),
    hasAnyAdmin: v.boolean(),
  }),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const githubEnabled = Boolean(
      process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
    );
    const oauthBaseConfigured = Boolean(
      process.env.CUSTOM_AUTH_SITE_URL ||
        process.env.CONVEX_SITE_URL ||
        process.env.SITE_URL,
    );
    const bootstrapKeyConfigured = Boolean(process.env.DASHBOARD_ADMIN_BOOTSTRAP_KEY);
    const strictAdminEmailConfigured = Boolean(getStrictDashboardAdminEmail());
    const adminCount = (await ctx.db
      .query("dashboardAdmins")
      .take(DASHBOARD_ADMIN_QUERY_LIMIT)).length;

    return {
      githubEnabled,
      oauthBaseConfigured,
      bootstrapKeyConfigured,
      strictAdminEmailConfigured,
      adminCount,
      hasAnyAdmin: adminCount > 0,
    };
  },
});

export const listAuthUsersForBootstrap = query({
  args: {
    bootstrapKey: v.string(),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const expectedKey = process.env.DASHBOARD_ADMIN_BOOTSTRAP_KEY;
    if (!expectedKey || args.bootstrapKey !== expectedKey) {
      throw new ConvexError("Unauthorized");
    }

    const result = await authUserListHelper(ctx, {
      limit: 100,
      order: "desc",
      orderBy: "_creationTime",
    });

    const items = Array.isArray(result?.items) ? result.items : [];
    return items.map((item: { _id: string; email?: string; name?: string }) => ({
      id: item._id,
      email: item.email,
      name: item.name,
    }));
  },
});

export const listDashboardAdmins = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("dashboardAdmins"),
      _creationTime: v.number(),
      subject: v.optional(v.string()),
      email: v.optional(v.string()),
      createdAt: v.number(),
      createdBySubject: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);
    return await ctx.db.query("dashboardAdmins").take(DASHBOARD_ADMIN_QUERY_LIMIT);
  },
});

export const grantDashboardAdmin = mutation({
  args: {
    subject: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const caller = await ctx.auth.getUserIdentity();

    const existingAny = await ctx.db.query("dashboardAdmins").first();
    if (existingAny) {
      await requireDashboardAdmin(ctx);
    }

    const requestedSubject = args.subject?.trim();
    const requestedEmail = normalizeEmail(args.email);
    const subject = normalizeSubject(requestedSubject) ?? normalizeSubject(caller?.subject);
    const email = requestedEmail ?? normalizeEmail(caller?.email ?? undefined);

    if (!subject && !email) {
      throw new ConvexError("Must provide subject or email");
    }

    if (subject) {
      const existingBySubject = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_subject", (q) => q.eq("subject", subject))
        .first();
      if (existingBySubject) {
        return null;
      }
    }

    if (email) {
      const existingByEmail = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existingByEmail) {
        return null;
      }
    }

    await ctx.db.insert("dashboardAdmins", {
      subject,
      email,
      createdAt: Date.now(),
      createdBySubject: caller?.subject,
    });

    return null;
  },
});

export const bootstrapDashboardAdmin = mutation({
  args: {
    bootstrapKey: v.string(),
    subject: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    const expectedKey = process.env.DASHBOARD_ADMIN_BOOTSTRAP_KEY;
    if (!expectedKey || args.bootstrapKey !== expectedKey) {
      throw new ConvexError("Unauthorized");
    }

    const subject = normalizeSubject(args.subject);
    const email = normalizeEmail(args.email);

    if (!subject && !email) {
      throw new ConvexError("Must provide subject or email");
    }

    if (subject) {
      const existingBySubject = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_subject", (q) => q.eq("subject", subject))
        .first();
      if (existingBySubject) {
        return null;
      }
    }

    if (email) {
      const existingByEmail = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existingByEmail) {
        return null;
      }
    }

    await ctx.db.insert("dashboardAdmins", {
      subject,
      email,
      createdAt: Date.now(),
      createdBySubject: undefined,
    });

    return null;
  },
});

export const revokeDashboardAdmin = mutation({
  args: {
    subject: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const subject = args.subject?.trim();
    const email = normalizeEmail(args.email);
    if (!subject && !email) {
      throw new ConvexError("Must provide subject or email");
    }

    let target = null;
    if (subject) {
      target = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_subject", (q) => q.eq("subject", subject))
        .first();
    }
    if (!target && email) {
      target = await ctx.db
        .query("dashboardAdmins")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }
    if (!target) {
      return null;
    }

    const adminCount = (await ctx.db
      .query("dashboardAdmins")
      .take(DASHBOARD_ADMIN_QUERY_LIMIT)).length;
    if (adminCount <= 1) {
      throw new ConvexError("Cannot remove the last dashboard admin");
    }

    await ctx.db.delete(target._id);
    return null;
  },
});

