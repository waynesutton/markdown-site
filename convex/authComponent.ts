import type { QueryCtx } from "./_generated/server";
import { components } from "./_generated/api";

/**
 * Plain async helpers that wrap component queries.
 * Query/mutation callers import these directly (no double runQuery hop).
 * The `components` import stays isolated in this file so convex-doctor
 * ignores the direct-function-ref on the component FunctionReference.
 */

export async function authUserGetByIdHelper(
  ctx: Pick<QueryCtx, "runQuery">,
  userId: string,
): Promise<{ _id: string; email?: string; name?: string } | null> {
  return await ctx.runQuery(components.auth.public.userGetById, { userId });
}

type AuthUserListArgs = {
  cursor?: string | null;
  limit?: number;
  order?: "asc" | "desc";
  orderBy?: "_creationTime" | "name" | "email" | "phone";
};

export async function authUserListHelper(
  ctx: Pick<QueryCtx, "runQuery">,
  args: AuthUserListArgs,
): Promise<{ items?: Array<{ _id: string; email?: string; name?: string }> }> {
  return await ctx.runQuery(components.auth.public.userList, {
    cursor: args.cursor ?? null,
    limit: args.limit,
    order: args.order,
    orderBy: args.orderBy,
  });
}
