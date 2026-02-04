/**
 * Persian (Iran) language converter
 *
 * CLDR: fa-IR | Persian as used in Iran
 *
 * Key features:
 * - "و" (and) conjunction for compound numbers
 * - Omit "یک" (one) before thousand
 * - Pre-composed hundreds (دویست, سيصد, etc.)
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = { 1: 'یک', 2: 'دو', 3: 'سه', 4: 'چهار', 5: 'پنج', 6: 'شش', 7: 'هفت', 8: 'هشت', 9: 'نه' }
const TEENS = { 10: 'ده', 11: 'یازده', 12: 'دوازده', 13: 'سیزده', 14: 'چهارده', 15: 'پانزده', 16: 'شانزده', 17: 'هفده', 18: 'هجده', 19: 'نوزده' }
const TENS = { 20: 'بیست', 30: 'سی', 40: 'چهل', 50: 'پنجاه', 60: 'شصت', 70: 'هفتاد', 80: 'هشتاد', 90: 'نود' }
const HUNDREDS = { 100: 'صد', 200: 'دویست', 300: 'سيصد', 400: 'چهار صد', 500: 'پانصد', 600: 'ششصد', 700: 'هفتصد', 800: 'هشتصد', 900: 'نهصد' }

const THOUSAND = 'هزار'
const MILLION = 'میلیون'
const MILLIARD = 'میلیارد'

const ZERO = 'صفر'
const NEGATIVE = 'منفى'
const DECIMAL_SEP = 'ممیّز'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Persian ordinals: add -ُم (-om) suffix to cardinal
// Special forms for 1st, 2nd, 3rd
const ORDINAL_SUFFIX = 'م' // ـُم (-om)
const ORDINAL_ONES = {
  1: 'اول', // avval (first)
  2: 'دوم', // dovvom (second)
  3: 'سوم', // sevvom (third)
  4: 'چهارم',
  5: 'پنجم',
  6: 'ششم',
  7: 'هفتم',
  8: 'هشتم',
  9: 'نهم'
}

// ============================================================================
// Currency Vocabulary (Iranian Rial)
// ============================================================================

const RIAL = 'ریال'

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  // 1-9
  if (n <= 9n) {
    return ONES[Number(n)]
  }

  // 10-19
  if (n <= 19n) {
    return TEENS[Number(n)]
  }

  // 20-99
  if (n < 100n) {
    const ones = n % 10n
    const tens = n - ones
    if (ones === 0n) {
      return TENS[Number(tens)]
    }
    return `${TENS[Number(tens)]} و ${ONES[Number(ones)]}`
  }

  // 100-999
  if (n < 1000n) {
    const hundreds = 100n * (n / 100n)
    const remainder = n - hundreds
    if (remainder === 0n) {
      return HUNDREDS[Number(hundreds)]
    }
    return `${HUNDREDS[Number(hundreds)]} و ${integerToWords(remainder)}`
  }

  // 1000-999999
  if (n < 1_000_000n) {
    const thousandMultiplier = n / 1000n
    // Persian omits "one" before thousand: 1000 is just "هزار", not "یک هزار"
    const thousandPrefix = thousandMultiplier === 1n
      ? ''
      : integerToWords(thousandMultiplier) + ' '
    const remainder = n % 1000n
    const suffix = remainder === 0n ? '' : ' ' + integerToWords(remainder)
    return `${thousandPrefix}${THOUSAND}${suffix}`
  }

  // 1000000-999999999 (millions)
  if (n < 1_000_000_000n) {
    const millionMultiplier = n / 1_000_000n
    const millionPrefix = integerToWords(millionMultiplier) + ' ' + MILLION
    const remainder = n % 1_000_000n
    const suffix = remainder === 0n ? '' : ' و ' + integerToWords(remainder)
    return `${millionPrefix}${suffix}`
  }

  // 1000000000+ (milliards - 10^9)
  const milliardMultiplier = n / 1_000_000_000n
  const milliardPrefix = integerToWords(milliardMultiplier) + ' ' + MILLIARD
  const remainder = n % 1_000_000_000n
  const suffix = remainder === 0n ? '' : ' و ' + integerToWords(remainder)
  return `${milliardPrefix}${suffix}`
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
 * Converts a numeric value to Persian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Persian words
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
 * Converts a non-negative integer to Persian ordinal words.
 *
 * Persian ordinals: اول (1st), دوم (2nd), سوم (3rd), then cardinal + م suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Persian ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1-9
  if (n >= 1n && n <= 9n) {
    return ORDINAL_ONES[Number(n)]
  }

  // For 10+, add -م suffix to cardinal
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Persian ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'اول'
 * toOrdinal(2)    // 'دوم'
 * toOrdinal(10)   // 'دهم'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Persian currency words (Rial).
 *
 * Iranian Rial has no subunit in modern usage.
 * (Historically dinar was 1/100 rial, but not used today)
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Persian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'چهل و دو ریال'
 * toCurrency(1000)   // 'هزار ریال'
 * toCurrency(-5)     // 'منفى پنج ریال'
 */
function toCurrency (value) {
  const { isNegative, dollars: rial } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(rial)
  result += ' ' + RIAL

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
