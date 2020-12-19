import N2WordsBase from '../classes/N2WordsBase.mjs';

export default function () {
  N2WordsBase.call(this);

  this.negative_word = 'menos';
  this.separator_word = 'vírgula';
  this.ZERO = 'zero';
  this.cards = [
    { '1000000000000000000000000': 'quatrilião' },
    { 1000000000000000000: 'trilião' },
    { 1000000000000: 'bilião' },
    { 1000000: 'milião' },
    { 1000: 'mil' },
    { 100: 'cem' },
    { 90: 'noventa' },
    { 80: 'oitenta' },
    { 70: 'setenta' },
    { 60: 'sessenta' },
    { 50: 'cinquenta' },
    { 40: 'quarenta' },
    { 30: 'trinta' },
    { 20: 'vinte' },
    { 19: 'dezanove' },
    { 18: 'dezoito' },
    { 17: 'dezassete' },
    { 16: 'dezasseis' },
    { 15: 'quinze' },
    { 14: 'catorze' },
    { 13: 'treze' },
    { 12: 'doze' },
    { 11: 'onze' },
    { 10: 'dez' },
    { 9: 'nove' },
    { 8: 'oito' },
    { 7: 'sete' },
    { 6: 'seis' },
    { 5: 'cinco' },
    { 4: 'quatro' },
    { 3: 'três' },
    { 2: 'dois' },
    { 1: 'um' },
    { 0: 'zero' }
  ];
  this.hundreds = {
    1: 'cento',
    2: 'duzentos',
    3: 'trezentos',
    4: 'quatrocentos',
    5: 'quinhentos',
    6: 'seiscentos',
    7: 'setecentos',
    8: 'oitocentos',
    9: 'novecentos'
  };

  this.postClean = (words) => {
    const transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões'];
    for (let i = 0; i < transforms.length; i++) {
      const ext = transforms[i];
      if (words.match(new RegExp(`.*${ext} e \\w*entos? (?=.*e)`))) {
        words = words.replace(new RegExp(`${ext} e`, 'g'), `${ext}`);
      }
    }
    return words;
  };

  this.merge = (curr, next) => {
    let ctext = Object.keys(curr)[0]; const cnum = parseInt(Object.values(curr)[0]);
    let ntext = Object.keys(next)[0]; const nnum = parseInt(Object.values(next)[0]);
    if (cnum == 1) {
      if (nnum < 1000000) return { [ntext]: nnum };
      ctext = 'um';
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext = 'cento';
    }

    if (nnum < cnum) {
      // if (cnum < 100) {
      //   return { [`${ctext} e ${ntext}`]: cnum + nnum }
      // }
      return { [`${ctext} e ${ntext}`]: cnum + nnum };
    } else if (nnum % 1000000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + 'liões';
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + 'lhões';
    }

    if (ntext == 'milião') ntext = 'milhão';

    if (nnum == 100) {
      ctext = this.hundreds[cnum];
      ntext = '';
    } else {
      ntext = ' ' + ntext;
    }
    return { [`${ctext}${ntext}`]: cnum * nnum };
  };
}
