import { client as createConvexAuthClient } from "@robelest/convex-auth/browser";
import type { AuthClient } from "@robelest/convex-auth/client";
import type { InferClientApi } from "@robelest/convex-auth/server";
import type { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { auth as convexAuth } from "../../convex/auth";

export type AppConvexAuthClient = AuthClient<InferClientApi<typeof convexAuth>>;

const clients = new WeakMap<ConvexReactClient, AppConvexAuthClient>();

export function getConvexAuthClient(
  convex: ConvexReactClient,
): AppConvexAuthClient {
  const existing = clients.get(convex);
  if (existing) {
    return existing;
  }

  // The auth client verifies OAuth callbacks during initialization.
  // Keep a singleton per Convex client so one callback code is consumed once.
  const authClient = createConvexAuthClient<InferClientApi<typeof convexAuth>>({
    convex,
    api: api.auth,
  });
  clients.set(convex, authClient);
  return authClient;
}
