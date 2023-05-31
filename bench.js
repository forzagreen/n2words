import Benchmark from 'benchmark';
/* eslint-disable import/max-dependencies */
import n2wordsAR from './lib/i18n/AR.js';
import n2wordsAZ from './lib/i18n/AZ.js';
import n2wordsCZ from './lib/i18n/CZ.js';
import n2wordsDE from './lib/i18n/DE.js';
import n2wordsDK from './lib/i18n/DK.js';
import n2wordsEN from './lib/i18n/EN.js';
import n2wordsES from './lib/i18n/ES.js';
import n2wordsFA from './lib/i18n/FA.js';
import n2wordsFR from './lib/i18n/FR.js';
import n2wordsHE from './lib/i18n/HE.js';
import n2wordsHR from './lib/i18n/HR.js';
import n2wordsHU from './lib/i18n/HU.js';
import n2wordsID from './lib/i18n/ID.js';
import n2wordsIT from './lib/i18n/IT.js';
import n2wordsKO from './lib/i18n/KO.js';
import n2wordsLT from './lib/i18n/LT.js';
import n2wordsLV from './lib/i18n/LV.js';
import n2wordsNL from './lib/i18n/NL.js';
import n2wordsNO from './lib/i18n/NO.js';
import n2wordsPL from './lib/i18n/PL.js';
import n2wordsPT from './lib/i18n/PT.js';
import n2wordsRU from './lib/i18n/RU.js';
import n2wordsSR from './lib/i18n/SR.js';
import n2wordsTR from './lib/i18n/TR.js';
import n2wordsUK from './lib/i18n/UK.js';
import n2wordsVI from './lib/i18n/VI.js';
import n2wordsZH from './lib/i18n/ZH.js';

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
