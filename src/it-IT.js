/**
 * Italian (Italy) language converter
 *
 * CLDR: it-IT | Italian as used in Italy
 *
 * Italian-specific rules:
 * - Concatenation without spaces within segments ("ventotto" not "venti otto")
 * - Phonetic vowel elision: "venti" + "otto" → "ventotto"
 * - Accent on final "tre" in compounds: "ventitré"
 * - mille/mila alternation for thousands
 * - Scale words: milione/milioni, miliardo/miliardi, etc.
 * - "e" connector before simple final remainder
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Base vocabulary
const ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove']
const TEENS = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove']
const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta']
const HUNDREDS = ['', 'cento', 'duecento', 'trecento', 'quattrocento', 'cinquecento', 'seicento', 'settecento', 'ottocento', 'novecento']

// Pre-elided tens stems (drop final vowel before 'uno'/'otto')
// vent- (from venti), trent- (from trenta), etc.
const TENS_STEM = ['', '', 'vent', 'trent', 'quarant', 'cinquant', 'sessant', 'settant', 'ottant', 'novant']

const ZERO = 'zero'
const NEGATIVE = 'meno'
const DECIMAL_SEP = 'virgola'

// Thousands
const THOUSAND_SINGULAR = 'mille'
const THOUSAND_PLURAL_SUFFIX = 'mila'

// Scale word generation
const SCALE_PREFIXES = ['m', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds the segment word for a number 0-999.
 * Handles Italian phonetic elision inline (no regex).
 *
 * Elision rules:
 * - Tens ending in vowel + uno/otto → drop tens vowel: ventuno, ventotto
 * - Hundreds cento + otto/ottanta → centotto, centottanta (drop 'o')
 * - Final 'tre' in compounds becomes 'tré': ventitré, trentatré
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    // Elision: *cento + otto/ottanta → *centotto/centottanta (drop final 'o')
    // Only applies when tens = 8 (ottanta) or tens = 0 and ones = 8 (otto)
    if (tens === 8 || (tens === 0 && ones === 8)) {
      // Remove final 'o' from hundreds: cento→cent, duecento→duecent, etc.
      result = HUNDREDS[hundreds].slice(0, -1)
    } else {
      result = HUNDREDS[hundreds]
    }
  }

  // Tens and ones
  if (tens === 0 && ones === 0) {
    // Nothing more (just hundreds)
  } else if (tens === 1) {
    // Teens: 10-19
    result += TEENS[ones]
  } else if (tens >= 2) {
    // 20-99: handle elision for uno (1) and otto (8)
    if (ones === 1 || ones === 8) {
      // Use stem form: vent + uno = ventuno, vent + otto = ventotto
      result += TENS_STEM[tens] + ONES[ones]
    } else if (ones === 3) {
      // Final tre becomes tré
      result += TENS[tens] + 'tré'
    } else if (ones > 0) {
      result += TENS[tens] + ONES[ones]
    } else {
      result += TENS[tens]
    }
  } else if (ones > 0) {
    // 1-9 (tens === 0)
    if (ones === 3 && hundreds > 0) {
      // centotré, duecentotré, etc.
      result += 'tré'
    } else {
      result += ONES[ones]
    }
  }

  return result
}

/**
 * Builds segment word with "un" for scale context (millions, billions).
 * Same as buildSegment but returns "un" for 1 instead of "uno".
 */
function buildSegmentForScale (n) {
  if (n === 0) return ''
  if (n === 1) return 'un' // "un milione" not "uno milione"
  return buildSegment(n)
}

/**
 * Builds thousands word for 1-999 thousand.
 * Handles elision: tre + mila = tremila (no accent), otto + mila = ottomila
 */
function buildThousands (n) {
  if (n === 0) return ''
  if (n === 1) return THOUSAND_SINGULAR // "mille"

  // Build segment and append "mila"
  // Note: elision of segment ending vowel + 'mila' not needed (mila starts with 'm')
  // But we need to handle cases like "ottomila" (no double-o issue since we build directly)
  return buildSegment(n) + THOUSAND_PLURAL_SUFFIX
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

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      return buildThousands(thousands)
    }

    // Concatenate thousands + remainder
    return buildThousands(thousands) + buildSegment(remainder)
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
      const segmentWords = buildSegmentForScale(segNum)
      const scaleWord = segment === 1n
        ? getScaleWordSingular(scaleIndex)
        : getScaleWordPlural(scaleIndex)
      parts.push(segmentWords + ' ' + scaleWord)
    } else if (scaleIndex === 1) {
      // Thousands
      parts.push(buildThousands(segNum))
    } else {
      // Units (scaleIndex === 0): just the segment
      parts.push(buildSegment(segNum))
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
 * toCardinal(28)           // 'ventotto'
 * toCardinal(23)           // 'ventitré'
 * toCardinal(1000)         // 'mille'
 * toCardinal(2000)         // 'duemila'
 * toCardinal(1000000)      // 'un milione'
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
// Public API
// ============================================================================

export { toCardinal }
