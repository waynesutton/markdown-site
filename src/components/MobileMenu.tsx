import { ReactNode, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Heading } from "../utils/extractHeadings";
import DocsSidebar from "./DocsSidebar";
import siteConfig from "../config/siteConfig";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  sidebarHeadings?: Heading[];
  sidebarActiveId?: string;
  showDocsNav?: boolean;
  currentDocsSlug?: string;
}

/**
 * Mobile menu drawer component
 * Opens from the left side on mobile/tablet views
 * Uses CSS transforms for smooth 60fps animations
 */
export default function MobileMenu({
  isOpen,
  onClose,
  children,
  sidebarHeadings = [],
  sidebarActiveId,
  showDocsNav = false,
  currentDocsSlug,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const hasSidebar = sidebarHeadings.length > 0;
  const showDocsSection = showDocsNav && siteConfig.docsSection?.enabled;

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap - keep focus within menu when open
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector<HTMLElement>(
        'button, a, input, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Navigate to heading and close menu
  const navigateToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        // Close menu first
        onClose();
        // Scroll after menu closes
        setTimeout(() => {
          const headerOffset = 80;
          const elementTop =
            element.getBoundingClientRect().top + window.scrollY;
          const targetPosition = elementTop - headerOffset;
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
          });
          window.history.pushState(null, "", `#${id}`);
        }, 100);
      }
    },
    [onClose],
  );

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`mobile-menu-backdrop ${isOpen ? "open" : ""}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={menuRef}
        className={`mobile-menu-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        {/* Close button */}
        <button
          className="mobile-menu-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Home link at top */}
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-menu-home-link" onClick={onClose}>
            Home
          </Link>
        </div>

        {/* Menu content */}
        <div className="mobile-menu-content">
          {children}

          {/* Docs sidebar navigation (when on a docs page) */}
          {showDocsSection && (
            <div className="mobile-menu-docs">
              <DocsSidebar currentSlug={currentDocsSlug} isMobile={true} />
            </div>
          )}

          {/* Table of contents from sidebar (if page has sidebar) */}
          {hasSidebar && (
            <div className="mobile-menu-toc">
              <div className="mobile-menu-toc-title">On this page</div>
              <nav className="mobile-menu-toc-links">
                {sidebarHeadings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => navigateToHeading(heading.id)}
                    className={`mobile-menu-toc-link mobile-menu-toc-level-${heading.level} ${
                      sidebarActiveId === heading.id ? "active" : ""
                    }`}
                  >
                    <ChevronRight size={12} className="mobile-menu-toc-icon" />
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Hamburger button component for opening the mobile menu
 */
interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function HamburgerButton({ onClick, isOpen }: HamburgerButtonProps) {
  return (
    <button
      className="hamburger-button"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
