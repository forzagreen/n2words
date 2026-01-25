/**
 * Canadian English language converter
 *
 * CLDR: en-CA | English as used in Canada
 *
 * Exports:
 * - toCardinal(value, options?)  - Cardinal numbers: 42 → "forty-two"
 * - toOrdinal(value)             - Ordinal numbers: 42 → "forty-second"
 * - toCurrency(value, options?)  - Currency: 42.50 → "forty-two dollars and fifty cents"
 *
 * Canadian English conventions:
 * - Follows British English style for number words
 * - "and" after hundreds: "one hundred and twenty-three" (default)
 * - "and" before final segment: "one million and one" (default)
 * - Hyphenated tens-ones: "twenty-one", "forty-two"
 * - Western numbering system (short scale: billion = 10^9)
 * - Optional hundred-pairing: 1500 → "fifteen hundred" (colloquial)
 * - Optional "and" omission: 101 → "one hundred one" (American style)
 * - Currency: Canadian Dollar (CAD) - dollar/dollars, cent/cents
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// VOCABULARY
// ============================================================================

// Cardinal vocabulary
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const SCALES = [
  'thousand', 'million', 'billion', 'trillion', 'quadrillion',
  'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion',
  'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
  'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion',
  'vigintillion'
]
const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
const ORDINAL_TEENS = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth']
const ORDINAL_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

// Currency vocabulary (Canadian Dollar)
const DOLLAR = 'dollar'
const DOLLARS = 'dollars'
const CENT = 'cent'
const CENTS = 'cents'

// ============================================================================
// SHARED HELPERS
// ============================================================================

// Reusable result object to avoid allocation per call
const segmentResult = { word: '', hasHundred: false }

/**
 * Builds words for a 0-999 segment.
 *
 * @param {number} n - Number 0-999
 * @param {boolean} useAnd - Whether to use "and" after hundreds
 * @returns {{ word: string, hasHundred: boolean }}
 */
function buildSegment (n, useAnd) {
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

  // Hundreds place
  if (hundreds > 0) {
    if (tensOnes) {
      const connector = useAnd ? ' and ' : ' '
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED + connector + tensOnes
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

// ============================================================================
// CARDINAL: toCardinal(value, options?)
// ============================================================================

/**
 * Converts a non-negative integer to English words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} hundredPairing - Use hundred-pairing for 1100-9999
 * @param {boolean} useAnd - Use "and" after hundreds and before final segment
 * @returns {string} English words
 */
function integerToWords (n, hundredPairing, useAnd) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n), useAnd).word
  }

  // Hundred-pairing: 1100-9999 → "eleven hundred" to "ninety-nine hundred ninety-nine"
  if (hundredPairing && n >= 1100n && n <= 9999n) {
    const num = Number(n)
    const highPart = Math.trunc(num / 100)
    const lowPart = num % 100

    const { word: highWord } = buildSegment(highPart, useAnd)
    let result = highWord + ' ' + HUNDRED

    if (lowPart > 0) {
      const { word: lowWord } = buildSegment(lowPart, useAnd)
      // Add "and" before remainder if useAnd is true
      if (useAnd) {
        result += ' and'
      }
      result += ' ' + lowWord
    }

    return result
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const { word: thousandsWord } = buildSegment(thousands, useAnd)
    let result = thousandsWord + ' ' + SCALES[0]

    if (remainder > 0) {
      const { word: remainderWord, hasHundred } = buildSegment(remainder, useAnd)
      // Add "and" before remainder if useAnd is true and remainder has no hundred
      if (useAnd && !hasHundred) {
        result += ' and'
      }
      result += ' ' + remainderWord
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, useAnd)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} useAnd - Use "and" after hundreds and before final segment
 * @returns {string} English words
 */
function buildLargeNumberWords (n, useAnd) {
  // Extract segments using BigInt division
  // Segments are stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the first (smallest index) non-zero segment - this is processed last
  let firstNonZeroIdx = -1
  if (useAnd) {
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] !== 0) {
        firstNonZeroIdx = i
        break
      }
    }
  }

  // Build result string (process from most-significant to least)
  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const { word, hasHundred } = buildSegment(segment, useAnd)
    const isLastSegment = (i === firstNonZeroIdx)

    // Add "and" only before FINAL segment if it follows scale and doesn't have hundred
    if (useAnd && result && isLastSegment && prevWasScale && !hasHundred) {
      result += ' and'
    }

    // Add segment word
    if (result) result += ' '
    result += word

    // Add scale word (i=0 is units, i=1 is thousands, etc.)
    if (i > 0) {
      result += ' ' + SCALES[i - 1]
      prevWasScale = true
    } else {
      prevWasScale = false
    }
  }

  return result
}

/**
 * Converts decimal digits to English words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} useAnd - Use "and" in number conversion
 * @returns {string} English words for decimal part
 */
function decimalPartToWords (decimalPart, useAnd) {
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
    result += integerToWords(BigInt(remainder), false, useAnd)
  }

  return result
}

/**
 * Converts a numeric value to Canadian English words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.hundredPairing=false] - Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")
 * @param {boolean} [options.and=true] - Use "and" after hundreds and before final small numbers (default: true, Canadian/British style)
 * @returns {string} The number in Canadian English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)                            // 'forty-two'
 * toCardinal(101)                           // 'one hundred and one'
 * toCardinal(101, { and: false })           // 'one hundred one'
 * toCardinal(1500)                          // 'one thousand five hundred'
 * toCardinal(1500, { hundredPairing: true }) // 'fifteen hundred'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Extract options with defaults (Canadian English uses "and" like British English)
  const { hundredPairing = false, and: useAnd = true } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, hundredPairing, useAnd)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, useAnd)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Builds ordinal words for a 0-999 segment (final segment only).
 * Returns ordinal form: "first", "twenty-third", "one hundred forty-fifth"
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
    // Teens: 10-19 → "tenth" through "nineteenth"
    tensOnesOrdinal = ORDINAL_TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      // Compound: "twenty-first", "thirty-second", etc.
      tensOnesOrdinal = TENS[tens] + '-' + ORDINAL_ONES[ones]
    } else {
      // Round tens: "twentieth", "thirtieth", etc.
      tensOnesOrdinal = ORDINAL_TENS[tens]
    }
  } else if (ones > 0) {
    // Single digit: "first", "second", etc.
    tensOnesOrdinal = ORDINAL_ONES[ones]
  }

  // Hundreds place
  if (hundreds > 0) {
    if (tensOnesOrdinal) {
      // "one hundred twenty-first"
      return ONES[hundreds] + ' ' + HUNDRED + ' ' + tensOnesOrdinal
    } else {
      // "one hundredth", "two hundredth", etc.
      return ONES[hundreds] + ' hundredth'
    }
  }

  return tensOnesOrdinal
}

/**
 * Converts a positive integer to ordinal words.
 * Generates ordinals directly without string manipulation.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal English words
 */
function integerToOrdinal (n) {
  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      // Exact thousands: "one thousandth", "five thousandth"
      return buildSegment(thousands, false).word + ' ' + SCALES[0] + 'th'
    }

    // Has remainder: cardinal thousands + ordinal remainder
    const { word: thousandsWord } = buildSegment(thousands, false)
    return thousandsWord + ' ' + SCALES[0] + ' ' + buildOrdinalSegment(remainder)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 * All segments except the final one are cardinal; final segment is ordinal.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal English words
 */
function buildLargeOrdinal (n) {
  // Extract segments (least-significant first)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
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
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const isLowestSegment = (i === lowestNonZeroIdx)

    if (result) result += ' '

    if (isLowestSegment) {
      // Final non-zero segment gets ordinal treatment
      if (i === 0) {
        // Units position: use ordinal segment
        result += buildOrdinalSegment(segment)
      } else {
        // Scale position with no remainder below: "one millionth"
        result += buildSegment(segment, false).word + ' ' + SCALES[i - 1] + 'th'
      }
    } else {
      // Non-final segments are cardinal
      result += buildSegment(segment, false).word
      if (i > 0) {
        result += ' ' + SCALES[i - 1]
      }
    }
  }

  return result
}

/**
 * Converts a numeric value to Canadian English ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words (e.g., "first", "forty-second")
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'first'
 * toOrdinal(2)    // 'second'
 * toOrdinal(3)    // 'third'
 * toOrdinal(21)   // 'twenty-first'
 * toOrdinal(42)   // 'forty-second'
 * toOrdinal(100)  // 'one hundredth'
 * toOrdinal(101)  // 'one hundred first'
 * toOrdinal(1000) // 'one thousandth'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Canadian English currency words.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "and" between dollars and cents (e.g., "one dollar and fifty cents")
 * @returns {string} The amount in Canadian English currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                    // 'forty-two dollars and fifty cents'
 * toCurrency(1)                        // 'one dollar'
 * toCurrency(0.99)                     // 'ninety-nine cents'
 * toCurrency(42.50, { and: false })    // 'forty-two dollars fifty cents'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Dollars part (show if non-zero, or if no cents)
  if (dollars > 0n || cents === 0n) {
    result += integerToWords(dollars, false, false)
    result += ' ' + (dollars === 1n ? DOLLAR : DOLLARS)
  }

  // Cents part
  if (cents > 0n) {
    if (dollars > 0n) {
      result += useAnd ? ' and ' : ' '
    }
    result += integerToWords(cents, false, false)
    result += ' ' + (cents === 1n ? CENT : CENTS)
  }

  return result
}

// ============================================================================
// EXPORTS
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
