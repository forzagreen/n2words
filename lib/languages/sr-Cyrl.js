/**
 * Serbian Cyrillic language converter - Functional Implementation
 *
 * Self-contained converter using shared Slavic utilities.
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds
 * - Long scale naming with -ard forms
 * - Cyrillic script
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Slavic Utilities (inlined for performance)
// ============================================================================

function pluralize (n, forms) {
  const num = typeof n === 'bigint' ? Number(n) : n
  const lastDigit = num % 10
  const lastTwoDigits = num % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return forms[2]
  }

  if (lastDigit === 1) return forms[0]
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1]
  return forms[2]
}

function buildAllSegments (onesMasc, onesFem, teens, tens, hundreds) {
  const masc = new Array(1000)
  const fem = new Array(1000)

  for (let i = 0; i < 1000; i++) {
    masc[i] = buildSegment(i, onesMasc, teens, tens, hundreds)
    fem[i] = buildSegment(i, onesFem, teens, tens, hundreds)
  }

  return { masc, fem }
}

function buildSegment (n, ones, teens, tens, hundreds) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  if (hundredsDigit > 0) {
    parts.push(hundreds[hundredsDigit])
  }

  if (tensDigit > 1) {
    parts.push(tens[tensDigit])
  }

  if (tensDigit === 1) {
    parts.push(teens[onesDigit])
  } else if (onesDigit > 0) {
    parts.push(ones[onesDigit])
  }

  return parts.join(' ')
}

// ============================================================================
// Vocabulary
// ============================================================================

const ONES_MASC = ['', 'један', 'два', 'три', 'четири', 'пет', 'шест', 'седам', 'осам', 'девет']
const ONES_FEM = ['', 'једна', 'две', 'три', 'четири', 'пет', 'шест', 'седам', 'осам', 'девет']
const TEENS = ['десет', 'једанаест', 'дванаест', 'тринаест', 'четрнаест', 'петнаест', 'шеснаест', 'седамнаест', 'осамнаест', 'деветнаест']
const TENS = ['', '', 'двадесет', 'тридесет', 'четрдесет', 'педесет', 'шездесет', 'седамдесет', 'осамдесет', 'деведесет']
const HUNDREDS = ['', 'сто', 'двеста', 'триста', 'четиристо', 'петсто', 'шесто', 'седамсто', 'осамсто', 'девестo']

const ZERO = 'нула'
const NEGATIVE = 'минус'
const DECIMAL_SEP = 'запета'

// Scale words: [singular, few, many]
const SCALE_FORMS = [
  ['хиљада', 'хиљаде', 'хиљада'],
  ['милион', 'милиона', 'милиона'],
  ['милијарда', 'милијарде', 'милијарда'],
  ['билион', 'билиона', 'билиона'],
  ['билијарда', 'билијарде', 'билијарда'],
  ['трилион', 'трилиона', 'трилиона'],
  ['трилијарда', 'трилијарде', 'трилијарда'],
  ['квадрилион', 'квадрилиона', 'квадрилиона'],
  ['квадрилијарда', 'квадрилијарде', 'квадрилијарда']
]

// ============================================================================
// Precomputed Lookup Tables
// ============================================================================

const { masc: SEGMENTS_MASC, fem: SEGMENTS_FEM } = buildAllSegments(ONES_MASC, ONES_FEM, TEENS, TENS, HUNDREDS)

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    const segments = options.gender === 'feminine' ? SEGMENTS_FEM : SEGMENTS_MASC
    return segments[Number(n)]
  }

  return buildLargeNumberWords(n, options)
}

function buildLargeNumberWords (n, options) {
  const numStr = n.toString()
  const len = numStr.length

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

  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      if (scaleIndex === 0) {
        const segmentWords = options.gender === 'feminine' ? SEGMENTS_FEM : SEGMENTS_MASC
        parts.push(segmentWords[segment])
      } else {
        const scaleForms = SCALE_FORMS[scaleIndex - 1]
        const scaleWord = pluralize(segment, scaleForms)
        // Thousands (scaleIndex=1) are feminine, others masculine
        const isFeminine = scaleIndex === 1
        const segmentWords = isFeminine ? SEGMENTS_FEM : SEGMENTS_MASC
        parts.push(segmentWords[segment] + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

function decimalPartToWords (decimalPart, options) {
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
    result += integerToWords(BigInt(remainder), options)
  }

  return result
}

/**
 * Converts a numeric value to Serbian (Cyrillic) words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Serbian Cyrillic words
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, options)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
