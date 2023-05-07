import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsIT extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'meno',
      separatorWord: 'virgola',
      zero: 'zero'
    },[]);

    /** @todo Adapt language to work with {@link BaseLanguage} better */

    this.cardinalWords = [
      this.zero, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
      'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici',
      'sedici', 'diciassette', 'diciotto', 'diciannove',
    ];
    this.strTens = {'2': 'venti', '3': 'trenta', '4': 'quaranta', '6': 'sessanta'};
    this.exponentPrefixes = [this.zero, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];
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
    const digits = Array.from(number.toString());
    const predigits = (digits.length % 3 == 0) ? 3 : digits.length % 3;
    const multiplier = digits.slice(0, predigits); // first `predigits` elements
    const exponent = digits.slice(predigits); // without the first `predigits` elements
    let prefix; let postfix;
    let infix = this.exponentLengthToString(exponent.length);
    if (multiplier.toString() == '1') {
      prefix = 'un ';
    } else {
      prefix = this.toCardinal(parseInt(multiplier.join('')));
      infix = ' ' + infix.slice(0, -1) + 'i'; // without last element
    }
    const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
    if (!isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = this.toCardinal(parseInt(exponent.join('')));
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

    if (number < 20n) {
      words = this.cardinalWords[number];
    } else if (number < 100n) {
      words = this.tensToCardinal(Number(number));
    } else if (number < 1000n) {
      words = this.hundredsToCardinal(Number(number));
    } else if (number < 1000000n) {
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
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsIT().floatToCardinal(value);
}
