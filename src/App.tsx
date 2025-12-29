import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Stats from "./pages/Stats";
import Blog from "./pages/Blog";
import Write from "./pages/Write";
import TagPage from "./pages/TagPage";
import Unsubscribe from "./pages/Unsubscribe";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import Layout from "./components/Layout";
import { usePageTracking } from "./hooks/usePageTracking";
import { SidebarProvider } from "./context/SidebarContext";
import siteConfig from "./config/siteConfig";

function App() {
  // Track page views and active sessions
  usePageTracking();
  const location = useLocation();

  // Write page renders without Layout (no header, full-screen writing)
  if (location.pathname === "/write") {
    return <Write />;
  }

  // Newsletter admin page renders without Layout (full-screen admin)
  if (location.pathname === "/newsletter-admin") {
    return <NewsletterAdmin />;
  }

  // Determine if we should use a custom homepage
  const useCustomHomepage =
    siteConfig.homepage.type !== "default" && siteConfig.homepage.slug;

  return (
    <SidebarProvider>
      <Layout>
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
          {/* Tag page route - displays posts filtered by tag */}
          <Route path="/tags/:tag" element={<TagPage />} />
          {/* Catch-all for post/page slugs - must be last */}
          <Route path="/:slug" element={<Post />} />
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
