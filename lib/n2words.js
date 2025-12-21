/**
 * @module n2words
 */

/** @typedef {'ar'|'az'|'bn'|'cs'|'de'|'da'|'el'|'en'|'es'|'fa'|'fr'|'fr-BE'|'gu'|'hbo'|'he'|'hi'|'hr'|'hu'|'id'|'it'|'ja'|'kn'|'ko'|'lt'|'lv'|'mr'|'ms'|'nl'|'nb'|'pa-Guru'|'pl'|'pt'|'ro'|'ru'|'sr-Cyrl'|'sr-Latn'|'sv'|'sw'|'ta'|'te'|'th'|'fil'|'tr'|'uk'|'ur'|'vi'|'zh-Hans'|'zh-Hant'} LanguageCode */

/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord='ناقص'] - Word for negative numbers (minus).
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} ChineseSimplifiedOptions
 * @property {boolean} [formal=true] - Use formal/financial numerals (壹贰叁) vs. common numerals (一二三).
 */

/**
 * @typedef {Object} ChineseTraditionalOptions
 * @property {boolean} [formal=true] - Use formal/financial numerals (壹貳參) vs. common numerals (一二三).
 */

/**
 * @typedef {Object} HebrewOptions
 * @property {string} [and='ו'] - Conjunction character (typically 'ו' for and).
 * @property {boolean} [biblical=false] - Use biblical scale words instead of modern ones.
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} BiblicalHebrewOptions
 * @property {string} [and='ו'] - Conjunction character (typically 'ו' for and).
 * @property {boolean} [feminine=false] - Use feminine forms for numbers (masculine is Biblical Hebrew default).
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
 * @typedef {Object} CzechOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} CroatianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} LatvianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} LithuanianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} PolishOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} RussianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} SerbianCyrillicOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} SerbianLatinOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * @typedef {Object} UkrainianOptions
 * @property {boolean} [feminine=false] - Use feminine forms for numbers.
 */

/**
 * Configuration object for number-to-words conversion with comprehensive language support.
 *
 * @typedef {Object} N2WordsOptions
 * @property {LanguageCode} [lang='en'] - Target language code with full autocomplete support.
 *   Supports many languages with regional variants (e.g., 'fr-BE').
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

import ar from './languages/ar.js'
import az from './languages/az.js'
import cs from './languages/cs.js'
import de from './languages/de.js'
import da from './languages/da.js'
import en from './languages/en.js'
import es from './languages/es.js'
import fa from './languages/fa.js'
import sw from './languages/sw.js'
import fr from './languages/fr.js'
import frBE from './languages/fr-BE.js'
import he from './languages/he.js'
import hbo from './languages/hbo.js'
import hr from './languages/hr.js'
import hu from './languages/hu.js'
import id from './languages/id.js'
import ms from './languages/ms.js'
import it from './languages/it.js'
import ja from './languages/ja.js'
import hi from './languages/hi.js'
import bn from './languages/bn.js'
import ko from './languages/ko.js'
import th from './languages/th.js'
import ta from './languages/ta.js'
import te from './languages/te.js'
import sv from './languages/sv.js'
import lt from './languages/lt.js'
import lv from './languages/lv.js'
import nl from './languages/nl.js'
import nb from './languages/nb.js'
import pl from './languages/pl.js'
import pt from './languages/pt.js'
import ro from './languages/ro.js'
import ru from './languages/ru.js'
import srLatn from './languages/sr-Latn.js'
import srCyrl from './languages/sr-Cyrl.js'
import tr from './languages/tr.js'
import uk from './languages/uk.js'
import vi from './languages/vi.js'
import zhHans from './languages/zh-Hans.js'
import zhHant from './languages/zh-Hant.js'
import ur from './languages/ur.js'
import paGuru from './languages/pa-Guru.js'
import fil from './languages/fil.js'
import mr from './languages/mr.js'
import gu from './languages/gu.js'
import kn from './languages/kn.js'
import el from './languages/el.js'

/**
 * Language converter registry.
 * Contains converters for all supported languages, statically imported to work
 * in both Node.js and browser environments (enables bundler dead-code elimination).
 * Keys are language codes (e.g., 'en', 'fr', 'fr-BE'); values are converter functions.
 * @type {Object<string, Function>}
 */
const dict = {
  ar,
  az,
  cs,
  de,
  da,
  en,
  es,
  fa,
  sw,
  fr,
  'fr-BE': frBE,
  hbo,
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
  nb,
  pl,
  pt,
  ro,
  ru,
  'sr-Cyrl': srCyrl,
  'sr-Latn': srLatn,
  tr,
  uk,
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ur,
  'pa-Guru': paGuru,
  fil,
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
 * convertToWords(1, { lang: 'zh-Hans', formal: true }) // Chinese formal style
 * convertToWords(1, { lang: 'cs', feminine: true }) // Czech feminine form
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
