import { createAuth } from "@robelest/convex-auth/server";
import { github, password } from "@robelest/convex-auth/providers";
import { components } from "./_generated/api";

// Convex Auth is the default auth path for new deployments.
// We keep WorkOS JWT config in auth.config.ts for legacy compatibility.
const githubClientId = process.env.AUTH_GITHUB_ID;
const githubClientSecret = process.env.AUTH_GITHUB_SECRET;

const providers = [
  password(),
  ...(githubClientId && githubClientSecret
    ? [
        github({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        }),
      ]
    : []),
];

const auth = createAuth(components.auth, {
  providers,
});

export { auth };
export const { signIn, signOut, store } = auth;
