/**
 * @module n2words
 */

/**
 * Converts a number to written form.
 * @param {number|string|bigint} value The number to convert.
 * @param {object} [options] User options.
 * @returns {string} Value in written format.
 * TODO [2024-06] Migrate to object destructing for parameters
 */
// eslint-disable-next-line unicorn/no-object-as-default-parameter
async function floatToCardinal(value, options = { lang: 'en' }) {
  const lang = options.lang.split('-'); // 'en-UK-XX' -> ['en', 'UK', 'XX']

  let n2words;

  if (lang.length > 1) {
    try {
      n2words = await import('./i18n/' + lang[0] + '-' + lang[1] + '.js');
    } catch {
      try {
        n2words = await import('./i18n/' + lang[1].toLowerCase() + '.js');
      } catch {
        n2words = await import('./i18n/' + lang[0].toLowerCase() + '.js');
      }
    }
  } else {
    n2words = await import('./i18n/' + lang[0].toLowerCase() + '.js');
  }

  return new n2words.default(options).floatToCardinal(value);
}

export default floatToCardinal;
