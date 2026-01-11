# Ask AI

---
Type: page
Date: 2026-01-11
---

## Ask AI

Ask AI is a header button that opens a chat modal for asking questions about your site content. It uses RAG (Retrieval-Augmented Generation) to find relevant content and generate AI responses with source citations.

Press `Cmd+J` or `Cmd+/` (Mac) or `Ctrl+J` or `Ctrl+/` (Windows/Linux) to open the Ask AI modal.

---

### How Ask AI works

```
+------------------+    +-------------------+    +------------------+
|  User question   |--->|  OpenAI Embedding |--->|  Vector Search   |
|  "How do I..."   |    |  text-embedding-  |    |  Find top 5      |
|                  |    |  ada-002          |    |  relevant pages  |
+------------------+    +-------------------+    +--------+---------+
                                                         |
                                                         v
+------------------+    +-------------------+    +------------------+
|  Streaming       |<---|  AI Model         |<---|  RAG Context     |
|  Response with   |    |  Claude/GPT-4o    |    |  Build prompt    |
|  Source Links    |    |  generates answer |    |  with content    |
+------------------+    +-------------------+    +------------------+
```

1. Your question is stored in the database with a session ID
2. Query is converted to a vector embedding using OpenAI
3. Convex vector search finds the 5 most relevant posts and pages
4. Content is combined into a RAG prompt with system instructions
5. AI model generates an answer based only on your site content
6. Response streams in real-time with source citations appended

### Features

| Feature            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| Streaming          | Responses appear word-by-word in real-time             |
| Model Selection    | Choose between Claude Sonnet 4 or GPT-4o               |
| Source Citations   | Every response includes links to source content        |
| Markdown Rendering | Responses support full markdown formatting             |
| Internal Links     | Links to your pages use React Router (no page reload)  |
| Copy Response      | Hover over any response to copy it to clipboard        |
| Keyboard Shortcuts | Cmd+J or Cmd+/ to open, Escape to close, Enter to send |

### Configuration

Ask AI requires semantic search to be enabled (for embeddings):

```typescript
// src/config/siteConfig.ts
semanticSearch: {
  enabled: true,
},

askAI: {
  enabled: true,
  defaultModel: "claude-sonnet-4-20250514",
  models: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
    { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  ],
},
```

### Environment variables

Set these in your Convex dashboard:

```bash
# Required for embeddings (vector search)
npx convex env set OPENAI_API_KEY sk-your-key-here

# Required for Claude models
npx convex env set ANTHROPIC_API_KEY sk-ant-your-key-here
```

After setting environment variables, run `npm run sync` to generate embeddings for your content.

### When to use Ask AI vs Search

| Use Case                         | Tool                    |
| -------------------------------- | ----------------------- |
| Quick navigation to a known page | Keyword Search (Cmd+K)  |
| Find exact code or commands      | Keyword Search          |
| "How do I do X?" questions       | Ask AI (Cmd+J or Cmd+/) |
| Understanding a concept          | Ask AI                  |
| Need highlighted matches on page | Keyword Search          |
| Want AI-synthesized answers      | Ask AI                  |

### Technical details

**Frontend:**

| File                            | Purpose                              |
| ------------------------------- | ------------------------------------ |
| `src/components/AskAIModal.tsx` | Chat modal with streaming messages   |
| `src/components/Layout.tsx`     | Header button and keyboard shortcuts |
| `src/config/siteConfig.ts`      | AskAIConfig interface and settings   |

**Backend (Convex):**

| File                      | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `convex/askAI.ts`         | Session mutations and queries (regular runtime) |
| `convex/askAI.node.ts`    | HTTP streaming action (Node.js runtime)         |
| `convex/schema.ts`        | askAISessions table definition                  |
| `convex/http.ts`          | /ask-ai-stream endpoint registration            |
| `convex/convex.config.ts` | persistentTextStreaming component               |

**Database:**

The `askAISessions` table stores:

- `question`: The user's question
- `streamId`: Persistent Text Streaming ID
- `model`: Selected AI model ID
- `createdAt`: Timestamp
- `sources`: Optional array of cited sources

### Limitations

- **Requires semantic search**: Embeddings must be generated for content
- **API costs**: Each query costs embedding generation (~$0.0001) plus AI model usage
- **Latency**: ~1-3 seconds for initial response (embedding + search + AI)
- **Content scope**: Only searches published posts and pages
- **No conversation history**: Each session starts fresh (no multi-turn context)

### Troubleshooting

**"Failed to load response" error:**

1. Check that `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set in Convex
2. Verify the API key is valid and has credits
3. Check browser console for specific error messages

**Empty or irrelevant responses:**

1. Run `npm run sync` to ensure embeddings are generated
2. Check that `semanticSearch.enabled: true` in siteConfig
3. Verify content exists in your posts/pages

**Modal doesn't open:**

1. Check that `askAI.enabled: true` in siteConfig
2. Check that `semanticSearch.enabled: true` in siteConfig
3. Both conditions must be true for the button to appear

### Resources

- [Semantic Search Documentation](/docs-semantic-search) - How embeddings work
- [Convex Persistent Text Streaming](https://github.com/get-convex/persistent-text-streaming) - Streaming component
- [Convex Vector Search](https://docs.convex.dev/search/vector-search) - Vector search documentation