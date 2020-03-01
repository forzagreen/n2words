const assert = require('assert');
const n2words = require('../n2words.js');

const testCasesPolish = [
  [0, 'zero'],
  [1, 'jeden'],
  [2, 'dwa'],
  [3, 'trzy'],
  [11, 'jedenaście'],
  [12, 'dwanaście'],
  [16, 'szesnaście'],
  [19, 'dziewiętnaście'],
  [20, 'dwadzieścia'],
  [21, 'dwadzieścia jeden'],
  [26, 'dwadzieścia sześć'],
  [28, 'dwadzieścia osiem'],
  [30, 'trzydzieści'],
  [31, 'trzydzieści jeden'],
  [40, 'czterdzieści'],
  [44, 'czterdzieści cztery'],
  [50, 'pięćdziesiąt'],
  [55, 'pięćdziesiąt pięć'],
  [60, 'sześćdziesiąt'],
  [67, 'sześćdziesiąt siedem'],
  [70, 'siedemdziesiąt'],
  [79, 'siedemdziesiąt dziewięć'],
  [89, 'osiemdziesiąt dziewięć'],
  [95, 'dziewięćdzisiąt pięć'],
  [100, 'sto'],
  [101, 'sto jeden'],
  [199, 'sto dziewięćdzisiąt dziewięć'],
  [203, 'dwieście trzy'],
  [287, 'dwieście osiemdziesiąt siedem'],
  [356, 'trzysta pięćdziesiąt sześć'],
  [400, 'czterysta'],
  [434, 'czterysta trzydzieści cztery'],
  [578, 'pięćset siedemdziesiąt osiem'],
  [689, 'sześćset osiemdziesiąt dziewięć'],
  [729, 'siedemset dwadzieścia dziewięć'],
  [894, 'osiemset dziewięćdzisiąt cztery'],
  [999, 'dziewięćset dziewięćdzisiąt dziewięć'],
  [1000, 'tysiąc'],
  [1001, 'tysiąc jeden'],
  [1097, 'tysiąc dziewięćdzisiąt siedem'],
  [1104, 'tysiąc sto cztery'],
  [1243, 'tysiąc dwieście czterdzieści trzy'],
  [2385, 'dwa tysiące trzysta osiemdziesiąt pięć'],
  [3766, 'trzy tysiące siedemset sześćdziesiąt sześć'],
  [4196, 'cztery tysiące sto dziewięćdzisiąt sześć'],
  [5846, 'pięć tysięcy osiemset czterdzieści sześć'],
  [6459, 'sześć tysięcy czterysta pięćdziesiąt dziewięć'],
  [7232, 'siedem tysięcy dwieście trzydzieści dwa'],
  [8569, 'osiem tysięcy pięćset sześćdziesiąt dziewięć'],
  [9539, 'dziewięć tysięcy pięćset trzydzieści dziewięć'],
  [1000000, 'milion'],
  [1000001, 'milion jeden'],
  [4000000, 'cztery miliony'],
  [10000000000000, 'dziesięć bilionów'],
  [100000000000000, 'sto bilionów'],
  [1000000000000000000, 'trylion']
]


describe('Polish', function () {
  it('should convert numbers correctly (Polish)', function () {
    for (let i = 0; i < testCasesPolish.length; i++) {
      assert.equal(n2words(testCasesPolish[i][0], { lang: 'pl' }), testCasesPolish[i][1])
    }
  });
});
