import N2WordsBase from '../classes/N2WordsBase.mjs';

export default function() {
  N2WordsBase.call(this);

  this.negative_word = 'meno';
  this.separator_word = 'virgola';
  this.ZERO = 'zero';
  const CARDINAL_WORDS = [
    this.ZERO, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
    'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici',
    'sedici', 'diciassette', 'diciotto', 'diciannove',
  ];
  const STR_TENS = {'2': 'venti', '3': 'trenta', '4': 'quaranta', '6': 'sessanta'};
  const EXPONENT_PREFIXES = [this.ZERO, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];

  this.accentuate = string => {
    const splittedString = string.split(' ');

    const result = splittedString.map(word => {
      if (word.slice(-3) == 'tre' && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';
      else return word.replace(/tré/g, 'tre');
    });
    return result.join(' ');
  };

  this.omitIfZero = numberToString => {
    if (numberToString == this.ZERO) {
      return '';
    } else {
      return numberToString;
    }
  };

  this.phoneticContraction = string => {
    return string.replace(/oo/g, 'o').replace(/ao/g, 'o').replace(/io/g, 'o').replace(/au/g, 'u').replace(/iu/g, 'u');
  };

  this.tensToCardinal = number => {
    const tens = Math.floor(number / 10);
    const units = number % 10;
    let prefix;
    if (Object.prototype.hasOwnProperty.call(STR_TENS, tens)) {
      prefix = STR_TENS[tens];
    } else {
      prefix = CARDINAL_WORDS[tens].slice(0, -1) + 'anta';
    }
    const postfix = this.omitIfZero(CARDINAL_WORDS[units]);
    return this.phoneticContraction(prefix + postfix);
  };

  this.hundredsToCardinal = number => {
    const hundreds = Math.floor(number / 100);
    let prefix = 'cento';
    if (hundreds != 1) {
      prefix = CARDINAL_WORDS[hundreds] + prefix;
    }
    const postfix = this.omitIfZero(this.toCardinal(number % 100));
    return this.phoneticContraction(prefix + postfix);
  };

  this.thousandsToCardinal = number => {
    const thousands = Math.floor(number / 1000);
    let prefix;
    if (thousands == 1) {
      prefix = 'mille';
    } else {
      prefix = this.toCardinal(thousands) + 'mila';
    }
    const postfix = this.omitIfZero(this.toCardinal(number % 1000));
    return prefix + postfix;
  };

  this.exponentLengthToString = exponentLength => {
    const prefix = EXPONENT_PREFIXES[Math.floor(exponentLength / 6)];
    if (exponentLength % 6 == 0) {
      return prefix + 'ilione';
    } else {
      return prefix + 'iliardo';
    }
  };

  this.bigNumberToCardinal = number => {
    const digits = Array.from(String(number));
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
  };

  this.toCardinal = number => {
    let words = '';

    if (number < 20) {
      words = CARDINAL_WORDS[number];
    } else if (number < 100) {
      words = this.tensToCardinal(number);
    } else if (number < 1000) {
      words = this.hundredsToCardinal(number);
    } else if (number < 1000000) {
      words = this.thousandsToCardinal(number);
    } else {
      words = this.bigNumberToCardinal(number);
    }

    return this.accentuate(words);
  };
}
