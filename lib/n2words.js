/**
 * @module n2words
 */

/**
 * Converts a number to written form.
 * @param {number|string|bigint} value The number to convert.
 * @param {object} [options] User options.
 * @returns {string} Value in written format.
 */
async function floatToCardinal(value, options = {}) {
  // Value validation and conversion to string
  if (typeof value == 'number') {
    if (Number.isNaN(value)) {
      throw new TypeError('NaN is not an accepted number.');
    }
    value = value.toString();
  } else if (typeof value == 'string') {
    value = value.trim();
    if (value.length === 0 || Number.isNaN(Number(value))) {
      throw new Error('"' + value + '" is not a valid number.');
    }
  } else if (typeof value === 'bigint') {
    value = value.toString();
  } else {
    throw new TypeError('Invalid variable type: ' + typeof value);
  }

  // Basic options object validation
  if (typeof options !== 'object' || Array.isArray(options) || options === null) {
    throw new TypeError('Options must be an object.');
  }

  options = Object.assign({
    language: (Object.hasOwn(options, 'lang') ? options.lang : 'en'),
  }, options);

  const language = options.language.split('-'); // 'en-UK-XX' -> ['en', 'UK', 'XX']

  let n2words;

  if (language.length > 1) {
    try {
      n2words = await import('./i18n/' + language[0] + '-' + language[1] + '.js');
    } catch {
      try {
        n2words = await import('./i18n/' + language[1].toLowerCase() + '.js');
      } catch {
        n2words = await import('./i18n/' + language[0].toLowerCase() + '.js');
      }
    }
  } else {
    n2words = await import('./i18n/' + language[0].toLowerCase() + '.js');
  }

  return new n2words.default(options).floatToCardinal(value);
}

export default floatToCardinal;
