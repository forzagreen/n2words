/**
 * Portuguese (Portugal) language converter
 *
 * CLDR: pt-PT | European Portuguese as used in Portugal
 *
 * Portuguese-specific rules:
 * - "e" conjunction everywhere: vinte e um, cento e um, mil e um
 * - "cem" for exact 100, "cento" for 100+ remainder
 * - Irregular hundreds: duzentos, trezentos, quatrocentos, etc.
 * - Long scale: milhão (10^6), mil milhões (10^9), bilião (10^12)
 * - Omit "um" before "mil"
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const TEENS = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']

// Irregular hundreds
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

const THOUSAND = 'mil'
const ZERO = 'zero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'vírgula'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono']
const ORDINAL_TEENS = ['décimo', 'décimo primeiro', 'décimo segundo', 'décimo terceiro', 'décimo quarto', 'décimo quinto', 'décimo sexto', 'décimo sétimo', 'décimo oitavo', 'décimo nono']
const ORDINAL_TENS = ['', '', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo']
const ORDINAL_HUNDREDS = ['', 'centésimo', 'ducentésimo', 'tricentésimo', 'quadringentésimo', 'quingentésimo', 'sexcentésimo', 'septingentésimo', 'octingentésimo', 'nongentésimo']

// Currency vocabulary (Euro)
const EURO = 'euro'
const EUROS = 'euros'
const CENTIMO = 'cêntimo'
const CENTIMOS = 'cêntimos'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 with Portuguese "e" rules.
 * Returns the word and whether it's an exact hundred (for "cem" handling).
 */
function buildSegment (n) {
  if (n === 0) return { word: '', isExactHundred: false }

  // Special case: exact 100 is "cem"
  if (n === 100) return { word: 'cem', isExactHundred: true }

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
  } else if (tens >= 2) {
    if (ones > 0) {
      // Tens + ones with "e": "vinte e um"
      parts.push(TENS[tens] + ' e ' + ONES[ones])
    } else {
      parts.push(TENS[tens])
    }
  } else if (ones > 0) {
    parts.push(ONES[ones])
  }

  // Join hundreds with "e": "cento e um", "duzentos e trinta e um"
  const word = parts.join(' e ')

  return { word, isExactHundred: hundreds > 0 && tens === 0 && ones === 0, startsWithHundreds: n >= 100 }
}

// ============================================================================
// Scale Word Lookup
// ============================================================================

// Precompute scale words for singular and plural forms
// Index 1 = thousands, 2 = millions, 3 = billions (mil milhões), etc.
const SCALE_WORDS_SINGULAR = [
  '', // 0 unused
  THOUSAND, // 1: mil
  'milhão', // 2: 10^6
  'mil milhões', // 3: 10^9 (compound)
  'bilião', // 4: 10^12
  'mil biliões', // 5: 10^15 (compound)
  'trilião', // 6: 10^18
  'mil triliões', // 7: 10^21 (compound)
  'quatrilião' // 8: 10^24
]

const SCALE_WORDS_PLURAL = [
  '', // 0 unused
  THOUSAND, // 1: mil (same)
  'milhões', // 2: 10^6
  'mil milhões', // 3: 10^9 (compound, same)
  'biliões', // 4: 10^12
  'mil biliões', // 5: 10^15 (compound, same)
  'triliões', // 6: 10^18
  'mil triliões', // 7: 10^21 (compound, same)
  'quatriliões' // 8: 10^24
]

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Portuguese words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Portuguese words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mil" not "um mil"
      result = THOUSAND
    } else {
      result = buildSegment(thousands).word + ' ' + THOUSAND
    }

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // Insert "e" before remainder if it doesn't start with hundreds (< 100)
      if (!remainderResult.startsWithHundreds) {
        result += ' e ' + remainderResult.word
      } else {
        result += ' ' + remainderResult.word
      }
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
 * @returns {string} Portuguese words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt division
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the first non-zero segment index (lowest scale with value)
  let firstNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  // Build result string directly
  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const segmentResult = buildSegment(segment)
    const isLastSegment = (i === firstNonZeroIdx)

    // Add "e" before final segment if previous was scale and this doesn't start with hundreds
    if (result && isLastSegment && prevWasScale && !segmentResult.startsWithHundreds) {
      result += ' e'
    }

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segmentResult.word
      prevWasScale = false
    } else if (i === 1) {
      // Thousands
      if (segment === 1) {
        result += THOUSAND
      } else {
        result += segmentResult.word + ' ' + THOUSAND
      }
      prevWasScale = true
    } else {
      // Million and above - use scale arrays
      const scaleWord = segment === 1 ? SCALE_WORDS_SINGULAR[i] : SCALE_WORDS_PLURAL[i]
      if (segment === 1) {
        result += 'um ' + scaleWord
      } else {
        result += segmentResult.word + ' ' + scaleWord
      }
      prevWasScale = true
    }
  }

  return result
}

/**
 * Converts decimal digits to Portuguese words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Portuguese words for decimal part
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
 * Converts a numeric value to Portuguese words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Portuguese words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)           // 'vinte e um'
 * toCardinal(100)          // 'cem'
 * toCardinal(1000000)      // 'um milhão'
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
 * Builds ordinal words for 0-999.
 *
 * @param {number} n - Number 0-999
 * @returns {string} Portuguese ordinal words
 */
function buildOrdinalSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds ordinal
  if (hundreds > 0) {
    parts.push(ORDINAL_HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // 10-19: use teens array (décimo, décimo primeiro, etc.)
    parts.push(ORDINAL_TEENS[ones])
  } else if (tens >= 2) {
    parts.push(ORDINAL_TENS[tens])
    if (ones > 0) {
      parts.push(ORDINAL_ONES[ones])
    }
  } else if (ones > 0) {
    parts.push(ORDINAL_ONES[ones])
  }

  return parts.join(' ')
}

/**
 * Builds ordinal words for large numbers.
 *
 * @param {bigint} n - Non-negative integer
 * @returns {string} Portuguese ordinal words
 */
function buildLargeOrdinal (n) {
  // Extract segments
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the lowest non-zero segment (index 0 = units, lowest scale)
  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  // Scale ordinal words (singular forms)
  const SCALE_ORDINAL = ['', 'milésimo', 'milionésimo', 'mil milionésimo', 'bilionésimo', 'mil bilionésimo', 'trilionésimo']

  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (result) result += ' '

    if (i === lowestNonZeroIdx) {
      // Last non-zero segment gets ordinal form
      if (i === 0) {
        // Units: just ordinal
        result += buildOrdinalSegment(segment)
      } else if (segment === 1 && i > 0) {
        // Exact scale: "milésimo", "milionésimo", etc.
        result += SCALE_ORDINAL[i]
      } else {
        // Segment + scale ordinal
        result += buildOrdinalSegment(segment) + ' ' + SCALE_ORDINAL[i]
      }
    } else {
      // Higher segments use cardinal form
      if (i === 0) {
        result += buildSegment(segment).word
      } else if (i === 1) {
        if (segment === 1) {
          result += THOUSAND
        } else {
          result += buildSegment(segment).word + ' ' + THOUSAND
        }
      } else {
        const scaleWord = segment === 1 ? SCALE_WORDS_SINGULAR[i] : SCALE_WORDS_PLURAL[i]
        if (segment === 1) {
          result += 'um ' + scaleWord
        } else {
          result += buildSegment(segment).word + ' ' + scaleWord
        }
      }
    }
  }

  return result
}

/**
 * Converts a number to Portuguese ordinal words.
 *
 * @param {number | string | bigint} value - The number to convert
 * @returns {string} Portuguese ordinal words
 *
 * @example
 * toOrdinal(1)     // 'primeiro'
 * toOrdinal(21)    // 'vigésimo primeiro'
 * toOrdinal(100)   // 'centésimo'
 */
function toOrdinal (value) {
  const n = parseOrdinalValue(value)

  if (n === 0n) return ZERO

  // Fast path: 1-9
  if (n < 10n) {
    return ORDINAL_ONES[Number(n)]
  }

  // Fast path: 10-19
  if (n < 20n) {
    return ORDINAL_TEENS[Number(n) - 10]
  }

  // Fast path: 20-99
  if (n < 100n) {
    const ones = Number(n % 10n)
    const tens = Number(n / 10n)
    if (ones === 0) {
      return ORDINAL_TENS[tens]
    }
    return ORDINAL_TENS[tens] + ' ' + ORDINAL_ONES[ones]
  }

  // Fast path: 100-999
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  // Large numbers
  return buildLargeOrdinal(n)
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * Converts a number to Portuguese currency words (Euro).
 *
 * @param {number | string | bigint} value - The amount to convert
 * @param {Object} [options]
 * @param {boolean} [options.and=true] - Include "e" between euros and cents
 * @returns {string} Portuguese currency words
 *
 * @example
 * toCurrency(42.50)  // 'quarenta e dois euros e cinquenta cêntimos'
 * toCurrency(1)      // 'um euro'
 * toCurrency(0.01)   // 'um cêntimo'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)
  const { and = true } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  const hasEuros = euros > 0n
  const hasCents = cents > 0n

  if (!hasEuros && !hasCents) {
    return ZERO + ' ' + EUROS
  }

  if (hasEuros) {
    const euroWords = integerToWords(euros)
    const euroUnit = euros === 1n ? EURO : EUROS
    result += euroWords + ' ' + euroUnit
  }

  if (hasCents) {
    if (hasEuros) {
      result += and ? ' e ' : ' '
    }
    const centWords = integerToWords(cents)
    const centUnit = cents === 1n ? CENTIMO : CENTIMOS
    result += centWords + ' ' + centUnit
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
