import BaseLanguage from '../classes/base-language.js'

/**
 * Korean language converter.
 *
 * Features:
 * - Space-separated for large numbers (>= 만/10,000)
 * - Concatenated for smaller numbers
 * - Omits '일' (1) before multipliers
 */
export class N2WordsKO extends BaseLanguage {
  /**
   * Initializes the Korean converter.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='마이너스'] Word for negative numbers.
   * @param {string} [options.separatorWord='점'] Word separating whole and decimal parts.
   * @param {string} [options.zero='영'] Word for 0.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: '마이너스',
      separatorWord: '점',
      zero: '영'
    }, options)

    super(options, [
      [10_000_000_000_000_000_000_000_000_000n, '양'],
      [1_000_000_000_000_000_000_000_000n, '자'],
      [100_000_000_000_000_000_000n, '해'],
      [10_000_000_000_000_000n, '경'],
      [1_000_000_000_000n, '조'],
      [100_000_000n, '억'],
      [10_000n, '만'],
      [1000n, '천'],
      [100n, '백'],
      [10n, '십'],
      [9n, '구'],
      [8n, '팔'],
      [7n, '칠'],
      [6n, '육'],
      [5n, '오'],
      [4n, '사'],
      [3n, '삼'],
      [2n, '이'],
      [1n, '일'],
      [0n, '영']
    ] )
  }

  /**
   * Merges two adjacent word-number pairs according to Korean grammar rules.
   *
   * Korean-specific rules:
   * - Omits '일' (1) before multipliers <= 만 (10,000)
   * - Concatenates without space for small numbers (< 만)
   * - Separates with space for large numbers (>= 만)
   * - Multiplies when right > left, adds when left > right
   *
   * @param {Object} leftPair The left operand as `{ word: number }`.
   * @param {Object} rightPair The right operand as `{ word: number }`.
   * @returns {Object} Merged pair with combined word and resulting number.
   */
  merge (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = BigInt(Object.values(leftPair)[0])
    const rightNumber = BigInt(Object.values(rightPair)[0])

    if (leftNumber === 1n && rightNumber <= 10_000n) return { [rightWord]: rightNumber }
    else if (leftNumber < 10_000n && leftNumber > rightNumber) return { [`${leftWord}${rightWord}`]: leftNumber + rightNumber }
    else if (leftNumber >= 10_000n && leftNumber > rightNumber) return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
    else return { [`${leftWord}${rightWord}`]: leftNumber * rightNumber }
  }
}

/**
 * Converts a number to Korean cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see N2WordsKO class).
 * @returns {string} The number expressed in Korean words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'ko' }); // '사십이'
 * floatToCardinal(10001, { lang: 'ko' }); // '만 일'
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsKO(options).floatToCardinal(value)
}
