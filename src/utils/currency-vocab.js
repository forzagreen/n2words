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

// The Arab-world dinars all divide into 1000 fils (CURRENCY_EXPONENTS marks
// them 3). Tunisia, Oman and Libya are the odd ones out: Tunisia's subunit is
// the millime, Libya's the dirham, and Oman's unit is a rial, not a dinar,
// divided into baisa. "fils" is already plural in English and doesn't inflect.
const EN_DINAR_FILS = { major: ['dinar', 'dinars'], minor: ['fils', 'fils'] }
const EN_DINAR_MILLIME = { major: ['dinar', 'dinars'], minor: ['millime', 'millimes'] }
const FR_DINAR_MILLIME = { major: ['dinar', 'dinars'], minor: ['millime', 'millimes'] }

// The Moroccan dirham is not one of the 1000-subunit currencies above: it
// divides into 100 centimes like the euro, so it takes no CURRENCY_EXPONENTS
// entry and parses at the default two digits.
const EN_DIRHAM_CENTIME = { major: ['dirham', 'dirhams'], minor: ['centime', 'centimes'] }
const FR_DIRHAM_CENTIME = { major: ['dirham', 'dirhams'], minor: ['centime', 'centimes'] }

// en-US carries the full 1000-subunit set: English is the language these
// currencies are most often quoted in outside their own countries, and it is
// reachable as the bare `n2words/en` entry point.
/** @type {Record<string, CurrencyWordForms>} */
export const enUS = {
  USD: EN_DOLLAR,
  TND: EN_DINAR_MILLIME,
  KWD: EN_DINAR_FILS,
  BHD: EN_DINAR_FILS,
  JOD: EN_DINAR_FILS,
  IQD: EN_DINAR_FILS,
  OMR: { major: ['rial', 'rials'], minor: ['baisa', 'baisas'] },
  LYD: { major: ['dinar', 'dinars'], minor: ['dirham', 'dirhams'] },
  // Morocco divides into 100 centimes, so MAD is an ordinary 2-decimal
  // currency despite sitting among the dinars above.
  MAD: EN_DIRHAM_CENTIME,
}

/** @type {Record<string, CurrencyWordForms>} */
export const enCA = { CAD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enAU = { AUD: EN_DOLLAR }

/** @type {Record<string, CurrencyWordForms>} */
export const enGB = { GBP: { major: ['pound', 'pounds'], minor: ['penny', 'pence'] } }

// French names the Tunisian dinar (Tunisia is francophone); the Gulf dinars
// have no comparable French-language footing and stay out until one is asked for.
/** @type {Record<string, CurrencyWordForms>} */
export const frFR = { EUR: FR_EURO, TND: FR_DINAR_MILLIME, MAD: FR_DIRHAM_CENTIME }

/** @type {Record<string, CurrencyWordForms>} */
export const frBE = { EUR: FR_EURO, TND: FR_DINAR_MILLIME, MAD: FR_DIRHAM_CENTIME }

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

// Ethiopian Birr/Santim — invariable, no plural distinction. am-ET is Ge'ez
// script, am-Latn-ET is a Latin transliteration, so the word text differs.
/** @type {Record<string, CurrencyWordForms>} */
export const amET = { ETB: { major: ['ብር'], minor: ['ሳንቲም'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const amLatnET = { ETB: { major: ['birr'], minor: ['santim'] } }

// Serbian Dinar/Para: [singular, few (2-4), many (5+)] — sr-Cyrl-RS's and
// sr-Latn-RS's own pluralize() selects the index. Same grammar, different script.
/** @type {Record<string, CurrencyWordForms>} */
export const srCyrlRS = {
  RSD: { major: ['динар', 'динара', 'динара'], minor: ['пара', 'паре', 'пара'] },
}

/** @type {Record<string, CurrencyWordForms>} */
export const srLatnRS = {
  RSD: { major: ['dinar', 'dinara', 'dinara'], minor: ['para', 'pare', 'para'] },
}

// zh-Hans-CN Yuan: major[0]/[1] = formal/common denomination word (圆/元) —
// not a singular/plural distinction. minor[0]/[1] = jiao (角, 1/10 yuan)/fen
// (分, 1/100 yuan), two distinct minor denominations rather than plural forms.
/** @type {Record<string, CurrencyWordForms>} */
export const zhHansCN = { CNY: { major: ['圆', '元'], minor: ['角', '分'] } }

// zh-Hant-TW New Taiwan Dollar: same indexing convention as zh-Hans-CN above
// (major = formal/common denomination; minor = jiao/fen), Traditional glyphs.
/** @type {Record<string, CurrencyWordForms>} */
export const zhHantTW = { TWD: { major: ['圓', '元'], minor: ['角', '分'] } }

// Arabic currency words: [singular, dual, plural (3-10), plural (11+)] —
// ar-SA's own getRiyalForm()/getHalalaForm() select the index. The 11+ slot is
// the tamyīz form: masculine nouns take tanwīn (ريالاً, ديناراً), while a
// feminine ة noun keeps its base form (هللة, بيسة).
//
// Arabic number words are the same across every Arabic variant — only the
// currency differs by country — so this one export is the right home for the
// whole Arab-world set rather than splitting it per (as yet unimplemented)
// regional variant.
const AR_RIAL = ['ريال', 'ريالان', 'ريالات', 'ريالاً']
const AR_DINAR = ['دينار', 'ديناران', 'دنانير', 'ديناراً']
const AR_FILS = ['فلس', 'فلسان', 'فلوس', 'فلساً']
// درهم is Libya's *minor* unit and Morocco's *major* one — same word, two roles.
const AR_DIRHAM = ['درهم', 'درهمان', 'دراهم', 'درهماً']

/** @type {Record<string, CurrencyWordForms>} */
export const arSA = {
  SAR: { major: AR_RIAL, minor: ['هللة', 'هللتان', 'هللات', 'هللة'] },
  TND: { major: AR_DINAR, minor: ['مليم', 'مليمان', 'مليمات', 'مليماً'] },
  KWD: { major: AR_DINAR, minor: AR_FILS },
  BHD: { major: AR_DINAR, minor: AR_FILS },
  JOD: { major: AR_DINAR, minor: AR_FILS },
  IQD: { major: AR_DINAR, minor: AR_FILS },
  OMR: { major: AR_RIAL, minor: ['بيسة', 'بيستان', 'بيسات', 'بيسة'] },
  LYD: { major: AR_DINAR, minor: AR_DIRHAM },
  // Morocco divides into 100 santim, not 1000 — no CURRENCY_EXPONENTS entry.
  MAD: { major: AR_DIRHAM, minor: ['سنتيم', 'سنتيمان', 'سنتيمات', 'سنتيماً'] },
}

// hbo-IL (Biblical Hebrew) and he-IL (Modern Hebrew) share identical Shekel
// major-unit forms; they differ in the minor unit — historical gerah
// (Biblical) vs modern agora.
const SHEKEL_MAJOR = ['שקל', 'שקלים']

/** @type {Record<string, CurrencyWordForms>} */
export const hboIL = { ILS: { major: SHEKEL_MAJOR, minor: ['גרה', 'גרות'] } }

/** @type {Record<string, CurrencyWordForms>} */
export const heIL = { ILS: { major: SHEKEL_MAJOR, minor: ['אגורה', 'אגורות'] } }

// Georgian Lari/Tetri — invariable, no plural distinction.
/** @type {Record<string, CurrencyWordForms>} */
export const kaGE = { GEL: { major: ['ლარი'], minor: ['თეთრი'] } }

// Croatian Euro/Cent: [singular, few (2-4), many (5+)] — hr-HR's own
// pluralize() selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const hrHR = {
  EUR: { major: ['euro', 'eura', 'eura'], minor: ['cent', 'centa', 'centi'] },
}

// Lithuanian Euro/Cent: [singular, plural, genitive] — lt-LT's own
// pluralize() selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const ltLT = {
  EUR: { major: ['euras', 'eurai', 'eurų'], minor: ['centas', 'centai', 'centų'] },
}

// Latvian Euro/Cent: eiro (euro) is indeclinable, hence a single major form;
// centi use [singular, plural, genitive] — lv-LV's own pluralizeCurrency()
// selects the minor index.
/** @type {Record<string, CurrencyWordForms>} */
export const lvLV = {
  EUR: { major: ['eiro'], minor: ['cents', 'centi', 'centu'] },
}

// Polish Złoty/Grosz: [singular, few (2-4), many (5+)] — pl-PL's own
// pluralize() selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const plPL = {
  PLN: { major: ['złoty', 'złote', 'złotych'], minor: ['grosz', 'grosze', 'groszy'] },
}

// Russian Ruble/Kopeck: [singular, few, many] — ru-RU's own pluralize()
// selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const ruRU = {
  RUB: { major: ['рубль', 'рубля', 'рублей'], minor: ['копейка', 'копейки', 'копеек'] },
}

// Ukrainian Hryvnia/Kopiyka: [singular, few, many] — uk-UA's own pluralize()
// selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const ukUA = {
  UAH: { major: ['гривня', 'гривнi', 'гривень'], minor: ['копiйка', 'копiйки', 'копiйок'] },
}

// Danish Krone/Øre: [singular, plural] for krone; øre is invariable (same
// singular/plural) — da-DK's own toCurrency selects the major index.
/** @type {Record<string, CurrencyWordForms>} */
export const daDK = {
  DKK: { major: ['krone', 'kroner'], minor: ['øre'] },
}

// German Euro/Cent — both invariable (no plural form) in German currency
// speech: "ein Euro", "zwei Euro".
/** @type {Record<string, CurrencyWordForms>} */
export const deDE = {
  EUR: { major: ['Euro'], minor: ['Cent'] },
}

// Finnish Euro/Sentti: [singular, plural] — fi-FI's own toCurrency selects
// the index (euro/euroa, sentti/senttiä).
/** @type {Record<string, CurrencyWordForms>} */
export const fiFI = {
  EUR: { major: ['euro', 'euroa'], minor: ['sentti', 'senttiä'] },
}

// Norwegian Bokmål Krone/Øre: [singular, plural] for krone; øre is
// invariable (same singular/plural) — nb-NO's own toCurrency selects the
// major index.
/** @type {Record<string, CurrencyWordForms>} */
export const nbNO = {
  NOK: { major: ['krone', 'kroner'], minor: ['øre'] },
}

// Dutch Euro/Cent — both invariable in written Dutch currency (euro and cent
// don't pluralize).
/** @type {Record<string, CurrencyWordForms>} */
export const nlNL = {
  EUR: { major: ['euro'], minor: ['cent'] },
}

// Swedish Krona/Öre: [singular, plural] for krona; öre is invariable (same
// singular/plural) — sv-SE's own toCurrency selects the major index.
/** @type {Record<string, CurrencyWordForms>} */
export const svSE = {
  SEK: { major: ['krona', 'kronor'], minor: ['öre'] },
}

// Italian Euro/Centesimo: euro is invariable; centesimo/centesimi is
// [singular, plural] — it-IT's own toCurrency selects the minor index.
/** @type {Record<string, CurrencyWordForms>} */
export const itIT = {
  EUR: { major: ['euro'], minor: ['centesimo', 'centesimi'] },
}

// Romanian Leu/Ban: [singular, plural] — ro-RO's own toCurrency selects the
// index (and inserts "de" for higher counts, unchanged local grammar).
/** @type {Record<string, CurrencyWordForms>} */
export const roRO = {
  RON: { major: ['leu', 'lei'], minor: ['ban', 'bani'] },
}

// Portuguese (Portugal) Euro/Cêntimo: [singular, plural] — pt-PT's own
// toCurrency selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const ptPT = {
  EUR: { major: ['euro', 'euros'], minor: ['cêntimo', 'cêntimos'] },
}

// Azerbaijani Manat/Qəpik — both invariable (no plural distinction) in
// Azerbaijani currency speech.
/** @type {Record<string, CurrencyWordForms>} */
export const azAZ = {
  AZN: { major: ['manat'], minor: ['qəpik'] },
}

// Greek Euro/Λεπτό: euro is indeclinable (same singular/plural form used at
// both indices); lepto uses [singular, plural] — el-GR's own toCurrency
// selects the index.
/** @type {Record<string, CurrencyWordForms>} */
export const elGR = {
  EUR: { major: ['ευρώ', 'ευρώ'], minor: ['λεπτό', 'λεπτά'] },
}

// Philippine Peso/Sentimo (Filipino) — both invariable in Filipino currency
// speech. Distinct from en-PH, which uses different (English) words.
/** @type {Record<string, CurrencyWordForms>} */
export const filPH = {
  PHP: { major: ['piso'], minor: ['sentimo'] },
}

// Nigerian Naira/Kobo (Hausa) — both invariable. Distinct export from en-NG
// and yo-NG, which use different words for the same ISO code.
/** @type {Record<string, CurrencyWordForms>} */
export const haNG = {
  NGN: { major: ['naira'], minor: ['kobo'] },
}

// Hungarian Forint/Fillér — both invariable (no plural form in Hungarian
// currency speech). Fillér is rarely used but included for completeness.
/** @type {Record<string, CurrencyWordForms>} */
export const huHU = {
  HUF: { major: ['forint'], minor: ['fillér'] },
}

// Malaysian Ringgit/Sen — both invariable. Distinct from en-MY, which uses
// different (English) words.
/** @type {Record<string, CurrencyWordForms>} */
export const msMY = {
  MYR: { major: ['ringgit'], minor: ['sen'] },
}

// Kenyan Shilling/Cent (Swahili) — both invariable. Distinct from en-KE,
// which uses different (English) words.
/** @type {Record<string, CurrencyWordForms>} */
export const swKE = {
  KES: { major: ['shilingi'], minor: ['senti'] },
}

// Thai Baht/Satang — both invariable (Thai has no plural marking).
/** @type {Record<string, CurrencyWordForms>} */
export const thTH = {
  THB: { major: ['บาท'], minor: ['สตางค์'] },
}

// Turkish Lira/Kuruş — both invariable.
/** @type {Record<string, CurrencyWordForms>} */
export const trTR = {
  TRY: { major: ['lira'], minor: ['kuruş'] },
}

// Nigerian Naira/Kobo (Yoruba) — both invariable, distinct spelling/tone
// marks from ha-NG and en-NG.
/** @type {Record<string, CurrencyWordForms>} */
export const yoNG = {
  NGN: { major: ['náírà'], minor: ['kọ́bọ̀'] },
}

/**
 * Currencies whose ISO 4217 minor-unit exponent is 0 — they have no everyday
 * subunit at all. Only these overrides are listed; an absent code is assumed
 * to be 2, which covers every other currency n2words names.
 *
 * **Only 0 and 3 may appear here**, and the type says so — 2 is the implicit
 * default for everything absent, so listing it would be noise.
 *
 * A 3 means the minor unit is a *thousandth* (millimes, fils, baisa). Such a
 * currency is only safe to name if the language passes
 * `minorUnitDigits(currency)` to `parseCurrencyValue`; parsing it at the
 * default 2 digits would read `'1.500'` as 50 minor units and confidently
 * spell "one dinar and fifty millimes" for an amount meaning five hundred.
 * `currency-vocab-contract.test.js` proves the round trip behaviourally for
 * every 3-decimal currency a language advertises, so a language that forgets
 * to pass the digits fails CI rather than shipping the mis-parse.
 * @type {Record<string, 0 | 3>}
 */
export const CURRENCY_EXPONENTS = {
  // No everyday minor unit at all.
  JPY: 0,
  KRW: 0,
  VND: 0,
  IRR: 0,
  IDR: 0,

  // Minor unit is 1/1000, not 1/100.
  TND: 3, // millime
  KWD: 3, // fils
  BHD: 3, // fils
  OMR: 3, // baisa
  JOD: 3, // fils
  IQD: 3, // fils
  LYD: 3, // dirham
}

/**
 * Decimal digits `parseCurrencyValue` should track for a currency.
 *
 * Note this is *not* the ISO 4217 exponent: a zero-exponent currency returns
 * 2, not 0. The whole point of keeping two digits there is that
 * `assertCurrencyExponent` can only reject a fraction the parser bothered to
 * keep — parsing JPY at 0 digits would silently turn 1.5 yen into 1 yen,
 * which is exactly the silent truncation this package refuses to do.
 * @param {string} currencyCode - The resolved ISO 4217 code
 * @returns {number} 3 for a thousandth-unit currency, otherwise 2
 */
export function minorUnitDigits(currencyCode) {
  return CURRENCY_EXPONENTS[currencyCode] === 3 ? 3 : 2
}

/**
 * Guards a currency amount against a fractional part its currency can't
 * represent — e.g. JPY has no everyday minor unit, so a fractional yen
 * amount throws rather than spelling a fictitious subunit or silently
 * dropping it. "Loud beats silent," the same philosophy checkMax and
 * resolveOptions already apply to their own preconditions.
 *
 * Scoped to what `parseCurrencyValue` measures: `cents` is the amount's
 * minor-unit part at that function's two-decimal precision, so this guard
 * fires on any fraction of 0.01 or more. A finer input (`'1.004'`) was
 * already truncated before arriving here and is *not* an error — see
 * parseCurrencyValue's "Precision" note for why two digits is the contract,
 * and why no supported currency can lose anything to it.
 *
 * Callers that reach a `minor: null` currency's word list rely on this: a
 * nonzero minor part is impossible past this point for such a currency, which
 * is what licenses narrowing `minor` to `string[]` inside a `cents > 0n` branch.
 * @param {bigint} cents - The minor-unit amount, from parseCurrencyValue
 * @param {string} currencyCode - The resolved ISO 4217 code
 * @throws {RangeError} If the currency has no minor unit and cents is nonzero
 */
export function assertCurrencyExponent(cents, currencyCode) {
  if (cents !== 0n && CURRENCY_EXPONENTS[currencyCode] === 0) {
    throw new RangeError(`${currencyCode} has no minor unit — fractional amounts aren't representable`)
  }
}
