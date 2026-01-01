import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Ukrainian language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (один/одна, два/дві)
 * - Ukrainian orthography and phonology
 */
export class Ukrainian extends SlavicLanguage {
  negativeWord = 'мiнус'
  decimalSeparatorWord = 'кома'
  zeroWord = 'нуль'

  onesWords = {
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'чотири',
    5: 'п\'ять',
    6: 'шiсть',
    7: 'сiм',
    8: 'вiсiм',
    9: 'дев\'ять'
  }

  onesFeminineWords = {
    1: 'одна',
    2: 'двi',
    3: 'три',
    4: 'чотири',
    5: 'п\'ять',
    6: 'шiсть',
    7: 'сiм',
    8: 'вiсiм',
    9: 'дев\'ять'
  }

  teensWords = {
    0: 'десять',
    1: 'одинадцять',
    2: 'дванадцять',
    3: 'тринадцять',
    4: 'чотирнадцять',
    5: 'п\'ятнадцять',
    6: 'шiстнадцять',
    7: 'сiмнадцять',
    8: 'вiсiмнадцять',
    9: 'дев\'ятнадцять'
  }

  twentiesWords = {
    2: 'двадцять',
    3: 'тридцять',
    4: 'сорок',
    5: 'п\'ятдесят',
    6: 'шiстдесят',
    7: 'сiмдесят',
    8: 'вiсiмдесят',
    9: 'дев\'яносто'
  }

  hundredsWords = {
    1: 'сто',
    2: 'двiстi',
    3: 'триста',
    4: 'чотириста',
    5: 'п\'ятсот',
    6: 'шiстсот',
    7: 'сiмсот',
    8: 'вiсiмсот',
    9: 'дев\'ятсот'
  }

  pluralForms = {
    1: ['тисяча', 'тисячi', 'тисяч'], // 10^ 3
    2: ['мiльйон', 'мiльйони', 'мiльйонiв'], // 10^ 6
    3: ['мiльярд', 'мiльярди', 'мiльярдiв'], // 10^ 9
    4: ['трильйон', 'трильйони', 'трильйонiв'], // 10^ 12
    5: ['квадрильйон', 'квадрильйони', 'квадрильйонiв'], // 10^ 15
    6: ['квiнтильйон', 'квiнтильйони', 'квiнтильйонiв'], // 10^ 18
    7: ['секстильйон', 'секстильйони', 'секстильйонiв'], // 10^ 21
    8: ['септильйон', 'септильйони', 'септильйонiв'], // 10^ 24
    9: ['октильйон', 'октильйони', 'октильйонiв'], // 10^ 27
    10: ['нонiльйон', 'нонiльйони', 'нонiльйонiв'] // 10^ 30
  }

  /**
   * Ukrainian thousands (тисяча) are feminine, requiring одна/двi forms.
   * Other scales (million, billion, etc.) are masculine.
   */
  scaleGenders = {
    1: true // thousands are feminine
  }
}
