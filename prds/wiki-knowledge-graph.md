# Wiki knowledge graph and Obsidian-style layout

## Problem

The wiki page at `/wiki` is a basic grid of cards. It has no visual representation of how pages connect to each other. Users cannot see relationships between content, backlinks, or categories at a glance.

## Proposed solution

Redesign the wiki page with an Obsidian Help inspired three-panel layout:
1. **Left sidebar**: search, category tree navigation with collapsible sections
2. **Center**: article content (current page detail) or index grid view
3. **Right sidebar**: interactive 3D knowledge graph + "on this page" outline

The knowledge graph uses Three.js with a force-directed layout (d3-force-3d) to render:
- Wiki pages as glowing particle nodes
- Backlinks as edges between connected nodes
- Node size scaled by inbound link count
- Node color mapped to pageType/category
- Click to navigate, hover to highlight connections

## Data source

The graph consumes wiki page data already available from `api.wiki.listWikiPages`. We add a new public query `getGraphData` that returns nodes and edges derived from wiki pages and their backlinks. No new tables needed.

## Files to change

| File | Change |
|------|--------|
| `convex/wiki.ts` | Add `getGraphData` public query returning nodes/edges |
| `src/pages/Wiki.tsx` | Complete rewrite with three-panel layout |
| `src/components/KnowledgeGraph.tsx` | New Three.js graph component |
| `src/styles/global.css` | Replace wiki CSS with Obsidian-style layout |
| `package.json` | Add `three`, `@types/three`, `d3-force-3d` |

## Edge cases

- Zero wiki pages: show empty state with compile instructions
- Single page with no backlinks: render as lone floating node
- Many pages (100+): cap visible nodes, use LOD
- Mobile: graph in collapsed panel, toggle to expand
- Dark/light themes: graph respects CSS variables

## Security

- Graph data is read-only, public query (no auth required, matches existing wiki queries)
- No user input affects graph rendering beyond navigation clicks
