/**
 * Persian language converter - Functional Implementation
 *
 * Self-contained converter using recursive decomposition.
 *
 * Key features:
 * - "و" (and) conjunction for compound numbers
 * - Omit "یک" (one) before thousand
 * - Pre-composed hundreds (دویست, سيصد, etc.)
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = { 1: 'یک', 2: 'دو', 3: 'سه', 4: 'چهار', 5: 'پنج', 6: 'شش', 7: 'هفت', 8: 'هشت', 9: 'نه' }
const TEENS = { 10: 'ده', 11: 'یازده', 12: 'دوازده', 13: 'سیزده', 14: 'چهارده', 15: 'پانزده', 16: 'شانزده', 17: 'هفده', 18: 'هجده', 19: 'نوزده' }
const TENS = { 20: 'بیست', 30: 'سی', 40: 'چهل', 50: 'پنجاه', 60: 'شصت', 70: 'هفتاد', 80: 'هشتاد', 90: 'نود' }
const HUNDREDS = { 100: 'صد', 200: 'دویست', 300: 'سيصد', 400: 'چهار صد', 500: 'پانصد', 600: 'ششصد', 700: 'هفتصد', 800: 'هشتصد', 900: 'نهصد' }

const THOUSAND = 'هزار'
const MILLION = 'میلیون'

const ZERO = 'صفر'
const NEGATIVE = 'منفى'
const DECIMAL_SEP = 'ممیّز'

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

  // 1000000+
  const millionMultiplier = n / 1_000_000n
  const millionPrefix = integerToWords(millionMultiplier) + ' ' + MILLION
  const remainder = n % 1_000_000n
  const suffix = remainder === 0n ? '' : ' و ' + integerToWords(remainder)
  return `${millionPrefix}${suffix}`
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
