/**
 * American English language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * American English conventions:
 * - No "and" after hundreds: "one hundred twenty-three" (default)
 * - No "and" before final segment: "one million one" (default)
 * - Hyphenated tens-ones: "twenty-one", "forty-two"
 * - Western numbering system (short scale: billion = 10^9)
 * - Optional hundred-pairing: 1500 → "fifteen hundred" (colloquial)
 * - Optional "and" insertion: 101 → "one hundred and one" (informal)
 */

import { parseNumericValue } from './utils/parse-numeric.js'
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

// ============================================================================
// Segment Building
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
// Conversion Functions
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
 * Converts a numeric value to American English words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.hundredPairing=false] - Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")
 * @param {boolean} [options.and=false] - Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")
 * @returns {string} The number in American English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(42)                            // 'forty-two'
 * toWords(101)                           // 'one hundred one'
 * toWords(101, { and: true })            // 'one hundred and one'
 * toWords(1500)                          // 'one thousand five hundred'
 * toWords(1500, { hundredPairing: true }) // 'fifteen hundred'
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Extract options with defaults
  const { hundredPairing = false, and: useAnd = false } = options

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
// Ordinal Conversion
// ============================================================================

/**
 * Converts cardinal words to ordinal form.
 * Only the final word is converted (e.g., "twenty-one" → "twenty-first").
 *
 * @param {string} cardinal - Cardinal number words
 * @returns {string} Ordinal number words
 */
function cardinalToOrdinal (cardinal) {
  // Handle hyphenated compounds (e.g., "twenty-one" → "twenty-first")
  const lastSpaceIdx = cardinal.lastIndexOf(' ')
  const lastHyphenIdx = cardinal.lastIndexOf('-')
  const splitIdx = Math.max(lastSpaceIdx, lastHyphenIdx)

  let prefix = ''
  let lastWord = cardinal
  let separator = ''

  if (splitIdx !== -1) {
    prefix = cardinal.slice(0, splitIdx)
    separator = cardinal[splitIdx]
    lastWord = cardinal.slice(splitIdx + 1)
  }

  // Convert the last word to ordinal
  let ordinalWord

  // Check ones (one → first, two → second, etc.)
  const onesIdx = ONES.indexOf(lastWord)
  if (onesIdx !== -1) {
    ordinalWord = ORDINAL_ONES[onesIdx]
  }

  // Check teens (ten → tenth, eleven → eleventh, etc.)
  if (!ordinalWord) {
    const teensIdx = TEENS.indexOf(lastWord)
    if (teensIdx !== -1) {
      ordinalWord = ORDINAL_TEENS[teensIdx]
    }
  }

  // Check tens (twenty → twentieth, thirty → thirtieth, etc.)
  if (!ordinalWord) {
    const tensIdx = TENS.indexOf(lastWord)
    if (tensIdx !== -1) {
      ordinalWord = ORDINAL_TENS[tensIdx]
    }
  }

  // Check scales and hundred (thousand → thousandth, million → millionth, etc.)
  if (!ordinalWord) {
    if (lastWord === HUNDRED) {
      ordinalWord = 'hundredth'
    } else {
      const scaleIdx = SCALES.indexOf(lastWord)
      if (scaleIdx !== -1) {
        ordinalWord = lastWord + 'th'
      }
    }
  }

  // Fallback: append "th" (shouldn't normally happen)
  if (!ordinalWord) {
    ordinalWord = lastWord + 'th'
  }

  return prefix ? prefix + separator + ordinalWord : ordinalWord
}

/**
 * Converts a numeric value to American English ordinal words.
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
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Ordinals only make sense for positive integers
  if (isNegative) {
    throw new RangeError('Ordinals cannot be negative')
  }
  if (decimalPart) {
    throw new RangeError('Ordinals must be whole numbers')
  }
  if (integerPart === 0n) {
    throw new RangeError('Ordinals cannot be zero')
  }

  // Get cardinal form first
  const cardinal = integerToWords(integerPart, false, false)

  // Convert to ordinal
  return cardinalToOrdinal(cardinal)
}

// ============================================================================
// Public API
// ============================================================================

export { toWords, toOrdinal }
