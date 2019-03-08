const assert = require('assert');
const n2words = require('../index.js');

const testCasesEnglish = [
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  // [5.5, ''],
  [11, 'eleven'],
  [12, 'twelve'],
  [16, 'sixteen'],
  // [17.42, ''],
  [19, 'nineteen'],
  [20, 'twenty'],
  [21, 'twenty-one'],
  [26, 'twenty-six'],
  // [27.312, ''],
  [28, 'twenty-eight'],
  [30, 'thirty'],
  [31, 'thirty-one'],
  [40, 'forty'],
  [44, 'forty-four'],
  [50, 'fifty'],
  // [53.486, ''],
  [55, 'fifty-five'],
  [60, 'sixty'],
  [67, 'sixty-seven'],
  [70, 'seventy'],
  [79, 'seventy-nine'],
  [89, 'eighty-nine'],
  [95, 'ninety-five'],
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [199, 'one hundred and ninety-nine'],
  [203, 'two hundred and three'],
  [287, 'two hundred and eighty-seven'],
  // [300.42, ''],
  [356, 'three hundred and fifty-six'],
  [400, 'four hundred'],
  [434, 'four hundred and thirty-four'],
  [578, 'five hundred and seventy-eight'],
  [689, 'six hundred and eighty-nine'],
  [729, 'seven hundred and twenty-nine'],
  [894, 'eight hundred and ninety-four'],
  [999, 'nine hundred and ninety-nine'],
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [1097, 'one thousand and ninety-seven'],
  [1104, 'one thousand one hundred and four'],
  [1243, 'one thousand two hundred and forty-three'],
  [2385, 'two thousand three hundred and eighty-five'],
  [3766, 'three thousand seven hundred and sixty-six'],
  [4196, 'four thousand one hundred and ninety-six'],
  // [4196.42, ''],
  [5846, 'five thousand eight hundred and forty-six'],
  [6459, 'six thousand four hundred and fifty-nine'],
  [7232, 'seven thousand two hundred and thirty-two'],
  [8569, 'eight thousand five hundred and sixty-nine'],
  [9539, 'nine thousand five hundred and thirty-nine'],
  [1000000, 'one million'],
  [1000001, 'one million and one'],
  [4000000, 'four million'],
  [10000000000000, 'ten trillion'],
  [100000000000000, 'one hundred trillion'],
  [1000000000000000000, 'one quintillion'],
  // [1000000000000000000000, 'one sextillion'],    //FIXME
  // [10000000000000000000000000, 'ten septillion'] //FIXME
]

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


describe('n2words', function () {
  it('should set English as default language', function() {
    assert.equal(n2words(12), 'twelve')
    assert.equal(n2words(356), 'three hundred and fifty-six')
  })

  it('should throw an error for unsupported languages', function () {
    assert.throws(function () {
      n2words(2, {lang: 'aaa'})
    }, Error)
  });
});

describe('English', function () {
  it('should convert numbers correctly (English)', function () {
    for (let i = 0; i < testCasesEnglish.length; i++) {
      assert.equal(n2words(testCasesEnglish[i][0], { lang: 'en' }), testCasesEnglish[i][1])
    }
  });
});

describe('French', function () {
  it('should convert numbers correctly (French)', function () {
    for (let i = 0; i < testCasesFrench.length; i++) {
      assert.equal(n2words(testCasesFrench[i][0], { lang: 'fr' }), testCasesFrench[i][1])     
    }
  });
});

describe('Spanish', function () {
  it('should convert numbers correctly (Spanish)', function () {
    for (let i = 0; i < testCasesSpanish.length; i++) {
      assert.equal(n2words(testCasesSpanish[i][0], { lang: 'es' }), testCasesSpanish[i][1])
    }
  });
});
