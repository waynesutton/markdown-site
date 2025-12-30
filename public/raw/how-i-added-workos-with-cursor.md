# How I added WorkOS to my Convex app with Cursor

> A timeline of adding WorkOS AuthKit authentication to my markdown blog dashboard using Cursor, prompt engineering, and vibe coding. From PRD import to published feature.

---
Type: post
Date: 2025-12-30
Reading time: 8 min read
Tags: cursor, workos, convex, prompt-engineering, ai-coding
---

# How I added WorkOS to my Convex app with Cursor

I added WorkOS AuthKit authentication to my markdown blog dashboard using Cursor, prompt engineering, and what I call vibe coding. Here's the timeline from start to published.

## The goal

Add optional WorkOS authentication to the `/dashboard` page. The dashboard should work with or without WorkOS configured. When authentication is enabled, users log in before accessing the dashboard.

## Timeline: start to published

### Step 1: Updated docs and cursor rules

I started by updating `content/pages/docs.md` with a dashboard section explaining how it works. Then I updated my Cursor rules to include WorkOS documentation patterns and Convex AuthKit integration guidelines.

The docs update gave me a clear picture of what I wanted to build. The cursor rules helped Cursor understand the patterns I use for authentication in Convex apps.

### Step 2: Imported PRD from Claude

I had a conversation with Claude about adding WorkOS to a Convex app. Claude generated a step-by-step PRD that covered:

- WorkOS account setup
- Environment variable configuration
- Convex auth configuration
- React component structure
- Route handling

I imported this PRD into my project at `prds/workos-authkit-dashboard-guide.md`. It became the blueprint for the entire feature.

### Step 3: Created a plan in Cursor

I opened Cursor and asked it to create a plan based on the PRD. Cursor analyzed the PRD and generated a structured plan file at `.cursor/plans/workos_setup_9603c983.plan.md`.

The plan broke down the work into specific tasks:

- Create Callback.tsx
- Add callback route to App.tsx
- Update Dashboard.tsx with auth protection
- Test the authentication flow

Each task had a clear status and description. This gave me a roadmap I could follow step by step.

### Step 4: Updated environment variables

I added WorkOS environment variables to `.env.local`:

```env
VITE_WORKOS_CLIENT_ID=client_01XXXXXXXXXXXXXXXXX
VITE_WORKOS_REDIRECT_URI=http://localhost:5173/callback
```

I also added `WORKOS_CLIENT_ID` to my Convex environment variables through the Convex dashboard. These variables connect the frontend and backend to WorkOS.

### Step 5: Cursor and Opus built the app

I started implementing the plan with Cursor. I asked it to create the Callback component first. Cursor generated `src/pages/Callback.tsx` with proper WorkOS auth handling.

Then I asked Cursor to update `src/App.tsx` to add the callback route. It added the route correctly, matching the existing route patterns.

For the Dashboard component, I asked Cursor to add authentication protection. It wrapped the dashboard content with `Authenticated`, `Unauthenticated`, and `AuthLoading` components from Convex React.

### Step 6: Debugged routes for dashboard page

The dashboard needed to work in two modes:

1. With WorkOS configured and `requireAuth: true` - requires login
2. Without WorkOS or with `requireAuth: false` - open access

I asked Cursor to implement conditional authentication. It created a utility function `isWorkOSConfigured()` that checks if WorkOS environment variables are set.

The Dashboard component now checks:

- If dashboard is disabled, show disabled message
- If auth is required but WorkOS isn't configured, show setup instructions
- If WorkOS isn't configured and auth isn't required, show dashboard directly
- If WorkOS is configured, use the auth flow

This conditional logic ensures the dashboard works whether WorkOS is set up or not.

### Step 7: Frontmatter integration

I wanted the dashboard authentication to be configurable via `siteConfig.ts`. I added a `dashboard` configuration object:

```typescript
dashboard: {
  enabled: true,
  requireAuth: false, // Set to true to require WorkOS authentication
},
```

Cursor helped me integrate this configuration into the Dashboard component. The component reads `siteConfig.dashboard.enabled` and `siteConfig.dashboard.requireAuth` to determine behavior.

### Step 8: Published and documented

After testing locally, I:

1. Deployed the changes to production
2. Updated `changelog.md` with the new feature
3. Updated `content/pages/changelog-page.md` with release notes
4. Created a blog post: "How to setup WorkOS"
5. Updated `files.md` with new file descriptions

The feature went live on December 29, 2025 as part of v1.45.0.

## What I learned about prompt engineering

### Start with documentation

Updating docs first helped me clarify what I wanted to build. When I asked Cursor to implement features, it had context from the docs to understand the patterns.

### Use PRDs as blueprints

The PRD from Claude became the single source of truth. Every implementation step referenced the PRD. This kept the work focused and prevented scope creep.

### Break work into small tasks

The plan file broke the work into specific, actionable tasks. Each task was small enough that Cursor could complete it in one go. This made progress visible and debugging easier.

### Iterate on prompts

When Cursor didn't get something right, I refined my prompts. Instead of "add authentication," I said "add WorkOS authentication that works with or without WorkOS configured, checking siteConfig.dashboard.requireAuth."

Specific prompts led to better results.

### Trust but verify

Cursor generated working code, but I tested each change. The conditional authentication logic needed manual verification to ensure it handled all cases correctly.

## The vibe coding experience

Vibe coding means working with AI tools in a flow state. You describe what you want, the AI generates code, you test it, and you iterate.

With Cursor, this felt natural:

1. I described the feature
2. Cursor generated the code
3. I tested it locally
4. I asked for refinements
5. We repeated until it worked

The back-and-forth felt like pair programming with a very fast partner who never gets tired.

## Key files created

- `src/pages/Callback.tsx` - Handles OAuth callback
- `src/utils/workos.ts` - WorkOS configuration utility
- `convex/auth.config.ts` - Convex auth configuration
- `prds/workos-authkit-dashboard-guide.md` - Step-by-step PRD
- `.cursor/plans/workos_setup_9603c983.plan.md` - Implementation plan

## Key files modified

- `src/main.tsx` - Added conditional WorkOS providers
- `src/App.tsx` - Added callback route handling
- `src/pages/Dashboard.tsx` - Added optional authentication
- `src/config/siteConfig.ts` - Added dashboard configuration
- `content/pages/docs.md` - Added dashboard documentation

## Result

The dashboard now supports optional WorkOS authentication. Users can:

- Use the dashboard without WorkOS (open access)
- Enable WorkOS authentication via `siteConfig.dashboard.requireAuth`
- See setup instructions if auth is required but WorkOS isn't configured

The implementation is clean, type-safe, and follows Convex best practices. It works whether WorkOS is configured or not.

## Takeaways

1. **Documentation first** - Writing docs clarifies requirements
2. **PRDs as blueprints** - Import PRDs to guide implementation
3. **Small tasks** - Break work into specific, actionable items
4. **Specific prompts** - Detailed prompts produce better code
5. **Test everything** - Verify AI-generated code works correctly
6. **Iterate quickly** - Use AI tools to move fast and refine

Adding WorkOS to my Convex app took a few hours from start to published. Most of that time was testing and refining. The actual coding was fast thanks to Cursor and good prompt engineering.

The [How to setup WorkOS](https://www.markdown.fast/how-to-setup-workos) is the setup guide covers everything you need to get started