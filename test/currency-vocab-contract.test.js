import test from 'ava'
import { readdirSync } from 'node:fs'
import * as vocab from '../src/utils/currency-vocab.js'
import { normalizeCode } from './helpers/language-naming.js'
import { isWellFormed, safeStringify } from './helpers/value-utils.js'

/**
 * Currency-vocab contract gate.
 *
 * A language that declares `currencyValues.currency` (the enum of ISO 4217
 * codes it can spell) MUST have a matching named export in
 * src/utils/currency-vocab.js (e.g. `en-US.js` -> `enUS`), and every code
 * listed in the enum MUST have a real word-form entry there. This is what
 * keeps the cross-language currency matrix honest rather than aspirational —
 * the enum can never advertise a currency with no translation behind it.
 *
 * `currencyValues.currency` is meant to be derived from the vocab export
 * (`Object.keys(CURRENCY_VOCAB)`), so under normal authoring this gate can't
 * fail; it's a belt-and-suspenders check against the enum and the vocab
 * object drifting apart if either is ever hand-edited independently.
 *
 * Separately, for every zero-decimal-exponent currency (CURRENCY_EXPONENTS,
 * e.g. JPY) any language advertising it must reject a fractional amount with
 * RangeError rather than spelling a fictitious minor unit or silently
 * dropping it — the fixture-array format has no per-case "expect throw"
 * shape, so this is verified here instead, once, for every language that
 * touches a zero-exponent currency.
 */

// Pre-load: only languages that declare a currency enum register a test, so
// there's no per-language "nothing to check here" assertion to plan around.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  const declaredCodes = mod.currencyValues?.currency
  if (declaredCodes !== undefined) {
    languages.push({ code: file.replace('.js', ''), mod, declaredCodes })
  }
}

for (const { code, mod, declaredCodes } of languages) {
  const exportName = normalizeCode(code)
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
 * and the parser's fixed two-decimal precision is enough for every currency
 * listed. Both break silently if the two data sources disagree, so pin them.
 */
test('CURRENCY_EXPONENTS holds only zero-exponent currencies', (t) => {
  for (const [isoCode, exponent] of Object.entries(vocab.CURRENCY_EXPONENTS)) {
    t.is(
      exponent,
      0,
      `CURRENCY_EXPONENTS.${isoCode} is ${exponent}, but parseCurrencyValue tracks exactly 2 decimal digits — a 3-decimal currency like KWD would be silently mis-parsed (see the map's own doc comment)`,
    )
  }
})

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
