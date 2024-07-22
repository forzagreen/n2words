import BaseLanguage from '../classes/base-language.js';

/**
 * @augments BaseLanguage
 * @todo Adapt language to work with {@link BaseLanguage} better
 */
class Italian extends BaseLanguage {
  cardinalWords = [
    this.zero, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
    'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici',
    'sedici', 'diciassette', 'diciotto', 'diciannove',
  ];

  strTens = { '2': 'venti', '3': 'trenta', '4': 'quaranta', '6': 'sessanta' };

  exponentPrefixes = [this.zero, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];

  constructor(options) {
    options = Object.assign({
      negativeWord: 'meno',
      separatorWord: 'virgola',
      zero: 'zero'
    }, options);

    super(options, []);
  }

  accentuate(string) {
    const splittedString = string.split(' ');

    const result = splittedString.map(word => {
      return word.slice(-3) == 'tre' && word.length > 3 ? word.replaceAll('tré', 'tre').slice(0, -3) + 'tré' : word.replaceAll('tré', 'tre');
    });
    return result.join(' ');
  }

  omitIfZero(numberToString) {
    return numberToString == this.zero ? '' : numberToString;
  }

  phoneticContraction(string) {
    return string.replaceAll('oo', 'o').replaceAll('ao', 'o').replaceAll('io', 'o').replaceAll('au', 'u').replaceAll('iu', 'u');
  }

  tensToCardinal(number) {
    const tens = Math.floor(number / 10);
    const units = number % 10;
    let prefix;
    prefix = Object.prototype.hasOwnProperty.call(this.strTens, tens) ? this.strTens[tens] : this.cardinalWords[tens].slice(0, -1) + 'anta';
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
    prefix = thousands == 1 ? 'mille' : this.toCardinal(thousands) + 'mila';
    const postfix = this.omitIfZero(this.toCardinal(number % 1000));
    return prefix + postfix;
  }

  exponentLengthToString(exponentLength) {
    const prefix = this.exponentPrefixes[Math.floor(exponentLength / 6)];
    return exponentLength % 6 == 0 ? prefix + 'ilione' : prefix + 'iliardo';
  }

  bigNumberToCardinal(number) {
    const digits = [...number.toString()];

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

    // TODO ESLint suggestion
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const isSetsEqual = (a, b) => a.size == b.size && [...a].every(value => b.has(value));
    if (isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = '';
    } else {
      postfix = this.toCardinal(Math.trunc(exponent.join('')));

      infix += (postfix.includes(' e ') ? ', ' : ' e ');
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
    } else if (number < 1_000_000) {
      words = this.thousandsToCardinal(Number(number));
    } else {
      words = this.bigNumberToCardinal(number);
    }

    return this.accentuate(words);
  }
}

export default Italian;
