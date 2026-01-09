# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Critical Patterns

1. **Alphabetical ordering** - Imports and exports in `index.js` MUST be alphabetically sorted
2. **IETF BCP 47 codes** - Language codes: `en`, `zh-Hans`, `fr-BE`
3. **Normalized exports** - Codes become camelCase identifiers: `zhHans`, `frBE`

## Architecture

**Functional, self-contained modules** - Each language is a standalone file exporting `toWords(value, options?)`.

```text
index.js                 # Re-exports all languages (alphabetically)
src/
├── en.js                # One file per language (flat structure)
├── fr.js
├── zh-Hans.js
└── utils/
    ├── parse-numeric.js    # Shared input parsing
    ├── is-plain-object.js  # Object type checking
    └── validate-options.js # Options validation
```

**Language file pattern**:

```javascript
import { parseNumericValue } from './utils/parse-numeric.js'

function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  // Convert integerPart (bigint) to words
  // Handle isNegative prefix and decimalPart suffix
  return result
}

export { toWords }
```

## Adding a Language

1. `npm run lang:add <code>` - creates stub + fixture, updates index.js + type tests
2. Implement `toWords()` in `src/{code}.js`
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

Languages with options accept a second parameter:

```javascript
function toWords (value, options = {}) {
  const { gender = 'masculine' } = options
  // Use option in conversion
}
```

## Commits & Testing

Conventional Commits required. See `.commitlintrc.mjs` for types and scopes.

Before PR:

```bash
npm run lint:fix && npm test
```

Before/after `src/` changes (check for regressions):

```bash
npm run bench                          # All languages
npm run bench -- --lang en             # Single language
npm run bench -- --lang en,fr,de       # Multiple languages
npm run bench -- --save --compare      # Track changes over time
npm run bench -- --full                # Full mode (slower, more accurate)
```
