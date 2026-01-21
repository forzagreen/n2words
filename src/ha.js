/**
 * Hausa language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Authentic Boko orthography with ɗ (hooked d) and ' (glottal stop)
 * - Teens with "sha" prefix (sha ɗaya = 11)
 * - Compound numbers with "da" connector (ashirin da ɗaya = 21)
 * - Arabic loanwords for tens (ashirin, talatin, arba'in, etc.)
 * - Reversed multiplier order: "biyu ɗari" (200), "biyu dubu" (2000)
 * - Implicit one before ɗari and dubu
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'ɗaya', 'biyu', 'uku', 'huɗu', 'biyar', 'shida', 'bakwai', 'takwas', 'tara']
const TEENS = ['goma', 'sha ɗaya', 'sha biyu', 'sha uku', 'sha huɗu', 'sha biyar', 'sha shida', 'sha bakwai', 'sha takwas', 'sha tara']
// Arabic loanwords for tens
const TENS = ['', '', 'ashirin', 'talatin', "arba'in", 'hamsin', 'sittin', "saba'in", 'tamanin', "tis'in"]

const HUNDRED = 'ɗari'
const THOUSAND = 'dubu'

const ZERO = 'sifiri'
const NEGATIVE = 'babu'
const DECIMAL_SEP = 'digo'

// Short scale
const SCALE_WORDS = ['', THOUSAND, 'miliyan', 'biliyan']

// ============================================================================
// Precomputed Lookup Table
// ============================================================================

/**
 * Build segment for 0-999 with Hausa patterns.
 * Hausa uses reversed order for hundreds: "biyu ɗari" (200)
 * And "da" connector for ones: "ashirin da ɗaya" (21)
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Hundreds: implicit one, or "biyu ɗari" (reversed order)
  if (hundredsDigit > 0) {
    if (hundredsDigit === 1) {
      parts.push(HUNDRED)
    } else {
      // Reversed: multiplier + hundredWord
      parts.push(ONES[hundredsDigit] + ' ' + HUNDRED)
    }
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit - with "da" connector if after hundreds
    if (hundredsDigit > 0) {
      parts.push('da ' + ONES[ones])
    } else {
      parts.push(ONES[ones])
    }
  } else if (tensOnes < 20) {
    // Teens (10-19): "sha X"
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    // Even tens (20, 30, 40, etc.)
    parts.push(TENS[tensDigit])
  } else {
    // Tens + ones with "da" connector
    parts.push(TENS[tensDigit] + ' da ' + ONES[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  return buildLargeNumberWords(n)
}

/**
 * Checks if a word is a single digit (1-9).
 */
function isSingleDigit (word) {
  return ONES.slice(1).includes(word)
}

function buildLargeNumberWords (n) {
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

  // Build raw parts (segment words and scale words)
  const rawParts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const scaleWord = SCALE_WORDS[scaleIndex] || ''

      if (scaleIndex === 0) {
        rawParts.push(buildSegment(segment))
      } else {
        rawParts.push(buildSegment(segment))
        rawParts.push(scaleWord)
      }
    }

    scaleIndex--
  }

  // Filter out implicit "ɗaya" before ɗari or dubu
  const filtered = []
  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i]
    const nextPart = rawParts[i + 1]

    // Skip "ɗaya" before ɗari or dubu (implicit one)
    if (part === 'ɗaya' && nextPart && (nextPart === HUNDRED || nextPart === THOUSAND)) {
      continue
    }

    filtered.push(part)
  }

  // Join with correct separators
  const result = []
  for (let i = 0; i < filtered.length; i++) {
    const part = filtered[i]
    const prevPart = i > 0 ? filtered[i - 1] : null

    // Determine if we need "da" connector
    // Use "da" when current is a single digit following a scale word
    if (prevPart && isSingleDigit(part) &&
        (prevPart === THOUSAND || prevPart === HUNDRED ||
         SCALE_WORDS.includes(prevPart))) {
      result.push(' da ')
    } else if (i > 0) {
      result.push(' ')
    }

    result.push(part)
  }

  return result.join('')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Hausa words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Hausa words
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
// Exports
// ============================================================================

export { toCardinal }
