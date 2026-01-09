/**
 * Biblical Hebrew language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Gender agreement (masculine default, feminine via option)
 * - Dual forms for 2, 200, 2000
 * - Special 1-9 thousands construct state
 * - "ו" (ve) conjunction rules vary by position
 * - Per-digit decimal reading
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (arrays for indexed access - faster than object property lookup)
// ============================================================================

// Masculine forms (default in Biblical Hebrew) - index 0 unused
const ONES_MASC = ['', 'אחד', 'שניים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה']
const TEENS_MASC = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר']
const THOUSANDS_MASC = ['', 'אלף', 'אלפיים', 'שלשה אלפים', 'ארבעה אלפים', 'חמשה אלפים', 'ששה אלפים', 'שבעה אלפים', 'שמונה אלפים', 'תשעה אלפים']

// Feminine forms - index 0 unused
const ONES_FEM = ['', 'אחת', 'שתים', 'שלש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע']
const TEENS_FEM = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה']
const THOUSANDS_FEM = ['', 'אלף', 'אלפיים', 'שלשת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים']

// Shared vocabulary
const TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים', 'חמישים', 'ששים', 'שבעים', 'שמונים', 'תשעים']
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלשה מאות', 'ארבעה מאות', 'חמשה מאות', 'ששה מאות', 'שבעה מאות', 'שמונה מאות', 'תשעה מאות']
const HUNDREDS_FEM = ['', 'מאה', 'מאתיים', 'שלש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות']

// Scale words (index 1 = thousands, 2 = millions, etc.)
const SCALE = ['', 'אלף', 'מיליון', 'מיליארד', 'טריליון', 'קוודרליון', 'קווינטיליון']
const SCALE_PLURAL = ['', 'אלפים', 'מיליונים', 'מיליארדים', 'טריליונים', 'קוודרליונים', 'קווינטיליונים']

const ZERO = 'אפס'
const NEGATIVE = 'מינוס'
const DECIMAL_SEP = 'נקודה'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for scale segments (thousands, millions, etc.).
 * "ו" is added before tens and ones when following hundreds.
 */
function buildScaleSegment (n, andWord, ONES, TEENS, HUNDREDS_ARR) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS_ARR[hundreds]
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    const teenWord = TEENS[ones]
    if (result) {
      result += ' ' + andWord + teenWord
    } else {
      result = teenWord
    }
  } else {
    // Tens (20-90)
    if (tens >= 2) {
      if (result) {
        result += ' ' + andWord + TENS[tens]
      } else {
        result = TENS[tens]
      }
    }

    // Ones
    if (ones > 0) {
      if (result) {
        result += ' ' + andWord + ONES[ones]
      } else {
        result = ONES[ones]
      }
    }
  }

  return result
}

/**
 * Builds segment word for units segment (no scale word).
 * "ו" is only added before the final ones digit.
 */
function buildUnitsSegment (n, andWord, ONES, TEENS, HUNDREDS_ARR) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS_ARR[hundreds]
  }

  // Tens (no conjunction)
  if (tens === 1) {
    // Teens (10-19)
    if (result) {
      result += ' ' + TEENS[ones]
    } else {
      result = TEENS[ones]
    }
  } else {
    if (tens >= 2) {
      if (result) {
        result += ' ' + TENS[tens]
      } else {
        result = TENS[tens]
      }
    }

    // Ones - conjunction only here
    if (ones > 0) {
      if (result) {
        result += ' ' + andWord + ONES[ones]
      } else {
        result = ONES[ones]
      }
    }
  }

  return result
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Biblical Hebrew words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Biblical Hebrew words
 */
function integerToWords (n, options) {
  if (n === 0n) return ZERO

  const andWord = options.andWord ?? 'ו'
  const gender = options.gender || 'masculine'
  const isFeminine = gender === 'feminine'

  // Select vocabulary based on gender
  const ONES = isFeminine ? ONES_FEM : ONES_MASC
  const TEENS = isFeminine ? TEENS_FEM : TEENS_MASC
  const THOUSANDS_SPECIAL = isFeminine ? THOUSANDS_FEM : THOUSANDS_MASC
  const HUNDREDS_ARR = isFeminine ? HUNDREDS_FEM : HUNDREDS

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildUnitsSegment(Number(n), andWord, ONES, TEENS, HUNDREDS_ARR)
  }

  // Extract segments using BigInt modulo
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i === 0) {
      // Units segment (no scale word)
      const segmentWord = buildUnitsSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
      if (result) {
        // Add "ו" before single-digit units when following scale words
        if (segment <= 9) {
          result += ' ' + andWord + segmentWord
        } else {
          result += ' ' + segmentWord
        }
      } else {
        result = segmentWord
      }
    } else if (i === 1) {
      // Thousands - special handling for 1-9
      if (segment <= 9) {
        if (result) result += ' '
        result += THOUSANDS_SPECIAL[segment]
      } else {
        const segmentWord = buildScaleSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE[1]
      }
    } else {
      // Millions and above
      if (segment === 1) {
        if (result) result += ' '
        result += SCALE[i]
      } else {
        const segmentWord = buildScaleSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE_PLURAL[i]
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Biblical Hebrew words (digit by digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Biblical Hebrew words for decimal part
 */
function decimalPartToWords (decimalPart, options) {
  const gender = options.gender || 'masculine'
  const ONES = gender === 'feminine' ? ONES_FEM : ONES_MASC

  let result = ''
  for (let i = 0; i < decimalPart.length; i++) {
    const d = parseInt(decimalPart[i], 10)
    if (result) result += ' '
    result += d === 0 ? ZERO : ONES[d]
  }

  return result
}

/**
 * Converts a numeric value to Biblical Hebrew words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @param {string} [options.andWord] - Custom conjunction word
 * @returns {string} The number in Biblical Hebrew words
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, options)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
