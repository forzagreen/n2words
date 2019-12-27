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

describe('English', function () {
  it('should convert numbers correctly (English)', function () {
    for (let i = 0; i < testCasesEnglish.length; i++) {
      assert.equal(n2words(testCasesEnglish[i][0], { lang: 'en' }), testCasesEnglish[i][1])
    }
  });
});
