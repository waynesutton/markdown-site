// Right sidebar component
// Conditionally renders AI chat when enabled via frontmatter and siteConfig
import AIChatView from "./AIChatView";
import siteConfig from "../config/siteConfig";

interface RightSidebarProps {
  aiChatEnabled?: boolean; // From frontmatter aiChat: true/false (undefined = not set)
  pageContent?: string; // Page markdown content for AI context
  slug?: string; // Page/post slug for chat context ID
}

export default function RightSidebar({
  aiChatEnabled = false,
  pageContent,
  slug,
}: RightSidebarProps) {
  // Check if AI chat should be shown
  // Requires:
  // 1. Global config enabled (siteConfig.aiChat.enabledOnContent)
  // 2. aiChatEnabled is true (passed from parent component)
  // 3. Slug exists for context ID
  const showAIChat =
    siteConfig.aiChat.enabledOnContent &&
    aiChatEnabled &&
    slug;

  if (showAIChat) {
    return (
      <aside className="post-sidebar-right">
        <div className="right-sidebar-ai-chat">
          <AIChatView
            contextId={slug}
            pageContent={pageContent}
            hideAttachments={true}
          />
        </div>
      </aside>
    );
  }

  // Default empty sidebar for layout spacing
  return (
    <aside className="post-sidebar-right">
      <div className="right-sidebar-content">
        {/* Empty - maintains layout spacing */}
      </div>
    </aside>
  );
}