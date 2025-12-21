# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/test.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg)](https://coveralls.io/github/forzagreen/n2words)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

**n2words** converts numerical numbers into written ones. Supports **45 languages** with **zero dependencies**.

- 🌍 **45 languages** - Comprehensive international language support
- 📦 **Zero dependencies** - Lightweight and fast
- 🚀 **Performance optimized** - Highly tuned for speed
- 📱 **Universal** - Works in browsers, Node.js, and TypeScript
- 🧩 **Modular** - Import only the languages you need, keeping your bundle size minimal
- 🔒 **Type-safe** - Full TypeScript support with language code literals and language-specific options

## Quick Start

```js
import n2words from 'n2words';

n2words(123); // 'one hundred and twenty-three'
n2words(-1.5); // 'minus one point five'
n2words(123, { lang: 'zh-Hans' }); // '壹佰贰拾叁'
n2words(123, { lang: 'hi' }); // 'एक सौ तेईस'
n2words(123, { lang: 'es' }); // 'ciento veintitrés'
n2words(123, { lang: 'ar' }); // 'مائة وثلاثة وعشرون'
n2words(10000n, { lang: 'zh-Hans' }); // '壹万' (BigInt support!)
```

## Installation

```sh
npm install n2words
```

## Usage

### Node.js / ESM

```js
import n2words from 'n2words';

console.log(n2words(42)); // 'forty-two'
console.log(n2words(3.14)); // 'three point one four'
```

### TypeScript

**Full type safety with language-specific options:**

```ts
import n2words, { type N2WordsOptions, type LanguageCode } from 'n2words';

// Language code autocomplete (45+ languages)
const lang: LanguageCode = 'zh-Hans'; // Full IntelliSense support

// Type-safe language-specific options
const result1 = n2words(123, { lang: 'zh-Hans', formal: true }); // Chinese financial numerals
const result2 = n2words(42, { lang: 'ar', feminine: true }); // Arabic feminine forms
const result3 = n2words(91, { lang: 'fr', withHyphenSeparator: true }); // French with hyphens

// Comprehensive type safety
const options: N2WordsOptions = {
  lang: 'es',
  genderStem: 'a' // TypeScript validates this option for Spanish
};
```

See [TYPESCRIPT_GUIDE.md](guides/TYPESCRIPT_GUIDE.md) for comprehensive TypeScript documentation.

### CommonJS

```js
import('n2words').then(({ default: n2words }) => {
  console.log(n2words(100)); // 'one hundred'
});
```

### Browser (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  console.log(n2words(100)); // 'one hundred'
</script>
```

Or import specific languages:

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/languages/fr.js"></script>
<script>
  console.log(n2words(100, { lang: 'fr' })); // 'cent'
</script>
```

## Supported Languages

| Code      | Language             | Code      | Language         |
| --------- | -------------------- | --------- | ---------------- |
| `ar`      | Arabic               | `az`      | Azerbaijani      |
| `bn`      | Bengali              | `cs`      | Czech            |
| `de`      | German               | `da`      | Danish           |
| `el`      | Greek                | `en`      | English          |
| `es`      | Spanish              | `fa`      | Farsi/Persian    |
| `fr`      | French               | `fr-BE`   | French (Belgium) |
| `gu`      | Gujarati             | `he`      | Hebrew           |
| `hi`      | Hindi                | `hr`      | Croatian         |
| `hu`      | Hungarian            | `id`      | Indonesian       |
| `it`      | Italian              | `ja`      | Japanese         |
| `kn`      | Kannada              | `ko`      | Korean           |
| `lt`      | Lithuanian           | `lv`      | Latvian          |
| `mr`      | Marathi              | `ms`      | Malay            |
| `nl`      | Dutch                | `nb`      | Norwegian        |
| `pa-Guru` | Punjabi (Gurmukhi)   | `pl`      | Polish           |
| `pt`      | Portuguese           | `ro`      | Romanian         |
| `ru`      | Russian              | `sr-Latn` | Serbian (Latin)  |
| `sv`      | Swedish              | `sw`      | Swahili          |
| `ta`      | Tamil                | `te`      | Telugu           |
| `th`      | Thai                 | `fil`     | Filipino/Tagalog |
| `tr`      | Turkish              | `uk`      | Ukrainian        |
| `ur`      | Urdu                 | `vi`      | Vietnamese       |
| `zh-Hans` | Chinese (Simplified) | `gu`      | Gujarati         |

## Performance

Performance benchmarks (ops/sec) on latest hardware:

| Language        | Performance   |
| --------------- | ------------- |
| Arabic (ar)     | ~180k ops/sec |
| Indonesian (id) | ~160k ops/sec |
| Vietnamese (vi) | ~165k ops/sec |
| Persian (fa)    | ~125k ops/sec |
| Hebrew (he)     | ~115k ops/sec |

All languages are highly optimized. Run `npm run bench:perf` to benchmark on your system.

## Examples

### Basic Usage

```js
n2words(0); // 'zero'
n2words(1); // 'one'
n2words(10); // 'ten'
n2words(100); // 'one hundred'
n2words(1000); // 'one thousand'
n2words(1000000); // 'one million'
```

### Decimal Numbers

```js
n2words(3.14); // 'three point one four'
n2words(10.5); // 'ten point five'
n2words(0.007); // 'zero point zero zero seven'

// Some languages read decimals digit-by-digit
n2words(3.14, { lang: 'ja' }); // '三点一四' (Japanese: san-ten-ichi-yon)
n2words(2.05, { lang: 'th' }); // 'สามจุดหนึ่งสี่' (Thai: each digit spoken)
```

### Negative Numbers

```js
n2words(-42); // 'minus forty-two'
n2words(-3.14); // 'minus three point one four'
```

### Large Numbers

```js
n2words(1000000000); // 'one billion'
n2words(1234567890); // 'one billion two hundred and thirty-four million five hundred and sixty-seven thousand eight hundred and ninety'
```

### BigInt Support

```js
n2words(123456789012345n); // Works with arbitrarily large integers
```

## Documentation

- [TYPESCRIPT_GUIDE.md](./guides/TYPESCRIPT_GUIDE.md) - **Comprehensive TypeScript guide** with enhanced type safety
- [LANGUAGE_OPTIONS.md](./guides/LANGUAGE_OPTIONS.md) - Language-specific options and examples
- [LANGUAGE_GUIDE.md](./guides/LANGUAGE_GUIDE.md) - Comprehensive guide for adding new languages
- [BIGINT-GUIDE.md](./guides/BIGINT-GUIDE.md) - BigInt usage guide for language developers
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [Wiki](https://github.com/forzagreen/n2words/wiki) - Detailed examples and guides

## Contributing

This library is actively maintained and welcomes contributions!

- 🐛 **Bug reports** - Help us fix issues
- ✨ **Feature requests** - Suggest improvements
- 🌐 **New languages** - Add support for more languages (use `npm run lang:add` to get started!)
- 📝 **Documentation** - Improve guides and examples

### Adding a New Language

We provide automated tools to streamline language implementation:

```bash
# Generate boilerplate for a new language
npm run lang:add

# Validate your implementation
npm run lang:validate <language-code>

# Validate all languages
npm run lang:validate
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [LANGUAGE_GUIDE.md](./guides/LANGUAGE_GUIDE.md) for detailed guidance.

## License

[MIT](./LICENSE) © 2025
