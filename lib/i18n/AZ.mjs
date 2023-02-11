import N2WordsBase from '../classes/N2WordsBase.mjs';

export class N2WordsAZ extends N2WordsBase {
  constructor() {
    super();

    this.negativeWord = 'mənfi';
    this.separatorWord = 'nöqtə';
    this.zero = 'sıfır';
    this.cards = [
      { '1000000000000000000': 'kentilyon' },
      { '1000000000000000': 'katrilyon' },
      { '1000000000000': 'trilyon' },
      { '1000000000': 'milyar' },
      { '1000000': 'milyon' },
      { '1000': 'min' },
      { '100': 'yüz' },
      { '90': 'doxsan' },
      { '80': 'səksən' },
      { '70': 'yetmiş' },
      { '60': 'altmış' },
      { '50': 'əlli' },
      { '40': 'qırx' },
      { '30': 'otuz' },
      { '20': 'iyirmi' },
      { '10': 'on' },
      { '9': 'doqquz' },
      { '8': 'səkkiz' },
      { '7': 'yeddi' },
      { '6': 'altı' },
      { '5': 'beş' },
      { '4': 'dörd' },
      { '3': 'üç' },
      { '2': 'iki' },
      { '1': 'bir' },
      { '0': 'sıfır' }
    ];
  }

  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && (rNum <= 100 || rNum == 1000)) {
      return { [rText]: rNum };
    } else if (rNum > lNum) {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum * rNum };
    } else {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum + rNum };
    }
  }
}

export default function(n) {
  return new N2WordsAZ().floatToCardinal(n);
}
