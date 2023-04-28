import {N2WordsRU} from './RU.mjs';

export class N2WordsSR extends N2WordsRU {
  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'zapeta',
      zero: 'nula'
    });

    this.ones = {
      1: ['jedan', 'jedna'],
      2: ['dva', 'dve'],
      3: ['tri', 'tri'],
      4: ['četiri', 'četiri'],
      5: ['pet', 'pet'],
      6: ['šest', 'šest'],
      7: ['sedam', 'sedam'],
      8: ['osam', 'osam'],
      9: ['devet', 'devet']
    };
    this.tens = {
      0: 'deset',
      1: 'jedanaest',
      2: 'dvanaest',
      3: 'trinaest',
      4: 'četrnaest',
      5: 'petnaest',
      6: 'šesnaest',
      7: 'sedamnaest',
      8: 'osamnaest',
      9: 'devetnaest'
    };
    this.twenties = {
      2: 'dvadeset',
      3: 'trideset',
      4: 'četrdeset',
      5: 'pedeset',
      6: 'šezdeset',
      7: 'sedamdeset',
      8: 'osamdeset',
      9: 'devedeset'
    };
    this.hundreds = {
      1: 'sto',
      2: 'dvesta',
      3: 'trista',
      4: 'četiristo',
      5: 'petsto',
      6: 'šesto',
      7: 'sedamsto',
      8: 'osamsto',
      9: 'devetsto'
    };
    this.SCALE = {
      0: ['', '', '', false],
      1: ['hiljada', 'hiljade', 'hiljada', true], // 10 ^ 3
      2: ['milion', 'miliona', 'miliona', false], // 10 ^ 6
      3: ['milijarda', 'milijarde', 'milijarda', false], // 10 ^ 9
      4: ['bilion', 'biliona', 'biliona', false], // 10 ^ 12
      5: ['bilijarda', 'bilijarde', 'bilijarda', false], // 10 ^ 15
      6: ['trilion', 'triliona', 'triliona', false], // 10 ^ 18
      7: ['trilijarda', 'trilijarde', 'trilijarda', false], // 10 ^ 21
      8: ['kvadrilion', 'kvadriliona', 'kvadriliona', false], // 10 ^ 24
      9: ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda', false], // 10 ^ 27
      10: ['kvintilion', 'kvintiliona', 'kvintiliona', false], // 10 ^ 30
    };
    this.feminine = false;
  }

  pluralize(n, forms) {
    let form = 2;
    if ((n % 100 < 10) || (n % 100 > 20)) {
      if (n % 10 == 1) {
        form = 0;
      } else if ((n % 10 > 1) && (n % 10 < 5)) {
        form = 1;
      }
    }
    return forms[form];
  }

  toCardinal(number) {
    if (parseInt(number) == 0) {
      return this.zero;
    }
    const words = [];
    const chunks = this.splitByX(JSON.stringify(number), 3);
    let i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      const x = chunks[j];
      i = i - 1;
      // if (x == 0) { continue; }
      const [n1, n2, n3] = this.getDigits(x);
      if (n3 > 0) {
        words.push(this.hundreds[n3]);
      }
      if (n2 > 1) {
        words.push(this.twenties[n2]);
      }
      if (n2 == 1) {
        words.push(this.tens[n1]);
      } else if (n1 > 0) {
        const isFeminine = (this.feminine || this.SCALE[i][3]);
        const genderIdx = isFeminine ? 1 : 0;
        words.push(this.ones[n1][genderIdx]);
      }
      if ((i > 0) && (x != 0)) {
        words.push(this.pluralize(x, this.SCALE[i]));
      }
    }
    return words.join(' ');
  }
}

export default function(n) {
  return new N2WordsSR().floatToCardinal(n);
}
