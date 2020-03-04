const assert = require('assert');
const n2words = require('../dist/n2words.min.js');

const testCasesLatvian = [
  [0, 'nulle'],
  [1, 'viens'],
  [2, 'divi'],
  [3, 'trīs'],
  [11, 'vienpadsmit'],
  [12, 'divpadsmit'],
  [16, 'sešpadsmit'],
  [19, 'deviņpadsmit'],
  [20, 'divdesmit'],
  [21, 'divdesmit viens'],
  [26, 'divdesmit seši'],
  [28, 'divdesmit astoņi'],
  [30, 'trīsdesmit'],
  [31, 'trīsdesmit viens'],
  [40, 'četrdesmit'],
  [44, 'četrdesmit četri'],
  [50, 'piecdesmit'],
  [55, 'piecdesmit pieci'],
  [60, 'sešdesmit'],
  [67, 'sešdesmit septiņi'],
  [70, 'septiņdesmit'],
  [79, 'septiņdesmit deviņi'],
  [89, 'astoņdesmit deviņi'],
  [95, 'deviņdesmit pieci'],
  [100, 'simts'],
  [101, 'simtu viens'],
  [199, 'simts deviņdesmit deviņi'],
  [203, 'divi simti trīs'],
  [287, 'divi simti astoņdesmit septiņi'],
  [356, 'trīs simti piecdesmit seši'],
  [400, 'četri simti'],
  [434, 'četri simti trīsdesmit četri'],
  [578, 'pieci simti septiņdesmit astoņi'],
  [689, 'seši simti astoņdesmit deviņi'],
  [729, 'septiņi simti divdesmit deviņi'],
  [894, 'astoņi simti deviņdesmit četri'],
  [999, 'deviņi simti deviņdesmit deviņi'],
  [1000, 'tūkstotis'],
  [1001, 'tūkstotis viens'],
  [1097, 'tūkstotis deviņdesmit septiņi'],
  [1104, 'tūkstotis simtu četri'],
  [1243, 'tūkstotis divi simti četrdesmit trīs'],
  [2385, 'divi tūkstoši trīs simti astoņdesmit pieci'],
  [3766, 'trīs tūkstoši septiņi simti sešdesmit seši'],
  [4196, 'četri tūkstoši simts deviņdesmit seši'],
  [5846, 'pieci tūkstoši astoņi simti četrdesmit seši'],
  [6459, 'seši tūkstoši četri simti piecdesmit deviņi'],
  [7232, 'septiņi tūkstoši divi simti trīsdesmit divi'],
  [8569, 'astoņi tūkstoši pieci simti sešdesmit deviņi'],
  [9539, 'deviņi tūkstoši pieci simti trīsdesmit deviņi'],
  [1000000, 'miljons'],
  [1000001, 'miljons viens'],
  [4000000, 'četri miljoni'],
  [10000000000000, 'desmit triljoni'],
  [100000000000000, 'simts triljoni'],
  [1000000000000000000, 'kvintiljons']
]


describe('Latvian', function () {
  it('should convert numbers correctly (Latvian)', function () {
    for (let i = 0; i < testCasesLatvian.length; i++) {
      assert.equal(n2words(testCasesLatvian[i][0], { lang: 'lv' }), testCasesLatvian[i][1])
    }
  });
});
