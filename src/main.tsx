import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./context/ThemeContext";
import { FontProvider } from "./context/FontContext";
import "./styles/global.css";

// Disable browser scroll restoration to prevent scroll position being restored on navigation
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Lazy load auth wrapper and app.
const AppWithWorkOS = lazy(() => import("./AppWithWorkOS"));

// Minimal loading fallback - no visible text to prevent flash
function LoadingFallback() {
  return <div style={{ minHeight: "100vh" }} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <FontProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppWithWorkOS convex={convex} />
          </Suspense>
        </FontProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
