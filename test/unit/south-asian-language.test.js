import test from 'ava'
import { SouthAsianLanguage } from '../../lib/classes/south-asian-language.js'

/**
 * Unit Tests for SouthAsianLanguage
 *
 * Tests South Asian language patterns including:
 * - Indian numbering system (last 3, then segments of 2)
 * - Lakh, Crore, Arab scale words
 * - Below-hundred and below-thousand conversions
 */

// ============================================================================
// Test Implementation
// ============================================================================

// Concrete test implementation
class TestSouthAsianLanguage extends SouthAsianLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  // 0-99 words
  belowHundredWords = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine',
    'thirty', 'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four', 'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine',
    'forty', 'forty-one', 'forty-two', 'forty-three', 'forty-four', 'forty-five', 'forty-six', 'forty-seven', 'forty-eight', 'forty-nine',
    'fifty', 'fifty-one', 'fifty-two', 'fifty-three', 'fifty-four', 'fifty-five', 'fifty-six', 'fifty-seven', 'fifty-eight', 'fifty-nine',
    'sixty', 'sixty-one', 'sixty-two', 'sixty-three', 'sixty-four', 'sixty-five', 'sixty-six', 'sixty-seven', 'sixty-eight', 'sixty-nine',
    'seventy', 'seventy-one', 'seventy-two', 'seventy-three', 'seventy-four', 'seventy-five', 'seventy-six', 'seventy-seven', 'seventy-eight', 'seventy-nine',
    'eighty', 'eighty-one', 'eighty-two', 'eighty-three', 'eighty-four', 'eighty-five', 'eighty-six', 'eighty-seven', 'eighty-eight', 'eighty-nine',
    'ninety', 'ninety-one', 'ninety-two', 'ninety-three', 'ninety-four', 'ninety-five', 'ninety-six', 'ninety-seven', 'ninety-eight', 'ninety-nine'
  ]

  hundredWord = 'hundred'

  // Index: 0=ones, 1=thousands, 2=lakhs, 3=crores, 4=arabs
  scaleWords = ['', 'thousand', 'lakh', 'crore', 'arab']
}

// ============================================================================
// Segment Conversion Tests
// ============================================================================

test('segmentToWords handles zero', t => {
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

test('segmentToWords handles below 100', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(23), 'twenty-three')
  t.is(lang.segmentToWords(50), 'fifty')
  t.is(lang.segmentToWords(99), 'ninety-nine')
})

test('segmentToWords handles hundreds with "one"', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(100), 'one hundred')
})

test('segmentToWords handles hundreds with other digits', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(200), 'two hundred')
  t.is(lang.segmentToWords(500), 'five hundred')
  // 900 = 9 hundred, not ninety hundred (belowHundred[9] = 'nine')
  t.is(lang.segmentToWords(900), 'nine hundred')
})

test('segmentToWords handles hundreds with remainder', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.segmentToWords(101), 'one hundred one')
  t.is(lang.segmentToWords(123), 'one hundred twenty-three')
  // 999 = 9 hundred + 99
  t.is(lang.segmentToWords(999), 'nine hundred ninety-nine')
})

// ============================================================================
// Integer Part Conversion Tests
// ============================================================================

test('integerToWords returns zero word for 0', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.integerToWords(0n), 'zero')
})

test('integerToWords handles single digits', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.integerToWords(5n), 'five')
})

test('integerToWords handles below hundred', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.integerToWords(42n), 'forty-two')
})

test('integerToWords handles hundreds', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.integerToWords(123n), 'one hundred twenty-three')
})

test('integerToWords handles thousands', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,234 = 1 thousand + 234 (Indian segmentation: [1, 234])
  const result = lang.integerToWords(1234n)
  t.true(result.includes('one'))
  t.true(result.includes('thousand'))
})

test('integerToWords handles lakhs', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,23,456 = 1 lakh + 23 thousand + 456
  const result = lang.integerToWords(123456n)
  t.true(result.includes('one'))
  t.true(result.includes('lakh'))
  t.true(result.includes('thousand'))
})

test('integerToWords handles crores', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,23,45,678 = 1 crore + 23 lakh + 45 thousand + 678
  const result = lang.integerToWords(12345678n)
  t.true(result.includes('crore'))
})

test('integerToWords handles arabs', t => {
  const lang = new TestSouthAsianLanguage()
  // Test with arab scale
  const result = lang.integerToWords(1234567890n)
  t.true(result.includes('arab'))
})

test('integerToWords skips zero segments', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,00,000 = 1 lakh + 0 thousand + 0 ones
  const result = lang.integerToWords(100000n)
  t.true(result.includes('one'))
  t.true(result.includes('lakh'))
  // Should not include 'zero'
  t.false(result.includes('zero'))
})

test('integerToWords uses correct scale word indices', t => {
  const lang = new TestSouthAsianLanguage()

  // 1000 uses scaleWords[1] = 'thousand'
  t.true(lang.integerToWords(1000n).includes('thousand'))

  // 100000 uses scaleWords[2] = 'lakh'
  t.true(lang.integerToWords(100000n).includes('lakh'))

  // 10000000 uses scaleWords[3] = 'crore'
  t.true(lang.integerToWords(10000000n).includes('crore'))
})

test('integerToWords trims result', t => {
  const lang = new TestSouthAsianLanguage()
  const result = lang.integerToWords(5n)
  t.is(result, result.trim())
})

test('handles complex number with all scale levels', t => {
  const lang = new TestSouthAsianLanguage()
  // 12,34,56,789
  const result = lang.integerToWords(123456789n)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('handles edge case of exactly 1 lakh', t => {
  const lang = new TestSouthAsianLanguage()
  const result = lang.integerToWords(100000n)
  t.true(result.includes('one'))
  t.true(result.includes('lakh'))
})

test('handles edge case of exactly 1 crore', t => {
  const lang = new TestSouthAsianLanguage()
  const result = lang.integerToWords(10000000n)
  t.true(result.includes('one'))
  t.true(result.includes('crore'))
})
