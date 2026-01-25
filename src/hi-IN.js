/**
 * Hindi (India) language converter
 *
 * CLDR: hi-IN | Hindi as used in India
 *
 * Key features:
 * - Indian numbering system (हज़ार, लाख, करोड़)
 * - Devanagari script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 * - BigInt modulo for efficient segment extraction
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'शून्य'
const NEGATIVE = 'माइनस'
const DECIMAL_SEP = 'दशमलव'
const HUNDRED = 'सौ'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix (adds to cardinal)
const ORDINAL_SUFFIX = 'वाँ'

// Special ordinals for first few numbers
const ORDINAL_SPECIAL = ['', 'पहला', 'दूसरा', 'तीसरा', 'चौथा', 'पाँचवाँ', 'छठा']

// ============================================================================
// Currency Vocabulary (Indian Rupee)
// ============================================================================

// Rupee: singular/plural (same form used)
const RUPEE = 'रुपया'
const RUPEES = 'रुपये'

// Paisa: singular/plural
const PAISA = 'पैसा'
const PAISE = 'पैसे'

const BELOW_HUNDRED = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ',
  'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस',
  'बीस', 'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस',
  'तीस', 'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस',
  'चालीस', 'इकतालीस', 'बयालीस', 'तेतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास',
  'पचास', 'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ',
  'साठ', 'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर',
  'सत्तर', 'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी',
  'अस्सी', 'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी',
  'नब्बे', 'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'हज़ार', 'लाख', 'करोड़', 'अरब', 'खरब', 'नील', 'पद्म', 'शंख']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds words for a 0-999 segment.
 *
 * @param {number} n - Number 0-999
 * @returns {string} Hindi words for the segment
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
 * Converts a non-negative integer to Hindi words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Hindi words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
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
 * Converts a numeric value to Hindi words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Hindi words
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
 * Converts a positive integer to Hindi ordinal words.
 *
 * Hindi ordinals: First 6 are irregular, then add -वाँ suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Hindi ordinal words
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
 * Converts a numeric value to Hindi ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'पहला'
 * toOrdinal(2)    // 'दूसरा'
 * toOrdinal(3)    // 'तीसरा'
 * toOrdinal(10)   // 'दसवाँ'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Hindi currency words (Indian Rupee).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Hindi currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'बयालीस रुपये पचास पैसे'
 * toCurrency(1)      // 'एक रुपया'
 * toCurrency(0.01)   // 'एक पैसा'
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
