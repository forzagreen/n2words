const assert = require('assert');
const n2words = require('../index.js');


const testCasesGerman = [
  [0, 'null'],
  [1, 'eins'],
  [2, 'zwei'],
  [3, 'drei'],
  [11, 'elf'],
  [12, 'zwölf'],
  [16, 'sechzehn'],
  [19, 'neunzehn'],
  [20, 'zwanzig'],
  [21, 'einundzwanzig'],
  [26, 'sechsundzwanzig'],
  [28, 'achtundzwanzig'],
  [30, 'dreißig'],
  [31, 'einunddreißig'],
  [40, 'vierzig'],
  [44, 'vierundvierzig'],
  [50, 'fünfzig'],
  [55, 'fünfundfünfzig'],
  [60, 'sechzig'],
  [67, 'siebenundsechzig'],
  [70, 'siebzig'],
  [79, 'neunundsiebzig'],
  [89, 'neunundachtzig'],
  [95, 'fünfundneunzig'],
  [100, 'einhundert'],
  [101, 'einhunderteins'],
  [199, 'einhundertneunundneunzig'],
  [203, 'zweihundertdrei'],
  [287, 'zweihundertsiebenundachtzig'],
  [356, 'dreihundertsechsundfünfzig'],
  [400, 'vierhundert'],
  [434, 'vierhundertvierunddreißig'],
  [578, 'fünfhundertachtundsiebzig'],
  [689, 'sechshundertneunundachtzig'],
  [729, 'siebenhundertneunundzwanzig'],
  [894, 'achthundertvierundneunzig'],
  [999, 'neunhundertneunundneunzig'],
  [1000, 'eintausend'],
  [1001, 'eintausendeins'],
  [1097, 'eintausendsiebenundneunzig'],
  [1104, 'eintausendeinhundertvier'],
  [1243, 'eintausendzweihundertdreiundvierzig'],
  [2385, 'zweitausenddreihundertfünfundachtzig'],
  [3766, 'dreitausendsiebenhundertsechsundsechzig'],
  [4196, 'viertausendeinhundertsechsundneunzig'],
  [5846, 'fünftausendachthundertsechsundvierzig'],
  [6459, 'sechstausendvierhundertneunundfünfzig'],
  [7232, 'siebentausendzweihundertzweiunddreißig'],
  [8569, 'achttausendfünfhundertneunundsechzig'],
  [9539, 'neuntausendfünfhundertneununddreißig'],
  [1000000, 'eine million'],
  [1000001, 'eine million eins'],
  [4000000, 'vier millionen'],
  [10000000000000, 'zehn billionen'],
  [100000000000000, 'einhundert billionen'],
  [1000000000000000000, 'eine trillion']
]

describe('German', function () {
  it('should convert numbers correctly (German)', function () {
    for (let i = 0; i < testCasesGerman.length; i++) {
      assert.equal(n2words(testCasesGerman[i][0], { lang: 'de' }), testCasesGerman[i][1])
    }
  });
});
