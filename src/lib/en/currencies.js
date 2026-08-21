/**
 * Currency vocabularies in English.
 *
 * Private to the English language files, which re-export the ones they name.
 * Shared between them because these are English words — en-US and en-GB spell
 * a pound the same way; what differs is which one each defaults to.
 * @module lib/en/currencies
 */

/** @typedef {import('../utils/check-currency.js').CurrencyVocab} CurrencyVocab */

/** @type {CurrencyVocab} */
export const USD = { code: 'USD', major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const GBP = { code: 'GBP', major: ['pound', 'pounds'], minor: ['penny', 'pence'] }

/** @type {CurrencyVocab} */
export const CAD = { code: 'CAD', major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const AUD = { code: 'AUD', major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const NZD = { code: 'NZD', major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const SGD = { code: 'SGD', major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }

// Invariable major unit: same word for one and many.
/** @type {CurrencyVocab} */
export const ZAR = { code: 'ZAR', major: ['rand', 'rand'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const KES = { code: 'KES', major: ['shilling', 'shillings'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const GHS = { code: 'GHS', major: ['cedi', 'cedis'], minor: ['pesewa', 'pesewas'] }

// Irish English uses the invariable "euro" for the major unit.
/** @type {CurrencyVocab} */
export const EUR = { code: 'EUR', major: ['euro', 'euro'], minor: ['cent', 'cents'] }

/** @type {CurrencyVocab} */
export const MYR = { code: 'MYR', major: ['ringgit', 'ringgit'], minor: ['sen', 'sen'] }

/** @type {CurrencyVocab} */
export const NGN = { code: 'NGN', major: ['naira', 'naira'], minor: ['kobo', 'kobo'] }

/** @type {CurrencyVocab} */
export const PHP = { code: 'PHP', major: ['peso', 'pesos'], minor: ['centavo', 'centavos'] }

// No everyday subunit: a fractional amount is rejected rather than spelled.
// The sen was demonetised in 1953.
/** @type {CurrencyVocab} */
export const JPY = { code: 'JPY', major: ['yen', 'yen'], minor: null }
