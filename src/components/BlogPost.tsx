import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// Import only needed languages for smaller bundle (INP optimization)
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";

// Register languages
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("shell", bash);
SyntaxHighlighter.registerLanguage("sh", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("md", markdown);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("yml", yaml);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("diff", diff);
import { Copy, Check, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NewsletterSignup from "./NewsletterSignup";
import ContactForm from "./ContactForm";
import DiffCodeBlock from "./DiffCodeBlock";
import siteConfig from "../config/siteConfig";
import { useSearchHighlighting } from "../hooks/useSearchHighlighting";

// Whitelisted domains for iframe embeds (YouTube and Twitter/X only)
const ALLOWED_IFRAME_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "platform.twitter.com",
  "platform.x.com",
];

// Sanitize schema that allows collapsible sections (details/summary), inline styles, and iframes
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "details", "summary", "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    details: ["open"], // Allow the 'open' attribute for expanded by default
    ul: ["style"], // Allow inline styles on ul for list-style control
    ol: ["style"], // Allow inline styles on ol for list-style control
    li: ["style"], // Allow inline styles on li elements
    div: ["style"], // Allow inline styles on div for grid layouts
    p: ["style"], // Allow inline styles on p elements
    a: ["style", "href", "target", "rel"], // Allow inline styles on links
    img: [...(defaultSchema.attributes?.img || []), "style"], // Allow inline styles on images
    span: ["className", "class", "style"], // Allow class attribute on span for copy-command
    iframe: [
      "src",
      "width",
      "height",
      "allow",
      "allowfullscreen",
      "frameborder",
      "title",
      "style",
    ], // Allow iframe with specific attributes
  },
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

// Inline copy button for commands in lists
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

// Image lightbox component - uses portal to escape contain: layout
function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Use portal to render at document body level, escaping contain: layout
  return createPortal(
    <div className="image-lightbox-backdrop" onClick={handleBackdropClick}>
      <button
        className="image-lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>
      <div className="image-lightbox-content">
        <img src={src} alt={alt} className="image-lightbox-image" />
        {alt && <div className="image-lightbox-caption">{alt}</div>}
      </div>
    </div>,
    document.body
  );
}

// Cursor Dark Theme colors for syntax highlighting
const cursorDarkTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#d4d4d4",
    background: "#1e1e1e",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
  },
  'pre[class*="language-"]': {
    color: "#d4d4d4",
    background: "#1e1e1e",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
    padding: "1.5em",
    margin: "1.5em 0",
    overflow: "auto" as const,
    borderRadius: "8px",
  },
  comment: { color: "#6a9955", fontStyle: "italic" },
  prolog: { color: "#6a9955" },
  doctype: { color: "#6a9955" },
  cdata: { color: "#6a9955" },
  punctuation: { color: "#d4d4d4" },
  property: { color: "#9cdcfe" },
  tag: { color: "#569cd6" },
  boolean: { color: "#569cd6" },
  number: { color: "#b5cea8" },
  constant: { color: "#4fc1ff" },
  symbol: { color: "#4fc1ff" },
  deleted: { color: "#f44747" },
  selector: { color: "#d7ba7d" },
  "attr-name": { color: "#92c5f6" },
  string: { color: "#ce9178" },
  char: { color: "#ce9178" },
  builtin: { color: "#569cd6" },
  inserted: { color: "#6a9955" },
  operator: { color: "#d4d4d4" },
  entity: { color: "#dcdcaa" },
  url: { color: "#9cdcfe", textDecoration: "underline" },
  variable: { color: "#9cdcfe" },
  atrule: { color: "#569cd6" },
  "attr-value": { color: "#ce9178" },
  function: { color: "#dcdcaa" },
  "function-variable": { color: "#dcdcaa" },
  keyword: { color: "#569cd6" },
  regex: { color: "#d16969" },
  important: { color: "#569cd6", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  namespace: { opacity: 0.7 },
  "class-name": { color: "#4ec9b0" },
  parameter: { color: "#9cdcfe" },
  decorator: { color: "#dcdcaa" },
};

// Cursor Light Theme colors for syntax highlighting
const cursorLightTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#171717",
    background: "#f5f5f5",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
  },
  'pre[class*="language-"]': {
    color: "#171717",
    background: "#f5f5f5",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
    padding: "1.5em",
    margin: "1.5em 0",
    overflow: "auto" as const,
    borderRadius: "8px",
  },
  comment: { color: "#6a737d", fontStyle: "italic" },
  prolog: { color: "#6a737d" },
  doctype: { color: "#6a737d" },
  cdata: { color: "#6a737d" },
  punctuation: { color: "#24292e" },
  property: { color: "#005cc5" },
  tag: { color: "#22863a" },
  boolean: { color: "#005cc5" },
  number: { color: "#005cc5" },
  constant: { color: "#005cc5" },
  symbol: { color: "#e36209" },
  deleted: { color: "#b31d28", background: "#ffeef0" },
  selector: { color: "#22863a" },
  "attr-name": { color: "#6f42c1" },
  string: { color: "#032f62" },
  char: { color: "#032f62" },
  builtin: { color: "#005cc5" },
  inserted: { color: "#22863a", background: "#f0fff4" },
  operator: { color: "#d73a49" },
  entity: { color: "#6f42c1" },
  url: { color: "#005cc5", textDecoration: "underline" },
  variable: { color: "#e36209" },
  atrule: { color: "#005cc5" },
  "attr-value": { color: "#032f62" },
  function: { color: "#6f42c1" },
  "function-variable": { color: "#6f42c1" },
  keyword: { color: "#d73a49" },
  regex: { color: "#032f62" },
  important: { color: "#d73a49", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  namespace: { opacity: 0.7 },
  "class-name": { color: "#6f42c1" },
  parameter: { color: "#24292e" },
  decorator: { color: "#6f42c1" },
};

// Tan Theme colors for syntax highlighting
const cursorTanTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#1a1a1a",
    background: "#f0ece4",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
  },
  'pre[class*="language-"]': {
    color: "#1a1a1a",
    background: "#f0ece4",
    fontFamily:
      "SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
    fontSize: "14px",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal",
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none" as const,
    padding: "1.5em",
    margin: "1.5em 0",
    overflow: "auto" as const,
    borderRadius: "8px",
  },
  comment: { color: "#7a7a7a", fontStyle: "italic" },
  prolog: { color: "#7a7a7a" },
  doctype: { color: "#7a7a7a" },
  cdata: { color: "#7a7a7a" },
  punctuation: { color: "#1a1a1a" },
  property: { color: "#8b7355" },
  tag: { color: "#8b5a2b" },
  boolean: { color: "#8b5a2b" },
  number: { color: "#8b5a2b" },
  constant: { color: "#8b5a2b" },
  symbol: { color: "#a67c52" },
  deleted: { color: "#b31d28" },
  selector: { color: "#6b8e23" },
  "attr-name": { color: "#8b7355" },
  string: { color: "#6b8e23" },
  char: { color: "#6b8e23" },
  builtin: { color: "#8b5a2b" },
  inserted: { color: "#6b8e23" },
  operator: { color: "#a67c52" },
  entity: { color: "#8b7355" },
  url: { color: "#8b7355", textDecoration: "underline" },
  variable: { color: "#a67c52" },
  atrule: { color: "#8b5a2b" },
  "attr-value": { color: "#6b8e23" },
  function: { color: "#8b7355" },
  "function-variable": { color: "#8b7355" },
  keyword: { color: "#8b5a2b" },
  regex: { color: "#6b8e23" },
  important: { color: "#8b5a2b", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  namespace: { opacity: 0.7 },
  "class-name": { color: "#8b7355" },
  parameter: { color: "#1a1a1a" },
  decorator: { color: "#8b7355" },
};

interface BlogPostProps {
  content: string;
  slug?: string; // For tracking source of newsletter/contact form signups
  pageType?: "post" | "page"; // Type of content (for tracking)
}

// Content segment types for inline embeds
type ContentSegment =
  | { type: "content"; value: string }
  | { type: "newsletter" }
  | { type: "contactform" };

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
  processed = processed.replace(
    /<!--\s*newsletter\s*-->/gi,
    markers.newsletter,
  );
  processed = processed.replace(
    /<!--\s*contactform\s*-->/gi,
    markers.contactform,
  );

  // Remove all remaining HTML comments (including multi-line)
  processed = processed.replace(/<!--[\s\S]*?-->/g, "");

  // Restore special placeholders
  processed = processed.replace(markers.newsletter, "<!-- newsletter -->");
  processed = processed.replace(markers.contactform, "<!-- contactform -->");

  return processed;
}

// Parse content for inline embed placeholders
// Supports: <!-- newsletter --> and <!-- contactform -->
function parseContentForEmbeds(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];

  // Pattern matches <!-- newsletter --> or <!-- contactform --> (case insensitive)
  const pattern = /<!--\s*(newsletter|contactform)\s*-->/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    // Add content before the placeholder
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        segments.push({ type: "content", value: textBefore });
      }
    }

    // Add the embed placeholder
    const embedType = match[1].toLowerCase();
    if (embedType === "newsletter") {
      segments.push({ type: "newsletter" });
    } else if (embedType === "contactform") {
      segments.push({ type: "contactform" });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining content after last placeholder
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex);
    if (remaining.trim()) {
      segments.push({ type: "content", value: remaining });
    }
  }

  // If no placeholders found, return single content segment
  if (segments.length === 0) {
    segments.push({ type: "content", value: content });
  }

  return segments;
}

// Generate slug from heading text for anchor links
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

export default function BlogPost({
  content,
  slug,
  pageType = "post",
}: BlogPostProps) {
  const { theme } = useTheme();
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const isLightboxEnabled = siteConfig.imageLightbox?.enabled !== false;

  // Search highlighting - scrolls to and highlights search terms from URL
  const articleRef = useRef<HTMLElement>(null);
  useSearchHighlighting({ containerRef: articleRef });

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

  // Strip HTML comments (except special placeholders) before processing
  const cleanedContent = stripHtmlComments(content);

  // Parse content for inline embeds
  const segments = parseContentForEmbeds(cleanedContent);
  const hasInlineEmbeds = segments.some((s) => s.type !== "content");

  // Helper to render a single markdown segment
  const renderMarkdown = (markdownContent: string, key?: number) => (
    <ReactMarkdown
      key={key}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={{
        code(codeProps) {
          const { className, children, node, style, ...restProps } =
            codeProps as {
              className?: string;
              children?: React.ReactNode;
              node?: {
                tagName?: string;
                properties?: { className?: string[] };
              };
              style?: React.CSSProperties;
              inline?: boolean;
            };
          const match = /language-(\w+)/.exec(className || "");

          // Detect inline code: no language class AND content is short without newlines
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
        img({ src, alt }) {
          const handleImageClick = () => {
            if (isLightboxEnabled && src) {
              setLightboxImage({ src, alt: alt || "" });
            }
          };
          return (
            <span className="blog-image-wrapper">
              <img
                src={src}
                alt={alt || ""}
                className={`blog-image ${isLightboxEnabled ? "blog-image-clickable" : ""}`}
                loading="lazy"
                onClick={isLightboxEnabled ? handleImageClick : undefined}
                style={isLightboxEnabled ? { cursor: "pointer" } : undefined}
              />
              {alt && <span className="blog-image-caption">{alt}</span>}
            </span>
          );
        },
        a({ href, children }) {
          const isExternal = href?.startsWith("http");
          return (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="blog-link"
            >
              {children}
            </a>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="blog-blockquote">{children}</blockquote>
          );
        },
        h1({ children }) {
          // Demote H1 in markdown content to H2 since page title is the H1
          // This ensures only one H1 per page for better SEO
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
        ul({ children }) {
          return <ul className="blog-ul">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="blog-ol">{children}</ol>;
        },
        li({ children }) {
          return <li className="blog-li">{children}</li>;
        },
        hr() {
          return <hr className="blog-hr" />;
        },
        // Table components for GitHub-style tables
        table({ children }) {
          return (
            <div className="blog-table-wrapper">
              <table className="blog-table">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="blog-thead">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody className="blog-tbody">{children}</tbody>;
        },
        tr({ children }) {
          return <tr className="blog-tr">{children}</tr>;
        },
        th({ children }) {
          return <th className="blog-th">{children}</th>;
        },
        td({ children }) {
          return <td className="blog-td">{children}</td>;
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
        // Iframe component with domain whitelisting for YouTube and Twitter/X
        iframe(props) {
          const src = props.src as string;
          if (!src) return null;

          try {
            const url = new URL(src);
            const isAllowed = ALLOWED_IFRAME_DOMAINS.some(
              (domain) =>
                url.hostname === domain || url.hostname.endsWith("." + domain),
            );
            if (!isAllowed) return null;

            return (
              <div className="embed-container">
                <iframe
                  {...props}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="lazy"
                />
              </div>
            );
          } catch {
            return null;
          }
        },
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );

  // Build source string for tracking
  const sourcePrefix = pageType === "page" ? "page" : "post";
  const source = slug ? `${sourcePrefix}:${slug}` : sourcePrefix;

  // Render with inline embeds if placeholders exist
  if (hasInlineEmbeds) {
    return (
      <>
        <article ref={articleRef} className="blog-post-content">
          {segments.map((segment, index) => {
            if (segment.type === "newsletter") {
              // Newsletter signup inline
              return siteConfig.newsletter?.enabled ? (
                <NewsletterSignup
                  key={`newsletter-${index}`}
                  source={pageType === "page" ? "post" : "post"}
                  postSlug={slug}
                />
              ) : null;
            }
            if (segment.type === "contactform") {
              // Contact form inline
              return siteConfig.contactForm?.enabled ? (
                <ContactForm key={`contactform-${index}`} source={source} />
              ) : null;
            }
            // Markdown content segment
            return renderMarkdown(segment.value, index);
          })}
        </article>
        {lightboxImage && (
          <ImageLightbox
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </>
    );
  }

  // No inline embeds, render content normally
  return (
    <>
      <article ref={articleRef} className="blog-post-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={{
            code(codeProps) {
              const { className, children, node, style, ...restProps } =
                codeProps as {
                  className?: string;
                  children?: React.ReactNode;
                  node?: {
                    tagName?: string;
                    properties?: { className?: string[] };
                  };
                  style?: React.CSSProperties;
                  inline?: boolean;
                };
              const match = /language-(\w+)/.exec(className || "");

              // Detect inline code: no language class AND content is short without newlines
              // Fenced code blocks (even without language) are longer or have structure
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
            img({ src, alt }) {
              const handleImageClick = () => {
                if (isLightboxEnabled && src) {
                  setLightboxImage({ src, alt: alt || "" });
                }
              };
              return (
                <span className="blog-image-wrapper">
                  <img
                    src={src}
                    alt={alt || ""}
                    className={`blog-image ${isLightboxEnabled ? "blog-image-clickable" : ""}`}
                    loading="lazy"
                    onClick={isLightboxEnabled ? handleImageClick : undefined}
                    style={
                      isLightboxEnabled ? { cursor: "pointer" } : undefined
                    }
                  />
                  {alt && <span className="blog-image-caption">{alt}</span>}
                </span>
              );
            },
            a({ href, children }) {
              const isExternal = href?.startsWith("http");
              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="blog-link"
                >
                  {children}
                </a>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="blog-blockquote">{children}</blockquote>
              );
            },
            h1({ children }) {
              // Demote H1 in markdown content to H2 since page title is the H1
              // This ensures only one H1 per page for better SEO
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
            ul({ children }) {
              return <ul className="blog-ul">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="blog-ol">{children}</ol>;
            },
            li({ children }) {
              return <li className="blog-li">{children}</li>;
            },
            hr() {
              return <hr className="blog-hr" />;
            },
            // Table components for GitHub-style tables
            table({ children }) {
              return (
                <div className="blog-table-wrapper">
                  <table className="blog-table">{children}</table>
                </div>
              );
            },
            thead({ children }) {
              return <thead className="blog-thead">{children}</thead>;
            },
            tbody({ children }) {
              return <tbody className="blog-tbody">{children}</tbody>;
            },
            tr({ children }) {
              return <tr className="blog-tr">{children}</tr>;
            },
            th({ children }) {
              return <th className="blog-th">{children}</th>;
            },
            td({ children }) {
              return <td className="blog-td">{children}</td>;
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
            // Iframe component with domain whitelisting for YouTube and Twitter/X
            iframe(props) {
              const src = props.src as string;
              if (!src) return null;

              try {
                const url = new URL(src);
                const isAllowed = ALLOWED_IFRAME_DOMAINS.some(
                  (domain) =>
                    url.hostname === domain ||
                    url.hostname.endsWith("." + domain),
                );
                if (!isAllowed) return null;

                return (
                  <div className="embed-container">
                    <iframe
                      {...props}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      loading="lazy"
                    />
                  </div>
                );
              } catch {
                return null;
              }
            },
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </article>
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
