/**
 * Russian language converter - Functional Implementation
 *
 * Self-contained converter using shared Slavic utilities.
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds (двести, триста, etc.)
 * - Long scale naming
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

const ONES_MASC = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const ONES_FEM = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']

const TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']

// Irregular hundreds
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

const ZERO = 'ноль'
const NEGATIVE = 'минус'
const DECIMAL_SEP = 'запятая'

// Scale words: [singular, few, many]
// Thousands (index 0) are feminine, rest are masculine
const SCALE_FORMS = [
  ['тысяча', 'тысячи', 'тысяч'],
  ['миллион', 'миллиона', 'миллионов'],
  ['миллиард', 'миллиарда', 'миллиардов'],
  ['триллион', 'триллиона', 'триллионов'],
  ['квадриллион', 'квадриллиона', 'квадриллионов'],
  ['квинтиллион', 'квинтиллиона', 'квинтиллионов'],
  ['секстиллион', 'секстиллиона', 'секстиллионов'],
  ['септиллион', 'септиллиона', 'септиллионов'],
  ['октиллион', 'октиллиона', 'октиллионов'],
  ['нониллион', 'нониллиона', 'нониллионов']
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

  const feminine = options.gender === 'feminine'

  if (n < 1000n) {
    const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
    return segments[Number(n)]
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Thousands are always feminine in Russian
    const thousandsWord = SEGMENTS_FEM[thousands]
    const scaleWord = pluralize(thousands, SCALE_FORMS[0])

    let result = thousandsWord + ' ' + scaleWord

    if (remainder > 0) {
      const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
      result += ' ' + segments[remainder]
    }

    return result
  }

  return buildLargeNumberWords(n, options)
}

function buildLargeNumberWords (n, options) {
  const feminine = options.gender === 'feminine'
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
        const segmentWords = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
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
