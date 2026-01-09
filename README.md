# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/ci.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/coveralls/github/forzagreen/n2words)](https://coveralls.io/github/forzagreen/n2words)
[![npm version](https://img.shields.io/npm/v/n2words)](https://npmjs.com/package/n2words)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/n2words)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/n2words)](https://bundlephobia.com/package/n2words)
[![npm downloads](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/n2words)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 52 languages with zero dependencies.**

## Why n2words?

- **52 Languages** — European, Asian, Middle Eastern, and regional variants
- **Zero Dependencies** — Pure JavaScript, works everywhere (Node.js, browsers, bundlers)
- **Type-Safe** — Full TypeScript support with generated `.d.ts` declarations
- **BigInt Support** — Handle arbitrarily large numbers without precision loss
- **High Performance** — 1M+ ops/sec, ~1.4 KB gzipped per language

## Quick Start

```bash
npm install n2words
```

```js
import { en, es, ar } from 'n2words'

en(123)                       // 'one hundred and twenty-three'
es(123)                       // 'ciento veintitrés'
ar(1, { gender: 'feminine' }) // 'واحدة' (with options)
```

## Usage

**ESM (Node.js, modern bundlers):**

```js
// Named imports (tree-shakable)
import { en, es } from 'n2words'

// Subpath imports (smallest bundle, recommended for single language)
import { toWords } from 'n2words/en'
import { toWords as esWords } from 'n2words/es'
```

**Browser (CDN):**

Individual language bundles are recommended for browsers (~1.4 KB gzipped each).

```html
<!-- ESM (recommended for modern browsers) -->
<script type="module">
  import { toWords } from 'https://cdn.jsdelivr.net/npm/n2words/dist/languages/en.js'
  console.log(toWords(42))  // 'forty-two'
</script>

<!-- Multiple ESM languages -->
<script type="module">
  import { toWords as en } from 'https://cdn.jsdelivr.net/npm/n2words/dist/languages/en.js'
  import { toWords as es } from 'https://cdn.jsdelivr.net/npm/n2words/dist/languages/es.js'
  console.log(en(42))  // 'forty-two'
  console.log(es(42))  // 'cuarenta y dos'
</script>

<!-- UMD (for legacy script tags) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/languages/en.umd.js"></script>
<script>
  n2words.en(42)  // 'forty-two'
</script>

<!-- Multiple UMD bundles (extend the same n2words global) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/languages/en.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/languages/es.umd.js"></script>
<script>
  n2words.en(42)   // 'forty-two'
  n2words.es(42)   // 'cuarenta y dos'
</script>
```

> **Note:** Installing from GitHub requires running `npm run build` after install.
> For production use, install from npm: `npm install n2words`

## Supported Languages (52)

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

| Code      | Language            | Options | Code      | Language            | Options |
| --------- | ------------------- | ------- | --------- | ------------------- | ------- |
| `am`      | Amharic             |         | `am-Latn` | Amharic Latin       |         |
| `ar`      | Arabic              | ✓       | `az`      | Azerbaijani         |         |
| `bn`      | Bengali             |         | `cs`      | Czech               |         |
| `da`      | Danish              |         | `de`      | German              |         |
| `el`      | Greek               |         | `en`      | English             |         |
| `es`      | Spanish             | ✓       | `fa`      | Persian             |         |
| `fi`      | Finnish             |         | `fil`     | Filipino            |         |
| `fr`      | French              | ✓       | `fr-BE`   | Belgian French      | ✓       |
| `gu`      | Gujarati            |         | `ha`      | Hausa               |         |
| `hbo`     | Biblical Hebrew     | ✓       | `he`      | Modern Hebrew       | ✓       |
| `hi`      | Hindi               |         | `hr`      | Croatian            | ✓       |
| `hu`      | Hungarian           |         | `id`      | Indonesian          |         |
| `it`      | Italian             |         | `ja`      | Japanese            |         |
| `kn`      | Kannada             |         | `ko`      | Korean              |         |
| `lt`      | Lithuanian          | ✓       | `lv`      | Latvian             | ✓       |
| `mr`      | Marathi             |         | `ms`      | Malay               |         |
| `nb`      | Norwegian Bokmål    |         | `nl`      | Dutch               | ✓       |
| `pa`      | Punjabi             |         | `pl`      | Polish              | ✓       |
| `pt`      | Portuguese          |         | `ro`      | Romanian            | ✓       |
| `ru`      | Russian             | ✓       | `sr-Cyrl` | Serbian Cyrillic    | ✓       |
| `sr-Latn` | Serbian Latin       | ✓       | `sv`      | Swedish             |         |
| `sw`      | Swahili             |         | `ta`      | Tamil               |         |
| `te`      | Telugu              |         | `th`      | Thai                |         |
| `tr`      | Turkish             | ✓       | `uk`      | Ukrainian           | ✓       |
| `ur`      | Urdu                |         | `vi`      | Vietnamese          |         |
| `zh-Hans` | Chinese Simplified  | ✓       | `zh-Hant` | Chinese Traditional | ✓       |

### Language Options

19 languages support additional options. Common options include:

**`gender`** (`'masculine'` | `'feminine'`) - 12 languages
Arabic, Biblical Hebrew, Croatian, Latvian, Lithuanian, Polish, Romanian, Russian, Serbian (both scripts), Spanish, Ukrainian

**`formal`** (`boolean`) - 2 languages
Simplified Chinese, Traditional Chinese - Toggle between formal/financial and common numerals

**Other options:**

- Dutch: `includeOptionalAnd`, `accentOne`, `noHundredPairing`
- French/Belgian French: `withHyphenSeparator`
- Hebrew (Modern & Biblical): `andWord`
- Turkish: `dropSpaces`
- Arabic: `negativeWord` (custom negative word)

## Browser Compatibility

**Minimum Requirements** (due to BigInt):

- **Node.js**: 20 or above
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (desktop + mobile)
- **Global Coverage**: ~86% of all users worldwide

**Note**: BigInt is a hard requirement and cannot be polyfilled. Older browsers are not supported.

**Build options:**

- **Browser CDN (ESM)**: Use `dist/*.js` (individual language modules, recommended)
- **Browser CDN (UMD)**: Use `dist/*.umd.js` (for legacy `<script>` tags)
- **Node.js/Bundlers**: Use `src/` source (ES modules, tree-shakable)

## Performance & Bundle Size

### Bundle Size Comparison

| Import Strategy                | Bundle Size | Gzipped   | Languages |
| ------------------------------ | ----------- | --------- | --------- |
| **Subpath import (ESM)** ⭐    | ~3 KB       | ~1.4 KB   | 1         |
| Single language (UMD)          | ~3-5 KB     | ~1.4-2 KB | 1         |
| Named imports (ESM, 1 lang)    | ~3-5 KB     | ~1.4-2 KB | 1         |
| Named imports (ESM, 3 langs)   | ~9-15 KB    | ~4-6 KB   | 3         |
| Named imports (ESM, 10 langs)  | ~30-50 KB   | ~10-15 KB | 10        |

### Performance Characteristics

- **1M+ ops/sec**: Most languages exceed 1 million conversions per second
- **Sub-millisecond**: Typical conversion takes < 1 microsecond
- **Low memory**: ~500-800 bytes per conversion (no allocations for small numbers)
- **BigInt optimized**: Uses BigInt modulo instead of string manipulation
- **Precomputed tables**: Common segments (0-999) precomputed at module load

**Subpath imports (recommended for single language):**

```js
// Smallest possible bundle - no barrel file overhead
import { toWords } from 'n2words/en'
toWords(42)  // 'forty-two'
// Final bundle: ~1.4 KB gzipped
```

**Named imports (for multiple languages):**

```js
// Bundler tree-shakes unused languages
import { en, es } from 'n2words'
// Final bundle: ~3-4 KB gzipped (English + Spanish)
```

**Run benchmarks:**

```bash
npm run bench:perf    # Performance benchmarks (ops/sec)
npm run bench:memory  # Memory usage benchmarks
```

## Examples

```js
import { en, es, ar, zhHans } from 'n2words'

// Basic conversions
en(42)           // 'forty-two'
en(3.14)         // 'three point one four'
en(-1000000)     // 'minus one million'

// Input types: number, string, or BigInt
en('42')         // 'forty-two'
en(42n)          // 'forty-two'
en(999999999999999999999999n)  // Works with arbitrarily large integers

// Gender agreement (12 languages)
es(1)                          // 'uno' (masculine, default)
es(1, { gender: 'feminine' })  // 'una'
ar(1, { gender: 'feminine' })  // 'واحدة'

// Chinese: formal (financial) vs common numerals
zhHans(123)                    // '壹佰贰拾叁' (formal, default)
zhHans(123, { formal: false }) // '一百二十三' (common)
```

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute and add languages
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards

## Contributing

We welcome contributions! Add a new language or improve existing ones:

```bash
npm run lang:add <code>         # Scaffold a new language (BCP 47 code)
npm test                        # Run full test suite
```

Also welcome: bug reports, feature requests, documentation improvements, and language enhancements.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

**[See full contributing guide →](CONTRIBUTING.md)**

## License

[MIT](./LICENSE) © Wael TELLAT, Tyler Vigario & contributors
