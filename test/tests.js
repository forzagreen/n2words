import test from 'ava';

import n2words from '../src/n2words.mjs';
import AR from './i18n/AR.mjs';
import CZ from './i18n/CZ.mjs';
import DE from './i18n/DE.mjs';
import DK from './i18n/DK.mjs';
import EN from './i18n/EN.mjs';
import ES from './i18n/ES.mjs';
import FR from './i18n/FR.mjs';
import HE from './i18n/HE.mjs';
import IT from './i18n/IT.mjs';
import KO from './i18n/KO.mjs';
import LT from './i18n/LT.mjs';
import LV from './i18n/LV.mjs';
import NL from "./i18n/NL.mjs";
import NO from './i18n/NO.mjs';
import PL from './i18n/PL.mjs';
import PT from './i18n/PT.mjs';
import RU from './i18n/RU.mjs';
import SR from './i18n/SR.mjs';
import TR from './i18n/TR.mjs';
import UK from './i18n/UK.mjs';

const i18n = {
    "ar": AR,
    "cz": CZ,
    "de": DE,
    "dk": DK,
    "en": EN,
    "es": ES,
    "fr": FR,
    "he": HE,
    "it": IT,
    "ko": KO,
    "lt": LT,
    "lv": LV,
     "nl": NL,
    "no": NO,
    "pl": PL,
    "pt": PT,
    "ru": RU,
    "sr": SR,
    "tr": TR,
    "uk": UK
};

Object.keys(i18n).forEach(language => {
    test(language, t => {
        i18n[language].forEach(problem => {
            t.is(n2words(problem[0], { lang: language }), problem[1]);
        });
    });
});

test('should set English as default language', t => {
    t.is(n2words(12), 'twelve');
    t.is(n2words(356), 'three hundred and fifty-six');
});
  
test('should throw an error for unsupported languages', t => {
    t.throws(() => {
        n2words(2, { lang: 'aaa' });
    }, { instanceOf: Error });
});
