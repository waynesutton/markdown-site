# Core Development Guidelines Skill

Deep reflection and problem-solving methodology for full-stack Convex development.

## 1. Reflect deeply before acting

Before implementing any solution, follow this process:

1. **Reflect** - Carefully consider why the current implementation may not be working
2. **Identify** - What's missing, incomplete, or incorrect based on the request
3. **Theorize** - Different possible sources of the problem or areas requiring updates
4. **Distill** - Narrow down to 1-2 most probable root causes or solutions
5. **Proceed** - Only move forward after clear understanding

**Never assume.** If anything is unclear, ask questions and clarify.

## 2. Convex implementation guidelines

### Core principles

**Direct mutation pattern:**
- Use direct mutation calls with plain objects
- Create dedicated mutation functions that map form fields to database fields
- Form field names should exactly match database field names when applicable

**Best practices:**
- Patch directly without reading first
- Use indexed queries for ownership checks (not `ctx.db.get()`)
- Make mutations idempotent with early returns
- Use timestamp-based ordering for new items
- Use `Promise.all()` for parallel independent operations to avoid write conflicts

### Essential documentation

**Functions:**
- Mutations: https://docs.convex.dev/functions/mutation-functions
- Queries: https://docs.convex.dev/functions/query-functions
- Validation: https://docs.convex.dev/functions/validation
- General: https://docs.convex.dev/functions

**Core concepts:**
- Zen of Convex: https://docs.convex.dev/understanding/zen
- TypeScript best practices: https://docs.convex.dev/understanding/best-practices/typescript
- Best practices: https://docs.convex.dev/understanding/best-practices/
- Schema validation: https://docs.convex.dev/database/schemas

**Authentication:**
- WorkOS AuthKit: https://workos.com/docs/authkit/vanilla/nodejs
- WorkOS docs: https://workos.com/docs
- Convex + WorkOS setup: https://docs.convex.dev/auth/authkit/

## 3. Change scope and restrictions

### What to update

- Update Convex schema if needed
- Only update files directly necessary to fix the original request
- When tasks touch changelog.md, changelog page, or files.md:
  - Run `git log --date=short` to check commit history
  - Set release dates to match real commit timeline
  - No placeholders or future months

### What NOT to change

- Do not change UI, layout, design, or color styles unless specifically instructed
- Preserve all admin dashboard sections and frontend components unless explicitly told to update
- Never remove sections, features, or components unless directly requested

## 4. UI/UX guidelines

### Design system compliance

**For pop-ups, alerts, modals, warnings, notifications, and confirmations:**
- Always follow the site's existing design system
- Never use browser default pop-ups
- Use site design system components only

### Follow Vercel guidelines

https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/refs/heads/main/AGENTS.md

## 5. Documentation policy

**IMPORTANT:** Do NOT create documentation files unless explicitly instructed.

**Banned unless requested:**
- README.md
- CONTRIBUTING.md
- SUMMARY.md
- USAGE_GUIDELINES.md

You may include a brief summary in responses, but don't create separate documentation files.

**Formatting rules:**
- Never use emojis in readme or app unless instructed

## 6. Code confidence requirement

**98% confidence rule:**

Don't write any code until you're very confident (98% or more) in what needs to be done.

If unclear, ask for more information.

## Quick reference checklist

Before writing code:
- [ ] Have I reflected on the root cause?
- [ ] Do I understand what's actually broken?
- [ ] Am I 98% confident in the solution?
- [ ] Am I only changing files that need to change?
- [ ] Am I preserving existing UI/features not mentioned?
- [ ] Am I using the site's design system (not browser defaults)?
- [ ] Am I following Convex mutation best practices?
- [ ] Have I checked the relevant docs?

When uncertain:
- [ ] Ask clarifying questions
- [ ] Don't assume
- [ ] Reference documentation
- [ ] Narrow down to 1-2 most likely solutions
