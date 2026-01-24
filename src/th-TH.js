/**
 * Thai (Thailand) language converter
 *
 * CLDR: th-TH | Thai as used in Thailand
 *
 * Key features:
 * - No word separators (continuous Thai script)
 * - Million-based grouping (ล้าน)
 * - Special handling for 1 as "เอ็ด" in compounds
 * - 20 is "ยี่สิบ" (not "สองสิบ")
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

const ZERO = 'ศูนย์'
const NEGATIVE = 'ลบ'
const DECIMAL_SEP = 'จุด'

// ============================================================================
// Conversion Functions
// ============================================================================

function convertBelowMillion (n) {
  if (n === 0) return ''

  let value = n
  const parts = []

  const hundredThousands = Math.trunc(value / 100000)
  value %= 100000
  const tenThousands = Math.trunc(value / 10000)
  value %= 10000
  const thousands = Math.trunc(value / 1000)
  value %= 1000
  const hundreds = Math.trunc(value / 100)
  value %= 100
  const tens = Math.trunc(value / 10)
  const ones = value % 10

  if (hundredThousands > 0) {
    parts.push(ONES[hundredThousands - 1] + 'แสน')
  }

  if (tenThousands > 0) {
    if (tenThousands === 1) {
      parts.push('หนึ่งหมื่น')
    } else {
      parts.push(ONES[tenThousands - 1] + 'หมื่น')
    }
  }

  if (thousands > 0) {
    parts.push(ONES[thousands - 1] + 'พัน')
  }

  if (hundreds > 0) {
    parts.push(ONES[hundreds - 1] + 'ร้อย')
  }

  if (tens > 0) {
    if (tens === 1) {
      parts.push('สิบ')
    } else if (tens === 2) {
      parts.push('ยี่สิบ')
    } else {
      parts.push(ONES[tens - 1] + 'สิบ')
    }
  }

  if (ones > 0) {
    const hasHigher = hundredThousands > 0 || tenThousands > 0 || thousands > 0 || hundreds > 0 || tens > 0
    if (ones === 1 && (tens > 0 || hasHigher)) {
      parts.push('เอ็ด')
    } else {
      parts.push(ONES[ones - 1])
    }
  }

  return parts.join('')
}

function splitMillionGroups (n) {
  const groups = []
  let remaining = n

  const million = 1_000_000n
  while (remaining > 0n) {
    const chunk = Number(remaining % million)
    groups.unshift(chunk)
    remaining = remaining / million
  }

  return groups
}

function integerToWords (n) {
  if (n === 0n) return ZERO

  const groups = splitMillionGroups(n)
  const parts = []

  for (let i = 0; i < groups.length; i++) {
    const groupValue = groups[i]
    if (groupValue === 0) continue

    parts.push(convertBelowMillion(groupValue))
    const remaining = groups.length - i - 1
    if (remaining > 0) {
      parts.push('ล้าน'.repeat(remaining))
    }
  }

  return parts.join('')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d - 1])
  }
  return digits.join('')
}

/**
 * Converts a numeric value to Thai words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Thai words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += DECIMAL_SEP + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal }
