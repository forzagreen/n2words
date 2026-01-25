/**
 * Polish (Poland) language converter
 *
 * CLDR: pl-PL | Polish as used in Poland
 *
 * Polish-specific rules:
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Gender agreement (masculine/feminine for numbers < 1000)
 * - Omit "jeden" before scale words (tysiąc, milion, etc.)
 * - Irregular hundreds: dwieście, trzysta, czterysta, pięćset...
 * - Long scale with -ard forms: miliard, biliard, tryliard
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
const ONES_FEM = ['', 'jedna', 'dwie', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']

const TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście']

const TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt']

// Irregular hundreds
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']

// Scale words: [singular, few (2-4), many (5+)]
const PLURAL_FORMS = {
  1: ['tysiąc', 'tysiące', 'tysięcy'],
  2: ['milion', 'miliony', 'milionów'],
  3: ['miliard', 'miliardy', 'miliardów'],
  4: ['bilion', 'biliony', 'bilionów'],
  5: ['biliard', 'biliardy', 'biliardów'],
  6: ['trylion', 'tryliony', 'trylionów'],
  7: ['tryliard', 'tryliardy', 'tryliardów'],
  8: ['kwadrylion', 'kwadryliony', 'kwadrylionów'],
  9: ['kwaryliard', 'kwadryliardy', 'kwadryliardów'],
  10: ['kwintylion', 'kwintyliony', 'kwintylionów']
}

const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'przecinek'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Polish ordinals (masculine nominative singular)
// 1-9: special forms
const ORDINAL_ONES = ['', 'pierwszy', 'drugi', 'trzeci', 'czwarty', 'piąty', 'szósty', 'siódmy', 'ósmy', 'dziewiąty']

// Teens ordinals
const ORDINAL_TEENS = ['dziesiąty', 'jedenasty', 'dwunasty', 'trzynasty', 'czternasty', 'piętnasty', 'szesnasty', 'siedemnasty', 'osiemnasty', 'dziewiętnasty']

// Tens ordinals (for exact tens)
const ORDINAL_TENS = ['', '', 'dwudziesty', 'trzydziesty', 'czterdziesty', 'pięćdziesiąty', 'sześćdziesiąty', 'siedemdziesiąty', 'osiemdziesiąty', 'dziewięćdziesiąty']

// Hundreds ordinals (for exact hundreds)
const ORDINAL_HUNDREDS = ['', 'setny', 'dwusetny', 'trzechsetny', 'czterechsetny', 'pięćsetny', 'sześćsetny', 'siedemsetny', 'osiemsetny', 'dziewięćsetny']

// Scale ordinals (1000, million, etc.)
const ORDINAL_SCALES = ['tysięczny', 'milionowy', 'miliardowy', 'bilionowy', 'biliardowy', 'trylionowy', 'tryliardowy']

// ============================================================================
// Currency Vocabulary (Polish Złoty)
// ============================================================================

// Złoty forms: [singular, few (2-4), many (5+)]
const ZLOTY_FORMS = ['złoty', 'złote', 'złotych']
// Grosz forms: [singular, few (2-4), many (5+)]
const GROSZ_FORMS = ['grosz', 'grosze', 'groszy']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine form).
 * @param {number} n - Segment value
 * @returns {string} Polish word
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    parts.push(TEENS[ones])
  } else {
    if (tens >= 2) {
      parts.push(TENS[tens])
    }
    if (ones > 0) {
      parts.push(ONES_MASC[ones])
    }
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 (feminine form - only differs in ones).
 * @param {number} n - Segment value
 * @returns {string} Polish word
 */
function buildSegmentFeminine (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones - feminine for ones only
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else {
    if (tens >= 2) {
      parts.push(TENS[tens])
    }
    if (ones > 0) {
      parts.push(ONES_FEM[ones])
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Polish pluralization: 1 = singular, 2-4 = few, else = many.
 * Special case: 11-19 always use many form.
 *
 * @param {bigint} n - Number to pluralize
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} Correct plural form
 */
function pluralize (n, forms) {
  if (n === 1n) {
    return forms[0]
  }

  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // Teens (11-19) always use many form
  // 2-4 use few form (but not 12-14)
  if (lastDigit >= 2n && lastDigit <= 4n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
    return forms[1]
  }

  return forms[2]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Polish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Polish words
 */
function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return gender === 'feminine' ? buildSegmentFeminine(Number(n)) : buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const scaleWord = pluralize(BigInt(thousands), PLURAL_FORMS[1])

    let result
    if (thousands === 1) {
      // Omit "jeden" before tysiąc
      result = scaleWord
    } else {
      result = buildSegment(thousands) + ' ' + scaleWord
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, gender)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Polish words
 */
function buildLargeNumberWords (n, gender) {
  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(temp % 1000n)
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0n) continue

    const segmentWord = buildSegment(Number(segment))

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segmentWord
    } else {
      // Scale word needed
      const forms = PLURAL_FORMS[i]
      if (forms) {
        const scaleWord = pluralize(segment, forms)

        if (segment === 1n) {
          // Omit "jeden" before scale words
          result += scaleWord
        } else {
          result += segmentWord + ' ' + scaleWord
        }
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Polish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Polish words for decimal part
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
 * Converts a numeric value to Polish words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers < 1000
 * @returns {string} The number in Polish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(1)                          // 'jeden'
 * toCardinal(1, { gender: 'feminine' })  // 'jedna'
 * toCardinal(1000)                       // 'tysiąc'
 * toCardinal(2000)                       // 'dwa tysiące'
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
 * Returns ordinal form: "pierwszy", "dwudziesty pierwszy", etc.
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal words
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)

  if (tensDigit === 0) {
    // Single digit: pierwszy, drugi, etc.
    return ORDINAL_ONES[onesDigit]
  }

  if (tensDigit === 1) {
    // Teens: dziesiąty, jedenasty, etc.
    return ORDINAL_TEENS[onesDigit]
  }

  // Tens >= 20
  if (onesDigit === 0) {
    // Round tens: dwudziesty, trzydziesty, etc.
    return ORDINAL_TENS[tensDigit]
  }

  // Compound: dwudziesty pierwszy, trzydziesty drugi, etc.
  return ORDINAL_TENS[tensDigit] + ' ' + ORDINAL_ONES[onesDigit]
}

/**
 * Converts a positive integer to Polish ordinal words (masculine nominative).
 *
 * In Polish ordinals, only the LAST component becomes ordinal.
 * E.g., 121 = "sto dwudziesty pierwszy" (one hundred twenty-first)
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Polish words
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
      // Exact hundreds: setny, dwusetny, etc.
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
      // Exact thousands: tysięczny, etc.
      if (thousands === 1) {
        return ORDINAL_SCALES[0]
      }
      // For larger thousands, use cardinal + tysięczny
      return buildSegment(thousands) + ' ' + ORDINAL_SCALES[0]
    }

    // Has remainder: cardinal thousands + ordinal remainder
    const scaleWord = pluralize(BigInt(thousands), PLURAL_FORMS[1])
    const thousandsWord = thousands === 1 ? '' : buildSegment(thousands) + ' '
    return thousandsWord + scaleWord + ' ' + integerToOrdinal(BigInt(remainder))
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 * All segments except the final one are cardinal; final segment is ordinal.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Polish words
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
          parts.push(buildSegment(segment))
        }
      } else {
        // Has scale word
        if (isLastNonZero) {
          // This scale position is the final ordinal
          if (segment === 1) {
            parts.push(ORDINAL_SCALES[scaleIndex - 1])
          } else {
            // Use cardinal segment + ordinal scale
            parts.push(buildSegment(segment) + ' ' + ORDINAL_SCALES[scaleIndex - 1])
          }
        } else {
          // Not the final segment: use cardinal
          const forms = PLURAL_FORMS[scaleIndex]
          const scaleWord = forms ? pluralize(BigInt(segment), forms) : ''
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
 * Converts a numeric value to Polish ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words (e.g., "pierwszy", "czterdziesty drugi")
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'pierwszy'
 * toOrdinal(2)    // 'drugi'
 * toOrdinal(3)    // 'trzeci'
 * toOrdinal(21)   // 'dwudziesty pierwszy'
 * toOrdinal(42)   // 'czterdziesty drugi'
 * toOrdinal(100)  // 'setny'
 * toOrdinal(1000) // 'tysięczny'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Polish currency words (Polish Złoty).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Polish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'czterdzieści dwa złote'
 * toCurrency(1)      // 'jeden złoty'
 * toCurrency(1.50)   // 'jeden złoty pięćdziesiąt groszy'
 * toCurrency(-5)     // 'minus pięć złotych'
 */
function toCurrency (value) {
  const { isNegative, dollars: zloty, cents: grosze } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Złoty part (masculine)
  if (zloty > 0n || grosze === 0n) {
    result += integerToWords(zloty, 'masculine')
    result += ' ' + pluralize(zloty, ZLOTY_FORMS)
  }

  // Grosze part (masculine)
  if (grosze > 0n) {
    if (zloty > 0n) {
      result += ' '
    }
    result += integerToWords(grosze, 'masculine')
    result += ' ' + pluralize(grosze, GROSZ_FORMS)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
