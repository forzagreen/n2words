/**
 * English currencies, one named export per ISO 4217 code.
 *
 * Pass one to any English entry point's `toCurrencyIn`:
 *
 *   import { toCurrencyIn } from 'n2words/en-GB'
 *   import { KES } from 'n2words/en/currencies'
 *   toCurrencyIn(42.50, KES) // 'forty-two shillings and fifty cents'
 *
 * Each currency is its own binding rather than a property of one map, because
 * a bundler drops an unused binding but never an unused property of an object:
 * importing KES ships KES's words and none of the others.
 *
 * The words are the `en` matrix's own (src/utils/currency-vocab.js); each
 * export adds the `code`, which decides how many decimal digits an amount is
 * read at. `toCurrency` doesn't need it, since it already has the code it was
 * passed, so the matrix itself stays without one.
 * @module en/currencies
 */

import {
  EN_USD, EN_CAD, EN_AUD, EN_NZD, EN_SGD, EN_GBP, EN_EUR, EN_BDT,
  EN_GHS, EN_INR, EN_KES, EN_MYR, EN_NGN, EN_PHP, EN_PKR, EN_ZAR,
  EN_TND, EN_KWD, EN_BHD, EN_JOD, EN_IQD, EN_OMR, EN_LYD, EN_MAD,
} from '../utils/currency-vocab.js'

/** @typedef {import('../utils/currency-vocab.js').CurrencyVocab} CurrencyVocab */

/** @type {CurrencyVocab} */ export const USD = { code: 'USD', ...EN_USD }
/** @type {CurrencyVocab} */ export const CAD = { code: 'CAD', ...EN_CAD }
/** @type {CurrencyVocab} */ export const AUD = { code: 'AUD', ...EN_AUD }
/** @type {CurrencyVocab} */ export const NZD = { code: 'NZD', ...EN_NZD }
/** @type {CurrencyVocab} */ export const SGD = { code: 'SGD', ...EN_SGD }
/** @type {CurrencyVocab} */ export const GBP = { code: 'GBP', ...EN_GBP }
/** @type {CurrencyVocab} */ export const EUR = { code: 'EUR', ...EN_EUR }
/** @type {CurrencyVocab} */ export const BDT = { code: 'BDT', ...EN_BDT }
/** @type {CurrencyVocab} */ export const GHS = { code: 'GHS', ...EN_GHS }
/** @type {CurrencyVocab} */ export const INR = { code: 'INR', ...EN_INR }
/** @type {CurrencyVocab} */ export const KES = { code: 'KES', ...EN_KES }
/** @type {CurrencyVocab} */ export const MYR = { code: 'MYR', ...EN_MYR }
/** @type {CurrencyVocab} */ export const NGN = { code: 'NGN', ...EN_NGN }
/** @type {CurrencyVocab} */ export const PHP = { code: 'PHP', ...EN_PHP }
/** @type {CurrencyVocab} */ export const PKR = { code: 'PKR', ...EN_PKR }
/** @type {CurrencyVocab} */ export const ZAR = { code: 'ZAR', ...EN_ZAR }
/** @type {CurrencyVocab} */ export const TND = { code: 'TND', ...EN_TND }
/** @type {CurrencyVocab} */ export const KWD = { code: 'KWD', ...EN_KWD }
/** @type {CurrencyVocab} */ export const BHD = { code: 'BHD', ...EN_BHD }
/** @type {CurrencyVocab} */ export const JOD = { code: 'JOD', ...EN_JOD }
/** @type {CurrencyVocab} */ export const IQD = { code: 'IQD', ...EN_IQD }
/** @type {CurrencyVocab} */ export const OMR = { code: 'OMR', ...EN_OMR }
/** @type {CurrencyVocab} */ export const LYD = { code: 'LYD', ...EN_LYD }
/** @type {CurrencyVocab} */ export const MAD = { code: 'MAD', ...EN_MAD }
