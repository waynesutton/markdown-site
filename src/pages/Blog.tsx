import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostList from "../components/PostList";
import siteConfig from "../config/siteConfig";
import { ArrowLeft } from "lucide-react";

// Local storage key for blog view mode preference
const BLOG_VIEW_MODE_KEY = "blog-view-mode";

// Blog page component
// Displays all published posts in a year-grouped list or card grid
// Controlled by siteConfig.blogPage and siteConfig.postsDisplay settings
export default function Blog() {
  const navigate = useNavigate();

  // Fetch published posts from Convex
  const posts = useQuery(api.posts.getAllPosts);

  // State for view mode toggle (list or cards)
  const [viewMode, setViewMode] = useState<"list" | "cards">(
    siteConfig.blogPage.viewMode,
  );

  // Load saved view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(BLOG_VIEW_MODE_KEY);
    if (saved === "list" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  // Toggle view mode and save preference
  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "cards" : "list";
    setViewMode(newMode);
    localStorage.setItem(BLOG_VIEW_MODE_KEY, newMode);
  };

  // Check if posts should be shown on blog page
  const showPosts = siteConfig.postsDisplay.showOnBlogPage;

  return (
    <div className="blog-page">
      {/* Navigation with back button */}
      <nav className="post-nav">
        <button onClick={() => navigate("/")} className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </nav>

      {/* Blog page header */}
      <header className="blog-header">
        <div className="blog-header-top">
          <div>
        <h1 className="blog-title">{siteConfig.blogPage.title}</h1>
        {siteConfig.blogPage.description && (
              <p className="blog-description">
                {siteConfig.blogPage.description}
              </p>
        )}
          </div>
          {/* View toggle button */}
          {showPosts &&
            siteConfig.blogPage.showViewToggle &&
            posts !== undefined &&
            posts.length > 0 && (
              <button
                className="view-toggle-button"
                onClick={toggleViewMode}
                aria-label={`Switch to ${viewMode === "list" ? "card" : "list"} view`}
              >
                {viewMode === "list" ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                )}
              </button>
            )}
        </div>
      </header>

      {/* Blog posts section */}
      {showPosts && (
        <section className="blog-posts">
          {posts === undefined ? null : posts.length === 0 ? (
            <p className="no-posts">No posts yet. Check back soon!</p>
          ) : (
            <PostList posts={posts} viewMode={viewMode} />
          )}
        </section>
      )}

      {/* Message when posts are disabled on blog page */}
      {!showPosts && (
        <p className="blog-disabled-message">
          Posts are configured to not display on this page. Update{" "}
          <code>postsDisplay.showOnBlogPage</code> in siteConfig to enable.
        </p>
      )}
    </div>
  );
}
