/**
 * Russian (Russia) language converter
 *
 * CLDR: ru-RU | Russian as used in Russia
 *
 * Key features:
 * - Three-form pluralization (one/few/many)
 * - Gender: thousands are feminine, millions+ are masculine
 * - Irregular hundreds (двести, триста, etc.)
 * - Long scale naming
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

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
// Ordinal Vocabulary (masculine nominative)
// ============================================================================

// Ordinal ones: первый, второй, третий...
const ORDINAL_ONES = ['', 'первый', 'второй', 'третий', 'четвёртый', 'пятый', 'шестой', 'седьмой', 'восьмой', 'девятый']

// Ordinal teens: десятый, одиннадцатый...
const ORDINAL_TEENS = ['десятый', 'одиннадцатый', 'двенадцатый', 'тринадцатый', 'четырнадцатый', 'пятнадцатый', 'шестнадцатый', 'семнадцатый', 'восемнадцатый', 'девятнадцатый']

// Ordinal tens: двадцатый, тридцатый...
const ORDINAL_TENS = ['', '', 'двадцатый', 'тридцатый', 'сороковой', 'пятидесятый', 'шестидесятый', 'семидесятый', 'восьмидесятый', 'девяностый']

// Ordinal hundreds: сотый, двухсотый...
const ORDINAL_HUNDREDS = ['', 'сотый', 'двухсотый', 'трёхсотый', 'четырёхсотый', 'пятисотый', 'шестисотый', 'семисотый', 'восьмисотый', 'девятисотый']

// Ordinal scale words (тысячный, миллионный, etc.)
const ORDINAL_SCALES = [
  'тысячный',
  'миллионный',
  'миллиардный',
  'триллионный',
  'квадриллионный',
  'квинтиллионный',
  'секстиллионный',
  'септиллионный',
  'октиллионный',
  'нониллионный'
]

// Prefixes for compound ordinal thousands (двух-, трёх-, etc. + тысячный)
const THOUSAND_PREFIXES = ['', '', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти']

// ============================================================================
// Currency Vocabulary (Russian Ruble)
// ============================================================================

// Ruble: masculine, [singular, few, many]
const RUBLE_FORMS = ['рубль', 'рубля', 'рублей']

// Kopeck: feminine, [singular, few, many]
const KOPECK_FORMS = ['копейка', 'копейки', 'копеек']

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

  const feminine = gender === 'feminine'

  if (n < 1000n) {
    return feminine ? buildSegmentFem(Number(n)) : buildSegmentMasc(Number(n))
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Thousands are always feminine in Russian
    const thousandsWord = buildSegmentFem(thousands)
    const scaleWord = pluralize(thousands, SCALE_FORMS[0])

    let result = thousandsWord + ' ' + scaleWord

    if (remainder > 0) {
      result += ' ' + (feminine ? buildSegmentFem(remainder) : buildSegmentMasc(remainder))
    }

    return result
  }

  return buildLargeNumberWords(n, gender)
}

function buildLargeNumberWords (n, gender) {
  const feminine = gender === 'feminine'
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
        parts.push(feminine ? buildSegmentFem(segment) : buildSegmentMasc(segment))
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
 * Converts a numeric value to Russian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Russian words
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
 * Returns ordinal form: "первый", "двадцать первый", etc.
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal words
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)

  if (tensDigit === 0) {
    // Single digit: первый, второй, etc.
    return ORDINAL_ONES[onesDigit]
  }

  if (tensDigit === 1) {
    // Teens: десятый, одиннадцатый, etc.
    return ORDINAL_TEENS[onesDigit]
  }

  // Tens >= 20
  if (onesDigit === 0) {
    // Round tens: двадцатый, тридцатый, etc.
    return ORDINAL_TENS[tensDigit]
  }

  // Compound: двадцать первый, тридцать второй, etc.
  return TENS[tensDigit] + ' ' + ORDINAL_ONES[onesDigit]
}

/**
 * Converts a positive integer to Russian ordinal words (masculine nominative).
 *
 * In Russian ordinals, only the LAST component becomes ordinal.
 * E.g., 121 = "сто двадцать первый" (one hundred twenty first)
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Russian words
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
      // Exact hundreds: сотый, двухсотый, etc.
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
      // Exact thousands: тысячный, двухтысячный, etc.
      if (thousands === 1) {
        return ORDINAL_SCALES[0] // тысячный
      }
      if (thousands < 10) {
        return THOUSAND_PREFIXES[thousands] + ORDINAL_SCALES[0]
      }
      // For larger thousands, use cardinal + тысячный
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
 * @returns {string} Ordinal Russian words
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
 * Converts a numeric value to Russian ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words (e.g., "первый", "сорок второй")
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'первый'
 * toOrdinal(2)    // 'второй'
 * toOrdinal(3)    // 'третий'
 * toOrdinal(21)   // 'двадцать первый'
 * toOrdinal(42)   // 'сорок второй'
 * toOrdinal(100)  // 'сотый'
 * toOrdinal(101)  // 'сто первый'
 * toOrdinal(1000) // 'тысячный'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Russian currency words (Russian Ruble).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "и" between rubles and kopecks
 * @returns {string} The amount in Russian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                    // 'сорок два рубля и пятьдесят копеек'
 * toCurrency(1)                        // 'один рубль'
 * toCurrency(0.99)                     // 'девяносто девять копеек'
 * toCurrency(0.01)                     // 'одна копейка'
 * toCurrency(42.50, { and: false })    // 'сорок два рубля пятьдесят копеек'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: rubles, cents: kopecks } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Rubles part (masculine) - show if non-zero, or if no kopecks
  if (rubles > 0n || kopecks === 0n) {
    result += integerToWords(rubles, 'masculine')
    result += ' ' + pluralize(rubles, RUBLE_FORMS)
  }

  // Kopecks part (feminine)
  if (kopecks > 0n) {
    if (rubles > 0n) {
      result += useAnd ? ' и ' : ' '
    }
    result += integerToWords(kopecks, 'feminine')
    result += ' ' + pluralize(kopecks, KOPECK_FORMS)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
