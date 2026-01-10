import { useState, useEffect, useRef, useCallback } from "react";
import type { Heading } from "../utils/extractHeadings";

interface DocsTOCProps {
  headings: Heading[];
}

// Get the scrolling container for docs layout
function getScrollContainer(): HTMLElement | Window {
  const docsContent = document.querySelector(".docs-content");
  return docsContent as HTMLElement || window;
}

// Get scroll position from the appropriate container
function getScrollTop(container: HTMLElement | Window): number {
  if (container === window) {
    return window.scrollY;
  }
  return (container as HTMLElement).scrollTop;
}

// Get element position relative to the scroll container
function getElementOffsetTop(element: HTMLElement, container: HTMLElement | Window): number {
  if (container === window) {
    return element.getBoundingClientRect().top + window.scrollY;
  }
  const containerEl = container as HTMLElement;
  const containerRect = containerEl.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return elementRect.top - containerRect.top + containerEl.scrollTop;
}

export default function DocsTOC({ headings }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const isNavigatingRef = useRef(false);

  // Scroll tracking to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const container = getScrollContainer();

    const handleScroll = () => {
      // Skip during programmatic navigation
      if (isNavigatingRef.current) return;

      const scrollPosition = getScrollTop(container) + 120; // Header offset

      // Find the heading that's currently in view
      let currentId = "";
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const top = getElementOffsetTop(element, container);
          if (scrollPosition >= top) {
            currentId = heading.id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentId);
    };

    // Initial check
    handleScroll();

    const scrollTarget = container === window ? window : container;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // Navigate to heading
  const navigateToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const container = getScrollContainer();

    isNavigatingRef.current = true;
    setActiveId(id);

    // Scroll with header offset
    const headerOffset = 80;
    const elementTop = getElementOffsetTop(element, container);
    const targetPosition = elementTop - headerOffset;

    if (container === window) {
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    } else {
      (container as HTMLElement).scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }

    // Update URL hash
    window.history.pushState(null, "", `#${id}`);

    // Re-enable scroll tracking after animation
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, []);

  // Handle hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && headings.some((h) => h.id === hash)) {
        navigateToHeading(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [headings, navigateToHeading]);

  // Initial hash navigation on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && headings.some((h) => h.id === hash)) {
      // Delay to ensure DOM is ready
      requestAnimationFrame(() => {
        navigateToHeading(hash);
      });
    }
  }, [headings, navigateToHeading]);

  // No headings, don't render
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="docs-toc">
      <h3 className="docs-toc-title">On this page</h3>
      <ul className="docs-toc-list">
        {headings.map((heading) => (
          <li key={heading.id} className="docs-toc-item">
            <a
              href={`#${heading.id}`}
              className={`docs-toc-link level-${heading.level} ${activeId === heading.id ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                navigateToHeading(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
