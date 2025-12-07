/**
 * @module n2words
 */

import ar from './i18n/ar.js'
import az from './i18n/az.js'
import cz from './i18n/cz.js'
import de from './i18n/de.js'
import dk from './i18n/dk.js'
import en from './i18n/en.js'
import es from './i18n/es.js'
import fa from './i18n/fa.js'
import fr from './i18n/fr.js'
import frBE from './i18n/fr-BE.js'
import he from './i18n/he.js'
import hr from './i18n/hr.js'
import hu from './i18n/hu.js'
import id from './i18n/id.js'
import it from './i18n/it.js'
import ko from './i18n/ko.js'
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
  it,
  ko,
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
 * Converts a number to written form in the specified language.
 *
 * @param {number|string|bigint} value The number to convert. Accepts integers, decimals (as strings/numbers), and BigInts.
 * @param {Object} [options] Configuration options for the conversion.
 * @param {string} [options.lang='en'] Language code (e.g., 'en', 'fr', 'de', 'es'). Supports fallback (e.g., 'fr-BE' -> 'fr').
 * @param {*} [options...] Additional language-specific options passed to the language converter.
 *
 * @returns {string} The number represented as written words in the specified language.
 *
 * @throws {Error} When language is unsupported.
 * @throws {TypeError} When options is not an object or value type is invalid.
 *
 * @example
 * floatToCardinal(123, { lang: 'en' }); // 'one hundred and twenty-three'
 * floatToCardinal(45.67, { lang: 'en' }); // 'forty-five point six seven'
 * floatToCardinal(-100, { lang: 'en' }); // 'minus one hundred'
 */
function floatToCardinal (value, options = {}) {
  // Reject non-object `options` (e.g. a string passed as second arg)
  if (options !== undefined && typeof options !== 'object') {
    throw new TypeError('Options must be an object, received: ' + typeof options)
  }

  // Determine language (default to 'en')
  const lang = options.lang || 'en'

  // Direct lookup
  const converter = dict[lang]
  if (converter !== undefined) return converter(value, options)

  // Progressive fallback: from most-specific to least (e.g. 'fr-BE-XX' -> 'fr-BE' -> 'fr')
  // This allows regional variants to gracefully degrade to base language
  const parts = String(lang).split('-')
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = parts.slice(0, i).join('-')
    if (dict[candidate] !== undefined) return dict[candidate](value, options)
  }

  // If nothing matched, error
  throw new Error('Unsupported language: "' + lang + '". Check supported language codes in the documentation.')
}

export default floatToCardinal
