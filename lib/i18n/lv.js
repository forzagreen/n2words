import SlavicLanguage from '../classes/slavic-language.js'

/**
 * @typedef {Object} SlavicOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers.
 */

/**
 * Latvian language converter.
 *
 * Implements Latvian number words using the Slavic language pattern:
 * - Latvian number words (viens, divi, trīs, četri, pieci...)
 * - Latvian-specific pluralization patterns
 * - Baltic grammatical structure
 * - Simplified gender handling compared to Lithuanian
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic/Baltic languages
 *   * Form 1 (singular): 1 (e.g., "tūkstotis")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "tūkstoši")
 *   * Form 3 (many): all other numbers (e.g., "tūkstošu")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Features:
 * - Latvian diacritical marks (ī, ā, ē, ū, etc.)
 * - Three-form pluralization (adapted for Latvian)
 * - Baltic number naming conventions
 * - Compound number formation (divdesmit, trīsdesmit)
 *
 * Inherits from SlavicLanguage for pluralization algorithms.
 */
export class Latvian extends SlavicLanguage {
  negativeWord = 'mīnus'
  decimalSeparatorWord = 'komats'
  zeroWord = 'nulle'
  ones = {
    1: 'viens',
    2: 'divi',
    3: 'trīs',
    4: 'četri',
    5: 'pieci',
    6: 'seši',
    7: 'septiņi',
    8: 'astoņi',
    9: 'deviņi'
  }

  tens = {
    0: 'desmit',
    1: 'vienpadsmit',
    2: 'divpadsmit',
    3: 'trīspadsmit',
    4: 'četrpadsmit',
    5: 'piecpadsmit',
    6: 'sešpadsmit',
    7: 'septiņpadsmit',
    8: 'astoņpadsmit',
    9: 'deviņpadsmit'
  }

  twenties = {
    2: 'divdesmit',
    3: 'trīsdesmit',
    4: 'četrdesmit',
    5: 'piecdesmit',
    6: 'sešdesmit',
    7: 'septiņdesmit',
    8: 'astoņdesmit',
    9: 'deviņdesmit'
  }

  hundreds = ['simts', 'simti', 'simtu']

  thousands = {
    1: ['tūkstotis', 'tūkstoši', 'tūkstošu'],
    2: ['miljons', 'miljoni', 'miljonu'],
    3: ['miljards', 'miljardi', 'miljardu'],
    4: ['triljons', 'triljoni', 'triljonu'],
    5: ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
    6: ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
    7: ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
    8: ['septiljons', 'septiljoni', 'septiljonu'],
    9: ['oktiljons', 'oktiljoni', 'oktiljonu'],
    10: ['nontiljons', 'nontiljoni', 'nontiljonu']
  }

  pluralize (n, forms) {
    if (n === 0n) {
      return forms[2]
    }

    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if (lastDigit === 1n && lastTwoDigits !== 11n) {
      return forms[0]
    }

    return forms[1]
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
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
        if (n3 === 1n && n2 === 0n && n1 > 0n) {
          words.push(this.hundreds[2])
        } else if (n3 > 1n) {
          words.push(this.ones[n3], this.hundreds[1])
        } else {
          words.push(this.hundreds[0])
        }
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
 * Converts a number to Latvian cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @param {boolean} [options.feminine=false] Use feminine forms for numbers.
 * @returns {string} The number expressed in Latvian words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 */
export default function convertToWords (value, options = {}) {
  return new Latvian(options).convertToWords(value)
}
