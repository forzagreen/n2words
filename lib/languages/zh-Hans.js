import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Simplified Chinese language converter.
 *
 * Uses myriad-based (万, 亿) grouping for high performance.
 * Supports:
 * - Simplified Chinese characters (简体中文)
 * - No word separators (concatenated format)
 * - Formal (financial) vs common numerals
 * - Zero insertion for skipped positions
 *
 * Chinese number system:
 * - Groups by 4 digits (万-based), not 3 (thousand-based)
 * - 万 (wàn) = 10,000
 * - 亿 (yì) = 100,000,000 = 万 × 万
 * - Pattern repeats: 万亿 = trillion, 亿亿 = 10^16
 */
export class SimplifiedChinese extends AbstractLanguage {
  negativeWord = '负'
  decimalSeparatorWord = '点'
  zeroWord = '零'
  wordSeparator = ''

  // Common (everyday) numerals
  onesWordsCommon = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  tenWordCommon = '十'
  hundredWordCommon = '百'
  thousandWordCommon = '千'

  // Formal (financial) numerals - harder to alter/forge
  onesWordsFormal = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  tenWordFormal = '拾'
  hundredWordFormal = '佰'
  thousandWordFormal = '仟'

  // Scale words (same in both styles)
  wanWord = '万' // 10,000
  yiWord = '亿' // 100,000,000

  constructor (options = {}) {
    super()

    this.setOptions({
      formal: true
    }, options)
  }

  /**
   * Gets the appropriate numeral set based on formal option.
   */
  get onesWords () {
    return this.options.formal ? this.onesWordsFormal : this.onesWordsCommon
  }

  get tenWord () {
    return this.options.formal ? this.tenWordFormal : this.tenWordCommon
  }

  get hundredWord () {
    return this.options.formal ? this.hundredWordFormal : this.hundredWordCommon
  }

  get thousandWord () {
    return this.options.formal ? this.thousandWordFormal : this.thousandWordCommon
  }

  /**
   * Converts an integer to Chinese words.
   *
   * Chinese uses myriad-based grouping (万/亿):
   * - 0-9999: basic segment
   * - 10000-99999999: X万
   * - 100000000+: X亿 Y万 Z
   */
  integerToWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    const parts = []

    // Process 亿 (100 million) segments
    // Each 亿 segment can have up to 4 digits
    if (integerPart >= 100_000_000n) {
      // Handle 万亿 (trillion) level: 亿亿
      // For simplicity, we'll process 亿 in chunks
      const yiValue = integerPart / 100_000_000n
      const yiRemainder = integerPart % 100_000_000n

      // Convert the 亿 multiplier (which itself can be 万-based)
      const yiWords = this.convertBelowYi(yiValue)
      parts.push(yiWords + this.yiWord)

      if (yiRemainder > 0n) {
        // Check if we need zero insertion
        // Zero needed if 亿 remainder starts with zeros in the 万 position
        const needsZero = yiRemainder < 10_000_000n
        if (needsZero) {
          parts.push(this.zeroWord)
        }
        parts.push(this.convertBelowYi(yiRemainder))
      }
    } else {
      // Below 亿 - use 万-based conversion
      parts.push(this.convertBelowYi(integerPart))
    }

    return parts.join('')
  }

  /**
   * Converts a number below 亿 (100 million) to words.
   */
  convertBelowYi (value) {
    if (value === 0n) return ''

    const parts = []

    // 万 (10,000) segment
    if (value >= 10_000n) {
      const wanValue = value / 10_000n
      const wanRemainder = value % 10_000n

      parts.push(this.convertBelowWan(wanValue) + this.wanWord)

      if (wanRemainder > 0n) {
        // Zero insertion when:
        // 1. 万 value ends with zero (e.g., 10万, 100万, 20万)
        // 2. OR remainder doesn't fill the 千 position (< 1000)
        const wanEndsWithZero = wanValue % 10n === 0n
        const remainderMissesThousands = wanRemainder < 1000n
        const needsZero = wanEndsWithZero || remainderMissesThousands
        if (needsZero) {
          parts.push(this.zeroWord)
        }
        parts.push(this.convertBelowWan(wanRemainder))
      }
    } else {
      parts.push(this.convertBelowWan(value))
    }

    return parts.join('')
  }

  /**
   * Converts a number below 万 (10,000) to words.
   */
  convertBelowWan (value) {
    if (value === 0n) return ''

    const parts = []
    let needsZero = false

    // Thousands (千)
    const thousands = value / 1000n
    const thousandsRemainder = value % 1000n
    if (thousands > 0n) {
      parts.push(this.onesWords[Number(thousands)] + this.thousandWord)
      needsZero = thousandsRemainder > 0n && thousandsRemainder < 100n
    }

    // Hundreds (百)
    const hundreds = thousandsRemainder / 100n
    const hundredsRemainder = thousandsRemainder % 100n
    if (hundreds > 0n) {
      if (needsZero) {
        parts.push(this.zeroWord)
        needsZero = false
      }
      parts.push(this.onesWords[Number(hundreds)] + this.hundredWord)
      needsZero = hundredsRemainder > 0n && hundredsRemainder < 10n
    } else if (thousands > 0n && hundredsRemainder > 0n) {
      needsZero = true
    }

    // Tens (十)
    const tens = hundredsRemainder / 10n
    const ones = hundredsRemainder % 10n
    if (tens > 0n) {
      if (needsZero) {
        parts.push(this.zeroWord)
        needsZero = false
      }
      parts.push(this.onesWords[Number(tens)] + this.tenWord)
    } else if ((hundreds > 0n || thousands > 0n) && ones > 0n) {
      needsZero = true
    }

    // Ones
    if (ones > 0n) {
      if (needsZero) {
        parts.push(this.zeroWord)
      }
      parts.push(this.onesWords[Number(ones)])
    }

    return parts.join('')
  }

  /**
   * Converts decimal digits to words by reading each digit individually.
   * Chinese reads decimals digit by digit.
   */
  decimalDigitsToWords (decimalString) {
    const words = []
    for (const char of decimalString) {
      words.push(this.onesWords[Number(char)])
    }
    return words
  }
}
