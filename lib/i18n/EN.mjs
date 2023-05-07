import BaseLanguage from '../classes/BaseLanguage.mjs';

/**
 * This class is for converting numbers to english words.
 */
class English extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'point',
      zero: 'zero'
    },[
      [1000000000000000000000000000n, 'octillion'],
      [1000000000000000000000000n, 'septillion'],
      [1000000000000000000000n, 'sextillion'],
      [1000000000000000000n, 'quintillion'],
      [1000000000000000n, 'quadrillion'],
      [1000000000000n, 'trillion'],
      [1000000000n, 'billion'],
      [1000000n, 'million'],
      [1000n, 'thousand'],
      [100n, 'hundred'],
      [90n, 'ninety'],
      [80n, 'eighty'],
      [70n, 'seventy'],
      [60n, 'sixty'],
      [50n, 'fifty'],
      [40n, 'forty'],
      [30n, 'thirty'],
      [20n, 'twenty'],
      [19n, 'nineteen'],
      [18n, 'eighteen'],
      [17n, 'seventeen'],
      [16n, 'sixteen'],
      [15n, 'fifteen'],
      [14n, 'fourteen'],
      [13n, 'thirteen'],
      [12n, 'twelve'],
      [11n, 'eleven'],
      [10n, 'ten'],
      [9n, 'nine'],
      [8n, 'eight'],
      [7n, 'seven'],
      [6n, 'six'],
      [5n, 'five'],
      [4n, 'four'],
      [3n, 'three'],
      [2n, 'two'],
      [1n, 'one'],
      [0n, 'zero']
    ]);
  }

  /**
   * Merge word set pairs
   * @param {object} lPair {'one':1}
   * @param {object} rPair {'hundred':100}
   * @returns {object} {'one hundred': 100}
   */
  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rText = Object.keys(rPair)[0];
    const rNum = parseInt(Object.values(rPair)[0]);

    if (lNum == 1 && rNum < 100) return { [rText]: rNum };
    else if (100 > lNum && lNum > rNum) return { [`${lText}-${rText}`]: lNum + rNum };
    else if (lNum >= 100 && 100 > rNum) return { [`${lText} and ${rText}`]: lNum + rNum };
    else if (rNum > lNum) return { [`${lText} ${rText}`]: lNum * rNum };

    return { [`${lText} ${rText}`]: lNum + rNum };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new English().floatToCardinal(value);
}
