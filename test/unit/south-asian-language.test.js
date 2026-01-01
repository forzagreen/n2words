import test from 'ava'
import { SouthAsianLanguage } from '../../lib/classes/south-asian-language.js'

/**
 * Unit Tests for SouthAsianLanguage
 *
 * Tests South Asian language patterns including:
 * - Indian numbering system (last 3, then groups of 2)
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
// Grouping Tests
// ============================================================================

test('splitToGroups handles numbers under 1000', t => {
  const lang = new TestSouthAsianLanguage()
  t.deepEqual(lang.splitToGroups(0n), [0])
  t.deepEqual(lang.splitToGroups(5n), [5])
  t.deepEqual(lang.splitToGroups(99n), [99])
  t.deepEqual(lang.splitToGroups(999n), [999])
})

test('splitToGroups handles thousands (4 digits)', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,234 → groups: [1, 234] (last 3, then remaining)
  t.deepEqual(lang.splitToGroups(1234n), [1, 234])
})

test('splitToGroups handles lakhs (6 digits)', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,23,456 → groups: [1, 23, 456]
  t.deepEqual(lang.splitToGroups(123456n), [1, 23, 456])
})

test('splitToGroups handles crores (8 digits)', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,23,45,678 → groups: [1, 23, 45, 678]
  t.deepEqual(lang.splitToGroups(12345678n), [1, 23, 45, 678])
})

test('splitToGroups handles arabs (10 digits)', t => {
  const lang = new TestSouthAsianLanguage()
  // 1,23,45,67,890 → groups: [1, 23, 45, 67, 890]
  t.deepEqual(lang.splitToGroups(1234567890n), [1, 23, 45, 67, 890])
})

test('splitToGroups groups correctly (last 3, then 2s)', t => {
  const lang = new TestSouthAsianLanguage()
  // 9,87,65,43,210 → groups: [9, 87, 65, 43, 210] (last 3, then groups of 2)
  t.deepEqual(lang.splitToGroups(9876543210n), [9, 87, 65, 43, 210])
})

// ============================================================================
// Below-Thousand Conversion Tests
// ============================================================================

test('convertBelowThousand handles zero', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(0), '')
})

test('convertBelowThousand handles single digits', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(1), 'one')
  t.is(lang.convertBelowThousand(5), 'five')
  t.is(lang.convertBelowThousand(9), 'nine')
})

test('convertBelowThousand handles teens', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(10), 'ten')
  t.is(lang.convertBelowThousand(15), 'fifteen')
  t.is(lang.convertBelowThousand(19), 'nineteen')
})

test('convertBelowThousand handles below 100', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(23), 'twenty-three')
  t.is(lang.convertBelowThousand(50), 'fifty')
  t.is(lang.convertBelowThousand(99), 'ninety-nine')
})

test('convertBelowThousand handles hundreds with "one"', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(100), 'one hundred')
})

test('convertBelowThousand handles hundreds with other digits', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(200), 'two hundred')
  t.is(lang.convertBelowThousand(500), 'five hundred')
  // 900 = 9 hundred, not ninety hundred (belowHundred[9] = 'nine')
  t.is(lang.convertBelowThousand(900), 'nine hundred')
})

test('convertBelowThousand handles hundreds with remainder', t => {
  const lang = new TestSouthAsianLanguage()
  t.is(lang.convertBelowThousand(101), 'one hundred one')
  t.is(lang.convertBelowThousand(123), 'one hundred twenty-three')
  // 999 = 9 hundred + 99
  t.is(lang.convertBelowThousand(999), 'nine hundred ninety-nine')
})

// ============================================================================
// Whole Part Conversion Tests
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
  // 1,234 = 1 thousand + 234 (Indian grouping: [1, 234])
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

test('integerToWords skips zero groups', t => {
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

// ============================================================================
// Integration Tests
// ============================================================================

test('integrates with AbstractLanguage for negative numbers', t => {
  const lang = new TestSouthAsianLanguage()
  const result = lang.toWords(true, 42n)
  t.true(result.startsWith('minus'))
})

test('integrates with AbstractLanguage for decimals', t => {
  const lang = new TestSouthAsianLanguage()
  const result = lang.toWords(false, 3n, '14')
  t.true(result.includes('point'))
})
