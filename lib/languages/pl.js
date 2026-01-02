import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Polish language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Polish-specific declension patterns
 * - Distinctive Polish phonology and orthography
 */
export class Polish extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'przecinek'
  zeroWord = 'zero'

  onesWords = {
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

  onesFeminineWords = {
    1: 'jedna',
    2: 'dwie',
    3: 'trzy',
    4: 'cztery',
    5: 'pięć',
    6: 'sześć',
    7: 'siedem',
    8: 'osiem',
    9: 'dziewięć'
  }

  teensWords = {
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

  twentiesWords = {
    2: 'dwadzieścia',
    3: 'trzydzieści',
    4: 'czterdzieści',
    5: 'pięćdziesiąt',
    6: 'sześćdziesiąt',
    7: 'siedemdziesiąt',
    8: 'osiemdziesiąt',
    9: 'dziewięćdziesiąt'
  }

  hundredsWords = {
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

  pluralForms = {
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
   * Polish omits "one" before scale words.
   * e.g., 1000 is "tysiąc" not "jeden tysiąc"
   */
  omitOneBeforeScale = true

  /** Implements Polish-specific three-form pluralization rules. */
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
}
