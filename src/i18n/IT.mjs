export default function() {
  const ZERO = 'zero';
  const CARDINAL_WORDS = [
    ZERO, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
    'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici',
    'sedici', 'diciassette', 'diciotto', 'diciannove'
  ];
  const STR_TENS = { '2': 'venti', '3': 'trenta', '4': 'quaranta', '6': 'sessanta' };
  const EXPONENT_PREFIXES = [ZERO, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];
  
  this.accentuate = (string) => {
    var splittedString = string.split(' ');
  
    const result = splittedString.map((word) => {
      if (word.slice(-3) == 'tre' && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';
      else return word.replace(/tré/g, 'tre');
    });
    return result.join(' ');
  };
  
  this.omitIfZero = (numberToString) => {
    if (numberToString == ZERO) {
      return '';
    } else {
      return numberToString;
    }
  };
  
  this.phoneticContraction = (string) => {
    return string.replace(/oo/g, 'o').replace(/ao/g, 'o').replace(/io/g, 'o').replace(/au/g, 'u').replace(/iu/g, 'u');
  };
  
  this.tensToCardinal = (number) => {
    var tens = Math.floor(number / 10);
    var units = number % 10;
    var prefix;
    if (Object.prototype.hasOwnProperty.call(STR_TENS, tens)) {
      prefix = STR_TENS[tens];
    } else {
      prefix = CARDINAL_WORDS[tens].slice(0, -1) + 'anta';
    }
    var postfix = this.omitIfZero(CARDINAL_WORDS[units]);
    return this.phoneticContraction(prefix + postfix);
  };
  
  this.hundredsToCardinal = (number) => {
    var hundreds = Math.floor(number / 100);
    var prefix = 'cento';
    if (hundreds != 1) {
      prefix = CARDINAL_WORDS[hundreds] + prefix;
    }
    var postfix = this.omitIfZero(this.toCardinal(number % 100));
    return this.phoneticContraction(prefix + postfix);
  };
  
  this.thousandsToCardinal = (number) => {
    var thousands = Math.floor(number / 1000);
    var prefix;
    if (thousands == 1) {
      prefix = 'mille';
    } else {
      prefix = this.toCardinal(thousands) + 'mila';
    }
    var postfix = this.omitIfZero(this.toCardinal(number % 1000));
    return prefix + postfix;
  };
  
  this.exponentLengthToString = (exponentLength) => {
    var prefix = EXPONENT_PREFIXES[Math.floor(exponentLength / 6)];
    if (exponentLength % 6 == 0) {
      return prefix + 'ilione';
    } else {
      return prefix + 'iliardo';
    }
  };
  
  this.bigNumberToCardinal = (number) => {
    var digits = Array.from(String(number));
    var predigits = (digits.length % 3 == 0) ? 3 : digits.length % 3;
    var multiplier = digits.slice(0, predigits); // first `predigits` elements
    var exponent = digits.slice(predigits); // without the first `predigits` elements
    var prefix, postfix;
    var infix = this.exponentLengthToString(exponent.length);
    if (multiplier.toString() == '1') {
      prefix = 'un ';
    } else {
      prefix = this.toCardinal(parseInt(multiplier.join('')));
      infix = ' ' + infix.slice(0,-1) + 'i'; // without last element
    }
    var isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
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
  
  this.toCardinal = (number) => {
    var words = '';
  
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
