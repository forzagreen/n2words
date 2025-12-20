import SlavicLanguage from '../classes/slavic-language.js'

/**
 * @typedef {Object} SlavicOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers.
 */

/**
 * Serbian language converter.
 *
 * Implements Serbian number words using the Slavic language pattern:
 * - Serbian number words (jedan/jedna, dva/dve, tri, četiri...)
 * - Gender-aware forms (masculine/feminine)
 * - Slavic three-form pluralization (hiljada/hiljade/hiljada)
 * - Latin script representation
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "hiljada")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "hiljade")
 *   * Form 3 (many): all other numbers (e.g., "hiljada")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via SCALE[] array with indexed [singular, few, many] forms
 * - Gender-specific number forms for 1 and 2 (masculine/feminine dual forms)
 *
 * Features:
 * - Dual gender forms for 1 and 2 (jedan/jedna, dva/dve)
 * - Similar structure to Croatian with different orthography
 * - Latin script (Serbian can use both Latin and Cyrillic)
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class Serbian extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'zapeta'
  zeroWord = 'nula'
  ones = {
    1: ['jedan', 'jedna'],
    2: ['dva', 'dve'],
    3: ['tri', 'tri'],
    4: ['četiri', 'četiri'],
    5: ['pet', 'pet'],
    6: ['šest', 'šest'],
    7: ['sedam', 'sedam'],
    8: ['osam', 'osam'],
    9: ['devet', 'devet']
  }

  tens = {
    0: 'deset',
    1: 'jedanaest',
    2: 'dvanaest',
    3: 'trinaest',
    4: 'četrnaest',
    5: 'petnaest',
    6: 'šesnaest',
    7: 'sedamnaest',
    8: 'osamnaest',
    9: 'devetnaest'
  }

  twenties = {
    2: 'dvadeset',
    3: 'trideset',
    4: 'četrdeset',
    5: 'pedeset',
    6: 'šezdeset',
    7: 'sedamdeset',
    8: 'osamdeset',
    9: 'devedeset'
  }

  hundreds = {
    1: 'sto',
    2: 'dvesta',
    3: 'trista',
    4: 'četiristo',
    5: 'petsto',
    6: 'šesto',
    7: 'sedamsto',
    8: 'osamsto',
    9: 'devetsto'
  }

  SCALE = [
    ['', '', '', false],
    ['hiljada', 'hiljade', 'hiljada', true], // 10 ^ 3
    ['milion', 'miliona', 'miliona', false], // 10 ^ 6
    ['milijarda', 'milijarde', 'milijarda', false], // 10 ^ 9
    ['bilion', 'biliona', 'biliona', false], // 10 ^ 12
    ['bilijarda', 'bilijarde', 'bilijarda', false], // 10 ^ 15
    ['trilion', 'triliona', 'triliona', false], // 10 ^ 18
    ['trilijarda', 'trilijarde', 'trilijarda', false], // 10 ^ 21
    ['kvadrilion', 'kvadriliona', 'kvadriliona', false], // 10 ^ 24
    ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda', false], // 10 ^ 27
    ['kvintilion', 'kvintiliona', 'kvintiliona', false] // 10 ^ 30
  ]

  pluralize (n, forms) {
    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit === 1n) {
      return forms[0]
    }

    if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit > 1n && lastDigit < 5n) {
      return forms[1]
    }

    return forms[2]
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
      // if (x === 0n) { continue; }
      const [n1, n2, n3] = this.getDigits(x)
      if (n3 > 0) {
        words.push(this.hundreds[n3])
      }
      if (n2 > 1) {
        words.push(this.twenties[n2])
      }
      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0) {
        const isFeminine = (this.feminine || this.SCALE[index][3])
        const genderIndex = isFeminine ? 1 : 0
        words.push(this.ones[n1][genderIndex])
      }
      if ((index > 0) && (x !== 0n)) {
        words.push(this.pluralize(x, this.SCALE[index]))
      }
    }
    return words.join(' ')
  }
}

/**
 * Converts a number to Serbian cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @param {boolean} [options.feminine=false] Use feminine forms for numbers.
 * @returns {string} The number expressed in Serbian words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 */
export default function convertToWords (value, options = {}) {
  return new Serbian(options).convertToWords(value)
}
