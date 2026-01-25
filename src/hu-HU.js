/**
 * Hungarian (Hungary) language converter
 *
 * CLDR: hu-HU | Hungarian as used in Hungary
 *
 * Key features:
 * - Agglutinative structure (no spaces between compound parts)
 * - Special handling for "egy" (one) omission
 * - Pre-composed twenties (huszonegy through huszonkilenc)
 * - "két" instead of "kettő" in compound forms
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

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
// Ordinal Vocabulary
// ============================================================================

// Hungarian ordinals: special forms 1-10, then cardinal + -dik/-ik suffix
// Vowel harmony determines -dik vs -ik
const ORDINAL_SPECIAL = {
  1: 'első',
  2: 'második',
  3: 'harmadik',
  4: 'negyedik',
  5: 'ötödik',
  6: 'hatodik',
  7: 'hetedik',
  8: 'nyolcadik',
  9: 'kilencedik',
  10: 'tizedik',
  20: 'huszadik',
  30: 'harmincadik',
  40: 'negyvenedik',
  50: 'ötvenedik',
  60: 'hatvanadik',
  70: 'hetvenedik',
  80: 'nyolcvanadik',
  90: 'kilencvenedik',
  100: 'századik',
  1000: 'ezredik'
}

// ============================================================================
// Currency Vocabulary (Hungarian Forint)
// ============================================================================

const FORINT = 'forint' // same singular and plural
const FILLER = 'fillér' // subunit (rarely used, same singular and plural)

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

// Scale values for finding appropriate scale (avoids toString)
const SCALES = [
  1_000_000_000_000_000_000_000_000_000n,
  1_000_000_000_000_000_000_000_000n,
  1_000_000_000_000_000_000_000n,
  1_000_000_000_000_000_000n,
  1_000_000_000_000_000n,
  1_000_000_000_000n,
  1_000_000_000n,
  1_000_000n
]

function bigNumberToCardinal (n) {
  // Find appropriate scale using BigInt comparison (avoids toString)
  let exp = 1_000_000n
  for (const scale of SCALES) {
    if (n >= scale) {
      exp = scale
      break
    }
  }

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
 * Converts a non-negative integer to Hungarian ordinal words.
 *
 * Hungarian ordinals: első (1st), második (2nd), harmadik (3rd), etc.
 * 1-10 have special forms, others use cardinal + -dik/-edik/-adik/-ödik suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Hungarian ordinal words
 */
function integerToOrdinal (n) {
  const num = Number(n)

  // Exact special forms
  if (ORDINAL_SPECIAL[num]) {
    return ORDINAL_SPECIAL[num]
  }

  // For compound numbers, get cardinal and add suffix
  const cardinal = integerToWords(n)

  // Determine suffix based on last vowel (vowel harmony)
  // Back vowels (a,á,o,ó,u,ú) -> -adik
  // Front unrounded (e,é,i,í) -> -edik
  // Front rounded (ö,ő,ü,ű) -> -ödik
  // If ends in consonant, add linking vowel + dik

  const lastChar = cardinal[cardinal.length - 1]

  // If ends in vowel, just add -dik
  if ('aáoóuúeéiíöőüű'.includes(lastChar)) {
    return cardinal + 'dik'
  }

  // If ends in consonant, find last vowel for harmony
  const backVowels = 'aáoóuú'
  const frontRoundedVowels = 'öőüű'

  for (let i = cardinal.length - 1; i >= 0; i--) {
    const char = cardinal[i]
    if (backVowels.includes(char)) {
      return cardinal + 'adik'
    }
    if (frontRoundedVowels.includes(char)) {
      return cardinal + 'ödik'
    }
    if ('eéií'.includes(char)) {
      return cardinal + 'edik'
    }
  }

  // Default to -edik
  return cardinal + 'edik'
}

/**
 * Converts a numeric value to Hungarian ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'első'
 * toOrdinal(2)    // 'második'
 * toOrdinal(21)   // 'huszonegyedik'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Hungarian currency words (Hungarian Forint).
 *
 * Uses forint (no plural form needed in Hungarian).
 * Fillér (1/100) is rarely used but included for completeness.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Hungarian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'negyvenkettő forint'
 * toCurrency(1.50)   // 'egy forint ötven fillér'
 * toCurrency(-5)     // 'mínusz öt forint'
 */
function toCurrency (value) {
  const { isNegative, dollars: forint, cents: filler } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Forint part
  if (forint > 0n || filler === 0n) {
    result += integerToWords(forint) + ' ' + FORINT
  }

  // Fillér part
  if (filler > 0n) {
    if (forint > 0n) {
      result += ' '
    }
    result += integerToWords(filler) + ' ' + FILLER
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
