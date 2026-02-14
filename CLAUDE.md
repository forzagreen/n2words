# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Quick Reference

- **Language codes**: IETF BCP 47 (`en-US`, `zh-Hans-CN`, `fr-BE`)
- **Imports**: `import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'`
- **Forms**: Cardinal (`toCardinal`), Ordinal (`toOrdinal`), Currency (`toCurrency`)

## Project Structure

```text
src/
├── {lang-code}.js       # One file per language (71 total)
└── utils/
    ├── parse-cardinal.js    # Cardinal form parsing (decimals, negatives)
    ├── parse-ordinal.js     # Ordinal form parsing (positive integers only)
    ├── parse-currency.js    # Currency form parsing (dollars, cents)
    ├── expand-scientific.js # Scientific notation expansion
    ├── is-plain-object.js   # Object type checking
    └── validate-options.js  # Options validation
```

## Language File Pattern

Every language exports all three forms: `toCardinal`, `toOrdinal`, `toCurrency`.

```javascript
import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // integerPart is bigint, handle isNegative prefix and decimalPart suffix
}

function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  // positive integers only
}

function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  // dollars/cents are bigints
}

export { toCardinal, toOrdinal, toCurrency }
```

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
npm run lang:add <code>  # Creates stub + fixture + type tests
```

Then: implement all three forms (`toCardinal`, `toOrdinal`, `toCurrency`) in `src/{code}.js`, add cases to `test/fixtures/{code}.js`, run `npm test`.

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
npm run bench -- --save --compare  # Track changes over time
```

## Git Workflow

**NEVER commit directly to `main`.** Always create a feature branch and open a PR. The `main` branch has branch protection — direct pushes will be rejected.

## Commits

Conventional Commits required. Scopes: BCP 47 codes (`en-US`, `fr-BE`) or project areas (`core`, `types`, `umd`).

```bash
feat(pt-BR): add Brazilian Portuguese
fix(en-US): correct thousand handling
perf(ja-JP): optimize BigInt handling
```

See `.commitlintrc.mjs` for full configuration.
