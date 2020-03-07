import test from 'ava';
import n2words from '../dist/n2words.js';

import AR from './i18n/AR';
import CZ from './i18n/CZ';
import DE from './i18n/DE';
import DK from './i18n/DK';
import EN from './i18n/EN';
import ES from './i18n/ES';
import FR from './i18n/FR';
import HE from './i18n/HE';
import IT from './i18n/IT';
import KO from './i18n/KO';
import LT from './i18n/LT';
import LV from './i18n/LV';
import NO from './i18n/NO';
import PL from './i18n/PL';
import PT from './i18n/PT';
import RU from './i18n/RU';
import TR from './i18n/TR';
import UK from './i18n/UK';

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
    "no": NO,
    "pl": PL,
    "pt": PT,
    "ru": RU,
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