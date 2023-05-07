import {N2WordsRU} from './RU.mjs';

export class N2WordsLV extends N2WordsRU{
  constructor() {
    super({
      negativeWord: 'mīnus',
      separatorWord: 'komats',
      zero: 'nulle'
    });

    this.ones = {
      1: 'viens',
      2: 'divi',
      3: 'trīs',
      4: 'četri',
      5: 'pieci',
      6: 'seši',
      7: 'septiņi',
      8: 'astoņi',
      9: 'deviņi'
    };
    this.tens = {
      0: 'desmit',
      1: 'vienpadsmit',
      2: 'divpadsmit',
      3: 'trīspadsmit',
      4: 'četrpadsmit',
      5: 'piecpadsmit',
      6: 'sešpadsmit',
      7: 'septiņpadsmit',
      8: 'astoņpadsmit',
      9: 'deviņpadsmit'
    };
    this.twenties = {
      2: 'divdesmit',
      3: 'trīsdesmit',
      4: 'četrdesmit',
      5: 'piecdesmit',
      6: 'sešdesmit',
      7: 'septiņdesmit',
      8: 'astoņdesmit',
      9: 'deviņdesmit'
    };
    this.hundreds = ['simts', 'simti', 'simtu'];
    this.thousands = {
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
  }

  pluralize(n, forms) {
    let form = 2;
    if (n != 0) {
      if (n % 10 == 1 && n % 100 != 11) {
        form = 0;
      } else {
        form = 1;
      }
    }
    return forms[form];
  }

  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }
    const words = [];
    const chunks = this.splitByX(JSON.stringify(Number(number)), 3);
    let i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      const x = chunks[j];
      i = i - 1;
      if (x == 0) {
        continue;
      }
      const [n1, n2, n3] = this.getDigits(x);
      if (n3 > 0) {
        if (n3 == 1 && n2 == 0 && n1 > 0) {
          words.push(this.hundreds[2]);
        } else if (n3 > 1) {
          words.push(this.ones[n3]);
          words.push(this.hundreds[1]);
        } else {
          words.push(this.hundreds[0]);
        }
      }
      if (n2 > 1) {
        words.push(this.twenties[n2]);
      }
      if (n2 == 1) {
        words.push(this.tens[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ones[n1]);
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.thousands[i]));
      }
    }
    return words.join(' ');
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsLV().floatToCardinal(value);
}
