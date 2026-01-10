# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/ci.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/coveralls/github/forzagreen/n2words)](https://coveralls.io/github/forzagreen/n2words)
[![npm version](https://img.shields.io/npm/v/n2words)](https://npmjs.com/package/n2words)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/n2words)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/n2words)](https://bundlephobia.com/package/n2words)
[![npm downloads](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/n2words)](https://www.jsdelivr.com/package/npm/n2words)

**Convert numbers to words in 54 languages with zero dependencies.**

## Why n2words?

- **54 Languages** — European, Asian, Middle Eastern, African, and regional variants
- **Functional API** — Each language is a standalone pure function, no classes or configuration
- **Zero Dependencies** — Works everywhere: Node.js, browsers, Deno, Bun
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

// Input types: number, string, or BigInt
en(999999999999999999999999n) // Works with arbitrarily large integers
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
<!-- ESM (recommended) -->
<script type="module">
  import { toWords } from 'https://cdn.jsdelivr.net/npm/n2words/dist/en.js'
  import { toWords as es } from 'https://cdn.jsdelivr.net/npm/n2words/dist/es.js'
  console.log(toWords(42))  // 'forty-two'
</script>

<!-- UMD (legacy script tags) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/en.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/es.umd.js"></script>
<script>
  n2words.en(42)  // 'forty-two'
  n2words.es(42)  // 'cuarenta y dos'
</script>
```

## Supported Languages (54)

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
| `ka`      | Georgian            |         | `kn`      | Kannada             |         |
| `ko`      | Korean              |         | `lt`      | Lithuanian          | ✓       |
| `lv`      | Latvian             | ✓       | `mr`      | Marathi             |         |
| `ms`      | Malay               |         | `nb`      | Norwegian Bokmål    |         |
| `nl`      | Dutch               | ✓       | `pa`      | Punjabi             |         |
| `pl`      | Polish              | ✓       | `pt`      | Portuguese          |         |
| `ro`      | Romanian            | ✓       | `ru`      | Russian             | ✓       |
| `sr-Cyrl` | Serbian Cyrillic    | ✓       | `sr-Latn` | Serbian Latin       | ✓       |
| `sv`      | Swedish             |         | `sw`      | Swahili             |         |
| `ta`      | Tamil               |         | `te`      | Telugu              |         |
| `th`      | Thai                |         | `tr`      | Turkish             | ✓       |
| `uk`      | Ukrainian           | ✓       | `ur`      | Urdu                |         |
| `vi`      | Vietnamese          |         | `yo`      | Yoruba              |         |
| `zh-Hans` | Chinese Simplified  | ✓       | `zh-Hant` | Chinese Traditional | ✓       |

### Language Options

19 languages support additional options via a second parameter:

```js
toWords(value, options)
```

#### Gender (`gender: 'masculine' | 'feminine'`)

12 languages support grammatical gender:

| Language | Code | Example |
| -------- | ---- | ------- |
| Arabic | `ar` | `ar(1, { gender: 'feminine' })` → `'واحدة'` |
| Biblical Hebrew | `hbo` | `hbo(2, { gender: 'feminine' })` → `'שְׁתַּיִם'` |
| Croatian | `hr` | `hr(1, { gender: 'feminine' })` → `'jedna'` |
| Latvian | `lv` | `lv(1, { gender: 'feminine' })` → `'viena'` |
| Lithuanian | `lt` | `lt(1, { gender: 'feminine' })` → `'viena'` |
| Polish | `pl` | `pl(1, { gender: 'feminine' })` → `'jedna'` |
| Romanian | `ro` | `ro(1, { gender: 'feminine' })` → `'una'` |
| Russian | `ru` | `ru(1, { gender: 'feminine' })` → `'одна'` |
| Serbian (Cyrillic) | `sr-Cyrl` | `srCyrl(1, { gender: 'feminine' })` → `'једна'` |
| Serbian (Latin) | `sr-Latn` | `srLatn(1, { gender: 'feminine' })` → `'jedna'` |
| Spanish | `es` | `es(1, { gender: 'feminine' })` → `'una'` |
| Ukrainian | `uk` | `uk(1, { gender: 'feminine' })` → `'одна'` |

#### Formal/Financial (`formal: boolean`)

Chinese languages toggle between formal (financial) and common numerals:

```js
zhHans(123)                    // '壹佰贰拾叁' (formal, default)
zhHans(123, { formal: false }) // '一百二十三' (common)

zhHant(123)                    // '壹佰貳拾參' (formal, default)
zhHant(123, { formal: false }) // '一百二十三' (common)
```

#### Other Options

| Language | Option | Type | Description |
| -------- | ------ | ---- | ----------- |
| Arabic | `negativeWord` | `string` | Custom word for negative numbers |
| Dutch | `includeOptionalAnd` | `boolean` | Include "en" between tens and units |
| Dutch | `accentOne` | `boolean` | Use "één" instead of "een" |
| Dutch | `noHundredPairing` | `boolean` | Disable hundred-pairing (e.g., "twaalfhonderd") |
| French | `withHyphenSeparator` | `boolean` | Use hyphens between all words (modern spelling) |
| Belgian French | `withHyphenSeparator` | `boolean` | Use hyphens between all words (modern spelling) |
| Hebrew | `andWord` | `boolean` | Include "ve" (and) between number parts |
| Biblical Hebrew | `andWord` | `boolean` | Include "ve" (and) between number parts |
| Turkish | `dropSpaces` | `boolean` | Remove spaces between words |

## Browser Compatibility

**Minimum Requirements** (due to BigInt):

- **Node.js**: 20 or above
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (desktop + mobile)
- **Global Coverage**: ~86% of all users worldwide

BigInt is a hard requirement and cannot be polyfilled. Older browsers are not supported.

## Performance & Bundle Size

| Import Strategy             | Gzipped   | Use Case                     |
| --------------------------- | --------- | ---------------------------- |
| **Subpath import** ⭐       | ~1.4 KB   | Single language              |
| Named import (1 lang)       | ~1.4-2 KB | Single language with barrel  |
| Named imports (3 langs)     | ~4-6 KB   | Multiple languages           |
| UMD bundle                  | ~1.4-2 KB | Legacy browser support       |

**Performance characteristics:**

- 1M+ ops/sec for most languages
- Sub-millisecond conversion time
- ~90-800 bytes memory per conversion
- BigInt modulo operations (no string manipulation)

**Run benchmarks:**

```bash
npm run bench              # Performance and memory benchmarks
npm run bench -- --full    # Full mode (more iterations, slower)
```

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
