import { InflectedScaleLanguage } from '../classes/inflected-scale-language.js'

/**
 * Serbian Latin language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (jedan/jedna, dva/dve)
 * - Latin script representation
 */
export class SerbianLatin extends InflectedScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'zapeta'
  zeroWord = 'nula'

  onesWords = {
    1: 'jedan',
    2: 'dva',
    3: 'tri',
    4: 'četiri',
    5: 'pet',
    6: 'šest',
    7: 'sedam',
    8: 'osam',
    9: 'devet'
  }

  onesFeminineWords = {
    1: 'jedna',
    2: 'dve',
    3: 'tri',
    4: 'četiri',
    5: 'pet',
    6: 'šest',
    7: 'sedam',
    8: 'osam',
    9: 'devet'
  }

  teensWords = {
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

  tensWords = {
    2: 'dvadeset',
    3: 'trideset',
    4: 'četrdeset',
    5: 'pedeset',
    6: 'šezdeset',
    7: 'sedamdeset',
    8: 'osamdeset',
    9: 'devedeset'
  }

  hundredsWords = {
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

  pluralForms = {
    1: ['hiljada', 'hiljade', 'hiljada'], // 10 ^ 3
    2: ['milion', 'miliona', 'miliona'], // 10 ^ 6
    3: ['milijarda', 'milijarde', 'milijarda'], // 10 ^ 9
    4: ['bilion', 'biliona', 'biliona'], // 10 ^ 12
    5: ['bilijarda', 'bilijarde', 'bilijarda'], // 10 ^ 15
    6: ['trilion', 'triliona', 'triliona'], // 10 ^ 18
    7: ['trilijarda', 'trilijarde', 'trilijarda'], // 10 ^ 21
    8: ['kvadrilion', 'kvadriliona', 'kvadriliona'], // 10 ^ 24
    9: ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda'], // 10 ^ 27
    10: ['kvintilion', 'kvintiliona', 'kvintiliona'] // 10 ^ 30
  }

  /**
   * Maps segment indices to whether they are grammatically feminine.
   * In Serbian, thousands (index 1) are feminine, others are masculine.
   * @type {Object.<number, boolean>}
   */
  scaleGenders = {
    1: true // thousands are feminine (others default to false)
  }

  /** Selects Serbian plural form: 1 = singular, 2-4 = few, else = many. */
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
}
