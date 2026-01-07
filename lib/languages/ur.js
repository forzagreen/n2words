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
// Conversion Functions
// ============================================================================

/**
 * Converts 0-999 to Urdu words.
 */
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

/**
 * Converts a non-negative integer to Urdu words.
 * Uses recursive approach for Indian 3-2-2 grouping pattern.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Urdu words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return segmentToWords(Number(n))
  }

  return buildLargeNumberWords(n, 0)
}

/**
 * Recursively builds words for numbers >= 1000.
 * Indian grouping: first 3 digits, then 2-digit groups.
 *
 * @param {bigint} n - Number to convert
 * @param {number} scale - Current scale index (0=units, 1=thousands, etc.)
 * @returns {string} Urdu words
 */
function buildLargeNumberWords (n, scale) {
  if (n === 0n) return ''

  // Determine divisor: 1000 for first split, 100 for rest
  const divisor = scale === 0 ? 1000n : 100n
  const segment = Number(n % divisor)
  const rest = n / divisor

  // Build higher segments first (recursive)
  let result = ''
  if (rest > 0n) {
    result = buildLargeNumberWords(rest, scale + 1)
  }

  // Add current segment
  if (segment > 0) {
    if (result) result += ' '

    if (scale === 0) {
      // Units segment (0-999)
      result += segmentToWords(segment)
    } else {
      // Scale segments (0-99)
      result += BELOW_HUNDRED[segment] + ' ' + SCALE_WORDS[scale]
    }
  }

  return result
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
