# OpenCode Integration

> This framework includes full OpenCode support with agents, commands, skills, and plugins.

---
Type: post
Date: 2026-01-10
Reading time: 4 min read
Tags: opencode, plugins, terminal
---

## OpenCode Integration

OpenCode is an AI-first development tool that works alongside Claude Code and Cursor. This framework includes full OpenCode support with agents, commands, skills, and plugins.

---

### How OpenCode works

```
+------------------+    +-------------------+    +------------------+
|  User request    |--->|  Orchestrator     |--->|  Specialist      |
|  "Create a post" |    |  Agent routes     |    |  Agent executes  |
|                  |    |  to specialist    |    |  the task        |
+------------------+    +-------------------+    +--------+---------+
                                                         |
                                                         v
+------------------+    +-------------------+    +------------------+
|  Result          |<---|  Skills provide   |<---|  Commands wrap   |
|  returned to     |    |  context and      |    |  npm scripts     |
|  user            |    |  documentation    |    |  for quick access|
+------------------+    +-------------------+    +------------------+
```

1. User makes a request in OpenCode
2. Orchestrator agent analyzes and routes the task
3. Specialist agent (content-writer or sync-manager) handles it
4. Skills provide documentation context
5. Commands offer quick keyboard shortcuts
6. Plugins automate common workflows

### Directory structure

OpenCode configuration lives in `.opencode/` alongside existing `.claude/` and `.cursor/` directories:

```
.opencode/
├── config.json           # OpenCode app configuration
├── agent/
│   ├── orchestrator.md   # Main routing agent
│   ├── content-writer.md # Content creation specialist
│   └── sync-manager.md   # Sync and deployment specialist
├── command/
│   ├── sync.md           # /sync command
│   ├── sync-prod.md      # /sync-prod command
│   ├── create-post.md    # /create-post command
│   ├── create-page.md    # /create-page command
│   ├── import.md         # /import command
│   └── deploy.md         # /deploy command
├── skill/
│   ├── frontmatter.md    # Frontmatter syntax reference
│   ├── sync.md           # How sync works
│   ├── convex.md         # Convex patterns
│   └── content.md        # Content management guide
└── plugin/
    └── sync-helper.ts    # Reminder plugin for content changes
```

### Available commands

Quick commands accessible via `/` prefix in OpenCode:

| Command        | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `/sync`        | Sync markdown content to development Convex    |
| `/sync-prod`   | Sync markdown content to production Convex     |
| `/create-post` | Create a new blog post with proper frontmatter |
| `/create-page` | Create a new static page                       |
| `/import`      | Import content from an external URL            |
| `/deploy`      | Full deployment workflow to production         |

### Agents

Three specialized agents handle different types of tasks:

**Orchestrator** (primary agent)

- Routes tasks to appropriate specialists
- Handles general code changes directly
- Coordinates multi-step workflows

**Content Writer** (subagent)

- Creates blog posts and pages
- Validates frontmatter
- Knows content directory structure
- Reminds you to run sync

**Sync Manager** (subagent)

- Executes sync commands
- Handles dev vs prod environments
- Troubleshoots sync issues
- Manages deployments

### Skills

Skills provide documentation context to agents:

| Skill       | Purpose                                       |
| ----------- | --------------------------------------------- |
| frontmatter | Complete frontmatter syntax for posts/pages   |
| sync        | How the sync system works end-to-end          |
| convex      | Convex patterns (indexes, mutations, queries) |
| content     | Content management workflows                  |

### Plugins

The sync-helper plugin provides automation:

```typescript
// When content files change, log a reminder
"file.edited": async (event) => {
  if (event.path.startsWith("content/")) {
    await client.app.log("info", "Content changed - run /sync to publish")
  }
}
```

Plugins hook into OpenCode events like file edits and session idle states.

### Getting started

1. Install OpenCode CLI (see [opencode.ai](https://opencode.ai))
2. Open your project directory
3. OpenCode automatically recognizes the `.opencode/` configuration
4. Use `/sync` after creating content

### Compatibility

This framework works with multiple AI development tools simultaneously:

| Tool        | Configuration Directory |
| ----------- | ----------------------- |
| OpenCode    | `.opencode/`            |
| Claude Code | `.claude/skills/`       |
| Cursor      | `.cursor/rules/`        |

All tools can be used without conflicts. Skills are duplicated (not shared) to ensure each tool works independently.

### Configuration files

| File                    | Purpose                    |
| ----------------------- | -------------------------- |
| `opencode.json`         | Root project configuration |
| `.opencode/config.json` | App-level settings         |

Example `opencode.json`:

```json
{
  "name": "markdown-publishing-framework",
  "description": "AI-first markdown publishing with Convex real-time sync",
  "plugin": []
}
```

### When to use OpenCode vs other tools

| Task                   | Recommended Tool              |
| ---------------------- | ----------------------------- |
| Quick content creation | OpenCode (`/create-post`)     |
| Complex code changes   | Claude Code or Cursor         |
| Sync workflows         | OpenCode (`/sync`, `/deploy`) |
| Debugging              | Any tool with your preference |

### Resources

- [OpenCode Documentation](https://opencode.ai/docs/)
- [OpenCode Plugins](https://opencode.ai/docs/plugins/)
- [OpenCode SDK](https://opencode.ai/docs/sdk/)
- [OpenCode Workflow Examples](https://github.com/CloudAI-X/opencode-workflow)