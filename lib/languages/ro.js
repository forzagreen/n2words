/**
 * Romanian language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 *
 * Key features:
 * - Gender agreement (unu/una, doi/două)
 * - "De" preposition insertion for groups >= 20
 * - Complex scale word handling (mie/mii, milion/milioane)
 * - Feminine units for thousands
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă']
const ONES_FEM = ['', 'una', 'două', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă']

const TEENS = ['zece', 'unsprezece', 'douăsprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece']
const TEENS_MASC = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece']

const TWENTIES = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci']

const HUNDREDS = ['', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute', 'șase sute', 'șapte sute', 'opt sute', 'nouă sute']

const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'virgulă'

// Scale metadata: [singular, plural, article, feminine, needsDe]
// - singular: form for 1
// - plural: form for 2+
// - article: 'o' for feminine, 'un' for masculine
// - feminine: whether units should be feminine
// - needsDe: whether "de" is inserted for segment >= 20
const SCALE_META = [
  { singular: 'mie', plural: 'mii', article: 'o', feminine: true, needsDe: true },
  { singular: 'milion', plural: 'milioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'miliard', plural: 'miliarde', article: 'un', feminine: false, needsDe: true },
  { singular: 'trilion', plural: 'trilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'cvadrilion', plural: 'cvadrilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'cvintilion', plural: 'cvintilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'sextilion', plural: 'sextilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'septilion', plural: 'septilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'octilion', plural: 'octilioane', article: 'un', feminine: false, needsDe: true }
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Spells number under 100.
 */
function spellUnder100 (n, feminine = false, masculineTeens = false) {
  if (n === 0) return ''
  if (n < 10) {
    return feminine ? ONES_FEM[n] : ONES_MASC[n]
  }
  if (n < 20) {
    return masculineTeens ? TEENS_MASC[n - 10] : TEENS[n - 10]
  }
  const t = Math.floor(n / 10)
  const u = n % 10
  if (u === 0) {
    return TWENTIES[t]
  }
  const onesWord = feminine ? ONES_FEM[u] : ONES_MASC[u]
  return TWENTIES[t] + ' și ' + onesWord
}

/**
 * Spells number under 1000.
 */
function spellUnder1000 (n, feminine = false, masculineTeens = false) {
  if (n === 0) return ''
  if (n < 100) return spellUnder100(n, feminine, masculineTeens)

  const h = Math.floor(n / 100)
  const r = n % 100
  const hundredWord = HUNDREDS[h]

  if (r === 0) return hundredWord
  return hundredWord + ' ' + spellUnder100(r, feminine, masculineTeens)
}

/**
 * Builds scale word with proper pluralization and "de" insertion.
 * Romanian always uses feminine forms (două, not doi) when counting scale words.
 */
function buildScalePhrase (segment, scaleIndex) {
  const meta = SCALE_META[scaleIndex - 1]
  if (!meta) return spellUnder1000(segment, true)

  if (segment === 1) {
    return meta.article + ' ' + meta.singular
  }

  // Special case: 21 with scale words uses feminine "una"
  if (segment === 21 && meta.needsDe) {
    return 'douăzeci și una de ' + meta.plural
  }

  // Romanian always uses feminine when counting scale words (două milioane, not doi milioane)
  const words = spellUnder1000(segment, true)

  // "de" after >= 20
  const needsDe = meta.needsDe && segment >= 20
  const separator = needsDe ? ' de ' : ' '

  return words + separator + meta.plural
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Romanian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Romanian words
 */
function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const feminine = options.gender === 'feminine'
    return spellUnder1000(Number(n), feminine)
  }

  return buildLargeNumberWords(n, options)
}

/**
 * Builds words for numbers >= 1000.
 *
 * @param {bigint} n - Number >= 1000
 * @param {Object} options - Conversion options
 * @returns {string} Romanian words
 */
function buildLargeNumberWords (n, options) {
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
      if (scaleIndex === 0) {
        // Units segment - use gender from options
        const feminine = options.gender === 'feminine'
        parts.push(spellUnder1000(segment, feminine))
      } else {
        // Scale segment
        parts.push(buildScalePhrase(segment, scaleIndex))
      }
    }

    scaleIndex--
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Converts decimal digits to Romanian words.
 * Decimals always use masculine forms.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Romanian words for decimal part
 */
function decimalPartToWords (decimalPart) {
  let result = ''
  let i = 0

  // Handle leading zeros
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  // Convert remainder as a single number (masculine, with masculine teens)
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    const n = BigInt(remainder)
    if (n < 1000n) {
      result += spellUnder1000(Number(n), false, true)
    } else {
      result += integerToWords(n, { gender: 'masculine' })
    }
  }

  return result
}

/**
 * Converts a numeric value to Romanian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers
 * @returns {string} The number in Romanian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)                        // 'douăzeci și unu'
 * toWords(1, { gender: 'feminine' }) // 'una'
 * toWords(1000)                      // 'o mie'
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
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }
