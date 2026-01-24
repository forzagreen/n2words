# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/ci.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/coveralls/github/forzagreen/n2words)](https://coveralls.io/github/forzagreen/n2words)
[![npm version](https://img.shields.io/npm/v/n2words)](https://npmjs.com/package/n2words)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/n2words)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/n2words)](https://bundlephobia.com/package/n2words)
[![npm downloads](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/n2words)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 55 languages with zero dependencies.**

## Why n2words?

- **55 Languages** — European, Asian, Middle Eastern, African, and regional variants
- **Functional API** — Each language is a standalone pure function, no classes or configuration
- **Zero Dependencies** — Works everywhere: Node.js, browsers, Deno, Bun
- **Type-Safe** — Full TypeScript support with generated `.d.ts` declarations
- **BigInt Support** — Handle arbitrarily large numbers without precision loss
- **Lightweight** — ~1.4 KB gzipped per language, pure functions, BigInt math

## Quick Start

```bash
npm install n2words
```

```js
import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'
import { toCardinal as es } from 'n2words/es'
import { toCardinal as ar } from 'n2words/ar'

toCardinal(123)               // 'one hundred twenty-three'
toOrdinal(123)                // 'one hundred twenty-third'
toCurrency(42.50)             // 'forty-two dollars and fifty cents'
es(123)                       // 'ciento veintitrés'
ar(1, { gender: 'feminine' }) // 'واحدة' (with options)

// Input types: number, string, or BigInt
toCardinal(999999999999999999999999n) // Works with arbitrarily large integers
```

## Usage

**ESM (Node.js, modern bundlers):**

```js
// Import by language code
import { toCardinal } from 'n2words/en-US'
import { toCardinal as es } from 'n2words/es'
import { toCardinal, toOrdinal } from 'n2words/en-US'     // Languages with ordinal support
import { toCardinal, toCurrency } from 'n2words/en-US'   // Languages with currency support
```

**Browser (CDN):**

Individual language bundles are recommended for browsers (~1.4 KB gzipped each).

```html
<!-- ESM (recommended) -->
<script type="module">
  import { toCardinal } from 'https://cdn.jsdelivr.net/npm/n2words/dist/en-US.js'
  import { toCardinal as es } from 'https://cdn.jsdelivr.net/npm/n2words/dist/es.js'
  console.log(toCardinal(42))  // 'forty-two'
</script>

<!-- UMD (legacy script tags) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/en-US.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/es.umd.js"></script>
<script>
  n2words.enUS(42)           // 'forty-two'
  n2words.es(42)             // 'cuarenta y dos'
  n2words.ordinal.enUS(42)   // 'forty-second' (languages with ordinal support)
  n2words.currency.enUS(42.50)  // 'forty-two dollars and fifty cents'
</script>
```

## Supported Languages (55)

See **[LANGUAGES.md](LANGUAGES.md)** for the complete list with codes, export names, and options.

Highlights: Arabic, Chinese (Simplified/Traditional), English, French, German, Hindi, Japanese, Korean, Portuguese, Russian, Spanish, and [44 more](LANGUAGES.md).

## Compatibility

- **Node.js**: 20+
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (~87% global coverage)
- **Runtimes**: Deno, Bun, Cloudflare Workers

Requires BigInt support (cannot be polyfilled).

## Performance

Each language module is ~1.4 KB gzipped. Optimized with:

- BigInt modulo operations (no string manipulation)
- Pure functions with no shared state
- Minimal memory allocation per conversion

Run `npm run bench` to measure on your hardware.

## Contributing

We welcome contributions! Add a new language or improve existing ones:

```bash
npm run lang:add <code>    # Scaffold a new language (BCP 47 code)
npm test                   # Run full test suite
```

Also welcome: bug reports, feature requests, and documentation improvements.

- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute and add languages
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community standards

## License

[MIT](./LICENSE) © Wael TELLAT, Tyler Vigario & contributors
