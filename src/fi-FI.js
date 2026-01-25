/**
 * Finnish (Finland) language converter
 *
 * CLDR: fi-FI | Finnish as used in Finland
 *
 * Key features:
 * - Compound tens+ones without spaces: "kaksikymmentäyksi" (21)
 * - Teens with "-toista" suffix
 * - Omit "yksi" before sata/tuhat but keep before miljoona+
 * - Long scale: miljoona, miljardi, biljoona
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän']

const TEENS = ['kymmenen', 'yksitoista', 'kaksitoista', 'kolmetoista', 'neljätoista', 'viisitoista', 'kuusitoista', 'seitsemäntoista', 'kahdeksantoista', 'yhdeksäntoista']

// Tens use "kymmentä" suffix
const TENS = ['', '', 'kaksikymmentä', 'kolmekymmentä', 'neljäkymmentä', 'viisikymmentä', 'kuusikymmentä', 'seitsemänkymmentä', 'kahdeksankymmentä', 'yhdeksänkymmentä']

const HUNDRED = 'sata'
const THOUSAND = 'tuhat'

const ZERO = 'nolla'
const NEGATIVE = 'miinus'
const DECIMAL_SEP = 'pilkku'

// Long scale
const SCALES = ['miljoona', 'miljardi', 'biljoona', 'triljoona']

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Finnish ordinals: special forms for 1st-2nd, then -s suffix
const ORDINAL_FIRST = 'ensimmäinen'
const ORDINAL_SECOND = 'toinen'
const ORDINAL_SUFFIX = 's' // e.g., kolmas, neljäs

// Ordinal forms for basic numbers
const ORDINAL_ONES = ['', 'ensimmäinen', 'toinen', 'kolmas', 'neljäs', 'viides', 'kuudes', 'seitsemäs', 'kahdeksas', 'yhdeksäs']
const ORDINAL_TEENS = ['kymmenes', 'yhdestoista', 'kahdestoista', 'kolmastoista', 'neljästoista', 'viidestoista', 'kuudestoista', 'seitsemästoista', 'kahdeksastoista', 'yhdeksästoista']
const ORDINAL_TENS = ['', '', 'kahdeskymmenes', 'kolmaskymmenes', 'neljäskymmenes', 'viideskymmenes', 'kuudeskymmenes', 'seitsemäskymmenes', 'kahdeksaskymmenes', 'yhdeksäskymmenes']

// ============================================================================
// Currency Vocabulary (Euro)
// ============================================================================

const EURO = 'euroa'
const EURO_SINGULAR = 'euro'
const CENT = 'senttiä'
const CENT_SINGULAR = 'sentti'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Omits "yksi" before "sata" (hundred).
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - omit "yksi" before sata
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundreds] + ' ' + HUNDRED)
    }
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    parts.push(TENS[tens])
  } else {
    // Compound: "kaksikymmentäyksi" (no space)
    parts.push(TENS[tens] + ONES[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Finnish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Finnish words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "yksi" before tuhat
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = buildSegment(thousands) + ' ' + THOUSAND
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
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
 * @returns {string} Finnish words
 */
function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(Number(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(Number(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const segmentWord = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push(segmentWord)
      } else if (scaleIndex === 1) {
        // Thousands - omit "yksi" before tuhat
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          parts.push(segmentWord + ' ' + THOUSAND)
        }
      } else {
        // Millions+ - keep "yksi" before scale words
        const scaleWord = SCALES[scaleIndex - 2]
        parts.push(segmentWord + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Finnish words (per-digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Finnish words for decimal part
 */
function decimalPartToWords (decimalPart) {
  const parts = []

  for (const digit of decimalPart) {
    const d = parseInt(digit, 10)
    if (d === 0) {
      parts.push(ZERO)
    } else {
      parts.push(ONES[d])
    }
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Finnish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Finnish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)       // 'kaksikymmentäyksi'
 * toCardinal(1000)     // 'tuhat'
 * toCardinal('3.14')   // 'kolme pilkku yksi neljä'
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
 * Builds ordinal segment for 0-99.
 * Finnish ordinals have special forms.
 */
function buildOrdinalSegment (n) {
  if (n === 0) return ''
  if (n < 10) return ORDINAL_ONES[n]
  if (n < 20) return ORDINAL_TEENS[n - 10]

  const ones = n % 10
  const tens = Math.floor(n / 10)

  if (ones === 0) {
    return ORDINAL_TENS[tens]
  }

  // Compound: kahdeskymmenes + first/second/third etc
  // For compound ordinals, only the last part is ordinal form
  return TENS[tens] + ORDINAL_ONES[ones]
}

/**
 * Converts a non-negative integer to Finnish ordinal words.
 *
 * Finnish ordinals: ensimmäinen (1st), toinen (2nd), kolmas (3rd), etc.
 * For larger numbers, use cardinal + ordinal ending.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Finnish ordinal words
 */
function integerToOrdinal (n) {
  // Special cases
  if (n === 1n) return ORDINAL_FIRST
  if (n === 2n) return ORDINAL_SECOND

  // For numbers < 100, use ordinal forms
  if (n < 100n) {
    return buildOrdinalSegment(Number(n))
  }

  // For larger numbers, use cardinal form with ordinal suffix on last part
  // This is a simplification - full Finnish ordinal grammar is complex
  const cardinal = integerToWords(n)
  // Add ordinal suffix approximation
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Finnish ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'ensimmäinen'
 * toOrdinal(2)    // 'toinen'
 * toOrdinal(3)    // 'kolmas'
 * toOrdinal(10)   // 'kymmenes'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Finnish currency words (Euro).
 *
 * Euro uses sentti as subunit (100 senttiä = 1 euro).
 * Finnish has singular/plural: 1 euro vs 2 euroa, 1 sentti vs 2 senttiä.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Finnish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)      // 'yksi euro'
 * toCurrency(42)     // 'neljäkymmentäkaksi euroa'
 * toCurrency(1.50)   // 'yksi euro viisikymmentä senttiä'
 */
function toCurrency (value) {
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Euro part - always show if non-zero, or if no cents
  if (euros > 0n || cents === 0n) {
    result += integerToWords(euros)
    result += ' ' + (euros === 1n ? EURO_SINGULAR : EURO)
  }

  // Cent part
  if (cents > 0n) {
    if (euros > 0n) {
      result += ' '
    }
    result += integerToWords(cents)
    result += ' ' + (cents === 1n ? CENT_SINGULAR : CENT)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
