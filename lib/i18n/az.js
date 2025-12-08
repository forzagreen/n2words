import BaseLanguage from '../classes/base-language.js'

/**
 * Azerbaijani language converter.
 *
 * Features:
 * - Space-separated number combinations
 * - Omits '1' before hundreds and thousands
 * - Supports flexible word spacing configuration
 */
export class AZ extends BaseLanguage {
  constructor (options) {
    options = Object.assign({
      negativeWord: 'mənfi',
      separatorWord: 'nöqtə',
      zero: 'sıfır'
    }, options)

    super(options, [
      [1_000_000_000_000_000_000n, 'kentilyon'],
      [1_000_000_000_000_000n, 'katrilyon'],
      [1_000_000_000_000n, 'trilyon'],
      [1_000_000_000n, 'milyar'],
      [1_000_000n, 'milyon'],
      [1000n, 'min'],
      [100n, 'yüz'],
      [90n, 'doxsan'],
      [80n, 'səksən'],
      [70n, 'yetmiş'],
      [60n, 'altmış'],
      [50n, 'əlli'],
      [40n, 'qırx'],
      [30n, 'otuz'],
      [20n, 'iyirmi'],
      [10n, 'on'],
      [9n, 'doqquz'],
      [8n, 'səkkiz'],
      [7n, 'yeddi'],
      [6n, 'altı'],
      [5n, 'beş'],
      [4n, 'dörd'],
      [3n, 'üç'],
      [2n, 'iki'],
      [1n, 'bir'],
      [0n, 'sıfır']
    ])
  }

  /**
   * Merges two adjacent word-number pairs according to Azerbaijani grammar rules.
   *
   * Azerbaijani-specific rules:
   * - Implicit 'bir' (one) before hundreds and thousands - omits '1'
   * - Space separator (spaceSeparator property) for all combinations
   * - Multiplies when right > left (crossing magnitude boundary)
   * - Adds otherwise (combining same-magnitude components)
   *
   * Examples:
   * - leftNumber=1, rightNumber=100 → returns just "yüz" (hundred, not "bir yüz")
   * - leftNumber=2, rightNumber=100 → returns "iki yüz" (2 * 100 = 200)
   * - leftNumber=200, rightNumber=5 → returns "iki yüz beş" (200 + 5 = 205)
   *
   * @param {Object} leftPair The left operand as `{ word: bigint }`.
   * @param {Object} rightPair The right operand as `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  merge (leftPair, rightPair) {
    // Destructure entries to avoid repeated property access (performance optimization)
    const [[leftWord, leftNumber]] = Object.entries(leftPair) // BigInt values
    const [[rightWord, rightNumber]] = Object.entries(rightPair) // BigInt values

    // Implicit 'bir' (one) before certain magnitudes:
    // Omit '1' before hundreds (100n) and thousands (1000n) to form natural combinations
    if (leftNumber === 1n && (rightNumber <= 100n || rightNumber === 1000n)) {
      return rightPair // Return just the magnitude word (e.g., "yüz", not "bir yüz")
    }

    // Combine numbers with space separator (spaceSeparator from BaseLanguage):
    // Multiply when crossing magnitude boundary, add otherwise
    const result = rightNumber > leftNumber ? leftNumber * rightNumber : leftNumber + rightNumber
    return { [`${leftWord}${this.spaceSeparator}${rightWord}`]: result }
  }
}

/**
 * Converts a number to Azerbaijani cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see AZ class).
 * @returns {string} The number expressed in Azerbaijani words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'az' }); // 'qırx iki'
 * floatToCardinal(1000, { lang: 'az' }); // 'min'
 */
export default function floatToCardinal (value, options = {}) {
  return new AZ(options).floatToCardinal(value)
}
