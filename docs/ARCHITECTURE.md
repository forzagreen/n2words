# n2words Architecture Guide

This document provides detailed technical documentation for the n2words library architecture, implementation patterns, and development guidelines.

## Table of Contents

- [Class Hierarchy](#class-hierarchy)
- [Base Classes](#base-classes)
- [Implementation Patterns](#implementation-patterns)
- [Language-Specific Options](#language-specific-options)
- [Entry Point Structure](#entry-point-structure)
- [Testing Infrastructure](#testing-infrastructure)
- [Edge Cases & Behaviors](#edge-cases--behaviors)
- [Configuration Reference](#configuration-reference)

---

## Class Hierarchy

All language implementations follow an inheritance pattern:

```text
AbstractLanguage (base)
├── GreedyScaleLanguage    # Most common: English, Spanish, French, etc.
├── SlavicLanguage         # Russian, Polish, Czech, etc.
├── SouthAsianLanguage     # Hindi, Bengali, Gujarati, Kannada, Marathi, Punjabi, Urdu
└── TurkicLanguage         # Turkish, Azerbaijani
```

### Languages by Base Class

**GreedyScaleLanguage** (15): Danish, Dutch, English, Filipino, French, German, Greek, Hungarian, Korean, Norwegian Bokmål, Portuguese, Spanish, Swedish, Simplified Chinese, Traditional Chinese

**SlavicLanguage** (12): Croatian, Czech, Hebrew (Modern & Biblical), Latvian, Lithuanian, Polish, Russian, Serbian (Cyrillic & Latin), Ukrainian

**SouthAsianLanguage** (7): Bangla/Bengali, Gujarati, Hindi, Kannada, Marathi, Punjabi, Urdu

**TurkicLanguage** (2): Turkish, Azerbaijani

**AbstractLanguage directly** (12): Arabic, Indonesian, Italian, Japanese, Malay, Persian, Romanian, Swahili, Tamil, Telugu, Thai, Vietnamese

**Regional variants**: French Belgium extends French (not GreedyScaleLanguage directly)

---

## Base Classes

### AbstractLanguage

The base class all languages inherit from. Handles negative numbers, decimal conversion, and word assembly.

**Required properties:**

```javascript
negativeWord = ''           // Word for negative (e.g., "minus")
zeroWord = ''              // Word for zero
decimalSeparatorWord = ''  // Word between integer and decimal (e.g., "point")
wordSeparator = ' '        // Separator between words
```

**Required methods:**

```javascript
integerToWords(integerPart) // bigint → string
```

**Optional properties:**

```javascript
usePerDigitDecimals = false  // true = digit-by-digit decimals
wordSeparator = ' '          // Override for CJK languages (empty string)
```

**Optional method overrides:**

```javascript
decimalIntegerToWords(integerPart)  // Custom decimal integer conversion
decimalDigitsToWords(str)           // Complete decimal conversion override
toWords(isNeg, int, dec)            // Override to cache integerPart for context
```

**Note:** Input validation and normalization happen at the public API boundary in `lib/n2words.js`. The `makeConverter()` wrapper handles type checking, format validation, sign detection, and integer/decimal extraction before calling `toWords()` on the language class.

### GreedyScaleLanguage

Scale-based decomposition using greedy algorithm. Most common base class.

**How it works:**

1. Defines `scaleWords` array: `[[value, word], ...]` in descending order
2. Greedily decomposes numbers into word-sets using largest scale first
3. Calls `combineWordSets(preceding, following)` to combine adjacent word-sets

**Example:**

```javascript
export class English extends GreedyScaleLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  scaleWords = [
    [1000000000n, 'billion'],
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    // ... down to 1n
  ]

  combineWordSets(preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const followingValue = Object.values(following)[0]

    if (precedingValue >= 100n && followingValue < 100n) {
      return { [`${precedingWord} and ${followingWord}`]: precedingValue + followingValue }
    }
    return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
  }
}
```

**Helper methods:**

- `wordForScale(scaleValue)` - Returns word for exact scale value
- `decomposeInteger(integer)` - Decomposes number into word-sets
- `reduceWordSets(wordSets)` - Reduces word-sets using `combineWordSets()`

### SlavicLanguage

Three-form pluralization based on number endings, with optional gender and per-scale gender control.

**Required properties:**

- `onesWords` - Object mapping 1-9 to masculine forms
- `onesFeminineWords` - Object mapping 1-9 to feminine forms
- `teensWords` - Object mapping 0-9 to teen numbers (10-19)
- `twentiesWords` - Object mapping 2-9 to tens (20-90)
- `hundredsWords` - Object mapping 1-9 to hundreds
- `pluralForms` - Object mapping segment indices to [singular, few, many] forms

**Optional properties:**

- `scaleGenders` - Object mapping segment indices to boolean (true = feminine). Default `{}` (all masculine). Languages with feminine thousands should set `{ 1: true }`.
- `omitOneBeforeScale` - Boolean. When true, omits "one" before scale words (e.g., "tysiąc" instead of "jeden tysiąc"). Used by Polish, Czech.

**Example:**

```javascript
export class Russian extends SlavicLanguage {
  pluralForms = {
    1: ['тысяча', 'тысячи', 'тысяч'],       // 10^3 (segment index 1)
    2: ['миллион', 'миллиона', 'миллионов'], // 10^6 (segment index 2)
    3: ['миллиард', 'миллиарда', 'миллиардов'] // 10^9 (segment index 3)
  }

  scaleGenders = { 1: true }  // thousands are feminine
}
```

### SouthAsianLanguage

Indian numbering system with lakh/crore support.

**Required properties:**

- `belowHundredWords` - Array of 100 entries (0-99)
- `scaleWords` - Scale words including lakh (100,000) and crore (10,000,000)

### TurkicLanguage

Turkish-style implicit "bir" (one) omission rules.

**Required properties:**

- `scaleWords` - Scale words array (uses inherited `combineWordSets()`)

---

## Implementation Patterns

### Pattern 1: Basic Scale-Based Language

```javascript
import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

export class MyLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  scaleWords = [
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    // ... complete list down to 1n
  ]

  combineWordSets(preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingValue = Object.values(following)[0]
    const resultNumber = followingValue > precedingValue
      ? precedingValue * followingValue
      : precedingValue + followingValue
    return { [`${precedingWord} ${followingWord}`]: resultNumber }
  }
}
```

### Pattern 2: Language with Gender Options

```javascript
export class MyLanguage extends GreedyScaleLanguage {
  constructor(options = {}) {
    super()
    this.setOptions({ gender: 'masculine' }, options)
  }

  get scaleWords() {
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

    // Modify parent's scaleWords by inserting regional variants
    const tuples = [...this.scaleWords]
    const idx80 = tuples.findIndex(tuple => tuple[0] === 80n)
    if (idx80 !== -1) tuples.splice(idx80, 0, [90n, 'nonante'])
    const idx60 = tuples.findIndex(tuple => tuple[0] === 60n)
    if (idx60 !== -1) tuples.splice(idx60, 0, [70n, 'septante'])
    this.scaleWords = tuples
  }
}
```

### Pattern 4: Dynamic Properties Using Getters

```javascript
export class Czech extends SlavicLanguage {
  #integerPart = 0n

  constructor(options = {}) {
    super(options)
    delete this.decimalSeparatorWord
  }

  get decimalSeparatorWord() {
    if (this.#integerPart === 0n || this.#integerPart === 1n) return 'celá'
    if (this.#integerPart >= 2n && this.#integerPart <= 4n) return 'celé'
    return 'celých'
  }

  toWords(isNegative, integerPart, decimalPart) {
    this.#integerPart = integerPart
    return super.toWords(isNegative, integerPart, decimalPart)
  }
}
```

### Pattern 5: Custom integerToWords() Override

```javascript
export class Hungarian extends GreedyScaleLanguage {
  scaleWords = [/* ... */]

  integerToWords(number) {
    if (number === 0n) return this.zeroWord

    // Custom Hungarian-specific decomposition logic
    const thousands = number / 1000n
    const remainder = number % 1000n

    const word = this.wordForScale(remainder)
    if (word && thousands === 0n) return word

    // Custom merging logic...
  }
}
```

---

## Language-Specific Options

| Language         | Option                | Type                        | Description                          |
| ---------------- | --------------------- | --------------------------- | ------------------------------------ |
| Arabic           | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Arabic           | `negativeWord`        | string                      | Custom negative word                 |
| Biblical Hebrew  | `andWord`             | string                      | Conjunction character (default: 'ו') |
| Biblical Hebrew  | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Chinese (both)   | `formal`              | boolean                     | Formal/financial numerals            |
| Croatian         | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Czech            | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Danish           | `ordFlag`             | boolean                     | Enable ordinal conversion            |
| Dutch            | `includeOptionalAnd`  | boolean                     | Include optional "en" separator      |
| Dutch            | `noHundredPairing`    | boolean                     | Disable hundred-pairing              |
| Dutch            | `accentOne`           | boolean                     | Use accented "één"                   |
| French           | `withHyphenSeparator` | boolean                     | Use hyphens vs spaces                |
| French Belgium   | `withHyphenSeparator` | boolean                     | Use hyphens vs spaces                |
| Hebrew           | `andWord`             | string                      | Conjunction character (default: 'ו') |
| Hebrew           | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Latvian          | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Lithuanian       | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Polish           | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Romanian         | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Russian          | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Serbian Cyrillic | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Serbian Latin    | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Spanish          | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |
| Turkish          | `dropSpaces`          | boolean                     | Remove spaces between words          |
| Ukrainian        | `gender`              | 'masculine' \| 'feminine'   | Grammatical gender                   |

**Typedef pattern:**

```javascript
/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord] Word for negative numbers
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender
 */
```

---

## Entry Point Structure

The main file `lib/n2words.js` is organized into sections (all alphabetically sorted):

```javascript
// ============================================================================
// Language Imports
// ============================================================================
import { Arabic } from './languages/ar.js'
import { English } from './languages/en.js'
// ...

// ============================================================================
// Type Definitions
// ============================================================================
/** @typedef {number | bigint | string} NumericValue */
/** @typedef {Object} ArabicOptions ... */
// ...

// ============================================================================
// Converter Factory
// ============================================================================
function makeConverter (LanguageClass) {
  return function convertToWords (value, options) {
    // 1. Validate options and input type
    // 2. Normalize: extract isNegative, integerPart, decimalPart
    // 3. Delegate to class with pre-processed data
    return new LanguageClass(options).toWords(isNegative, integerPart, decimalPart)
  }
}

// ============================================================================
// Language Converters
// ============================================================================
const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
const EnglishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(English))
// ...

// ============================================================================
// Exports
// ============================================================================
export { ArabicConverter, EnglishConverter, /* ... */ }
```

---

## Testing Infrastructure

### Test Structure

| Directory                  | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `test/unit/`               | Class methods, edge cases in isolation     |
| `test/integration/`        | Full conversion workflows using fixtures   |
| `test/umd/`                | UMD bundle validation                      |
| `test/types/`              | TypeScript declaration tests (tsd)         |
| `test/browsers/`           | Playwright browser tests                   |
| `test/fixtures/languages/` | Test data per language                     |

### Test Fixture Format

```javascript
export default [
  [0, 'zero'],
  [42, 'forty-two'],
  [-1, 'minus one'],
  [3.14, 'three point one four'],
  [BigInt('9007199254740992'), 'nine quadrillion...'],
  [1, 'واحدة', { gender: 'feminine' }]  // With options
]
```

### Unit Test Pattern

```javascript
import test from 'ava'
import { AbstractLanguage } from '../../lib/classes/abstract-language.js'

class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'
  integerToWords(integerPart) {
    return integerPart === 0n ? this.zeroWord : String(integerPart)
  }
}

test('handles negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 42n), 'minus 42')
})
```

### Type Declaration Testing

Three-layer approach:

1. **Declaration generation** (`build:types`) - JSDoc → `.d.ts`
2. **Type tests** (`test:types`) - tsd validates declarations
3. **Export tests** (`test:exports`) - attw validates package.json exports

---

## Edge Cases & Behaviors

### Input Handling

- **Decimal-only strings**: `.5` → "zero point five"
- **Whitespace**: Trimmed from string input
- **Sign handling**: `integerPart` always non-negative
- **Leading zeros in decimals**: Per-digit mode preserves them
- **Invalid types**: Rejected with TypeError
- **NaN/Infinity**: Rejected with error

### Language-Specific Behaviors

- **Japanese `wordSeparator = ''`**: No spaces between characters
- **Japanese group-by-4**: Uses 10^4 grouping (万、億、兆)
- **Italian**: `phoneticContraction()` removes duplicate vowels
- **Arabic**: Separate arrays for masculine/feminine, dual forms
- **Hungarian**: Custom `integerToWords()` for compound rules

### Performance

- BigInt arithmetic preferred over string manipulation
- Arabic caches `Math.log10()` results
- Languages needing context cache via private fields

---

## Configuration Reference

| File                   | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `.browserslistrc`      | Browser targets: `defaults and supports bigint` |
| `tsconfig.build.json`  | Declaration generation config                   |
| `tsd.json`             | Type testing config                             |
| `.attw.json`           | Package exports validation                      |
| `rollup.config.js`     | UMD bundle build                                |
| `playwright.config.js` | Browser testing                                 |

### Build Targets

**`dist/` (UMD bundles)**: Browser usage via CDN

- Transpiled to ES2020 (preserving BigInt)
- Chrome 67+, Firefox 68+, Safari 14+, Edge 79+

**`lib/` (ESM source)**: Bundlers and Node.js

- ES2022+ modern JavaScript
- Tree-shaking supported
