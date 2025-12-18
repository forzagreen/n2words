import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Russian language converter.
 *
 * Converts numbers to Russian words with full grammatical support:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization rules (one/few/many forms)
 * - Declension patterns for thousands, millions, billions, etc.
 * - Proper case endings for number words
 *
 * Features:
 * - Gender-aware forms (один/одна, два/две)
 * - Three-form pluralization (тысяча/тысячи/тысяч)
 * - Support for very large numbers (up to nonillions)
 * - Proper spacing and conjunction rules
 *
 * This class extends SlavicLanguage, which provides the conversion algorithm
 * shared by Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian.
 */
export class Russian extends SlavicLanguage {
  negativeWord = 'минус'

  separatorWord = 'запятая'

  zero = 'ноль'

  /** @type {object} */
  ones = {
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  }

  /** @type {object} */
  onesFeminine = {
    1: 'одна',
    2: 'две',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  }

  /** @type {object} */
  tens = {
    0: 'десять',
    1: 'одиннадцать',
    2: 'двенадцать',
    3: 'тринадцать',
    4: 'четырнадцать',
    5: 'пятнадцать',
    6: 'шестнадцать',
    7: 'семнадцать',
    8: 'восемнадцать',
    9: 'девятнадцать'
  }

  /** @type {object} */
  twenties = {
    2: 'двадцать',
    3: 'тридцать',
    4: 'сорок',
    5: 'пятьдесят',
    6: 'шестьдесят',
    7: 'семьдесят',
    8: 'восемьдесят',
    9: 'девяносто'
  }

  /** @type {object} */
  hundreds = {
    1: 'сто',
    2: 'двести',
    3: 'триста',
    4: 'четыреста',
    5: 'пятьсот',
    6: 'шестьсот',
    7: 'семьсот',
    8: 'восемьсот',
    9: 'девятьсот'
  }

  /** @type {object} */
  thousands = {
    1: ['тысяча', 'тысячи', 'тысяч'], // 10^ 3
    2: ['миллион', 'миллиона', 'миллионов'], // 10^ 6
    3: ['миллиард', 'миллиарда', 'миллиардов'], // 10^ 9
    4: ['триллион', 'триллиона', 'триллионов'], // 10^ 12
    5: ['квадриллион', 'квадриллиона', 'квадриллионов'], // 10^ 15
    6: ['квинтиллион', 'квинтиллиона', 'квинтиллионов'], // 10^ 18
    7: ['секстиллион', 'секстиллиона', 'секстиллионов'], // 10^ 21
    8: ['септиллион', 'септиллиона', 'септиллионов'], // 10^ 24
    9: ['октиллион', 'октиллиона', 'октиллионов'], // 10^ 27
    10: ['нониллион', 'нониллиона', 'нониллионов'] // 10^ 30
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new Russian(options).floatToCardinal(value)
}
