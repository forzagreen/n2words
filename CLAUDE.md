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
    ├── too-large-error.js   # RangeError for values past a language's scale ceiling
    ├── expand-scientific.js # Scientific notation expansion
    ├── is-plain-object.js   # Object type checking
    └── validate-options.js  # Options validation
```

## Language File Pattern

Every language exports all three forms: `toCardinal`, `toOrdinal`, `toCurrency`. Each must
uphold the **conversion contract** (enforced by `test/contract.test.js`): for *any* input,
return a well-formed string **or** throw `RangeError` — never malformed output. Past the
largest scale word your tables can name, throw `tooLargeError(maxExponent)` — don't invent
vocabulary. Derive the ceiling from the scale table so it can't drift, and guard at the
entry point (O(1), before building).

```javascript
import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { tooLargeError } from './utils/too-large-error.js'

const MAX_CARDINAL_EXPONENT = (SCALES.length + 1) * 3 // derive from your own table
const MAX_CARDINAL = 10n ** BigInt(MAX_CARDINAL_EXPONENT)

function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // Guard the decimal part too when the fraction routes through the scale builder
  // (omit that clause for digit-by-digit languages, which have no decimal ceiling).
  if (integerPart >= MAX_CARDINAL || (decimalPart && BigInt(decimalPart) >= MAX_CARDINAL)) {
    throw tooLargeError(MAX_CARDINAL_EXPONENT)
  }
  // integerPart is bigint, handle isNegative prefix and decimalPart suffix
}

function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  if (integerPart >= MAX_ORDINAL) throw tooLargeError(MAX_ORDINAL_EXPONENT) // define likewise; often lower
  // positive integers only
}

function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  if (dollars >= MAX_CARDINAL) throw tooLargeError(MAX_CARDINAL_EXPONENT) // cents are ≤ 99, safe
  // dollars/cents are bigints
}

export { toCardinal, toOrdinal, toCurrency }
```

Beware **silently-wrong** builders: if yours drops the scale word past its table (e.g.
`if (SCALES[i - 1])`, `if (!meta) return …`) it returns well-formed-but-wrong output that
fuzzing can't catch — derive the ceiling by reading the table, not by probing for garbage.

Language files are **self-contained**: duplicate small helpers rather than share them.
Extract a util only for the API contract (parsing, options, the too-large error) or
genuinely universal single-purpose logic.

## Options Pattern

```javascript
import { validateOptions } from './utils/validate-options.js'

/**
 * @param {number | string | bigint} value
 * @param {Object} [options]
 * @param {('masculine'|'feminine')} [options.gender='masculine']
 * @returns {string}
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  const { gender = 'masculine' } = options
  // Pass explicit values to internal functions, not options object
}
```

## Adding a Language

```bash
npm run lang:add -- <code>  # Creates stub + fixture + type tests
```

Then: implement all three forms (`toCardinal`, `toOrdinal`, `toCurrency`) in `src/{code}.js` — **including the scale-ceiling guards** (see Language File Pattern) — add cases to `test/fixtures/{code}.js`, run `npm test`.

A new language must clear three enforced gates (in `test/`):

- **Contract** (`contract.test.js`): every form returns a well-formed string or throws `RangeError` for any input.
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
