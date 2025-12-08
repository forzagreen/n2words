import CardMatchLanguage from '../classes/card-match-language.js'

/**
 * French language converter.
 *
 * Supports both standard French (FR) and Belgian French (BE) variants:
 * - FR: Uses soixante, quatre-vingts, quatre-vingt-dix
 * - BE: Uses septante, nonante (more regular numbering system)
 *
 * Special handling:
 * - Pluralization of "cent" (hundred) and other words
 * - "et" (and) before odd numbers in tens place
 * - Hyphenation for compound numbers
 * - Regional number word variations
 */
export class FR extends CardMatchLanguage {
  /**
   * Initializes the French converter with language-specific options.
   *
   * Supports both standard French (FR) and Belgian French (BE) variants:
   * - FR (standard): Uses "soixante" (60), "quatre-vingts" (80), "quatre-vingt-dix" (90)
   * - BE (Belgian): Uses "septante" (70), "nonante" (90) - more regular numbering
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='moins'] Word for negative numbers.
   * @param {string} [options.separatorWord='virgule'] Word separating whole and decimal parts (comma).
   * @param {string} [options.zero='zéro'] Word for 0.
   * @param {string} [options._region='FR'] Region variant: 'FR' (standard) or 'BE' (Belgian).
   * @param {boolean} [options.withHyphenSeparator=false] Use hyphens (true) instead of spaces (false) in compounds.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'moins',
      separatorWord: 'virgule',
      zero: 'zéro',
      _region: 'FR',
      withHyphenSeparator: false,
      spaceSeparator: (options.withHyphenSeparator === true ? '-' : ' ')
    }, options)

    super(options, [
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
      ...(['BE'].includes(options._region) ? [[90n, 'nonante']] : []),
      [80n, 'quatre-vingts'],
      ...(['BE'].includes(options._region) ? [[70n, 'septante']] : []),
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
    ])
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
  merge (currentPair, nextPair) {
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
        return { [`${currentWord}${this.spaceSeparator}et${this.spaceSeparator}${nextWord}`]: currentNumber + nextNumber }
      }
      return { [`${currentWord}-${nextWord}`]: currentNumber + nextNumber }
    }

    if (nextNumber > currentNumber) return { [`${currentWord}${this.spaceSeparator}${nextWord}`]: currentNumber * nextNumber }
    return { [`${currentWord}${this.spaceSeparator}${nextWord}`]: currentNumber + nextNumber }
  }
}

/**
 * Converts a number to French cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see FR class).
 * @returns {string} The number expressed in French words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'fr' }); // 'quarante-deux'
 * floatToCardinal(81, { lang: 'fr' }); // 'quatre-vingt-un'
 */
export default function floatToCardinal (value, options = {}) {
  return new FR(options).floatToCardinal(value)
}
