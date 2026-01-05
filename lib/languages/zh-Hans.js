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

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

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

function integerToWords (n, formal = true) {
  if (n === 0n) return ZERO

  const ones = formal ? ONES_FORMAL : ONES_COMMON
  const ten = formal ? TEN_FORMAL : TEN_COMMON
  const hundred = formal ? HUNDRED_FORMAL : HUNDRED_COMMON
  const thousand = formal ? THOUSAND_FORMAL : THOUSAND_COMMON

  // Convert number below 万 (10,000)
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

  // Convert number below 亿 (100 million)
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
 * Converts a numeric value to Simplified Chinese words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.formal=true] - Use formal/financial numerals
 * @returns {string} The number in Simplified Chinese words
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  const formal = options.formal !== false // Default to true

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
// Exports
// ============================================================================

export { toWords }
