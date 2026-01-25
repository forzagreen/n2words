/**
 * Simplified Chinese (China) language converter
 *
 * CLDR: zh-Hans-CN | Simplified Chinese as used in China
 *
 * Key features:
 * - Myriad-based (万, 亿) grouping - 4 digits
 * - Formal (financial) vs common numerals
 * - Zero insertion for skipped positions
 * - No word separators (concatenated format)
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
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
// Ordinal Vocabulary
// ============================================================================

// Ordinal prefix
const ORDINAL_PREFIX = '第'

// ============================================================================
// Currency Vocabulary (Chinese Yuan / Renminbi)
// ============================================================================

// Yuan (main unit) - formal uses 圆, common uses 元
const YUAN_FORMAL = '圆'
const YUAN_COMMON = '元'

// Jiao (1/10 yuan) - both use 角
const JIAO = '角'

// Fen (1/100 yuan) - both use 分
const FEN = '分'

// "Whole" when no jiao/fen
const ZHENG = '整'

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
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a positive integer to Simplified Chinese ordinal words.
 *
 * Chinese ordinals: 第 prefix + cardinal number.
 *
 * @param {bigint} n - Positive integer to convert
 * @param {boolean} formal - Use formal numerals
 * @returns {string} Simplified Chinese ordinal words
 */
function integerToOrdinal (n, formal) {
  return ORDINAL_PREFIX + integerToWords(n, formal)
}

/**
 * Converts a numeric value to Simplified Chinese ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)                    // '第壹'
 * toOrdinal(1, { formal: false }) // '第一'
 * toOrdinal(10)                   // '第壹拾'
 */
function toOrdinal (value, options) {
  options = validateOptions(options)
  const integerPart = parseOrdinalValue(value)
  const { formal = true } = options
  return integerToOrdinal(integerPart, formal)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Simplified Chinese currency words (Yuan/Renminbi).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The amount in Simplified Chinese currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                    // '肆拾贰圆伍角整'
 * toCurrency(1)                        // '壹圆整'
 * toCurrency(0.05)                     // '伍分'
 * toCurrency(42.50, { formal: false }) // '四十二元五角整'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: yuan, cents } = parseCurrencyValue(value)
  const { formal = true } = options

  const ones = formal ? ONES_FORMAL : ONES_COMMON
  const yuanWord = formal ? YUAN_FORMAL : YUAN_COMMON

  // Split cents into jiao (tens) and fen (ones)
  const jiao = cents / 10n
  const fen = cents % 10n

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE

  // Yuan part
  if (yuan > 0n) {
    result += integerToWords(yuan, formal) + yuanWord
  }

  // Jiao part (1/10)
  if (jiao > 0n) {
    result += ones[Number(jiao)] + JIAO
  } else if (yuan > 0n && fen > 0n) {
    // Need zero placeholder between yuan and fen
    result += ZERO
  }

  // Fen part (1/100)
  if (fen > 0n) {
    result += ones[Number(fen)] + FEN
  } else if (yuan > 0n || jiao > 0n) {
    // Add 整 (zheng) to indicate whole amount
    result += ZHENG
  }

  // Handle zero case
  if (yuan === 0n && jiao === 0n && fen === 0n) {
    result += ZERO + yuanWord + ZHENG
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
