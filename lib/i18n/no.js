import BaseLanguage from '../classes/base-language.js';

/**
 * @augments BaseLanguage
 */
class N2WordsNO extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000_000_000_000n, 'quintillard'],
      [1_000_000_000_000_000_000_000_000_000_000n, 'quintillion'],
      [1_000_000_000_000_000_000_000_000_000n, 'quadrillard'],
      [1_000_000_000_000_000_000_000_000n, 'quadrillion'],
      [1_000_000_000_000_000_000_000n, 'trillard'],
      [1_000_000_000_000_000_000n, 'trillion'],
      [1_000_000_000_000_000n, 'billard'],
      [1_000_000_000_000n, 'billion'],
      [1_000_000_000n, 'millard'],
      [1_000_000n, 'million'],
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
    const lNumber = BigInt(Object.values(lPair)[0]);
    const rNumber = BigInt(Object.values(rPair)[0]);
    if (lNumber == 1 && rNumber < 100) return { [rText]: rNumber };
    else if (lNumber < 100 && lNumber > rNumber) return { [`${lText}-${rText}`]: lNumber + rNumber };
    else if (lNumber >= 100 && rNumber < 100) return { [`${lText} og ${rText}`]: lNumber + rNumber };
    else if (rNumber > lNumber) return { [`${lText} ${rText}`]: lNumber * rNumber };
    return { [`${lText}, ${rText}`]: lNumber + rNumber };
  }
}

export default N2WordsNO;
