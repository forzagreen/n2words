# Language Development Guide

Complete guide for adding new language support to n2words.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Base Classes](#base-classes)
- [Testing](#testing)
- [Validation](#validation)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

Adding a new language to n2words involves:

1. Creating a language class that extends one of the base classes
2. Implementing number-to-word conversion logic
3. Adding comprehensive test cases
4. Validating the implementation

The entire process is streamlined with scaffolding and validation tools.

## Quick Start

### Generate Language Scaffold

```bash
npm run lang:add <language-code>
```

Examples:

```bash
npm run lang:add ko        # Korean
npm run lang:add zh-Hans   # Simplified Chinese
npm run lang:add fr-CA     # Canadian French
npm run lang:add sr-Latn   # Serbian (Latin script)
```

This creates:

- `lib/languages/<code>.js` - Language implementation
- `test/fixtures/languages/<code>.js` - Test cases
- Updates `lib/n2words.js` - Automatic registration:
  - Adds import in Language Imports section (alphabetically)
  - Creates converter with type annotation in Language Converters section (alphabetically)
  - Adds export in Exports section (alphabetically)

### Language Code Format

Use [IETF BCP 47](https://tools.ietf.org/html/bcp47) language tags:

- **Simple**: `en`, `fr`, `de`, `ja`
- **With script**: `zh-Hans`, `zh-Hant`, `sr-Cyrl`, `sr-Latn`
- **With region**: `fr-BE`, `fr-CA`, `en-GB`

## Architecture

### Base Class Hierarchy

```text
AbstractLanguage (base for all)
├── GreedyScaleLanguage (most European/Asian languages)
├── SlavicLanguage (Polish, Russian, etc.)
├── SouthAsianLanguage (Hindi, Tamil, etc.)
└── TurkicLanguage (Turkish, Azerbaijani, etc.)
```

### How to Choose a Base Class

| Base Class | Use When | Examples |
| ---------- | -------- | -------- |
| `GreedyScaleLanguage` | Standard scale-based conversion (thousand, million, billion) | English, Spanish, French, German, Chinese, Japanese |
| `SlavicLanguage` | Three-form pluralization based on last digit | Polish, Russian, Ukrainian, Czech |
| `SouthAsianLanguage` | Indian numbering system (lakh, crore) | Hindi, Tamil, Telugu, Marathi, Bengali |
| `TurkicLanguage` | Omits "bir" (one) before scales, vowel harmony | Turkish, Azerbaijani |
| `AbstractLanguage` | Complex custom logic not covered above | Arabic (gender agreement) |

## Step-by-Step Implementation

### Step 1: Scaffold the Language

```bash
npm run lang:add <code>
```

This creates boilerplate files with TODOs.

### Step 2: Implement Required Properties

Edit `lib/languages/<code>.js`:

```javascript
export class MyLanguage extends GreedyScaleLanguage {
  // Required: Word for negative numbers
  negativeWord = 'minus'

  // Required: Word for zero
  zeroWord = 'zero'

  // Required: Word between integer and decimal parts
  decimalSeparatorWord = 'point'

  // Required: Character(s) between words
  wordSeparator = ' '

  // Optional: Convert decimals digit-by-digit (true) or as a whole number (false)
  convertDecimalsPerDigit = true

  // For scale-based languages: largest to smallest
  scaleWordPairs = [
    [1000000000n, 'billion'],
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    // ... down to 1n
    [1n, 'one']
  ]
}
```

### Step 3: Implement Required Methods

#### For GreedyScaleLanguage

Implement `mergeScales()` to combine number words:

```javascript
/**
 * Merges left and right number components with language-specific rules.
 *
 * @param {bigint} leftNumber - The left numeric component (e.g., 3n for "three hundred")
 * @param {string} leftWords - The left number as words (e.g., "three")
 * @param {bigint} rightNumber - The right scale value (e.g., 100n for "hundred")
 * @param {string} rightWords - The right scale as words (e.g., "hundred")
 * @returns {string} Combined words following language grammar
 */
mergeScales(leftNumber, leftWords, rightNumber, rightWords) {
  // Example for English:
  // "three" + "hundred" = "three hundred"
  // "one hundred" + "twenty-three" = "one hundred and twenty-three"

  if (leftWords === '') {
    return rightWords
  }

  // Add "and" before final two digits in English
  if (rightNumber < 100n && leftNumber >= 100n) {
    return `${leftWords} and ${rightWords}`
  }

  return `${leftWords} ${rightWords}`
}
```

#### For AbstractLanguage

Implement `convertWholePart()` for full custom logic:

```javascript
/**
 * Converts the whole number part to words.
 *
 * @param {bigint} wholeNumber - The whole number to convert
 * @returns {string} The number as words
 */
convertWholePart(wholeNumber) {
  if (wholeNumber === 0n) return this.zeroWord

  // Your custom conversion logic here
  // This is where you implement language-specific rules

  return result
}
```

### Step 4: Add Test Cases

Edit `test/fixtures/languages/<code>.js`:

```javascript
/**
 * Test fixtures for MyLanguage converter
 * Format: [input, expectedOutput, options]
 */
export default [
  // Basic numbers
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  // ... through 20

  // Tens
  [10, 'ten'],
  [20, 'twenty'],
  [30, 'thirty'],
  // ...

  // Hundreds
  [100, 'one hundred'],
  [200, 'two hundred'],

  // Thousands
  [1000, 'one thousand'],
  [1234, 'one thousand two hundred and thirty-four'],

  // Millions
  [1000000, 'one million'],

  // Negatives
  [-5, 'minus five'],
  [-42, 'minus forty-two'],

  // Decimals
  [3.14, 'three point one four'],
  [0.5, 'zero point five'],

  // BigInt
  [1000000n, 'one million'],
  [123456789n, 'one hundred and twenty-three million four hundred and fifty-six thousand seven hundred and eighty-nine'],

  // Edge cases
  [11, 'eleven'],   // If language has special teen forms
  [101, 'one hundred and one'],
  [1001, 'one thousand and one'],

  // Language-specific options (if applicable)
  [1, 'un', { gender: 'masculine' }],
  [1, 'une', { gender: 'feminine' }]
]
```

### Step 5: Validate Implementation

```bash
# Validate your language
npm run lang:validate -- <code> --verbose

# Run tests
npm test
```

## Base Classes

### AbstractLanguage

Base class for all languages. Provides:

- Decimal handling
- Negative number handling
- Input type normalization
- Template for `convertWholePart()`

**Use when**: You need complete custom logic

**Required methods:**

- `convertWholePart(wholeNumber: bigint): string`

### GreedyScaleLanguage

Extends `AbstractLanguage`. Implements greedy scale-based conversion.

**Algorithm:**

1. Find largest scale ≤ number
2. Divide number by scale
3. Recursively convert left part
4. Merge with scale word
5. Continue with remainder

**Use when**: Language uses thousand/million/billion scales

**Required:**

- `scaleWordPairs` array (descending order)
- `mergeScales()` method

**Example languages:** English, Spanish, French, German, Italian, Chinese, Japanese

### SlavicLanguage

Extends `GreedyScaleLanguage`. Adds three-form pluralization.

**Pluralization rules:**

- Singular: 1, 21, 31, ... (ends with 1, except 11)
- Few: 2-4, 22-24, 32-34, ... (ends with 2-4, except 12-14)
- Many: 0, 5-20, 25-30, ... (all others)

**Additional required:**

- `pluralWords` object with singular/few/many forms

**Example languages:** Polish, Russian, Ukrainian, Czech, Croatian

### SouthAsianLanguage

Extends `AbstractLanguage`. Implements Indian numbering system.

**Scale system:**

- Units: 1-99
- Hundred: 100
- Thousand: 1,000
- **Lakh**: 1,00,000 (100 thousand)
- **Crore**: 1,00,00,000 (100 lakh)

**Use when**: Language uses lakh/crore system

**Example languages:** Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada

### TurkicLanguage

Extends `GreedyScaleLanguage`. Handles Turkish-style features:

- Omits "bir" (one) before "yüz" (hundred), "bin" (thousand)
- Vowel harmony (advanced)

**Example languages:** Turkish, Azerbaijani

## Testing

### Test Structure

Tests are defined as arrays of tuples:

```javascript
[input, expectedOutput, options?]
```

### Comprehensive Test Coverage

Include tests for:

1. **Basic numbers**: 0-20
2. **Tens**: 10, 20, 30, ..., 90
3. **Hundreds**: 100, 200, ..., 900
4. **Thousands**: 1000, 2000, ..., 9000
5. **Large numbers**: Millions, billions
6. **Negative numbers**: -1, -42, -1000
7. **Decimals**: 0.5, 3.14, 99.99
8. **BigInt**: Large integers
9. **Edge cases**: 11-19 (teens), 101, 1001, etc.
10. **Language-specific features**: Gender, formality, etc.

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Specific language validation
npm run lang:validate -- <code>
```

## Validation

The validation tool checks:

- ✅ File naming (IETF BCP 47)
- ✅ Proper class inheritance
- ✅ Required properties defined
- ✅ Required methods implemented
- ✅ Scale word pairs (if applicable)
- ✅ Test fixtures exist
- ✅ Registration in `lib/n2words.js`
- ✅ JSDoc documentation

```bash
# Validate all languages
npm run lang:validate

# Validate specific language with details
npm run lang:validate -- <code> --verbose
```

## Best Practices

### 1. Use Appropriate Data Types

```javascript
// ✓ Good: Use BigInt for scales
scaleWordPairs = [
  [1000000n, 'million'],
  [1000n, 'thousand']
]

// ✗ Bad: Using numbers
scaleWordPairs = [
  [1000000, 'million']  // Will cause issues
]
```

### 2. Order Scales Correctly

```javascript
// ✓ Good: Largest to smallest
scaleWordPairs = [
  [1000000n, 'million'],
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']
]

// ✗ Bad: Wrong order
scaleWordPairs = [
  [100n, 'hundred'],
  [1000n, 'thousand'],  // Wrong order!
  [1n, 'one']
]
```

### 3. Document Language-Specific Options

```javascript
/**
 * @typedef {Object} MyLanguageOptions
 * @property {boolean} [formal=false] Use formal style
 * @property {string} [gender='neutral'] Gender: 'masculine', 'feminine', 'neutral'
 */

export class MyLanguage extends AbstractLanguage {
  constructor(options = {}) {
    super(options)
    this.options = {
      formal: false,
      gender: 'neutral',
      ...options
    }
  }
}
```

### 4. Add Comprehensive JSDoc

```javascript
/**
 * French language converter.
 *
 * Features:
 * - Belgian variant with septante/nonante
 * - Proper liaison and elision
 * - Agreement with gender
 *
 * @extends GreedyScaleLanguage
 * @example
 * const converter = new French()
 * converter.convertToWords(42)  // 'quarante-deux'
 */
export class French extends GreedyScaleLanguage {
  // ...
}
```

### 5. Handle Edge Cases

Consider:

- Zero
- Negatives
- Decimals with many digits
- Very large numbers (BigInt)
- Numbers like 11-19 (teen numbers)
- Numbers ending in 0 (20, 100, 1000)
- Numbers with repeated digits (111, 1111)

## Examples

### Example 1: Simple GreedyScaleLanguage

```javascript
import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

export class Spanish extends GreedyScaleLanguage {
  negativeWord = 'menos'
  zeroWord = 'cero'
  decimalSeparatorWord = 'punto'
  wordSeparator = ' '

  scaleWordPairs = [
    [1000000000n, 'mil millones'],
    [1000000n, 'millón'],
    // ... other scales
  ]

  mergeScales(leftNumber, leftWords, rightNumber, rightWords) {
    if (leftWords === '') return rightWords

    // Spanish: "ciento" becomes "cien" when standalone
    if (leftNumber === 100n && rightNumber === 100n) {
      return 'cien'
    }

    return `${leftWords} ${rightWords}`
  }
}
```

### Example 2: SlavicLanguage with Pluralization

```javascript
import { SlavicLanguage } from '../classes/slavic-language.js'

export class Polish extends SlavicLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'przecinek'
  wordSeparator = ' '

  // Three forms for each scale
  pluralWords = {
    1000: {
      singular: 'tysiąc',     // 1 thousand
      few: 'tysiące',          // 2-4 thousand
      many: 'tysięcy'          // 5+ thousand
    },
    1000000: {
      singular: 'milion',
      few: 'miliony',
      many: 'milionów'
    }
  }

  scaleWordPairs = [
    [1000000n, 'milion'],
    [1000n, 'tysiąc'],
    // ...
  ]
}
```

### Example 3: Custom AbstractLanguage

```javascript
import { AbstractLanguage } from '../classes/abstract-language.js'

export class Arabic extends AbstractLanguage {
  negativeWord = 'ناقص'
  zeroWord = 'صفر'
  decimalSeparatorWord = 'فاصلة'
  wordSeparator = ' و'

  constructor(options = {}) {
    super(options)
    this.feminine = options.feminine || false
  }

  convertWholePart(wholeNumber) {
    if (wholeNumber === 0n) return this.zeroWord

    // Complex Arabic-specific logic with:
    // - Gender agreement
    // - Dual forms (2)
    // - Plural forms
    // - Right-to-left text

    // ... custom implementation

    return result
  }
}
```

## Troubleshooting

### Validation Fails: "scaleWordPairs not in descending order"

**Solution:** Order your scale pairs from largest to smallest:

```javascript
scaleWordPairs = [
  [1000000n, 'million'],  // Largest
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']             // Smallest
]
```

### Tests Fail: Unexpected output

**Solution:** Check your `mergeScales()` logic and ensure it matches language grammar:

```javascript
mergeScales(leftNumber, leftWords, rightNumber, rightWords) {
  console.log({ leftNumber, leftWords, rightNumber, rightWords })
  // Debug to see what's being merged
  return `${leftWords} ${rightWords}`
}
```

### Error: "convertWholePart() not implemented"

**Solution:** You must implement `convertWholePart()` when extending `AbstractLanguage`:

```javascript
convertWholePart(wholeNumber) {
  if (wholeNumber === 0n) return this.zeroWord
  // ... your implementation
}
```

## Further Reading

- [scripts/README.md](../../scripts/README.md) - Detailed tool documentation
- [API.md](../API.md) - Complete API reference
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- Examine existing language files in `lib/languages/` for patterns

## Questions?

- Check existing language implementations in `lib/languages/`
- Review base classes in `lib/classes/`
- Open an issue on GitHub
