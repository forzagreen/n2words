/**
 * Urdu (Pakistan) language converter
 *
 * CLDR: ur-PK | Urdu as used in Pakistan
 *
 * Key features:
 * - Indian numbering system (ہزار, لاکھ, کروڑ)
 * - Urdu script (right-to-left)
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'صفر'
const NEGATIVE = 'منفی'
const DECIMAL_SEP = 'اعشاریہ'
const HUNDRED = 'سو'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix (adds to cardinal)
const ORDINAL_SUFFIX = 'واں'

// Special ordinals for first few numbers
const ORDINAL_SPECIAL = ['', 'پہلا', 'دوسرا', 'تیسرا', 'چوتھا', 'پانچواں', 'چھٹا']

// ============================================================================
// Currency Vocabulary (Pakistani Rupee)
// ============================================================================

// Rupee: singular/plural (same form used)
const RUPEE = 'روپیہ'
const RUPEES = 'روپے'

// Paisa: singular/plural
const PAISA = 'پیسہ'
const PAISE = 'پیسے'

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
// Segment Building
// ============================================================================

/**
 * Builds words for a 0-999 segment.
 */
function buildSegment (n) {
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

/**
 * Converts a non-negative integer to Urdu words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Urdu words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Extract segments using BigInt modulo
  const segments = []
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  while (temp > 0n) {
    segments.push(Number(temp % 100n))
    temp = temp / 100n
  }

  // Build result string (process from most-significant to least)
  const words = []
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i === 0) {
      words.push(buildSegment(segment))
    } else {
      words.push(BELOW_HUNDRED[segment])
    }

    if (i > 0 && SCALE_WORDS[i]) {
      words.push(SCALE_WORDS[i])
    }
  }

  return words.join(' ')
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
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a positive integer to Urdu ordinal words.
 *
 * Urdu ordinals: First 6 are irregular, then add -واں suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Urdu ordinal words
 */
function integerToOrdinal (n) {
  // Special ordinals for 1-6
  if (n >= 1n && n <= 6n) {
    return ORDINAL_SPECIAL[Number(n)]
  }

  // For 7 and above, add suffix to cardinal
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Urdu ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'پہلا'
 * toOrdinal(2)    // 'دوسرا'
 * toOrdinal(3)    // 'تیسرا'
 * toOrdinal(10)   // 'دسواں'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Urdu currency words (Pakistani Rupee).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Urdu currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'بیالیس روپے پچاس پیسے'
 * toCurrency(1)      // 'ایک روپیہ'
 * toCurrency(0.01)   // 'ایک پیسہ'
 */
function toCurrency (value) {
  const { isNegative, dollars: rupees, cents: paise } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Rupees part - show if non-zero, or if no paise
  if (rupees > 0n || paise === 0n) {
    result += integerToWords(rupees)
    // Singular for 1 rupee, plural otherwise
    result += ' ' + (rupees === 1n ? RUPEE : RUPEES)
  }

  // Paise part
  if (paise > 0n) {
    if (rupees > 0n) {
      result += ' '
    }
    result += integerToWords(paise)
    // Singular for 1 paisa, plural otherwise
    result += ' ' + (paise === 1n ? PAISA : PAISE)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
