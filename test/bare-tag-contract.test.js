import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Bare-tag alias contract gate.
 *
 * Every BCP 47 primary language subtag with exactly one regional/script
 * variant in src/ MUST have a matching bare-tag alias file (e.g. only
 * de-DE exists, so src/de.js must exist and re-export it) — see
 * docs/bare-tag-aliases.md for the full rule. A family with two or more
 * variants is a human judgment call (some, like en/es/fr, still get a
 * documented default; others, like zh/sr/am/pt, don't because their
 * variants genuinely diverge in script or core numbering grammar) — this
 * gate doesn't assert either way for those, since "very different" isn't
 * mechanically checkable.
 *
 * Separately, every alias file's re-exported bindings (forms, *Max,
 * *Defaults, *Values) must be reference-identical to its target module's —
 * proof `export *` is forwarding live bindings, not a stale copy. This is
 * why contract.test.js, range-contract.test.js, and options-contract.test.js
 * skip alias files: identity here is a stronger, cheaper guarantee than
 * re-running their fuzz suites against what's already proven to be the
 * exact same function.
 */

const files = readdirSync('./src')
  .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
  .sort()
const codes = files.map(f => f.replace('.js', ''))

const mods = new Map()
for (const code of codes) {
  mods.set(code, await import(`../src/${code}.js`))
}

// A variant profile (variantOf, see variant-profile-contract.test.js) is
// derived from a full variant the same way an alias is derived from one —
// neither counts as a "canonical" variant a bare tag could point to, so a
// bare tag never resolves to a profile instead of the real implementation it
// delegates to.
const canonicalCodes = codes.filter(code => mods.get(code).aliasOf === undefined && mods.get(code).variantOf === undefined)
const aliasCodes = codes.filter(code => mods.get(code).aliasOf !== undefined)

// Group canonical (non-alias) codes by BCP 47 primary subtag, e.g.
// zh-Hans-CN and zh-Hant-TW both group under "zh".
const byPrimary = new Map()
for (const code of canonicalCodes) {
  const primary = code.split('-')[0]
  if (!byPrimary.has(primary)) byPrimary.set(primary, [])
  byPrimary.get(primary).push(code)
}

for (const [primary, variants] of byPrimary) {
  if (variants.length !== 1) continue // multi-variant family: human judgment call, not asserted here

  test(`${primary} (single-variant family) has a bare-tag alias`, (t) => {
    const mod = mods.get(primary)
    t.truthy(mod, `src/${primary}.js is missing — ${variants[0]} is the only ${primary}-* variant, so per docs/bare-tag-aliases.md it must have a bare-tag alias`)
    t.is(mod?.aliasOf, variants[0], `src/${primary}.js exists but doesn't alias ${variants[0]}`)
  })
}

// Every named export an alias forwards untouched — asserting identity on all
// of them (not just the two forms) covers the range and options contracts
// too, since `export *` should forward every binding equally.
//
// `toCurrency` and `currencyDefaults` are deliberately absent: a bare tag
// names a language and has no country to take a default currency from, so it
// wraps toCurrency to require an explicit `currency` and strips that key from
// its defaults. Both are asserted separately below.
const REEXPORTED_KEYS = [
  'toCardinal', 'toOrdinal',
  'cardinalMax', 'ordinalMax', 'currencyMax',
  'cardinalDefaults', 'ordinalDefaults',
  'cardinalValues', 'ordinalValues', 'currencyValues',
]

for (const code of aliasCodes) {
  test(`${code} is a faithful re-export of its target`, (t) => {
    const mod = mods.get(code)
    const target = mod.aliasOf
    const targetMod = mods.get(target)
    t.truthy(targetMod, `${code} aliases "${target}" but src/${target}.js doesn't exist`)
    if (!targetMod) return

    // An alias is a *within-family* pointer: `en` must resolve to some en-*
    // variant. Without this, `src/en.js` re-exporting './de-DE.js' would pass
    // every other assertion here — bindings would be faithfully identical, just
    // to the wrong language — and LANGUAGES.md would render English's entry
    // point linking into German's section.
    t.is(target.split('-')[0], code, `${code} must alias a ${code}-* variant, not "${target}"`)

    for (const key of REEXPORTED_KEYS) {
      t.is(mod[key], targetMod[key], `${code}.${key} must be the exact same binding as ${target}.${key}`)
    }
  })
}

// Compare a call by its result *or* its error type, so two functions that
// both legitimately reject an input compare as equal without a conditional
// assertion around the throwing case.
const outcome = (fn) => {
  try {
    return fn()
  }
  catch (error) {
    return `throws ${error.constructor.name}`
  }
}

// A bare tag names a language; a default currency belongs to a country. An
// alias therefore does NOT inherit its target's default currency — it requires
// the caller to name one, and otherwise behaves exactly as the target does.
// See docs/bare-tag-aliases.md's "Bare tags carry no default currency".
for (const code of aliasCodes) {
  const mod = mods.get(code)
  const targetMod = mods.get(mod.aliasOf)
  // Only families whose target actually declares a `currency` option have a
  // default to strip. A language that hardcodes one currency (or exports no
  // toCurrency at all) has nothing to inherit, so its alias stays a plain
  // `export *` — and the moment that language gains a `currency` option, this
  // gate starts requiring the wrapper.
  if (typeof targetMod?.toCurrency !== 'function') continue
  if (targetMod.currencyDefaults?.currency === undefined) continue

  test(`${code} carries no default currency`, (t) => {
    const target = mod.aliasOf

    // The wrapper is a distinct function — an `export *` passthrough here
    // would silently reinstate the target's default.
    t.not(mod.toCurrency, targetMod.toCurrency, `${code}.toCurrency must wrap ${target}'s, not re-export it`)

    // The declared contract must agree with the behaviour: no `currency` key
    // in the alias's defaults, though the target still declares its own.
    t.false(Object.hasOwn(mod.currencyDefaults, 'currency'), `${code}.currencyDefaults must not declare a default currency`)
    t.true(Object.hasOwn(targetMod.currencyDefaults, 'currency'), `${target}.currencyDefaults should still declare its own default currency`)

    // Every other option keeps the target's default, so the alias doesn't
    // quietly drop an option while removing the currency.
    for (const [key, value] of Object.entries(targetMod.currencyDefaults)) {
      if (key === 'currency') continue
      t.is(mod.currencyDefaults[key], value, `${code}.currencyDefaults.${key} must keep ${target}'s default`)
    }

    // Omitting the currency is a shape error, not an out-of-range value.
    const missing = t.throws(() => mod.toCurrency(42.5), { instanceOf: TypeError }, `${code}.toCurrency() must throw without an explicit currency`)
    t.true(missing?.message.includes(target), `${code}'s error should point at ${target} as the region-qualified alternative`)

    // Given a currency, it must be the target function in every other respect.
    // Compared through `outcome` so a currency the language legitimately
    // rejects (a fractional amount in a currency with no minor unit) compares
    // as equal-and-throwing rather than needing a conditional assertion.
    for (const currency of targetMod.currencyValues.currency) {
      t.is(
        outcome(() => mod.toCurrency(42.5, { currency })),
        outcome(() => targetMod.toCurrency(42.5, { currency })),
        `${code}.toCurrency(42.5, { currency: '${currency}' }) must match ${target}'s`,
      )
    }

    // Naming the target's own default must reproduce what the target produces
    // with no options at all — the exact behaviour a caller gives up by
    // importing the bare tag instead of the region-qualified code.
    const { currency: targetDefault } = targetMod.currencyDefaults
    t.is(
      outcome(() => mod.toCurrency(42.5, { currency: targetDefault })),
      outcome(() => targetMod.toCurrency(42.5)),
      `${code}.toCurrency(42.5, { currency: '${targetDefault}' }) must equal ${target}.toCurrency(42.5)`,
    )
  })
}
