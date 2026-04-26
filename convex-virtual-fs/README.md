# @convex-dev/virtual-fs

A [Convex component](https://docs.convex.dev/components) that turns any app content into a browsable, searchable virtual filesystem with shell-like commands over HTTP.

Push documents into it (markdown, JSON, text, anything). Get back a familiar file/directory interface with `ls`, `cat`, `grep`, `find`, `tree`, `head`, `tail`, `wc`, and more. Accessible from your Convex functions, HTTP endpoints, and directly by AI agents.

No actual filesystem. No disk. Just structured content exposed as if it were a filesystem.

```bash
npm install @convex-dev/virtual-fs
```

## Why

AI agents (Cursor, Claude Code, Devin, custom LLM agents) need a way to browse and search your app's content. Building a bespoke API for each agent framework is tedious and fragile. A virtual filesystem gives them a universal interface they already understand: paths, directories, files, grep.

Humans benefit too. The shell metaphor works for admin dashboards, debugging tools, content previews, and internal tooling.

## Quick start

### 1. Install the component

```bash
npm install @convex-dev/virtual-fs
```

### 2. Register in your app

In your `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import virtualFs from "@convex-dev/virtual-fs/convex.config.js";

const app = defineApp();
app.use(virtualFs, { httpPrefix: "/vfs/" });
export default app;
```

The `httpPrefix` determines where the HTTP endpoints are mounted. With `/vfs/`, the endpoints will be at `/vfs/tree`, `/vfs/exec`, and `/vfs/file`.

### 3. Push content in

```typescript
import { VirtualFs } from "@convex-dev/virtual-fs";
import { components } from "./_generated/api.js";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

const vfs = new VirtualFs(components.virtualFs);

export const syncPost = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await vfs.upsert(ctx, {
      path: `/blog/${args.slug}.md`,
      title: args.title,
      content: `# ${args.title}\n\n${args.content}`,
      contentType: "text/markdown",
    });
    return null;
  },
});
```

### 4. Query from your functions

```typescript
export const searchDocs = query({
  args: { term: v.string() },
  returns: v.object({
    stdout: v.string(),
    stderr: v.string(),
    exitCode: v.number(),
  }),
  handler: async (ctx, args) => {
    return await vfs.exec(ctx, `grep "${args.term}" /docs`);
  },
});
```

### 5. Access over HTTP

Once deployed, agents and external tools can hit the HTTP endpoints directly:

```bash
# List the full directory tree
curl https://your-app.convex.site/vfs/tree

# Execute a shell command
curl -X POST https://your-app.convex.site/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls /blog"}'

# Read a single file
curl "https://your-app.convex.site/vfs/file?path=/blog/my-post.md"

# Search content
curl -X POST https://your-app.convex.site/vfs/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "grep authentication /docs"}'
```

## Use cases

### AI agent content access

LLMs and autonomous agents can browse your content without a custom API. They use commands they already understand.

```bash
# Agent discovers what content exists
curl -X POST .../vfs/exec -d '{"command": "tree /"}'

# Agent reads a specific document
curl -X POST .../vfs/exec -d '{"command": "cat /docs/api-reference.md"}'

# Agent searches for relevant content
curl -X POST .../vfs/exec -d '{"command": "grep -i \"rate limit\" /docs"}'
```

### CMS and documentation platforms

Any app storing content in Convex gets a browsable content layer. Push your posts, pages, and docs into the VFS. Get search and directory browsing for free.

### Internal tooling and admin shells

Instead of building dashboard pages for every data type, push summaries into VFS and let ops teams grep through them.

### RAG preprocessing

Before feeding content into an embedding pipeline, use VFS to inventory files (`find / -type f`), check sizes (`wc`), and validate content (`grep`).

### Content syndication

Multiple apps using the same component all speak the same VFS protocol. Build unified content indexes across services.

## Shell commands

| Command | Description | Example |
|---------|-------------|---------|
| `ls [path]` | List directory contents | `ls /blog` |
| `ls -l [path]` | Long listing with sizes and titles | `ls -l /docs` |
| `cat <file>` | Print file contents | `cat /blog/my-post.md` |
| `head [-n N] <file>` | First N lines (default 10) | `head -n 5 /blog/intro.md` |
| `tail [-n N] <file>` | Last N lines (default 10) | `tail -n 20 /docs/changelog.md` |
| `grep <pattern> [dir]` | Search file contents (regex) | `grep "convex" /blog` |
| `grep -i <pattern>` | Case-insensitive search | `grep -i "API" /docs` |
| `grep -c <pattern>` | Count matches only | `grep -c "TODO" /` |
| `find [dir] [-name pattern] [-type f\|d]` | Find files by name/type | `find / -name "*.md" -type f` |
| `tree [dir]` | Display directory tree | `tree /blog` |
| `wc <file>` | Line, word, and character counts | `wc /blog/my-post.md` |
| `stat <file>` | File metadata (title, size, type) | `stat /docs/api.md` |
| `pwd` | Print working directory | `pwd` |
| `cd <dir>` | Change directory | `cd /docs` |
| `echo <text>` | Print text | `echo hello` |
| `help` | Show all available commands | `help` |

## Client API reference

### `VirtualFs` class

```typescript
import { VirtualFs } from "@convex-dev/virtual-fs";
import { components } from "./_generated/api.js";

const vfs = new VirtualFs(components.virtualFs);
```

#### `vfs.upsert(ctx, file)`

Create or replace a file.

```typescript
await vfs.upsert(ctx, {
  path: "/blog/hello.md",
  title: "Hello World",
  content: "# Hello\n\nWelcome.",
  contentType: "text/markdown",  // optional
  metadata: { tags: ["intro"] },  // optional, any JSON
});
```

#### `vfs.batchUpsert(ctx, files)`

Upsert multiple files in one transaction. Returns the count.

```typescript
const count = await vfs.batchUpsert(ctx, [
  { path: "/docs/api.md", title: "API Reference", content: "..." },
  { path: "/docs/setup.md", title: "Setup Guide", content: "..." },
]);
```

#### `vfs.remove(ctx, path)`

Delete a file. Returns `true` if it existed.

```typescript
const existed = await vfs.remove(ctx, "/blog/old-post.md");
```

#### `vfs.removeDir(ctx, prefix)`

Delete all files under a directory. Returns the count.

```typescript
const removed = await vfs.removeDir(ctx, "/drafts");
```

#### `vfs.get(ctx, path)`

Read a single file. Returns `null` if not found.

```typescript
const file = await vfs.get(ctx, "/blog/hello.md");
if (file) {
  console.log(file.title, file.content.length);
}
```

#### `vfs.count(ctx)`

Count total files.

```typescript
const total = await vfs.count(ctx);
```

#### `vfs.exec(ctx, command, cwd?)`

Execute a shell command. Returns `{ stdout, stderr, exitCode }`.

```typescript
const result = await vfs.exec(ctx, "grep TODO /blog");
if (result.exitCode === 0) {
  console.log(result.stdout);
}
```

#### `vfs.tree(ctx)`

Get the full directory tree as structured data.

```typescript
const entries = await vfs.tree(ctx);
// [{ name: "blog", path: "/blog", type: "dir" }, ...]
```

## HTTP endpoints

When installed with `httpPrefix: "/vfs/"`, three endpoints are available:

### `GET /vfs/tree`

Returns the full directory tree as JSON.

**Response:**
```json
[
  { "name": "blog", "path": "/blog", "type": "dir" },
  { "name": "hello.md", "path": "/blog/hello.md", "type": "file", "size": 42, "title": "Hello World" }
]
```

### `POST /vfs/exec`

Execute a shell command.

**Request:**
```json
{ "command": "ls -l /blog", "cwd": "/" }
```

**Response:**
```json
{
  "stdout": "- 42 hello.md  Hello World\n-  128 setup.md  Setup Guide",
  "stderr": "",
  "exitCode": 0
}
```

### `GET /vfs/file?path=/blog/hello.md`

Read a single file by path.

**Response:**
```json
{
  "path": "/blog/hello.md",
  "title": "Hello World",
  "content": "# Hello\n\nWelcome.",
  "contentType": "text/markdown"
}
```

All endpoints include CORS headers for cross-origin access.

## Schema

The component manages a single `files` table with this shape:

| Field | Type | Description |
|-------|------|-------------|
| `path` | `string` | Absolute path (e.g. `/blog/my-post.md`) |
| `title` | `string` | Display title for listings |
| `content` | `string` | Full file content |
| `contentType` | `string?` | MIME type (optional, e.g. `text/markdown`) |
| `metadata` | `any?` | Arbitrary JSON metadata (optional) |

Indexes:
- `by_path` on `path` for fast lookups
- `search_content` full-text search on `content`
- `search_title` full-text search on `title`

The component's data is fully isolated from your app's tables. Your app cannot directly query the `files` table. All access goes through the component's API.

## Testing

The component exports test helpers for `convex-test`:

```typescript
import { convexTest } from "convex-test";
import { register } from "@convex-dev/virtual-fs/test";
import schema from "./schema.js";

const modules = import.meta.glob("./**/*.ts");

test("vfs grep returns matches", async () => {
  const t = convexTest(schema, modules);
  register(t, "virtualFs");

  // Seed data and run assertions...
});
```

## Architecture

```
@convex-dev/virtual-fs
  src/
    component/
      convex.config.ts   # Component definition
      schema.ts          # files table with indexes
      files.ts           # CRUD operations (upsert, remove, get, batch)
      shell.ts           # Shell engine (ls, cat, grep, find, tree, etc.)
      http.ts            # HTTP endpoints (/tree, /exec, /file)
    client/
      index.ts           # VirtualFs class for calling from your app
    test.ts              # convex-test registration helpers
```

The shell engine loads all files in a single query transaction, builds a directory tree from flat paths, and executes commands against that tree. No multiple round trips. No N+1 queries.

## Patterns

### Sync on write

The most common pattern is syncing content to VFS whenever you create or update it:

```typescript
export const createPost = mutation({
  args: { slug: v.string(), title: v.string(), content: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("posts", { ...args, published: true });
    await vfs.upsert(ctx, {
      path: `/blog/${args.slug}.md`,
      title: args.title,
      content: args.content,
    });
    return null;
  },
});
```

### Batch sync via cron

For apps with many content types, schedule a periodic full sync:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("sync vfs", { hours: 1 }, internal.vfsSync.syncAll, {});
export default crons;
```

### Auth-gated access

The component itself has no auth. Add checks in your app's HTTP routes or function wrappers:

```typescript
export const secureExec = query({
  args: { command: v.string() },
  returns: v.object({ stdout: v.string(), stderr: v.string(), exitCode: v.number() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await vfs.exec(ctx, args.command);
  },
});
```

### Content type filtering

Use the `metadata` field to tag files, then grep or filter by type in your app logic:

```typescript
await vfs.upsert(ctx, {
  path: "/api/users.json",
  title: "Users API",
  content: JSON.stringify(apiSpec),
  contentType: "application/json",
  metadata: { category: "api", version: "v2" },
});
```

## Rate limiting

The VFS HTTP endpoints are public and unauthenticated. You should add rate limiting to prevent abuse, especially since commands like `grep` and `tree` scan all files.

The recommended approach uses the [@convex-dev/rate-limiter](https://www.npmjs.com/package/@convex-dev/rate-limiter) component. Define your limits in a central file and check them from HTTP actions via an internal mutation bridge:

```ts
// convex/rateLimits.ts
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  vfsExec: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
  vfsTree: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
});

// Bridge for HTTP actions (which need mutation context to check limits)
export const checkHttpRateLimit = internalMutation({
  args: { name: v.string(), key: v.optional(v.string()) },
  returns: v.object({ ok: v.boolean(), retryAfter: v.optional(v.number()) }),
  handler: async (ctx, args) => {
    const result = await rateLimiter.limit(ctx, args.name as "vfsExec", {
      key: args.key,
    });
    return { ok: result.ok, retryAfter: result.retryAfter ?? undefined };
  },
});
```

Then in your HTTP routes:

```ts
http.route({
  path: "/vfs/exec",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "vfsExec",
    });
    if (!rl.ok) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.retryAfter ?? 60000) / 1000)) },
      });
    }
    // ... execute VFS command
  }),
});
```

## Limitations

- Maximum 1,000 files per component instance (Convex query limits). For larger datasets, use multiple component instances or paginate.
- Full-text search uses Convex search indexes, which have their own query limits.
- The shell engine loads all files per command execution. This is fast for hundreds of files but not designed for tens of thousands.
- No write commands (`touch`, `mkdir`, `rm`). Use the client API for mutations.
- No piping or command chaining (`|`, `&&`, `;`). Each command runs independently.
- Component HTTP actions do not have access to `ctx.auth`. Implement auth in your app's HTTP layer.

## Development

```bash
# Install dependencies
npm install

# Generate component code and build
npm run build:codegen

# Run in dev mode (watches for changes)
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck
```

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed npm publish instructions.

## License

Apache-2.0
