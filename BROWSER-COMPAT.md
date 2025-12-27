# Browser Compatibility Analysis

## Overview

n2words has **BigInt as a hard requirement** which cannot be polyfilled. This sets our minimum browser baseline.

**IMPORTANT**: The browser compatibility guarantees below apply to the **`dist/` UMD bundles** which are tested via automated browser tests. These are the builds that browser consumers should use when loading n2words via CDN or `<script>` tags.

## Minimum Browser Requirements

Based on BigInt support (non-polyfillable) and verified via `dist/` bundle tests:

- **Chrome**: 67+ (May 2018)
- **Firefox**: 68+ (July 2019)
- **Safari**: 14+ (September 2020)
- **Edge**: 79+ (January 2020)
- **Mobile**: Android Chrome 67+, iOS Safari 14+, Samsung Internet 8.2+, Opera Mobile 48+

**Global Coverage**: ~86% of all users worldwide (all in-use browsers with BigInt support, as of 2025)

**Note**: These requirements are tested and verified using the `dist/` UMD bundles via Selenium browser tests (`npm run test:web`).

## Tools & Commands

### Check Target Browsers

```bash
npm run browsers
```

Shows all browser versions targeted by our `.browserslistrc` configuration.

### Check Global Coverage

```bash
npm run browsers:coverage       # Coverage for our configured targets (~86%)
npm run browsers:dist           # Coverage for all BigInt-capable browsers (~96%)
```

Shows what percentage of global users are covered:

- `browsers:coverage`: Our `.browserslistrc` targets (~86%) - `defaults and supports bigint`
- `browsers:dist`: All browsers with BigInt support (~96%) - useful for comparison

### Verify Compatibility

```bash
npm run compat:check            # Verify lib/ source is ES2022 compatible
npm run compat:dist             # Verify dist/n2words.js browser compatibility
npm run test:web                # Run browser tests (Chrome, Firefox) on dist/
```

Analysis:

- `compat:check`: Verifies that `lib/` source code is compatible with ES2022 (for modern bundlers)
- `compat:dist`: Analyzes the built `dist/n2words.js` bundle for browser compatibility
- `test:web`: Runs full integration tests in real browsers using `dist/` UMD bundles (Chrome, Firefox via Selenium)

## Configuration Files

### `.browserslistrc`

Defines browser targets used by Babel and other tools:

```browserslistrc
# Target all in-use browsers that can run BigInt (non-polyfillable)
defaults and supports bigint
```

This query targets **all in-use browsers** (`defaults` = >0.5% usage, last 2 versions, Firefox ESR, not dead) that have BigInt support, providing ~86% global coverage while excluding obsolete browsers.

### `rollup.config.js`

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

## JavaScript Features Used

### Source Code (lib/) - For Modern Bundlers

Our `lib/` source code uses modern ES2022+ features:

- **ES2022**: Class fields
- **ES2020**: BigInt (hard requirement), optional chaining (`?.`), nullish coalescing (`??`)
- **ES2015+**: Classes, arrow functions, template literals, destructuring, spread operator

**Use case**: Modern bundler setups (Webpack, Vite, Rollup) that handle transpilation themselves

**Verified with**: `npm run compat:check`

### Built Bundle (dist/) - For Browser Consumers

Babel transpiles modern features down while preserving BigInt:

- **Preserved**: BigInt (required by browsers anyway)
- **Transpiled**: Optional chaining, nullish coalescing, class fields → ES2020 equivalents
- **Result**: Compatible with all BigInt-supporting browsers (Chrome 67+, Firefox 68+, Safari 14+, Edge 79+)

**Use case**: Direct browser usage via CDN or `<script>` tags

**Verified with**:

- `npm run compat:dist` - Static ES version checking
- `npm run test:web` - Real browser testing (Chrome, Firefox via Selenium)

## Why No Polyfills?

BigInt is a JavaScript primitive that **cannot be polyfilled**. Since it's fundamental to n2words (used throughout for large number handling), there's no benefit to polyfilling other features for browsers that can't run BigInt.

Our Babel configuration targets only browsers with BigInt support, resulting in:

✅ Smaller bundles (no unnecessary polyfills)  
✅ Better performance (less runtime overhead)  
✅ Honest compatibility (targets match actual requirements)

## Development Dependencies

- **`browserslist`**: Browser target management
- **`es-check`**: ECMAScript version compatibility checking
- **`@mdn/browser-compat-data`**: Browser compatibility data
- **`@babel/preset-env`**: Smart transpilation based on targets

## References

- [BigInt Browser Compatibility](https://caniuse.com/bigint)
- [Browserslist Documentation](https://github.com/browserslist/browserslist)
- [ES-Check Documentation](https://github.com/yowainwright/es-check)
