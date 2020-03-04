const assert = require('assert');
const n2words = require('../dist/n2words.min.js');


const testCasesLithuanian = [
  [0, 'nulis'],
  [1, 'vienas'],
  [2, 'du'],
  [3, 'trys'],
  [11, 'vienuolika'],
  [12, 'dvylika'],
  [16, 'šešiolika'],
  [19, 'devyniolika'],
  [20, 'dvidešimt'],
  [21, 'dvidešimt vienas'],
  [26, 'dvidešimt šeši'],
  [28, 'dvidešimt aštuoni'],
  [30, 'trisdešimt'],
  [31, 'trisdešimt vienas'],
  [40, 'keturiasdešimt'],
  [44, 'keturiasdešimt keturi'],
  [50, 'penkiasdešimt'],
  [55, 'penkiasdešimt penki'],
  [60, 'šešiasdešimt'],
  [67, 'šešiasdešimt septyni'],
  [70, 'septyniasdešimt'],
  [79, 'septyniasdešimt devyni'],
  [89, 'aštuoniasdešimt devyni'],
  [95, 'devyniasdešimt penki'],
  [100, 'vienas šimtas'],
  [101, 'vienas šimtas vienas'],
  [199, 'vienas šimtas devyniasdešimt devyni'],
  [203, 'du šimtai trys'],
  [287, 'du šimtai aštuoniasdešimt septyni'],
  [356, 'trys šimtai penkiasdešimt šeši'],
  [400, 'keturi šimtai'],
  [434, 'keturi šimtai trisdešimt keturi'],
  [578, 'penki šimtai septyniasdešimt aštuoni'],
  [689, 'šeši šimtai aštuoniasdešimt devyni'],
  [729, 'septyni šimtai dvidešimt devyni'],
  [894, 'aštuoni šimtai devyniasdešimt keturi'],
  [999, 'devyni šimtai devyniasdešimt devyni'],
  [1000, 'vienas tūkstantis'],
  [1001, 'vienas tūkstantis vienas'],
  [1097, 'vienas tūkstantis devyniasdešimt septyni'],
  [1104, 'vienas tūkstantis vienas šimtas keturi'],
  [1243, 'vienas tūkstantis du šimtai keturiasdešimt trys'],
  [2385, 'du tūkstančiai trys šimtai aštuoniasdešimt penki'],
  [3766, 'trys tūkstančiai septyni šimtai šešiasdešimt šeši'],
  [4196, 'keturi tūkstančiai vienas šimtas devyniasdešimt šeši'],
  [5846, 'penki tūkstančiai aštuoni šimtai keturiasdešimt šeši'],
  [6459, 'šeši tūkstančiai keturi šimtai penkiasdešimt devyni'],
  [7232, 'septyni tūkstančiai du šimtai trisdešimt du'],
  [8569, 'aštuoni tūkstančiai penki šimtai šešiasdešimt devyni'],
  [9539, 'devyni tūkstančiai penki šimtai trisdešimt devyni'],
  [1000000, 'vienas milijonas'],
  [1000001, 'vienas milijonas vienas'],
  [4000000, 'keturi milijonai'],
  [10000000000000, 'dešimt trilijonų'],
  [100000000000000, 'vienas šimtas trilijonų'],
  [1000000000000000000, 'vienas kvintilijonas']
]

describe('Lithuanian', function () {
  it('should convert numbers correctly (Lithuanian)', function () {
    for (let i = 0; i < testCasesLithuanian.length; i++) {
      assert.equal(n2words(testCasesLithuanian[i][0], { lang: 'lt' }), testCasesLithuanian[i][1])
    }
  });
});
