/**
 * Italian language converter - Functional Implementation
 *
 * A purely functional, performance-optimized number-to-words converter.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Italian-specific rules:
 * - Concatenation without spaces within segments ("ventotto" not "venti otto")
 * - Phonetic vowel elision: "venti" + "otto" → "ventotto"
 * - Accent on final "tre" in compounds: "ventitré"
 * - mille/mila alternation for thousands
 * - Scale words: milione/milioni, miliardo/miliardi, etc.
 * - "e" connector before simple final remainder
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Arrays indexed 0-9
const ONES = [
  '', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'
]

// Teens: index 0-9 for 10-19
const TEENS = [
  'dieci', 'undici', 'dodici', 'tredici', 'quattordici',
  'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'
]

// Tens: index 2-9 for 20-90 (0-1 unused)
const TENS = [
  '', '', 'venti', 'trenta', 'quaranta',
  'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'
]

// Hundreds: index 1-9 for 100-900 (0 unused)
const HUNDREDS = [
  '', 'cento', 'duecento', 'trecento', 'quattrocento',
  'cinquecento', 'seicento', 'settecento', 'ottocento', 'novecento'
]

const ZERO = 'zero'
const NEGATIVE = 'meno'
const DECIMAL_SEP = 'virgola'

// Thousands
const THOUSAND_SINGULAR = 'mille'
const THOUSAND_PLURAL_SUFFIX = 'mila'

// Scale word prefixes for generating -ilione/-iliardo
const SCALE_PREFIXES = ['m', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec']

// Phonetic rules for vowel elision
const PHONETIC_RULES = [
  ['io', 'o'], // ventiotto
  ['ao', 'o'], // quarantotto
  ['oo', 'o'], // centotto
  ['iu', 'u'], // ventuno
  ['au', 'u'] // quarantuno
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Applies Italian phonetic vowel elision rules.
 *
 * @param {string} str - String to process
 * @returns {string} String with phonetic rules applied
 */
function applyPhoneticRules (str) {
  let result = str
  for (const [pattern, replacement] of PHONETIC_RULES) {
    // Use split/join for global replace (faster than regex for simple patterns)
    result = result.split(pattern).join(replacement)
  }
  return result
}

/**
 * Adds accent to final "tre" in compound words.
 * "ventitre" → "ventitré"
 *
 * @param {string} str - String to process
 * @returns {string} String with accentuated final tre
 */
function accentuateFinalTre (str) {
  return str.split(' ').map(word => {
    // Only accentuate "tre" when it's part of a compound (word length > 3)
    if (word.length > 3 && word.slice(-3) === 'tre') {
      // First remove any existing accent, then add it back at the end
      return word.split('tré').join('tre').slice(0, -3) + 'tré'
    }
    // Remove any accents from standalone "tre" or non-final
    return word.split('tré').join('tre')
  }).join(' ')
}

/**
 * Gets the scale word for a given scale index.
 * Italian uses short scale with -ilione/-iliardo pattern.
 *
 * @param {number} scaleIndex - Scale level (2 = million, 3 = billion, etc.)
 * @param {bigint} segment - Segment value for pluralization
 * @returns {string} Scale word
 */
function getScaleWord (scaleIndex, segment) {
  if (scaleIndex < 2) return ''

  // scaleIndex 2 → prefix[0] + ilione (milione)
  // scaleIndex 3 → prefix[0] + iliardo (miliardo)
  // scaleIndex 4 → prefix[1] + ilione (bilione)
  const prefixIndex = Math.floor((scaleIndex - 2) / 2)
  const isIardo = (scaleIndex - 2) % 2 === 1

  const prefix = SCALE_PREFIXES[prefixIndex]
  if (!prefix) return ''

  const suffix = isIardo ? 'iliardo' : 'ilione'
  const baseWord = prefix + suffix

  // Pluralize: -one → -oni, -ardo → -ardi
  if (segment > 1n) {
    return baseWord.slice(0, -1) + 'i'
  }

  return baseWord
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a 3-digit segment (0-999) to Italian words.
 * Returns concatenated form (no spaces).
 *
 * @param {bigint} n - Number between 0 and 999
 * @param {number} scaleIndex - Scale level for context
 * @returns {string} Italian words (concatenated)
 */
function segmentToWords (n, scaleIndex = 0) {
  if (n === 0n) return ''

  const num = Number(n)
  const ones = num % 10
  const tens = Math.floor(num / 10) % 10
  const hundreds = Math.floor(num / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
  }

  // Tens and ones
  if (tens === 0 && ones === 0) {
    // Nothing more to add
  } else if (tens === 1) {
    // Teens: 10-19
    result += TEENS[ones]
  } else if (tens >= 2) {
    // 20-99
    result += TENS[tens]
    if (ones > 0) {
      // "un" before scale words (milione, etc.) when ones=1 and tens=0
      // but here tens >= 2, so use normal form
      result += ONES[ones]
    }
  } else if (ones > 0) {
    // 1-9 (tens === 0)
    // Use "un" before scale words (milione, miliardo, etc.)
    if (ones === 1 && scaleIndex >= 2) {
      result += 'un'
    } else {
      result += ONES[ones]
    }
  }

  return applyPhoneticRules(result)
}

/**
 * Builds words for numbers 1000-999999.
 *
 * @param {bigint} n - Number between 1000 and 999999
 * @returns {string} Italian words
 */
function buildThousandsWords (n) {
  const thousands = n / 1000n
  const remainder = n % 1000n

  let result
  if (thousands === 1n) {
    result = THOUSAND_SINGULAR
  } else {
    const thousandsWords = segmentToWords(thousands, 1)
    result = applyPhoneticRules(thousandsWords + THOUSAND_PLURAL_SUFFIX)
  }

  if (remainder > 0n) {
    result += segmentToWords(remainder, 0)
  }

  return result
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Italian words
 */
function buildLargeNumberWords (n) {
  const parts = []
  let remaining = n

  // Find the highest scale
  let maxScale = 2
  let testValue = 1_000_000n
  while (testValue * 1000n <= remaining) {
    testValue *= 1000n
    maxScale++
  }

  // Process from highest scale down
  for (let scaleIndex = maxScale; scaleIndex >= 0; scaleIndex--) {
    const divisor = 1000n ** BigInt(scaleIndex)
    const segment = remaining / divisor
    remaining = remaining % divisor

    if (segment === 0n) continue

    if (scaleIndex >= 2) {
      // Millions and above: "segment scaleWord"
      const segmentWords = segmentToWords(segment, scaleIndex)
      const scaleWord = getScaleWord(scaleIndex, segment)
      parts.push(segmentWords + ' ' + scaleWord)
    } else if (scaleIndex === 1) {
      // Thousands: concatenated
      if (segment === 1n) {
        parts.push(THOUSAND_SINGULAR)
      } else {
        const segmentWords = segmentToWords(segment, scaleIndex)
        parts.push(applyPhoneticRules(segmentWords + THOUSAND_PLURAL_SUFFIX))
      }
    } else {
      // Units (scaleIndex === 0): just the segment
      parts.push(segmentToWords(segment, 0))
    }
  }

  return joinPartsWithConnector(parts)
}

/**
 * Joins parts with Italian connector rules.
 * Uses "e" before simple (non-compound) final segment.
 *
 * @param {string[]} parts - Parts to join
 * @returns {string} Joined string
 */
function joinPartsWithConnector (parts) {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]

  // Check if last part is "simple" (no space = no scale word)
  const lastPart = parts[parts.length - 1]
  if (!lastPart.includes(' ')) {
    const allButLast = parts.slice(0, -1).join(' ')
    return allButLast + ' e ' + lastPart
  }

  return parts.join(' ')
}

/**
 * Converts a non-negative integer to Italian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Italian words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  let result
  if (n < 1000n) {
    result = segmentToWords(n, 0)
  } else if (n < 1_000_000n) {
    result = buildThousandsWords(n)
  } else {
    result = buildLargeNumberWords(n)
  }

  return accentuateFinalTre(result)
}

/**
 * Converts decimal digits to Italian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Italian words for decimal part
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
 * Converts a numeric value to Italian words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Italian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(28)           // 'ventotto'
 * toWords(23)           // 'ventitré'
 * toWords(1000)         // 'mille'
 * toWords(2000)         // 'duemila'
 * toWords(1000000)      // 'un milione'
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

// Named exports for testing
export {
  ONES,
  TEENS,
  TENS,
  HUNDREDS,
  ZERO,
  applyPhoneticRules,
  accentuateFinalTre,
  getScaleWord,
  segmentToWords,
  integerToWords,
  decimalPartToWords
}
