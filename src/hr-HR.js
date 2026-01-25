/**
 * Croatian (Croatia) language converter
 *
 * CLDR: hr-HR | Croatian as used in Croatia
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds (dvjesto, tristo, etc.)
 * - Long scale naming with -ard forms
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES_MASC = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
const ONES_FEM = ['', 'jedna', 'dvije', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']

const TEENS = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
const TENS = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']

// Croatian has irregular hundreds
const HUNDREDS = ['', 'sto', 'dvjesto', 'tristo', 'četiristo', 'petsto', 'šesto', 'sedamsto', 'osamsto', 'devetsto']

const ZERO = 'nula'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'zarez'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Croatian ordinals (masculine nominative singular)
const ORDINAL_ONES = ['', 'prvi', 'drugi', 'treći', 'četvrti', 'peti', 'šesti', 'sedmi', 'osmi', 'deveti']

// Ordinal teens
const ORDINAL_TEENS = ['deseti', 'jedanaesti', 'dvanaesti', 'trinaesti', 'četrnaesti', 'petnaesti', 'šesnaesti', 'sedamnaesti', 'osamnaesti', 'devetnaesti']

// Ordinal tens (for exact tens)
const ORDINAL_TENS = ['', '', 'dvadeseti', 'trideseti', 'četrdeseti', 'pedeseti', 'šezdeseti', 'sedamdeseti', 'osamdeseti', 'devedeseti']

// Ordinal hundreds (for exact hundreds)
const ORDINAL_HUNDREDS = ['', 'stoti', 'dvjestoti', 'tristoti', 'četiristoti', 'petstoti', 'šeststoti', 'sedamstoti', 'osamstoti', 'devetstoti']

// Scale ordinals
const ORDINAL_SCALES = ['tisućiti', 'milijunti', 'milijarditi', 'bilijunti']

// ============================================================================
// Currency Vocabulary (Croatian Kuna - now Euro)
// ============================================================================

// Euro forms: [singular, few (2-4), many (5+)] - masculine
const EURO_FORMS = ['euro', 'eura', 'eura']
// Cent forms: [singular, few (2-4), many (5+)] - masculine
const CENT_FORMS = ['cent', 'centa', 'centi']

// Scale words: [singular, few, many]
// Thousands (index 0) are feminine, rest are masculine
const SCALE_FORMS = [
  ['tisuća', 'tisuće', 'tisuća'],
  ['milijun', 'milijuna', 'milijuna'],
  ['milijarda', 'milijarde', 'milijarda'],
  ['bilijun', 'bilijuna', 'bilijuna'],
  ['bilijarda', 'bilijarde', 'bilijarda'],
  ['trilijun', 'trilijuna', 'trilijuna'],
  ['trilijarda', 'trilijarde', 'trilijarda'],
  ['kvadrilijun', 'kvadrilijuna', 'kvadrilijuna'],
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
 * Converts a numeric value to Croatian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Croatian words
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
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal words
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)

  if (tensDigit === 0) {
    return ORDINAL_ONES[onesDigit]
  }

  if (tensDigit === 1) {
    return ORDINAL_TEENS[onesDigit]
  }

  if (onesDigit === 0) {
    return ORDINAL_TENS[tensDigit]
  }

  return TENS[tensDigit] + ' ' + ORDINAL_ONES[onesDigit]
}

/**
 * Converts a positive integer to Croatian ordinal words (masculine nominative).
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Croatian words
 */
function integerToOrdinal (n) {
  if (n < 100n) {
    return buildOrdinalTensOnes(Number(n))
  }

  if (n < 1000n) {
    const num = Number(n)
    const hundredsDigit = Math.floor(num / 100)
    const remainder = num % 100

    if (remainder === 0) {
      return ORDINAL_HUNDREDS[hundredsDigit]
    }

    return HUNDREDS[hundredsDigit] + ' ' + buildOrdinalTensOnes(remainder)
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands === 1) {
        return ORDINAL_SCALES[0]
      }
      return buildSegmentFem(thousands) + ' ' + ORDINAL_SCALES[0]
    }

    const scaleWord = pluralize(thousands, SCALE_FORMS[0])
    const thousandsWord = buildSegmentFem(thousands)
    return thousandsWord + ' ' + scaleWord + ' ' + integerToOrdinal(BigInt(remainder))
  }

  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Croatian words
 */
function buildLargeOrdinal (n) {
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
        if (isLastNonZero) {
          parts.push(integerToOrdinal(BigInt(segment)))
        } else {
          parts.push(buildSegmentMasc(segment))
        }
      } else {
        if (isLastNonZero) {
          if (segment === 1) {
            parts.push(ORDINAL_SCALES[scaleIndex - 1])
          } else {
            const isFeminine = scaleIndex === 1
            const segmentWord = isFeminine ? buildSegmentFem(segment) : buildSegmentMasc(segment)
            parts.push(segmentWord + ' ' + ORDINAL_SCALES[scaleIndex - 1])
          }
        } else {
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
 * Converts a numeric value to Croatian ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'prvi'
 * toOrdinal(2)    // 'drugi'
 * toOrdinal(21)   // 'dvadeset prvi'
 * toOrdinal(100)  // 'stoti'
 * toOrdinal(1000) // 'tisućiti'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Croatian currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Croatian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'četrdeset dva eura'
 * toCurrency(1)      // 'jedan euro'
 * toCurrency(1.50)   // 'jedan euro pedeset centi'
 * toCurrency(-5)     // 'minus pet eura'
 */
function toCurrency (value) {
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Euro part (masculine)
  if (euros > 0n || cents === 0n) {
    result += integerToWords(euros, 'masculine')
    result += ' ' + pluralize(euros, EURO_FORMS)
  }

  // Cent part (masculine)
  if (cents > 0n) {
    if (euros > 0n) {
      result += ' '
    }
    result += integerToWords(cents, 'masculine')
    result += ' ' + pluralize(cents, CENT_FORMS)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
