import { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";
import MobileMenu, { HamburgerButton } from "./MobileMenu";
import ScrollToTop, { ScrollToTopConfig } from "./ScrollToTop";
import siteConfig from "../config/siteConfig";

// Scroll-to-top configuration - enabled by default
// Customize threshold (pixels) to control when button appears
const scrollToTopConfig: Partial<ScrollToTopConfig> = {
  enabled: true, // Set to false to disable
  threshold: 300, // Show after scrolling 300px
  smooth: true, // Smooth scroll animation
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Fetch published pages for navigation
  const pages = useQuery(api.pages.getAllPages);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Open search modal
  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // Close search modal
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Mobile menu handlers
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Command+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Also close on Escape
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Check if Blog link should be shown in nav
  const showBlogInNav =
    siteConfig.blogPage.enabled && siteConfig.blogPage.showInNav;

  // Combine Blog link with pages and sort by order
  // This allows Blog to be positioned anywhere in the nav via siteConfig.blogPage.order
  type NavItem = {
    slug: string;
    title: string;
    order: number;
    isBlog?: boolean;
  };

  const navItems: NavItem[] = [];

  // Add Blog link if enabled
  if (showBlogInNav) {
    navItems.push({
      slug: "blog",
      title: siteConfig.blogPage.title,
      order: siteConfig.blogPage.order ?? 0,
      isBlog: true,
    });
  }

  // Add pages from Convex
  if (pages && pages.length > 0) {
    pages.forEach((page) => {
      navItems.push({
        slug: page.slug,
        title: page.title,
        order: page.order ?? 999,
      });
    });
  }

  // Sort by order (lower numbers first), then alphabetically by title
  navItems.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="layout">
      {/* Top navigation bar with page links, search, and theme toggle */}
      <div className="top-nav">
        {/* Hamburger button for mobile menu (visible on mobile/tablet only) */}
        <div className="mobile-menu-trigger">
          <HamburgerButton
            onClick={openMobileMenu}
            isOpen={isMobileMenuOpen}
          />
        </div>

        {/* Page navigation links (visible on desktop only) */}
        <nav className="page-nav desktop-only">
          {/* Nav links sorted by order (Blog + pages combined) */}
          {navItems.map((item) => (
            <Link
              key={item.slug}
              to={`/${item.slug}`}
              className="page-nav-link"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Search button with icon */}
        <button
          onClick={openSearch}
          className="search-button"
          aria-label="Search (⌘K)"
          title="Search (⌘K)"
        >
          <MagnifyingGlass size={18} weight="bold" />
        </button>
        {/* Theme toggle */}
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile menu drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        {/* Page navigation links in mobile menu (same order as desktop) */}
        <nav className="mobile-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              to={`/${item.slug}`}
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </MobileMenu>

      {/* Use wider layout for stats page, normal layout for other pages */}
      <main className={location.pathname === "/stats" ? "main-content-wide" : "main-content"}>
        {children}
      </main>

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      {/* Scroll to top button */}
      <ScrollToTop config={scrollToTopConfig} />
    </div>
  );
}
