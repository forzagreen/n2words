//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import n2words from '../lib/n2words.js';

test('english is default', async t => {
  t.is(await n2words(12), 'twelve');
  t.is(await n2words(356), 'three hundred and fifty-six');
});

test('lang fallback', async t => {
  t.is(await n2words(70, { lang: 'fr' }), 'soixante-dix');
  t.is(await n2words(70, { lang: 'fr-XX' }), 'soixante-dix');
  t.is(await n2words(70, { lang: 'fr-BE' }), 'septante');
  t.is(await n2words(70, { lang: 'fr-BE-XX' }), 'septante');
  t.is(await n2words(70, { lang: 'fr-BE-XX-XX-XX-XX-XX' }), 'septante');
});

test('accept valid string numbers', async t => {
  t.is(await n2words('12'), 'twelve');
  t.is(await n2words('0012'), 'twelve');
  t.is(await n2words('.1'), 'zero point one');
  t.is(await n2words(' -12.6 '), 'minus twelve point six');
  t.is(await n2words(' -12.606'), 'minus twelve point six hundred and six');
});

test('error on unsupported languages', async t => {
  await t.throwsAsync(n2words(2, { lang: 'aaa' }), { instanceOf: Error });
  await t.throwsAsync(n2words(2, 'en'), { instanceOf: Error });
});

test('error on invalid numbers', async t => {
  await t.throwsAsync(n2words('foobar'), { instanceOf: Error });
  await t.throwsAsync(n2words(false), { instanceOf: Error });
  await t.throwsAsync(n2words('3px'), { instanceOf: Error });
  await t.throwsAsync(n2words(Number.NaN), { instanceOf: Error });
  await t.throwsAsync(n2words(''), { instanceOf: Error });
  await t.throwsAsync(n2words(' '), { instanceOf: Error });
});

test('change internal params', async t => {
  t.is(
    await n2words(-100, {
      lang: 'ar',
      negativeWord: 'سالب',
    }),
    'سالب مائة'
  );
});
