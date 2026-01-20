/**
 * Yoruba language converter - Functional Implementation
 *
 * A number-to-words converter for Yoruba (yo), a Niger-Congo language
 * spoken by ~45 million people in Nigeria, Benin, and Togo.
 *
 * Yoruba uses a complex vigesimal (base-20) system with:
 * - Additive patterns: 1-4 added to decade (lé = "plus")
 * - Subtractive patterns: 5-9 subtracted from next decade (dín = "minus")
 * - Odd decades (30,50,70,90) formed by subtracting 10 from next even decade
 * - Even decades (20,40,60,80,100) are multiples of 20
 *
 * Examples:
 * - 21 = ọ̀kan lé lógún (1 + 20)
 * - 15 = àrùndínlógún (20 - 5)
 * - 50 = àádọ́ta (60 - 10)
 * - 45 = àrùndínláàádọ́ta (50 - 5)
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Basic numbers 1-10
const ONES = [
  '',
  'ọ̀kan', // 1
  'èjì', // 2
  'ẹ̀ta', // 3
  'ẹ̀rin', // 4
  'àrùn', // 5
  'ẹ̀fà', // 6
  'èje', // 7
  'ẹ̀jọ', // 8
  'ẹ̀sán', // 9
  'ẹ̀wá' // 10
]

// Numbers 11-14 (additive: X + 10, using "lá")
const TEENS_ADD = [
  '',
  'ọ̀kànlá', // 11 = 1 + 10
  'èjìlá', // 12 = 2 + 10
  'ẹ̀talá', // 13 = 3 + 10
  'ẹ̀rinlá' // 14 = 4 + 10
]

// Numbers 15-19 (subtractive: 20 - X, using "dín")
const TEENS_SUB = [
  'àrùndínlógún', // 15 = 20 - 5
  'ẹ̀rìndínlógún', // 16 = 20 - 4
  'ẹ̀tadínlógún', // 17 = 20 - 3
  'èjìdínlógún', // 18 = 20 - 2
  'ọ̀kàndínlógún' // 19 = 20 - 1
]

// Decades (base-20 structure)
// Even decades are multiples of 20
// Odd decades subtract 10 from next even decade
const DECADES = {
  20: 'ogún', // 20 = 20 × 1
  30: 'ọgbọ̀n', // 30 = 20 + 10 (special word)
  40: 'ogójì', // 40 = 20 × 2
  50: 'àádọ́ta', // 50 = 60 - 10
  60: 'ogóta', // 60 = 20 × 3
  70: 'àádọ́rin', // 70 = 80 - 10
  80: 'ogórin', // 80 = 20 × 4
  90: 'àádọ́rùn', // 90 = 100 - 10
  100: 'ọgọ́rùn' // 100 = 20 × 5
}

// Prefixes for adding to decades (lé lógún, lé lọgbọ̀n, etc.)
const DECADE_ADD_SUFFIX = {
  20: 'lógún',
  30: 'lọgbọ̀n',
  40: 'lógójì',
  50: 'láàádọ́ta',
  60: 'lógóta',
  70: 'láàádọ́rin',
  80: 'lógórin',
  90: 'láàádọ́rùn',
  100: 'lọ́gọ́rùn'
}

// Prefixes for subtracting from decades (dín lógójì, etc.)
const DECADE_SUB_SUFFIX = {
  20: 'dínlógún',
  30: 'dínlọgbọ̀n',
  40: 'dínlógójì',
  50: 'dínláàádọ́ta',
  60: 'dínlógóta',
  70: 'dínláàádọ́rin',
  80: 'dínlógórin',
  90: 'dínláàádọ́rùn',
  100: 'dínlọ́gọ́rùn'
}

// Scale words
const HUNDRED = 'ọgọ́rùn'
const TWO_HUNDRED = 'igba' // 200 (special word, historically 200 cowries)
const FOUR_HUNDRED = 'irinwó' // 400 (20 × 20)
const THOUSAND = 'ẹgbẹ̀rún' // 1000
const TEN_THOUSAND = 'ẹgbàárùn' // 10,000 (special)
const TWENTY_THOUSAND = 'ọ̀kẹ́' // 20,000 (bag of cowries)
const MILLION = 'mílíọ̀nù' // million (loanword)

const ZERO = 'òdo'
const NEGATIVE = 'àìní'
const DECIMAL_SEP = 'àmì'
const AND = 'ó lé' // "and" / "plus" connector

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds word for numbers 0-99
 */
function buildUnder100 (n) {
  if (n === 0) return ''
  if (n <= 10) return ONES[n]

  // 11-14: additive from 10
  if (n <= 14) return TEENS_ADD[n - 10]

  // 15-19: subtractive from 20
  if (n <= 19) return TEENS_SUB[n - 15]

  // Exact decades
  if (n % 10 === 0) return DECADES[n]

  const decade = Math.floor(n / 10) * 10
  const unit = n % 10

  // 1-4 are added to current decade (21 = 1 + 20, not 1 + 30)
  if (unit <= 4) {
    return ONES[unit] + ' lé ' + DECADE_ADD_SUFFIX[decade]
  }

  // 5-9 are subtracted from next decade
  const nextDecade = decade + 10
  const subtractAmount = 10 - unit
  return ONES[subtractAmount] + DECADE_SUB_SUFFIX[nextDecade]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts hundreds (100-999)
 */
function convertHundreds (n) {
  if (n < 100) return buildUnder100(n)

  const hundreds = Math.floor(n / 100)
  const remainder = n % 100

  let result

  // Special cases for 200 and 400
  if (hundreds === 2 && remainder === 0) {
    return TWO_HUNDRED
  }
  if (hundreds === 4 && remainder === 0) {
    return FOUR_HUNDRED
  }

  // Build hundreds
  if (hundreds === 1) {
    result = HUNDRED
  } else if (hundreds === 2) {
    result = TWO_HUNDRED
  } else if (hundreds === 4) {
    result = FOUR_HUNDRED
  } else {
    // Other hundreds: X ọgọ́rùn
    result = ONES[hundreds] + ' ' + HUNDRED
  }

  if (remainder > 0) {
    result += ' ' + AND + ' ' + buildUnder100(remainder)
  }

  return result
}

/**
 * Converts a non-negative integer to Yoruba words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Yoruba words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 100
  if (n < 100n) {
    return buildUnder100(Number(n))
  }

  // Numbers < 1000
  if (n < 1000n) {
    return convertHundreds(Number(n))
  }

  // Build from segments
  const parts = []
  let remaining = n

  // Millions
  if (remaining >= 1_000_000n) {
    const millions = remaining / 1_000_000n
    remaining = remaining % 1_000_000n
    if (millions === 1n) {
      parts.push(MILLION + ' kan')
    } else {
      parts.push(MILLION + ' ' + integerToWords(millions))
    }
  }

  // Thousands
  if (remaining >= 1000n) {
    const thousands = remaining / 1000n
    remaining = remaining % 1000n

    if (thousands === 1n) {
      parts.push(THOUSAND + ' kan')
    } else if (thousands === 10n) {
      parts.push(TEN_THOUSAND)
    } else if (thousands === 20n) {
      parts.push(TWENTY_THOUSAND)
    } else if (thousands < 100n) {
      parts.push(THOUSAND + ' ' + buildUnder100(Number(thousands)))
    } else {
      parts.push(THOUSAND + ' ' + convertHundreds(Number(thousands)))
    }
  }

  // Hundreds and below
  if (remaining > 0n) {
    if (remaining < 100n) {
      if (parts.length > 0) {
        parts.push(AND + ' ' + buildUnder100(Number(remaining)))
      } else {
        parts.push(buildUnder100(Number(remaining)))
      }
    } else {
      if (parts.length > 0) {
        parts.push(AND + ' ' + convertHundreds(Number(remaining)))
      } else {
        parts.push(convertHundreds(Number(remaining)))
      }
    }
  }

  return parts.join(', ')
}

/**
 * Converts decimal digits to Yoruba words.
 *
 * @param {string} decimalPart - Decimal digits
 * @returns {string} Yoruba words for decimal
 */
function decimalPartToWords (decimalPart) {
  const parts = []

  for (const digit of decimalPart) {
    const d = parseInt(digit, 10)
    parts.push(d === 0 ? ZERO : ONES[d])
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Yoruba words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Yoruba words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

export { toCardinal }
