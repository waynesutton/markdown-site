import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BlogPost from "../components/BlogPost";
import CopyPageDropdown from "../components/CopyPageDropdown";
import PageSidebar from "../components/PageSidebar";
import RightSidebar from "../components/RightSidebar";
import { extractHeadings } from "../utils/extractHeadings";
import { useSidebar } from "../context/SidebarContext";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Link as LinkIcon, Twitter, Rss, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import siteConfig from "../config/siteConfig";

// Site configuration - update these for your site (or run npm run configure)
const SITE_URL = "https://www.markdown.fast";
const SITE_NAME = "markdown sync framework";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";

interface PostProps {
  slug?: string; // Optional slug prop when used as homepage
  isHomepage?: boolean; // Flag to indicate this is the homepage
  homepageType?: "page" | "post"; // Type of homepage content
}

export default function Post({
  slug: propSlug,
  isHomepage = false,
  homepageType,
}: PostProps = {}) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setHeadings, setActiveId } = useSidebar();

  // Use prop slug if provided (for homepage), otherwise use route slug
  const slug = propSlug || routeSlug;

  // Check for page first, then post
  const page = useQuery(api.pages.getPageBySlug, slug ? { slug } : "skip");
  const post = useQuery(api.posts.getPostBySlug, slug ? { slug } : "skip");

  // Fetch related posts based on current post's tags (only for blog posts, not pages)
  const relatedPosts = useQuery(
    api.posts.getRelatedPosts,
    post && !page
      ? { currentSlug: post.slug, tags: post.tags, limit: 3 }
      : "skip",
  );

  const [copied, setCopied] = useState(false);

  // Scroll to hash anchor after content loads
  useEffect(() => {
    if (!location.hash) return;
    if (page === undefined && post === undefined) return;

    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash, page, post]);

  // Update sidebar context with headings for mobile menu
  useEffect(() => {
    // Extract headings for pages with sidebar layout
    if (page && page.layout === "sidebar") {
      const pageHeadings = extractHeadings(page.content);
      setHeadings(pageHeadings);
      setActiveId(location.hash.slice(1) || undefined);
    }
    // Extract headings for posts with sidebar layout
    else if (post && post.layout === "sidebar") {
      const postHeadings = extractHeadings(post.content);
      setHeadings(postHeadings);
      setActiveId(location.hash.slice(1) || undefined);
    }
    // Clear headings when no sidebar
    else if (page !== undefined || post !== undefined) {
      setHeadings([]);
      setActiveId(undefined);
    }

    // Cleanup: clear headings when leaving page
    return () => {
      setHeadings([]);
      setActiveId(undefined);
    };
  }, [page, post, location.hash, setHeadings, setActiveId]);

  // Update page title for static pages
  useEffect(() => {
    if (!page) return;
    document.title = `${page.title} | ${SITE_NAME}`;
    return () => {
      document.title = SITE_NAME;
    };
  }, [page]);

  // Inject JSON-LD structured data and Open Graph meta tags for blog posts
  useEffect(() => {
    if (!post || page) return; // Skip if it's a page

    const postUrl = `${SITE_URL}/${post.slug}`;
    const ogImage = post.image
      ? post.image.startsWith("http")
        ? post.image
        : `${SITE_URL}${post.image}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

    // Create JSON-LD script element
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      image: ogImage,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      url: postUrl,
      keywords: post.tags.join(", "),
      articleBody: post.content.substring(0, 500),
      wordCount: post.content.split(/\s+/).length,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "json-ld-article";
    script.textContent = JSON.stringify(jsonLd);

    // Remove existing JSON-LD if present
    const existing = document.getElementById("json-ld-article");
    if (existing) existing.remove();

    document.head.appendChild(script);

    // Update page title and meta description
    document.title = `${post.title} | ${SITE_NAME}`;

    // Helper to update or create meta tag
    const updateMeta = (selector: string, attr: string, value: string) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        const attrName = selector.includes("property=") ? "property" : "name";
        const attrValue = selector.match(/["']([^"']+)["']/)?.[1] || "";
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute(attr, value);
    };

    // Update meta description
    updateMeta('meta[name="description"]', "content", post.description);

    // Update Open Graph meta tags
    updateMeta('meta[property="og:title"]', "content", post.title);
    updateMeta('meta[property="og:description"]', "content", post.description);
    updateMeta('meta[property="og:url"]', "content", postUrl);
    updateMeta('meta[property="og:image"]', "content", ogImage);
    updateMeta('meta[property="og:type"]', "content", "article");

    // Update Twitter Card meta tags
    updateMeta('meta[name="twitter:title"]', "content", post.title);
    updateMeta('meta[name="twitter:description"]', "content", post.description);
    updateMeta('meta[name="twitter:image"]', "content", ogImage);
    updateMeta('meta[name="twitter:card"]', "content", "summary_large_image");

    // Cleanup on unmount
    return () => {
      const scriptEl = document.getElementById("json-ld-article");
      if (scriptEl) scriptEl.remove();
    };
  }, [post, page]);

  // Return null during initial load to avoid flash (Convex data arrives quickly)
  if (page === undefined || post === undefined) {
    return null;
  }

  // If it's a static page, render simplified view
  if (page) {
    // Extract headings for sidebar TOC (only for pages with layout: "sidebar")
    const headings =
      page.layout === "sidebar" ? extractHeadings(page.content) : [];
    const hasLeftSidebar = headings.length > 0;
    // Check if right sidebar is enabled (only when explicitly set in frontmatter)
    const hasRightSidebar =
      siteConfig.rightSidebar.enabled && page.rightSidebar === true;
    const hasAnySidebar = hasLeftSidebar || hasRightSidebar;
    // Track if only right sidebar is enabled (for centering article)
    const hasOnlyRightSidebar = hasRightSidebar && !hasLeftSidebar;

    return (
      <div
        className={`post-page ${hasAnySidebar ? "post-page-with-sidebar" : ""}`}
      >
        <nav
          className={`post-nav ${hasAnySidebar ? "post-nav-with-sidebar" : ""}`}
        >
          {/* Hide back-button when sidebars are enabled or when used as homepage */}
          {!hasAnySidebar && !isHomepage && (
            <button onClick={() => navigate("/")} className="back-button">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
          {/* Only show CopyPageDropdown in nav if no sidebars are enabled */}
          {!hasAnySidebar && (
            <CopyPageDropdown
              title={page.title}
              content={page.content}
              url={window.location.href}
              slug={page.slug}
              description={page.excerpt}
            />
          )}
        </nav>

        <div
          className={`${hasAnySidebar ? "post-content-with-sidebar" : ""} ${hasOnlyRightSidebar ? "post-content-right-sidebar-only" : ""}`}
        >
          {/* Left sidebar - TOC */}
          {hasLeftSidebar && (
            <aside className="post-sidebar-wrapper post-sidebar-left">
              <PageSidebar
                headings={headings}
                activeId={location.hash.slice(1)}
              />
            </aside>
          )}

          {/* Main content */}
          <article
            className={`post-article ${hasAnySidebar ? "post-article-with-sidebar" : ""} ${hasOnlyRightSidebar ? "post-article-centered" : ""}`}
          >
            {/* Display image at top if showImageAtTop is true */}
            {page.showImageAtTop && page.image && (
              <div className="post-header-image">
                <img
                  src={page.image}
                  alt={page.title}
                  className="post-header-image-img"
                />
              </div>
            )}
            <header className="post-header">
              <div className="post-title-row">
                <h1 className="post-title">{page.title}</h1>
                {/* Show CopyPageDropdown aligned with title when sidebars are enabled */}
                {hasAnySidebar && (
                  <div className="post-header-actions">
                    <CopyPageDropdown
                      title={page.title}
                      content={page.content}
                      url={window.location.href}
                      slug={page.slug}
                      description={page.excerpt}
                    />
                  </div>
                )}
              </div>
              {/* Author avatar and name for pages (optional) */}
              {(page.authorImage || page.authorName) && (
                <div className="post-meta-header">
                  <div className="post-author">
                    {page.authorImage && (
                      <img
                        src={page.authorImage}
                        alt={page.authorName || "Author"}
                        className="post-author-image"
                      />
                    )}
                    {page.authorName && (
                      <Link
                        to={`/author/${page.authorName.toLowerCase().replace(/\s+/g, "-")}`}
                        className="post-author-name post-author-link"
                      >
                        {page.authorName}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </header>

            <BlogPost content={page.content} slug={page.slug} pageType="page" />
          </article>

          {/* Right sidebar - with optional AI chat support */}
          {hasRightSidebar && (
            <RightSidebar
              aiChatEnabled={page.aiChat}
              pageContent={page.content}
              slug={page.slug}
            />
          )}
        </div>
      </div>
    );
  }

  // Handle not found (neither page nor post)
  if (post === null) {
    return (
      <div className="post-page">
        <div className="post-not-found">
          <h1>Page not found</h1>
          <p>The page you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
  };

  // Extract headings for sidebar TOC (only for posts with layout: "sidebar")
  const headings =
    post?.layout === "sidebar" ? extractHeadings(post.content) : [];
  const hasLeftSidebar = headings.length > 0;
  // Check if right sidebar is enabled
  // For blog posts: enabled by default unless explicitly disabled (rightSidebar: false)
  const hasRightSidebar =
    siteConfig.rightSidebar.enabled && post.rightSidebar !== false;
  // AI chat is enabled by default for blog posts unless explicitly disabled (aiChat: false)
  const postAiChatEnabled = post.aiChat !== false;
  const hasAnySidebar = hasLeftSidebar || hasRightSidebar;
  // Track if only right sidebar is enabled (for centering article)
  const hasOnlyRightSidebar = hasRightSidebar && !hasLeftSidebar;

  // Render blog post with full metadata
  return (
    <div
      className={`post-page ${hasAnySidebar ? "post-page-with-sidebar" : ""}`}
    >
      <nav
        className={`post-nav ${hasAnySidebar ? "post-nav-with-sidebar" : ""}`}
      >
        {/* Hide back-button when sidebars are enabled or when used as homepage */}
        {!hasAnySidebar && !isHomepage && (
          <button onClick={() => navigate("/")} className="back-button">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}
        {/* Only show CopyPageDropdown in nav if no sidebars are enabled */}
        {!hasAnySidebar && (
          <CopyPageDropdown
            title={post.title}
            content={post.content}
            url={window.location.href}
            slug={post.slug}
            description={post.description}
            date={post.date}
            tags={post.tags}
            readTime={post.readTime}
          />
        )}
      </nav>

      <div
        className={`${hasAnySidebar ? "post-content-with-sidebar" : ""} ${hasOnlyRightSidebar ? "post-content-right-sidebar-only" : ""}`}
      >
        {/* Left sidebar - TOC */}
        {hasLeftSidebar && (
          <aside className="post-sidebar-wrapper post-sidebar-left">
            <PageSidebar
              headings={headings}
              activeId={location.hash.slice(1)}
            />
          </aside>
        )}

        <article
          className={`post-article ${hasAnySidebar ? "post-article-with-sidebar" : ""} ${hasOnlyRightSidebar ? "post-article-centered" : ""}`}
        >
          {/* Display image at top if showImageAtTop is true */}
          {post.showImageAtTop && post.image && (
            <div className="post-header-image">
              <img
                src={post.image}
                alt={post.title}
                className="post-header-image-img"
              />
            </div>
          )}
          <header className="post-header">
            <div className="post-title-row">
              <h1 className="post-title">{post.title}</h1>
              {/* Show CopyPageDropdown aligned with title when sidebars are enabled */}
              {hasAnySidebar && (
                <div className="post-header-actions">
                  <CopyPageDropdown
                    title={post.title}
                    content={post.content}
                    url={window.location.href}
                    slug={post.slug}
                    description={post.description}
                    date={post.date}
                    tags={post.tags}
                    readTime={post.readTime}
                  />
                </div>
              )}
            </div>
            <div className="post-meta-header">
              {/* Author avatar and name (optional) */}
              {(post.authorImage || post.authorName) && (
                <div className="post-author">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.authorName || "Author"}
                      className="post-author-image"
                    />
                  )}
                  {post.authorName && (
                    <Link
                      to={`/author/${post.authorName.toLowerCase().replace(/\s+/g, "-")}`}
                      className="post-author-name post-author-link"
                    >
                      {post.authorName}
                    </Link>
                  )}
                  <span className="post-meta-separator">·</span>
                </div>
              )}
              <time className="post-date">
                {format(parseISO(post.date), "MMMM yyyy")}
              </time>
              {post.readTime && (
                <>
                  <span className="post-meta-separator">·</span>
                  <span className="post-read-time">{post.readTime}</span>
                </>
              )}
            </div>
            {post.description && (
              <p className="post-description">{post.description}</p>
            )}
          </header>

          <BlogPost content={post.content} slug={post.slug} pageType="post" />

          <footer className="post-footer">
            <div className="post-share">
              <button
                onClick={handleCopyLink}
                className="share-button"
                aria-label="Copy link"
              >
                <LinkIcon size={16} />
                <span>{copied ? "Copied!" : "Copy link"}</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="share-button"
                aria-label="Share on Twitter"
              >
                <Twitter size={16} />
                <span>Tweet</span>
              </button>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="share-button"
                aria-label="RSS Feed"
              >
                <Rss size={16} />
                <span>RSS</span>
              </a>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                <Tag size={14} className="post-tags-icon" aria-hidden="true" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                    className="post-tag post-tag-link"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Related posts section - only shown for blog posts with shared tags */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="related-posts">
                <h3 className="related-posts-title">Related Posts</h3>
                <ul className="related-posts-list">
                  {relatedPosts.map((relatedPost) => (
                    <li key={relatedPost.slug} className="related-post-item">
                      <Link
                        to={`/${relatedPost.slug}`}
                        className="related-post-link"
                      >
                        <span className="related-post-title">
                          {relatedPost.title}
                        </span>
                        {relatedPost.readTime && (
                          <span className="related-post-meta">
                            {relatedPost.readTime}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </footer>
        </article>

        {/* Right sidebar - with AI chat enabled by default for blog posts */}
        {hasRightSidebar && (
          <RightSidebar
            aiChatEnabled={postAiChatEnabled}
            pageContent={post.content}
            slug={post.slug}
          />
        )}
      </div>
    </div>
  );
}
