import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

/**
 * Korean language converter.
 *
 * Features:
 * - Space-separated for large numbers (>= 만/10,000)
 * - Concatenated for smaller numbers
 * - Omits '일' (1) before multipliers
 */
export class Korean extends GreedyScaleLanguage {
  negativeWord = '마이너스'

  decimalSeparatorWord = '점'

  zeroWord = '영'

  scaleWords = [
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
  ]

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
  mergeScales (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = Object.values(leftPair)[0] // BigInt
    const rightNumber = Object.values(rightPair)[0] // BigInt

    // Implicit "일": omit 1 before multipliers up to 만 (10,000)
    if (leftNumber === 1n && rightNumber <= 10_000n) return rightPair
    // Concatenate (no space) for small numbers less than 만
    if (leftNumber < 10_000n && leftNumber > rightNumber) return { [`${leftWord}${rightWord}`]: leftNumber + rightNumber }
    // Space-separate for large numbers (>= 만) when adding
    if (leftNumber >= 10_000n && leftNumber > rightNumber) return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
    // Multiply for all scale combinations
    return { [`${leftWord}${rightWord}`]: leftNumber * rightNumber }
  }
}

/**
 * Converts a number to Korean cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see Korean class options).
 * @returns {string} The number expressed in Korean words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * convertToWords(42); // '사십이'
 * convertToWords(10001); // '만 일'
 */
export default function convertToWords (value, options = {}) {
  return new Korean(options).convertToWords(value)
}


