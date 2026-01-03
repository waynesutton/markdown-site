import { Routes, Route, useLocation } from "react-router-dom";
import Post from "./pages/Post";
import Blog from "./pages/Blog";
import TagPage from "./pages/TagPage";
import AuthorPage from "./pages/AuthorPage";
import Callback from "./pages/Callback";
import Layout from "./components/Layout";
import ScrollToTopOnNav from "./components/ScrollToTopOnNav";
import { usePageTracking } from "./hooks/usePageTracking";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  // Track page views and active sessions
  usePageTracking();
  const location = useLocation();

  // Callback handles OAuth redirect from WorkOS
  if (location.pathname === "/callback") {
    return <Callback />;
  }

  return (
    <SidebarProvider>
      <ScrollToTopOnNav />
      <Layout>
        <Routes>
          {/* Homepage is the Blog page */}
          <Route path="/" element={<Blog />} />
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
