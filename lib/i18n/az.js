import TurkicLanguage from '../classes/turkic-language.js'

/**
 * Azerbaijani language converter.
 *
 * Inherits from TurkicLanguage shared patterns:
 * - Space-separated number combinations
 * - Omits '1' before hundreds and thousands
 * - Supports flexible word spacing configuration
 */
export class Azerbaijani extends TurkicLanguage {
  negativeWord = 'mənfi'

  separatorWord = 'nöqtə'

  zero = 'sıfır'

  cards = [[1_000_000_000_000_000_000n, 'kentilyon'],
    [1_000_000_000_000_000n, 'katrilyon'],
    [1_000_000_000_000n, 'trilyon'],
    [1_000_000_000n, 'milyar'],
    [1_000_000n, 'milyon'],
    [1000n, 'min'],
    [100n, 'yüz'],
    [90n, 'doxsan'],
    [80n, 'səksən'],
    [70n, 'yetmiş'],
    [60n, 'altmış'],
    [50n, 'əlli'],
    [40n, 'qırx'],
    [30n, 'otuz'],
    [20n, 'iyirmi'],
    [10n, 'on'],
    [9n, 'doqquz'],
    [8n, 'səkkiz'],
    [7n, 'yeddi'],
    [6n, 'altı'],
    [5n, 'beş'],
    [4n, 'dörd'],
    [3n, 'üç'],
    [2n, 'iki'],
    [1n, 'bir'],
    [0n, 'sıfır']]
}

/**
 * Converts a number to Azerbaijani cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see AZ class).
 * @returns {string} The number expressed in Azerbaijani words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'az' }); // 'qırx iki'
 * floatToCardinal(1000, { lang: 'az' }); // 'min'
 */
export default function floatToCardinal (value, options = {}) {
  return new Azerbaijani(options).floatToCardinal(value)
}
