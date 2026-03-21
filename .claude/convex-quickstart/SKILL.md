---
name: convex-quickstart
description: Initialize a new Convex project from scratch or add Convex to an existing app. Use when starting a new project with Convex, scaffolding a Convex app, or integrating Convex into an existing frontend.
---

# Convex Quickstart

Set up a working Convex project as fast as possible.

## When to Use

- Starting a brand new project with Convex
- Adding Convex to an existing React, Next.js, Vue, Svelte, or other app
- Scaffolding a Convex app for prototyping

## When Not to Use

- The project already has Convex installed and `convex/` exists: just start building
- You only need to add auth to an existing Convex app: use the `convex-setup-auth` skill

## Workflow

1. Determine the starting point: new project or existing app
2. If new project, pick a template and scaffold with `npm create convex@latest`
3. If existing app, install `convex` and wire up the provider
4. Run `npx convex dev` to connect a deployment and start the dev loop
5. Verify the setup works

## Path 1: New Project (Recommended)

### Pick a template

| Template | Stack |
|----------|-------|
| `react-vite-shadcn` | React + Vite + Tailwind + shadcn/ui |
| `nextjs-shadcn` | Next.js App Router + Tailwind + shadcn/ui |
| `react-vite-clerk-shadcn` | React + Vite + Clerk auth + shadcn/ui |
| `nextjs-clerk` | Next.js + Clerk auth |
| `nextjs-convexauth-shadcn` | Next.js + Convex Auth + shadcn/ui |
| `bare` | Convex backend only, no frontend |

Default to `react-vite-shadcn` for simple apps or `nextjs-shadcn` for apps that need SSR or API routes.

### Scaffold the project

Always pass the project name and template flag to avoid interactive prompts:

```bash
npm create convex@latest my-app -- -t react-vite-shadcn
cd my-app
npm install
```

### Start the dev loop

Ask the user to run `npx convex dev` in their terminal. On first run it will prompt them to log in or develop anonymously. Once running, it will:
- Create a Convex project and dev deployment
- Write the deployment URL to `.env.local`
- Create the `convex/` directory with generated types
- Watch for changes and sync continuously

## Path 2: Add Convex to an Existing App

### Install

```bash
npm install convex
```

### Wire up the provider

#### React (Vite)

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);
```

#### Next.js (App Router)

```tsx
// app/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

### Environment variables

| Framework | Variable |
|-----------|----------|
| Vite | `VITE_CONVEX_URL` |
| Next.js | `NEXT_PUBLIC_CONVEX_URL` |
| Remix | `CONVEX_URL` |
| React Native | `EXPO_PUBLIC_CONVEX_URL` |

## Writing Your First Function

`convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
});
```

`convex/tasks.ts`:

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text, completed: false });
  },
});
```

Use in a React component:

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function Tasks() {
  const tasks = useQuery(api.tasks.list);
  const create = useMutation(api.tasks.create);

  return (
    <div>
      <button onClick={() => create({ text: "New task" })}>Add</button>
      {tasks?.map((t) => <div key={t._id}>{t.text}</div>)}
    </div>
  );
}
```

## Checklist

- [ ] Determined starting point: new project or existing app
- [ ] If new project: scaffolded with `npm create convex@latest` using appropriate template
- [ ] If existing app: installed `convex` and wired up the provider
- [ ] User has `npx convex dev` running and connected to a deployment
- [ ] `convex/_generated/` directory exists with types
- [ ] `.env.local` has the deployment URL
- [ ] Verified a basic query/mutation round-trip works

Source: https://github.com/get-convex/agent-skills
