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

  scaleWordPairs = [
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
    super(options)

    this.options = {
      ...{
        withHyphenSeparator: false
      },
      ...options
    }

    if (options.withHyphenSeparator) {
      this.wordSeparator = '-'
    }
  }

  /** Merges scale components with French pluralization and hyphenation rules. */
  mergeScales (currentPair, nextPair) {
    let currentWord = Object.keys(currentPair)[0]
    let nextWord = Object.keys(nextPair)[0]
    const currentNumber = Object.values(currentPair)[0]
    const nextNumber = Object.values(nextPair)[0]

    if (currentNumber === 1n) {
      if (nextNumber < 1_000_000n) {
        return nextPair
      }
    } else {
      if (
        ((currentNumber - 80n) % 100n === 0n || (currentNumber % 100n === 0n && currentNumber < 1000n)) &&
        nextNumber < 1_000_000n &&
        currentWord.at(-1) === 's'
      ) {
        currentWord = currentWord.slice(0, -1)
      }

      if (
        currentNumber < 1000n && nextNumber !== 1000n &&
        nextWord.at(-1) !== 's' &&
        nextNumber % 100n === 0n
      ) {
        nextWord += 's'
      }
    }

    if (nextNumber < currentNumber && currentNumber < 100n) {
      if (nextNumber % 10n === 1n && currentNumber !== 80n) {
        return { [`${currentWord}${this.wordSeparator}et${this.wordSeparator}${nextWord}`]: currentNumber + nextNumber }
      }
      return { [`${currentWord}-${nextWord}`]: currentNumber + nextNumber }
    }

    if (nextNumber > currentNumber) return { [`${currentWord}${this.wordSeparator}${nextWord}`]: currentNumber * nextNumber }
    return { [`${currentWord}${this.wordSeparator}${nextWord}`]: currentNumber + nextNumber }
  }
}
