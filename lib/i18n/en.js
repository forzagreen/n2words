import BaseLanguage from '../classes/base-language.js';

/**
 * This class is for converting numbers to english words.
 * @augments BaseLanguage
 */
class English extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'point',
      zero: 'zero'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'octillion'],
      [1_000_000_000_000_000_000_000_000n, 'septillion'],
      [1_000_000_000_000_000_000_000n, 'sextillion'],
      [1_000_000_000_000_000_000n, 'quintillion'],
      [1_000_000_000_000_000n, 'quadrillion'],
      [1_000_000_000_000n, 'trillion'],
      [1_000_000_000n, 'billion'],
      [1_000_000n, 'million'],
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
    const lNumber = BigInt(Object.values(lPair)[0]);
    const rText = Object.keys(rPair)[0];
    const rNumber = BigInt(Object.values(rPair)[0]);

    if (lNumber == 1 && rNumber < 100) return { [rText]: rNumber };
    else if (100 > lNumber && lNumber > rNumber) return { [`${lText}-${rText}`]: lNumber + rNumber };
    else if (lNumber >= 100 && 100 > rNumber) return { [`${lText} and ${rText}`]: lNumber + rNumber };
    else if (rNumber > lNumber) return { [`${lText} ${rText}`]: lNumber * rNumber };

    return { [`${lText} ${rText}`]: lNumber + rNumber };
  }
}

export default English;
