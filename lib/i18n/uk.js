import { N2WordsRU } from './ru.js';

export class N2WordsUK extends N2WordsRU {
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
  };

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
  };

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
  };

  twenties = {
    2: 'двадцять',
    3: 'тридцять',
    4: 'сорок',
    5: 'п\'ятдесят',
    6: 'шiстдесят',
    7: 'сiмдесят',
    8: 'вiсiмдесят',
    9: 'дев\'яносто'
  };

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
  };

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
    10: ['нонiльйон', 'нонiльйони', 'нонiльйонiв'], // 10^ 30
  };

  constructor(options) {
    super(Object.assign({
      negativeWord: 'мiнус',
      separatorWord: 'кома',
      zero: 'нуль'
    }, options));
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
  return new N2WordsUK(options).floatToCardinal(value);
}
