import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PostList from "../components/PostList";
import FeaturedCards from "../components/FeaturedCards";
import LogoMarquee from "../components/LogoMarquee";
import GitHubContributions from "../components/GitHubContributions";
import Footer from "../components/Footer";
import SocialFooter from "../components/SocialFooter";
import NewsletterSignup from "../components/NewsletterSignup";
import siteConfig from "../config/siteConfig";

// Local storage key for view mode preference
const VIEW_MODE_KEY = "featured-view-mode";

// Strip HTML comments from content, preserving special placeholders
// Removes <!-- ... --> but keeps <!-- newsletter --> and <!-- contactform -->
function stripHtmlComments(content: string): string {
  // First, temporarily replace special placeholders with markers
  const markers = {
    newsletter: "___NEWSLETTER_PLACEHOLDER___",
    contactform: "___CONTACTFORM_PLACEHOLDER___",
  };
  
  let processed = content;
  
  // Replace special placeholders with markers
  processed = processed.replace(/<!--\s*newsletter\s*-->/gi, markers.newsletter);
  processed = processed.replace(/<!--\s*contactform\s*-->/gi, markers.contactform);
  
  // Remove all remaining HTML comments (including multi-line)
  processed = processed.replace(/<!--[\s\S]*?-->/g, "");
  
  // Restore special placeholders
  processed = processed.replace(markers.newsletter, "<!-- newsletter -->");
  processed = processed.replace(markers.contactform, "<!-- contactform -->");
  
  return processed;
}

// Generate slug from text for heading IDs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Extract text content from React children
function getTextContent(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return getTextContent((children as React.ReactElement).props.children);
  }
  return "";
}

// Anchor link component for headings
function HeadingAnchor({ id }: { id: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Copy URL to clipboard, but allow default scroll behavior
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).catch(() => {
      // Silently fail if clipboard API is not available
    });
  };

  return (
    <a
      href={`#${id}`}
      className="heading-anchor"
      onClick={handleClick}
      aria-label="Copy link to heading"
      title="Copy link to heading"
    >
      #
    </a>
  );
}

export default function Home() {
  // Fetch published posts from Convex (only if showing on home)
  const posts = useQuery(
    api.posts.getAllPosts,
    siteConfig.postsDisplay.showOnHome ? {} : "skip",
  );

  // Fetch featured posts and pages from Convex (for list view)
  const featuredPosts = useQuery(api.posts.getFeaturedPosts);
  const featuredPages = useQuery(api.pages.getFeaturedPages);

  // Fetch home intro content from Convex (synced via markdown)
  const homeIntro = useQuery(api.pages.getPageBySlug, { slug: "home-intro" });

  // State for view mode toggle (list or cards)
  const [viewMode, setViewMode] = useState<"list" | "cards">(
    siteConfig.featuredViewMode,
  );

  // Load saved view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "list" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  // Toggle view mode and save preference
  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "cards" : "list";
    setViewMode(newMode);
    localStorage.setItem(VIEW_MODE_KEY, newMode);
  };

  // Render logo gallery based on position config
  const renderLogoGallery = (position: "above-footer" | "below-featured") => {
    if (siteConfig.logoGallery.position === position) {
      return <LogoMarquee config={siteConfig.logoGallery} />;
    }
    return null;
  };

  // Build featured list for list view from Convex data
  const getFeaturedList = () => {
    if (featuredPosts === undefined || featuredPages === undefined) {
      return [];
    }

    // Combine posts and pages, sort by featuredOrder
    const combined = [
      ...featuredPosts.map((p) => ({
        title: p.title,
        slug: p.slug,
        featuredOrder: p.featuredOrder ?? 999,
      })),
      ...featuredPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        featuredOrder: p.featuredOrder ?? 999,
      })),
    ];

    return combined.sort((a, b) => a.featuredOrder - b.featuredOrder);
  };

  const featuredList = getFeaturedList();
  const hasFeaturedContent = featuredList.length > 0;

  // Check if posts should be shown on homepage
  const showPostsOnHome = siteConfig.postsDisplay.showOnHome;

  return (
    <div className="home">
      {/* Header section with intro */}
      <header className="home-header">
        {/* Optional site logo */}
        {siteConfig.logo && (
          <img
            src={siteConfig.logo}
            alt={siteConfig.name}
            className="home-logo"
          />
        )}
        <h1 className="home-name">{siteConfig.name}</h1>

        {/* Home intro from Convex page content (synced via npm run sync) */}
        {homeIntro ? (
          <div
            className="home-intro-content"
            style={{
              textAlign:
                (homeIntro.textAlign as "left" | "center" | "right") || "left",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Open external links in new tab
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="blog-link"
                  >
                    {children}
                  </a>
                ),
                // Headings with blog styling
                h1({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h1 id={id} className="blog-h1">
                      <HeadingAnchor id={id} />
                      {children}
                    </h1>
                  );
                },
                h2({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h2 id={id} className="blog-h2">
                      <HeadingAnchor id={id} />
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h3 id={id} className="blog-h3">
                      <HeadingAnchor id={id} />
                      {children}
                    </h3>
                  );
                },
                h4({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h4 id={id} className="blog-h4">
                      <HeadingAnchor id={id} />
                      {children}
                    </h4>
                  );
                },
                h5({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h5 id={id} className="blog-h5">
                      <HeadingAnchor id={id} />
                      {children}
                    </h5>
                  );
                },
                h6({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h6 id={id} className="blog-h6">
                      <HeadingAnchor id={id} />
                      {children}
                    </h6>
                  );
                },
                // Lists with blog styling
                ul({ children }) {
                  return <ul className="blog-ul">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="blog-ol">{children}</ol>;
                },
                li({ children }) {
                  return <li className="blog-li">{children}</li>;
                },
                // Blockquote with blog styling
                blockquote({ children }) {
                  return <blockquote className="blog-blockquote">{children}</blockquote>;
                },
                // Horizontal rule with blog styling
                hr() {
                  return <hr className="blog-hr" />;
                },
              }}
            >
              {stripHtmlComments(homeIntro.content)}
            </ReactMarkdown>
          </div>
        ) : (
          // Fallback to siteConfig.bio while loading or if page doesn't exist
          <p className="home-bio">{siteConfig.bio}</p>
        )}

        {/* Newsletter signup (below-intro position) */}
        {siteConfig.newsletter?.enabled &&
          siteConfig.newsletter.signup.home.enabled &&
          siteConfig.newsletter.signup.home.position === "below-intro" && (
            <NewsletterSignup source="home" />
          )}

        {/* Featured section with optional view toggle */}
        {hasFeaturedContent && (
          <div className="home-featured">
            <div className="home-featured-header">
              <p className="home-featured-intro">{siteConfig.featuredTitle}</p>
              {siteConfig.showViewToggle && (
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

            {/* Render list or card view based on mode */}
            {viewMode === "list" ? (
              <ul className="home-featured-list">
                {featuredList.map((item) => (
                  <li key={item.slug}>
                    <Link to={`/${item.slug}`} className="home-featured-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <FeaturedCards useFrontmatter={true} />
            )}
          </div>
        )}
      </header>

      {/* Logo gallery (below-featured position) */}
      {renderLogoGallery("below-featured")}

      {/* Blog posts section - conditionally shown based on config */}
      {showPostsOnHome && (
        <section id="posts" className="home-posts">
          {posts === undefined ? null : posts.length === 0 ? (
            <p className="no-posts">No posts yet. Check back soon!</p>
          ) : (
            <>
              <PostList
                posts={
                  siteConfig.postsDisplay.homePostsLimit
                    ? posts.slice(0, siteConfig.postsDisplay.homePostsLimit)
                    : posts
                }
              />
              {/* Show "read more" link if enabled and there are more posts than the limit */}
              {siteConfig.postsDisplay.homePostsReadMore?.enabled &&
                siteConfig.postsDisplay.homePostsLimit &&
                posts.length > siteConfig.postsDisplay.homePostsLimit && (
                  <div className="home-posts-read-more">
                    <Link
                      to={siteConfig.postsDisplay.homePostsReadMore.link}
                      className="home-posts-read-more-link"
                    >
                      {siteConfig.postsDisplay.homePostsReadMore.text}
                    </Link>
                  </div>
                )}
            </>
          )}
        </section>
      )}

      {/* GitHub contributions graph - above logo gallery */}
      {siteConfig.gitHubContributions?.enabled && (
        <GitHubContributions config={siteConfig.gitHubContributions} />
      )}

      {/* Logo gallery (above-footer position) */}
      {renderLogoGallery("above-footer")}

      {/* Newsletter signup (above-footer position) */}
      {siteConfig.newsletter?.enabled &&
        siteConfig.newsletter.signup.home.enabled &&
        siteConfig.newsletter.signup.home.position === "above-footer" && (
          <NewsletterSignup source="home" />
        )}

      {/* Footer section */}
      {siteConfig.footer.enabled && siteConfig.footer.showOnHomepage && (
        <Footer content={siteConfig.footer.defaultContent} />
      )}

      {/* Social footer section */}
      {siteConfig.socialFooter?.enabled &&
        siteConfig.socialFooter.showOnHomepage && <SocialFooter />}
    </div>
  );
}
