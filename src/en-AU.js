/**
 * English (Australia) language converter
 *
 * CLDR: en-AU | English as used in Australia
 *
 * Key features:
 * - Western numbering system (short scale: billion = 10^9)
 * - British-style "and" after hundreds
 * - Australian Dollar currency (AUD)
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

// Currency vocabulary (Australian Dollar)
const DOLLAR = 'dollar'
const DOLLARS = 'dollars'
const CENT = 'cent'
const CENTS = 'cents'

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

  // Hundreds place (British-style: always "and" after hundreds)
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

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to English words.
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

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const { word: thousandsWord } = buildSegment(thousands)
    let result = thousandsWord + ' ' + SCALES[0]

    if (remainder > 0) {
      const { word: remainderWord, hasHundred } = buildSegment(remainder)
      result += hasHundred ? ' ' + remainderWord : ' and ' + remainderWord
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
 * @returns {string} English words
 */
function buildLargeNumberWords (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  let firstNonZeroIdx = -1
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const { word, hasHundred } = buildSegment(segment)
    const isLastSegment = (i === firstNonZeroIdx)

    if (result && isLastSegment && prevWasScale && !hasHundred) {
      result += ' and'
    }

    if (result) result += ' '
    result += word

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
 * @returns {string} English words for decimal part
 */
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
 * Converts a numeric value to Australian English words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)           // 'forty-two'
 * toCardinal(101)          // 'one hundred and one'
 * toCardinal(1000000)      // 'one million'
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
 * Builds ordinal words for a 0-999 segment.
 *
 * @param {number} n - Number 0-999
 * @returns {string} Ordinal words for this segment
 */
function buildOrdinalSegment (n) {
  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

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
 * Converts a positive integer to ordinal words.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal English words
 */
function integerToOrdinal (n) {
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      return buildSegment(thousands).word + ' ' + SCALES[0] + 'th'
    }

    const { word: thousandsWord } = buildSegment(thousands)
    return thousandsWord + ' ' + SCALES[0] + ' ' + buildOrdinalSegment(remainder)
  }

  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal English words
 */
function buildLargeOrdinal (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const isLowestSegment = (i === lowestNonZeroIdx)

    if (result) result += ' '

    if (isLowestSegment) {
      if (i === 0) {
        result += buildOrdinalSegment(segment)
      } else {
        result += buildSegment(segment).word + ' ' + SCALES[i - 1] + 'th'
      }
    } else {
      result += buildSegment(segment).word
      if (i > 0) {
        result += ' ' + SCALES[i - 1]
      }
    }
  }

  return result
}

/**
 * Converts a numeric value to Australian English ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'first'
 * toOrdinal(42)   // 'forty-second'
 * toOrdinal(100)  // 'one hundredth'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Australian English currency words.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "and" between dollars and cents
 * @returns {string} The amount in Australian English currency words
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

  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  if (dollars > 0n || cents === 0n) {
    result += integerToWords(dollars)
    result += ' ' + (dollars === 1n ? DOLLAR : DOLLARS)
  }

  if (cents > 0n) {
    if (dollars > 0n) {
      result += useAnd ? ' and ' : ' '
    }
    result += integerToWords(cents)
    result += ' ' + (cents === 1n ? CENT : CENTS)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
