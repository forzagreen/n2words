# CLAUDE.md - Project Context for AI Assistants

This document provides comprehensive context about the n2words project structure, patterns, and conventions to help AI assistants understand and work with the codebase effectively.

## Project Overview

**n2words** is a JavaScript library that converts numbers to words in 48 languages with zero dependencies.

- **Version**: 2.0.0
- **Type**: ES Module (ESM) with CommonJS and UMD support
- **Node.js**: ^20 || ^22 || >=24
- **License**: MIT
- **Zero dependencies**: Pure JavaScript implementation

### Key Features

- 🌍 48 language implementations
- 📦 Zero runtime dependencies
- 🧪 Comprehensive testing and validation
- 📱 Universal (Node.js, browsers, ESM/CommonJS)
- 🔢 Supports number, bigint, and string inputs
- 🎯 Full TypeScript support via JSDoc annotations

## Project Structure

```text
n2words/
├── lib/
│   ├── classes/              # Base classes for language implementations
│   │   ├── abstract-language.js          # Abstract base class (all languages inherit)
│   │   ├── greedy-scale-language.js      # Scale-based decomposition (most common)
│   │   ├── slavic-language.js            # Three-form pluralization (Slavic languages)
│   │   ├── south-asian-language.js       # Indian numbering system
│   │   └── turkic-language.js            # Turkish-style implicit "bir" rules
│   ├── languages/            # Individual language implementations (48 files)
│   │   ├── en.js            # English
│   │   ├── es.js            # Spanish
│   │   ├── ar.js            # Arabic (with options)
│   │   ├── zh-Hans.js       # Simplified Chinese (with options)
│   │   └── ...              # 44 more languages
│   └── n2words.js            # Main entry point (exports all converters)
├── scripts/
│   ├── add-language.js       # Scaffolding tool for new languages
│   ├── validate-language.js  # Validation tool for language implementations
│   └── README.md             # Scripts documentation
├── test/
│   ├── fixtures/languages/   # Test data for each language
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── web/                  # Browser tests
└── dist/                     # Browser build (UMD)
├── bench/                    # Benchmark scripts (perf, memory)
│   ├── perf.js               # Performance benchmark
│   └── memory.js             # Memory benchmark (requires --expose-gc)
└── rollup.config.js          # Bundling config for UMD/dist builds
```

## Core Architecture

### 1. Class Hierarchy

All language implementations follow an inheritance pattern:

```text
AbstractLanguage (base)
├── GreedyScaleLanguage    # Most common: English, Spanish, French, etc.
├── SlavicLanguage         # Russian, Polish, Czech, etc.
├── SouthAsianLanguage     # Hindi, Tamil, Telugu, Bengali, etc.
└── TurkicLanguage         # Turkish, Azerbaijani
```

#### AbstractLanguage (base class)

**Responsibilities:**

- Validates and normalizes input (`number | string | bigint`)
- Splits into sign, whole, and decimal parts
- Handles negative numbers (prepends `negativeWord`)
- Converts decimal parts
- Delegates whole number conversion to `convertWholePart()`

**Required properties subclasses must provide:**

```javascript
negativeWord = ''           // Word for negative (e.g., "minus")
zeroWord = ''              // Word for zero
decimalSeparatorWord = ''  // Word between whole and decimal (e.g., "point")
wordSeparator = ' '        // Separator between words
```

**Required methods subclasses must implement:**

```javascript
convertWholePart(wholeNumber) // bigint → string
```

**Optional properties:**

```javascript
convertDecimalsPerDigit = false  // true = digit-by-digit decimals
digits = null                    // Array of digit words for lookup
```

#### GreedyScaleLanguage

**Used by**: English, Spanish, French, German, Arabic, Italian, Portuguese, etc. (most languages)

**How it works:**

1. Defines `scaleWordPairs` array: `[[value, word], ...]` in descending order
2. Greedily decomposes numbers using largest scale first
3. Calls `mergeScales(leftWords, leftScale, rightWords, rightScale)` to combine parts

**Example implementation pattern:**

```javascript
export class English extends GreedyScaleLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  scaleWordPairs = [
    [1000000000n, 'billion'],
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    // ... down to 1n
  ]

  mergeScales(leftWords, leftScale, rightWords, rightScale) {
    // Language-specific merge logic
    if (leftScale === 100n && rightScale < 100n) {
      return leftWords + ' and ' + rightWords
    }
    return leftWords + ' ' + rightWords
  }
}
```

#### SlavicLanguage

**Used by**: Russian, Polish, Czech, Croatian, Serbian, Ukrainian

**Key feature**: Three-form pluralization based on number endings

**Pattern:**

```javascript
export class Russian extends SlavicLanguage {
  pluralForms = {
    1000000: ['миллион', 'миллиона', 'миллионов'],
    1000: ['тысяча', 'тысячи', 'тысяч']
  }

  // Automatically selects correct form based on number
}
```

#### SouthAsianLanguage

**Used by**: Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Marathi, Punjabi, Urdu

**Key feature**: Supports Indian numbering system (lakh, crore)

#### TurkicLanguage

**Used by**: Turkish, Azerbaijani

**Key feature**: Omits "bir" (one) before certain scales

### 2. Entry Point Structure ([lib/n2words.js](lib/n2words.js))

The main file is organized into clear sections:

```javascript
// ============================================================================
// Language Imports
// ============================================================================
import { Arabic } from './languages/ar.js'
import { English } from './languages/en.js'
// ... (alphabetically sorted)

// ============================================================================
// Type Definitions
// ============================================================================
/** @typedef {number | bigint | string} NumericValue */
/** @typedef {Object} ArabicOptions ... */
// ... (alphabetically sorted by language)

// ============================================================================
// Converter Factory
// ============================================================================
function makeConverter (LanguageClass) {
  return function convertToWords (value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// ============================================================================
// Language Converters
// ============================================================================
const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
const EnglishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(English))
// ... (alphabetically sorted)

// ============================================================================
// Exports
// ============================================================================
export {
  ArabicConverter,
  EnglishConverter,
  // ... (alphabetically sorted)
}
```

**IMPORTANT PATTERNS:**

- All imports, converters, and exports are **alphabetically sorted**
- Languages with options have type annotations: `options?: LanguageOptions`
- Languages without options: `(value: NumericValue) => string`
- Each section is clearly marked with comment headers

### 3. Language-Specific Options

Some languages support additional options:

| Language         | Option                | Type                            | Description                           |
| ---------------- | --------------------- | ------------------------------- | ------------------------------------- |
| Arabic           | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Arabic           | `negativeWord`        | string                          | Custom negative word                  |
| Bangla           | `feminine`            | boolean                         | Currently unused in Bangla            |
| Biblical Hebrew  | `andWord`             | string                          | Conjunction character (default: 'ו')  |
| Biblical Hebrew  | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Chinese (both)   | `formal`              | boolean                         | Formal/financial vs common numerals   |
| Croatian         | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Czech            | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Danish           | `ordFlag`             | boolean                         | Enable ordinal number conversion      |
| Dutch            | `includeOptionalAnd`  | boolean                         | Include optional "en" separator       |
| Dutch            | `noHundredPairs`      | boolean                         | Disable comma before hundreds         |
| Dutch            | `accentOne`           | boolean                         | Use accented "één" for one            |
| French           | `withHyphenSeparator` | boolean                         | Use hyphens vs spaces                 |
| French Belgium   | `withHyphenSeparator` | boolean                         | Use hyphens vs spaces                 |
| Hebrew           | `andWord`             | string                          | Conjunction character (default: 'ו')  |
| Hindi            | `feminine`            | boolean                         | Currently unused in Hindi             |
| Latvian          | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Lithuanian       | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Polish           | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Romanian         | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Russian          | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Serbian Cyrillic | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Serbian Latin    | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Spanish          | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |
| Turkish          | `dropSpaces`          | boolean                         | Remove spaces between words           |
| Ukrainian        | `gender`              | 'masculine' \| 'feminine'       | Grammatical gender for number forms   |

**Typedef pattern for options:**

```javascript
/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord] Word for negative numbers
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */
```

## Development Workflows

### Adding a New Language

Use the scaffolding tool:

```bash
npm run lang:add <language-code>
```

**What it does:**

1. Validates language code (IETF BCP 47 format: `en`, `zh-Hans`, `fr-BE`)
2. Creates `lib/languages/{code}.js` with boilerplate
3. Creates `test/fixtures/languages/{code}.js` with test cases
4. Updates `lib/n2words.js`:
   - Adds import (alphabetically in Language Imports section)
   - Creates converter with type annotation (alphabetically in Language Converters section)
   - Adds export (alphabetically in Exports section)

**After scaffolding:**

1. Edit `lib/languages/{code}.js`:
   - Replace placeholder words
   - Add complete `scaleWordPairs` array
   - Implement `mergeScales()` logic
2. Edit `test/fixtures/languages/{code}.js`:
   - Add comprehensive test cases
3. Validate: `npm run lang:validate -- {code} --verbose`
4. Test: `npm test`

### Validating Languages

```bash
npm run lang:validate              # All languages
npm run lang:validate -- en es fr  # Specific languages
npm run lang:validate -- --verbose # Detailed info
```

**What it validates:**

- ✅ IETF BCP 47 naming convention
- ✅ Class structure and inheritance
- ✅ Required properties (negativeWord, zeroWord, etc.)
- ✅ Method implementations (convertWholePart)
- ✅ Scale word ordering (descending)
- ✅ Import/converter/export in n2words.js
- ✅ Test fixture exists
- ✅ JSDoc documentation

**Exit codes:**

- 0: All validations passed
- 1: One or more languages have errors

### Testing

```bash
npm test                 # Full test suite (validation + unit + integration + types)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:types       # TypeScript type checking
npm run test:web         # Browser tests (Chrome, Firefox via Selenium on dist/)
npm run test:all         # All tests including web tests
```

**IMPORTANT - Browser Testing:**

- Browser tests (`test:web`) run against **`dist/` UMD bundles**, not `lib/` source
- These tests verify actual browser compatibility (Chrome 67+, Firefox 68+, Safari 14+, Edge 79+)
- Browser compatibility claims are based on these `dist/` bundle tests
- The `lib/` source is ES2022+ and is intended for modern bundlers, not direct browser usage

### Build & Bundling

- **Tooling:** `rollup` (configured in `rollup.config.js`) generates UMD bundles in `dist/`.
- **Outputs:** `dist/n2words.js` (all converters) and `dist/{ConverterName}.js` (individual converter UMD files).
- **Babel:** `@babel/preset-env` is used with explicit targets that assume BigInt support (modern browsers). The build is configured to keep `BigInt` primitives in the output (no polyfill for BigInt).
- **Minification:** `terser` with `ecma: 2020` is used for minification.
- **Banner:** Builds include a versioned banner using `package.json` `version`.

**Note**: BigInt is a hard runtime requirement for the library; legacy engines without BigInt (e.g., IE11) are not supported by the distributed UMD bundles.

**Two Build Targets:**

1. **`dist/` (UMD bundles)**: For direct browser usage via CDN/`<script>` tags
   - Transpiled with Babel to ES2020 (preserving BigInt)
   - Tested in real browsers (Chrome, Firefox via Selenium)
   - Browser compatibility: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+

2. **`lib/` (ESM source)**: For modern bundlers (Webpack, Vite, Rollup) and Node.js
   - ES2022+ modern JavaScript (class fields, BigInt, optional chaining, etc.)
   - Requires bundler/transpilation for browser compatibility
   - Smaller final bundles with tree-shaking

### Code Quality

```bash
npm run lint         # Lint all (JS + Markdown)
npm run lint:js      # JavaScript linting (StandardJS)
npm run lint:md      # Markdown linting
npm run lint:fix     # Auto-fix both
npm run lint:js:fix  # Auto-fix JavaScript only
npm run lint:md:fix  # Auto-fix Markdown only
```

## Important Conventions

### 1. Language Code Format

**ALWAYS use IETF BCP 47 format:**

- Base: `en`, `fr`, `es` (2-3 lowercase letters)
- Script: `zh-Hans`, `sr-Latn` (language-Script)
- Region: `fr-BE`, `en-US` (language-REGION)

**File naming:**

- Language file: `lib/languages/{code}.js` (e.g., `en.js`, `zh-Hans.js`)
- Test fixture: `test/fixtures/languages/{code}.js`

### 2. Class Naming

**Use CLDR Display Names in PascalCase:**

- `en` → `English`
- `zh-Hans` → `SimplifiedChinese`
- `fr-BE` → `FrenchBelgium`
- `sr-Latn` → `SerbianLatin`
- `nb` → `NorwegianBokmal`

**Get canonical name:**

```javascript
const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
displayNames.of('zh-Hans') // "Simplified Chinese"
```

**Exception**: Rare/historical languages not in CLDR (e.g., `hbo` - Biblical Hebrew) use descriptive names.

### 3. Alphabetical Ordering

**CRITICAL**: All lists in `lib/n2words.js` MUST be alphabetically sorted:

- Imports
- Type definitions
- Converter declarations
- Exports

**Why**: Makes maintenance easier, reduces merge conflicts, aids readability.

### 4. Type Annotations

**Languages with options:**

```javascript
const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
```

**Languages without options:**

```javascript
const EnglishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(English))
```

**Always define options typedef:**

```javascript
/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord] Word for negative numbers
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */
```

### 5. Test Fixtures

**Format:**

```javascript
export default [
  [input, expectedOutput],
  [input, expectedOutput, options],

  // Examples:
  [0, 'zero'],
  [42, 'forty-two'],
  [-1, 'minus one'],
  [3.14, 'three point one four'],
  [BigInt(999), 'nine hundred and ninety-nine'],
  [1, 'واحدة', { gender: 'feminine' }]  // With options
]
```

### 6. Documentation

**Class-level JSDoc:**

```javascript
/**
 * English language converter.
 *
 * Converts numbers to English words, supporting:
 * - Negative numbers (prepended with "minus")
 * - Decimal numbers ("point" separator)
 * - Large numbers (up to billions)
 *
 * Examples:
 * - 42 → "forty-two"
 * - 123 → "one hundred and twenty-three"
 * - -3.14 → "minus three point one four"
 */
export class English extends GreedyScaleLanguage {
  // ...
}
```

**Method-level JSDoc:**

```javascript
/**
 * Merges scale components with appropriate separators.
 *
 * @param {string} leftWords - Words for the left (higher scale) component
 * @param {bigint} leftScale - The scale value of the left component
 * @param {string} rightWords - Words for the right (lower scale) component
 * @param {bigint} rightScale - The scale value of the right component
 * @returns {string} The merged result
 */
mergeScales(leftWords, leftScale, rightWords, rightScale) {
  // ...
}
```

## Common Patterns

### Pattern 1: Basic Scale-Based Language

```javascript
import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

export class MyLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  scaleWordPairs = [
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    // ... complete list down to 1n
  ]

  mergeScales(leftWords, leftScale, rightWords, rightScale) {
    return leftWords + ' ' + rightWords
  }
}
```

### Pattern 2: Language with Gender Options

```javascript
export class MyLanguage extends GreedyScaleLanguage {
  constructor(options = {}) {
    super()

    this.options = this.mergeOptions({
      gender: 'masculine'
    }, options)
  }

  get scaleWordPairs() {
    // Return appropriate scale words based on gender
    return this.options.gender === 'feminine'
      ? this.feminineScales
      : this.masculineScales
  }

  masculineScales = [/* masculine forms */]
  feminineScales = [/* feminine forms */]
}
```

### Pattern 3: Regional Variant

```javascript
import { French } from './fr.js'

export class FrenchBelgium extends French {
  constructor(options = {}) {
    super(options)
    // Override specific scale words
    this.updateScaleWord(70n, 'septante')
    this.updateScaleWord(90n, 'nonante')
  }
}
```

## Scripts Deep Dive

### add-language.js

**Purpose**: Scaffold a new language implementation

**Key functions:**

- `validateLanguageCode(code)` - Validates IETF BCP 47 format
- `getExpectedClassName(code)` - Gets CLDR-based class name
- `generateLanguageFile(className)` - Creates language file template
- `generateTestFixture(code)` - Creates test fixture template
- `updateN2wordsFile(code, className)` - Updates main entry point

**Important**: Maintains alphabetical ordering in all sections

### validate-language.js

**Purpose**: Validate language implementations

**Validation checks:**

1. File naming (IETF BCP 47)
2. Class structure (proper ES6 class)
3. CLDR class naming
4. Required properties exist and have correct types
5. Methods implemented (not abstract)
6. Inheritance from valid base class
7. Scale words properly ordered (descending)
8. JSDoc documentation present
9. Test fixture exists and properly formatted
10. Registered in n2words.js (import, converter, export)

**Pure functions** (can be imported):

- `validateLanguageCode(code)`
- `getExpectedClassName(code)`
- `validateLanguage(code)`

## Performance Considerations

### Best Practices

1. **BigInt arithmetic**: Use `BigInt` for all scale values to support large numbers
2. **Greedy algorithm**: Most efficient for scale-based decomposition
3. **Caching**: AbstractLanguage caches whole number for reuse
4. **Zero dependencies**: No external libraries, minimal overhead

### Bundle Size

- Each language: ~2-5 KB gzipped
- Tree-shaking supported: Only import what you need
- UMD build: All languages, ~80 KB gzipped

## Testing Strategy

### Unit Tests

Located in `test/unit/` - test individual class methods and edge cases.

### Integration Tests

Located in `test/integration/` - test full conversion workflows using fixtures.

**Pattern:**

```javascript
import test from 'ava'
import { EnglishConverter } from 'n2words'
import fixtures from '../fixtures/languages/en.js'

for (const [input, expected, options] of fixtures) {
  test(`${input} → ${expected}`, t => {
    t.is(EnglishConverter(input, options), expected)
  })
}
```

### Web Tests

Located in `test/web/` - test browser builds (UMD) using Selenium.

## TypeScript Support

**Method**: JSDoc annotations (not TypeScript source)

**Benefits:**

- Works in both JS and TS projects
- IntelliSense in VSCode
- Type checking without compilation
- Smaller package size (no .d.ts files needed)

**Type exports:**

```typescript
import type { NumericValue, ArabicOptions } from 'n2words'
```

## Key Files Reference

| File                                   | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `lib/n2words.js`                       | Main entry point, exports all converters        |
| `lib/classes/abstract-language.js`     | Base class, input validation, decimal handling  |
| `lib/classes/greedy-scale-language.js` | Scale-based decomposition strategy              |
| `lib/languages/*.js`                   | Individual language implementations             |
| `scripts/add-language.js`              | Scaffolding tool                                |
| `scripts/validate-language.js`         | Validation tool                                 |
| `bench/perf.js`                        | Performance benchmark script                    |
| `bench/memory.js`                      | Memory usage benchmark script                   |
| `test/fixtures/languages/*.js`         | Test data for each language                     |
| `package.json`                         | Scripts, dependencies, config                   |

## Common Issues & Solutions

### Issue: Validation fails with "not imported in n2words.js"

**Solution**: Ensure three entries in `lib/n2words.js`:

1. Import in Language Imports section
2. Converter with type annotation in Language Converters section
3. Export in Exports section

All must be **alphabetically sorted** within their sections.

### Issue: "scaleWordPairs not in descending order"

**Solution**: Scale words MUST be ordered from largest to smallest:

```javascript
scaleWordPairs = [
  [1000000n, 'million'],  // Largest first
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']            // Smallest last
]
```

### Issue: "convertWholePart() not implemented"

**Solution**: Subclass must implement this abstract method:

```javascript
convertWholePart(wholeNumber) {
  if (wholeNumber === 0n) return this.zeroWord
  // Implementation here
}
```

For GreedyScaleLanguage, this is auto-implemented if `scaleWordPairs` and `mergeScales` are provided.

## Contributing Guidelines

1. **Add new language**: Use `npm run lang:add <code>`
2. **Validate**: `npm run lang:validate -- <code> --verbose`
3. **Test**: `npm test`
4. **Lint**: `npm run lint:fix`
5. **Document**: Add JSDoc comments
6. **Keep alphabetical**: All lists in n2words.js must stay sorted

## Resources

- IETF BCP 47: <https://tools.ietf.org/html/bcp47>
- CLDR Language Names: Uses `Intl.DisplayNames` API
- Language Codes Lookup: <https://en.wikipedia.org/wiki/IETF_language_tag>

---

**Last Updated**: 2025-12-25
**Project Version**: 2.0.0
**Maintained By**: Tyler Vigario & contributors
