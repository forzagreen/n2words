/**
 * Serbian (Serbia, Latin script) language converter
 *
 * CLDR: sr-Latn-RS | Serbian as used in Serbia (Latin script)
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds (dvesta, trista, etc.)
 * - Long scale naming with -ard forms
 * - Latin script
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES_MASC = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
const ONES_FEM = ['', 'jedna', 'dve', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
const TEENS = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
const TENS = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']
const HUNDREDS = ['', 'sto', 'dvesta', 'trista', 'četiristo', 'petsto', 'šesto', 'sedamsto', 'osamsto', 'devetsto']

const ZERO = 'nula'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'zapeta'

// ============================================================================
// Ordinal Vocabulary (masculine nominative)
// ============================================================================

// Ordinal ones: prvi, drugi, treći...
const ORDINAL_ONES = ['', 'prvi', 'drugi', 'treći', 'četvrti', 'peti', 'šesti', 'sedmi', 'osmi', 'deveti']

// Ordinal teens: deseti, jedanaesti...
const ORDINAL_TEENS = ['deseti', 'jedanaesti', 'dvanaesti', 'trinaesti', 'četrnaesti', 'petnaesti', 'šesnaesti', 'sedamnaesti', 'osamnaesti', 'devetnaesti']

// Ordinal tens: dvadeseti, trideseti...
const ORDINAL_TENS = ['', '', 'dvadeseti', 'trideseti', 'četrdeseti', 'pedeseti', 'šezdeseti', 'sedamdeseti', 'osamdeseti', 'devedeseti']

// Ordinal hundreds: stoti, dvestoti...
const ORDINAL_HUNDREDS = ['', 'stoti', 'dvestoti', 'tristoti', 'četiristoti', 'petstoti', 'šestoti', 'sedamstoti', 'osamstoti', 'devetstoti']

// Ordinal scale words (hiljaditi, milioniti, etc.)
const ORDINAL_SCALES = [
  'hiljaditi',
  'milioniti',
  'milijarditi',
  'bilioniti',
  'bilijarditi',
  'trilioniti',
  'trilijarditi',
  'kvadrilioniti',
  'kvadrilijarditi'
]

// ============================================================================
// Currency Vocabulary (Serbian Dinar)
// ============================================================================

// Dinar: masculine, [singular, few, many]
const DINAR_FORMS = ['dinar', 'dinara', 'dinara']

// Para: feminine, [singular, few, many]
const PARA_FORMS = ['para', 'pare', 'para']

// Scale words: [singular, few, many]
const SCALE_FORMS = [
  ['hiljada', 'hiljade', 'hiljada'],
  ['milion', 'miliona', 'miliona'],
  ['milijarda', 'milijarde', 'milijarda'],
  ['bilion', 'biliona', 'biliona'],
  ['bilijarda', 'bilijarde', 'bilijarda'],
  ['trilion', 'triliona', 'triliona'],
  ['trilijarda', 'trilijarde', 'trilijarda'],
  ['kvadrilion', 'kvadriliona', 'kvadriliona'],
  ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda']
]

// ============================================================================
// Segment Building
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

function buildSegmentMasc (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  if (hundredsDigit > 0) {
    parts.push(HUNDREDS[hundredsDigit])
  }

  if (tensDigit > 1) {
    parts.push(TENS[tensDigit])
  }

  if (tensDigit === 1) {
    parts.push(TEENS[onesDigit])
  } else if (onesDigit > 0) {
    parts.push(ONES_MASC[onesDigit])
  }

  return parts.join(' ')
}

function buildSegmentFem (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  if (hundredsDigit > 0) {
    parts.push(HUNDREDS[hundredsDigit])
  }

  if (tensDigit > 1) {
    parts.push(TENS[tensDigit])
  }

  if (tensDigit === 1) {
    parts.push(TEENS[onesDigit])
  } else if (onesDigit > 0) {
    parts.push(ONES_FEM[onesDigit])
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return gender === 'feminine' ? buildSegmentFem(Number(n)) : buildSegmentMasc(Number(n))
  }

  return buildLargeNumberWords(n, gender)
}

function buildLargeNumberWords (n, gender) {
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
        parts.push(gender === 'feminine' ? buildSegmentFem(segment) : buildSegmentMasc(segment))
      } else {
        const scaleForms = SCALE_FORMS[scaleIndex - 1]
        const scaleWord = pluralize(segment, scaleForms)
        // Thousands (scaleIndex=1) are feminine, others masculine
        const isFeminine = scaleIndex === 1
        const segmentWord = isFeminine ? buildSegmentFem(segment) : buildSegmentMasc(segment)
        parts.push(segmentWord + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

function decimalPartToWords (decimalPart, gender) {
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
    result += integerToWords(BigInt(remainder), gender)
  }

  return result
}

/**
 * Converts a numeric value to Serbian (Latin) words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Serbian Latin words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { gender = 'masculine' } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, gender)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, gender)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Builds ordinal for a 0-99 segment when it's the final (ordinal) part.
 * Returns ordinal form: "prvi", "dvadeset prvi", etc.
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal words
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)

  if (tensDigit === 0) {
    // Single digit: prvi, drugi, etc.
    return ORDINAL_ONES[onesDigit]
  }

  if (tensDigit === 1) {
    // Teens: deseti, jedanaesti, etc.
    return ORDINAL_TEENS[onesDigit]
  }

  // Tens >= 20
  if (onesDigit === 0) {
    // Round tens: dvadeseti, trideseti, etc.
    return ORDINAL_TENS[tensDigit]
  }

  // Compound: dvadeset prvi, trideset drugi, etc.
  return TENS[tensDigit] + ' ' + ORDINAL_ONES[onesDigit]
}

/**
 * Converts a positive integer to Serbian ordinal words (masculine nominative).
 *
 * In Serbian ordinals, only the LAST component becomes ordinal.
 * E.g., 121 = "sto dvadeset prvi" (one hundred twenty first)
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Serbian words
 */
function integerToOrdinal (n) {
  // Fast path: numbers < 100
  if (n < 100n) {
    return buildOrdinalTensOnes(Number(n))
  }

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const num = Number(n)
    const hundredsDigit = Math.floor(num / 100)
    const remainder = num % 100

    if (remainder === 0) {
      // Exact hundreds: stoti, dvestoti, etc.
      return ORDINAL_HUNDREDS[hundredsDigit]
    }

    // Has remainder: cardinal hundreds + ordinal remainder
    return HUNDREDS[hundredsDigit] + ' ' + buildOrdinalTensOnes(remainder)
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      // Exact thousands: hiljaditi, etc.
      if (thousands === 1) {
        return ORDINAL_SCALES[0]
      }
      // Use cardinal segment + ordinal scale
      return buildSegmentFem(thousands) + ' ' + ORDINAL_SCALES[0]
    }

    // Has remainder: cardinal thousands + ordinal remainder
    const thousandsWord = buildSegmentFem(thousands)
    const scaleWord = pluralize(thousands, SCALE_FORMS[0])
    return thousandsWord + ' ' + scaleWord + ' ' + integerToOrdinal(BigInt(remainder))
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 * All segments except the final one are cardinal; final segment is ordinal.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Serbian words
 */
function buildLargeOrdinal (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Extract segments (most-significant first)
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

  // Find the last non-zero segment
  let lastNonZeroIdx = segments.length - 1
  while (lastNonZeroIdx >= 0 && segments[lastNonZeroIdx] === 0) {
    lastNonZeroIdx--
  }

  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const isLastNonZero = (i === lastNonZeroIdx)

      if (scaleIndex === 0) {
        // Units position (no scale)
        if (isLastNonZero) {
          parts.push(integerToOrdinal(BigInt(segment)))
        } else {
          parts.push(buildSegmentMasc(segment))
        }
      } else {
        // Has scale word
        if (isLastNonZero) {
          // This scale position is the final ordinal
          if (segment === 1) {
            parts.push(ORDINAL_SCALES[scaleIndex - 1])
          } else {
            // Use cardinal segment + ordinal scale
            const isFeminine = scaleIndex === 1 // thousands are feminine
            const segmentWord = isFeminine ? buildSegmentFem(segment) : buildSegmentMasc(segment)
            parts.push(segmentWord + ' ' + ORDINAL_SCALES[scaleIndex - 1])
          }
        } else {
          // Not the final segment: use cardinal
          const scaleForms = SCALE_FORMS[scaleIndex - 1]
          const scaleWord = pluralize(segment, scaleForms)
          const isFeminine = scaleIndex === 1
          const segmentWord = isFeminine ? buildSegmentFem(segment) : buildSegmentMasc(segment)
          parts.push(segmentWord + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Serbian ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words (e.g., "prvi", "četrdeset drugi")
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'prvi'
 * toOrdinal(2)    // 'drugi'
 * toOrdinal(3)    // 'treći'
 * toOrdinal(21)   // 'dvadeset prvi'
 * toOrdinal(42)   // 'četrdeset drugi'
 * toOrdinal(100)  // 'stoti'
 * toOrdinal(1000) // 'hiljaditi'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Serbian currency words (Serbian Dinar).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "i" between dinars and para
 * @returns {string} The amount in Serbian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                    // 'četrdeset dva dinara i pedeset para'
 * toCurrency(1)                        // 'jedan dinar'
 * toCurrency(0.99)                     // 'devedeset devet para'
 * toCurrency(0.01)                     // 'jedna para'
 * toCurrency(42.50, { and: false })    // 'četrdeset dva dinara pedeset para'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: dinars, cents: para } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Dinars part (masculine) - show if non-zero, or if no para
  if (dinars > 0n || para === 0n) {
    result += integerToWords(dinars, 'masculine')
    result += ' ' + pluralize(dinars, DINAR_FORMS)
  }

  // Para part (feminine)
  if (para > 0n) {
    if (dinars > 0n) {
      result += useAnd ? ' i ' : ' '
    }
    result += integerToWords(para, 'feminine')
    result += ' ' + pluralize(para, PARA_FORMS)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
