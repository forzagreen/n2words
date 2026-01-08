/**
 * Kannada language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Indian numbering system (ಸಾವಿರ, ಲಕ್ಷ, ಕೋಟಿ)
 * - Kannada script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'ಸೊನ್ನೆ'
const NEGATIVE = 'ಋಣಾತ್ಮಕ'
const DECIMAL_SEP = 'ದಶಮಾಂಶ'
const HUNDRED = 'ನೂರು'

const BELOW_HUNDRED = [
  'ಸೊನ್ನೆ', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು',
  'ಹತ್ತು', 'ಹನ್ನೊಂದು', 'ಹನ್ನೆರಡು', 'ಹದಿಮೂರು', 'ಹದಿನಾಲ್ಕು', 'ಹದಿನೈದು', 'ಹದಿನಾರು', 'ಹದಿನೇಳು', 'ಹದಿನೆಂಟು', 'ಹತ್ತೊಂಬತ್ತು',
  'ಇಪ್ಪತ್ತು', 'ಇಪ್ಪತ್ತೊಂದು', 'ಇಪ್ಪತ್ತೆರಡು', 'ಇಪ್ಪತ್ತಮೂರು', 'ಇಪ್ಪತ್ತನಾಲ್ಕು', 'ಇಪ್ಪತ್ತೈದು', 'ಇಪ್ಪತ್ತಾರು', 'ಇಪ್ಪತ್ತೇಳು', 'ಇಪ್ಪತ್ತೆಂಟು', 'ಇಪ್ಪತ್ತೊಂಬತ್ತು',
  'ಮೂವತ್ತು', 'ಮೂವತ್ತೊಂದು', 'ಮೂವತ್ತೆರಡು', 'ಮೂವತ್ತಮೂರು', 'ಮೂವತ್ತನಾಲ್ಕು', 'ಮೂವತ್ತೈದು', 'ಮೂವತ್ತಾರು', 'ಮೂವತ್ತೇಳು', 'ಮೂವತ್ತೆಂಟು', 'ಮೂವತ್ತೊಂಬತ್ತು',
  'ನಲವತ್ತು', 'ನಲವತ್ತೊಂದು', 'ನಲವತ್ತೆರಡು', 'ನಲವತ್ತಮೂರು', 'ನಲವತ್ತನಾಲ್ಕು', 'ನಲವತ್ತೈದು', 'ನಲವತ್ತಾರು', 'ನಲವತ್ತೇಳು', 'ನಲವತ್ತೆಂಟು', 'ನಲವತ್ತೊಂಬತ್ತು',
  'ಐವತ್ತು', 'ಐವತ್ತೊಂದು', 'ಐವತ್ತೆರಡು', 'ಐವತ್ತಮೂರು', 'ಐವತ್ತನಾಲ್ಕು', 'ಐವತ್ತೈದು', 'ಐವತ್ತಾರು', 'ಐವತ್ತೇಳು', 'ಐವತ್ತೆಂಟು', 'ಐವತ್ತೊಂಬತ್ತು',
  'ಅರವತ್ತು', 'ಅರವತ್ತೊಂದು', 'ಅರವತ್ತೆರಡು', 'ಅರವತ್ತಮೂರು', 'ಅರವತ್ತನಾಲ್ಕು', 'ಅರವತ್ತೈದು', 'ಅರವತ್ತಾರು', 'ಅರವತ್ತೇಳು', 'ಅರವತ್ತೆಂಟು', 'ಅರವತ್ತೊಂಬತ್ತು',
  'ಎಪ್ಪತ್ತು', 'ಎಪ್ಪತ್ತೊಂದು', 'ಎಪ್ಪತ್ತೆರಡು', 'ಎಪ್ಪತ್ತಮೂರು', 'ಎಪ್ಪತ್ತನಾಲ್ಕು', 'ಎಪ್ಪತ್ತೈದು', 'ಎಪ್ಪತ್ತಾರು', 'ಎಪ್ಪತ್ತೇಳು', 'ಎಪ್ಪತ್ತೆಂಟು', 'ಎಪ್ಪತ್ತೊಂಬತ್ತು',
  'ಎಂಬತ್ತು', 'ಎಂಬತ್ತೊಂದು', 'ಎಂಬತ್ತೆರಡು', 'ಎಂಬತ್ತಮೂರು', 'ಎಂಬತ್ತನಾಲ್ಕು', 'ಎಂಬತ್ತೈದು', 'ಎಂಬತ್ತಾರು', 'ಎಂಬತ್ತೇಳು', 'ಎಂಬತ್ತೆಂಟು', 'ಎಂಬತ್ತೊಂಬತ್ತು',
  'ತೊಂಬತ್ತು', 'ತೊಂಬತ್ತೊಂದು', 'ತೊಂಬತ್ತೆರಡು', 'ತೊಂಬತ್ತಮೂರು', 'ತೊಂಬತ್ತನಾಲ್ಕು', 'ತೊಂಬತ್ತೈದು', 'ತೊಂಬತ್ತಾರು', 'ತೊಂಬತ್ತೇಳು', 'ತೊಂಬತ್ತೆಂಟು', 'ತೊಂಬತ್ತೊಂಬತ್ತು'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'ಸಾವಿರ', 'ಲಕ್ಷ', 'ಕೋಟಿ', 'ಅಬ್ಜ', 'ಖರ್ವ', 'ನೀಲ', 'ಪದ್ಮ', 'ಶಂಖ']

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

// Precompute all 1000 segment words (0-999)
const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i)
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Kannada words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Kannada words
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
      words.push(SEGMENTS[segment])
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
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : BELOW_HUNDRED[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Kannada words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Kannada words
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
