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
   * - Omits '1' before hundreds and thousands
   * - Uses space separator for all combinations
   * - Multiplies when right > left, adds otherwise
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

    if (leftNumber === 1n && (rightNumber <= 100n || rightNumber === 1000n)) {
      return { [rightWord]: rightNumber }
    } else if (rightNumber > leftNumber) {
      return { [`${leftWord}${this.spaceSeparator}${rightWord}`]: leftNumber * rightNumber }
    } else {
      return { [`${leftWord}${this.spaceSeparator}${rightWord}`]: leftNumber + rightNumber }
    }
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
