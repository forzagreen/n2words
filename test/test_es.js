const assert = require('assert');
const n2words = require('../index.js');

const testCasesSpanish = [
  [0, 'cero'],
  [1, 'uno'],
  [2, 'dos'],
  [3, 'tres'],
  // [5.5, 'cinco punto cinco'],
  [11, 'once'],
  [12, 'doce'],
  [16, 'dieciseis'],
  // [17.42, 'diecisiete punto cuatro dos'],
  [19, 'diecinueve'],
  [20, 'veinte'],
  [21, 'veintiuno'],
  [26, 'veintiséis'],
  // [27.312, 'veintisiete punto tres uno dos'],
  [28, 'veintiocho'],
  [30, 'treinta'],
  [31, 'treinta y uno'],
  [40, 'cuarenta'],
  [44, 'cuarenta y cuatro'],
  [50, 'cincuenta'],
  // [53.486, 'cincuenta y tres punto cuatro ocho seis'],
  [55, 'cincuenta y cinco'],
  [60, 'sesenta'],
  [67, 'sesenta y siete'],
  [70, 'setenta'],
  [79, 'setenta y nueve'],
  [89, 'ochenta y nueve'],
  [95, 'noventa y cinco'],
  [100, 'cien'],
  [101, 'ciento uno'],
  [199, 'ciento noventa y nueve'],
  [203, 'doscientos tres'],
  [287, 'doscientos ochenta y siete'],
  // [300.42, 'trescientos punto cuatro dos'],
  [356, 'trescientos cincuenta y seis'],
  [400, 'cuatrocientos'],
  [434, 'cuatrocientos treinta y cuatro'],
  [578, 'quinientos setenta y ocho'],
  [689, 'seiscientos ochenta y nueve'],
  [729, 'setecientos veintinueve'],
  [894, 'ochocientos noventa y cuatro'],
  [999, 'novecientos noventa y nueve'],
  [1000, 'mil'],
  [1001, 'mil uno'],
  [1097, 'mil noventa y siete'],
  [1104, 'mil ciento cuatro'],
  [1243, 'mil doscientos cuarenta y tres'],
  [2385, 'dos mil trescientos ochenta y cinco'],
  [3766, 'tres mil setecientos sesenta y seis'],
  [4196, 'cuatro mil ciento noventa y seis'],
  // [4196.42, 'cuatro mil ciento noventa y seis punto cuatro dos'],
  [5846, 'cinco mil ochocientos cuarenta y seis'],
  [6459, 'seis mil cuatrocientos cincuenta y nueve'],
  [7232, 'siete mil doscientos treinta y dos'],
  [8569, 'ocho mil quinientos sesenta y nueve'],
  [9539, 'nueve mil quinientos treinta y nueve'],
  [1000000, 'un millón'],
  [1000001, 'un millón uno'],
  [4000000, 'cuatro millones'], // FIXME
  [10000000000000, 'diez billones'],
  [100000000000000, 'cien billones'],
  [1000000000000000000, 'un trillón'],
  [1000000000000000000000, 'mil trillones'],
  // [10000000000000000000000000, 'diez cuatrillones']  // FIXME
]

describe('Spanish', function () {
  it('should convert numbers correctly (Spanish)', function () {
    for (let i = 0; i < testCasesSpanish.length; i++) {
      assert.equal(n2words(testCasesSpanish[i][0], { lang: 'es' }), testCasesSpanish[i][1])
    }
  });
});
