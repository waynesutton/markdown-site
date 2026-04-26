// App auth wrapper for all auth modes.
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { useEffect, useMemo, useState } from "react";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { authMode, isWorkOSConfigured, workosConfig } from "./utils/workos";
import { getConvexAuthClient } from "./utils/convexAuthClient";
import App from "./App";

interface AppWithWorkOSProps {
  convex: ConvexReactClient;
}

function clearStaleAuthCallbackParams(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("code")) return;

  for (const param of ["code", "state", "error", "error_description"]) {
    url.searchParams.delete(param);
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

// Convex Auth wrapper component that initializes the auth client
// and waits for the initial auth state before rendering children.
function ConvexAuthWrapper({
  convex,
  children,
}: {
  convex: ConvexReactClient;
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  // Create auth client once. This calls convex.setAuth() internally
  // to provide tokens to the Convex client.
  const authClient = useMemo(
    () => getConvexAuthClient(convex),
    [convex],
  );

  // Wait for initial auth state to resolve before rendering.
  // This prevents a flash of unauthenticated state on page load.
  useEffect(() => {
    let staleCallbackTimeout: ReturnType<typeof setTimeout> | undefined;

    // Check if already loaded
    if (!authClient.state.isLoading) {
      setIsLoading(false);
      if (!authClient.state.isAuthenticated) {
        staleCallbackTimeout = setTimeout(clearStaleAuthCallbackParams, 5000);
      }
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = authClient.onChange((state) => {
      if (!state.isLoading) {
        setIsLoading(false);
        if (state.isAuthenticated && staleCallbackTimeout) {
          clearTimeout(staleCallbackTimeout);
          staleCallbackTimeout = undefined;
        }
        if (!state.isAuthenticated && !staleCallbackTimeout) {
          staleCallbackTimeout = setTimeout(clearStaleAuthCallbackParams, 5000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (staleCallbackTimeout) {
        clearTimeout(staleCallbackTimeout);
      }
    };
  }, [authClient]);

  // Show nothing while auth is initializing (prevents flash)
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

export default function AppWithWorkOS({ convex }: AppWithWorkOSProps) {
  if (authMode === "convex-auth") {
    return (
      <ConvexProvider client={convex}>
        <ConvexAuthWrapper convex={convex}>
          <App />
        </ConvexAuthWrapper>
      </ConvexProvider>
    );
  }

  if (authMode === "workos" && isWorkOSConfigured) {
    return (
      <AuthKitProvider
        clientId={workosConfig.clientId}
        redirectUri={workosConfig.redirectUri}
      >
        <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithAuthKit>
      </AuthKitProvider>
    );
  }

  return (
    <ConvexProvider client={convex}>
      {/* No-auth fallback mode for legacy/local development. */}
      <App />
    </ConvexProvider>
  );
}
