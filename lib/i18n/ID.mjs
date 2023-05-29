import AbstractLanguage from '../classes/AbstractLanguage.mjs';

export class N2WordsID extends AbstractLanguage {
  base = {
    0: [],
    1: ['satu'],
    2: ['dua'],
    3: ['tiga'],
    4: ['empat'],
    5: ['lima'],
    6: ['enam'],
    7: ['tujuh'],
    8: ['delapan'],
    9: ['sembilan'],
  };

  thousands = {
    3: 'ribu', // 10^3
    6: 'juta', // 10^6
    9: 'miliar', // 10^9
    12: 'triliun',
    15: 'kuadriliun',
    18: 'kuantiliun',
    21: 'sekstiliun',
    24: 'septiliun',
    27: 'oktiliun',
    30: 'noniliun',
    33: 'desiliun',
  };

  constructor(options) {
    super(Object.assign({
      negativeWord: 'min',
      separatorWord: 'koma',
      zero: 'nol'
    }, options));
  }

  splitBy3(number) {
    // Split to groups of 3 numbers: 1234567 -> [['1'], ['234'], ['567']]
    let blocks = [];
    let strNumber = number.toString();
    let length = strNumber.length;
    let firstBlock;

    if (length < 3) {
      blocks.push([strNumber]);
    } else {
      let firstBlockLength = length % 3;

      if (firstBlockLength > 0) {
        firstBlock = [strNumber.slice(0, firstBlockLength)];
        blocks.push(firstBlock);
      }

      for (let i = firstBlockLength; i < length; i += 3) {
        let nextBlock = [strNumber.slice(i, i + 3)];
        blocks.push(nextBlock);
      }
    }
    return blocks;
  }

  spell(blocks) {
    // Example:
    // blocks: [['1'], ['234']]
    // return: [['1', ['satu']], ['234', ['dua', 'ratus', 'tiga', 'puluh', ['empat']]]]
    let wordBlocks = [];
    let spelling;
    let firstBlock = blocks[0];
    if (firstBlock[0].length == 1) {
      if (firstBlock[0] == '0') {
        spelling = ['nol'];
      } else {
        spelling = this.base[parseInt(firstBlock[0])];
      }
    } else if (firstBlock[0].length == 2) {
      spelling = this.getTens(firstBlock[0]);
    } else {
      spelling = this.getHundreds(
        firstBlock[0][0]
      ).concat(this.getTens(firstBlock[0].slice(1, 3)));
    }
    wordBlocks = wordBlocks.concat([[firstBlock[0], spelling]]);
    for (let i = 1; i < blocks.length; i++) {
      let block = blocks[i];
      spelling = this.getHundreds(block[0][0]).concat(
        this.getTens(block[0].slice(1, 3))
      );
      block = block.concat([spelling]);
      wordBlocks = wordBlocks.concat([block]);
    }
    return wordBlocks;
  }

  getHundreds(number) { // 'ratus'
    if (number == '1') {
      return ['seratus'];
    } else if (number == '0') {
      return [];
    } else {
      return this.base[parseInt(number)].concat(['ratus']);
    }
  }

  getTens(number) { // 'puluh'
    if (number[0] == '1') {
      if (number[1] == '0') {
        return ['sepuluh'];
      } else if (number[1] == '1') {
        return ['sebelas'];
      } else {
        return this.base[parseInt(number[1])].concat(['belas']);
      }
    } else if (number[0] == '0') {
      return this.base[parseInt(number[1])];
    } else {
      return this.base[parseInt(number[0])].concat(['puluh']).concat(
        [this.base[parseInt(number[1])]]
      );
    }
  }

  join(wordBlocks) {
    let wordList = [];
    let length = wordBlocks.length - 1;
    let firstBlock = [wordBlocks[0]];
    let start = 0;
    if (length == 1 && firstBlock[0][0] == '1') {
      wordList.push('seribu');
      start = 1;
    }
    for (let i = start; i < length + 1; i++) {
      wordList = wordList.concat(wordBlocks[i][1]);
      if (!wordBlocks[i][1].length) {
        continue;
      }
      if (i == length) {
        break;
      }
      wordList = wordList.concat([this.thousands[(length - i) * 3]]);
    }
    return wordList.join(' ');
  }

  toCardinal(number) {
    return this.join(
      this.spell(
        this.splitBy3(number)
      )
    ).trim();
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value) {
  return new N2WordsID().floatToCardinal(value);
}
