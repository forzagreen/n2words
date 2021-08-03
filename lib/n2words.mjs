/* eslint-disable import/max-dependencies */
import num2WordAR from './i18n/AR.mjs';
import num2WordCZ from './i18n/CZ.mjs';
import num2WordDE from './i18n/DE.mjs';
import num2WordDK from './i18n/DK.mjs';
import num2WordEN from './i18n/EN.mjs';
import num2WordES from './i18n/ES.mjs';
import num2WordFA from './i18n/FA.mjs';
import num2WordFR from './i18n/FR.mjs';
import num2WordHE from './i18n/HE.mjs';
import num2WordHU from './i18n/HU.mjs';
import num2WordIT from './i18n/IT.mjs';
import num2WordKO from './i18n/KO.mjs';
import num2WordLT from './i18n/LT.mjs';
import num2WordLV from './i18n/LV.mjs';
import num2WordNL from './i18n/NL.mjs';
import num2WordNO from './i18n/NO.mjs';
import num2WordPL from './i18n/PL.mjs';
import num2WordPT from './i18n/PT.mjs';
import num2WordRU from './i18n/RU.mjs';
import num2WordSR from './i18n/SR.mjs';
import num2WordTR from './i18n/TR.mjs';
import num2WordUK from './i18n/UK.mjs';
import num2WordZH from './i18n/ZH.mjs';

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
];

/**
 * Converts numbers to their written form.
 *
 * @param {number} n - The number to convert
 * @param {object} [options={lang: "en"}] - Language
 * @returns {string} - Resulting text value.
 */
export default function (n, options) {
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

  let num;
  if (lang === 'EN') {
    num = new num2WordEN();
  } else if (lang === 'FR') {
    num = new num2WordFR();
  } else if (lang === 'ES') {
    num = new num2WordES();
  } else if (lang === 'DE') {
    num = new num2WordDE();
  } else if (lang === 'PT') {
    num = new num2WordPT();
  } else if (lang === 'IT') {
    num = new num2WordIT();
  } else if (lang === 'TR') {
    num = new num2WordTR(options);
  } else if (lang === 'RU') {
    num = new num2WordRU();
  } else if (lang === 'CZ') {
    num = new num2WordCZ();
  } else if (lang === 'NO') {
    num = new num2WordNO();
  } else if (lang === 'DK') {
    num = new num2WordDK();
  } else if (lang === 'PL') {
    num = new num2WordPL();
  } else if (lang === 'UK') {
    num = new num2WordUK();
  } else if (lang === 'LT') {
    num = new num2WordLT();
  } else if (lang === 'LV') {
    num = new num2WordLV();
  } else if (lang === 'AR') {
    num = new num2WordAR();
  } else if (lang === 'HE') {
    // only for numbers <= 9999
    num = new num2WordHE();
  } else if (lang === 'HU') {
    num = new num2WordHU();
  } else if (lang === 'KO') {
    num = new num2WordKO();
  } else if (lang === 'NL') {
    num = new num2WordNL(options);
  } else if (lang === 'SR') {
    num = new num2WordSR();
  } else if (lang === 'FA') {
    num = new num2WordFA();
  } else if (lang === 'ZH') {
    num = new num2WordZH();
  }

  return num.floatToCardinal(n);
}
