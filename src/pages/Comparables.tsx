import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BlogSidebar from "../components/BlogSidebar";
import siteConfig from "../config/siteConfig";

// Comparables page component
// Displays a sidebar with links to all comparables
// and a main content area with the comparables intro/description
export default function Comparables() {
  // Fetch all published comparables from Convex
  const comparables = useQuery(api.comparables.getAllComparables);

  // Transform comparables for sidebar (only need slug, title, date)
  const sidebarComparables =
    comparables?.map((comparable) => ({
      slug: comparable.slug,
      title: comparable.title,
      date: comparable.date,
    })) || [];

  return (
    <div className="post-page post-page-with-sidebar">
      <nav className="post-nav post-nav-with-sidebar" />

      <div className="post-content-with-sidebar">
        {/* Left sidebar - comparables navigation */}
        <aside className="post-sidebar-wrapper post-sidebar-left">
          <BlogSidebar posts={sidebarComparables} />
        </aside>

        {/* Main content - comparables intro */}
        <article className="post-article post-article-with-sidebar">
          <header className="post-header">
            <h1 className="post-title">{siteConfig.comparablesPage.title}</h1>
            {siteConfig.comparablesPage.description && (
              <p className="post-description">
                {siteConfig.comparablesPage.description}
              </p>
            )}
          </header>

          {/* Show message when no comparables exist */}
          {comparables !== undefined && comparables.length === 0 && (
            <p className="no-posts">No comparables yet. Check back soon!</p>
          )}
        </article>
      </div>
    </div>
  );
}
