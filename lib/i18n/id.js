import AbstractLanguage from '../classes/abstract-language.js';

/**
 * @augments AbstractLanguage
 */
class N2WordsID extends AbstractLanguage {
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
    options = Object.assign({
      negativeWord: 'min',
      separatorWord: 'koma',
      zero: 'nol'
    }, options);

    super(options);
  }

  splitBy3(number) {
    // Split to groups of 3 numbers: 1234567 -> [['1'], ['234'], ['567']]
    let blocks = [];
    let stringNumber = number.toString();
    let length = stringNumber.length;
    let firstBlock;

    if (length < 3) {
      blocks.push([stringNumber]);
    } else {
      let firstBlockLength = length % 3;

      if (firstBlockLength > 0) {
        firstBlock = [stringNumber.slice(0, firstBlockLength)];
        blocks.push(firstBlock);
      }

      for (let index = firstBlockLength; index < length; index += 3) {
        let nextBlock = [stringNumber.slice(index, index + 3)];
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
      spelling = firstBlock[0] == '0' ? ['nol'] : this.base[Math.trunc(firstBlock[0])];
    } else if (firstBlock[0].length == 2) {
      spelling = this.getTens(firstBlock[0]);
    } else {
      spelling = [...this.getHundreds(firstBlock[0][0]), ...this.getTens(firstBlock[0].slice(1, 3))];
    }
    wordBlocks = [...wordBlocks, [firstBlock[0], spelling]];
    for (let index = 1; index < blocks.length; index++) {
      let block = blocks[index];
      spelling = [...this.getHundreds(block[0][0]), ...this.getTens(block[0].slice(1, 3))];
      block = [...block, spelling];
      wordBlocks = [...wordBlocks, block];
    }
    return wordBlocks;
  }

  getHundreds(number) { // 'ratus'
    if (number == '1') {
      return ['seratus'];
    } else if (number == '0') {
      return [];
    } else {
      return [...this.base[Math.trunc(number)], 'ratus'];
    }
  }

  getTens(number) { // 'puluh'
    if (number[0] == '1') {
      if (number[1] == '0') {
        return ['sepuluh'];
      } else if (number[1] == '1') {
        return ['sebelas'];
      } else {
        return [...this.base[Math.trunc(number[1])], 'belas'];
      }
    } else if (number[0] == '0') {
      return this.base[Math.trunc(number[1])];
    } else {
      return [...this.base[Math.trunc(number[0])], 'puluh', this.base[Math.trunc(number[1])]];
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
    for (let index = start; index < length + 1; index++) {
      wordList = [...wordList, ...wordBlocks[index][1]];
      if (wordBlocks[index][1].length === 0) {
        continue;
      }
      if (index == length) {
        break;
      }
      wordList = [...wordList, this.thousands[(length - index) * 3]];
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

export default N2WordsID;
