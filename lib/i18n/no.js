import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsNO extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    }, options), [
      [1000000000000000000000000000000000n, 'quintillard'],
      [1000000000000000000000000000000n, 'quintillion'],
      [1000000000000000000000000000n, 'quadrillard'],
      [1000000000000000000000000n, 'quadrillion'],
      [1000000000000000000000n, 'trillard'],
      [1000000000000000000n, 'trillion'],
      [1000000000000000n, 'billard'],
      [1000000000000n, 'billion'],
      [1000000000n, 'millard'],
      [1000000n, 'million'],
      [1000n, 'tusen'],
      [100n, 'hundre'],
      [90n, 'nitti'],
      [80n, 'åtti'],
      [70n, 'sytti'],
      [60n, 'seksti'],
      [50n, 'femti'],
      [40n, 'førti'],
      [30n, 'tretti'],
      [20n, 'tjue'],
      [19n, 'nitten'],
      [18n, 'atten'],
      [17n, 'sytten'],
      [16n, 'seksten'],
      [15n, 'femten'],
      [14n, 'fjorten'],
      [13n, 'tretten'],
      [12n, 'tolv'],
      [11n, 'elleve'],
      [10n, 'ti'],
      [9n, 'ni'],
      [8n, 'åtte'],
      [7n, 'syv'],
      [6n, 'seks'],
      [5n, 'fem'],
      [4n, 'fire'],
      [3n, 'tre'],
      [2n, 'to'],
      [1n, 'en'],
      [0n, 'null']
    ]);
  }

  merge(lPair, rPair) { // {'one':1}, {'hundred':100}
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && rNum < 100) return { [rText]: rNum };
    else if (lNum < 100 && lNum > rNum) return { [`${lText}-${rText}`]: lNum + rNum };
    else if (lNum >= 100 && rNum < 100) return { [`${lText} og ${rText}`]: lNum + rNum };
    else if (rNum > lNum) return { [`${lText} ${rText}`]: lNum * rNum };
    return { [`${lText}, ${rText}`]: lNum + rNum };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} options Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value, options) {
  return new N2WordsNO(options).floatToCardinal(value);
}
