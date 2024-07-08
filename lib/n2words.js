/**
 * @module n2words
 */

import { existsSync } from 'node:fs';

/**
 * Converts a number to written form.
 * @param {number|string|bigint} value The number to convert.
 * @param {object} [options] User options.
 * @returns {string} Value in written format.
 * TODO [2024-06] Migrate to object destructing for parameters
 */
// eslint-disable-next-line unicorn/no-object-as-default-parameter
async function floatToCardinal(value, options = { lang: 'en' }) {
  const fallback = options.lang.split('-'); // 'en-UK-XX' -> ['en', 'UK', 'XX']

  if (!checkForLanguage(options.lang)) {
    if (checkForLanguage(fallback[0] + '-' + fallback[1])) {  // en-UK
      options.lang = fallback[0] + '-' + fallback[1];
    } else if (checkForLanguage(fallback[1].toLowerCase())) { // uk
      options.lang = fallback[1].toLowerCase();
    } else if (checkForLanguage(fallback[0].toLowerCase())) { // en
      options.lang = fallback[0].toLowerCase();
    } else {
      throw new Error('Unsupported language: ' + options.lang + '.');
    }
  }

  const { default: n2words } = await import('./i18n/' + options.lang + '.js');

  return new n2words(options).floatToCardinal(value);
}

function checkForLanguage(language) {
  return existsSync('./lib/i18n/' + language + '.js');
}

export default floatToCardinal;
