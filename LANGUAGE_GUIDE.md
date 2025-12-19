# Language Implementation Guide

This guide helps you implement a new language for n2words.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Testing Your Implementation](#testing-your-implementation)
5. [Common Patterns](#common-patterns)
6. [Optimization Tips](#optimization-tips)

## Getting Started

### Automated Setup

Use the automated script to generate boilerplate:

```bash
npm run lang:add
```

This creates:

- `lib/i18n/xx.js` - Language implementation
- `test/i18n/xx.js` - Test cases
- Updates `lib/n2words.js` - Registration

### Manual Setup

If you need more control, follow these steps:

1. Create `lib/i18n/xx.js`
2. Choose the appropriate base class based on your language's characteristics
3. Implement required methods
4. Add language registration in `lib/n2words.js`
5. Create test file `test/i18n/xx.js`

## Understanding the Architecture

### Base Classes

Choose the appropriate base class for your language:

**GreedyScaleLanguage** - Use for most languages with regular card-based systems

- Extends `AbstractLanguage`
- Implements highest-matching-card algorithm
- Works well for languages with regular patterns
- Define a `cards` array and implement `mergeScales()` method
- Examples: English, Spanish, German, French, Italian, Portuguese, Dutch, Korean, Hungarian, Chinese

 **SlavicLanguage** - Use for Slavic/Baltic languages with three-form pluralization

- Extends `AbstractLanguage`
- Specialized for languages with complex pluralization rules
- Handles singular/dual/plural forms
- Supports shared `feminine` option for feminine forms of digits 1-9 (ones place)
- Examples: Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian

**TurkicLanguage** - Use for Turkic languages

- Extends `GreedyScaleLanguage`
- Space-separated number combinations
- Implicit number handling patterns
- Examples: Turkish, Azerbaijani

**AbstractLanguage** - Use for custom implementations requiring full control

- Core base class for all others
- Most flexibility for irregular patterns
- Examples: Arabic, Vietnamese, Romanian, Persian, Indonesian

### Key Concepts

#### Cards Array

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

Start by selecting the right base class. For most languages, use `GreedyScaleLanguage`:

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

export class MyLanguage extends GreedyScaleLanguage {
  // Set language defaults as class properties
  negativeWord = 'minus'      // Word for negative numbers
  decimalSeparatorWord = 'point'     // Word for decimal point
  zero = 'zero'               // Word for zero
  convertDecimalsPerDigit = false // Set to true for digit-by-digit decimal reading

  // Define cards array with [value, word] pairs in DESCENDING order
  cards = [
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

export default function convertToWords(value, options = {}) {
  return new MyLanguage(options).convertToWords(value)
}
```

**Important notes:**

- Use class properties for default values (not passed via constructor)
- Constructor parameters should only include options that actually affect behavior
- Use `BigInt` literals (`1000n`, not `1000`) in cards array for numerical accuracy

### 2. Implement Merge Logic

The `mergeScales()` method combines word sets according to your language's grammar:

#### Pattern 1: Space-separated (English style)

```javascript
merge (leftWordSet, rightWordSet) {
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
merge (leftWordSet, rightWordSet) {
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
merge (leftWordSet, rightWordSet) {
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

### 3. Handle Special Cases

#### Gender Agreement (Portuguese, French, etc.)

```javascript
merge (leftWordSet, rightWordSet) {
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
merge (leftWordSet, rightWordSet) {
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

## Testing Your Implementation

### 1. Define Test Cases

Edit `test/i18n/xx.js` with comprehensive test cases:

```javascript
export default [
  // Basic numbers
  [0, 'zero'],
  [1, 'one'],
  [10, 'ten'],
  [11, 'eleven'],
  [20, 'twenty'],
  [21, 'twenty-one'],
  [99, 'ninety-nine'],

  // Hundreds
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [999, 'nine hundred and ninety-nine'],

  // Thousands
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [12345, 'twelve thousand three hundred and forty-five'],

  // Millions
  [1000000, 'one million'],

  // Negative
  [-5, 'minus five'],
  [-1000, 'minus one thousand'],

  // Decimals
  ['3.14', 'three point one four'],
  ['0.5', 'zero point five'],
  ['3.005', 'three point zero zero five'], // Leading zeros important!
];
```

### 2. Run Tests

```bash
# Test your specific language
npm run test:i18n

# Validate implementation
npm run lang:validate xx

# Validate all languages
npm run lang:validate

# Full test suite
npm test
```

### 3. Test Coverage

Ensure you test:

- ✓ Zero
- ✓ Single digits (1-9)
- ✓ Teens (10-19) if irregular
- ✓ Tens (20, 30, ..., 90)
- ✓ Compound numbers (21, 37, 99)
- ✓ Hundreds (100, 200, 999)
- ✓ Thousands (1000, 1001, 12345)
- ✓ Millions and billions
- ✓ Negative numbers
- ✓ Decimal numbers
- ✓ Edge cases specific to your language

## Decimal Handling

By default, `AbstractLanguage` handles decimals using a grouped approach where leading zeros are preserved as individual "zero" words, and remaining digits are grouped as a number:

- `3.14` → "three point one four" (grouped: remaining digits read as "fourteen"... wait, this would be "one four")
- `2.05` → "two point zero five" (zero preserved, then "five")

### Per-Digit Decimal Conversion

Some languages read each decimal digit individually. To enable this behavior, set `convertDecimalsPerDigit = true` as a class property:

```javascript
class Japanese extends AbstractLanguage {
  negativeWord = 'マイナス';
  decimalSeparatorWord = '点';
  zero = '零';
  convertDecimalsPerDigit = true; // Enable per-digit decimal reading
  digits = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

  // Constructor only if you have behavior-changing options (usually not needed)
}
```

**When to use per-digit decimals:**

- Languages that always read decimals digit-by-digit (Japanese, Thai, Tamil, Telugu)
- Scripts where grouped decimal reading doesn't make linguistic sense
- Languages with a `digits` array for individual digit words

**Default (grouped) behavior:**

- `3.14` → groups as "three point one four" (or "fourteen" depending on language)
- `2.05` → "two point zero five" (leading zero preserved)

**Per-digit behavior (`convertDecimalsPerDigit: true`):**

- `3.14` → "three point one four" (each digit separate)
- `2.05` → "two point zero five" (each digit separate)

### Defining a Digits Array

If your language uses per-digit decimals, define a `digits` class property and set
`convertDecimalsPerDigit = true` as a class property (not via constructor options):

```javascript
class MyLanguage extends AbstractLanguage {
  // Map indices 0-8 to digits 1-9
  digits = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ];

  convertDecimalsPerDigit = true;

  // Constructor only if you have behavior-changing options (usually not needed)
}
```

The `convertDigitToWord()` method will automatically use this array when converting decimal digits.

## Common Patterns

### Pattern: English-style

Space-separated with "and" before final unit:

```javascript
merge (left, right) {
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]

  // Add "and" for hundreds + units
  if (leftValue >= 100n && rightValue < 100n) {
    return { [Object.keys(left)[0] + ' and ' + Object.keys(right)[0]]: leftValue + rightValue }
  }

  // Simple space otherwise
  return { [Object.keys(left)[0] + ' ' + Object.keys(right)[0]]: leftValue + rightValue }
}
```

### Pattern: Romance Languages

Hyphenated compounds with special connectors:

```javascript
merge (left, right) {
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]

  // Special connectors
  if (leftValue % 10n === 0n && rightValue === 1n) {
    return { [Object.keys(left)[0] + ' et ' + Object.keys(right)[0]]: leftValue + rightValue }
  }

  // Hyphenate compounds
  return { [Object.keys(left)[0] + '-' + Object.keys(right)[0]]: leftValue + rightValue }
}
```

## Optimization Tips

### 1. Pre-compile Regex

For post-processing, compile regex once:

```javascript
class MyLanguage extends GreedyScaleLanguage {
  constructor (options) {
    super(options, cards)

    // Pre-compile regex patterns
    this.doubleSpaceRegex = /\s{2,}/g
    this.trimRegex = /^\s+|\s+$/g
  }

  merge (left, right) {
    const result = // ... merge logic

    // Use pre-compiled regex
    return result.replace(this.doubleSpaceRegex, ' ')
  }
}
```

### 2. Cache Object Operations

```javascript
merge (left, right) {
  // Cache keys/values instead of calling multiple times
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  const leftValue = Object.values(left)[0]
  const rightValue = Object.values(right)[0]

  // Use cached values
  // ...
}
```

### 3. Simplify String Operations

```javascript
// ✗ Slow
const merged = leftWords.join(' ') + ' ' + rightWords.join(' ');

// ✓ Faster for single words
const merged = leftWords[0] + ' ' + rightWords[0];

// ✓ Or use array concatenation
const merged = [...leftWords, ...rightWords].join(' ');
```

## BigInt Requirements

All language implementations must use BigInt literals in specific contexts:

- **Cards arrays**: Use `1000n`, not `1000`
- **Comparisons**: When comparing BigInt values, use `value === 1n`
- **Arithmetic**: BigInt operations require BigInt operands

See [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) for comprehensive guidance on BigInt usage.

## Reference Implementations

Study these examples:

- **GreedyScaleLanguage**: `lib/i18n/en.js` - Basic patterns
- **GreedyScaleLanguage (optimized)**: `lib/i18n/pt.js` - Advanced optimizations
- **GreedyScaleLanguage (complex)**: `lib/i18n/fr.js` - Special rules
- **GreedyScaleLanguage (Nordic rules inline)**: `lib/i18n/no.js` - Norwegian "og" conjunction handled in mergeScales()
- **TurkicLanguage**: `lib/i18n/tr.js` - Turkish patterns with space-separated combinations
- **SlavicLanguage**: `lib/i18n/ru.js` - Three-form pluralization pattern
- **AbstractLanguage**: `lib/i18n/ar.js`, `lib/i18n/zh.js` - Custom implementations with different scripts

## Getting Help

- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for general guidelines
- Review [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) for BigInt usage
- Study existing language implementations
- Open an issue if you have questions
- The community is here to help!


