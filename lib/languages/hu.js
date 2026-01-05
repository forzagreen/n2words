/**
 * Hungarian language converter - Functional Implementation
 *
 * Self-contained converter with agglutinative word formation.
 *
 * Key features:
 * - Agglutinative structure (no spaces between compound parts)
 * - Special handling for "egy" (one) omission
 * - Pre-composed twenties (huszonegy through huszonkilenc)
 * - "két" instead of "kettő" in compound forms
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

// Word map using BigInt keys for scale values
const WORDS = new Map([
  [1_000_000_000_000_000_000_000_000_000n, 'quadrilliárd'],
  [1_000_000_000_000_000_000_000_000n, 'quadrillió'],
  [1_000_000_000_000_000_000_000n, 'trilliárd'],
  [1_000_000_000_000_000_000n, 'trillió'],
  [1_000_000_000_000_000n, 'billiárd'],
  [1_000_000_000_000n, 'billió'],
  [1_000_000_000n, 'milliárd'],
  [1_000_000n, 'millió'],
  [1000n, 'ezer'],
  [100n, 'száz'],
  [90n, 'kilencven'],
  [80n, 'nyolcvan'],
  [70n, 'hetven'],
  [60n, 'hatvan'],
  [50n, 'ötven'],
  [40n, 'negyven'],
  [30n, 'harminc'],
  [29n, 'huszonkilenc'],
  [28n, 'huszonnyolc'],
  [27n, 'huszonhét'],
  [26n, 'huszonhat'],
  [25n, 'huszonöt'],
  [24n, 'huszonnégy'],
  [23n, 'huszonhárom'],
  [22n, 'huszonkettő'],
  [21n, 'huszonegy'],
  [20n, 'húsz'],
  [19n, 'tizenkilenc'],
  [18n, 'tizennyolc'],
  [17n, 'tizenhét'],
  [16n, 'tizenhat'],
  [15n, 'tizenöt'],
  [14n, 'tizennégy'],
  [13n, 'tizenhárom'],
  [12n, 'tizenkettő'],
  [11n, 'tizenegy'],
  [10n, 'tíz'],
  [9n, 'kilenc'],
  [8n, 'nyolc'],
  [7n, 'hét'],
  [6n, 'hat'],
  [5n, 'öt'],
  [4n, 'négy'],
  [3n, 'három'],
  [2n, 'kettő'],
  [1n, 'egy'],
  [0n, 'nulla']
])

const ZERO = 'nulla'
const NEGATIVE = 'mínusz'
const DECIMAL_SEP = 'egész'

// ============================================================================
// Conversion Functions
// ============================================================================

function wordForScale (value) {
  return WORDS.get(value)
}

function tensToCardinal (n) {
  if (WORDS.has(n)) {
    return WORDS.get(n)
  }
  const tens = n / 10n
  const units = n % 10n
  return wordForScale(tens * 10n) + integerToWordsInner(units)
}

function hundredsToCardinal (n) {
  const hundreds = n / 100n
  let prefix = 'száz'
  if (hundreds !== 1n) {
    prefix = integerToWordsInner(hundreds, '') + prefix
  }
  const postfix = integerToWordsInner(n % 100n, '')
  return prefix + postfix
}

function thousandsToCardinal (n) {
  const thousands = n / 1000n
  let prefix = 'ezer'
  if (thousands !== 1n) {
    prefix = integerToWordsInner(thousands, '') + prefix
  }
  const postfix = integerToWordsInner(n % 1000n, '')
  const middle = (n <= 2000n || postfix === '') ? '' : '-'
  return prefix + middle + postfix
}

function bigNumberToCardinal (n) {
  const numberLength = n.toString().length
  const digits = (numberLength % 3 === 0) ? numberLength - 2 : numberLength
  const exp = 10n ** BigInt(Math.floor(digits / 3) * 3)
  const prefix = integerToWordsInner(n / exp, '')
  const rest = integerToWordsInner(n % exp, '')
  const postfix = (rest === '') ? '' : ('-' + rest)
  return prefix + wordForScale(exp) + postfix
}

function integerToWordsInner (n, zeroWord = ZERO) {
  // Normalize to BigInt for consistent comparisons
  if (typeof n !== 'bigint') n = BigInt(n)

  if (n === 0n) {
    return zeroWord
  }
  if (zeroWord === '' && n === 2n) {
    return 'két'
  }
  if (n < 30n) {
    return wordForScale(n)
  }
  if (n < 100n) {
    return tensToCardinal(n)
  }
  if (n < 1000n) {
    return hundredsToCardinal(n)
  }
  if (n < 1_000_000n) {
    return thousandsToCardinal(n)
  }
  return bigNumberToCardinal(n)
}

function integerToWords (n) {
  return integerToWordsInner(n, ZERO)
}

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
 * Converts a numeric value to Hungarian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Hungarian words
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
// Exports
// ============================================================================

export { toWords }
