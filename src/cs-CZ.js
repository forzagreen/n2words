/**
 * Czech (Czechia) language converter
 *
 * CLDR: cs-CZ | Czech as used in Czechia
 *
 * Czech-specific rules:
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Irregular hundreds: sto, dvě stě, tři sta, čtyři sta, pět set...
 * - Gender: dva (masc) vs dvě (fem) for 2
 * - Omit "one" before scale words: "tisíc" not "jedna tisíc"
 * - Dynamic decimal separator: celá/celé/celých based on integer
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Ones words (masculine form)
const ONES = ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět']

// Teens (10-19)
const TEENS = ['deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct']

// Tens (20-90)
const TENS = ['', '', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát']

// Irregular hundreds
const HUNDREDS = ['', 'sto', 'dvě stě', 'tři sta', 'čtyři sta', 'pět set', 'šest set', 'sedm set', 'osm set', 'devět set']

// Scale plural forms [singular, few (2-4), many (5+)]
const PLURAL_FORMS = {
  1: ['tisíc', 'tisíce', 'tisíc'], // 10^3
  2: ['milion', 'miliony', 'milionů'], // 10^6
  3: ['miliarda', 'miliardy', 'miliard'], // 10^9
  4: ['bilion', 'biliony', 'bilionů'], // 10^12
  5: ['biliarda', 'biliardy', 'biliard'], // 10^15
  6: ['trilion', 'triliony', 'trilionů'], // 10^18
  7: ['triliarda', 'triliardy', 'triliard'], // 10^21
  8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^24
  9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'] // 10^27
}

const ZERO = 'nula'
const NEGATIVE = 'mínus'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Czech ordinals (masculine nominative singular)
const ORDINAL_ONES = ['', 'první', 'druhý', 'třetí', 'čtvrtý', 'pátý', 'šestý', 'sedmý', 'osmý', 'devátý']

// Ordinal teens
const ORDINAL_TEENS = ['desátý', 'jedenáctý', 'dvanáctý', 'třináctý', 'čtrnáctý', 'patnáctý', 'šestnáctý', 'sedmnáctý', 'osmnáctý', 'devatenáctý']

// Ordinal tens (for exact tens)
const ORDINAL_TENS = ['', '', 'dvacátý', 'třicátý', 'čtyřicátý', 'padesátý', 'šedesátý', 'sedmdesátý', 'osmdesátý', 'devadesátý']

// Ordinal hundreds (for exact hundreds)
const ORDINAL_HUNDREDS = ['', 'stý', 'dvoustý', 'třístý', 'čtyřstý', 'pětistý', 'šestistý', 'sedmistý', 'osmistý', 'devítistý']

// Scale ordinals
const ORDINAL_SCALES = ['tisící', 'miliontý', 'miliardtý', 'biliontý']

// ============================================================================
// Currency Vocabulary (Czech Koruna)
// ============================================================================

// Koruna forms: [singular, few (2-4), many (5+)]
const KORUNA_FORMS = ['koruna', 'koruny', 'korun']
// Haléř forms: [singular, few (2-4), many (5+)]
const HALER_FORMS = ['haléř', 'haléře', 'haléřů']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine, default form).
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds (irregular)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // Teens
    parts.push(TEENS[ones])
  } else if (tens >= 2) {
    parts.push(TENS[tens])
    if (ones > 0) {
      parts.push(ONES[ones])
    }
  } else if (ones > 0) {
    parts.push(ONES[ones])
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 with feminine hundreds.
 * Hundreds use irregular forms (dvě stě, tři sta) but ones remain masculine.
 */
function buildSegmentWithHundreds (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds use the irregular HUNDREDS array (already has "dvě stě" etc.)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones use masculine form
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (tens >= 2) {
    parts.push(TENS[tens])
    if (ones > 0) {
      parts.push(ONES[ones]) // masculine
    }
  } else if (ones > 0) {
    parts.push(ONES[ones]) // masculine
  }

  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Czech pluralization: 1 = singular, 2-4 = few, else = many.
 * Teens (11-19) always use "many" form.
 *
 * @param {bigint} n - The number
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} The appropriate form
 */
function pluralize (n, forms) {
  if (n === 1n) return forms[0]

  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // 2-4, but not 12-14 (teens use "many")
  if (lastDigit >= 2n && lastDigit <= 4n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
    return forms[1]
  }

  return forms[2]
}

/**
 * Gets the decimal separator word based on integer part.
 * celá (0-1), celé (2-4), celých (5+)
 */
function getDecimalSeparator (integerPart) {
  if (integerPart === 0n || integerPart === 1n) {
    return 'celá'
  } else if (integerPart >= 2n && integerPart <= 4n) {
    return 'celé'
  } else {
    return 'celých'
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Czech words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Czech words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = n / 1000n
    const remainder = Number(n % 1000n)

    const scaleWord = pluralize(thousands, PLURAL_FORMS[1])

    let result
    if (thousands === 1n) {
      // Omit "one" before tisíc
      result = scaleWord
    } else {
      result = buildSegment(Number(thousands)) + ' ' + scaleWord
    }

    if (remainder > 0) {
      // Use form with irregular hundreds (for "dvě stě" etc.)
      result += ' ' + buildSegmentWithHundreds(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Czech words
 */
function buildLargeNumberWords (n) {
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

    if (result) result += ' '

    if (i === 0) {
      // Units segment (no scale word) - use form with irregular hundreds
      result += buildSegmentWithHundreds(Number(segment))
    } else {
      // Scale word needed
      const forms = PLURAL_FORMS[i]
      if (forms) {
        const scaleWord = pluralize(segment, forms)

        if (segment === 1n) {
          // Omit "one" before scale words
          result += scaleWord
        } else {
          // Use masculine form for multiplier before scale words
          result += buildSegment(Number(segment)) + ' ' + scaleWord
        }
      } else {
        // Fallback for very large scales without defined forms
        result += buildSegment(Number(segment))
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Czech words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Czech words for decimal part
 */
function decimalPartToWords (decimalPart) {
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
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Czech words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Czech words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)           // 'dvacet jedna'
 * toCardinal(1000)         // 'tisíc'
 * toCardinal(2000)         // 'dva tisíce'
 * toCardinal(5000)         // 'pět tisíc'
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    const separator = getDecimalSeparator(integerPart)
    result += ' ' + separator + ' ' + decimalPartToWords(decimalPart)
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
 * Converts a positive integer to Czech ordinal words (masculine nominative).
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Czech words
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
      return buildSegment(thousands) + ' ' + ORDINAL_SCALES[0]
    }

    const scaleWord = pluralize(BigInt(thousands), PLURAL_FORMS[1])
    const thousandsWord = thousands === 1 ? '' : buildSegment(thousands) + ' '
    return (thousands === 1 ? 'tisíc' : thousandsWord + scaleWord) + ' ' + integerToOrdinal(BigInt(remainder))
  }

  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Czech words
 */
function buildLargeOrdinal (n) {
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(temp % 1000n)
    temp = temp / 1000n
  }

  let lastNonZeroIdx = 0
  for (let i = 0; i < segmentValues.length; i++) {
    if (segmentValues[i] !== 0n) {
      lastNonZeroIdx = i
    }
  }

  const parts = []

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0n) continue

    const isLastNonZero = (i === lastNonZeroIdx)

    if (i === 0) {
      if (isLastNonZero) {
        parts.push(integerToOrdinal(segment))
      } else {
        parts.push(buildSegmentWithHundreds(Number(segment)))
      }
    } else {
      if (isLastNonZero) {
        if (segment === 1n) {
          parts.push(ORDINAL_SCALES[i - 1] || PLURAL_FORMS[i][0])
        } else {
          parts.push(buildSegment(Number(segment)) + ' ' + (ORDINAL_SCALES[i - 1] || PLURAL_FORMS[i][0]))
        }
      } else {
        const forms = PLURAL_FORMS[i]
        if (forms) {
          const scaleWord = pluralize(segment, forms)
          if (segment === 1n) {
            parts.push(scaleWord)
          } else {
            parts.push(buildSegment(Number(segment)) + ' ' + scaleWord)
          }
        }
      }
    }
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Czech ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'první'
 * toOrdinal(2)    // 'druhý'
 * toOrdinal(21)   // 'dvacet první'
 * toOrdinal(100)  // 'stý'
 * toOrdinal(1000) // 'tisící'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Czech currency words (Koruna).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Czech currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'čtyřicet dva koruny'
 * toCurrency(1)      // 'jedna koruna'
 * toCurrency(1.50)   // 'jedna koruna padesát haléřů'
 * toCurrency(-5)     // 'mínus pět korun'
 */
function toCurrency (value) {
  const { isNegative, dollars: koruny, cents: halere } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Koruna part
  if (koruny > 0n || halere === 0n) {
    result += integerToWords(koruny)
    result += ' ' + pluralize(koruny, KORUNA_FORMS)
  }

  // Haléř part
  if (halere > 0n) {
    if (koruny > 0n) {
      result += ' '
    }
    result += integerToWords(halere)
    result += ' ' + pluralize(halere, HALER_FORMS)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
