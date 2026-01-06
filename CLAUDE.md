# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Critical Patterns

1. **Alphabetical ordering** - Imports and exports in `lib/n2words.js` MUST be alphabetically sorted
2. **IETF BCP 47 codes** - Language codes: `en`, `zh-Hans`, `fr-BE`
3. **Normalized exports** - Codes become camelCase identifiers: `zhHans`, `frBE`

## Architecture

**Functional, self-contained modules** - Each language is a standalone file exporting `toWords(value, options?)`.

```text
lib/
├── n2words.js           # Re-exports all languages (alphabetically)
├── languages/*.js       # One file per language
└── utils/
    ├── parse-numeric.js    # Shared input parsing
    ├── is-plain-object.js  # Object type checking
    └── validate-options.js # Options validation
```

**Language file pattern**:

```javascript
import { parseNumericValue } from '../utils/parse-numeric.js'

function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  // Convert integerPart (bigint) to words
  // Handle isNegative prefix and decimalPart suffix
  return result
}

export { toWords }
```

## Essential Commands

```bash
npm run lang:add <code>   # Scaffold new language
npm test                  # Run test suite
npm run build             # Build UMD bundles
npm run lint:fix          # Fix linting issues
```

## Adding a Language

1. `npm run lang:add <code>` - creates stub + fixture, updates n2words.js + type tests
2. Implement `toWords()` in `lib/languages/{code}.js`
3. Add test cases to `test/fixtures/languages/{code}.js`
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

---

**Version**: 2.0.0 | **52 languages** | [GitHub](https://github.com/forzagreen/n2words)
