import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TurndownService from "turndown";
import Showdown from "showdown";
import {
  ArrowLeft,
  Article,
  Files,
  Robot,
  Envelope,
  Gear,
  ChartLine,
  ArrowsClockwise,
  CloudArrowDown,
  MagnifyingGlass,
  SignOut,
  Sun,
  Moon,
  TextAa,
  PencilSimple,
  Eye,
  Check,
  X,
  Download,
  Plus,
  Clock,
  Link as LinkIcon,
  Copy,
  Terminal,
  CheckCircle,
  Warning,
  Info,
  Trash,
  File,
  CopySimple,
  House,
  FileText,
  PaperPlaneTilt,
  Users,
  Funnel,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  TrendUp,
  SidebarSimple,
  Image,
  ChatText,
  SpinnerGap,
  CaretDown,
  ArrowsOut,
  ArrowsIn,
  FloppyDisk,
} from "@phosphor-icons/react";
import siteConfig from "../config/siteConfig";
import AIChatView from "../components/AIChatView";
import VersionHistoryModal from "../components/VersionHistoryModal";
import { MediaLibrary } from "../components/MediaLibrary";
import { ImageUploadModal } from "../components/ImageUploadModal";
import { isWorkOSConfigured } from "../utils/workos";
// Always import auth components - they're only used when WorkOS is configured
import {
  Authenticated as ConvexAuthenticated,
  Unauthenticated as ConvexUnauthenticated,
  AuthLoading as ConvexAuthLoading,
} from "convex/react";
import { useAuth as useWorkOSAuth } from "@workos-inc/authkit-react";

// Conditionally use auth components based on WorkOS configuration
// When WorkOS is not configured, use dummy components that render nothing or just children
const Authenticated: React.ComponentType<{ children: React.ReactNode }> =
  isWorkOSConfigured ? ConvexAuthenticated : ({ children }) => <>{children}</>;

const Unauthenticated: React.ComponentType<{ children: React.ReactNode }> =
  isWorkOSConfigured ? ConvexUnauthenticated : () => null;

const AuthLoading: React.ComponentType<{ children: React.ReactNode }> =
  isWorkOSConfigured ? ConvexAuthLoading : () => null;

// Dummy auth hook for when WorkOS is not configured
const dummyAuth = {
  user: undefined as undefined,
  signIn: () => {},
  signOut: () => {},
};

// Hook to get auth state - returns dummy values when WorkOS not configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useAuth = (): any => {
  // When WorkOS is configured, use the real hook
  if (isWorkOSConfigured) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useWorkOSAuth();
  }
  // When not configured, return dummy values
  return dummyAuth;
};

// Toast notification types
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Toast notification component
function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={18} weight="fill" />;
      case "error":
        return <Warning size={18} weight="fill" />;
      case "warning":
        return <Warning size={18} weight="fill" />;
      case "info":
      default:
        return <Info size={18} weight="fill" />;
    }
  };

  return (
    <div className={`dashboard-toast ${toast.type}`}>
      <span className="dashboard-toast-icon">{getIcon()}</span>
      <span className="dashboard-toast-message">{toast.message}</span>
      <button
        className="dashboard-toast-close"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Toast container component
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="dashboard-toast-container">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Command modal component
interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  command: string;
  description?: string;
}

function CommandModal({
  isOpen,
  onClose,
  title,
  command,
  description,
}: CommandModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="dashboard-modal-backdrop" onClick={handleBackdropClick}>
      <div className="dashboard-modal">
        <div className="dashboard-modal-header">
          <div className="dashboard-modal-icon">
            <Terminal size={24} weight="regular" />
          </div>
          <h3 className="dashboard-modal-title">{title}</h3>
          <button className="dashboard-modal-close" onClick={onClose}>
            <X size={18} weight="bold" />
          </button>
        </div>

        {description && (
          <p className="dashboard-modal-description">{description}</p>
        )}

        <div className="dashboard-modal-command-container">
          <code className="dashboard-modal-command">{command}</code>
          <button
            className="dashboard-modal-copy-btn"
            onClick={handleCopyCommand}
            title="Copy command"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="dashboard-modal-footer">
          <p className="dashboard-modal-hint">
            Copy this command and run it in your terminal
          </p>
          <div className="dashboard-modal-actions">
            <button className="dashboard-modal-btn secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="dashboard-modal-btn primary"
              onClick={handleCopyCommand}
            >
              {copied ? "Copied!" : "Copy Command"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirm Delete modal component
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCopy: () => void;
  title: string;
  itemName: string;
  itemType: "post" | "page";
  isDeleting: boolean;
}

function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  onCopy,
  title,
  itemName,
  itemType,
  isDeleting,
}: ConfirmDeleteModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, isDeleting]);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dashboard-modal-backdrop" onClick={handleBackdropClick}>
      <div className="dashboard-modal dashboard-modal-delete">
        <div className="dashboard-modal-header">
          <div className="dashboard-modal-icon dashboard-modal-icon-warning">
            <Warning size={24} weight="fill" />
          </div>
          <h3 className="dashboard-modal-title">{title}</h3>
          <button
            className="dashboard-modal-close"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="dashboard-modal-content">
          <p className="dashboard-modal-message">
            Are you sure you want to delete this {itemType}?
          </p>
          <div className="dashboard-modal-item-name">
            <FileText size={18} />
            <span>{itemName}</span>
          </div>
          <p className="dashboard-modal-warning-text">
            This action cannot be undone. The {itemType} will be permanently
            removed from the database.
          </p>
          <div className="dashboard-modal-copy-prompt">
            <div className="dashboard-modal-copy-prompt-text">
              <Info size={16} />
              <span>Would you like to copy the markdown before deleting?</span>
            </div>
            <button
              className={`dashboard-modal-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
              disabled={isDeleting}
              title="Copy markdown to clipboard"
            >
              {copied ? (
                <>
                  <Check size={16} weight="bold" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopySimple size={16} />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="dashboard-modal-footer">
          <div className="dashboard-modal-actions">
            <button
              className="dashboard-modal-btn secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="dashboard-modal-btn danger"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <SpinnerGap size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash size={16} />
                  <span>Delete {itemType}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard sections
type DashboardSection =
  | "posts"
  | "pages"
  | "post-editor"
  | "page-editor"
  | "write-post"
  | "write-page"
  | "ai-agent"
  | "newsletter"
  | "newsletter-send"
  | "newsletter-write-email"
  | "newsletter-recent-sends"
  | "newsletter-stats"
  | "import"
  | "config"
  | "index-html"
  | "stats"
  | "sync"
  | "media";

// Post/Page type for editing
interface ContentItem {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  date?: string;
  published: boolean;
  tags?: string[];
  featured?: boolean;
  featuredOrder?: number;
  excerpt?: string;
  image?: string;
  authorName?: string;
  authorImage?: string;
  order?: number;
  source?: "dashboard" | "sync";
}

// Frontmatter fields for posts
const postFrontmatterFields = [
  { key: "title", label: "Title", type: "text", required: true },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: true,
  },
  { key: "date", label: "Date", type: "date", required: true },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "published", label: "Published", type: "checkbox", required: true },
  { key: "tags", label: "Tags", type: "tags", required: true },
  { key: "featured", label: "Featured", type: "checkbox", required: false },
  {
    key: "featuredOrder",
    label: "Featured Order",
    type: "number",
    required: false,
  },
  { key: "excerpt", label: "Excerpt", type: "textarea", required: false },
  { key: "image", label: "Image URL", type: "text", required: false },
  { key: "authorName", label: "Author Name", type: "text", required: false },
  {
    key: "authorImage",
    label: "Author Image URL",
    type: "text",
    required: false,
  },
];

// Frontmatter fields for pages
const pageFrontmatterFields = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "published", label: "Published", type: "checkbox", required: true },
  { key: "order", label: "Nav Order", type: "number", required: false },
  { key: "featured", label: "Featured", type: "checkbox", required: false },
  {
    key: "featuredOrder",
    label: "Featured Order",
    type: "number",
    required: false,
  },
  { key: "authorName", label: "Author Name", type: "text", required: false },
  {
    key: "authorImage",
    label: "Author Image URL",
    type: "text",
    required: false,
  },
];

// Loading state component for auth
function LoadingState() {
  return (
    <div className="dashboard-auth-container">
      <p>Loading authentication...</p>
    </div>
  );
}

// Dashboard disabled message
function DashboardDisabled() {
  return (
    <div className="dashboard-auth-container">
      <div className="dashboard-auth-card">
        <h1>Dashboard Disabled</h1>
        <p>The dashboard is currently disabled in site configuration.</p>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          To enable the dashboard, set <code>dashboard.enabled: true</code> in{" "}
          <code>siteConfig.ts</code>.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

// WorkOS not configured message with setup instructions
function WorkOSSetupRequired() {
  return (
    <div className="dashboard-auth-container">
      <div className="dashboard-auth-card">
        <h1>Authentication Required</h1>
        <p>
          WorkOS authentication is not configured. To enable dashboard access:
        </p>
        <ol
          style={{
            textAlign: "left",
            marginTop: "1rem",
            marginBottom: "1rem",
            lineHeight: "1.8",
          }}
        >
          <li>
            Create a WorkOS account at{" "}
            <a
              href="https://workos.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              workos.com
            </a>
          </li>
          <li>
            Set <code>VITE_WORKOS_CLIENT_ID</code> in your environment
          </li>
          <li>
            Set <code>VITE_WORKOS_REDIRECT_URI</code> (e.g.,{" "}
            <code>http://localhost:5173/callback</code>)
          </li>
          <li>Configure the redirect URI in your WorkOS dashboard</li>
        </ol>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          Alternatively, set <code>dashboard.requireAuth: false</code> in{" "}
          <code>siteConfig.ts</code> to allow open access.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

// Login prompt component for unauthenticated users (only shown when WorkOS is configured)
function LoginPrompt() {
  const { signIn } = useAuth();

  return (
    <div className="dashboard-auth-container">
      <div className="dashboard-auth-card">
        <h1>Markdown Sync Dashboard</h1>
        <p>You need to sign in to access the dashboard.</p>
        <button onClick={() => signIn()} className="dashboard-sign-in-button">
          Sign In
        </button>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

// Main Dashboard export with conditional auth wrapper
export default function Dashboard() {
  // Check if dashboard is enabled in siteConfig
  const dashboardEnabled = siteConfig.dashboard?.enabled ?? true;
  const requireAuth = siteConfig.dashboard?.requireAuth ?? true;

  // If dashboard is disabled, show disabled message
  if (!dashboardEnabled) {
    return <DashboardDisabled />;
  }

  // If auth is required but WorkOS is not configured, show setup instructions
  if (requireAuth && !isWorkOSConfigured) {
    return <WorkOSSetupRequired />;
  }

  // If WorkOS is not configured and auth is not required, show dashboard directly
  if (!isWorkOSConfigured) {
    return <DashboardContent />;
  }

  // WorkOS is configured, use auth flow
  return (
    <>
      <AuthLoading>
        <LoadingState />
      </AuthLoading>
      <Unauthenticated>
        <LoginPrompt />
      </Unauthenticated>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}

// Dashboard content (protected by auth wrapper above)
function DashboardContent() {
  const { theme, setTheme } = useTheme();
  const { fontFamily, setFontFamily } = useFont();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editingType, setEditingType] = useState<"post" | "page">("post");
  const [showPreview, setShowPreview] = useState(false);

  // Sidebar collapsed state (persisted to localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("dashboard-sidebar-collapsed");
    return saved === "true";
  });

  // Toggle sidebar collapsed state
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("dashboard-sidebar-collapsed", String(newValue));
      return newValue;
    });
  }, []);

  // Keyboard shortcut: Cmd+. to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Command modal state
  const [commandModal, setCommandModal] = useState<{
    isOpen: boolean;
    title: string;
    command: string;
    description?: string;
  }>({ isOpen: false, title: "", command: "" });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    type: "post" | "page";
    item: ContentItem | null;
  }>({ isOpen: false, id: "", title: "", type: "post", item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync server state
  const [syncOutput, setSyncOutput] = useState<string>("");
  const [syncRunning, setSyncRunning] = useState<string | null>(null); // command id or null
  const [syncServerAvailable, setSyncServerAvailable] = useState<
    boolean | null
  >(null);
  const syncOutputRef = useRef<HTMLPreElement>(null);

  // Convex queries
  const posts = useQuery(api.posts.listAll);
  const pages = useQuery(api.pages.listAll);

  // CMS mutations for CRUD operations
  const deletePostMutation = useMutation(api.cms.deletePost);
  const deletePageMutation = useMutation(api.cms.deletePage);
  const updatePostMutation = useMutation(api.cms.updatePost);
  const updatePageMutation = useMutation(api.cms.updatePage);

  // Add toast notification
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // Dismiss toast notification
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check if sync server is available on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3001/health", {
          method: "GET",
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          setSyncServerAvailable(true);
        } else {
          setSyncServerAvailable(false);
        }
      } catch {
        setSyncServerAvailable(false);
      }
    };
    checkServer();
  }, []);

  // Execute sync command via sync server
  const executeSync = useCallback(
    async (commandId: string, commandLabel: string) => {
      // Check server availability first
      if (syncServerAvailable === false) {
        addToast(
          "Sync server not running. Start it with: npm run sync-server",
          "error",
        );
        return;
      }

      if (syncRunning) {
        addToast("A sync command is already running", "warning");
        return;
      }

      setSyncRunning(commandId);
      setSyncOutput("");

      try {
        const token = localStorage.getItem("syncToken") || "";
        const response = await fetch("http://127.0.0.1:3001/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Sync-Token": token,
          },
          body: JSON.stringify({ command: commandId }),
        });

        if (!response.ok) {
          const error = await response.json();
          addToast(error.error || "Failed to execute sync", "error");
          setSyncRunning(null);
          return;
        }

        // Stream the response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          addToast("Failed to read sync output", "error");
          setSyncRunning(null);
          return;
        }

        addToast(`Running: ${commandLabel}`, "info");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          setSyncOutput((prev) => prev + text);

          // Auto-scroll to bottom
          if (syncOutputRef.current) {
            syncOutputRef.current.scrollTop =
              syncOutputRef.current.scrollHeight;
          }
        }

        addToast(`Completed: ${commandLabel}`, "success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        if (
          message.includes("Failed to fetch") ||
          message.includes("NetworkError")
        ) {
          addToast(
            "Sync server not running. Start it with: npm run sync-server",
            "error",
          );
          setSyncServerAvailable(false);
        } else {
          addToast(`Sync failed: ${message}`, "error");
        }
      } finally {
        setSyncRunning(null);
      }
    },
    [syncRunning, syncServerAvailable, addToast],
  );

  // Show command modal
  const showCommandModal = useCallback(
    (title: string, command: string, description?: string) => {
      setCommandModal({ isOpen: true, title, command, description });
    },
    [],
  );

  // Close command modal
  const closeCommandModal = useCallback(() => {
    setCommandModal({ isOpen: false, title: "", command: "" });
  }, []);

  // Filter posts/pages based on search
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query),
    );
  }, [posts, searchQuery]);

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    if (!searchQuery) return pages;
    const query = searchQuery.toLowerCase();
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query),
    );
  }, [pages, searchQuery]);

  // Handle editing a post
  const handleEditPost = useCallback((post: ContentItem) => {
    setEditingItem(post);
    setEditingType("post");
    setActiveSection("post-editor");
  }, []);

  // Handle editing a page
  const handleEditPage = useCallback((page: ContentItem) => {
    setEditingItem(page);
    setEditingType("page");
    setActiveSection("page-editor");
  }, []);

  // Show delete confirmation modal for a post
  const handleDeletePost = useCallback(
    (item: ContentItem) => {
      setDeleteModal({
        isOpen: true,
        id: item._id,
        title: item.title,
        type: "post",
        item,
      });
    },
    [],
  );

  // Show delete confirmation modal for a page
  const handleDeletePage = useCallback(
    (item: ContentItem) => {
      setDeleteModal({
        isOpen: true,
        id: item._id,
        title: item.title,
        type: "page",
        item,
      });
    },
    [],
  );

  // Close delete modal
  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, id: "", title: "", type: "post", item: null });
    }
  }, [isDeleting]);

  // Confirm and execute deletion
  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === "post") {
        await deletePostMutation({ id: deleteModal.id as Id<"posts"> });
        addToast("Post deleted successfully", "success");
      } else {
        await deletePageMutation({ id: deleteModal.id as Id<"pages"> });
        addToast("Page deleted successfully", "success");
      }
      setDeleteModal({ isOpen: false, id: "", title: "", type: "post", item: null });
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : `Failed to delete ${deleteModal.type}`,
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal, deletePostMutation, deletePageMutation, addToast]);

  // Handle saving post changes
  const handleSavePost = useCallback(
    async (item: ContentItem) => {
      try {
        await updatePostMutation({
          id: item._id as Id<"posts">,
          post: {
            title: item.title,
            description: item.description,
            content: item.content,
            date: item.date,
            published: item.published,
            tags: item.tags,
            excerpt: item.excerpt,
            image: item.image,
            featured: item.featured,
            featuredOrder: item.featuredOrder,
            authorName: item.authorName,
            authorImage: item.authorImage,
          },
        });
        addToast("Post saved successfully", "success");
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Failed to save post",
          "error",
        );
      }
    },
    [updatePostMutation, addToast],
  );

  // Handle saving page changes
  const handleSavePage = useCallback(
    async (item: ContentItem) => {
      try {
        await updatePageMutation({
          id: item._id as Id<"pages">,
          page: {
            title: item.title,
            content: item.content,
            published: item.published,
            order: item.order,
            excerpt: item.excerpt,
            image: item.image,
            featured: item.featured,
            featuredOrder: item.featuredOrder,
            authorName: item.authorName,
            authorImage: item.authorImage,
          },
        });
        addToast("Page saved successfully", "success");
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Failed to save page",
          "error",
        );
      }
    },
    [updatePageMutation, addToast],
  );

  // Generate markdown content from item
  const generateMarkdown = useCallback(
    (item: ContentItem, type: "post" | "page"): string => {
      const fields =
        type === "post" ? postFrontmatterFields : pageFrontmatterFields;
      let frontmatter = "---\n";

      fields.forEach((field) => {
        const value = item[field.key as keyof ContentItem];
        if (value !== undefined && value !== null && value !== "") {
          if (field.type === "tags" && Array.isArray(value)) {
            frontmatter += `${field.key}: [${value.map((t) => `"${t}"`).join(", ")}]\n`;
          } else if (field.type === "checkbox") {
            frontmatter += `${field.key}: ${value}\n`;
          } else if (field.type === "number") {
            frontmatter += `${field.key}: ${value}\n`;
          } else {
            frontmatter += `${field.key}: "${String(value).replace(/"/g, '\\"')}"\n`;
          }
        }
      });

      frontmatter += "---\n\n";
      return frontmatter + item.content;
    },
    [],
  );

  // Copy markdown content before deletion
  const handleCopyBeforeDelete = useCallback(async () => {
    if (!deleteModal.item) return;
    const markdown = generateMarkdown(deleteModal.item, deleteModal.type);
    await navigator.clipboard.writeText(markdown);
    addToast("Markdown copied to clipboard", "success");
  }, [deleteModal, generateMarkdown, addToast]);

  // Download markdown file
  const handleDownloadMarkdown = useCallback(() => {
    if (!editingItem) return;

    const markdown = generateMarkdown(editingItem, editingType);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editingItem.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${editingItem.slug}.md`, "success");
  }, [editingItem, editingType, generateMarkdown, addToast]);

  // Copy markdown to clipboard
  const handleCopyMarkdown = useCallback(async () => {
    if (!editingItem) return;

    const markdown = generateMarkdown(editingItem, editingType);
    await navigator.clipboard.writeText(markdown);
    addToast("Markdown copied to clipboard", "success");
  }, [editingItem, editingType, generateMarkdown, addToast]);

  // Navigation items for left sidebar
  // Filter items based on feature configuration
  const mediaEnabled = siteConfig.media?.enabled ?? false;
  const newsletterEnabled = siteConfig.newsletter?.enabled ?? false;

  const navSections = [
    {
      label: "Content",
      items: [
        { id: "posts" as const, label: "Posts", icon: Article },
        { id: "pages" as const, label: "Pages", icon: Files },
      ],
    },
    {
      label: "Create",
      items: [
        { id: "write-post" as const, label: "Write Post", icon: Article },
        { id: "write-page" as const, label: "Write Page", icon: File },
        { id: "ai-agent" as const, label: "AI Agent", icon: Robot },
        { id: "import" as const, label: "Import URL", icon: CloudArrowDown },
        // Only show Media if media feature is enabled
        ...(mediaEnabled
          ? [{ id: "media" as const, label: "Media", icon: Image }]
          : []),
      ],
    },
    // Only show Newsletter section if newsletter is enabled
    ...(newsletterEnabled
      ? [
          {
            label: "Newsletter",
            items: [
              {
                id: "newsletter" as const,
                label: "Subscribers",
                icon: Envelope,
              },
              {
                id: "newsletter-send" as const,
                label: "Send Newsletter",
                icon: Envelope,
              },
              {
                id: "newsletter-write-email" as const,
                label: "Write Email",
                icon: PencilSimple,
              },
              {
                id: "newsletter-recent-sends" as const,
                label: "Recent Sends",
                icon: ClockCounterClockwise,
              },
              {
                id: "newsletter-stats" as const,
                label: "Email Stats",
                icon: ChartLine,
              },
            ],
          },
        ]
      : []),
    {
      label: "Settings",
      items: [
        { id: "config" as const, label: "Site Config", icon: Gear },
        { id: "index-html" as const, label: "Index HTML", icon: FileText },
        { id: "stats" as const, label: "Analytics", icon: ChartLine },
        { id: "sync" as const, label: "Sync Content", icon: ArrowsClockwise },
      ],
    },
  ];

  // Theme toggle
  const toggleTheme = () => {
    const themes: Array<"dark" | "light" | "tan" | "cloud"> = [
      "dark",
      "light",
      "tan",
      "cloud",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Font toggle
  const toggleFont = () => {
    const fonts: Array<"serif" | "sans" | "monospace"> = [
      "serif",
      "sans",
      "monospace",
    ];
    const currentIndex = fonts.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fonts.length;
    setFontFamily(fonts[nextIndex]);
  };

  // Check if auth is disabled (for warning banner)
  const requireAuth = siteConfig.dashboard?.requireAuth ?? false;
  const showAuthWarning = !requireAuth || !isWorkOSConfigured;

  return (
    <div
      className={`dashboard-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Auth Warning Banner - shown when authentication is not enabled */}
      {showAuthWarning && (
        <div className="dashboard-auth-warning">
          <Warning size={16} weight="bold" />
          <span>
            Dashboard access is open.{" "}
            {!isWorkOSConfigured
              ? "Configure WorkOS and set requireAuth: true in siteConfig.ts for secure access."
              : "Set requireAuth: true in siteConfig.ts for secure access."}
          </span>
        </div>
      )}

      {/* Command Modal */}
      <CommandModal
        isOpen={commandModal.isOpen}
        onClose={closeCommandModal}
        title={commandModal.title}
        command={commandModal.command}
        description={commandModal.description}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        onCopy={handleCopyBeforeDelete}
        title="Delete Confirmation"
        itemName={deleteModal.title}
        itemType={deleteModal.type}
        isDeleting={isDeleting}
      />

      {/* Left Sidebar */}
      <aside
        className={`dashboard-sidebar-left ${sidebarCollapsed ? "collapsed" : ""}`}
      >
        <div className="dashboard-sidebar-header">
          <Link to="/" className="dashboard-logo-link" title="Back to home">
            <House size={20} weight="regular" />
            <span>Home</span>
          </Link>
          <button
            className="dashboard-sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <SidebarSimple size={20} weight="regular" />
          </button>
        </div>

        <nav className="dashboard-nav">
          {navSections.map((section) => (
            <div key={section.label} className="dashboard-nav-section">
              <span className="dashboard-nav-label">{section.label}</span>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`dashboard-nav-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setEditingItem(null);
                  }}
                >
                  <item.icon
                    size={18}
                    weight={activeSection === item.id ? "fill" : "regular"}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile Section at bottom of sidebar */}
        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-card">
            {user?.profilePictureUrl && (
              <img
                src={user.profilePictureUrl}
                alt={user.firstName || "User"}
                className="dashboard-user-avatar"
              />
            )}
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">
                {user?.firstName
                  ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                  : "User"}
              </span>
            </div>
          </div>
          <button
            className="dashboard-signout-btn"
            onClick={() => signOut()}
            title="Sign out"
          >
            <SignOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">
              {activeSection === "posts" && "Posts"}
              {activeSection === "pages" && "Pages"}
              {activeSection === "post-editor" && "Edit Post"}
              {activeSection === "page-editor" && "Edit Page"}
              {activeSection === "write-post" && "Write Post"}
              {activeSection === "write-page" && "Write Page"}
              {activeSection === "ai-agent" && "AI Agent"}
              {activeSection === "newsletter" && "Subscribers"}
              {activeSection === "newsletter-send" && "Send Newsletter"}
              {activeSection === "newsletter-write-email" && "Write Email"}
              {activeSection === "newsletter-recent-sends" && "Recent Sends"}
              {activeSection === "newsletter-stats" && "Email Stats"}
              {activeSection === "import" && "Import URL"}
              {activeSection === "config" && "Site Config"}
              {activeSection === "index-html" && "Index HTML"}
              {activeSection === "stats" && "Analytics"}
              {activeSection === "sync" && "Sync Content"}
              {activeSection === "media" && "Media"}
            </h1>
          </div>

          <div className="dashboard-header-center">
            <div className="dashboard-search">
              <MagnifyingGlass size={16} />
              <input
                type="text"
                placeholder="Search posts and pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dashboard-search-input"
              />
            </div>
          </div>

          <div className="dashboard-header-right">
            <button
              className={`dashboard-sync-btn dev ${syncRunning === "sync:all" ? "running" : ""}`}
              title={
                syncServerAvailable
                  ? "Execute Sync Dev"
                  : "Copy sync command (server not running)"
              }
              onClick={() => {
                if (syncServerAvailable) {
                  executeSync("sync:all", "Sync All (Dev)");
                } else {
                  showCommandModal(
                    "Sync Development",
                    "npm run sync:all",
                    "Sync all content to development environment",
                  );
                }
              }}
              disabled={syncRunning !== null}
            >
              <ArrowsClockwise
                size={16}
                className={syncRunning === "sync:all" ? "spinning" : ""}
              />
              <span>
                {syncRunning === "sync:all" ? "Running..." : "Sync Dev"}
              </span>
            </button>
            <button
              className={`dashboard-sync-btn prod ${syncRunning === "sync:all:prod" ? "running" : ""}`}
              title={
                syncServerAvailable
                  ? "Execute Sync Prod"
                  : "Copy sync command (server not running)"
              }
              onClick={() => {
                if (syncServerAvailable) {
                  executeSync("sync:all:prod", "Sync All (Prod)");
                } else {
                  showCommandModal(
                    "Sync Production",
                    "npm run sync:all:prod",
                    "Sync all content to production environment",
                  );
                }
              }}
              disabled={syncRunning !== null}
            >
              <ArrowsClockwise
                size={16}
                className={syncRunning === "sync:all:prod" ? "spinning" : ""}
              />
              <span>
                {syncRunning === "sync:all:prod" ? "Running..." : "Sync Prod"}
              </span>
            </button>
            <button
              className="dashboard-theme-btn"
              onClick={toggleTheme}
              title={`Theme: ${theme}`}
            >
              {theme === "dark" ? (
                <Moon size={18} weight="fill" />
              ) : (
                <Sun size={18} weight="fill" />
              )}
            </button>
            <button
              className="dashboard-font-btn"
              onClick={toggleFont}
              title={`Font: ${fontFamily}`}
            >
              <TextAa
                size={18}
                weight={fontFamily === "monospace" ? "fill" : "regular"}
              />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Posts List */}
          {activeSection === "posts" && (
            <PostsListView
              posts={filteredPosts}
              onEdit={handleEditPost}
              searchQuery={searchQuery}
              onDelete={handleDeletePost}
            />
          )}

          {/* Pages List */}
          {activeSection === "pages" && (
            <PagesListView
              pages={filteredPages}
              onEdit={handleEditPage}
              searchQuery={searchQuery}
              onDelete={handleDeletePage}
            />
          )}

          {/* Post/Page Editor */}
          {(activeSection === "post-editor" ||
            activeSection === "page-editor") &&
            editingItem && (
              <EditorView
                item={editingItem}
                type={editingType}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                setItem={setEditingItem}
                onDownload={handleDownloadMarkdown}
                onCopy={handleCopyMarkdown}
                onBack={() =>
                  setActiveSection(editingType === "post" ? "posts" : "pages")
                }
                onSave={
                  editingType === "post" ? handleSavePost : handleSavePage
                }
              />
            )}

          {/* Write Post Section */}
          {activeSection === "write-post" && (
            <WriteSection
              contentType="post"
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              addToast={addToast}
              setActiveSection={setActiveSection}
            />
          )}

          {/* Write Page Section */}
          {activeSection === "write-page" && (
            <WriteSection
              contentType="page"
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              addToast={addToast}
              setActiveSection={setActiveSection}
            />
          )}

          {/* AI Agent Section */}
          {activeSection === "ai-agent" && <AIAgentSection />}

          {/* Newsletter Subscribers */}
          {activeSection === "newsletter" && <NewsletterSubscribersSection />}

          {/* Newsletter Send */}
          {activeSection === "newsletter-send" && (
            <NewsletterSendSection addToast={addToast} />
          )}

          {/* Newsletter Write Email */}
          {activeSection === "newsletter-write-email" && (
            <NewsletterWriteEmailSection addToast={addToast} />
          )}

          {/* Newsletter Recent Sends */}
          {activeSection === "newsletter-recent-sends" && (
            <NewsletterRecentSendsSection />
          )}

          {/* Newsletter Stats */}
          {activeSection === "newsletter-stats" && <NewsletterStatsSection />}

          {/* Import URL */}
          {activeSection === "import" && (
            <ImportURLSection addToast={addToast} />
          )}

          {/* Site Config */}
          {activeSection === "config" && (
            <ConfigSection
              addToast={addToast}
              onNavigateToIndexHtml={() => setActiveSection("index-html")}
            />
          )}

          {/* Index HTML */}
          {activeSection === "index-html" && (
            <IndexHtmlSection addToast={addToast} />
          )}

          {/* Stats */}
          {activeSection === "stats" && <StatsSection />}

          {/* Sync */}
          {activeSection === "sync" && (
            <SyncSection
              showCommandModal={showCommandModal}
              executeSync={executeSync}
              syncOutput={syncOutput}
              syncRunning={syncRunning}
              syncServerAvailable={syncServerAvailable}
              syncOutputRef={syncOutputRef}
              setSyncOutput={setSyncOutput}
            />
          )}

          {/* Media */}
          {activeSection === "media" && <MediaLibrary />}
        </div>
      </main>
    </div>
  );
}

// Posts List View Component
function PostsListView({
  posts,
  onEdit,
  searchQuery,
  onDelete,
}: {
  posts: ContentItem[];
  onEdit: (post: ContentItem) => void;
  searchQuery: string;
  onDelete: (item: ContentItem) => void;
}) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (filter === "published") filtered = posts.filter((p) => p.published);
    if (filter === "draft") filtered = posts.filter((p) => !p.published);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [posts, filter, searchQuery]);

  const paginatedPosts = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages - 1;

  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (newFilter: "all" | "published" | "draft") => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  return (
    <div className="dashboard-list-view">
      <div className="dashboard-list-header">
        <div className="dashboard-filter-tabs">
          <button
            className={`dashboard-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All ({posts.length})
          </button>
          <button
            className={`dashboard-filter-tab ${filter === "published" ? "active" : ""}`}
            onClick={() => handleFilterChange("published")}
          >
            Published ({posts.filter((p) => p.published).length})
          </button>
          <button
            className={`dashboard-filter-tab ${filter === "draft" ? "active" : ""}`}
            onClick={() => handleFilterChange("draft")}
          >
            Drafts ({posts.filter((p) => !p.published).length})
          </button>
          <div className="dashboard-items-per-page">
            <label htmlFor="posts-per-page" className="dashboard-items-label">
              Show:
            </label>
            <select
              id="posts-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="dashboard-items-select"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-list-table">
        <div className="dashboard-list-table-header">
          <span className="col-title">Title</span>
          <span className="col-date">Date</span>
          <span className="col-status">Status</span>
          <span className="col-actions">Actions</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="dashboard-list-empty">
            {searchQuery ? "No posts match your search" : "No posts found"}
          </div>
        ) : (
          paginatedPosts.map((post) => (
            <div key={post._id} className="dashboard-list-row">
              <div className="col-title">
                <span className="post-title">{post.title}</span>
                <span className="post-slug">/{post.slug}</span>
              </div>
              <div className="col-date">
                <Clock size={14} />
                <span>{post.date || "No date"}</span>
              </div>
              <div className="col-status">
                <span
                  className={`status-badge ${post.published ? "published" : "draft"}`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
                {post.source === "dashboard" && (
                  <span className="source-badge dashboard">Dashboard</span>
                )}
                {(!post.source || post.source === "sync") && (
                  <span className="source-badge sync">Synced</span>
                )}
              </div>
              <div className="col-actions">
                <button
                  className="action-btn edit"
                  onClick={() => onEdit(post as ContentItem)}
                  title="Edit"
                >
                  <PencilSimple size={16} />
                </button>
                <Link
                  to={`/${post.slug}`}
                  className="action-btn view"
                  title="View"
                  target="_blank"
                >
                  <Eye size={16} />
                </Link>
                {post.source === "dashboard" && (
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(post as ContentItem)}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPosts.length > itemsPerPage && (
        <div className="dashboard-pagination">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 0}
            className="dashboard-pagination-btn"
          >
            <CaretLeft size={16} />
            First
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="dashboard-pagination-btn"
          >
            Next
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// Pages List View Component
function PagesListView({
  pages,
  onEdit,
  searchQuery,
  onDelete,
}: {
  pages: ContentItem[];
  onEdit: (page: ContentItem) => void;
  searchQuery: string;
  onDelete: (item: ContentItem) => void;
}) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredPages = useMemo(() => {
    let filtered = pages;
    if (filter === "published") filtered = pages.filter((p) => p.published);
    if (filter === "draft") filtered = pages.filter((p) => !p.published);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          (p.content && p.content.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [pages, filter, searchQuery]);

  const paginatedPages = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredPages.slice(start, start + itemsPerPage);
  }, [filteredPages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages - 1;

  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (newFilter: "all" | "published" | "draft") => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  return (
    <div className="dashboard-list-view">
      <div className="dashboard-list-header">
        <div className="dashboard-filter-tabs">
          <button
            className={`dashboard-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All ({pages.length})
          </button>
          <button
            className={`dashboard-filter-tab ${filter === "published" ? "active" : ""}`}
            onClick={() => handleFilterChange("published")}
          >
            Published ({pages.filter((p) => p.published).length})
          </button>
          <button
            className={`dashboard-filter-tab ${filter === "draft" ? "active" : ""}`}
            onClick={() => handleFilterChange("draft")}
          >
            Drafts ({pages.filter((p) => !p.published).length})
          </button>
          <div className="dashboard-items-per-page">
            <label htmlFor="pages-per-page" className="dashboard-items-label">
              Show:
            </label>
            <select
              id="pages-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="dashboard-items-select"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-list-table">
        <div className="dashboard-list-table-header">
          <span className="col-title">Title</span>
          <span className="col-order">Order</span>
          <span className="col-status">Status</span>
          <span className="col-actions">Actions</span>
        </div>

        {filteredPages.length === 0 ? (
          <div className="dashboard-list-empty">
            {searchQuery ? "No pages match your search" : "No pages found"}
          </div>
        ) : (
          paginatedPages.map((page) => (
            <div key={page._id} className="dashboard-list-row">
              <div className="col-title">
                <span className="post-title">{page.title}</span>
                <span className="post-slug">/{page.slug}</span>
              </div>
              <div className="col-order">
                {page.order !== undefined ? page.order : "-"}
              </div>
              <div className="col-status">
                <span
                  className={`status-badge ${page.published ? "published" : "draft"}`}
                >
                  {page.published ? "Published" : "Draft"}
                </span>
                {page.source === "dashboard" && (
                  <span className="source-badge dashboard">Dashboard</span>
                )}
                {(!page.source || page.source === "sync") && (
                  <span className="source-badge sync">Synced</span>
                )}
              </div>
              <div className="col-actions">
                <button
                  className="action-btn edit"
                  onClick={() => onEdit(page as ContentItem)}
                  title="Edit"
                >
                  <PencilSimple size={16} />
                </button>
                <Link
                  to={`/${page.slug}`}
                  className="action-btn view"
                  title="View"
                  target="_blank"
                >
                  <Eye size={16} />
                </Link>
                {page.source === "dashboard" && (
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(page as ContentItem)}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPages.length > itemsPerPage && (
        <div className="dashboard-pagination">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 0}
            className="dashboard-pagination-btn"
          >
            <CaretLeft size={16} />
            First
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="dashboard-pagination-btn"
          >
            Next
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// Editor View Component
function EditorView({
  item,
  type,
  showPreview,
  setShowPreview,
  setItem,
  onDownload,
  onCopy,
  onBack,
  onSave,
}: {
  item: ContentItem;
  type: "post" | "page";
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  setItem: (item: ContentItem) => void;
  onDownload: () => void;
  onCopy: () => void;
  onBack: () => void;
  onSave: (item: ContentItem) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const versionControlEnabled = useQuery(api.versions.isEnabled);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("dashboard-sidebar-width");
    return saved ? Number(saved) : 280;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(item);
    } finally {
      setIsSaving(false);
    }
  };

  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!sidebarRef.current) return;

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = sidebarWidth;
    },
    [sidebarWidth],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startXRef.current - e.clientX; // Negative when dragging left (making sidebar wider)
      const newWidth = startWidthRef.current + deltaX;

      // Constrain width between 200px and 600px
      const constrainedWidth = Math.max(200, Math.min(600, newWidth));
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem("dashboard-sidebar-width", String(sidebarWidth));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, sidebarWidth]);

  return (
    <div className="dashboard-editor">
      <div className="dashboard-editor-toolbar">
        <button className="dashboard-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to {type === "post" ? "Posts" : "Pages"}</span>
        </button>
        <div className="dashboard-editor-actions">
          <button
            className={`dashboard-view-toggle ${!showPreview ? "active" : ""}`}
            onClick={() => setShowPreview(false)}
          >
            Markdown
          </button>
          <button
            className={`dashboard-view-toggle ${showPreview ? "active" : ""}`}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
          <button
            className="dashboard-action-btn"
            onClick={handleCopy}
            title="Copy Markdown"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {versionControlEnabled && (
            <button
              className="dashboard-action-btn"
              onClick={() => setShowVersionHistory(true)}
              title="View Version History"
            >
              <ClockCounterClockwise size={16} />
              <span>History</span>
            </button>
          )}
          <button
            className="dashboard-action-btn primary"
            onClick={onDownload}
            title="Download Markdown"
          >
            <Download size={16} />
            <span>Download .md</span>
          </button>
          <button
            className="dashboard-action-btn success"
            onClick={handleSave}
            disabled={isSaving}
            title="Save to Database"
          >
            {isSaving ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <FloppyDisk size={16} />
            )}
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      <div className="dashboard-editor-container">
        <div className="dashboard-editor-content">
          {showPreview ? (
            <div className="dashboard-preview">
              <div className="dashboard-preview-content">
                <h1 className="blog-h1">{item.title}</h1>
                {item.description && <p className="lead">{item.description}</p>}
                <div className="blog-post-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, defaultSchema]]}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <textarea
              className="dashboard-textarea"
              value={item.content}
              onChange={(e) => setItem({ ...item, content: e.target.value })}
              placeholder="Write your content here..."
            />
          )}
        </div>

        <div
          ref={sidebarRef}
          className={`dashboard-editor-sidebar ${isResizing ? "resizing" : ""}`}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div
            className="dashboard-sidebar-resize-handle"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />
          <FrontmatterSidebar item={item} type={type} setItem={setItem} />
        </div>
      </div>

      {showVersionHistory && (
        <VersionHistoryModal
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          contentType={type}
          contentId={item._id}
          currentContent={item.content}
          currentTitle={item.title}
        />
      )}
    </div>
  );
}

// Helper function to convert POST_FIELDS/PAGE_FIELDS to sidebar field format
function convertFieldsToSidebarFormat(
  allFields: Array<{ name: string; required: boolean; example: string }>,
  activeFields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
  }>,
): Array<{ key: string; label: string; type: string; required: boolean }> {
  const activeKeys = new Set(activeFields.map((f) => f.key));

  // Convert all fields to sidebar format
  const allFieldsConverted = allFields.map((field) => {
    // Determine field type based on field name
    let fieldType = "text";
    if (
      field.name === "description" ||
      field.name === "excerpt" ||
      field.name === "footer"
    ) {
      fieldType = "textarea";
    } else if (field.name === "date") {
      fieldType = "date";
    } else if (field.name === "tags") {
      fieldType = "tags";
    } else if (
      field.name === "published" ||
      field.name === "featured" ||
      field.name === "showImageAtTop" ||
      field.name === "rightSidebar" ||
      field.name === "showFooter" ||
      field.name === "showSocialFooter" ||
      field.name === "aiChat" ||
      field.name === "blogFeatured" ||
      field.name === "newsletter" ||
      field.name === "contactForm" ||
      field.name === "showInNav"
    ) {
      fieldType = "checkbox";
    } else if (field.name === "featuredOrder" || field.name === "order") {
      fieldType = "number";
    }

    // Convert field name to label
    const label = field.name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    return {
      key: field.name,
      label,
      type: fieldType,
      required: field.required,
    };
  });

  // Return active fields first, then all other fields
  const otherFields = allFieldsConverted.filter((f) => !activeKeys.has(f.key));
  return [...activeFields, ...otherFields];
}

// Frontmatter Sidebar Component
function FrontmatterSidebar({
  item,
  type,
  setItem,
}: {
  item: ContentItem;
  type: "post" | "page";
  setItem: (item: ContentItem) => void;
}) {
  const activeFields =
    type === "post" ? postFrontmatterFields : pageFrontmatterFields;
  const allFields = type === "post" ? POST_FIELDS : PAGE_FIELDS;
  const fields = convertFieldsToSidebarFormat(allFields, activeFields);
  const [tagInput, setTagInput] = useState("");

  const handleFieldChange = (key: string, value: unknown) => {
    setItem({ ...item, [key]: value });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && item.tags) {
      if (!item.tags.includes(tagInput.trim())) {
        handleFieldChange("tags", [...item.tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (item.tags) {
      handleFieldChange(
        "tags",
        item.tags.filter((t) => t !== tag),
      );
    }
  };

  // Separate active and additional fields
  const activeKeys = new Set(activeFields.map((f) => f.key));
  const activeFieldsList = fields.filter((f) => activeKeys.has(f.key));
  const additionalFields = fields.filter((f) => !activeKeys.has(f.key));

  return (
    <div className="dashboard-frontmatter">
      <h3 className="dashboard-frontmatter-title">Frontmatter</h3>
      <div className="dashboard-frontmatter-fields">
        {activeFieldsList.map((field) => (
          <div key={field.key} className="dashboard-frontmatter-field">
            <label className="dashboard-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                className="dashboard-field-input"
                value={String(item[field.key as keyof ContentItem] || "")}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.label}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                className="dashboard-field-textarea"
                value={String(item[field.key as keyof ContentItem] || "")}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.label}
                rows={3}
              />
            )}

            {field.type === "date" && (
              <input
                type="date"
                className="dashboard-field-input"
                value={String(item[field.key as keyof ContentItem] || "")}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            )}

            {field.type === "number" && (
              <input
                type="number"
                className="dashboard-field-input"
                value={String(item[field.key as keyof ContentItem] || "")}
                onChange={(e) =>
                  handleFieldChange(
                    field.key,
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder={field.label}
              />
            )}

            {field.type === "checkbox" && (
              <label className="dashboard-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(item[field.key as keyof ContentItem])}
                  onChange={(e) =>
                    handleFieldChange(field.key, e.target.checked)
                  }
                />
                <span>{field.label}</span>
              </label>
            )}

            {field.type === "tags" && (
              <div className="dashboard-tags-field">
                <div className="dashboard-tags-list">
                  {(item.tags || []).map((tag) => (
                    <span key={tag} className="dashboard-tag">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="dashboard-tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Add tag..."
                  />
                  <button onClick={handleAddTag}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {additionalFields.length > 0 && (
          <>
            <div className="dashboard-frontmatter-divider" />
            <div className="dashboard-frontmatter-section-title">
              Additional Fields
            </div>
            {additionalFields.map((field) => (
              <div key={field.key} className="dashboard-frontmatter-field">
                <label className="dashboard-field-label">
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    className="dashboard-field-input"
                    value={String(item[field.key as keyof ContentItem] || "")}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={field.label}
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    className="dashboard-field-textarea"
                    value={String(item[field.key as keyof ContentItem] || "")}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={field.label}
                    rows={3}
                  />
                )}

                {field.type === "date" && (
                  <input
                    type="date"
                    className="dashboard-field-input"
                    value={String(item[field.key as keyof ContentItem] || "")}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                  />
                )}

                {field.type === "number" && (
                  <input
                    type="number"
                    className="dashboard-field-input"
                    value={String(item[field.key as keyof ContentItem] || "")}
                    onChange={(e) =>
                      handleFieldChange(
                        field.key,
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder={field.label}
                  />
                )}

                {field.type === "checkbox" && (
                  <label className="dashboard-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(item[field.key as keyof ContentItem])}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.checked)
                      }
                    />
                    <span>{field.label}</span>
                  </label>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Frontmatter field definitions for blog posts (matches Write.tsx)
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
  { name: "showImageAtTop", required: false, example: "true" },
  {
    name: "excerpt",
    required: false,
    example: '"Short description for cards"',
  },
  { name: "featured", required: false, example: "true" },
  { name: "featuredOrder", required: false, example: "1" },
  { name: "authorName", required: false, example: '"Jane Doe"' },
  {
    name: "authorImage",
    required: false,
    example: '"/images/authors/jane.png"',
  },
  { name: "layout", required: false, example: '"sidebar"' },
  { name: "rightSidebar", required: false, example: "true" },
  { name: "showFooter", required: false, example: "true" },
  {
    name: "footer",
    required: false,
    example: '"Built with [Convex](https://convex.dev)."',
  },
  { name: "showSocialFooter", required: false, example: "true" },
  { name: "aiChat", required: false, example: "true" },
  { name: "blogFeatured", required: false, example: "true" },
  { name: "newsletter", required: false, example: "true" },
  { name: "contactForm", required: false, example: "true" },
  { name: "unlisted", required: false, example: "true" },
  { name: "docsSection", required: false, example: "true" },
  { name: "docsSectionOrder", required: false, example: "1" },
  { name: "docsSectionGroup", required: false, example: '"Setup"' },
  { name: "docsSectionGroupOrder", required: false, example: "1" },
  { name: "docsSectionGroupIcon", required: false, example: '"Rocket"' },
  { name: "docsLanding", required: false, example: "true" },
];

// Frontmatter field definitions for pages (matches Write.tsx)
const PAGE_FIELDS = [
  { name: "title", required: true, example: '"Page Title"' },
  { name: "slug", required: true, example: '"page-url"' },
  { name: "published", required: true, example: "true" },
  { name: "order", required: false, example: "1" },
  { name: "showInNav", required: false, example: "true" },
  { name: "excerpt", required: false, example: '"Short description"' },
  { name: "image", required: false, example: '"/images/thumbnail.png"' },
  { name: "showImageAtTop", required: false, example: "true" },
  { name: "featured", required: false, example: "true" },
  { name: "featuredOrder", required: false, example: "1" },
  { name: "authorName", required: false, example: '"Jane Doe"' },
  {
    name: "authorImage",
    required: false,
    example: '"/images/authors/jane.png"',
  },
  { name: "layout", required: false, example: '"sidebar"' },
  { name: "rightSidebar", required: false, example: "true" },
  { name: "showFooter", required: false, example: "true" },
  {
    name: "footer",
    required: false,
    example: '"Built with [Convex](https://convex.dev)."',
  },
  { name: "showSocialFooter", required: false, example: "true" },
  { name: "aiChat", required: false, example: "true" },
  { name: "newsletter", required: false, example: "true" },
  { name: "contactForm", required: false, example: "true" },
  { name: "unlisted", required: false, example: "true" },
  { name: "docsSection", required: false, example: "true" },
  { name: "docsSectionOrder", required: false, example: "1" },
  { name: "docsSectionGroup", required: false, example: '"Setup"' },
  { name: "docsSectionGroupOrder", required: false, example: "1" },
  { name: "docsSectionGroupIcon", required: false, example: '"Rocket"' },
  { name: "docsLanding", required: false, example: "true" },
];

// Generate frontmatter template based on content type
function generateWriteTemplate(type: "post" | "page"): string {
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
showInNav: true
layout: "sidebar"
---

# Page Title

Your page content goes here...

## Section

Add your markdown content.

## Another Section

With sidebar layout enabled, headings automatically appear in the table of contents.
`;
}

// localStorage keys for dashboard write
const DASHBOARD_WRITE_POST_CONTENT = "dashboard_write_post_content";
const DASHBOARD_WRITE_PAGE_CONTENT = "dashboard_write_page_content";
const DASHBOARD_WRITE_FOCUS_MODE = "dashboard_write_focus_mode";
const DASHBOARD_WRITE_FRONTMATTER_COLLAPSED = "dashboard_write_frontmatter_collapsed";

function WriteSection({
  contentType,
  sidebarCollapsed,
  setSidebarCollapsed,
  addToast,
  setActiveSection,
}: {
  contentType: "post" | "page";
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  addToast: (message: string, type?: ToastType) => void;
  setActiveSection: (section: DashboardSection) => void;
}) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<"markdown" | "richtext" | "preview">("markdown");
  const createPostMutation = useMutation(api.cms.createPost);
  const createPageMutation = useMutation(api.cms.createPage);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(() => {
    const saved = localStorage.getItem(DASHBOARD_WRITE_FOCUS_MODE);
    return saved === "true";
  });
  const [frontmatterCollapsed, setFrontmatterCollapsed] = useState(() => {
    const saved = localStorage.getItem(DASHBOARD_WRITE_FRONTMATTER_COLLAPSED);
    // Default to collapsed in focus mode
    return saved === "true";
  });
  // Store previous sidebar state before entering focus mode
  const [prevSidebarState, setPrevSidebarState] = useState<boolean | null>(null);
  // Image upload modal state
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toggle focus mode
  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(DASHBOARD_WRITE_FOCUS_MODE, String(newValue));
      // When entering focus mode, save sidebar state and collapse it
      if (newValue) {
        setPrevSidebarState(sidebarCollapsed);
        setSidebarCollapsed(true);
        setFrontmatterCollapsed(true);
        localStorage.setItem(DASHBOARD_WRITE_FRONTMATTER_COLLAPSED, "true");
      } else {
        // When exiting focus mode, restore previous sidebar state
        if (prevSidebarState !== null) {
          setSidebarCollapsed(prevSidebarState);
        }
      }
      return newValue;
    });
  }, [sidebarCollapsed, setSidebarCollapsed, prevSidebarState]);

  // Toggle frontmatter sidebar
  const toggleFrontmatter = useCallback(() => {
    setFrontmatterCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(DASHBOARD_WRITE_FRONTMATTER_COLLAPSED, String(newValue));
      return newValue;
    });
  }, []);

  // HTML <-> Markdown converters
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
    return service;
  }, []);

  const showdownConverter = useMemo(() => {
    const converter = new Showdown.Converter({
      tables: true,
      strikethrough: true,
      tasklists: true,
    });
    return converter;
  }, []);

  // Convert between modes - extract body content for rich text editing
  const getBodyContent = useCallback((fullContent: string): string => {
    const frontmatterMatch = fullContent.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
    return frontmatterMatch ? frontmatterMatch[1].trim() : fullContent;
  }, []);

  const getFrontmatter = useCallback((fullContent: string): string => {
    const frontmatterMatch = fullContent.match(/^(---\n[\s\S]*?\n---\n?)/);
    return frontmatterMatch ? frontmatterMatch[1] : "";
  }, []);

  // State for rich text HTML content
  const [richTextHtml, setRichTextHtml] = useState("");

  // Handle mode changes with content conversion
  const handleModeChange = useCallback(
    (newMode: "markdown" | "richtext" | "preview") => {
      if (newMode === editorMode) return;

      if (newMode === "richtext" && editorMode === "markdown") {
        // Converting from markdown to rich text
        const bodyContent = getBodyContent(content);
        const html = showdownConverter.makeHtml(bodyContent);
        setRichTextHtml(html);
      } else if (newMode === "markdown" && editorMode === "richtext") {
        // Converting from rich text back to markdown
        const markdown = turndownService.turndown(richTextHtml);
        const frontmatter = getFrontmatter(content);
        setContent(frontmatter + markdown);
      }

      setEditorMode(newMode);
    },
    [editorMode, content, richTextHtml, getBodyContent, getFrontmatter, showdownConverter, turndownService]
  );

  // Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  // Keyboard shortcut: Escape to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusMode, toggleFocusMode]);

  // localStorage key based on content type
  const storageKey =
    contentType === "post"
      ? DASHBOARD_WRITE_POST_CONTENT
      : DASHBOARD_WRITE_PAGE_CONTENT;

  // Load from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey);
    if (savedContent) {
      setContent(savedContent);
    } else {
      setContent(generateWriteTemplate(contentType));
    }
  }, [storageKey, contentType]);

  // Save to localStorage on content change
  useEffect(() => {
    localStorage.setItem(storageKey, content);
  }, [content, storageKey]);

  // Copy content to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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

  // Insert image markdown at cursor position
  const handleInsertImage = useCallback((markdown: string) => {
    if (editorMode === "markdown" && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + markdown + "\n" + content.substring(end);
      setContent(newContent);
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length + 1, start + markdown.length + 1);
      }, 0);
    } else if (editorMode === "richtext") {
      // For rich text mode, convert markdown to HTML and append
      const imgMatch = markdown.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        setRichTextHtml(prev => prev + `<p><img src="${src}" alt="${alt}" /></p>`);
      }
    } else {
      // Preview mode - append to content
      setContent(prev => prev + "\n" + markdown);
    }
  }, [content, editorMode]);

  // Copy a single frontmatter field
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
    setContent(generateWriteTemplate(contentType));
  }, [contentType]);

  // Generate markdown file with frontmatter for download
  const handleDownloadMarkdown = useCallback(() => {
    // Extract frontmatter from content if it exists, otherwise generate basic template
    let markdownContent = content;
    let frontmatter = "";

    // Check if content already has frontmatter
    if (content.startsWith("---\n")) {
      // Content already has frontmatter, use as-is
      markdownContent = content;
    } else {
      // Generate basic frontmatter with required fields
      const today = new Date().toISOString().split("T")[0];
      const defaultSlug =
        contentType === "post" ? "your-post-url" : "your-page-url";

      if (contentType === "post") {
        frontmatter = `---
title: "Your Post Title"
description: "A brief description for SEO and social sharing"
date: "${today}"
slug: "${defaultSlug}"
published: false
tags: ["tag1", "tag2"]
---

`;
      } else {
        frontmatter = `---
title: "Your Page Title"
slug: "${defaultSlug}"
published: false
---

`;
      }
      markdownContent = frontmatter + content;
    }

    // Extract slug from frontmatter or use default
    let slug = contentType === "post" ? "your-post-url" : "your-page-url";
    const slugMatch = markdownContent.match(/slug:\s*["']([^"']+)["']/);
    if (slugMatch) {
      slug = slugMatch[1];
    }

    // Download the markdown file
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, contentType]);

  // Default slug values that should trigger a warning
  const DEFAULT_SLUGS = ["your-post-url", "page-url"];

  // Parse frontmatter and save to database
  const handleSaveToDb = useCallback(async () => {
    setIsSaving(true);
    try {
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!frontmatterMatch) {
        addToast("Content must have valid frontmatter (---)", "error");
        setIsSaving(false);
        return;
      }

      const frontmatterText = frontmatterMatch[1];
      const bodyContent = frontmatterMatch[2].trim();

      // Parse frontmatter fields
      const parseValue = (key: string): string | undefined => {
        const match = frontmatterText.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?`, "m"));
        return match ? match[1].trim() : undefined;
      };

      const parseBool = (key: string): boolean | undefined => {
        const match = frontmatterText.match(new RegExp(`^${key}:\\s*(true|false)`, "m"));
        return match ? match[1] === "true" : undefined;
      };

      const parseNumber = (key: string): number | undefined => {
        const match = frontmatterText.match(new RegExp(`^${key}:\\s*(\\d+)`, "m"));
        return match ? parseInt(match[1], 10) : undefined;
      };

      const parseTags = (): string[] => {
        const match = frontmatterText.match(/^tags:\s*\[(.*?)\]/m);
        if (match) {
          return match[1].split(",").map((t) => t.trim().replace(/["']/g, "")).filter(Boolean);
        }
        return [];
      };

      const title = parseValue("title");
      const slug = parseValue("slug");

      if (!title || !slug) {
        addToast("Frontmatter must include title and slug", "error");
        setIsSaving(false);
        return;
      }

      // Check if slug is still default and warn user
      if (DEFAULT_SLUGS.includes(slug)) {
        addToast(
          `Warning: Your slug is still "${slug}". Please change the slug to a unique URL-friendly value before saving.`,
          "warning"
        );
        setIsSaving(false);
        return;
      }

      // Check if title is still default
      if (title === "Your Post Title" || title === "Page Title") {
        addToast(
          `Warning: Please change the title from "${title}" to something unique before saving.`,
          "warning"
        );
        setIsSaving(false);
        return;
      }

      if (contentType === "post") {
        const description = parseValue("description") || "";
        const date = parseValue("date") || new Date().toISOString().split("T")[0];
        const published = parseBool("published") ?? false;
        const tags = parseTags();
        const readTime = parseValue("readTime");
        const image = parseValue("image");
        const excerpt = parseValue("excerpt");
        const featured = parseBool("featured");
        const featuredOrder = parseNumber("featuredOrder");
        const authorName = parseValue("authorName");
        const authorImage = parseValue("authorImage");

        await createPostMutation({
          post: {
            slug,
            title,
            description,
            content: bodyContent,
            date,
            published,
            tags,
            readTime,
            image,
            excerpt,
            featured,
            featuredOrder,
            authorName,
            authorImage,
          },
        });
        addToast(`Post "${title}" saved to database. Redirecting to Posts...`, "success");
        // Navigate to posts section after successful save
        setTimeout(() => {
          setActiveSection("posts");
        }, 500);
      } else {
        const published = parseBool("published") ?? false;
        const order = parseNumber("order");
        const showInNav = parseBool("showInNav");
        const excerpt = parseValue("excerpt");
        const image = parseValue("image");
        const featured = parseBool("featured");
        const featuredOrder = parseNumber("featuredOrder");
        const authorName = parseValue("authorName");
        const authorImage = parseValue("authorImage");

        await createPageMutation({
          page: {
            slug,
            title,
            content: bodyContent,
            published,
            order,
            showInNav,
            excerpt,
            image,
            featured,
            featuredOrder,
            authorName,
            authorImage,
          },
        });
        addToast(`Page "${title}" saved to database. Redirecting to Pages...`, "success");
        // Navigate to pages section after successful save
        setTimeout(() => {
          setActiveSection("pages");
        }, 500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      addToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  }, [content, contentType, createPostMutation, createPageMutation, addToast, setActiveSection]);

  // Calculate stats
  const lines = content.split("\n").length;
  const characters = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const fields = contentType === "post" ? POST_FIELDS : PAGE_FIELDS;

  return (
    <div
      className={`dashboard-write-section ${focusMode ? "focus-mode" : ""} ${frontmatterCollapsed ? "frontmatter-collapsed" : ""}`}
    >
      {/* Write Actions Header */}
      <div className="dashboard-write-header">
        <div className="dashboard-write-title">
          <span>{contentType === "post" ? "Blog Post" : "Page"}</span>
          <div className="dashboard-editor-mode-toggles">
            <button
              className={`dashboard-view-toggle ${editorMode === "markdown" ? "active" : ""}`}
              onClick={() => handleModeChange("markdown")}
            >
              Markdown
            </button>
            <button
              className={`dashboard-view-toggle ${editorMode === "richtext" ? "active" : ""}`}
              onClick={() => handleModeChange("richtext")}
            >
              Rich Text
            </button>
            <button
              className={`dashboard-view-toggle ${editorMode === "preview" ? "active" : ""}`}
              onClick={() => handleModeChange("preview")}
            >
              Preview
            </button>
          </div>
        </div>
        <div className="dashboard-write-actions">
          <button
            onClick={handleClear}
            className="dashboard-action-btn"
            title="Clear content"
          >
            <Trash size={16} />
            <span>Clear</span>
          </button>
          <button
            onClick={handleCopy}
            className={`dashboard-action-btn primary ${copied ? "copied" : ""}`}
          >
            {copied ? (
              <Check size={16} weight="bold" />
            ) : (
              <CopySimple size={16} />
            )}
            <span>{copied ? "Copied" : "Copy All"}</span>
          </button>
          {siteConfig.media?.enabled && (
            <button
              onClick={() => setShowImageUpload(true)}
              className="dashboard-action-btn"
              title={editorMode === "richtext" ? "Image insertion not available in Rich Text mode" : "Insert Image"}
              disabled={editorMode === "richtext"}
            >
              <Image size={16} />
              <span>Image</span>
            </button>
          )}
          <button
            onClick={handleDownloadMarkdown}
            className="dashboard-action-btn primary"
            title="Download Markdown"
          >
            <Download size={16} />
            <span>Download .md</span>
          </button>
          <button
            onClick={handleSaveToDb}
            disabled={isSaving}
            className="dashboard-action-btn success"
            title="Save to Database"
          >
            {isSaving ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <FloppyDisk size={16} />
            )}
            <span>{isSaving ? "Saving..." : "Save to DB"}</span>
          </button>
          <button
            onClick={toggleFocusMode}
            className={`dashboard-action-btn focus-toggle ${focusMode ? "active" : ""}`}
            title={focusMode ? "Exit focus mode (Esc)" : "Enter focus mode"}
          >
            {focusMode ? (
              <ArrowsIn size={16} weight="regular" />
            ) : (
              <ArrowsOut size={16} weight="regular" />
            )}
          </button>
        </div>
      </div>

      <div className="dashboard-write-container">
        {/* Main Writing Area */}
        <div className="dashboard-write-main">
          {editorMode === "markdown" && (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="dashboard-write-textarea"
              placeholder="Start writing your markdown..."
              spellCheck={true}
            />
          )}

          {editorMode === "richtext" && (
            <div className="dashboard-quill-container">
              <ReactQuill
                theme="snow"
                value={richTextHtml}
                onChange={setRichTextHtml}
                modules={quillModules}
                placeholder="Start writing..."
              />
            </div>
          )}

          {editorMode === "preview" && (
            <div className="dashboard-preview">
              <div className="dashboard-preview-content">
                <div className="blog-post-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, defaultSchema]]}
                  >
                    {getBodyContent(content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-write-footer">
            <div className="dashboard-write-stats">
              <span>{words} words</span>
              <span className="stats-divider" />
              <span>{lines} lines</span>
              <span className="stats-divider" />
              <span>{characters} chars</span>
            </div>
            <div className="dashboard-write-hint">
              {editorMode === "richtext"
                ? "Editing body content only (frontmatter preserved)"
                : <>Save to{" "}<code>content/{contentType === "post" ? "blog" : "pages"}/</code>{" "}then <code>npm run sync</code></>
              }
            </div>
          </div>
        </div>

        {/* Frontmatter Sidebar */}
        <aside
          className={`dashboard-write-sidebar ${frontmatterCollapsed ? "collapsed" : ""}`}
        >
          <div className="dashboard-write-sidebar-header">
            <span>Frontmatter</span>
            <button
              onClick={toggleFrontmatter}
              className="dashboard-write-sidebar-toggle"
              title={frontmatterCollapsed ? "Expand" : "Collapse"}
            >
              <SidebarSimple size={16} weight="regular" />
            </button>
          </div>
          <div className="dashboard-write-fields">
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

      {/* Local storage warning */}
      <div className="dashboard-write-warning">
        <Warning size={14} />
        <span>
          Content saved locally in this browser only. Copy before leaving to
          avoid losing work.
        </span>
      </div>

      {/* Image Upload Modal - only when media is enabled */}
      {siteConfig.media?.enabled && (
        <ImageUploadModal
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onInsert={handleInsertImage}
        />
      )}
    </div>
  );
}

function AIAgentSection() {
  const [activeTab, setActiveTab] = useState<"chat" | "image">("chat");
  const [selectedTextModel, setSelectedTextModel] = useState(
    siteConfig.aiDashboard?.defaultTextModel || "claude-sonnet-4-20250514"
  );
  const [selectedImageModel, setSelectedImageModel] = useState(
    siteConfig.aiDashboard?.imageModels?.[0]?.id || "gemini-2.0-flash-exp-image-generation"
  );
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4">("1:1");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; prompt: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showImageModelDropdown, setShowImageModelDropdown] = useState(false);
  const [showTextModelDropdown, setShowTextModelDropdown] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<"md" | "html" | null>(null);

  const generateImage = useAction(api.aiImageGeneration.generateImage);

  const textModels = siteConfig.aiDashboard?.textModels || [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" as const },
  ];
  const imageModels = siteConfig.aiDashboard?.imageModels || [
    { id: "gemini-2.0-flash-exp-image-generation", name: "Nano Banana", provider: "google" as const },
  ];

  const enableImageGeneration = siteConfig.aiDashboard?.enableImageGeneration ?? true;

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage({
        sessionId: localStorage.getItem("ai_chat_session_id") || crypto.randomUUID(),
        prompt: imagePrompt,
        model: selectedImageModel as "gemini-2.0-flash-exp-image-generation" | "imagen-3.0-generate-002",
        aspectRatio,
      });

      if (result.success && result.url) {
        setGeneratedImage({ url: result.url, prompt: imagePrompt });
        setImagePrompt("");
      } else if (result.error) {
        setImageError(result.error);
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const selectedTextModelName = textModels.find(m => m.id === selectedTextModel)?.name || "Claude Sonnet 4";
  const selectedImageModelName = imageModels.find(m => m.id === selectedImageModel)?.name || "Nano Banana";

  // Generate markdown code for the image
  const getMarkdownCode = (url: string, prompt: string) => `![${prompt}](${url})`;

  // Generate HTML code for the image
  const getHtmlCode = (url: string, prompt: string) => `<img src="${url}" alt="${prompt}" />`;

  // Copy code to clipboard
  const handleCopyCode = async (format: "md" | "html") => {
    if (!generatedImage) return;
    const code = format === "md"
      ? getMarkdownCode(generatedImage.url, generatedImage.prompt)
      : getHtmlCode(generatedImage.url, generatedImage.prompt);
    await navigator.clipboard.writeText(code);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Download image to computer
  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Generate filename from prompt (sanitize and truncate)
      const filename = generatedImage.prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 50)
        .replace(/-+$/, "");
      a.download = `${filename || "generated-image"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="dashboard-ai-section">
      {/* Tabs */}
      <div className="ai-agent-tabs">
        <button
          className={`ai-agent-tab ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <ChatText size={18} weight="bold" />
          <span>Chat</span>
        </button>
        {enableImageGeneration && (
          <button
            className={`ai-agent-tab ${activeTab === "image" ? "active" : ""}`}
            onClick={() => setActiveTab("image")}
          >
            <Image size={18} weight="bold" />
            <span>Image</span>
          </button>
        )}
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="ai-agent-chat-container">
          {/* Model Selector */}
          <div className="ai-model-selector">
            <span className="ai-model-label">Model:</span>
            <div className="ai-model-dropdown-container">
              <button
                className="ai-model-dropdown-trigger"
                onClick={() => setShowTextModelDropdown(!showTextModelDropdown)}
              >
                <span>{selectedTextModelName}</span>
                <CaretDown size={14} weight="bold" />
              </button>
              {showTextModelDropdown && (
                <div className="ai-model-dropdown">
                  {textModels.map((model) => (
                    <button
                      key={model.id}
                      className={`ai-model-option ${selectedTextModel === model.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedTextModel(model.id);
                        setShowTextModelDropdown(false);
                      }}
                    >
                      <span className="ai-model-name">{model.name}</span>
                      <span className="ai-model-provider">{model.provider}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <AIChatView contextId="dashboard-agent" selectedModel={selectedTextModel} />
        </div>
      )}

      {/* Image Generation Tab */}
      {activeTab === "image" && enableImageGeneration && (
        <div className="ai-agent-image-container">
          {/* Image Model Selector */}
          <div className="ai-model-selector">
            <span className="ai-model-label">Model:</span>
            <div className="ai-model-dropdown-container">
              <button
                className="ai-model-dropdown-trigger"
                onClick={() => setShowImageModelDropdown(!showImageModelDropdown)}
              >
                <span>{selectedImageModelName}</span>
                <CaretDown size={14} weight="bold" />
              </button>
              {showImageModelDropdown && (
                <div className="ai-model-dropdown">
                  {imageModels.map((model) => (
                    <button
                      key={model.id}
                      className={`ai-model-option ${selectedImageModel === model.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedImageModel(model.id);
                        setShowImageModelDropdown(false);
                      }}
                    >
                      <span className="ai-model-name">{model.name}</span>
                      <span className="ai-model-provider">{model.provider}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="ai-aspect-ratio-selector">
            <span className="ai-model-label">Aspect:</span>
            <div className="ai-aspect-ratio-options">
              {(["1:1", "16:9", "9:16", "4:3", "3:4"] as const).map((ratio) => (
                <button
                  key={ratio}
                  className={`ai-aspect-ratio-option ${aspectRatio === ratio ? "selected" : ""}`}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="ai-generated-image">
              <img src={generatedImage.url} alt={generatedImage.prompt} />
              <p className="ai-generated-image-prompt">{generatedImage.prompt}</p>

              {/* Image Actions */}
              <div className="ai-image-actions">
                <button
                  className="ai-image-action-btn download"
                  onClick={handleDownloadImage}
                  title="Download image"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  className={`ai-image-action-btn ${copiedFormat === "md" ? "copied" : ""}`}
                  onClick={() => handleCopyCode("md")}
                  title="Copy as Markdown"
                >
                  {copiedFormat === "md" ? <Check size={16} /> : <CopySimple size={16} />}
                  <span>{copiedFormat === "md" ? "Copied" : "MD"}</span>
                </button>
                <button
                  className={`ai-image-action-btn ${copiedFormat === "html" ? "copied" : ""}`}
                  onClick={() => handleCopyCode("html")}
                  title="Copy as HTML"
                >
                  {copiedFormat === "html" ? <Check size={16} /> : <CopySimple size={16} />}
                  <span>{copiedFormat === "html" ? "Copied" : "HTML"}</span>
                </button>
              </div>

              {/* Code Preview */}
              <div className="ai-image-code-preview">
                <div className="ai-image-code-block">
                  <span className="ai-image-code-label">Markdown:</span>
                  <code>{getMarkdownCode(generatedImage.url, generatedImage.prompt)}</code>
                </div>
                <div className="ai-image-code-block">
                  <span className="ai-image-code-label">HTML:</span>
                  <code>{getHtmlCode(generatedImage.url, generatedImage.prompt)}</code>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {imageError && (
            <div className="ai-image-error">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{imageError}</ReactMarkdown>
            </div>
          )}

          {/* Loading State */}
          {isGeneratingImage && (
            <div className="ai-image-loading">
              <SpinnerGap size={32} weight="bold" className="ai-image-spinner" />
              <span>Generating image...</span>
            </div>
          )}

          {/* Prompt Input */}
          <div className="ai-image-input-container">
            <textarea
              className="ai-image-input"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateImage();
                }
              }}
              placeholder="Describe the image you want to generate..."
              rows={3}
              disabled={isGeneratingImage}
            />
            <button
              className="ai-image-generate-button"
              onClick={handleGenerateImage}
              disabled={!imagePrompt.trim() || isGeneratingImage}
            >
              {isGeneratingImage ? (
                <SpinnerGap size={18} weight="bold" className="ai-image-spinner" />
              ) : (
                <Image size={18} weight="bold" />
              )}
              <span>Generate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsletterSubscribersSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "subscribed" | "unsubscribed">(
    "all",
  );
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const subscribersData = useQuery(api.newsletter.getAllSubscribers, {
    limit: 20,
    cursor,
    filter,
    search: search || undefined,
  });
  const stats = useQuery(api.newsletter.getNewsletterStats);
  const deleteSubscriber = useMutation(api.newsletter.deleteSubscriber);

  const handleDelete = useCallback(
    async (subscriberId: Id<"newsletterSubscribers">) => {
      const result = await deleteSubscriber({ subscriberId });
      if (result.success) {
        setDeleteConfirm(null);
      }
    },
    [deleteSubscriber],
  );

  const handleNextPage = useCallback(() => {
    if (subscribersData?.nextCursor) {
      setCursor(subscribersData.nextCursor);
    }
  }, [subscribersData?.nextCursor]);

  const handlePrevPage = useCallback(() => {
    setCursor(undefined);
  }, []);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!siteConfig.newsletter?.enabled) {
    return (
      <div className="dashboard-section-placeholder">
        <Envelope size={48} weight="light" />
        <h2>Newsletter Disabled</h2>
        <p>Enable newsletter in siteConfig.ts to manage subscribers</p>
      </div>
    );
  }

  return (
    <div className="dashboard-newsletter-section full-width">
      <div className="dashboard-newsletter-stats">
        <div className="newsletter-stat-card">
          <span className="stat-value">{stats?.totalSubscribers ?? 0}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="newsletter-stat-card">
          <span className="stat-value">{stats?.activeSubscribers ?? 0}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="newsletter-stat-card">
          <span className="stat-value">{stats?.unsubscribedCount ?? 0}</span>
          <span className="stat-label">Unsubscribed</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="dashboard-newsletter-controls">
        <div className="dashboard-newsletter-search">
          <MagnifyingGlass size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
            }}
            placeholder="Search subscribers..."
            className="dashboard-newsletter-search-input"
          />
        </div>
        <div className="dashboard-newsletter-filter-bar">
          <Funnel size={16} />
          <span className="dashboard-newsletter-filter-label">
            {subscribersData?.totalCount ?? 0} results
          </span>
          <div className="dashboard-newsletter-filter-buttons">
            <button
              onClick={() => {
                setFilter("all");
                setCursor(undefined);
              }}
              className={`dashboard-newsletter-filter-btn ${filter === "all" ? "active" : ""}`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilter("subscribed");
                setCursor(undefined);
              }}
              className={`dashboard-newsletter-filter-btn ${filter === "subscribed" ? "active" : ""}`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setFilter("unsubscribed");
                setCursor(undefined);
              }}
              className={`dashboard-newsletter-filter-btn ${filter === "unsubscribed" ? "active" : ""}`}
            >
              Unsubscribed
            </button>
          </div>
        </div>
      </div>

      {/* Subscriber List */}
      <div className="dashboard-list-table">
        <div className="dashboard-list-table-header">
          <span className="col-email">Email</span>
          <span className="col-status">Status</span>
          <span className="col-source">Source</span>
          <span className="col-date">Subscribed</span>
          <span className="col-actions">Actions</span>
        </div>

        {!subscribersData ? (
          <div className="dashboard-list-empty">Loading subscribers...</div>
        ) : subscribersData.subscribers.length === 0 ? (
          <div className="dashboard-list-empty">
            {search
              ? "No subscribers match your search."
              : "No subscribers yet."}
          </div>
        ) : (
          subscribersData.subscribers.map((sub) => (
            <div
              key={sub._id}
              className={`dashboard-list-row ${!sub.subscribed ? "unsubscribed" : ""}`}
            >
              <div className="col-email">{sub.email}</div>
              <div className="col-status">
                <span
                  className={`status-badge ${!sub.subscribed ? "draft" : "published"}`}
                >
                  {!sub.subscribed ? "Unsubscribed" : "Active"}
                </span>
              </div>
              <div className="col-source">via {sub.source}</div>
              <div className="col-date">{formatDate(sub.subscribedAt)}</div>
              <div className="col-actions">
                {deleteConfirm === sub._id ? (
                  <div className="dashboard-newsletter-delete-confirm">
                    <span>Delete?</span>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      className="dashboard-action-btn delete"
                      title="Confirm delete"
                    >
                      <Check size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="dashboard-action-btn"
                      title="Cancel"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(sub._id)}
                    className="dashboard-action-btn delete"
                    title="Delete subscriber"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {subscribersData && subscribersData.subscribers.length > 0 && (
        <div className="dashboard-newsletter-pagination">
          <button
            onClick={handlePrevPage}
            disabled={!cursor}
            className="dashboard-action-btn"
          >
            <CaretLeft size={16} />
            First
          </button>
          <button
            onClick={handleNextPage}
            disabled={!subscribersData.nextCursor}
            className="dashboard-action-btn"
          >
            Next
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function NewsletterSendSection({
  addToast,
}: {
  addToast: (message: string, type: ToastType) => void;
}) {
  const posts = useQuery(api.newsletter.getPostsForNewsletter);
  const [selectedPost, setSelectedPost] = useState("");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    command?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const scheduleSendPost = useMutation(
    api.newsletter.scheduleSendPostNewsletter,
  );

  const handleSendPostNewsletter = useCallback(async () => {
    if (!selectedPost) return;

    setSendingNewsletter(true);
    setSendResult(null);
    setCopied(false);

    try {
      const result = await scheduleSendPost({
        postSlug: selectedPost,
        siteUrl: window.location.origin,
        siteName: siteConfig.name,
      });

      const command = `npm run newsletter:send ${selectedPost}`;
      setSendResult({
        success: result.success,
        message: result.message,
        command: result.success ? command : undefined,
      });

      if (result.success) {
        addToast("Newsletter is being sent", "success");
      } else {
        addToast(result.message, "error");
      }
    } catch (error) {
      const message = "Failed to send newsletter. Check console for details.";
      setSendResult({
        success: false,
        message,
      });
      addToast(message, "error");
    } finally {
      setSendingNewsletter(false);
    }
  }, [selectedPost, scheduleSendPost, addToast]);

  const handleCopyCommand = useCallback(async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  if (!siteConfig.newsletter?.enabled) {
    return (
      <div className="dashboard-section-placeholder">
        <Envelope size={48} weight="light" />
        <h2>Newsletter Disabled</h2>
        <p>Enable newsletter in siteConfig.ts to send newsletters</p>
      </div>
    );
  }

  return (
    <div className="dashboard-newsletter-section full-width">
      <div className="dashboard-newsletter-send">
        <h3>Send Post as Newsletter</h3>
        <p className="dashboard-newsletter-form-desc">
          Select a blog post to send as a newsletter to all active subscribers.
        </p>

        <div className="dashboard-newsletter-form-group">
          <label className="dashboard-newsletter-label">Select Post</label>
          <select
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            className="dashboard-newsletter-select"
            disabled={sendingNewsletter}
          >
            <option value="">Choose a post...</option>
            {posts?.map((post) => (
              <option key={post.slug} value={post.slug} disabled={post.wasSent}>
                {post.title} ({post.date}){post.wasSent ? " - SENT" : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSendPostNewsletter}
          disabled={!selectedPost || sendingNewsletter}
          className="dashboard-newsletter-send-btn"
        >
          {sendingNewsletter ? (
            "Sending..."
          ) : (
            <>
              <PaperPlaneTilt size={16} />
              Send to Subscribers
            </>
          )}
        </button>

        {sendResult && (
          <div
            className={`dashboard-newsletter-result ${sendResult.success ? "success" : "error"}`}
          >
            <span>{sendResult.message}</span>
            {sendResult.command && (
              <div className="dashboard-newsletter-command-row">
                <code className="dashboard-newsletter-command">
                  {sendResult.command}
                </code>
                <button
                  onClick={() => handleCopyCommand(sendResult.command!)}
                  className="dashboard-action-btn"
                  title={copied ? "Copied!" : "Copy command"}
                >
                  {copied ? (
                    <Check size={14} weight="bold" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewsletterWriteEmailSection({
  addToast,
}: {
  addToast: (message: string, type: ToastType) => void;
}) {
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const scheduleSendCustom = useMutation(
    api.newsletter.scheduleSendCustomNewsletter,
  );

  const handleSendCustomNewsletter = useCallback(async () => {
    if (!customSubject.trim() || !customContent.trim()) {
      addToast("Subject and content are required", "error");
      return;
    }

    setSendingNewsletter(true);
    setSendResult(null);

    try {
      const result = await scheduleSendCustom({
        subject: customSubject,
        content: customContent,
        siteUrl: window.location.origin,
        siteName: siteConfig.name,
      });

      setSendResult({
        success: result.success,
        message: result.message,
      });

      if (result.success) {
        addToast("Newsletter is being sent", "success");
        // Clear form on success
        setCustomSubject("");
        setCustomContent("");
      } else {
        addToast(result.message, "error");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send newsletter";
      setSendResult({
        success: false,
        message: errorMessage,
      });
      addToast(errorMessage, "error");
    } finally {
      setSendingNewsletter(false);
    }
  }, [customSubject, customContent, scheduleSendCustom, addToast]);

  if (!siteConfig.newsletter?.enabled) {
    return (
      <div className="dashboard-section-placeholder">
        <Envelope size={48} weight="light" />
        <h2>Newsletter Disabled</h2>
        <p>Enable newsletter in siteConfig.ts to send newsletters</p>
      </div>
    );
  }

  return (
    <div className="dashboard-newsletter-section full-width">
      <div className="dashboard-newsletter-write">
        <h3>Write Custom Email</h3>
        <p className="dashboard-newsletter-form-desc">
          Write a custom email to send to all active subscribers. Supports
          markdown formatting.
        </p>

        <div className="dashboard-newsletter-form-group">
          <label className="dashboard-newsletter-label">Subject</label>
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Email subject line..."
            className="dashboard-newsletter-input"
            disabled={sendingNewsletter}
          />
        </div>

        <div className="dashboard-newsletter-form-group">
          <label className="dashboard-newsletter-label">
            Content (Markdown)
          </label>
          <textarea
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder={`Write your email content here...

Supports markdown:
# Heading
**bold** and *italic*
[link text](url)
- list items`}
            className="dashboard-newsletter-textarea"
            rows={12}
            disabled={sendingNewsletter}
          />
        </div>

        <button
          onClick={handleSendCustomNewsletter}
          disabled={
            !customSubject.trim() || !customContent.trim() || sendingNewsletter
          }
          className="dashboard-newsletter-send-btn"
        >
          {sendingNewsletter ? (
            "Sending..."
          ) : (
            <>
              <PaperPlaneTilt size={16} />
              Send to Subscribers
            </>
          )}
        </button>

        {sendResult && (
          <div
            className={`dashboard-newsletter-result ${sendResult.success ? "success" : "error"}`}
          >
            <span>{sendResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsletterRecentSendsSection() {
  const stats = useQuery(api.newsletter.getNewsletterStats);

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!siteConfig.newsletter?.enabled) {
    return (
      <div className="dashboard-section-placeholder">
        <ClockCounterClockwise size={48} weight="light" />
        <h2>Newsletter Disabled</h2>
        <p>Enable newsletter in siteConfig.ts to view recent sends</p>
      </div>
    );
  }

  return (
    <div className="dashboard-newsletter-section full-width">
      {!stats ? (
        <div className="dashboard-list-empty">Loading recent sends...</div>
      ) : stats.recentNewsletters.length === 0 ? (
        <div className="dashboard-list-empty">No newsletters sent yet.</div>
      ) : (
        <div className="dashboard-newsletter-recent-list">
          {stats.recentNewsletters.map((newsletter, index) => (
            <div
              key={`${newsletter.postSlug}-${index}`}
              className="dashboard-newsletter-recent-item"
            >
              <div className="dashboard-newsletter-recent-info">
                <span className="dashboard-newsletter-recent-slug">
                  {newsletter.type === "custom"
                    ? newsletter.subject || "Custom Email"
                    : newsletter.postSlug}
                </span>
                <span className="dashboard-newsletter-recent-meta">
                  {newsletter.type === "custom" ? (
                    <span className="dashboard-newsletter-badge-type custom">
                      Custom
                    </span>
                  ) : (
                    <span className="dashboard-newsletter-badge-type post">
                      Post
                    </span>
                  )}
                  Sent to {newsletter.sentCount} subscriber
                  {newsletter.sentCount !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="dashboard-newsletter-recent-date">
                {formatDateTime(newsletter.sentAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsletterStatsSection() {
  const stats = useQuery(api.newsletter.getNewsletterStats);

  if (!siteConfig.newsletter?.enabled) {
    return (
      <div className="dashboard-section-placeholder">
        <ChartLine size={48} weight="light" />
        <h2>Newsletter Disabled</h2>
        <p>Enable newsletter in siteConfig.ts to view stats</p>
      </div>
    );
  }

  return (
    <div className="dashboard-newsletter-section full-width">
      {!stats ? (
        <div className="dashboard-list-empty">Loading stats...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="dashboard-newsletter-stats-cards">
            <div className="dashboard-newsletter-stat-card">
              <div className="dashboard-newsletter-stat-card-icon">
                <PaperPlaneTilt size={24} />
              </div>
              <div className="dashboard-newsletter-stat-card-content">
                <span className="dashboard-newsletter-stat-card-value">
                  {stats.totalEmailsSent}
                </span>
                <span className="dashboard-newsletter-stat-card-label">
                  Total Emails Sent
                </span>
              </div>
            </div>
            <div className="dashboard-newsletter-stat-card">
              <div className="dashboard-newsletter-stat-card-icon">
                <Envelope size={24} />
              </div>
              <div className="dashboard-newsletter-stat-card-content">
                <span className="dashboard-newsletter-stat-card-value">
                  {stats.totalNewslettersSent}
                </span>
                <span className="dashboard-newsletter-stat-card-label">
                  Newsletters Sent
                </span>
              </div>
            </div>
            <div className="dashboard-newsletter-stat-card">
              <div className="dashboard-newsletter-stat-card-icon">
                <Users size={24} />
              </div>
              <div className="dashboard-newsletter-stat-card-content">
                <span className="dashboard-newsletter-stat-card-value">
                  {stats.activeSubscribers}
                </span>
                <span className="dashboard-newsletter-stat-card-label">
                  Active Subscribers
                </span>
              </div>
            </div>
            <div className="dashboard-newsletter-stat-card">
              <div className="dashboard-newsletter-stat-card-icon">
                <TrendUp size={24} />
              </div>
              <div className="dashboard-newsletter-stat-card-content">
                <span className="dashboard-newsletter-stat-card-value">
                  {stats.totalSubscribers > 0
                    ? Math.round(
                        (stats.activeSubscribers / stats.totalSubscribers) *
                          100,
                      )
                    : 0}
                  %
                </span>
                <span className="dashboard-newsletter-stat-card-label">
                  Retention Rate
                </span>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="dashboard-newsletter-stats-summary">
            <h3>Summary</h3>
            <div className="dashboard-newsletter-stats-row">
              <span>Total Subscribers</span>
              <span>{stats.totalSubscribers}</span>
            </div>
            <div className="dashboard-newsletter-stats-row">
              <span>Active Subscribers</span>
              <span>{stats.activeSubscribers}</span>
            </div>
            <div className="dashboard-newsletter-stats-row">
              <span>Unsubscribed</span>
              <span>{stats.unsubscribedCount}</span>
            </div>
            <div className="dashboard-newsletter-stats-row">
              <span>Newsletters Sent</span>
              <span>{stats.totalNewslettersSent}</span>
            </div>
            <div className="dashboard-newsletter-stats-row">
              <span>Total Emails Sent</span>
              <span>{stats.totalEmailsSent}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ImportURLSection({
  addToast,
}: {
  addToast: (message: string, type?: ToastType) => void;
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [lastImported, setLastImported] = useState<{
    title: string;
    slug: string;
  } | null>(null);
  const importAction = useAction(api.importAction.importFromUrl);

  const handleImport = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setLastImported(null);

    try {
      const result = await importAction({
        url: url.trim(),
        published: publishImmediately,
      });

      if (result.success && result.slug && result.title) {
        setLastImported({ title: result.title, slug: result.slug });
        addToast(`Imported "${result.title}" successfully`, "success");
        setUrl("");
      } else {
        addToast(result.error || "Failed to import URL", "error");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import URL";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-import-section">
      <div className="dashboard-import-header">
        <CloudArrowDown size={32} weight="light" />
        <h2>Import from URL</h2>
        <p>Import articles directly to the database using Firecrawl</p>
      </div>

      <div className="dashboard-import-form">
        <div className="dashboard-import-input-group">
          <LinkIcon size={18} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="dashboard-import-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim() && !isLoading) {
                handleImport();
              }
            }}
          />
        </div>
        <label className="dashboard-import-checkbox">
          <input
            type="checkbox"
            checked={publishImmediately}
            onChange={(e) => setPublishImmediately(e.target.checked)}
          />
          <span>Publish immediately</span>
        </label>
        <button
          className="dashboard-import-btn"
          onClick={handleImport}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <SpinnerGap size={16} className="animate-spin" />
              <span>Importing...</span>
            </>
          ) : (
            <>
              <CloudArrowDown size={16} />
              <span>Import to Database</span>
            </>
          )}
        </button>
      </div>

      {lastImported && (
        <div className="dashboard-import-success">
          <CheckCircle size={20} weight="fill" />
          <div>
            <strong>Successfully imported:</strong> {lastImported.title}
            <br />
            <Link to={`/${lastImported.slug}`} className="import-view-link">
              View post →
            </Link>
          </div>
        </div>
      )}

      <div className="dashboard-import-info">
        <h3>How it works</h3>
        <ol>
          <li>Enter the URL of an article you want to import</li>
          <li>Firecrawl scrapes and converts it to markdown</li>
          <li>Post is saved directly to the database</li>
          <li>Edit and publish from the Posts section</li>
        </ol>
        <p className="note">
          Requires FIRECRAWL_API_KEY in Convex environment variables
        </p>
      </div>
    </div>
  );
}

// Helper functions for HTML/JSON escaping
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJson(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function IndexHtmlSection({
  addToast,
}: {
  addToast: (message: string, type: ToastType) => void;
}) {
  // Pre-populate from siteConfig (since index.html should match)
  const [htmlConfig, setHtmlConfig] = useState({
    siteName: siteConfig.name,
    siteTitle: siteConfig.title,
    siteDescription: siteConfig.bio || "",
    siteUrl: import.meta.env.VITE_SITE_URL || "https://example.com",
    siteDomain: import.meta.env.VITE_SITE_URL
      ? new URL(import.meta.env.VITE_SITE_URL).hostname
      : "example.com",
    ogImage: "/images/og-default.png",
    favicon: "/favicon.svg",
    themeColor: "#faf8f5",
    keywords:
      "markdown site, Convex, Netlify, React, TypeScript, open source, real-time, sync",
    author: siteConfig.name,
  });

  const [copied, setCopied] = useState(false);

  const handleChange = (key: string, value: string) => {
    setHtmlConfig({ ...htmlConfig, [key]: value });
    // Auto-update domain when URL changes
    if (key === "siteUrl" && value) {
      try {
        const url = new URL(value);
        setHtmlConfig((prev) => ({ ...prev, siteDomain: url.hostname }));
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  const generateIndexHtml = () => {
    const ogImageUrl = htmlConfig.ogImage.startsWith("http")
      ? htmlConfig.ogImage
      : `${htmlConfig.siteUrl}${htmlConfig.ogImage}`;

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${htmlConfig.favicon}" />

    <!-- Preconnect for faster API calls -->
    <link rel="preconnect" href="https://convex.cloud" crossorigin />
    <link rel="dns-prefetch" href="https://convex.cloud" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags -->
    <meta
      name="description"
      content="${escapeHtml(htmlConfig.siteDescription)}"
    />
    <meta name="author" content="${escapeHtml(htmlConfig.author)}" />
    <meta
      name="keywords"
      content="${escapeHtml(htmlConfig.keywords)}"
    />
    <meta name="robots" content="index, follow" />

    <!-- Theme -->
    <meta name="theme-color" content="${htmlConfig.themeColor}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(htmlConfig.siteTitle)}" />
    <meta
      property="og:description"
      content="${escapeHtml(htmlConfig.siteDescription)}"
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${htmlConfig.siteUrl}/" />
    <meta
      property="og:site_name"
      content="${escapeHtml(htmlConfig.siteName)}"
    />
    <meta
      property="og:image"
      content="${ogImageUrl}"
    />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:domain" content="${htmlConfig.siteDomain}" />
    <meta property="twitter:url" content="${htmlConfig.siteUrl}/" />
    <meta name="twitter:title" content="${escapeHtml(htmlConfig.siteTitle)}" />
    <meta
      name="twitter:description"
      content="${escapeHtml(htmlConfig.siteDescription)}"
    />
    <meta
      name="twitter:image"
      content="${ogImageUrl}"
    />

    <!-- RSS Feeds -->
    <link
      rel="alternate"
      type="application/rss+xml"
      title="RSS Feed"
      href="/rss.xml"
    />
    <link
      rel="alternate"
      type="application/rss+xml"
      title="RSS Feed (Full Content)"
      href="/rss-full.xml"
    />

    <!-- LLM and AI Discovery -->
    <link rel="author" href="/llms.txt" />

    <!-- JSON-LD Structured Data for Homepage -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "${escapeJson(htmlConfig.siteName)}",
        "url": "${htmlConfig.siteUrl}",
        "description": "${escapeJson(htmlConfig.siteDescription)}",
        "author": {
          "@type": "Organization",
          "name": "${escapeJson(htmlConfig.siteName)}",
          "url": "${htmlConfig.siteUrl}"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "${htmlConfig.siteUrl}/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    </script>

    <title>${escapeHtml(htmlConfig.siteTitle)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateIndexHtml());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast("index.html copied to clipboard", "success");
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = generateIndexHtml();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast("index.html copied to clipboard", "success");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generateIndexHtml()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Downloaded index.html", "success");
  };

  return (
    <div className="dashboard-config-section">
      <div className="dashboard-config-header">
        <div>
          <h2>Index HTML Generator</h2>
          <p>
            Generate index.html with SEO metadata, Open Graph, and Twitter Card
            tags
          </p>
        </div>
        <div className="dashboard-config-actions">
          <button className="dashboard-action-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied" : "Copy HTML"}</span>
          </button>
          <button
            className="dashboard-action-btn primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="dashboard-config-grid">
        {/* Basic Metadata */}
        <div className="dashboard-config-card">
          <h3>Basic Metadata</h3>
          <div className="config-field">
            <label>Site Name</label>
            <input
              type="text"
              value={htmlConfig.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
              placeholder="Your Site Name"
            />
            <span className="config-field-note">
              Used in Open Graph site_name and JSON-LD
            </span>
          </div>
          <div className="config-field">
            <label>Site Title</label>
            <input
              type="text"
              value={htmlConfig.siteTitle}
              onChange={(e) => handleChange("siteTitle", e.target.value)}
              placeholder="Your Site Title"
            />
            <span className="config-field-note">
              Used in &lt;title&gt; tag and Open Graph title
            </span>
          </div>
          <div className="config-field">
            <label>Site Description</label>
            <textarea
              value={htmlConfig.siteDescription}
              onChange={(e) => handleChange("siteDescription", e.target.value)}
              rows={3}
              placeholder="A brief description of your site"
            />
            <span className="config-field-note">
              Used in meta description, Open Graph, Twitter Card, and JSON-LD
            </span>
          </div>
          <div className="config-field">
            <label>Author</label>
            <input
              type="text"
              value={htmlConfig.author}
              onChange={(e) => handleChange("author", e.target.value)}
              placeholder="Author or Organization Name"
            />
          </div>
          <div className="config-field">
            <label>Keywords</label>
            <input
              type="text"
              value={htmlConfig.keywords}
              onChange={(e) => handleChange("keywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <span className="config-field-note">
              Comma-separated keywords for SEO
            </span>
          </div>
        </div>

        {/* URLs and Images */}
        <div className="dashboard-config-card">
          <h3>URLs and Images</h3>
          <div className="config-field">
            <label>Site URL</label>
            <input
              type="url"
              value={htmlConfig.siteUrl}
              onChange={(e) => handleChange("siteUrl", e.target.value)}
              placeholder="https://example.com"
            />
            <span className="config-field-note">
              Full URL including protocol (https://)
            </span>
          </div>
          <div className="config-field">
            <label>Site Domain</label>
            <input
              type="text"
              value={htmlConfig.siteDomain}
              onChange={(e) => handleChange("siteDomain", e.target.value)}
              placeholder="example.com"
            />
            <span className="config-field-note">
              Auto-updated from Site URL, or set manually
            </span>
          </div>
          <div className="config-field">
            <label>Open Graph Image</label>
            <input
              type="text"
              value={htmlConfig.ogImage}
              onChange={(e) => handleChange("ogImage", e.target.value)}
              placeholder="/images/og-default.png"
            />
            <span className="config-field-note">
              Path to OG image (e.g., /images/og-default.png) or full URL
            </span>
          </div>
          <div className="config-field">
            <label>Favicon</label>
            <input
              type="text"
              value={htmlConfig.favicon}
              onChange={(e) => handleChange("favicon", e.target.value)}
              placeholder="/favicon.svg"
            />
            <span className="config-field-note">
              Path to favicon (e.g., /favicon.svg)
            </span>
          </div>
          <div className="config-field">
            <label>Theme Color</label>
            <input
              type="color"
              value={htmlConfig.themeColor}
              onChange={(e) => handleChange("themeColor", e.target.value)}
            />
            <span className="config-field-note">
              Mobile browser chrome color (theme-color meta tag)
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-config-preview">
        <h3>Preview</h3>
        <div className="dashboard-config-preview-content">
          <pre className="dashboard-code-preview">
            <code>{generateIndexHtml()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

/**
 * ConfigSection - Dashboard UI for generating siteConfig.ts
 *
 * IMPORTANT: Keep this section in sync with src/config/siteConfig.ts
 * When adding/modifying config options in siteConfig.ts, update:
 * 1. Initial state (useState) with the new option
 * 2. generateConfigCode() to include the option in output
 * 3. UI section with appropriate input controls
 *
 * See CLAUDE.md "Configuration alignment" section for details.
 */
function ConfigSection({
  addToast,
  onNavigateToIndexHtml,
}: {
  addToast: (message: string, type: ToastType) => void;
  onNavigateToIndexHtml?: () => void;
}) {
  const [config, setConfig] = useState({
    name: siteConfig.name,
    title: siteConfig.title,
    logo: siteConfig.logo || "",
    bio: siteConfig.bio,
    fontFamily: siteConfig.fontFamily,
    featuredViewMode: siteConfig.featuredViewMode,
    featuredTitle: siteConfig.featuredTitle,
    showViewToggle: siteConfig.showViewToggle,
    // Blog page
    blogPageEnabled: siteConfig.blogPage.enabled,
    blogPageShowInNav: siteConfig.blogPage.showInNav,
    blogPageTitle: siteConfig.blogPage.title,
    blogPageDescription: siteConfig.blogPage.description || "",
    blogPageViewMode: siteConfig.blogPage.viewMode,
    blogPageOrder: siteConfig.blogPage.order,
    // Posts display
    showPostsOnHome: siteConfig.postsDisplay.showOnHome,
    showPostsOnBlogPage: siteConfig.postsDisplay.showOnBlogPage,
    homePostsLimit: siteConfig.postsDisplay.homePostsLimit || 0,
    homePostsReadMoreEnabled:
      siteConfig.postsDisplay.homePostsReadMore?.enabled || false,
    homePostsReadMoreText:
      siteConfig.postsDisplay.homePostsReadMore?.text || "",
    homePostsReadMoreLink:
      siteConfig.postsDisplay.homePostsReadMore?.link || "",
    // Right sidebar
    rightSidebarEnabled: siteConfig.rightSidebar.enabled,
    rightSidebarMinWidth: siteConfig.rightSidebar.minWidth || 1135,
    // Footer
    footerEnabled: siteConfig.footer.enabled,
    footerShowOnHomepage: siteConfig.footer.showOnHomepage,
    footerShowOnPosts: siteConfig.footer.showOnPosts,
    footerShowOnPages: siteConfig.footer.showOnPages,
    footerShowOnBlogPage: siteConfig.footer.showOnBlogPage,
    footerDefaultContent: siteConfig.footer.defaultContent || "",
    // AI Chat
    aiChatEnabledOnWritePage: siteConfig.aiChat.enabledOnWritePage,
    aiChatEnabledOnContent: siteConfig.aiChat.enabledOnContent,
    // Newsletter
    newsletterEnabled: siteConfig.newsletter?.enabled || false,
    newsletterHomeEnabled:
      siteConfig.newsletter?.signup?.home?.enabled || false,
    newsletterBlogPageEnabled:
      siteConfig.newsletter?.signup?.blogPage?.enabled || false,
    newsletterPostsEnabled:
      siteConfig.newsletter?.signup?.posts?.enabled || false,
    // Stats page
    statsPageEnabled: siteConfig.statsPage?.enabled || false,
    statsPageShowInNav: siteConfig.statsPage?.showInNav || false,
    // GitHub
    githubOwner: siteConfig.gitHubRepo.owner,
    githubRepo: siteConfig.gitHubRepo.repo,
    githubBranch: siteConfig.gitHubRepo.branch,
    githubContentPath: siteConfig.gitHubRepo.contentPath,
    // Inner page logo
    innerPageLogoEnabled: siteConfig.innerPageLogo.enabled,
    innerPageLogoSize: siteConfig.innerPageLogo.size,
    // GitHub contributions
    githubContributionsEnabled: siteConfig.gitHubContributions.enabled,
    githubContributionsUsername: siteConfig.gitHubContributions.username,
    githubContributionsShowYearNav:
      siteConfig.gitHubContributions.showYearNavigation,
    githubContributionsLinkToProfile:
      siteConfig.gitHubContributions.linkToProfile,
    // Visitor map
    visitorMapEnabled: siteConfig.visitorMap.enabled,
    visitorMapTitle: siteConfig.visitorMap.title,
    // Homepage
    homepageType: siteConfig.homepage.type,
    homepageSlug: siteConfig.homepage.slug || "",
    homepageOriginalRoute: siteConfig.homepage.originalHomeRoute || "",
    // Contact form
    contactFormEnabled: siteConfig.contactForm?.enabled || false,
    contactFormTitle: siteConfig.contactForm?.title || "",
    contactFormDescription: siteConfig.contactForm?.description || "",
    // Social footer
    socialFooterEnabled: siteConfig.socialFooter?.enabled || false,
    socialFooterShowInHeader: siteConfig.socialFooter?.showInHeader || false,
    socialFooterShowOnHomepage:
      siteConfig.socialFooter?.showOnHomepage || false,
    socialFooterShowOnPosts: siteConfig.socialFooter?.showOnPosts || false,
    socialFooterShowOnPages: siteConfig.socialFooter?.showOnPages || false,
    socialFooterShowOnBlogPage:
      siteConfig.socialFooter?.showOnBlogPage || false,
    socialFooterCopyrightSiteName:
      siteConfig.socialFooter?.copyright?.siteName || "",
    socialFooterCopyrightShowYear:
      siteConfig.socialFooter?.copyright?.showYear || false,
    // Logo gallery
    logoGalleryEnabled: siteConfig.logoGallery?.enabled || false,
    logoGalleryPosition: siteConfig.logoGallery?.position || "above-footer",
    logoGallerySpeed: siteConfig.logoGallery?.speed || 30,
    logoGalleryTitle: siteConfig.logoGallery?.title || "",
    logoGalleryScrolling: siteConfig.logoGallery?.scrolling || false,
    logoGalleryMaxItems: siteConfig.logoGallery?.maxItems || 4,
    // Links
    linksConvex: siteConfig.links?.convex || "",
    linksNetlify: siteConfig.links?.netlify || "",
    linksDocs: siteConfig.links?.docs || "",
    // MCP Server
    mcpServerEnabled: siteConfig.mcpServer?.enabled || false,
    mcpServerEndpoint: siteConfig.mcpServer?.endpoint || "/mcp",
    mcpServerRequireAuth: siteConfig.mcpServer?.requireAuth || false,
    // Image lightbox
    imageLightboxEnabled: siteConfig.imageLightbox?.enabled !== false,
    // Semantic search
    semanticSearchEnabled: siteConfig.semanticSearch?.enabled || false,
    // Ask AI
    askAIEnabled: siteConfig.askAI?.enabled || false,
    // Media library
    mediaEnabled: siteConfig.media?.enabled || false,
    mediaMaxFileSize: siteConfig.media?.maxFileSize || 10,
    // Related posts
    relatedPostsDefaultViewMode: siteConfig.relatedPosts?.defaultViewMode || "thumbnails",
    relatedPostsShowViewToggle: siteConfig.relatedPosts?.showViewToggle !== false,
  });

  const [copied, setCopied] = useState(false);

  const handleChange = (key: string, value: string | number | boolean) => {
    setConfig({ ...config, [key]: value });
  };

  const generateConfigCode = () => {
    return `// Generated by Dashboard Config Generator
// Copy this file to src/config/siteConfig.ts
// For full type definitions, see the original siteConfig.ts file
// Homepage content comes from content/pages/home.md (not siteConfig bio)

import { ReactNode } from "react";
export type { LogoItem, LogoGalleryConfig } from "../components/LogoMarquee";
import type { LogoGalleryConfig } from "../components/LogoMarquee";

// ... (type definitions remain the same - copy from original siteConfig.ts)

export const siteConfig: SiteConfig = {
  name: "${config.name}",
  title: "${config.title}",
  logo: ${config.logo ? `"${config.logo}"` : "null"},
  intro: null,
  bio: \`${config.bio}\`,
  fontFamily: "${config.fontFamily}",
  featuredViewMode: "${config.featuredViewMode}",
  featuredTitle: "${config.featuredTitle}",
  showViewToggle: ${config.showViewToggle},
  
  // Logo gallery - customize images array as needed
  logoGallery: {
    enabled: ${config.logoGalleryEnabled},
    images: [], // Add your logo images here - see original siteConfig.ts for format
    position: "${config.logoGalleryPosition}",
    speed: ${config.logoGallerySpeed},
    title: "${config.logoGalleryTitle}",
    scrolling: ${config.logoGalleryScrolling},
    maxItems: ${config.logoGalleryMaxItems},
  },
  
  gitHubContributions: {
    enabled: ${config.githubContributionsEnabled},
    username: "${config.githubContributionsUsername}",
    showYearNavigation: ${config.githubContributionsShowYearNav},
    linkToProfile: ${config.githubContributionsLinkToProfile},
    title: "GitHub Activity",
  },
  
  visitorMap: {
    enabled: ${config.visitorMapEnabled},
    title: "${config.visitorMapTitle}",
  },
  
  innerPageLogo: {
    enabled: ${config.innerPageLogoEnabled},
    size: ${config.innerPageLogoSize},
  },
  
  blogPage: {
    enabled: ${config.blogPageEnabled},
    showInNav: ${config.blogPageShowInNav},
    title: "${config.blogPageTitle}",
    description: "${config.blogPageDescription}",
    order: ${config.blogPageOrder},
    viewMode: "${config.blogPageViewMode}",
    showViewToggle: true,
  },
  
  hardcodedNavItems: [
    { slug: "stats", title: "Stats", order: 10, showInNav: ${config.statsPageShowInNav} },
    { slug: "write", title: "Write", order: 20, showInNav: true },
  ],
  
  postsDisplay: {
    showOnHome: ${config.showPostsOnHome},
    showOnBlogPage: ${config.showPostsOnBlogPage},
    homePostsLimit: ${config.homePostsLimit || "undefined"},
    homePostsReadMore: {
      enabled: ${config.homePostsReadMoreEnabled},
      text: "${config.homePostsReadMoreText}",
      link: "${config.homePostsReadMoreLink}",
    },
  },
  
  links: {
    docs: "${config.linksDocs}",
    convex: "${config.linksConvex}",
    netlify: "${config.linksNetlify}",
  },
  
  gitHubRepo: {
    owner: "${config.githubOwner}",
    repo: "${config.githubRepo}",
    branch: "${config.githubBranch}",
    contentPath: "${config.githubContentPath}",
  },
  
  rightSidebar: {
    enabled: ${config.rightSidebarEnabled},
    minWidth: ${config.rightSidebarMinWidth},
  },
  
  footer: {
    enabled: ${config.footerEnabled},
    showOnHomepage: ${config.footerShowOnHomepage},
    showOnPosts: ${config.footerShowOnPosts},
    showOnPages: ${config.footerShowOnPages},
    showOnBlogPage: ${config.footerShowOnBlogPage},
    defaultContent: \`${config.footerDefaultContent}\`,
  },
  
  homepage: {
    type: "${config.homepageType}",
    slug: ${config.homepageSlug ? `"${config.homepageSlug}"` : "undefined"},
    originalHomeRoute: "${config.homepageOriginalRoute}",
  },
  
  aiChat: {
    enabledOnWritePage: ${config.aiChatEnabledOnWritePage},
    enabledOnContent: ${config.aiChatEnabledOnContent},
  },
  
  newsletter: {
    enabled: ${config.newsletterEnabled},
    signup: {
      home: { enabled: ${config.newsletterHomeEnabled}, position: "above-footer", title: "Stay Updated", description: "Get new posts delivered to your inbox." },
      blogPage: { enabled: ${config.newsletterBlogPageEnabled}, position: "above-footer", title: "Subscribe", description: "Get notified when new posts are published." },
      posts: { enabled: ${config.newsletterPostsEnabled}, position: "below-content", title: "Enjoyed this post?", description: "Subscribe for more updates." },
    },
  },
  
  contactForm: {
    enabled: ${config.contactFormEnabled},
    title: "${config.contactFormTitle}",
    description: "${config.contactFormDescription}",
  },
  
  socialFooter: {
    enabled: ${config.socialFooterEnabled},
    showInHeader: ${config.socialFooterShowInHeader},
    showOnHomepage: ${config.socialFooterShowOnHomepage},
    showOnPosts: ${config.socialFooterShowOnPosts},
    showOnPages: ${config.socialFooterShowOnPages},
    showOnBlogPage: ${config.socialFooterShowOnBlogPage},
    socialLinks: [], // Add your social links here - see original siteConfig.ts for format
    copyright: { siteName: "${config.socialFooterCopyrightSiteName}", showYear: ${config.socialFooterCopyrightShowYear} },
  },
  
  newsletterAdmin: { enabled: false, showInNav: false },
  
  statsPage: {
    enabled: ${config.statsPageEnabled},
    showInNav: ${config.statsPageShowInNav},
  },
  
  newsletterNotifications: { enabled: true, newSubscriberAlert: true, weeklyStatsSummary: true },
  weeklyDigest: { enabled: true, dayOfWeek: 0, subject: "Weekly Digest" },
  mcpServer: { enabled: ${config.mcpServerEnabled}, endpoint: "${config.mcpServerEndpoint}", publicRateLimit: 50, authenticatedRateLimit: 1000, requireAuth: ${config.mcpServerRequireAuth} },
  
  // Image lightbox configuration
  // Enables click-to-magnify functionality for images in blog posts and pages
  imageLightbox: {
    enabled: ${config.imageLightboxEnabled},
  },

  // Semantic search configuration
  // Set enabled: true to enable AI-powered semantic search (requires OPENAI_API_KEY in Convex)
  semanticSearch: {
    enabled: ${config.semanticSearchEnabled},
  },

  // Ask AI header button (requires semanticSearch.enabled and API keys)
  askAI: {
    enabled: ${config.askAIEnabled},
  },

  // Media library configuration
  // Upload and manage images via ConvexFS and Bunny.net CDN
  // Requires BUNNY_API_KEY, BUNNY_STORAGE_ZONE, BUNNY_CDN_HOSTNAME in Convex dashboard
  media: {
    enabled: ${config.mediaEnabled},
    maxFileSize: ${config.mediaMaxFileSize},
    allowedTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  },

  // Related posts configuration
  // Controls the display of related posts at the bottom of blog posts
  relatedPosts: {
    defaultViewMode: "${config.relatedPostsDefaultViewMode}",
    showViewToggle: ${config.relatedPostsShowViewToggle},
  },
};

export default siteConfig;
`;
  };

  const handleCopyConfig = async () => {
    await navigator.clipboard.writeText(generateConfigCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Config code copied to clipboard", "success");
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([generateConfigCode()], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteConfig.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Downloaded siteConfig.ts", "success");
  };

  return (
    <div className="dashboard-config-section">
      <div className="dashboard-config-header">
        <div>
          <h2>Site Configuration Generator</h2>
          <p>Customize your site settings and generate siteConfig.ts</p>
        </div>
        <div className="dashboard-config-actions">
          <button className="dashboard-action-btn" onClick={handleCopyConfig}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
          <button
            className="dashboard-action-btn primary"
            onClick={handleDownloadConfig}
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="dashboard-config-reminder">
        <Info size={16} />
        <span>
          Don't forget to update <strong>index.html</strong> with matching
          metadata!
          <button
            className="dashboard-link-button"
            onClick={onNavigateToIndexHtml}
          >
            Go to Index HTML Generator →
          </button>
        </span>
      </div>

      <div className="dashboard-config-grid">
        {/* Basic Settings */}
        <div className="dashboard-config-card">
          <h3>Basic Settings</h3>
          <div className="config-field">
            <label>Site Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Site Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Logo Path</label>
            <input
              type="text"
              value={config.logo}
              onChange={(e) => handleChange("logo", e.target.value)}
              placeholder="/images/logo.svg"
            />
          </div>
          <div className="config-field">
            <label>Bio</label>
            <textarea
              value={config.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={2}
            />
            <span className="config-field-note">
              Note: Bio is set in siteConfig.ts. Homepage content is separate
              and comes from content/pages/home.md
            </span>
          </div>
          <div className="config-field">
            <label>Font Family</label>
            <select
              value={config.fontFamily}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
            >
              <option value="serif">Serif (New York)</option>
              <option value="sans">Sans (System)</option>
              <option value="monospace">Monospace (IBM Plex Mono)</option>
            </select>
          </div>
        </div>

        {/* Blog Page Settings */}
        <div className="dashboard-config-card">
          <h3>Blog Page</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.blogPageEnabled}
                onChange={(e) =>
                  handleChange("blogPageEnabled", e.target.checked)
                }
              />
              <span>Enable /blog route</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.blogPageShowInNav}
                onChange={(e) =>
                  handleChange("blogPageShowInNav", e.target.checked)
                }
              />
              <span>Show in navigation</span>
            </label>
          </div>
          <div className="config-field">
            <label>Blog Title</label>
            <input
              type="text"
              value={config.blogPageTitle}
              onChange={(e) => handleChange("blogPageTitle", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>View Mode</label>
            <select
              value={config.blogPageViewMode}
              onChange={(e) => handleChange("blogPageViewMode", e.target.value)}
            >
              <option value="list">List</option>
              <option value="cards">Cards</option>
            </select>
          </div>
        </div>

        {/* Posts Display */}
        <div className="dashboard-config-card">
          <h3>Posts Display</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.showPostsOnHome}
                onChange={(e) =>
                  handleChange("showPostsOnHome", e.target.checked)
                }
              />
              <span>Show posts on homepage</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.showPostsOnBlogPage}
                onChange={(e) =>
                  handleChange("showPostsOnBlogPage", e.target.checked)
                }
              />
              <span>Show posts on blog page</span>
            </label>
          </div>
          <div className="config-field">
            <label>Home Posts Limit (0 = all)</label>
            <input
              type="number"
              value={config.homePostsLimit}
              onChange={(e) =>
                handleChange("homePostsLimit", parseInt(e.target.value) || 0)
              }
              min={0}
            />
          </div>
        </div>

        {/* Featured Section */}
        <div className="dashboard-config-card">
          <h3>Featured Section</h3>
          <div className="config-field">
            <label>Featured Title</label>
            <input
              type="text"
              value={config.featuredTitle}
              onChange={(e) => handleChange("featuredTitle", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>View Mode</label>
            <select
              value={config.featuredViewMode}
              onChange={(e) => handleChange("featuredViewMode", e.target.value)}
            >
              <option value="list">List</option>
              <option value="cards">Cards</option>
            </select>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.showViewToggle}
                onChange={(e) =>
                  handleChange("showViewToggle", e.target.checked)
                }
              />
              <span>Show view toggle</span>
            </label>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="dashboard-config-card">
          <h3>Footer</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.footerEnabled}
                onChange={(e) =>
                  handleChange("footerEnabled", e.target.checked)
                }
              />
              <span>Enable footer</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.footerShowOnHomepage}
                onChange={(e) =>
                  handleChange("footerShowOnHomepage", e.target.checked)
                }
              />
              <span>Show on homepage</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.footerShowOnPosts}
                onChange={(e) =>
                  handleChange("footerShowOnPosts", e.target.checked)
                }
              />
              <span>Show on posts</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.footerShowOnPages}
                onChange={(e) =>
                  handleChange("footerShowOnPages", e.target.checked)
                }
              />
              <span>Show on pages</span>
            </label>
          </div>
          <p className="config-field-note" style={{ marginTop: "0.75rem" }}>
            Footer content is managed via{" "}
            <code>content/pages/footer.md</code>. Run{" "}
            <code>npm run sync</code> to update.
          </p>
        </div>

        {/* AI Chat Settings */}
        <div className="dashboard-config-card">
          <h3>AI Chat</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.aiChatEnabledOnWritePage}
                onChange={(e) =>
                  handleChange("aiChatEnabledOnWritePage", e.target.checked)
                }
              />
              <span>Enable on Write page</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.aiChatEnabledOnContent}
                onChange={(e) =>
                  handleChange("aiChatEnabledOnContent", e.target.checked)
                }
              />
              <span>Enable on content pages</span>
            </label>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="dashboard-config-card">
          <h3>Right Sidebar</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.rightSidebarEnabled}
                onChange={(e) =>
                  handleChange("rightSidebarEnabled", e.target.checked)
                }
              />
              <span>Enable right sidebar</span>
            </label>
          </div>
          <div className="config-field">
            <label>Min Width (px)</label>
            <input
              type="number"
              value={config.rightSidebarMinWidth}
              onChange={(e) =>
                handleChange(
                  "rightSidebarMinWidth",
                  parseInt(e.target.value) || 1135,
                )
              }
              min={768}
            />
          </div>
        </div>

        {/* Features */}
        <div className="dashboard-config-card">
          <h3>Features</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.newsletterEnabled}
                onChange={(e) =>
                  handleChange("newsletterEnabled", e.target.checked)
                }
              />
              <span>Enable newsletter</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.statsPageEnabled}
                onChange={(e) =>
                  handleChange("statsPageEnabled", e.target.checked)
                }
              />
              <span>Enable stats page</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.statsPageShowInNav}
                onChange={(e) =>
                  handleChange("statsPageShowInNav", e.target.checked)
                }
              />
              <span>Show stats in nav</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.visitorMapEnabled}
                onChange={(e) =>
                  handleChange("visitorMapEnabled", e.target.checked)
                }
              />
              <span>Enable visitor map</span>
            </label>
          </div>
        </div>

        {/* GitHub Settings */}
        <div className="dashboard-config-card">
          <h3>GitHub Repository</h3>
          <div className="config-field">
            <label>Owner</label>
            <input
              type="text"
              value={config.githubOwner}
              onChange={(e) => handleChange("githubOwner", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Repository</label>
            <input
              type="text"
              value={config.githubRepo}
              onChange={(e) => handleChange("githubRepo", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Branch</label>
            <input
              type="text"
              value={config.githubBranch}
              onChange={(e) => handleChange("githubBranch", e.target.value)}
            />
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.githubContributionsEnabled}
                onChange={(e) =>
                  handleChange("githubContributionsEnabled", e.target.checked)
                }
              />
              <span>Enable contributions graph</span>
            </label>
          </div>
          <div className="config-field">
            <label>Contributions Username</label>
            <input
              type="text"
              value={config.githubContributionsUsername}
              onChange={(e) =>
                handleChange("githubContributionsUsername", e.target.value)
              }
            />
          </div>
        </div>

        {/* Inner Page Logo */}
        <div className="dashboard-config-card">
          <h3>Inner Page Logo</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.innerPageLogoEnabled}
                onChange={(e) =>
                  handleChange("innerPageLogoEnabled", e.target.checked)
                }
              />
              <span>Enable inner page logo</span>
            </label>
          </div>
          <div className="config-field">
            <label>Logo Size (px)</label>
            <input
              type="number"
              value={config.innerPageLogoSize}
              onChange={(e) =>
                handleChange(
                  "innerPageLogoSize",
                  parseInt(e.target.value) || 28,
                )
              }
              min={16}
              max={64}
            />
          </div>
        </div>

        {/* Homepage Settings */}
        <div className="dashboard-config-card">
          <h3>Homepage</h3>
          <div className="config-field">
            <label>Type</label>
            <select
              value={config.homepageType}
              onChange={(e) => handleChange("homepageType", e.target.value)}
            >
              <option value="default">Default</option>
              <option value="post">Post</option>
              <option value="page">Page</option>
            </select>
          </div>
          <div className="config-field">
            <label>Slug (for post/page type)</label>
            <input
              type="text"
              value={config.homepageSlug}
              onChange={(e) => handleChange("homepageSlug", e.target.value)}
              placeholder="home"
            />
          </div>
          <div className="config-field">
            <label>Original Home Route</label>
            <input
              type="text"
              value={config.homepageOriginalRoute}
              onChange={(e) =>
                handleChange("homepageOriginalRoute", e.target.value)
              }
              placeholder="/home"
            />
          </div>
          <span className="config-field-note">
            Homepage content comes from content/pages/home.md (not siteConfig
            bio)
          </span>
        </div>

        {/* Contact Form */}
        <div className="dashboard-config-card">
          <h3>Contact Form</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.contactFormEnabled}
                onChange={(e) =>
                  handleChange("contactFormEnabled", e.target.checked)
                }
              />
              <span>Enable contact form</span>
            </label>
          </div>
          <div className="config-field">
            <label>Title</label>
            <input
              type="text"
              value={config.contactFormTitle}
              onChange={(e) => handleChange("contactFormTitle", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Description</label>
            <input
              type="text"
              value={config.contactFormDescription}
              onChange={(e) =>
                handleChange("contactFormDescription", e.target.value)
              }
            />
          </div>
        </div>

        {/* Social Footer */}
        <div className="dashboard-config-card">
          <h3>Social Footer</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.socialFooterEnabled}
                onChange={(e) =>
                  handleChange("socialFooterEnabled", e.target.checked)
                }
              />
              <span>Enable social footer</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.socialFooterShowInHeader}
                onChange={(e) =>
                  handleChange("socialFooterShowInHeader", e.target.checked)
                }
              />
              <span>Show in header</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.socialFooterShowOnHomepage}
                onChange={(e) =>
                  handleChange("socialFooterShowOnHomepage", e.target.checked)
                }
              />
              <span>Show on homepage</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.socialFooterShowOnPosts}
                onChange={(e) =>
                  handleChange("socialFooterShowOnPosts", e.target.checked)
                }
              />
              <span>Show on posts</span>
            </label>
          </div>
          <div className="config-field">
            <label>Copyright Site Name</label>
            <input
              type="text"
              value={config.socialFooterCopyrightSiteName}
              onChange={(e) =>
                handleChange("socialFooterCopyrightSiteName", e.target.value)
              }
            />
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.socialFooterCopyrightShowYear}
                onChange={(e) =>
                  handleChange(
                    "socialFooterCopyrightShowYear",
                    e.target.checked,
                  )
                }
              />
              <span>Show year in copyright</span>
            </label>
          </div>
        </div>

        {/* Logo Gallery */}
        <div className="dashboard-config-card">
          <h3>Logo Gallery</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.logoGalleryEnabled}
                onChange={(e) =>
                  handleChange("logoGalleryEnabled", e.target.checked)
                }
              />
              <span>Enable logo gallery</span>
            </label>
          </div>
          <div className="config-field">
            <label>Position</label>
            <select
              value={config.logoGalleryPosition}
              onChange={(e) =>
                handleChange("logoGalleryPosition", e.target.value)
              }
            >
              <option value="above-featured">Above Featured</option>
              <option value="above-footer">Above Footer</option>
            </select>
          </div>
          <div className="config-field">
            <label>Title</label>
            <input
              type="text"
              value={config.logoGalleryTitle}
              onChange={(e) => handleChange("logoGalleryTitle", e.target.value)}
            />
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.logoGalleryScrolling}
                onChange={(e) =>
                  handleChange("logoGalleryScrolling", e.target.checked)
                }
              />
              <span>Enable scrolling marquee</span>
            </label>
          </div>
          <div className="config-field">
            <label>Scroll Speed</label>
            <input
              type="number"
              value={config.logoGallerySpeed}
              onChange={(e) =>
                handleChange("logoGallerySpeed", parseInt(e.target.value) || 30)
              }
              min={1}
              max={100}
            />
          </div>
          <div className="config-field">
            <label>Max Items (when not scrolling)</label>
            <input
              type="number"
              value={config.logoGalleryMaxItems}
              onChange={(e) =>
                handleChange(
                  "logoGalleryMaxItems",
                  parseInt(e.target.value) || 4,
                )
              }
              min={1}
              max={20}
            />
          </div>
          <span className="config-field-note">
            Logo images are configured in the logoGallery.images array in
            siteConfig.ts
          </span>
        </div>

        {/* Newsletter Signup Locations */}
        <div className="dashboard-config-card">
          <h3>Newsletter Signup Locations</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.newsletterHomeEnabled}
                onChange={(e) =>
                  handleChange("newsletterHomeEnabled", e.target.checked)
                }
              />
              <span>Show on homepage</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.newsletterBlogPageEnabled}
                onChange={(e) =>
                  handleChange("newsletterBlogPageEnabled", e.target.checked)
                }
              />
              <span>Show on blog page</span>
            </label>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.newsletterPostsEnabled}
                onChange={(e) =>
                  handleChange("newsletterPostsEnabled", e.target.checked)
                }
              />
              <span>Show on posts</span>
            </label>
          </div>
        </div>

        {/* MCP Server */}
        <div className="dashboard-config-card">
          <h3>MCP Server</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.mcpServerEnabled}
                onChange={(e) =>
                  handleChange("mcpServerEnabled", e.target.checked)
                }
              />
              <span>Enable MCP server</span>
            </label>
          </div>
          <div className="config-field">
            <label>Endpoint</label>
            <input
              type="text"
              value={config.mcpServerEndpoint}
              onChange={(e) =>
                handleChange("mcpServerEndpoint", e.target.value)
              }
              placeholder="/mcp"
            />
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.mcpServerRequireAuth}
                onChange={(e) =>
                  handleChange("mcpServerRequireAuth", e.target.checked)
                }
              />
              <span>Require authentication</span>
            </label>
          </div>
        </div>

        {/* Image Lightbox */}
        <div className="dashboard-config-card">
          <h3>Image Lightbox</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.imageLightboxEnabled}
                onChange={(e) =>
                  handleChange("imageLightboxEnabled", e.target.checked)
                }
              />
              <span>Enable image lightbox (click images to magnify)</span>
            </label>
          </div>
        </div>

        {/* Semantic Search */}
        <div className="dashboard-config-card">
          <h3>Semantic Search</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.semanticSearchEnabled}
                onChange={(e) =>
                  handleChange("semanticSearchEnabled", e.target.checked)
                }
              />
              <span>Enable semantic search (requires OPENAI_API_KEY in Convex)</span>
            </label>
          </div>
          <p className="config-hint">
            When enabled, search modal shows both Keyword and Semantic modes. Requires OpenAI API key for embeddings.
          </p>
        </div>

        {/* Ask AI */}
        <div className="dashboard-config-card">
          <h3>Ask AI</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.askAIEnabled}
                onChange={(e) =>
                  handleChange("askAIEnabled", e.target.checked)
                }
              />
              <span>Enable Ask AI header button</span>
            </label>
          </div>
          <p className="config-hint">
            Shows a sparkle icon in header. Requires semantic search enabled and API keys (ANTHROPIC_API_KEY or OPENAI_API_KEY in Convex).
          </p>
        </div>

        {/* Media Library */}
        <div className="dashboard-config-card">
          <h3>Media Library</h3>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.mediaEnabled}
                onChange={(e) =>
                  handleChange("mediaEnabled", e.target.checked)
                }
              />
              <span>Enable media library</span>
            </label>
          </div>
          <div className="config-field">
            <label>Max File Size (MB)</label>
            <input
              type="number"
              value={config.mediaMaxFileSize}
              onChange={(e) => handleChange("mediaMaxFileSize", parseInt(e.target.value) || 10)}
              min={1}
              max={50}
            />
          </div>
          <p className="config-hint">
            Upload and manage images via ConvexFS and Bunny.net CDN. Requires BUNNY_API_KEY, BUNNY_STORAGE_ZONE, and BUNNY_CDN_HOSTNAME in Convex dashboard.
          </p>
        </div>

        {/* Related Posts */}
        <div className="dashboard-config-card">
          <h3>Related Posts</h3>
          <div className="config-field">
            <label>Default View Mode</label>
            <select
              value={config.relatedPostsDefaultViewMode}
              onChange={(e) =>
                handleChange("relatedPostsDefaultViewMode", e.target.value)
              }
            >
              <option value="thumbnails">Thumbnails</option>
              <option value="list">List</option>
            </select>
          </div>
          <div className="config-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.relatedPostsShowViewToggle}
                onChange={(e) =>
                  handleChange("relatedPostsShowViewToggle", e.target.checked)
                }
              />
              <span>Show view toggle button</span>
            </label>
          </div>
          <p className="config-hint">
            Controls the display of related posts at the bottom of blog posts. Thumbnails view shows image, title, description and author.
          </p>
        </div>

        {/* Version Control */}
        <VersionControlCard addToast={addToast} />

        {/* Links */}
        <div className="dashboard-config-card">
          <h3>External Links</h3>
          <div className="config-field">
            <label>Docs Link</label>
            <input
              type="text"
              value={config.linksDocs}
              onChange={(e) => handleChange("linksDocs", e.target.value)}
              placeholder="/setup-guide"
            />
          </div>
          <div className="config-field">
            <label>Convex Link</label>
            <input
              type="text"
              value={config.linksConvex}
              onChange={(e) => handleChange("linksConvex", e.target.value)}
              placeholder="https://convex.dev"
            />
          </div>
          <div className="config-field">
            <label>Netlify Link</label>
            <input
              type="text"
              value={config.linksNetlify}
              onChange={(e) => handleChange("linksNetlify", e.target.value)}
              placeholder="https://netlify.com"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-config-note">
        <p>
          After generating, copy this code and paste it into{" "}
          <code>src/config/siteConfig.ts</code>. You may need to adjust the type
          definitions and add your logo gallery images manually.
        </p>
      </div>
    </div>
  );
}

// Version Control Card Component
function VersionControlCard({
  addToast,
}: {
  addToast: (message: string, type: ToastType) => void;
}) {
  const versionControlEnabled = useQuery(api.versions.isEnabled);
  const versionStats = useQuery(api.versions.getStats);
  const setVersionControlEnabled = useMutation(api.versions.setEnabled);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await setVersionControlEnabled({ enabled: !versionControlEnabled });
      addToast(
        `Version control ${!versionControlEnabled ? "enabled" : "disabled"}`,
        "success"
      );
    } catch {
      addToast("Failed to update version control setting", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard-config-card">
      <h3>Version Control</h3>
      <div className="config-field checkbox">
        <label>
          <input
            type="checkbox"
            checked={versionControlEnabled ?? false}
            onChange={handleToggle}
            disabled={isToggling}
          />
          <span>
            {isToggling ? "Updating..." : "Enable version history (3-day retention)"}
          </span>
        </label>
      </div>
      <p className="config-hint">
        When enabled, saves a snapshot before each edit. View and restore previous versions
        from the editor toolbar.
      </p>
      {versionStats && versionStats.totalVersions > 0 && (
        <div className="version-stats">
          <div className="version-stat">
            <span className="version-stat-label">Total versions:</span>
            <span className="version-stat-value">{versionStats.totalVersions}</span>
          </div>
          <div className="version-stat">
            <span className="version-stat-label">Oldest:</span>
            <span className="version-stat-value">
              {formatDate(versionStats.oldestVersion)}
            </span>
          </div>
          <div className="version-stat">
            <span className="version-stat-label">Newest:</span>
            <span className="version-stat-value">
              {formatDate(versionStats.newestVersion)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsSection() {
  const stats = useQuery(api.stats.getStats);

  return (
    <div className="dashboard-stats-section">
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.activeVisitors ?? 0}</span>
            <span className="stat-label">Active Visitors</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <ChartLine size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalPageViews ?? 0}</span>
            <span className="stat-label">Total Page Views</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <Article size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.uniqueVisitors ?? 0}</span>
            <span className="stat-label">Unique Visitors</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <Files size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.publishedPosts ?? 0}</span>
            <span className="stat-label">Published Posts</span>
          </div>
        </div>
      </div>

      {stats?.activeByPath && stats.activeByPath.length > 0 && (
        <div className="dashboard-stats-active">
          <h3>Active Now</h3>
          <div className="active-paths-list">
            {stats.activeByPath.slice(0, 5).map((item) => (
              <div key={item.path} className="active-path-item">
                <span className="path">{item.path}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.pageStats && stats.pageStats.length > 0 && (
        <div className="dashboard-stats-pages">
          <h3>Top Pages</h3>
          <div className="dashboard-list-table">
            <div className="dashboard-list-table-header">
              <span className="col-title">Page</span>
              <span className="col-views">Views</span>
            </div>
            {stats.pageStats.slice(0, 10).map((page) => (
              <div key={page.path} className="dashboard-list-row">
                <div className="col-title">
                  <span className="post-title">{page.title}</span>
                  <span className="post-slug">{page.path}</span>
                </div>
                <div className="col-views">{page.views}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-stats-link">
        <Link to="/stats" className="dashboard-placeholder-link">
          Open Full Stats Page
        </Link>
      </div>
    </div>
  );
}

function SyncSection({
  showCommandModal,
  executeSync,
  syncOutput,
  syncRunning,
  syncServerAvailable,
  syncOutputRef,
  setSyncOutput,
}: {
  showCommandModal: (
    title: string,
    command: string,
    description?: string,
  ) => void;
  executeSync: (commandId: string, commandLabel: string) => Promise<void>;
  syncOutput: string;
  syncRunning: string | null;
  syncServerAvailable: boolean | null;
  syncOutputRef: React.RefObject<HTMLPreElement>;
  setSyncOutput: (output: string) => void;
}) {
  const syncCommands = [
    {
      id: "sync",
      label: "Sync (Dev)",
      command: "npm run sync",
      description: "Sync markdown to development Convex",
    },
    {
      id: "sync:prod",
      label: "Sync (Prod)",
      command: "npm run sync:prod",
      description: "Sync markdown to production Convex",
    },
    {
      id: "sync:discovery",
      label: "Sync Discovery (Dev)",
      command: "npm run sync:discovery",
      description: "Sync discovery files to dev",
    },
    {
      id: "sync:discovery:prod",
      label: "Sync Discovery (Prod)",
      command: "npm run sync:discovery:prod",
      description: "Sync discovery files to prod",
    },
    {
      id: "sync:all",
      label: "Sync All (Dev)",
      command: "npm run sync:all",
      description: "Sync everything to development",
    },
    {
      id: "sync:all:prod",
      label: "Sync All (Prod)",
      command: "npm run sync:all:prod",
      description: "Sync everything to production",
    },
  ];

  const handleCopyCommand = (
    label: string,
    command: string,
    description: string,
  ) => {
    showCommandModal(label, command, description);
  };

  const handleExecute = (commandId: string, label: string) => {
    executeSync(commandId, label);
  };

  // State for copy feedback on sync-server command
  const [copiedSyncServer, setCopiedSyncServer] = useState(false);

  const handleCopySyncServer = async () => {
    try {
      await navigator.clipboard.writeText("npm run sync-server");
      setCopiedSyncServer(true);
      setTimeout(() => setCopiedSyncServer(false), 2000);
    } catch {
      // Fallback: show modal
      showCommandModal(
        "Start Sync Server",
        "npm run sync-server",
        "Start the local sync server to enable execute buttons",
      );
    }
  };

  return (
    <div className="dashboard-sync-section">
      <div className="dashboard-sync-header">
        <ArrowsClockwise size={32} weight="light" />
        <h2>Sync Content</h2>
        <p>Sync markdown content to Convex database</p>
      </div>

      {/* Server Status */}
      <div
        className={`sync-server-status ${syncServerAvailable ? "online" : "offline"}`}
      >
        <div className="status-indicator">
          <span
            className={`status-dot ${syncServerAvailable ? "online" : "offline"}`}
          />
          <span className="status-text">
            Sync Server:{" "}
            {syncServerAvailable === null
              ? "Checking..."
              : syncServerAvailable
                ? "Online"
                : "Offline"}
          </span>
        </div>
        {!syncServerAvailable && syncServerAvailable !== null && (
          <div className="status-help">
            <Terminal size={14} />
            <code>npm run sync-server</code>
            <button
              className="copy-sync-server-btn"
              onClick={handleCopySyncServer}
              title="Copy command"
            >
              {copiedSyncServer ? (
                <Check size={12} />
              ) : (
                <CopySimple size={12} />
              )}
            </button>
            <span>to enable execute buttons</span>
          </div>
        )}
      </div>

      <div className="dashboard-sync-grid">
        {syncCommands.map((cmd) => (
          <div key={cmd.id} className="dashboard-sync-card">
            <div className="sync-card-header">
              <h3>{cmd.label}</h3>
              <span
                className={`sync-status ${syncRunning === cmd.id ? "running" : "idle"}`}
              >
                {syncRunning === cmd.id && "Running..."}
              </span>
            </div>
            <p>{cmd.description}</p>
            <code className="sync-command">{cmd.command}</code>
            <div className="sync-card-buttons">
              <button
                className="dashboard-sync-card-btn copy"
                onClick={() =>
                  handleCopyCommand(cmd.label, cmd.command, cmd.description)
                }
                title="Copy command to clipboard"
              >
                <CopySimple size={16} />
                <span>Copy</span>
              </button>
              <button
                className={`dashboard-sync-card-btn execute ${!syncServerAvailable ? "disabled" : ""}`}
                onClick={() => handleExecute(cmd.id, cmd.label)}
                disabled={!syncServerAvailable || syncRunning !== null}
                title={
                  syncServerAvailable
                    ? "Execute command"
                    : "Start sync-server first"
                }
              >
                <ArrowsClockwise
                  size={16}
                  className={syncRunning === cmd.id ? "spinning" : ""}
                />
                <span>{syncRunning === cmd.id ? "Running..." : "Execute"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Output */}
      {(syncOutput || syncRunning) && (
        <div className="sync-terminal">
          <div className="sync-terminal-header">
            <Terminal size={16} />
            <span>Output</span>
            {syncOutput && !syncRunning && (
              <button
                className="sync-terminal-clear"
                onClick={() => setSyncOutput("")}
                title="Clear output"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <pre className="sync-terminal-output" ref={syncOutputRef}>
            {syncOutput || "Waiting for output..."}
          </pre>
        </div>
      )}

      <div className="dashboard-sync-info">
        <h3>Usage</h3>
        <p>
          {syncServerAvailable ? (
            <>
              Click <strong>Execute</strong> to run commands directly from the
              dashboard, or <strong>Copy</strong> to copy the command for your
              terminal.
            </>
          ) : (
            <>
              Start the sync server with{" "}
              <code className="copyable-code">
                npm run sync-server
                <button
                  className="inline-copy-btn"
                  onClick={handleCopySyncServer}
                  title="Copy command"
                >
                  {copiedSyncServer ? (
                    <Check size={10} />
                  ) : (
                    <CopySimple size={10} />
                  )}
                </button>
              </code>{" "}
              to enable execute buttons, or use <strong>Copy</strong> to run
              commands manually in your terminal.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
