import Num2Word_RU from './RU.mjs';

export default function() {
  Num2Word_RU.call(this);

  this.ZERO = 'nula';
  this.ONES = {1: 'jedna', 2: 'dva', 3: 'tři', 4: 'čtyři', 5: 'pět', 6: 'šest', 7: 'sedm', 8: 'osm', 9: 'devět'};
  this.TENS = {0: 'deset', 1: 'jedenáct', 2: 'dvanáct', 3: 'třináct', 4: 'čtrnáct', 5: 'patnáct', 6: 'šestnáct', 7: 'sedmnáct', 8: 'osmnáct', 9: 'devatenáct'};
  this.TWENTIES = {2: 'dvacet', 3: 'třicet', 4: 'čtyřicet', 5: 'padesát', 6: 'šedesát', 7: 'sedmdesát', 8: 'osmdesát', 9: 'devadesát'};
  this.HUNDREDS = {1: 'sto', 2: 'dvěstě', 3: 'třista', 4: 'čtyřista', 5: 'pětset', 6: 'šestset', 7: 'sedmset', 8: 'osmset', 9: 'devětset'};
  this.THOUSANDS = {
    1: ['tisíc', 'tisíce', 'tisíc'], // 10^ 3
    2: ['milion', 'miliony', 'milionů'], // 10^ 6
    3: ['miliarda', 'miliardy', 'miliard'], // 10^ 9
    4: ['bilion', 'biliony', 'bilionů'], // 10^ 12
    5: ['biliarda', 'biliardy', 'biliard'], // 10^ 15
    6: ['trilion', 'triliony', 'trilionů'], // 10^ 18
    7: ['triliarda', 'triliardy', 'triliard'], // 10^ 21
    8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^ 24
    9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'], // 10^ 27
    10: ['quintillion', 'quintilliony', 'quintillionů'], // 10^ 30
  };

  this.pluralize = (n, forms) => {
    let form = 2;
    if (n == 1) {
      form = 0;
    } else if (((n % 10 < 5) && (n % 10 > 1)) && (n % 100 < 10 || n % 100 > 20)) {
      form = 1;
    }
    return forms[form];
  };

  this.toCardinal = (number) => {
    if (parseInt(number) == 0) {
      return this.ZERO;
    }
    const words = [];
    const chunks = this.splitbyx(JSON.stringify(number), 3);
    let i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      const x = chunks[j];
      i = i - 1;
      if (x == 0) {
        continue;
      }
      const [n1, n2, n3] = this.get_digits(x);
      if (n3 > 0) {
        words.push(this.HUNDREDS[n3]);
      }
      if (n2 > 1) {
        words.push(this.TWENTIES[n2]);
      }
      if (n2 == 1) {
        words.push(this.TENS[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ONES[n1]);
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.THOUSANDS[i]));
      }
    }
    return words.join(' ');
  };
}
