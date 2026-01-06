# Librarian Integration Plan

## Summary

Integrate [Librarian](https://github.com/iannuttall/librarian) to provide hybrid search (word + vector) across external documentation sources, complementing the existing MCP server.

## What is Librarian?

- Local CLI tool that fetches and indexes developer documentation
- Hybrid search: word-based + vector/semantic
- Has its own MCP server (`librarian mcp`)
- Designed for AI coding agents

## Integration Options

### Option A: Side-by-Side MCP Servers (Recommended)

No code changes needed. Document how users can configure both MCP servers:

```json
// ~/.cursor/mcp.json or claude_desktop_config.json
{
  "mcpServers": {
    "markdown-blog": {
      "url": "https://yoursite.com/mcp"
    },
    "librarian": {
      "command": "librarian",
      "args": ["mcp"]
    }
  }
}
```

**Pros:** Simple, no code changes, each tool does what it's best at
**Cons:** Two separate tools, no unified search

### Option B: Librarian Indexes Your Blog

Users add your site as a Librarian source:

```bash
librarian add https://yoursite.com
librarian ingest
```

Librarian fetches your `/raw/*.md` files and indexes them with vector embeddings.

**Pros:** Unified search across your content + external docs
**Cons:** Requires user setup, duplicate indexing

### Option C: MCP Proxy (Advanced)

Your `/mcp` endpoint proxies requests to a local Librarian instance for unified results.

**Pros:** Single MCP endpoint, unified search
**Cons:** Complex, requires Librarian running locally on server

## Recommended Approach: Option A + Documentation

1. Create docs page explaining Librarian integration
2. Add Librarian config examples to MCP documentation
3. Optionally add a Claude skill for Librarian setup

## Files to Create

### 1. `content/blog/how-to-use-librarian.md`

Blog post explaining:
- What Librarian is
- How to install it
- How to add documentation sources
- How to use with your MCP server side-by-side
- Example MCP configuration

### 2. `.claude/skills/librarian.md` (optional)

Claude skill for setting up Librarian:
- Installation instructions
- Common commands
- Integration with this blog's MCP

## Files to Modify

### 1. `content/pages/docs.md`

Add section about Librarian integration under MCP documentation.

### 2. `content/blog/how-to-use-mcp-server.md`

Add example showing both MCP servers configured together.

## Implementation Steps

1. Write blog post explaining Librarian
2. Update MCP docs with side-by-side configuration
3. Optionally create Claude skill
4. Test configuration with Cursor/Claude Desktop

## Example Documentation Content

```markdown
## Using with Librarian

For AI agents that need both your blog content AND external documentation
(React, Convex, etc.), configure both MCP servers:

### Cursor Configuration

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "your-blog": {
      "url": "https://yoursite.com/mcp"
    },
    "librarian": {
      "command": "librarian",
      "args": ["mcp"]
    }
  }
}
```

### Setup Librarian

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/iannuttall/librarian/main/install.sh | bash

# Add documentation sources
librarian add convex https://github.com/get-convex/convex-backend
librarian add react https://github.com/facebook/react

# Ingest and embed
librarian ingest
```

Now AI agents can search your blog via `your-blog` MCP and external docs via `librarian` MCP.
```

## Dependencies

- Librarian installed locally (user responsibility)
- No changes to your codebase required for Option A

## Future Enhancements

- Option C proxy implementation if unified search is needed
- Librarian as a Netlify Edge Function (if Librarian supports it)
- Pre-configured Librarian sources for common dev docs

## Status

**Not started** - Documentation-only integration, no code changes required.
