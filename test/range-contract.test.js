import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Range-contract gate (proof).
 *
 * Each form declares its maximum supported value as an exported bigint
 * (`cardinalMax` / `ordinalMax` / `currencyMax`), or `null` for no fixed limit.
 * This gate verifies that fact behaviourally — no per-language magic, no probing,
 * no knowledge of any scale table:
 *
 * - **well-formed + injective** across the valid range — distinct magnitudes
 *   must spell differently, so a gap / drop / clamp (which collapses magnitude)
 *   is caught generically;
 * - **boundary** (finite max only) — `max` throws RangeError and `max - 1`
 *   is well-formed, pinning the exact ceiling.
 *
 * Auto-covers any language that exports `*Max` (currently the four proof
 * languages) and would eventually subsume the well-formedness gate.
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

/** Throws unless `fn` upholds the contract implied by its declared `max` (bigint or null). */
function checkForm(fn, max) {
  if (typeof fn !== 'function') return // existence is asserted directly in the test below

  // Sweep magnitudes across the valid range: every distinct power of ten must
  // spell distinctly and well-formed. A gap / drop / clamp collapses magnitude,
  // so two magnitudes would collide — which this catches with no table knowledge.
  const top = max === null ? 330 : max.toString().length - 1
  const seen = new Map()
  let magnitude = 1n
  for (let e = 1; e < top; e++) {
    magnitude *= 10n // 10^e, built iteratively to avoid re-exponentiating each step
    const out = fn(magnitude)
    if (!isWellFormed(out)) throw new Error(`10^${e} malformed: ${render(out)}`)
    if (seen.has(out)) throw new Error(`magnitude collapse — 10^${e} spells the same as 10^${seen.get(out)}: ${render(out)}`)
    seen.set(out, e)
  }

  if (max === null) return // unbounded: no boundary to pin

  // Pin the exact ceiling, two-sided: `max` throws RangeError; `max - 1` is well-formed.
  let threw = false
  try {
    fn(max)
  }
  catch (error) {
    if (!(error instanceof RangeError)) {
      throw new Error(`threw ${error.constructor.name} (not RangeError) at the ceiling: ${error.message}`, { cause: error })
    }
    threw = true
  }
  if (!threw) throw new Error('did not throw RangeError at the declared ceiling')
  const below = fn(max - 1n)
  if (!isWellFormed(below)) throw new Error(`malformed just below the ceiling: ${render(below)}`)
}

// Pre-load modules so we register a test only for languages that declare a range.
const languages = []
for (const file of readdirSync('./src').filter(f => f.endsWith('.js') && !f.startsWith('utils')).sort()) {
  const mod = await import('../src/' + file)
  const declared = FORMS.filter(([form]) => mod[`${form}Max`] !== undefined)
  if (declared.length > 0) languages.push({ code: file.replace('.js', ''), mod, declared })
}

for (const { code, mod, declared } of languages) {
  test(`${code} upholds its declared range`, (t) => {
    for (const [form, fnName] of declared) {
      t.is(typeof mod[fnName], 'function', `${code} declares ${form}Max but doesn't export ${fnName}()`)
      t.notThrows(() => checkForm(mod[fnName], mod[`${form}Max`]), `${code} ${form}`)
    }
  })
}
