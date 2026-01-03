---
title: "How to Use the MCP Server with MarkDown Sync"
description: "Guide to using the HTTP-based Model Context Protocol(MCP) server at www.markdown.fast/mcp with Cursor and other AI tools"
date: "2025-12-28"
slug: "how-to-use-mcp-server"
image: /images/mcp-blog.png
published: true
blogFeatured: true
layout: "sidebar"
tags: ["mcp", "cursor", "ai", "tutorial", "netlify"]
docsSection: true
docsSectionOrder: 2
docsSectionGroup: "Components"
docsSectionGroupIcon: "PuzzlePiece"
docsLanding: true
---

This site includes an HTTP-based Model Context Protocol (MCP) server that allows AI tools like Cursor, Claude Desktop, and other MCP-compatible clients to access blog content programmatically.

## What is MCP?

The Model Context Protocol is an open standard for connecting AI applications to external data sources. It enables AI assistants to read content, search, and retrieve information from connected systems.

Our MCP server exposes read-only tools for accessing:

- Blog posts (list, get by slug, search)
- Static pages (list, get by slug)
- Homepage data (featured content, recent posts)
- Full content export

## Endpoint URL

The MCP server is available 24/7 at:

```
https://www.markdown.fast/mcp
```

No authentication is required for public access.

## Available tools

The server exposes seven tools:

| Tool             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `list_posts`     | Get all published blog posts with metadata       |
| `get_post`       | Get a single post by slug with full content      |
| `list_pages`     | Get all published pages                          |
| `get_page`       | Get a single page by slug with full content      |
| `get_homepage`   | Get homepage data with featured and recent posts |
| `search_content` | Full text search across posts and pages          |
| `export_all`     | Batch export all content                         |

## Client configuration

### Cursor

Add to your Cursor MCP configuration file (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp"
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp"
    }
  }
}
```

### With API key (optional)

If you have an API key for higher rate limits:

```json
{
  "mcpServers": {
    "markdown-fast": {
      "url": "https://www.markdown.fast/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key-here"
      }
    }
  }
}
```

## Rate limiting

The server uses Netlify's built-in rate limiting:

- **Public access**: 50 requests per minute per IP address
- **Authenticated access**: Higher limits with API key

When rate limited, the server returns HTTP 429. Wait a minute before retrying.

## Example requests

### Initialize connection

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "my-client",
      "version": "1.0.0"
    }
  }
}
```

### List available tools

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

### Get all posts

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_posts",
    "arguments": {}
  }
}
```

### Get a specific post

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_post",
    "arguments": {
      "slug": "setup-guide"
    }
  }
}
```

### Search content

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "search_content",
    "arguments": {
      "query": "markdown"
    }
  }
}
```

## Testing with curl

Test the server directly:

```bash
# Initialize
curl -X POST https://www.markdown.fast/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# List tools
curl -X POST https://www.markdown.fast/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Get all posts
curl -X POST https://www.markdown.fast/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_posts","arguments":{}}}'
```

## Security

The MCP server is designed with security in mind:

- **Read-only access**: No mutations or writes are exposed
- **Public content**: Uses the same queries as the public website
- **Rate limiting**: Prevents abuse via Netlify's built-in rate limiting
- **HTTPS encryption**: All traffic is encrypted
- **Optional authentication**: API keys available for higher limits

## For your own fork

When you fork this site, the MCP server is already included and will automatically connect to your Convex deployment. Here's how to set it up:

### Prerequisites

1. Fork the repository to your GitHub account
2. Set up Convex backend (see [Setup Guide](/setup-guide))
3. Deploy to Netlify (see [Setup Guide](/setup-guide))

### Setup Steps

1. **Set Convex URL in Netlify**

   The MCP server needs your Convex deployment URL to fetch content. Add this environment variable in your Netlify dashboard:
   - Go to Site Settings > Environment Variables
   - Add `VITE_CONVEX_URL` with your production Convex URL (e.g., `https://your-deployment.convex.cloud`)

2. **Deploy your site**

   The MCP server is already configured in `netlify/edge-functions/mcp.ts` and `netlify.toml`. When you deploy to Netlify, the server will be available at:

   ```
   https://your-site.netlify.app/mcp
   ```

   Or your custom domain:

   ```
   https://yourdomain.com/mcp
   ```

3. **Optional: Set API key for higher rate limits**

   If you want authenticated access with higher rate limits:
   - Add `MCP_API_KEY` to your Netlify environment variables
   - Use this key in your client configuration (see "With API key" section above)

### How it works

The MCP server reads from your Convex database using the same queries as your public website. Any content you sync with `npm run sync` or `npm run sync:prod` will be immediately available via the MCP server.

### Testing your fork's MCP server

After deploying, test your MCP server:

```bash
# Replace with your site URL
curl -X POST https://your-site.netlify.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

You should receive a response listing all seven available tools.

### Client configuration for your fork

Update your Cursor or Claude Desktop configuration to use your fork's endpoint:

```json
{
  "mcpServers": {
    "my-blog": {
      "url": "https://your-site.netlify.app/mcp"
    }
  }
}
```

### Files included

The MCP server implementation is included in your fork:

- `netlify/edge-functions/mcp.ts` - MCP server implementation
- `netlify.toml` - Edge function route configuration
- `package.json` - Includes `@modelcontextprotocol/sdk` dependency

No additional code changes needed. Just set the environment variable and deploy.

## Troubleshooting

### Server returns 500 error

Check that `VITE_CONVEX_URL` is set in your Netlify environment variables.

### Rate limit exceeded

Wait 60 seconds before retrying. Consider using an API key for higher limits.

### Tool not found

Verify the tool name matches one of the seven available tools exactly.

### Invalid JSON-RPC

Ensure your request includes:

- `"jsonrpc": "2.0"`
- A numeric or string `id`
- A `method` string

## Resources

- [Model Context Protocol specification](https://modelcontextprotocol.io)
- [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol)
- [Claude Desktop MCP setup](https://claude.ai/docs/mcp)
