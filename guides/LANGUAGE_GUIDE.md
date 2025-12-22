# Language Implementation Guide

This guide helps you implement a new language for n2words.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Language Code Requirements](#language-code-requirements)
   - [Automated Setup](#automated-setup)
   - [Manual Setup](#manual-setup)
2. [Understanding the Architecture](#understanding-the-architecture)
   - [Base Classes](#base-classes)
   - [Language Code Standards (IETF BCP 47)](#language-code-standards-ietf-bcp-47)
   - [Key Concepts](#key-concepts)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Testing Your Implementation](#testing-your-implementation)
5. [Common Patterns](#common-patterns)
6. [Optimization Tips](#optimization-tips)

## Getting Started

### Language Code Requirements

**Important**: All language codes must follow IETF BCP 47 standards. This ensures proper internationalization and avoids conflicts with platform-specific language handling.

**Compliant Examples**:

- `en` (English)
- `cs` (Czech, not `cz`)
- `da` (Danish, not `dk`)
- `nb` (Norwegian Bokmål, not `no`)
- `fil` (Filipino, not `tl`)
- `fr-BE` (Belgian French)

**Validation**: Use `npm run lang:validate <code>` to verify your language code follows IETF BCP 47.

### Automated Setup

Use the automated script to generate boilerplate:

```bash
npm run lang:add
```

This creates:

- `lib/languages/xx.js` - Language implementation
- `test/fixtures/languages/xx.js` - Test cases
- Updates `lib/n2words.js` - Registration

### Manual Setup

If you need more control, follow these steps:

1. **Choose IETF BCP 47 compliant language code** (e.g., `cs` for Czech, `nb` for Norwegian, `fil` for Filipino)
2. Create `lib/languages/<code>.js` with your language code
3. Choose the appropriate base class based on your language's characteristics
4. Implement required methods
5. Add language registration in `lib/n2words.js`
6. Create test file `test/fixtures/languages/<code>.js`
7. **Validate**: Run `npm run lang:validate <code>` to ensure IETF BCP 47 compliance

## Understanding the Architecture

### Base Classes

Choose the appropriate base class for your language:

**GreedyScaleLanguage** - Use for most languages with regular scale-based systems

- Extends `AbstractLanguage`
- Implements highest-matching-scale algorithm
- Works well for languages with regular patterns
- Define a `scaleWordPairs` array and implement `mergeScales()` method
- Examples: English, Spanish, German, French, Italian, Portuguese, Dutch, Korean, Hungarian, Chinese

**SlavicLanguage** - Use for Slavic/Baltic languages with three-form pluralization

- Extends `AbstractLanguage`
- Specialized for languages with complex pluralization rules
- Handles singular/dual/plural forms
- Supports shared `feminine` option for feminine forms of digits 1-9 (ones place)
- Examples: Russian, Czech (`cs`), Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian

**TurkicLanguage** - Use for Turkic languages

- Extends `GreedyScaleLanguage`
- Space-separated number combinations
- Implicit number handling patterns
- Examples: Turkish, Azerbaijani

**SouthAsianLanguage** - Use for South Asian languages with Indian-style grouping

- Extends `AbstractLanguage`
- Indian-style digit grouping: 3 digits on the right, then 2-2 from right (e.g., 12,34,56,789 = "twelve crore thirty four lakh fifty six thousand seven hundred eighty nine")
- Provides: `splitToGroups()` (group digits), `convertBelowThousand()` (convert 0-999), `convertWholePart()` (iterate groups)
- Subclasses define: `belowHundred[]` (words for 0-99), `scaleWords[]` (grouping words indexed by level), `hundredWord` (word for 100)
- Examples: Hindi, Bengali, Urdu, Punjabi, Marathi, Gujarati, Kannada

**AbstractLanguage** - Use for custom implementations requiring full control

- Core base class for all others
- Most flexibility for irregular patterns
- Examples: Arabic, Vietnamese, Romanian, Persian, Indonesian

### Language Code Standards (IETF BCP 47)

**All language implementations must use IETF BCP 47 compliant language tags.**

#### Why IETF BCP 47?

- **International Standard**: Ensures compatibility with browsers, operating systems, and internationalization libraries
- **Consistency**: Avoids conflicts with platform-specific language handling
- **Future-proof**: Supports extensions and regional variants

#### Common Migration Examples

Recent updates have standardized several language codes:

| Old Code | New Code | Language   | Reason                             |
|----------|----------|------------|----------------------------------- |
| `cz`     | `cs`     | Czech      | ISO 639-1 standard is `cs`         |
| `dk`     | `da`     | Danish     | Country code vs. language code     |
| `no`     | `nb`     | Norwegian  | Specifies Norwegian Bokmål         |
| `tl`     | `fil`    | Filipino   | Official language name             |

#### Validation

```bash
# Check your language code compliance
npm run lang:validate <code>

# The validator checks:
# ✓ IETF BCP 47 format compliance
# ✓ File naming consistency
# ✓ Registration in lib/n2words.js
```

#### Format Rules

- **Basic**: `[language]` (e.g., `en`, `cs`, `fil`)
- **With Region**: `[language]-[REGION]` (e.g., `fr-BE`, `en-US`)
- **Extensions**: `[language]-[region]-[extension]` (as needed)

### Key Concepts

#### Scale Word Pairs

- Ordered pairs of `[value, word]` using BigInt literals
- MUST be in descending order
- Covers all number patterns in your language
- **Important**: Always use `n` suffix for BigInt literals (e.g., `1000n` not `1000`)

```javascript
[
  [1000000n, 'million'],
  [1000n, 'thousand'],
  [100n, 'hundred'],
  // ... down to
  [1n, 'one'],
];
```

#### Merge Method

- Combines partial word sets into complete phrases
- Implements language-specific grammar rules
- Called recursively to build complete numbers

## Step-by-Step Implementation

### 1. Choose Your Base Class and Define Number Words

Start by selecting the right base class and creating your language file with an IETF BCP 47 compliant name (e.g., `cs.js` for Czech, `fil.js` for Filipino).

For most languages, use `GreedyScaleLanguage`:

```javascript
// File: lib/languages/cs.js (Czech - IETF BCP 47 compliant)
import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

export class Czech extends GreedyScaleLanguage {
  // Set language defaults as class properties
  negativeWord = 'mínus'      // Word for negative numbers
  decimalSeparatorWord = 'point'     // Word for decimal point
  zeroWord = 'zero'               // Word for zero
  convertDecimalsPerDigit = false // Set to true for digit-by-digit decimal reading

  // Define scaleWordPairs array with [value, word] pairs in DESCENDING order
  scaleWordPairs = [
    // Large numbers first
    [1_000_000_000n, 'billion'],
    [1_000_000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],

    // Tens
    [90n, 'ninety'],
    [80n, 'eighty'],
    // ... all tens
    [20n, 'twenty'],

    // Teens (if irregular)
    [19n, 'nineteen'],
    [18n, 'eighteen'],
    // ... all teens
    [11n, 'eleven'],
    [10n, 'ten'],

    // Ones
    [9n, 'nine'],
    // ... all ones
    [1n, 'one'],
    [0n, 'zero']
  ]

  /**
   * Initialize with language-specific options.
   * Only include constructor parameters actually needed for your language.
   *
   * @param {Object} [options={}] Configuration options.
   */
  constructor(options = {}) {
    super()
    // Apply any option-dependent configuration here
  }
}

```

**Important notes:**

- Use class properties for default values (not passed via constructor)
- Constructor parameters should only include options that actually affect behavior
- Use `BigInt` literals (`1000n`, not `1000`) in scaleWordPairs array for numerical accuracy

### 2. Add TypeScript Support & Documentation

For proper TypeScript integration, add JSDoc documentation:

```javascript
/**
 * @typedef {Object} MyLanguageOptions
 * @property {boolean} [feminine=false] - Use feminine forms.
 * @property {string} [customWord='default'] - Custom word for special cases.
 */

/**
 * Converts numbers to MyLanguage cardinal form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {MyLanguageOptions} [options={}] Language-specific options.
 * @returns {string} The number in words.
 * @example
 * const converter = new MyLanguage();
 * converter.convertToWords(42); // 'language-specific result'
 */
// Export only the class - wrapper function created dynamically by n2words.js
// This eliminates ~10 lines of boilerplate per language file
```

The build process automatically generates TypeScript declarations from your JSDoc.

### 3. Implement Merge Logic

The `mergeScales()` method combines word sets according to your language's grammar:

#### Pattern 1: Space-separated (English style)

```javascript
mergeScales (leftWordSet, rightWordSet) {
  const leftWords = Object.keys(leftWordSet)
  const rightWords = Object.keys(rightWordSet)
  const leftValue = Object.values(leftWordSet)[0]
  const rightValue = Object.values(rightWordSet)[0]

  // Simple concatenation with space
  return {
    [leftWords.join(' ') + ' ' + rightWords.join(' ')]: leftValue + rightValue
  }
}
```

#### Pattern 2: Hyphenated (for compound numbers)

```javascript
mergeScales (leftWordSet, rightWordSet) {
  const leftWords = Object.keys(leftWordSet)
  const rightWords = Object.keys(rightWordSet)
  const leftValue = Object.values(leftWordSet)[0]
  const rightValue = Object.values(rightWordSet)[0]

  // Use hyphen for compound numbers
  if (leftValue < 100n) {
    return {
      [leftWords.join('-') + '-' + rightWords.join('-')]: leftValue + rightValue
    }
  }

  // Use space for larger numbers
  return {
    [leftWords.join(' ') + ' ' + rightWords.join(' ')]: leftValue + rightValue
  }
}
```

#### Pattern 3: Conditional connectors (French style)

```javascript
mergeScales (leftWordSet, rightWordSet) {
  const leftWords = Object.keys(leftWordSet)
  const rightWords = Object.keys(rightWordSet)
  const leftValue = Object.values(leftWordSet)[0]
  const rightValue = Object.values(rightWordSet)[0]

  // Use 'et' (and) for specific combinations
  if (leftValue === 20n && rightValue === 1n) {
    return { 'vingt et un': 21n }
  }

  // Use hyphen by default
  return {
    [leftWords.join('-') + '-' + rightWords.join('-')]: leftValue + rightValue
  }
}
```

### 4. Handle Special Cases

#### Gender Agreement (Portuguese, French, etc.)

```javascript
mergeScales (leftWordSet, rightWordSet) {
  // ... standard merge logic ...

  // Special case: gender-sensitive numbers
  if (leftValue === 100n) {
    // Check for feminine option in options
    const word = this.options.feminine ? 'centa' : 'cento'
    // ... adjust accordingly
  }
}
```

#### Irregular Patterns

```javascript
mergeScales (leftWordSet, rightWordSet) {
  const leftValue = Object.values(leftWordSet)[0]
  const rightValue = Object.values(rightWordSet)[0]

  // Handle special combinations
  const specialCases = {
    '70,10': 'seventy',  // 60 + 10 = 70 in some languages
    '80,20': 'eighty'    // 60 + 20 = 80 in some languages
  }

  const key = `${leftValue},${rightValue}`
  if (specialCases[key]) {
    return { [specialCases[key]]: leftValue + rightValue }
  }

  // Default merge
  // ...
}
```

### 5. SouthAsianLanguage Example

For South Asian languages with Indian number grouping (3 digits on right, then 2-2):

```javascript
import SouthAsianLanguage from '../classes/south-asian-language.js'

export class HindiLanguage extends SouthAsianLanguage {
  negativeWord = 'माइनस'
  decimalSeparatorWord = 'दशमलव'
  zeroWord = 'शून्य'
  hundredWord = 'सौ'

  // Single array mapping 0..99 to words
  belowHundred = [ /* 'शून्य', 'एक', 'दो', ... 'निन्यानवे' */ ]

  // Indexed scale words (0 = none, 1 = thousand, 2 = lakh, 3 = crore, ...)
  scaleWords = [
    '',
    'हज़ार',
    'लाख',
    'करोड़',
    'अरब'
  ]

  /**
   * Initialize with language-specific options.
   * @param {Object} [options={}] Configuration options.
   */
  constructor(options = {}) {
    super()
    this.options = options
  }
}

// Export only the class - wrapper function created dynamically by n2words.js
// This eliminates ~10 lines of boilerplate per language file
```

**Key points for SouthAsianLanguage:**

- Grouping pattern: 12,34,56,789 (3 digits on right, then 2-2 from right)
- `belowHundred` array: Single array mapping 0..99 to words
- `scaleWords` array: Indexed strings for grouping words (0 = none, 1 = thousand, 2 = lakh, 3 = crore, ...)
- `hundredWord` class property: Word for 100 (used in `convertBelowThousand()`)

## Testing Your Implementation

### 1. Define Test Cases

Edit `test/fixtures/languages/<code>.js` with comprehensive test cases:

```javascript
// File: test/fixtures/languages/cs.js (Czech example)
export default [
  // Basic numbers
  [0, 'nula'],
  [1, 'jeden'],
  [10, 'deset'],
  [21, 'dvacet jeden'],

  // Hundreds and thousands
  [100, 'sto'],
  [1000, 'tisíc'],
  [12345, 'dvanáct tisíc tři sta čtyřicet pět'],

  // Negative and decimals
  [-5, 'mínus pět'],
  ['3.14', 'tři celá jedna čtyři'],
  ['0.005', 'nula celá nula nula pět'], // Leading zeros preserved
]
```

### 2. Run Tests

```bash
# Test your specific language
npm run test:integration

# Validate implementation (includes IETF BCP 47 compliance check)
npm run lang:validate <code>

# Validate all languages
npm run lang:validate

# Full test suite
npm test
```

**Validation includes**:

- ✓ IETF BCP 47 language code compliance
- ✓ File structure and exports
- ✓ Class implementation patterns
- ✓ Test coverage requirements

### 3. Test Coverage Checklist

- ✓ Zero and single digits (0-9)
- ✓ Teens (10-19) if irregular in your language
- ✓ Tens (20, 30, ..., 90) and compounds (21, 37, 99)
- ✓ Hundreds (100, 200, 999)
- ✓ Thousands, millions, billions
- ✓ Negative numbers
- ✓ Decimal numbers with leading zeros
- ✓ Language-specific edge cases

## Decimal Handling

`AbstractLanguage` supports two decimal conversion modes:

### Default (Grouped) Mode

Leading zeros are preserved as "zero" words, remaining digits are grouped:

- `3.14` → "three point fourteen"
- `2.05` → "two point zero five"
- `0.007` → "zero point zero zero seven"

### Per-Digit Mode

Each decimal digit is converted individually. Enable by setting `convertDecimalsPerDigit = true`:

- `3.14` → "three point one four"
- `2.05` → "two point zero five"

```javascript
class Japanese extends AbstractLanguage {
  negativeWord = 'マイナス'
  decimalSeparatorWord = '点'
  zeroWord = '零'
  convertDecimalsPerDigit = true // Enable per-digit reading
  digits = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
}
```

**Use per-digit for**: Japanese, Thai, Tamil, Telugu, Filipino, Marathi, Gujarati, Kannada, Greek, and languages where grouped reading doesn't make sense.

### Digits Array for Per-Digit Languages

```javascript
class MyLanguage extends AbstractLanguage {
  convertDecimalsPerDigit = true
  digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
}
```

The `convertDigitToWord()` method automatically uses this array for decimal conversion.

## Common Patterns

### English-style (space + "and")

```javascript
mergeScales(left, right) {
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]
  const leftText = Object.keys(left)[0]
  const rightText = Object.keys(right)[0]

  // Add "and" for hundreds + units
  if (leftValue >= 100n && rightValue < 100n) {
    return { [leftText + ' and ' + rightText]: leftValue + rightValue }
  }
  return { [leftText + ' ' + rightText]: leftValue + rightValue }
}
```

### Romance Languages (hyphens + connectors)

```javascript
mergeScales(left, right) {
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]
  const leftText = Object.keys(left)[0]
  const rightText = Object.keys(right)[0]

  // Special connectors (e.g., French "et")
  if (leftValue % 10n === 0n && rightValue === 1n) {
    return { [leftText + ' et ' + rightText]: leftValue + rightValue }
  }
  return { [leftText + '-' + rightText]: leftValue + rightValue }
}
```

## Optimization Tips

### Pre-compile Regex Patterns

```javascript
class MyLanguage extends GreedyScaleLanguage {
  constructor(options = {}) {
    super()
    this.doubleSpaceRegex = /\s{2,}/g // Pre-compile
  }

  mergeScales(left, right) {
    const result = // ... merge logic
    return result.replace(this.doubleSpaceRegex, ' ')
  }
}
```

### Cache Object Operations

```javascript
mergeScales(left, right) {
  // Cache once, use multiple times
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]
  // ...
}
```

## BigInt Requirements

All language implementations must use BigInt literals in specific contexts:

- **Scale word pair arrays**: Use `1000n`, not `1000`
- **Comparisons**: When comparing BigInt values, use `value === 1n`
- **Arithmetic**: BigInt operations require BigInt operands

See [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) for comprehensive guidance on BigInt usage.

## Reference Implementations

**Study these examples for patterns:**

- **GreedyScaleLanguage**: `lib/languages/en.js` (basic), `lib/languages/pt.js` (optimized), `lib/languages/fr.js` (complex rules)
- **SlavicLanguage**: `lib/languages/ru.js` (three-form pluralization), `lib/languages/cs.js` (IETF compliant)
- **TurkicLanguage**: `lib/languages/tr.js` (space-separated patterns)
- **SouthAsianLanguage**: `lib/languages/hi.js` (Indian-style grouping)
- **AbstractLanguage**: `lib/languages/ar.js` (custom implementation)

**Recent Updates**: Several languages updated to IETF BCP 47 compliance (`cz`→`cs`, `dk`→`da`, `no`→`nb`, `tl`→`fil`).

## Getting Help

- Review [CONTRIBUTING.md](../CONTRIBUTING.md) and [BIGINT-GUIDE.md](./BIGINT-GUIDE.md)
- Study existing language implementations for patterns
- Open an issue for questions - the community is here to help!
