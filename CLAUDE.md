# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=22, zero dependencies.

## Quick Reference

- **Language codes**: IETF BCP 47 (`en-US`, `zh-Hans-CN`, `fr-BE`)
- **"Language" means BCP 47 primary subtag, not regional/script variant**: English is one
  language with 16 variants, not 16 languages — see `LANGUAGES.md`'s headline count and its
  "Languages" (family) table vs. "All Regional Variants" (flat per-code) table.
- **Imports**: bare-tag entry point is primary — `import { toCardinal, toOrdinal, toCurrency } from 'n2words/en'`.
  Region/script-qualified codes (`n2words/en-GB`) always work too, and are required for the few
  languages with no entry point.
- **Bare-tag aliases**: every language whose variants aren't "very different" (different script,
  or a fundamentally different core numbering system — not just vocabulary or currency) has one,
  resolving without a region subtag to one documented default variant. `zh`, `pt`, `sr`, `am` are
  the current exceptions and stay region/script-qualified only. Full rule, worked examples, and
  the enforcing gate: `docs/bare-tag-aliases.md`.
- **Language layers**: numerals, currency words, and default-currency-per-country are three
  independent axes, not one — a full implementation owns numerals, `currency-vocab.js` is keyed
  by language for currency words, and a thin **locale profile** (`variantOf`) covers a country
  whose numerals are a byte-identical clone of a full implementation's, overriding only the
  default currency. Full model and the two counterexamples worth knowing before adding one
  (an option only one variant exposes; an invariable-noun currency a generic pluralizer can't
  handle): `docs/language-layers.md`.
- **Forms**: Cardinal (`toCardinal`), Ordinal (`toOrdinal`), Currency (`toCurrency`)

## Project Structure

```text
bin/
├── n2words.js           # The shipped `n2words` command (package.json `bin`)
└── lib/                 # Arg parsing, language loading, output rendering
src/
├── {lang-code}.js       # Full implementations: one per numerally-distinct variant (59)
├── {lang-code}.js       # Locale profiles (13): `export * from './{base}.js'` + `variantOf`,
│                         #   overriding only currencyDefaults/toCurrency — see docs/language-layers.md
├── {primary-subtag}.js  # Bare-tag aliases (46): `export * from './{target}.js'` + `aliasOf`
└── utils/
    ├── parse-cardinal.js    # Cardinal form parsing (decimals, negatives)
    ├── parse-ordinal.js     # Ordinal form parsing (positive integers only)
    ├── parse-currency.js    # Currency form parsing (dollars, cents)
    ├── scale.js             # Pure *Max producers (western/myriad/indian/longScale/bounded/UNBOUNDED)
    ├── check-max.js         # checkMax: throws RangeError past a form's declared ceiling
    ├── resolve-options.js   # resolveOptions: applies a form's exported defaults, validates options
    ├── currency-vocab.js    # Cross-language currency-name matrix (keyed by language) + assertCurrencyExponent
    ├── expand-scientific.js # Scientific notation expansion
    └── is-plain-object.js   # Object type checking
```

## Language File Pattern

A language exports one, two, or all three forms — `toCardinal`, `toOrdinal`, `toCurrency`
(at least one; forms are added incrementally, so export only what you implement). Each form
it exports must uphold the **conversion contract** (enforced by `test/contract.test.js`): for *any* input,
return a well-formed string **or** throw `RangeError` — never malformed output. Don't invent
vocabulary past your largest scale word: each form declares a bigint ceiling
(`cardinalMax`/`ordinalMax`/`currencyMax`, or `UNBOUNDED`), derived from your own scale table
via a `scale.js` helper so it can't drift, and guards the entry point with `checkMax`
(O(1), before building). Full spec in `docs/range-contract.md`; the gate
(`test/range-contract.test.js`) verifies every declared ceiling.

```javascript
import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { checkMax } from './utils/check-max.js'
import { western } from './utils/scale.js' // pick the helper matching your grouping

// Each form's ceiling, derived from your own table. western(n) treats n as the
// count of scale words above units — pass SCALES.length when the table starts at
// "thousand", or SCALES.length - 1 when index 0 is an empty units slot (see scale.js).
export const cardinalMax = western(SCALES.length) // smallest value the form refuses
export const ordinalMax = western(SCALES.length)  // often lower — derive separately if so
export const currencyMax = western(SCALES.length) // usually shares the cardinal ceiling

function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // Pass decimalPart only when the fraction routes through the scale builder
  // (omit it for digit-by-digit languages, which have no decimal ceiling).
  checkMax(integerPart, cardinalMax, decimalPart)
  // integerPart is bigint, handle isNegative prefix and decimalPart suffix
}

function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  checkMax(integerPart, ordinalMax)
  // positive integers only
}

function toCurrency (value, options) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  checkMax(dollars, currencyMax) // cents are ≤ 99, safe
  // Naming a 1000-subunit currency (TND, KWD, ...)? Resolve options first and
  // pass `minorUnitDigits(currency)` to the parser — see docs/currency-vocab.md.
  // Do this unconditionally, even if today's default currency doesn't need
  // it: the vocab matrix is keyed by *language*, so any currency a sibling
  // locale added later is reachable here too, the moment it lands.
  //
  // Naming more than one currency? A `[singular, plural]` word-form array
  // may be shorter for an invariable noun (no plural distinction) — index
  // [1] only when it exists: `count === 1n || major.length < 2 ? major[0] : major[1]`.
  //
  // currency vocabulary and the `currency` option follow the Options
  // Pattern below — see its toCurrency example, and docs/currency-vocab.md
  // for why currency word-data lives in a shared module while its grammar
  // (pluralization, joining, grammatical gender selection) doesn't.
}

export { toCardinal, toOrdinal, toCurrency }
```

Beware **silently-wrong** builders: if yours drops the scale word past its table (e.g.
`if (SCALES[i - 1])`, `if (!meta) return …`) it returns well-formed-but-wrong output that
fuzzing can't catch — derive the ceiling by reading the table, not by probing for garbage.

Language files are **self-contained**: duplicate small helpers rather than share them.
Extract a util only for the API contract (parsing, options, the range guard) or
genuinely universal single-purpose logic. Currency word-data
(`src/utils/currency-vocab.js`) is the one deliberate exception to "duplicate small
helpers": it's data, not logic, and centralizing it is the entire point of a
cross-language currency matrix (see `docs/currency-vocab.md`). Pluralization
*rules* still belong per-file — only the word-form arrays they consume are shared.

## Options Pattern

A form that accepts options declares an **options contract** — enforced by
`test/options-contract.test.js`: any form whose function takes an options
parameter **must** export its `<form>Defaults` (a form without one fails CI).

```javascript
import { resolveOptions } from './utils/resolve-options.js'

/**
 * @typedef {object} CardinalOptions
 * @property {('masculine'|'feminine')} [gender] - Grammatical gender of the number
 */

/** @type {Required<CardinalOptions>} */
export const cardinalDefaults = { gender: 'masculine' }

/** @type {{ gender: ReadonlyArray<Required<CardinalOptions>['gender']> }} */
export const cardinalValues = { gender: ['masculine', 'feminine'] } // enum options only

/**
 * @param {number | string | bigint} value
 * @param {CardinalOptions} [options]
 * @returns {string}
 */
function toCardinal (value, options) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  const { gender } = resolveOptions(options, cardinalDefaults, cardinalValues)
  // Pass explicit values to internal functions, not options object
}
```

`currency` is the same enum pattern, with its allowed set derived from the shared
currency-name matrix (`docs/currency-vocab.md`) instead of hand-typed:

```javascript
import { en as CURRENCY_VOCAB, assertCurrencyExponent, minorUnitDigits } from './utils/currency-vocab.js'

/**
 * @typedef {object} CurrencyOptions
 * @property {import('./utils/currency-vocab.js').EnCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { currency: 'USD' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']> }} */
export const currencyValues = { currency: /** @type {Required<CurrencyOptions>['currency'][]} */ (Object.keys(CURRENCY_VOCAB)) }

function toCurrency (value, options) {
  const { currency } = resolveOptions(options, currencyDefaults, currencyValues)
  const { dollars, cents } = parseCurrencyValue(value, minorUnitDigits(currency))
  assertCurrencyExponent(cents, currency) // throws RangeError for a fractional amount a currency can't represent (e.g. JPY)
  const { major, minor } = CURRENCY_VOCAB[currency]
  // build using major[n] / minor[n] — minor is `string[] | null`, narrow it
  // at the point of use (inside the cents > 0n branch), not at destructure
}
```

`import('./utils/currency-vocab.js').EnCurrency` is `keyof typeof en` — one
`keyof` typedef per language export in `currency-vocab.js`, so widening a
language's currency map widens every file referencing it in the same edit,
and a typo in either place fails typecheck. Don't hand-type the union.

Each fact has exactly one home, and machines hold every seam:

- **type + description** → the `@typedef` (one `@property` per option — lint
  forces the description; never an inline `@param {{...}}`).
- **default** → the exported `<form>Defaults` map. The runtime applies it
  (`resolveOptions`), the `LANGUAGES.md` generator imports it, and the
  `Required<...Options>` annotation makes strict checkJs fail a key missing
  from (or added beyond) the typedef.
- **allowed set** (enum options like `gender`) → the exported `<form>Values`
  map. An out-of-set value throws `RangeError`; the array's element type ties it
  to the typedef union, so a typo in the set fails typecheck.

`resolveOptions` rejects malformed options with `TypeError` (unknown key,
wrong-typed value, non-object) and treats `{ key: undefined }` as "use the
default". Boolean/free-string forms omit the `<form>Values` argument.

## Adding a Language

```bash
npm run lang:add -- <code>  # Creates stub + fixture, regenerates LANGUAGES.md
```

`<code>` must carry a region/script subtag (`ko-KR`, not `ko`) — bare codes are reserved for
alias files. When `<code>` is the first variant in its family, `lang:add` **also** scaffolds its
bare-tag alias (`src/{primary}.js` + fixture) automatically. When it joins an existing family, it
prints a note instead — repointing or dropping an existing alias is a human judgment call (see
`docs/bare-tag-aliases.md`), not something the tool guesses at.

`lang:add` always scaffolds a full implementation. If the new code's numerals turn out to be a
byte-identical clone of an existing variant's (verify with a default-options probe across a wide
value range — see `docs/language-layers.md`'s two counterexamples for what a probe alone can
miss), replace the stub with a locale profile instead: `export *` from the base, `variantOf`, and
a `toCurrency` wrapper overriding only the default currency. This is a human call the tool doesn't
make for you.

Then: implement the form(s) you're adding (`toCardinal`, `toOrdinal`, and/or `toCurrency` — at least one) in `src/{code}.js` — **including the `*Max` declarations and `checkMax` guards** (see Language File Pattern) — add cases to `test/fixtures/{code}.js`, run `npm test`.

A new language must clear these enforced gates (in `test/`):

- **Contract** (`contract.test.js`): every exported form returns a well-formed string or throws `RangeError` for any input.
- **Range** (`range-contract.test.js`): every exported form **must** declare its `*Max` (helper-derived or `UNBOUNDED`) — a form without one fails — and uphold it: well-formed and injective across the range, throwing exactly at a finite ceiling.
- **Options** (`options-contract.test.js`): every options-taking form **must** export its `<form>Defaults` (see Options Pattern) — declared defaults round-trip, malformed options throw `TypeError`, out-of-set enum values throw `RangeError`.
- **Currency vocab** (`currency-vocab-contract.test.js`, currency-exporting languages only): a declared `currencyValues.currency` enum must have a matching entry in `src/utils/currency-vocab.js` for every code it lists (see `docs/currency-vocab.md`).
- **Bare-tag alias** (`bare-tag-contract.test.js`): a family with exactly one variant **must** have a matching alias file; every alias's re-exported bindings must be reference-identical to its target's (see `docs/bare-tag-aliases.md`).
- **Variant profile** (`variant-profile-contract.test.js`, profile files only): `variantOf` must name a full implementation (not another profile or alias); `toCardinal`/`toOrdinal` must be reference-identical to the base's; `toCurrency` with no options must match calling the base explicitly with the profile's own default currency (see `docs/language-layers.md`).
- **Coverage** (`conversions.test.js`): ≥5 fixture cases per form.
- **Canonical code** (`conversions.test.js`): the filename is canonical BCP 47 (`en-US`, not `en-us`).

**Reference implementations by pattern**:

| Pattern     | Examples                                |
| ----------- | --------------------------------------- |
| Western     | `en-US.js`, `de-DE.js`, `fr-FR.js`      |
| South Asian | `hi-IN.js`, `bn-BD.js`                  |
| East Asian  | `ja-JP.js`, `ko-KR.js`, `zh-Hans-CN.js` |
| Slavic      | `ru-RU.js`, `pl-PL.js`, `uk-UA.js`      |

## Commands

```bash
npm test                         # Unit tests + build types
npm run lint:fix                 # Fix linting issues
npm run bench                    # All languages
npm run bench -- en-US           # Single language
npm run bench -- en-US,fr-FR,de-DE  # Multiple languages
npm run bench -- en-US --full    # Longer run (more iterations)
npm run build && npm run site:build && npm run site:serve  # Preview the demo site
```

## Demo Site

`site/` holds the GitHub Pages demo (<https://forzagreen.github.io/n2words/>), deployed from
`main` by `.github/workflows/pages.yml`. It is vanilla HTML/CSS/ESM with no framework and no
build step of its own — `scripts/build-site.js` assembles `_site/` from three parts:

- `site/**` — three pages: the converter demo, the languages table, and short docs,
  plus `analytics.js` (GA4, skipped on localhost so previews stay out of the property).
- `dist/**` — the real Rollup bundles. The demo `import()`s `dist/{code}/{form}.js` at runtime,
  so it runs the deployed commit's own code; there is no fixture to keep in sync.
- `_site/languages.json` — generated by `scripts/generate-site-data.js` from `src/`: every
  variant, the forms it exports, each form's options contract and `*Max` ceiling, bundle sizes.

**Nothing about a language is hardcoded in `site/`.** Adding a language to `src/` gives it a
picker entry, an options panel and a table row on the next deploy. Option metadata comes from
`scripts/lib/options-index.js`, shared with the `LANGUAGES.md` generator, so the docs table and
the demo can't disagree.

## CLI

`bin/` is the shipped `n2words` command (`npx n2words 42 -l en`). Because it ships, it may
import only `node:` builtins and `src/` — no `chalk`, which is a devDependency and fine in
`bench/` and `scripts/` but would break the zero-dependency guarantee.

**Nothing about a language is hardcoded in `bin/`.** Flags, help text and validation are
derived at runtime from each module's own declarations — `<form>Defaults` for the flag set
and types, `<form>Values` for enum sets, `<form>Max` for the ceilings shown in help — the
same contracts the gates in `test/` enforce. Adding a language or an option to `src/` gives
the CLI a new flag with no edit in `bin/`. Option *value* validation stays in
`resolveOptions`, whose errors already name the key and the allowed set; the CLI prints them
rather than re-checking.

Two seams to keep in mind when touching it:

- `currency` is both a form name and an option key. `--currency <CODE>` means "as currency,
  in CODE"; `--form currency` uses the locale default. It's forwarded even when a module's
  `currencyDefaults` omits `currency`, since the 46 bare-tag aliases deliberately require an
  explicit one (`docs/bare-tag-aliases.md`).
- Flags are derived *after* `--lang` resolves, which is why nl-NL's `noHundredPairing` and
  en-US's `hundredPairing` can both map to `--no-hundred-pairing` without colliding.

Exit codes are part of the contract: `0` success, `1` usage error, `2` a value the library
refused. `test/cli.test.js` spawns the real binary and pins all three.

## Git Workflow

**NEVER commit directly to `main`.** Always create a feature branch and open a PR. The `main` branch has branch protection — direct pushes will be rejected.

## Commits

Conventional Commits required. Scopes: BCP 47 codes — one (`en-US`), comma-separated (`az-AZ,tr-TR`), or a bare primary subtag for a variant family (`en`, `es`) — or project areas (`core`, `esm`, `umd`, `types`, `deps`). Family names like `slavic`/`turkic` are **not** valid scopes.

```bash
feat(pt-BR): add Brazilian Portuguese
fix(en-US): correct thousand handling
fix(az-AZ,tr-TR): guard scale ceilings
perf(ja-JP): optimize BigInt handling
```

See `.commitlintrc.mjs` for full configuration.
