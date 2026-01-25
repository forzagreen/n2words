/**
 * Traditional Chinese (Taiwan) language converter
 *
 * CLDR: zh-Hant-TW | Traditional Chinese as used in Taiwan
 *
 * Key features:
 * - Myriad-based (萬, 億) grouping - 4 digits
 * - Formal (financial) vs common numerals
 * - Zero insertion for skipped positions
 * - No word separators (concatenated format)
 *
 * Differences from Simplified:
 * - Different character forms (e.g., 負/负, 點/点, 億/亿, 萬/万)
 * - Some formal numerals differ (參/叁, 貳/贰, 陸/陆)
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

// Common (everyday) numerals - Traditional forms
const ONES_COMMON = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const TEN_COMMON = '十'
const HUNDRED_COMMON = '百'
const THOUSAND_COMMON = '千'

// Formal (financial) numerals - Traditional forms
const ONES_FORMAL = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
const TEN_FORMAL = '拾'
const HUNDRED_FORMAL = '佰'
const THOUSAND_FORMAL = '仟'

// Scale words - Traditional forms
const WAN_WORD = '萬' // 10,000
const YI_WORD = '億' // 100,000,000

const ZERO = '零'
const NEGATIVE = '負'
const DECIMAL_SEP = '點'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

const ORDINAL_PREFIX = '第'

// ============================================================================
// Currency Vocabulary (New Taiwan Dollar)
// ============================================================================

// Formal currency (default)
const YUAN_FORMAL = '圓'
const JIAO_FORMAL = '角'
const FEN_FORMAL = '分'
const ZHENG_FORMAL = '整' // "exactly" suffix when whole amount

// Common currency
const YUAN_COMMON = '元'

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, formal = true) {
  if (n === 0n) return ZERO

  const ones = formal ? ONES_FORMAL : ONES_COMMON
  const ten = formal ? TEN_FORMAL : TEN_COMMON
  const hundred = formal ? HUNDRED_FORMAL : HUNDRED_COMMON
  const thousand = formal ? THOUSAND_FORMAL : THOUSAND_COMMON

  // Convert number below 萬 (10,000)
  function convertBelowWan (value) {
    if (value === 0n) return ''

    const parts = []
    let needsZero = false

    // Thousands (千)
    const thousandsVal = value / 1000n
    const thousandsRemainder = value % 1000n
    if (thousandsVal > 0n) {
      parts.push(ones[Number(thousandsVal)] + thousand)
      needsZero = thousandsRemainder > 0n && thousandsRemainder < 100n
    }

    // Hundreds (百)
    const hundredsVal = thousandsRemainder / 100n
    const hundredsRemainder = thousandsRemainder % 100n
    if (hundredsVal > 0n) {
      if (needsZero) {
        parts.push(ZERO)
        needsZero = false
      }
      parts.push(ones[Number(hundredsVal)] + hundred)
      needsZero = hundredsRemainder > 0n && hundredsRemainder < 10n
    } else if (thousandsVal > 0n && hundredsRemainder > 0n) {
      needsZero = true
    }

    // Tens (十)
    const tensVal = hundredsRemainder / 10n
    const onesVal = hundredsRemainder % 10n
    if (tensVal > 0n) {
      if (needsZero) {
        parts.push(ZERO)
        needsZero = false
      }
      parts.push(ones[Number(tensVal)] + ten)
    } else if ((hundredsVal > 0n || thousandsVal > 0n) && onesVal > 0n) {
      needsZero = true
    }

    // Ones
    if (onesVal > 0n) {
      if (needsZero) {
        parts.push(ZERO)
      }
      parts.push(ones[Number(onesVal)])
    }

    return parts.join('')
  }

  // Convert number below 億 (100 million)
  function convertBelowYi (value) {
    if (value === 0n) return ''

    const parts = []

    if (value >= 10_000n) {
      const wanValue = value / 10_000n
      const wanRemainder = value % 10_000n

      parts.push(convertBelowWan(wanValue) + WAN_WORD)

      if (wanRemainder > 0n) {
        const wanEndsWithZero = wanValue % 10n === 0n
        const remainderMissesThousands = wanRemainder < 1000n
        const needsZero = wanEndsWithZero || remainderMissesThousands
        if (needsZero) {
          parts.push(ZERO)
        }
        parts.push(convertBelowWan(wanRemainder))
      }
    } else {
      parts.push(convertBelowWan(value))
    }

    return parts.join('')
  }

  // Main conversion
  const parts = []

  if (n >= 100_000_000n) {
    const yiValue = n / 100_000_000n
    const yiRemainder = n % 100_000_000n

    const yiWords = convertBelowYi(yiValue)
    parts.push(yiWords + YI_WORD)

    if (yiRemainder > 0n) {
      const needsZero = yiRemainder < 10_000_000n
      if (needsZero) {
        parts.push(ZERO)
      }
      parts.push(convertBelowYi(yiRemainder))
    }
  } else {
    parts.push(convertBelowYi(n))
  }

  return parts.join('')
}

function decimalDigitsToWords (decimalString, formal = true) {
  const ones = formal ? ONES_FORMAL : ONES_COMMON
  const words = []
  for (const char of decimalString) {
    words.push(ones[Number(char)])
  }
  return words
}

/**
 * Converts a numeric value to Traditional Chinese words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The number in Traditional Chinese words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { formal = true } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE
  }

  result += integerToWords(integerPart, formal)

  if (decimalPart) {
    result += DECIMAL_SEP + decimalDigitsToWords(decimalPart, formal).join('')
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value, options?)
// ============================================================================

/**
 * Converts a non-negative integer to Traditional Chinese ordinal words.
 *
 * Traditional Chinese ordinals use "第" prefix + cardinal number.
 *
 * @param {bigint} n - Positive integer to convert
 * @param {boolean} formal - Use formal/financial numerals
 * @returns {string} Traditional Chinese ordinal words
 */
function integerToOrdinal (n, formal = true) {
  return ORDINAL_PREFIX + integerToWords(n, formal)
}

/**
 * Converts a numeric value to Traditional Chinese ordinal words.
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
 * toOrdinal(2)                    // '第貳'
 * toOrdinal(1, { formal: false }) // '第一'
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
 * Converts a numeric value to Traditional Chinese currency words (New Taiwan Dollar).
 *
 * Uses 圓 (yuan), 角 (jiao, 1/10), 分 (fen, 1/100).
 * Formal writing adds 整 (zheng) for whole amounts.
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The amount in Traditional Chinese currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)                    // '肆拾貳圓整'
 * toCurrency(1.50)                  // '壹圓伍角整'
 * toCurrency(42, { formal: false }) // '四十二元整'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: yuan, cents } = parseCurrencyValue(value)
  const { formal = true } = options

  const yuanWord = formal ? YUAN_FORMAL : YUAN_COMMON

  // Split cents into jiao (tens) and fen (ones)
  const jiao = cents / 10n
  const fen = cents % 10n

  let result = ''
  if (isNegative) {
    result = NEGATIVE
  }

  // Yuan part (always show for zero with no cents)
  if (yuan > 0n || cents === 0n) {
    result += integerToWords(yuan, formal)
    result += yuanWord
  }

  // Jiao part (tens of cents)
  if (jiao > 0n) {
    const ones = formal ? ONES_FORMAL : ONES_COMMON
    result += ones[Number(jiao)] + JIAO_FORMAL
  }

  // Fen part (ones of cents)
  if (fen > 0n) {
    const ones = formal ? ONES_FORMAL : ONES_COMMON
    // Need zero if we have yuan but no jiao
    if (yuan > 0n && jiao === 0n) {
      result += ZERO
    }
    result += ones[Number(fen)] + FEN_FORMAL
  } else if (jiao > 0n) {
    // Has jiao but no fen - add 整
    result += ZHENG_FORMAL
  } else {
    // Whole yuan only - add 整
    result += ZHENG_FORMAL
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
