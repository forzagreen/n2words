import CardMatchLanguage from '../classes/card-match-language.js'

/**
 * Spanish language converter.
 *
 * Handles Spanish grammatical features:
 * - Gender agreement for numbers (masculine by default, feminine via `genderStem`)
 * - "y" (and) between tens and units (e.g., "veinte y uno")
 * - Special forms for hundreds (e.g., "cien", "ciento", "doscientos")
 * - Million pluralization
 */
export class ES extends CardMatchLanguage {
  genderStem

  /**
   * Initializes the Spanish converter.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='menos'] Word for negative numbers.
   * @param {string} [options.separatorWord='punto'] Word separating whole and decimal parts.
   * @param {string} [options.zero='cero'] Word for 0.
   * @param {string} [options.genderStem='o'] Masculine 'o' or feminine 'a' ending.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'menos',
      separatorWord: 'punto',
      zero: 'cero',
      genderStem: 'o'
    }, options)

    super(options, [
      [1_000_000_000_000_000_000_000_000n, 'cuatrillón'],
      [1_000_000_000_000_000_000n, 'trillón'],
      [1_000_000_000_000n, 'billón'],
      [1_000_000n, 'millón'],
      [1000n, 'mil'],
      [100n, 'cien'],
      [90n, 'noventa'],
      [80n, 'ochenta'],
      [70n, 'setenta'],
      [60n, 'sesenta'],
      [50n, 'cincuenta'],
      [40n, 'cuarenta'],
      [30n, 'treinta'],
      [29n, 'veintinueve'],
      [28n, 'veintiocho'],
      [27n, 'veintisiete'],
      [26n, 'veintiséis'],
      [25n, 'veinticinco'],
      [24n, 'veinticuatro'],
      [23n, 'veintitrés'],
      [22n, 'veintidós'],
      [21n, 'veintiuno'],
      [20n, 'veinte'],
      [19n, 'diecinueve'],
      [18n, 'dieciocho'],
      [17n, 'diecisiete'],
      [16n, 'dieciseis'],
      [15n, 'quince'],
      [14n, 'catorce'],
      [13n, 'trece'],
      [12n, 'doce'],
      [11n, 'once'],
      [10n, 'diez'],
      [9n, 'nueve'],
      [8n, 'ocho'],
      [7n, 'siete'],
      [6n, 'seis'],
      [5n, 'cinco'],
      [4n, 'cuatro'],
      [3n, 'tres'],
      [2n, 'dos'],
      [1n, 'uno'],
      [0n, 'cero']
    ])

    this.genderStem = options.genderStem
  }

  /**
   * Merges two adjacent word-number pairs according to Spanish grammar rules.
   *
   * Spanish-specific rules:
   * - "y" (and) between tens and units (e.g., "veinte y uno")
   * - Gender agreement for multiples of 100
   * - Special forms for hundreds (cien/ciento/doscientos/etc.)
   * - Million pluralization when coefficient > 1
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
      if (nextNumber < 1_000_000n) return nextPair
      currentWord = 'un'
    } else if (currentNumber === 100n && nextNumber % 1000n !== 0n) {
      currentWord += 't' + this.genderStem
    }

    if (nextNumber < currentNumber) {
      if (currentNumber < 100n) {
        return { [`${currentWord} y ${nextWord}`]: currentNumber + nextNumber }
      }
      return { [`${currentWord} ${nextWord}`]: currentNumber + nextNumber }
    }

    if (nextNumber % 1_000_000n === 0n && currentNumber > 1n) {
      nextWord = nextWord.slice(0, -3) + 'lones'
    }

    if (nextNumber === 100n) {
      if (currentNumber === 5n) {
        currentWord = 'quinien'
        nextWord = ''
      } else if (currentNumber === 7n) {
        currentWord = 'sete'
      } else if (currentNumber === 9n) {
        currentWord = 'nove'
      }
      nextWord += 't' + this.genderStem + 's'
    } else {
      nextWord = ' ' + nextWord
    }

    return { [`${currentWord}${nextWord}`]: currentNumber * nextNumber }
  }
}

/**
 * Converts a number to Spanish cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see ES class).
 * @returns {string} The number expressed in Spanish words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'es' }); // 'cuarenta y dos'
 * floatToCardinal(100, { lang: 'es' }); // 'cien'
 */
export default function floatToCardinal (value, options = {}) {
  return new ES(options).floatToCardinal(value)
}
