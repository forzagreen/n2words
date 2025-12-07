import BaseLanguage from '../classes/base-language.js'

/**
 * Chinese language converter.
 *
 * Features:
 * - Concatenated number-word format (no spaces)
 * - Implicit zero insertion for positional values
 * - Decimal digits pronounced individually
 */
export class N2WordsZH extends BaseLanguage {
  /**
   * Initializes the Chinese converter.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='负'] Word for negative numbers.
   * @param {string} [options.separatorWord='点'] Word separating whole and decimal parts.
   * @param {string} [options.zero='零'] Word for 0.
   * @param {string} [options.spaceSeparator=''] No space separator for Chinese compounds.
   */
  constructor (options) {
    super(Object.assign({
      negativeWord: '负',
      separatorWord: '点',
      zero: '零',
      spaceSeparator: ''
    }, options), [
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
    ] )
  }

  /**
   * Merges two adjacent word-number pairs according to Chinese grammar rules.
   *
   * Chinese-specific rules:
   * - Omits '一' (1) before single digits (< 10)
   * - Concatenates without space
   * - Inserts '零' (zero) when positional values skip magnitude levels
   * - Multiplies when right > left, adds otherwise
   *
   * @param {Object} leftPair The left operand as `{ word: number }`.
   * @param {Object} rightPair The right operand as `{ word: number }`.
   * @returns {Object} Merged pair with combined word and resulting number.
   */
  merge (leftPair, rightPair) {
    // {'one':1}, {'hundred':100}
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = BigInt(Object.values(leftPair)[0])
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = BigInt(Object.values(rightPair)[0])

    let result = { [`${leftWord}${rightWord}`]: leftNumber + rightNumber }

    if (leftNumber === 1n && rightNumber < 10n) {
      result = { [rightWord]: rightNumber }
    } else if (rightNumber > leftNumber) {
      result = { [`${leftWord}${rightWord}`]: leftNumber * rightNumber }
    } else if (this.zeroDigit(leftNumber) > this.digit(rightNumber)) {
      result = { [`${leftWord}${this.zero}${rightWord}`]: leftNumber + rightNumber }
    }

    return result
  }

  decimalToCardinal (decimal) {
    const decimalPartArray = [...decimal]

    const decimalPartWordsArray = decimalPartArray.map(d =>
      this.getCardWord(BigInt(d))
    )

    return decimalPartWordsArray.join(this.spaceSeparator)
  }

  digit (number_) {
    return number_.toString().length
  }

  zeroDigit (number_) {
    return [...number_.toString()].filter(c => c === '0').length
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
  return new N2WordsZH(options).floatToCardinal(value)
}
