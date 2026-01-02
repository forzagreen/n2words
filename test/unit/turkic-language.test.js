import test from 'ava'
import { TurkicLanguage } from '../../lib/classes/turkic-language.js'

/**
 * Unit Tests for TurkicLanguage
 *
 * Tests Turkic language patterns including:
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Space-separated number combinations
 * - Multiplication/addition logic in combineWordSets
 * - Integration with GreedyScaleLanguage
 */

// ============================================================================
// Test Implementation
// ============================================================================

// Concrete test implementation
class TestTurkicLanguage extends TurkicLanguage {
  negativeWord = 'eksi'
  decimalSeparatorWord = 'nokta'
  zeroWord = 'sıfır'
  wordSeparator = ' '

  scaleWords = [
    [1000n, 'bin'],
    [100n, 'yüz'],
    [90n, 'doksan'],
    [80n, 'seksen'],
    [70n, 'yetmiş'],
    [60n, 'altmış'],
    [50n, 'elli'],
    [40n, 'kırk'],
    [30n, 'otuz'],
    [20n, 'yirmi'],
    [19n, 'on dokuz'],
    [18n, 'on sekiz'],
    [17n, 'on yedi'],
    [16n, 'on altı'],
    [15n, 'on beş'],
    [14n, 'on dört'],
    [13n, 'on üç'],
    [12n, 'on iki'],
    [11n, 'on bir'],
    [10n, 'on'],
    [9n, 'dokuz'],
    [8n, 'sekiz'],
    [7n, 'yedi'],
    [6n, 'altı'],
    [5n, 'beş'],
    [4n, 'dört'],
    [3n, 'üç'],
    [2n, 'iki'],
    [1n, 'bir'],
    [0n, 'sıfır']
  ]
}

// ============================================================================
// Merge Logic Tests
// ============================================================================

test('combineWordSets omits implicit "bir" before yüz (100)', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.combineWordSets({ bir: 1n }, { yüz: 100n })
  t.deepEqual(result, { yüz: 100n })
})

test('combineWordSets omits implicit "bir" before bin (1000)', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.combineWordSets({ bir: 1n }, { bin: 1000n })
  t.deepEqual(result, { bin: 1000n })
})

test('combineWordSets omits "bir" for magnitudes <= 100', t => {
  const lang = new TestTurkicLanguage()
  // The rule is: omit "bir" when right <= 100 OR right === 1000
  // So "bir" + "on" (10) returns just "on"
  const result = lang.combineWordSets({ bir: 1n }, { on: 10n })
  t.deepEqual(result, { on: 10n })
})

test('combineWordSets multiplies when following > preceding', t => {
  const lang = new TestTurkicLanguage()
  // 5 * 100 = 500
  const result = lang.combineWordSets({ beş: 5n }, { yüz: 100n })
  t.deepEqual(result, { 'beş yüz': 500n })
})

test('combineWordSets adds when following <= preceding', t => {
  const lang = new TestTurkicLanguage()
  // 20 + 3 = 23
  const result = lang.combineWordSets({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi üç': 23n })
})

test('combineWordSets uses wordSeparator for combining', t => {
  class CustomSeparatorLang extends TestTurkicLanguage {
    wordSeparator = '-'
  }
  const lang = new CustomSeparatorLang()
  const result = lang.combineWordSets({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi-üç': 23n })
})

test('combineWordSets handles equal values (adds, not multiplies)', t => {
  const lang = new TestTurkicLanguage()
  // When following === preceding, it adds (since following > preceding is false)
  // 10 + 10 = 20
  const result = lang.combineWordSets({ on: 10n }, { on: 10n })
  t.is(Object.values(result)[0], 20n)
})

test('combineWordSets handles exact addition boundary', t => {
  const lang = new TestTurkicLanguage()
  // 5 + 5 should add (following not greater than preceding)
  const result = lang.combineWordSets({ beş: 5n }, { beş: 5n })
  t.is(Object.values(result)[0], 10n)
})

// ============================================================================
// Implicit "Bir" Tests
// ============================================================================

test('implicit bir rule applies to values <= 100 and 1000', t => {
  const lang = new TestTurkicLanguage()

  // Should omit for 100
  const result100 = lang.combineWordSets({ bir: 1n }, { yüz: 100n })
  t.deepEqual(result100, { yüz: 100n })

  // Should omit for 1000
  const result1000 = lang.combineWordSets({ bir: 1n }, { bin: 1000n })
  t.deepEqual(result1000, { bin: 1000n })

  // Should also omit for 10 (since 10 <= 100)
  const result10 = lang.combineWordSets({ bir: 1n }, { on: 10n })
  t.deepEqual(result10, { on: 10n })
})

// ============================================================================
// Conversion Tests
// ============================================================================

test('integerToWords handles zero', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(0n), 'sıfır')
})

test('integerToWords handles single digits', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1n), 'bir')
  t.is(lang.integerToWords(5n), 'beş')
  t.is(lang.integerToWords(9n), 'dokuz')
})

test('integerToWords handles tens', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(10n), 'on')
  t.is(lang.integerToWords(20n), 'yirmi')
  t.is(lang.integerToWords(50n), 'elli')
})

test('integerToWords handles compound numbers under 100', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.integerToWords(23n)
  t.true(result.includes('yirmi'))
  t.true(result.includes('üç'))
})

test('integerToWords handles exactly 100 (omits bir)', t => {
  const lang = new TestTurkicLanguage()
  // Should be just 'yüz', not 'bir yüz'
  t.is(lang.integerToWords(100n), 'yüz')
})

test('integerToWords handles exactly 1000 (omits bir)', t => {
  const lang = new TestTurkicLanguage()
  // Should be just 'bin', not 'bir bin'
  t.is(lang.integerToWords(1000n), 'bin')
})

test('integerToWords handles multiples of 100 (keeps multiplier)', t => {
  const lang = new TestTurkicLanguage()
  // 200 should be 'iki yüz'
  const result = lang.integerToWords(200n)
  t.true(result.includes('iki'))
  t.true(result.includes('yüz'))
})

test('integerToWords handles multiples of 1000 (keeps multiplier)', t => {
  const lang = new TestTurkicLanguage()
  // 2000 should be 'iki bin'
  const result = lang.integerToWords(2000n)
  t.true(result.includes('iki'))
  t.true(result.includes('bin'))
})

test('integerToWords handles hundreds with remainder', t => {
  const lang = new TestTurkicLanguage()
  // 123 should include yüz and other components
  const result = lang.integerToWords(123n)
  t.true(result.includes('yüz'))
})

test('integerToWords handles thousands with remainder', t => {
  const lang = new TestTurkicLanguage()
  // 1234 should include bin
  const result = lang.integerToWords(1234n)
  t.true(result.includes('bin'))
})

test('handles complex number with thousands and hundreds', t => {
  const lang = new TestTurkicLanguage()
  // 5432 = 5 thousand + 4 hundred + 32
  const result = lang.integerToWords(5432n)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('handles teens correctly', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(11n), 'on bir')
  t.is(lang.integerToWords(15n), 'on beş')
  t.is(lang.integerToWords(19n), 'on dokuz')
})

test('scaleWords are ordered descending', t => {
  const lang = new TestTurkicLanguage()
  // Verify ordering requirement from GreedyScaleLanguage
  for (let i = 0; i < lang.scaleWords.length - 1; i++) {
    const current = lang.scaleWords[i][0]
    const next = lang.scaleWords[i + 1][0]
    t.true(current > next, `scaleWords should be descending: ${current} > ${next}`)
  }
})

test('wordSeparator defaults to space', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.wordSeparator, ' ')
})

// ============================================================================
// Integration Tests
// ============================================================================

test('integrates with GreedyScaleLanguage correctly', t => {
  const lang = new TestTurkicLanguage()
  // Verify it uses the greedy algorithm
  t.is(typeof lang.decomposeInteger, 'function')
  t.is(typeof lang.reduceWordSets, 'function')
})

test('integrates with AbstractLanguage for negative numbers', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.toWords(true, 42n)
  t.true(result.startsWith('eksi'))
})

test('integrates with AbstractLanguage for decimals', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.toWords(false, 3n, '14')
  t.true(result.includes('nokta'))
})
