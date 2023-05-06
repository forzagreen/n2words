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