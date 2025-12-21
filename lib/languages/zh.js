import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

/**
 * @typedef {Object} ChineseOptions
 * @property {boolean} [formal=true] Use formal/financial numerals (壹贰叁) vs. common numerals (一二三).
 */

/**
 * Chinese language converter.
 *
 * Features:
 * - Concatenated number-word format (no spaces)
 * - Implicit zero insertion for positional values
 * - Decimal digits pronounced individually
 * - Supports both formal (financial) and common (everyday) styles
 */
export class Chinese extends GreedyScaleLanguage {
  negativeWord = '负'
  decimalSeparatorWord = '点'
  zeroWord = '零'
  wordSeparator = ''

  /**
   * Initializes the Chinese converter.
   *
   * @param {ChineseOptions} [options={}] Configuration options.
   */
  constructor ({ formal = true } = {}) {
    super()

    this.formal = formal

    if (this.formal) {
      this.scaleWordPairs = [
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
      this.scaleWordPairs = [
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

  /**
   * Merges two adjacent word-number pairs according to Chinese grammar rules.
   *
   * Chinese-specific rules:
   * - Omits '一' (or '壹' in formal style) before single digits (< 10)
   * - Concatenates without space
   * - Inserts '零' (zero) when positional values skip magnitude levels
   * - Multiplies when right > left, adds otherwise
   *
   * @param {Object} leftPair The left operand as `{ word: number }`.
   * @param {Object} rightPair The right operand as `{ word: number }`.
   * @returns {Object} Merged pair with combined word and resulting number.
   */
  mergeScales (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = Object.values(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = Object.values(rightPair)[0]

    // Implicit one: omit 1 before single digits (< 10)
    if (leftNumber === 1n && rightNumber < 10n) {
      return rightPair
    }

    // Multiply when right > left (scale words like 千, 万, 亿)
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

  /**
   * Get the number of digits in a number.
   *
   * @param {bigint|number} number_ The number to count digits for.
   * @returns {number} The count of digits.
   */
  digit (number_) {
    return number_.toString().length
  }

  /**
   * Count the number of zeros in a number.
   *
   * @param {bigint|number} number_ The number to count zeros in.
   * @returns {number} The count of zero digits.
   */
  zeroDigit (number_) {
    return [...number_.toString()].filter(c => c === '0').length
  }

  /**
   * Convert decimal digits to words by reading each digit individually.
   * Overrides the default grouped behavior from AbstractLanguage.
   *
   * @param {string} decimalString The decimal digits as a string.
   * @returns {Array<string>} Array of individual digit words.
   */
  decimalDigitsToWords (decimalString) {
    const words = []
    for (let i = 0; i < decimalString.length; i++) {
      const digitValue = BigInt(decimalString[i])
      words.push(this.convertWholePart(digitValue))
    }
    return words
  }
}

/**
 * Converts a number to Chinese cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {ChineseOptions} [options] Conversion options.
 * @returns {string} The number expressed in Chinese words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * convertToWords(42); // '肆拾贰' (formal style)
 * convertToWords(42, { formal: false }); // '四十二' (common style)
 */
export default function convertToWords (value, options = {}) {
  return new Chinese(options).convertToWords(value)
}
