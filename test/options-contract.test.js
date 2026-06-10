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
 *
 * Auto-covers any form that exports `<form>Defaults`.
 */

const FORMS = [
  ['cardinal', 'toCardinal', 101],
  ['ordinal', 'toOrdinal', 101],
  ['currency', 'toCurrency', 42.5],
]

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
    }
  })
}
