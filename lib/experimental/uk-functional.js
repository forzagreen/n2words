/**
 * Ukrainian language converter - Functional Implementation
 *
 * Self-contained converter using shared Slavic utilities.
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds
 * - Long scale naming
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { pluralize, buildAllSegments } from './utils/slavic.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES_MASC = ['', 'один', 'два', 'три', 'чотири', 'п\'ять', 'шiсть', 'сiм', 'вiсiм', 'дев\'ять']
const ONES_FEM = ['', 'одна', 'двi', 'три', 'чотири', 'п\'ять', 'шiсть', 'сiм', 'вiсiм', 'дев\'ять']

const TEENS = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п\'ятнадцять', 'шiстнадцять', 'сiмнадцять', 'вiсiмнадцять', 'дев\'ятнадцять']
const TENS = ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шiстдесят', 'сiмдесят', 'вiсiмдесят', 'дев\'яносто']

// Irregular hundreds
const HUNDREDS = ['', 'сто', 'двiстi', 'триста', 'чотириста', 'п\'ятсот', 'шiстсот', 'сiмсот', 'вiсiмсот', 'дев\'ятсот']

const ZERO = 'нуль'
const NEGATIVE = 'мiнус'
const DECIMAL_SEP = 'кома'

// Scale words: [singular, few, many]
// Thousands (index 0) are feminine, rest are masculine
const SCALE_FORMS = [
  ['тисяча', 'тисячi', 'тисяч'],
  ['мiльйон', 'мiльйони', 'мiльйонiв'],
  ['мiльярд', 'мiльярди', 'мiльярдiв'],
  ['трильйон', 'трильйони', 'трильйонiв'],
  ['квадрильйон', 'квадрильйони', 'квадрильйонiв'],
  ['квiнтильйон', 'квiнтильйони', 'квiнтильйонiв'],
  ['секстильйон', 'секстильйони', 'секстильйонiв'],
  ['септильйон', 'септильйони', 'септильйонiв'],
  ['октильйон', 'октильйони', 'октильйонiв']
]

// ============================================================================
// Precomputed Lookup Tables
// ============================================================================

const vocab = {
  onesMasc: ONES_MASC,
  onesFem: ONES_FEM,
  teens: TEENS,
  tens: TENS,
  hundreds: HUNDREDS
}

const { masc: SEGMENTS_MASC, fem: SEGMENTS_FEM } = buildAllSegments(vocab)

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

function toWords (value, options = {}) {
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

export {
  ONES_MASC,
  ONES_FEM,
  TEENS,
  TENS,
  HUNDREDS,
  SCALE_FORMS,
  ZERO,
  SEGMENTS_MASC,
  SEGMENTS_FEM,
  pluralize,
  integerToWords,
  decimalPartToWords
}
