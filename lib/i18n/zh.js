import CardMatchLanguage from '../classes/card-match-language.js'

/**
 * Chinese language converter.
 *
 * Features:
 * - Concatenated number-word format (no spaces)
 * - Implicit zero insertion for positional values
 * - Decimal digits pronounced individually
 * - Supports both formal (financial) and common (everyday) styles
 */
export class Chinese extends CardMatchLanguage {
  #formal

  /**
   * Initializes the Chinese converter.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='负'] Word for negative numbers.
   * @param {string} [options.separatorWord='点'] Word separating whole and decimal parts.
   * @param {string} [options.zero='零'] Word for 0.
   * @param {string} [options.spaceSeparator=''] No space separator for Chinese compounds.
  * @param {boolean} [options.formal=true] Use formal/financial numerals (壹贰叁) vs. common numerals (一二三).
   */
  constructor (options) {
    super(options = Object.assign({
      negativeWord: '负',
      separatorWord: '点',
      zero: '零',
      spaceSeparator: '',
      formal: true
    }, options))

    this.#formal = options.formal

    if (this.#formal) {
      this.cards = [
        // Formal/financial style (大写数字)
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
      this.cards = [
        // Common/everyday style (小写数字)
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
  merge (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = Object.values(leftPair)[0] // BigInt
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = Object.values(rightPair)[0] // BigInt

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
      return { [`${leftWord}${this.zero}${rightWord}`]: leftNumber + rightNumber }
    }

    // Default: concatenate without zero insertion
    return { [`${leftWord}${rightWord}`]: leftNumber + rightNumber }
  }

  digit (number_) {
    return number_.toString().length
  }

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
  decimalToCardinal (decimalString) {
    const words = []
    for (let i = 0; i < decimalString.length; i++) {
      const digitValue = BigInt(decimalString[i])
      words.push(this.toCardinal(digitValue))
    }
    return words
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new Chinese(options).floatToCardinal(value)
}
