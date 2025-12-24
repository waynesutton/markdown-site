import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Stats from "./pages/Stats";
import Blog from "./pages/Blog";
import Write from "./pages/Write";
import TagPage from "./pages/TagPage";
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

  return (
    <SidebarProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
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
