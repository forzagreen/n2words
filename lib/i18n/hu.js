import BaseLanguage from '../classes/base-language.js'

/**
 * Hungarian language converter.
 *
 * Converts numbers to Hungarian words following Hungarian conventions:
 * - Agglutinative structure for compound numbers
 * - No spaces between tens and units (e.g., "huszonegy" = twenty-one)
 * - Special handling for "egy" (one) - often omitted as multiplier
 * - Vowel harmony in compound words
 *
 * Features:
 * - Compact number representations (húsz, harminc, negyven)
 * - Pre-composed twenties (huszonegy through huszonkilenc)
 * - "egész" as decimal separator (meaning "whole")
 * - Support for very large numbers (up to quadrilliards)
 */
export class HU extends BaseLanguage {
  /**
   * Initializes the Hungarian converter with language-specific options.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='mínusz'] Word for negative numbers (minus).
   * @param {string} [options.separatorWord='egész'] Word separating whole and decimal parts (whole).
   * @param {string} [options.zero='nulla'] Word for the digit 0.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'mínusz',
      separatorWord: 'egész',
      zero: 'nulla'
    }, options)

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'quadrilliárd'],
      [1_000_000_000_000_000_000_000_000n, 'quadrillió'],
      [1_000_000_000_000_000_000_000n, 'trilliárd'],
      [1_000_000_000_000_000_000n, 'trillió'],
      [1_000_000_000_000_000n, 'billiárd'],
      [1_000_000_000_000n, 'billió'],
      [1_000_000_000n, 'milliárd'],
      [1_000_000n, 'millió'],
      [1000n, 'ezer'],
      [100n, 'száz'],
      [90n, 'kilencven'],
      [80n, 'nyolcvan'],
      [70n, 'hetven'],
      [60n, 'hatvan'],
      [50n, 'ötven'],
      [40n, 'negyven'],
      [30n, 'harminc'],
      [29n, 'huszonkilenc'],
      [28n, 'huszonnyolc'],
      [27n, 'huszonhét'],
      [26n, 'huszonhat'],
      [25n, 'huszonöt'],
      [24n, 'huszonnégy'],
      [23n, 'huszonhárom'],
      [22n, 'huszonkettő'],
      [21n, 'huszonegy'],
      [20n, 'húsz'],
      [19n, 'tizenkilenc'],
      [18n, 'tizennyolc'],
      [17n, 'tizenhét'],
      [16n, 'tizenhat'],
      [15n, 'tizenöt'],
      [14n, 'tizennégy'],
      [13n, 'tizenhárom'],
      [12n, 'tizenkettő'],
      [11n, 'tizenegy'],
      [10n, 'tíz'],
      [9n, 'kilenc'],
      [8n, 'nyolc'],
      [7n, 'hét'],
      [6n, 'hat'],
      [5n, 'öt'],
      [4n, 'négy'],
      [3n, 'három'],
      [2n, 'kettő'],
      [1n, 'egy'],
      [0n, 'nulla']
    ])
  }

  tensToCardinal (number) {
    // Expecting `number` as bigint when called from toCardinal
    if (this.getCardWord(number)) {
      return this.getCardWord(number)
    } else {
      const tens = number / 10n
      const units = number % 10n
      return this.getCardWord(tens * 10n) + this.toCardinal(units)
    }
  }

  hundredsToCardinal (number) {
    const hundreds = number / 100n
    let prefix = 'száz'
    if (hundreds !== 1n) {
      prefix = this.toCardinal(hundreds, '') + prefix
    }
    const postfix = this.toCardinal(number % 100n, '')
    return prefix + postfix
  }

  thousandsToCardinal (number) {
    const thousands = number / 1000n
    let prefix = 'ezer'
    if (thousands !== 1n) {
      prefix = this.toCardinal(thousands, '') + prefix
    }
    const postfix = this.toCardinal(number % 1000n, '')
    const middle = (number <= 2000n || postfix === '') ? '' : '-'
    return prefix + middle + postfix
  }

  bigNumberToCardinal (number) {
    const numberLength = number.toString().length
    const digits = (numberLength % 3 === 0) ? numberLength - 2 : numberLength
    const exp = 10 ** (Math.floor(digits / 3) * 3)
    const prefix = this.toCardinal(number / BigInt(exp), '')
    const rest = this.toCardinal(number % BigInt(exp), '')
    const postfix = (rest === '') ? '' : ('-' + rest)
    return prefix + this.getCardWord(BigInt(exp)) + postfix
  }

  toCardinal (number, zero = this.zero) {
    let words = ''

    // Normalize to BigInt for consistent comparisons
    if (typeof number !== 'bigint') number = BigInt(number)

    if (number === 0n) {
      words = zero
    } else if (zero === '' && number === 2n) {
      words = 'két'
    } else if (number < 30n) {
      words = this.getCardWord(number)
    } else if (number < 100n) {
      words = this.tensToCardinal(number)
    } else if (number < 1000n) {
      words = this.hundredsToCardinal(number)
    } else if (number < 1_000_000n) {
      words = this.thousandsToCardinal(number)
    } else {
      words = this.bigNumberToCardinal(number)
    }

    return words
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new HU(options).floatToCardinal(value)
}
