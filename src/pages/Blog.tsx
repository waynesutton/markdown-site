import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BlogSidebar from "../components/BlogSidebar";
import siteConfig from "../config/siteConfig";

// Blog page component
// Displays a sidebar with links to all blog posts
// and a main content area with the blog intro/description
export default function Blog() {
  // Fetch all published posts from Convex
  const posts = useQuery(api.posts.getAllPosts);

  // Transform posts for sidebar (only need slug, title, date)
  const sidebarPosts =
    posts?.map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
    })) || [];

  return (
    <div className="post-page post-page-with-sidebar">
      <nav className="post-nav post-nav-with-sidebar" />

      <div className="post-content-with-sidebar">
        {/* Left sidebar - blog post navigation */}
        <aside className="post-sidebar-wrapper post-sidebar-left">
          <BlogSidebar posts={sidebarPosts} />
        </aside>

        {/* Main content - blog intro */}
        <article className="post-article post-article-with-sidebar">
          <header className="post-header">
            <h1 className="post-title">{siteConfig.blogPage.title}</h1>
            {siteConfig.blogPage.description && (
              <p className="post-description">
                {siteConfig.blogPage.description}
              </p>
            )}
          </header>

          {/* Show message when no posts exist */}
          {posts !== undefined && posts.length === 0 && (
            <p className="no-posts">No posts yet. Check back soon!</p>
          )}
        </article>
      </div>
    </div>
  );
}
