import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

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
export class Hungarian extends GreedyScaleLanguage {
  negativeWord = 'mínusz'

  separatorWord = 'egész'

  zeroWord = 'nulla'

  scaleWords = [
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
  ]

  tensToCardinal (number) {
    // Expecting `number` as bigint when called from toCardinalWords
    if (this.getScaleWord(number)) {
      return this.getScaleWord(number)
    } else {
      const tens = number / 10n
      const units = number % 10n
      return this.getScaleWord(tens * 10n) + this.toCardinalWords(units)
    }
  }

  hundredsToCardinal (number) {
    const hundreds = number / 100n
    let prefix = 'száz'
    if (hundreds !== 1n) {
      prefix = this.toCardinalWords(hundreds, '') + prefix
    }
    const postfix = this.toCardinalWords(number % 100n, '')
    return prefix + postfix
  }

  thousandsToCardinal (number) {
    const thousands = number / 1000n
    let prefix = 'ezer'
    if (thousands !== 1n) {
      prefix = this.toCardinalWords(thousands, '') + prefix
    }
    const postfix = this.toCardinalWords(number % 1000n, '')
    const middle = (number <= 2000n || postfix === '') ? '' : '-'
    return prefix + middle + postfix
  }

  bigNumberToCardinal (number) {
    const numberLength = number.toString().length
    const digits = (numberLength % 3 === 0) ? numberLength - 2 : numberLength
    const exp = 10 ** (Math.floor(digits / 3) * 3)
    const prefix = this.toCardinalWords(number / BigInt(exp), '')
    const rest = this.toCardinalWords(number % BigInt(exp), '')
    const postfix = (rest === '') ? '' : ('-' + rest)
    return prefix + this.getScaleWord(BigInt(exp)) + postfix
  }

  toCardinalWords (number, zero = this.zeroWord) {
    let words = ''

    // Normalize to BigInt for consistent comparisons
    if (typeof number !== 'bigint') number = BigInt(number)

    if (number === 0n) {
      words = zero
    } else if (zero === '' && number === 2n) {
      words = 'két'
    } else if (number < 30n) {
      words = this.getScaleWord(number)
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
 * Converts a number to Hungarian cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see Hungarian class options).
 * @returns {string} The number expressed in Hungarian words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42); // 'negyvenkettő'
 * floatToCardinal(21); // 'huszonegy'
 */
export default function floatToCardinal (value, options = {}) {
  return new Hungarian(options).floatToCardinal(value)
}
