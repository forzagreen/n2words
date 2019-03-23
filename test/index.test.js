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

const testCasesPortuguese = [
  [0, 'zero'],
  [1, 'um'],
  [2, 'dois'],
  [3, 'três'],
  [11, 'onze'],
  [12, 'doze'],
  [16, 'dezasseis'],
  [19, 'dezanove'],
  [20, 'vinte'],
  [21, 'vinte e um'],
  [26, 'vinte e seis'],
  [28, 'vinte e oito'],
  [30, 'trinta'],
  [31, 'trinta e um'],
  [40, 'quarenta'],
  [44, 'quarenta e quatro'],
  [50, 'cinquenta'],
  [55, 'cinquenta e cinco'],
  [60, 'sessenta'],
  [67, 'sessenta e sete'],
  [70, 'setenta'],
  [79, 'setenta e nove'],
  [89, 'oitenta e nove'],
  [95, 'noventa e cinco'],
  [100, 'cem'],
  [101, 'cento e um'],
  [199, 'cento e noventa e nove'],
  [203, 'duzentos e três'],
  [287, 'duzentos e oitenta e sete'],
  [356, 'trezentos e cinquenta e seis'],
  [400, 'quatrocentos'],
  [434, 'quatrocentos e trinta e quatro'],
  [578, 'quinhentos e setenta e oito'],
  [689, 'seiscentos e oitenta e nove'],
  [729, 'setecentos e vinte e nove'],
  [894, 'oitocentos e noventa e quatro'],
  [999, 'novecentos e noventa e nove'],
  [1000, 'mil'],
  [1001, 'mil e um'],
  [1097, 'mil e noventa e sete'],
  [1104, 'mil cento e quatro'],
  [1243, 'mil duzentos e quarenta e três'],
  [2385, 'dois mil trezentos e oitenta e cinco'],
  [3766, 'três mil setecentos e sessenta e seis'],
  [4196, 'quatro mil cento e noventa e seis'],
  [5846, 'cinco mil oitocentos e quarenta e seis'],
  [6459, 'seis mil quatrocentos e cinquenta e nove'],
  [7232, 'sete mil duzentos e trinta e dois'],
  [8569, 'oito mil quinhentos e sessenta e nove'],
  [9539, 'nove mil quinhentos e trinta e nove'],
  [1000000, 'um milhão'],
  [1000001, 'um milhão e um'],
  [4000000, 'quatro milhões'],
  [10000000000000, 'dez biliões'],
  [100000000000000, 'cem biliões'],
  [1000000000000000000, 'um trilião']
]

const testCasesItalian = [
  [0, 'zero'],
  [1, 'uno'],
  [2, 'due'],
  [3, 'tre'],
  [11, 'undici'],
  [12, 'dodici'],
  [16, 'sedici'],
  [19, 'diciannove'],
  [20, 'venti'],
  [21, 'ventiuno'],
  [26, 'ventisei'],
  [28, 'ventotto'],
  [30, 'trenta'],
  [31, 'trentuno'],
  [40, 'quaranta'],
  [44, 'quarantaquattro'],
  [50, 'cinquanta'],
  [55, 'cinquantacinque'],
  [60, 'sessanta'],
  [67, 'sessantasette'],
  [70, 'settanta'],
  [79, 'settantanove'],
  [89, 'ottantanove'],
  [95, 'novantacinque'],
  [100, 'cento'],
  [101, 'centouno'],
  [199, 'centonovantanove'],
  [203, 'duecentotré'],
  [287, 'duecentottantasette'],
  [356, 'trecentocinquantasei'],
  [400, 'quattrocento'],
  [434, 'quattrocentotrentaquattro'],
  [578, 'cinquecentosettantotto'],
  [689, 'seicentottantanove'],
  [729, 'settecentoventinove'],
  [894, 'ottocentonovantaquattro'],
  [999, 'novecentonovantanove'],
  [1000, 'mille'],
  [1001, 'milleuno'],
  [1097, 'millenovantasette'],
  [1104, 'millecentoquattro'],
  [1243, 'milleduecentoquarantatré'],
  [2385, 'duemilatrecentottantacinque'],
  [3766, 'tremilasettecentosessantasei'],
  [4196, 'quattromilacentonovantasei'],
  [5846, 'cinquemilaottocentoquarantasei'],
  [6459, 'seimilaquattrocentocinquantanove'],
  [7232, 'settemiladuecentotrentadue'],
  [8569, 'ottomilacinquecentosessantanove'],
  [9539, 'novemilacinquecentotrentanove'],
  [1000000, 'un milione'],
  [1000000000, 'un miliardo'],
  [1000001, 'un milione e uno'],
  [4000000, 'quattro milioni'],
  [10000000000000, 'dieci bilioni'],
  [100000000000000, 'cento bilioni'],
  [1000000000000000000, 'un trilione']
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

describe('German', function () {
  it('should convert numbers correctly (German)', function () {
    for (let i = 0; i < testCasesGerman.length; i++) {
      assert.equal(n2words(testCasesGerman[i][0], { lang: 'de' }), testCasesGerman[i][1])
    }
  });
});

describe('Portuguese', function () {
  it('should convert numbers correctly (Portuguese)', function () {
    for (let i = 0; i < testCasesPortuguese.length; i++) {
      assert.equal(n2words(testCasesPortuguese[i][0], { lang: 'pt' }), testCasesPortuguese[i][1])
    }
  });
});

describe('Italian', function () {
  it('should convert numbers correctly (Italian)', function () {
    for (let i = 0; i < testCasesItalian.length; i++) {
      assert.equal(n2words(testCasesItalian[i][0], { lang: 'it' }), testCasesItalian[i][1])
    }
  });
});

