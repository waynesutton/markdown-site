import { ReactNode } from "react";
// Re-export types from LogoMarquee for convenience
export type { LogoItem, LogoGalleryConfig } from "../components/LogoMarquee";
import type { LogoGalleryConfig } from "../components/LogoMarquee";

// GitHub contributions graph configuration
// Displays your GitHub activity on the homepage
export interface GitHubContributionsConfig {
  enabled: boolean; // Enable/disable the contributions graph
  username: string; // GitHub username to fetch contributions for
  showYearNavigation: boolean; // Show prev/next year arrows
  linkToProfile: boolean; // Click graph to go to GitHub profile
  title?: string; // Optional title above the graph
}

// Visitor map configuration
// Displays real-time visitor locations on a world map on the stats page
export interface VisitorMapConfig {
  enabled: boolean; // Enable/disable the visitor map
  title?: string; // Optional title above the map
}

// Inner page logo configuration
// Shows the site logo in the header on blog page, individual posts, and pages
// Does not affect the homepage logo (which is controlled separately)
export interface InnerPageLogoConfig {
  enabled: boolean; // Enable/disable logo on inner pages
  size: number; // Logo size in pixels (applied as height)
}

// Blog page configuration
// Controls whether posts appear on homepage, dedicated blog page, or both
export interface BlogPageConfig {
  enabled: boolean; // Enable the /blog route
  showInNav: boolean; // Show "Blog" link in navigation
  title: string; // Page title for the blog page
  description?: string; // Optional description shown on blog page
  order?: number; // Nav order (lower = first, matches page frontmatter order)
  viewMode: "list" | "cards"; // Default view mode (list or cards)
  showViewToggle: boolean; // Show toggle button to switch between views
}

// Homepage posts read more link configuration
// Optional link shown below limited post list on homepage
export interface HomePostsReadMoreConfig {
  enabled: boolean; // Show "read more" link when posts are limited
  text: string; // Link text (e.g., "Read more blog posts")
  link: string; // URL to link to (e.g., "/blog")
}

// Posts display configuration
// Controls where the post list appears
export interface PostsDisplayConfig {
  showOnHome: boolean; // Show post list on homepage
  showOnBlogPage: boolean; // Show post list on /blog page (requires blogPage.enabled)
  homePostsLimit?: number; // Limit number of posts shown on homepage (undefined = show all)
  homePostsReadMore?: HomePostsReadMoreConfig; // Optional "read more" link configuration
}

// Hardcoded navigation item configuration
// For React route pages (like /stats, /write) that aren't markdown pages
export interface HardcodedNavItem {
  slug: string; // URL path (e.g., "stats", "write")
  title: string; // Display name in navigation
  order?: number; // Nav order (lower = first, matches page frontmatter order)
  showInNav?: boolean; // Show in navigation menu (default: true)
}

// GitHub repository configuration
// Used for "Open in AI" links that use GitHub raw URLs
export interface GitHubRepoConfig {
  owner: string; // GitHub username or organization
  repo: string; // Repository name
  branch: string; // Default branch (e.g., "main")
  contentPath: string; // Path to raw markdown files (e.g., "public/raw")
}

// Font family configuration
// Controls the default font family for the entire site
// default font family options: "serif" (New York), "sans" (system fonts), "monospace" (IBM Plex Mono)
export type FontFamily = "serif" | "sans" | "monospace";

// Right sidebar configuration
// Shows CopyPageDropdown in a right sidebar on posts/pages at 1135px+ viewport width
export interface RightSidebarConfig {
  enabled: boolean; // Enable/disable the right sidebar globally
  minWidth?: number; // Minimum viewport width to show sidebar (default: 1135)
}

// Footer configuration
// Footer content can be set in frontmatter (footer field) or use defaultContent here
// Footer can be enabled/disabled globally and per-page via frontmatter showFooter field
export interface FooterConfig {
  enabled: boolean; // Global toggle for footer
  showOnHomepage: boolean; // Show footer on homepage
  showOnPosts: boolean; // Default: show footer on blog posts
  showOnPages: boolean; // Default: show footer on static pages
  showOnBlogPage: boolean; // Show footer on /blog page
  defaultContent?: string; // Default markdown content if no frontmatter footer field provided
}

// Homepage configuration
// Allows setting any page or blog post to serve as the homepage
export interface HomepageConfig {
  type: "default" | "page" | "post"; // Type of homepage: default (standard Home component), page (static page), or post (blog post)
  slug?: string; // Required if type is "page" or "post" - the slug of the page/post to use as homepage
  originalHomeRoute?: string; // Route to access the original homepage when custom homepage is set (default: "/home")
}

// AI Chat configuration
// Controls the AI writing assistant feature on Write page and content pages
export interface AIChatConfig {
  enabledOnWritePage: boolean; // Show AI chat toggle on /write page
  enabledOnContent: boolean; // Allow AI chat on posts/pages via frontmatter aiChat: true
}

// Newsletter signup placement configuration
// Controls where signup forms appear on the site
export interface NewsletterSignupPlacement {
  enabled: boolean; // Show signup form at this location
  position: "above-footer" | "below-intro" | "below-content" | "below-posts";
  title: string; // Form heading
  description: string; // Form description text
}

// Newsletter configuration (email-only signup)
// Integrates with AgentMail for email collection and sending
// Inbox configured via AGENTMAIL_INBOX environment variable in Convex dashboard
export interface NewsletterConfig {
  enabled: boolean; // Master switch for newsletter feature

  // Signup form placements
  signup: {
    home: NewsletterSignupPlacement; // Homepage signup
    blogPage: NewsletterSignupPlacement; // Blog page (/blog) signup
    posts: NewsletterSignupPlacement; // Individual blog posts (can override via frontmatter)
  };
}

// Contact form configuration
// Enables contact forms on pages/posts via frontmatter contactForm: true
// Recipient email configured via AGENTMAIL_CONTACT_EMAIL env var (falls back to AGENTMAIL_INBOX)
export interface ContactFormConfig {
  enabled: boolean; // Global toggle for contact form feature
  title: string; // Default form title
  description: string; // Default form description
}

// Newsletter admin configuration
// Provides admin UI for managing subscribers and sending newsletters
// Access at /newsletter-admin route
export interface NewsletterAdminConfig {
  enabled: boolean; // Global toggle for admin UI
  showInNav: boolean; // Show link in navigation (hidden by default for security)
}

// Newsletter notifications configuration
// Sends developer notifications for subscriber events
// Uses AGENTMAIL_CONTACT_EMAIL or AGENTMAIL_INBOX as recipient
export interface NewsletterNotificationsConfig {
  enabled: boolean; // Global toggle for notifications
  newSubscriberAlert: boolean; // Send email when new subscriber signs up
  weeklyStatsSummary: boolean; // Send weekly stats summary email
}

// Weekly digest configuration
// Automated weekly email with posts from the past 7 days
export interface WeeklyDigestConfig {
  enabled: boolean; // Global toggle for weekly digest
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  subject: string; // Email subject template
}

// MCP Server configuration
// HTTP-based Model Context Protocol server for AI tool integration
// Runs on Netlify Edge Functions at /mcp endpoint
export interface MCPServerConfig {
  enabled: boolean; // Global toggle for MCP server
  endpoint: string; // Endpoint path (default: "/mcp")
  publicRateLimit: number; // Requests per minute for public access
  authenticatedRateLimit: number; // Requests per minute with API key
  requireAuth: boolean; // Require API key for all requests
}

// Social link configuration for social footer
export interface SocialLink {
  platform:
    | "github"
    | "twitter"
    | "linkedin"
    | "instagram"
    | "youtube"
    | "tiktok"
    | "discord"
    | "website";
  url: string; // Full URL (e.g., "https://github.com/username")
}

// Social footer configuration
// Displays social icons on left and copyright on right
// Appears below the main footer on homepage, blog posts, and pages
export interface SocialFooterConfig {
  enabled: boolean; // Global toggle for social footer
  showOnHomepage: boolean; // Show social footer on homepage
  showOnPosts: boolean; // Default: show social footer on blog posts
  showOnPages: boolean; // Default: show social footer on static pages
  showOnBlogPage: boolean; // Show social footer on /blog page
  socialLinks: SocialLink[]; // Array of social links to display
  copyright: {
    siteName: string; // Site name or company name displayed in copyright
    showYear: boolean; // Show auto-updating year (default: true)
  };
}

// Site configuration interface
export interface SiteConfig {
  // Basic site info
  name: string;
  title: string;
  logo: string | null;
  intro: ReactNode;
  bio: string;

  // Font family configuration
  fontFamily: FontFamily;

  // Featured section configuration
  featuredViewMode: "cards" | "list";
  featuredTitle: string; // Featured section title (e.g., "Get started:", "Featured", "Popular")
  showViewToggle: boolean;

  // Logo gallery configuration
  logoGallery: LogoGalleryConfig;

  // GitHub contributions graph configuration
  gitHubContributions: GitHubContributionsConfig;

  // Visitor map configuration (stats page)
  visitorMap: VisitorMapConfig;

  // Inner page logo configuration (blog page, posts, pages)
  innerPageLogo: InnerPageLogoConfig;

  // Blog page configuration
  blogPage: BlogPageConfig;

  // Hardcoded navigation items for React routes (like /stats, /write)
  hardcodedNavItems: HardcodedNavItem[];

  // Posts display configuration
  postsDisplay: PostsDisplayConfig;

  // Links for footer section
  links: {
    docs: string;
    convex: string;
    netlify: string;
  };

  // GitHub repository configuration for AI service links
  gitHubRepo: GitHubRepoConfig;

  // Right sidebar configuration
  rightSidebar: RightSidebarConfig;

  // Footer configuration
  footer: FooterConfig;

  // Homepage configuration
  homepage: HomepageConfig;

  // AI Chat configuration
  aiChat: AIChatConfig;

  // Newsletter configuration (optional)
  newsletter?: NewsletterConfig;

  // Contact form configuration (optional)
  contactForm?: ContactFormConfig;

  // Social footer configuration (optional)
  socialFooter?: SocialFooterConfig;

  // Newsletter admin configuration (optional)
  newsletterAdmin?: NewsletterAdminConfig;

  // Newsletter notifications configuration (optional)
  newsletterNotifications?: NewsletterNotificationsConfig;

  // Weekly digest configuration (optional)
  weeklyDigest?: WeeklyDigestConfig;

  // MCP Server configuration (optional)
  mcpServer?: MCPServerConfig;
}

// Default site configuration
// Customize this for your site
export const siteConfig: SiteConfig = {
  // Basic site info
  name: 'markdown "sync" framework',
  title: "markdown sync framework",
  // Optional logo/header image (place in public/images/, set to null to hide)
  logo: "/images/logo.svg",
  intro: null, // Set in Home.tsx to allow JSX with links
  bio: `Your content is instantly available to browsers, LLMs, and AI agents.`,

  // Font family configuration
  // Options: "serif" (New York), "sans" (system fonts), "monospace" (IBM Plex Mono)
  fontFamily: "sans",

  // Featured section configuration
  // viewMode: 'list' shows bullet list, 'cards' shows card grid with excerpts
  featuredViewMode: "cards",
  // Featured section title (e.g., "Get started:", "Featured", "Popular")
  featuredTitle: "Get started:",
  // Allow users to toggle between list and card views
  showViewToggle: true,

  // Logo gallery configuration
  // Set enabled to false to hide, or remove/replace sample images with your own
  // scrolling: true = infinite scroll marquee, false = static centered grid
  // maxItems: only used when scrolling is false (default: 4)
  logoGallery: {
    enabled: true,
    images: [
      {
        src: "/images/logos/convex-wordmark-black.svg",
        href: "/about#the-real-time-twist",
      },
      {
        src: "/images/logos/netlify.svg",
        href: "https://www.netlify.com/utm_source=markdownfast",
      },
      {
        src: "/images/logos/firecrawl.svg",
        href: "https://www.markdown.fast/how-to-use-firecrawl",
      },
      {
        src: "/images/logos/markdown.svg",
        href: "https://markdown.fast/docs",
      },
      {
        src: "/images/logos/react.svg",
        href: "https://markdown.fast/setup-guide",
      },
      {
        src: "/images/logos/agentmail.svg",
        href: "https://www.markdown.fast/how-to-use-agentmail/",
      },
      {
        src: "/images/logos/mcp.svg",
        href: "https://www.markdown.fast/how-to-use-mcp-server/",
      },
    ],
    position: "above-footer",
    speed: 30,
    title: "Built with",
    scrolling: false, // Set to false for static grid showing first maxItems logos
    maxItems: 4, // Number of logos to show when scrolling is false
  },

  // GitHub contributions graph configuration
  // Set enabled to false to hide, or change username to your GitHub username
  gitHubContributions: {
    enabled: true, // Set to false to hide the contributions graph
    username: "waynesutton", // Your GitHub username
    showYearNavigation: true, // Show arrows to navigate between years
    linkToProfile: true, // Click graph to open GitHub profile
    title: "GitHub Activity", // Optional title above the graph
  },

  // Visitor map configuration
  // Displays real-time visitor locations on the stats page
  visitorMap: {
    enabled: true, // Set to false to hide the visitor map
    title: "Live Visitors", // Optional title above the map
  },

  // Inner page logo configuration
  // Shows logo on blog page, individual posts, and static pages
  // Desktop: top left corner, Mobile: top right corner (small)
  innerPageLogo: {
    enabled: true, // Set to false to hide logo on inner pages
    size: 28, // Logo height in pixels (keeps aspect ratio)
  },

  // Blog page configuration
  // Set enabled to true to create a dedicated /blog page
  blogPage: {
    enabled: true, // Enable the /blog route
    showInNav: true, // Show "Blog" link in navigation
    title: "Blog", // Page title
    description: "All posts from the blog, sorted by date.", // Optional description
    order: 2, // Nav order (lower = first, e.g., 0 = first, 5 = after pages with order 0-4)
    viewMode: "cards", // Default view mode: "list" or "cards"
    showViewToggle: true, // Show toggle button to switch between list and card views
  },

  // Hardcoded navigation items for React routes
  // Add React route pages (like /stats, /write) that should appear in navigation
  // Set showInNav: false to hide from nav while keeping the route accessible
  hardcodedNavItems: [
    {
      slug: "stats",
      title: "Stats",
      order: 10,
      showInNav: true,
    },
    {
      slug: "write",
      title: "Write",
      order: 20,
      showInNav: true,
    },
  ],

  // Posts display configuration
  // Controls where the post list appears
  // Both can be true to show posts on homepage AND blog page
  // Set showOnHome to false to only show posts on /blog page
  postsDisplay: {
    showOnHome: true, // Show post list on homepage
    showOnBlogPage: true, // Show post list on /blog page
    homePostsLimit: 5, // Limit number of posts on homepage (undefined = show all)
    homePostsReadMore: {
      enabled: true, // Show "read more" link when posts are limited
      text: "Read more blog posts", // Customizable link text
      link: "/blog", // URL to link to (usually "/blog")
    },
  },

  // Links for footer section
  links: {
    docs: "/setup-guide",
    convex: "https://convex.dev",
    netlify: "https://netlify.com",
  },

  // GitHub repository configuration
  // Used for "Open in AI" links (ChatGPT, Claude, Perplexity)
  // These links use GitHub raw URLs since AI services can reliably fetch from GitHub
  // Note: Content must be pushed to GitHub for AI links to work
  gitHubRepo: {
    owner: "waynesutton", // GitHub username or organization
    repo: "markdown-site", // Repository name
    branch: "main", // Default branch
    contentPath: "public/raw", // Path to raw markdown files
  },

  // Right sidebar configuration
  // Shows CopyPageDropdown in a right sidebar on posts/pages at 1135px+ viewport width
  // When enabled, CopyPageDropdown moves from nav to right sidebar on wide screens
  rightSidebar: {
    enabled: true, // Set to false to disable right sidebar globally
    minWidth: 1135, // Minimum viewport width in pixels to show sidebar
  },

  // Footer configuration
  // Footer content can be set in frontmatter (footer field) or use defaultContent here
  // Use showFooter: false in frontmatter to hide footer on specific posts/pages
  footer: {
    enabled: true, // Global toggle for footer
    showOnHomepage: true, // Show footer on homepage
    showOnPosts: true, // Default: show footer on blog posts (override with frontmatter)
    showOnPages: true, // Default: show footer on static pages (override with frontmatter)
    showOnBlogPage: true, // Show footer on /blog page
    // Default footer markdown (used when frontmatter footer field is not provided)
    defaultContent: `Built with [Convex](https://convex.dev) for real-time sync and deployed on [Netlify](https://netlify.com). Read the [project on GitHub](https://github.com/waynesutton/markdown-site) to fork and deploy your own. View [real-time site stats](/stats).

Created by [Wayne](https://x.com/waynesutton) with Convex, Cursor, and Claude Opus 4.5. Follow on [Twitter/X](https://x.com/waynesutton), [LinkedIn](https://www.linkedin.com/in/waynesutton/), and [GitHub](https://github.com/waynesutton). This project is licensed under the MIT [License](https://github.com/waynesutton/markdown-site?tab=MIT-1-ov-file).`,
  },

  // Homepage configuration
  // Set any page or blog post to serve as the homepage
  // Custom homepage uses the page/post's full content and features (sidebar, copy dropdown, etc.)
  // Featured section is NOT shown on custom homepage (only on default Home component)
  homepage: {
    type: "default", // Options: "default" (standard Home component), "page" (use a static page), or "post" (use a blog post)
    slug: "undefined", // Required if type is "page" or "post" - the slug of the page/post to use default is undefined
    originalHomeRoute: "/home", // Route to access the original homepage when custom homepage is set
  },

  // AI Chat configuration
  // Controls the AI writing assistant powered by Claude
  // Requires ANTHROPIC_API_KEY environment variable in Convex dashboard
  aiChat: {
    enabledOnWritePage: true, // Show AI chat toggle on /write page
    enabledOnContent: true, // Allow AI chat on posts/pages via frontmatter aiChat: true
  },

  // Newsletter configuration (email-only signup)
  // Set enabled: true and configure AgentMail to activate
  // Requires AGENTMAIL_API_KEY and AGENTMAIL_INBOX environment variables in Convex dashboard
  newsletter: {
    enabled: true, // Set to true to enable newsletter signup forms
    signup: {
      home: {
        enabled: true,
        position: "above-footer",
        title: "Stay Updated",
        description: "Get new posts delivered to your inbox.",
      },
      blogPage: {
        enabled: true,
        position: "above-footer",
        title: "Subscribe",
        description: "Get notified when new posts are published.",
      },
      posts: {
        enabled: true,
        position: "below-content",
        title: "Enjoyed this post?",
        description: "Subscribe for more updates.",
      },
    },
  },

  // Contact form configuration
  // Enable via frontmatter contactForm: true on any page or post
  // Requires AGENTMAIL_API_KEY and AGENTMAIL_INBOX in Convex dashboard
  // Optionally set AGENTMAIL_CONTACT_EMAIL to override recipient (defaults to AGENTMAIL_INBOX)
  contactForm: {
    enabled: true, // Global toggle for contact form feature
    title: "Get in Touch",
    description: "Send us a message and we'll get back to you.",
  },

  // Social footer configuration
  // Displays social icons on left and copyright on right
  // Can work with or without the main footer
  // Use showSocialFooter: false in frontmatter to hide on specific posts/pages
  socialFooter: {
    enabled: true, // Global toggle for social footer
    showOnHomepage: true, // Show social footer on homepage
    showOnPosts: true, // Default: show social footer on blog posts
    showOnPages: true, // Default: show social footer on static pages
    showOnBlogPage: true, // Show social footer on /blog page
    socialLinks: [
      {
        platform: "github",
        url: "https://github.com/waynesutton/markdown-site",
      },
      { platform: "twitter", url: "https://x.com/waynesutton" },
      { platform: "linkedin", url: "https://www.linkedin.com/in/waynesutton/" },
    ],
    copyright: {
      siteName: "MarkDown Sync is open-source", // Update with your site/company name
      showYear: true, // Auto-updates to current year
    },
  },

  // Newsletter admin configuration
  // Admin UI for managing subscribers and sending newsletters at /newsletter-admin
  // Hidden from nav by default (no auth - security through obscurity)
  newsletterAdmin: {
    enabled: false, // Global toggle for admin UI
    showInNav: false, // Hide from navigation for security
  },

  // Newsletter notifications configuration
  // Sends developer notifications for subscriber events via AgentMail
  newsletterNotifications: {
    enabled: true, // Global toggle for notifications
    newSubscriberAlert: true, // Send email when new subscriber signs up
    weeklyStatsSummary: true, // Send weekly stats summary email
  },

  // Weekly digest configuration
  // Automated weekly email with posts from the past 7 days
  weeklyDigest: {
    enabled: true, // Global toggle for weekly digest
    dayOfWeek: 0, // Sunday
    subject: "Weekly Digest", // Email subject prefix
  },

  // MCP Server configuration
  // HTTP-based Model Context Protocol server for AI tool integration
  // Runs on Netlify Edge Functions at /mcp endpoint
  // Set MCP_API_KEY in Netlify env vars for authenticated access
  mcpServer: {
    enabled: true, // Global toggle for MCP server
    endpoint: "/mcp", // Endpoint path
    publicRateLimit: 50, // Requests per minute for public access (Netlify rate limiting)
    authenticatedRateLimit: 1000, // Requests per minute with API key
    requireAuth: false, // Set to true to require API key for all requests
  },
};

// Export the config as default for easy importing
export default siteConfig;
