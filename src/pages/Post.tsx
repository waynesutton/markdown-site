import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BlogPost from "../components/BlogPost";
import CopyPageDropdown from "../components/CopyPageDropdown";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Link as LinkIcon, Twitter, Rss } from "lucide-react";
import { useState, useEffect } from "react";

// Site configuration
const SITE_URL = "https://markdowncms.netlify.app";
const SITE_NAME = "markdown sync framework";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Check for page first, then post
  const page = useQuery(api.pages.getPageBySlug, slug ? { slug } : "skip");
  const post = useQuery(api.posts.getPostBySlug, slug ? { slug } : "skip");
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
    return (
      <div className="post-page">
        <nav className="post-nav">
          <button onClick={() => navigate("/")} className="back-button">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          {/* Copy page dropdown for static pages */}
          <CopyPageDropdown
            title={page.title}
            content={page.content}
            url={window.location.href}
            slug={page.slug}
            description={page.excerpt}
          />
        </nav>

        <article className="post-article">
          <header className="post-header">
            <h1 className="post-title">{page.title}</h1>
          </header>

          <BlogPost content={page.content} />
        </article>
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

  // Render blog post with full metadata
  return (
    <div className="post-page">
      <nav className="post-nav">
        <button onClick={() => navigate("/")} className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        {/* Copy page dropdown for sharing with full metadata */}
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
      </nav>

      <article className="post-article">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta-header">
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

        <BlogPost content={post.content} />

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
              {post.tags.map((tag) => (
                <span key={tag} className="post-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}
