import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
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
import DiffCodeBlock from "./DiffCodeBlock";
import siteConfig from "../config/siteConfig";

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

// Sanitize schema for footer markdown (allows links, paragraphs, line breaks, images)
// style attribute is sanitized by rehypeSanitize to remove dangerous CSS
const footerSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "br", "img"],
  attributes: {
    ...defaultSchema.attributes,
    img: ["src", "alt", "loading", "width", "height", "style", "class"],
  },
};

// Footer component
// Renders markdown content from frontmatter footer field
// Falls back to siteConfig.footer.defaultContent if no frontmatter footer provided
// Visibility controlled by siteConfig.footer settings and frontmatter showFooter field
interface FooterProps {
  content?: string; // Markdown content from frontmatter
}

export default function Footer({ content }: FooterProps) {
  const { theme } = useTheme();
  const { footer } = siteConfig;

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

  // Don't render if footer is globally disabled
  if (!footer.enabled) {
    return null;
  }

  // Use frontmatter content if provided, otherwise fall back to siteConfig default
  const footerContent = content || footer.defaultContent;

  // Don't render if no content available
  if (!footerContent) {
    return null;
  }

  return (
    <section className="site-footer">
      <div className="site-footer-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, footerSanitizeSchema]]}
          components={{
            p({ children }) {
              return <p className="site-footer-text">{children}</p>;
            },
            img({ src, alt, width, height, style, className }) {
              return (
                <span className="site-footer-image-wrapper">
                  <img
                    src={src}
                    alt={alt || ""}
                    className={className || "site-footer-image"}
                    loading="lazy"
                    width={width}
                    height={height}
                    style={style}
                  />
                  {alt && (
                    <span className="site-footer-image-caption">{alt}</span>
                  )}
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
                  className="site-footer-link"
                >
                  {children}
                </a>
              );
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
          }}
        >
          {footerContent}
        </ReactMarkdown>
      </div>
    </section>
  );
}
