import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Czech language converter.
 *
 * Implements Czech number words using the Slavic language pattern:
 * - Czech number words (jedna, dva, tři, čtyři, pět...)
 * - Slavic three-form pluralization (tisíc/tisíce/tisíc)
 * - Gender agreement for numbers 1-2
 * - Czech-specific number word endings
 *
 * Inherits from SlavicLanguage:
 * - Complex pluralization rules (one/few/many forms)
 * - Group-based large number handling
 * - Proper declension patterns
 */
export class CZ extends SlavicLanguage {
  ones = {
    1: 'jedna',
    2: 'dva',
    3: 'tři',
    4: 'čtyři',
    5: 'pět',
    6: 'šest',
    7: 'sedm',
    8: 'osm',
    9: 'devět'
  }

  tens = {
    0: 'deset',
    1: 'jedenáct',
    2: 'dvanáct',
    3: 'třináct',
    4: 'čtrnáct',
    5: 'patnáct',
    6: 'šestnáct',
    7: 'sedmnáct',
    8: 'osmnáct',
    9: 'devatenáct'
  }

  twenties = {
    2: 'dvacet',
    3: 'třicet',
    4: 'čtyřicet',
    5: 'padesát',
    6: 'šedesát',
    7: 'sedmdesát',
    8: 'osmdesát',
    9: 'devadesát'
  }

  hundreds = {
    1: 'sto',
    2: 'dvě stě',
    3: 'tři sta',
    4: 'čtyři sta',
    5: 'pět set',
    6: 'šest set',
    7: 'sedm set',
    8: 'osm set',
    9: 'devět set'
  }

  thousands = {
    1: ['tisíc', 'tisíce', 'tisíc'], // 10^ 3
    2: ['milion', 'miliony', 'milionů'], // 10^ 6
    3: ['miliarda', 'miliardy', 'miliard'], // 10^ 9
    4: ['bilion', 'biliony', 'bilionů'], // 10^ 12
    5: ['biliarda', 'biliardy', 'biliard'], // 10^ 15
    6: ['trilion', 'triliony', 'trilionů'], // 10^ 18
    7: ['triliarda', 'triliardy', 'triliard'], // 10^ 21
    8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^ 24
    9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'], // 10^ 27
    10: ['quintillion', 'quintilliony', 'quintillionů'] // 10^ 30
  }

  constructor (options) {
    options = Object.assign({
      negativeWord: 'mínus',
      zero: 'nula'
    }, options)

    super(options)
  }

  get separatorWord () {
    if (this.wholeNumber === 0n || this.wholeNumber === 1n) {
      return 'celá'
    } else if (this.wholeNumber >= 2n && this.wholeNumber <= 4n) {
      return 'celé'
    } else {
      return 'celých'
    }
  }

  pluralize (n, forms) {
    let form = 2
    if (n === 1n) {
      form = 0
    } else if (((n % 10n < 5n) && (n % 10n > 1n)) && (n % 100n < 10n || n % 100n > 20n)) {
      form = 1
    }
    return forms[form]
  }

  toCardinal (number) {
    if (number === 0n) {
      return this.zero
    }
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index = index - 1
      if (x === 0n) {
        continue
      }
      const [n1, n2, n3] = this.getDigits(x)
      if (n3 > 0n) {
        words.push(this.hundreds[n3])
      }
      if (n2 > 1n) {
        words.push(this.twenties[n2])
      }
      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0n && !(index > 0 && x === 1n)) {
        words.push(this.ones[n1])
      }
      if (index > 0) {
        words.push(this.pluralize(x, this.thousands[index]))
      }
    }
    return words.join(' ')
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
  return new CZ(options).floatToCardinal(value)
}
