import test from 'ava'
import { readdirSync } from 'node:fs'
import * as vocab from '../src/utils/currency-vocab.js'
import { isWellFormed, safeStringify } from './helpers/value-utils.js'

/**
 * Currency-vocab contract gate.
 *
 * A language that declares `currencyValues.currency` (the enum of ISO 4217
 * codes it can spell) MUST have a matching named export in
 * src/utils/currency-vocab.js, and every code listed in the enum MUST have a
 * real word-form entry there. This is what keeps the cross-language currency
 * matrix honest rather than aspirational — the enum can never advertise a
 * currency with no translation behind it.
 *
 * `currencyValues.currency` is meant to be derived from the vocab export
 * (`Object.keys(CURRENCY_VOCAB)`), so under normal authoring this gate can't
 * fail; it's a belt-and-suspenders check against the enum and the vocab
 * object drifting apart if either is ever hand-edited independently.
 *
 * The matrix is keyed by *language*, not by locale (see
 * docs/currency-vocab.md), so a code's expected export name is usually just
 * its primary subtag (`ar-SA` -> `ar`, `en-GB` -> `en`) rather than the full
 * normalized code. The exceptions are `VOCAB_KEY_OVERRIDES` below — the same
 * handful of languages docs/language-layers.md's "very different" test keeps
 * split by script or region (pt stays region-qualified; am/sr/zh's non-default
 * script variant drops region but keeps its script suffix). This is a human
 * editorial decision the same way LANGUAGE_NAME_OVERRIDES is, not something
 * mechanically derivable from the BCP 47 code alone.
 *
 * Separately, for every zero-decimal-exponent currency (CURRENCY_EXPONENTS,
 * e.g. JPY) any language advertising it must reject a fractional amount with
 * RangeError rather than spelling a fictitious minor unit or silently
 * dropping it — the fixture-array format has no per-case "expect throw"
 * shape, so this is verified here instead, once, for every language that
 * touches a zero-exponent currency.
 *
 * Bare-tag alias files (`aliasOf`, e.g. `en.js` -> `en-US.js`) and variant
 * profiles (`variantOf`, e.g. `en-AU.js` -> `en-GB.js`) are both skipped:
 * their `currencyValues` is a live re-export of another file's own
 * declaration, not a separate one, so checking it again under this file's
 * name would just be re-verifying that other file's entry a second time.
 */

/** @type {Record<string, string>} */
const VOCAB_KEY_OVERRIDES = {
  'pt-BR': 'ptBR',
  'pt-PT': 'ptPT',
  'am-Latn-ET': 'amLatn',
  'sr-Cyrl-RS': 'srCyrl',
  'sr-Latn-RS': 'srLatn',
  'zh-Hans-CN': 'zhHans',
  'zh-Hant-TW': 'zhHant',
}

const vocabKey = code => VOCAB_KEY_OVERRIDES[code] ?? code.split('-')[0]

// Pre-load: only non-alias, non-profile languages that declare a currency
// enum register a test, so there's no per-language "nothing to check here"
// assertion to plan around.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  if (mod.aliasOf !== undefined || mod.variantOf !== undefined) continue
  const declaredCodes = mod.currencyValues?.currency
  if (declaredCodes !== undefined) {
    languages.push({ code: file.replace('.js', ''), mod, declaredCodes })
  }
}

for (const { code, mod, declaredCodes } of languages) {
  const exportName = vocabKey(code)
  // eslint-disable-next-line import-x/namespace -- computed lookup by design: this gate checks *whether* a matching export exists, so the key can't be statically known
  const langVocab = /** @type {Record<string, import('../src/utils/currency-vocab.js').CurrencyWordForms> | undefined} */ (vocab[exportName])

  test(`${code} currency enum matches its currency-vocab entries`, (t) => {
    t.truthy(
      langVocab,
      `${code} declares currencyValues.currency but src/utils/currency-vocab.js has no "${exportName}" export`,
    )

    for (const isoCode of declaredCodes) {
      t.true(
        Object.hasOwn(langVocab ?? {}, isoCode),
        `${code} advertises currency "${isoCode}" in currencyValues but currency-vocab.js's "${exportName}" export has no entry for it`,
      )
    }

    // majorGender and minorGender are checked independently, not as a pair:
    // ar's own toCurrency never reads majorGender from the matrix (every
    // Arabic major unit it names — ريال، دينار، درهم — happens to be
    // masculine, hardcoded directly), so only its minorGender is a matrix
    // concern. A language "uses" a field if ANY entry it already ships sets
    // it (see docs/currency-vocab.md's "Grammatical gender" section);
    // English et al. use neither and aren't held to this. Once a language
    // DOES use a field, every entry must carry it — a currency added
    // without it would silently pass `undefined` as the gender argument to
    // that language's cardinal builder, the exact bug this project hit for
    // the currency a matrix merge first made a second entry reachable for.
    const entries = Object.entries(langVocab ?? {})
    const usesMajorGender = entries.some(([, forms]) => forms.majorGender !== undefined)
    const usesMinorGender = entries.some(([, forms]) => forms.minorGender !== undefined)
    for (const [isoCode, forms] of entries) {
      // Assertions run unconditionally (ava/no-conditional-assertion): a
      // language that doesn't use a field at all is vacuously fine for it —
      // `!usesMajorGender || ...` short-circuits to true rather than skipping
      // the assertion outright.
      t.true(
        !usesMajorGender || forms.majorGender === 'masculine' || forms.majorGender === 'feminine',
        `${exportName}.${isoCode} is missing majorGender — ${exportName} is gender-sensitive (another entry declares it), so every entry must`,
      )
      t.true(
        !usesMinorGender || forms.minor === null || forms.minorGender === 'masculine' || forms.minorGender === 'feminine',
        `${exportName}.${isoCode} is missing minorGender — ${exportName} is gender-sensitive (another entry declares it), so every entry with a minor unit must`,
      )
    }
  })

  const zeroExponentCodes = declaredCodes.filter(isoCode => vocab.CURRENCY_EXPONENTS[isoCode] === 0)
  if (zeroExponentCodes.length > 0) {
    test(`${code} rejects a fractional amount for its zero-exponent currencies`, (t) => {
      // Spread across the shapes a per-language fixture would have pinned
      // before these currencies started throwing: bare fraction, minimum
      // minor unit, whole+fraction, and negative. One sample would leave the
      // others free to regress into spelling a fictitious subunit.
      for (const isoCode of zeroExponentCodes) {
        for (const amount of [0.01, 0.5, 1.01, 42.5, -42.5]) {
          t.throws(
            () => mod.toCurrency(amount, { currency: isoCode }),
            { instanceOf: RangeError },
            `${code} toCurrency(${amount}, { currency: '${isoCode}' }) should throw RangeError — ${isoCode} has no minor unit`,
          )
        }
      }
    })
  }

  // Every *other* declared currency must survive a fractional amount, i.e.
  // actually render its minor unit. Without this, a language's non-default
  // currencies are only ever exercised at a whole amount (options-contract
  // uses one), so a `minor` array too short for the language's own
  // pluralization — or null where the exponent says it shouldn't be — would
  // emit "...e cinquenta undefined" and only a hand-written fixture would
  // notice. Multi-currency support is the point of the matrix; this covers
  // every cell of it, not just the ones someone wrote a fixture for.
  const minorBearingCodes = declaredCodes.filter(isoCode => vocab.CURRENCY_EXPONENTS[isoCode] !== 0)
  if (minorBearingCodes.length > 0) {
    test(`${code} renders the minor unit for every currency it advertises`, (t) => {
      // 1 and 2 catch singular/plural splits; 50 catches languages whose
      // minor-unit form varies by the tens digit (Slavic, Romanian, Arabic).
      for (const isoCode of minorBearingCodes) {
        for (const amount of ['1.01', '1.02', '3.50']) {
          const result = mod.toCurrency(amount, { currency: isoCode })
          t.true(
            isWellFormed(result),
            `${code} toCurrency('${amount}', { currency: '${isoCode}' }) returned malformed output: ${safeStringify(result)}`,
          )
        }
      }
    })
  }
}

/**
 * The exponent map underwrites two things the language files rely on: a
 * `minor: null` currency is unreachable past assertCurrencyExponent (which is
 * what licenses narrowing `minor` to `string[]` inside a `cents > 0n` branch),
 * and every listed currency's minor unit is representable at the precision the
 * language asks the parser for. Both break silently if the two data sources
 * disagree, so pin them.
 *
 * 2 is the implicit default for an absent code, so it must never be written
 * here — an explicit `USD: 2` would be dead weight that the `minorUnitDigits`
 * branch below would still treat as 2, hiding a typo rather than catching it.
 */
test('CURRENCY_EXPONENTS holds only 0 or 3', (t) => {
  for (const [isoCode, exponent] of Object.entries(vocab.CURRENCY_EXPONENTS)) {
    t.true(
      exponent === 0 || exponent === 3,
      `CURRENCY_EXPONENTS.${isoCode} is ${exponent}; only 0 (no minor unit) and 3 (thousandths) belong here — 2 is the default for any code left out`,
    )
    t.is(
      vocab.minorUnitDigits(isoCode),
      exponent === 3 ? 3 : 2,
      `minorUnitDigits('${isoCode}') disagrees with its CURRENCY_EXPONENTS entry`,
    )
  }
})

test('minorUnitDigits defaults to 2 for an unlisted currency', (t) => {
  t.is(vocab.minorUnitDigits('USD'), 2)
  t.is(vocab.minorUnitDigits('EUR'), 2)
  // Zero-exponent currencies still parse at 2 digits on purpose: a fraction has
  // to survive parsing for assertCurrencyExponent to have something to reject.
  t.is(vocab.minorUnitDigits('JPY'), 2)
})

/**
 * The regression this whole feature exists to prevent: a 1000-subunit currency
 * parsed at the default 2 digits reads '1.500' as 50 minor units and spells
 * "one dinar and fifty millimes" for an amount meaning five hundred. Checking
 * the rendered string against the 500-vs-50 wording is what proves the language
 * actually threaded minorUnitDigits() into parseCurrencyValue, rather than
 * merely declaring the currency in its enum.
 */
for (const { code, mod, declaredCodes } of languages) {
  const thousandthCodes = declaredCodes.filter(iso => vocab.CURRENCY_EXPONENTS[iso] === 3)
  if (thousandthCodes.length === 0) continue

  test(`${code} parses a 1000-subunit currency at three decimal digits`, (t) => {
    for (const isoCode of thousandthCodes) {
      const fiveHundred = mod.toCurrency('1.500', { currency: isoCode })
      const fifty = mod.toCurrency('1.050', { currency: isoCode })
      t.not(
        fiveHundred,
        fifty,
        `${code} renders 1.500 and 1.050 ${isoCode} identically — it is parsing at 2 digits, so both collapse to the same minor amount`,
      )
      // At 3 digits '.5' pads to 500; a 2-digit parse would pad it to 50 and
      // make this pair disagree.
      t.is(
        mod.toCurrency('0.500', { currency: isoCode }),
        mod.toCurrency('.5', { currency: isoCode }),
        `${code} disagrees on 0.500 vs .5 for ${isoCode} — padding is wrong at 3 digits`,
      )
    }
  })
}

test('a currency has minor-unit words if and only if its exponent is nonzero', (t) => {
  for (const [exportName, entry] of Object.entries(vocab)) {
    // Skip the non-matrix exports (CURRENCY_EXPONENTS, assertCurrencyExponent).
    if (typeof entry !== 'object' || entry === null) continue
    if (exportName === 'CURRENCY_EXPONENTS') continue

    for (const [isoCode, forms] of Object.entries(entry)) {
      const hasMinorWords = forms.minor !== null
      const isZeroExponent = vocab.CURRENCY_EXPONENTS[isoCode] === 0
      const mismatch = isZeroExponent
        ? 'has an exponent of 0 but still lists minor-unit words — assertCurrencyExponent makes them unreachable'
        : 'has minor: null but no CURRENCY_EXPONENTS entry, so nothing stops a fractional amount from dereferencing it'
      t.is(
        hasMinorWords,
        !isZeroExponent,
        `${exportName}.${isoCode} ${mismatch}`,
      )
    }
  }
})
