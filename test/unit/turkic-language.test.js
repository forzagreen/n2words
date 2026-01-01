import test from 'ava'
import { TurkicLanguage } from '../../lib/classes/turkic-language.js'

/**
 * Unit Tests for TurkicLanguage
 *
 * Tests Turkic language patterns including:
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Space-separated number combinations
 * - Multiplication/addition logic in mergeScales
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

  scaleWordPairs = [
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

test('mergeScales omits implicit "bir" before yüz (100)', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.mergeScales({ bir: 1n }, { yüz: 100n })
  t.deepEqual(result, { yüz: 100n })
})

test('mergeScales omits implicit "bir" before bin (1000)', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.mergeScales({ bir: 1n }, { bin: 1000n })
  t.deepEqual(result, { bin: 1000n })
})

test('mergeScales omits "bir" for magnitudes <= 100', t => {
  const lang = new TestTurkicLanguage()
  // The rule is: omit "bir" when right <= 100 OR right === 1000
  // So "bir" + "on" (10) returns just "on"
  const result = lang.mergeScales({ bir: 1n }, { on: 10n })
  t.deepEqual(result, { on: 10n })
})

test('mergeScales multiplies when right > left', t => {
  const lang = new TestTurkicLanguage()
  // 5 * 100 = 500
  const result = lang.mergeScales({ beş: 5n }, { yüz: 100n })
  t.deepEqual(result, { 'beş yüz': 500n })
})

test('mergeScales adds when right <= left', t => {
  const lang = new TestTurkicLanguage()
  // 20 + 3 = 23
  const result = lang.mergeScales({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi üç': 23n })
})

test('mergeScales uses wordSeparator for combining', t => {
  class CustomSeparatorLang extends TestTurkicLanguage {
    wordSeparator = '-'
  }
  const lang = new CustomSeparatorLang()
  const result = lang.mergeScales({ yirmi: 20n }, { üç: 3n })
  t.deepEqual(result, { 'yirmi-üç': 23n })
})

test('mergeScales handles equal values (adds, not multiplies)', t => {
  const lang = new TestTurkicLanguage()
  // When right === left, it adds (since right > left is false)
  // 10 + 10 = 20
  const result = lang.mergeScales({ on: 10n }, { on: 10n })
  t.is(Object.values(result)[0], 20n)
})

test('mergeScales handles exact addition boundary', t => {
  const lang = new TestTurkicLanguage()
  // 5 + 5 should add (right not greater than left)
  const result = lang.mergeScales({ beş: 5n }, { beş: 5n })
  t.is(Object.values(result)[0], 10n)
})

// ============================================================================
// Implicit "Bir" Tests
// ============================================================================

test('implicit bir rule applies to values <= 100 and 1000', t => {
  const lang = new TestTurkicLanguage()

  // Should omit for 100
  const result100 = lang.mergeScales({ bir: 1n }, { yüz: 100n })
  t.deepEqual(result100, { yüz: 100n })

  // Should omit for 1000
  const result1000 = lang.mergeScales({ bir: 1n }, { bin: 1000n })
  t.deepEqual(result1000, { bin: 1000n })

  // Should also omit for 10 (since 10 <= 100)
  const result10 = lang.mergeScales({ bir: 1n }, { on: 10n })
  t.deepEqual(result10, { on: 10n })
})

// ============================================================================
// Conversion Tests
// ============================================================================

test('convertWholePart handles zero', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.convertWholePart(0n), 'sıfır')
})

test('convertWholePart handles single digits', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.convertWholePart(1n), 'bir')
  t.is(lang.convertWholePart(5n), 'beş')
  t.is(lang.convertWholePart(9n), 'dokuz')
})

test('convertWholePart handles tens', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.convertWholePart(10n), 'on')
  t.is(lang.convertWholePart(20n), 'yirmi')
  t.is(lang.convertWholePart(50n), 'elli')
})

test('convertWholePart handles compound numbers under 100', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.convertWholePart(23n)
  t.true(result.includes('yirmi'))
  t.true(result.includes('üç'))
})

test('convertWholePart handles exactly 100 (omits bir)', t => {
  const lang = new TestTurkicLanguage()
  // Should be just 'yüz', not 'bir yüz'
  t.is(lang.convertWholePart(100n), 'yüz')
})

test('convertWholePart handles exactly 1000 (omits bir)', t => {
  const lang = new TestTurkicLanguage()
  // Should be just 'bin', not 'bir bin'
  t.is(lang.convertWholePart(1000n), 'bin')
})

test('convertWholePart handles multiples of 100 (keeps multiplier)', t => {
  const lang = new TestTurkicLanguage()
  // 200 should be 'iki yüz'
  const result = lang.convertWholePart(200n)
  t.true(result.includes('iki'))
  t.true(result.includes('yüz'))
})

test('convertWholePart handles multiples of 1000 (keeps multiplier)', t => {
  const lang = new TestTurkicLanguage()
  // 2000 should be 'iki bin'
  const result = lang.convertWholePart(2000n)
  t.true(result.includes('iki'))
  t.true(result.includes('bin'))
})

test('convertWholePart handles hundreds with remainder', t => {
  const lang = new TestTurkicLanguage()
  // 123 should include yüz and other components
  const result = lang.convertWholePart(123n)
  t.true(result.includes('yüz'))
})

test('convertWholePart handles thousands with remainder', t => {
  const lang = new TestTurkicLanguage()
  // 1234 should include bin
  const result = lang.convertWholePart(1234n)
  t.true(result.includes('bin'))
})

test('handles complex number with thousands and hundreds', t => {
  const lang = new TestTurkicLanguage()
  // 5432 = 5 thousand + 4 hundred + 32
  const result = lang.convertWholePart(5432n)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('handles teens correctly', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.convertWholePart(11n), 'on bir')
  t.is(lang.convertWholePart(15n), 'on beş')
  t.is(lang.convertWholePart(19n), 'on dokuz')
})

test('scaleWordPairs are ordered descending', t => {
  const lang = new TestTurkicLanguage()
  // Verify ordering requirement from GreedyScaleLanguage
  for (let i = 0; i < lang.scaleWordPairs.length - 1; i++) {
    const current = lang.scaleWordPairs[i][0]
    const next = lang.scaleWordPairs[i + 1][0]
    t.true(current > next, `scaleWordPairs should be descending: ${current} > ${next}`)
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
  t.is(typeof lang.decomposeToScales, 'function')
  t.is(typeof lang.mergeWordSets, 'function')
})

test('integrates with AbstractLanguage for negative numbers', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.convert(true, 42n)
  t.true(result.startsWith('eksi'))
})

test('integrates with AbstractLanguage for decimals', t => {
  const lang = new TestTurkicLanguage()
  const result = lang.convert(false, 3n, '14')
  t.true(result.includes('nokta'))
})
