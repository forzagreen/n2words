/* eslint-disable import/max-dependencies */
import n2wordsAR from './i18n/AR.mjs';
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

/**
 * Converts a number to written form.
 * @param {number|string} value The number to convert.
 * @param {object} [options = {lang: en}] User options.
 * @returns {string} Value in written format.
 */
export default function(value, options = {lang: 'en'}) {
  switch (options.lang) {
    case 'en': return n2wordsEN(value, options); // default
    case 'ar': return n2wordsAR(value, options);
    case 'az': return n2wordsAZ(value, options);
    case 'cz': return n2wordsCZ(value, options);
    case 'de': return n2wordsDE(value, options);
    case 'dk': return n2wordsDK(value, options);
    case 'es': return n2wordsES(value, options);
    case 'fa': return n2wordsFA(value, options);
    case 'fr': return n2wordsFR(value, options);
    case 'he': return n2wordsHE(value, options); // only for numbers <= 9999
    case 'hr': return n2wordsHR(value, options);
    case 'hu': return n2wordsHU(value, options);
    case 'id': return n2wordsID(value, options);
    case 'it': return n2wordsIT(value, options);
    case 'ko': return n2wordsKO(value, options);
    case 'lt': return n2wordsLT(value, options);
    case 'lv': return n2wordsLV(value, options);
    case 'nl': return n2wordsNL(value, options);
    case 'no': return n2wordsNO(value, options);
    case 'pl': return n2wordsPL(value, options);
    case 'pt': return n2wordsPT(value, options);
    case 'ru': return n2wordsRU(value, options);
    case 'sr': return n2wordsSR(value, options);
    case 'tr': return n2wordsTR(value, options);
    case 'uk': return n2wordsUK(value, options);
    case 'vi': return n2wordsVI(value, options);
    case 'zh': return n2wordsZH(value, options);
    default: throw Error('Unsupported language: ' + value + '.');
  }
}
