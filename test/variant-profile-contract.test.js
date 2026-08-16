import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Variant-profile contract gate.
 *
 * A locale profile (`variantOf`, e.g. src/en-AU.js -> en-GB) exists because
 * its numerals are behaviourally identical to a full variant's — only its
 * default currency differs. See docs/language-layers.md for the model: a
 * profile is `export * from base` plus a `toCurrency` wrapper that applies
 * the profile's own currency default before delegating to the base.
 *
 * A hand-written wrapper is exactly the shape of bug a `export *`-only alias
 * (see bare-tag-contract.test.js) doesn't risk: the base's `toCurrency`
 * closes over the base's own module-scope `currencyDefaults`, so a profile
 * that forgot the wrapper (or got it wrong) would silently advertise its own
 * currency while actually returning the base's — e.g. `n2words/en-AU` naming
 * AUD but spelling out pounds. This gate exists specifically to catch that.
 */

const files = readdirSync('./src')
  .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
  .sort()
const codes = files.map(f => f.replace('.js', ''))

const mods = new Map()
for (const code of codes) {
  mods.set(code, await import(`../src/${code}.js`))
}

const profileCodes = codes.filter(code => mods.get(code).variantOf !== undefined)

// A probe set wide enough to exercise the singular/dual/plural boundaries
// that an invariable-noun currency (single-element word-form array, e.g.
// taka, ringgit, naira) collapses onto index 0 for every count — the exact
// case that broke when the currency matrix was first widened per-language.
const PROBE_VALUES = [0, 1, 2, 3, 21, 1.5]

for (const code of profileCodes) {
  test(`${code} variant profile is a well-formed delegate`, (t) => {
    const mod = mods.get(code)
    const target = mod.variantOf
    const targetMod = mods.get(target)

    t.truthy(targetMod, `${code} has variantOf "${target}" but src/${target}.js doesn't exist`)
    if (!targetMod) return

    // A profile delegates to a real implementation, not to another profile
    // or bare-tag alias — chaining would make the "which numerals" question
    // require walking multiple files instead of one.
    t.is(targetMod.variantOf, undefined, `${code} points at ${target}, which is itself a variant profile — profiles must delegate directly to a full implementation`)
    t.is(targetMod.aliasOf, undefined, `${code} points at ${target}, which is a bare-tag alias, not a full implementation`)

    // Numerals are inherited verbatim via `export *` — reference identity
    // proves it's the live binding, not a stale copy.
    t.is(mod.toCardinal, targetMod.toCardinal, `${code}.toCardinal must be the exact same binding as ${target}.toCardinal`)
    t.is(mod.toOrdinal, targetMod.toOrdinal, `${code}.toOrdinal must be the exact same binding as ${target}.toOrdinal`)
    t.is(mod.cardinalMax, targetMod.cardinalMax)
    t.is(mod.ordinalMax, targetMod.ordinalMax)

    if (mod.toCurrency === undefined) return // a profile of a non-currency base has nothing further to check here

    t.truthy(mod.currencyDefaults, `${code} has toCurrency but no currencyDefaults`)
    const defaultCurrency = mod.currencyDefaults.currency
    t.true(
      mod.currencyValues.currency.includes(defaultCurrency),
      `${code}.currencyDefaults.currency ("${defaultCurrency}") must be one of ${code}.currencyValues.currency`,
    )

    // The trap this gate exists to catch: a profile whose toCurrency silently
    // fell through to the base's own default. Calling the base directly with
    // the profile's default currency, explicitly, must match what the
    // profile itself returns with no options at all.
    for (const value of PROBE_VALUES) {
      t.is(
        mod.toCurrency(value),
        targetMod.toCurrency(value, { currency: defaultCurrency }),
        `${code}.toCurrency(${value}) with no options must match ${target}.toCurrency(${value}, { currency: '${defaultCurrency}' })`,
      )
    }
  })
}

test('every language file with variantOf is picked up by this gate', (t) => {
  // A regression check on the check: if variant-profile files stop being
  // discovered (e.g. a future refactor of the readdirSync filter above), this
  // fails loudly instead of the gate silently covering zero files.
  t.true(profileCodes.length > 0, 'expected at least one src/*.js file with variantOf, found none')
})
