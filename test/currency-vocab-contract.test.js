import test from 'ava'
import { readdirSync } from 'node:fs'
import * as vocab from '../src/utils/currency-vocab.js'
import { normalizeCode } from './helpers/language-naming.js'

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

for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const code = file.replace('.js', '')

  test(`${code} currency enum matches its currency-vocab entries`, async (t) => {
    const mod = await import('../src/' + file)
    const declaredCodes = mod.currencyValues?.currency

    if (declaredCodes === undefined) {
      t.pass('no currency enum declared')
      return
    }

    const exportName = normalizeCode(code)
    const langVocab = vocab[exportName]

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

  test(`${code} rejects a fractional amount for its zero-exponent currencies`, async (t) => {
    const mod = await import('../src/' + file)
    const declaredCodes = mod.currencyValues?.currency
    if (declaredCodes === undefined) {
      t.pass('no currency enum declared')
      return
    }

    const zeroExponentCodes = declaredCodes.filter(
      isoCode => (vocab.CURRENCY_EXPONENTS[isoCode] ?? 2) === 0,
    )
    if (zeroExponentCodes.length === 0) {
      t.pass('no zero-exponent currency declared')
      return
    }

    for (const isoCode of zeroExponentCodes) {
      t.throws(
        () => mod.toCurrency(1.5, { currency: isoCode }),
        { instanceOf: RangeError },
        `${code} toCurrency(1.5, { currency: '${isoCode}' }) should throw RangeError — ${isoCode} has no minor unit`,
      )
    }
  })
}
