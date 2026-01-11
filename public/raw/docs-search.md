# Search

---
Type: page
Date: 2026-01-11
---

## Keyword Search

Keyword search matches exact words using Convex full-text search. Results update instantly as you type.

For meaning-based search that finds conceptually similar content, see [Semantic Search](/docs-semantic-search).

---

### Keyboard shortcuts

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open search. Click the magnifying glass icon works too.

| Key | Action |
| --- | ------ |
| `Cmd+K` / `Ctrl+K` | Open/close search |
| `Tab` | Switch between Keyword and Semantic modes |
| `↑` `↓` | Navigate results |
| `Enter` | Select result |
| `Esc` | Close modal |

### How keyword search works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      KEYWORD SEARCH FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌─────────────┐    ┌──────────────────┐
  │  Cmd+K   │───▶│ SearchModal │───▶│  Convex Query    │
  └──────────┘    └─────────────┘    └────────┬─────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
              ┌────────────────┐                           ┌────────────────┐
              │  search_title  │                           │ search_content │
              │    (index)     │                           │    (index)     │
              └───────┬────────┘                           └───────┬────────┘
                      │                                            │
                      └──────────────────┬─────────────────────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ Dedupe + Rank       │
                              │ (title matches first)│
                              └──────────┬──────────┘
                                         ▼
                              ┌─────────────────────┐
                              │  Search Results     │
                              │  (max 15)           │
                              └──────────┬──────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ Navigate + ?q=term  │
                              └──────────┬──────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ Highlight matches   │
                              │ + scroll to first   │
                              └─────────────────────┘
```

1. User presses `Cmd+K` to open SearchModal
2. SearchModal sends reactive query to Convex as user types
3. Convex searches both title and content indexes in parallel
4. Results are deduplicated (same post can match both indexes)
5. Results ranked with title matches first, limited to 15
6. User selects result, navigates with `?q=searchterm` param
7. Destination page highlights all matches and scrolls to first

### Why keyword search

Keyword search is the default because it's:

- **Instant** - Results return in milliseconds, no API calls
- **Free** - No external services, no per-query costs
- **Reactive** - Updates in real-time as you type
- **Highlightable** - Matches exact words, so results can be highlighted on the destination page

Use keyword search when you know the exact terms, code snippets, or commands you're looking for.

### How search indexes work

Search indexes are defined in `convex/schema.ts` on the posts and pages tables:

```typescript
posts: defineTable({
  title: v.string(),
  content: v.string(),
  published: v.boolean(),
  // ... other fields
})
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["published"],
  })
  .searchIndex("search_title", {
    searchField: "title",
    filterFields: ["published"],
  }),
```

Each table has two search indexes:

- `search_title` - Searches the title field
- `search_content` - Searches the full markdown content

The `filterFields: ["published"]` allows filtering to only published content without a separate query.

### Search query implementation

The search query in `convex/search.ts` searches both titles and content, then deduplicates and ranks results:

```typescript
// Search posts by title
const postsByTitle = await ctx.db
  .query("posts")
  .withSearchIndex("search_title", (q) =>
    q.search("title", args.query).eq("published", true)
  )
  .take(10);

// Search posts by content
const postsByContent = await ctx.db
  .query("posts")
  .withSearchIndex("search_content", (q) =>
    q.search("content", args.query).eq("published", true)
  )
  .take(10);
```

Key features:

- **Dual search** - Searches both title and content indexes
- **Filter by published** - Only returns published content
- **Deduplication** - Removes duplicates when a post matches both title and content
- **Ranking** - Title matches sort before content-only matches
- **Snippets** - Generates context snippets around the search term
- **Unlisted filtering** - Excludes posts with `unlisted: true`

### Frontend search modal

The `SearchModal` component (`src/components/SearchModal.tsx`) provides the UI:

```typescript
// Reactive search query - updates as you type
const results = useQuery(
  api.search.search,
  searchQuery.trim() ? { query: searchQuery } : "skip"
);
```

The `"skip"` parameter tells Convex to skip the query when the search field is empty, avoiding unnecessary database calls.

### Search result highlighting

When you click a search result, the app navigates to the page with a `?q=` parameter. The `useSearchHighlighting` hook (`src/hooks/useSearchHighlighting.ts`) then:

1. Waits for page content to load
2. Finds all occurrences of the search term
3. Wraps matches in `<mark>` tags with highlight styling
4. Scrolls to the first match
5. Highlights pulse, then fade after 4 seconds
6. Press `Esc` to clear highlights manually

### Files involved

| File | Purpose |
| ---- | ------- |
| `convex/schema.ts` | Search index definitions |
| `convex/search.ts` | Search query with deduplication and snippets |
| `src/components/SearchModal.tsx` | Search UI with keyboard navigation |
| `src/components/Layout.tsx` | Keyboard shortcut handler (Cmd+K) |
| `src/hooks/useSearchHighlighting.ts` | Result highlighting and scroll-to-match |

### Adding search to new tables

To add search to a new table:

1. Add a search index in `convex/schema.ts`:

```typescript
myTable: defineTable({
  title: v.string(),
  body: v.string(),
  status: v.string(),
})
  .searchIndex("search_body", {
    searchField: "body",
    filterFields: ["status"],
  }),
```

2. Create a search query in a Convex function:

```typescript
const results = await ctx.db
  .query("myTable")
  .withSearchIndex("search_body", (q) =>
    q.search("body", searchTerm).eq("status", "published")
  )
  .take(10);
```

3. Run `npx convex dev` to deploy the new index

### Limitations

- Search indexes only work on string fields
- One `searchField` per index (create multiple indexes for multiple fields)
- Filter fields support equality only (not ranges or inequalities)
- Results are ranked by relevance, not by date or other fields
- Maximum 10 results per `.take()` call (paginate for more)

### Resources

- [Convex Full-Text Search](https://docs.convex.dev/search/text-search)
- [Search Index API](https://docs.convex.dev/api/classes/server.TableDefinition#searchindex)
- [Semantic Search](/docs-semantic-search) - Vector-based search for finding similar content