# Semantic Search

---
Type: page
Date: 2026-01-06
---

## Semantic Search

Semantic search finds content by meaning, not exact words. Ask questions naturally and find conceptually related content.

Press `Cmd+K` then `Tab` to switch to Semantic mode. For exact word matching, see [Keyword Search](/docs-search).

---

### When to use each mode

| Use case | Mode |
|----------|------|
| "authentication error" (exact term) | Keyword |
| "login problems" (conceptual) | Semantic |
| Find specific code or commands | Keyword |
| "how do I deploy?" (question) | Semantic |
| Need matches highlighted on page | Keyword |
| Not sure of exact terminology | Semantic |

### How semantic search works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SEMANTIC SEARCH FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
  │ User query:  │───▶│ OpenAI API      │───▶│ Query embedding  │
  │ "how to      │    │ text-embedding- │    │ [0.12, -0.45,    │
  │  deploy"     │    │ ada-002         │    │  0.78, ...]      │
  └──────────────┘    └─────────────────┘    └────────┬─────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │ Convex vectorSearch │
                                           │ Compare to stored   │
                                           │ post/page embeddings│
                                           └──────────┬──────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │ Results sorted by   │
                                           │ similarity score    │
                                           │ (0-100%)            │
                                           └─────────────────────┘
```

1. Your query is converted to a vector (1536 numbers) using OpenAI's embedding model
2. Convex compares this vector to stored embeddings for all posts and pages
3. Results are ranked by similarity score (higher = more similar meaning)
4. Top 15 results returned

### Technical comparison

| Aspect | Keyword | Semantic |
|--------|---------|----------|
| Speed | Instant | ~300ms |
| Cost | Free | ~$0.0001/query |
| Highlighting | Yes | No |
| API required | No | OpenAI |

### Configuration

Semantic search requires an OpenAI API key:

```bash
npx convex env set OPENAI_API_KEY sk-your-key-here
```

If the key is not configured:
- Semantic search returns empty results
- Keyword search continues to work normally
- Sync script skips embedding generation

### How embeddings are generated

When you run `npm run sync`:

1. Content syncs to Convex (posts and pages)
2. Script checks for posts/pages without embeddings
3. For each, combines title + content into text
4. Calls OpenAI to generate 1536-dimension embedding
5. Stores embedding in Convex database

Embeddings are generated once per post/page. If content changes, a new embedding is generated on the next sync.

### Files involved

| File | Purpose |
| ---- | ------- |
| `convex/schema.ts` | `embedding` field and `vectorIndex` on posts/pages |
| `convex/embeddings.ts` | Embedding generation actions |
| `convex/embeddingsQueries.ts` | Queries for posts/pages without embeddings |
| `convex/semanticSearch.ts` | Vector search action |
| `convex/semanticSearchQueries.ts` | Queries for hydrating search results |
| `src/components/SearchModal.tsx` | Mode toggle (Tab to switch) |
| `scripts/sync-posts.ts` | Triggers embedding generation after sync |

### Limitations

- **No highlighting**: Semantic search finds meaning, not exact words, so matches can't be highlighted
- **API cost**: Each search query costs ~$0.0001 (embedding generation)
- **Latency**: ~300ms vs instant for keyword search (API round-trip)
- **Requires OpenAI key**: Won't work without `OPENAI_API_KEY` configured
- **Token limit**: Content is truncated to ~8000 characters for embedding

### Similarity scores

Results show a percentage score (0-100%):
- **90%+**: Very similar meaning
- **70-90%**: Related content
- **50-70%**: Loosely related
- **<50%**: Weak match (may not be relevant)

### Resources

- [Convex Vector Search](https://docs.convex.dev/search/vector-search)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Keyword Search](/docs-search) - Full-text search documentation