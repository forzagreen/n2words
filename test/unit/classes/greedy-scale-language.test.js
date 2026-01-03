import test from 'ava'
import { GreedyScaleLanguage } from '../../../lib/classes/greedy-scale-language.js'

/**
 * Unit Tests for GreedyScaleLanguage
 *
 * Tests the greedy scale algorithm that decomposes integers into word-sets
 * by matching the largest scale word first, then recursively processing remainders.
 *
 * GreedyScaleLanguage handles:
 * - Scale word lookup (wordForScale)
 * - Greedy decomposition (decomposeInteger)
 * - Word-set reduction (reduceWordSets)
 * - Final string formatting (finalizeWords)
 *
 * Subclasses must implement:
 * - scaleWords: Array of [bigint, string] tuples in descending order
 * - combineWordSets: How to merge adjacent word-sets per language grammar
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Minimal fixture for basic algorithm tests.
 * Uses addition for combining (preceding + following).
 */
class MinimalLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  scaleWords = [
    [100n, 'hundred'],
    [20n, 'twenty'],
    [10n, 'ten'],
    [5n, 'five'],
    [3n, 'three'],
    [2n, 'two'],
    [1n, 'one'],
    [0n, 'zero']
  ]

  combineWordSets (preceding, following) {
    const pWord = Object.keys(preceding)[0]
    const pVal = Object.values(preceding)[0]
    const fWord = Object.keys(following)[0]
    const fVal = Object.values(following)[0]

    // Multiply if following > preceding, otherwise add
    const result = fVal > pVal ? pVal * fVal : pVal + fVal
    return { [`${pWord} ${fWord}`]: result }
  }
}

/**
 * Extended fixture with larger scale words for testing thousands/millions.
 */
class ExtendedLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  scaleWords = [
    [1000000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    [80n, 'eighty'],
    [20n, 'twenty'],
    [10n, 'ten'],
    [9n, 'nine'],
    [5n, 'five'],
    [3n, 'three'],
    [2n, 'two'],
    [1n, 'one'],
    [0n, 'zero']
  ]

  combineWordSets (preceding, following) {
    const pWord = Object.keys(preceding)[0]
    const pVal = Object.values(preceding)[0]
    const fWord = Object.keys(following)[0]
    const fVal = Object.values(following)[0]

    const result = fVal > pVal ? pVal * fVal : pVal + fVal
    return { [`${pWord} ${fWord}`]: result }
  }
}

// ============================================================================
// Abstract Method Enforcement
// ============================================================================

test('combineWordSets throws if not implemented', t => {
  class IncompleteLanguage extends GreedyScaleLanguage {
    scaleWords = [[1n, 'one']]
  }
  const lang = new IncompleteLanguage()
  const error = t.throws(() => lang.combineWordSets({}, {}))
  t.is(error.message, 'combineWordSets() must be implemented by subclass')
})

// ============================================================================
// wordForScale()
// ============================================================================

test('wordForScale returns word for exact match', t => {
  const lang = new MinimalLanguage()
  t.is(lang.wordForScale(100n), 'hundred')
  t.is(lang.wordForScale(20n), 'twenty')
  t.is(lang.wordForScale(1n), 'one')
  t.is(lang.wordForScale(0n), 'zero')
})

test('wordForScale returns undefined for non-matching value', t => {
  const lang = new MinimalLanguage()
  t.is(lang.wordForScale(50n), undefined)
  t.is(lang.wordForScale(999n), undefined)
})

// ============================================================================
// decomposeInteger()
// ============================================================================

test('decomposeInteger returns array of word-sets', t => {
  const lang = new MinimalLanguage()
  const result = lang.decomposeInteger(5n)
  t.true(Array.isArray(result))
  t.deepEqual(result, [{ one: 1n }, { five: 5n }])
})

test('decomposeInteger handles exact scale match', t => {
  const lang = new MinimalLanguage()
  // 100 = 1 × hundred
  t.deepEqual(lang.decomposeInteger(100n), [{ one: 1n }, { hundred: 100n }])
  // 20 = 1 × twenty
  t.deepEqual(lang.decomposeInteger(20n), [{ one: 1n }, { twenty: 20n }])
})

test('decomposeInteger handles compound with remainder', t => {
  const lang = new MinimalLanguage()
  // 23 = 1×twenty + 3 = 1×twenty + 1×three
  const result = lang.decomposeInteger(23n)
  t.true(Array.isArray(result))
  // Should have: [one, twenty], [one, three] structure
  t.is(result.length, 4) // [one, twenty, one, three]
})

test('decomposeInteger recurses for multipliers > 1', t => {
  const lang = new MinimalLanguage()
  // 200 = 2 × hundred → decompose(2) then hundred
  const result = lang.decomposeInteger(200n)
  // First element should be nested array (decomposed 2)
  t.true(Array.isArray(result[0]))
})

test('decomposeInteger handles zero', t => {
  const lang = new MinimalLanguage()
  // Zero matches [0n, 'zero'] scale word
  const result = lang.decomposeInteger(0n)
  t.deepEqual(result, [{ one: 1n }, { zero: 0n }])
})

// ============================================================================
// reduceWordSets()
// ============================================================================

test('reduceWordSets returns single word-set unchanged', t => {
  const lang = new MinimalLanguage()
  const result = lang.reduceWordSets([{ five: 5n }])
  t.deepEqual(result, { five: 5n })
})

test('reduceWordSets combines two word-sets', t => {
  const lang = new MinimalLanguage()
  const result = lang.reduceWordSets([{ twenty: 20n }, { three: 3n }])
  t.deepEqual(result, { 'twenty three': 23n })
})

test('reduceWordSets handles nested arrays', t => {
  const lang = new MinimalLanguage()
  // [[two]] should be flattened to {two: 2n}
  const result = lang.reduceWordSets([[{ two: 2n }], { hundred: 100n }])
  t.deepEqual(result, { 'two hundred': 200n })
})

test('reduceWordSets handles deeply nested structure', t => {
  const lang = new MinimalLanguage()
  // Simulate: [[five], hundred], [twenty, three]
  const result = lang.reduceWordSets([
    [{ one: 1n }, { five: 5n }, { hundred: 100n }],
    { twenty: 20n }
  ])
  t.is(typeof result, 'object')
  t.is(Object.keys(result).length, 1)
})

// ============================================================================
// combineWordSets() Contract
// ============================================================================

test('combineWordSets receives word-set objects', t => {
  const captured = []
  class SpyLanguage extends MinimalLanguage {
    combineWordSets (preceding, following) {
      captured.push({ preceding, following })
      return super.combineWordSets(preceding, following)
    }
  }

  const lang = new SpyLanguage()
  lang.integerToWords(23n) // twenty + three

  t.true(captured.length > 0)
  for (const call of captured) {
    t.is(typeof call.preceding, 'object')
    t.is(typeof call.following, 'object')
    t.is(Object.keys(call.preceding).length, 1)
    t.is(Object.keys(call.following).length, 1)
  }
})

test('combineWordSets result replaces both inputs', t => {
  const lang = new MinimalLanguage()
  // Start with 3 word-sets, combine first two
  const before = [{ one: 1n }, { hundred: 100n }, { twenty: 20n }]
  const after = lang.reduceWordSets(before)

  // Should end up with single combined result
  t.is(Object.keys(after).length, 1)
  const value = Object.values(after)[0]
  t.is(value, 120n) // 1*100 + 20
})

// ============================================================================
// integerToWords()
// ============================================================================

test('integerToWords returns zeroWord for 0', t => {
  const lang = new MinimalLanguage()
  t.is(lang.integerToWords(0n), 'zero')
})

test('integerToWords handles single digits', t => {
  const lang = new MinimalLanguage()
  const result = lang.integerToWords(5n)
  t.is(typeof result, 'string')
  t.true(result.includes('five'))
})

test('integerToWords handles compound numbers', t => {
  const lang = new MinimalLanguage()
  const result = lang.integerToWords(23n)
  t.true(result.includes('twenty'))
  t.true(result.includes('three'))
})

test('integerToWords handles hundreds', t => {
  const lang = new MinimalLanguage()
  const result = lang.integerToWords(100n)
  t.true(result.includes('hundred'))
})

test('integerToWords handles hundreds with remainder', t => {
  const lang = new MinimalLanguage()
  const result = lang.integerToWords(123n)
  t.true(result.includes('hundred'))
  t.true(result.includes('twenty'))
  t.true(result.includes('three'))
})

test('integerToWords handles thousands', t => {
  const lang = new ExtendedLanguage()
  const result = lang.integerToWords(1000n)
  t.true(result.includes('thousand'))
})

test('integerToWords handles millions', t => {
  const lang = new ExtendedLanguage()
  const result = lang.integerToWords(1000000n)
  t.true(result.includes('million'))
})

test('integerToWords handles complex numbers', t => {
  const lang = new ExtendedLanguage()
  // 1,234 = one thousand two hundred thirty-four
  const result = lang.integerToWords(1234n)
  t.true(result.includes('thousand'))
  t.true(result.includes('hundred'))
})

// ============================================================================
// finalizeWords()
// ============================================================================

test('finalizeWords trims trailing whitespace', t => {
  const lang = new MinimalLanguage()
  t.is(lang.finalizeWords('test  '), 'test')
  t.is(lang.finalizeWords('test'), 'test')
})

test('finalizeWords preserves leading whitespace', t => {
  const lang = new MinimalLanguage()
  t.is(lang.finalizeWords('  test  '), '  test')
})

test('finalizeWords can be overridden', t => {
  class UppercaseLanguage extends MinimalLanguage {
    finalizeWords (output) {
      return output.toUpperCase().trim()
    }
  }
  const lang = new UppercaseLanguage()
  const result = lang.integerToWords(5n)
  t.is(result, result.toUpperCase())
})

// ============================================================================
// Inheritance
// ============================================================================

test('inherits AbstractLanguage properties', t => {
  const lang = new MinimalLanguage()
  t.is(lang.negativeWord, 'minus')
  t.is(lang.decimalSeparatorWord, 'point')
  t.is(lang.zeroWord, 'zero')
  t.is(lang.wordSeparator, ' ')
})

test('inherits toWords from AbstractLanguage', t => {
  const lang = new MinimalLanguage()
  // toWords handles negative and decimals
  t.is(typeof lang.toWords, 'function')
  const result = lang.toWords(true, 5n)
  t.true(result.includes('minus'))
})
