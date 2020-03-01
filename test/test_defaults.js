const assert = require('assert');
const n2words = require('../n2words.js');

describe('n2words', function () {
  it('should set English as default language', function () {
    assert.equal(n2words(12), 'twelve')
    assert.equal(n2words(356), 'three hundred and fifty-six')
  })

  it('should throw an error for unsupported languages', function () {
    assert.throws(function () {
      n2words(2, { lang: 'aaa' })
    }, Error)
  });
});
