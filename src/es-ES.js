/**
 * Spanish (Spain) language converter
 *
 * Uses the European long scale numbering system:
 * - 10⁶ = millón
 * - 10⁹ = mil millones (thousand millions)
 * - 10¹² = billón
 *
 * Spanish-specific rules:
 * - Gender agreement: uno/una, veintiuno/veintiuna, hundreds
 * - Special twenties: veinte, veintiuno, veintidós, ... veintinueve
 * - "y" conjunction: treinta y uno (only 30-99 with ones)
 * - "cien" for exact 100, "ciento/cienta" otherwise
 * - Irregular hundreds: quinientos, setecientos, novecientos
 * - "un" before millón (not "uno"), omit before mil
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ONES_FEM = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']

const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve']

// 20-29 have special compound forms
const TWENTIES_MASC = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const TWENTIES_FEM = ['veinte', 'veintiuna', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']

const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

// Irregular hundreds
const HUNDREDS_MASC = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
const HUNDREDS_FEM = ['', 'cienta', 'doscientas', 'trescientas', 'cuatrocientas', 'quinientas', 'seiscientas', 'setecientas', 'ochocientas', 'novecientas']

// Scale words (compound long scale)
const SCALES = ['millón', 'billón', 'trillón', 'cuatrillón']
const SCALES_PLURAL = ['millones', 'billones', 'trillones', 'cuatrillones']

const THOUSAND = 'mil'
const ZERO = 'cero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'punto'

// Ordinal vocabulary (1-10 have unique forms, higher numbers use patterns)
// Spanish ordinals agree in gender: primero/primera, segundo/segunda
const ORDINAL_ONES_MASC = ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno']
const ORDINAL_ONES_FEM = ['', 'primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena']
const ORDINAL_TENS_MASC = ['', 'décimo', 'vigésimo', 'trigésimo', 'cuadragésimo', 'quincuagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo']
const ORDINAL_TENS_FEM = ['', 'décima', 'vigésima', 'trigésima', 'cuadragésima', 'quincuagésima', 'sexagésima', 'septuagésima', 'octogésima', 'nonagésima']
const ORDINAL_HUNDRED_MASC = 'centésimo'
const ORDINAL_HUNDRED_FEM = 'centésima'
const ORDINAL_THOUSAND_MASC = 'milésimo'
const ORDINAL_THOUSAND_FEM = 'milésima'
const ORDINAL_MILLION_MASC = 'millonésimo'
const ORDINAL_MILLION_FEM = 'millonésima'

// Currency vocabulary (Euro - Spain's official currency)
const EURO = 'euro'
const EUROS = 'euros'
const CENTIMO = 'céntimo'
const CENTIMOS = 'céntimos'
const CURRENCY_CONNECTOR = 'con'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish word
 */
function buildSegment (n, feminine) {
  if (n === 0) return ''

  // Special case: exact 100 is "cien" (no gender)
  if (n === 100) return 'cien'

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)
  const tensOnes = n % 100

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    const hundredsArr = feminine ? HUNDREDS_FEM : HUNDREDS_MASC
    parts.push(hundredsArr[hundreds])
  }

  // Tens and ones
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    const onesArr = feminine ? ONES_FEM : ONES_MASC
    parts.push(onesArr[tensOnes])
  } else if (tensOnes < 20) {
    // 10-19: teens
    parts.push(TEENS[ones])
  } else if (tensOnes < 30) {
    // 20-29: special twenties
    const twentiesArr = feminine ? TWENTIES_FEM : TWENTIES_MASC
    parts.push(twentiesArr[ones])
  } else {
    // 30-99: tens y ones
    if (ones === 0) {
      parts.push(TENS[tens])
    } else {
      const onesArr = feminine ? ONES_FEM : ONES_MASC
      parts.push(TENS[tens] + ' y ' + onesArr[ones])
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets scale word for Spanish compound long scale.
 *
 * @param {number} scaleIndex - Scale level (1 = thousand, 2 = million, etc.)
 * @param {bigint} segment - Segment value for pluralization
 * @returns {string} Scale word
 */
function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  // Even indices (2, 4, 6, 8): millón, billón, trillón, cuatrillón
  // Odd indices > 1 (3, 5, 7): mil millones, mil billones, mil trillones
  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? SCALES_PLURAL[arrayIndex] : baseWord
  } else {
    // Compound: "mil millones" pattern
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const pluralWord = SCALES_PLURAL[arrayIndex]
    if (!pluralWord) return THOUSAND
    return THOUSAND + ' ' + pluralWord
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Spanish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words
 */
function integerToWords (n, feminine) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n), feminine)
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mil" not "uno mil"
      result = THOUSAND
    } else {
      // Use masculine for thousands segment, but check for "uno" → omit before mil
      const thousandsWord = buildSegment(thousands, false)
      // "uno mil" → "mil" (handled in joinSegments equivalent)
      if (thousandsWord === 'uno' || thousandsWord === 'una') {
        result = THOUSAND
      } else {
        result = thousandsWord + ' ' + THOUSAND
      }
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder, feminine)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, feminine)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words
 */
function buildLargeNumberWords (n, feminine) {
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

    const scaleWord = i > 0 ? getScaleWord(i, segment) : ''

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += buildSegment(Number(segment), feminine)
    } else if (i === 1) {
      // Thousands: omit "uno" before mil
      if (segment === 1n) {
        result += THOUSAND
      } else {
        result += buildSegment(Number(segment), false) + ' ' + scaleWord
      }
    } else if (i % 2 === 1) {
      // Odd scale indices (3, 5, 7): "mil millones", "mil billones", etc.
      // Omit "uno" before these compound scales
      if (segment === 1n) {
        result += scaleWord
      } else {
        result += buildSegment(Number(segment), false) + ' ' + scaleWord
      }
    } else {
      // Even scale indices (2, 4, 6): millón, billón, trillón
      if (segment === 1n) {
        // "un millón" not "uno millón"
        result += 'un ' + scaleWord
      } else {
        // Use masculine for scale segment
        result += buildSegment(Number(segment), false) + ' ' + scaleWord
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Spanish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words for decimal part
 */
function decimalPartToWords (decimalPart, feminine) {
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
    result += integerToWords(BigInt(remainder), feminine)
  }

  return result
}

/**
 * Converts a numeric value to Spanish words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Spanish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)                        // 'veintiuno'
 * toCardinal(21, {gender: 'feminine'})  // 'veintiuna'
 * toCardinal(1000000)                   // 'un millón'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { gender = 'masculine' } = options
  const feminine = gender === 'feminine'

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, feminine)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, feminine)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value, options?)
// ============================================================================

/**
 * Builds ordinal word for a 0-999 segment.
 *
 * Spanish ordinals use additive patterns:
 * - 11th = "undécimo" (décimo + primero contracted)
 * - 21st = "vigésimo primero"
 * - 100th = "centésimo"
 * - 101st = "centésimo primero"
 *
 * @param {number} n - Segment value 0-999
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish ordinal word
 */
function buildOrdinalSegment (n, feminine) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const onesArr = feminine ? ORDINAL_ONES_FEM : ORDINAL_ONES_MASC
  const tensArr = feminine ? ORDINAL_TENS_FEM : ORDINAL_TENS_MASC
  const hundredWord = feminine ? ORDINAL_HUNDRED_FEM : ORDINAL_HUNDRED_MASC

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(hundredWord)
    } else {
      // 200th = ducentésimo, 300th = tricentésimo, etc.
      // Use cardinal prefix + centésimo
      const prefixes = ['', '', 'du', 'tri', 'cuadri', 'quin', 'sex', 'septi', 'octi', 'noni']
      parts.push(prefixes[hundreds] + hundredWord)
    }
  }

  // Tens
  if (tens > 0) {
    parts.push(tensArr[tens])
  }

  // Ones
  if (ones > 0) {
    parts.push(onesArr[ones])
  }

  return parts.join(' ')
}

/**
 * Converts a positive integer to Spanish ordinal words.
 *
 * @param {bigint} n - Positive integer to convert
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish ordinal words
 */
function integerToOrdinal (n, feminine) {
  const thousandWord = feminine ? ORDINAL_THOUSAND_FEM : ORDINAL_THOUSAND_MASC
  const millionWord = feminine ? ORDINAL_MILLION_FEM : ORDINAL_MILLION_MASC

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n), feminine)
  }

  // Numbers 1000-999999
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result = ''

    if (thousands === 1) {
      result = thousandWord
    } else {
      // Use ordinal for thousands multiplier
      result = buildOrdinalSegment(thousands, feminine) + ' ' + thousandWord
    }

    if (remainder > 0) {
      result += ' ' + buildOrdinalSegment(remainder, feminine)
    }

    return result
  }

  // Numbers >= 1,000,000
  const millions = Number(n / 1_000_000n)
  const remainder = n % 1_000_000n

  let result = ''

  if (millions === 1) {
    result = millionWord
  } else {
    result = buildOrdinalSegment(millions, feminine) + ' ' + millionWord
  }

  if (remainder > 0n) {
    result += ' ' + integerToOrdinal(remainder, feminine)
  }

  return result
}

/**
 * Converts a numeric value to Spanish ordinal words.
 *
 * Spanish ordinals agree in gender with the noun they modify.
 * Only positive integers are valid for ordinals.
 *
 * @param {number | string | bigint} value - The positive integer to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Spanish ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a positive integer
 *
 * @example
 * toOrdinal(1)                          // 'primero'
 * toOrdinal(1, { gender: 'feminine' })  // 'primera'
 * toOrdinal(21)                         // 'vigésimo primero'
 * toOrdinal(100)                        // 'centésimo'
 */
function toOrdinal (value, options) {
  options = validateOptions(options)
  const integerPart = parseOrdinalValue(value)

  const { gender = 'masculine' } = options
  const feminine = gender === 'feminine'

  return integerToOrdinal(integerPart, feminine)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Spanish Euro currency words.
 *
 * Spanish currency uses masculine gender for euros (el euro)
 * and masculine for céntimos (el céntimo).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "con" between euros and cents
 * @returns {string} The amount in Spanish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                  // 'cuarenta y dos euros con cincuenta céntimos'
 * toCurrency(1)                      // 'un euro'
 * toCurrency(0.99)                   // 'noventa y nueve céntimos'
 * toCurrency(42.50, { and: false })  // 'cuarenta y dos euros cincuenta céntimos'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents: centimos } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Euros part (show if non-zero, or if no centimos)
  if (euros > 0n || centimos === 0n) {
    // Use masculine for euros, but "un euro" not "uno euro"
    if (euros === 1n) {
      result += 'un ' + EURO
    } else {
      result += integerToWords(euros, false) + ' ' + EUROS
    }
  }

  // Centimos part
  if (centimos > 0n) {
    if (euros > 0n) {
      result += useAnd ? ' ' + CURRENCY_CONNECTOR + ' ' : ' '
    }
    // Use masculine for centimos, but "un céntimo" not "uno céntimo"
    if (centimos === 1n) {
      result += 'un ' + CENTIMO
    } else {
      result += integerToWords(centimos, false) + ' ' + CENTIMOS
    }
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
