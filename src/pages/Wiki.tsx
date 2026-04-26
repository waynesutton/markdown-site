import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  lazy,
  Suspense,
} from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import {
  MagnifyingGlass,
  CaretRight,
  CaretDown,
  ArrowLeft,
  TreeStructure,
  Globe,
  SidebarSimple,
} from "@phosphor-icons/react";

const KnowledgeGraph = lazy(() => import("../components/KnowledgeGraph"));

import type { Id } from "../../convex/_generated/dataModel";

type WikiPageItem = {
  _id: string;
  slug: string;
  title: string;
  pageType: string;
  category?: string;
  lastCompiledAt: number;
  kbId?: Id<"knowledgeBases">;
};

// Drag-to-resize hook for sidebar panels
function useDragResize(
  initialWidth: number,
  min: number,
  max: number,
  side: "left" | "right",
) {
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta =
          side === "left"
            ? ev.clientX - startX.current
            : startX.current - ev.clientX;
        setWidth(Math.max(min, Math.min(max, startW.current + delta)));
      };
      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, min, max, side],
  );

  return { width, onMouseDown };
}

export default function Wiki() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeKbId, setActiveKbId] = useState<Id<"knowledgeBases"> | undefined>(undefined);

  // Fetch all KBs for the switcher
  const knowledgeBases = useQuery(api.knowledgeBases.listKnowledgeBases) ?? [];

  // Pass kbId to scope queries
  const queryArgs = activeKbId ? { kbId: activeKbId } : {};
  const wikiPages = useQuery(api.wiki.listWikiPages, queryArgs);
  const graphData = useQuery(api.wiki.getGraphData, queryArgs);
  const pageDetail = useQuery(
    api.wiki.getWikiPageBySlug,
    selectedSlug ? { slug: selectedSlug } : "skip",
  );

  const leftResize = useDragResize(240, 180, 400, "left");
  const rightResize = useDragResize(260, 200, 400, "right");

  // Build slug set for detecting internal wiki links
  const slugSet = useMemo(() => {
    if (!wikiPages) return new Set<string>();
    return new Set(wikiPages.map((p) => p.slug));
  }, [wikiPages]);

  const handlePageSelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Intercept clicks on wiki links inside markdown content
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      // Match /wiki/slug.md or /wiki/slug or just slug patterns
      const wikiMatch = href.match(/^\/wiki\/([^/.]+)(?:\.md)?$/);
      if (wikiMatch && slugSet.has(wikiMatch[1])) {
        e.preventDefault();
        handlePageSelect(wikiMatch[1]);
        return;
      }

      // Match relative slug references (e.g. slug.md or just slug)
      const relativeMatch = href.match(/^([a-z0-9-]+)(?:\.md)?$/);
      if (relativeMatch && slugSet.has(relativeMatch[1])) {
        e.preventDefault();
        handlePageSelect(relativeMatch[1]);
        return;
      }
    };

    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [slugSet, handlePageSelect]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group pages by category for sidebar nav
  const categorized = useMemo(() => {
    if (!wikiPages) return new Map<string, WikiPageItem[]>();
    const map = new Map<string, WikiPageItem[]>();
    const filtered = searchQuery
      ? wikiPages.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : wikiPages;

    for (const page of filtered) {
      const cat = page.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(page);
    }
    return map;
  }, [wikiPages, searchQuery]);

  // Extract headings from markdown for "on this page" sidebar
  const headings = useMemo(() => {
    if (!pageDetail?.content) return [];
    const lines = pageDetail.content.split("\n");
    const result: Array<{ level: number; text: string; id: string }> = [];
    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        result.push({ level: match[1].length, text, id });
      }
    }
    return result;
  }, [pageDetail?.content]);

  const totalPages = wikiPages?.length ?? 0;
  const totalEdges = graphData?.edges?.length ?? 0;

  // Grid template columns based on sidebar visibility
  const gridCols = [
    leftOpen ? `${leftResize.width}px` : "0px",
    "1fr",
    rightOpen ? `${rightResize.width}px` : "0px",
  ].join(" ");

  return (
    <div className="wiki-layout" style={{ gridTemplateColumns: gridCols }}>
      {/* Left sidebar toggle (visible when collapsed) */}
      {!leftOpen && (
        <button
          className="wiki-sidebar-toggle wiki-sidebar-toggle-left"
          onClick={() => setLeftOpen(true)}
          title="Show sidebar"
        >
          <SidebarSimple size={16} />
        </button>
      )}

      {/* Left sidebar: search + category nav */}
      <aside
        className={`wiki-sidebar wiki-sidebar-left ${leftOpen ? "" : "collapsed"}`}
      >
        <div className="wiki-sidebar-inner">
          <div className="wiki-sidebar-header">
            <Globe size={18} weight="bold" />
            <span className="wiki-sidebar-title">Wiki</span>
            <button
              className="wiki-sidebar-close"
              onClick={() => setLeftOpen(false)}
              title="Hide sidebar"
            >
              <SidebarSimple size={14} />
            </button>
          </div>

          {/* KB switcher: only show if KBs exist */}
          {knowledgeBases.length > 0 && (
            <div className="wiki-kb-switcher">
              <select
                value={activeKbId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveKbId(val ? (val as Id<"knowledgeBases">) : undefined);
                  setSelectedSlug(null);
                  setSearchQuery("");
                }}
              >
                <option value="">Site Wiki</option>
                {knowledgeBases.map((kb) => (
                  <option key={kb._id} value={kb._id}>
                    {kb.title} ({kb.pageCount ?? 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="wiki-search">
            <MagnifyingGlass size={14} />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="wiki-nav">
            {wikiPages === undefined ? (
              <div className="wiki-nav-loading" />
            ) : (
              <>
                <button
                  className={`wiki-nav-item wiki-nav-root ${!selectedSlug ? "active" : ""}`}
                  onClick={() => setSelectedSlug(null)}
                >
                  <TreeStructure size={14} />
                  All pages
                  <span className="wiki-nav-count">{totalPages}</span>
                </button>

                {Array.from(categorized.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, pages]) => (
                    <div key={category} className="wiki-nav-section">
                      <button
                        className="wiki-nav-category"
                        onClick={() => toggleCategory(category)}
                      >
                        {expandedCategories.has(category) ? (
                          <CaretDown size={12} />
                        ) : (
                          <CaretRight size={12} />
                        )}
                        {category}
                        <span className="wiki-nav-count">{pages.length}</span>
                      </button>

                      {expandedCategories.has(category) && (
                        <div className="wiki-nav-pages">
                          {pages.map((page) => (
                            <button
                              key={page._id}
                              className={`wiki-nav-item ${selectedSlug === page.slug ? "active" : ""}`}
                              onClick={() => handlePageSelect(page.slug)}
                            >
                              {page.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </>
            )}
          </nav>
        </div>

        {/* Drag handle for resize */}
        <div
          className="wiki-resize-handle wiki-resize-handle-right"
          onMouseDown={leftResize.onMouseDown}
        />
      </aside>

      {/* Center: main content */}
      <main className="wiki-main" ref={contentRef}>
        {/* Right sidebar toggle (visible when collapsed) */}
        {!rightOpen && (
          <button
            className="wiki-sidebar-toggle wiki-sidebar-toggle-right-inline"
            onClick={() => setRightOpen(true)}
            title="Show graph panel"
          >
            <SidebarSimple size={16} mirrored />
          </button>
        )}

        {selectedSlug && pageDetail ? (
          <div className="wiki-detail">
            <button
              className="wiki-back-btn"
              onClick={() => setSelectedSlug(null)}
            >
              <ArrowLeft size={14} />
              Back to index
            </button>

            <article className="wiki-article">
              <header className="wiki-article-header">
                <h1>{pageDetail.title}</h1>
                <div className="wiki-article-meta">
                  <span className="wiki-tag">{pageDetail.pageType}</span>
                  {pageDetail.category && (
                    <span className="wiki-tag">{pageDetail.category}</span>
                  )}
                  <span className="wiki-date">
                    Compiled{" "}
                    {new Date(pageDetail.lastCompiledAt).toLocaleDateString()}
                  </span>
                </div>
              </header>

              <div className="wiki-content markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw, [rehypeSanitize, defaultSchema]]}
                >
                  {pageDetail.content}
                </ReactMarkdown>
              </div>

              {pageDetail.backlinks && pageDetail.backlinks.length > 0 && (
                <div className="wiki-backlinks">
                  <h4>Backlinks</h4>
                  <div className="wiki-backlinks-list">
                    {pageDetail.backlinks.map((bl: string) => (
                      <button
                        key={bl}
                        className="wiki-backlink-btn"
                        onClick={() => handlePageSelect(bl)}
                      >
                        {bl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pageDetail.sourceSlugs &&
                pageDetail.sourceSlugs.length > 0 && (
                  <div className="wiki-sources">
                    <h4>Sources</h4>
                    <div className="wiki-sources-list">
                      {pageDetail.sourceSlugs.map((sl: string) => (
                        <span key={sl} className="wiki-source-tag">
                          {sl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </article>
          </div>
        ) : (
          <div className="wiki-index-view">
            <div className="wiki-index-header">
              <h1>Wiki</h1>
              <p className="wiki-subtitle">
                Interlinked knowledge base compiled from all site content.
                {totalPages > 0 && (
                  <> {totalPages} pages, {totalEdges} connections.</>
                )}
              </p>
            </div>

            {wikiPages && wikiPages.length > 0 ? (
              <div className="wiki-grid">
                {wikiPages.map((page) => (
                  <button
                    key={page._id}
                    className="wiki-card"
                    onClick={() => handlePageSelect(page.slug)}
                  >
                    <h3 className="wiki-card-title">{page.title}</h3>
                    <div className="wiki-card-meta">
                      <span className="wiki-tag wiki-tag-small">
                        {page.pageType}
                      </span>
                      {page.category && (
                        <span className="wiki-tag wiki-tag-small">
                          {page.category}
                        </span>
                      )}
                    </div>
                    <span className="wiki-card-date">
                      {new Date(page.lastCompiledAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            ) : wikiPages && wikiPages.length === 0 ? (
              <div className="wiki-empty">
                <p>No wiki pages compiled yet.</p>
                <p>
                  Run <code>npm run sync:wiki</code> to build the wiki from
                  your content, or use the Dashboard to compile pages.
                </p>
              </div>
            ) : (
              <div className="wiki-loading" />
            )}
          </div>
        )}
      </main>

      {/* Right sidebar: graph + on this page */}
      <aside
        className={`wiki-sidebar wiki-sidebar-right ${rightOpen ? "" : "collapsed"}`}
      >
        {/* Drag handle for resize */}
        <div
          className="wiki-resize-handle wiki-resize-handle-left"
          onMouseDown={rightResize.onMouseDown}
        />

        <div className="wiki-sidebar-inner">
          <div className="wiki-sidebar-header wiki-sidebar-header-right">
            <span className="wiki-sidebar-title">
              Graph
            </span>
            <button
              className="wiki-sidebar-close"
              onClick={() => setRightOpen(false)}
              title="Hide panel"
            >
              <SidebarSimple size={14} mirrored />
            </button>
          </div>

          <div className="wiki-graph-panel">
            <div className="wiki-graph-header">
              <span className="wiki-graph-label">INTERACTIVE GRAPH</span>
              <button
                className="wiki-graph-expand-btn"
                onClick={() => setGraphExpanded(!graphExpanded)}
                title={graphExpanded ? "Collapse graph" : "Expand graph"}
              >
                {graphExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            <div className="wiki-graph-container">
              {graphData && graphData.nodes.length > 0 ? (
                <Suspense
                  fallback={
                    <div className="wiki-graph-loading">Loading graph...</div>
                  }
                >
                  <KnowledgeGraph
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    onNodeClick={handlePageSelect}
                    highlightSlug={selectedSlug}
                    compact
                  />
                </Suspense>
              ) : (
                <div className="wiki-graph-empty">
                  <p>
                    Visualize relationships between your notes. Find hidden
                    patterns in your thinking through a visually engaging and
                    interactive graph.
                  </p>
                </div>
              )}
            </div>
            {graphData && graphData.nodes.length > 0 && (
              <div className="wiki-graph-legend">
                <span style={{ color: "#6ec6ff" }}>concept</span>
                <span style={{ color: "#a5d6a7" }}>entity</span>
                <span style={{ color: "#ffcc80" }}>comparison</span>
                <span style={{ color: "#ce93d8" }}>overview</span>
                <span style={{ color: "#ef9a9a" }}>synthesis</span>
              </div>
            )}
          </div>

          {/* On this page (heading outline) */}
          {selectedSlug && headings.length > 0 && (
            <div className="wiki-toc">
              <span className="wiki-toc-label">ON THIS PAGE</span>
              <nav className="wiki-toc-nav">
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`wiki-toc-item wiki-toc-level-${h.level}`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </aside>

      {/* Fullscreen graph overlay */}
      {graphExpanded && (
        <div
          className="wiki-graph-overlay"
          onClick={() => setGraphExpanded(false)}
        >
          <div
            className="wiki-graph-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wiki-graph-overlay-header">
              <h3>Knowledge graph</h3>
              <button onClick={() => setGraphExpanded(false)}>Close</button>
            </div>
            <div className="wiki-graph-overlay-canvas">
              {graphData && graphData.nodes.length > 0 && (
                <Suspense
                  fallback={
                    <div className="wiki-graph-loading">Loading graph...</div>
                  }
                >
                  <KnowledgeGraph
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    onNodeClick={(slug) => {
                      handlePageSelect(slug);
                      setGraphExpanded(false);
                    }}
                    highlightSlug={selectedSlug}
                    compact={false}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
