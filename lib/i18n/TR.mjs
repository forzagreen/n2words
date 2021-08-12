import N2WordsBase from '../classes/N2WordsBase.mjs';

export class N2WordsTR extends N2WordsBase {
  constructor(options) {
    super();

    this.options = Object.assign({
      dropSpaces: false,
    }, options);

    this.negativeWord = 'eksi';
    this.separatorWord = 'virgül';
    this.zero = 'sıfır';
    this.spaceSeparator = (this.options.dropSpaces) ? '' : ' ';
    this.precision = 2;

    this.cardinalOnes = {
      1: 'bir',
      2: 'iki',
      3: 'üç',
      4: 'dört',
      5: 'beş',
      6: 'altı',
      7: 'yedi',
      8: 'sekiz',
      9: 'dokuz',
    };
    this.cardinalTens = {
      1: 'on',
      2: 'yirmi',
      3: 'otuz',
      4: 'kırk',
      5: 'elli',
      6: 'altmış',
      7: 'yetmiş',
      8: 'seksen',
      9: 'doksan',
    };
    this.hundreds = {
      2: 'iki',
      3: 'üç',
      4: 'dört',
      5: 'beş',
      6: 'altı',
      7: 'yedi',
      8: 'sekiz',
      9: 'dokuz',
    };
    this.cardinalHundred = ['yüz', ''];
    this.cardinalTriplets = {
      1: 'bin',
      2: 'milyon',
      3: 'milyar',
      4: 'trilyon',
      5: 'katrilyon',
      6: 'kentilyon',
    };
    this.integersToRead = [];
    this.totalTripletsToRead = 0;
    this.totalDigitsOutsideTriplets = 0;
    this.lastZeroDigitOrder = 0;
  }

  splitNum(value) {
    const floatDigits = JSON.stringify(value * 10 ** this.precision);
    if (parseInt(value) != 0) {
      this.integersToRead = [
        JSON.stringify(parseInt(value)),
        floatDigits.slice(floatDigits.length - this.precision, floatDigits.length),
      ];
    } else {
      this.integersToRead = [
        '0',
        '0'.repeat(this.precision - floatDigits.length) +
          floatDigits.slice(floatDigits.length - this.precision, floatDigits.length),
      ];
    }
    if (this.integersToRead[0].length % 3 > 0) {
      this.totalTripletsToRead = Math.floor(this.integersToRead[0].length / 3) + 1;
    } else if (this.integersToRead[0].length % 3 == 0) {
      this.totalTripletsToRead = Math.floor(this.integersToRead[0].length / 3);
    }
    this.totalDigitsOutsideTriplets = this.integersToRead[0].length % 3;

    const okunacak = this.integersToRead[0].split('').reverse();
    this.lastZeroDigitOrder = 0;
    let found = 0;
    for (let i = 0; i < okunacak.length; i++) {
      if (parseInt(okunacak[i]) == 0 && found == 0) {
        this.lastZeroDigitOrder = i + 1;
      } else {
        found = 1;
      }
    }
  }

  joinWords(wordArray) {
    return wordArray.join(this.spaceSeparator).trim();
  }

  toCardinal(value) {
    if (parseInt(value) == 0) {
      return 'sıfır';
    }
    this.splitNum(value);
    let wordArray = [];
    if (this.lastZeroDigitOrder >= this.integersToRead[0].length) {
      return this.joinWords(wordArray);
    }
    if (this.totalTripletsToRead == 1) {
      if (this.totalDigitsOutsideTriplets == 2) {
        if (this.lastZeroDigitOrder == 1) {
          if(this.cardinalTens[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][0]]);
          }
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == 0) {
          if(this.cardinalTens[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][0]]);
          }
          if(this.cardinalOnes[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][1]]);
          }
        }
        return this.joinWords(wordArray);
      }
      if (this.totalDigitsOutsideTriplets == 1) {
        if (this.lastZeroDigitOrder == 0) {
          if(this.cardinalOnes[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][0]]);
          }
          return this.joinWords(wordArray);
        }
      }
      if (this.totalDigitsOutsideTriplets == 0) {
        if (this.lastZeroDigitOrder == 2) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == 1) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          if(this.cardinalTens[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][1]]);
          }
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == 0) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          if(this.cardinalTens[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][1]]);
          }
          if(this.cardinalOnes[this.integersToRead[0][2]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][2]]);
          }
          return this.joinWords(wordArray);
        }
      }
    }
    if (this.totalTripletsToRead >= 2) {
      if (this.totalDigitsOutsideTriplets == 2) {
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 1) {
          if(this.cardinalTens[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 2) {
          if(this.cardinalTens[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][0]]);
          }
          if(this.cardinalOnes[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][1]]);
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder < this.integersToRead[0].length - 2) {
          if(this.cardinalTens[this.integersToRead[0][0]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][0]]);
          }
          if(this.cardinalOnes[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][1]]);
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
        }
      }
      if (this.totalDigitsOutsideTriplets == 1) {
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 1) {
          if (!(this.totalTripletsToRead == 2 && this.integersToRead[0][0] == '1')) {
            if(this.cardinalOnes[this.integersToRead[0][0]]) {
              wordArray.push(this.cardinalOnes[this.integersToRead[0][0]]);
            }
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder < this.integersToRead[0].length - 1) {
          if (!(this.totalTripletsToRead == 2 && this.integersToRead[0][0] == '1')) {
            if(this.cardinalOnes[this.integersToRead[0][0]]) {
              wordArray.push(this.cardinalOnes[this.integersToRead[0][0]]);
            }
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
        }
      }
      if (this.totalDigitsOutsideTriplets == 0) {
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 1) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 2) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          if(this.cardinalTens[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][1]]);
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder == this.integersToRead[0].length - 3) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          if(this.cardinalTens[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][1]]);
          }
          if(this.cardinalOnes[this.integersToRead[0][2]]) {
            wordArray.push(this.cardinalOnes[this.integersToRead[0][2]]);
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
          return this.joinWords(wordArray);
        }
        if (this.lastZeroDigitOrder < this.integersToRead[0].length - 3) {
          if(this.hundreds[this.integersToRead[0][0]]) {
            wordArray.push(this.hundreds[this.integersToRead[0][0]]);
          }
          wordArray.push(this.cardinalHundred[0]);
          if(this.cardinalTens[this.integersToRead[0][1]]) {
            wordArray.push(this.cardinalTens[this.integersToRead[0][1]]);
          }
          if (!(this.totalTripletsToRead == 2 && this.integersToRead[0][2] == '1')) {
            if(this.cardinalOnes[this.integersToRead[0][2]]) {
              wordArray.push(this.cardinalOnes[this.integersToRead[0][2]]);
            }
          }
          wordArray.push(this.cardinalTriplets[this.totalTripletsToRead - 1]);
        }
      }
      for (let i = this.totalTripletsToRead - 1; i > 0; i--) {
        const readingTripletOrder = this.totalTripletsToRead - i;
        let lastReadDigitOrder;
        if (this.totalDigitsOutsideTriplets == 0) {
          lastReadDigitOrder = readingTripletOrder * 3;
        } else {
          lastReadDigitOrder = (readingTripletOrder - 1) * 3 + this.totalDigitsOutsideTriplets;
        }
        if (this.integersToRead[0].slice(lastReadDigitOrder, lastReadDigitOrder + 3) != '000') {
          if (this.integersToRead[0][lastReadDigitOrder] != '0') {
            if(this.hundreds[this.integersToRead[0][lastReadDigitOrder]]) {
              wordArray.push(this.hundreds[this.integersToRead[0][lastReadDigitOrder]]);
            }
            if (this.lastZeroDigitOrder == this.integersToRead[0].length - lastReadDigitOrder - 1) {
              if (i == 1) {
                wordArray.push(this.cardinalHundred[0]);
                return this.joinWords(wordArray);
              } else if (i > 1) {
                wordArray.push(this.cardinalHundred[0]);
                wordArray.push(this.cardinalTriplets[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              wordArray.push(this.cardinalHundred[0]);
            }
          }
          if (this.integersToRead[0][lastReadDigitOrder + 1] != '0') {
            if (this.lastZeroDigitOrder == this.integersToRead[0].length - lastReadDigitOrder - 2) {
              if (i == 1) {
                if(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]) {
                  wordArray.push(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]);
                }
                return this.joinWords(wordArray);
              } else if (i > 1) {
                if(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]) {
                  wordArray.push(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]);
                }
                wordArray.push(this.cardinalTriplets[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              if(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]) {
                wordArray.push(this.cardinalTens[this.integersToRead[0][lastReadDigitOrder + 1]]);
              }
            }
          }
          if (this.integersToRead[0][lastReadDigitOrder + 2] != '0') {
            if (this.lastZeroDigitOrder == this.integersToRead[0].length - lastReadDigitOrder - 3) {
              if (i == 1) {
                if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                  wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                }
                return this.joinWords(wordArray);
              }
              if (i == 2) {
                if (this.integersToRead[0].slice(lastReadDigitOrder, lastReadDigitOrder + 2) != '00') {
                  if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                    wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                  }
                } else if (this.integersToRead[0][lastReadDigitOrder + 2] != '1') {
                  if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                    wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                  }
                }
                wordArray.push(this.cardinalTriplets[i - 1]);
                return this.joinWords(wordArray);
              }
              if (i > 2) {
                if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                  wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                }
                wordArray.push(this.cardinalTriplets[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              if (this.integersToRead[0].slice(lastReadDigitOrder, lastReadDigitOrder + 2) != '00') {
                if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                  wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                }
              } else {
                if (i == 2) {
                  if (this.integersToRead[0].slice(lastReadDigitOrder, lastReadDigitOrder + 2) != '00') {
                    if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                      wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                    }
                  } else if (this.integersToRead[0][lastReadDigitOrder + 2] != '1') {
                    if(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]) {
                      wordArray.push(this.cardinalOnes[this.integersToRead[0][lastReadDigitOrder + 2]]);
                    }
                  }
                }
              }
            }
          }

          wordArray.push(this.cardinalTriplets[i - 1]);
        }
      }
    }
    return this.joinWords(wordArray);
  }
}

export default function(n, options = {}) {
  return new N2WordsTR(options).floatToCardinal(n);
}
