# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/test.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg)](https://coveralls.io/github/forzagreen/n2words)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 47 languages with zero dependencies.**

- 🌍 **47 languages** — Comprehensive international support
- 📦 **Zero dependencies** — Lightweight and fast
- 🧪 **Tested & validated** — Language modules validated and tested on every PR
- 📱 **Universal** — Node.js, browsers, ESM/CommonJS

## Quick Start

```bash
npm install n2words
```

```js
import { EnglishConverter, SpanishConverter, ArabicConverter } from 'n2words'

EnglishConverter(123)                  // 'one hundred and twenty-three'
SpanishConverter(123)                  // 'ciento veintitrés'
ArabicConverter(1, { feminine: true }) // 'واحدة' (with options)
```

## Usage

**ESM (Node.js, modern bundlers):**

```js
import { EnglishConverter } from 'n2words'
```

**CommonJS (Node.js):**

```js
const { EnglishConverter } = require('n2words')
```

**Browser (UMD via CDN):**

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  n2words.EnglishConverter(42)  // 'forty-two'
</script>
```

## Type Safety

Full TypeScript support via JSDoc annotations - works in both JavaScript and TypeScript projects with IntelliSense and type checking:

```typescript
import { EnglishConverter, ArabicConverter, SimplifiedChineseConverter } from 'n2words'

// All converters accept: number | bigint | string
EnglishConverter(42)       // ✓ number → 'forty-two'
EnglishConverter('123')    // ✓ string → 'one hundred and twenty-three'
EnglishConverter(100n)     // ✓ BigInt → 'one hundred'

// Language-specific options with type checking
ArabicConverter(1, { feminine: true })  // ✓ 'واحدة' (feminine form)
ArabicConverter(1, { invalid: true })   // ✗ TypeScript error: invalid property

SimplifiedChineseConverter(123, { formal: false })  // ✓ '一百二十三' (common style)
SimplifiedChineseConverter(123, { formal: 'yes' })  // ✗ TypeScript error: wrong type
```

**Exported Types:**

- `NumericValue` - Accepted input types: `number | bigint | string`
- Language-specific option types (e.g., `ArabicOptions`, `SimplifiedChineseOptions`, `DutchOptions`, etc.)

See the [API Reference](docs/API.md) for complete type documentation.

## Supported Languages (47 total)

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

| Code      | Language            | Code      | Language            |
| --------- | ------------------- | --------- | ------------------- |
| `ar`      | Arabic              | `az`      | Azerbaijani         |
| `bn`      | Bengali             | `cs`      | Czech               |
| `de`      | German              | `da`      | Danish              |
| `el`      | Greek               | `en`      | English             |
| `es`      | Spanish             | `fa`      | Persian             |
| `fr`      | French              | `fr-BE`   | Belgian French      |
| `gu`      | Gujarati            | `hbo`     | Biblical Hebrew     |
| `he`      | Modern Hebrew       | `hi`      | Hindi               |
| `hr`      | Croatian            | `hu`      | Hungarian           |
| `id`      | Indonesian          | `it`      | Italian             |
| `ja`      | Japanese            | `kn`      | Kannada             |
| `ko`      | Korean              | `lt`      | Lithuanian          |
| `lv`      | Latvian             | `mr`      | Marathi             |
| `ms`      | Malay               | `nl`      | Dutch               |
| `nb`      | Norwegian Bokmål    | `pa`      | Punjabi             |
| `pl`      | Polish              | `pt`      | Portuguese          |
| `ro`      | Romanian            | `ru`      | Russian             |
| `sr-Cyrl` | Serbian Cyrillic    | `sr-Latn` | Serbian Latin       |
| `sv`      | Swedish             | `sw`      | Swahili             |
| `ta`      | Tamil               | `te`      | Telugu              |
| `th`      | Thai                | `fil`     | Filipino            |
| `tr`      | Turkish             | `uk`      | Ukrainian           |
| `ur`      | Urdu                | `vi`      | Vietnamese          |
| `zh-Hans` | Chinese Simplified  | `zh-Hant` | Chinese Traditional |

## Browser Compatibility

Works in all modern browsers and Node.js environments:

- **Node.js**: ^20 || ^22 || >=24
- **Browsers**: Supports all major browsers via two deployment options:

### UMD Build (Maximum Compatibility)

The pre-built [dist/n2words.js](dist/n2words.js) uses Babel with `@babel/preset-env` and core-js polyfills to support **100% of browsers currently in use** (targets: `defaults`). This includes older browsers like IE11.

**Best for:**
- CDN usage (`<script>` tag)
- Legacy browser support
- Simple drop-in integration

### ESM Source (Modern Browsers)

The source files in [lib/](lib/) use modern JavaScript (ES6+ classes, BigInt, etc.) and require:
- Chrome 67+, Firefox 68+, Safari 14+, Edge 79+

**Best for:**
- Modern bundler setups (Webpack, Vite, Rollup)
- Smaller bundle sizes (tree-shaking)
- Targeting modern browsers only

See [Browser Usage Guide](docs/guides/BROWSER_USAGE.md) for detailed integration instructions.

## Examples

```js
// Basic numbers
EnglishConverter(0)        // 'zero'
EnglishConverter(42)       // 'forty-two'
EnglishConverter(1000000)  // 'one million'

// Decimals & negatives
EnglishConverter(3.14)     // 'three point one four'
EnglishConverter(-42)      // 'minus forty-two'

// Large numbers & BigInt
EnglishConverter(1234567890)        // 'one billion two hundred and thirty-four million...'
EnglishConverter(123456789012345n)  // Works with arbitrarily large integers

// Language-specific features
JapaneseConverter(3.14)  // '三点一四' (digit-by-digit decimals)
SimplifiedChineseConverter(123)  // '壹佰贰拾叁'
```

## Performance & Bundle Size

- **Fast**: Sub-millisecond conversion for most numbers
- **Small**: ~2-5 KB gzipped per language with tree-shaking
- **Efficient**: Zero dependencies, minimal memory footprint

See [Performance Guide](docs/guides/PERFORMANCE.md) for benchmarks and optimization tips.

## Documentation

- **[API Reference](docs/API.md)** - Complete API documentation for all converters
- **[Migration Guide](docs/MIGRATION.md)** - Upgrading from v1.x to v2.0
- **[Examples](docs/EXAMPLES.md)** - Real-world usage examples (invoicing, checks, i18n, etc.)
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Language Development](docs/guides/LANGUAGE_DEVELOPMENT.md)** - Adding new languages
- **[Browser Usage](docs/guides/BROWSER_USAGE.md)** - Browser integration guide
- **[Performance](docs/guides/PERFORMANCE.md)** - Performance optimization tips

## Contributing

We welcome contributions! Here's how you can help:

**Add a new language:**

```bash
npm run lang:add <code>           # Scaffold a new language (BCP 47 code)
npm run lang:validate <code>       # Validate implementation and tests
```

**Validation & Testing:**

- Validate all languages: `npm run lang:validate`
- Run tests: `npm test`

**Other contributions:**

- 🐛 Bug reports and fixes
- ✨ Feature requests and improvements
- 📝 Documentation enhancements

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

[MIT](./LICENSE) © 2025
