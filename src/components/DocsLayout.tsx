import { ReactNode, useState, useEffect } from "react";
import DocsSidebar from "./DocsSidebar";
import DocsTOC from "./DocsTOC";
import AIChatView from "./AIChatView";
import type { Heading } from "../utils/extractHeadings";
import siteConfig from "../config/siteConfig";
import { ChevronDown, ChevronUp } from "lucide-react";

// Storage key for AI chat expanded state
const AI_CHAT_EXPANDED_KEY = "docs-ai-chat-expanded";

interface DocsLayoutProps {
  children: ReactNode;
  headings: Heading[];
  currentSlug: string;
  aiChatEnabled?: boolean; // From frontmatter aiChat: true/false
  pageContent?: string; // Page/post content for AI context
}

export default function DocsLayout({
  children,
  headings,
  currentSlug,
  aiChatEnabled = false,
  pageContent,
}: DocsLayoutProps) {
  const hasTOC = headings.length > 0;

  // Check if AI chat should be shown (requires global config + frontmatter)
  const showAIChat =
    siteConfig.aiChat?.enabledOnContent && aiChatEnabled === true && currentSlug;

  // AI chat expanded state (closed by default)
  const [aiChatExpanded, setAiChatExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(AI_CHAT_EXPANDED_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  // Persist AI chat expanded state
  useEffect(() => {
    try {
      localStorage.setItem(AI_CHAT_EXPANDED_KEY, aiChatExpanded.toString());
    } catch {
      // Ignore storage errors
    }
  }, [aiChatExpanded]);

  // Show right sidebar if TOC exists OR AI chat is enabled
  const hasRightSidebar = hasTOC || showAIChat;

  return (
    <div className={`docs-layout ${!hasRightSidebar ? "no-toc" : ""}`}>
      {/* Left sidebar - docs navigation */}
      <aside className="docs-sidebar-left">
        <DocsSidebar currentSlug={currentSlug} />
      </aside>

      {/* Main content */}
      <main className="docs-content">{children}</main>

      {/* Right sidebar - AI chat toggle + table of contents */}
      {hasRightSidebar && (
        <aside className="docs-sidebar-right">
          {/* AI Chat toggle section (above TOC) */}
          {showAIChat && (
            <div className="docs-ai-chat-section">
              <button
                className="docs-ai-chat-toggle"
                onClick={() => setAiChatExpanded(!aiChatExpanded)}
                type="button"
                aria-expanded={aiChatExpanded}
              >
                <span className="docs-ai-chat-toggle-text">AI Agent</span>
                {aiChatExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {aiChatExpanded && (
                <div className="docs-ai-chat-container">
                  <AIChatView
                    contextId={currentSlug}
                    pageContent={pageContent}
                    hideAttachments={true}
                  />
                </div>
              )}
            </div>
          )}
          {/* TOC section */}
          {hasTOC && <DocsTOC headings={headings} />}
        </aside>
      )}
    </div>
  );
}
