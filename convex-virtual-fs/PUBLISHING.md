# Publishing

Publish `@convex-dev/virtual-fs` to npm so other developers can install it.

## Prerequisites

- An npmjs account with publish permissions for the `@convex-dev` scope
- Node.js 18+ and npm

## First time publish

1. Verify the package name in `package.json` matches `@convex-dev/virtual-fs`
2. Log in to npm:

```bash
npm login
```

3. Clean and rebuild:

```bash
rm -rf dist *.tsbuildinfo
npm ci
npm run build:codegen
```

4. Type check and test:

```bash
npm run typecheck
npm run test
```

5. Sanity check with a dry run:

```bash
npm pack
# Inspect the .tgz to verify contents
# Try installing in another project: npm install ./convex-dev-virtual-fs-0.1.0.tgz
rm *.tgz
```

6. Publish:

```bash
npm publish --access public
```

7. Tag and push:

```bash
git tag v0.1.0
git push --follow-tags
```

## Subsequent releases

### Patch release (bug fixes)

```bash
npm run release
```

This runs `npm version patch`, publishes, and pushes tags.

### Alpha release (testing)

```bash
npm run alpha
```

Publishes under the `@alpha` tag. Install with `npm install @convex-dev/virtual-fs@alpha`.

### Minor or major release

```bash
npm version minor  # or major
npm publish
git push --follow-tags
```

## Building a one-off package

```bash
npm run build:clean
npm pack
```

Share the `.tgz` file for local testing: `npm install ./path/to/convex-dev-virtual-fs-0.1.0.tgz`
