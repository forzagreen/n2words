/**
 * Telugu (India) language converter
 *
 * CLDR: te-IN | Telugu as used in India
 *
 * Key features:
 * - Indian numbering system (వెయ్యి, లక్ష, కోటి)
 * - Telugu script
 * - 3-2-2 grouping pattern
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'సున్నా'
const NEGATIVE = 'మైనస్'
const DECIMAL_SEP = 'పాయింట్'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix (adds to cardinal for numbers >= 7)
const ORDINAL_SUFFIX = 'వ'

// Special ordinals for first few numbers
const ORDINAL_SPECIAL = ['', 'మొదటి', 'రెండవ', 'మూడవ', 'నాలుగవ', 'ఐదవ', 'ఆరవ']

// ============================================================================
// Currency Vocabulary (Indian Rupee)
// ============================================================================

// Rupee (singular/plural same in Telugu)
const RUPEE = 'రూపాయి'
const RUPEES = 'రూపాయలు'

// Paisa (singular/plural same in Telugu)
const PAISA = 'పైసా'
const PAISE = 'పైసలు'

const BELOW_HUNDRED = [
  'సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది',
  'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పంతొమ్మిది',
  'ఇరవై', 'ఇరవై ఒక్కటి', 'ఇరవై రెండు', 'ఇరవై మూడు', 'ఇరవై నాలుగు', 'ఇరవై ఐదు', 'ఇరవై ఆరు', 'ఇరవై ఏడు', 'ఇరవై ఎనిమిది', 'ఇరవై తొమ్మిది',
  'ముప్పై', 'ముప్పై ఒకటి', 'ముప్పై రెండు', 'ముప్పై మూడు', 'ముప్పై నాలుగు', 'ముప్పై ఐదు', 'ముప్పై ఆరు', 'ముప్పై ఏడు', 'ముప్పై ఎనిమిది', 'ముప్పై తొమ్మిది',
  'నలభై', 'నలభై ఒకటి', 'నలభై రెండు', 'నలభై మూడు', 'నలభై నాలుగు', 'నలభై ఐదు', 'నలభై ఆరు', 'నలభై ఏడు', 'నలభై ఎనిమిది', 'నలభై తొమ్మిది',
  'యాభై', 'యాభై ఒకటి', 'యాభై రెండు', 'యాభై మూడు', 'యాభై నాలుగు', 'యాభై ఐదు', 'యాభై ఆరు', 'యాభై ఏడు', 'యాభై ఎనిమిది', 'యాభై తొమ్మిది',
  'అరవై', 'అరవై ఒకటి', 'అరవై రెండు', 'అరవై మూడు', 'అరవై నాలుగు', 'అరవై ఐదు', 'అరవై ఆరు', 'అరవై ఏడు', 'అరవై ఎనిమిది', 'అరవై తొమ్మిది',
  'డెబ్బై', 'డెబ్బై ఒకటి', 'డెబ్బై రెండు', 'డెబ్బై మూడు', 'డెబ్బై నాలుగు', 'డెబ్బై ఐదు', 'డెబ్బై ఆరు', 'డెబ్బై ఏడు', 'డెబ్బై ఎనిమిది', 'డెబ్బై తొమ్మిది',
  'ఎనభై', 'ఎనభై ఒకటి', 'ఎనభై రెండు', 'ఎనభై మూడు', 'ఎనభై నాలుగు', 'ఎనభై ఐదు', 'ఎనభై ఆరు', 'ఎనభై ఏడు', 'ఎనభై ఎనిమిది', 'ఎనభై తొమ్మిది',
  'తొంభై', 'తొంభై ఒకటి', 'తొంభై రెండు', 'తొంభై మూడు', 'తొంభై నాలుగు', 'తొంభై ఐదు', 'తొంభై ఆరు', 'తొంభై ఏడు', 'తొంభై ఎనిమిది', 'తొంభై తొమ్మిది'
]

const HUNDREDS = ['', 'వంద', 'రెండు వందలు', 'మూడు వందలు', 'నాలుగు వందలు', 'ఐదు వందలు', 'ఆరు వందలు', 'ఏడు వందలు', 'ఎనిమిది వందలు', 'తొమ్మిది వందలు']

// Ones for decimal reading
const ONES = ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది']

// Scale words: index 0 = units, 1 = thousand, 2 = lakh, etc.
const SCALE_WORDS = ['', 'వెయ్యి', 'లక్ష', 'కోటి', 'అరబ్', 'ఖరబ్', 'నిల్', 'పడ్మ', 'శంకు']

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
    return HUNDREDS[hundreds]
  }
  return HUNDREDS[hundreds] + ' ' + BELOW_HUNDRED[remainder]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Telugu words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Telugu words
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
      // Use 'ఒక' for 1 at scale positions
      const groupWords = (segment === 1) ? 'ఒక' : BELOW_HUNDRED[segment]
      words.push(groupWords)
    }

    if (i > 0 && SCALE_WORDS[i]) {
      words.push(SCALE_WORDS[i])
    }
  }

  return words.join(' ')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d - 1])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Telugu words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Telugu words
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
 * Converts a positive integer to Telugu ordinal words.
 *
 * Telugu ordinals: First 6 are irregular, then add -వ suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Telugu ordinal words
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
 * Converts a numeric value to Telugu ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'మొదటి'
 * toOrdinal(2)    // 'రెండవ'
 * toOrdinal(10)   // 'పదివ'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Telugu currency words (Indian Rupee).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Telugu currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'నలభై రెండు రూపాయలు యాభై పైసలు'
 * toCurrency(1)      // 'ఒకటి రూపాయి'
 * toCurrency(0.01)   // 'ఒకటి పైసా'
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
