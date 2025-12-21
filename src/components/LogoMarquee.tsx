// Logo marquee component with infinite CSS scroll animation
// Inspired by rasmic.xyz company logos section

// Logo item can be a simple path string or an object with src and link
export interface LogoItem {
  src: string; // Image path from /public/images/logos/
  href?: string; // Optional link URL
}

export interface LogoGalleryConfig {
  enabled: boolean;
  images: (string | LogoItem)[]; // Array of image paths or logo objects
  position: "above-footer" | "below-featured";
  speed: number; // Seconds for one complete scroll cycle
  title?: string; // Optional title above the marquee
  scrolling?: boolean; // When false, shows static grid instead of scrolling marquee
  maxItems?: number; // Max items to show in static mode (default: 4)
}

interface LogoMarqueeProps {
  config: LogoGalleryConfig;
}

// Normalize image to LogoItem format
function normalizeImage(image: string | LogoItem): LogoItem {
  if (typeof image === "string") {
    return { src: image };
  }
  return image;
}

export default function LogoMarquee({ config }: LogoMarqueeProps) {
  // Don't render if disabled or no images
  if (!config.enabled || config.images.length === 0) {
    return null;
  }

  // Normalize images
  const normalizedImages = config.images.map(normalizeImage);
  
  // Check if scrolling mode (default true for backwards compatibility)
  const isScrolling = config.scrolling !== false;
  
  // For static mode, limit to maxItems (default 4)
  const maxItems = config.maxItems ?? 4;
  const displayImages = isScrolling 
    ? [...normalizedImages, ...normalizedImages] // Duplicate for seamless scroll
    : normalizedImages.slice(0, maxItems); // Limit for static grid

  // Render logo item (shared between modes)
  const renderLogo = (logo: LogoItem, index: number) => (
    <div key={`${logo.src}-${index}`} className={isScrolling ? "logo-marquee-item" : "logo-static-item"}>
      {logo.href ? (
        <a
          href={logo.href}
          target={logo.href.startsWith("http") ? "_blank" : undefined}
          rel={logo.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="logo-marquee-link"
        >
          <img
            src={logo.src}
            alt=""
            className="logo-marquee-image"
            loading="lazy"
          />
        </a>
      ) : (
        <img
          src={logo.src}
          alt=""
          className="logo-marquee-image"
          loading="lazy"
        />
      )}
    </div>
  );

  return (
    <div className="logo-marquee-container">
      {config.title && (
        <p className="logo-marquee-title">{config.title}</p>
      )}
      {isScrolling ? (
        // Scrolling marquee mode
        <div
          className="logo-marquee"
          style={
            {
              "--marquee-speed": `${config.speed}s`,
            } as React.CSSProperties
          }
        >
          <div className="logo-marquee-track">
            {displayImages.map(renderLogo)}
          </div>
        </div>
      ) : (
        // Static grid mode
        <div className="logo-static-grid">
          {displayImages.map(renderLogo)}
        </div>
      )}
    </div>
  );
}
