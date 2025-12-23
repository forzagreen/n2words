import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * @typedef {Object} SpanishOptions
 * @property {string} [genderStem='o'] Masculine 'o' or feminine 'a' ending.
 */

/**
 * Spanish language converter.
 *
 * Handles Spanish grammatical features:
 * - Gender agreement for numbers (masculine by default, feminine via `genderStem`)
 * - "y" (and) between tens and units (e.g., "veinte y uno")
 * - Special forms for hundreds (e.g., "cien", "ciento", "doscientos")
 * - Million pluralization
 */
export class Spanish extends GreedyScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'punto'
  zeroWord = 'cero'

  scaleWordPairs = [
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
  ]

  /**
   * Initializes the Spanish converter.
   *
   * @param {SpanishOptions} [options={}] Configuration options.
   */
  constructor (options = {}) {
    super(options)

    this.options = {
      ...{
        genderStem: 'o'
      },
      ...options
    }

    // Apply gender agreement to scale word pairs if feminine
    if (options.genderStem === 'a') {
      this.scaleWordPairs = this.scaleWordPairs.map(([value, word]) => {
        if (word === 'veintiuno') return [value, 'veintiuna']
        if (word === 'uno') return [value, 'una']
        return [value, word]
      })
    }
  }

  /**
   * Merges two adjacent word-number pairs according to Spanish grammar rules.
   *
   * Spanish-specific rules:
   * - Implicit "uno": `mergeScales({ 'uno': 1n }, { 'mil': 1000n })` → `{ 'mil': 1000n }`
   * - "y" (and) between tens and units: `mergeScales({ 'veinte': 20n }, { 'uno': 1n })` → `{ 'veinte y uno': 21n }`
   * - Gender agreement for hundreds: "cien" + suffix based on genderStem
   * - Special forms for hundreds (cien/ciento/quinientos/setecientos/novecientos)
   * - Million pluralization when coefficient > 1: "millones" instead of "millón"
   *
   * @param {Object} currentPair The left operand as `{ word: BigInt }`.
   * @param {Object} nextPair The right operand as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * mergeScales({ 'uno': 1n }, { 'mil': 1000n }); // { 'mil': 1000n }
   * mergeScales({ 'veinte': 20n }, { 'tres': 3n }); // { 'veinte y tres': 23n }
   */
  mergeScales (currentPair, nextPair) {
    let currentWord = Object.keys(currentPair)[0]
    let nextWord = Object.keys(nextPair)[0]
    const currentNumber = Object.values(currentPair)[0]
    const nextNumber = Object.values(nextPair)[0]

    if (currentNumber === 1n) {
      if (nextNumber < 1_000_000n) return nextPair
      currentWord = 'un'
    } else if (currentNumber === 100n && nextNumber % 1000n !== 0n) {
      currentWord += 't' + this.options.genderStem
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
      nextWord += 't' + this.options.genderStem + 's'
    } else {
      nextWord = ' ' + nextWord
    }

    return { [`${currentWord}${nextWord}`]: currentNumber * nextNumber }
  }
}
