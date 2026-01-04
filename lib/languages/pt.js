/**
 * Portuguese language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Portuguese-specific rules (handled in precomputation):
 * - "e" conjunction everywhere: vinte e um, cento e um, mil e um
 * - "cem" for exact 100, "cento" for 100+ remainder
 * - Irregular hundreds: duzentos, trezentos, quatrocentos, etc.
 * - Compound scale: milhão (10^6), mil milhões (10^9), bilião (10^12)
 * - Omit "um" before "mil"
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const TEENS = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']

// Irregular hundreds
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

// Scale words (compound long scale)
// Index 0 = milhão (10^6), 1 = bilião (10^12), 2 = trilião (10^18), etc.
const SCALES = ['milhão', 'bilião', 'trilião', 'quatrilião']
const SCALES_PLURAL = ['milhões', 'biliões', 'triliões', 'quatriliões']

const THOUSAND = 'mil'
const ZERO = 'zero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'vírgula'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
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

  return { word, isExactHundred: hundreds > 0 && tens === 0 && ones === 0 }
}

// Precompute all 1000 segment words (0-999)
const SEGMENTS = new Array(1000)
const SEGMENTS_IS_EXACT_HUNDRED = new Array(1000)

for (let i = 0; i < 1000; i++) {
  const result = buildSegment(i)
  SEGMENTS[i] = result.word
  SEGMENTS_IS_EXACT_HUNDRED[i] = result.isExactHundred
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets scale word for Portuguese compound long scale.
 *
 * Compound pattern:
 * - scaleIndex 2 = milhão (10^6)
 * - scaleIndex 3 = mil milhões (10^9)
 * - scaleIndex 4 = bilião (10^12)
 * - scaleIndex 5 = mil biliões (10^15)
 * - etc.
 *
 * @param {number} scaleIndex - Scale level (1 = thousand, 2 = million, etc.)
 * @param {bigint} segment - Segment value for pluralization
 * @returns {string} Scale word
 */
function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  // Even indices (2, 4, 6, 8): milhão, bilião, trilião, quatrilião
  // Odd indices > 1 (3, 5, 7): mil milhões, mil biliões, mil triliões
  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? SCALES_PLURAL[arrayIndex] : baseWord
  } else {
    // Compound: "mil milhões" pattern
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return THOUSAND
    const pluralWord = segment > 1n ? SCALES_PLURAL[arrayIndex] : baseWord
    return THOUSAND + ' ' + pluralWord
  }
}

/**
 * Checks if a word starts with a hundreds form.
 */
function startsWithHundreds (word) {
  if (word === 'cem') return true
  for (let i = 1; i <= 9; i++) {
    if (word.startsWith(HUNDREDS[i])) return true
  }
  return false
}

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

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return SEGMENTS[Number(n)]
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
      result = SEGMENTS[thousands] + ' ' + THOUSAND
    }

    if (remainder > 0) {
      const remainderWord = SEGMENTS[remainder]
      // Insert "e" before remainder if it doesn't start with hundreds
      if (!startsWithHundreds(remainderWord)) {
        result += ' e ' + remainderWord
      } else {
        result += ' ' + remainderWord
      }
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
 * @returns {string} Portuguese words
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
    segments.push(BigInt(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(BigInt(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0n) {
      const scaleWord = scaleIndex > 0 ? getScaleWord(scaleIndex, segment) : ''

      if (scaleIndex === 0) {
        // Units segment
        parts.push({ word: SEGMENTS[Number(segment)], isScale: false, scaleIndex: 0 })
      } else if (scaleIndex === 1) {
        // Thousands
        if (segment === 1n) {
          parts.push({ word: THOUSAND, isScale: true, scaleIndex: 1 })
        } else {
          parts.push({ word: SEGMENTS[Number(segment)] + ' ' + scaleWord, isScale: true, scaleIndex: 1 })
        }
      } else {
        // Million and above
        if (segment === 1n) {
          parts.push({ word: 'um ' + scaleWord, isScale: true, scaleIndex })
        } else {
          parts.push({ word: SEGMENTS[Number(segment)] + ' ' + scaleWord, isScale: true, scaleIndex })
        }
      }
    }

    scaleIndex--
  }

  // Join with Portuguese "e" rules
  return joinPortugueseParts(parts)
}

/**
 * Joins parts with Portuguese "e" rules.
 *
 * Insert "e" before final segment if:
 * - Previous part is a scale word
 * - Final segment doesn't start with hundreds
 *
 * @param {Array} parts - Parts with metadata
 * @returns {string} Joined string
 */
function joinPortugueseParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const words = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const isLast = i === parts.length - 1

    if (isLast && parts.length > 1) {
      const prevPart = parts[i - 1]
      // Insert "e" if previous was scale and this doesn't start with hundreds
      if (prevPart.isScale && !startsWithHundreds(part.word)) {
        words.push('e')
      }
    }

    words.push(part.word)
  }

  return words.join(' ')
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
 * toWords(21)           // 'vinte e um'
 * toWords(100)          // 'cem'
 * toWords(1000000)      // 'um milhão'
 */
function toWords (value) {
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

// ============================================================================
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES,
  TEENS,
  TENS,
  HUNDREDS,
  SCALES,
  SCALES_PLURAL,
  THOUSAND,
  ZERO,
  SEGMENTS,
  SEGMENTS_IS_EXACT_HUNDRED,
  getScaleWord,
  startsWithHundreds,
  integerToWords,
  decimalPartToWords
}
