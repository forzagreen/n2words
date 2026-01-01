import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Czech language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Dynamic decimal separator (celá/celé/celých)
 * - Gender agreement in number words
 */
export class Czech extends SlavicLanguage {
  negativeWord = 'mínus'
  zeroWord = 'nula'

  onesWords = {
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

  teensWords = {
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

  twentiesWords = {
    2: 'dvacet',
    3: 'třicet',
    4: 'čtyřicet',
    5: 'padesát',
    6: 'šedesát',
    7: 'sedmdesát',
    8: 'osmdesát',
    9: 'devadesát'
  }

  hundredsWords = {
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

  pluralForms = {
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
   * Czech omits "one" before scale words.
   * e.g., 1000 is "tisíc" not "jedna tisíc"
   */
  omitOneBeforeScale = true

  /** Returns decimal separator word based on whole number (celá/celé/celých). */
  get decimalSeparatorWord () {
    if (this.cachedWholeNumber === 0n || this.cachedWholeNumber === 1n) {
      return 'celá'
    } else if (this.cachedWholeNumber >= 2n && this.cachedWholeNumber <= 4n) {
      return 'celé'
    } else {
      return 'celých'
    }
  }

  constructor (options = {}) {
    super(options)

    // Remove the inherited decimalSeparatorWord property so our getter works
    delete this.decimalSeparatorWord
  }

  /** Selects Czech plural form: 1 = singular, 2-4 = few, else = many. */
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
}
