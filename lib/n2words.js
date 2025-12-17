/**
 * @module n2words
 */

/**
 * @typedef {Object} N2WordsOptions
 * @property {string} [lang='en'] - Target language code (e.g., 'en', 'fr', 'fr-BE').
 *   Regional variants are supported; the implementation will progressively fall back
 *   from most-specific to least-specific (e.g., 'fr-BE' -> 'fr').
 * @property {Record<string, any>} [extra] - Additional language-specific options (free-form).
 */

import ar from './i18n/ar.js'
import az from './i18n/az.js'
import cz from './i18n/cz.js'
import de from './i18n/de.js'
import dk from './i18n/dk.js'
import en from './i18n/en.js'
import es from './i18n/es.js'
import fa from './i18n/fa.js'
import sw from './i18n/sw.js'
import fr from './i18n/fr.js'
import frBE from './i18n/fr-BE.js'
import he from './i18n/he.js'
import hr from './i18n/hr.js'
import hu from './i18n/hu.js'
import id from './i18n/id.js'
import ms from './i18n/ms.js'
import it from './i18n/it.js'
import ja from './i18n/ja.js'
import hi from './i18n/hi.js'
import bn from './i18n/bn.js'
import ko from './i18n/ko.js'
import th from './i18n/th.js'
import ta from './i18n/ta.js'
import te from './i18n/te.js'
import sv from './i18n/sv.js'
import lt from './i18n/lt.js'
import lv from './i18n/lv.js'
import nl from './i18n/nl.js'
import no from './i18n/no.js'
import pl from './i18n/pl.js'
import pt from './i18n/pt.js'
import ro from './i18n/ro.js'
import ru from './i18n/ru.js'
import sr from './i18n/sr.js'
import tr from './i18n/tr.js'
import uk from './i18n/uk.js'
import vi from './i18n/vi.js'
import zh from './i18n/zh.js'

/**
 * Language converter dictionary.
 * Statically imported to work in both Node.js and browser environments.
 * @type {Object}
 */
const dict = {
  ar,
  az,
  cz,
  de,
  dk,
  en,
  es,
  fa,
  fr,
  'fr-BE': frBE,
  he,
  hr,
  hu,
  id,
  ms,
  it,
  ja,
  hi,
  bn,
  ko,
  th,
  ta,
  te,
  sw,
  sv,
  lt,
  lv,
  nl,
  no,
  pl,
  pt,
  ro,
  ru,
  sr,
  tr,
  uk,
  vi,
  zh
}

/**
 * Convert a numeric value to its cardinal (written) form in the requested language.
 *
 * Notes:
 * - The library exposes a synchronous API that dispatches to per-language converters.
 * - For browser builds the language converters are statically imported so bundlers
 *   (webpack/rollup) can include them in the output. For Node.js the same static
 *   imports keep behaviour identical and avoid runtime filesystem usage in
 *   browser environments.
 *
 * @param {number|string|bigint} value The number to convert. Accepts:
 *   - `number` (integer or floating),
 *   - `string` (numeric string, possibly with decimal point),
 *   - `bigint` for very large integers.
 *   Decimal numbers may be provided as strings to preserve precision.
 * @param {Object} [options] Optional configuration.
 * @param {string} [options.lang='en'] Target language code (e.g. `'en'`, `'fr'`, `'fr-BE'`).
 *   Regional variants are supported; the implementation will progressively fall back
 *   from most-specific to least-specific (e.g. `'fr-BE' -> 'fr'`).
 * Additional `options` properties are forwarded to the language-specific converter.
 *
 * @returns {string} A human-readable cardinal representation of `value` in the
 *   requested language.
 *
 * @throws {TypeError} If `options` is provided but is not an object.
 * @throws {Error} If no converter exists for the requested language (after fallback).
 *
 * @example
 * // Basic usage
 * floatToCardinal(1, { lang: 'en' }) // => 'one'
 * floatToCardinal('45.67', { lang: 'en' }) // => 'forty-five point six seven'
 * floatToCardinal(123n, { lang: 'fr' }) // => 'cent vingt-trois' (language-specific)
 */
function floatToCardinal (value, options = {}) {
  // Validate options type: null is acceptable (treated as default), but other non-objects must error
  // typeof null === 'object' in JavaScript, so we need explicit null check
  if (options !== null && options !== undefined && typeof options !== 'object') {
    throw new TypeError('Options must be an object, received: ' + typeof options)
  }

  // Treat null as empty options (defaults)
  if (options === null) {
    options = {}
  }

  // Extract language code from options (defaults to undefined)
  let lang = options.lang

  // Fast path: no language specified, use default 'en'
  if (lang === undefined) {
    return dict.en(value, options)
  }

  // Normalize language code to string (handles non-string inputs like numbers)
  if (typeof lang !== 'string') {
    lang = String(lang)
  }

  // Attempt direct lookup (most common case: exact match like 'en', 'fr', etc.)
  let converter = dict[lang]
  if (converter !== undefined) {
    return converter(value, options)
  }

  // Progressive fallback for regional variants: strip suffix on each iteration.
  // Example: 'fr-BE-XX' -> try 'fr-BE' -> try 'fr' -> throw error
  // Uses lastIndexOf for efficiency (O(n) vs O(n²) with repeated substring)
  // This allows the library to gracefully degrade to base language codes.
  let lastDash = lang.lastIndexOf('-')
  while (lastDash > 0) {
    const candidate = lang.slice(0, lastDash)
    converter = dict[candidate]
    if (converter !== undefined) {
      return converter(value, options)
    }
    lastDash = candidate.lastIndexOf('-')
  }

  // No match found after exhausting all fallback attempts
  throw new Error('Unsupported language: "' + lang + '". Check supported language codes in the documentation.')
}

export default floatToCardinal
