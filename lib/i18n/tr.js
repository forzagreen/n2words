import TurkicLanguage from '../classes/turkic-language.js'

/**
 * Turkish language converter.
 *
 * Inherits from TurkicLanguage shared patterns:
 * - Space-separated number combinations
 * - Omits '1' before hundreds and thousands
 * - Optional word spacing (dropSpaces option)
 * - Supports 'ş', 'ç', 'ğ', 'ı', 'ü', 'ö' characters
 */
export class Turkish extends TurkicLanguage {
  negativeWord = 'eksi'

  decimalSeparatorWord = 'virgül'

  zeroWord = 'sıfır'

  wordSeparator = ' '

  scaleWordPairs = [
    [1_000_000_000_000_000_000n, 'kentilyon'],
    [1_000_000_000_000_000n, 'katrilyon'],
    [1_000_000_000_000n, 'trilyon'],
    [1_000_000_000n, 'milyar'],
    [1_000_000n, 'milyon'],
    [1000n, 'bin'],
    [100n, 'yüz'],
    [90n, 'doksan'],
    [80n, 'seksen'],
    [70n, 'yetmiş'],
    [60n, 'altmış'],
    [50n, 'elli'],
    [40n, 'kırk'],
    [30n, 'otuz'],
    [20n, 'yirmi'],
    [10n, 'on'],
    [9n, 'dokuz'],
    [8n, 'sekiz'],
    [7n, 'yedi'],
    [6n, 'altı'],
    [5n, 'beş'],
    [4n, 'dört'],
    [3n, 'üç'],
    [2n, 'iki'],
    [1n, 'bir'],
    [0n, 'sıfır']
  ]

  /**
   * Initializes the Turkish converter with language-specific options.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.dropSpaces=false] Remove spaces between words if true.
   */
  constructor ({ dropSpaces = false } = {}) {
    super()

    this.dropSpaces = dropSpaces

    if (this.dropSpaces === true) {
      this.wordSeparator = ''
    }
  }
}

/**
 * Converts a number to Turkish cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see TR class).
 * @param {boolean} [options.dropSpaces=false] Remove spaces between words if true.
 * @returns {string} The number expressed in Turkish words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * convertToWords(42, { lang: 'tr' }); // 'kırk iki'
 * convertToWords(42, { lang: 'tr', dropSpaces: true }); // 'kırkiki'
 */
export default function convertToWords (value, options = {}) {
  return new Turkish(options).convertToWords(value)
}



