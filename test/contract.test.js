import test from 'ava'
import fc from 'fast-check'
import { readdirSync } from 'node:fs'

/**
 * Conversion contract gate (the "gate" of the scale-ceiling fix-then-gate work).
 *
 * Every language module is held to one universal property: for ANY input, each
 * form returns a well-formed string OR throws a RangeError — never malformed
 * output (`"undefined"`, leading/trailing/doubled spaces, `[object …]`) and
 * never a raw crash (e.g. a TypeError from indexing past a scale table).
 *
 * The property needs no per-language configuration, and the suite is built by
 * scanning `src/` — so a newly added `src/{code}.js` is gated automatically with
 * no change to this file. (Correct in-range *output* is covered by the fixtures
 * in conversions.test.js; this gate covers the contract's shape.)
 */

const languageFiles = readdirSync('./src')
  .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
  .sort() // stable discovery order → reproducible test order with the fixed seed

// Far beyond every language's largest named scale (the deepest tables reach
// ~centillion, 10^303), so the random sweep exercises both the in-range
// (well-formed) and out-of-range (RangeError) paths for every language.
const WIDE = 10n ** 309n

// Fixed seed: the gate is deterministic in CI (a failure reproduces exactly).
const RUN = { numRuns: 200, seed: 0x6e_32_77 }

/** A conversion result the contract permits. */
function isWellFormed(value) {
  return typeof value === 'string'
    && value.length > 0
    && value === value.trim()
    && !/\s{2,}/.test(value)
    && !/undefined|NaN|\[object/.test(value)
}

/**
 * Renders any conversion result for an error message without itself throwing
 * (JSON.stringify throws on a BigInt, which would mask the real contract failure).
 * @param {unknown} value The (malformed) result to describe
 * @returns {string} A safe, human-readable rendering
 */
function render(value) {
  return typeof value === 'string' ? JSON.stringify(value) : `${typeof value}: ${String(value)}`
}

/**
 * Throws (failing the property) unless `fn(input)` returns a well-formed string
 * or throws a RangeError — the universal contract every form must uphold.
 * @param {Function} fn A conversion function (toCardinal/toOrdinal/toCurrency)
 * @param {number|string|bigint} input The value to convert
 * @returns {boolean} true when the contract holds
 */
function upholdsContract(fn, input) {
  let result
  try {
    result = fn(input)
  }
  catch (error) {
    if (error instanceof RangeError) return true
    throw new Error(`threw ${error.constructor.name} (not RangeError) for ${input}: ${error.message}`, { cause: error })
  }
  if (!isWellFormed(result)) {
    throw new Error(`malformed output for ${input}: ${render(result)}`)
  }
  return true
}

for (const file of languageFiles) {
  const code = file.replace('.js', '')

  test(`${code} upholds the conversion contract`, async (t) => {
    const { toCardinal, toOrdinal, toCurrency } = await import('../src/' + file)

    // Cardinal — any integer magnitude (negatives, zero, far past the ceiling).
    t.notThrows(() => fc.assert(
      fc.property(fc.bigInt({ min: -WIDE, max: WIDE }), n => upholdsContract(toCardinal, n)),
      RUN,
    ), `${code} toCardinal (integer)`)

    // Cardinal — decimal strings with a full (possibly huge, possibly negative)
    // integer part plus a fraction, so the gate exercises both the integer and the
    // fraction clauses of the ceiling guard together. The fraction is spelled via
    // the scale builder in some languages and digit-by-digit in others.
    t.notThrows(() => fc.assert(
      fc.property(
        fc.boolean(),
        fc.bigInt({ min: 0n, max: WIDE }),
        fc.bigInt({ min: 0n, max: WIDE }),
        (negative, intPart, fraction) =>
          upholdsContract(toCardinal, `${negative ? '-' : ''}${intPart}.${fraction}`),
      ),
      RUN,
    ), `${code} toCardinal (decimal)`)

    // Ordinal — positive integers only.
    t.notThrows(() => fc.assert(
      fc.property(fc.bigInt({ min: 1n, max: WIDE }), n => upholdsContract(toOrdinal, n)),
      RUN,
    ), `${code} toOrdinal`)

    // Currency — any integer amount.
    t.notThrows(() => fc.assert(
      fc.property(fc.bigInt({ min: -WIDE, max: WIDE }), n => upholdsContract(toCurrency, n)),
      RUN,
    ), `${code} toCurrency`)

    // Type-equivalence — 42, '42', and 42n must yield the same outcome: the same
    // well-formed string, or the same rejection. outcome() also re-checks the
    // contract, so a consistent-but-invalid result (a TypeError crash or a
    // malformed string shared by all three input types) fails here too.
    t.notThrows(() => fc.assert(
      fc.property(fc.maxSafeInteger(), (n) => {
        const outcome = (input) => {
          let result
          try {
            result = toCardinal(input)
          }
          catch (error) {
            if (error instanceof RangeError) return 'RangeError'
            throw new Error(`threw ${error.constructor.name} (not RangeError) for ${input}: ${error.message}`, { cause: error })
          }
          if (!isWellFormed(result)) {
            throw new Error(`malformed output for ${input}: ${render(result)}`)
          }
          return result
        }
        const fromNumber = outcome(n)
        const fromString = outcome(String(n))
        const fromBigInt = outcome(BigInt(n))
        if (fromNumber !== fromString || fromString !== fromBigInt) {
          throw new Error(`type mismatch for ${n}: ${fromNumber} | ${fromString} | ${fromBigInt}`)
        }
        return true
      }),
      RUN,
    ), `${code} type-equivalence`)
  })
}
