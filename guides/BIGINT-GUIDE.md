# BigInt Guide

This guide explains when and where to use JavaScript's `BigInt` type in n2words language implementations.

## Contents

1. [Quick Reference](#quick-reference)
2. [Core Concepts](#core-concepts)
3. [Usage Patterns](#usage-patterns)
4. [Common Pitfalls](#common-pitfalls)
5. [Testing](#testing)

---

## Quick Reference

**✅ MUST use BigInt literals (n suffix):**

- Scale word pair arrays: `[1000n, 'thousand']`
- BigInt comparisons: `if (value === 1n)`
- BigInt arithmetic: `number / 1000n`, `number % 10n`

**❌ DO NOT use BigInt literals:**

- Array indices: `chunks[0]`, `words.length`
- Object keys: `this.ones[5]`
- Math operations: `Math.pow(10, 3)`
- Regular numbers: `for (let i = 0; i < 10; i++)`

## Core Concepts

### Why BigInt?

JavaScript's `Number` type loses precision beyond `2^53 - 1`. BigInt provides arbitrary precision for large numbers.

### Critical Rule: No Type Coercion

```javascript
// ❌ These throw TypeError
1n + 1      // Cannot mix BigInt and other types
1n === 1    // false (different types)
1n < 100    // Cannot mix BigInt and other types

// ✅ Correct BigInt operations
1n + 1n     // 2n
1n === 1n   // true
1n < 100n   // true

// ✅ Explicit conversions
Number(1n) === 1     // true
BigInt(100) === 100n // true
```

### Processing Flow

```text
User Input → convertToWords() → BigInt → Language Class → String Output
```

Once input becomes BigInt, all downstream operations must use BigInt or explicit conversions.

## Usage Patterns

### 1. Scale Word Pairs (Required)

**All GreedyScaleLanguage subclasses:**

```javascript
// ✅ CORRECT
scaleWordPairs = [
  [1_000_000n, 'million'],
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']
]

// ❌ WRONG - Throws TypeError in decomposeToScales
scaleWordPairs = [
  [1000, 'thousand'],  // Regular number
  [1, 'one']
]
```

### 2. mergeScales() Comparisons (Required)

```javascript
// ✅ CORRECT
mergeScales(leftPair, rightPair) {
  const leftNum = Object.values(leftPair)[0]   // BigInt
  const rightNum = Object.values(rightPair)[0] // BigInt

  if (leftNum === 1n && rightNum < 100n) {
    return rightPair
  }
}

// ❌ WRONG - Silent failure
if (leftNum === 1) {  // Always false for BigInt values
  return rightPair
}
```

### 3. SlavicLanguage Arithmetic (Required)

```javascript
// ✅ CORRECT
convertWholePart(number) {
  if (number === 0n) return this.zeroWord

  const lastDigit = number % 10n
  if (lastDigit === 1n) {
    // Use singular form
  }
}

// ❌ WRONG
if (number === 0) {     // Always false for BigInt
  return this.zeroWord
}
```

### 4. Regular Operations (Use Numbers)

```javascript
// ✅ CORRECT - Use regular numbers
const chunks = value.split('.')     // Array operations
for (let i = 0; i < chunks.length; i++) {  // Loop counters
  const chunk = chunks[i]           // Array indexing
}

const power = Math.pow(1000, 3)     // Math operations
const lookup = this.ones[5]         // Object keys
```

### 5. Type Conversions (When Needed)

```javascript
// ✅ Explicit conversions for cross-type operations
const chunk = Number(temp % 1000n)      // BigInt → Number
const bigValue = BigInt(Math.pow(10, 3)) // Number → BigInt

// Extract digits as numbers for lookups
const ones = Number(x % 10n)
words.push(this.digitWords[ones])  // Use number as object key
```

### Base Class Patterns

**GreedyScaleLanguage** (25+ languages: en, es, fr, de, it, pt, nl, ko, hu, zh, etc.):

- Scale word pairs: All `n` suffix
- mergeScales(): All BigInt comparisons

**SlavicLanguage** (11 languages: ru, cz, pl, uk, sr, hr, he, lt, lv, etc.):

- convertWholePart(): All `n` suffix in conditionals
- Arithmetic: `number % 10n`, `number / 10n`

**TurkicLanguage** (tr, az):

- Inherits GreedyScaleLanguage BigInt requirements
- Space-separated patterns with BigInt arithmetic

**SouthAsianLanguage** (hi, bn, ur, pa, mr, gu, kn):

- Indian-style grouping with BigInt processing
- Per-digit decimal mode where specified

**Custom AbstractLanguage** (ar, vi, ro, id):

- Often uses explicit conversions: `Number()`, `BigInt()`
- Processes chunks as regular numbers after extraction

## Common Pitfalls

### ❌ Missing `n` Suffix in Scale Arrays

```javascript
// ❌ WRONG - TypeError in decomposeToScales
scaleWordPairs = [[1000, 'thousand']]

// ✅ CORRECT
scaleWordPairs = [[1000n, 'thousand']]
```

### ❌ Mixed Type Comparisons

```javascript
// ❌ WRONG - Always false
if (bigintValue === 1) { ... }

// ✅ CORRECT
if (bigintValue === 1n) { ... }
```

### ❌ BigInt in Non-BigInt Context

```javascript
// ❌ WRONG - TypeError
for (let i = 0n; i < array.length; i++) { ... }

// ✅ CORRECT - Use regular numbers for indices
for (let i = 0; i < array.length; i++) { ... }
```

### ❌ Mixed Arithmetic

```javascript
// ❌ WRONG - Cannot mix types
const result = bigintValue / 1000

// ✅ CORRECT
const result = bigintValue / 1000n
```

## Testing

### Large Number Tests

```javascript
// Test beyond Number.MAX_SAFE_INTEGER
n2words(9_007_199_254_740_992n) // 2^53
n2words('1000000000000000000000000000') // 1 octillion

// Test BigInt inputs
n2words(42n) === n2words('42') === n2words(42) // Should all match

// Test edge cases
n2words(0n)     // Zero
n2words(-1000n) // Negative BigInt
n2words('1000000000000.5') // Large whole + decimal
```

### Implementation Checklist

**GreedyScaleLanguage/TurkicLanguage:**

- [ ] All `scaleWordPairs` values use `n` suffix
- [ ] All `mergeScales()` comparisons use `n` suffix
- [ ] Regular numbers for indices/lengths only

**SlavicLanguage:**

- [ ] All `convertWholePart()` conditionals use `n` suffix
- [ ] All `pluralize()` conditionals use `n` suffix
- [ ] Modulo/division: `number % 10n`, `number / 10n`

**Custom AbstractLanguage:**

- [ ] Entry checks use `n` suffix: `number === 0n`
- [ ] Explicit conversions documented: `Number()`, `BigInt()`
- [ ] Loop conditions on BigInt use `n` suffix

### Decision Tree

```text
Used in BigInt arithmetic (/, %, *)?
├─ YES → Use n suffix
└─ NO → Compared to BigInt value?
    ├─ YES → Use n suffix
    └─ NO → scaleWordPairs value?
        ├─ YES → Use n suffix
        └─ NO → Regular number (no n suffix)
```
