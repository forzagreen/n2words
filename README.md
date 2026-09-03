# n2words

[![CI](https://github.com/forzagreen/n2words/actions/workflows/ci.yml/badge.svg)](https://github.com/forzagreen/n2words/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/coveralls/github/forzagreen/n2words)](https://coveralls.io/github/forzagreen/n2words)
[![npm version](https://img.shields.io/npm/v/n2words)](https://npmjs.com/package/n2words)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/n2words)
[![npm downloads](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/n2words)](https://www.jsdelivr.com/package/npm/n2words)

**Numbers to words. 50 languages, 72 regional variants. Zero dependencies.**

**[Try it live →](https://forzagreen.github.io/n2words/)** — an interactive demo
running this library in your browser.

## Why n2words?

- **Pure Functions** — Each language exports standalone functions. No classes, no configuration, no side effects.
- **Tree-Shakeable** — Import only what you need. Unused exports are eliminated by modern bundlers.
- **Tiny Bundles** — ~2.5-3.5 KB gzipped per language with all three forms, less per form. No bloat.
- **Multiple Forms** — Cardinal ("forty-two"), ordinal ("forty-second"), and currency ("forty-two dollars")
- **50 Languages, 72 Regional Variants** — European, Asian, Middle Eastern, African, and more — most importable via a single bare-tag code (`n2words/de`), no region required
- **Zero Dependencies** — Works everywhere: Node.js, browsers, Deno, Bun
- **BigInt Support** — Accepts `bigint` (and numeric-string) input, so large values keep full precision
- **Type-Safe** — Full TypeScript support with generated `.d.ts` declarations

## Quick Start

```bash
npm install n2words
```

```js
import { toCardinal } from 'n2words/en'
import { toCardinal as es } from 'n2words/es'

toCardinal(42)   // 'forty-two'
es(42)           // 'cuarenta y dos'
```

## Forms

n2words converts numbers to words in multiple forms:

| Form     | Function                              | Example                             |
| -------- | ------------------------------------- | ----------------------------------- |
| Cardinal | `toCardinal(42)`                      | "forty-two"                         |
| Ordinal  | `toOrdinal(42)`                       | "forty-second"                      |
| Currency | `toCurrency(42.50, { currency })`     | "forty-two dollars and fifty cents" |

```js
import { toCardinal, toOrdinal, toCurrency } from 'n2words/en'

toCardinal(1234)                        // 'one thousand two hundred thirty-four'
toOrdinal(1234)                         // 'one thousand two hundred thirty-fourth'
toCurrency(1234.56, { currency: 'USD' }) // 'one thousand two hundred thirty-four dollars and fifty-six cents'
```

> **Upgrading from v5?** See [docs/migration-v6.md](docs/migration-v6.md) — three
> breaking changes, all in `toCurrency`.

`toCurrency` is the one form a bare tag won't guess at. `en` names a *language*,
and a default currency belongs to a *country*, so `n2words/en` requires the
currency to be named. Import the region-qualified code when you want its
default:

```js
import { toCurrency } from 'n2words/en'
import { toCurrency as usd } from 'n2words/en-US'

toCurrency(42.50)                      // throws TypeError — en is a language, not a locale
toCurrency(42.50, { currency: 'GBP' }) // 'forty-two pounds and fifty pence'
usd(42.50)                             // 'forty-two dollars and fifty cents'
```

A currency-supporting language can also name an amount in a currency other than its own
default, via the `currency` option — the set of currencies it knows is validated, so an
unsupported code throws rather than silently guessing. `pt-BR` is one of the few languages
with no bare-tag entry point (Brazilian and European Portuguese use different numbering
systems, not just different currencies — see [LANGUAGES.md](LANGUAGES.md)), so it's
imported by its full code:

```js
import { toCurrency } from 'n2words/pt-BR'

toCurrency(42.50)                      // 'quarenta e dois reais e cinquenta centavos' (BRL, the default)
toCurrency(42.50, { currency: 'EUR' }) // 'quarenta e dois euros e cinquenta centavos'
toCurrency(42.50, { currency: 'CAD' }) // throws RangeError — pt-BR doesn't know CAD (yet)
```

You don't have to hardcode that set or catch the `RangeError` to discover it — every
currency-supporting language exports it, so it's readable at runtime and narrowed to a
literal union in TypeScript:

```js
import { currencyDefaults, currencyValues } from 'n2words/pt-BR'

currencyDefaults.currency  // 'BRL'
currencyValues.currency    // ['BRL', 'USD', 'EUR', 'GBP', 'JPY']
```

This generalizes: every form that takes options exports its defaults
(`cardinalDefaults`, `ordinalDefaults`, `currencyDefaults`), and any option with a fixed set
of allowed values — `currency`, `gender` — also exports that set as `<form>Values`. Boolean
and free-string options have no such set, so they have no `Values` entry.
[LANGUAGES.md](LANGUAGES.md#language-options) lists every option, type and default per
language.

Each language implements one or more of these forms — see [LANGUAGES.md](LANGUAGES.md) for per-language coverage.

> **Range:** each form spells values up to the largest scale word it knows, then throws a `RangeError` rather than inventing vocabulary — and the ceiling varies by language *and* form (e.g. `es-ES` cardinals reach 10^30 − 1, ordinals only 10^9 − 1). Cardinal and currency accept negatives and decimals; ordinal is positive integers only.

## Usage

**ESM (Node.js, modern bundlers):**

```js
import { toCardinal } from 'n2words/de'            // Single form, bare-tag entry point
import { toCardinal, toOrdinal } from 'n2words/de' // Multiple forms
import { toCardinal as fr } from 'n2words/fr'       // Aliased import
```

Most languages are imported this way — a bare BCP 47 primary subtag
(`n2words/de`, `n2words/en`, `n2words/fr`, ...), no region required. Each bare
tag is a documented alias for one specific regional/script variant (see
[LANGUAGES.md](LANGUAGES.md)'s "Languages" table for the full list and each
one's default). Import the full region/script-qualified code instead when you
need a *specific* variant (`n2words/en-GB`, `n2words/fr-BE`) or when the
language has no single safe default — a handful of languages whose variants
genuinely diverge in script or core numbering grammar (Chinese, Portuguese,
Serbian, Amharic) require the full code:

```js
import { toCardinal } from 'n2words/zh-Hans-CN'
```

A bare tag forwards `toCardinal` and `toOrdinal` untouched — they're the same
functions its target exports. The one difference is `toCurrency`, which
requires an explicit `currency` because a language tag carries no country to
take a default from (see
[docs/bare-tag-aliases.md](docs/bare-tag-aliases.md#bare-tags-carry-no-default-currency)).

**Browser (CDN):**

```html
<!-- ESM (recommended) -->
<script type="module">
  import { toCardinal } from 'https://cdn.jsdelivr.net/npm/n2words/dist/en.js'
  console.log(toCardinal(42))  // 'forty-two'
</script>

<!-- UMD (legacy script tags) -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/en.umd.js"></script>
<script>
  n2words.en(42)                                   // 'forty-two'
  n2words.ordinal.en(42)                           // 'forty-second'
  n2words.currency.en(42.50, { currency: 'USD' })  // 'forty-two dollars and fifty cents'
  // `en` is a language, so currency must be named — or load dist/en-US.umd.js
  // and call n2words.currency.enUS(42.50) for a locale's own default.
</script>
```

`dist/{code}.js` carries all three forms. A page that needs only one can fetch
just that form from `dist/{code}/{form}.js` — `cardinal`, `ordinal` or
`currency`:

```html
<script type="module">
  import { toCurrency } from 'https://cdn.jsdelivr.net/npm/n2words/dist/en-US/currency.js'
  console.log(toCurrency(42.50))  // 'forty-two dollars and fifty cents'
</script>
```

Under half the bytes for cardinal or ordinal, since the other two forms and
everything only they reach are never in the file. Currency is the heaviest of
the three: it carries the shared currency-name matrix, so `en-US` can quote any
of the currencies English has words for, not just USD.

|`en-US`|bytes|
|-------|-----|
|`dist/en-US.js` (all three forms)|9,227|
|`dist/en-US/cardinal.js`|4,293|
|`dist/en-US/ordinal.js`|3,815|
|`dist/en-US/currency.js`|5,258|

This is for CDN consumers only. If you install from npm and use a bundler,
`import { toCurrency } from 'n2words/en-US'` already drops the forms you don't
import — the package is `sideEffects`-free and each form is an independent
export, so there is nothing to opt into.

See [LANGUAGES.md](LANGUAGES.md) for all language codes and available forms.

## Supported Languages

See **[LANGUAGES.md](LANGUAGES.md)** for the complete list with codes and options.

Highlights: Arabic, Chinese (Simplified/Traditional), English, French, German, Hindi, Japanese, Korean, Portuguese, Russian, Spanish, and [many more](LANGUAGES.md).

## Compatibility

- **Node.js**: 22+
- **Browsers**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ — any browser with BigInt support
- **Runtimes**: Deno, Bun, Cloudflare Workers

Requires BigInt support (cannot be polyfilled).

## Performance

n2words is optimized for both size and speed:

- ~2.5-3.5 KB gzipped per language, all three forms included
- Individual language imports enable tree-shaking
- No runtime dependencies
- BigInt modulo operations (no string manipulation)
- Pure functions with no shared state
- Minimal memory allocation per conversion

Run `npm run bench` to measure on your hardware.

## Contributing

We welcome contributions! Add a new language or improve existing ones:

```bash
npm run lang:add -- <code>   # Scaffold a new language (BCP 47 code)
npm test                     # Run full test suite
```

Also welcome: bug reports, feature requests, and documentation improvements.

- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute and add languages
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community standards

## License

[MIT](./LICENSE) © Wael TELLAT, Tyler Vigario & contributors
