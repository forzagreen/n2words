const assert = require('assert');
const n2words = require('../dist/n2words.min.js');

const testCasesFrench = [
  [0, 'zéro'],
  [1, 'un'],
  [2, 'deux'],
  [3, 'trois'],
  // [5.5, 'cinq virgule cinq'],
  [11, 'onze'],
  [12, 'douze'],
  [16, 'seize'],
  // [17.42, 'dix-sept virgule quatre deux'],
  [19, 'dix-neuf'],
  [20, 'vingt'],
  [21, 'vingt et un'],
  [26, 'vingt-six'],
  // [27.312, 'vingt-sept virgule trois un deux'],
  [28, 'vingt-huit'],
  [30, 'trente'],
  [31, 'trente et un'],
  [40, 'quarante'],
  [44, 'quarante-quatre'],
  [50, 'cinquante'],
  // [53.486, 'cinquante-trois virgule quatre huit six'],
  [55, 'cinquante-cinq'],
  [60, 'soixante'],
  [67, 'soixante-sept'],
  [70, 'soixante-dix'],
  [79, 'soixante-dix-neuf'],
  [89, 'quatre-vingt-neuf'],
  [95, 'quatre-vingt-quinze'],
  [100, 'cent'],
  [101, 'cent un'],
  [199, 'cent quatre-vingt-dix-neuf'],
  [203, 'deux cent trois'],
  [287, 'deux cent quatre-vingt-sept'],
  // [300.42, 'trois cents virgule quatre deux'],
  [356, 'trois cent cinquante-six'],
  [400, 'quatre cents'],
  [434, 'quatre cent trente-quatre'],
  [578, 'cinq cent soixante-dix-huit'],
  [689, 'six cent quatre-vingt-neuf'],
  [729, 'sept cent vingt-neuf'],
  [894, 'huit cent quatre-vingt-quatorze'],
  [999, 'neuf cent quatre-vingt-dix-neuf'],
  [1000, 'mille'],
  [1001, 'mille un'],
  [1097, 'mille quatre-vingt-dix-sept'],
  [1104, 'mille cent quatre'],
  [1243, 'mille deux cent quarante-trois'],
  [2385, 'deux mille trois cent quatre-vingt-cinq'],
  [3766, 'trois mille sept cent soixante-six'],
  [4196, 'quatre mille cent quatre-vingt-seize'],
  // [4196.42, 'quatre mille cent quatre-vingt-seize virgule quatre deux'],
  [5846, 'cinq mille huit cent quarante-six'],
  [6459, 'six mille quatre cent cinquante-neuf'],
  [7232, 'sept mille deux cent trente-deux'],
  [8569, 'huit mille cinq cent soixante-neuf'],
  [9539, 'neuf mille cinq cent trente-neuf'],
  [1000000, 'un million'],
  [1000001, 'un million un'],
  [4000000, 'quatre millions'],
  [4000004, 'quatre millions quatre'],
  [4300000, 'quatre millions trois cent mille'],
  [80000000, 'quatre-vingts millions'],
  [300000000, 'trois cents millions'],
  [10000000000000, 'dix billions'],
  [10000000000010, 'dix billions dix'],
  [100000000000000, 'cent billions'],
  [1000000000000000000, 'un trillion'],
  // [1000000000000000000000, 'un trilliard'],         //FIXME
  // [10000000000000000000000000, 'dix quadrillions']  //FIXME
]

describe('French', function () {
  it('should convert numbers correctly (French)', function () {
    for (let i = 0; i < testCasesFrench.length; i++) {
      assert.equal(n2words(testCasesFrench[i][0], { lang: 'fr' }), testCasesFrench[i][1])
    }
  });
});
