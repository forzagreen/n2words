/**
 * Filipino (Philippines) language converter
 *
 * CLDR: fil-PH | Filipino as used in the Philippines
 *
 * Key features:
 * - Linker "ng" after vowels: "isang daang" (100)
 * - Linker " na " after consonants: "siyam na daang" (900)
 * - Special tens with linker: "limampung anim" (56)
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'isa', 'dalawa', 'tatlo', 'apat', 'lima', 'anim', 'pito', 'walo', 'siyam']
const TEENS = ['sampu', 'labinisa', 'labindalawa', 'labintatlo', 'labinapat', 'labinlima', 'labinanum', 'labimpito', 'labingwalo', 'labinsiyam']
const TENS = ['', '', 'dalawampu', 'tatlumpu', 'apatnapu', 'limampu', 'animnapu', 'pitumpu', 'walumpu', 'siyamnapu']

// Scale words include linker (end with "ng")
const HUNDRED = 'daang'
const THOUSAND = 'libong'

const ZERO = 'zero'
const NEGATIVE = 'negatibo'
const DECIMAL_SEP = 'punto'

// Short scale with linker
const SCALE_WORDS = ['', THOUSAND, 'milyong', 'bilyong', 'trilyong']

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Filipino ordinals use "ika-" prefix: ika-isa (1st), ikalawa (2nd), etc.
// Special forms for 1st and 2nd
const ORDINAL_PREFIX = 'ika'
const ORDINAL_SPECIAL = {
  1: 'una', // first
  2: 'ikalawa' // second (contracted form)
}

// ============================================================================
// Currency Vocabulary (Philippine Peso)
// ============================================================================

const PESO = 'piso'
const SENTIMO = 'sentimo'

// ============================================================================
// Helper Functions
// ============================================================================

const VOWELS = ['a', 'e', 'i', 'o', 'u']

function addLinker (word) {
  const lastChar = word[word.length - 1]
  if (VOWELS.includes(lastChar)) {
    return word + 'ng'
  }
  return word + ' na'
}

// ============================================================================
// Segment Building
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Hundreds: "isang daan", "dalawang daan", "siyam na daan"
  if (hundredsDigit > 0) {
    const hundredPrefix = addLinker(ONES[hundredsDigit])
    parts.push(hundredPrefix + ' ' + HUNDRED)
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    // Teens (10-19)
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    // Even tens (20, 30, 40, etc.)
    parts.push(TENS[tensDigit])
  } else {
    // Tens + ones
    // limampu (50) gets special linker: "limampung anim" (56)
    if (tensDigit === 5) {
      parts.push(TENS[tensDigit] + 'ng ' + ONES[ones])
    } else {
      parts.push(TENS[tensDigit] + ' ' + ONES[ones])
    }
  }

  return parts.join(' ')
}

/**
 * Builds segment with linker added to last word (for use before scale words).
 */
function buildSegmentWithLinker (n) {
  const segmentWord = buildSegment(n)
  if (!segmentWord) return ''

  // Find the last space to get the last word
  const lastSpaceIdx = segmentWord.lastIndexOf(' ')
  if (lastSpaceIdx === -1) {
    // Single word
    const lastChar = segmentWord[segmentWord.length - 1]
    if (lastChar === 'g' && segmentWord.endsWith('ng')) {
      return segmentWord // Already has linker
    }
    return addLinker(segmentWord)
  }

  // Multi-word: add linker to last word
  const prefix = segmentWord.slice(0, lastSpaceIdx + 1)
  const lastWord = segmentWord.slice(lastSpaceIdx + 1)

  if (lastWord.endsWith('ng')) {
    return segmentWord // Already has linker
  }
  return prefix + addLinker(lastWord)
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  return buildLargeNumberWords(n)
}

/**
 * Builds words for large numbers using BigInt division.
 * @param {bigint} n - Number >= 1000
 * @returns {string} Filipino words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt division (faster than string slicing)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0) continue

    const scaleWord = SCALE_WORDS[i] || ''

    if (result) result += ' '

    if (i === 0) {
      result += buildSegment(segment)
    } else {
      // Add linker to segment before scale word
      const segmentWord = buildSegmentWithLinker(segment)
      result += segmentWord + ' ' + scaleWord
    }
  }

  return result
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Filipino words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Filipino words
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
 * Converts a non-negative integer to Filipino ordinal words.
 *
 * Filipino ordinals: una (1st), ikalawa (2nd), then ika- + cardinal.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Filipino ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1st and 2nd
  if (n === 1n) return ORDINAL_SPECIAL[1]
  if (n === 2n) return ORDINAL_SPECIAL[2]

  // For 3+, use ika- prefix + cardinal
  return ORDINAL_PREFIX + '-' + integerToWords(n)
}

/**
 * Converts a numeric value to Filipino ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'una'
 * toOrdinal(2)    // 'ikalawa'
 * toOrdinal(3)    // 'ika-tatlo'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Filipino currency words (Philippine Peso).
 *
 * Uses piso (peso) and sentimo (centavo).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Filipino currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'apatnapu dalawang piso'
 * toCurrency(1.50)   // 'isang piso at limampung sentimo'
 * toCurrency(-5)     // 'negatibo limang piso'
 */
function toCurrency (value) {
  const { isNegative, dollars: pesos, cents: sentimos } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Pesos part
  if (pesos > 0n || sentimos === 0n) {
    // Add linker before "piso"
    const pesoWords = integerToWords(pesos)
    if (pesos === 0n) {
      result += pesoWords + ' ' + PESO
    } else {
      // Need to add linker to the last word before "piso"
      const lastSpaceIdx = pesoWords.lastIndexOf(' ')
      if (lastSpaceIdx === -1) {
        // Single word
        result += addLinker(pesoWords) + ' ' + PESO
      } else {
        const prefix = pesoWords.slice(0, lastSpaceIdx + 1)
        const lastWord = pesoWords.slice(lastSpaceIdx + 1)
        if (lastWord.endsWith('ng')) {
          result += pesoWords + ' ' + PESO
        } else {
          result += prefix + addLinker(lastWord) + ' ' + PESO
        }
      }
    }
  }

  // Sentimos part
  if (sentimos > 0n) {
    if (pesos > 0n) {
      result += ' at '
    }
    const sentimoWords = integerToWords(sentimos)
    // Add linker before "sentimo"
    const lastSpaceIdx = sentimoWords.lastIndexOf(' ')
    if (lastSpaceIdx === -1) {
      // Single word
      result += addLinker(sentimoWords) + ' ' + SENTIMO
    } else {
      const prefix = sentimoWords.slice(0, lastSpaceIdx + 1)
      const lastWord = sentimoWords.slice(lastSpaceIdx + 1)
      if (lastWord.endsWith('ng')) {
        result += sentimoWords + ' ' + SENTIMO
      } else {
        result += prefix + addLinker(lastWord) + ' ' + SENTIMO
      }
    }
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
