import Benchmark from 'benchmark';
/* eslint-disable import/max-dependencies */
import n2wordsAR from './lib/i18n/AR.mjs';
import n2wordsAZ from './lib/i18n/AZ.mjs';
import n2wordsCZ from './lib/i18n/CZ.mjs';
import n2wordsDE from './lib/i18n/DE.mjs';
import n2wordsDK from './lib/i18n/DK.mjs';
import n2wordsEN from './lib/i18n/EN.mjs';
import n2wordsES from './lib/i18n/ES.mjs';
import n2wordsFA from './lib/i18n/FA.mjs';
import n2wordsFR from './lib/i18n/FR.mjs';
import n2wordsHE from './lib/i18n/HE.mjs';
import n2wordsHR from './lib/i18n/HR.mjs';
import n2wordsHU from './lib/i18n/HU.mjs';
import n2wordsID from './lib/i18n/ID.mjs';
import n2wordsIT from './lib/i18n/IT.mjs';
import n2wordsKO from './lib/i18n/KO.mjs';
import n2wordsLT from './lib/i18n/LT.mjs';
import n2wordsLV from './lib/i18n/LV.mjs';
import n2wordsNL from './lib/i18n/NL.mjs';
import n2wordsNO from './lib/i18n/NO.mjs';
import n2wordsPL from './lib/i18n/PL.mjs';
import n2wordsPT from './lib/i18n/PT.mjs';
import n2wordsRU from './lib/i18n/RU.mjs';
import n2wordsSR from './lib/i18n/SR.mjs';
import n2wordsTR from './lib/i18n/TR.mjs';
import n2wordsUK from './lib/i18n/UK.mjs';
import n2wordsVI from './lib/i18n/VI.mjs';
import n2wordsZH from './lib/i18n/ZH.mjs';

const suite = new Benchmark.Suite();

const i18n = {
  'ar': n2wordsAR,
  'az': n2wordsAZ,
  'cz': n2wordsCZ,
  'de': n2wordsDE,
  'dk': n2wordsDK,
  'en': n2wordsEN,
  'es': n2wordsES,
  'fa': n2wordsFA,
  'fr': n2wordsFR,
  'he': n2wordsHE,
  'hr': n2wordsHR,
  'hu': n2wordsHU,
  'id': n2wordsID,
  'it': n2wordsIT,
  'ko': n2wordsKO,
  'lt': n2wordsLT,
  'lv': n2wordsLV,
  'nl': n2wordsNL,
  'no': n2wordsNO,
  'pl': n2wordsPL,
  'pt': n2wordsPT,
  'ru': n2wordsRU,
  'sr': n2wordsSR,
  'tr': n2wordsTR,
  'uk': n2wordsUK,
  'vi': n2wordsVI,
  'zh': n2wordsZH
};

const args = process.argv;
args.slice(2);

let language;
let value = 9007199254740991;

for (let i = 1; i < args.length; i++) {
  if (args[i] == '--lang' || args[i] == '--language') {
    language = args[i + 1];
  } else if (args[i] == '--value') {
    value = args[i + 1];
  }
}

if (language) {
  suite.add(language, () => {
    i18n[language](value);
  });
} else {
  Object.keys(i18n).forEach(language => {
    suite.add(language, () => {
      i18n[language](value);
    });
  });
}

suite
  .on('cycle', event => {
    // Output benchmark result by converting benchmark result to string
    console.log(String(event.target));
  })
  .run();
