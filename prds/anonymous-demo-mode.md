# Anonymous dashboard demo mode

## Problem

Users visiting the site cannot see the dashboard or understand how it works without being a GitHub-authenticated admin. There is no way to try the CMS before setting up auth. We need a "try before you buy" experience where anonymous visitors can explore the full dashboard UI, see existing content (read-only), and create temporary posts/pages to test the editor, without any risk to admin content or security.

## Proposed solution

Add a "demo mode" to the dashboard that activates when a visitor is not authenticated. The visitor sees the full dashboard UI with restrictions:

- **View only** on all admin-created content (posts, pages, wiki)
- **Create/edit/delete** only on demo-tagged content (`source: "demo"`)
- **Blocked features**: AI, file uploads, config, sync, import, newsletter, sources, media
- **Hourly cleanup cron** deletes all `source: "demo"` content
- **Content sanitization** strips scripts, iframes, event handlers, and limits size
- **Persistent banner** tells the user their content resets every hour

## Files to change

### Backend (Convex)

| File | Change |
|------|--------|
| `convex/schema.ts` | Extend `source` union on posts and pages to include `"demo"` |
| `convex/demo.ts` (new) | Demo CRUD mutations + sanitization + cleanup internal mutation |
| `convex/crons.ts` | Add hourly cron for demo content cleanup |
| `convex/posts.ts` | Skip `source === "demo"` rows during sync |
| `convex/pages.ts` | Skip `source === "demo"` rows during sync |

### Frontend

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add demo mode gate, isDemo prop, section gating, demo mutations, banner |
| `src/components/Layout.tsx` | Add "Dashboard" text label next to nav icon |

## Edge cases

- Demo user creates a slug that collides with admin content: prevented by `demo-` prefix enforcement
- Demo content appears in public RSS/sitemap: prevented by `unlisted: true` + `showInNav: false`
- Demo user tries XSS via markdown content: server-side sanitization strips dangerous tags and attributes
- Cron deletes content while demo user is editing: user sees a "content not found" state, which is acceptable for a demo
- Multiple demo users create conflicting slugs: each gets a unique slug via timestamp suffix
- Demo content count grows large between cron runs: bounded by `.take(200)` per cleanup run, cron runs hourly

## Security

- No file uploads from demo mutations (no `ctx.storage` calls)
- Content sanitized server-side before insert/update
- Demo mutations never touch non-demo content (enforced by source check)
- All existing admin mutations still require `requireDashboardAdmin`
- Demo slugs prefixed with `demo-` to prevent admin slug collisions

## Verification steps

1. Visit `/dashboard` without being logged in: see demo mode with banner
2. Create a demo post: appears in list with `source: "demo"`, slug starts with `demo-`
3. Edit demo post: works. Try editing admin post: blocked
4. Try accessing AI, Media, Config, Sync, Import sections: blocked with sign-in prompt
5. Wait for cron or manually trigger cleanup: demo content deleted
6. Log in as admin: full dashboard, no demo restrictions
7. Run `npx convex-doctor@latest`: score stays at 100/100
