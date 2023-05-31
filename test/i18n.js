/* eslint-disable import/max-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-import */
import test from 'ava';
import n2words from '../lib/n2words.js';
import AR from './i18n/AR.js';
import AZ from './i18n/AZ.js';
import CZ from './i18n/CZ.js';
import DE from './i18n/DE.js';
import DK from './i18n/DK.js';
import EN from './i18n/EN.js';
import ES from './i18n/ES.js';
import FR from './i18n/FR.js';
import FA from './i18n/FA.js';
import HE from './i18n/HE.js';
import HR from './i18n/HR.js';
import HU from './i18n/HU.js';
import ID from './i18n/ID.js';
import IT from './i18n/IT.js';
import KO from './i18n/KO.js';
import LT from './i18n/LT.js';
import LV from './i18n/LV.js';
import NL from './i18n/NL.js';
import NO from './i18n/NO.js';
import PL from './i18n/PL.js';
import PT from './i18n/PT.js';
import RU from './i18n/RU.js';
import SR from './i18n/SR.js';
import TR from './i18n/TR.js';
import UK from './i18n/UK.js';
import VI from './i18n/VI.js';
import ZH from './i18n/ZH.js';

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

const parameter = process.argv[2];
const value = process.argv[3];

if (parameter == '--language' || parameter == '--lang') {
  testLanguage(value);
} else {
  Object.keys(i18n).forEach(language => {
    testLanguage(language);
  });
}

/**
 * Run i18n tests for specific language
 * @param {string} language language code to run
 */
function testLanguage(language) {
  test(language, t => {
    i18n[language].forEach(problem => {
      t.is(
        n2words(problem[0], Object.assign({lang: language}, problem[2])),
        problem[1]
      );
    });
  });
}