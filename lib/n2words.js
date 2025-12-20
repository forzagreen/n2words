/**
 * @module n2words
 */

/** @typedef {'ar'|'az'|'bn'|'cz'|'de'|'dk'|'el'|'en'|'es'|'fa'|'fr'|'fr-BE'|'gu'|'he'|'hi'|'hr'|'hu'|'id'|'it'|'ja'|'kn'|'ko'|'lt'|'lv'|'mr'|'ms'|'nl'|'no'|'pa'|'pl'|'pt'|'ro'|'ru'|'sr'|'sv'|'sw'|'ta'|'te'|'th'|'tl'|'tr'|'uk'|'ur'|'vi'|'zh'} LanguageCode */

/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord='ناقص'] - Word for negative numbers (minus).
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} ChineseOptions
 * @property {boolean} [formal=true] - Use formal/financial numerals (壹贰叁) vs. common numerals (一二三).
 */

/**
 * @typedef {Object} HebrewOptions
 * @property {string} [and='ו'] - Conjunction character (typically 'ו' for and).
 * @property {boolean} [biblical=false] - Use biblical scale words instead of modern ones.
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} SpanishOptions
 * @property {('o'|'a'|string)} [genderStem='o'] - Masculine 'o' or feminine 'a' ending.
 */

/**
 * @typedef {Object} DutchOptions
 * @property {boolean} [includeOptionalAnd=false] - Include optional "en" separator.
 * @property {boolean} [noHundredPairs=false] - Disable comma before hundreds.
 * @property {boolean} [accentOne=true] - Use accented "één" for one.
 */

/**
 * @typedef {Object} FrenchOptions
 * @property {boolean} [withHyphenSeparator=false] - Use hyphens (true) instead of spaces (false) in compounds.
 */

/**
 * @typedef {Object} TurkishOptions
 * @property {boolean} [dropSpaces=false] - Remove spaces between words if true.
 */

/**
 * @typedef {Object} RomanianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} DanishOptions
 * @property {boolean} [ordFlag=false] - Enable ordinal number conversion.
 */

/**
 * @typedef {Object} SlavicOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * Configuration object for number-to-words conversion with comprehensive language support.
 *
 * @typedef {Object} N2WordsOptions
 * @property {LanguageCode} [lang='en'] - Target language code with full autocomplete support.
 *   Supports 45+ languages with regional variants (e.g., 'fr-BE').
 *   Falls back progressively from most-specific to least-specific (e.g., 'fr-BE' -> 'fr').
 *   Throws an error if no match is found after fallback attempts.
 * @property {string} [negativeWord] - (Arabic only) Word for negative numbers.
 * @property {boolean} [feminine] - (Arabic, Hebrew, Romanian, Slavic languages) Use feminine forms.
 * @property {boolean} [formal] - (Chinese only) Use formal/financial numerals.
 * @property {string} [and] - (Hebrew only) Conjunction character.
 * @property {boolean} [biblical] - (Hebrew only) Use biblical scale words.
 * @property {('o'|'a'|string)} [genderStem] - (Spanish only) Gender ending.
 * @property {boolean} [includeOptionalAnd] - (Dutch only) Include optional "en".
 * @property {boolean} [noHundredPairs] - (Dutch only) Disable comma before hundreds.
 * @property {boolean} [accentOne] - (Dutch only) Use accented "één".
 * @property {boolean} [withHyphenSeparator] - (French, Belgian French) Use hyphens.
 * @property {boolean} [dropSpaces] - (Turkish, Azerbaijani) Remove spaces.
 * @property {boolean} [ordFlag] - (Danish only) Enable ordinal conversion.
 *
 * Language-specific options are automatically validated and forwarded to converters.
 * See individual language implementations for detailed option descriptions.
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
import ur from './i18n/ur.js'
import pa from './i18n/pa.js'
import tl from './i18n/tl.js'
import mr from './i18n/mr.js'
import gu from './i18n/gu.js'
import kn from './i18n/kn.js'
import el from './i18n/el.js'

/**
 * Language converter registry.
 * Contains converters for all supported languages (45+), statically imported to work
 * in both Node.js and browser environments (enables bundler dead-code elimination).
 * Keys are language codes (e.g., 'en', 'fr', 'fr-BE'); values are converter functions.
 * @type {Object<string, Function>}
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
  sw,
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
  zh,
  ur,
  pa,
  tl,
  mr,
  gu,
  kn,
  el
}

/**
 * Convert a numeric value to its cardinal (written) form in the requested language.
 *
 * This is the main entry point. The library dispatches synchronously to the appropriate
 * per-language converter based on the `lang` option. For browser builds, language converters
 * are statically imported so bundlers (webpack/rollup) can include them in output; Node.js
 * maintains identical behavior via the same static imports.
 *
 * @param {number|string|bigint} value The number to convert. Accepts:
 *   - `number` (integer or floating-point),
 *   - `string` (numeric string, possibly with decimal point),
 *   - `bigint` for very large integers.
 *   Decimal numbers as strings preserve precision that `number` type cannot.
 * @param {N2WordsOptions} [options={}] Optional configuration object.
 *
 * @returns {string} A human-readable cardinal representation of `value` in the
 *   requested language.
 *
 * @throws {TypeError} If `options` is provided but is not an object.
 * @throws {Error} If the requested language is unsupported (no match after fallback).
 *
 * @example
 * // Basic usage
 * convertToWords(1, { lang: 'en' }) // => 'one'
 * convertToWords('45.67', { lang: 'en' }) // => 'forty-five point six seven'
 * convertToWords(123n, { lang: 'fr' }) // => 'cent vingt-trois'
 *
 * @example
 * // Language-specific options (see individual language implementations)
 * convertToWords(1, { lang: 'zh', formal: true }) // Chinese formal style
 * convertToWords(1, { lang: 'cz', feminine: true }) // Czech feminine form
 */
export default function (value, options = {}) {
  if (options !== null && options !== undefined && typeof options !== 'object') {
    throw new TypeError('Options must be an object, received: ' + typeof options)
  }

  if (options === null) {
    options = {}
  }

  let languageCode = options.lang

  if (languageCode === undefined) {
    return dict.en(value, options)
  }

  if (typeof languageCode !== 'string') {
    languageCode = String(languageCode)
  }

  let languageConverter = dict[languageCode]
  if (languageConverter !== undefined) {
    return languageConverter(value, options)
  }

  // Progressive fallback for regional variants: strip suffix on each iteration.
  // Example: 'fr-BE-XX' -> try 'fr-BE' -> try 'fr' -> throw error
  // Uses lastIndexOf for efficiency (O(n) vs O(n²) with repeated substring)
  let lastDashIndex = languageCode.lastIndexOf('-')
  while (lastDashIndex > 0) {
    const candidateLanguageCode = languageCode.slice(0, lastDashIndex)
    languageConverter = dict[candidateLanguageCode]
    if (languageConverter !== undefined) {
      return languageConverter(value, options)
    }
    lastDashIndex = candidateLanguageCode.lastIndexOf('-')
  }

  throw new Error('Unsupported language: "' + languageCode + '". Check supported language codes in the documentation.')
}
