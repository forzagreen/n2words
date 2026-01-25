/**
 * French (Belgium) language converter
 *
 * CLDR: fr-BE | French as used in Belgium
 *
 * Belgian French differences from standard French:
 * - septante (70) instead of soixante-dix
 * - nonante (90) instead of quatre-vingt-dix
 * - Keeps quatre-vingts (80) like standard French
 * - Uses "septante et un" (71), "nonante et un" (91)
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'septante', 'quatre-vingt', 'nonante']

// Scale words (long scale with -ard forms)
const SCALES = ['million', 'billion', 'trillion', 'quadrillion']
const SCALES_ARD = ['milliard', 'billiard', 'trilliard', 'quadrilliard']

const THOUSAND = 'mille'
const HUNDRED = 'cent'
const ZERO = 'zéro'
const NEGATIVE = 'moins'
const DECIMAL_SEP = 'virgule'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix
const ORDINAL_SUFFIX = 'ième'

// Special ordinals
const PREMIER = 'premier'

// ============================================================================
// Currency Vocabulary (Euro)
// ============================================================================

const EURO = 'euro'
const EUROS = 'euros'
const CENTIME = 'centime'
const CENTIMES = 'centimes'

// ============================================================================
// Segment Building
// ============================================================================

function buildSegment (n) {
  if (n === 0) return { word: '', endsWithCents: false, endsWithVingts: false }

  const tensOnes = n % 100
  const hundreds = Math.floor(n / 100)

  const parts = []
  let endsWithCents = false
  let endsWithVingts = false

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      if (tensOnes === 0) {
        parts.push(ONES[hundreds] + ' ' + HUNDRED + 's')
        endsWithCents = true
      } else {
        parts.push(ONES[hundreds] + ' ' + HUNDRED)
      }
    }
  }

  // Tens and ones - Belgian pattern
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[tensOnes])
  } else if (tensOnes < 17) {
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 20) {
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 70) {
    // 20-69: standard pattern
    const t = Math.floor(tensOnes / 10)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push(TENS[t])
    } else if (o === 1) {
      parts.push(TENS[t] + ' et ' + ONES[1])
    } else {
      parts.push(TENS[t] + '-' + ONES[o])
    }
  } else if (tensOnes < 80) {
    // 70-79: septante pattern (Belgian)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push('septante')
    } else if (o === 1) {
      parts.push('septante et ' + ONES[1])
    } else {
      parts.push('septante-' + ONES[o])
    }
  } else if (tensOnes === 80) {
    // 80: quatre-vingts (same as standard)
    parts.push('quatre-vingts')
    endsWithVingts = true
  } else if (tensOnes < 90) {
    // 81-89: quatre-vingt-X (same as standard)
    const remainder = tensOnes - 80
    parts.push('quatre-vingt-' + ONES[remainder])
  } else {
    // 90-99: nonante pattern (Belgian)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push('nonante')
    } else if (o === 1) {
      parts.push('nonante et ' + ONES[1])
    } else {
      parts.push('nonante-' + ONES[o])
    }
  }

  return { word: parts.join(' '), endsWithCents, endsWithVingts }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? baseWord + 's' : baseWord
  } else {
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const ardWord = SCALES_ARD[arrayIndex]
    if (!ardWord) return THOUSAND
    return segment > 1n ? ardWord + 's' : ardWord
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, withHyphen = false) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    const { word } = buildSegment(Number(n))
    return withHyphen ? word.replace(/ /g, '-') : word
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      const { word: thousandsWord, endsWithCents, endsWithVingts } = buildSegment(thousands)
      let adjustedWord = thousandsWord
      if (endsWithCents || endsWithVingts) {
        adjustedWord = thousandsWord.slice(0, -1)
      }
      result = adjustedWord + (withHyphen ? '-' : ' ') + THOUSAND
    }

    if (remainder > 0) {
      const { word: remainderWord } = buildSegment(remainder)
      result += (withHyphen ? '-' : ' ') + remainderWord
    }

    if (withHyphen) {
      result = result.replace(/ /g, '-')
    }

    return result
  }

  return buildLargeNumberWords(n, withHyphen)
}

function buildLargeNumberWords (n, withHyphen) {
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
      const scaleWord = scaleIndex > 0 ? getScaleWord(scaleIndex, BigInt(segment)) : ''
      const { word: segWords, endsWithCents, endsWithVingts } = buildSegment(segment)

      if (scaleIndex === 0) {
        parts.push(segWords)
      } else if (scaleIndex === 1) {
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          let adjustedWord = segWords
          if (endsWithCents || endsWithVingts) {
            adjustedWord = segWords.slice(0, -1)
          }
          parts.push(adjustedWord)
          parts.push(scaleWord)
        }
      } else {
        parts.push(segWords)
        parts.push(scaleWord)
      }
    }

    scaleIndex--
  }

  const sep = withHyphen ? '-' : ' '
  let result = parts.join(sep)

  if (withHyphen) {
    result = result.replace(/ /g, '-')
  }

  return result
}

function decimalPartToWords (decimalPart, withHyphen) {
  let result = ''
  const sep = withHyphen ? '-' : ' '

  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += sep
    result += ZERO
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += sep
    result += integerToWords(BigInt(remainder), withHyphen)
  }

  return result
}

/**
 * Converts a numeric value to Belgian French words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.withHyphenSeparator=false] - Use hyphens between words
 * @returns {string} The number in Belgian French words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { withHyphenSeparator = false } = options

  let result = ''
  const sep = withHyphenSeparator ? '-' : ' '

  if (isNegative) {
    result = NEGATIVE + sep
  }

  result += integerToWords(integerPart, withHyphenSeparator)

  if (decimalPart) {
    result += sep + DECIMAL_SEP + sep + decimalPartToWords(decimalPart, withHyphenSeparator)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a cardinal number word to its ordinal form.
 * Rules:
 * - 1 → premier (special case)
 * - Drop final -e before adding -ième (quatre → quatrième)
 * - cinq → cinquième (add -u- before -ième)
 * - neuf → neuvième (f → v before -ième)
 *
 * @param {string} cardinalWord - Cardinal word to convert
 * @returns {string} Ordinal form
 */
function cardinalToOrdinal (cardinalWord) {
  // Handle special endings
  if (cardinalWord.endsWith('cinq')) {
    // cinq → cinquième (add 'u')
    return cardinalWord + 'u' + ORDINAL_SUFFIX
  }

  if (cardinalWord.endsWith('neuf')) {
    // neuf → neuvième (f → v)
    return cardinalWord.slice(0, -1) + 'v' + ORDINAL_SUFFIX
  }

  // Drop plural -s from cents/vingts/millions/etc. (quatre-vingts → quatre-vingtième)
  // Note: "trois", "six" also end in s but that's not a plural
  if (cardinalWord.endsWith('cents') ||
      cardinalWord.endsWith('vingts') ||
      cardinalWord.endsWith('millions') ||
      cardinalWord.endsWith('milliards') ||
      cardinalWord.endsWith('billions') ||
      cardinalWord.endsWith('billiards') ||
      cardinalWord.endsWith('trillions') ||
      cardinalWord.endsWith('trilliards') ||
      cardinalWord.endsWith('quadrillions') ||
      cardinalWord.endsWith('quadrilliards')) {
    return cardinalWord.slice(0, -1) + ORDINAL_SUFFIX
  }

  // Drop final -e before adding -ième (quatre → quatrième)
  if (cardinalWord.endsWith('e')) {
    return cardinalWord.slice(0, -1) + ORDINAL_SUFFIX
  }

  // Default: just add -ième
  return cardinalWord + ORDINAL_SUFFIX
}

/**
 * Converts a positive integer to Belgian French ordinal words.
 *
 * @param {bigint} n - Positive integer
 * @returns {string} Belgian French ordinal words
 */
function integerToOrdinal (n) {
  // Special case: 1 → premier
  if (n === 1n) {
    return PREMIER
  }

  // Get cardinal form and convert to ordinal
  const cardinalWord = integerToWords(n, false)
  return cardinalToOrdinal(cardinalWord)
}

/**
 * Converts a numeric value to Belgian French ordinal words.
 *
 * Belgian French ordinals: premier (1st), then cardinal + ième.
 * Special rules: quatre→quatrième, cinq→cinquième, neuf→neuvième.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'premier'
 * toOrdinal(2)    // 'deuxième'
 * toOrdinal(70)   // 'septantième'
 * toOrdinal(90)   // 'nonantième'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Belgian French currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "et" between euros and centimes
 * @returns {string} The amount in Belgian French currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                 // 'quarante-deux euros et cinquante centimes'
 * toCurrency(1)                     // 'un euro'
 * toCurrency(0.99)                  // 'nonante-neuf centimes'
 * toCurrency(0.01)                  // 'un centime'
 * toCurrency(42.50, { and: false }) // 'quarante-deux euros cinquante centimes'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents: centimes } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Euros part
  if (euros > 0n || centimes === 0n) {
    result += integerToWords(euros, false)
    // In French, 0 and 1 are singular: "zéro euro", "un euro"
    result += ' ' + (euros <= 1n ? EURO : EUROS)
  }

  // Centimes part
  if (centimes > 0n) {
    if (euros > 0n) {
      result += useAnd ? ' et ' : ' '
    }
    result += integerToWords(centimes, false)
    result += ' ' + (centimes === 1n ? CENTIME : CENTIMES)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
