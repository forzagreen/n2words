/**
 * Swahili (Kenya) language converter
 *
 * CLDR: sw-KE | Swahili as used in Kenya
 *
 * Key features:
 * - "na" connector for compound numbers
 * - Reversed hundreds: "mia moja" (one hundred)
 * - Scale words: elfu, milioni, bilioni
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['sifuri', 'moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa']
const TENS = { 10: 'kumi', 20: 'ishirini', 30: 'thelathini', 40: 'arobaini', 50: 'hamsini', 60: 'sitini', 70: 'sabini', 80: 'themanini', 90: 'tisini' }

const SCALE_WORDS = ['', 'elfu', 'milioni', 'bilioni', 'trilioni', 'kwadrilioni', 'kwintilioni']

const ZERO = 'sifuri'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'nukta'

// ============================================================================
// Conversion Functions
// ============================================================================

function wordsUnder100 (n) {
  if (n < 10) return ONES[n]
  if (n === 10) return TENS[10]
  if (n < 20) {
    // 11-19: 'kumi na <digit>'
    return TENS[10] + ' na ' + ONES[n - 10]
  }
  const tens = Math.trunc(n / 10) * 10
  const ones = n % 10
  if (ones === 0) return TENS[tens]
  return TENS[tens] + ' na ' + ONES[ones]
}

function wordsUnder1000 (n) {
  if (n < 100) return wordsUnder100(n)
  if (n === 100) return 'mia moja'
  const hundreds = Math.trunc(n / 100)
  const rest = n % 100
  const parts = []

  // Hundreds: 'mia <digit>'
  parts.push('mia ' + ONES[hundreds])
  if (rest > 0) {
    if (rest < 10) {
      parts.push('na ' + ONES[rest])
    } else {
      parts.push(wordsUnder100(rest))
    }
  }

  return parts.join(' ')
}

function extractSegments (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }
  return segments
}

function integerToWords (n) {
  if (n === 0n) return ZERO

  // segments stored least-significant first: [ones, thousands, millions, ...]
  const segments = extractSegments(n)
  const parts = []

  // Iterate from highest scale to lowest
  for (let scaleIndex = segments.length - 1; scaleIndex >= 0; scaleIndex--) {
    const val = segments[scaleIndex]
    if (val === 0) continue

    if (scaleIndex === 0) {
      // Units segment
      if (val < 10 && parts.length > 0) {
        parts.push('na ' + ONES[val])
      } else if (val === 100 && parts.length > 0) {
        // In compound numbers (e.g., 1100 -> 'elfu moja mia'), use 'mia' not 'mia moja'
        parts.push('mia')
      } else {
        parts.push(wordsUnder1000(val))
      }
    } else {
      // Scale segments: 'elfu moja', 'milioni mbili'
      const unit = (val === 1) ? 'moja' : wordsUnder1000(val)
      parts.push(SCALE_WORDS[scaleIndex] + ' ' + unit)
    }
  }

  return parts.join(' ').trim()
}

function decimalPartToWords (decimalPart) {
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
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Swahili words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Swahili words
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
