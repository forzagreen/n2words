/**
 * Simplified Chinese language converter - Functional Implementation
 *
 * Self-contained converter for Simplified Chinese.
 *
 * Key features:
 * - Myriad-based (万, 亿) grouping - 4 digits
 * - Formal (financial) vs common numerals
 * - Zero insertion for skipped positions
 * - No word separators (concatenated format)
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

// Common (everyday) numerals
const ONES_COMMON = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const TEN_COMMON = '十'
const HUNDRED_COMMON = '百'
const THOUSAND_COMMON = '千'

// Formal (financial) numerals - harder to alter/forge
const ONES_FORMAL = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const TEN_FORMAL = '拾'
const HUNDRED_FORMAL = '佰'
const THOUSAND_FORMAL = '仟'

// Scale words
const WAN_WORD = '万' // 10,000
const YI_WORD = '亿' // 100,000,000

const ZERO = '零'
const NEGATIVE = '负'
const DECIMAL_SEP = '点'

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert number below 万 (10,000) to words using direct string concatenation.
 */
function convertBelowWan (value, ones, ten, hundred, thousand) {
  if (value === 0n) return ''

  let result = ''
  let needsZero = false

  // Thousands (千)
  const thousandsVal = value / 1000n
  const thousandsRemainder = value % 1000n
  if (thousandsVal > 0n) {
    result = ones[Number(thousandsVal)] + thousand
    needsZero = thousandsRemainder > 0n && thousandsRemainder < 100n
  }

  // Hundreds (百)
  const hundredsVal = thousandsRemainder / 100n
  const hundredsRemainder = thousandsRemainder % 100n
  if (hundredsVal > 0n) {
    if (needsZero) result += ZERO
    result += ones[Number(hundredsVal)] + hundred
    needsZero = hundredsRemainder > 0n && hundredsRemainder < 10n
  } else if (thousandsVal > 0n && hundredsRemainder > 0n) {
    needsZero = true
  }

  // Tens (十)
  const tensVal = hundredsRemainder / 10n
  const onesVal = hundredsRemainder % 10n
  if (tensVal > 0n) {
    if (needsZero) result += ZERO
    result += ones[Number(tensVal)] + ten
    needsZero = false
  } else if ((hundredsVal > 0n || thousandsVal > 0n) && onesVal > 0n) {
    needsZero = true
  }

  // Ones
  if (onesVal > 0n) {
    if (needsZero) result += ZERO
    result += ones[Number(onesVal)]
  }

  return result
}

/**
 * Convert number below 亿 (100 million) to words.
 */
function convertBelowYi (value, ones, ten, hundred, thousand) {
  if (value === 0n) return ''

  if (value >= 10_000n) {
    const wanValue = value / 10_000n
    const wanRemainder = value % 10_000n

    let result = convertBelowWan(wanValue, ones, ten, hundred, thousand) + WAN_WORD

    if (wanRemainder > 0n) {
      const needsZero = (wanValue % 10n === 0n) || (wanRemainder < 1000n)
      if (needsZero) result += ZERO
      result += convertBelowWan(wanRemainder, ones, ten, hundred, thousand)
    }

    return result
  }

  return convertBelowWan(value, ones, ten, hundred, thousand)
}

function integerToWords (n, formal = true) {
  if (n === 0n) return ZERO

  const ones = formal ? ONES_FORMAL : ONES_COMMON
  const ten = formal ? TEN_FORMAL : TEN_COMMON
  const hundred = formal ? HUNDRED_FORMAL : HUNDRED_COMMON
  const thousand = formal ? THOUSAND_FORMAL : THOUSAND_COMMON

  // Handle numbers >= 亿 (100 million)
  if (n >= 100_000_000n) {
    const yiValue = n / 100_000_000n
    const yiRemainder = n % 100_000_000n

    let result = convertBelowYi(yiValue, ones, ten, hundred, thousand) + YI_WORD

    if (yiRemainder > 0n) {
      if (yiRemainder < 10_000_000n) result += ZERO
      result += convertBelowYi(yiRemainder, ones, ten, hundred, thousand)
    }

    return result
  }

  return convertBelowYi(n, ones, ten, hundred, thousand)
}

/**
 * Convert decimal digits to words using direct concatenation.
 */
function decimalDigitsToWords (decimalString, ones) {
  let result = ''
  for (let i = 0; i < decimalString.length; i++) {
    result += ones[Number(decimalString[i])]
  }
  return result
}

/**
 * Converts a numeric value to Simplified Chinese words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The number in Simplified Chinese words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Apply option defaults
  const { formal = true } = options

  let result = isNegative ? NEGATIVE : ''

  result += integerToWords(integerPart, formal)

  if (decimalPart) {
    const ones = formal ? ONES_FORMAL : ONES_COMMON
    result += DECIMAL_SEP + decimalDigitsToWords(decimalPart, ones)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal }
