import num2WordRU from './RU.mjs';

export default function () {
  num2WordRU.call(this);

  this.negative_word = 'minus';
  this.separator_word = 'kablelis';
  this.feminine = false;
  this.ZERO = 'nulis';
  this.ONES = {
    1: 'vienas',
    2: 'du',
    3: 'trys',
    4: 'keturi',
    5: 'penki',
    6: 'šeši',
    7: 'septyni',
    8: 'aštuoni',
    9: 'devyni'
  };
  this.ONES_FEMININE = {
    1: 'viena',
    2: 'dvi',
    3: 'trys',
    4: 'keturios',
    5: 'penkios',
    6: 'šešios',
    7: 'septynios',
    8: 'aštuonios',
    9: 'devynios'
  };
  this.TENS = {
    0: 'dešimt',
    1: 'vienuolika',
    2: 'dvylika',
    3: 'trylika',
    4: 'keturiolika',
    5: 'penkiolika',
    6: 'šešiolika',
    7: 'septyniolika',
    8: 'aštuoniolika',
    9: 'devyniolika'
  };
  this.TWENTIES = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  };
  this.HUNDREDS = ['šimtas', 'šimtai'];
  this.THOUSANDS = {
    1: ['tūkstantis', 'tūkstančiai', 'tūkstančių'],
    2: ['milijonas', 'milijonai', 'milijonų'],
    3: ['milijardas', 'milijardai', 'milijardų'],
    4: ['trilijonas', 'trilijonai', 'trilijonų'],
    5: ['kvadrilijonas', 'kvadrilijonai', 'kvadrilijonų'],
    6: ['kvintilijonas', 'kvintilijonai', 'kvintilijonų'],
    7: ['sikstilijonas', 'sikstilijonai', 'sikstilijonų'],
    8: ['septilijonas', 'septilijonai', 'septilijonų'],
    9: ['oktilijonas', 'oktilijonai', 'oktilijonų'],
    10: ['naintilijonas', 'naintilijonai', 'naintilijonų'],
  };

  this.pluralize = (n, forms) => {
    let form = 1;
    const [n1, n2] = this.get_digits(n);
    if (n2 == 1 || n1 == 0 || n == 0) {
      form = 2;
    } else if (n1 == 1) {
      form = 0;
    }
    return forms[form];
  };

  this.toCardinal = number => {
    if (parseInt(number) == 0) {
      return this.ZERO;
    }
    const words = [];
    const chunks = this.splitbyx(JSON.stringify(number), 3);
    let i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      const x = chunks[j];
      i = i - 1;
      if (x == 0) {
        continue;
      }
      const [n1, n2, n3] = this.get_digits(x);
      if (n3 > 0) {
        words.push(this.ONES[n3]);
        if (n3 > 1) {
          words.push(this.HUNDREDS[1]);
        } else {
          words.push(this.HUNDREDS[0]);
        }
      }
      if (n2 > 1) {
        words.push(this.TWENTIES[n2]);
      }
      if (n2 == 1) {
        words.push(this.TENS[n1]);
      } else if (n1 > 0) {
        if ((i == 1 || this.feminine && i == 0) && number < 1000) {
          words.push(this.ONES_FEMININE[n1]);
        } else {
          words.push(this.ONES[n1]);
        }
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.THOUSANDS[i]));
      }
    }
    return words.join(' ');
  };
}
