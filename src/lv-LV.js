/**
 * Latvian (Latvia) language converter
 *
 * CLDR: lv-LV | Latvian as used in Latvia
 *
 * Key features:
 * - Two-form pluralization (singular for 1 except 11, plural otherwise)
 * - Gender agreement (masculine/feminine for numbers < 1000)
 * - Special hundreds forms (simts/simti/simtu)
 * - Omit "one" before scale words
 * - Long scale naming
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'viens', 'divi', 'trīs', 'četri', 'pieci', 'seši', 'septiņi', 'astoņi', 'deviņi']
const ONES_FEM = ['', 'viena', 'divas', 'trīs', 'četras', 'piecas', 'sešas', 'septiņas', 'astoņas', 'deviņas']

const TEENS = ['desmit', 'vienpadsmit', 'divpadsmit', 'trīspadsmit', 'četrpadsmit', 'piecpadsmit', 'sešpadsmit', 'septiņpadsmit', 'astoņpadsmit', 'deviņpadsmit']
const TENS = ['', '', 'divdesmit', 'trīsdesmit', 'četrdesmit', 'piecdesmit', 'sešdesmit', 'septiņdesmit', 'astoņdesmit', 'deviņdesmit']

// Hundreds: simts (100, 110-199), simti (200-999), simtu (101-109)
const HUNDRED_SINGULAR = 'simts'
const HUNDRED_PLURAL = 'simti'
const HUNDRED_GENITIVE = 'simtu'

const ZERO = 'nulle'
const NEGATIVE = 'mīnus'
const DECIMAL_SEP = 'komats'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Latvian ordinals (masculine nominative singular)
const ORDINAL_ONES = ['', 'pirmais', 'otrais', 'trešais', 'ceturtais', 'piektais', 'sestais', 'septītais', 'astotais', 'devītais']

// Ordinal teens
const ORDINAL_TEENS = ['desmitais', 'vienpadsmitais', 'divpadsmitais', 'trīspadsmitais', 'četrpadsmitais', 'piecpadsmitais', 'sešpadsmitais', 'septiņpadsmitais', 'astoņpadsmitais', 'deviņpadsmitais']

// Ordinal tens
const ORDINAL_TENS = ['', '', 'divdesmitais', 'trīsdesmitais', 'četrdesmitais', 'piecdesmitais', 'sešdesmitais', 'septiņdesmitais', 'astoņdesmitais', 'deviņdesmitais']

// Ordinal hundreds (complete forms with suffix)
const ORDINAL_HUNDREDS = ['', 'simtais', 'divsimtais', 'trīssimtais', 'četrsimtais', 'piecsimtais', 'sešsimtais', 'septiņsimtais', 'astoņsimtais', 'deviņsimtais']

// Scale ordinals
const ORDINAL_SCALES = ['tūkstošais', 'miljonais', 'miljardais', 'triljonais']

// ============================================================================
// Currency Vocabulary (Euro - Latvia uses Euro since 2014)
// ============================================================================

// Cent forms: [singular, plural, genitive]
// Note: Eiro is indeclinable in Latvian, so we just use 'eiro' directly
const CENT_FORMS = ['cents', 'centi', 'centu']

// Scale words: [singular, plural, genitive]
const SCALE_FORMS = [
  ['tūkstotis', 'tūkstoši', 'tūkstošu'],
  ['miljons', 'miljoni', 'miljonu'],
  ['miljards', 'miljardi', 'miljardu'],
  ['triljons', 'triljoni', 'triljonu'],
  ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
  ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
  ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
  ['septiljons', 'septiljoni', 'septiljonu'],
  ['oktiljons', 'oktiljoni', 'oktiljonu']
]

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine form).
 * Does NOT include special handling for segment=1 (omitOneBeforeScale).
 * That's handled at join time.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - Latvian has special forms
  if (hundreds > 0) {
    if (hundreds === 1 && tens === 0 && ones > 0) {
      // 101-109: use genitive form "simtu"
      parts.push(HUNDRED_GENITIVE)
    } else if (hundreds > 1) {
      // 200-999: use plural "simti"
      parts.push(ONES_MASC[hundreds])
      parts.push(HUNDRED_PLURAL)
    } else {
      // 100, 110-199: use singular "simts"
      parts.push(HUNDRED_SINGULAR)
    }
  }

  // Tens
  if (tens > 1) {
    parts.push(TENS[tens])
  }

  // Teens or ones
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (ones > 0) {
    parts.push(ONES_MASC[ones])
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 (feminine form - only differs in ones).
 */
function buildSegmentFeminine (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - always masculine
  if (hundreds > 0) {
    if (hundreds === 1 && tens === 0 && ones > 0) {
      parts.push(HUNDRED_GENITIVE)
    } else if (hundreds > 1) {
      parts.push(ONES_MASC[hundreds])
      parts.push(HUNDRED_PLURAL)
    } else {
      parts.push(HUNDRED_SINGULAR)
    }
  }

  // Tens
  if (tens > 1) {
    parts.push(TENS[tens])
  }

  // Teens or ones - feminine for ones only
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (ones > 0) {
    parts.push(ONES_FEM[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Pluralization
// ============================================================================

/**
 * Latvian pluralization - simpler than Slavic.
 * Singular: ends in 1 (except 11)
 * Plural: everything else
 *
 * @param {number} n - The segment value
 * @param {string[]} forms - [singular, plural, genitive]
 * @returns {string} The appropriate form
 */
function pluralize (n, forms) {
  if (n === 0) return forms[2]

  const lastDigit = n % 10
  const lastTwoDigits = n % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return forms[0]
  }

  return forms[1]
}

/**
 * Latvian currency pluralization.
 * Uses genitive for 0, 10-19, and multiples of 10.
 *
 * @param {number} n - The segment value
 * @param {string[]} forms - [singular, plural, genitive]
 * @returns {string} The appropriate form
 */
function pluralizeCurrency (n, forms) {
  if (n === 0) return forms[2]

  const lastDigit = n % 10
  const lastTwoDigits = n % 100

  // 10-19 use genitive
  if (lastTwoDigits >= 10 && lastTwoDigits <= 19) {
    return forms[2]
  }

  // Ends in 0 uses genitive
  if (lastDigit === 0) {
    return forms[2]
  }

  // Ends in 1 uses singular
  if (lastDigit === 1) {
    return forms[0]
  }

  // 2-9 uses plural
  return forms[1]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Latvian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words
 */
function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const num = Number(n)
    return gender === 'feminine' ? buildSegmentFeminine(num) : buildSegment(num)
  }

  // For numbers >= 1000, feminine only applies to final segment if < 1000
  // But we use masculine for all segments when n >= 1000
  return buildLargeNumberWords(n, gender)
}

/**
 * Builds words for numbers >= 1000.
 *
 * @param {bigint} n - Number >= 1000
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words
 */
function buildLargeNumberWords (n, gender) {
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
      const segmentWord = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment - use masculine (feminine doesn't apply when n >= 1000)
        parts.push(segmentWord)
      } else {
        // Segment with scale word
        const scaleForms = SCALE_FORMS[scaleIndex - 1]
        const scaleWord = pluralize(segment, scaleForms)

        // Latvian omits "one" before scale words
        if (segment === 1) {
          parts.push(scaleWord)
        } else {
          parts.push(segmentWord + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Latvian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words for decimal part
 */
function decimalPartToWords (decimalPart, gender) {
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
    result += integerToWords(BigInt(remainder), gender)
  }

  return result
}

/**
 * Converts a numeric value to Latvian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers < 1000
 * @returns {string} The number in Latvian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)                          // 'četrdesmit divi'
 * toCardinal(1, { gender: 'feminine' })   // 'viena'
 * toCardinal(1000)                        // 'tūkstotis'
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
 * Converts a positive integer to Latvian ordinal words (masculine nominative).
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Latvian words
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

    // Cardinal hundreds + ordinal remainder
    let hundredWord
    if (hundredsDigit === 1) {
      hundredWord = HUNDRED_SINGULAR
    } else {
      hundredWord = ONES_MASC[hundredsDigit] + ' ' + HUNDRED_PLURAL
    }
    return hundredWord + ' ' + buildOrdinalTensOnes(remainder)
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands === 1) {
        return ORDINAL_SCALES[0]
      }
      // For 2000+, include cardinal scale word before ordinal
      const scaleWord = pluralize(thousands, SCALE_FORMS[0])
      return buildSegment(thousands) + ' ' + scaleWord + ' ' + ORDINAL_SCALES[0]
    }

    const scaleWord = pluralize(thousands, SCALE_FORMS[0])
    const thousandsWord = thousands === 1 ? '' : buildSegment(thousands) + ' '
    return (thousands === 1 ? scaleWord : thousandsWord + scaleWord) + ' ' + integerToOrdinal(BigInt(remainder))
  }

  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Latvian words
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
          parts.push(buildSegment(segment))
        }
      } else {
        if (isLastNonZero) {
          if (segment === 1) {
            parts.push(ORDINAL_SCALES[scaleIndex - 1])
          } else {
            // For 2+, include cardinal scale word before ordinal
            const scaleForms = SCALE_FORMS[scaleIndex - 1]
            const cardinalScaleWord = pluralize(segment, scaleForms)
            parts.push(buildSegment(segment) + ' ' + cardinalScaleWord + ' ' + ORDINAL_SCALES[scaleIndex - 1])
          }
        } else {
          const scaleForms = SCALE_FORMS[scaleIndex - 1]
          const scaleWord = pluralize(segment, scaleForms)
          if (segment === 1) {
            parts.push(scaleWord)
          } else {
            parts.push(buildSegment(segment) + ' ' + scaleWord)
          }
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Latvian ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'pirmais'
 * toOrdinal(2)    // 'otrais'
 * toOrdinal(21)   // 'divdesmit pirmais'
 * toOrdinal(100)  // 'simtais'
 * toOrdinal(1000) // 'tūkstošais'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Latvian currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Latvian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'četrdesmit divi eiro'
 * toCurrency(1)      // 'viens eiro'
 * toCurrency(1.50)   // 'viens eiro piecdesmit centu'
 * toCurrency(-5)     // 'mīnus pieci eiro'
 */
function toCurrency (value) {
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Euro part (eiro is indeclinable)
  if (euros > 0n || cents === 0n) {
    result += integerToWords(euros, 'masculine')
    result += ' eiro'
  }

  // Cent part (masculine)
  if (cents > 0n) {
    if (euros > 0n) {
      result += ' '
    }
    result += integerToWords(cents, 'masculine')
    result += ' ' + pluralizeCurrency(Number(cents), CENT_FORMS)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
