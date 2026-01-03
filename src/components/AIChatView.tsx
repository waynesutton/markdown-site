import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  PaperPlaneTilt,
  Copy,
  Check,
  Stop,
  Trash,
  SpinnerGap,
  Image,
  Link,
  X,
} from "@phosphor-icons/react";

// Generate a unique session ID for anonymous users
function getSessionId(): string {
  const key = "ai_chat_session_id";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

interface AIChatViewProps {
  contextId: string; // Slug or "write-page"
  pageContent?: string; // Optional page content for context
  onClose?: () => void; // Optional close handler
  hideAttachments?: boolean; // Hide image/link attachment buttons (for right sidebar)
  selectedModel?: string; // Selected AI model ID (e.g., "claude-sonnet-4-20250514", "gpt-4o", "gemini-2.0-flash")
}

export default function AIChatView({
  contextId,
  pageContent,
  onClose,
  hideAttachments = false,
  selectedModel,
}: AIChatViewProps) {
  // State
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null,
  );
  const [chatId, setChatId] = useState<Id<"aiChats"> | null>(null);
  const [hasLoadedContext, setHasLoadedContext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<
    Array<{
      type: "image" | "link";
      storageId?: Id<"_storage">;
      url?: string;
      file?: File;
      preview?: string;
      scrapedContent?: string;
      title?: string;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Session ID
  const sessionId = getSessionId();

  // Convex hooks
  const chat = useQuery(
    api.aiChats.getAIChatByContext,
    chatId ? { sessionId, contextId } : "skip",
  );

  const getOrCreateChat = useMutation(api.aiChats.getOrCreateAIChat);
  const addUserMessage = useMutation(api.aiChats.addUserMessage);
  const addUserMessageWithAttachments = useMutation(
    api.aiChats.addUserMessageWithAttachments,
  );
  const generateUploadUrl = useMutation(api.aiChats.generateUploadUrl);
  const clearChatMutation = useMutation(api.aiChats.clearChat);
  const setPageContext = useMutation(api.aiChats.setPageContext);
  const generateResponse = useAction(api.aiChatActions.generateResponse);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      const id = await getOrCreateChat({ sessionId, contextId });
      setChatId(id);
    };
    initChat();
  }, [sessionId, contextId, getOrCreateChat]);

  // Auto-scroll to bottom when new messages arrive (only if there are messages)
  useEffect(() => {
    // Only scroll if there are actual messages (don't scroll on initial empty state)
    if (messagesEndRef.current && chat?.messages && chat.messages.length > 0) {
      // Use scrollTo on the parent container instead of scrollIntoView to avoid page scroll
      const messagesContainer = messagesEndRef.current.parentElement;
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [chat?.messages]);

  // Prevent page scroll when clicking input container
  const handleInputContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only prevent if clicking the container itself, not the textarea
      if (e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        textareaRef.current?.focus({ preventScroll: true });
      }
    },
    [],
  );

  // Focus input after mount with delay to prevent scroll jump
  useEffect(() => {
    // Use setTimeout to delay focus until after layout settles
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus input (when not in input/textarea)
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        textareaRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!chatId) return;

    // Check attachment limit (max 3 images)
    const currentImageCount = attachments.filter(
      (a) => a.type === "image",
    ).length;
    if (currentImageCount >= 3) {
      alert("Maximum 3 images per message");
      return;
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG, JPEG, GIF, or WebP image");
      return;
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image must be smaller than 3MB");
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const response = await result.json();
      const storageId = response.storageId;

      // Add to attachments
      const preview = URL.createObjectURL(file);
      setAttachments((prev) => [
        ...prev,
        {
          type: "image",
          storageId: storageId as Id<"_storage">,
          file,
          preview,
        },
      ]);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle link attachment
  const handleAddLink = () => {
    if (!linkInputValue.trim()) return;

    // Check attachment limit (max 3 links)
    const currentLinkCount = attachments.filter(
      (a) => a.type === "link",
    ).length;
    if (currentLinkCount >= 3) {
      alert("Maximum 3 links per message");
      return;
    }

    const url = linkInputValue.trim();
    try {
      new URL(url); // Validate URL
      setAttachments((prev) => [
        ...prev,
        {
          type: "link",
          url,
        },
      ]);
      setLinkInputValue("");
      setShowLinkModal(false);
    } catch {
      alert("Please enter a valid URL");
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev];
      const removed = newAttachments[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  // Handle send message
  const handleSend = async () => {
    if (
      (!inputValue.trim() && attachments.length === 0) ||
      !chatId ||
      isLoading
    )
      return;

    const message = inputValue.trim();
    setInputValue("");
    setIsStopped(false);

    // Handle clear command
    if (message.toLowerCase() === "clear") {
      await clearChatMutation({ chatId });
      setHasLoadedContext(false);
      setAttachments([]);
      return;
    }

    // Prepare attachments for sending
    const attachmentsToSend = attachments.map((att) => ({
      type: att.type as "image" | "link",
      storageId: att.storageId,
      url: att.url,
      scrapedContent: att.scrapedContent,
      title: att.title,
    }));

    // Add user message with attachments
    if (attachmentsToSend.length > 0) {
      await addUserMessageWithAttachments({
        chatId,
        content: message || "",
        attachments: attachmentsToSend,
      });
    } else {
      await addUserMessage({ chatId, content: message });
    }

    // Clear attachments
    attachments.forEach((att) => {
      if (att.preview) {
        URL.revokeObjectURL(att.preview);
      }
    });
    setAttachments([]);

    // Generate AI response
    setIsLoading(true);
    setIsStopped(false);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      await generateResponse({
        chatId,
        userMessage: message || "",
        model: selectedModel as "claude-sonnet-4-20250514" | "gpt-4o" | "gemini-2.0-flash" | undefined,
        pageContext: hasLoadedContext ? undefined : pageContent,
        attachments:
          attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        const errorMessage =
          (error as Error).message || "Failed to generate response";
        setError(errorMessage);
        console.error("Error generating response:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStopped(true);
      setIsLoading(false);
    }
  };

  // Handle key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle copy message
  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  // Auto-load page context on startup when chat is ready
  useEffect(() => {
    const loadContext = async () => {
      if (!chatId || !pageContent || hasLoadedContext) return;
      await setPageContext({ chatId, pageContext: pageContent });
      setHasLoadedContext(true);
    };
    loadContext();
  }, [chatId, pageContent, hasLoadedContext, setPageContext]);

  // Handle clear chat
  const handleClear = async () => {
    if (!chatId) return;
    await clearChatMutation({ chatId });
    setHasLoadedContext(false);
    setError(null);
  };

  const messages = chat?.messages || [];

  // Component to render image attachment with URL fetching
  const ImageAttachment = ({ storageId }: { storageId: Id<"_storage"> }) => {
    const imageUrl = useQuery(api.aiChats.getStorageUrl, { storageId });
    if (!imageUrl) {
      return <div className="ai-chat-attachment-loading">Loading image...</div>;
    }
    return (
      <img
        src={imageUrl}
        alt="Attachment"
        className="ai-chat-attachment-image"
        loading="lazy"
      />
    );
  };

  return (
    <div className="ai-chat-view">
      {/* Header with actions */}
      <div className="ai-chat-header">
        <span className="ai-chat-title">Agent</span>
        <div className="ai-chat-header-actions">
          {pageContent && hasLoadedContext && (
            <span className="ai-chat-context-loaded">
              <Check size={14} weight="bold" />
              Context loaded
            </span>
          )}
          <button
            className="ai-chat-clear-button"
            onClick={handleClear}
            title="Clear chat (or type 'clear')"
            disabled={messages.length === 0}
          >
            <Trash size={16} weight="bold" />
          </button>
          {onClose && (
            <button
              className="ai-chat-close-button"
              onClick={onClose}
              title="Close chat"
            >
              Back to Editor
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="ai-chat-empty">
            <p>Ask a question.</p>
            <p className="ai-chat-empty-hint">
              Press Enter to send, Shift+Enter for new line, or type
              &quot;clear&quot; to reset.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`ai-chat-message ai-chat-message-${message.role}`}
          >
            <div className="ai-chat-message-content">
              {message.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              ) : (
                <>
                  {message.content && <p>{message.content}</p>}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="ai-chat-attachments">
                      {message.attachments.map((att, attIndex) => (
                        <div key={attIndex} className="ai-chat-attachment">
                          {att.type === "image" && att.storageId && (
                            <ImageAttachment storageId={att.storageId} />
                          )}
                          {att.type === "link" && att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ai-chat-attachment-link"
                            >
                              <Link size={16} />
                              <span>{att.title || att.url}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {message.role === "assistant" && (
              <button
                className="ai-chat-copy-button"
                onClick={() => handleCopy(message.content, index)}
                title="Copy message"
              >
                {copiedMessageIndex === index ? (
                  <Check size={14} weight="bold" />
                ) : (
                  <Copy size={14} weight="bold" />
                )}
              </button>
            )}
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="ai-chat-message ai-chat-message-assistant ai-chat-loading">
            <div className="ai-chat-loading-content">
              <SpinnerGap size={18} weight="bold" className="ai-chat-spinner" />
              <span>Thinking...</span>
            </div>
            <button
              className="ai-chat-stop-button"
              onClick={handleStop}
              title="Stop generating"
            >
              <Stop size={16} weight="bold" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Stopped state */}
        {isStopped && !isLoading && (
          <div className="ai-chat-stopped">Generation stopped</div>
        )}

        {/* Error state */}
        {error && (
          <div className="ai-chat-message ai-chat-message-assistant ai-chat-error">
            <div className="ai-chat-message-content">
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="ai-chat-attachments-preview">
          {attachments.map((att, index) => (
            <div key={index} className="ai-chat-attachment-preview">
              {att.type === "image" && att.preview && (
                <>
                  <img
                    src={att.preview}
                    alt="Preview"
                    className="ai-chat-attachment-preview-image"
                  />
                  <button
                    className="ai-chat-attachment-remove"
                    onClick={() => handleRemoveAttachment(index)}
                    title="Remove attachment"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </>
              )}
              {att.type === "link" && (
                <>
                  <Link size={16} />
                  <span className="ai-chat-attachment-preview-url">
                    {att.url}
                  </span>
                  <button
                    className="ai-chat-attachment-remove"
                    onClick={() => handleRemoveAttachment(index)}
                    title="Remove attachment"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className="ai-chat-input-container"
        onClick={handleInputContainerClick}
      >
        <div className="ai-chat-input-wrapper">
          {!hideAttachments && (
            <div className="ai-chat-input-actions">
              <label
                className="ai-chat-attach-button"
                title="Upload image (max 3)"
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                    e.target.value = ""; // Reset input
                  }}
                  disabled={
                    isLoading ||
                    isUploading ||
                    attachments.filter((a) => a.type === "image").length >= 3
                  }
                />
                {isUploading ? (
                  <SpinnerGap
                    size={18}
                    weight="bold"
                    className="ai-chat-spinner"
                  />
                ) : (
                  <Image size={18} weight="regular" />
                )}
              </label>
              <button
                className="ai-chat-attach-button"
                onClick={() => setShowLinkModal(true)}
                disabled={
                  isLoading ||
                  isUploading ||
                  attachments.filter((a) => a.type === "link").length >= 3
                }
                title="Add link (max 3)"
              >
                <Link size={18} weight="regular" />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="ai-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className="ai-chat-send-button"
            onClick={handleSend}
            disabled={
              (!inputValue.trim() && attachments.length === 0) || isLoading
            }
            title="Send message (Enter)"
          >
            <PaperPlaneTilt size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Link input modal */}
      {showLinkModal && (
        <div
          className="ai-chat-link-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLinkModal(false);
              setLinkInputValue("");
            }
          }}
        >
          <div className="ai-chat-link-modal-content">
            <h3>Add Link</h3>
            <input
              type="url"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLink();
                } else if (e.key === "Escape") {
                  setShowLinkModal(false);
                  setLinkInputValue("");
                }
              }}
              placeholder="https://example.com"
              className="ai-chat-link-input"
              autoFocus
            />
            <div className="ai-chat-link-modal-actions">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInputValue("");
                }}
                className="ai-chat-link-modal-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="ai-chat-link-modal-add"
                disabled={!linkInputValue.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
