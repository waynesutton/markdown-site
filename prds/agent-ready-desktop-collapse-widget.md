# Agent ready desktop collapse widget update

## Problem

`@waynesutton/agent-ready@0.2.4` adds a desktop collapse feature for the widget. The app already has the current package range, but the widget mount only opts into the mobile collapse props.

## Root cause

The previous widget update covered the mobile collapse API from `0.2.0`. The current package README now documents `desktopCollapse` and the config key `widgetDesktopCollapse`, so the host app needs to wire the new desktop option too.

## Fix

Update `src/App.tsx` so `AgentReadyWidget` passes `desktopCollapse={true}` alongside the existing mobile collapse props.

## Files to change

- `src/App.tsx`
- `TASK.md`
- `changelog.md`
- `files.md`

## Edge cases

- Desktop users should get the caret toggle without changing the widget's desktop position, width, or theme.
- Mobile behavior should stay collapsed below 480px.
- Production URL resolution should continue to use `VITE_SITE_URL` or the browser origin fallback.

## Verification

1. Confirm npm latest is `@waynesutton/agent-ready@0.2.4`.
2. Run TypeScript typecheck.
3. Check that the widget mount includes both mobile and desktop collapse props.
