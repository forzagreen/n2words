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
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "tysiąc")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "tysiące")
 *   * Form 3 (many): all other numbers (e.g., "tysięcy")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Features:
 * - Polish diacritical marks (ą, ć, ę, ł, ń, ś, ź, ż)
 * - Gender and case agreement
 * - Polish-specific number word endings
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class Polish extends SlavicLanguage {
  negativeWord = 'minus'

  decimalSeparatorWord = 'przecinek'

  zeroWord = 'zero'

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
    9: 'dziewięćdziesiąt'
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

  /**
   * Implements Polish-specific three-form pluralization rules.
   *
   * Polish three-form system:
   * - Form 1 (singular): exactly n=1 (e.g., "tysiąc")
   * - Form 2 (few): n ends in 2-4, excluding teens (22-24, 32-34...) (e.g., "tysiące")
   * - Form 3 (many): all other numbers (e.g., "tysięcy")
   *
   * @param {bigint} n The number to classify.
   * @param {Array<string>} forms Array of [singular, few, many] word forms.
   * @returns {string} The appropriate form for the number n.
   */
  pluralize (n, forms) {
    if (n === 1n) {
      return forms[0]
    }

    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if (lastDigit < 5n && lastDigit > 1n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
      return forms[1]
    }

    return forms[2]
  }

  /**
   * Converts a whole number to Polish cardinal form.
   *
   * Algorithm (chunk-based decomposition):
   * 1. Split number into chunks of 3 digits (right-to-left): ones, thousands, millions, etc.
   * 2. For each non-zero chunk:
   *    a. Extract hundreds digit (n3), tens digit (n2), ones digit (n1)
   *    b. Add hundreds word (e.g., "sto", "dwieście")
   *    c. Add tens/ones (handles teens 10-19 separately from compound tens)
   *    d. Add pluralized magnitude word (e.g., "tysiące", "miliony")
   * 3. Join all words with spaces
   *
   * Example: 1234 → chunks [1, 234] → "jeden tysiąc dwieście trzydzieści cztery"
   *   - Chunk 1 (index=1, thousands): "jeden" + "tysiąc"
   *   - Chunk 234 (index=0): "dwieście" + "trzydzieści" + "cztery"
   *
   * Special case: When chunk=1 at thousands+ levels, omit the ones word to avoid
   * redundancy with the pluralized magnitude (e.g., just "tysiąc" not "jeden tysiąc").
   *
   * @param {bigint} number The whole number to convert.
   * @returns {string} The number expressed in Polish words.
   */
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
export default function convertToWords (value, options = {}) {
  return new Polish(options).convertToWords(value)
}


