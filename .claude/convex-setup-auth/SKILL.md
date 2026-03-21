---
name: convex-setup-auth
description: Set up Convex authentication with proper user management, identity mapping, and access control patterns. Use when implementing auth flows, setting up OAuth providers, or adding role-based access control.
---

# Convex Authentication Setup

Implement secure authentication in Convex with user management and access control.

## When to Use

- Setting up authentication for the first time
- Implementing user management (users table, identity mapping)
- Creating authentication helper functions
- Setting up auth providers (Convex Auth, Clerk, WorkOS AuthKit, Auth0, custom JWT)

## First Step: Choose the Auth Provider

Do not assume a provider. Before writing setup code:

1. Ask the user which auth solution they want, unless the repository already makes it obvious
2. If the repo already uses a provider, continue with that provider unless the user wants to switch
3. If the user has not chosen and the repo does not make it obvious, ask before proceeding

Common options:

- [Convex Auth](https://docs.convex.dev/auth/convex-auth): good default when the user wants auth handled directly in Convex
- [Clerk](https://docs.convex.dev/auth/clerk): use when the app already uses Clerk
- [WorkOS AuthKit](https://docs.convex.dev/auth/authkit/): use when the app already uses WorkOS
- [Auth0](https://docs.convex.dev/auth/auth0): use when the app already uses Auth0
- Custom JWT provider: use when integrating an existing auth system

Look for signals in the repo before asking:
- Dependencies such as `@clerk/*`, `@workos-inc/*`, `@auth0/*`
- Existing files such as `convex/auth.config.ts`, auth middleware, provider wrappers
- Environment variables that clearly point at a provider

## Schema Setup

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
});
```

## Core Helper Functions

### Get Current User

```typescript
// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", q =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

export async function getCurrentUserOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_token", q =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}
```

## User Creation/Upsert

```typescript
// convex/users.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { updatedAt: Date.now() });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      pictureUrl: identity.pictureUrl,
      role: "user",
      createdAt: Date.now(),
    });
  },
});
```

## Access Control Patterns

### Resource Ownership

```typescript
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.userId !== user._id) throw new Error("You can only delete your own tasks");
    await ctx.db.delete(args.taskId);
  },
});
```

### Team-Based Access

```typescript
async function requireTeamAccess(
  ctx: MutationCtx,
  teamId: Id<"teams">
): Promise<{ user: Doc<"users">, membership: Doc<"teamMembers"> }> {
  const user = await getCurrentUser(ctx);
  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", q =>
      q.eq("teamId", teamId).eq("userId", user._id)
    )
    .unique();

  if (!membership) throw new Error("You don't have access to this team");
  return { user, membership };
}
```

## Checklist

- [ ] Chosen the correct auth provider before writing setup code
- [ ] Users table with `tokenIdentifier` index
- [ ] `getCurrentUser` helper function
- [ ] `storeUser` mutation for first sign-in
- [ ] Authentication check in all protected functions
- [ ] Authorization check for resource access
- [ ] Clear error messages ("Not authenticated", "Unauthorized")
- [ ] Client auth provider configured

Source: https://github.com/get-convex/agent-skills
