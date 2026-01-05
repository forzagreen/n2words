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

- **Maximum Language Coverage** — 52 languages including European, Asian, Middle Eastern, and regional variants
- **Zero Dependencies** — Pure JavaScript with no external runtime dependencies
- **Universal Compatibility** — Works in Node.js, browsers (via CDN), and all modern bundlers
- **Type-Safe** — Full TypeScript support with generated `.d.ts` declarations
- **Production Ready** — Comprehensive test coverage (unit, integration, browser, type checking)
- **BigInt Support** — Handle arbitrarily large numbers without precision loss
- **Flexible Input** — Accepts `number`, `bigint`, or `string` inputs
- **Tree-Shakable** — Import only the languages you need (~2-5 KB gzipped per language)
- **Browser Tested** — Verified in Chromium, Firefox, and WebKit via automated tests

## Contents

- [Quick Start](#quick-start)
- [Usage](#usage) — ESM, CommonJS, Browser (UMD)
- [Type Safety](#type-safety) — TypeScript support
- [Supported Languages](#supported-languages-52) — 52 languages with options
- [Browser Compatibility](#browser-compatibility) — Chrome 67+, Firefox 68+, Safari 14+, Edge 79+
- [Performance & Bundle Size](#performance--bundle-size) — Tree-shaking and benchmarks
- [Examples](#examples) — Basic, gender agreement, language-specific features
- [Documentation](#documentation) — Guides and API reference
- [Contributing](#contributing) — How to contribute
- [License](#license)

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
import { en } from 'n2words'
```

**CommonJS (Node.js):**

n2words is an ES module. For CommonJS environments, use dynamic import:

```js
// Promise-based
import('n2words').then(({ en }) => {
  console.log(en(42))  // 'forty-two'
})

// Or use async function
async function convertNumber(num) {
  const { en } = await import('n2words')
  return en(num)
}
```

**Browser (UMD via CDN):**

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  n2words.en(42)  // 'forty-two'
  n2words.es(123) // 'ciento veintitrés'
</script>
```

## Type Safety

Full TypeScript support via JSDoc annotations and generated type definitions - works in both JavaScript and TypeScript projects with IntelliSense and type checking:

```typescript
import { en, ar, zhHans } from 'n2words'

// All converters accept: number | bigint | string
en(42)       // ✓ number → 'forty-two'
en('123')    // ✓ string → 'one hundred and twenty-three'
en(100n)     // ✓ BigInt → 'one hundred'

// Language-specific options with type checking
ar(1, { gender: 'feminine' })  // ✓ 'واحدة' (feminine form)
zhHans(123, { formal: false }) // ✓ '一百二十三' (common style)
```

**Type Definitions:**

n2words includes TypeScript declaration files (`.d.ts`) generated from JSDoc annotations. No separate `@types` package needed.

## Supported Languages (52)

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

| Code      | Language            | Options | Code      | Language            | Options |
| --------- | ------------------- | ------- | --------- | ------------------- | ------- |
| `am`      | Amharic             |         | `am-Latn` | Amharic Latin       |         |
| `ar`      | Arabic              | ✓       | `az`      | Azerbaijani         |         |
| `bn`      | Bengali             |         | `cs`      | Czech               | ✓       |
| `da`      | Danish              | ✓       | `de`      | German              |         |
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

22 languages support additional options. Common options include:

**`gender`** (`'masculine'` | `'feminine'`) - 13 languages
Arabic, Biblical Hebrew, Croatian, Czech, Latvian, Lithuanian, Polish, Romanian, Russian, Serbian (both scripts), Spanish, Ukrainian

**`formal`** (`boolean`) - 2 languages
Simplified Chinese, Traditional Chinese - Toggle between formal/financial and common numerals

**Other options:**

- Dutch: `includeOptionalAnd`, `accentOne`, `noHundredPairing`
- French/French Belgium: `withHyphenSeparator`
- Hebrew (Modern & Biblical): `andWord`
- Turkish: `dropSpaces`
- Danish: `ordFlag` (ordinal numbers)
- Arabic: `negativeWord` (custom negative word)

## Browser Compatibility

**Minimum Requirements** (due to BigInt):

- **Node.js**: 20 or above
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (desktop + mobile)
- **Global Coverage**: ~86% of all users worldwide

**Note**: BigInt is a hard requirement and cannot be polyfilled. Older browsers are not supported.

**Build options:**

- **Browser CDN**: Use `dist/n2words.js` (pre-built UMD, tested in real browsers)
- **Node.js/Bundlers**: Use `lib/` source (ES modules, tree-shakable)

[See detailed compatibility guide →](COMPATIBILITY.md)

## Performance & Bundle Size

### Bundle Size Comparison

| Import Strategy              | Bundle Size (Minified) | Gzipped  | Languages Included |
| ---------------------------- | ---------------------- | -------- | ------------------ |
| All languages (UMD)          | ~92 KB                 | ~23 KB   | All 52             |
| Single language (UMD)        | ~4-6 KB                | ~2 KB    | 1                  |
| Tree-shaken (ESM, 1 lang)    | ~4-5 KB                | ~2 KB    | 1                  |
| Tree-shaken (ESM, 3 langs)   | ~12-15 KB              | ~4-5 KB  | 3                  |
| Tree-shaken (ESM, 10 langs)  | ~40-50 KB              | ~12-15 KB| 10                 |

### Performance Characteristics

- **Fast**: Sub-millisecond conversion for most numbers
- **Efficient**: Zero dependencies, minimal memory footprint
- **BigInt support**: Handles arbitrarily large numbers without precision loss
- **Memory-efficient**: ~2 KB overhead per language when tree-shaken

**Tree-shaking example:**

```js
// Import only what you need - bundler only includes used languages
import { en, es } from 'n2words'
// Final bundle: ~4-5 KB gzipped (only English + Spanish + core)
```

**Run benchmarks:**

```bash
npm run bench:perf    # Performance benchmarks (ops/sec)
npm run bench:memory  # Memory usage benchmarks
```

## Examples

### Basic Conversions

```js
import { en } from 'n2words'

// Basic numbers
en(0)        // 'zero'
en(42)       // 'forty-two'
en(1000000)  // 'one million'

// Decimals & negatives
en(3.14)     // 'three point one four'
en(-42)      // 'minus forty-two'

// Large numbers & BigInt
en(1234567890)        // 'one billion...'
en(123456789012345n)  // Works with arbitrarily large integers
```

### Gender Agreement

```js
import { es, ar, ru } from 'n2words'

// Spanish: masculine vs feminine
es(1)                       // 'uno' (masculine, default)
es(1, { gender: 'feminine' })  // 'una'
es(21)                      // 'veintiuno'
es(21, { gender: 'feminine' }) // 'veintiuna'

// Arabic: rich gender system
ar(1)                       // 'واحد' (masculine, default)
ar(1, { gender: 'feminine' })  // 'واحدة'

// Russian: gender for numerals
ru(1)                       // 'один' (masculine, default)
ru(1, { gender: 'feminine' })  // 'одна'
```

### Language-Specific Features

```js
import { zhHans, zhHant, ja, nl, fr } from 'n2words'

// Chinese: formal (financial) vs common numerals
zhHans(123)                  // '壹佰贰拾叁' (formal, default)
zhHans(123, { formal: false }) // '一百二十三' (common)

zhHant(456)                  // '肆佰伍拾陸' (formal, default)
zhHant(456, { formal: false }) // '四百五十六' (common)

// Japanese: digit-by-digit decimals
ja(3.14)  // '三点一四'

// Dutch: flexible formatting
nl(123)                              // 'honderddrieëntwintig'
nl(101, { includeOptionalAnd: true }) // 'honderdeneen'
nl(1, { accentOne: false })          // 'een' (unaccented)

// French: hyphen options
fr(123)                              // 'cent vingt-trois'
fr(123, { withHyphenSeparator: true }) // 'cent-vingt-trois'
```

### Input Flexibility

```js
import { en } from 'n2words'

// Multiple input types
en(42)      // number → 'forty-two'
en('42')    // string → 'forty-two'
en(42n)     // BigInt → 'forty-two'

// Decimal and negative strings
en('3.14')  // 'three point one four'
en('-42')   // 'minus forty-two'

// Large BigInts (no precision loss)
en(999999999999999999999999n)  // Accurate conversion
```

## Documentation

- **[Compatibility Guide](COMPATIBILITY.md)** - Browser and Node.js compatibility
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
