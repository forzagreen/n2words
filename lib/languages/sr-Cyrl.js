import { InflectedScaleLanguage } from '../classes/inflected-scale-language.js'

/**
 * Serbian language converter (Cyrillic script).
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (један/једна, два/две)
 * - Cyrillic script representation
 */
export class SerbianCyrillic extends InflectedScaleLanguage {
  negativeWord = 'минус'
  decimalSeparatorWord = 'запета'
  zeroWord = 'нула'

  onesWords = {
    1: 'један',
    2: 'два',
    3: 'три',
    4: 'четири',
    5: 'пет',
    6: 'шест',
    7: 'седам',
    8: 'осам',
    9: 'девет'
  }

  onesFeminineWords = {
    1: 'једна',
    2: 'две',
    3: 'три',
    4: 'четири',
    5: 'пет',
    6: 'шест',
    7: 'седам',
    8: 'осам',
    9: 'девет'
  }

  teensWords = {
    0: 'десет',
    1: 'једанаест',
    2: 'дванаест',
    3: 'тринаест',
    4: 'четрнаест',
    5: 'петнаест',
    6: 'шеснаест',
    7: 'седамнаест',
    8: 'осамнаест',
    9: 'деветнаест'
  }

  tensWords = {
    2: 'двадесет',
    3: 'тридесет',
    4: 'четрдесет',
    5: 'педесет',
    6: 'шездесет',
    7: 'седамдесет',
    8: 'осамдесет',
    9: 'деведесет'
  }

  hundredsWords = {
    1: 'сто',
    2: 'двеста',
    3: 'триста',
    4: 'четиристо',
    5: 'петсто',
    6: 'шесто',
    7: 'седамсто',
    8: 'осамсто',
    9: 'девестo'
  }

  pluralForms = {
    1: ['хиљада', 'хиљаде', 'хиљада'], // 10 ^ 3
    2: ['милион', 'милиона', 'милиона'], // 10 ^ 6
    3: ['милијарда', 'милијарде', 'милијарда'], // 10 ^ 9
    4: ['билион', 'билиона', 'билиона'], // 10 ^ 12
    5: ['билијарда', 'билијарде', 'билијарда'], // 10 ^ 15
    6: ['трилион', 'трилиона', 'трилиона'], // 10 ^ 18
    7: ['трилијарда', 'трилијарде', 'трилијарда'], // 10 ^ 21
    8: ['квадрилион', 'квадрилиона', 'квадрилиона'], // 10 ^ 24
    9: ['квадрилијарда', 'квадрилијарде', 'квадрилијарда'], // 10 ^ 27
    10: ['квинтилион', 'квинтилиона', 'квинтилиона'] // 10 ^ 30
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
