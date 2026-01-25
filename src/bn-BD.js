/**
 * Bangla (Bangladesh) language converter
 *
 * CLDR: bn-BD | Bengali as used in Bangladesh
 *
 * Key features:
 * - Indian numbering system (হাজার, লাখ, কোটি)
 * - Bangla script (Bengali)
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'শূন্য'
const NEGATIVE = 'মাইনাস'
const DECIMAL_SEP = 'দশমিক'
const HUNDRED = 'শত'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix (adds to cardinal for numbers >= 7)
const ORDINAL_SUFFIX = 'তম'

// Special ordinals for first few numbers (1-6 have irregular forms)
const ORDINAL_SPECIAL = ['', 'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ']

// ============================================================================
// Currency Vocabulary (Bangladeshi Taka)
// ============================================================================

// Taka: singular/plural (same form used in Bengali)
const TAKA = 'টাকা'

// Paisa: singular/plural (same form used in Bengali)
const PAISA = 'পয়সা'

const BELOW_HUNDRED = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বেয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তেহাত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'হাজার', 'লাখ', 'কোটি', 'আরব', 'খরব', 'নীল', 'পদ্ম', 'শঙ্খ']

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
 * Converts a non-negative integer to Bengali words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Bengali words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Extract segments using BigInt modulo
  // First segment is 3 digits (thousands), rest are 2 digits (lakhs, crores, etc.)
  // Segments stored least-significant first
  const segments = []

  // First segment: last 3 digits
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  // Remaining segments: 2 digits each (lakh = 100k, crore = 10M, etc.)
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
      // First segment (units place) can be 0-999
      words.push(buildSegment(segment))
    } else {
      // Other segments are 0-99
      words.push(BELOW_HUNDRED[segment])
    }

    // Add scale word if not the units segment
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
 * Converts a numeric value to Bengali words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Bengali words
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
 * Converts a positive integer to Bengali ordinal words.
 *
 * Bengali ordinals: First 6 are irregular, then add -তম suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Bengali ordinal words
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
 * Converts a numeric value to Bengali ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'প্রথম'
 * toOrdinal(2)    // 'দ্বিতীয়'
 * toOrdinal(3)    // 'তৃতীয়'
 * toOrdinal(10)   // 'দশতম'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Bengali currency words (Bangladeshi Taka).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Bengali currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'বেয়াল্লিশ টাকা পঞ্চাশ পয়সা'
 * toCurrency(1)      // 'এক টাকা'
 * toCurrency(0.01)   // 'এক পয়সা'
 */
function toCurrency (value) {
  const { isNegative, dollars: taka, cents: paisa } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Taka part - show if non-zero, or if no paisa
  if (taka > 0n || paisa === 0n) {
    result += integerToWords(taka) + ' ' + TAKA
  }

  // Paisa part
  if (paisa > 0n) {
    if (taka > 0n) {
      result += ' '
    }
    result += integerToWords(paisa) + ' ' + PAISA
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
