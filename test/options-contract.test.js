import test from 'ava'
import { readdirSync } from 'node:fs'
import { isPlainObject } from '../src/utils/is-plain-object.js'

/**
 * Options-contract gate.
 *
 * A form that accepts options MUST declare its defaults as an exported map
 * (`cardinalDefaults` / `ordinalDefaults` / `currencyDefaults`) — the single
 * source of truth that the runtime applies (via `resolveOptions`) and the docs
 * generator imports rather than scraping. A form whose function accepts an
 * options parameter without the export fails here — required, not opt-in,
 * exactly as the range gate requires `*Max`. The declaration is then verified
 * behaviourally, with no per-language knowledge:
 *
 * - the defaults export is a non-empty plain object;
 * - calling with the explicit defaults reproduces the no-options output, so the
 *   declared defaults really are the defaults;
 * - a malformed options argument throws `TypeError` — an unknown key, a
 *   wrong-typed value, or an inherited key all fail loudly, not silently.
 *   (`RangeError` is reserved for a value out of range, e.g. checkMax.)
 * - an enum-valued option declares its allowed set as `<form>Values`: every
 *   declared value is accepted, the default is in the set, and an out-of-set
 *   value throws `RangeError` instead of silently falling back to the default.
 *
 * Options-taking is detected by arity (`fn.length >= 2`) — every form signature
 * is `(value, options)` with no default parameter, scaffold included.
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

// Pre-load: a language registers when any form takes options OR declares the
// contract, so neither side can dodge the other — options without a declaration
// and a declaration without options both fail below.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  const relevant = FORMS.filter(([form, fnName]) =>
    (typeof mod[fnName] === 'function' && mod[fnName].length >= 2) || mod[`${form}Defaults`] !== undefined,
  )
  if (relevant.length > 0) languages.push({ code: file.replace('.js', ''), mod, relevant })
}

for (const { code, mod, relevant } of languages) {
  test(`${code} upholds its options contract`, (t) => {
    for (const [form, fnName, sample] of relevant) {
      const defaults = mod[`${form}Defaults`]
      const fn = mod[fnName]
      const takesOptions = typeof fn === 'function' && fn.length >= 2

      t.true(defaults !== undefined, `${code} ${fnName}() accepts options but doesn't export ${form}Defaults — every options-taking form must declare its contract (see CLAUDE.md's Options Pattern)`)
      t.true(takesOptions, `${code} declares ${form}Defaults but ${fnName}() doesn't accept (value, options)`)
      if (defaults === undefined || !takesOptions) continue // declaration mismatch already failed above

      t.true(isPlainObject(defaults), `${code} ${form}Defaults must be a plain object`)
      t.true(Object.keys(defaults).length > 0, `${code} ${form}Defaults must declare at least one option`)

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
