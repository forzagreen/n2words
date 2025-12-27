# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/test.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg)](https://coveralls.io/github/forzagreen/n2words)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 48 languages with zero dependencies.**

- 🌍 **48 languages** — Comprehensive international support
- 📦 **Zero dependencies** — Lightweight and fast
- 🧪 **Tested & validated** — Language modules validated and tested on every PR
- 📱 **Universal** — Node.js, browsers, ESM/CommonJS
- 🔢 **Flexible input** — Supports number, bigint, and string inputs
- 🎯 **Type-safe** — Full TypeScript support via JSDoc annotations

## Contents

- [Quick Start](#quick-start)
- [Usage](#usage)
- [Type Safety](#type-safety)
- [Supported Languages](#supported-languages-48)
- [Browser Compatibility](#browser-compatibility)
- [Performance & Bundle Size](#performance--bundle-size)
- [Examples](#examples)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```bash
npm install n2words
```

```js
import { EnglishConverter, SpanishConverter, ArabicConverter } from 'n2words'

EnglishConverter(123)                       // 'one hundred and twenty-three'
SpanishConverter(123)                       // 'ciento veintitrés'
ArabicConverter(1, { gender: 'feminine' })  // 'واحدة' (with options)
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
<!-- All languages (~23KB gzipped) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  n2words.EnglishConverter(42)  // 'forty-two'
</script>

<!-- Individual languages (~2KB gzipped each) - load only what you need -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/EnglishConverter.js"></script>
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/SpanishConverter.js"></script>
<script>
  n2words.EnglishConverter(42)   // 'forty-two'
  n2words.SpanishConverter(123)  // 'ciento veintitrés'
</script>
```

## Type Safety

Full TypeScript support via JSDoc annotations - works in both JavaScript and TypeScript projects with IntelliSense and type checking:

```typescript
import { EnglishConverter, ArabicConverter, SimplifiedChineseConverter } from 'n2words'
import type { NumericValue, ArabicOptions } from 'n2words'

// All converters accept: number | bigint | string
EnglishConverter(42)       // ✓ number → 'forty-two'
EnglishConverter('123')    // ✓ string → 'one hundred and twenty-three'
EnglishConverter(100n)     // ✓ BigInt → 'one hundred'

// Language-specific options with type checking
ArabicConverter(1, { gender: 'feminine' })  // ✓ 'واحدة' (feminine form)
ArabicConverter(1, { invalid: true })       // ✗ TypeScript error: invalid property

SimplifiedChineseConverter(123, { formal: false })  // ✓ '一百二十三' (common style)
SimplifiedChineseConverter(123, { formal: 'yes' })  // ✗ TypeScript error: wrong type
```

**Exported Types:**

- `NumericValue` - Accepted input types: `number | bigint | string`
- Language-specific option types (e.g., `ArabicOptions`, `SimplifiedChineseOptions`, `DutchOptions`, etc.)

## Supported Languages (48)

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

| Code      | Language            | Options | Code      | Language            | Options |
| --------- | ------------------- | ------- | --------- | ------------------- | ------- |
| `ar`      | Arabic              | ✓       | `az`      | Azerbaijani         |         |
| `bn`      | Bengali             |         | `cs`      | Czech               | ✓       |
| `da`      | Danish              | ✓       | `de`      | German              |         |
| `el`      | Greek               |         | `en`      | English             |         |
| `es`      | Spanish             | ✓       | `fa`      | Persian             |         |
| `fil`     | Filipino            |         | `fr`      | French              | ✓       |
| `fr-BE`   | Belgian French      | ✓       | `gu`      | Gujarati            |         |
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

21 languages support additional options. Common options include:

**`gender`** (`'masculine'` | `'feminine'`) - 16 languages
Arabic, Croatian, Czech, Hebrew (Biblical), Latvian, Lithuanian, Polish, Romanian, Russian, Serbian (both scripts), Spanish, Ukrainian

**`formal`** (`boolean`) - 2 languages
Simplified Chinese, Traditional Chinese - Toggle between formal/financial and common numerals

**Other options:**

- Dutch: `includeOptionalAnd`, `accentOne`, `noHundredPairs`
- French/French Belgium: `withHyphenSeparator`
- Hebrew/Biblical Hebrew: `andWord`
- Turkish: `dropSpaces`
- Danish: `ordFlag` (ordinal numbers)
- Arabic: `negativeWord` (custom negative word)

[See complete options reference →](CLAUDE.md#3-language-specific-options)

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

- **Fast**: Sub-millisecond conversion for most numbers
- **Small**: ~2-5 KB gzipped per language with tree-shaking
- **Efficient**: Zero dependencies, minimal memory footprint
- **BigInt support**: Handles arbitrarily large numbers without precision loss

**Tree-shaking example:**

```js
// Import only what you need - bundler only includes used languages
import { EnglishConverter, SpanishConverter } from 'n2words'
// Final bundle: ~4-5 KB gzipped (only English + Spanish + core)
```

## Examples

### Basic Conversions

```js
import { EnglishConverter } from 'n2words'

// Basic numbers
EnglishConverter(0)        // 'zero'
EnglishConverter(42)       // 'forty-two'
EnglishConverter(1000000)  // 'one million'

// Decimals & negatives
EnglishConverter(3.14)     // 'three point one four'
EnglishConverter(-42)      // 'minus forty-two'

// Large numbers & BigInt
EnglishConverter(1234567890)        // 'one billion two hundred and thirty-four million five hundred and sixty-seven thousand eight hundred and ninety'
EnglishConverter(123456789012345n)  // Works with arbitrarily large integers
```

### Gender Agreement

```js
import { SpanishConverter, ArabicConverter, RussianConverter } from 'n2words'

// Spanish: masculine vs feminine
SpanishConverter(1)                       // 'uno' (masculine, default)
SpanishConverter(1, { gender: 'feminine' })  // 'una'
SpanishConverter(21)                      // 'veintiuno' (masculine)
SpanishConverter(21, { gender: 'feminine' }) // 'veintiuna'

// Arabic: rich gender system
ArabicConverter(1)                       // 'واحد' (masculine, default)
ArabicConverter(1, { gender: 'feminine' })  // 'واحدة'

// Russian: gender for numerals
RussianConverter(1)                       // 'один' (masculine, default)
RussianConverter(1, { gender: 'feminine' })  // 'одна'
```

### Language-Specific Features

```js
import {
  SimplifiedChineseConverter,
  TraditionalChineseConverter,
  JapaneseConverter,
  DutchConverter,
  FrenchConverter
} from 'n2words'

// Chinese: formal (financial) vs common numerals
SimplifiedChineseConverter(123)                  // '壹佰贰拾叁' (formal, default)
SimplifiedChineseConverter(123, { formal: false }) // '一百二十三' (common)

TraditionalChineseConverter(456)                  // '肆佰伍拾陸' (formal, default)
TraditionalChineseConverter(456, { formal: false }) // '四百五十六' (common)

// Japanese: digit-by-digit decimals
JapaneseConverter(3.14)  // '三点一四'

// Dutch: flexible formatting
DutchConverter(123)                              // 'honderddrieëntwintig' (default compound)
DutchConverter(101, { includeOptionalAnd: true })  // 'honderdeneen' (with optional "en")
DutchConverter(1)                                // 'één' (accented, default)
DutchConverter(1, { accentOne: false })           // 'een' (unaccented)

// French: selective hyphens vs all hyphens
FrenchConverter(123)                              // 'cent vingt-trois' (default)
FrenchConverter(123, { withHyphenSeparator: true }) // 'cent-vingt-trois' (all hyphens)
```

### Input Flexibility

```js
import { EnglishConverter } from 'n2words'

// Multiple input types
EnglishConverter(42)      // number → 'forty-two'
EnglishConverter('42')    // string → 'forty-two'
EnglishConverter(42n)     // BigInt → 'forty-two'

// Decimal strings
EnglishConverter('3.14')  // 'three point one four'
EnglishConverter('.5')    // 'zero point five'

// Negative strings
EnglishConverter('-42')   // 'minus forty-two'

// Large BigInts (no precision loss)
EnglishConverter(999999999999999999999999n)  // Accurate conversion
```

## Documentation

- **[Compatibility Guide](COMPATIBILITY.md)** - Browser and Node.js compatibility requirements, verification tools
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute, add languages, and development workflow
- **[Project Context (CLAUDE.md)](CLAUDE.md)** - Comprehensive project architecture and patterns

## Contributing

We welcome contributions! Add a new language or improve existing ones:

```bash
npm run lang:add <code>         # Scaffold a new language (BCP 47 code)
npm run lang:validate -- <code> # Validate implementation
npm test                        # Run full test suite
```

Also welcome: bug reports, feature requests, documentation improvements, and language enhancements.

**[See full contributing guide →](CONTRIBUTING.md)**

## License

[MIT](./LICENSE) © 2025
