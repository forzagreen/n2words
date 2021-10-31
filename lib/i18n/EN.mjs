import N2WordsBase from '../classes/N2WordsBase.mjs';

class N2WordsEN extends N2WordsBase {
  constructor() {
    super();

    this.negativeWord = 'minus';
    this.separatorWord = 'point';
    this.zero = 'zero';
    this.cards = [
      { '1000000000000000000000000000': 'octillion' },
      { '1000000000000000000000000': 'septillion' },
      { '1000000000000000000000': 'sextillion' },
      { '1000000000000000000': 'quintillion' },
      { '1000000000000000': 'quadrillion' },
      { '1000000000000': 'trillion' },
      { '1000000000': 'billion' },
      { '1000000': 'million' },
      { '1000': 'thousand' },
      { '100': 'hundred' },
      { '90': 'ninety' },
      { '80': 'eighty' },
      { '70': 'seventy' },
      { '60': 'sixty' },
      { '50': 'fifty' },
      { '40': 'forty' },
      { '30': 'thirty' },
      { '20': 'twenty' },
      { '19': 'nineteen' },
      { '18': 'eighteen' },
      { '17': 'seventeen' },
      { '16': 'sixteen' },
      { '15': 'fifteen' },
      { '14': 'fourteen' },
      { '13': 'thirteen' },
      { '12': 'twelve' },
      { '11': 'eleven' },
      { '10': 'ten' },
      { '9': 'nine' },
      { '8': 'eight' },
      { '7': 'seven' },
      { '6': 'six' },
      { '5': 'five' },
      { '4': 'four' },
      { '3': 'three' },
      { '2': 'two' },
      { '1': 'one' },
      { '0': 'zero' }
    ];
  }

  /**
   *
   *
   * @param {object} lPair {'one':1}
   * @param {object} rPair {'hundred':100}
   * @returns {object} {'one hundred': 100}
   */
  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0]; const lNum = parseInt(Object.values(lPair)[0]);
    const rText = Object.keys(rPair)[0]; const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && rNum < 100) return { [rText]: rNum };
    else if (100 > lNum && lNum > rNum) return { [`${lText}-${rText}`]: lNum + rNum };
    else if (lNum >= 100 && 100 > rNum) return { [`${lText} and ${rText}`]: lNum + rNum };
    else if (rNum > lNum) return { [`${lText} ${rText}`]: lNum * rNum };
    return { [`${lText} ${rText}`]: lNum + rNum };
  }
}

export default function(n) {
  return new N2WordsEN().floatToCardinal(n);
}
