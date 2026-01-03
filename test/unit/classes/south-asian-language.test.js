import test from 'ava'
import { SouthAsianLanguage } from '../../../lib/classes/south-asian-language.js'

/**
 * Unit Tests for SouthAsianLanguage
 *
 * Tests the South Asian number construction algorithm:
 * - Indian-style grouping (last 3, then 2-2): 1,23,45,678
 * - Scale words: thousand, lakh, crore, arab
 * - Segment conversion (0-999) via segmentToWords()
 *
 * Subclasses must define:
 * - belowHundredWords: Array[100] of words for 0-99
 * - hundredWord: Word for "hundred"
 * - scaleWords: Array indexed by grouping level
 *
 * Note: The groupByThreeThenTwos() utility is tested in segment-utils.test.js.
 * These tests focus on how SouthAsianLanguage uses those segments.
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Minimal fixture with sparse belowHundredWords.
 * Only defines entries actually used in tests.
 */
class TestSouthAsianLanguage extends SouthAsianLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  // Sparse array - only define what we test
  belowHundredWords = (() => {
    const words = new Array(100)
    words[0] = 'zero'
    words[1] = 'one'
    words[2] = 'two'
    words[3] = 'three'
    words[4] = 'four'
    words[5] = 'five'
    words[6] = 'six'
    words[7] = 'seven'
    words[8] = 'eight'
    words[9] = 'nine'
    words[10] = 'ten'
    words[11] = 'eleven'
    words[12] = 'twelve'
    words[15] = 'fifteen'
    words[19] = 'nineteen'
    words[20] = 'twenty'
    words[23] = 'twenty-three'
    words[34] = 'thirty-four'
    words[42] = 'forty-two'
    words[45] = 'forty-five'
    words[50] = 'fifty'
    words[56] = 'fifty-six'
    words[67] = 'sixty-seven'
    words[78] = 'seventy-eight'
    words[89] = 'eighty-nine'
    words[99] = 'ninety-nine'
    return words
  })()

  hundredWord = 'hundred'

  // Index: 0=ones, 1=thousands, 2=lakhs, 3=crores, 4=arabs
  scaleWords = ['', 'thousand', 'lakh', 'crore', 'arab']
}

// ============================================================================
// segmentToWords()
// ============================================================================

test('segmentToWords returns empty string for zero', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(0), '')
})

test('segmentToWords handles single digits', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(1), 'one')
  t.is(lang.segmentToWords(5), 'five')
  t.is(lang.segmentToWords(9), 'nine')
})

test('segmentToWords handles teens', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(10), 'ten')
  t.is(lang.segmentToWords(15), 'fifteen')
  t.is(lang.segmentToWords(19), 'nineteen')
})

test('segmentToWords handles tens', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(20), 'twenty')
  t.is(lang.segmentToWords(23), 'twenty-three')
  t.is(lang.segmentToWords(50), 'fifty')
  t.is(lang.segmentToWords(99), 'ninety-nine')
})

test('segmentToWords handles exact hundreds', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(100), 'one hundred')
  t.is(lang.segmentToWords(200), 'two hundred')
  t.is(lang.segmentToWords(500), 'five hundred')
})

test('segmentToWords handles hundreds with remainder', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(101), 'one hundred one')
  t.is(lang.segmentToWords(123), 'one hundred twenty-three')
  t.is(lang.segmentToWords(999), 'nine hundred ninety-nine')
})

// ============================================================================
// Inheritance
// ============================================================================

test('inherits AbstractLanguage properties', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.negativeWord, 'minus')
  t.is(lang.decimalSeparatorWord, 'point')
  t.is(lang.zeroWord, 'zero')
  t.is(lang.wordSeparator, ' ')
})

test('inherits toWords from AbstractLanguage', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(typeof lang.toWords, 'function')

  // Handles negatives
  const negative = lang.toWords(true, 5n)
  t.true(negative.includes('minus'))

  // Handles decimals
  const decimal = lang.toWords(false, 3n, '14')
  t.true(decimal.includes('point'))
})
