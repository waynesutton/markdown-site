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

// Posts display configuration
// Controls where the post list appears
export interface PostsDisplayConfig {
  showOnHome: boolean; // Show post list on homepage
  showOnBlogPage: boolean; // Show post list on /blog page (requires blogPage.enabled)
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

// Site configuration interface
export interface SiteConfig {
  // Basic site info
  name: string;
  title: string;
  logo: string | null;
  intro: ReactNode;
  bio: string;

  // Featured section configuration
  featuredViewMode: "cards" | "list";
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

  // Featured section configuration
  // viewMode: 'list' shows bullet list, 'cards' shows card grid with excerpts
  featuredViewMode: "cards",
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
        href: "https://www.netlify.com/",
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
        src: "/images/logos/sample-logo-5.svg",
        href: "https://markdown.fast/setup-guide",
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
    viewMode: "list", // Default view mode: "list" or "cards"
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
};

// Export the config as default for easy importing
export default siteConfig;
