import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Range-contract gate (proof).
 *
 * A language declares each form's ceiling as an exported `<form>MaxExponent`,
 * and this gate verifies it directly — no per-language magic values, no probing:
 *
 * - finite exponent → the EXACT boundary is pinned (10^e throws RangeError, and
 *   10^e - 1 is well-formed), so a too-high *or* too-low declaration fails;
 * - `UNBOUNDED` (Infinity) → injectivity over a wide magnitude sweep, since a
 *   silent collapse would make two magnitudes spell the same.
 *
 * It auto-covers any language that exports `*MaxExponent` (currently the four
 * proof languages) and would eventually subsume the well-formedness gate in
 * contract.test.js.
 */

const FORMS = [
  ['cardinal', 'toCardinal'],
  ['ordinal', 'toOrdinal'],
  ['currency', 'toCurrency'],
]

function isWellFormed(value) {
  return typeof value === 'string'
    && value.length > 0
    && value === value.trim()
    && !/\s{2,}/.test(value)
    && !/undefined|NaN|\[object/.test(value)
}

/** Renders any conversion result for an error message without itself throwing. */
function render(value) {
  return typeof value === 'string' ? JSON.stringify(value) : `${typeof value}: ${String(value)}`
}

/** Throws unless `fn` upholds the contract implied by its declared `exponent`. */
function checkForm(fn, exponent) {
  if (typeof fn !== 'function') return // existence is asserted directly in the test below
  if (exponent === Infinity) {
    const seen = new Set()
    for (const k of [10, 20, 40, 80, 160, 320]) {
      const out = fn(10n ** BigInt(k))
      if (!isWellFormed(out)) throw new Error(`10^${k} malformed: ${render(out)}`)
      if (seen.has(out)) throw new Error(`not injective — 10^${k} collides (silent collapse)`)
      seen.add(out)
    }
    return
  }
  const max = 10n ** BigInt(exponent)
  let threw = false
  try {
    fn(max)
  }
  catch (error) {
    // Only a RangeError satisfies the contract; surface anything else (a TypeError
    // crash, etc.) instead of mislabelling it "did not throw RangeError".
    if (!(error instanceof RangeError)) {
      throw new Error(`threw ${error.constructor.name} (not RangeError) at 10^${exponent}: ${error.message}`, { cause: error })
    }
    threw = true
  }
  if (!threw) throw new Error(`did not throw RangeError at the declared ceiling 10^${exponent}`)
  const below = fn(max - 1n)
  if (!isWellFormed(below)) throw new Error(`malformed at 10^${exponent} - 1: ${render(below)}`)
}

// Pre-load modules so we register a test only for languages that declare a range.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  const declared = FORMS.filter(([form]) => mod[`${form}MaxExponent`] !== undefined)
  if (declared.length > 0) languages.push({ code: file.replace('.js', ''), mod, declared })
}

for (const { code, mod, declared } of languages) {
  test(`${code} upholds its declared range`, (t) => {
    for (const [form, fnName] of declared) {
      const exponent = mod[`${form}MaxExponent`]
      t.is(typeof mod[fnName], 'function', `${code} declares ${form}MaxExponent but doesn't export ${fnName}()`)
      t.notThrows(() => checkForm(mod[fnName], exponent), `${code} ${form} @ 10^${exponent}`)
    }
  })
}
