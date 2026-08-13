/**
 * Cross-language currency-name matrix.
 *
 * One named export per language file (camelCase, e.g. `enUS` for en-US.js —
 * the same convention rollup.config.js uses for UMD globals), each a plain
 * object keyed by ISO 4217 code. A language file imports only its own
 * export, so each per-language Rollup bundle (rollup.config.js) ships only
 * that language's rows via ordinary dead-code elimination on unused
 * bindings — unlike an object keyed the other way (ISO code -> language),
 * where an unused *property* of an exported object literal is NOT
 * eliminated. The matrix can grow to include any language naming any
 * currency without affecting any other language's bundle size.
 *
 * Word forms are plain arrays, not fixed [singular, plural] tuples: English
 * needs 2 forms; Czech/Polish/Croatian/Lithuanian need 3+; Japanese/Korean
 * need exactly 1 (no plural distinction). Which index a given amount maps
 * to is the language file's own pluralize()/rendering logic — that's real
 * per-language grammar and stays there, unchanged. `minor: null` marks a
 * currency with no everyday subunit (see CURRENCY_EXPONENTS below).
 *
 * Populated incrementally: a language ships with just its own current
 * default currency (a pure extraction, no new translation work); naming an
 * additional currency is a small, separately-reviewable addition to that
 * language's export — same growth model as LANGUAGE_NAME_OVERRIDES in
 * test/helpers/language-naming.js.
 * @module currency-vocab
 */

/** @typedef {{ major: string[], minor: string[] | null }} CurrencyWordForms */

// Word-form data reused verbatim by more than one language export, factored
// out once so the strings aren't duplicated per file.
const EN_DOLLAR = { major: ['dollar', 'dollars'], minor: ['cent', 'cents'] }
const FR_EURO = { major: ['euro', 'euros'], minor: ['centime', 'centimes'] }

/** @type {Record<string, CurrencyWordForms>} */
export const enUS = { USD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enCA = { CAD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enAU = { AUD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enGB = { GBP: { major: ['pound', 'pounds'], minor: ['penny', 'pence'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const frFR = { EUR: FR_EURO }

/** @type {Record<string, CurrencyWordForms>} */
export const frBE = { EUR: FR_EURO }

/** @type {Record<string, CurrencyWordForms>} */
export const esES = { EUR: { major: ['euro', 'euros'], minor: ['céntimo', 'céntimos'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const esMX = { MXN: { major: ['peso', 'pesos'], minor: ['centavo', 'centavos'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const esUS = { USD: { major: ['dólar', 'dólares'], minor: ['centavo', 'centavos'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const ptBR = {
  BRL: { major: ['real', 'reais'], minor: ['centavo', 'centavos'] },
  USD: { major: ['dólar', 'dólares'], minor: ['centavo', 'centavos'] },
  EUR: { major: ['euro', 'euros'], minor: ['centavo', 'centavos'] },
  GBP: { major: ['libra', 'libras'], minor: ['pêni', 'pence'] },
  JPY: { major: ['iene', 'ienes'], minor: null },
}

/** @type {Record<string, CurrencyWordForms>} */
export const jaJP = { JPY: { major: ['円'], minor: null } }

// Czech koruna/haléř: [singular, few (2-4), many (5+)] — cs-CZ's own
// pluralize() selects the index; this module only holds the word forms.
/** @type {Record<string, CurrencyWordForms>} */
export const csCZ = {
  CZK: { major: ['koruna', 'koruny', 'korun'], minor: ['haléř', 'haléře', 'haléřů'] },
}

/** @type {Record<string, CurrencyWordForms>} */
export const koKR = { KRW: { major: ['원'], minor: null } }

/** @type {Record<string, CurrencyWordForms>} */
export const viVN = { VND: { major: ['đồng'], minor: null } }

/** @type {Record<string, CurrencyWordForms>} */
export const faIR = { IRR: { major: ['ریال'], minor: null } }

/** @type {Record<string, CurrencyWordForms>} */
export const idID = { IDR: { major: ['rupiah'], minor: null } }

/** @type {Record<string, CurrencyWordForms>} */
export const enBD = { BDT: { major: ['taka'], minor: ['paisa', 'paise'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enGH = { GHS: { major: ['cedi', 'cedis'], minor: ['pesewa', 'pesewas'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enIE = { EUR: { major: ['euro'], minor: ['cent', 'cents'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enIN = { INR: { major: ['rupee', 'rupees'], minor: ['paisa', 'paise'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enKE = { KES: { major: ['shilling', 'shillings'], minor: ['cent', 'cents'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enMY = { MYR: { major: ['ringgit'], minor: ['sen'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enNG = { NGN: { major: ['naira'], minor: ['kobo'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enNZ = { NZD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enPH = { PHP: { major: ['peso', 'pesos'], minor: ['centavo', 'centavos'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enPK = { PKR: { major: ['rupee', 'rupees'], minor: ['paisa', 'paise'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const enSG = { SGD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enZA = { ZAR: { major: ['rand'], minor: ['cent', 'cents'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const bnBD = { BDT: { major: ['টাকা'], minor: ['পয়সা'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const guIN = { INR: { major: ['રૂપિયો', 'રૂપિયા'], minor: ['પૈસો', 'પૈસા'] } }

// Hindi and Marathi both use these Devanagari rupee/paisa forms verbatim.
const HI_MR_RUPEE = { major: ['रुपया', 'रुपये'], minor: ['पैसा', 'पैसे'] }

/** @type {Record<string, CurrencyWordForms>} */
export const hiIN = { INR: HI_MR_RUPEE }

/** @type {Record<string, CurrencyWordForms>} */
export const knIN = { INR: { major: ['ರೂಪಾಯಿ', 'ರೂಪಾಯಿಗಳು'], minor: ['ಪೈಸೆ', 'ಪೈಸೆಗಳು'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const mrIN = { INR: HI_MR_RUPEE }

/** @type {Record<string, CurrencyWordForms>} */
export const paIN = { INR: { major: ['ਰੁਪਇਆ', 'ਰੁਪਏ'], minor: ['ਪੈਸਾ', 'ਪੈਸੇ'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const taIN = { INR: { major: ['ரூபாய்'], minor: ['பைசா'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const teIN = { INR: { major: ['రూపాయి', 'రూపాయలు'], minor: ['పైసా', 'పైసలు'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const urPK = { PKR: { major: ['روپیہ', 'روپے'], minor: ['پیسہ', 'پیسے'] } }

/**
 * ISO 4217 minor-unit decimal exponent, for currencies that diverge from the
 * default of 2 (most currencies). Only overrides are listed; an absent code
 * is assumed to be 2.
 * @type {Record<string, number>}
 */
export const CURRENCY_EXPONENTS = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  IRR: 0,
  IDR: 0,
}

/**
 * Guards a currency amount against a fractional part its currency can't
 * represent — e.g. JPY has no everyday minor unit, so a fractional yen
 * amount should throw rather than spell a fictitious subunit or silently
 * drop it. "Loud beats silent," the same philosophy checkMax and
 * resolveOptions already apply to their own preconditions.
 * @param {bigint} cents - The fractional/minor-unit amount, from parseCurrencyValue
 * @param {string} currencyCode - The resolved ISO 4217 code
 * @throws {RangeError} If the currency has no minor unit and cents is nonzero
 */
export function assertCurrencyExponent(cents, currencyCode) {
  if (cents !== 0n && (CURRENCY_EXPONENTS[currencyCode] ?? 2) === 0) {
    throw new RangeError(`${currencyCode} has no minor unit — fractional amounts aren't representable`)
  }
}
