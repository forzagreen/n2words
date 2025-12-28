# CLAUDE.md - Project Context for AI Assistants

This document provides comprehensive context about the n2words project structure, patterns, and conventions to help AI assistants understand and work with the codebase effectively.

## Quick Reference

**Project**: n2words — Number to words converter
**Version**: 2.0.0
**Type**: ES Module (ESM) + UMD browser bundles
**Node.js**: >=20
**Languages**: 48
**Zero Dependencies**: ✅

### Critical Patterns

- **Alphabetical ordering**: All imports, converters, exports in `lib/n2words.js` MUST be alphabetically sorted
- **IETF BCP 47**: Language codes must follow standard (e.g., `en`, `zh-Hans`, `fr-BE`)
- **CLDR naming**: Class names use CLDR Display Names in PascalCase (e.g., `SimplifiedChinese`)
- **Base classes**: 5 base classes (Abstract, GreedyScale, Slavic, SouthAsian, Turkic)
- **Scale order**: scaleWordPairs must be descending (largest to smallest)

### Common Commands

```bash
npm run lang:add <code>          # Scaffold new language
npm run lang:validate -- <code>  # Validate language implementation
npm test                         # Full test suite
npm run test:web                 # Browser tests (Playwright)
npm run build                    # Build UMD bundles
```

---

## Project Overview

**n2words** is a JavaScript library that converts numbers to words in 48 languages with zero dependencies.

### Key Features

- 🌍 48 language implementations
- 📦 Zero runtime dependencies
- 🧪 Comprehensive testing and validation
- 📱 Universal (Node.js, browsers, ESM/UMD)
- 🔢 Supports number, bigint, and string inputs
- 🎯 Full TypeScript support via JSDoc annotations

### Supported Languages

The library supports 48 languages across multiple scripts and regional variants:

**European Languages (24):**
Croatian (hr), Czech (cs), Danish (da), Dutch (nl), English (en), French (fr), French Belgium (fr-BE), German (de), Greek (el), Hungarian (hu), Italian (it), Latvian (lv), Lithuanian (lt), Norwegian Bokmål (nb), Polish (pl), Portuguese (pt), Romanian (ro), Russian (ru), Serbian Cyrillic (sr-Cyrl), Serbian Latin (sr-Latn), Spanish (es), Swedish (sv), Turkish (tr), Ukrainian (uk)

**Asian & Middle Eastern Languages (24):**
Arabic (ar), Azerbaijani (az), Bangla/Bengali (bn), Filipino/Tagalog (fil), Gujarati (gu), Hebrew (he), Biblical Hebrew (hbo), Hindi (hi), Indonesian (id), Japanese (ja), Kannada (kn), Korean (ko), Malay (ms), Marathi (mr), Persian/Farsi (fa), Punjabi (pa), Simplified Chinese (zh-Hans), Swahili (sw), Tamil (ta), Telugu (te), Thai (th), Traditional Chinese (zh-Hant), Urdu (ur), Vietnamese (vi)

**Note:** 9 of the Asian languages are Indian subcontinent languages (Bangla, Gujarati, Hindi, Kannada, Marathi, Punjabi, Tamil, Telugu, Urdu) that use the SouthAsianLanguage base class with lakh/crore number system support.

**Languages with Options (21):**
Arabic, Biblical Hebrew, Croatian, Czech, Danish, Dutch, French, French Belgium, Hebrew, Latvian, Lithuanian, Polish, Romanian, Russian, Serbian Cyrillic, Serbian Latin, Simplified Chinese, Spanish, Traditional Chinese, Turkish, Ukrainian

See [Language-Specific Options](#3-language-specific-options) section for details on available options.

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
│   ├── fixtures/languages/   # Test data for each language (48 files)
│   ├── unit/                 # Unit tests (*.test.js - class tests, edge cases)
│   ├── integration/          # Integration tests (*.test.* - full conversion workflows)
│   ├── types/                # TypeScript type checking tests
│   └── web/                  # Browser tests (Playwright: Chromium, Firefox, WebKit)
├── bench/                    # Benchmark scripts (perf, memory)
│   ├── perf.js               # Performance benchmark (uses benchmark.js)
│   ├── memory.js             # Memory benchmark (requires --expose-gc)
│   └── README.md             # Benchmarking documentation
├── dist/                     # UMD browser bundles (generated by rollup)
│   ├── n2words.js            # Main bundle - all 48 converters (~92KB, ~23KB gzipped)
│   ├── {ConverterName}.js    # 48 individual converter bundles (~4-6KB each)
│   └── *.js.map              # Source maps for all bundles
├── rollup.config.js          # Bundling config for UMD/dist builds
├── .browserslistrc           # Browser targeting ("defaults and supports bigint")
└── .nvmrc                    # Node version (lts/*)
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

**Used by**: English, Spanish, French, German, Portuguese, Swedish, Danish, Norwegian, Dutch, Korean, Filipino, Gujarati, Kannada, Marathi, Punjabi, Swahili, Greek, Hebrew, Biblical Hebrew, Azerbaijani, Simplified Chinese, Traditional Chinese, Urdu, Bangla

**Note**: Some languages extending GreedyScaleLanguage also extend AbstractLanguage directly when they need complete custom decomposition (Arabic, Hungarian, Indonesian, Italian, Japanese, Malay, Persian, Romanian, Tamil, Telugu, Thai, Vietnamese).

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

**Helper methods available:**

- `getScaleWord(scaleValue)` - Returns the word for an exact scale value. Used by languages that override `convertWholePart()` (e.g., Hungarian).
- `finalizeWords(output)` - Post-processing hook for language-specific formatting (e.g., Portuguese uses this for final cleanup).

#### SlavicLanguage

**Used by**: Russian, Polish, Czech, Croatian, Serbian (both Cyrillic and Latin), Ukrainian, Lithuanian, Latvian

**Key feature**: Three-form pluralization based on number endings, optional gender support

**Pattern:**

```javascript
export class Russian extends SlavicLanguage {
  pluralForms = {
    1: ['тысяча', 'тысячи', 'тысяч'],       // 10^3 (chunk index 1)
    2: ['миллион', 'миллиона', 'миллионов'], // 10^6 (chunk index 2)
    3: ['миллиард', 'миллиарда', 'миллиардов'] // 10^9 (chunk index 3)
  }

  // Keys are chunk indices: 1 = thousands, 2 = millions, 3 = billions, etc.
  // Automatically selects correct form based on number
}
```

#### SouthAsianLanguage

**Used by**: Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Marathi, Punjabi, Urdu

**Key feature**: Supports Indian numbering system (lakh, crore)

#### TurkicLanguage

**Used by**: Turkish, Azerbaijani

**Key feature**: Omits "bir" (one) before certain scales

#### Languages Using AbstractLanguage Directly

**12 languages** implement custom decomposition logic by extending AbstractLanguage directly instead of using helper classes:

- **Arabic (ar)**: Gender-specific forms, dual numbers, complex pluralization
- **Hungarian (hu)**: Custom override of `convertWholePart()` despite extending GreedyScaleLanguage
- **Indonesian (id)**: Simple concatenation-based conversion
- **Italian (it)**: Phonetic contractions, vowel elision, accent rules
- **Japanese (ja)**: Groups by 10^4 instead of 10^3, uses kanji, omits 一 (one) in specific contexts
- **Malay (ms)**: Similar to Indonesian with regional variations
- **Persian (fa)**: Right-to-left text, Persian-specific number formatting
- **Romanian (ro)**: Gender-specific lookups with separate dictionaries
- **Swahili (sw)**: Bantu language number patterns
- **Tamil (ta)**: Dravidian language with unique scale system
- **Telugu (te)**: Dravidian language patterns
- **Thai (th)**: Thai numerals and formatting
- **Vietnamese (vi)**: Vietnamese-specific number patterns

These languages have unique patterns that don't fit the standard base classes.

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

### Available npm Scripts

The project provides comprehensive npm scripts for all development tasks:

**Testing:**

- `npm test` - Full test suite (validation + unit + integration + types)
- `npm run test:all` - All tests including browser tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:types` - TypeScript type checking
- `npm run test:web` - Browser tests (Playwright: Chromium, Firefox, WebKit)
- `npm run coverage` - Generate test coverage report

**Language Development:**

- `npm run lang:add <code>` - Scaffold a new language implementation
- `npm run lang:validate` - Validate all language implementations
- `npm run lang:validate -- <codes>` - Validate specific languages
- `npm run lang:validate -- --verbose` - Detailed validation output

**Building:**

- `npm run build` - Generate all UMD bundles in dist/

**Code Quality:**

- `npm run lint` - Lint all (JavaScript + Markdown)
- `npm run lint:fix` - Auto-fix all linting issues
- `npm run lint:js` - Lint JavaScript only
- `npm run lint:md` - Lint Markdown only

**Compatibility:**

- `npm run browsers` - Show targeted browser versions
- `npm run browsers:coverage` - Show global browser coverage
- `npm run compat:node` - Verify lib/ is ES2022 compatible
- `npm run compat:web` - Verify dist/ bundles ES version

**Benchmarking:**

- `npm run bench:perf` - Performance benchmarks
- `npm run bench:memory` - Memory usage benchmarks

**Playwright:**

- `npm run playwright:install` - Install Playwright browsers (Chromium, Firefox, WebKit)

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
npm run test:web         # Browser tests (Playwright: Chromium, Firefox, WebKit)
npm run test:all         # All tests including web tests
```

**IMPORTANT - Browser Testing:**

- Browser tests (`test:web`) run against **`dist/` UMD bundles**, not `lib/` source
- Uses Playwright to test in Chromium, Firefox, and WebKit browsers
- Browser compatibility claims are based on these `dist/` bundle tests
- The `lib/` source is ES2022+ and is intended for modern bundlers, not direct browser usage
- Build artifacts are automatically generated via `pretest:web` lifecycle hook
- **First-time setup**: Run `npm run playwright:install` to install browsers

### Compatibility Verification

```bash
# Browser compatibility
npm run browsers            # Show targeted browser versions
npm run browsers:coverage   # Show global browser coverage (~86%)
npm run compat:web          # Verify dist/ bundle compatibility (ES version check)
npm run test:web            # Test in real browsers (Chromium, Firefox, WebKit)

# Node.js compatibility
npm run compat:node         # Verify lib/ source is ES2022 compatible
```

**Node.js Version Management:**

- Minimum required: Node.js 20+ (specified in `package.json` engines field: `>=20`)
- Recommended: Use `.nvmrc` (set to `lts/*`) for automatic version selection with nvm/fnm
- Verification: Run `node --version` and ensure it's 20 or above

### Build & Bundling

```bash
npm run build        # Generate all dist/ bundles (main + 48 individual converters)
```

- **Tooling:** `rollup` (configured in [rollup.config.js](rollup.config.js)) generates UMD bundles in `dist/`.
- **Outputs:**
  - `dist/n2words.js` - Main bundle with all 48 converters (~92KB, ~23KB gzipped)
  - `dist/{ConverterName}.js` - Individual converter UMD files (48 files, ~4-6KB each)
  - `dist/*.js.map` - Source maps for all bundles (49 total files + 49 source maps)
- **Babel:** `@babel/preset-env` is used with targets from [.browserslistrc](.browserslistrc) (`defaults and supports bigint`). The build is configured to keep `BigInt` primitives in the output (no polyfill for BigInt).
- **Minification:** `terser` with `ecma: 2020` is used for minification with 2-pass compression.
- **Banner:** Builds include a versioned banner using `package.json` `version` and MIT license notice.
- **Tree-shaking:** Individual converter bundles use tree-shaking to include only the specific converter and its dependencies.

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

### Pattern 3: Regional Variant (Runtime Modification)

```javascript
import { French } from './fr.js'

export class FrenchBelgium extends French {
  constructor(options = {}) {
    super(options)

    // Modify parent's scaleWordPairs by inserting regional variants
    const pairs = [...this.scaleWordPairs]
    const idx80 = pairs.findIndex(pair => pair[0] === 80n)
    if (idx80 !== -1) pairs.splice(idx80, 0, [90n, 'nonante'])
    const idx60 = pairs.findIndex(pair => pair[0] === 60n)
    if (idx60 !== -1) pairs.splice(idx60, 0, [70n, 'septante'])
    this.scaleWordPairs = pairs
  }
}
```

This pattern allows regional variants to **modify** parent scale words rather than completely redefining them.

### Pattern 4: Dynamic Properties Using Getters

Some languages use getters for dynamic property values based on runtime state:

```javascript
export class Czech extends SlavicLanguage {
  constructor(options = {}) {
    super(options)
    // Delete inherited property to allow getter to work
    delete this.decimalSeparatorWord
  }

  get decimalSeparatorWord() {
    // Return different separator based on cached whole number
    if (this.cachedWholeNumber === 0n || this.cachedWholeNumber === 1n) {
      return 'celá'
    } else if (this.cachedWholeNumber >= 2n && this.cachedWholeNumber <= 4n) {
      return 'celé'
    } else {
      return 'celých'
    }
  }
}
```

**Other examples:**

- **Arabic**: Uses `get selectedOnes()` to return masculine or feminine forms based on options
- **Gender-based languages**: Many use getters to return different `scaleWordPairs` based on gender option

### Pattern 5: Custom convertWholePart() Override

Languages can override `convertWholePart()` for complete custom logic while still using GreedyScaleLanguage helpers:

```javascript
export class Hungarian extends GreedyScaleLanguage {
  // Define scaleWordPairs as usual
  scaleWordPairs = [/* ... */]

  // Override with completely custom implementation
  convertWholePart(number) {
    if (number === 0n) return this.zeroWord

    // Custom Hungarian-specific decomposition logic
    const thousands = number / 1000n
    const remainder = number % 1000n

    // Use getScaleWord() helper to lookup words
    const word = this.getScaleWord(remainder)
    if (word && thousands === 0n) return word

    // Custom merging logic...
  }
}
```

## Scripts Deep Dive

### add-language.js

**Purpose**: Scaffold a new language implementation

**Usage:**

```bash
npm run lang:add <language-code>
# Example: npm run lang:add ko
# Example: npm run lang:add zh-Hans
```

**Key functions:**

- `validateLanguageCode(code)` - Validates IETF BCP 47 format
- `getExpectedClassName(code)` - Gets CLDR-based class name using `Intl.DisplayNames`
- `generateLanguageFile(className)` - Creates language file template
- `generateTestFixture(code)` - Creates test fixture template
- `updateN2wordsFile(code, className)` - Updates main entry point

**What it generates:**

1. `lib/languages/{code}.js` - Language implementation with boilerplate
2. `test/fixtures/languages/{code}.js` - Test fixture template
3. Updates to `lib/n2words.js` (import, converter, export)

**Important**: Maintains alphabetical ordering in all sections

### validate-language.js

**Purpose**: Validate language implementations for correctness and completeness

**Usage:**

```bash
npm run lang:validate              # Validate all 48 languages
npm run lang:validate -- en es fr  # Validate specific languages
npm run lang:validate -- --verbose # Show detailed validation info
```

**Validation checks:**

1. File naming (IETF BCP 47 compliance)
2. Class structure (proper ES6 class with export)
3. CLDR class naming (matches `Intl.DisplayNames` output)
4. Required properties exist and have correct types
5. Methods implemented (not abstract/missing)
6. Inheritance from valid base class
7. Scale words properly ordered (descending for GreedyScaleLanguage)
8. JSDoc documentation present and complete
9. Test fixture exists and properly formatted
10. Registered in n2words.js (import, converter, export - all alphabetically sorted)

**Pure functions** (can be imported):

- `validateLanguageCode(code)` - Validates IETF BCP 47 format
- `getExpectedClassName(code)` - Gets expected CLDR-based class name
- `validateLanguage(code)` - Validates a single language implementation

**Exit codes:**

- `0`: All validations passed
- `1`: One or more validations failed

**Interactive mode:**

When `add-language.js` is run without a language code, it enters interactive mode:

- Prompts user to select base class (greedy, slavic, south-asian, turkic, abstract)
- Shows numbered menu with descriptions
- Generates different templates based on base class choice
- Provides guidance on which base class to use

**Exportable functions:**

Both scripts export pure functions that can be imported programmatically:

```javascript
// From validate-language.js
import {
  validateLanguageCode,
  getExpectedClassName,
  validateLanguage,
  displayResults
} from './scripts/validate-language.js'

// From add-language.js
import {
  validateLanguageCode,
  getExpectedClassName
} from './scripts/add-language.js'
```

## Performance Considerations

### Best Practices

1. **BigInt arithmetic**: Use `BigInt` for all scale values to support large numbers
2. **Greedy algorithm**: Most efficient for scale-based decomposition
3. **Caching**: AbstractLanguage caches whole number for reuse
4. **Zero dependencies**: No external libraries, minimal overhead

### Bundle Size

- **Main UMD bundle** (`dist/n2words.js`): ~92 KB minified (~23 KB gzipped) - all 48 languages
- **Individual converter bundles** (`dist/{ConverterName}.js`): ~4-6 KB each minified
- **ESM source** (`lib/`): Tree-shaking supported - import only what you need for optimal bundle size
- **Per-language overhead**: ~2 KB gzipped per language when using ESM with tree-shaking

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

Located in `test/web/` - test browser builds (UMD) using Playwright.

### Type Tests

The project uses a two-layer type testing approach:

#### 1. Declaration Generation (`build:types`)

- Generates `.d.ts` files from JSDoc using `tsc --declaration --emitDeclarationOnly`
- **Automatically validates JSDoc** - build fails if JSDoc has errors
- Configuration in [tsconfig.build.json](tsconfig.build.json)
- Outputs to `lib/` directory (ignored by git, included in npm package)
- Run with: `npm run build:types`

#### 2. tsd Type Declaration Tests (`test/types/n2words.test-d.ts`)

- Tests that generated `.d.ts` files work correctly for TypeScript consumers
- Uses [tsd](https://github.com/tsdjs/tsd) for type assertion testing
- Validates all 48 converters have correct type signatures
- Tests options types (gender, formal, etc.) and input types (number, bigint, string)
- Ensures invalid usage produces type errors
- Run with: `npm run test:types:tsd`

Example tsd tests:

```typescript
import { expectType, expectError } from 'tsd'
import { EnglishConverter, ArabicConverter } from '../../lib/n2words.js'

// Test valid usage
expectType<string>(EnglishConverter(42))
expectType<string>(ArabicConverter(42, { gender: 'feminine' }))

// Test that errors are caught
expectError(EnglishConverter(null))
expectError(ArabicConverter(42, { gender: 'invalid' }))
```

#### 3. attw Package Validation (`.attw.json`)

- Uses [@arethetypeswrong/cli](https://github.com/arethetypeswrong/arethetypeswrong.github.io) to validate package.json exports
- Checks module resolution for node10, node16 (CJS/ESM), and bundlers
- Ensures TypeScript declarations resolve correctly across all module systems
- Configured to ignore `cjs-resolves-to-esm` (intentional ESM-only design)
- Run with: `npm run test:types:attw`

**Why this approach?**

1. **Declaration generation** - Validates JSDoc → `.d.ts` conversion (catches JSDoc errors)
2. **tsd tests** - Validates generated declarations provide correct types to consumers
3. **attw validation** - Validates package.json is correctly configured for all module systems

Together they guarantee:

- All `lib/` files have valid JSDoc that can emit TypeScript declarations
- Generated typings provide correct IntelliSense and type safety
- Package works correctly across all module systems (node10, node16, bundlers)

**Run all type tests:**

```bash
npm run test:types  # Runs all three: build:types + tsd + attw
```

## TypeScript Support

**Method**: JSDoc annotations with generated `.d.ts` files

**Benefits:**

- Works in both JS and TS projects
- Full IntelliSense in VSCode
- Type checking without compilation
- Generated `.d.ts` files for TypeScript consumers
- Comprehensive type testing (declaration generation + tsd + attw)

**Type exports:**

```typescript
import type { NumericValue, ArabicOptions } from 'n2words'
```

**Declaration files:**

- Generated from JSDoc using `tsc --declaration --emitDeclarationOnly`
- Treated as build artifacts (not committed to git)
- Included in npm package and GitHub releases
- Configuration in [tsconfig.build.json](tsconfig.build.json)

## Benchmarking

The project includes performance and memory benchmarking tools. See [bench/README.md](bench/README.md) for comprehensive documentation.

```bash
npm run bench:perf    # Run performance benchmarks
npm run bench:memory  # Run memory usage benchmarks (requires --expose-gc flag)
```

**Performance benchmarks** ([bench/perf.js](bench/perf.js)):

- Uses `benchmark.js` library for accurate measurements
- Tests conversion speed across different number ranges
- Compares performance across multiple languages
- Outputs operations per second (ops/sec)
- Supports saving and comparing results over time

**Memory benchmarks** ([bench/memory.js](bench/memory.js)):

- Requires Node.js `--expose-gc` flag (already configured in npm script)
- Measures heap usage before/after conversions
- Tests memory efficiency across languages
- Helps identify memory leaks or excessive allocations
- Provides per-iteration memory cost analysis

For detailed usage, examples, and interpretation guides, see the [Benchmark Suite Documentation](bench/README.md).

## Configuration Files

### Key Configuration Files

| File                     | Purpose                                          | Key Settings                                  |
| ------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `.editorconfig`          | Code formatting rules                            | 2 spaces, LF, UTF-8, single quotes            |
| `.gitattributes`         | Git normalization                                | LF line endings, linguist exclusions          |
| `.markdownlint.mjs`      | Markdown linting                                 | No line length limit, allow inline HTML       |
| `.browserslistrc`        | Browser targets                                  | `defaults and supports bigint` (~86% coverage)|
| `tsconfig.json`          | IDE IntelliSense                                 | ES2022, no emit, all files                    |
| `tsconfig.build.json`    | Declaration generation                           | ES2022, emit `.d.ts` only, lib/n2words.js     |
| `tsd.json`               | Type testing                                     | ES2022, strict, test/types/*.test-d.ts        |
| `.attw.json`             | Package validation                               | Validates exports for all module systems      |
| `rollup.config.js`       | UMD bundle build                                 | Two-pass terser, tree-shaking, source maps    |
| `package.json`           | Package config                                   | ESM, sideEffects: false, engines: >=20        |
| `.vscode/extensions.json`| VS Code extensions                               | EditorConfig, Markdownlint, Standard          |

### Build Configuration Details

**Browser targets** (`.browserslistrc`):

```browserslistrc
defaults and supports bigint
```

Targets Chrome 67+, Firefox 68+, Safari 14+, Edge 79+ (~86% global coverage)

**TypeScript declarations** (`tsconfig.build.json`):

- Generates `.d.ts` files from JSDoc annotations
- Validates JSDoc correctness during build
- Outputs to `lib/` (included in npm package, ignored by git)

**UMD bundles** (`rollup.config.js`):

- Two-pass terser compression for optimal size
- Tree-shaking for individual converter bundles
- Source maps for all bundles
- Custom filter-exports plugin for selective exports

**Package** (`package.json`):

- `"type": "module"` - ESM by default
- `"sideEffects": false` - Enables aggressive tree-shaking
- `"exports"` - Explicit ESM entry point with types
- `"engines"` - Node.js >=20 required

## CI/CD & Automation

### GitHub Actions Workflows

**Three workflows** handle continuous integration and deployment:

1. **`.github/workflows/ci.yml`** - Unified CI workflow
   - Matrix: Node 20/22/24/25 × Ubuntu/Windows/macOS
   - Runs: Lint, build, test (unit/integration/types/browser), coverage
   - Browser tests (Playwright): Ubuntu only (cross-platform engines)

2. **`.github/workflows/publish.yml`** - Automated npm publishing
   - Trigger: Version tags (`v*`)
   - Waits for CI, validates version, builds, publishes with provenance
   - Creates GitHub Release with dist files

3. **`.github/workflows/pr_coverage.yml`** - Coverage reporting
   - Posts coverage reports as PR comments
   - Updates existing comment to avoid spam

**Local testing**: Use [Act](https://github.com/nektos/act) to test GitHub Actions locally

```bash
act -W .github/workflows/ci.yml --matrix node:24 --matrix os:ubuntu-latest
```

**Deployment**: Tag and push to trigger automated publishing

```bash
git tag vX.Y.Z && git push --tags
```

See [CONTRIBUTING.md](CONTRIBUTING.md#continuous-integration) for detailed CI/CD documentation.

## Advanced Edge Cases & Behaviors

### Input Handling Edge Cases

From AbstractLanguage tests and implementation:

- **Decimal-only strings**: `.5` is handled by defaulting whole part to `'0'` → "zero point five"
- **Whitespace**: Trimmed from string input before processing
- **Sign handling**: `cachedWholeNumber` is always positive (sign is stripped and handled separately)
- **Leading zeros in decimals**: Preserved differently in grouped vs per-digit mode:
  - Per-digit: "0.05" → "zero point zero five"
  - Grouped: "0.05" → "zero point five" (leading zeros may be stripped depending on language)
- **Empty string**: Treated as zero
- **BigInt literal**: Fully supported: `BigInt('9007199254740992')` works correctly

### Language-Specific Unique Behaviors

- **Japanese `wordSeparator = ''`**: No spaces between characters (e.g., "四十二" not "四十 二")
- **Japanese group-by-4**: Uses 10^4 grouping (万、億、兆) instead of Western 10^3 (thousand, million, billion)
- **Italian phonetic contractions**: `phoneticContraction()` method removes duplicate vowels at word boundaries
- **Czech custom pluralization**: Overrides standard Slavic pattern with Czech-specific rules
- **Arabic complex structures**: Separate arrays for masculine/feminine, dual forms, appended forms, plural groups
- **Hungarian edge cases**: Custom `convertWholePart()` implementation handles compound number rules

### Memory and Performance Patterns

- **BigInt arithmetic preferred**: SlavicLanguage uses BigInt operations instead of string manipulation in `getDigits()`
- **Expensive calculation caching**: Arabic caches `Math.log10()` result to avoid repeated computation
- **Minimal allocations**: Base classes reuse `cachedWholeNumber` instead of re-parsing
- **String concatenation**: Most languages use `+` operator; some use array join for better performance with many parts

## Testing Infrastructure Details

### Test Structure

#### Unit Tests ([test/unit/](test/unit/))

**Purpose**: Test individual class methods and edge cases in isolation

**Key test files:**

- `abstract-language.test.js` - Tests base class functionality (input validation, sign handling, decimal conversion)
- `greedy-scale-language.test.js` - Tests greedy decomposition algorithm
- `slavic-language.test.js` - Tests three-form pluralization logic
- `south-asian-language.test.js` - Tests lakh/crore number system
- `turkic-language.test.js` - Tests "bir" omission rules

**Pattern for testing abstract classes:**

```javascript
import test from 'ava'
import { AbstractLanguage } from '../../lib/classes/abstract-language.js'

// Create concrete test subclass
class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  convertWholePart(n) {
    return n === 0n ? this.zeroWord : String(n)
  }
}

test('handles negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(-42), 'minus 42')
})
```

#### Integration Tests ([test/integration/](test/integration/))

**Purpose**: Test full conversion workflows using fixtures

**Pattern:**

- One test file per language: `{language-code}.test.js`
- Imports fixture data from `test/fixtures/languages/{code}.js`
- Tests all fixture cases (typically 50-200 cases per language)
- Validates options handling for languages that support them

#### Type Tests ([test/types/](test/types/))

**Purpose**: Validate JSDoc type annotations using TypeScript compiler

**Key files:**

- `n2words.js` - Type checking test file (imports all converters with type annotations)
- `tsconfig.json` - TypeScript configuration (strict mode, no emit)
- Custom wrapper script filters TypeScript output to show only relevant errors

**How it works:**

```bash
# Runs tsc and filters output
npm run test:types
```

The test passes if TypeScript reports no type errors in the JSDoc annotations.

#### Web Tests ([test/web/](test/web/))

**Purpose**: Test UMD bundles in real browsers using Playwright

**Important**: These tests run against `dist/` bundles, NOT `lib/` source

**Browsers tested:**

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

**What it validates:**

- UMD bundles load correctly in browsers
- All converters are accessible via global `n2words` object
- Conversions work correctly in browser environment
- BigInt support is functional
- Source maps are generated correctly

**Running web tests:**

```bash
npm run test:web     # Builds and runs Playwright tests (via pretest:web hook)
```

### Test Fixture Format

Each language has a fixture file in `test/fixtures/languages/{code}.js`:

```javascript
export default [
  // [input, expected]
  [0, 'zero'],
  [42, 'forty-two'],

  // [input, expected, options]
  [1, 'واحدة', { gender: 'feminine' }],

  // BigInt literals
  [BigInt('9007199254740992'), 'nine quadrillion...'],

  // Negative numbers
  [-1, 'minus one'],

  // Decimals
  [3.14, 'three point one four'],

  // Edge cases
  ['0.5', 'zero point five'],
  [' 42 ', 'forty-two']  // Whitespace handling
]
```

**Best practices for fixtures:**

- Cover 0, negative numbers, decimals, large numbers
- Test edge cases (1, 10, 100, 1000 boundaries)
- Include BigInt literals for numbers > `Number.MAX_SAFE_INTEGER`
- Test all option combinations for languages with options
- Include culture-specific edge cases (e.g., Japanese uses group-by-4)

## Key Files Reference

| File                                   | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `lib/n2words.js`                       | Main entry point, exports all converters                |
| `lib/classes/abstract-language.js`     | Base class, input validation, decimal handling          |
| `lib/classes/greedy-scale-language.js` | Scale-based decomposition strategy                      |
| `lib/classes/slavic-language.js`       | Three-form pluralization for Slavic languages           |
| `lib/classes/south-asian-language.js`  | Indian numbering system (lakh, crore)                   |
| `lib/classes/turkic-language.js`       | Turkish-style implicit "bir" handling                   |
| `lib/languages/*.js`                   | Individual language implementations (48 files)          |
| `scripts/add-language.js`              | Scaffolding tool for new languages                      |
| `scripts/validate-language.js`         | Validation tool for language implementations            |
| `scripts/README.md`                    | Scripts documentation                                   |
| `bench/perf.js`                        | Performance benchmark script                            |
| `bench/memory.js`                      | Memory usage benchmark script                           |
| `bench/README.md`                      | Benchmarking documentation and usage guide              |
| `test/fixtures/languages/*.js`         | Test data for each language (48 files)                  |
| `test/unit/*.js`                       | Unit tests for classes and methods                      |
| `test/integration/*.js`                | Integration tests using fixtures                        |
| `test/web/*.test.js`                   | Browser tests using Playwright                          |
| `playwright.config.js`                 | Playwright browser testing configuration                |
| `test/types/n2words.test-d.ts`         | tsd type declaration tests                              |
| `tsconfig.json`                        | TypeScript IDE configuration for IntelliSense           |
| `tsconfig.build.json`                  | TypeScript build configuration for `.d.ts` generation   |
| `tsd.json`                             | tsd configuration for type testing                      |
| `.attw.json`                           | Are The Types Wrong configuration                       |
| `rollup.config.js`                     | Build configuration for UMD bundles                     |
| `.browserslistrc`                      | Browser targeting configuration                         |
| `.nvmrc`                               | Node.js version specification (lts/*)                   |
| `.editorconfig`                        | Code style and formatting rules                         |
| `.gitattributes`                       | Git repository normalization settings                   |
| `.markdownlint.mjs`                    | Markdown linting configuration                          |
| `.vscode/extensions.json`              | Recommended VS Code extensions                          |
| `.commitlintrc.json`                   | Commitlint configuration for conventional commits       |
| `.github/workflows/ci.yml`             | Unified CI workflow (lint, test matrix, coverage)       |
| `.github/workflows/publish.yml`        | Automated npm publishing workflow                       |
| `.github/dependabot.yml`               | Dependabot configuration for dependency updates         |
| `CHANGELOG.md`                         | Project changelog following Keep a Changelog format     |
| `SECURITY.md`                          | Security policy and vulnerability reporting             |
| `package.json`                         | Scripts, dependencies, metadata, config                 |

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

**Last Updated**: 2025-12-26
**Project Version**: 2.0.0
**Maintained By**: Tyler Vigario & contributors

## Additional Resources

### Package Distribution

- **npm**: `npm install n2words`
- **CDN (jsDelivr)**: `https://cdn.jsdelivr.net/npm/n2words@2/dist/n2words.js`
- **CDN (unpkg)**: `https://unpkg.com/n2words@2/dist/n2words.js`

### Coverage Metrics

- **Browser Coverage**: ~86% of global users (via browserslist query: "defaults and supports bigint")
- **Test Coverage**: Comprehensive unit, integration, and browser tests for all 48 languages
- **Type Coverage**: Full JSDoc annotations for TypeScript IntelliSense

### Development Dependencies

The project uses modern development tools:

- **Testing**: AVA (test runner), Playwright (browser tests)
- **Build**: Rollup (bundler), Babel (transpiler), Terser (minifier), rimraf (cleaning)
- **Quality**: Standard (linter), Markdownlint (markdown), c8 (coverage)
- **Benchmarking**: benchmark.js (performance benchmarking)

### Project Metadata

- **Package**: `n2words`
- **Repository**: `https://github.com/forzagreen/n2words`
- **Issues**: `https://github.com/forzagreen/n2words/issues`
- **Original Author**: Wael TELLAT
- **Contributors**: Tyler Vigario and community contributors
- **Package Type**: ES Module (`"type": "module"`)
- **Side Effects**: None (`"sideEffects": false` - safe for tree-shaking)
