// eslint-disable-next-line node/no-missing-require
const test = require('ava');

test('CommonJS', async t => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const {default: n2words} = await import('../lib/i18n/en.js');

  t.plan(2);

  t.true(typeof n2words === 'function');
  t.true(n2words(1) === 'one');
});
