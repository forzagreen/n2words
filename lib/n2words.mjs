/* eslint-disable import/max-dependencies */
import n2wordsAR from './i18n/AR/AR.mjs';
import n2wordsAZ from './i18n/AZ.mjs';
import n2wordsCZ from './i18n/CZ.mjs';
import n2wordsDE from './i18n/DE.mjs';
import n2wordsDK from './i18n/DK.mjs';
import n2wordsEN from './i18n/EN.mjs';
import n2wordsES from './i18n/ES.mjs';
import n2wordsFA from './i18n/FA.mjs';
import n2wordsFR from './i18n/FR.mjs';
import n2wordsHE from './i18n/HE.mjs';
import n2wordsHR from './i18n/HR.mjs';
import n2wordsHU from './i18n/HU.mjs';
import n2wordsID from './i18n/ID.mjs';
import n2wordsIT from './i18n/IT.mjs';
import n2wordsKO from './i18n/KO.mjs';
import n2wordsLT from './i18n/LT.mjs';
import n2wordsLV from './i18n/LV.mjs';
import n2wordsNL from './i18n/NL.mjs';
import n2wordsNO from './i18n/NO.mjs';
import n2wordsPL from './i18n/PL.mjs';
import n2wordsPT from './i18n/PT.mjs';
import n2wordsRU from './i18n/RU.mjs';
import n2wordsSR from './i18n/SR.mjs';
import n2wordsTR from './i18n/TR.mjs';
import n2wordsUK from './i18n/UK.mjs';
import n2wordsVI from './i18n/VI.mjs';
import n2wordsZH from './i18n/ZH.mjs';

const supportedLanguages = [
  'en',
  'fr',
  'es',
  'de',
  'pt',
  'it',
  'tr',
  'ru',
  'cz',
  'no',
  'dk',
  'pl',
  'uk',
  'lt',
  'lv',
  'ar',
  'he',
  'ko',
  'nl',
  'sr',
  'fa',
  'zh',
  'hu',
  'id',
  'hr',
  'vi',
  'az',
];

/**
 * Converts a number to written form.
 *
 * @param {number} n The number to convert.
 * @param {object} [options={lang: "en"}] User options.
 * @returns {string} Resulting text value.
 */
export default function(n, options = {lang: 'en'}) {
  let lang = 'EN'; // default language

  if (options) {
    if (options.lang) {
      // lang is given in options
      if (supportedLanguages.indexOf(options.lang) !== -1)
        lang = options.lang.toUpperCase();
      else
        throw Error(
          'ERROR: Unsupported language. Supported languages are: ' +
            supportedLanguages.sort().join(', ')
        );
    }
  }

  if (lang === 'EN') {
    return n2wordsEN(n);
  } else if (lang === 'FR') {
    return n2wordsFR(n);
  } else if (lang === 'ES') {
    return n2wordsES(n);
  } else if (lang === 'DE') {
    return n2wordsDE(n);
  } else if (lang === 'PT') {
    return n2wordsPT(n);
  } else if (lang === 'ID') {
    return n2wordsID(n);
  } else if (lang === 'IT') {
    return n2wordsIT(n);
  } else if (lang === 'TR') {
    return n2wordsTR(n, options);
  } else if (lang === 'RU') {
    return n2wordsRU(n);
  } else if (lang === 'CZ') {
    return n2wordsCZ(n);
  } else if (lang === 'NO') {
    return n2wordsNO(n);
  } else if (lang === 'DK') {
    return n2wordsDK(n);
  } else if (lang === 'PL') {
    return n2wordsPL(n);
  } else if (lang === 'UK') {
    return n2wordsUK(n);
  } else if (lang === 'LT') {
    return n2wordsLT(n);
  } else if (lang === 'LV') {
    return n2wordsLV(n);
  } else if (lang === 'AR') {
    return n2wordsAR(n);
  } else if (lang === 'HE') {
    // only for numbers <= 9999
    return n2wordsHE(n);
  } else if (lang === 'HR') {
    return n2wordsHR(n);
  } else if (lang === 'HU') {
    return n2wordsHU(n);
  } else if (lang === 'KO') {
    return n2wordsKO(n);
  } else if (lang === 'NL') {
    return n2wordsNL(n, options);
  } else if (lang === 'SR') {
    return n2wordsSR(n);
  } else if (lang === 'FA') {
    return n2wordsFA(n);
  } else if (lang === 'ZH') {
    return n2wordsZH(n);
  } else if (lang === 'VI') {
    return n2wordsVI(n);
  } else if (lang === 'AZ') {
    return n2wordsAZ(n);
  } else {
    return n2wordsEN(n);
  }
}
