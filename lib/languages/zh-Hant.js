import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Traditional Chinese language converter.
 *
 * Supports:
 * - Traditional Chinese characters (繁體中文)
 * - No word separators (concatenated format)
 * - Optional formal (financial) vs common numerals
 */
export class TraditionalChinese extends GreedyScaleLanguage {
  negativeWord = '負'
  decimalSeparatorWord = '點'
  zeroWord = '零'
  wordSeparator = ''

  constructor (options = {}) {
    super()

    this.setOptions({
      formal: true
    }, options)

    if (this.options.formal) {
      this.scaleWords = [
        [1_000_000_000_000n, '萬'],
        [100_000_000n, '億'],
        [10_000n, '萬'],
        [1000n, '仟'],
        [100n, '佰'],
        [10n, '拾'],
        [9n, '玖'],
        [8n, '捌'],
        [7n, '柒'],
        [6n, '陸'],
        [5n, '伍'],
        [4n, '肆'],
        [3n, '參'],
        [2n, '貳'],
        [1n, '壹'],
        [0n, '零']
      ]
    } else {
      this.scaleWords = [
        [1_000_000_000_000n, '萬'],
        [100_000_000n, '億'],
        [10_000n, '萬'],
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

  /** Combines two word-sets with Traditional Chinese grammar rules and zero insertion. */
  combineWordSets (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = Object.values(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = Object.values(rightPair)[0]

    // Implicit one: omit 1 before single digits (< 10)
    if (leftNumber === 1n && rightNumber < 10n) {
      return rightPair
    }

    // Multiply when right > left (scale words like 千, 萬, 億)
    if (rightNumber > leftNumber) {
      return { [`${leftWord}${rightWord}`]: leftNumber * rightNumber }
    }

    // Insert "零" (zero) when position skip levels (e.g., 1003 = 千零三)
    // zeroDigit() checks if gap exists between left and right magnitude
    if (this.zeroDigit(leftNumber) > this.digit(rightNumber)) {
      return { [`${leftWord}${this.zeroWord}${rightWord}`]: leftNumber + rightNumber }
    }

    // Default: concatenate without zero insertion
    return { [`${leftWord}${rightWord}`]: leftNumber + rightNumber }
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
