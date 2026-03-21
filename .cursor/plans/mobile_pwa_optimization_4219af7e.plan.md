---
name: Mobile PWA Optimization
overview: Add full mobile iOS/Android optimization and PWA support with automatic manifest.json generation from fork-config.json, iOS/Android meta tags, safe area CSS, and touch optimizations.
todos:
  - id: update-fork-config-interface
    content: Add optional pwa field to ForkConfig interface in scripts/configure-fork.ts
    status: pending
  - id: add-manifest-generation
    content: Create updateManifestJson() function to generate public/manifest.json from fork-config.json
    status: pending
    dependencies:
      - update-fork-config-interface
  - id: update-index-html-generation
    content: Enhance updateIndexHtml() to add iOS/Android meta tags and manifest link
    status: pending
    dependencies:
      - update-fork-config-interface
  - id: add-mobile-css
    content: Add safe area insets, touch optimizations, and input zoom prevention to src/styles/global.css
    status: pending
  - id: update-fork-config-example
    content: Add optional pwa section to fork-config.json.example
    status: pending
  - id: update-netlify-headers
    content: Add manifest.json headers to netlify.toml
    status: pending
  - id: wire-up-manifest-generation
    content: Call updateManifestJson() in main() function of configure-fork.ts
    status: pending
    dependencies:
      - add-manifest-generation
  - id: update-documentation
    content: Update fork-configuration-guide.md with PWA configuration section
    status: pending
isProject: false
---

# Mobile and PWA Optimization Plan

## Overview

Add full mobile iOS/Android optimization and Progressive Web App (PWA) support. The manifest.json will be automatically generated from `fork-config.json` during the configure step, so users don't need to manually set it up.

## Implementation Steps

### 1. Update ForkConfig Interface

Add optional PWA configuration to `scripts/configure-fork.ts`:

```typescript
interface ForkConfig {
  // ... existing fields ...
  pwa?: {
    shortName?: string; // Short name for home screen (max 12 chars)
    themeColor?: string; // Theme color (default: "#faf8f5")
    backgroundColor?: string; // Background color (default: "#faf8f5")
  };
}
```

### 2. Add manifest.json Generation Function

Create `updateManifestJson()` function in `scripts/configure-fork.ts`:

- Generate `public/manifest.json` with values from `fork-config.json`
- Use `siteName` for full name, `pwa.shortName` or truncated `siteName` for short name
- Use `siteDescription` for description
- Use `pwa.themeColor` and `pwa.backgroundColor` with defaults
- Include icon references (favicon.svg, icon-192.png, icon-512.png)
- Set `display: "standalone"` for home screen app behavior
- Set `orientation: "portrait-primary"`

### 3. Update index.html Generation

Enhance `updateIndexHtml()` function in `scripts/configure-fork.ts`:

- Update viewport meta tag to include `viewport-fit=cover` for iOS notches
- Add manifest link: `<link rel="manifest" href="/manifest.json" />`
- Add iOS meta tags:
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `apple-mobile-web-app-title`
- `apple-touch-icon` link
- Add Android meta tags:
- `mobile-web-app-capable`
- Enhanced `theme-color` with media queries for light/dark
- Update existing `theme-color` meta tag to support both light and dark modes

### 4. Add Mobile CSS Optimizations

Update `src/styles/global.css`:**Safe Area Insets (iOS notches):**

- Add `@supports (padding: max(0px))` blocks for safe area insets
- Apply to `.main-content`, `.top-nav`, `.mobile-menu-drawer`
- Use `env(safe-area-inset-*)` CSS variables

**Touch Optimizations:**

- Add `-webkit-tap-highlight-color: transparent` globally
- Add `touch-action: manipulation` to interactive elements
- Add `user-select: none` to buttons
- Add `-webkit-touch-callout: none` to buttons

**Prevent Input Zoom (iOS):**

- Ensure all `input`, `textarea`, `select` have `font-size: 16px` minimum
- Add mobile-specific rule to prevent zoom on focus

### 5. Update fork-config.json.example

Add optional PWA section:

```json
{
  // ... existing fields ...
  "pwa": {
    "shortName": "Your Site",
    "themeColor": "#faf8f5",
    "backgroundColor": "#faf8f5"
  }
}
```

### 6. Update netlify.toml

Add headers for manifest.json:

```toml
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=3600"
```

### 7. Update configure-fork.ts Main Function

Add `updateManifestJson(config)` call in `main()` function after `updateAiPluginJson(config)`.

### 8. Update Documentation

Update `content/blog/fork-configuration-guide.md`:

- Add PWA section explaining optional `pwa` fields
- Note that manifest.json is auto-generated
- Mention icon file requirements (icon-180.png, icon-192.png, icon-512.png)

## Files to Modify

1. `scripts/configure-fork.ts` - Add manifest generation, update index.html generation, add PWA interface
2. `fork-config.json.example` - Add optional PWA fields
3. `src/styles/global.css` - Add safe area insets and touch optimizations
4. `netlify.toml` - Add manifest.json headers
5. `content/blog/fork-configuration-guide.md` - Document PWA configuration

## User Requirements

After running `npm run configure`, users need to:

1. Add icon files to `public/images/`:

- `icon-180.png` (180x180) - iOS home screen
- `icon-192.png` (192x192) - Android
- `icon-512.png` (512x512) - Android splash

The manifest.json will be automatically generated with correct values from their fork-config.json.

## Benefits

- Zero manual setup for manifest.json (auto-generated)
- Full iOS/Android home screen support
- Safe area support for notched devices
