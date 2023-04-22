/* eslint-disable import/max-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-import */
import test from 'ava';
import n2words from '../lib/n2words.mjs';
import AR from './i18n/AR.mjs';
import AZ from './i18n/AZ.mjs';
import CZ from './i18n/CZ.mjs';
import DE from './i18n/DE.mjs';
import DK from './i18n/DK.mjs';
import EN from './i18n/EN.mjs';
import ES from './i18n/ES.mjs';
import FR from './i18n/FR.mjs';
import FA from './i18n/FA.mjs';
import HE from './i18n/HE.mjs';
import HR from './i18n/HR.mjs';
import HU from './i18n/HU.mjs';
import ID from './i18n/ID.mjs';
import IT from './i18n/IT.mjs';
import KO from './i18n/KO.mjs';
import LT from './i18n/LT.mjs';
import LV from './i18n/LV.mjs';
import NL from './i18n/NL.mjs';
import NO from './i18n/NO.mjs';
import PL from './i18n/PL.mjs';
import PT from './i18n/PT.mjs';
import RU from './i18n/RU.mjs';
import SR from './i18n/SR.mjs';
import TR from './i18n/TR.mjs';
import UK from './i18n/UK.mjs';
import VI from './i18n/VI.mjs';
import ZH from './i18n/ZH.mjs';
import { isNumeric } from '../lib/util.mjs';

const i18n = {
  ar: AR,
  az: AZ,
  cz: CZ,
  de: DE,
  dk: DK,
  en: EN,
  es: ES,
  fa: FA,
  fr: FR,
  he: HE,
  hr: HR,
  hu: HU,
  id: ID,
  it: IT,
  ko: KO,
  lt: LT,
  lv: LV,
  nl: NL,
  no: NO,
  pl: PL,
  pt: PT,
  ru: RU,
  sr: SR,
  tr: TR,
  uk: UK,
  vi: VI,
  zh: ZH,
};

Object.keys(i18n).forEach(language => {
  test(language, t => {
    i18n[language].forEach(problem => {
      t.is(
        n2words(problem[0], Object.assign({ lang: language }, problem[2])),
        problem[1]
      );
    });
  });
});

test('should set English as default language', t => {
  t.is(n2words(12), 'twelve');
  t.is(n2words(356), 'three hundred and fifty-six');
});

test('should accept valid string numbers', t => {
  t.is(n2words('12'), 'twelve');
  t.is(n2words('0012'), 'twelve');
  t.is(n2words('.1'), 'zero point one');
  t.is(n2words(' -12.6 '), 'minus twelve point six');
});

test('should throw an error for unsupported languages', t => {
  t.throws(
    () => {
      n2words(2, { lang: 'aaa' });
    },
    { instanceOf: Error }
  );
});

test('should throw an error for invalid numbers', t => {
  t.throws(
    () => {
      n2words('foobar');
    },
    { instanceOf: TypeError }
  );
});

test('isNumeric should return true for a valid number', (t) => {
  t.true(isNumeric(42));
  t.true(isNumeric('42'));
  t.true(isNumeric('3.14'));
  t.true(isNumeric(0));
});

test('isNumeric should return false for an invalid number', (t) => {
  t.false(isNumeric(NaN));
  t.false(isNumeric(''));
  t.false(isNumeric(null));
  t.false(isNumeric(undefined));
  t.false(isNumeric('foo'));
  t.false(isNumeric('3px'));
  t.false(isNumeric('35$'));
  t.false(isNumeric('57%'));
});

test('isNumeric should return false for non-number types', (t) => {
  t.false(isNumeric(true));
  t.false(isNumeric(false));
  t.false(isNumeric({}));
  t.false(isNumeric([]));
  t.false(isNumeric(() => {}));
});
