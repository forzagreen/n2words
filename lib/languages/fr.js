import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * French language converter.
 *
 * Supports:
 * - Pluralization of "cent" (hundred) and other words
 * - "et" (and) before odd numbers in tens place
 * - Optional hyphenation for compound numbers
 */
export class French extends GreedyScaleLanguage {
  negativeWord = 'moins'
  decimalSeparatorWord = 'virgule'
  zeroWord = 'zéro'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'quadrilliard'],
    [1_000_000_000_000_000_000_000_000n, 'quadrillion'],
    [1_000_000_000_000_000_000_000n, 'trilliard'],
    [1_000_000_000_000_000_000n, 'trillion'],
    [1_000_000_000_000_000n, 'billiard'],
    [1_000_000_000_000n, 'billion'],
    [1_000_000_000n, 'milliard'],
    [1_000_000n, 'million'],
    [1000n, 'mille'],
    [100n, 'cent'],
    [80n, 'quatre-vingts'],
    [60n, 'soixante'],
    [50n, 'cinquante'],
    [40n, 'quarante'],
    [30n, 'trente'],
    [20n, 'vingt'],
    [19n, 'dix-neuf'],
    [18n, 'dix-huit'],
    [17n, 'dix-sept'],
    [16n, 'seize'],
    [15n, 'quinze'],
    [14n, 'quatorze'],
    [13n, 'treize'],
    [12n, 'douze'],
    [11n, 'onze'],
    [10n, 'dix'],
    [9n, 'neuf'],
    [8n, 'huit'],
    [7n, 'sept'],
    [6n, 'six'],
    [5n, 'cinq'],
    [4n, 'quatre'],
    [3n, 'trois'],
    [2n, 'deux'],
    [1n, 'un'],
    [0n, 'zéro']
  ]

  constructor (options = {}) {
    super()

    this.setOptions({
      withHyphenSeparator: false
    }, options)

    if (options.withHyphenSeparator) {
      this.wordSeparator = '-'
    }
  }

  /** Combines two word-sets with French pluralization and hyphenation rules. */
  combineWordSets (preceding, following) {
    let [[precedingWord, precedingValue]] = Object.entries(preceding)
    let [[followingWord, followingValue]] = Object.entries(following)

    if (precedingValue === 1n) {
      if (followingValue < 1_000_000n) {
        return following
      }
    } else {
      if (
        ((precedingValue - 80n) % 100n === 0n || (precedingValue % 100n === 0n && precedingValue < 1000n)) &&
        followingValue < 1_000_000n &&
        precedingWord.at(-1) === 's'
      ) {
        precedingWord = precedingWord.slice(0, -1)
      }

      if (
        precedingValue < 1000n && followingValue !== 1000n &&
        followingWord.at(-1) !== 's' &&
        followingValue % 100n === 0n
      ) {
        followingWord += 's'
      }
    }

    if (followingValue < precedingValue && precedingValue < 100n) {
      if (followingValue % 10n === 1n && precedingValue !== 80n) {
        return { [`${precedingWord}${this.wordSeparator}et${this.wordSeparator}${followingWord}`]: precedingValue + followingValue }
      }
      return { [`${precedingWord}-${followingWord}`]: precedingValue + followingValue }
    }

    if (followingValue > precedingValue) return { [`${precedingWord}${this.wordSeparator}${followingWord}`]: precedingValue * followingValue }
    return { [`${precedingWord}${this.wordSeparator}${followingWord}`]: precedingValue + followingValue }
  }
}
