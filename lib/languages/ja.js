import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Japanese language converter.
 *
 * Supports:
 * - Kanji numerals (一, 二, 三, etc.)
 * - Grouping by 万 (10,000) instead of 1,000
 * - Special 一 (one) omission rules (十, 百, 千 but 一万, 一億)
 */
export class Japanese extends AbstractLanguage {
  negativeWord = 'マイナス'
  decimalSeparatorWord = '点'
  zeroWord = '零'
  wordSeparator = '' // Japanese doesn't use spaces between characters
  convertDecimalsPerDigit = true // Enable digit-by-digit decimal conversion

  // Digits used for group conversion (1-9)
  digits = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

  // Scale words for grouping by 10^4
  scales = [
    '', // 10^0 (ones)
    '万', // 10^4 (man)
    '億', // 10^8 (oku)
    '兆', // 10^12 (chō)
    '京', // 10^16 (kei)
    '垓', // 10^20 (gai)
    '秭', // 10^24 (jo/shi)
    '穣', // 10^28 (jō)
    '溝', // 10^32 (kō)
    '澗', // 10^36 (kan)
    '正', // 10^40 (sei)
    '載', // 10^44 (sai)
    '極', // 10^48 (goku)
    '恒河沙', // 10^52 (gōgasha)
    '阿僧祇', // 10^56 (asōgi)
    '那由他', // 10^60 (nayuta)
    '不可思議', // 10^64 (fukashigi)
    '無量大数' // 10^68 (muryōtaisū)
  ]

  /** Converts a group of up to 4 digits to Japanese kanji with 一 omission rules. */
  convertGroup (num, isTopGroup = false) {
    if (num === 0n) return ''

    const thousands = num / 1000n
    const hundreds = (num % 1000n) / 100n
    const tens = (num % 100n) / 10n
    const ones = num % 10n

    let result = ''

    // Thousands (千)
    if (thousands > 0n) {
      // Always omit 一 before 千 when thousands === 1
      if (thousands === 1n) {
        result += '千'
      } else {
        result += this.digits[Number(thousands) - 1] + '千'
      }
    }

    // Hundreds (百)
    if (hundreds > 0n) {
      // Always omit 一 before 百 when hundreds === 1
      if (hundreds === 1n) {
        result += '百'
      } else {
        result += this.digits[Number(hundreds) - 1] + '百'
      }
    }

    // Tens (十)
    if (tens > 0n) {
      // Always omit 一 before 十 when tens === 1
      if (tens === 1n) {
        result += '十'
      } else {
        result += this.digits[Number(tens) - 1] + '十'
      }
    }

    // Ones
    if (ones > 0n) {
      result += this.digits[Number(ones) - 1]
    }

    return result
  }

  /** Converts whole number using Japanese 万-based grouping system. */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    let temp = number
    let scaleIndex = 0
    const groups = []

    // Split into groups of 4 digits (万-based system)
    while (temp > 0n) {
      const group = temp % 10000n
      if (group > 0n) {
        groups.push({ value: group, scale: scaleIndex })
      }
      temp = temp / 10000n
      scaleIndex++
    }

    // Reverse to process from highest to lowest
    groups.reverse()

    let result = ''

    for (let i = 0; i < groups.length; i++) {
      const { value, scale } = groups[i]
      const isTopGroup = (i === 0)

      const groupStr = this.convertGroup(value, isTopGroup)

      // For scales >= 1 (万 and above), always add the scale word
      if (scale >= 1) {
        // Special case: if group is 1 and scale >= 1, we need 一 before the scale
        if (value === 1n) {
          result += '一' + this.scales[scale]
        } else {
          result += groupStr + this.scales[scale]
        }
      } else {
        result += groupStr
      }
    }

    return result
  }
}
