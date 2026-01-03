import test from 'ava'
import { TurkicLanguage } from '../../../lib/classes/turkic-language.js'

/**
 * Unit Tests for TurkicLanguage
 *
 * Tests the Turkic number construction algorithm:
 * - Implicit 'bir' (one) omitted before hundreds and thousands
 * - Multiplication when crossing magnitude boundaries
 * - Addition for same-magnitude combinations
 * - Space-separated word combinations
 *
 * TurkicLanguage extends GreedyScaleLanguage and provides a default
 * combineWordSets() implementation with Turkic grammar rules.
 *
 * Note: Scale word ordering is tested in integration tests for real implementations.
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Minimal fixture with Turkish-style scale words.
 * Only includes values needed for testing the algorithm.
 */
class TestTurkicLanguage extends TurkicLanguage {
  negativeWord = 'eksi'
  decimalSeparatorWord = 'nokta'
  zeroWord = 'sıfır'

  scaleWords = [
    [1000n, 'bin'],
    [100n, 'yüz'],
    [50n, 'elli'],
    [20n, 'yirmi'],
    [15n, 'on beş'],
    [11n, 'on bir'],
    [10n, 'on'],
    [5n, 'beş'],
    [3n, 'üç'],
    [2n, 'iki'],
    [1n, 'bir'],
    [0n, 'sıfır']
  ]
}

// ============================================================================
// combineWordSets()
// ============================================================================

test('combineWordSets omits implicit "bir" before 100', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.combineWordSets({ bir: 1n }, { yüz: 100n })
  t.deepEqual(result, { yüz: 100n })
})

test('combineWordSets omits implicit "bir" before 1000', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.combineWordSets({ bir: 1n }, { bin: 1000n })
  t.deepEqual(result, { bin: 1000n })
})

test('combineWordSets omits implicit "bir" for values <= 100', t => {
  const lang = new TestTurkicLanguage()
  // bir + on (10) -> on (since 10 <= 100)
  const result10 = lang.combineWordSets({ bir: 1n }, { on: 10n })
  t.deepEqual(result10, { on: 10n })

  // bir + elli (50) -> elli (since 50 <= 100)
  const result50 = lang.combineWordSets({ bir: 1n }, { elli: 50n })
  t.deepEqual(result50, { elli: 50n })
})

test('combineWordSets multiplies when following > preceding', t => {
  const lang = new TestTurkicLanguage()
  // 5 × 100 = 500
  const result = lang.combineWordSets({ beş: 5n }, { yüz: 100n })
  t.deepEqual(result, { 'beş yüz': 500n })

  // 2 × 1000 = 2000
  const result2 = lang.combineWordSets({ iki: 2n }, { bin: 1000n })
  t.deepEqual(result2, { 'iki bin': 2000n })
})

test('combineWordSets adds when following <= preceding', t => {
  const lang = new TestTurkicLanguage()
  // 20 + 3 = 23
  const result = lang.combineWordSets({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi üç': 23n })

  // 50 + 5 = 55
  const result2 = lang.combineWordSets({ elli: 50n }, { beş: 5n })
  t.deepEqual(result2, { 'elli beş': 55n })
})

test('combineWordSets uses wordSeparator for combining', t => {
  class CustomSeparatorLanguage extends TestTurkicLanguage {
    wordSeparator = '-'
  }
  const lang = new CustomSeparatorLanguage()
  const result = lang.combineWordSets({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi-üç': 23n })
})

test('combineWordSets adds equal values (not multiply)', t => {
  const lang = new TestTurkicLanguage()
  // 10 + 10 = 20 (following not > preceding, so adds)
  const result = lang.combineWordSets({ on: 10n }, { on: 10n })
  t.is(Object.values(result)[0], 20n)

  // 5 + 5 = 10
  const result2 = lang.combineWordSets({ beş: 5n }, { beş: 5n })
  t.is(Object.values(result2)[0], 10n)
})

// ============================================================================
// Implicit "bir" Integration (combineWordSets + inherited algorithm)
// ============================================================================

test('implicit bir omitted for 100 in full conversion', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(100n), 'yüz')
})

test('implicit bir omitted for 1000 in full conversion', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1000n), 'bin')
})

test('multiplier kept for multiples of 100 and 1000', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(200n), 'iki yüz')
  t.is(lang.integerToWords(2000n), 'iki bin')
})

// ============================================================================
// Inheritance
// ============================================================================

test('inherits GreedyScaleLanguage methods', t => {
  const lang = new TestTurkicLanguage()
  t.is(typeof lang.decomposeInteger, 'function')
  t.is(typeof lang.reduceWordSets, 'function')
  t.is(typeof lang.wordForScale, 'function')
})

test('inherits AbstractLanguage properties', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.negativeWord, 'eksi')
  t.is(lang.decimalSeparatorWord, 'nokta')
  t.is(lang.zeroWord, 'sıfır')
  t.is(lang.wordSeparator, ' ')
})

test('inherits toWords from AbstractLanguage', t => {
  const lang = new TestTurkicLanguage()
  t.is(typeof lang.toWords, 'function')

  // Handles negatives
  const negative = lang.toWords(true, 5n)
  t.true(negative.includes('eksi'))

  // Handles decimals
  const decimal = lang.toWords(false, 3n, '15')
  t.true(decimal.includes('nokta'))
})
