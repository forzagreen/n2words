const assert = require('assert');
const num2words = require('../index.js');

it('English', () => {
  assert.equal(num2words(1), 'one');
});

it('French', () => {
  assert.equal(num2words(1, { lang: 'fr' }), 'un');
});

it('Spanish', () => {
  assert.equal(num2words(1, { lang: 'es' }), 'uno');
});
