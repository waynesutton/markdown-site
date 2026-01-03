import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Blog from "./pages/Blog";
import Comparables from "./pages/Comparables";
import DocsPage from "./pages/DocsPage";
import Write from "./pages/Write";
import Stats from "./pages/Stats";
import Unsubscribe from "./pages/Unsubscribe";
import TagPage from "./pages/TagPage";
import AuthorPage from "./pages/AuthorPage";
import Callback from "./pages/Callback";
import Layout from "./components/Layout";
import ScrollToTopOnNav from "./components/ScrollToTopOnNav";
import { usePageTracking } from "./hooks/usePageTracking";
import { SidebarProvider } from "./context/SidebarContext";
import siteConfig from "./config/siteConfig";

function App() {
  // Track page views and active sessions
  usePageTracking();
  const location = useLocation();

  // Callback handles OAuth redirect from WorkOS
  if (location.pathname === "/callback") {
    return <Callback />;
  }

  // Determine if we should use a custom homepage
  const useCustomHomepage =
    siteConfig.homepage.type !== "default" && siteConfig.homepage.slug;

  return (
    <SidebarProvider>
      <ScrollToTopOnNav />
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
          {/* Write page route */}
          <Route path="/write" element={<Write />} />
          {/* Unsubscribe route for newsletter */}
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          {/* Blog page route - only enabled when blogPage.enabled is true */}
          {siteConfig.blogPage.enabled && (
            <Route path="/blog" element={<Blog />} />
          )}
          {/* Comparables page route - only enabled when comparablesPage.enabled is true */}
          {siteConfig.comparablesPage.enabled && (
            <Route path="/comparables" element={<Comparables />} />
          )}
          {/* Docs page route - only enabled when docsSection.enabled is true */}
          {siteConfig.docsSection?.enabled && (
            <Route
              path={`/${siteConfig.docsSection.slug}`}
              element={<DocsPage />}
            />
          )}
          {/* Tag page route - displays posts filtered by tag */}
          <Route path="/tags/:tag" element={<TagPage />} />
          {/* Author page route - displays posts by a specific author */}
          <Route path="/author/:authorSlug" element={<AuthorPage />} />
          {/* Catch-all for post/page slugs - must be last */}
          <Route path="/:slug" element={<Post />} />
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

export default App;
