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
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

const ZERO = 'ศูนย์'
const NEGATIVE = 'ลบ'
const DECIMAL_SEP = 'จุด'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

const ORDINAL_PREFIX = 'ที่'

// ============================================================================
// Currency Vocabulary (Thai Baht)
// ============================================================================

const BAHT = 'บาท'
const SATANG = 'สตางค์'
const BAHT_ONLY = 'ถ้วน' // "exactly" suffix when no satang

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
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a non-negative integer to Thai ordinal words.
 *
 * Thai ordinals use "ที่" prefix + cardinal number.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Thai ordinal words
 */
function integerToOrdinal (n) {
  return ORDINAL_PREFIX + integerToWords(n)
}

/**
 * Converts a numeric value to Thai ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'ที่หนึ่ง'
 * toOrdinal(2)    // 'ที่สอง'
 * toOrdinal(10)   // 'ที่สิบ'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Thai currency words (Baht).
 *
 * Thai Baht uses satang as subunit (100 satang = 1 baht).
 * When whole amounts, adds "ถ้วน" (exactly) suffix.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Thai currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'สี่สิบสองบาทถ้วน'
 * toCurrency(1.50)   // 'หนึ่งบาทห้าสิบสตางค์'
 * toCurrency(-5)     // 'ลบห้าบาทถ้วน'
 */
function toCurrency (value) {
  const { isNegative, dollars: baht, cents: satang } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE
  }

  // Baht part - always show
  result += integerToWords(baht)
  result += BAHT

  // Satang part or "exactly" suffix
  if (satang > 0n) {
    result += integerToWords(satang)
    result += SATANG
  } else {
    result += BAHT_ONLY
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
