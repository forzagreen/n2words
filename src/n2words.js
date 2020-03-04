import Num2Word_AR from './classes/Num2Word_AR';
import Num2Word_CZ from './classes/Num2Word_CZ';
import Num2Word_DE from './classes/Num2Word_DE';
import Num2Word_DK from './classes/Num2Word_DK';
import Num2Word_EN from './classes/Num2Word_EN';
import Num2Word_ES from './classes/Num2Word_ES';
import Num2Word_FR from './classes/Num2Word_FR';
import Num2Word_HE from './classes/Num2Word_HE';
import Num2Word_IT from './classes/Num2Word_IT';
import Num2Word_KO from './classes/Num2Word_KO';
import Num2Word_LT from './classes/Num2Word_LT';
import Num2Word_LV from './classes/Num2Word_LV';
import Num2Word_NO from './classes/Num2Word_NO';
import Num2Word_PL from './classes/Num2Word_PL';
import Num2Word_PT from './classes/Num2Word_PT';
import Num2Word_RU from './classes/Num2Word_RU';
import Num2Word_TR from './classes/Num2Word_TR';
import Num2Word_UK from './classes/Num2Word_UK';

/**
 * Converts numbers to their written form.
 *
 * @constructor
 * @param {number} n - The number to convert
 * @param {Object} [options={lang: "en"}] - Language
 */

export default function n2words(n, options) {
  var lang = "EN";        // default language
  var supportedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 'no', 'dk', 'pl', 'uk', 'lt', 'lv', 'ar', 'he', 'ko'];
  if (options) {     
    if(options.lang) {    // lang is given in options
      if (supportedLanguages.indexOf(options.lang) != -1) lang = options.lang.toUpperCase()
      else throw Error(`ERROR: Unsupported language. Supported languages are: ${supportedLanguages.sort().join(", ")}`)
    }
  }

  let num;
  if (lang === 'EN') {
    num = new Num2Word_EN();
  } else if (lang === 'FR') {
    num = new Num2Word_FR();
  } else if (lang === 'ES') {
    num = new Num2Word_ES();
  } else if (lang === 'DE') {
    num = new Num2Word_DE();
  } else if (lang === 'PT') {
    num = new Num2Word_PT();
  } else if (lang === 'IT') {
    num = new Num2Word_IT();
  } else if (lang === 'TR') {
    num = new Num2Word_TR();
  } else if (lang === 'RU') {
    num = new Num2Word_RU();
  } else if (lang === 'CZ') {
    num = new Num2Word_CZ();
  } else if (lang === 'NO') {
    num = new Num2Word_NO();
  } else if (lang === 'DK') {
    num = new Num2Word_DK();
  } else if (lang === 'PL') {
    num = new Num2Word_PL();
  } else if (lang === 'UK') {
    num = new Num2Word_UK();
  } else if (lang === 'LT') {
    num = new Num2Word_LT();
  } else if (lang === 'LV') {
    num = new Num2Word_LV();
  } else if (lang === 'AR') {
    num = new Num2Word_AR();
  } else if (lang === 'HE') {  // only for numbers <= 9999
    num = new Num2Word_HE();
  } else if (lang === 'KO') {
    num = new Num2Word_KO();
  }
  return num.toCardinal(n);
}