import test from 'ava'
import { readdirSync } from 'node:fs'
import { isPlainObject } from '../src/utils/is-plain-object.js'

/**
 * Options-contract gate (proof).
 *
 * A form that accepts options declares its defaults as an exported map
 * (`cardinalDefaults` / `ordinalDefaults` / `currencyDefaults`) — the single
 * source of truth that the runtime applies (via `resolveOptions`) and the docs
 * generator imports rather than scraping. This gate verifies the contract
 * behaviourally, with no per-language knowledge:
 *
 * - the defaults export is a non-empty plain object;
 * - the form accepts `(value, options)`;
 * - calling with the explicit defaults reproduces the no-options output, so the
 *   declared defaults really are the defaults;
 * - a malformed options argument throws `TypeError` — an unknown key, a
 *   wrong-typed value, or an inherited key all fail loudly, not silently.
 *   (`RangeError` is reserved for a value out of range, e.g. checkMax.)
 * - an enum-valued option declares its allowed set as `<form>Values`: every
 *   declared value is accepted, the default is in the set, and an out-of-set
 *   value throws `RangeError` instead of silently falling back to the default.
 *
 * Auto-covers any form that exports `<form>Defaults` while the sweep is in
 * progress. Once every options-taking language is migrated, this flips to
 * required — any form accepting an options parameter without a `<form>Defaults`
 * export fails, exactly as the range gate requires `*Max`.
 */

const FORMS = [
  ['cardinal', 'toCardinal', 101],
  ['ordinal', 'toOrdinal', 101],
  ['currency', 'toCurrency', 42.5],
]

/**
 * A value of the given typeof that is guaranteed outside the allowed set, or
 * null when none is constructible (e.g. a boolean set declaring both values).
 * @param {readonly unknown[]} set Allowed values
 * @param {string} type `typeof` the option's default
 * @returns {unknown} The probe value, or null
 */
function outOfSetProbe(set, type) {
  if (type === 'string') {
    let probe = '__not_in_set__'
    while (set.includes(probe)) probe += '_'
    return probe
  }
  if (type === 'number') return Math.max(0, ...set.filter(v => typeof v === 'number')) + 1
  if (type === 'bigint') return set.filter(v => typeof v === 'bigint').reduce((max, v) => v > max ? v : max, 0n) + 1n
  if (type === 'boolean') return set.includes(true) ? (set.includes(false) ? null : false) : true
  return null
}

// Pre-load so a test is registered only for forms that declare the contract.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  const declared = FORMS.filter(([form]) => mod[`${form}Defaults`] !== undefined)
  if (declared.length > 0) languages.push({ code: file.replace('.js', ''), mod, declared })
}

for (const { code, mod, declared } of languages) {
  test(`${code} upholds its options contract`, (t) => {
    for (const [form, fnName, sample] of declared) {
      const defaults = mod[`${form}Defaults`]
      const fn = mod[fnName]

      t.true(isPlainObject(defaults), `${code} ${form}Defaults must be a plain object`)
      t.true(Object.keys(defaults).length > 0, `${code} ${form}Defaults must declare at least one option`)
      t.is(typeof fn, 'function', `${code} declares ${form}Defaults but doesn't export ${fnName}()`)
      t.true(fn.length >= 2, `${code} ${fnName} must accept (value, options)`)

      // The declared defaults are the real defaults: explicit must equal omitted.
      t.is(fn(sample, { ...defaults }), fn(sample), `${code} ${form}: explicit defaults must match the no-options output`)

      // `{ key: undefined }` means "use the default" (matches `key?: T`), not a throw.
      const firstName = Object.keys(defaults)[0]
      t.is(fn(sample, { [firstName]: undefined }), fn(sample), `${code} ${form}: an undefined "${firstName}" falls back to its default`)

      // An undeclared option fails loudly rather than being silently ignored.
      t.throws(
        () => fn(sample, { __unknown_option__: true }),
        { instanceOf: TypeError },
        `${code} ${form}: must reject unknown options`,
      )

      // A wrong-typed value is rejected too (not coerced or silently kept).
      const [firstKey, firstDefault] = Object.entries(defaults)[0]
      const wrongTyped = typeof firstDefault === 'string' ? 0 : 'wrong-type'
      t.throws(
        () => fn(sample, { [firstKey]: wrongTyped }),
        { instanceOf: TypeError },
        `${code} ${form}: must reject a wrong-typed "${firstKey}"`,
      )

      // Inherited keys must not bypass the guard (prototype-pollution defence).
      t.throws(
        () => fn(sample, JSON.parse('{ "__proto__": { "polluted": true } }')),
        { instanceOf: TypeError },
        `${code} ${form}: must reject inherited keys like __proto__`,
      )
      t.falsy(/** @type {Record<string, unknown>} */ ({}).polluted, 'prototype must not be polluted')

      // Enum options: every declared value works, the default is in the set,
      // and an out-of-set value throws RangeError (not a silent fallback). The
      // export must be a plain object when present — a falsy non-object would
      // otherwise skip this block silently via empty Object.entries.
      const formValues = mod[`${form}Values`]
      t.true(formValues === undefined || isPlainObject(formValues), `${code} ${form}Values must be a plain object when exported`)
      for (const [key, set] of Object.entries(isPlainObject(formValues) ? formValues : {})) {
        t.true(Object.hasOwn(defaults, key), `${code} ${form}Values.${key} must be a declared option`)
        t.true(Array.isArray(set) && set.length > 0, `${code} ${form}Values.${key} must be a non-empty array`)
        t.true(set.includes(defaults[key]), `${code} ${form}: the default for "${key}" must be in its allowed set`)
        for (const allowedValue of set) {
          t.notThrows(() => fn(sample, { [key]: allowedValue }), `${code} ${form}: declared value "${allowedValue}" must be accepted`)
        }
        // The probe must share the option's typeof to reach the set check (a
        // different typeof would TypeError first), so derive it from the default.
        for (const probe of [outOfSetProbe(set, typeof defaults[key])].filter(p => p !== null)) {
          t.throws(
            () => fn(sample, { [key]: probe }),
            { instanceOf: RangeError },
            `${code} ${form}: out-of-set "${key}" must throw RangeError`,
          )
        }
      }
    }
  })
}
