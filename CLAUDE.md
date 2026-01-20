# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Critical Patterns

1. **Alphabetical ordering** - Imports and exports in `index.js` MUST be alphabetically sorted
2. **IETF BCP 47 codes** - Language codes: `en`, `zh-Hans`, `fr-BE`
3. **Normalized exports** - Codes become camelCase identifiers: `zhHans`, `frBE`

## Architecture

**Functional, self-contained modules** - Each language is a standalone file exporting `toCardinal(value, options?)`. Languages with ordinal support also export `toOrdinal(value)`.

```text
index.js                 # Re-exports all languages (alphabetically)
src/
├── en.js                # One file per language (flat structure)
├── fr.js
├── zh-Hans.js
└── utils/
    ├── parse-cardinal.js   # Cardinal value parsing (decimals, negatives)
    ├── parse-ordinal.js    # Ordinal value parsing (positive integers only)
    ├── is-plain-object.js  # Object type checking
    └── validate-options.js # Options validation
```

**Language file pattern** (JSDoc required for type generation):

```javascript
import { parseCardinalValue } from './utils/parse-cardinal.js'

/**
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // Convert integerPart (bigint) to words
  // Handle isNegative prefix and decimalPart suffix
  return result
}

export { toCardinal }
```

## Adding a Language

1. `npm run lang:add <code>` - creates stub + fixture, updates index.js + type tests
2. Implement `toCardinal()` in `src/{code}.js`
3. Add test cases to `test/fixtures/{code}.js`
4. `npm test`

**Reference implementations**:

| Pattern       | Files                            |
| ------------- | -------------------------------- |
| Western scale | `en.js`, `de.js`, `fr.js`        |
| South Asian   | `hi.js`, `bn.js`                 |
| East Asian    | `ja.js`, `ko.js`, `zh-Hans.js`   |
| Slavic        | `ru.js`, `pl.js`, `uk.js`        |

## Options Pattern

Languages with options accept a second parameter (JSDoc required):

```javascript
import { validateOptions } from './utils/validate-options.js'

/**
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Extract options with defaults at entry point
  const { gender = 'masculine' } = options

  // Pass explicit values to internal functions (not the options object)
  result += integerToWords(integerPart, gender)
}
```

## Commits & Testing

Conventional Commits required. See `.commitlintrc.mjs` for types and scopes.

Before PR:

```bash
npm run lint:fix && npm test:all
```

Before/after `src/` changes (check for regressions):

```bash
npm run bench -- --lang en             # Quick single language check
npm run bench -- --save --compare      # Track changes over time
```
