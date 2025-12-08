import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Polish language converter.
 *
 * Implements Polish number words using the Slavic language pattern:
 * - Polish number words (jeden, dwa, trzy, cztery, pięć...)
 * - Complex Slavic three-form pluralization (tysiąc/tysiące/tysięcy)
 * - Polish-specific declension patterns
 * - Distinctive Polish phonology and orthography
 *
 * Features:
 * - Polish diacritical marks (ą, ć, ę, ł, ń, ś, ź, ż)
 * - Gender and case agreement
 * - Polish-specific number word endings
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class PL extends SlavicLanguage {
  ones = {
    1: 'jeden',
    2: 'dwa',
    3: 'trzy',
    4: 'cztery',
    5: 'pięć',
    6: 'sześć',
    7: 'siedem',
    8: 'osiem',
    9: 'dziewięć'
  }

  tens = {
    0: 'dziesięć',
    1: 'jedenaście',
    2: 'dwanaście',
    3: 'trzynaście',
    4: 'czternaście',
    5: 'piętnaście',
    6: 'szesnaście',
    7: 'siedemnaście',
    8: 'osiemnaście',
    9: 'dziewiętnaście'
  }

  twenties = {
    2: 'dwadzieścia',
    3: 'trzydzieści',
    4: 'czterdzieści',
    5: 'pięćdziesiąt',
    6: 'sześćdziesiąt',
    7: 'siedemdziesiąt',
    8: 'osiemdziesiąt',
    9: 'dziewięćdzisiąt'
  }

  hundreds = {
    1: 'sto',
    2: 'dwieście',
    3: 'trzysta',
    4: 'czterysta',
    5: 'pięćset',
    6: 'sześćset',
    7: 'siedemset',
    8: 'osiemset',
    9: 'dziewięćset'
  }

  thousands = {
    1: ['tysiąc', 'tysiące', 'tysięcy'], // 10^ 3
    2: ['milion', 'miliony', 'milionów'], // 10^ 6
    3: ['miliard', 'miliardy', 'miliardów'], // 10^ 9
    4: ['bilion', 'biliony', 'bilionów'], // 10^ 12
    5: ['biliard', 'biliardy', 'biliardów'], // 10^ 15
    6: ['trylion', 'tryliony', 'trylionów'], // 10^ 18
    7: ['tryliard', 'tryliardy', 'tryliardów'], // 10^ 21
    8: ['kwadrylion', 'kwadryliony', 'kwadrylionów'], // 10^ 24
    9: ['kwaryliard', 'kwadryliardy', 'kwadryliardów'], // 10^ 27
    10: ['kwintylion', 'kwintyliony', 'kwintylionów'] // 10^ 30
  }

  constructor (options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'przecinek',
      zero: 'zero'
    }, options)

    super(options)
  }

  pluralize (n, forms) {
    let form = 2
    if (n === 1n) {
      form = 0
    } else if ((n % 10n < 5n) && (n % 10n > 1n) && ((n % 100n < 10n) || (n % 100n > 20n))) {
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
  return new PL(options).floatToCardinal(value)
}
