import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const slideSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "details", "summary", "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    details: ["open"],
    ul: ["style"],
    ol: ["style"],
    li: ["style"],
    div: ["style"],
    p: ["style"],
    a: ["style", "href", "target", "rel"],
    img: [...(defaultSchema.attributes?.img || []), "style"],
    span: ["className", "class", "style"],
  },
};

/**
 * Split markdown content into slides on standalone `---` lines,
 * skipping `---` that appear inside fenced code blocks.
 */
function splitIntoSlides(content: string): string[] {
  const lines = content.split("\n");
  const slides: string[] = [];
  let currentSlide: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      currentSlide.push(line);
      continue;
    }

    if (!inCodeBlock && /^---+\s*$/.test(line.trim())) {
      const slideContent = currentSlide.join("\n").trim();
      if (slideContent.length > 0) {
        slides.push(slideContent);
      }
      currentSlide = [];
    } else {
      currentSlide.push(line);
    }
  }

  const lastSlide = currentSlide.join("\n").trim();
  if (lastSlide.length > 0) {
    slides.push(lastSlide);
  }

  return slides;
}

interface SlidePresentationProps {
  content: string;
  title: string;
  onClose: () => void;
}

export default function SlidePresentation({
  content,
  title: _title,
  onClose,
}: SlidePresentationProps) {
  const slides = splitIntoSlides(content);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Home":
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose, slides.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, code, pre, input, textarea, select")) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else if (x > (rect.width * 2) / 3) {
      goNext();
    }
  };

  const progressPercent =
    slides.length > 1
      ? ((currentSlide + 1) / slides.length) * 100
      : 100;

  return createPortal(
    <div
      className="slide-overlay"
      ref={containerRef}
      onClick={handleClick}
    >
      {/* Thin progress bar at very top */}
      <div className="slide-progress">
        <div
          className="slide-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="slide-viewport">
        <div className="slide-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, slideSanitizeSchema]]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: "8px",
                        fontSize: "0.85em",
                        margin: "1em 0",
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              img({ src, alt, ...props }) {
                return (
                  <img
                    src={src}
                    alt={alt || ""}
                    style={{ maxHeight: "60vh", objectFit: "contain" }}
                    {...props}
                  />
                );
              },
            }}
          >
            {slides[currentSlide]}
          </ReactMarkdown>
        </div>
      </div>

      {/* Subtle counter, fades in on hover */}
      <div className="slide-counter-float">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>,
    document.body,
  );
}
