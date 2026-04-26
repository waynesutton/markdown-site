import type { ActionCtx, QueryCtx } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { authUserGetByIdHelper } from "./authComponent";

type Identity = {
  subject: string;
  email?: string | null;
};

type AuthCtx = {
  auth: {
    getUserIdentity: () => Promise<Identity | null>;
  };
};

type AuthLikeCtx = AuthCtx & {
  db: QueryCtx["db"];
  runQuery: QueryCtx["runQuery"];
};

type ActionLikeCtx = AuthCtx & {
  runQuery: ActionCtx["runQuery"];
};

export function getStrictDashboardAdminEmail(): string | undefined {
  const value = process.env.DASHBOARD_PRIMARY_ADMIN_EMAIL?.toLowerCase().trim();
  return value && value.length > 0 ? value : undefined;
}

// Extract the user ID from a subject string.
// Subject format from @robelest/convex-auth: "userId|sessionId"
function extractUserId(subject: string): string {
  const value = subject.trim();
  const delimiterIndex = value.indexOf("|");
  if (delimiterIndex > 0) {
    return value.slice(0, delimiterIndex);
  }
  return value;
}

function subjectCandidates(subject: string): Array<string> {
  const value = subject.trim();
  const candidates = new Set<string>([value]);
  const delimiterIndex = value.indexOf("|");
  if (delimiterIndex > 0) {
    // Support both legacy stored variants:
    // - userId|sessionId (current format)
    // - userId (just the user ID)
    candidates.add(value.slice(0, delimiterIndex));
    candidates.add(value.slice(delimiterIndex + 1));
  }
  return Array.from(candidates);
}

export async function getAuthenticatedIdentity(ctx: AuthCtx): Promise<Identity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthorized");
  }
  return identity;
}

// Look up the user's email from the auth component's user table.
// This is needed because @robelest/convex-auth doesn't include email in the JWT.
async function getUserEmailFromAuthComponent(
  ctx: AuthLikeCtx,
  subject: string,
): Promise<string | undefined> {
  const userId = extractUserId(subject);
  try {
    const user = await authUserGetByIdHelper(ctx, userId);
    return user?.email ?? undefined;
  } catch {
    return undefined;
  }
}

export async function isDashboardAdmin(
  ctx: AuthLikeCtx,
  identity: Identity,
): Promise<boolean> {
  // First try to get email from identity, then fall back to looking up from auth component
  let normalizedEmail = identity.email?.toLowerCase().trim();

  if (!normalizedEmail) {
    // Email not in identity, look it up from the auth component's user table
    const userEmail = await getUserEmailFromAuthComponent(ctx, identity.subject);
    normalizedEmail = userEmail?.toLowerCase().trim();
  }

  // Strict mode: when DASHBOARD_PRIMARY_ADMIN_EMAIL is set, that email is the
  // ONLY admin. The dashboardAdmins table is bypassed entirely. This is what
  // forks should configure when they want exactly one human admin.
  const strictAdminEmail = getStrictDashboardAdminEmail();
  if (strictAdminEmail) {
    return normalizedEmail === strictAdminEmail;
  }

  // Fallback: dashboardAdmins table allowlist when no strict env email is set.
  let matchedBySubject = false;
  for (const candidate of subjectCandidates(identity.subject)) {
    const bySubject = await ctx.db
      .query("dashboardAdmins")
      .withIndex("by_subject", (q) => q.eq("subject", candidate))
      .first();
    if (bySubject) {
      matchedBySubject = true;
      break;
    }
  }

  let matchedByEmail = false;
  if (normalizedEmail) {
    const byEmail = await ctx.db
      .query("dashboardAdmins")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    matchedByEmail = Boolean(byEmail);
  }

  return matchedBySubject || matchedByEmail;
}

export async function requireDashboardAdmin(ctx: AuthLikeCtx): Promise<Identity> {
  const identity = await getAuthenticatedIdentity(ctx);
  const hasAccess = await isDashboardAdmin(ctx, identity);
  if (!hasAccess) {
    throw new ConvexError("Forbidden");
  }
  return identity;
}

export async function requireDashboardAdminAction(
  ctx: ActionLikeCtx,
): Promise<Identity> {
  const identity = await getAuthenticatedIdentity(ctx);
  const hasAccess = await ctx.runQuery(internal.authAdmin.isCurrentUserDashboardAdminInternal, {});
  if (!hasAccess) {
    throw new ConvexError("Forbidden");
  }
  return identity;
}

