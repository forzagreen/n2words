import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Norwegian Bokmål language converter.
 *
 * Supports:
 * - Hyphenation for compound numbers (tjueen)
 * - "og" (and) for hundreds combinations
 * - Implicit '1' omission before tens and magnitudes
 */
export class NorwegianBokmal extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'null'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'oktillion'],
    [1_000_000_000_000_000_000_000_000n, 'septillion'],
    [1_000_000_000_000_000_000_000n, 'sekstillion'],
    [1_000_000_000_000_000_000n, 'kvintillion'],
    [1_000_000_000_000_000n, 'kvadrillion'],
    [1_000_000_000_000n, 'billion'],
    [1_000_000_000n, 'milliard'],
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
  ]

  /**
   * Merges two adjacent word-number pairs according to Norwegian grammar rules.
   *
   * Norwegian-specific rules:
   * - Implicit "en": `combineWordSets({ 'en': 1n }, { 'hundre': 100n })` → `{ 'hundre': 100n }`
   * - Hyphenation for compound tens: `combineWordSets({ 'tjue': 20n }, { 'en': 1n })` → `{ 'tjue-en': 21n }`
   * - "og" (and) after hundreds: `combineWordSets({ 'hundre': 100n }, { 'en': 1n })` → `{ 'hundre og en': 101n }`
   * - Space-separated for large numbers (thousands+)
   * - Comma separator for non-magnitude additions (e.g., \"tusen, en\")
   *
   * @param {Object} leftPair The left operand as `{ word: BigInt }`.
   * @param {Object} rightPair The right operand as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * combineWordSets({ 'en': 1n }, { 'hundre': 100n }); // { 'hundre': 100n }
   * combineWordSets({ 'tjue': 20n }, { 'tre': 3n }); // { 'tjue-tre': 23n }
   */
  // Norwegian merge rules mirror the former Scandinavian base logic
  combineWordSets (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = Object.values(leftPair)[0]
    const rightNumber = Object.values(rightPair)[0]

    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair
    }

    if (leftNumber < 100n && leftNumber > rightNumber) {
      return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    }

    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} og ${rightWord}`]: leftNumber + rightNumber }
    }

    if (rightNumber > leftNumber) {
      return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    }

    return { [`${leftWord}, ${rightWord}`]: leftNumber + rightNumber }
  }
}
