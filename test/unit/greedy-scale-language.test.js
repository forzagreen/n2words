import test from 'ava'
import { GreedyScaleLanguage } from '../../lib/classes/greedy-scale-language.js'

/**
 * Unit Tests for GreedyScaleLanguage
 *
 * Tests the greedy scale algorithm including:
 * - Scale word pair matching and retrieval
 * - Number decomposition into scale word-sets
 * - Word-set merging logic
 * - Abstract method enforcement
 * - Integration with AbstractLanguage
 */

// ============================================================================
// Test Implementation
// ============================================================================

// Concrete test implementation with simple merge rules
class TestGreedyLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  scaleWords = [
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    [80n, 'eighty'],
    [70n, 'seventy'],
    [60n, 'sixty'],
    [50n, 'fifty'],
    [40n, 'forty'],
    [30n, 'thirty'],
    [20n, 'twenty'],
    [19n, 'nineteen'],
    [18n, 'eighteen'],
    [17n, 'seventeen'],
    [16n, 'sixteen'],
    [15n, 'fifteen'],
    [14n, 'fourteen'],
    [13n, 'thirteen'],
    [12n, 'twelve'],
    [11n, 'eleven'],
    [10n, 'ten'],
    [9n, 'nine'],
    [8n, 'eight'],
    [7n, 'seven'],
    [6n, 'six'],
    [5n, 'five'],
    [4n, 'four'],
    [3n, 'three'],
    [2n, 'two'],
    [1n, 'one'],
    [0n, 'zero']
  ]

  // Simple merge: just concatenate with space
  combineWordSets (preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const followingValue = Object.values(following)[0]

    const mergedNumber = followingValue > precedingValue
      ? precedingValue * followingValue
      : precedingValue + followingValue

    return { [`${precedingWord} ${followingWord}`]: mergedNumber }
  }
}

// ============================================================================
// Abstract Method Tests
// ============================================================================

test('abstract class throws error if combineWordSets not implemented', t => {
  class IncompleteLang extends GreedyScaleLanguage {
    scaleWords = [[1n, 'one']]
  }
  const lang = new IncompleteLang()
  t.throws(() => lang.combineWordSets({}, {}), {
    message: 'combineWordSets() must be implemented by subclass'
  })
})

// ============================================================================
// Scale Word Retrieval Tests
// ============================================================================

test('wordForScale returns correct word for exact match', t => {
  const lang = new TestGreedyLanguage()
  t.is(lang.wordForScale(1000n), 'thousand')
  t.is(lang.wordForScale(100n), 'hundred')
  t.is(lang.wordForScale(1n), 'one')
  t.is(lang.wordForScale(0n), 'zero')
})

test('wordForScale returns undefined for non-matching value', t => {
  const lang = new TestGreedyLanguage()
  t.is(lang.wordForScale(999n), undefined)
  t.is(lang.wordForScale(5000n), undefined)
})

test('scaleWords should be ordered descending for correct algorithm', t => {
  const lang = new TestGreedyLanguage()
  // Verify that scale words are in descending order
  for (let i = 0; i < lang.scaleWords.length - 1; i++) {
    const current = lang.scaleWords[i][0]
    const next = lang.scaleWords[i + 1][0]
    t.true(current > next, 'Scale words should be in descending order')
  }
})

// ============================================================================
// Decomposition Tests
// ============================================================================

test('decomposeInteger produces an array of word-sets', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(5n)
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('decomposeInteger handles exact scale word', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(100n)
  // 100 = 1 * hundred
  t.deepEqual(result, [{ one: 1n }, { hundred: 100n }])
})

test('decomposeInteger handles compound numbers', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(23n)
  // Result structure may be nested
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('decomposeInteger handles hundreds with remainder', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(123n)
  // Should decompose to: one * hundred + remainder
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('decomposeInteger handles thousands', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(1000n)
  t.deepEqual(result, [{ one: 1n }, { thousand: 1000n }])
})

test('decomposeInteger handles multi-thousand numbers', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.decomposeInteger(5000n)
  // Should have nested array for '5' times 'thousand'
  t.true(Array.isArray(result))
  t.true(result.length >= 2)
})

test('decomposeInteger and reduceWordSets work together', t => {
  const lang = new TestGreedyLanguage()
  const decomposed = lang.decomposeInteger(23n)
  const merged = lang.reduceWordSets(decomposed)

  t.is(typeof merged, 'object')
  t.is(Object.keys(merged).length, 1)
  const resultWord = Object.keys(merged)[0]
  t.is(typeof resultWord, 'string')
})

// ============================================================================
// Merge Tests
// ============================================================================

test('reduceWordSets handles single word-set', t => {
  const lang = new TestGreedyLanguage()
  const input = [{ five: 5n }]
  const result = lang.reduceWordSets(input)
  t.deepEqual(result, { five: 5n })
})

test('reduceWordSets handles two word-sets', t => {
  const lang = new TestGreedyLanguage()
  const input = [{ twenty: 20n }, { three: 3n }]
  const result = lang.reduceWordSets(input)
  t.deepEqual(result, { 'twenty three': 23n })
})

test('reduceWordSets handles nested arrays', t => {
  const lang = new TestGreedyLanguage()
  const input = [[{ two: 2n }], { hundred: 100n }]
  const result = lang.reduceWordSets(input)
  t.is(typeof result, 'object')
  t.is(Object.keys(result).length, 1)
})

test('reduceWordSets handles complex nested structure', t => {
  const lang = new TestGreedyLanguage()
  const input = [[{ five: 5n }, { hundred: 100n }], { twenty: 20n }]
  const result = lang.reduceWordSets(input)
  t.is(typeof result, 'object')
  t.is(Object.keys(result).length, 1)
})

test('combineWordSets receives correct word-set format', t => {
  let capturedPreceding, capturedFollowing
  class SpyLang extends TestGreedyLanguage {
    combineWordSets (preceding, following) {
      capturedPreceding = preceding
      capturedFollowing = following
      return super.combineWordSets(preceding, following)
    }
  }
  const lang = new SpyLang()
  lang.integerToWords(23n) // twenty + three

  // Verify word-sets have correct format
  t.is(typeof capturedPreceding, 'object')
  t.is(typeof capturedFollowing, 'object')
  t.is(Object.keys(capturedPreceding).length, 1)
  t.is(Object.keys(capturedFollowing).length, 1)
})

// ============================================================================
// Integer Part Conversion Tests
// ============================================================================

test('integerToWords returns a string', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.integerToWords(0n)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('integerToWords handles single digits', t => {
  const lang = new TestGreedyLanguage()
  const result1 = lang.integerToWords(1n)
  const result5 = lang.integerToWords(5n)
  const result9 = lang.integerToWords(9n)

  t.is(typeof result1, 'string')
  t.is(typeof result5, 'string')
  t.is(typeof result9, 'string')
  t.true(result1.length > 0)
  t.true(result5.length > 0)
  t.true(result9.length > 0)
})

test('integerToWords handles compound numbers under 100', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.integerToWords(23n)
  t.true(result.includes('twenty'))
  t.true(result.includes('three'))
})

test('integerToWords handles hundreds', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.integerToWords(100n)
  t.true(result.includes('hundred'))
})

test('integerToWords handles thousands', t => {
  const lang = new TestGreedyLanguage()
  const result = lang.integerToWords(1000n)
  t.true(result.includes('thousand'))
})

test('handles very large numbers', t => {
  class LargeNumberLang extends TestGreedyLanguage {
    scaleWords = [
      [1000000n, 'million'],
      [1000n, 'thousand'],
      [100n, 'hundred'],
      [10n, 'ten'],
      [1n, 'one'],
      [0n, 'zero']
    ]
  }
  const lang = new LargeNumberLang()
  const result = lang.integerToWords(1000000n)
  t.true(result.includes('million'))
})

// ============================================================================
// Finalization Tests
// ============================================================================

test('finalizeWords trims trailing whitespace', t => {
  const lang = new TestGreedyLanguage()
  t.is(lang.finalizeWords('test  '), 'test')
  t.is(lang.finalizeWords('test'), 'test')
  t.is(lang.finalizeWords('  test  '), '  test')
})

test('finalizeWords can be overridden by subclasses', t => {
  class CustomFinalizeLang extends TestGreedyLanguage {
    finalizeWords (output) {
      return output.toUpperCase()
    }
  }
  const lang = new CustomFinalizeLang()
  const result = lang.integerToWords(5n)
  // Result should be uppercase
  t.is(result, result.toUpperCase())
})
