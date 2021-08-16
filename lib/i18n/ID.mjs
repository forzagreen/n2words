import N2WordsAbs from '../classes/N2WordsAbs.mjs';

export default function () {
  N2WordsAbs.call(this);

  this.negative_word = 'min';
  this.separator_word = 'koma';
  this.ZERO = 'nol';
  this.BASE = {
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
  this.THOUSANDS = {
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

  this.splitBy3 = number => {
    // Split to groups of 3 numbers: 1234567 -> [['1'], ['234'], ['567']]
    let blocks = [];
    let strNumber = String(number);
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
  };

  this.spell = blocks => {
    // TODO: fix example
    // [['1'], ['034']] -> [['1', ['satu']], ['034', ['tiga', 'puluh', 'empat']]]
    let wordBlocks = [];
    let spelling;
    let firstBlock = blocks[0];
    if (firstBlock[0].length === 1) {
      if (firstBlock[0] === '0') {
        spelling = ['nol'];
      } else {
        spelling = this.BASE[parseInt(firstBlock[0])];
      }
    } else if (firstBlock[0].length === 2) {
      spelling = this.getTens(firstBlock[0]);
    } else {
      // TODO: fix me
      spelling = this.getHundreds(firstBlock[0][0]).concat(this.getTens(firstBlock[0].slice(1, 3)));
    }
    wordBlocks = wordBlocks.concat([[firstBlock[0], spelling]]);
    for (let i = 1; i < blocks.length; i++) {
      let block = blocks[i];
      spelling = this.getHundreds(block[0][0]).concat(this.getTens(block[0].slice(1, 3)));
      block = block.concat([spelling]);
      wordBlocks = wordBlocks.concat([block]);
    }
    return wordBlocks;
  };

  this.getHundreds = number => { // 'ratus'
    if (number === '1') {
      return ['seratus'];
    } else if (number === '0') {
      return [];
    } else {
      return this.BASE[parseInt(number)].concat(['ratus']);
    }
  };

  this.getTens = number => { // 'puluh'
    if (number[0] === '1') {
      if (number[1] === '0') {
        return ['sepuluh'];
      } else if (number[1] === '1') {
        return ['sebelas'];
      } else {
        return this.BASE[parseInt(number[1])].concat(['belas']);
      }
    } else if (number[0] === '0') {
      return this.BASE[parseInt(number[1])];
    } else {
      return this.BASE[parseInt(number[0])].concat(['puluh']).concat([this.BASE[parseInt(number[1])]]);
    }
  };

  this.join = wordBlocks => {
    let wordList = [];
    let length = wordBlocks.length - 1;
    let firstBlock = [wordBlocks[0]];
    let start = 0;
    if (length === 1 && firstBlock[0][0] === '1') {
      wordList.push('seribu');
      start = 1;
    }
    for (let i = start; i < length + 1; i++) {
      // wordList.push(wordBlocks[i][1]);
      wordList = wordList.concat(wordBlocks[i][1]);
      if (!wordBlocks[i][1].length) { // TODO: fix it
        continue;
      }
      if (i === length) {
        break;
      }
      wordList = wordList.concat([this.THOUSANDS[(length - i) * 3]]);
    }
    return wordList.join(' ');
  };


  this.toCardinal = number => {
    return this.join(
      this.spell(
        this.splitBy3(number)
      )
    ).trim();
  };
}
