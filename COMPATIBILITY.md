# Compatibility Guide

## Overview

n2words has **BigInt as a hard requirement** which cannot be polyfilled. This sets our minimum baseline for both browsers and Node.js.

This guide covers:

- **Browser Compatibility**: Requirements for using `dist/` UMD bundles
- **Node.js Compatibility**: Requirements for using `lib/` ESM source
- **Verification Tools**: Commands to check compatibility
- **Feature Support**: Which JavaScript features are used and where

## Browser Compatibility

**IMPORTANT**: The browser compatibility guarantees below apply to the **`dist/` UMD bundles** which are tested via automated browser tests. These are the builds that browser consumers should use when loading n2words via CDN or `<script>` tags.

### Minimum Browser Requirements

Based on BigInt support (non-polyfillable) and verified via `dist/` bundle tests:

- **Chrome**: 67+ (May 2018)
- **Firefox**: 68+ (July 2019)
- **Safari**: 14+ (September 2020)
- **Edge**: 79+ (January 2020)
- **Mobile**: Android Chrome 67+, iOS Safari 14+, Samsung Internet 8.2+, Opera Mobile 48+

**Global Coverage**: ~86% of all users worldwide (all in-use browsers with BigInt support, as of 2025)

**Testing**: These requirements are verified using the `dist/` UMD bundles via Selenium browser tests (`npm run test:web`).

## Node.js Compatibility

### Minimum Node.js Requirements

n2words requires **Node.js 20+** based on the ES2022+ features used in the `lib/` source code.

**Feature requirements:**

- **BigInt**: Node.js 10.4+ ([required](https://thecodebarbarian.com/an-overview-of-bigint-in-node-js.html))
- **Optional Chaining & Nullish Coalescing**: Node.js 14+ ([required](https://www.ioannispoulakas.com/2020/10/18/node-14-optional-chaining-and-nullish-coalescing/))
- **Class Fields**: Node.js 12+ ([required](https://thecodebarbarian.com/nodejs-12-private-class-fields.html))
- **ES Modules (ESM)**: Node.js 12+ (native support)

**Supported versions** (from `package.json` engines field):

```json
{
  "engines": {
    "node": "^20 || ^22 || >=24"
  }
}
```

**Active LTS versions** (as of 2025):

- Node.js 24 (Current)
- Node.js 22 (LTS)
- Node.js 20 (LTS)

**Version manager configuration:**

The project includes an `.nvmrc` file for automatic version selection with nvm/fnm:

```bash
# Using nvm
nvm use

# Using fnm
fnm use
```

## Tools & Commands

### Browser Compatibility Checks

#### Check Target Browsers

```bash
npm run browsers                # Show all targeted browser versions
npm run browsers:coverage       # Coverage for our configured targets (~86%)
```

**What they do:**

- `browsers`: Lists all browser versions from `.browserslistrc`
- `browsers:coverage`: Shows global coverage for `defaults and supports bigint`

#### Verify Browser Compatibility

```bash
npm run compat:web              # Verify dist/ bundles browser compatibility (ES version check)
npm run test:web                # Run real browser tests (Chrome, Firefox via Selenium)
```

**What they do:**

- `compat:web`: Static analysis of `dist/` bundles using es-check
- `test:web`: Full integration tests in real browsers on `dist/` bundles

### Node.js Compatibility Checks

#### Verify Source Compatibility

```bash
npm run compat:node             # Verify lib/ source is ES2022 compatible
```

**What it does:**

- Static analysis of `lib/` source code using es-check
- Ensures code is compatible with ES2022 specification
- Used for validating source before bundling

**Example output:**

```bash
$ npm run compat:node
info: ES-Check: checking 54 files...
info: ✓ ES-Check passed! All files are ES13 compatible.
```

**Note:** There is no automated script to check your Node.js version. To verify your Node.js version manually:

```bash
node --version                  # Check current Node.js version
```

Ensure it satisfies the `engines` field requirement: `^20 || ^22 || >=24`

## Configuration Files

### Browser Configuration

#### `.browserslistrc`

Defines browser targets used by Babel and other tools:

```browserslistrc
# Target all in-use browsers that can run BigInt (non-polyfillable)
defaults and supports bigint
```

This query targets **all in-use browsers** (`defaults` = >0.5% usage, last 2 versions, Firefox ESR, not dead) that have BigInt support, providing ~86% global coverage while excluding obsolete browsers.

#### `rollup.config.js`

Uses `.browserslistrc` automatically via `@babel/preset-env`:

```javascript
babel({
  presets: [
    ['@babel/preset-env', {
      // Uses .browserslistrc for targets
      modules: false
    }]
  ]
})
```

### Node.js Configuration

#### `package.json` engines field

Specifies supported Node.js versions:

```json
{
  "engines": {
    "node": "^20 || ^22 || >=24"
  }
}
```

This ensures:

- Package managers warn users on unsupported versions
- CI/CD can validate Node.js version requirements
- Documentation stays in sync with actual requirements

#### `.nvmrc`

Specifies the recommended Node.js version for development:

```text
lts/*
```

This configures version managers to use the **latest LTS (Long Term Support)** version, ensuring compatibility with the project's requirements while staying current with LTS releases.

This file is automatically read by:

- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)
- [fnm](https://github.com/Schniz/fnm) (Fast Node Manager)
- Various CI/CD platforms

**Usage:**

```bash
# Automatically switch to the latest LTS Node.js version
nvm use    # or: fnm use
```

## JavaScript Features Used

### Source Code (lib/) - For Modern Bundlers

Our `lib/` source code uses modern ES2022+ features:

- **ES2022**: Class fields
- **ES2020**: BigInt (hard requirement), optional chaining (`?.`), nullish coalescing (`??`)
- **ES2015+**: Classes, arrow functions, template literals, destructuring, spread operator

**Use case**: Modern bundler setups (Webpack, Vite, Rollup) that handle transpilation themselves

**Verified with**: `npm run compat:node`

### Built Bundle (dist/) - For Browser Consumers

Babel transpiles modern features down while preserving BigInt:

- **Preserved**: BigInt (required by browsers anyway)
- **Transpiled**: Optional chaining, nullish coalescing, class fields → ES2020 equivalents
- **Result**: Compatible with all BigInt-supporting browsers (Chrome 67+, Firefox 68+, Safari 14+, Edge 79+)

**Use case**: Direct browser usage via CDN or `<script>` tags

**Verified with**:

- `npm run compat:web` - Static ES version checking
- `npm run test:web` - Real browser testing (Chrome, Firefox via Selenium)

## Why No Polyfills?

BigInt is a JavaScript primitive that **cannot be polyfilled**. Since it's fundamental to n2words (used throughout for large number handling), there's no benefit to polyfilling other features for browsers that can't run BigInt.

Our Babel configuration targets only browsers with BigInt support, resulting in:

✅ Smaller bundles (no unnecessary polyfills)  
✅ Better performance (less runtime overhead)  
✅ Honest compatibility (targets match actual requirements)

## Development Dependencies

### Browser Compatibility Tools

- **`browserslist`**: Browser target management and querying
- **`es-check`**: ECMAScript version compatibility checking
- **`@mdn/browser-compat-data`**: Browser compatibility data
- **`@babel/preset-env`**: Smart transpilation based on targets
- **`selenium-webdriver`**: Real browser testing automation
- **`chromedriver`**: Chrome browser driver for Selenium

### Node.js Compatibility Tools

- **`es-check`**: ECMAScript version compatibility checking for source code

## References

### Browser Resources

- [BigInt Browser Compatibility](https://caniuse.com/bigint)
- [Browserslist Documentation](https://github.com/browserslist/browserslist)
- [ES-Check Documentation](https://github.com/yowainwright/es-check)

### Node.js Resources

- [BigInt in Node.js](https://thecodebarbarian.com/an-overview-of-bigint-in-node-js.html)
- [Optional Chaining & Nullish Coalescing in Node 14](https://www.ioannispoulakas.com/2020/10/18/node-14-optional-chaining-and-nullish-coalescing/)
- [Private Class Fields in Node.js 12](https://thecodebarbarian.com/nodejs-12-private-class-fields.html)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
