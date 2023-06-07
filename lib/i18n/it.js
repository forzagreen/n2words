import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsIT extends BaseLanguage {
  cardinalWords = [
    this.zero, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
    'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici',
    'sedici', 'diciassette', 'diciotto', 'diciannove',
  ];

  strTens = { '2': 'venti', '3': 'trenta', '4': 'quaranta', '6': 'sessanta' };

  exponentPrefixes = [this.zero, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];

  constructor(options) {
    super(Object.assign({
      negativeWord: 'meno',
      separatorWord: 'virgola',
      zero: 'zero'
    }, options), []);

    /** @todo Adapt language to work with {@link BaseLanguage} better */
  }

  accentuate(string) {
    const splittedString = string.split(' ');

    const result = splittedString.map(word => {
      if (word.slice(-3) == 'tre' && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';
      else return word.replace(/tré/g, 'tre');
    });
    return result.join(' ');
  }

  omitIfZero(numberToString) {
    if (numberToString == this.zero) {
      return '';
    } else {
      return numberToString;
    }
  }

  phoneticContraction(string) {
    return string.replace(/oo/g, 'o').replace(/ao/g, 'o').replace(/io/g, 'o').replace(/au/g, 'u').replace(/iu/g, 'u');
  }

  tensToCardinal(number) {
    const tens = Math.floor(number / 10);
    const units = number % 10;
    let prefix;
    if (Object.prototype.hasOwnProperty.call(this.strTens, tens)) {
      prefix = this.strTens[tens];
    } else {
      prefix = this.cardinalWords[tens].slice(0, -1) + 'anta';
    }
    const postfix = this.omitIfZero(this.cardinalWords[units]);
    return this.phoneticContraction(prefix + postfix);
  }

  hundredsToCardinal(number) {
    const hundreds = Math.floor(number / 100);
    let prefix = 'cento';
    if (hundreds != 1) {
      prefix = this.cardinalWords[hundreds] + prefix;
    }
    const postfix = this.omitIfZero(this.toCardinal(number % 100));
    return this.phoneticContraction(prefix + postfix);
  }

  thousandsToCardinal(number) {
    const thousands = Math.floor(number / 1000);
    let prefix;
    if (thousands == 1) {
      prefix = 'mille';
    } else {
      prefix = this.toCardinal(thousands) + 'mila';
    }
    const postfix = this.omitIfZero(this.toCardinal(number % 1000));
    return prefix + postfix;
  }

  exponentLengthToString(exponentLength) {
    const prefix = this.exponentPrefixes[Math.floor(exponentLength / 6)];
    if (exponentLength % 6 == 0) {
      return prefix + 'ilione';
    } else {
      return prefix + 'iliardo';
    }
  }

  bigNumberToCardinal(number) {
    const digits = number.toString().split('');

    let preDigits = digits.length % 3;
    if (preDigits == 0) {
      preDigits = 3;
    }

    const multiplier = digits.slice(0, preDigits); // first `preDigits` elements
    const exponent = digits.slice(preDigits); // without the first `preDigits` elements

    let prefix, postfix;
    let infix = this.exponentLengthToString(exponent.length);

    if (multiplier == '1') {
      prefix = 'un ';
    } else {
      prefix = this.toCardinal(Math.trunc(Number(multiplier.join(''))));
      infix = ' ' + infix.slice(0, -1) + 'i'; // without last element
    }

    const isSetsEqual = (a, b) => a.size == b.size && [...a].every(value => b.has(value));
    if (!isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = this.toCardinal(Math.trunc(exponent.join('')));

      if (postfix.includes(' e ')) {
        infix += ', '; // for very large numbers
      } else {
        infix += ' e ';
      }
    } else {
      postfix = '';
    }

    return prefix + infix + postfix;
  }

  toCardinal(number) {
    let words = '';

    if (number < 20) {
      words = this.cardinalWords[number];
    } else if (number < 100) {
      words = this.tensToCardinal(Number(number));
    } else if (number < 1000) {
      words = this.hundredsToCardinal(Number(number));
    } else if (number < 1000000) {
      words = this.thousandsToCardinal(Number(number));
    } else {
      words = this.bigNumberToCardinal(number);
    }

    return this.accentuate(words);
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} options Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options) {
  return new N2WordsIT(options).floatToCardinal(value);
}
