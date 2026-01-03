import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Simplified Chinese language converter.
 *
 * Supports:
 * - Simplified Chinese characters (简体中文)
 * - No word separators (concatenated format)
 * - Optional formal (financial) vs common numerals
 */
export class SimplifiedChinese extends GreedyScaleLanguage {
  negativeWord = '负'
  decimalSeparatorWord = '点'
  zeroWord = '零'
  wordSeparator = ''

  constructor (options = {}) {
    super()

    this.setOptions({
      formal: true
    }, options)

    if (this.options.formal) {
      this.scaleWords = [
        [1_000_000_000_000n, '万'],
        [100_000_000n, '亿'],
        [10_000n, '万'],
        [1000n, '仟'],
        [100n, '佰'],
        [10n, '拾'],
        [9n, '玖'],
        [8n, '捌'],
        [7n, '柒'],
        [6n, '陆'],
        [5n, '伍'],
        [4n, '肆'],
        [3n, '叁'],
        [2n, '贰'],
        [1n, '壹'],
        [0n, '零']
      ]
    } else {
      this.scaleWords = [
        [1_000_000_000_000n, '万'],
        [100_000_000n, '亿'],
        [10_000n, '万'],
        [1000n, '千'],
        [100n, '百'],
        [10n, '十'],
        [9n, '九'],
        [8n, '八'],
        [7n, '七'],
        [6n, '六'],
        [5n, '五'],
        [4n, '四'],
        [3n, '三'],
        [2n, '二'],
        [1n, '一'],
        [0n, '零']
      ]
    }
  }

  /** Combines two word-sets according to Chinese grammar rules. */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Implicit one: omit 1 before single digits (< 10)
    if (precedingValue === 1n && followingValue < 10n) {
      return following
    }

    // Multiply when following > preceding (scale words like 仁, 万, 亿)
    if (followingValue > precedingValue) {
      return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
    }

    // Insert "零" (zero) when position skip levels (e.g., 1003 = 千零三)
    // zeroDigit() checks if gap exists between preceding and following magnitude
    if (this.zeroDigit(precedingValue) > this.digit(followingValue)) {
      return { [`${precedingWord}${this.zeroWord}${followingWord}`]: precedingValue + followingValue }
    }

    // Default: concatenate without zero insertion
    return { [`${precedingWord}${followingWord}`]: precedingValue + followingValue }
  }

  /** Returns the number of digits in a number. */
  digit (number_) {
    return number_.toString().length
  }

  /** Counts the number of zero digits in a number. */
  zeroDigit (number_) {
    return [...number_.toString()].filter(c => c === '0').length
  }

  /** Converts decimal digits to words by reading each digit individually. */
  decimalDigitsToWords (decimalString) {
    const words = []
    for (let i = 0; i < decimalString.length; i++) {
      const digitValue = BigInt(decimalString[i])
      words.push(this.integerToWords(digitValue))
    }
    return words
  }
}
