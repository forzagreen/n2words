/**
 * Dutch language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Dutch-specific rules:
 * - Inverted tens-ones: eenentwintig (one-and-twenty)
 * - "ën" connector when ones ends in 'e' (twee, drie)
 * - Compound words without spaces
 * - Hundred pairing for 1100-9999 (elfhonderd style)
 * - "één" vs "een" (accentOne option)
 * - Optional "en" separator (includeOptionalAnd option)
 * - Long scale with -ard forms
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen']
const TEENS = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien']
const TENS = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig']

const HUNDRED = 'honderd'

// Scale words (long scale with -ard forms)
const SCALES = ['duizend', 'miljoen', 'miljard', 'biljoen', 'biljard', 'triljoen', 'triljard', 'quadriljoen', 'quadriljard']

const ZERO = 'nul'
const NEGATIVE = 'min'
const DECIMAL_SEP = 'komma'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} withAnd - Include "en" for values < 13 after hundreds
 * @returns {string} Dutch word (compound, no spaces)
 */
function buildSegment (n, withAnd) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)
  const tensOnes = n % 100

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      result = HUNDRED
    } else {
      result = ONES[hundreds] + HUNDRED
    }
  }

  // Tens and ones
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit - add "en" if withAnd and after hundreds
    if (hundreds > 0 && withAnd) {
      result += 'en' + ONES[tensOnes]
    } else {
      result += ONES[tensOnes]
    }
  } else if (tensOnes < 20) {
    // Teens - add "en" if withAnd and after hundreds and < 13
    if (hundreds > 0 && withAnd && tensOnes < 13) {
      result += 'en' + TEENS[ones]
    } else {
      result += TEENS[ones]
    }
  } else {
    // 20-99: Dutch inverts with connector
    if (ones === 0) {
      result += TENS[tens]
    } else {
      // "ën" if ones ends in 'e' (twee, drie)
      const onesWord = ONES[ones]
      const connector = onesWord.endsWith('e') ? 'ën' : 'en'
      result += onesWord + connector + TENS[tens]
    }
  }

  return result
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Dutch words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words
 */
function integerToWords (n, options) {
  if (n === 0n) return ZERO

  const { accentOne, includeOptionalAnd, noHundredPairing } = options

  // Apply één/een replacement
  const applyAccent = (word) => {
    if (accentOne) {
      return word.replace(/\been\b/g, 'één')
    }
    return word
  }

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return applyAccent(buildSegment(Number(n), includeOptionalAnd))
  }

  // Hundred pairing for 1100-9999
  if (!noHundredPairing && n >= 1100n && n < 10000n) {
    const high = Number(n / 100n)
    const low = Number(n % 100n)

    // Only use pairing when high is not a multiple of 10
    if (high % 10 !== 0) {
      let result = buildSegment(high, includeOptionalAnd) + HUNDRED
      if (low > 0) {
        const lowWord = buildSegment(low, includeOptionalAnd)
        if (includeOptionalAnd && low < 13) {
          result += ' en ' + lowWord
        } else {
          result += ' ' + lowWord
        }
      }
      return applyAccent(result)
    }
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "duizend" not "eenduizend"
      result = SCALES[0]
    } else {
      // Compound: "vijfduizend"
      result = buildSegment(thousands, includeOptionalAnd) + SCALES[0]
    }

    if (remainder > 0) {
      const remainderWord = buildSegment(remainder, includeOptionalAnd)
      if (includeOptionalAnd && remainder < 13) {
        result += ' en ' + remainderWord
      } else {
        result += ' ' + remainderWord
      }
    }

    return applyAccent(result)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return applyAccent(buildLargeNumberWords(n, options))
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction (4x faster than string slicing).
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words
 */
function buildLargeNumberWords (n, options) {
  const { includeOptionalAnd } = options

  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly (avoids object allocation and join)
  let result = ''
  let prevWasScale = false

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0) continue

    if (i === 0) {
      // Units segment
      const word = buildSegment(segment, includeOptionalAnd)
      if (result) {
        if (prevWasScale && includeOptionalAnd && segment < 13) {
          result += ' en ' + word
        } else {
          result += ' ' + word
        }
      } else {
        result = word
      }
      prevWasScale = false
    } else if (i === 1) {
      // Thousands - compound
      if (result) result += ' '
      if (segment === 1) {
        result += SCALES[0]
      } else {
        result += buildSegment(segment, includeOptionalAnd) + SCALES[0]
      }
      prevWasScale = true
    } else {
      // Million and above - space around scale
      const scaleWord = SCALES[i - 1]
      if (result) result += ' '
      if (segment === 1) {
        result += 'een ' + scaleWord
      } else {
        result += buildSegment(segment, includeOptionalAnd) + ' ' + scaleWord
      }
      prevWasScale = true
    }
  }

  return result
}

/**
 * Converts decimal digits to Dutch words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words for decimal part
 */
function decimalPartToWords (decimalPart, options) {
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
    const word = integerToWords(BigInt(remainder), { ...options, noHundredPairing: true })
    result += word
  }

  return result
}

/**
 * Converts a numeric value to Dutch words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.accentOne=true] - Use "één" instead of "een"
 * @param {boolean} [options.includeOptionalAnd=false] - Include "en" before small numbers
 * @param {boolean} [options.noHundredPairing=false] - Disable hundred pairing (1104→duizend honderdvier)
 * @returns {string} The number in Dutch words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)                        // 'eenentwintig'
 * toCardinal(1)                         // 'één'
 * toCardinal(1, {accentOne: false})     // 'een'
 * toCardinal(1104)                      // 'elfhonderd vier'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Apply option defaults
  const {
    accentOne = true,
    includeOptionalAnd = false,
    noHundredPairing = false
  } = options

  const opts = { accentOne, includeOptionalAnd, noHundredPairing }

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, opts)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, opts)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal }
