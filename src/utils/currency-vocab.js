/**
 * Cross-language currency-name matrix.
 *
 * One named export per *language* (not per regional/script locale), keyed by
 * the same minimal tag as that language's numeral entry point — camelCase,
 * e.g. `en` for the English family, `ptBR`/`ptPT` where the language itself
 * splits (see below). A language file imports only its own export, so each
 * per-language Rollup bundle (rollup.config.js) ships only that language's
 * rows via ordinary dead-code elimination on unused bindings — unlike an
 * object keyed the other way (ISO code -> language), where an unused
 * property of an exported object literal is NOT eliminated. The matrix can
 * grow to include any language naming any currency without affecting any
 * other language's bundle size.
 *
 * Word forms are plain arrays, not fixed [singular, plural] tuples: English
 * needs 2 forms; Czech/Polish/Croatian/Lithuanian need 3+; Japanese/Korean
 * need exactly 1 (no plural distinction). Which index a given amount maps
 * to is the language file's own pluralize()/rendering logic — that's real
 * per-language grammar and stays there, unchanged. `minor: null` marks a
 * currency with no everyday subunit (see CURRENCY_EXPONENTS below).
 *
 * `majorGender`/`minorGender` are present only for a language whose cardinal
 * builder takes a grammatical-gender argument (Arabic, Spanish, Slavic,
 * Baltic, Romanian) — see "Grammatical gender" below.
 *
 * Populated incrementally: a language ships with just its own current
 * default currency (a pure extraction, no new translation work); naming an
 * additional currency is a small, separately-reviewable addition to that
 * language's export — same growth model as LANGUAGE_NAME_OVERRIDES in
 * test/helpers/language-naming.js.
 * @module currency-vocab
 */

/**
 * @typedef {object} CurrencyWordForms
 * @property {string[]} major - Word forms for the major unit, in the language's own plural-index order
 * @property {string[] | null} minor - Word forms for the minor unit, or null if the currency has none
 * @property {('masculine' | 'feminine')} [majorGender] - Grammatical gender of the major-unit noun, for a gender-sensitive language
 * @property {('masculine' | 'feminine')} [minorGender] - Grammatical gender of the minor-unit noun, for a gender-sensitive language
 */

// Word-form data reused verbatim by more than one currency entry within a
// language, factored out once so the strings aren't duplicated per entry.
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

// English: every English-speaking locale's currency, in one map. Any English
// entry point can now name any of these — en-AU can quote KES, en-KE can
// quote GBP — because "which words" and "which country" are different axes
// (see docs/language-layers.md). No two source locales named the same ISO
// code, so this merge is a pure union, not a judgment call.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const en = {
  USD: EN_DOLLAR,
  CAD: EN_DOLLAR,
  AUD: EN_DOLLAR,
  NZD: EN_DOLLAR,
  SGD: EN_DOLLAR,
  GBP: { major: ['pound', 'pounds'], minor: ['penny', 'pence'] },
  EUR: { major: ['euro'], minor: ['cent', 'cents'] }, // en-IE wording
  BDT: { major: ['taka'], minor: ['paisa', 'paise'] },
  GHS: { major: ['cedi', 'cedis'], minor: ['pesewa', 'pesewas'] },
  INR: { major: ['rupee', 'rupees'], minor: ['paisa', 'paise'] },
  KES: { major: ['shilling', 'shillings'], minor: ['cent', 'cents'] },
  MYR: { major: ['ringgit'], minor: ['sen'] },
  NGN: { major: ['naira'], minor: ['kobo'] },
  PHP: { major: ['peso', 'pesos'], minor: ['centavo', 'centavos'] },
  PKR: { major: ['rupee', 'rupees'], minor: ['paisa', 'paise'] },
  ZAR: { major: ['rand'], minor: ['cent', 'cents'] },
  // 1000-subunit dinars, previously carried only by en-US. English is the
  // language these are most often quoted in outside their own countries.
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

// French names the Tunisian dinar (Tunisia is francophone) and the Moroccan
// dirham; the Gulf dinars have no comparable French-language footing and
// stay out until one is asked for. fr-FR and fr-BE named identical words for
// every currency, so this was already a pure union before the merge.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const fr = { EUR: FR_EURO, TND: FR_DINAR_MILLIME, MAD: FR_DIRHAM_CENTIME }

// Spanish: EUR (Spain), MXN (Mexico), USD (US) are three different
// currencies, so merging es-ES/es-MX/es-US into one language-keyed map is a
// pure union with no wording conflict — unlike pt-BR/pt-PT below, no two
// Spanish locales name the same ISO code with different words (yet).
// Grammatical gender: Spanish currency nouns are masculine ("un euro", "un
// peso", "un dólar") — see "Grammatical gender" below for how es-*.js
// consumes majorGender/minorGender.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const es = {
  EUR: { major: ['euro', 'euros'], minor: ['céntimo', 'céntimos'], majorGender: 'masculine', minorGender: 'masculine' },
  MXN: { major: ['peso', 'pesos'], minor: ['centavo', 'centavos'], majorGender: 'masculine', minorGender: 'masculine' },
  USD: { major: ['dólar', 'dólares'], minor: ['centavo', 'centavos'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Portuguese STAYS SPLIT by region, unlike en/fr/es above: pt-BR and pt-PT
// name the same EUR cêntimo/centavo with different spellings — a real
// wording conflict, not just an unpopulated union — and pt-BR/pt-PT are
// already separate numeral systems (see docs/bare-tag-aliases.md), so
// splitting the vocab the same way costs nothing extra.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ptBR = {
  BRL: { major: ['real', 'reais'], minor: ['centavo', 'centavos'] },
  USD: { major: ['dólar', 'dólares'], minor: ['centavo', 'centavos'] },
  EUR: { major: ['euro', 'euros'], minor: ['centavo', 'centavos'] },
  GBP: { major: ['libra', 'libras'], minor: ['pêni', 'pence'] },
  JPY: { major: ['iene', 'ienes'], minor: null },
}

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ptPT = {
  EUR: { major: ['euro', 'euros'], minor: ['cêntimo', 'cêntimos'] },
}

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ja = { JPY: { major: ['円'], minor: null } }

// Czech koruna/haléř: [singular, few (2-4), many (5+)] — cs's own
// pluralize() selects the index; this module only holds the word forms.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const cs = {
  CZK: { major: ['koruna', 'koruny', 'korun'], minor: ['haléř', 'haléře', 'haléřů'] },
}

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ko = { KRW: { major: ['원'], minor: null } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const vi = { VND: { major: ['đồng'], minor: null } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const fa = { IRR: { major: ['ریال'], minor: null } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const id = { IDR: { major: ['rupiah'], minor: null } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const bn = { BDT: { major: ['টাকা'], minor: ['পয়সা'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const gu = { INR: { major: ['રૂપિયો', 'રૂપિયા'], minor: ['પૈસો', 'પૈસા'] } }

// Hindi and Marathi both use these Devanagari rupee/paisa forms verbatim.
const HI_MR_RUPEE = { major: ['रुपया', 'रुपये'], minor: ['पैसा', 'पैसे'] }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const hi = { INR: HI_MR_RUPEE }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const kn = { INR: { major: ['ರೂಪಾಯಿ', 'ರೂಪಾಯಿಗಳು'], minor: ['ಪೈಸೆ', 'ಪೈಸೆಗಳು'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const mr = { INR: HI_MR_RUPEE }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const pa = { INR: { major: ['ਰੁਪਇਆ', 'ਰੁਪਏ'], minor: ['ਪੈਸਾ', 'ਪੈਸੇ'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ta = { INR: { major: ['ரூபாய்'], minor: ['பைசா'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const te = { INR: { major: ['రూపాయి', 'రూపాయలు'], minor: ['పైసా', 'పైసలు'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ur = { PKR: { major: ['روپیہ', 'روپے'], minor: ['پیسہ', 'پیسے'] } }

// Ethiopian Birr/Santim — invariable, no plural distinction. am is Ge'ez
// script, amLatn is a Latin transliteration, so the word text differs; this
// is a script split (see docs/language-layers.md), same treatment as zh/sr.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const am = { ETB: { major: ['ብር'], minor: ['ሳንቲም'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const amLatn = { ETB: { major: ['birr'], minor: ['santim'] } }

// Serbian Dinar/Para: [singular, few (2-4), many (5+)] — srCyrl's and
// srLatn's own pluralize() selects the index. Same grammar, different script.
// Dinar is masculine, para is feminine — see "Grammatical gender" below.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const srCyrl = {
  RSD: { major: ['динар', 'динара', 'динара'], minor: ['пара', 'паре', 'пара'], majorGender: 'masculine', minorGender: 'feminine' },
}

/** @satisfies {Record<string, CurrencyWordForms>} */
export const srLatn = {
  RSD: { major: ['dinar', 'dinara', 'dinara'], minor: ['para', 'pare', 'para'], majorGender: 'masculine', minorGender: 'feminine' },
}

// zh-Hans-CN Yuan: major[0]/[1] = formal/common denomination word (圆/元) —
// not a singular/plural distinction. minor[0]/[1] = jiao (角, 1/10 yuan)/fen
// (分, 1/100 yuan), two distinct minor denominations rather than plural
// forms. Region drops from the key (zhHansCN -> zhHans): Simplified vs
// Traditional script is the only thing distinguishing these two entries,
// same as am/amLatn and srCyrl/srLatn above.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const zhHans = { CNY: { major: ['圆', '元'], minor: ['角', '分'] } }

// zh-Hant-TW New Taiwan Dollar: same indexing convention as zhHans above
// (major = formal/common denomination; minor = jiao/fen), Traditional glyphs.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const zhHant = { TWD: { major: ['圓', '元'], minor: ['角', '分'] } }

// Arabic currency words: [singular, dual, plural (3-10), plural (11+)] —
// ar's own getRiyalForm()/getHalalaForm() select the index. The 11+ slot is
// the tamyīz form: masculine nouns take tanwīn (ريالاً, ديناراً), while a
// feminine ة noun keeps its base form (هللة, بيسة).
//
// Arabic number words are the same across every Arabic variant — only the
// currency differs by country — so this one export is the right home for the
// whole Arab-world set rather than splitting it per (as yet unimplemented)
// regional variant.
//
// Grammatical gender: every major unit named below (ريال، دينار، درهم) happens
// to be masculine, so only minorGender is populated so far — see "Grammatical
// gender" below and ar.js's own getRiyalForm()/getHalalaForm().
const AR_RIAL = ['ريال', 'ريالان', 'ريالات', 'ريالاً']
const AR_DINAR = ['دينار', 'ديناران', 'دنانير', 'ديناراً']
const AR_FILS = ['فلس', 'فلسان', 'فلوس', 'فلساً']
// درهم is Libya's *minor* unit and Morocco's *major* one — same word, two roles.
const AR_DIRHAM = ['درهم', 'درهمان', 'دراهم', 'درهماً']

/** @satisfies {Record<string, CurrencyWordForms>} */
export const ar = {
  SAR: { major: AR_RIAL, minor: ['هللة', 'هللتان', 'هللات', 'هللة'], minorGender: 'feminine' },
  TND: { major: AR_DINAR, minor: ['مليم', 'مليمان', 'مليمات', 'مليماً'], minorGender: 'masculine' },
  KWD: { major: AR_DINAR, minor: AR_FILS, minorGender: 'masculine' },
  BHD: { major: AR_DINAR, minor: AR_FILS, minorGender: 'masculine' },
  JOD: { major: AR_DINAR, minor: AR_FILS, minorGender: 'masculine' },
  IQD: { major: AR_DINAR, minor: AR_FILS, minorGender: 'masculine' },
  OMR: { major: AR_RIAL, minor: ['بيسة', 'بيستان', 'بيسات', 'بيسة'], minorGender: 'feminine' },
  LYD: { major: AR_DINAR, minor: AR_DIRHAM, minorGender: 'masculine' },
  // Morocco divides into 100 santim, not 1000 — no CURRENCY_EXPONENTS entry.
  MAD: { major: AR_DIRHAM, minor: ['سنتيم', 'سنتيمان', 'سنتيمات', 'سنتيماً'], minorGender: 'masculine' },
}

// hbo (Biblical Hebrew) and he (Modern Hebrew) share identical Shekel
// major-unit forms; they differ in the minor unit — historical gerah
// (Biblical) vs modern agora. Different primary language subtags (not a
// script split), each with exactly one entry point, so each gets its own
// bare key like every other single-variant language below.
const SHEKEL_MAJOR = ['שקל', 'שקלים']

/** @satisfies {Record<string, CurrencyWordForms>} */
export const hbo = { ILS: { major: SHEKEL_MAJOR, minor: ['גרה', 'גרות'] } }

/** @satisfies {Record<string, CurrencyWordForms>} */
export const he = { ILS: { major: SHEKEL_MAJOR, minor: ['אגורה', 'אגורות'] } }

// Georgian Lari/Tetri — invariable, no plural distinction.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ka = { GEL: { major: ['ლარი'], minor: ['თეთრი'] } }

// Croatian Euro/Cent: [singular, few (2-4), many (5+)] — hr's own
// pluralize() selects the index. Both nouns masculine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const hr = {
  EUR: { major: ['euro', 'eura', 'eura'], minor: ['cent', 'centa', 'centi'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Lithuanian Euro/Cent: [singular, plural, genitive] — lt's own
// pluralize() selects the index. Both nouns masculine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const lt = {
  EUR: { major: ['euras', 'eurai', 'eurų'], minor: ['centas', 'centai', 'centų'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Latvian Euro/Cent: eiro (euro) is indeclinable, hence a single major form;
// centi use [singular, plural, genitive] — lv's own pluralizeCurrency()
// selects the minor index. Both nouns masculine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const lv = {
  EUR: { major: ['eiro'], minor: ['cents', 'centi', 'centu'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Polish Złoty/Grosz: [singular, few (2-4), many (5+)] — pl's own
// pluralize() selects the index. Both nouns masculine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const pl = {
  PLN: { major: ['złoty', 'złote', 'złotych'], minor: ['grosz', 'grosze', 'groszy'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Russian Ruble/Kopeck: [singular, few, many] — ru's own pluralize()
// selects the index. рубль is masculine, копейка is feminine — this is the
// pairing that originally motivated moving gender into the matrix: naming a
// second currency (e.g. UAH, feminine рубль-equivalent гривна) without it
// would silently emit masculine agreement on a feminine noun.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ru = {
  RUB: { major: ['рубль', 'рубля', 'рублей'], minor: ['копейка', 'копейки', 'копеек'], majorGender: 'masculine', minorGender: 'feminine' },
}

// Ukrainian Hryvnia/Kopiyka: [singular, few, many] — uk's own pluralize()
// selects the index. гривня is feminine (unlike Russian's masculine рубль),
// копiйка is feminine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const uk = {
  UAH: { major: ['гривня', 'гривнi', 'гривень'], minor: ['копiйка', 'копiйки', 'копiйок'], majorGender: 'feminine', minorGender: 'feminine' },
}

// Danish Krone/Øre: [singular, plural] for krone; øre is invariable (same
// singular/plural) — da's own toCurrency selects the major index.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const da = {
  DKK: { major: ['krone', 'kroner'], minor: ['øre'] },
}

// German Euro/Cent — both invariable (no plural form) in German currency
// speech: "ein Euro", "zwei Euro".
/** @satisfies {Record<string, CurrencyWordForms>} */
export const de = {
  EUR: { major: ['Euro'], minor: ['Cent'] },
}

// Finnish Euro/Sentti: [singular, plural] — fi's own toCurrency selects
// the index (euro/euroa, sentti/senttiä).
/** @satisfies {Record<string, CurrencyWordForms>} */
export const fi = {
  EUR: { major: ['euro', 'euroa'], minor: ['sentti', 'senttiä'] },
}

// Norwegian Bokmål Krone/Øre: [singular, plural] for krone; øre is
// invariable (same singular/plural) — nb's own toCurrency selects the
// major index.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const nb = {
  NOK: { major: ['krone', 'kroner'], minor: ['øre'] },
}

// Dutch Euro/Cent — both invariable in written Dutch currency (euro and cent
// don't pluralize).
/** @satisfies {Record<string, CurrencyWordForms>} */
export const nl = {
  EUR: { major: ['euro'], minor: ['cent'] },
}

// Swedish Krona/Öre: [singular, plural] for krona; öre is invariable (same
// singular/plural) — sv's own toCurrency selects the major index.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const sv = {
  SEK: { major: ['krona', 'kronor'], minor: ['öre'] },
}

// Italian Euro/Centesimo: euro is invariable; centesimo/centesimi is
// [singular, plural] — it's own toCurrency selects the minor index.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const it = {
  EUR: { major: ['euro'], minor: ['centesimo', 'centesimi'] },
}

// Romanian Leu/Ban: [singular, plural] — ro's own toCurrency selects the
// index (and inserts "de" for higher counts, unchanged local grammar). Both
// nouns masculine.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ro = {
  RON: { major: ['leu', 'lei'], minor: ['ban', 'bani'], majorGender: 'masculine', minorGender: 'masculine' },
}

// Azerbaijani Manat/Qəpik — both invariable (no plural distinction) in
// Azerbaijani currency speech.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const az = {
  AZN: { major: ['manat'], minor: ['qəpik'] },
}

// Greek Euro/Λεπτό: euro is indeclinable (same singular/plural form used at
// both indices); lepto uses [singular, plural] — el's own toCurrency
// selects the index.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const el = {
  EUR: { major: ['ευρώ', 'ευρώ'], minor: ['λεπτό', 'λεπτά'] },
}

// Philippine Peso/Sentimo (Filipino) — both invariable in Filipino currency
// speech. Distinct from en's PHP entry, which uses different (English) words.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const fil = {
  PHP: { major: ['piso'], minor: ['sentimo'] },
}

// Nigerian Naira/Kobo (Hausa) — both invariable. Distinct export from en's
// and yo's NGN entries, which use different words for the same ISO code.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ha = {
  NGN: { major: ['naira'], minor: ['kobo'] },
}

// Hungarian Forint/Fillér — both invariable (no plural form in Hungarian
// currency speech). Fillér is rarely used but included for completeness.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const hu = {
  HUF: { major: ['forint'], minor: ['fillér'] },
}

// Malaysian Ringgit/Sen — both invariable. Distinct from en's MYR entry,
// which uses different (English) words.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const ms = {
  MYR: { major: ['ringgit'], minor: ['sen'] },
}

// Kenyan Shilling/Cent (Swahili) — both invariable. Distinct from en's KES
// entry, which uses different (English) words.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const sw = {
  KES: { major: ['shilingi'], minor: ['senti'] },
}

// Thai Baht/Satang — both invariable (Thai has no plural marking).
/** @satisfies {Record<string, CurrencyWordForms>} */
export const th = {
  THB: { major: ['บาท'], minor: ['สตางค์'] },
}

// Turkish Lira/Kuruş — both invariable.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const tr = {
  TRY: { major: ['lira'], minor: ['kuruş'] },
}

// Nigerian Naira/Kobo (Yoruba) — both invariable, distinct spelling/tone
// marks from ha's and en's NGN entries.
/** @satisfies {Record<string, CurrencyWordForms>} */
export const yo = {
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
 * to pass the digits fails CI rather than shipping the mis-parse. This is why
 * `minorUnitDigits` must be called unconditionally by every `toCurrency` —
 * not just the languages that *currently* name a 3-decimal currency: once the
 * matrix is keyed by language, any entry point sharing that language's export
 * can reach one, including via a locale profile's delegation (see
 * docs/language-layers.md).
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

/**
 * One `keyof typeof <export>` per language above, for that language's own
 * `CurrencyOptions['currency']` typedef to reference instead of hand-typing
 * a union. This is the enforcement half of "one named export per language":
 * widening a language's map (e.g. adding a currency to `en`) widens every
 * file that imports it and its typedef in the same edit — a typo in either
 * place fails typecheck instead of drifting silently out of sync with
 * `currencyValues`, which was already derived from `Object.keys(...)`.
 * @typedef {keyof typeof am} AmCurrency
 * @typedef {keyof typeof amLatn} AmLatnCurrency
 * @typedef {keyof typeof ar} ArCurrency
 * @typedef {keyof typeof az} AzCurrency
 * @typedef {keyof typeof bn} BnCurrency
 * @typedef {keyof typeof cs} CsCurrency
 * @typedef {keyof typeof da} DaCurrency
 * @typedef {keyof typeof de} DeCurrency
 * @typedef {keyof typeof el} ElCurrency
 * @typedef {keyof typeof en} EnCurrency
 * @typedef {keyof typeof es} EsCurrency
 * @typedef {keyof typeof fa} FaCurrency
 * @typedef {keyof typeof fi} FiCurrency
 * @typedef {keyof typeof fil} FilCurrency
 * @typedef {keyof typeof fr} FrCurrency
 * @typedef {keyof typeof gu} GuCurrency
 * @typedef {keyof typeof ha} HaCurrency
 * @typedef {keyof typeof hbo} HboCurrency
 * @typedef {keyof typeof he} HeCurrency
 * @typedef {keyof typeof hi} HiCurrency
 * @typedef {keyof typeof hr} HrCurrency
 * @typedef {keyof typeof hu} HuCurrency
 * @typedef {keyof typeof id} IdCurrency
 * @typedef {keyof typeof it} ItCurrency
 * @typedef {keyof typeof ja} JaCurrency
 * @typedef {keyof typeof ka} KaCurrency
 * @typedef {keyof typeof kn} KnCurrency
 * @typedef {keyof typeof ko} KoCurrency
 * @typedef {keyof typeof lt} LtCurrency
 * @typedef {keyof typeof lv} LvCurrency
 * @typedef {keyof typeof mr} MrCurrency
 * @typedef {keyof typeof ms} MsCurrency
 * @typedef {keyof typeof nb} NbCurrency
 * @typedef {keyof typeof nl} NlCurrency
 * @typedef {keyof typeof pa} PaCurrency
 * @typedef {keyof typeof pl} PlCurrency
 * @typedef {keyof typeof ptBR} PtBRCurrency
 * @typedef {keyof typeof ptPT} PtPTCurrency
 * @typedef {keyof typeof ro} RoCurrency
 * @typedef {keyof typeof ru} RuCurrency
 * @typedef {keyof typeof srCyrl} SrCyrlCurrency
 * @typedef {keyof typeof srLatn} SrLatnCurrency
 * @typedef {keyof typeof sv} SvCurrency
 * @typedef {keyof typeof sw} SwCurrency
 * @typedef {keyof typeof ta} TaCurrency
 * @typedef {keyof typeof te} TeCurrency
 * @typedef {keyof typeof th} ThCurrency
 * @typedef {keyof typeof tr} TrCurrency
 * @typedef {keyof typeof uk} UkCurrency
 * @typedef {keyof typeof ur} UrCurrency
 * @typedef {keyof typeof vi} ViCurrency
 * @typedef {keyof typeof yo} YoCurrency
 * @typedef {keyof typeof zhHans} ZhHansCurrency
 * @typedef {keyof typeof zhHant} ZhHantCurrency
 */
