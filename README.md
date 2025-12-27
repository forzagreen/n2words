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
<!-- All languages (~91KB) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  n2words.EnglishConverter(42)  // 'forty-two'
</script>

<!-- Individual languages (~4-5KB each) - load only what you need -->
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
| `bn`      | Bengali             | ✓       | `cs`      | Czech               | ✓       |
| `da`      | Danish              | ✓       | `de`      | German              |         |
| `el`      | Greek               |         | `en`      | English             |         |
| `es`      | Spanish             | ✓       | `fa`      | Persian             |         |
| `fil`     | Filipino            |         | `fr`      | French              | ✓       |
| `fr-BE`   | Belgian French      | ✓       | `gu`      | Gujarati            |         |
| `hbo`     | Biblical Hebrew     | ✓       | `he`      | Modern Hebrew       | ✓       |
| `hi`      | Hindi               | ✓       | `hr`      | Croatian            | ✓       |
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

Languages marked with ✓ support additional options:

| Language | Option | Type | Default | Description |
| --- | --- | --- | --- | --- |
| Arabic | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Arabic | `negativeWord` | `string` | `'ناقص'` | Custom negative word |
| Bengali | `feminine` | `boolean` | `false` | Currently unused |
| Biblical Hebrew | `andWord` | `string` | `'ו'` | Conjunction character |
| Biblical Hebrew | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Croatian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Czech | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Danish | `ordFlag` | `boolean` | `false` | Enable ordinal number conversion |
| Dutch | `includeOptionalAnd` | `boolean` | `false` | Include optional "en" separator |
| Dutch | `noHundredPairs` | `boolean` | `false` | Disable comma before hundreds |
| Dutch | `accentOne` | `boolean` | `true` | Use accented "één" for one |
| French | `withHyphenSeparator` | `boolean` | `false` | Use hyphens vs spaces |
| French Belgium | `withHyphenSeparator` | `boolean` | `false` | Use hyphens vs spaces |
| Hebrew | `andWord` | `string` | `'ו'` | Conjunction character |
| Hindi | `feminine` | `boolean` | `false` | Currently unused |
| Latvian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Lithuanian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Polish | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Romanian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Russian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Serbian Cyrillic | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Serbian Latin | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Simplified Chinese | `formal` | `boolean` | `true` | Formal/financial vs common numerals |
| Spanish | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |
| Traditional Chinese | `formal` | `boolean` | `true` | Formal/financial vs common numerals |
| Turkish | `dropSpaces` | `boolean` | `false` | Remove spaces between words |
| Ukrainian | `gender` | `'masculine'\|'feminine'` | `'masculine'` | Grammatical gender for number forms |

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
DutchConverter(123)                              // 'honderddrie en twintig'
DutchConverter(123, { includeOptionalAnd: true })  // 'honderd en drie en twintig'
DutchConverter(1)                                // 'één' (accented, default)
DutchConverter(1, { accentOne: false })           // 'een' (unaccented)

// French: hyphens vs spaces
FrenchConverter(123)                              // 'cent vingt trois'
FrenchConverter(123, { withHyphenSeparator: true }) // 'cent-vingt-trois'
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

## Architecture

### Class Hierarchy

All language implementations inherit from one of four base classes:

```text
AbstractLanguage (base)
├── GreedyScaleLanguage    # Most common: English, Spanish, French, German, etc.
├── SlavicLanguage         # Russian, Polish, Czech, Croatian, Serbian, etc.
├── SouthAsianLanguage     # Hindi, Tamil, Telugu, Bengali, Gujarati, etc.
└── TurkicLanguage         # Turkish, Azerbaijani
```

**AbstractLanguage**: Provides core functionality for all languages

- Validates and normalizes input (number, string, BigInt)
- Handles negative numbers and decimals
- Delegates whole number conversion to subclasses

**GreedyScaleLanguage**: Scale-based decomposition (most languages)

- Uses a greedy algorithm with descending scale words
- Defines `scaleWordPairs`: array of `[value, word]` tuples
- Implements `mergeScales()` for language-specific combining logic

**SlavicLanguage**: Three-form pluralization (Slavic languages)

- Handles complex plural forms (singular/few/many)
- Gender-aware number forms (masculine/feminine)
- Chunk-based large number handling

**SouthAsianLanguage**: Indian numbering system

- Supports lakh (100,000) and crore (10,000,000)
- Indian-style grouping: 1,23,45,67,89
- Used by Hindi, Bengali, Urdu, Punjabi, etc.

**TurkicLanguage**: Turkish-style number grammar

- Implicit "bir" (one) before hundreds and thousands
- Space-separated combinations
- Used by Turkish and Azerbaijani

## Performance & Bundle Size

- **Fast**: Sub-millisecond conversion for most numbers
- **Small**: ~2-5 KB gzipped per language with tree-shaking
- **Efficient**: Zero dependencies, minimal memory footprint
- **BigInt support**: Handles arbitrarily large numbers without precision loss

**Tree-shaking example:**

```js
// Import only what you need - bundler only includes used languages
import { EnglishConverter, SpanishConverter } from 'n2words'
// Final bundle: ~8-10 KB gzipped (only English + Spanish + core)
```

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute, add languages, and development workflow
- **[Project Context (CLAUDE.md)](CLAUDE.md)** - Comprehensive project architecture and patterns

## Contributing

We welcome contributions! Here's how you can help:

### Add a New Language

```bash
npm run lang:add <code>        # Scaffold a new language (BCP 47 code)
npm run lang:validate -- <code> # Validate implementation and tests
npm test                       # Run full test suite
```

The scaffolding tool automatically:

- Creates language implementation template
- Creates test fixture template
- Updates main entry point ([lib/n2words.js](lib/n2words.js))
- Validates IETF BCP 47 naming

### Validation & Testing

```bash
npm run lang:validate          # Validate all languages
npm run lang:validate -- en es # Validate specific languages
npm test                       # Full test suite
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
```

### Other Contributions

- 🐛 Bug reports and fixes
- ✨ Feature requests and improvements
- 📝 Documentation enhancements
- 🌍 Language improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

[MIT](./LICENSE) © 2025
