/**
 * Norwegian Bokmål (Norway) language converter
 *
 * CLDR: nb-NO | Norwegian Bokmål as used in Norway
 *
 * Key features:
 * - Hyphenated tens+ones: "tjue-en" (21)
 * - "og" conjunction after hundreds
 * - Comma separator after thousands before hundreds
 * - Short scale: million, milliard, billion, etc.
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni']

const TEENS = ['ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten']
const TENS = ['', '', 'tjue', 'tretti', 'førti', 'femti', 'seksti', 'sytti', 'åtti', 'nitti']

const HUNDRED = 'hundre'
const THOUSAND = 'tusen'

const ZERO = 'null'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// Short scale: million, milliard, billion, etc.
const SCALES = ['million', 'milliard', 'billion', 'billiard', 'kvintillion', 'sekstillion', 'septillion', 'oktillion']

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Norwegian ordinals: 1st-12th special forms, then cardinal + -de/-te
const ORDINAL_SPECIAL = {
  1: 'første',
  2: 'andre',
  3: 'tredje',
  4: 'fjerde',
  5: 'femte',
  6: 'sjette',
  7: 'sjuende',
  8: 'åttende',
  9: 'niende',
  10: 'tiende',
  11: 'ellevte',
  12: 'tolvte'
}

// ============================================================================
// Currency Vocabulary (Norwegian Krone)
// ============================================================================

const KRONE = 'krone'
const KRONER = 'kroner' // plural
const ORE = 'øre' // same singular and plural

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with word and hasHundred flag.
 */
function buildSegment (n) {
  if (n === 0) return { word: '', hasHundred: false }

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []
  let hasHundred = false

  // Hundreds: "en hundre", "to hundre"
  if (hundreds > 0) {
    hasHundred = true
    parts.push(ONES[hundreds] + ' ' + HUNDRED)
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    // Teens
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    // Even tens
    parts.push(TENS[tens])
  } else {
    // Hyphenated: "tjue-en"
    parts.push(TENS[tens] + '-' + ONES[ones])
  }

  // Combine with " og " between hundreds and remainder
  if (parts.length === 2) {
    return { word: parts[0] + ' og ' + parts[1], hasHundred: true }
  }
  return { word: parts[0] || '', hasHundred }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Norwegian Bokmål words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Norwegian words
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

    let result = buildSegment(thousands).word + ' ' + THOUSAND

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // Comma before hundreds, " og " before small numbers
      if (remainderResult.hasHundred) {
        result += ', ' + remainderResult.word
      } else {
        result += ' og ' + remainderResult.word
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
 * @returns {string} Norwegian words
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
        parts.push({ word: segmentResult.word, hasHundred: segmentResult.hasHundred, type: 'units' })
      } else if (scaleIndex === 1) {
        // Thousands
        parts.push({ word: segmentResult.word + ' ' + THOUSAND, hasHundred: false, type: 'thousand' })
      } else {
        // Millions+
        const scaleWord = SCALES[scaleIndex - 2]
        parts.push({ word: segmentResult.word + ' ' + scaleWord, hasHundred: false, type: 'million' })
      }
    }

    scaleIndex--
  }

  // Join parts with Norwegian rules
  return joinNorwegianParts(parts)
}

/**
 * Joins parts with Norwegian spacing and comma rules.
 *
 * @param {Array} parts - Parts with type metadata
 * @returns {string} Joined string
 */
function joinNorwegianParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const nextPart = parts[i + 1]

    result.push(part.word)

    if (nextPart) {
      if (part.type === 'thousand') {
        // After thousands: comma if next has hundred, else " og "
        if (nextPart.hasHundred) {
          result.push(', ')
        } else {
          result.push(' og ')
        }
      } else if (part.type === 'million') {
        // After millions: " og " for units without hundred, space otherwise
        if (nextPart.type === 'units' && !nextPart.hasHundred) {
          result.push(' og ')
        } else {
          result.push(' ')
        }
      } else {
        result.push(' ')
      }
    }
  }

  return result.join('')
}

/**
 * Converts decimal digits to Norwegian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Norwegian words for decimal part
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
 * Converts a numeric value to Norwegian Bokmål words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Norwegian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)       // 'tjue-en'
 * toCardinal(101)      // 'en hundre og en'
 * toCardinal(1000000)  // 'en million'
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
 * Converts a non-negative integer to Norwegian Bokmål ordinal words.
 *
 * Norwegian ordinals: første (1st), andre (2nd), tredje (3rd), etc.
 * 1-12 have special forms, others use cardinal + de/te suffix.
 * Teens (13-19): drop -en and add -ende (tretten → trettende)
 * Numbers ending in 'en' (one): replace with 'ende' (tjue-en → tjue-ende)
 * Numbers ending in 9 (ni): add 'ede' (nitti-ni → nitti-niede)
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Norwegian ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1-12
  if (n >= 1n && n <= 12n) {
    return ORDINAL_SPECIAL[Number(n)]
  }

  const num = Number(n)
  const cardinal = integerToWords(n)

  // Teens 13-19: drop -en and add -ende
  if (num >= 13 && num <= 19) {
    // tretten → trettende, nitten → nittende
    return cardinal.slice(0, -2) + 'ende'
  }

  // For other numbers, check if cardinal ends with 'en' (one)
  // tjue-en → tjue-ende, en hundre og en → en hundre og ende
  if (cardinal.endsWith('en')) {
    return cardinal.slice(0, -2) + 'ende'
  }

  // Numbers ending in 'ni' (9): add 'ede'
  // nitti-ni → nitti-niede
  if (cardinal.endsWith('ni')) {
    return cardinal + 'ede'
  }

  // Others use -de suffix
  return cardinal + 'de'
}

/**
 * Converts a numeric value to Norwegian Bokmål ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'første'
 * toOrdinal(2)    // 'andre'
 * toOrdinal(21)   // 'tjue-ende'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Norwegian currency words (Norwegian Krone).
 *
 * Uses krone/kroner and øre (100 øre = 1 krone).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Norwegian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)      // 'en krone'
 * toCurrency(42)     // 'førti-to kroner'
 * toCurrency(1.50)   // 'en krone og femti øre'
 */
function toCurrency (value) {
  const { isNegative, dollars: kroner, cents: ore } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Kroner part
  if (kroner > 0n || ore === 0n) {
    if (kroner === 1n) {
      result += 'en ' + KRONE
    } else {
      result += integerToWords(kroner) + ' ' + KRONER
    }
  }

  // Øre part
  if (ore > 0n) {
    if (kroner > 0n) {
      result += ' og '
    }
    result += integerToWords(ore) + ' ' + ORE
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
