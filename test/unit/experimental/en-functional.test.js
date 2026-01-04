/**
 * Tests for functional English converter (en-Test.js)
 *
 * Tests both the public API (toWords) and individual pure functions.
 */

import test from 'ava'
import {
  toWords,
  // Pure functions
  hundredsToWords,
  combineSegmentParts,
  segmentToWords,
  scaleWordForIndex,
  joinSegments,
  integerToWords,
  // Vocabulary
  ONES,
  TEENS,
  TENS,
  SCALES,
  ZERO
} from '../../../lib/experimental/en-functional.js'
import { decimalToWords } from '../../../lib/utils/scale-utils.js'

// ============================================================================
// Comparison with Class-Based Implementation
// ============================================================================

import { English } from '../../../lib/languages/en.js'

// ============================================================================
// Vocabulary Tests
// ============================================================================

test('vocabulary › ONES has digits 1-9', t => {
  t.is(Object.keys(ONES).length, 9)
  t.is(ONES[1], 'one')
  t.is(ONES[9], 'nine')
})

test('vocabulary › TEENS has digits 0-9 for 10-19', t => {
  t.is(Object.keys(TEENS).length, 10)
  t.is(TEENS[0], 'ten')
  t.is(TEENS[9], 'nineteen')
})

test('vocabulary › TENS has digits 2-9 for 20-90', t => {
  t.is(Object.keys(TENS).length, 8)
  t.is(TENS[2], 'twenty')
  t.is(TENS[9], 'ninety')
})

test('vocabulary › SCALES has scale words in order', t => {
  t.is(SCALES[0], 'thousand')
  t.is(SCALES[1], 'million')
  t.is(SCALES[2], 'billion')
})

// ============================================================================
// Pure Function Tests
// ============================================================================

test('hundredsToWords › converts hundreds digit', t => {
  t.is(hundredsToWords(1n), 'one hundred')
  t.is(hundredsToWords(5n), 'five hundred')
  t.is(hundredsToWords(9n), 'nine hundred')
})

test('combineSegmentParts › hyphenates twenty-one through ninety-nine', t => {
  t.is(combineSegmentParts(['twenty', 'one'], 21n), 'twenty-one')
  t.is(combineSegmentParts(['forty', 'two'], 42n), 'forty-two')
  t.is(combineSegmentParts(['ninety', 'nine'], 99n), 'ninety-nine')
})

test('combineSegmentParts › does not hyphenate teens', t => {
  t.is(combineSegmentParts(['eleven'], 11n), 'eleven')
  t.is(combineSegmentParts(['nineteen'], 19n), 'nineteen')
})

test('combineSegmentParts › adds "and" after hundreds', t => {
  t.is(combineSegmentParts(['one hundred', 'one'], 101n), 'one hundred and one')
  t.is(combineSegmentParts(['five hundred', 'forty', 'two'], 542n), 'five hundred and forty-two')
})

test('combineSegmentParts › no "and" for exact hundreds', t => {
  t.is(combineSegmentParts(['one hundred'], 100n), 'one hundred')
  t.is(combineSegmentParts(['nine hundred'], 900n), 'nine hundred')
})

test('segmentToWords › converts 0-999', t => {
  t.is(segmentToWords(0n), '')
  t.is(segmentToWords(1n), 'one')
  t.is(segmentToWords(10n), 'ten')
  t.is(segmentToWords(11n), 'eleven')
  t.is(segmentToWords(20n), 'twenty')
  t.is(segmentToWords(21n), 'twenty-one')
  t.is(segmentToWords(100n), 'one hundred')
  t.is(segmentToWords(101n), 'one hundred and one')
  t.is(segmentToWords(999n), 'nine hundred and ninety-nine')
})

test('scaleWordForIndex › returns correct scale words', t => {
  t.is(scaleWordForIndex(1), 'thousand')
  t.is(scaleWordForIndex(2), 'million')
  t.is(scaleWordForIndex(3), 'billion')
  t.is(scaleWordForIndex(0), '')
  t.is(scaleWordForIndex(100), '')
})

test('joinSegments › inserts "and" before final small segment', t => {
  t.is(joinSegments(['one', 'thousand', 'one']), 'one thousand and one')
  t.is(joinSegments(['one', 'million', 'fifty']), 'one million and fifty')
})

test('joinSegments › no "and" when final segment has hundred', t => {
  t.is(joinSegments(['one', 'thousand', 'one hundred']), 'one thousand one hundred')
  t.is(joinSegments(['one', 'million', 'one hundred and one']), 'one million one hundred and one')
})

test('integerToWords › converts integers', t => {
  t.is(integerToWords(0n), 'zero')
  t.is(integerToWords(1n), 'one')
  t.is(integerToWords(42n), 'forty-two')
  t.is(integerToWords(100n), 'one hundred')
  t.is(integerToWords(1000n), 'one thousand')
  t.is(integerToWords(1001n), 'one thousand and one')
  t.is(integerToWords(1000000n), 'one million')
  t.is(integerToWords(1234567n), 'one million two hundred and thirty-four thousand five hundred and sixty-seven')
})

test('decimalToWords › preserves leading zeros', t => {
  t.deepEqual(decimalToWords('05', ZERO, integerToWords), ['zero', 'five'])
  t.deepEqual(decimalToWords('005', ZERO, integerToWords), ['zero', 'zero', 'five'])
  t.deepEqual(decimalToWords('500', ZERO, integerToWords), ['five hundred'])
})

test('decimalToWords › groups non-zero remainder', t => {
  t.deepEqual(decimalToWords('14', ZERO, integerToWords), ['fourteen'])
  t.deepEqual(decimalToWords('25', ZERO, integerToWords), ['twenty-five'])
  t.deepEqual(decimalToWords('123', ZERO, integerToWords), ['one hundred and twenty-three'])
})

// ============================================================================
// toWords Tests (Public API)
// ============================================================================

test('toWords › assembles complete output', t => {
  t.is(toWords(false, 42n, undefined), 'forty-two')
  t.is(toWords(true, 42n, undefined), 'minus forty-two')
  t.is(toWords(false, 3n, '14'), 'three point fourteen')
  t.is(toWords(true, 0n, '5'), 'minus zero point five')
})

test('toWords › handles zero', t => {
  t.is(toWords(false, 0n, undefined), 'zero')
  t.is(toWords(true, 0n, undefined), 'minus zero')
})

test('toWords › handles large numbers', t => {
  t.is(toWords(false, 1000000000000n, undefined), 'one trillion')
  t.is(toWords(false, 1000000000000000000n, undefined), 'one quintillion')
})

test('toWords › handles decimals with leading zeros', t => {
  t.is(toWords(false, 0n, '001'), 'zero point zero zero one')
  t.is(toWords(false, 1n, '05'), 'one point zero five')
})

test('functional matches class-based › basic numbers', t => {
  const classConverter = new English()
  const testCases = [0, 1, 10, 11, 20, 21, 100, 101, 111, 999, 1000, 1001, 1234567]

  for (const n of testCases) {
    const functional = toWords(false, BigInt(n), undefined)
    const classBased = classConverter.toWords(false, BigInt(n), undefined)
    t.is(functional, classBased, `Mismatch for ${n}`)
  }
})

test('functional matches class-based › negative numbers', t => {
  const classConverter = new English()
  const testCases = [1, 42, 1000]

  for (const n of testCases) {
    const functional = toWords(true, BigInt(n), undefined)
    const classBased = classConverter.toWords(true, BigInt(n), undefined)
    t.is(functional, classBased, `Mismatch for -${n}`)
  }
})

test('functional matches class-based › decimals', t => {
  const classConverter = new English()

  const testCases = [
    { isNeg: false, int: 3n, dec: '14' },
    { isNeg: false, int: 0n, dec: '05' },
    { isNeg: true, int: 1n, dec: '5' }
  ]

  for (const { isNeg, int, dec } of testCases) {
    const functional = toWords(isNeg, int, dec)
    const classBased = classConverter.toWords(isNeg, int, dec)
    t.is(functional, classBased, `Mismatch for ${isNeg ? '-' : ''}${int}.${dec}`)
  }
})
