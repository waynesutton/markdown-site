---
name: function-creator
description: Create Convex queries, mutations, and actions with proper validation, authentication, and error handling. Use when implementing new API endpoints.
---

# Convex Function Creator

Generate secure, type-safe Convex functions following all best practices.

## When to Use

- Creating new query functions (read data)
- Creating new mutation functions (write data)
- Creating new action functions (external APIs, long-running)
- Adding API endpoints to your Convex backend

## Function Types

### Queries (Read-Only)

- Can only read from database
- Cannot modify data or call external APIs
- Cached and reactive
- Run in transactions

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(v.object({
    _id: v.id("tasks"),
    text: v.string(),
    completed: v.boolean(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});
```

### Mutations (Transactional Writes)

- Can read and write to database
- Cannot call external APIs
- Run in ACID transactions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: {
    text: v.string(),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("tasks", {
      text: args.text,
      priority: args.priority ?? "medium",
      completed: false,
      createdAt: Date.now(),
    });
  },
});
```

### Actions (External + Non-Transactional)

- Can call external APIs (fetch, AI, etc.)
- Can call mutations via `ctx.runMutation`
- Cannot directly access database
- **Use `"use node"` directive when needing Node.js APIs**

```typescript
"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateTaskSuggestion = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: args.prompt }],
    });

    const suggestion = completion.choices[0].message.content;

    await ctx.runMutation(api.tasks.createTask, { text: suggestion });
    return suggestion;
  },
});
```

**Note:** Keep queries and mutations in files without `"use node"`. Actions that need Node.js go in separate files with `"use node"`.

## Required Components

### 1. Argument Validation

**Always** define `args` with validators.

### 2. Return Type Validation

**Always** define `returns`.

### 3. Authentication Check

**Always** verify auth in public functions:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
```

### 4. Authorization Check

**Always** verify ownership/permissions:

```typescript
const task = await ctx.db.get(args.taskId);
if (!task) throw new Error("Task not found");
if (task.userId !== user._id) throw new Error("Unauthorized");
```

## Internal Functions

For backend-only functions (called by scheduler, other functions):

```typescript
import { internalMutation } from "./_generated/server";

export const processExpiredTasks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("tasks")
      .withIndex("by_due_date", q => q.lt("dueDate", now))
      .collect();

    for (const task of expired) {
      await ctx.db.patch(task._id, { status: "expired" });
    }
  },
});
```

## Checklist

- [ ] `args` defined with validators
- [ ] `returns` defined with validator
- [ ] Authentication check (`ctx.auth.getUserIdentity()`)
- [ ] Authorization check (ownership/permissions)
- [ ] All promises awaited
- [ ] Indexed queries (no `.filter()` on queries)
- [ ] Error handling with descriptive messages
- [ ] Scheduled functions use `internal.*` not `api.*`
- [ ] If using Node.js APIs: `"use node"` at top of file
- [ ] If file has `"use node"`: Only actions (no queries/mutations)

Source: https://github.com/get-convex/convex-agent-plugins
