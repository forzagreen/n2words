import SlavicLanguage from '../classes/slavic-language.js'

/**
 * @typedef {Object} CzechOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers.
 */

/**
 * Czech language converter.
 *
 * Implements Czech number words using the Slavic language pattern:
 * - Czech number words (jedna, dva, tři, čtyři, pět...)
 * - Slavic three-form pluralization (tisíc/tisíce/tisíc)
 * - Gender agreement for numbers 1-2
 * - Czech-specific number word endings
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "tisíc")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "tisíce")
 *   * Form 3 (many): all other numbers (e.g., "tisíc")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Inherits from SlavicLanguage:
 * - Complex pluralization rules (one/few/many forms)
 * - Group-based large number handling (chunk decomposition via splitByX())
 * - Proper declension patterns via pluralize() method
 */
export class Czech extends SlavicLanguage {
  negativeWord = 'mínus'
  zeroWord = 'nula'
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

  /**
   * Returns the Czech word for the decimal separator based on the whole number.
   *
   * @returns {string} The Czech word for the decimal separator.
   */
  get decimalSeparatorWord () {
    if (this.cachedWholeNumber === 0n || this.cachedWholeNumber === 1n) {
      return 'celá'
    } else if (this.cachedWholeNumber >= 2n && this.cachedWholeNumber <= 4n) {
      return 'celé'
    } else {
      return 'celých'
    }
  }

  /**
   * Initializes the Czech converter with language-specific options.
   *
   * @param {SlavicOptions} [options={}] Configuration options (inherited from SlavicLanguage).
   */
  constructor (options = {}) {
    super(options)

    // Remove the inherited decimalSeparatorWord property so our getter works
    delete this.decimalSeparatorWord
  }

  /**
   * Implements Czech-specific three-form pluralization rules.
   *
   * Czech three-form system:
   * - Form 1 (singular): exactly n=1 (e.g., "tisíc")
   * - Form 2 (few): n ends in 2-4, excluding teens (22-24, 32-34...) (e.g., "tisíce")
   * - Form 3 (many): all other numbers (e.g., "tisíc" for 0, 5+)
   *
   * @param {bigint} n The number to classify.
   * @param {Array<string>} forms Array of [singular, few, many] word forms.
   * @returns {string} The appropriate form for the number n.
   */
  pluralize (n, forms) {
    if (n === 1n) {
      return forms[0]
    }

    // Check if n is in the "few" form range (2-4, 22-24, 32-34, etc., excluding teens)
    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if (lastDigit > 1n && lastDigit < 5n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
      return forms[1]
    }

    return forms[2]
  }

  /**
   * Converts a whole number to Czech cardinal form.
   *
   * Algorithm (chunk-based decomposition):
   * 1. Split number into chunks of 3 digits (right-to-left): ones, thousands, millions, etc.
   * 2. For each non-zero chunk:
   *    a. Extract hundreds digit (n3), tens digit (n2), ones digit (n1)
   *    b. Add hundreds word (e.g., "sto", "dvě stě")
   *    c. Add tens/ones (handles teens 10-19 separately from compound tens)
   *    d. Add pluralized magnitude word (e.g., "tisíce", "miliony")
   * 3. Join all words with spaces
   *
   * Example: 1234 → chunks [1, 234] → "jeden tisíc dvěstěčtyřicet"
   *   - Chunk 1 (index=1, thousands): "jeden" + "tisíc"
   *   - Chunk 234 (index=0): "dvě stě" + "třicet" + "čtyři"
   *
   * Special case: When chunk=1 at thousands+ levels, omit the ones word to avoid
   * redundancy with the pluralized magnitude (e.g., just "tisíc" not "jeden tisíc").
   *
   * @param {bigint} number The whole number to convert.
   * @returns {string} The number expressed in Czech words.
   */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index--
      if (x === 0n) continue
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
 * Converts a number to Czech cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {SlavicOptions} [options={}] Configuration options.
 * @returns {string} The number expressed in Czech words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 */
export default function convertToWords (value, options = {}) {
  return new Czech(options).convertToWords(value)
}
