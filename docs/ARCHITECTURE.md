# n2words Architecture Guide

Technical documentation for the n2words library architecture and implementation patterns.

## Class Hierarchy

All language implementations follow an inheritance pattern:

```text
AbstractLanguage (base)
├── ScaleLanguage                # Most common: English, German, Dutch, Greek, etc.
│   ├── CompoundScaleLanguage    # Long scale compound: French, Portuguese, Spanish
│   └── InflectedScaleLanguage   # Multi-form pluralization: Slavic, Baltic languages
├── HebrewLanguage               # Hebrew (Modern & Biblical)
├── MyriadLanguage               # East Asian: Japanese, Chinese, Korean
└── SouthAsianLanguage           # Hindi, Bengali, Gujarati, Kannada, Marathi, Punjabi, Urdu
```

### Languages by Base Class

**ScaleLanguage** (14): Azerbaijani, Danish, Dutch, English, Filipino, Finnish, German, Greek, Indonesian, Malay, Norwegian Bokmål, Swedish, Turkish

**CompoundScaleLanguage** (3): French, Portuguese, Spanish

**HebrewLanguage** (2): Hebrew, Biblical Hebrew

**MyriadLanguage** (4): Japanese, Korean, Simplified Chinese, Traditional Chinese

**InflectedScaleLanguage** (10): Croatian, Czech, Latvian, Lithuanian, Polish, Russian, Serbian (Cyrillic & Latin), Ukrainian

**SouthAsianLanguage** (7): Bangla/Bengali, Gujarati, Hindi, Kannada, Marathi, Punjabi, Urdu

**AbstractLanguage directly** (9): Arabic, Hungarian, Italian, Persian, Romanian, Swahili, Tamil, Telugu, Thai, Vietnamese

**Note**: French Belgium extends French (not CompoundScaleLanguage directly).

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

### ScaleLanguage

Segment-based decomposition for high performance. Most common base class.

**How it works:**

1. Splits number into 3-digit segments from right to left
2. Converts each segment to words using O(1) property lookups
3. Appends scale words (thousand, million, etc.)
4. Joins with language-specific rules

**Required properties:**

- `onesWords` - Object mapping 1-9 to words
- `teensWords` - Object mapping 0-9 to teen words (10-19)
- `tensWords` - Object mapping 2-9 to tens words (20-90)
- `hundredWord` OR `hundredsWords` - String for "N hundred" or object for irregular hundreds
- `scaleWords` - Array of scale words [thousand, million, billion, ...]

**Optional properties:**

- `thousandWord` - Separate thousand from scaleWords (for languages that need it)
- `omitOneBeforeHundred` - Omit "one" before hundred (Turkish, Finnish)
- `omitOneBeforeThousand` - Omit "one" before thousand (Turkish, Greek, Finnish)
- `omitOneBeforeScale` - Omit "one" before scale words (Greek)

**Override methods:**

- `segmentToWords(segment, scaleIndex)` - Custom segment handling
- `combineSegmentParts(parts, segment, scaleIndex)` - Hyphenation, connectors
- `joinSegments(parts, integerPart)` - Custom joining rules

### CompoundScaleLanguage

Long scale with compound pattern (thousand + previous scale word).

**Pattern:** million (10^6), thousand million (10^9), billion (10^12), thousand billion (10^15)

**Additional properties:**

- `thousandWord` - Word for thousand (used in compounds)

**Override methods:**

- `pluralizeScaleWord(word)` - Pluralization (e.g., million → millions)

### InflectedScaleLanguage

Extends ScaleLanguage for languages with grammatical inflection (multi-form pluralization, gender agreement).

Used by Slavic languages (Russian, Polish, Czech, Ukrainian, Serbian, Croatian) and Baltic languages (Latvian, Lithuanian).

**Additional required properties:**

- `onesFeminineWords` - Object mapping 1-9 to feminine forms
- `pluralForms` - Object mapping segment indices to [singular, few, many] forms

**Additional optional properties:**

- `scaleGenders` - Object mapping segment indices to boolean (true = feminine)

### SouthAsianLanguage

Indian numbering system with lakh/crore support.

**Required:**

- `belowHundredWords` - Array of 100 entries (0-99)
- `scaleWords` - Scale words including lakh (100,000) and crore (10,000,000)

## Implementation Patterns

### Pattern 1: Basic Scale-Based Language

```javascript
import { ScaleLanguage } from '../classes/scale-language.js'

export class MyLanguage extends ScaleLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  onesWords = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine'
  }

  teensWords = {
    0: 'ten', 1: 'eleven', 2: 'twelve', 3: 'thirteen', 4: 'fourteen',
    5: 'fifteen', 6: 'sixteen', 7: 'seventeen', 8: 'eighteen', 9: 'nineteen'
  }

  tensWords = {
    2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty',
    6: 'sixty', 7: 'seventy', 8: 'eighty', 9: 'ninety'
  }

  hundredWord = 'hundred'

  scaleWords = ['thousand', 'million', 'billion', 'trillion']

  // For languages that omit "one" before scale words:
  // omitOneBeforeHundred = true
  // omitOneBeforeThousand = true
}
```

### Pattern 2: Language with Gender Options

```javascript
export class MyLanguage extends ScaleLanguage {
  constructor(options = {}) {
    super()
    this.setOptions({ gender: 'masculine' }, options)
  }

  // Override to use gender-specific words
  onesToWords(ones, scaleIndex, tens) {
    const words = this.options.gender === 'feminine'
      ? this.onesFeminineWords
      : this.onesWords
    return words[ones] || ''
  }
}
```

### Pattern 3: Regional Variant

```javascript
import { French } from './fr.js'

export class FrenchBelgium extends French {
  // Override specific words for regional differences
  tensWords = {
    ...French.prototype.tensWords,
    7: 'septante',
    9: 'nonante'
  }
}
```

### Pattern 4: Dynamic Properties Using Getters

```javascript
export class Czech extends InflectedScaleLanguage {
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
