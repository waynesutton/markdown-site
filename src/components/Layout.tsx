import { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";
import MobileMenu, { HamburgerButton } from "./MobileMenu";
import ScrollToTop, { ScrollToTopConfig } from "./ScrollToTop";
import { useSidebarOptional } from "../context/SidebarContext";
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

  // Get sidebar headings from context (if available)
  const sidebarContext = useSidebarOptional();
  const sidebarHeadings = sidebarContext?.headings || [];
  const sidebarActiveId = sidebarContext?.activeId;

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

  // Combine Blog link, hardcoded nav items, and pages, then sort by order
  // This allows all nav items to be positioned anywhere via order field
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

  // Add hardcoded nav items (React routes like /stats, /write)
  if (siteConfig.hardcodedNavItems && siteConfig.hardcodedNavItems.length > 0) {
    siteConfig.hardcodedNavItems.forEach((item) => {
      // Only add if showInNav is true (defaults to true)
      if (item.showInNav !== false) {
        navItems.push({
          slug: item.slug,
          title: item.title,
          order: item.order ?? 999,
        });
      }
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
      {/* Top navigation bar with logo, page links, search, and theme toggle */}
      <div className="top-nav">
        {/* Logo on the left (visible on all pages) */}
        {siteConfig.innerPageLogo.enabled && siteConfig.logo && (
          <Link to="/" className="top-nav-logo-link">
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              className="top-nav-logo"
              style={{ height: siteConfig.innerPageLogo.size }}
            />
          </Link>
        )}

        {/* Mobile left controls: hamburger, search, theme (visible on mobile/tablet only) */}
        <div className="mobile-nav-controls">
          {/* Hamburger button for mobile menu */}
          <HamburgerButton onClick={openMobileMenu} isOpen={isMobileMenuOpen} />
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

        {/* Desktop search and theme (visible on desktop only) */}
        <div className="desktop-controls desktop-only">
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
      </div>

      {/* Mobile menu drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        sidebarHeadings={sidebarHeadings}
        sidebarActiveId={sidebarActiveId}
      >
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
      <main
        className={
          location.pathname === "/stats" ? "main-content-wide" : "main-content"
        }
      >
        {children}
      </main>

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      {/* Scroll to top button */}
      <ScrollToTop config={scrollToTopConfig} />
    </div>
  );
}
