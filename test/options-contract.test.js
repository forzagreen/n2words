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
 * - an undeclared option throws `RangeError` — a typo fails loudly, not silently.
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

      // An undeclared option fails loudly rather than being silently ignored.
      t.throws(
        () => fn(sample, { __unknown_option__: true }),
        { instanceOf: RangeError },
        `${code} ${form}: must reject unknown options`,
      )
    }
  })
}
