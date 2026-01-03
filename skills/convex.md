# Convex skill

Convex patterns and conventions for this markdown-blog project.

## Function structure

Every Convex function needs argument and return validators:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { slug: v.string() },
  returns: v.union(v.object({...}), v.null()),
  handler: async (ctx, args) => {
    // implementation
  },
});
```

If a function returns nothing, use `returns: v.null()` and `return null;`.

## Always use indexes

Never use `.filter()` on queries. Define indexes in schema and use `.withIndex()`:

```typescript
// Good
const post = await ctx.db
  .query("posts")
  .withIndex("by_slug", (q) => q.eq("slug", args.slug))
  .first();

// Bad - causes table scans
const post = await ctx.db
  .query("posts")
  .filter((q) => q.eq(q.field("slug"), args.slug))
  .first();
```

## Make mutations idempotent

Mutations should be safe to call multiple times:

```typescript
export const heartbeat = mutation({
  args: { sessionId: v.string(), currentPath: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("activeSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      // Early return if recently updated with same data
      if (existing.currentPath === args.currentPath && 
          now - existing.lastSeen < 10000) {
        return null;
      }
      await ctx.db.patch(existing._id, { 
        currentPath: args.currentPath, 
        lastSeen: now 
      });
      return null;
    }

    await ctx.db.insert("activeSessions", { ...args, lastSeen: now });
    return null;
  },
});
```

## Patch directly without reading

When you only need to update fields, patch directly:

```typescript
// Good - patch directly
await ctx.db.patch(args.id, { content: args.content });

// Bad - unnecessary read creates conflict window
const doc = await ctx.db.get(args.id);
if (!doc) throw new Error("Not found");
await ctx.db.patch(args.id, { content: args.content });
```

## Use event records for counters

Never increment counters on documents. Use separate event records:

```typescript
// Good - insert event record
await ctx.db.insert("pageViews", { 
  path, 
  sessionId, 
  timestamp: Date.now() 
});

// Bad - counter updates cause write conflicts
await ctx.db.patch(pageId, { views: page.views + 1 });
```

## Schema indexes in this project

Key indexes defined in `convex/schema.ts`:

```typescript
posts: defineTable({...})
  .index("by_slug", ["slug"])
  .index("by_published", ["published"])
  .index("by_featured", ["featured"])
  .searchIndex("search_title", { searchField: "title" })
  .searchIndex("search_content", { searchField: "content" })

pages: defineTable({...})
  .index("by_slug", ["slug"])
  .index("by_published", ["published"])
  .index("by_featured", ["featured"])

pageViews: defineTable({...})
  .index("by_path", ["path"])
  .index("by_timestamp", ["timestamp"])
  .index("by_session_path", ["sessionId", "path"])

activeSessions: defineTable({...})
  .index("by_sessionId", ["sessionId"])
  .index("by_lastSeen", ["lastSeen"])
```

## Common query patterns

### Get post by slug

```typescript
const post = await ctx.db
  .query("posts")
  .withIndex("by_slug", (q) => q.eq("slug", args.slug))
  .first();
```

### Get all published posts

```typescript
const posts = await ctx.db
  .query("posts")
  .withIndex("by_published", (q) => q.eq("published", true))
  .order("desc")
  .collect();
```

### Get featured items

```typescript
const featured = await ctx.db
  .query("posts")
  .withIndex("by_featured", (q) => q.eq("featured", true))
  .collect();
```

### Full text search

```typescript
const results = await ctx.db
  .query("posts")
  .withSearchIndex("search_content", (q) => q.search("content", searchTerm))
  .take(10);
```

## File locations

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema and indexes |
| `convex/posts.ts` | Post queries/mutations |
| `convex/pages.ts` | Page queries/mutations |
| `convex/stats.ts` | Analytics (heartbeat, pageViews) |
| `convex/search.ts` | Full text search |
| `convex/http.ts` | HTTP endpoints |
| `convex/rss.ts` | RSS feed generation |
| `convex/crons.ts` | Scheduled jobs |

## Write conflict prevention

This project uses specific patterns to avoid write conflicts:

**Backend (convex/stats.ts):**
- 10-second dedup window for heartbeats
- Early return when session was recently updated
- Indexed queries for efficient lookups

**Frontend (src/hooks/usePageTracking.ts):**
- 5-second debounce window using refs
- Pending state tracking prevents overlapping calls
- Path tracking skips redundant heartbeats

See `prds/howtoavoidwriteconflicts.md` for full documentation.
