import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BlogPost from "../components/BlogPost";
import CopyPageDropdown from "../components/CopyPageDropdown";
import PageSidebar from "../components/PageSidebar";
import RightSidebar from "../components/RightSidebar";
import DocsLayout from "../components/DocsLayout";
import Footer from "../components/Footer";
import SocialFooter from "../components/SocialFooter";
import NewsletterSignup from "../components/NewsletterSignup";
import ContactForm from "../components/ContactForm";
import { extractHeadings } from "../utils/extractHeadings";
import { useSidebar } from "../context/SidebarContext";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Link as LinkIcon, Rss, Tag } from "lucide-react";
import { XLogo, LinkedinLogo } from "@phosphor-icons/react";
import { useState, useEffect, useRef, useCallback } from "react";
import siteConfig from "../config/siteConfig";

// Local storage key for related posts view mode preference
const RELATED_POSTS_VIEW_MODE_KEY = "related-posts-view-mode";

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
  const pageQuery = useQuery(api.pages.getPageBySlug, slug ? { slug } : "skip");
  const postQuery = useQuery(api.posts.getPostBySlug, slug ? { slug } : "skip");

  // Cache last loaded docs content to prevent flash during navigation
  // This implements stale-while-revalidate for seamless transitions
  type DocsCache = { page: typeof pageQuery; post: typeof postQuery };
  const lastDocsContentRef = useRef<DocsCache | null>(null);

  // Determine if this is a docs section page (for caching logic)
  const isDocsContent = siteConfig.docsSection?.enabled && slug;

  // Check if queries are still loading
  const isLoading = pageQuery === undefined || postQuery === undefined;
  const isLoaded = pageQuery !== undefined && postQuery !== undefined;

  // Update cache when both queries have resolved and we have displayable content
  useEffect(() => {
    if (isDocsContent && isLoaded) {
      const hasContent = pageQuery !== null || postQuery !== null;
      if (hasContent) {
        lastDocsContentRef.current = { page: pageQuery, post: postQuery };
      }
    }
  }, [pageQuery, postQuery, isDocsContent, isLoaded]);

  // Use cached data while loading new docs content (stale-while-revalidate)
  // This prevents the blank flash when navigating between docs pages
  const useCache = isDocsContent && isLoading && lastDocsContentRef.current !== null;
  const page = useCache ? lastDocsContentRef.current!.page : pageQuery;
  const post = useCache ? lastDocsContentRef.current!.post : postQuery;

  // Fetch related posts based on current post's tags (only for blog posts, not pages)
  const relatedPosts = useQuery(
    api.posts.getRelatedPosts,
    post && !page
      ? { currentSlug: post.slug, tags: post.tags, limit: 3 }
      : "skip",
  );

  // Fetch footer content from Convex (synced via markdown)
  const footerPage = useQuery(api.pages.getPageBySlug, { slug: "footer" });

  const [copied, setCopied] = useState(false);

  // State for related posts view mode toggle (list or thumbnails)
  const [relatedPostsViewMode, setRelatedPostsViewMode] = useState<"list" | "thumbnails">(
    siteConfig.relatedPosts?.defaultViewMode ?? "thumbnails",
  );

  // Load saved related posts view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RELATED_POSTS_VIEW_MODE_KEY);
    if (saved === "list" || saved === "thumbnails") {
      setRelatedPostsViewMode(saved);
    }
  }, []);

  // Toggle related posts view mode and save preference
  const toggleRelatedPostsViewMode = useCallback(() => {
    setRelatedPostsViewMode((prev) => {
      const newMode = prev === "list" ? "thumbnails" : "list";
      localStorage.setItem(RELATED_POSTS_VIEW_MODE_KEY, newMode);
      return newMode;
    });
  }, []);

  // Scroll to hash anchor after content loads
  // Skip if there's a search query - let the highlighting hook handle scroll
  useEffect(() => {
    // If there's a search query, the highlighting hook handles scrolling to the match
    const searchQuery = new URLSearchParams(location.search).get("q");
    if (searchQuery) return;

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
  }, [location.hash, location.search, page, post]);

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

    // Update twitter:site and twitter:creator if configured
    if (siteConfig.twitter?.site) {
      updateMeta('meta[name="twitter:site"]', "content", siteConfig.twitter.site);
    }
    if (siteConfig.twitter?.creator || post.authorTwitter) {
      updateMeta(
        'meta[name="twitter:creator"]',
        "content",
        post.authorTwitter || siteConfig.twitter?.creator || "",
      );
    }

    // Update canonical URL
    const canonicalUrl = postUrl;
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Update hreflang tags for SEO
    let hreflangEn = document.querySelector(
      'link[hreflang="en"]',
    ) as HTMLLinkElement | null;
    if (!hreflangEn) {
      hreflangEn = document.createElement("link");
      hreflangEn.setAttribute("rel", "alternate");
      hreflangEn.setAttribute("hreflang", "en");
      document.head.appendChild(hreflangEn);
    }
    hreflangEn.setAttribute("href", canonicalUrl);

    let hreflangDefault = document.querySelector(
      'link[hreflang="x-default"]',
    ) as HTMLLinkElement | null;
    if (!hreflangDefault) {
      hreflangDefault = document.createElement("link");
      hreflangDefault.setAttribute("rel", "alternate");
      hreflangDefault.setAttribute("hreflang", "x-default");
      document.head.appendChild(hreflangDefault);
    }
    hreflangDefault.setAttribute("href", canonicalUrl);

    // Cleanup on unmount
    return () => {
      const scriptEl = document.getElementById("json-ld-article");
      if (scriptEl) scriptEl.remove();
    };
  }, [post, page]);

  // Inject SEO meta tags for static pages (canonical, hreflang, og:url, twitter)
  useEffect(() => {
    if (!page || post) return; // Only run for pages, not posts

    const pageUrl = `${SITE_URL}/${page.slug}`;
    const ogImage = page.image
      ? page.image.startsWith("http")
        ? page.image
        : `${SITE_URL}${page.image}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

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
    const description = page.excerpt || `${page.title} - ${SITE_NAME}`;
    updateMeta('meta[name="description"]', "content", description);

    // Update Open Graph meta tags
    updateMeta('meta[property="og:title"]', "content", page.title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:url"]', "content", pageUrl);
    updateMeta('meta[property="og:image"]', "content", ogImage);
    updateMeta('meta[property="og:type"]', "content", "website");

    // Update Twitter Card meta tags
    updateMeta('meta[name="twitter:title"]', "content", page.title);
    updateMeta('meta[name="twitter:description"]', "content", description);
    updateMeta('meta[name="twitter:image"]', "content", ogImage);
    updateMeta('meta[name="twitter:card"]', "content", "summary_large_image");

    // Update twitter:site and twitter:creator if configured
    if (siteConfig.twitter?.site) {
      updateMeta('meta[name="twitter:site"]', "content", siteConfig.twitter.site);
    }
    if (siteConfig.twitter?.creator) {
      updateMeta('meta[name="twitter:creator"]', "content", siteConfig.twitter.creator);
    }

    // Update canonical URL
    const canonicalUrl = pageUrl;
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Update hreflang tags for SEO
    let hreflangEn = document.querySelector(
      'link[hreflang="en"]',
    ) as HTMLLinkElement | null;
    if (!hreflangEn) {
      hreflangEn = document.createElement("link");
      hreflangEn.setAttribute("rel", "alternate");
      hreflangEn.setAttribute("hreflang", "en");
      document.head.appendChild(hreflangEn);
    }
    hreflangEn.setAttribute("href", canonicalUrl);

    let hreflangDefault = document.querySelector(
      'link[hreflang="x-default"]',
    ) as HTMLLinkElement | null;
    if (!hreflangDefault) {
      hreflangDefault = document.createElement("link");
      hreflangDefault.setAttribute("rel", "alternate");
      hreflangDefault.setAttribute("hreflang", "x-default");
      document.head.appendChild(hreflangDefault);
    }
    hreflangDefault.setAttribute("href", canonicalUrl);
  }, [page, post]);

  // Check if we're loading a docs page - keep layout mounted to prevent flash
  const isDocsRoute = siteConfig.docsSection?.enabled && slug;

  // Return null during initial load to avoid flash (Convex data arrives quickly)
  // But for docs pages, show skeleton within DocsLayout to prevent sidebar flash
  if (page === undefined || post === undefined) {
    if (isDocsRoute) {
      // Keep DocsLayout mounted during loading to prevent sidebar flash
      return (
        <DocsLayout headings={[]} currentSlug={slug || ""}>
          <article className="docs-article">
            <div className="docs-article-loading">
              <div className="docs-loading-skeleton docs-loading-title" />
              <div className="docs-loading-skeleton docs-loading-text" />
              <div className="docs-loading-skeleton docs-loading-text" />
              <div className="docs-loading-skeleton docs-loading-text-short" />
            </div>
          </article>
        </DocsLayout>
      );
    }
    return null;
  }

  // If it's a static page, render simplified view
  if (page) {
    // Check if this page should use docs layout
    if (page.docsSection && siteConfig.docsSection?.enabled) {
      const docsHeadings = extractHeadings(page.content);
      return (
        <DocsLayout
          headings={docsHeadings}
          currentSlug={page.slug}
          aiChatEnabled={page.aiChat}
          pageContent={page.content}
        >
          <article className="docs-article">
            <div className="docs-article-actions">
              <CopyPageDropdown
                title={page.title}
                content={page.content}
                url={`${SITE_URL}/${page.slug}`}
                slug={page.slug}
                description={page.excerpt}
              />
            </div>
            {page.showImageAtTop && page.image && (
              <div className="post-header-image">
                <img
                  src={page.image}
                  alt={page.title}
                  className="post-header-image-img"
                  fetchPriority="high"
                />
              </div>
            )}
            <header className="docs-article-header">
              <h1 className="docs-article-title">{page.title}</h1>
              {page.excerpt && (
                <p className="docs-article-description">{page.excerpt}</p>
              )}
            </header>
            <BlogPost content={page.content} slug={page.slug} pageType="page" />
            {siteConfig.footer.enabled &&
              (page.showFooter !== undefined
                ? page.showFooter
                : siteConfig.footer.showOnPages) && (
                <Footer content={page.footer || footerPage?.content} />
              )}
          </article>
        </DocsLayout>
      );
    }

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
          {/* Main content - placed first in DOM for SEO (H1 loads before sidebar H3) */}
          {/* CSS order property handles visual positioning (sidebar on left) */}
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
                  fetchPriority="high"
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

            {/* Contact form - shown when contactForm: true in frontmatter (only if not inline) */}
            {siteConfig.contactForm?.enabled &&
              page.contactForm &&
              !page.content.includes("<!-- contactform -->") && (
                <ContactForm source={`page:${page.slug}`} />
              )}

            {/* Newsletter signup - respects frontmatter override (only if not inline) */}
            {siteConfig.newsletter?.enabled &&
              (page.newsletter !== undefined
                ? page.newsletter
                : siteConfig.newsletter.signup.posts.enabled) &&
              !page.content.includes("<!-- newsletter -->") && (
                <NewsletterSignup source="post" postSlug={page.slug} />
              )}

            {/* Footer - shown inside article at bottom for pages */}
            {siteConfig.footer.enabled &&
              (page.showFooter !== undefined
                ? page.showFooter
                : siteConfig.footer.showOnPages) && (
                <Footer content={page.footer || footerPage?.content} />
              )}

            {/* Social footer - shown inside article at bottom for pages */}
            {siteConfig.socialFooter?.enabled &&
              (page.showSocialFooter !== undefined
                ? page.showSocialFooter
                : siteConfig.socialFooter.showOnPages) && <SocialFooter />}
          </article>

          {/* Left sidebar - TOC (placed after article in DOM for SEO) */}
          {/* CSS order: -1 positions it visually on the left */}
          {hasLeftSidebar && (
            <aside className="post-sidebar-wrapper post-sidebar-left">
              <PageSidebar
                headings={headings}
                activeId={location.hash.slice(1)}
              />
            </aside>
          )}

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

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
    );
  };

  // Check if this post should use docs layout
  if (post.docsSection && siteConfig.docsSection?.enabled) {
    const docsHeadings = extractHeadings(post.content);
    return (
      <DocsLayout
        headings={docsHeadings}
        currentSlug={post.slug}
        aiChatEnabled={post.aiChat}
        pageContent={post.content}
      >
        <article className="docs-article">
          <div className="docs-article-actions">
            <CopyPageDropdown
              title={post.title}
              content={post.content}
              url={`${SITE_URL}/${post.slug}`}
              slug={post.slug}
              description={post.description}
              date={post.date}
              tags={post.tags}
            />
          </div>
          {post.showImageAtTop && post.image && (
            <div className="post-header-image">
              <img
                src={post.image}
                alt={post.title}
                className="post-header-image-img"
                  fetchPriority="high"
              />
            </div>
          )}
          <header className="docs-article-header">
            <h1 className="docs-article-title">{post.title}</h1>
            {post.description && (
              <p className="docs-article-description">{post.description}</p>
            )}
          </header>
          <BlogPost content={post.content} slug={post.slug} pageType="post" />
          {siteConfig.footer.enabled &&
            (post.showFooter !== undefined
              ? post.showFooter
              : siteConfig.footer.showOnPosts) && (
              <Footer content={post.footer || footerPage?.content} />
            )}
        </article>
      </DocsLayout>
    );
  }

  // Extract headings for sidebar TOC (only for posts with layout: "sidebar")
  const headings =
    post?.layout === "sidebar" ? extractHeadings(post.content) : [];
  const hasLeftSidebar = headings.length > 0;
  // Check if right sidebar is enabled (only when explicitly set in frontmatter)
  const hasRightSidebar =
    siteConfig.rightSidebar.enabled && post.rightSidebar === true;
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
        {/* Main content - placed first in DOM for SEO (H1 loads before sidebar H3) */}
        {/* CSS order property handles visual positioning (sidebar on left) */}
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
                  fetchPriority="high"
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
          {/* Blog post content - raw markdown or rendered */}
          <BlogPost content={post.content} slug={post.slug} pageType="post" />

          <footer className="post-footer">
            <div className="post-share">
              <h3 className="post-share-title">Share this post</h3>
            
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
                aria-label="Share on X"
              >
                <XLogo size={16} weight="bold" />
                <span>Post</span>
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="share-button"
                aria-label="Share on LinkedIn"
              >
                <LinkedinLogo size={16} weight="bold" />
                <span>LinkedIn</span>
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
                <div className="related-posts-header">
                  <h3 className="related-posts-title">Related Posts</h3>
                  {siteConfig.relatedPosts?.showViewToggle !== false && (
                    <button
                      className="view-toggle-button"
                      onClick={toggleRelatedPostsViewMode}
                      aria-label={`Switch to ${relatedPostsViewMode === "list" ? "thumbnail" : "list"} view`}
                    >
                      {relatedPostsViewMode === "thumbnails" ? (
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
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* Thumbnail view - shows image, title, description, author */}
                {relatedPostsViewMode === "thumbnails" ? (
                  <div className="related-posts-thumbnails">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        to={`/${relatedPost.slug}`}
                        className="related-post-thumbnail"
                      >
                        {relatedPost.image && (
                          <div className="related-post-thumbnail-image">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="related-post-thumbnail-content">
                          <h4 className="related-post-thumbnail-title">
                            {relatedPost.title}
                          </h4>
                          {(relatedPost.excerpt || relatedPost.description) && (
                            <p className="related-post-thumbnail-excerpt">
                              {relatedPost.excerpt || relatedPost.description}
                            </p>
                          )}
                          <div className="related-post-thumbnail-meta">
                            {relatedPost.authorImage && (
                              <img
                                src={relatedPost.authorImage}
                                alt={relatedPost.authorName || "Author"}
                                className="related-post-thumbnail-author-image"
                              />
                            )}
                            {relatedPost.authorName && (
                              <span className="related-post-thumbnail-author">
                                {relatedPost.authorName}
                              </span>
                            )}
                            {relatedPost.date && (
                              <span className="related-post-thumbnail-date">
                                {format(parseISO(relatedPost.date), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* List view - simple list with title and read time */
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
                )}
              </div>
            )}

            {/* Newsletter signup - respects frontmatter override (only if not inline) */}
            {siteConfig.newsletter?.enabled &&
              (post.newsletter !== undefined
                ? post.newsletter
                : siteConfig.newsletter.signup.posts.enabled) &&
              !post.content.includes("<!-- newsletter -->") && (
                <NewsletterSignup source="post" postSlug={post.slug} />
              )}

            {/* Contact form - shown when contactForm: true in frontmatter (only if not inline) */}
            {siteConfig.contactForm?.enabled &&
              post.contactForm &&
              !post.content.includes("<!-- contactform -->") && (
                <ContactForm source={`post:${post.slug}`} />
              )}
          </footer>

          {/* Footer - shown inside article at bottom for posts */}
          {siteConfig.footer.enabled &&
            (post.showFooter !== undefined
              ? post.showFooter
              : siteConfig.footer.showOnPosts) && (
              <Footer content={post.footer || footerPage?.content} />
            )}

          {/* Social footer - shown inside article at bottom for posts */}
          {siteConfig.socialFooter?.enabled &&
            (post.showSocialFooter !== undefined
              ? post.showSocialFooter
              : siteConfig.socialFooter.showOnPosts) && <SocialFooter />}
        </article>

        {/* Left sidebar - TOC (placed after article in DOM for SEO) */}
        {/* CSS order: -1 positions it visually on the left */}
        {hasLeftSidebar && (
          <aside className="post-sidebar-wrapper post-sidebar-left">
            <PageSidebar
              headings={headings}
              activeId={location.hash.slice(1)}
            />
          </aside>
        )}

        {/* Right sidebar - with optional AI chat support */}
        {hasRightSidebar && (
          <RightSidebar
            aiChatEnabled={post.aiChat}
            pageContent={post.content}
            slug={post.slug}
          />
        )}
      </div>
    </div>
  );
}
