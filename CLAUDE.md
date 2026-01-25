# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Quick Reference

- **Language codes**: IETF BCP 47 (`en-US`, `zh-Hans-CN`, `fr-BE`)
- **Imports**: `import { toCardinal } from 'n2words/en-US'`
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

```javascript
import { parseCardinalValue } from './utils/parse-cardinal.js'

/**
 * @param {number | string | bigint} value
 * @returns {string}
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // integerPart is bigint, handle isNegative prefix and decimalPart suffix
  return result
}

export { toCardinal }
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

Then: implement at least one form (`toCardinal`, `toOrdinal`, `toCurrency`) in `src/{code}.js`, add cases to `test/fixtures/{code}.js`, run `npm test`.

**Reference implementations by pattern**:

| Pattern     | Examples                          |
| ----------- | --------------------------------- |
| Western     | `en-US.js`, `de.js`, `fr.js`      |
| South Asian | `hi.js`, `bn.js`                  |
| East Asian  | `ja.js`, `ko.js`, `zh-Hans-CN.js` |
| Slavic      | `ru.js`, `pl.js`, `uk.js`         |

## Commands

```bash
npm test                         # Unit tests + build types
npm run lint:fix                 # Fix linting issues
npm run bench                    # All languages
npm run bench -- en-US           # Single language
npm run bench -- en-US,fr,de     # Multiple languages
npm run bench -- --save --compare  # Track changes over time
```

## Commits

Conventional Commits required. Scopes: BCP 47 codes (`en-US`, `fr-BE`) or project areas (`core`, `types`, `umd`).

```bash
feat(pt-BR): add Brazilian Portuguese
fix(en-US): correct thousand handling
perf(ja): optimize BigInt handling
```

See `.commitlintrc.mjs` for full configuration.
