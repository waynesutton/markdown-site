import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostList from "../components/PostList";
import { ArrowLeft, Tag } from "lucide-react";

// Local storage key for tag page view mode preference
const TAG_VIEW_MODE_KEY = "tag-view-mode";

// Tag page component
// Displays all posts that have a specific tag
export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  // Decode the URL-encoded tag
  const decodedTag = tag ? decodeURIComponent(tag) : "";

  // Fetch posts with this tag from Convex
  const posts = useQuery(
    api.posts.getPostsByTag,
    decodedTag ? { tag: decodedTag } : "skip",
  );

  // Fetch all tags for showing count
  const allTags = useQuery(api.posts.getAllTags);

  // Find the tag info for this tag
  const tagInfo = allTags?.find(
    (t) => t.tag.toLowerCase() === decodedTag.toLowerCase(),
  );

  // State for view mode toggle (list or cards)
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  // Load saved view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TAG_VIEW_MODE_KEY);
    if (saved === "list" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  // Toggle view mode and save preference
  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "cards" : "list";
    setViewMode(newMode);
    localStorage.setItem(TAG_VIEW_MODE_KEY, newMode);
  };

  // Update page title
  useEffect(() => {
    if (decodedTag) {
      document.title = `Posts tagged "${decodedTag}" | markdown sync framework`;
    }
    return () => {
      document.title = "markdown sync framework";
    };
  }, [decodedTag]);

  // Handle not found tag
  if (posts !== undefined && posts.length === 0) {
    return (
      <div className="tag-page">
        <nav className="post-nav">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </nav>
        <div className="tag-not-found">
          <h1>No posts found</h1>
          <p>
            No posts with the tag <strong>"{decodedTag}"</strong> were found.
          </p>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-page">
      {/* Navigation with back button */}
      <nav className="post-nav">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </nav>

      {/* Tag page header */}
      <header className="tag-header">
        <div className="tag-header-top">
          <div>
            <div className="tag-title-row">
              <Tag size={24} className="tag-icon" />
              <h1 className="tag-title">{decodedTag}</h1>
            </div>
            <p className="tag-description">
              {tagInfo ? `${tagInfo.count} post${tagInfo.count !== 1 ? "s" : ""}` : "Loading..."}
            </p>
          </div>
          {/* View toggle button */}
          {posts !== undefined && posts.length > 0 && (
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

      {/* Tag posts section */}
      <section className="tag-posts">
        {posts === undefined ? null : (
          <PostList posts={posts} viewMode={viewMode} />
        )}
      </section>
    </div>
  );
}

