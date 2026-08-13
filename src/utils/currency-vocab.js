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

/** @type {Record<string, CurrencyWordForms>} */
export const koKR = { KRW: { major: ['원'], minor: null } }

/** @type {Record<string, CurrencyWordForms>} */
export const viVN = { VND: { major: ['đồng'], minor: null } }

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
