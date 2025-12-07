import BaseLanguage from '../classes/base-language.js'

/**
 * Norwegian language converter.
 *
 * Features:
 * - Hyphenation for compound numbers (e.g., "tjueen")
 * - "og" (and) for hundreds combinations
 * - Comma separation for non-magnitude additions
 */
export class N2WordsNO extends BaseLanguage {
  constructor (options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    }, options)

    super(options, [
      [1_000_000_000_000_000_000_000_000_000_000_000n, 'quintillard'],
      [1_000_000_000_000_000_000_000_000_000_000n, 'quintillion'],
      [1_000_000_000_000_000_000_000_000_000n, 'quadrillard'],
      [1_000_000_000_000_000_000_000_000n, 'quadrillion'],
      [1_000_000_000_000_000_000_000n, 'trillard'],
      [1_000_000_000_000_000_000n, 'trillion'],
      [1_000_000_000_000_000n, 'billard'],
      [1_000_000_000_000n, 'billion'],
      [1_000_000_000n, 'millard'],
      [1_000_000n, 'million'],
      [1000n, 'tusen'],
      [100n, 'hundre'],
      [90n, 'nitti'],
      [80n, 'åtti'],
      [70n, 'sytti'],
      [60n, 'seksti'],
      [50n, 'femti'],
      [40n, 'førti'],
      [30n, 'tretti'],
      [20n, 'tjue'],
      [19n, 'nitten'],
      [18n, 'atten'],
      [17n, 'sytten'],
      [16n, 'seksten'],
      [15n, 'femten'],
      [14n, 'fjorten'],
      [13n, 'tretten'],
      [12n, 'tolv'],
      [11n, 'elleve'],
      [10n, 'ti'],
      [9n, 'ni'],
      [8n, 'åtte'],
      [7n, 'syv'],
      [6n, 'seks'],
      [5n, 'fem'],
      [4n, 'fire'],
      [3n, 'tre'],
      [2n, 'to'],
      [1n, 'en'],
      [0n, 'null']
    ] )
  }

  /**
   * Merges two adjacent word-number pairs according to Norwegian grammar rules.
   *
   * Norwegian-specific rules:
   * - Omits '1' before tens (e.g., "tjue" not "en og tjue")
   * - Hyphenates compound tens (e.g., "tjueen")
   * - Uses "og" (and) for hundreds + smaller numbers
   * - Space separates for multiplication
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

    if (leftNumber === 1n && rightNumber < 100n) return { [rightWord]: rightNumber }
    else if (leftNumber < 100n && leftNumber > rightNumber) return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    else if (leftNumber >= 100n && rightNumber < 100n) return { [`${leftWord} og ${rightWord}`]: leftNumber + rightNumber }
    else if (rightNumber > leftNumber) return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    return { [`${leftWord}, ${rightWord}`]: leftNumber + rightNumber }
  }
}

/**
 * Converts a number to Norwegian cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see N2WordsNO class).
 * @returns {string} The number expressed in Norwegian words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'no' }); // 'førtito'
 * floatToCardinal(1.5, { lang: 'no' }); // 'en komma fem'
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsNO(options).floatToCardinal(value)
}
