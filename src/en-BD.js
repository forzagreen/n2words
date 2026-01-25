/**
 * English (Bangladesh) language converter
 *
 * CLDR: en-BD | English as used in Bangladesh
 *
 * Key features:
 * - Indian numbering system (thousand, lakh, crore, arab, kharab)
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - British-style "and" after hundreds
 * - Bangladeshi Taka currency (BDT)
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

// Indian numbering scales: 10^3, 10^5, 10^7, 10^9, 10^11, 10^13, 10^15, 10^17
const SCALES = ['thousand', 'lakh', 'crore', 'arab', 'kharab', 'neel', 'padma', 'shankh']

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
const ORDINAL_TEENS = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth']
const ORDINAL_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

// Currency vocabulary (Bangladeshi Taka)
const TAKA = 'taka'
const PAISA = 'paisa'
const PAISE = 'paise'

// ============================================================================
// Segment Building
// ============================================================================

// Reusable result object to avoid allocation per call
const segmentResult = { word: '', hasHundred: false }

/**
 * Builds words for a 0-999 segment (British-style with "and" after hundreds).
 *
 * @param {number} n - Number 0-999
 * @returns {{ word: string, hasHundred: boolean }}
 */
function buildSegment (n) {
  if (n === 0) {
    segmentResult.word = ''
    segmentResult.hasHundred = false
    return segmentResult
  }

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  // Build tens-ones part first
  let tensOnes = ''
  if (tens === 1) {
    tensOnes = TEENS[ones]
  } else if (tens >= 2) {
    tensOnes = ones > 0 ? TENS[tens] + '-' + ONES[ones] : TENS[tens]
  } else if (ones > 0) {
    tensOnes = ONES[ones]
  }

  // Hundreds place (British-style: "and" after hundreds)
  if (hundreds > 0) {
    if (tensOnes) {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED + ' and ' + tensOnes
    } else {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED
    }
    segmentResult.hasHundred = true
  } else {
    segmentResult.word = tensOnes
    segmentResult.hasHundred = false
  }

  return segmentResult
}

/**
 * Builds words for a 0-99 segment (no hundreds).
 *
 * @param {number} n - Number 0-99
 * @returns {string}
 */
function buildSmallSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.trunc(n / 10)

  if (tens === 1) {
    return TEENS[ones]
  } else if (tens >= 2) {
    return ones > 0 ? TENS[tens] + '-' + ONES[ones] : TENS[tens]
  }
  return ONES[ones]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to English words using Indian numbering.
 *
 * Uses BigInt modulo for segment extraction.
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} English words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Extract segments using BigInt modulo
  // First segment is 3 digits (units), rest are 2 digits (thousands, lakhs, crores, etc.)
  // Segments stored least-significant first
  const segments = []

  // First segment: last 3 digits
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  // Remaining segments: 2 digits each (thousand, lakh, crore, etc.)
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
      const { word, hasHundred } = buildSegment(segment)
      // Add "and" before final segment if previous segments exist and no hundred
      if (words.length > 0 && !hasHundred) {
        words.push('and')
      }
      words.push(word)
    } else {
      // Other segments are 0-99
      words.push(buildSmallSegment(segment))
      // Add scale word
      if (SCALES[i - 1]) {
        words.push(SCALES[i - 1])
      }
    }
  }

  return words.join(' ')
}

/**
 * Converts decimal digits to English words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} English words for decimal part
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
 * Converts a numeric value to English words using Indian numbering.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)           // 'forty-two'
 * toCardinal(100000)       // 'one lakh'
 * toCardinal(10000000)     // 'one crore'
 * toCardinal(1234567)      // 'twelve lakh thirty-four thousand five hundred and sixty-seven'
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
 * Builds ordinal words for a 0-999 segment (final segment only).
 *
 * @param {number} n - Number 0-999
 * @returns {string} Ordinal words for this segment
 */
function buildOrdinalSegment (n) {
  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  // Build ordinal for tens-ones portion
  let tensOnesOrdinal = ''
  if (tens === 1) {
    tensOnesOrdinal = ORDINAL_TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      tensOnesOrdinal = TENS[tens] + '-' + ORDINAL_ONES[ones]
    } else {
      tensOnesOrdinal = ORDINAL_TENS[tens]
    }
  } else if (ones > 0) {
    tensOnesOrdinal = ORDINAL_ONES[ones]
  }

  // Hundreds place
  if (hundreds > 0) {
    if (tensOnesOrdinal) {
      return ONES[hundreds] + ' ' + HUNDRED + ' ' + tensOnesOrdinal
    } else {
      return ONES[hundreds] + ' hundredth'
    }
  }

  return tensOnesOrdinal
}

/**
 * Converts a positive integer to ordinal words using Indian numbering.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal English words
 */
function integerToOrdinal (n) {
  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  // Extract segments using BigInt modulo (3-2-2 pattern)
  const segments = []

  // First segment: last 3 digits
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  // Remaining segments: 2 digits each
  while (temp > 0n) {
    segments.push(Number(temp % 100n))
    temp = temp / 100n
  }

  // Find the lowest non-zero segment (this gets ordinal treatment)
  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  // Build result (most-significant to least)
  const words = []

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const isLowestSegment = (i === lowestNonZeroIdx)

    if (isLowestSegment) {
      // Final non-zero segment gets ordinal treatment
      if (i === 0) {
        // Units position: use ordinal segment
        words.push(buildOrdinalSegment(segment))
      } else {
        // Scale position with no remainder below: "one lakhth"
        words.push(buildSmallSegment(segment))
        words.push(SCALES[i - 1] + 'th')
      }
    } else {
      // Non-final segments are cardinal
      if (i === 0) {
        words.push(buildSegment(segment).word)
      } else {
        words.push(buildSmallSegment(segment))
        words.push(SCALES[i - 1])
      }
    }
  }

  return words.join(' ')
}

/**
 * Converts a numeric value to English ordinal words using Indian numbering.
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)       // 'first'
 * toOrdinal(100000)  // 'one lakhth'
 * toOrdinal(100001)  // 'one lakh first'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Bangladeshi English currency words.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "and" between taka and paise
 * @returns {string} The amount in Bangladeshi English currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                    // 'forty-two taka and fifty paise'
 * toCurrency(100000)                   // 'one lakh taka'
 * toCurrency(1)                        // 'one taka'
 * toCurrency(0.50)                     // 'fifty paise'
 * toCurrency(42.50, { and: false })    // 'forty-two taka fifty paise'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: taka, cents: paise } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Taka part (show if non-zero, or if no paise)
  // Note: "taka" is used for both singular and plural
  if (taka > 0n || paise === 0n) {
    result += integerToWords(taka)
    result += ' ' + TAKA
  }

  // Paise part
  if (paise > 0n) {
    if (taka > 0n) {
      result += useAnd ? ' and ' : ' '
    }
    result += integerToWords(paise)
    result += ' ' + (paise === 1n ? PAISA : PAISE)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
