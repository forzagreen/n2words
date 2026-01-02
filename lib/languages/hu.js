import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Hungarian language converter.
 *
 * Supports:
 * - Agglutinative structure (no spaces between compound parts)
 * - Special handling for "egy" (one) omission
 * - Pre-composed twenties (huszonegy through huszonkilenc)
 */
export class Hungarian extends GreedyScaleLanguage {
  negativeWord = 'mínusz'
  decimalSeparatorWord = 'egész'
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

  /** Converts tens (30-99) with agglutinative composition. */
  tensToCardinal (number) {
    // Expecting `number` as bigint when called from integerToWords
    if (this.wordForScale(number)) {
      return this.wordForScale(number)
    } else {
      const tens = number / 10n
      const units = number % 10n
      return this.wordForScale(tens * 10n) + this.integerToWords(units)
    }
  }

  /** Converts hundreds (100-999) with "száz" composition. */
  hundredsToCardinal (number) {
    const hundreds = number / 100n
    let prefix = 'száz'
    if (hundreds !== 1n) {
      prefix = this.integerToWords(hundreds, '') + prefix
    }
    const postfix = this.integerToWords(number % 100n, '')
    return prefix + postfix
  }

  /** Converts thousands (1000-999999) with "ezer" composition. */
  thousandsToCardinal (number) {
    const thousands = number / 1000n
    let prefix = 'ezer'
    if (thousands !== 1n) {
      prefix = this.integerToWords(thousands, '') + prefix
    }
    const postfix = this.integerToWords(number % 1000n, '')
    const middle = (number <= 2000n || postfix === '') ? '' : '-'
    return prefix + middle + postfix
  }

  /** Converts large numbers (millions and above) with scale words. */
  bigNumberToCardinal (number) {
    const numberLength = number.toString().length
    const digits = (numberLength % 3 === 0) ? numberLength - 2 : numberLength
    const exp = 10 ** (Math.floor(digits / 3) * 3)
    const prefix = this.integerToWords(number / BigInt(exp), '')
    const rest = this.integerToWords(number % BigInt(exp), '')
    const postfix = (rest === '') ? '' : ('-' + rest)
    return prefix + this.wordForScale(BigInt(exp)) + postfix
  }

  /** Converts integer part using Hungarian agglutinative rules. */
  integerToWords (integerPart, zeroWord = this.zeroWord) {
    let words = ''

    // Normalize to BigInt for consistent comparisons
    if (typeof integerPart !== 'bigint') integerPart = BigInt(integerPart)

    if (integerPart === 0n) {
      words = zeroWord
    } else if (zeroWord === '' && integerPart === 2n) {
      words = 'két'
    } else if (integerPart < 30n) {
      words = this.wordForScale(integerPart)
    } else if (integerPart < 100n) {
      words = this.tensToCardinal(integerPart)
    } else if (integerPart < 1000n) {
      words = this.hundredsToCardinal(integerPart)
    } else if (integerPart < 1_000_000n) {
      words = this.thousandsToCardinal(integerPart)
    } else {
      words = this.bigNumberToCardinal(integerPart)
    }

    return words
  }
}
