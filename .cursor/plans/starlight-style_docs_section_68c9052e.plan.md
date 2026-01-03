---
name: Starlight-style Docs Section
overview: Implement a Starlight-style documentation section with configurable URL slug, left navigation sidebar showing grouped docs pages/posts, and right TOC sidebar for the current page content.
todos:
  - id: config
    content: Add DocsSectionConfig interface and docsSection config to siteConfig.ts
    status: pending
  - id: schema
    content: Add docsSection, docsSectionGroup, docsSectionOrder fields to convex/schema.ts
    status: pending
  - id: queries
    content: Add getDocsPosts and getDocsPages queries to convex/posts.ts and convex/pages.ts
    status: pending
  - id: sync
    content: Update scripts/sync-posts.ts to parse new frontmatter fields
    status: pending
  - id: docs-sidebar
    content: Create DocsSidebar.tsx component for left navigation
    status: pending
  - id: docs-toc
    content: Create DocsTOC.tsx component for right table of contents
    status: pending
  - id: docs-layout
    content: Create DocsLayout.tsx three-column layout wrapper
    status: pending
  - id: docs-page
    content: Create DocsPage.tsx landing page component
    status: pending
  - id: post-integration
    content: "Update Post.tsx to use DocsLayout when docsSection: true"
    status: pending
  - id: routing
    content: Add docs route to App.tsx
    status: pending
  - id: styles
    content: Add docs layout CSS styles to global.css
    status: pending
  - id: test-content
    content: Add docsSection frontmatter to existing content for testing
    status: pending
---

# Starlight-style Docs Section

## Overview

Create a documentation layout similar to [Astro Starlight](https://starlight.astro.build/manual-setup/) with:

- **Left sidebar**: Navigation menu showing grouped docs pages/posts (collapsible sections)
- **Right sidebar**: Table of contents for the current page/post
- **Main content**: The page/post content
- **Configurable**: Base URL slug set in siteConfig

## Architecture

```mermaid
flowchart TB
    subgraph Config[Configuration Layer]
        SC[siteConfig.docsSection]
        FM[Frontmatter Fields]
    end

    subgraph Data[Data Layer]
        Schema[convex/schema.ts]
        Posts[convex/posts.ts]
        Pages[convex/pages.ts]
    end

    subgraph Components[Component Layer]
        DocsLayout[DocsLayout.tsx]
        DocsSidebar[DocsSidebar.tsx]
        DocsTOC[DocsTOC.tsx]
    end

    subgraph Routing[Routing Layer]
        AppTsx[App.tsx]
        DocsRoute[/docs route]
        DocsPageRoute[/docs-page/:slug]
    end

    SC --> DocsLayout
    FM --> Schema
    Schema --> Posts
    Schema --> Pages
    Posts --> DocsSidebar
    Pages --> DocsSidebar
    DocsLayout --> DocsSidebar
    DocsLayout --> DocsTOC
    AppTsx --> DocsRoute
    AppTsx --> DocsPageRoute
```

## Implementation Details

### 1. Site Configuration

Add to [`src/config/siteConfig.ts`](src/config/siteConfig.ts):

```typescript
docsSection: {
  enabled: true,
  slug: "docs",           // Base URL: /docs
  title: "Documentation", // Page title
  showInNav: true,        // Show in navigation
  order: 1,               // Nav order
  defaultExpanded: true,  // Expand all groups by default
}
```

### 2. New Frontmatter Fields

For pages and posts that should appear in docs navigation:

```yaml
---
title: "Setup Guide"
slug: "setup-guide"
docsSection: true # Include in docs navigation
docsSectionGroup: "Getting Started" # Group name in sidebar
docsSectionOrder: 1 # Order within group (lower = first)
---
```

### 3. Database Schema Updates

Add to [`convex/schema.ts`](convex/schema.ts) for both `posts` and `pages` tables:

```typescript
docsSection: v.optional(v.boolean()),      // Include in docs navigation
docsSectionGroup: v.optional(v.string()),  // Sidebar group name
docsSectionOrder: v.optional(v.number()),  // Order within group
```

### 4. New Components

**DocsSidebar.tsx** (left navigation):

- Fetches all pages/posts with `docsSection: true`
- Groups by `docsSectionGroup`
- Sorts by `docsSectionOrder`
- Collapsible group sections with ChevronRight icons
- Highlights current page
- Persists expanded state to localStorage

**DocsTOC.tsx** (right TOC):

- Reuses heading extraction from `extractHeadings.ts`
- Similar to current `PageSidebar.tsx` but positioned on right
- Active heading highlighting on scroll
- Smooth scroll navigation

**DocsLayout.tsx** (three-column layout):

- Left: DocsSidebar (navigation)
- Center: Main content
- Right: DocsTOC (table of contents)
- Responsive: stacks on mobile

### 5. Routing Changes

Update [`src/App.tsx`](src/App.tsx):

```typescript
// Docs landing page (shows first doc or overview)
{
  siteConfig.docsSection?.enabled && (
    <Route path={`/${siteConfig.docsSection.slug}`} element={<DocsPage />} />
  );
}

// Existing catch-all handles individual doc pages
<Route path="/:slug" element={<Post />} />;
```

### 6. Post/Page Rendering

Update [`src/pages/Post.tsx`](src/pages/Post.tsx):

- Detect if current page/post has `docsSection: true`
- If yes, render with `DocsLayout` instead of current layout
- Pass headings to DocsTOC for right sidebar

### 7. Sync Script Updates

Update [`scripts/sync-posts.ts`](scripts/sync-posts.ts):

- Parse new frontmatter fields: `docsSection`, `docsSectionGroup`, `docsSectionOrder`
- Include in sync payload for both posts and pages

### 8. CSS Styling

Add to [`src/styles/global.css`](src/styles/global.css):

- Three-column docs grid layout
- DocsSidebar styles (groups, links, active states)
- DocsTOC styles (right-aligned, smaller font)
- Mobile responsive breakpoints
- Theme-aware colors using existing CSS variables

## File Changes Summary

| File | Change |

| -------------------------------- | ---------------------------------------------------------------- |

| `src/config/siteConfig.ts` | Add `DocsSectionConfig` interface and `docsSection` config |

| `convex/schema.ts` | Add `docsSection`, `docsSectionGroup`, `docsSectionOrder` fields |

| `convex/posts.ts` | Add `getDocsPosts` query |

| `convex/pages.ts` | Add `getDocsPages` query |

| `scripts/sync-posts.ts` | Parse new frontmatter fields |

| `src/components/DocsSidebar.tsx` | New component for left navigation |

| `src/components/DocsTOC.tsx` | New component for right TOC |

| `src/components/DocsLayout.tsx` | New three-column layout wrapper |

| `src/pages/DocsPage.tsx` | New docs landing page |

| `src/pages/Post.tsx` | Conditional docs layout rendering |

| `src/App.tsx` | Add docs route |

| `src/styles/global.css` | Add docs layout styles |

## Migration Path

1. Existing pages/posts continue working unchanged
2. Add `docsSection: true` to content you want in docs navigation
3. Set base slug in siteConfig (default: "docs")
4. Run `npm run sync` to update database with new fields
