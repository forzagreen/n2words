# n2words Architecture Guide

Technical documentation for the n2words library architecture and implementation patterns.

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

**Note**: French Belgium extends French (not GreedyScaleLanguage directly).

## Base Classes

### AbstractLanguage

The base class all languages inherit from. Handles negative numbers, decimal conversion, and word assembly.

**Required properties:**

```javascript
negativeWord = ''           // Word for negative (e.g., "minus")
zeroWord = ''              // Word for zero
decimalSeparatorWord = ''  // Word between integer and decimal
wordSeparator = ' '        // Separator between words
```

**Required method:** `integerToWords(integerPart)` - bigint → string

**Optional overrides:**

- `decimalIntegerToWords(integerPart)` - Custom decimal integer conversion
- `decimalDigitsToWords(str)` - Complete decimal conversion override
- `toWords(isNeg, int, dec)` - Override to cache integerPart for context
- `usePerDigitDecimals = false` - Set true for digit-by-digit decimals
- `wordSeparator = ''` - Override for CJK languages

**Note:** Input validation and normalization happen in `makeConverter()` (lib/n2words.js), not in language classes.

### GreedyScaleLanguage

Scale-based decomposition using greedy algorithm. Most common base class.

**How it works:**

1. Defines `scaleWords` array: `[[value, word], ...]` in descending order
2. Greedily decomposes numbers using largest scale first
3. Calls `combineWordSets(preceding, following)` to combine adjacent word-sets

**Required:** `scaleWords` array, `combineWordSets()` method

**Helper methods:** `wordForScale(scaleValue)`, `decomposeInteger(integer)`, `reduceWordSets(wordSets)`

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

- `scaleGenders` - Object mapping segment indices to boolean (true = feminine)
- `omitOneBeforeScale` - Boolean, omits "one" before scale words (Polish, Czech)

### SouthAsianLanguage

Indian numbering system with lakh/crore support.

**Required:**

- `belowHundredWords` - Array of 100 entries (0-99)
- `scaleWords` - Scale words including lakh (100,000) and crore (10,000,000)

### TurkicLanguage

Turkish-style implicit "bir" (one) omission rules.

**Required:** `scaleWords` array (uses inherited `combineWordSets()`)

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
    // ... down to 1n
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
}
```

### Pattern 3: Regional Variant

```javascript
import { French } from './fr.js'

export class FrenchBelgium extends French {
  constructor(options = {}) {
    super(options)
    // Modify parent's scaleWords for regional differences
    const tuples = [...this.scaleWords]
    const idx80 = tuples.findIndex(tuple => tuple[0] === 80n)
    if (idx80 !== -1) tuples.splice(idx80, 0, [90n, 'nonante'])
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

## Language-Specific Options

| Language         | Option                | Type                      | Description                    |
| ---------------- | --------------------- | ------------------------- | ------------------------------ |
| Arabic           | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Arabic           | `negativeWord`        | string                    | Custom negative word           |
| Biblical Hebrew  | `andWord`             | string                    | Conjunction character          |
| Biblical Hebrew  | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Chinese (both)   | `formal`              | boolean                   | Formal/financial numerals      |
| Croatian         | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Czech            | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Danish           | `ordFlag`             | boolean                   | Enable ordinal conversion      |
| Dutch            | `includeOptionalAnd`  | boolean                   | Include optional "en"          |
| Dutch            | `noHundredPairing`    | boolean                   | Disable hundred-pairing        |
| Dutch            | `accentOne`           | boolean                   | Use accented "één"             |
| French           | `withHyphenSeparator` | boolean                   | Use hyphens vs spaces          |
| French Belgium   | `withHyphenSeparator` | boolean                   | Use hyphens vs spaces          |
| Hebrew           | `andWord`             | string                    | Conjunction character          |
| Hebrew           | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Latvian          | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Lithuanian       | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Polish           | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Romanian         | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Russian          | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Serbian Cyrillic | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Serbian Latin    | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Spanish          | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |
| Turkish          | `dropSpaces`          | boolean                   | Remove spaces between words    |
| Ukrainian        | `gender`              | 'masculine' \| 'feminine' | Grammatical gender             |

## Entry Point Structure

The main file `lib/n2words.js` is organized into sections (all alphabetically sorted):

```javascript
// ============================================================================
// Language Imports
// ============================================================================
import { Arabic } from './languages/ar.js'
// ...

// ============================================================================
// Type Definitions
// ============================================================================
/** @typedef {number | bigint | string} NumericValue */
// ...

// ============================================================================
// Converter Factory
// ============================================================================
function makeConverter (LanguageClass) { /* ... */ }

// ============================================================================
// Language Converters
// ============================================================================
const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
// ...

// ============================================================================
// Exports
// ============================================================================
export { ArabicConverter, /* ... */ }
```

**IMPORTANT**: All imports, converters, and exports must be alphabetically sorted.

## Edge Cases & Behaviors

### Input Handling

- **Decimal-only strings**: `.5` → "zero point five"
- **Whitespace**: Trimmed from string input
- **Sign handling**: `integerPart` always non-negative
- **Leading zeros in decimals**: Preserved in per-digit mode
- **Invalid types**: Rejected with TypeError
- **NaN/Infinity**: Rejected with error

### Language-Specific

- **Japanese `wordSeparator = ''`**: No spaces between characters
- **Japanese group-by-4**: Uses 10^4 grouping (万、億、兆)
- **Italian**: `phoneticContraction()` removes duplicate vowels
- **Arabic**: Separate arrays for masculine/feminine, dual forms

### Performance

- BigInt arithmetic preferred over string manipulation
- Arabic caches `Math.log10()` results
- Languages needing context cache via private fields
