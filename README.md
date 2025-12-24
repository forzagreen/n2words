# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/test.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg)](https://coveralls.io/github/forzagreen/n2words)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 47 languages with zero dependencies.**

- 🌍 **47 languages** — Comprehensive international support
- 📦 **Zero dependencies** — Lightweight and fast
- 🚀 **TypeScript** — Full type safety with language-specific options
- 🧪 **Tested & validated** — Language modules validated and tested on every PR
- 📱 **Universal** — Node.js, browsers, ESM/CommonJS

## Quick Start

```bash
npm install n2words
```

```js
import { EnglishConverter } from 'n2words'

EnglishConverter(123)                          // 'one hundred and twenty-three'
EnglishConverter(-1.5)                         // 'minus one point five'
EnglishConverter(123, { lang: 'es' })          // 'ciento veintitrés'
EnglishConverter(123, { lang: 'ar' })          // 'مائة وثلاثة وعشرون'
EnglishConverter(10000n, { lang: 'zh-Hans' })  // '壹万' (BigInt support)
```

## Usage

```js
// Node.js / ESM
import { EnglishConverter } from 'n2words'
EnglishConverter(42)  // 'forty-two'

// TypeScript with full type safety
import { ArabicConverter, SimplifiedChinese, type N2WordsOptions } from 'n2words'
SimplifiedChineseConverter(123, { formal: true })  // '壹佰贰拾叁'
ArabicConverter(42, { feminine: true })            // Arabic feminine

// CommonJS
const { EnglishConverter } = require('n2words');
console.log(EnglishConverter(100)); // 'one hundred'
// For other languages:
const { FrenchConverter } = require('n2words');
console.log(FrenchConverter(123)); // 'cent vingt-trois'

// Browser (CDN)
// <script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
// console.log(n2words.EnglishConverter(100))  // 'one hundred'
```

See [TYPESCRIPT_GUIDE.md](guides/TYPESCRIPT_GUIDE.md) for comprehensive TypeScript documentation.

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
JapaneseConverter(3.14, { lang: 'ja' })  // '三点一四' (digit-by-digit decimals)
SimplifiedChineseConverter(123, { lang: 'zh-Hans', formal: true })  // '壹佰贰拾叁' (formal Chinese)
```

## Documentation

- [TYPESCRIPT_GUIDE.md](./guides/TYPESCRIPT_GUIDE.md) - TypeScript usage with full type safety
- [LANGUAGE_OPTIONS.md](./guides/LANGUAGE_OPTIONS.md) - Language-specific options
- [LANGUAGE_GUIDE.md](./guides/LANGUAGE_GUIDE.md) - Adding new languages
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

## Contributing

**Add a new language:**

```bash
npm run lang:add <code>           # Scaffold a new language (BCP 47 code)
npm run lang:validate <code>       # Validate implementation and tests
```

**Validation & Testing:**

- Validate all languages: `npm run lang:validate`
- Run all tests: `npm test`

**Other contributions:**

- 🐛 Bug reports and fixes
- ✨ Feature requests and improvements
- 📝 Documentation enhancements

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidance.

## License

[MIT](./LICENSE) © 2025
