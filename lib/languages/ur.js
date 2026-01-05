/**
 * Urdu language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (ہزار, لاکھ, کروڑ)
 * - Urdu script (right-to-left)
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'صفر'
const NEGATIVE = 'منفی'
const DECIMAL_SEP = 'اعشاریہ'
const HUNDRED = 'سو'

const BELOW_HUNDRED = [
  'صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
  'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس',
  'بیس', 'اکیس', 'بائیس', 'تیئیس', 'چوبیس', 'پچیس', 'چھبیس', 'ستائیس', 'اٹھائیس', 'انتیس',
  'تیس', 'اکتیس', 'بتیس', 'تینتیس', 'چونتیس', 'پینتیس', 'چھتیس', 'سینتیس', 'اڑتیس', 'انتالیس',
  'چالیس', 'اکتالیس', 'بیالیس', 'تینتالیس', 'چوالیس', 'پینتالیس', 'چھالیس', 'سینتالیس', 'اڑتالیس', 'انچاس',
  'پچاس', 'اکاون', 'باون', 'ترپن', 'چون', 'پچپن', 'چھپن', 'ستاون', 'اٹھاون', 'انسٹھ',
  'ساٹھ', 'اکسٹھ', 'باسٹھ', 'ترسٹھ', 'چونسٹھ', 'پینسٹھ', 'چھیاسٹھ', 'سڑسٹھ', 'اڑسٹھ', 'انہتر',
  'ستر', 'اکہتر', 'بہتر', 'تہتر', 'چوہتر', 'پچھتر', 'چھہتر', 'ستتر', 'اٹھہتر', 'اناسی',
  'اسی', 'اکیاسی', 'بیاسی', 'تریاسی', 'چوراسی', 'پچاسی', 'چھیاسی', 'ستاسی', 'اٹھاسی', 'نواسی',
  'نوے', 'اکانوے', 'بانوے', 'ترانوے', 'چورانوے', 'پچانوے', 'چھیانوے', 'ستانوے', 'اٹھانوے', 'ننانوے'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'ہزار', 'لاکھ', 'کروڑ', 'ارب', 'کھرب', 'نیل', 'پدم', 'شنکھ']

// ============================================================================
// Segment Splitting (inlined for performance)
// ============================================================================

function groupByThreeThenTwos (n) {
  const numStr = n.toString()
  if (numStr.length <= 3) return [Number(numStr)]

  const segments = []
  segments.unshift(Number(numStr.slice(-3)))

  let remaining = numStr.slice(0, -3)
  while (remaining.length > 0) {
    segments.unshift(Number(remaining.slice(-2)))
    remaining = remaining.slice(0, -2)
  }

  return segments
}

function segmentToWords (n) {
  if (n === 0) return ''
  if (n < 100) return BELOW_HUNDRED[n]

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100

  if (remainder === 0) {
    return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED
  }
  return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED + ' ' + BELOW_HUNDRED[remainder]
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  const segments = groupByThreeThenTwos(n)
  const segmentCount = segments.length
  const words = []

  for (let i = 0; i < segmentCount; i++) {
    const segmentValue = segments[i]
    if (segmentValue === 0) continue

    const scaleIndex = segmentCount - i - 1
    words.push(segmentToWords(segmentValue))
    if (scaleIndex > 0 && SCALE_WORDS[scaleIndex]) {
      words.push(SCALE_WORDS[scaleIndex])
    }
  }

  return words.join(' ').trim()
}

function decimalPartToWords (decimalPart) {
  let result = ''
  let i = 0

  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Urdu words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Urdu words
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
