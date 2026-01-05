/**
 * Italian language converter - Functional Implementation v2
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all 1000 segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Italian-specific rules (handled in precomputation):
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

// Base vocabulary for building lookup tables
const ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove']
const TEENS = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove']
const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta']
const HUNDREDS = ['', 'cento', 'duecento', 'trecento', 'quattrocento', 'cinquecento', 'seicento', 'settecento', 'ottocento', 'novecento']

const ZERO = 'zero'
const NEGATIVE = 'meno'
const DECIMAL_SEP = 'virgola'

// Thousands
const THOUSAND_SINGULAR = 'mille'
const THOUSAND_PLURAL_SUFFIX = 'mila'

// Scale word generation
const SCALE_PREFIXES = ['m', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec']

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Applies Italian phonetic vowel elision rules.
 * Only used during table construction.
 */
function applyPhoneticRules (str) {
  return str
    .replace(/io/g, 'o')
    .replace(/ao/g, 'o')
    .replace(/oo/g, 'o')
    .replace(/iu/g, 'u')
    .replace(/au/g, 'u')
}

/**
 * Adds accent to final "tre" in a word.
 * Only used during table construction.
 */
function accentuateTre (word) {
  if (word.length > 3 && word.slice(-3) === 'tre') {
    return word.slice(0, -3) + 'tré'
  }
  return word
}

/**
 * Builds the segment word for a number 0-999.
 * Only used during table construction.
 */
function buildSegmentWord (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
  }

  // Tens and ones
  if (tens === 0 && ones === 0) {
    // Nothing more
  } else if (tens === 1) {
    // Teens: 10-19
    result += TEENS[ones]
  } else if (tens >= 2) {
    // 20-99
    result += TENS[tens]
    if (ones > 0) {
      result += ONES[ones]
    }
  } else if (ones > 0) {
    // 1-9 (tens === 0)
    result += ONES[ones]
  }

  // Apply phonetic rules and accent
  return accentuateTre(applyPhoneticRules(result))
}

/**
 * Builds segment word with "un" for scale context (millions, billions).
 * Only used during table construction.
 */
function buildSegmentWordForScale (n) {
  if (n === 0) return ''
  if (n === 1) return 'un' // "un milione" not "uno milione"

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
  }

  if (tens === 0 && ones === 0) {
    // Nothing more
  } else if (tens === 1) {
    result += TEENS[ones]
  } else if (tens >= 2) {
    result += TENS[tens]
    if (ones > 0) {
      result += ONES[ones]
    }
  } else if (ones > 0) {
    // 1-9 with tens === 0
    // "un" only for exactly 1, others normal
    result += ONES[ones]
  }

  return accentuateTre(applyPhoneticRules(result))
}

// Precompute all 1000 segment words (0-999)
// SEGMENTS[n] gives the Italian word for n within a segment
const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegmentWord(i)
}

// Precompute segment words for scale context (uses "un" for 1)
const SEGMENTS_SCALE = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_SCALE[i] = buildSegmentWordForScale(i)
}

// Precompute thousands words (1-999) + "mila" suffix
// THOUSANDS[n] gives the word for n thousand (e.g., THOUSANDS[2] = "duemila")
const THOUSANDS = new Array(1000)
THOUSANDS[0] = ''
THOUSANDS[1] = THOUSAND_SINGULAR // "mille"
for (let i = 2; i < 1000; i++) {
  THOUSANDS[i] = applyPhoneticRules(SEGMENTS[i] + THOUSAND_PLURAL_SUFFIX)
}

// ============================================================================
// Scale Word Functions
// ============================================================================

/**
 * Gets singular scale word for index.
 * @param {number} scaleIndex - 2=million, 3=billion, etc.
 */
function getScaleWordSingular (scaleIndex) {
  if (scaleIndex < 2) return ''
  const prefixIndex = Math.floor((scaleIndex - 2) / 2)
  const isIardo = (scaleIndex - 2) % 2 === 1
  const prefix = SCALE_PREFIXES[prefixIndex]
  if (!prefix) return ''
  return prefix + (isIardo ? 'iliardo' : 'ilione')
}

/**
 * Gets plural scale word for index.
 * @param {number} scaleIndex - 2=million, 3=billion, etc.
 */
function getScaleWordPlural (scaleIndex) {
  if (scaleIndex < 2) return ''
  const prefixIndex = Math.floor((scaleIndex - 2) / 2)
  const isIardo = (scaleIndex - 2) % 2 === 1
  const prefix = SCALE_PREFIXES[prefixIndex]
  if (!prefix) return ''
  return prefix + (isIardo ? 'iliardi' : 'ilioni')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Italian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Italian words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return SEGMENTS[Number(n)]
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      return THOUSANDS[thousands]
    }

    // Concatenate thousands + remainder
    return THOUSANDS[thousands] + SEGMENTS[remainder]
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
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

    const segNum = Number(segment)

    if (scaleIndex >= 2) {
      // Millions and above: "segment scaleWord"
      const segmentWords = SEGMENTS_SCALE[segNum]
      const scaleWord = segment === 1n
        ? getScaleWordSingular(scaleIndex)
        : getScaleWordPlural(scaleIndex)
      parts.push(segmentWords + ' ' + scaleWord)
    } else if (scaleIndex === 1) {
      // Thousands: use precomputed table
      parts.push(THOUSANDS[segNum])
    } else {
      // Units (scaleIndex === 0): just the segment
      parts.push(SEGMENTS[segNum])
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
  const len = parts.length
  if (len === 0) return ''
  if (len === 1) return parts[0]

  // Check if last part is "simple" (no space = no scale word)
  const lastPart = parts[len - 1]
  if (lastPart.indexOf(' ') === -1) {
    // Join all but last with space, then add "e" connector
    let result = parts[0]
    for (let i = 1; i < len - 1; i++) {
      result += ' ' + parts[i]
    }
    return result + ' e ' + lastPart
  }

  // Join with spaces
  let result = parts[0]
  for (let i = 1; i < len; i++) {
    result += ' ' + parts[i]
  }
  return result
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
