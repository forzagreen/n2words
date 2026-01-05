/**
 * Swahili language converter - Functional Implementation
 *
 * Self-contained converter with precomputed lookup tables.
 *
 * Key features:
 * - "na" connector for compound numbers
 * - Reversed hundreds: "mia moja" (one hundred)
 * - Scale words: elfu, milioni, bilioni
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['sifuri', 'moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa']
const TENS = { 10: 'kumi', 20: 'ishirini', 30: 'thelathini', 40: 'arobaini', 50: 'hamsini', 60: 'sitini', 70: 'sabini', 80: 'themanini', 90: 'tisini' }

const SCALE_WORDS = ['', 'elfu', 'milioni', 'bilioni', 'trilioni']

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

function splitBy3 (numStr) {
  if (numStr.length <= 3) return [Number(numStr)]
  const groups = []
  const last3 = numStr.slice(-3)
  groups.unshift(Number(last3))
  let remaining = numStr.slice(0, -3)
  while (remaining.length > 0) {
    const group = remaining.slice(-3)
    groups.unshift(Number(group))
    remaining = remaining.slice(0, -3)
  }
  return groups
}

function integerToWords (n) {
  if (n === 0n) return ZERO

  const groups = splitBy3(n.toString())
  const parts = []

  for (let i = 0; i < groups.length; i++) {
    const val = groups[i]
    if (val === 0) continue
    const scaleIndex = groups.length - i - 1
    // scale word
    if (scaleIndex === 0) {
      if (val < 10 && parts.length > 0) {
        parts.push('na ' + ONES[val])
      } else if (val === 100 && parts.length > 0) {
        // In compound numbers (e.g., 1100 -> 'elfu moja mia'), use 'mia' not 'mia moja'
        parts.push('mia')
      } else {
        parts.push(wordsUnder1000(val))
      }
    } else {
      // e.g., 'elfu moja', 'milioni mbili'
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
// Exports
// ============================================================================

export { toWords }
