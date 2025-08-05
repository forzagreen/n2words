/**
 * @module n2words
 */

import n2wordsAR from './i18n/ar.js';
import n2wordsAZ from './i18n/az.js';
import n2wordsCZ from './i18n/cz.js';
import n2wordsDE from './i18n/de.js';
import n2wordsDK from './i18n/dk.js';
import n2wordsEN from './i18n/en.js';
import n2wordsES from './i18n/es.js';
import n2wordsFA from './i18n/fa.js';
import n2wordsFR from './i18n/fr.js';
import n2wordsFRBE from './i18n/fr-BE.js';
import n2wordsHE from './i18n/he.js';
import n2wordsHR from './i18n/hr.js';
import n2wordsHU from './i18n/hu.js';
import n2wordsID from './i18n/id.js';
import n2wordsIT from './i18n/it.js';
import n2wordsKO from './i18n/ko.js';
import n2wordsLT from './i18n/lt.js';
import n2wordsLV from './i18n/lv.js';
import n2wordsNL from './i18n/nl.js';
import n2wordsNO from './i18n/no.js';
import n2wordsPL from './i18n/pl.js';
import n2wordsPT from './i18n/pt.js';
import n2wordsRO from './i18n/ro.js';
import n2wordsRU from './i18n/ru.js';
import n2wordsSR from './i18n/sr.js';
import n2wordsTR from './i18n/tr.js';
import n2wordsUK from './i18n/uk.js';
import n2wordsVI from './i18n/vi.js';
import n2wordsZH from './i18n/zh.js';

const dict = {
  'ar': n2wordsAR,
  'az': n2wordsAZ,
  'cz': n2wordsCZ,
  'de': n2wordsDE,
  'dk': n2wordsDK,
  'en': n2wordsEN,       // default
  'es': n2wordsES,
  'fa': n2wordsFA,
  'fr': n2wordsFR,
  'fr-BE': n2wordsFRBE,
  'he': n2wordsHE,       // currently only for numbers < 10000
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
  'ro': n2wordsRO,
  'ru': n2wordsRU,
  'sr': n2wordsSR,
  'tr': n2wordsTR,
  'uk': n2wordsUK,
  'vi': n2wordsVI,
  'zh': n2wordsZH,
};

/**
 * Converts a number to written form.
 * @param {number|string|bigint} value The number to convert.
 * @param {object} [options] User options.
 * @returns {string} Value in written format.
 * TODO [2024-06] Migrate to object destructing for parameters
 */
// eslint-disable-next-line unicorn/no-object-as-default-parameter
function floatToCardinal(value, options = { lang: 'en' }) {
  const function_ = dict[options.lang];
  if (function_ != undefined) return function_(value, options);

  const fallbackLang = options.lang.split('-') // 'en-UK' -> ['en', 'UK']
    .map((_, index, array) => array.slice(0, array.length - index).join('-')) // ['en-UK', 'en']
    .find(l => dict[l] != undefined);
  if (fallbackLang != undefined) return dict[fallbackLang](value, options);

  throw new Error('Unsupported language: ' + value + '.');
}

export default floatToCardinal;
