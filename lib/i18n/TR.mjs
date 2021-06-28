import N2WordsBase from '../classes/N2WordsBase.mjs';

export default function(options) {
  N2WordsBase.call(this);

  let defaultOptions = { dropSpaces: false };
  let localOptions = Object.assign({}, defaultOptions, options);

  this.negative_word = 'eksi';
  this.separator_word = 'virgül';
  this.ZERO = 'sıfır';
  this.space_separator = (localOptions.dropSpaces) ? '' : ' ';
  this.precision = 2;
  this.splitnum = value => {
    const float_digits = JSON.stringify(value * 10 ** this.precision);
    if (parseInt(value) != 0) {
      this.integers_to_read = [
        JSON.stringify(parseInt(value)),
        float_digits.slice(float_digits.length - this.precision, float_digits.length),
      ];
    } else {
      this.integers_to_read = [
        '0',
        '0'.repeat(this.precision - float_digits.length) +
          float_digits.slice(float_digits.length - this.precision, float_digits.length),
      ];
    }
    if (this.integers_to_read[0].length % 3 > 0) {
      this.total_triplets_to_read = Math.floor(this.integers_to_read[0].length / 3) + 1;
    } else if (this.integers_to_read[0].length % 3 == 0) {
      this.total_triplets_to_read = Math.floor(this.integers_to_read[0].length / 3);
    }
    this.total_digits_outside_triplets = this.integers_to_read[0].length % 3;

    const okunacak = this.integers_to_read[0].split('').reverse();
    this.order_of_last_zero_digit = 0;
    let found = 0;
    for (let i = 0; i < okunacak.length; i++) {
      if (parseInt(okunacak[i]) == 0 && found == 0) {
        this.order_of_last_zero_digit = i + 1;
      } else {
        found = 1;
      }
    }
  };

  this.CARDINAL_ONES = {
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
  this.CARDINAL_TENS = {
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
  this.HUNDREDS = {
    2: 'iki',
    3: 'üç',
    4: 'dört',
    5: 'beş',
    6: 'altı',
    7: 'yedi',
    8: 'sekiz',
    9: 'dokuz',
  };
  this.CARDINAL_HUNDRED = ['yüz', ''];
  this.CARDINAL_TRIPLETS = {
    1: 'bin',
    2: 'milyon',
    3: 'milyar',
    4: 'trilyon',
    5: 'katrilyon',
    6: 'kentilyon',
  };
  this.integers_to_read = [];
  this.total_triplets_to_read = 0;
  this.total_digits_outside_triplets = 0;
  this.order_of_last_zero_digit = 0;
  this.joinWords = wordArray => {
    return wordArray.join(this.space_separator).trim();
  };

  this.toCardinal = value => {
    if (parseInt(value) == 0) {
      return 'sıfır';
    }
    this.splitnum(value);
    let wordArray = [];
    if (this.order_of_last_zero_digit >= this.integers_to_read[0].length) {
      return this.joinWords(wordArray);
    }
    if (this.total_triplets_to_read == 1) {
      if (this.total_digits_outside_triplets == 2) {
        if (this.order_of_last_zero_digit == 1) {
          if(this.CARDINAL_TENS[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][0]]);
          }
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == 0) {
          if(this.CARDINAL_TENS[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][0]]);
          }
          if(this.CARDINAL_ONES[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][1]]);
          }
        }
        return this.joinWords(wordArray);
      }
      if (this.total_digits_outside_triplets == 1) {
        if (this.order_of_last_zero_digit == 0) {
          if(this.CARDINAL_ONES[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][0]]);
          }
          return this.joinWords(wordArray);
        }
      }
      if (this.total_digits_outside_triplets == 0) {
        if (this.order_of_last_zero_digit == 2) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == 1) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          if(this.CARDINAL_TENS[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][1]]);
          }
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == 0) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          if(this.CARDINAL_TENS[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][1]]);
          }
          if(this.CARDINAL_ONES[this.integers_to_read[0][2]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][2]]);
          }
          return this.joinWords(wordArray);
        }
      }
    }
    if (this.total_triplets_to_read >= 2) {
      if (this.total_digits_outside_triplets == 2) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          if(this.CARDINAL_TENS[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 2) {
          if(this.CARDINAL_TENS[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][0]]);
          }
          if(this.CARDINAL_ONES[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][1]]);
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 2) {
          if(this.CARDINAL_TENS[this.integers_to_read[0][0]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][0]]);
          }
          if(this.CARDINAL_ONES[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][1]]);
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
        }
      }
      if (this.total_digits_outside_triplets == 1) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][0] == '1')) {
            if(this.CARDINAL_ONES[this.integers_to_read[0][0]]) {
              wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][0]]);
            }
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 1) {
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][0] == '1')) {
            if(this.CARDINAL_ONES[this.integers_to_read[0][0]]) {
              wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][0]]);
            }
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
        }
      }
      if (this.total_digits_outside_triplets == 0) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 2) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          if(this.CARDINAL_TENS[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][1]]);
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 3) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          if(this.CARDINAL_TENS[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][1]]);
          }
          if(this.CARDINAL_ONES[this.integers_to_read[0][2]]) {
            wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][2]]);
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
          return this.joinWords(wordArray);
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 3) {
          if(this.HUNDREDS[this.integers_to_read[0][0]]) {
            wordArray.push(this.HUNDREDS[this.integers_to_read[0][0]]);
          }
          wordArray.push(this.CARDINAL_HUNDRED[0]);
          if(this.CARDINAL_TENS[this.integers_to_read[0][1]]) {
            wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][1]]);
          }
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][2] == '1')) {
            if(this.CARDINAL_ONES[this.integers_to_read[0][2]]) {
              wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][2]]);
            }
          }
          wordArray.push(this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]);
        }
      }
      for (let i = this.total_triplets_to_read - 1; i > 0; i--) {
        const reading_triplet_order = this.total_triplets_to_read - i;
        let last_read_digit_order;
        if (this.total_digits_outside_triplets == 0) {
          last_read_digit_order = reading_triplet_order * 3;
        } else {
          last_read_digit_order = (reading_triplet_order - 1) * 3 + this.total_digits_outside_triplets;
        }
        if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 3) != '000') {
          if (this.integers_to_read[0][last_read_digit_order] != '0') {
            if(this.HUNDREDS[this.integers_to_read[0][last_read_digit_order]]) {
              wordArray.push(this.HUNDREDS[this.integers_to_read[0][last_read_digit_order]]);
            }
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 1) {
              if (i == 1) {
                wordArray.push(this.CARDINAL_HUNDRED[0]);
                return this.joinWords(wordArray);
              } else if (i > 1) {
                wordArray.push(this.CARDINAL_HUNDRED[0]);
                wordArray.push(this.CARDINAL_TRIPLETS[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              wordArray.push(this.CARDINAL_HUNDRED[0]);
            }
          }
          if (this.integers_to_read[0][last_read_digit_order + 1] != '0') {
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 2) {
              if (i == 1) {
                if(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]) {
                  wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]);
                }
                return this.joinWords(wordArray);
              } else if (i > 1) {
                if(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]) {
                  wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]);
                }
                wordArray.push(this.CARDINAL_TRIPLETS[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              if(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]) {
                wordArray.push(this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]]);
              }
            }
          }
          if (this.integers_to_read[0][last_read_digit_order + 2] != '0') {
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 3) {
              if (i == 1) {
                if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                  wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                }
                return this.joinWords(wordArray);
              }
              if (i == 2) {
                if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                  if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                    wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                  }
                } else if (this.integers_to_read[0][last_read_digit_order + 2] != '1') {
                  if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                    wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                  }
                }
                wordArray.push(this.CARDINAL_TRIPLETS[i - 1]);
                return this.joinWords(wordArray);
              }
              if (i > 2) {
                if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                  wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                }
                wordArray.push(this.CARDINAL_TRIPLETS[i - 1]);
                return this.joinWords(wordArray);
              }
            } else {
              if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                  wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                }
              } else {
                if (i == 2) {
                  if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                    if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                      wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                    }
                  } else if (this.integers_to_read[0][last_read_digit_order + 2] != '1') {
                    if(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]) {
                      wordArray.push(this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]]);
                    }
                  }
                }
              }
            }
          }

          wordArray.push(this.CARDINAL_TRIPLETS[i - 1]);
        }
      }
    }
    return this.joinWords(wordArray);
  };
}
