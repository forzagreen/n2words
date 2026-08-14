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

const canonicalCodes = codes.filter(code => mods.get(code).aliasOf === undefined)
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

// Every named export an alias could plausibly forward — asserting identity
// on all of them (not just the three forms) covers the range and options
// contracts too, since `export *` should forward every binding equally.
const REEXPORTED_KEYS = [
  'toCardinal', 'toOrdinal', 'toCurrency',
  'cardinalMax', 'ordinalMax', 'currencyMax',
  'cardinalDefaults', 'ordinalDefaults', 'currencyDefaults',
  'cardinalValues', 'ordinalValues', 'currencyValues',
]

for (const code of aliasCodes) {
  test(`${code} is a faithful re-export of its target`, (t) => {
    const mod = mods.get(code)
    const target = mod.aliasOf
    const targetMod = mods.get(target)
    t.truthy(targetMod, `${code} aliases "${target}" but src/${target}.js doesn't exist`)
    if (!targetMod) return

    for (const key of REEXPORTED_KEYS) {
      t.is(mod[key], targetMod[key], `${code}.${key} must be the exact same binding as ${target}.${key}`)
    }
  })
}
