/**
 * Georgian language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Georgian-specific rules:
 * - Vigesimal (base-20) system for 20-99
 * - 40 = ორმოცი (2×20), 60 = სამოცი (3×20), 80 = ოთხმოცი (4×20)
 * - 30/50/70/90 use "და" + "ათი": ოცდაათი (20+10), ორმოცდაათი (40+10)
 * - Compound numbers use "და" (da = "and") connector
 * - Hundreds: unit prefix + ას (ორასი = 200)
 * - Short scale for large numbers (მილიონი, მილიარდი, ტრილიონი)
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Numbers 0-9 (primitives)
const ONES = ['ნული', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა']

// Numbers 10-19
const TEENS = ['ათი', 'თერთმეტი', 'თორმეტი', 'ცამეტი', 'თოთხმეტი', 'თხუთმეტი', 'თექვსმეტი', 'ჩვიდმეტი', 'თვრამეტი', 'ცხრამეტი']

// Vigesimal bases: 20, 40, 60, 80 (with და connector forms)
const VIGESIMAL = ['', 'ოცი', 'ორმოცი', 'სამოცი', 'ოთხმოცი']
const VIGESIMAL_DA = ['', 'ოცდა', 'ორმოცდა', 'სამოცდა', 'ოთხმოცდა']

// Prefixes for hundreds (unit forms without final vowel)
const HUNDRED_PREFIXES = ['', '', 'ორ', 'სამ', 'ოთხ', 'ხუთ', 'ექვს', 'შვიდ', 'რვა', 'ცხრა']

const HUNDRED = 'ასი'
const HUNDRED_STEM = 'ას' // Without final vowel
const THOUSAND = 'ათასი'
const THOUSAND_STEM = 'ათას' // Without final vowel

// Scale words (short scale) - indexed by segment position
const SCALES = ['', '', 'მილიონი', 'მილიარდი', 'ტრილიონი', 'კვადრილიონი', 'კვინტილიონი', 'სექსტილიონი']

const ZERO = 'ნული'
const NEGATIVE = 'მინუს'
const DECIMAL_SEP = 'მთელი'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-99 using vigesimal system.
 * @param {number} n - Number 0-99
 * @returns {string} Georgian word
 */
function buildTens (n) {
  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]

  const vigesimalGroup = Math.floor(n / 20)
  const remainder = n % 20

  if (remainder === 0) {
    return VIGESIMAL[vigesimalGroup]
  }

  // Use და connector: ოცდა + remainder
  const base = VIGESIMAL_DA[vigesimalGroup]
  if (remainder < 10) {
    return base + ONES[remainder]
  }
  return base + TEENS[remainder - 10]
}

/**
 * Builds segment word for 0-999.
 * Returns object with full form and stem form (without final vowel).
 * @param {number} n - Number 0-999
 * @returns {{full: string, stem: string}} Georgian words
 */
function buildSegment (n) {
  if (n === 0) return { full: '', stem: '' }
  if (n < 100) {
    const word = buildTens(n)
    // Remove final vowel for stem
    const lastChar = word.slice(-1)
    const stem = (lastChar === 'ი' || lastChar === 'ა') ? word.slice(0, -1) : word
    return { full: word, stem }
  }

  const hundreds = Math.floor(n / 100)
  const remainder = n % 100

  // Build hundreds: ასი (100), ორასი (200), etc.
  let hundredWord
  if (hundreds === 1) {
    hundredWord = remainder > 0 ? HUNDRED_STEM : HUNDRED
  } else {
    hundredWord = HUNDRED_PREFIXES[hundreds] + (remainder > 0 ? HUNDRED_STEM : HUNDRED)
  }

  if (remainder > 0) {
    const remainderWord = buildTens(remainder)
    const full = hundredWord + ' ' + remainderWord
    // Stem removes final vowel from remainder
    const lastChar = remainderWord.slice(-1)
    const remainderStem = (lastChar === 'ი' || lastChar === 'ა') ? remainderWord.slice(0, -1) : remainderWord
    return { full, stem: hundredWord + ' ' + remainderStem }
  }

  // Hundreds only - stem removes final ი
  return { full: hundredWord, stem: hundredWord.slice(0, -1) }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Georgian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Georgian words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const { full } = buildSegment(Number(n))
    return full
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "ათასი" not "ერთი ათასი"
      result = remainder > 0 ? THOUSAND_STEM : THOUSAND
    } else {
      // Use stem form before ათასი
      const { stem: thousandsPart } = buildSegment(thousands)
      result = thousandsPart + ' ' + (remainder > 0 ? THOUSAND_STEM : THOUSAND)
    }

    if (remainder > 0) {
      const { full: remainderWord } = buildSegment(remainder)
      result += ' ' + remainderWord
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Georgian words
 */
function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from left to right
  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(Number(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(Number(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      if (scaleIndex === 0) {
        // Units (no scale)
        const { full } = buildSegment(segment)
        parts.push(full)
      } else if (scaleIndex === 1) {
        // Thousands - check if there's a remainder
        const hasRemainder = segments.slice(i + 1).some(s => s !== 0)
        const thousandWord = hasRemainder ? THOUSAND_STEM : THOUSAND

        if (segment === 1) {
          parts.push(thousandWord)
        } else {
          const { stem } = buildSegment(segment)
          parts.push(stem + ' ' + thousandWord)
        }
      } else {
        // Million and above
        const scaleWord = SCALES[scaleIndex] || SCALES[SCALES.length - 1]
        if (segment === 1) {
          parts.push('ერთი ' + scaleWord)
        } else {
          const { full } = buildSegment(segment)
          parts.push(full + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Georgian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Georgian words for decimal part
 */
function decimalPartToWords (decimalPart) {
  let result = ''

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Georgian words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Georgian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)           // 'ოცდაერთი'
 * toWords(100)          // 'ასი'
 * toWords(1000)         // 'ათასი'
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
// Public API
// ============================================================================

export { toWords }
