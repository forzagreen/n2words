/**
 * Punjabi language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Indian numbering system (ਹਜ਼ਾਰ, ਲੱਖ, ਕਰੋੜ)
 * - Gurmukhi script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'ਸਿਫ਼ਰ'
const NEGATIVE = 'ਮਾਇਨਸ'
const DECIMAL_SEP = 'ਦਸ਼ਮਲਵ'
const HUNDRED = 'ਸੌ'

const BELOW_HUNDRED = [
  'ਸਿਫ਼ਰ', 'ਇੱਕ', 'ਦੋ', 'ਤਿੰਨ', 'ਚਾਰ', 'ਪੰਜ', 'ਛੇ', 'ਸੱਤ', 'ਅੱਠ', 'ਨੌਂ',
  'ਦੱਸ', 'ਗਿਆਰਾਂ', 'ਬਾਰਾਂ', 'ਤੇਰਾਂ', 'ਚੌਦਾਂ', 'ਪੰਦਰਾਂ', 'ਸੋਲਾਂ', 'ਸਤਾਰਾਂ', 'ਅਠਾਰਾਂ', 'ਉੱਨੀ',
  'ਵੀਹ', 'ਇੱਕੀ', 'ਬਾਈ', 'ਤੇਈ', 'ਚੌਬੀ', 'ਪੱਚੀ', 'ਛੱਬੀ', 'ਸਤਾਈ', 'ਅਠਾਈ', 'ਉਨੱਤੀ',
  'ਤੀਹ', 'ਇਕੱਤੀ', 'ਬੱਤੀ', 'ਤੇਤੀ', 'ਚੌਂਤੀ', 'ਪੈਂਤੀ', 'ਛੱਤੀ', 'ਸੈਂਤੀ', 'ਅਠੱਤੀ', 'ਉਨਤਾਲੀ',
  'ਚਾਲੀ', 'ਇਕਤਾਲੀ', 'ਬਿਆਲੀ', 'ਤਿਰਤਾਲੀ', 'ਚੁਵਾਲੀ', 'ਪੰਤਾਲੀ', 'ਛਿਆਲੀ', 'ਸੈਂਤਾਲੀ', 'ਅਠਤਾਲੀ', 'ਉਨੰਜਾ',
  'ਪੰਜਾਹ', 'ਇਕਵੰਜਾ', 'ਬਵੰਜਾ', 'ਤਰਵੰਜਾ', 'ਚੁਰਵੰਜਾ', 'ਪੰਜਵੰਜਾ', 'ਛਪੰਜਾ', 'ਸੱਤਵੰਜਾ', 'ਅਠਵੰਜਾ', 'ਉਨਾਹਠ',
  'ਸੱਠ', 'ਇਕਾਹਠ', 'ਬਾਹਠ', 'ਤਰਸਠ', 'ਚੌਂਸਠ', 'ਪੈਂਸਠ', 'ਛਿਆਸਠ', 'ਸੜਸਠ', 'ਅੜਸਠ', 'ਉਣਹੱਤਰ',
  'ਸਤੱਰ', 'ਇਕਹੱਤਰ', 'ਬਹੱਤਰ', 'ਤਹੱਤਰ', 'ਚੌਹੱਤਰ', 'ਪੰਝਹੱਤਰ', 'ਛਿਹੱਤਰ', 'ਸਤੱਤਰ', 'ਅਠੱਤਰ', 'ਉਨਾਸੀ',
  'ਅੱਸੀ', 'ਇਕਿਆਸੀ', 'ਬਿਆਸੀ', 'ਤਰਿਆਸੀ', 'ਚੌਰਿਆਸੀ', 'ਪਚਾਸੀ', 'ਛਿਆਸੀ', 'ਸੱਤਾਸੀ', 'ਅਠਾਸੀ', 'ਨਵਾਸੀ',
  'ਨੱਬੇ', 'ਇਕਾਨਵੇਂ', 'ਬਾਨਵੇਂ', 'ਤਰਾਨਵੇਂ', 'ਚੁਰਾਨਵੇਂ', 'ਪੰਚਾਨਵੇਂ', 'ਛਿਆਨਵੇਂ', 'ਸਤਾਨਵੇਂ', 'ਅਠਾਨਵੇਂ', 'ਨਿਨਾਨਵੇਂ'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'ਹਜ਼ਾਰ', 'ਲੱਖ', 'ਕਰੋੜ', 'ਅਰਬ', 'ਖਰਬ', 'ਨੀਲ', 'ਪਦਮ', 'ਸ਼ੰਖ']

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
 * Converts a non-negative integer to Punjabi words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Punjabi words
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
 * Converts a numeric value to Punjabi words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Punjabi words
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
