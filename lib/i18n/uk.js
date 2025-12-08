import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Ukrainian language converter.
 *
 * Implements Ukrainian number words using the Slavic language pattern:
 * - Ukrainian number words (один/одна, два/дві, три, чотири...)
 * - Gender-aware forms (masculine/feminine)
 * - Slavic three-form pluralization (тисяча/тисячі/тисяч)
 * - Ukrainian orthography and phonology
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "тисяча")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "тисячі")
 *   * Form 3 (many): all other numbers (e.g., "тисяч")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Features:
 * - Ukrainian-specific letters (і, ї, ґ, є)
 * - Apostrophe usage (п'ять, дев'ять)
 * - Close structural similarity to Russian with distinct vocabulary
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class UK extends SlavicLanguage {
  ones = {
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

  onesFeminine = {
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

  tens = {
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

  twenties = {
    2: 'двадцять',
    3: 'тридцять',
    4: 'сорок',
    5: 'п\'ятдесят',
    6: 'шiстдесят',
    7: 'сiмдесят',
    8: 'вiсiмдесят',
    9: 'дев\'яносто'
  }

  hundreds = {
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

  thousands = {
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

  constructor (options) {
    super(Object.assign({
      negativeWord: 'мiнус',
      separatorWord: 'кома',
      zero: 'нуль'
    }, options))
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
  return new UK(options).floatToCardinal(value)
}
