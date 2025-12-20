# BigInt Guide for Language Developers

This guide explains **when and where** to use JavaScript's `BigInt` type when implementing language converters in the n2words library.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Understanding BigInt in n2words](#understanding-bigint-in-n2words)
- [When BigInt is Required](#when-bigint-is-required)
- [When BigInt is Optional](#when-bigint-is-optional)
- [Architecture Patterns](#architecture-patterns)
- [Common Pitfalls](#common-pitfalls)
- [Testing BigInt Usage](#testing-bigint-usage)

---

## Quick Reference

### ✅ MUST use BigInt literals (n suffix)

1. **Scale word pair arrays** in `GreedyScaleLanguage` subclasses and other scale-based classes
2. **BigInt comparisons** (when comparing against `wholeNumber` or values known to be BigInt)
3. **BigInt arithmetic** (division, modulo, multiplication with BigInt operands)
4. **BigInt literals in conditionals** (when comparing BigInt values)

### ❌ DO NOT use BigInt literals

1. **Regular number comparisons** (e.g., array indices, string lengths, regular numbers)
2. **JavaScript numeric literals** in non-BigInt contexts (e.g., `Math.pow(10, 3)`)
3. **Object keys or array indices**

---

## Understanding BigInt in n2words

### Why BigInt?

JavaScript's `Number` type can only safely represent integers up to `2^53 - 1` (approximately 9 quadrillion). For numbers beyond this limit, precision is lost. BigInt provides arbitrary precision for integers, which is essential for correctly converting very large numbers to words.

### Type Coercion Rules

**CRITICAL:** JavaScript's BigInt **does not coerce** with regular `number` types:

```javascript
// ❌ These all throw TypeError: "Cannot mix BigInt and other types"
1n + 1; // Error
1n === 1; // false (different types!)
1n / 100; // Error
1n < 100; // Error

// ✅ Correct BigInt operations
1n + 1n; // 2n
1n === 1n; // true
1n / 100n; // 0n
1n < 100n; // true

// ✅ Explicit conversions work
Number(1n) === 1; // true
BigInt(100) === 100n; // true
```

```javascript
User Input (number | string | bigint)
    ↓
AbstractLanguage.convertToWords()
    ↓ converts to BigInt
Language.convertWholePart(wholeNumber: bigint)
    ↓ (GreedyScaleLanguage path)
decomposeToScales(value: bigint)
    ↓ uses scaleWordPairs array
mergeScales(leftPair, rightPair)
    ↓ compares BigInt values
Final string output
```

**Key insight:** Once `convertToWords()` normalizes input to `BigInt`, all downstream operations work with `BigInt` values.

---

## When BigInt is Required

### 1. Scale Word Pairs Arrays (GreedyScaleLanguage and related classes)

**WHY:** The `decomposeToScales()` method in `GreedyScaleLanguage` (and subclasses like `TurkicLanguage`) performs BigInt arithmetic (`rem / scaleWordPair[0]`, `rem % scaleWordPair[0]`). If `scaleWordPair[0]` is a regular number, this throws a TypeError.

```javascript
// ✅ CORRECT: All values use BigInt literals
class Example extends GreedyScaleLanguage {
  scaleWordPairs = [
    [1_000_000_000n, 'billion'],
    [1_000_000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [10n, 'ten'],
    [1n, 'one'],
    [0n, 'zero']
  ]
}

// ❌ WRONG: Regular numbers will cause runtime errors
class ExampleWrong extends GreedyScaleLanguage {
  scaleWordPairs = [
    [1_000_000_000, 'billion'],  // TypeError in decomposeToScales
    [1000, 'thousand'],
    [1, 'one']
  ]
}
```

**Files affected:**

- All `lib/languages/*.js` files that extend `GreedyScaleLanguage` or its subclasses (languages like: en, de, fr, es, pt, ko, zh, hu, it, nl, fr-BE)
- All `lib/languages/*.js` files that extend `TurkicLanguage` (languages: az, tr)

### 2. BigInt Comparisons in `mergeScales()` Methods

**WHY:** The `mergeScales()` method receives word-pair objects where values are BigInt (e.g., `{ 'one': 1n }`). Comparing these with number literals uses strict equality, which returns `false` for type mismatches.

**Pattern:**

```javascript
// ✅ CORRECT: Compare BigInt with BigInt
mergeScales(leftPair, rightPair) {
  const leftNumber = Object.values(leftPair)[0]   // BigInt
  const rightNumber = Object.values(rightPair)[0] // BigInt

  if (leftNumber === 1n && rightNumber < 100n) {
    return rightPair  // "one hundred" → "hundred"
  }

  if (leftNumber >= 100n && rightNumber < 100n) {
    return { [`${leftWord} and ${rightWord}`]: leftNumber + rightNumber }
  }

  // ... more comparisons
}

// ❌ WRONG: Mixed type comparisons fail
mergeScales(leftPair, rightPair) {
  const leftNumber = Object.values(leftPair)[0]  // BigInt (e.g., 1n)

  if (leftNumber === 1) {          // false! (1n !== 1)
    return rightPair
  }

  if (leftNumber >= 100) {         // TypeError: Cannot mix BigInt
    // ...
  }
}
```

**Files affected:**

- `lib/languages/en.js` (lines 89-110)
- `lib/languages/de.js` (lines 88-120)
- `lib/languages/dk.js` (lines 86-121)
- `lib/languages/fr.js` (lines 95-117)
- `lib/languages/pt.js` (lines 83-115)
- `lib/languages/nl.js` (lines 74-115)
- `lib/languages/es.js` (lines 76-107)
- `lib/languages/az.js` (lines 66-77)
- `lib/languages/tr.js` (lines 66-77)
- `lib/languages/zh.js` (lines 65-78)
- `lib/languages/ko.js` (lines 69-79)
- `lib/languages/no.js` (lines 81-90)

### 3. SlavicLanguage Implementations

**WHY:** The `convertWholePart()` method in `SlavicLanguage` uses BigInt arithmetic for chunk processing (`x % 10n`, `x % 100n`, `x / 10n`). All comparisons must use BigInt literals.

**Pattern:**

```javascript
// ✅ CORRECT: BigInt literals in conditionals and arithmetic
convertWholePart(number) {
  if (number === 0n) {
    return this.zeroWord
  }

  const chunks = this.splitByX(number.toString(), 3)
  for (const x of chunks) {
    if (x === 0n) continue

    const [n1, n2, n3] = this.getDigits(x)  // Returns BigInt values

    if (n3 > 0n) {
      words.push(this.hundreds[n3])
    }

    if (n2 === 1n) {
      words.push(this.tens[n1])
    }
  }

  return words.join(' ')
}

pluralize(number, forms) {
  const lastDigit = number % 10n
  const lastTwoDigits = number % 100n

  if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit === 1n) {
    return forms[0]  // singular
  }
  // ... more rules
}

// ❌ WRONG: Mixed types
convertWholePart(number) {
  if (number === 0) {        // false for 0n
    return this.zeroWord
  }

  if (n3 > 0) {              // TypeError
    words.push(this.hundreds[n3])
  }
}
```

**Files affected:**

- `lib/classes/slavic-language.js` (base class)
- `lib/languages/ru.js`, `cz.js`, `pl.js`, `uk.js`, `sr.js`, `hr.js`, `he.js`, `lt.js`, `lv.js` (Slavic languages)

### 4. Custom Algorithm Implementations

**WHY:** Languages with custom conversion logic (not using `GreedyScaleLanguage` or `SlavicLanguage`) often still process BigInt values passed from `convertToWords()`.

**Pattern:**

```javascript
// ✅ CORRECT: Handle BigInt in custom algorithms
convertWholePart(number) {
  if (number === 0n) {
    return this.zeroWord
  }

  let temp = number
  while (temp > 0n) {
    const chunk = Number(temp % 1000n)  // Explicit conversion
    // Process chunk as regular number
    temp = temp / 1000n
  }
}

// Vietnamese example: Mixed BigInt and number usage
convertMore1000(number) {
  let division = number / 1000n
  let power = 1
  while (division >= 1000n) {
    division = division / 1000n
    power = power + 1  // power is regular number (exponent)
  }
  const r = number - (division * BigInt(Math.pow(1000, power)))
  if (r > 0n) {
    if (r <= 99n) {
      words.push('lẻ')
    }
    words.push(this.convertWholePart(r))
  }
}
```

**Files affected:**

- `lib/languages/ar.js` (Arabic: custom group processing)
- `lib/languages/vi.js` (Vietnamese: thousand-power algorithm)
- `lib/languages/ro.js` (Romanian: custom chunk processing)
- `lib/languages/it.js` (Italian: exponent-based naming)
- `lib/languages/id.js` (Indonesian: string-based processing)

---

## When BigInt is Optional

### 1. Regular Number Operations

**When to use regular numbers:**

- Array indices: `chunks[0]`, `words.length`
- String operations: `value.indexOf('.')`, `str.length`
- Math operations: `Math.pow(10, 3)`, `Math.floor(n / 10)`
- Loop counters: `for (let i = 0; i < len; i++)`
- Object lookups: `this.ones[5]` (keys are always strings/numbers)

**Pattern:**

```javascript
// ✅ CORRECT: Regular numbers for array/string operations
const chunks = this.splitByX(number.toString(), 3); // 3 is a number
let chunkIndex = chunks.length; // chunkIndex is number

for (let i = 0; i < words.length; i++) {
  // i is number
  const word = words[i];
  // ...
}

const decimalPointIndex = value.indexOf('.'); // indexOf returns number
if (decimalPointIndex === -1) {
  // compare number to number
  // no decimal point
}
```

### 2. Explicit Type Conversions

**When converting between BigInt and Number:**

```javascript
// ✅ CORRECT: Explicit conversions for cross-type operations
const chunk = Number(temp % 1000n); // BigInt → Number
const bigValue = BigInt(Math.pow(1000, p)); // Number → BigInt

// Process small values as numbers after extraction
const n1 = Number(x % 10n); // Extract ones digit as number
const n2 = Number((x / 10n) % 10n); // Extract tens digit as number

// Use number for lookups
words.push(this.ones[n1]); // Object key is number (or coerced string)
```

```javascript
// ✅ CORRECT: Compare numbers when both operands are numbers
const unitsPart = number % 10; // Both are regular numbers
if (unitsPart === 0) {
  // ...
}

const firstDigit = parseInt(str[0]);
if (firstDigit === 1) {
  // Compare numbers
  // ...
}

// Compare strings
if (word === 'mille') {
  // ...
}

// Compare array lengths
if (chunks.length === 1) {
  // ...
}
```

## Architecture Patterns

### Pattern 1: GreedyScaleLanguage with Simple Merge

**Used by:** English (en), Spanish (es), German (de), French (fr), Italian (it), Portuguese (pt), Dutch (nl), Korean (ko), Hungarian (hu), Chinese (zh), French Belgian (fr-BE)

**BigInt locations:**

1. Scale word pairs array (class property)
2. All comparisons in `mergeScales()`

**Example:** `lib/languages/en.js`

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js';

class EN extends GreedyScaleLanguage {
  scaleWordPairs = [
    [1_000_000n, 'million'], // ✅ BigInt literals
    [1000n, 'thousand'],
    [100n, 'hundred'],
    // ... more scale word pairs
  ];

  mergeScales(leftPair, rightPair) {
    const leftNumber = Object.values(leftPair)[0];
    const rightNumber = Object.values(rightPair)[0];

    // ✅ All comparisons use BigInt literals
    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair;
    }
    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} and ${rightWord}`]: leftNumber + rightNumber };
    }
    // ... more rules
  }
}
```

### Pattern 2: SlavicLanguage with Pluralization

**Used by:** Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian

**BigInt locations:**

1. All conditionals in `convertWholePart()`
2. All conditionals in `pluralize()`
3. Arithmetic operations (modulo, division)

**Example:** `lib/languages/ru.js` (simplified)

```javascript
class RU extends SlavicLanguage {
  convertWholePart(number) {
    if (number === 0n) {
      // ✅ BigInt comparison
      return this.zero;
    }

    const chunks = this.splitByX(number.toString(), 3);
    for (const x of chunks) {
      if (x === 0n) continue; // ✅ BigInt comparison

      const [n1, n2, n3] = this.getDigits(x); // Returns BigInt

      if (n3 > 0n) {
        // ✅ BigInt comparison
        words.push(this.hundreds[n3]);
      }

      if (n2 === 1n) {
        // ✅ BigInt comparison
        words.push(this.tens[n1]);
      }
    }
  }

  pluralize(number, forms) {
    const lastDigit = number % 10n; // ✅ BigInt arithmetic
    const lastTwoDigits = number % 100n;

    if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit === 1n) {
      return forms[0];
    }
    // ... more rules
  }
}
```

### Pattern 3: GreedyScaleLanguage with "og" Conjunction (inline)

**Used by:** Norwegian (no), Danish (dk)

**BigInt locations:**

- Inherits scaleWordPairs-based approach from `GreedyScaleLanguage`
- All comparisons in `mergeScales()` use BigInt literals
- Special handling for "og" (and) conjunction with BigInt comparisons

**Example:** `lib/languages/no.js`

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js';

class Norwegian extends GreedyScaleLanguage {
  scaleWordPairs = [
    [1_000_000_000n, 'milliard'],
    [1_000_000n, 'million'],
    [1000n, 'tusen'],
    [100n, 'hundre'],
    // ... more scale word pairs with BigInt literals
  ];

  mergeScales(leftPair, rightPair) {
    const leftNumber = Object.values(leftPair)[0];
    const rightNumber = Object.values(rightPair)[0];

    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair;
    }
    // ... more merge rules
  }
}
```

### Pattern 4: TurkicLanguage with Space-Separated Patterns

**Used by:** Turkish (tr), Azerbaijani (az)

**BigInt locations:**

- Inherits scaleWordPairs-based approach from `GreedyScaleLanguage`
- All comparisons in `mergeScales()` use BigInt literals
- Space-separated number combinations with BigInt arithmetic

**Example:** `lib/languages/tr.js`

```javascript
import TurkicLanguage from '../classes/turkic-language.js';

class TR extends TurkicLanguage {
  scaleWordPairs = [
    [1_000_000_000n, 'milyar'],
    [1_000_000n, 'milyon'],
    [1000n, 'bin'],
    [100n, 'yüz'],
    // ... more scale word pairs with BigInt literals
  ];

  mergeScales(leftPair, rightPair) {
    const leftNumber = Object.values(leftPair)[0];
    const rightNumber = Object.values(rightPair)[0];

    // ✅ All comparisons use BigInt literals
    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair;
    }
    // ... more merge rules
  }
}
```

### Pattern 5: Custom Algorithm (AbstractLanguage only)

**Used by:** Arabic (ar), Vietnamese (vi), Romanian (ro), Indonesian (id)

**BigInt locations:**

- Varies by implementation
- Often uses explicit conversions (`Number()`, `BigInt()`)
- May process chunks as regular numbers after extraction

**Example:** `lib/languages/ar.js` (simplified)

```javascript
class AR extends AbstractLanguage {
  convertWholePart(number) {
    if (number === 0n) {
      // ✅ BigInt comparison
      return this.zero;
    }

    let temp = number;
    while (temp > 0n) {
      // ✅ BigInt comparison
      const chunk = Number(temp % 1000n); // ✅ Explicit conversion

      // Process chunk as regular number
      const ones = chunk % 10;
      const tens = Math.floor(chunk / 10) % 10;
      const hundreds = Math.floor(chunk / 100);

      // Use regular number comparisons
      if (tens === 0 && hundreds === 2) {
        // ...
      }

      temp = temp / 1000n; // ✅ BigInt division
    }
  }
}
```

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting `n` Suffix in Scale Word Pairs

```javascript
// ❌ WRONG
super(options, [
  [1000, 'thousand'], // Will throw TypeError in decomposeToScales
  [100, 'hundred'],
]);

// ✅ CORRECT
super(options, [
  [1000n, 'thousand'],
  [100n, 'hundred'],
]);
```

**Error message:**

```javascript
TypeError: Cannot mix BigInt and other types, use explicit conversions
  at decomposeToScales (file:///lib/classes/greedy-scale-language.js:87:46)
```

### ❌ Pitfall 2: Mixed Type Comparisons

```javascript
// ❌ WRONG
const leftNumber = Object.values(leftPair)[0]; // BigInt
if (leftNumber === 1) {
  // Always false!
  return rightPair;
}

// ✅ CORRECT
if (leftNumber === 1n) {
  return rightPair;
}
```

**Silent bug:** The condition never matches, producing incorrect output like "one hundred" instead of "hundred".

```javascript
// ❌ WRONG
const chunkIndex = chunks.length;
if (chunkIndex === 0n) {
  // chunkIndex is number, comparing to BigInt
  // ...
}

// ✅ CORRECT
if (chunkIndex === 0) {
  // ...
}
```

**Error message:**

```javascript
TypeError: Cannot mix BigInt and other types
```

### ❌ Pitfall 4: Arithmetic with Mixed Types

```javascript
// ❌ WRONG
const power = 3;
const divisor = BigInt(Math.pow(1000, power));
const result = number / 1000; // number is BigInt, 1000 is not

// ✅ CORRECT
const result = number / 1000n;
```

### ❌ Pitfall 5: Incorrect Modulo Precedence

```javascript
// ❌ WRONG (operator precedence issue)
const lastDigit = number % 10n && lastDigit === 1n;
// Evaluates as: (number % 10n) && (lastDigit === 1n)
// lastDigit is undefined!

// ✅ CORRECT
const lastDigit = number % 10n;
if (lastDigit === 1n) {
  // ...
}
```

---

## Testing BigInt Usage

### Unit Tests

**Test large numbers beyond `Number.MAX_SAFE_INTEGER`:**

```javascript
import n2words from '../lib/n2words.js';

// Test large numbers
assert.strictEqual(
  n2words(9_007_199_254_740_992n), // 2^53 (beyond safe integer)
  'nine quadrillion seven trillion one hundred ninety-nine billion two hundred fifty-four million seven hundred forty thousand nine hundred ninety-two',
);

// Test very large numbers
assert.strictEqual(
  n2words('1000000000000000000000000000'), // 1 octillion
  'one octillion',
);
```

```javascript
// test/typescript/typescript-integration.ts
const languages = ['en', 'de', 'fr', 'es', 'pt', 'ru' /* ... */];

for (const lang of languages) {
  it(`${lang} converts large numbers`, () => {
    const result = n2words(1_000_000_000_000n, { lang });
    assert(typeof result === 'string');
    assert(result.length > 0);
  });
}
```

```javascript
// Test zero
assert.strictEqual(n2words(0n, { lang: 'en' }), 'zero');

// Test BigInt input types
assert.strictEqual(n2words(42n), n2words('42'));
assert.strictEqual(n2words(42n), n2words(42));

// Test negative BigInt
assert.strictEqual(n2words(-1000n, { lang: 'en' }), 'minus one thousand');

// Test decimal with large whole part
assert.strictEqual(
  n2words('1000000000000.5', { lang: 'en' }),
  'one trillion point five',
);
```

---

## Checklist for Language Implementers

When creating a new language implementation, verify BigInt usage:

### For GreedyScaleLanguage and Subclasses (including TurkicLanguage)

- [ ] All values in `scaleWordPairs` array use `n` suffix (BigInt literals)
- [ ] All comparisons in `mergeScales()` use `n` suffix when comparing against scaleWordPairs values
- [ ] Arithmetic operations in `mergeScales()` (if any) use BigInt types consistently
- [ ] Regular numbers used for indices, lengths, and Math operations

### For SlavicLanguage Subclasses

- [ ] All conditionals in `convertWholePart()` comparing whole numbers use `n` suffix
- [ ] All conditionals in `pluralize()` use `n` suffix
- [ ] Modulo operations use `n` suffix: `number % 10n`, `number % 100n`
- [ ] Division operations use `n` suffix: `number / 10n`
- [ ] Object lookups convert BigInt to Number when needed: `this.ones[Number(n1)]`

### For Custom AbstractLanguage Implementations

- [ ] Entry point checks (`number === 0n`) use `n` suffix
- [ ] Loop conditions on BigInt values use `n` suffix
- [ ] Explicit conversions documented: `Number()` when extracting, `BigInt()` when constructing
- [ ] Mixed operations use proper type conversions
- [ ] Regular number operations (indices, lengths) do NOT use `n` suffix

### Testing

- [ ] Test with values > 2^53 (e.g., `9_007_199_254_740_992n`)
- [ ] Test with BigInt literals: `n2words(1000n)`
- [ ] Test with string input: `n2words('1000000000000')`
- [ ] Test edge cases: zero, negative, decimals with large whole parts
- [ ] Verify no TypeErrors in test output

---

## Summary

### Golden Rules

1. **Scale word pairs arrays** Always use `n` suffix for numeric values
2. **Comparisons** Use `n` suffix when comparing BigInt values
3. **Arithmetic** Match operand types (BigInt with BigInt, number with number)
4. **Conversions** Be explicit with `Number()` and `BigInt()` when crossing type boundaries
5. **Non-BigInt contexts** Array indices, string lengths, object keys → NO `n` suffix

### Quick Decision Tree

```javascript
Is the value used in BigInt arithmetic (/, %, *)?
├─ YES → Use BigInt literal (n suffix)
└─ NO → Is it compared to a BigInt value?
    ├─ YES → Use BigInt literal (n suffix)
    └─ NO → Is it a scaleWordPairs value?
        ├─ YES → Use BigInt literal (n suffix)
        └─ NO → Use regular number (NO n suffix)
```

### Related Documentation

- [LANGUAGE_GUIDE.md](../LANGUAGE_GUIDE.md) - Comprehensive guide for adding new languages
- [lib/classes/abstract-language.js](../lib/classes/abstract-language.js) - Input validation and decimal handling
- [lib/classes/greedy-scale-language.js](../lib/classes/greedy-scale-language.js) - Scale-based algorithm
- [lib/classes/turkic-language.js](../lib/classes/turkic-language.js) - Turkic space-separated patterns
- [lib/classes/slavic-language.js](../lib/classes/slavic-language.js) - Slavic/Baltic pluralization

---

**Questions or issues?** Please open an issue on GitHub or refer to existing language implementations as reference examples.
