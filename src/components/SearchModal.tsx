import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  MagnifyingGlass,
  X,
  FileText,
  Article,
  ArrowRight,
  TextAa,
  Brain,
} from "@phosphor-icons/react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchMode = "keyword" | "semantic";

interface SearchResult {
  _id: string;
  type: "post" | "page";
  slug: string;
  title: string;
  description?: string;
  snippet: string;
  score?: number;
  anchor?: string;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword");
  const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyword search (reactive query)
  const keywordResults = useQuery(
    api.search.search,
    searchMode === "keyword" && searchQuery.trim() ? { query: searchQuery } : "skip"
  );

  // Semantic search action
  const semanticSearchAction = useAction(api.semanticSearch.semanticSearch);

  // Trigger semantic search with debounce
  useEffect(() => {
    if (searchMode !== "semantic" || !searchQuery.trim()) {
      setSemanticResults(null);
      setIsSemanticSearching(false);
      return;
    }

    setIsSemanticSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await semanticSearchAction({ query: searchQuery });
        setSemanticResults(results as SearchResult[]);
      } catch (error) {
        console.error("Semantic search error:", error);
        setSemanticResults([]);
      } finally {
        setIsSemanticSearching(false);
      }
    }, 300); // 300ms debounce for API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMode, semanticSearchAction]);

  // Get current results based on mode
  const results: SearchResult[] | undefined =
    searchMode === "keyword"
      ? (keywordResults as SearchResult[] | undefined)
      : (semanticResults ?? undefined);
  const isLoading =
    searchMode === "keyword"
      ? keywordResults === undefined && searchQuery.trim() !== ""
      : isSemanticSearching;

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery("");
      setSelectedIndex(0);
      setSemanticResults(null);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Tab toggles between search modes
      if (e.key === "Tab") {
        e.preventDefault();
        setSearchMode((prev) => (prev === "keyword" ? "semantic" : "keyword"));
        return;
      }

      // Escape closes modal
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Arrow/Enter only work when there are results
      if (!results || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            const result = results[selectedIndex];
            // Only pass query param for keyword search (highlighting)
            // Semantic search doesn't match exact words
            const url =
              searchMode === "keyword"
                ? `/${result.slug}?q=${encodeURIComponent(searchQuery)}`
                : `/${result.slug}`;
            navigate(url);
            onClose();
          }
          break;
      }
    },
    [results, selectedIndex, navigate, onClose, searchMode, searchQuery]
  );

  // Handle clicking on a result
  const handleResultClick = (slug: string) => {
    // Only pass query param for keyword search (highlighting)
    const url =
      searchMode === "keyword"
        ? `/${slug}?q=${encodeURIComponent(searchQuery)}`
        : `/${slug}`;
    navigate(url);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={handleBackdropClick}>
      <div className="search-modal">
        {/* Search mode toggle */}
        <div className="search-mode-toggle">
          <button
            className={`search-mode-btn ${searchMode === "keyword" ? "active" : ""}`}
            onClick={() => setSearchMode("keyword")}
            title="Keyword search - matches exact words"
          >
            <TextAa size={16} weight="bold" />
            <span>Keyword</span>
          </button>
          <button
            className={`search-mode-btn ${searchMode === "semantic" ? "active" : ""}`}
            onClick={() => setSearchMode("semantic")}
            title="Semantic search - finds similar meaning"
          >
            <Brain size={16} weight="bold" />
            <span>Semantic</span>
          </button>
        </div>

        {/* Search input */}
        <div className="search-modal-input-wrapper">
          <MagnifyingGlass size={20} className="search-modal-icon" weight="bold" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              searchMode === "keyword"
                ? "Search posts and pages..."
                : "Describe what you're looking for..."
            }
            className="search-modal-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button onClick={onClose} className="search-modal-close" aria-label="Close search">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Search results */}
        <div className="search-modal-results">
          {searchQuery.trim() === "" ? (
            <div className="search-modal-hint">
              <p>
                {searchMode === "keyword"
                  ? "Type to search posts and pages"
                  : "Describe what you're looking for"}
              </p>
              <div className="search-modal-shortcuts">
                <span className="search-shortcut">
                  <kbd>Tab</kbd> Switch mode
                </span>
                <span className="search-shortcut">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> Navigate
                </span>
                <span className="search-shortcut">
                  <kbd>↵</kbd> Select
                </span>
                <span className="search-shortcut">
                  <kbd>Esc</kbd> Close
                </span>
              </div>
            </div>
          ) : isLoading ? (
            <div className="search-modal-loading">
              {searchMode === "semantic" ? "Finding similar content..." : "Searching..."}
            </div>
          ) : results && results.length === 0 ? (
            <div className="search-modal-empty">
              No results found for "{searchQuery}"
              {searchMode === "semantic" && (
                <p className="search-modal-empty-hint">
                  Try keyword search for exact matches
                </p>
              )}
            </div>
          ) : results ? (
            <ul className="search-results-list">
              {results.map((result, index) => (
                <li key={result._id}>
                  <button
                    className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
                    onClick={() => handleResultClick(result.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="search-result-icon">
                      {result.type === "post" ? (
                        <Article size={20} weight="regular" />
                      ) : (
                        <FileText size={20} weight="regular" />
                      )}
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-title">{result.title}</div>
                      <div className="search-result-snippet">{result.snippet}</div>
                    </div>
                    <div className="search-result-meta">
                      <span className="search-result-type">
                        {result.type === "post" ? "Post" : "Page"}
                      </span>
                      {searchMode === "semantic" && result.score !== undefined && (
                        <span className="search-result-score">
                          {Math.round(result.score * 100)}%
                        </span>
                      )}
                    </div>
                    <ArrowRight size={16} className="search-result-arrow" weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Footer with keyboard hints */}
        {results && results.length > 0 && (
          <div className="search-modal-footer">
            <span className="search-footer-hint">
              <kbd>Tab</kbd> switch mode
            </span>
            <span className="search-footer-hint">
              <kbd>↵</kbd> select
            </span>
            <span className="search-footer-hint">
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
