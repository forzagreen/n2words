# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=22, zero dependencies.

## Quick Reference

- **Language codes**: IETF BCP 47 (`en-US`, `zh-Hans-CN`, `fr-BE`)
- **Imports**: `import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'`
- **Forms**: Cardinal (`toCardinal`), Ordinal (`toOrdinal`), Currency (`toCurrency`)

## Project Structure

```text
src/
├── {lang-code}.js       # One file per language (70+)
└── utils/
    ├── parse-cardinal.js    # Cardinal form parsing (decimals, negatives)
    ├── parse-ordinal.js     # Ordinal form parsing (positive integers only)
    ├── parse-currency.js    # Currency form parsing (dollars, cents)
    ├── scale.js             # Pure *Max producers (western/myriad/indian/longScale/bounded/UNBOUNDED)
    ├── check-max.js         # checkMax: throws RangeError past a form's declared ceiling
    ├── resolve-options.js   # resolveOptions: applies a form's exported defaults, validates options
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

function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  checkMax(dollars, currencyMax) // cents are ≤ 99, safe
  // dollars/cents are bigints
}

export { toCardinal, toOrdinal, toCurrency }
```

Beware **silently-wrong** builders: if yours drops the scale word past its table (e.g.
`if (SCALES[i - 1])`, `if (!meta) return …`) it returns well-formed-but-wrong output that
fuzzing can't catch — derive the ceiling by reading the table, not by probing for garbage.

Language files are **self-contained**: duplicate small helpers rather than share them.
Extract a util only for the API contract (parsing, options, the range guard) or
genuinely universal single-purpose logic.

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
npm run lang:add -- <code>  # Creates stub + fixture + type tests
```

Then: implement the form(s) you're adding (`toCardinal`, `toOrdinal`, and/or `toCurrency` — at least one) in `src/{code}.js` — **including the `*Max` declarations and `checkMax` guards** (see Language File Pattern) — add cases to `test/fixtures/{code}.js`, run `npm test`.

A new language must clear five enforced gates (in `test/`):

- **Contract** (`contract.test.js`): every exported form returns a well-formed string or throws `RangeError` for any input.
- **Range** (`range-contract.test.js`): every exported form **must** declare its `*Max` (helper-derived or `UNBOUNDED`) — a form without one fails — and uphold it: well-formed and injective across the range, throwing exactly at a finite ceiling.
- **Options** (`options-contract.test.js`): every options-taking form **must** export its `<form>Defaults` (see Options Pattern) — declared defaults round-trip, malformed options throw `TypeError`, out-of-set enum values throw `RangeError`.
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
```

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
