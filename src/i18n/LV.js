import Num2Word_RU from './RU';

export default function() {
  Num2Word_RU.call(this);
  this.ZERO = 'nulle';
  this.ONES = { 1: 'viens', 2: 'divi', 3: 'trīs', 4: 'četri', 5: 'pieci', 6: 'seši', 7: 'septiņi', 8: 'astoņi', 9: 'deviņi' };
  this.TENS = { 0: 'desmit', 1: 'vienpadsmit', 2: 'divpadsmit', 3: 'trīspadsmit', 4: 'četrpadsmit', 5: 'piecpadsmit', 6: 'sešpadsmit', 7: 'septiņpadsmit', 8: 'astoņpadsmit', 9: 'deviņpadsmit' };
  this.TWENTIES = { 2: 'divdesmit', 3: 'trīsdesmit', 4: 'četrdesmit', 5: 'piecdesmit', 6: 'sešdesmit', 7: 'septiņdesmit', 8: 'astoņdesmit', 9: 'deviņdesmit' };
  this.HUNDREDS = ['simts', 'simti', 'simtu'];
  this.THOUSANDS = {
    1: ['tūkstotis', 'tūkstoši', 'tūkstošu'],
    2: ['miljons', 'miljoni', 'miljonu'],
    3: ['miljards', 'miljardi', 'miljardu'],
    4: ['triljons', 'triljoni', 'triljonu'],
    5: ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
    6: ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
    7: ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
    8: ['septiljons', 'septiljoni', 'septiljonu'],
    9: ['oktiljons', 'oktiljoni', 'oktiljonu'],
    10: ['nontiljons', 'nontiljoni', 'nontiljonu'],
  };
  this.pluralize = (n, forms) => {
    var form = 2;
    if (n != 0) {
      if (n % 10 == 1 && n % 100 != 11) {
        form = 0;
      } else {
        form = 1;
      }
    }
    return forms[form];
  };
  
  this.toCardinal = (number) => {
    if (parseInt(number) == 0) {
      return this.ZERO;
    }
    var words = [];
    var chunks = this.splitbyx(JSON.stringify(number), 3);
    var i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;
      if (x == 0) { continue; }
      var [n1, n2, n3] = this.get_digits(x);
      if (n3 > 0) {
        if (n3 == 1 && n2 == 0 && n1 > 0) {
          words.push(this.HUNDREDS[2]);
        } else if (n3 > 1) {
          words.push(this.ONES[n3]);
          words.push(this.HUNDREDS[1]);
        } else {
          words.push(this.HUNDREDS[0]);
        }
      }
      if (n2 > 1) { words.push(this.TWENTIES[n2]); }
      if (n2 == 1) { words.push(this.TENS[n1]); }
      else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ONES[n1]);
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.THOUSANDS[i]));
      }
    }
    return words.join(' ');
  };
}
