# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/test.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg)](https://coveralls.io/github/forzagreen/n2words)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

**n2words** converts numerical numbers into written ones. Supports **29 languages** with **zero dependencies**.

- 🌍 **29 languages** - Comprehensive international language support
- 📦 **Zero dependencies** - Lightweight and fast
- 🚀 **Performance optimized** - Highly tuned for speed
- 📱 **Universal** - Works in browsers, Node.js, and TypeScript
- ♿ **Accessible** - Generates human-readable text from numbers

## Quick Start

```js
import n2words from 'n2words'

n2words(123)                    // 'one hundred and twenty-three'
n2words(-1.5)                   // 'minus one point five'
n2words(123, {lang: 'fr'})      // 'cent vingt-trois'
n2words(123, {lang: 'es'})      // 'ciento veintitrés'
n2words(123, {lang: 'ar'})      // 'مائة وثلاثة وعشرون'
n2words(1000000n)               // 'one million'
```

## Installation

```sh
npm install n2words
```

## Usage

### Node.js / ESM

```js
import n2words from 'n2words'

console.log(n2words(42))        // 'forty-two'
console.log(n2words(3.14))      // 'three point one four'
```

### TypeScript

```ts
import n2words from 'n2words'
import type { N2WordsOptions } from 'n2words'

const options: N2WordsOptions = { lang: 'en' }
const result: string = n2words(123, options)
```

See [TypeScript support](https://github.com/forzagreen/n2words/wiki/TypeScript-support) for complete TypeScript usage.

### CommonJS

```js
import('n2words').then(({default: n2words}) => {
    console.log(n2words(100))   // 'one hundred'
})
```

### Browser (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.min.js"></script>
<script>
    console.log(n2words(100))   // 'one hundred'
</script>
```

Or import specific languages:

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/fr.js"></script>
<script>
    console.log(n2words(100, {lang: 'fr'}))  // 'cent'
</script>
```

## Supported Languages

| Code | Language | Code | Language |
| --- | --- | --- | --- |
| `en` | English | `ar` | Arabic |
| `fr` | French | `es` | Spanish |
| `de` | German | `it` | Italian |
| `pt` | Portuguese | `ru` | Russian |
| `uk` | Ukrainian | `pl` | Polish |
| `cz` | Czech | `hu` | Hungarian |
| `ro` | Romanian | `lt` | Lithuanian |
| `lv` | Latvian | `nl` | Dutch |
| `dk` | Danish | `no` | Norwegian |
| `tr` | Turkish | `az` | Azerbaijani |
| `he` | Hebrew | `fa` | Farsi/Persian |
| `ko` | Korean | `zh` | Chinese |
| `vi` | Vietnamese | `id` | Indonesian |
| `hr` | Croatian | `sr` | Serbian |
| `fr-BE` | French (Belgium) | | |

## API Options

```ts
interface N2WordsOptions {
  lang?: string       // Language code (default: 'en')
}
```

## Performance

Performance benchmarks (ops/sec) on latest hardware:

| Language | Performance |
| --- | --- |
| Arabic (ar) | ~180k ops/sec |
| Indonesian (id) | ~160k ops/sec |
| Vietnamese (vi) | ~165k ops/sec |
| Persian (fa) | ~125k ops/sec |
| Hebrew (he) | ~115k ops/sec |

All languages are highly optimized. Run `npm run bench` to benchmark on your system.

## Examples

### Basic Usage

```js
n2words(0)              // 'zero'
n2words(1)              // 'one'
n2words(10)             // 'ten'
n2words(100)            // 'one hundred'
n2words(1000)           // 'one thousand'
n2words(1000000)        // 'one million'
```

### Decimal Numbers

```js
n2words(3.14)           // 'three point one four'
n2words(10.5)           // 'ten point five'
n2words(0.007)          // 'zero point zero zero seven'
```

### Negative Numbers

```js
n2words(-42)            // 'minus forty-two'
n2words(-3.14)          // 'minus three point one four'
```

### Large Numbers

```js
n2words(1000000000)     // 'one billion'
n2words(1234567890)     // 'one billion two hundred and thirty-four million five hundred and sixty-seven thousand eight hundred and ninety'
```

### BigInt Support

```js
n2words(123456789012345n)   // Works with arbitrarily large integers
```

## Documentation

- [TypeScript support](https://github.com/forzagreen/n2words/wiki/TypeScript-support) - TypeScript integration guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [LANGUAGE_GUIDE.md](./LANGUAGE_GUIDE.md) - Comprehensive guide for adding new languages
- [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) - BigInt usage guide for language developers
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
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [LANGUAGE_GUIDE.md](./LANGUAGE_GUIDE.md) for detailed guidance.

## License

[MIT](./LICENSE) © 2024
