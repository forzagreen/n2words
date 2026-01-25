# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/ci.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/coveralls/github/forzagreen/n2words)](https://coveralls.io/github/forzagreen/n2words)
[![npm version](https://img.shields.io/npm/v/n2words)](https://npmjs.com/package/n2words)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/n2words)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/n2words)](https://bundlephobia.com/package/n2words)
[![npm downloads](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/n2words)](https://www.jsdelivr.com/package/npm/n2words)

**Numbers to words. 57 languages. Zero dependencies.**

## Why n2words?

- **Pure Functions** — Each language exports standalone functions. No classes, no configuration, no side effects.
- **Tree-Shakeable** — Import only what you need. Unused exports are eliminated by modern bundlers.
- **Tiny Bundles** — ~2.4 KB gzipped per language (with all forms). No bloat.
- **Multiple Forms** — Cardinal ("forty-two"), ordinal ("forty-second"), and currency ("forty-two dollars")
- **57 Languages** — European, Asian, Middle Eastern, African, and regional variants
- **Zero Dependencies** — Works everywhere: Node.js, browsers, Deno, Bun
- **BigInt Support** — Handle arbitrarily large numbers without precision loss
- **Type-Safe** — Full TypeScript support with generated `.d.ts` declarations

## Quick Start

```bash
npm install n2words
```

```js
import { toCardinal } from 'n2words/en-US'
import { toCardinal as es } from 'n2words/es'

toCardinal(42)   // 'forty-two'
es(42)           // 'cuarenta y dos'
```

## Forms

n2words converts numbers to words in multiple forms:

| Form     | Function             | Example                             |
| -------- | -------------------- | ----------------------------------- |
| Cardinal | `toCardinal(42)`     | "forty-two"                         |
| Ordinal  | `toOrdinal(42)`      | "forty-second"                      |
| Currency | `toCurrency(42.50)`  | "forty-two dollars and fifty cents" |

```js
import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'

toCardinal(1234)      // 'one thousand two hundred thirty-four'
toOrdinal(1234)       // 'one thousand two hundred thirty-fourth'
toCurrency(1234.56)   // 'one thousand two hundred thirty-four dollars and fifty-six cents'
```

Form availability varies by language. See [LANGUAGES.md](LANGUAGES.md) for details.

## Usage

**ESM (Node.js, modern bundlers):**

```js
import { toCardinal } from 'n2words/en-US'            // Single form
import { toCardinal, toOrdinal } from 'n2words/en-US' // Multiple forms
import { toCardinal as fr } from 'n2words/fr'         // Aliased import
```

**Browser (CDN):**

```html
<!-- ESM (recommended) -->
<script type="module">
  import { toCardinal } from 'https://cdn.jsdelivr.net/npm/n2words/dist/en-US.js'
  console.log(toCardinal(42))  // 'forty-two'
</script>

<!-- UMD (legacy script tags) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/en-US.umd.js"></script>
<script>
  n2words.enUS(42)              // 'forty-two'
  n2words.ordinal.enUS(42)      // 'forty-second'
  n2words.currency.enUS(42.50)  // 'forty-two dollars and fifty cents'
</script>
```

See [LANGUAGES.md](LANGUAGES.md) for all language codes and available forms.

## Supported Languages (57)

See **[LANGUAGES.md](LANGUAGES.md)** for the complete list with codes, export names, and options.

Highlights: Arabic, Chinese (Simplified/Traditional), English, French, German, Hindi, Japanese, Korean, Portuguese, Russian, Spanish, and [46 more](LANGUAGES.md).

## Compatibility

- **Node.js**: 20+
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (~87% global coverage)
- **Runtimes**: Deno, Bun, Cloudflare Workers

Requires BigInt support (cannot be polyfilled).

## Performance

n2words is optimized for both size and speed:

- ~2.4 KB gzipped per language (includes all forms)
- Individual language imports enable tree-shaking
- No runtime dependencies
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
