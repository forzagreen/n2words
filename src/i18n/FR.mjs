import Num2Word_Base from '../classes/Num2Word.mjs';

/**
 *
 */
export default function() {
  Num2Word_Base.call(this);

  this.cards = [{'1000000000000000000000000000': 'quadrilliard'}, {'1000000000000000000000000': 'quadrillion'}, {'1000000000000000000000': 'trilliard'}, {'1000000000000000000': 'trillion'}, {'1000000000000000': 'billiard'}, {'1000000000000': 'billion'}, {'1000000000': 'milliard'}, {'1000000': 'million'}, {'1000': 'mille'}, {'100': 'cent'}, {'80': 'quatre-vingts'}, {'60': 'soixante'}, {'50': 'cinquante'}, {'40': 'quarante'}, {'30': 'trente'}, {'20': 'vingt'}, {'19': 'dix-neuf'}, {'18': 'dix-huit'}, {'17': 'dix-sept'}, {'16': 'seize'}, {'15': 'quinze'}, {'14': 'quatorze'}, {'13': 'treize'}, {'12': 'douze'}, {'11': 'onze'}, {'10': 'dix'}, {'9': 'neuf'}, {'8': 'huit'}, {'7': 'sept'}, {'6': 'six'}, {'5': 'cinq'}, {'4': 'quatre'}, {'3': 'trois'}, {'2': 'deux'}, {'1': 'un'}, {'0': 'zéro'}];
  this.merge = (curr, next) => { // {'cent':100}, {'vingt-cinq':25}
    let ctext = Object.keys(curr)[0]; const cnum = parseInt(Object.values(curr)[0]);
    let ntext = Object.keys(next)[0]; const nnum = parseInt(Object.values(next)[0]);
    if (cnum == 1) {
      if (nnum < 1000000) {
        return {[ntext]: nnum};
      }
    } else {
      if (
        ((cnum - 80) % 100 == 0 || (cnum % 100 == 0 && cnum < 1000)) &&
          nnum < 1000000 &&
          ctext[ctext.length - 1] == 's'
      ) {
        ctext = ctext.slice(0, -1); // without last elem
      }
      if (
        cnum < 1000 && nnum != 1000 &&
          ntext[ntext.length - 1] != 's' &&
          nnum % 100 == 0
      ) {
        ntext += 's';
      }
    }
    if (nnum < cnum && cnum < 100) {
      if (nnum % 10 == 1 && cnum != 80) return {[`${ctext} et ${ntext}`]: cnum + nnum};
      return {[`${ctext}-${ntext}`]: cnum + nnum};
    }
    if (nnum > cnum) return {[`${ctext} ${ntext}`]: cnum * nnum};
    return {[`${ctext} ${ntext}`]: cnum + nnum};
  };
}
