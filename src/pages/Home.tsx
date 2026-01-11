import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { Copy, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import PostList from "../components/PostList";
import FeaturedCards from "../components/FeaturedCards";
import LogoMarquee from "../components/LogoMarquee";
import GitHubContributions from "../components/GitHubContributions";
import Footer from "../components/Footer";
import SocialFooter from "../components/SocialFooter";
import NewsletterSignup from "../components/NewsletterSignup";
import DiffCodeBlock from "../components/DiffCodeBlock";
import siteConfig from "../config/siteConfig";

// Sanitize schema for home intro markdown
const homeSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: ["className", "class", "style"],
  },
};

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("shell", bash);
SyntaxHighlighter.registerLanguage("sh", bash);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("md", markdown);
SyntaxHighlighter.registerLanguage("diff", diff);
SyntaxHighlighter.registerLanguage("json", json);

// Cursor Dark Theme for syntax highlighting
const cursorDarkTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#e4e4e7",
    background: "none",
    fontFamily: "var(--font-mono)",
    fontSize: "0.9em",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#e4e4e7",
    background: "#18181b",
    padding: "1.25em",
    margin: "0",
    overflow: "auto",
    borderRadius: "0.5rem",
  },
  comment: { color: "#71717a" },
  punctuation: { color: "#a1a1aa" },
  property: { color: "#93c5fd" },
  string: { color: "#86efac" },
  keyword: { color: "#c4b5fd" },
  function: { color: "#fcd34d" },
  number: { color: "#fdba74" },
  operator: { color: "#f9a8d4" },
  "class-name": { color: "#93c5fd" },
  boolean: { color: "#fdba74" },
  variable: { color: "#e4e4e7" },
  "attr-name": { color: "#93c5fd" },
  "attr-value": { color: "#86efac" },
  tag: { color: "#f87171" },
  deleted: { color: "#f87171", background: "rgba(248, 113, 113, 0.1)" },
  inserted: { color: "#86efac", background: "rgba(134, 239, 172, 0.1)" },
};

// Cursor Light Theme for syntax highlighting
const cursorLightTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#27272a",
    background: "none",
    fontFamily: "var(--font-mono)",
    fontSize: "0.9em",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#27272a",
    background: "#f4f4f5",
    padding: "1.25em",
    margin: "0",
    overflow: "auto",
    borderRadius: "0.5rem",
  },
  comment: { color: "#71717a" },
  punctuation: { color: "#52525b" },
  property: { color: "#2563eb" },
  string: { color: "#16a34a" },
  keyword: { color: "#7c3aed" },
  function: { color: "#ca8a04" },
  number: { color: "#ea580c" },
  operator: { color: "#db2777" },
  "class-name": { color: "#2563eb" },
  boolean: { color: "#ea580c" },
  variable: { color: "#27272a" },
  "attr-name": { color: "#2563eb" },
  "attr-value": { color: "#16a34a" },
  tag: { color: "#dc2626" },
  deleted: { color: "#dc2626", background: "rgba(220, 38, 38, 0.1)" },
  inserted: { color: "#16a34a", background: "rgba(22, 163, 74, 0.1)" },
};

// Tan Theme for syntax highlighting
const cursorTanTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#44403c",
    background: "none",
    fontFamily: "var(--font-mono)",
    fontSize: "0.9em",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#44403c",
    background: "#f5f5f0",
    padding: "1.25em",
    margin: "0",
    overflow: "auto",
    borderRadius: "0.5rem",
  },
  comment: { color: "#78716c" },
  punctuation: { color: "#57534e" },
  property: { color: "#1d4ed8" },
  string: { color: "#15803d" },
  keyword: { color: "#6d28d9" },
  function: { color: "#a16207" },
  number: { color: "#c2410c" },
  operator: { color: "#be185d" },
  "class-name": { color: "#1d4ed8" },
  boolean: { color: "#c2410c" },
  variable: { color: "#44403c" },
  "attr-name": { color: "#1d4ed8" },
  "attr-value": { color: "#15803d" },
  tag: { color: "#b91c1c" },
  deleted: { color: "#b91c1c", background: "rgba(185, 28, 28, 0.1)" },
  inserted: { color: "#15803d", background: "rgba(21, 128, 61, 0.1)" },
};

// Copy button component for code blocks
function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="code-copy-button"
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy code"}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// Inline copy button for copy-command spans
function InlineCopyButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="inline-copy-button"
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy command"}
      title={copied ? "Copied!" : "Copy command"}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

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
  const { theme } = useTheme();

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

  // Fetch footer content from Convex (synced via markdown)
  const footerPage = useQuery(api.pages.getPageBySlug, { slug: "footer" });

  // State for view mode toggle (list or cards)
  const [viewMode, setViewMode] = useState<"list" | "cards">(
    siteConfig.featuredViewMode,
  );

  // Get code theme based on current theme
  const getCodeTheme = () => {
    switch (theme) {
      case "dark":
        return cursorDarkTheme;
      case "light":
        return cursorLightTheme;
      case "tan":
        return cursorTanTheme;
      default:
        return cursorDarkTheme;
    }
  };

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
            width={48}
            height={48}
            fetchPriority="high"
          />
        )}
        <h1 className="home-name">{siteConfig.name}</h1>

        {/* Home intro from Convex page content (synced via npm run sync) */}
        {/* Show nothing while loading (undefined), show content if found, fallback to bio only if page doesn't exist (null) */}
        {homeIntro === undefined ? null : homeIntro ? (
          <div
            className="home-intro-content"
            style={{
              textAlign:
                (homeIntro.textAlign as "left" | "center" | "right") || "left",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, homeSanitizeSchema]]}
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
                // Demote H1 in markdown content to H2 since page title is the H1
                // This ensures only one H1 per page for better SEO
                h1({ children }) {
                  const id = generateSlug(getTextContent(children));
                  return (
                    <h2 id={id} className="blog-h1-demoted">
                      <HeadingAnchor id={id} />
                      {children}
                    </h2>
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
                // Code blocks with syntax highlighting
                code(codeProps) {
                  const { className, children, style, ...restProps } =
                    codeProps as {
                      className?: string;
                      children?: React.ReactNode;
                      style?: React.CSSProperties;
                    };
                  const match = /language-(\w+)/.exec(className || "");

                  // Detect inline code vs code blocks
                  const codeContent = String(children);
                  const hasNewlines = codeContent.includes("\n");
                  const isShort = codeContent.length < 80;
                  const hasLanguage = !!match || !!className;

                  // It's inline only if: no language, short content, no newlines
                  const isInline = !hasLanguage && isShort && !hasNewlines;

                  if (isInline) {
                    return (
                      <code className="inline-code" style={style} {...restProps}>
                        {children}
                      </code>
                    );
                  }

                  const codeString = String(children).replace(/\n$/, "");
                  const language = match ? match[1] : "text";

                  // Route diff/patch to DiffCodeBlock for enhanced diff rendering
                  if (language === "diff" || language === "patch") {
                    return (
                      <DiffCodeBlock
                        code={codeString}
                        language={language as "diff" | "patch"}
                      />
                    );
                  }

                  const isTextBlock = language === "text";

                  // Custom styles for text blocks to enable wrapping
                  const textBlockStyle = isTextBlock
                    ? {
                        whiteSpace: "pre-wrap" as const,
                        wordWrap: "break-word" as const,
                        overflowWrap: "break-word" as const,
                      }
                    : {};

                  return (
                    <div
                      className={`code-block-wrapper ${isTextBlock ? "code-block-text" : ""}`}
                    >
                      {match && <span className="code-language">{match[1]}</span>}
                      <CodeCopyButton code={codeString} />
                      <SyntaxHighlighter
                        style={getCodeTheme()}
                        language={language}
                        PreTag="div"
                        customStyle={textBlockStyle}
                        codeTagProps={
                          isTextBlock ? { style: textBlockStyle } : undefined
                        }
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                // Span component with copy-command support
                span({ className, children }) {
                  if (className === "copy-command") {
                    const command = getTextContent(children);
                    return (
                      <span className="copy-command">
                        <code className="inline-code">{command}</code>
                        <InlineCopyButton command={command} />
                      </span>
                    );
                  }
                  return <span className={className}>{children}</span>;
                },
              }}
            >
              {stripHtmlComments(homeIntro.content)}
            </ReactMarkdown>
          </div>
        ) : (
          // Fallback to siteConfig.bio only if page doesn't exist (null)
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
        <Footer content={footerPage?.content} />
      )}

      {/* Social footer section */}
      {siteConfig.socialFooter?.enabled &&
        siteConfig.socialFooter.showOnHomepage && <SocialFooter />}
    </div>
  );
}
