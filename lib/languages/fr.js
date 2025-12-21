import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

/**
 * @typedef {Object} FrenchOptions
 * @property {boolean} [withHyphenSeparator=false] Use hyphens (true) instead of spaces (false) in compounds.
 */

/**
 * French language converter.
 *
 * Special handling:
 * - Pluralization of "cent" (hundred) and other words
 * - "et" (and) before odd numbers in tens place
 * - Hyphenation for compound numbers
 * - Regional number word variations
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
    [],
    [80n, 'quatre-vingts'],
    [],
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

  /**
   * Initializes the French converter with language-specific options.
   *
   * @param {FrenchOptions} [options={}] Configuration options.
   */
  constructor ({ withHyphenSeparator = false } = {}) {
    super()

    this.withHyphenSeparator = withHyphenSeparator

    if (this.withHyphenSeparator) {
      this.wordSeparator = '-'
    }
  }

  /**
   * Merges two adjacent word-number pairs according to French grammar rules.
   *
   * French-specific rules:
   * - Removes trailing 's' from multiples of 80 or 100 when followed by smaller numbers
   * - Adds 's' to hundreds when appropriate
   * - Uses "et" (and) when joining odd numbers to tens (e.g., "vingt et un")
   * - Hyphens for compound tens (e.g., "vingt-deux")
   *
   * @param {Object} currentPair The left operand as `{ word: number }`.
   * @param {Object} nextPair The right operand as `{ word: number }`.
   * @returns {Object} Merged pair with combined word and resulting number.
   */
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

/**
 * Converts a number to French cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {FrenchOptions} [options] Conversion options.
 * @returns {string} The number expressed in French words.
 * @throws {TypeError} If value is an invalid type.
 * @throws {Error} If value is NaN or an invalid number string.
 */
export default function convertToWords (value, options = {}) {
  return new French(options).convertToWords(value)
}
