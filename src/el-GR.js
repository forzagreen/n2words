/**
 * Greek (Greece) language converter
 *
 * CLDR: el-GR | Greek as used in Greece
 *
 * Key features:
 * - Space-separated number composition
 * - Implicit "one" (ένα) omission before scale words
 * - Irregular hundreds (διακόσια, τριακόσια, etc.)
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα']

const TEENS = ['δέκα', 'έντεκα', 'δώδεκα', 'δεκατρία', 'δεκατέσσερα', 'δεκαπέντε', 'δεκαέξι', 'δεκαεπτά', 'δεκαοκτώ', 'δεκαεννέα']

const TENS = ['', '', 'είκοσι', 'τριάντα', 'σαράντα', 'πενήντα', 'εξήντα', 'εβδομήντα', 'ογδόντα', 'ενενήντα']

// Greek has irregular hundreds
const HUNDREDS = ['', 'εκατό', 'διακόσια', 'τριακόσια', 'τετρακόσια', 'πεντακόσια', 'εξακόσια', 'επτακόσια', 'οκτακόσια', 'εννιακόσια']

const THOUSAND = 'χίλια'

const ZERO = 'μηδέν'
const NEGATIVE = 'μείον'
const DECIMAL_SEP = 'κόμμα'

// Short scale
const SCALES = ['εκατομμύριο', 'δισεκατομμύριο', 'τρισεκατομμύριο']

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'πρώτος', 'δεύτερος', 'τρίτος', 'τέταρτος', 'πέμπτος', 'έκτος', 'έβδομος', 'όγδοος', 'ένατος']

const ORDINAL_TEENS = ['δέκατος', 'ενδέκατος', 'δωδέκατος', 'δέκατος τρίτος', 'δέκατος τέταρτος', 'δέκατος πέμπτος', 'δέκατος έκτος', 'δέκατος έβδομος', 'δέκατος όγδοος', 'δέκατος ένατος']

const ORDINAL_TENS = ['', '', 'εικοστός', 'τριακοστός', 'τεσσαρακοστός', 'πεντηκοστός', 'εξηκοστός', 'εβδομηκοστός', 'ογδοηκοστός', 'ενενηκοστός']

const ORDINAL_HUNDREDS = ['', 'εκατοστός', 'διακοσιοστός', 'τριακοσιοστός', 'τετρακοσιοστός', 'πεντακοσιοστός', 'εξακοσιοστός', 'επτακοσιοστός', 'οκτακοσιοστός', 'εννιακοσιοστός']

const ORDINAL_THOUSAND = 'χιλιοστός'
const ORDINAL_MILLION = 'εκατομμυριοστός'

// Currency (Euro)
const EURO_FORMS = ['ευρώ', 'ευρώ'] // Singular, plural (indeclinable)
const CENT_FORMS = ['λεπτό', 'λεπτά'] // Singular, plural

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds (irregular forms)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    parts.push(TENS[tens])
  } else {
    parts.push(TENS[tens] + ' ' + ONES[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Greek words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Greek words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "ένα" before χίλια
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = buildSegment(thousands) + ' ' + THOUSAND
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Greek words
 */
function buildLargeNumberWords (n) {
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
        // Units segment
        parts.push(segmentWord)
      } else if (scaleIndex === 1) {
        // Thousands - omit "ένα" before χίλια
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          parts.push(segmentWord + ' ' + THOUSAND)
        }
      } else {
        // Millions+ - omit "ένα" before scale words
        const scaleWord = SCALES[scaleIndex - 2]
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
 * Converts decimal digits to Greek words (per-digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Greek words for decimal part
 */
function decimalPartToWords (decimalPart) {
  const parts = []

  for (const digit of decimalPart) {
    const d = parseInt(digit, 10)
    if (d === 0) {
      parts.push(ZERO)
    } else {
      parts.push(ONES[d])
    }
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Greek words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Greek words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)       // 'είκοσι ένα'
 * toCardinal(1000)     // 'χίλια'
 * toCardinal('3.14')   // 'τρία κόμμα ένα τέσσερα'
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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

// ============================================================================
// Ordinal Functions
// ============================================================================

/**
 * Builds ordinal for tens and ones (0-99).
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal word
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''
  if (n < 10) return ORDINAL_ONES[n]
  if (n < 20) return ORDINAL_TEENS[n - 10]

  const ones = n % 10
  const tens = Math.floor(n / 10)

  if (ones === 0) {
    return ORDINAL_TENS[tens]
  }
  return ORDINAL_TENS[tens] + ' ' + ORDINAL_ONES[ones]
}

/**
 * Converts a non-negative integer to Greek ordinal words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Greek ordinal words
 */
function integerToOrdinal (n) {
  if (n === 0n) return ''
  if (n === 1n) return ORDINAL_ONES[1]

  // Numbers < 100
  if (n < 100n) {
    return buildOrdinalTensOnes(Number(n))
  }

  // Numbers < 1000
  if (n < 1000n) {
    const hundreds = Number(n / 100n)
    const remainder = Number(n % 100n)

    if (remainder === 0) {
      return ORDINAL_HUNDREDS[hundreds]
    }
    return HUNDREDS[hundreds] + ' ' + buildOrdinalTensOnes(remainder)
  }

  // Numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands === 1) {
        return ORDINAL_THOUSAND
      }
      return buildSegment(thousands) + ' ' + ORDINAL_THOUSAND
    }

    // Cardinal thousands + ordinal remainder
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = buildSegment(thousands) + ' ' + THOUSAND
    }

    if (remainder < 100) {
      return result + ' ' + buildOrdinalTensOnes(remainder)
    }

    const remHundreds = Math.floor(remainder / 100)
    const remTensOnes = remainder % 100

    if (remTensOnes === 0) {
      return result + ' ' + ORDINAL_HUNDREDS[remHundreds]
    }
    return result + ' ' + HUNDREDS[remHundreds] + ' ' + buildOrdinalTensOnes(remTensOnes)
  }

  // Numbers >= 1,000,000
  const millions = Number(n / 1_000_000n)
  const remainder = n % 1_000_000n

  if (remainder === 0n) {
    if (millions === 1) {
      return ORDINAL_MILLION
    }
    return buildSegment(millions) + ' ' + ORDINAL_MILLION
  }

  // Cardinal millions + ordinal remainder
  let result
  if (millions === 1) {
    result = SCALES[0]
  } else {
    result = buildSegment(millions) + ' ' + SCALES[0]
  }

  return result + ' ' + integerToOrdinal(remainder)
}

/**
 * Converts a numeric value to Greek ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The ordinal in Greek words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a positive integer
 *
 * @example
 * toOrdinal(1)   // 'πρώτος'
 * toOrdinal(21)  // 'εικοστός πρώτος'
 */
function toOrdinal (value) {
  const n = parseOrdinalValue(value)
  return integerToOrdinal(n)
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * Converts a numeric value to Greek Euro currency words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The currency in Greek words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)     // 'ένα ευρώ'
 * toCurrency(2.50)  // 'δύο ευρώ πενήντα λεπτά'
 */
function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)

  const parts = []

  if (isNegative) {
    parts.push(NEGATIVE)
  }

  // Euros
  if (dollars > 0n || cents === 0n) {
    const euroWord = integerToWords(dollars)
    const euroForm = dollars === 1n ? EURO_FORMS[0] : EURO_FORMS[1]
    parts.push(euroWord + ' ' + euroForm)
  }

  // Cents (λεπτά)
  if (cents > 0n) {
    const centWord = integerToWords(cents)
    const centForm = cents === 1n ? CENT_FORMS[0] : CENT_FORMS[1]
    parts.push(centWord + ' ' + centForm)
  }

  return parts.join(' ')
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
