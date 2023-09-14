// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import test from 'ava';
import n2words from '../lib/n2words.js';

test('english is default', t => {
  t.is(n2words(12), 'twelve');
  t.is(n2words(356), 'three hundred and fifty-six');
});

test('lang fallback', t => {
  t.is(n2words(70, { lang: 'fr' }), 'soixante-dix');
  t.is(n2words(70, { lang: 'fr-XX' }), 'soixante-dix');
  t.is(n2words(70, { lang: 'fr-BE' }), 'septante');
  t.is(n2words(70, { lang: 'fr-BE-XX' }), 'septante');
  t.is(n2words(70, { lang: 'fr-BE-XX-XX-XX-XX-XX' }), 'septante');
});

test('accept valid string numbers', t => {
  t.is(n2words('12'), 'twelve');
  t.is(n2words('0012'), 'twelve');
  t.is(n2words('.1'), 'zero point one');
  t.is(n2words(' -12.6 '), 'minus twelve point six');
});

test('error on unsupported languages', t => {
  t.throws(
    () => {
      n2words(2, { lang: 'aaa' });
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words(2, 'en');
    },
    { instanceOf: Error }
  );
});

test('error on invalid numbers', t => {
  t.throws(
    () => {
      n2words('foobar');
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words(false);
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words('3px');
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words(NaN);
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words('');
    },
    { instanceOf: Error }
  );
  t.throws(
    () => {
      n2words(' ');
    },
    { instanceOf: Error }
  );
});

test('change internal params', t => {
  t.is(n2words(-100, {
    lang: 'ar',
    negativeWord: 'سالب'
  }), 'سالب مائة');
});
