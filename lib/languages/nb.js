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
   * @param {Object} preceding The preceding word-set as `{ word: BigInt }`.
   * @param {Object} following The following word-set as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * combineWordSets({ 'en': 1n }, { 'hundre': 100n }); // { 'hundre': 100n }
   * combineWordSets({ 'tjue': 20n }, { 'tre': 3n }); // { 'tjue-tre': 23n }
   */
  // Norwegian merge rules mirror the former Scandinavian base logic
  combineWordSets (preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingValue = Object.values(following)[0]

    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    if (precedingValue < 100n && precedingValue > followingValue) {
      return { [`${precedingWord}-${followingWord}`]: precedingValue + followingValue }
    }

    if (precedingValue >= 100n && followingValue < 100n) {
      return { [`${precedingWord} og ${followingWord}`]: precedingValue + followingValue }
    }

    if (followingValue > precedingValue) {
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    return { [`${precedingWord}, ${followingWord}`]: precedingValue + followingValue }
  }
}
