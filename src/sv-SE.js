/**
 * Swedish (Sweden) language converter
 *
 * CLDR: sv-SE | Swedish as used in Sweden
 *
 * Key features:
 * - Hyphenation for tens-ones (tjugo-ett)
 * - "och" after hundreds before small numbers
 * - Omit "ett" before hundra and tusen
 * - Use "en" (not "ett") before million+ scales
 * - Long scale naming with -ard forms
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']

const TEENS = ['tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton']
const TENS = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio']

const HUNDRED = 'hundra'

const ZERO = 'noll'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// Scale words (long scale with -ard forms)
const SCALES = ['tusen', 'miljon', 'miljard', 'biljon', 'biljard', 'triljon', 'triljard', 'kvadriljon']

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Swedish ordinals: 1st-2nd use -a (första, andra), then -de suffix
// Numbers ending in 1, 2 (except 11, 12) use special forms
const ORDINAL_ONES = {
  1: 'första',
  2: 'andra',
  3: 'tredje',
  4: 'fjärde',
  5: 'femte',
  6: 'sjätte',
  7: 'sjunde',
  8: 'åttonde',
  9: 'nionde',
  10: 'tionde',
  11: 'elfte',
  12: 'tolfte'
}

// ============================================================================
// Currency Vocabulary (Swedish Krona)
// ============================================================================

const KRONA = 'krona'
const KRONOR = 'kronor' // plural
const ORE = 'öre' // same singular and plural

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with word and metadata for "och" logic.
 */
function buildSegment (n) {
  if (n === 0) return { word: '', hasHundred: false, lessThan100: false }

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []
  let hasHundred = false

  // Hundreds - omit "ett" before hundra
  if (hundreds > 0) {
    hasHundred = true
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundreds] + ' ' + HUNDRED)
    }
  }

  // Tens and ones with hyphenation
  let tensOnesWord = ''
  if (tens === 1) {
    tensOnesWord = TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      tensOnesWord = TENS[tens] + '-' + ONES[ones]
    } else {
      tensOnesWord = TENS[tens]
    }
  } else if (ones > 0) {
    tensOnesWord = ONES[ones]
  }

  // Combine with "och" after hundreds if there's a remainder
  if (hasHundred && tensOnesWord) {
    return { word: parts[0] + ' och ' + tensOnesWord, hasHundred: true, lessThan100: false }
  } else if (hasHundred) {
    return { word: parts[0], hasHundred: true, lessThan100: false }
  } else {
    return { word: tensOnesWord, hasHundred: false, lessThan100: true }
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Swedish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Swedish words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "ett" before tusen
    let result = thousands === 1 ? SCALES[0] : buildSegment(thousands).word + ' ' + SCALES[0]

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // Insert "och" if remainder < 100 (doesn't have hundred)
      if (remainderResult.lessThan100) {
        result += ' och ' + remainderResult.word
      } else {
        result += ' ' + remainderResult.word
      }
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
 * @returns {string} Swedish words
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
      const segmentResult = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push({
          word: segmentResult.word,
          hasHundred: segmentResult.hasHundred,
          isScale: false
        })
      } else {
        // Segment with scale word
        const scaleWord = SCALES[scaleIndex - 1]

        let segmentWord
        if (segment === 1) {
          // Omit "ett" before tusen, use "en" before million+
          if (scaleIndex === 1) {
            segmentWord = '' // Just "tusen"
          } else {
            segmentWord = 'en' // "en miljon"
          }
        } else {
          segmentWord = segmentResult.word
        }

        if (segmentWord) {
          parts.push({ word: segmentWord, hasHundred: false, isScale: false })
        }
        parts.push({ word: scaleWord, hasHundred: false, isScale: true })
      }
    }

    scaleIndex--
  }

  // Join with Swedish "och" rules
  return joinSwedishParts(parts)
}

/**
 * Joins parts with Swedish "och" rules.
 * Insert "och" before final segment if it follows a scale word and doesn't have "hundra".
 *
 * @param {Array} parts - Parts with metadata
 * @returns {string} Joined string
 */
function joinSwedishParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const isLast = i === parts.length - 1

    if (isLast && parts.length > 1) {
      const prevPart = parts[i - 1]
      // Insert "och" if previous was scale and this doesn't have hundred
      if (prevPart.isScale && !part.hasHundred) {
        result.push('och')
      }
    }

    result.push(part.word)
  }

  return result.join(' ')
}

/**
 * Converts decimal digits to Swedish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Swedish words for decimal part
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
 * Converts a numeric value to Swedish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Swedish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)       // 'fyrtio-två'
 * toCardinal(101)      // 'hundra och ett'
 * toCardinal(1000000)  // 'en miljon'
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
 * Converts a non-negative integer to Swedish ordinal words.
 *
 * Swedish ordinals: första (1st), andra (2nd), tredje (3rd), etc.
 * Most use cardinal + de suffix, with special forms 1-12.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Swedish ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1-12
  if (n >= 1n && n <= 12n) {
    return ORDINAL_ONES[Number(n)]
  }

  // For numbers > 12, add -de suffix to cardinal
  // But need to handle endings in 1, 2 specially
  const cardinal = integerToWords(n)

  // Numbers ending in ett -> första pattern not used for compound
  // Swedish ordinals mostly add -de for >12
  return cardinal + 'de'
}

/**
 * Converts a numeric value to Swedish ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'första'
 * toOrdinal(2)    // 'andra'
 * toOrdinal(21)   // 'tjugo-ettde'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Swedish currency words (Swedish Krona).
 *
 * Uses krona/kronor and öre (100 öre = 1 krona).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Swedish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)      // 'en krona'
 * toCurrency(42)     // 'fyrtio-två kronor'
 * toCurrency(1.50)   // 'en krona och femtio öre'
 */
function toCurrency (value) {
  const { isNegative, dollars: kronor, cents: ore } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Kronor part
  if (kronor > 0n || ore === 0n) {
    // Use "en" for 1 krona (not "ett")
    if (kronor === 1n) {
      result += 'en ' + KRONA
    } else {
      result += integerToWords(kronor) + ' ' + KRONOR
    }
  }

  // Öre part
  if (ore > 0n) {
    if (kronor > 0n) {
      result += ' och '
    }
    result += integerToWords(ore) + ' ' + ORE
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
