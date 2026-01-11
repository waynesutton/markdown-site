import { useState } from "react";
import { PatchDiff } from "@pierre/diffs/react";
import { Copy, Check, Columns2, AlignJustify } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Map app themes to @pierre/diffs themeType
const THEME_MAP: Record<string, "dark" | "light"> = {
  dark: "dark",
  light: "light",
  tan: "light",
  cloud: "light",
};

// Check if content is a valid unified diff format
// Valid diffs have headers like "diff --git", "---", "+++", or "@@"
function isValidDiff(code: string): boolean {
  const lines = code.trim().split("\n");
  // Check for common diff indicators
  const hasDiffHeader = lines.some(
    (line) =>
      line.startsWith("diff ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("@@ ")
  );
  return hasDiffHeader;
}

interface DiffCodeBlockProps {
  code: string;
  language: "diff" | "patch";
}

export default function DiffCodeBlock({ code, language }: DiffCodeBlockProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"split" | "unified">("unified");
  const [copied, setCopied] = useState(false);

  // Get theme type for @pierre/diffs
  const themeType = THEME_MAP[theme] || "dark";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If not a valid diff format, render as simple code block with diff styling
  if (!isValidDiff(code)) {
    return (
      <div className="code-block-wrapper">
        <span className="code-language">{language}</span>
        <button
          className="code-copy-button"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <pre className="diff-fallback">
          <code>
            {code.split("\n").map((line, i) => {
              let className = "";
              if (line.startsWith("+")) className = "diff-added";
              else if (line.startsWith("-")) className = "diff-removed";
              return (
                <span key={i} className={className}>
                  {line}
                  {"\n"}
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="diff-block-wrapper" data-theme-type={themeType}>
      <div className="diff-block-header">
        <span className="diff-language">{language}</span>
        <div className="diff-block-controls">
          <button
            className="diff-view-toggle"
            onClick={() =>
              setViewMode(viewMode === "split" ? "unified" : "split")
            }
            title={
              viewMode === "split"
                ? "Switch to unified view"
                : "Switch to split view"
            }
          >
            {viewMode === "split" ? (
              <AlignJustify size={14} />
            ) : (
              <Columns2 size={14} />
            )}
          </button>
          <button
            className="diff-copy-button"
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy code"}
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <PatchDiff
        patch={code}
        options={{
          themeType,
          diffStyle: viewMode,
        }}
      />
    </div>
  );
}
