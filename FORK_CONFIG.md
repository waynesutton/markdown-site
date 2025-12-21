# Fork Configuration Guide

After forking this repo, update these files with your site information. Choose one of two options:

---

## Option 1: Automated Script (Recommended)

Run a single command to configure all files automatically.

### Step 1: Create your config file

```bash
cp fork-config.json.example fork-config.json
```

The file `fork-config.json` is gitignored, so your configuration stays local and is not committed. The `.example` file remains as a template.

### Step 2: Edit fork-config.json

```json
{
  "siteName": "Your Site Name",
  "siteTitle": "Your Tagline",
  "siteDescription": "A one-sentence description of your site.",
  "siteUrl": "https://yoursite.netlify.app",
  "siteDomain": "yoursite.netlify.app",
  "githubUsername": "yourusername",
  "githubRepo": "your-repo-name",
  "contactEmail": "you@example.com",
  "creator": {
    "name": "Your Name",
    "twitter": "https://x.com/yourhandle",
    "linkedin": "https://www.linkedin.com/in/yourprofile/",
    "github": "https://github.com/yourusername"
  },
  "bio": "Your bio text here.",
  "theme": "tan"
}
```

### Step 3: Run the configuration script

```bash
npm run configure
```

This updates all 11 configuration files automatically:

- `src/config/siteConfig.ts`
- `src/pages/Home.tsx`
- `src/pages/Post.tsx`
- `convex/http.ts`
- `convex/rss.ts`
- `index.html`
- `public/llms.txt`
- `public/robots.txt`
- `public/openapi.yaml`
- `public/.well-known/ai-plugin.json`
- `src/context/ThemeContext.tsx`

### Step 4: Review and deploy

```bash
git diff                    # Review changes
npx convex dev              # Start Convex (if not running)
npm run sync                # Sync content
npm run dev                 # Test locally
```

---

## Option 2: Manual Configuration

Edit each file individually following the guide below.

### Files to Update

| File                                | What to Update                               |
| ----------------------------------- | -------------------------------------------- |
| `src/config/siteConfig.ts`          | Site name, bio, GitHub username, features    |
| `src/pages/Home.tsx`                | Intro paragraph, footer links                |
| `src/pages/Post.tsx`                | `SITE_URL`, `SITE_NAME` constants            |
| `convex/http.ts`                    | `SITE_URL`, `SITE_NAME` constants            |
| `convex/rss.ts`                     | `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` |
| `index.html`                        | Meta tags, JSON-LD, page title               |
| `public/llms.txt`                   | Site info, GitHub link                       |
| `public/robots.txt`                 | Sitemap URL                                  |
| `public/openapi.yaml`               | Server URL, site name                        |
| `public/.well-known/ai-plugin.json` | Plugin metadata                              |
| `src/context/ThemeContext.tsx`      | Default theme                                |

---

## Manual Configuration Details

### 1. src/config/siteConfig.ts

Update the main site configuration:

```typescript
export const siteConfig: SiteConfig = {
  name: "YOUR SITE NAME",
  title: "YOUR TAGLINE",
  logo: "/images/logo.svg", // or null to hide
  intro: null,
  bio: `YOUR BIO TEXT HERE.`,

  // Featured section
  featuredViewMode: "cards", // 'list' or 'cards'
  showViewToggle: true,

  // Logo gallery (set enabled: false to hide)
  logoGallery: {
    enabled: true,
    images: [
      { src: "/images/logos/your-logo.svg", href: "https://example.com" },
    ],
    position: "above-footer",
    speed: 30,
    title: "Built with",
    scrolling: false,
    maxItems: 4,
  },

  // GitHub contributions graph
  gitHubContributions: {
    enabled: true,
    username: "YOURUSERNAME",
    showYearNavigation: true,
    linkToProfile: true,
    title: "GitHub Activity",
  },

  // Blog page
  blogPage: {
    enabled: true,
    showInNav: true,
    title: "Blog",
    description: "All posts from the blog, sorted by date.",
    order: 2,
  },

  // Posts display
  postsDisplay: {
    showOnHome: true,
    showOnBlogPage: true,
  },

  links: {
    docs: "/setup-guide",
    convex: "https://convex.dev",
    netlify: "https://netlify.com",
  },
};
```

### 2. src/pages/Home.tsx

Update the intro paragraph (lines 96-108):

```tsx
<p className="home-intro">
  YOUR SITE DESCRIPTION HERE.{" "}
  <a
    href="https://github.com/YOURUSERNAME/YOUR-REPO"
    target="_blank"
    rel="noopener noreferrer"
    className="home-text-link"
  >
    Fork it
  </a>
  , customize it, ship it.
</p>
```

Update the footer section (lines 203-271):

```tsx
<section className="home-footer">
  <p className="home-footer-text">
    Built with{" "}
    <a href={siteConfig.links.convex} target="_blank" rel="noopener noreferrer">
      Convex
    </a>{" "}
    for real-time sync and deployed on{" "}
    <a
      href={siteConfig.links.netlify}
      target="_blank"
      rel="noopener noreferrer"
    >
      Netlify
    </a>
    . Read the{" "}
    <a
      href="https://github.com/YOURUSERNAME/YOUR-REPO"
      target="_blank"
      rel="noopener noreferrer"
    >
      project on GitHub
    </a>{" "}
    to fork and deploy your own. View{" "}
    <a href="/stats" className="home-text-link">
      real-time site stats
    </a>
    .
  </p>
  <p></p>
  <br></br>
  <p className="home-footer-text">
    Created by{" "}
    <a
      href="https://x.com/YOURHANDLE"
      target="_blank"
      rel="noopener noreferrer"
    >
      YOUR NAME
    </a>{" "}
    with Convex, Cursor, and Claude. Follow on{" "}
    <a
      href="https://x.com/YOURHANDLE"
      target="_blank"
      rel="noopener noreferrer"
    >
      Twitter/X
    </a>
    ,{" "}
    <a
      href="https://www.linkedin.com/in/YOURPROFILE/"
      target="_blank"
      rel="noopener noreferrer"
    >
      LinkedIn
    </a>
    , and{" "}
    <a
      href="https://github.com/YOURUSERNAME"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>
    .
  </p>
</section>
```

### 3. src/pages/Post.tsx

Update the site constants (lines 11-13):

```typescript
const SITE_URL = "https://YOURSITE.netlify.app";
const SITE_NAME = "YOUR SITE NAME";
const DEFAULT_OG_IMAGE = "/images/og-default.svg";
```

### 4. convex/http.ts

Update the site configuration (lines 9-10):

```typescript
const SITE_URL = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const SITE_NAME = "YOUR SITE NAME";
```

Also update the `generateMetaHtml` function (lines 233-234):

```typescript
const siteUrl = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const siteName = "YOUR SITE NAME";
```

### 5. convex/rss.ts

Update the RSS configuration (lines 5-8):

```typescript
const SITE_URL = process.env.SITE_URL || "https://YOURSITE.netlify.app";
const SITE_TITLE = "YOUR SITE NAME";
const SITE_DESCRIPTION = "YOUR SITE DESCRIPTION HERE.";
```

### 6. index.html

Update all meta tags and JSON-LD structured data:

```html
<!-- SEO Meta Tags -->
<meta name="description" content="YOUR SITE DESCRIPTION" />
<meta name="author" content="YOUR SITE NAME" />

<!-- Open Graph -->
<meta property="og:title" content="YOUR SITE NAME" />
<meta property="og:description" content="YOUR SITE DESCRIPTION" />
<meta property="og:url" content="https://YOURSITE.netlify.app/" />
<meta property="og:site_name" content="YOUR SITE NAME" />
<meta
  property="og:image"
  content="https://YOURSITE.netlify.app/images/og-default.svg"
/>

<!-- Twitter Card -->
<meta property="twitter:domain" content="YOURSITE.netlify.app" />
<meta property="twitter:url" content="https://YOURSITE.netlify.app/" />
<meta name="twitter:title" content="YOUR SITE NAME" />
<meta name="twitter:description" content="YOUR SITE DESCRIPTION" />
<meta
  name="twitter:image"
  content="https://YOURSITE.netlify.app/images/og-default.svg"
/>

<!-- JSON-LD -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "YOUR SITE NAME",
    "url": "https://YOURSITE.netlify.app",
    "description": "YOUR SITE DESCRIPTION"
  }
</script>

<title>YOUR SITE TITLE</title>
```

### 7. public/llms.txt

Update site information:

```
# Site Information
- Name: YOUR SITE NAME
- URL: https://YOURSITE.netlify.app
- Description: YOUR SITE DESCRIPTION

# Links
- GitHub: https://github.com/YOURUSERNAME/YOUR-REPO
```

### 8. public/robots.txt

Update the header and sitemap URL:

```
# robots.txt for YOUR SITE NAME

Sitemap: https://YOURSITE.netlify.app/sitemap.xml
```

### 9. public/openapi.yaml

Update API title and server URL:

```yaml
info:
  title: YOUR SITE NAME API
  contact:
    url: https://github.com/YOURUSERNAME/YOUR-REPO

servers:
  - url: https://YOURSITE.netlify.app
```

### 10. public/.well-known/ai-plugin.json

Update plugin metadata:

```json
{
  "name_for_human": "YOUR SITE NAME",
  "name_for_model": "your_site_name",
  "description_for_human": "YOUR SITE DESCRIPTION",
  "contact_email": "you@example.com"
}
```

### 11. src/context/ThemeContext.tsx

Change the default theme (line 21):

```typescript
const DEFAULT_THEME: Theme = "tan"; // Options: dark, light, tan, cloud
```

---

## AI Agent Prompt

Copy this prompt to have an AI agent apply all changes:

```
I just forked the markdown-site repo. Please update all configuration files with my site information:

Site Name: [YOUR SITE NAME]
Site Title/Tagline: [YOUR TAGLINE]
Site Description: [YOUR DESCRIPTION]
Site URL: https://[YOURSITE].netlify.app
GitHub Username: [YOURUSERNAME]
GitHub Repo: [YOUR-REPO]
Contact Email: [your@email.com]

Creator Info:
- Name: [YOUR NAME]
- Twitter: https://x.com/[YOURHANDLE]
- LinkedIn: https://www.linkedin.com/in/[YOURPROFILE]/
- GitHub: https://github.com/[YOURUSERNAME]

Update these files:
1. src/config/siteConfig.ts - site name, bio, GitHub username
2. src/pages/Home.tsx - intro paragraph and footer section with all creator links
3. src/pages/Post.tsx - SITE_URL and SITE_NAME constants
4. convex/http.ts - SITE_URL and SITE_NAME constants
5. convex/rss.ts - SITE_URL, SITE_TITLE, SITE_DESCRIPTION
6. index.html - all meta tags, JSON-LD, title
7. public/llms.txt - site info and GitHub link
8. public/robots.txt - header comment and sitemap URL
9. public/openapi.yaml - API title, server URL, contact URL
10. public/.well-known/ai-plugin.json - plugin metadata and contact email
```

---

## After Configuration

1. Run `npx convex dev` to initialize Convex
2. Run `npm run sync` to sync content to development
3. Run `npm run dev` to test locally
4. Deploy to Netlify when ready

---

## Optional: Content Files

Replace example content in:

| File                           | Purpose                    |
| ------------------------------ | -------------------------- |
| `content/blog/*.md`            | Blog posts                 |
| `content/pages/*.md`           | Static pages (About, etc.) |
| `public/images/logo.svg`       | Site logo                  |
| `public/images/og-default.svg` | Default social share image |
| `public/images/logos/*.svg`    | Logo gallery images        |
