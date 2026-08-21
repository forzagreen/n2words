/**
 * @typedef {object} CurrencyVocab
 * @property {string} code - ISO 4217 code, used in error messages
 * @property {string[]} major - Major-unit word forms, in the order the language's pluralizer indexes them
 * @property {string[] | null} minor - Minor-unit word forms, or null when the currency has no everyday subunit
 */

/**
 * Guards a currency amount against a fraction its currency can't represent.
 *
 * Holds no vocabulary. The zero-subunit fact travels with the data as
 * `minor: null`, so there is no central exponent table to keep in step and
 * nothing for a language that never names such a currency to carry.
 * @param {CurrencyVocab} vocab - The resolved currency vocabulary
 * @param {bigint} minorUnits - Minor-unit amount from parseCurrencyValue
 * @throws {RangeError} If the currency has no minor unit and minorUnits is nonzero
 */
export function checkCurrency(vocab, minorUnits) {
  if (minorUnits !== 0n && vocab.minor === null) {
    throw new RangeError(`${vocab.code} has no minor unit — fractional amounts aren't representable`)
  }
}
