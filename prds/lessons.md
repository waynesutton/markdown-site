# Lessons

Patterns learned from corrections. Updated after any mistake to prevent repeats.

## Format

Each entry:

```
## YYYY-MM-DD - [short label]

**What happened**: Brief description of the mistake or confusion.
**Root cause**: Why it happened.
**Rule going forward**: The specific behavior change to prevent it.
```

---

<!-- Add new lessons below this line -->

## 2026-04-14: Trust installed package exports over docs for preview releases

**What happened**: Updated `convex/auth.ts` to use `password` and `github` from `@robelest/convex-auth/providers` per the docs at `auth.estifanos.com`. Bundler failed: the installed `0.0.4-preview.25` only exports PascalCase `Password` (a class) and `OAuth` (a factory). No first-party `github` provider ships yet. Also tried calling `Password()` without `new`, which failed at push analysis.
**Root cause**: Copied doc examples verbatim without inspecting `node_modules/@robelest/convex-auth/dist/providers/index.js`. Docs site described an upcoming API not yet in the preview package.
**Rule going forward**: For preview packages, always inspect actual exports in `node_modules` before writing imports. For `@robelest/convex-auth`, use `new Password()` and keep `OAuth(new GitHub(...), { profile })` from `arctic` until first-party providers ship. Added this check to `.cursor/skills/robel-auth/SKILL.md` under "Published package reality check".
