import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import ScrollToTopOnNav from "./components/ScrollToTopOnNav";
import { usePageTracking } from "./hooks/usePageTracking";
import { SidebarProvider } from "./context/SidebarContext";
import siteConfig from "./config/siteConfig";
import { AgentReadyWidget, UpdateBanner } from "@waynesutton/agent-ready/react";

// Lazy load page components for better LCP and code splitting
const Home = lazy(() => import("./pages/Home"));
const Post = lazy(() => import("./pages/Post"));
const Stats = lazy(() => import("./pages/Stats"));
const Blog = lazy(() => import("./pages/Blog"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const Write = lazy(() => import("./pages/Write"));
const TagPage = lazy(() => import("./pages/TagPage"));
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NewsletterAdmin = lazy(() => import("./pages/NewsletterAdmin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Wiki = lazy(() => import("./pages/Wiki"));
const Callback = lazy(() => import("./pages/Callback"));

// Minimal loading fallback to prevent layout shift
function PageSkeleton() {
  return <div style={{ minHeight: "100vh" }} />;
}

function App() {
  // Track page views and active sessions
  usePageTracking();
  const location = useLocation();

  // Write page renders without Layout (no header, full-screen writing)
  if (location.pathname === "/write") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Write />
      </Suspense>
    );
  }

  // Newsletter admin page renders without Layout (full-screen admin)
  if (location.pathname === "/newsletter-admin") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <NewsletterAdmin />
      </Suspense>
    );
  }

  // Dashboard renders without Layout (full-screen admin)
  if (location.pathname === "/dashboard") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Dashboard />
      </Suspense>
    );
  }

  // Callback handles OAuth redirect from WorkOS
  if (location.pathname === "/callback") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Callback />
      </Suspense>
    );
  }

  // Determine if we should use a custom homepage
  const useCustomHomepage =
    siteConfig.homepage.type !== "default" && siteConfig.homepage.slug;

  const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const convexSiteUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_CONVEX_SITE_URL as string | undefined)
    : undefined;
  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const appUrl = configuredSiteUrl || (isLocalhost ? convexSiteUrl : window.location.origin);

  return (
    <SidebarProvider>
      <ScrollToTopOnNav />
      <Layout>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
          {/* Homepage route - either default Home or custom page/post */}
          <Route
            path="/"
            element={
              useCustomHomepage ? (
                <Post
                  slug={siteConfig.homepage.slug!}
                  isHomepage={true}
                  homepageType={
                    siteConfig.homepage.type === "default"
                      ? undefined
                      : siteConfig.homepage.type
                  }
                />
              ) : (
                <Home />
              )
            }
          />
          {/* Original homepage route (when custom homepage is set) */}
          {useCustomHomepage && (
            <Route
              path={siteConfig.homepage.originalHomeRoute || "/home"}
              element={<Home />}
            />
          )}
          {/* Stats page route - only enabled when statsPage.enabled is true */}
          {siteConfig.statsPage?.enabled && (
            <Route path="/stats" element={<Stats />} />
          )}
          {/* Unsubscribe route for newsletter */}
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          {/* Blog page route - only enabled when blogPage.enabled is true */}
          {siteConfig.blogPage.enabled && (
            <Route path="/blog" element={<Blog />} />
          )}
          {/* Docs page route - only enabled when docsSection.enabled is true */}
          {siteConfig.docsSection?.enabled && (
            <Route
              path={`/${siteConfig.docsSection.slug}`}
              element={<DocsPage />}
            />
          )}
          {/* Wiki page route */}
          <Route path="/wiki" element={<Wiki />} />
          {/* Tag page route - displays posts filtered by tag */}
          <Route path="/tags/:tag" element={<TagPage />} />
          {/* Author page route - displays posts by a specific author */}
          <Route path="/author/:authorSlug" element={<AuthorPage />} />
          {/* Catch-all for post/page slugs - must be last */}
          <Route path="/:slug" element={<Post />} />
          </Routes>
        </Suspense>
      </Layout>
      {appUrl && (
        <>
          <UpdateBanner appUrl={appUrl} />
          <AgentReadyWidget
            appUrl={appUrl}
            position="floating-bottom-right"
            theme="dark"
            mobileCollapse={true}
            mobileBreakpoint={480}
            defaultMobileCollapsed={true}
            desktopCollapse={true}
          />
        </>
      )}
    </SidebarProvider>
  );
}

export default App;
