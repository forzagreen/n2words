# Compatibility Guide

n2words requires **BigInt** which cannot be polyfilled. This sets our minimum baseline.

## Quick Reference

### Platform Support

| Platform           | Minimum Version | Global Coverage |
| ------------------ | --------------- | --------------- |
| **Node.js**        | 20.0.0          | N/A             |
| **Chrome**         | 67 (May 2018)   | ~65%            |
| **Firefox**        | 68 (July 2019)  | ~3%             |
| **Safari**         | 14 (Sep 2020)   | ~20%            |
| **Edge**           | 79 (Jan 2020)   | ~5%             |
| **Mobile Safari**  | 14.0            | Included        |
| **Chrome Android** | 67              | Included        |
| **Total Coverage** | -               | **~86%**        |

### Verification Commands

| Check                   | Command                         |
| ----------------------- | ------------------------------- |
| Browser targets         | `npm run browserslist`          |
| Browser coverage        | `npm run browserslist:coverage` |
| Browser compatibility   | `npm run compat:umd`            |
| Browser tests           | `npm run test:browsers`         |
| Node.js compatibility   | `npm run compat:node`           |

## Build Targets

### `lib/` (ESM Source)

- For modern bundlers (Webpack, Vite, Rollup) and Node.js
- ES2022+ features: class fields, BigInt, optional chaining
- Tree-shaking supported

### `dist/` (UMD Bundles)

- For direct browser use via CDN or `<script>` tags
- Transpiled to ES2020 (preserving BigInt)
- Tested in real browsers via Playwright

## Configuration

### Browser Targets (`.browserslistrc`)

```browserslist
defaults and supports bigint
```

### Node.js Version

- **Required**: `>=20` (from `package.json` engines field)
- **Recommended**: Use `.nvmrc` with `nvm use` or `fnm use`

## JavaScript Features

| Feature                    | Source (`lib/`) | Bundle (`dist/`) |
| -------------------------- | --------------- | ---------------- |
| BigInt                     | Required        | Required         |
| Class fields               | ES2022          | Transpiled       |
| Optional chaining (`?.`)   | ES2020          | Transpiled       |
| Nullish coalescing (`??`)  | ES2020          | Transpiled       |
