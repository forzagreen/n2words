import BaseLanguage from '../classes/base-language.js'

/**
 * Norwegian language converter.
 *
 * Features:
 * - Hyphenation for compound numbers (e.g., "tjueen")
 * - "og" (and) for hundreds combinations
 * - Comma separation for non-magnitude additions
 */
export class NO extends BaseLanguage {
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
    ])
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
  /**
   * Merges two adjacent word-number pairs according to Norwegian grammar rules.
   * This method implements Norwegian-specific number composition patterns:
   *
   * Rule 1: Implicit 'en' (one) before tens - omits '1' to form just the tens word
   * Rule 2: Hyphenation for compound tens (e.g., "tjueen" for 21)
   * Rule 3: "og" (and) separator for hundreds + smaller numbers
   * Rule 4: Space for multiplication (magnitude boundaries)
   * Rule 5: Comma for additional combinations beyond standard rules
   *
   * @param {Object} leftPair The left operand with structure `{ word: bigint }`.
   * @param {Object} rightPair The right operand with structure `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  merge (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = Object.values(leftPair)[0] // BigInt (e.g., 1n, 100n)
    const rightNumber = Object.values(rightPair)[0] // BigInt (e.g., 20n, 1000n)

    // Rule 1: Implicit 'en' before tens - omit '1' and return just the tens word
    if (leftNumber === 1n && rightNumber < 100n) return rightPair

    // Rule 2: Hyphenation for compounds (e.g., leftNumber=9, rightNumber=20 → "ni-tjue")
    if (leftNumber < 100n && leftNumber > rightNumber) return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }

    // Rule 3: "og" (and) for hundreds + smaller (e.g., 100 + 5 → "hundre og fem")
    if (leftNumber >= 100n && rightNumber < 100n) return { [`${leftWord} og ${rightWord}`]: leftNumber + rightNumber }

    // Rule 4: Space for multiplication across magnitude boundaries
    if (rightNumber > leftNumber) return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }

    // Rule 5: Comma for other combinations (non-standard rules)
    return { [`${leftWord}, ${rightWord}`]: leftNumber + rightNumber }
  }
}

/**
 * Converts a number to Norwegian cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see NO class).
 * @returns {string} The number expressed in Norwegian words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'no' }); // 'førtito'
 * floatToCardinal(1.5, { lang: 'no' }); // 'en komma fem'
 */
export default function floatToCardinal (value, options = {}) {
  return new NO(options).floatToCardinal(value)
}
