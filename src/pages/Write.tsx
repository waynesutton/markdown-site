import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CopySimple,
  Check,
  Trash,
  House,
  Article,
  File,
  Warning,
  TextAa,
} from "@phosphor-icons/react";
import { Moon, Sun, Cloud } from "lucide-react";
import { Half2Icon } from "@radix-ui/react-icons";
import { useTheme } from "../context/ThemeContext";

// Frontmatter field definitions for blog posts
const POST_FIELDS = [
  { name: "title", required: true, example: '"Your Post Title"' },
  {
    name: "description",
    required: true,
    example: '"A brief description for SEO"',
  },
  { name: "date", required: true, example: '"2025-01-20"' },
  { name: "slug", required: true, example: '"your-post-url"' },
  { name: "published", required: true, example: "true" },
  { name: "tags", required: true, example: '["tag1", "tag2"]' },
  { name: "readTime", required: false, example: '"5 min read"' },
  { name: "image", required: false, example: '"/images/my-image.png"' },
  {
    name: "excerpt",
    required: false,
    example: '"Short description for cards"',
  },
  { name: "featured", required: false, example: "true" },
  { name: "featuredOrder", required: false, example: "1" },
];

// Frontmatter field definitions for pages
const PAGE_FIELDS = [
  { name: "title", required: true, example: '"Page Title"' },
  { name: "slug", required: true, example: '"page-url"' },
  { name: "published", required: true, example: "true" },
  { name: "order", required: false, example: "1" },
  { name: "excerpt", required: false, example: '"Short description"' },
  { name: "image", required: false, example: '"/images/thumbnail.png"' },
  { name: "featured", required: false, example: "true" },
  { name: "featuredOrder", required: false, example: "1" },
];

// Generate frontmatter template based on content type
function generateTemplate(type: "post" | "page"): string {
  if (type === "post") {
    return `---
title: "Your Post Title"
description: "A brief description for SEO and social sharing"
date: "${new Date().toISOString().split("T")[0]}"
slug: "your-post-url"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
---

# Your Post Title

Start writing your content here...

## Section Heading

Add your markdown content. You can use:

- **Bold text** and *italic text*
- [Links](https://example.com)
- Code blocks with syntax highlighting

\`\`\`typescript
const greeting = "Hello, world";
console.log(greeting);
\`\`\`

## Conclusion

Wrap up your thoughts here.
`;
  }

  return `---
title: "Page Title"
slug: "page-url"
published: true
order: 1
---

# Page Title

Your page content goes here...

## Section

Add your markdown content.
`;
}

// localStorage keys
const STORAGE_KEY_CONTENT = "markdown_write_content";
const STORAGE_KEY_TYPE = "markdown_write_type";
const STORAGE_KEY_FONT = "markdown_write_font";

// Font family definitions (matches global.css options)
type FontType = "serif" | "sans";
const FONTS: Record<FontType, string> = {
  serif:
    '"New York", -apple-system-ui-serif, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
};

// Get the appropriate icon for current theme (matches ThemeToggle.tsx)
function getThemeIcon(theme: string) {
  switch (theme) {
    case "dark":
      return <Moon size={18} />;
    case "light":
      return <Sun size={18} />;
    case "tan":
      return <Half2Icon style={{ width: 18, height: 18 }} />;
    case "cloud":
      return <Cloud size={18} />;
    default:
      return <Sun size={18} />;
  }
}

export default function Write() {
  const { theme, toggleTheme } = useTheme();
  const [contentType, setContentType] = useState<"post" | "page">("post");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [font, setFont] = useState<FontType>("serif");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY_CONTENT);
    const savedType = localStorage.getItem(STORAGE_KEY_TYPE) as
      | "post"
      | "page"
      | null;
    const savedFont = localStorage.getItem(STORAGE_KEY_FONT) as FontType | null;

    if (savedContent) {
      setContent(savedContent);
    } else {
      setContent(generateTemplate("post"));
    }

    if (savedType) {
      setContentType(savedType);
    }

    if (savedFont && (savedFont === "serif" || savedFont === "sans")) {
      setFont(savedFont);
    }
  }, []);

  // Save to localStorage on content change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONTENT, content);
  }, [content]);

  // Save type to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TYPE, contentType);
  }, [contentType]);

  // Save font preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FONT, font);
  }, [font]);

  // Toggle font between serif and sans-serif
  const toggleFont = useCallback(() => {
    setFont((prev) => (prev === "serif" ? "sans" : "serif"));
  }, []);

  // Handle type change and update content template
  const handleTypeChange = (newType: "post" | "page") => {
    if (newType === contentType) return;

    setContentType(newType);
    // Always update to the new template when switching types
    setContent(generateTemplate(newType));
  };

  // Copy content to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  // Copy a single frontmatter field to clipboard
  const handleCopyField = useCallback(
    async (fieldName: string, example: string) => {
      const fieldText = `${fieldName}: ${example}`;
      try {
        await navigator.clipboard.writeText(fieldText);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 1500);
      } catch {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = fieldText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 1500);
      }
    },
    [],
  );

  // Clear content and reset to template
  const handleClear = useCallback(() => {
    setContent(generateTemplate(contentType));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [contentType]);

  // Calculate stats
  const lines = content.split("\n").length;
  const characters = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const fields = contentType === "post" ? POST_FIELDS : PAGE_FIELDS;

  return (
    <div className="write-layout">
      {/* Left Sidebar: Type selector */}
      <aside className="write-sidebar-left">
        <div className="write-sidebar-header">
          <Link to="/" className="write-logo-link" title="Back to home">
            <House size={20} weight="regular" />
            <span>Home</span>
          </Link>
        </div>

        <nav className="write-nav">
          <div className="write-nav-section">
            <span className="write-nav-label">Content Type</span>
            <button
              onClick={() => handleTypeChange("post")}
              className={`write-nav-item ${contentType === "post" ? "active" : ""}`}
            >
              <Article
                size={18}
                weight={contentType === "post" ? "fill" : "regular"}
              />
              <span>Blog Post</span>
            </button>
            <button
              onClick={() => handleTypeChange("page")}
              className={`write-nav-item ${contentType === "page" ? "active" : ""}`}
            >
              <File
                size={18}
                weight={contentType === "page" ? "fill" : "regular"}
              />
              <span>Page</span>
            </button>
          </div>

          <div className="write-nav-section">
            <span className="write-nav-label">Actions</span>
            <button onClick={handleClear} className="write-nav-item">
              <Trash size={18} />
              <span>Clear</span>
            </button>
            <button onClick={toggleTheme} className="write-nav-item">
              {getThemeIcon(theme)}
              <span>Theme</span>
            </button>
            <button onClick={toggleFont} className="write-nav-item">
              <TextAa size={18} />
              <span>{font === "serif" ? "Serif" : "Sans"}</span>
            </button>
          </div>
        </nav>

        {/* Local storage notice */}
        <div className="write-warning">
          <Warning size={14} />
          <span>Saved locally in this browser only. Copy to avoid losing.</span>
        </div>
      </aside>

      {/* Main writing area */}
      <main className="write-main">
        <div className="write-main-header">
          <h1 className="write-main-title">
            {contentType === "post" ? "Blog Post" : "Page"}
          </h1>
          <button
            onClick={handleCopy}
            className={`write-copy-btn ${copied ? "copied" : ""}`}
          >
            {copied ? (
              <>
                <Check size={16} weight="bold" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopySimple size={16} />
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="write-textarea"
          placeholder="Start writing your markdown..."
          spellCheck={true}
          autoComplete="off"
          autoCapitalize="sentences"
          autoFocus
          style={{ fontFamily: FONTS[font] }}
        />

        {/* Footer with stats */}
        <div className="write-main-footer">
          <div className="write-stats">
            <span>{words} words</span>
            <span className="write-stats-divider" />
            <span>{lines} lines</span>
            <span className="write-stats-divider" />
            <span>{characters} chars</span>
          </div>
          <div className="write-save-hint">
            Save to{" "}
            <code>content/{contentType === "post" ? "blog" : "pages"}/</code>{" "}
            then <code>npm run sync</code>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Frontmatter fields */}
      <aside className="write-sidebar-right">
        <div className="write-sidebar-header">
          <span className="write-sidebar-title">Frontmatter</span>
        </div>

        <div className="write-fields">
          <div className="write-fields-section">
            <span className="write-fields-label">
              {contentType === "post" ? "Blog Post" : "Page"} Fields
            </span>
            {fields.map((field) => (
              <div key={field.name} className="write-field-row">
                <div className="write-field-info">
                  <code className="write-field-name">
                    {field.name}
                    {field.required && (
                      <span className="write-field-required">*</span>
                    )}
                  </code>
                  <span className="write-field-example">{field.example}</span>
                </div>
                <button
                  onClick={() => handleCopyField(field.name, field.example)}
                  className={`write-field-copy ${copiedField === field.name ? "copied" : ""}`}
                  title={`Copy ${field.name}`}
                >
                  {copiedField === field.name ? (
                    <Check size={14} weight="bold" />
                  ) : (
                    <CopySimple size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="write-fields-note">
            <span className="write-field-required">*</span> Required fields
          </div>
        </div>
      </aside>
    </div>
  );
}
