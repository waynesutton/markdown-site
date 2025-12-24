import { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import siteConfig from "../config/siteConfig";

// Maximum URL length for query parameters (conservative limit)
const MAX_URL_LENGTH = 6000;

// Universal AI prompt for reading raw markdown
const AI_READ_PROMPT = `Read the raw markdown document at the URL below. If the content loads successfully:
- Provide a concise accurate summary
- Be ready to answer follow up questions using only this document

If the content cannot be loaded:
- Say so explicitly
- Do not guess or infer content

URL:`;

// Construct GitHub raw URL for a slug
function getGitHubRawUrl(slug: string): string {
  const { owner, repo, branch, contentPath } = siteConfig.gitHubRepo;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${contentPath}/${slug}.md`;
}

// Extended props interface with optional metadata
interface CopyPageDropdownProps {
  title: string;
  content: string;
  url: string;
  slug: string;
  description?: string;
  date?: string;
  tags?: string[];
  readTime?: string;
}

// Enhanced markdown format for better LLM parsing
function formatAsMarkdown(props: CopyPageDropdownProps): string {
  const { title, content, url, description, date, tags, readTime } = props;

  // Build metadata section
  const metadataLines: string[] = [];
  metadataLines.push(`Source: ${url}`);
  if (date) metadataLines.push(`Date: ${date}`);
  if (readTime) metadataLines.push(`Reading time: ${readTime}`);
  if (tags && tags.length > 0) metadataLines.push(`Tags: ${tags.join(", ")}`);

  // Build the full markdown document
  let markdown = `# ${title}\n\n`;

  // Add description if available
  if (description) {
    markdown += `> ${description}\n\n`;
  }

  // Add metadata block
  markdown += `---\n${metadataLines.join("\n")}\n---\n\n`;

  // Add main content
  markdown += content;

  return markdown;
}

// Generate a valid skill name (lowercase, hyphens, max 64 chars)
function generateSkillName(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

// Format content as an Anthropic Agent Skill file (SKILL.md format)
// Follows: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
function formatAsSkill(props: CopyPageDropdownProps): string {
  const { title, content, slug, description, tags } = props;

  // Generate compliant skill name
  const skillName = generateSkillName(slug);

  // Build description with "when to use" triggers (max 1024 chars)
  const tagList = tags && tags.length > 0 ? tags.join(", ") : "";
  let skillDescription = description || `Guide about ${title.toLowerCase()}.`;

  // Add usage triggers to description
  if (tagList) {
    skillDescription += ` Use when working with ${tagList.toLowerCase()} or when asked about ${title.toLowerCase()}.`;
  } else {
    skillDescription += ` Use when asked about ${title.toLowerCase()}.`;
  }

  // Truncate description if needed (max 1024 chars)
  if (skillDescription.length > 1024) {
    skillDescription = skillDescription.slice(0, 1021) + "...";
  }

  // Build YAML frontmatter (required by Agent Skills spec)
  let skill = `---\n`;
  skill += `name: ${skillName}\n`;
  skill += `description: ${skillDescription}\n`;
  skill += `---\n\n`;

  // Add title
  skill += `# ${title}\n\n`;

  // Add instructions section
  skill += `## Instructions\n\n`;
  skill += content;

  // Add examples section placeholder if content doesn't include examples
  if (!content.toLowerCase().includes("## example")) {
    skill += `\n\n## Examples\n\n`;
    skill += `Use this skill when the user asks about topics covered in this guide.\n`;
  }

  return skill;
}

// Check if URL length exceeds safe limits
function isUrlTooLong(url: string): boolean {
  return url.length > MAX_URL_LENGTH;
}

// Feedback state type
type FeedbackState = "idle" | "copied" | "error" | "url-too-long";

export default function CopyPageDropdown(props: CopyPageDropdownProps) {
  const { title } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Clear feedback after delay
  const clearFeedback = useCallback(() => {
    setTimeout(() => {
      setFeedback("idle");
      setFeedbackMessage("");
    }, 2000);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    function handleKeyDown(event: KeyboardEvent) {
      const menu = menuRef.current;
      if (!menu) return;

      const items = menu.querySelectorAll<HTMLButtonElement>(".copy-page-item");
      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement,
      );

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          event.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus();
          } else {
            items[0].focus();
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            items[items.length - 1].focus();
          }
          break;
        case "Home":
          event.preventDefault();
          items[0]?.focus();
          break;
        case "End":
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
        case "Tab":
          // Close dropdown on tab out
          if (!event.shiftKey && currentIndex === items.length - 1) {
            setIsOpen(false);
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      // Small delay to ensure menu is rendered
      setTimeout(() => firstItemRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Safe clipboard write with error handling
  const writeToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers or permission issues
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return true;
      } catch {
        console.error("Failed to copy to clipboard:", error);
        return false;
      }
    }
  };

  // Handle copy page action with error handling
  const handleCopyPage = async () => {
    const markdown = formatAsMarkdown(props);
    const success = await writeToClipboard(markdown);

    if (success) {
      setFeedback("copied");
      setFeedbackMessage("Copied!");
    } else {
      setFeedback("error");
      setFeedbackMessage("Failed to copy");
    }

    clearFeedback();
    setTimeout(() => setIsOpen(false), 1500);
  };

  // Handle download skill file (Anthropic Agent Skills format)
  const handleDownloadSkill = () => {
    const skillContent = formatAsSkill(props);
    const blob = new Blob([skillContent], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download as SKILL.md
    const link = document.createElement("a");
    link.href = url;
    link.download = "SKILL.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    URL.revokeObjectURL(url);

    setFeedback("copied");
    setFeedbackMessage("Downloaded!");
    clearFeedback();
    setTimeout(() => setIsOpen(false), 1500);
  };

  // Get feedback icon
  const getFeedbackIcon = () => {
    switch (feedback) {
      case "copied":
        return <Check size={16} className="copy-page-icon feedback-success" />;
      case "error":
        return (
          <AlertCircle size={16} className="copy-page-icon feedback-error" />
        );
      case "url-too-long":
        return <Check size={16} className="copy-page-icon feedback-warning" />;
      default:
        return <Copy size={16} className="copy-page-icon" />;
    }
  };

  // Suppress unused variable warnings for functions that may be used later
  void isUrlTooLong;
  void MAX_URL_LENGTH;

  return (
    <div className="copy-page-dropdown" ref={dropdownRef}>
      {/* Trigger button with ARIA attributes */}
      <button
        ref={triggerRef}
        className="copy-page-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="copy-page-menu"
        aria-label={`Copy or share: ${title}`}
      >
        <Copy size={14} aria-hidden="true" />
        <span>Copy page</span>
        <svg
          className={`dropdown-chevron ${isOpen ? "open" : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2.5 4L5 6.5L7.5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown menu with ARIA role */}
      {isOpen && (
        <div
          ref={menuRef}
          id="copy-page-menu"
          className="copy-page-menu"
          role="menu"
          aria-label="Copy and share options"
        >
          {/* Copy page option */}
          <button
            ref={firstItemRef}
            className="copy-page-item"
            onClick={handleCopyPage}
            role="menuitem"
            tabIndex={0}
          >
            {getFeedbackIcon()}
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">
                {feedback !== "idle" ? feedbackMessage : "Copy page"}
              </span>
              <span className="copy-page-item-desc">
                Copy as Markdown for LLMs
              </span>
            </div>
          </button>

          {/* View as Markdown option */}
          <button
            className="copy-page-item"
            onClick={() => {
              // Build absolute URL using current origin for consistency
              const rawMarkdownUrl = new URL(
                `/raw/${props.slug}.md`,
                window.location.origin,
              ).toString();
              window.open(rawMarkdownUrl, "_blank");
              setIsOpen(false);
            }}
            role="menuitem"
            tabIndex={0}
          >
            <FileText size={16} className="copy-page-icon" aria-hidden="true" />
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">
                View as Markdown
                <span className="external-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="copy-page-item-desc">Open raw .md file</span>
            </div>
          </button>

          {/* Download as SKILL.md option (Anthropic Agent Skills format) */}
          <button
            className="copy-page-item"
            onClick={handleDownloadSkill}
            role="menuitem"
            tabIndex={0}
          >
            <Download size={16} className="copy-page-icon" aria-hidden="true" />
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">Download as SKILL.md</span>
              <span className="copy-page-item-desc">
                Anthropic Agent Skills format
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="copy-page-divider" role="separator" />

          {/* AI service links using GitHub raw URLs */}
          {/* Note: Requires git push to work - npm sync alone is not sufficient */}
          <button
            className="copy-page-item"
            onClick={() => {
              const rawUrl = getGitHubRawUrl(props.slug);
              const prompt = encodeURIComponent(`${AI_READ_PROMPT} ${rawUrl}`);
              window.open(
                `https://chatgpt.com/?q=${prompt}`,
                "_blank",
                "noopener,noreferrer",
              );
              setIsOpen(false);
            }}
            role="menuitem"
            tabIndex={0}
          >
            <ExternalLink
              size={16}
              className="copy-page-icon"
              aria-hidden="true"
            />
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">
                Open in ChatGPT
                <span className="external-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="copy-page-item-desc">Requires git push</span>
            </div>
          </button>

          <button
            className="copy-page-item"
            onClick={() => {
              const rawUrl = getGitHubRawUrl(props.slug);
              const prompt = encodeURIComponent(`${AI_READ_PROMPT} ${rawUrl}`);
              window.open(
                `https://claude.ai/new?q=${prompt}`,
                "_blank",
                "noopener,noreferrer",
              );
              setIsOpen(false);
            }}
            role="menuitem"
            tabIndex={0}
          >
            <ExternalLink
              size={16}
              className="copy-page-icon"
              aria-hidden="true"
            />
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">
                Open in Claude
                <span className="external-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="copy-page-item-desc">Requires git push</span>
            </div>
          </button>

          <button
            className="copy-page-item"
            onClick={() => {
              const rawUrl = getGitHubRawUrl(props.slug);
              const prompt = encodeURIComponent(`${AI_READ_PROMPT} ${rawUrl}`);
              window.open(
                `https://www.perplexity.ai/?q=${prompt}`,
                "_blank",
                "noopener,noreferrer",
              );
              setIsOpen(false);
            }}
            role="menuitem"
            tabIndex={0}
          >
            <ExternalLink
              size={16}
              className="copy-page-icon"
              aria-hidden="true"
            />
            <div className="copy-page-item-content">
              <span className="copy-page-item-title">
                Open in Perplexity
                <span className="external-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="copy-page-item-desc">Requires git push</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
