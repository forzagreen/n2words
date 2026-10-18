import test from 'ava'
import { readdirSync } from 'node:fs'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'
import * as currencies from '../src/en/currencies.js'
import { en, assertCurrencyVocab } from '../src/utils/currency-vocab.js'

/**
 * toCurrencyIn gate.
 *
 * `toCurrencyIn(value, currency, options)` is `toCurrency` with the currency
 * passed as an imported object (src/en/currencies.js) instead of an ISO code.
 * It exists for one reason: a bundle that imports it with one currency carries
 * that currency's words and no others, which `toCurrency` can't do — its
 * code lookup keeps the whole map, because a bundler drops unused bindings but
 * never unused properties. So this gate pins two things:
 *
 * - it is `toCurrency` in every other respect: same output, same errors, for
 *   every currency and both `and` settings, through every English entry point;
 * - the bundle really does drop the other currencies. Nothing else would
 *   notice if a refactor made the object path read the map again.
 *
 * Plus the shape guard: a malformed currency object throws `TypeError`, the
 * same as a malformed options argument, rather than reaching the builder.
 */

const codes = readdirSync('./src')
  .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
  .map(f => f.replace('.js', ''))
  .sort()

const mods = new Map()
for (const code of codes) {
  const mod = await import(`../src/${code}.js`)
  if (typeof mod.toCurrencyIn === 'function') mods.set(code, mod)
}

// Implementations own a toCurrencyIn; profiles and the bare tag forward one.
const implementations = [...mods].filter(([, mod]) => mod.aliasOf === undefined && mod.variantOf === undefined)

// Compare a call by its result *or* its error, so two functions that both
// reject an input compare as equal without a conditional assertion.
const outcome = (fn) => {
  try {
    return fn()
  }
  catch (error) {
    return `throws ${error.constructor.name}: ${error.message}`
  }
}

// Whole, fractional, singular, negative and 1000-subunit amounts, plus a
// sub-minor-unit amount and the edges of each form's range.
const PROBE_VALUES = [0, 1, 2, 0.01, 0.99, 1.01, 42.5, -42.5, '1.500', '1.050', '.5', '0.001']

test('every English currency is exported once, under its own code', (t) => {
  const exported = Object.keys(currencies).sort()
  t.deepEqual(exported, Object.keys(en).sort(), 'src/en/currencies.js and the `en` matrix must name the same currencies')
  for (const code of exported) {
    // eslint-disable-next-line import-x/namespace -- computed lookup by design: every export is checked
    const currency = currencies[code]
    t.is(currency.code, code, `${code}'s object must carry code "${code}"`)
    // The same arrays, not equal copies: the words have one home, the matrix.
    t.is(currency.major, en[code].major, `${code}.major must be the \`en\` matrix's own array`)
    t.is(currency.minor, en[code].minor, `${code}.minor must be the \`en\` matrix's own array`)
    t.notThrows(() => assertCurrencyVocab(currency), `${code} must pass its own shape guard`)
  }
})

test('the English entry points expose toCurrencyIn', (t) => {
  t.deepEqual(implementations.map(([code]) => code), ['en-CA', 'en-GB', 'en-IN', 'en-US'])
  // A profile or the bare tag forwards its base's own function: their numerals
  // are the base's, and toCurrencyIn takes no default currency to override.
  for (const [code, mod] of mods) {
    const base = mod.variantOf ?? mod.aliasOf ?? code
    t.is(mod.toCurrencyIn, mods.get(base)?.toCurrencyIn, `${code}.toCurrencyIn must be ${base}'s`)
  }
})

for (const [code, mod] of mods) {
  test(`${code} toCurrencyIn matches toCurrency for every currency`, (t) => {
    const ceiling = mod.currencyMax
    const values = [...PROBE_VALUES, ceiling - 1n, ceiling, -ceiling]
    for (const isoCode of mod.currencyValues.currency) {
      // eslint-disable-next-line import-x/namespace -- computed lookup by design: every advertised code is checked
      const currency = currencies[isoCode]
      for (const options of [undefined, { and: true }, { and: false }]) {
        for (const value of values) {
          t.is(
            outcome(() => mod.toCurrencyIn(value, currency, options)),
            outcome(() => mod.toCurrency(value, { ...options, currency: isoCode })),
            `${code}.toCurrencyIn(${value}, ${isoCode}, ${JSON.stringify(options)}) must match toCurrency`,
          )
        }
      }
    }
  })
}

const MALFORMED = [
  ['undefined', undefined],
  ['null', null],
  ['an ISO code string', 'GBP'],
  ['an array', [currencies.GBP]],
  ['a lowercase code', { ...currencies.GBP, code: 'gbp' }],
  ['a missing code', { major: ['pound', 'pounds'], minor: ['penny', 'pence'] }],
  ['an empty major list', { ...currencies.GBP, major: [] }],
  ['a non-string word', { ...currencies.GBP, major: [42] }],
  ['an empty word', { ...currencies.GBP, minor: [''] }],
  ['a padded word', { ...currencies.GBP, major: [' pound'] }],
  ['a double-spaced word', { ...currencies.GBP, major: ['pound  sterling'] }],
  ['no minor unit for a currency that has one', { ...currencies.GBP, minor: null }],
  ['minor-unit words for a currency that has none', { code: 'JPY', major: ['yen'], minor: ['sen'] }],
]

for (const [code, mod] of implementations) {
  test(`${code} toCurrencyIn rejects a malformed currency with TypeError`, (t) => {
    for (const [label, currency] of MALFORMED) {
      t.throws(() => mod.toCurrencyIn(42.5, currency), { instanceOf: TypeError }, `${code}: ${label} must throw TypeError`)
    }
    // A currency built by hand is fine as long as it's well-formed, including
    // one with no minor unit — its fractions are refused like JPY's are.
    const yen = { code: 'JPY', major: ['yen'], minor: null }
    t.is(mod.toCurrencyIn(42, yen), 'forty-two yen')
    t.throws(() => mod.toCurrencyIn(42.5, yen), { instanceOf: RangeError })
  })

  test(`${code} toCurrencyIn validates its options like toCurrency does`, (t) => {
    const { GBP } = currencies
    t.is(mod.toCurrencyIn(42.5, GBP, { and: undefined }), mod.toCurrencyIn(42.5, GBP))
    // The currency is the second argument, so as an option it's unknown.
    t.throws(() => mod.toCurrencyIn(42.5, GBP, { currency: 'USD' }), { instanceOf: TypeError })
    t.throws(() => mod.toCurrencyIn(42.5, GBP, { and: 'no' }), { instanceOf: TypeError })
    t.throws(() => mod.toCurrencyIn(42.5, GBP, JSON.parse('{ "__proto__": { "polluted": true } }')), { instanceOf: TypeError })
  })
}

/**
 * Bundles `entry` with Rollup and returns the code. No minifier: dropping an
 * unused binding is Rollup's own tree-shaking, which is the claim under test.
 * @param {string} entry - Source of the virtual entry module
 * @returns {Promise<string>} The bundled code
 */
async function bundle(entry) {
  const build = await rollup({ input: 'entry', plugins: [virtual({ entry })], logLevel: 'silent' })
  const { output } = await build.generate({ format: 'es' })
  await build.close()
  return output[0].code
}

// Every distinct English major-unit noun, as a quoted string literal, so a
// word that also appears in a comment can't count.
const NOUNS = [...new Set(Object.values(en).map(currency => currency.major[0]))]
const nounsIn = bundled => NOUNS.filter(noun => bundled.includes(`'${noun}'`) || bundled.includes(`"${noun}"`))
const src = file => JSON.stringify(new URL(`../src/${file}`, import.meta.url).pathname)

test('a toCurrency bundle carries every English currency', async (t) => {
  // The control: proves `nounsIn` can see a noun the bundle does carry, so
  // the toCurrencyIn assertions below can't pass by seeing nothing.
  const bundled = await bundle(`export { toCurrency } from ${src('en-US.js')}`)
  t.deepEqual(nounsIn(bundled), NOUNS)
})

for (const [code] of implementations) {
  test(`${code} toCurrencyIn bundles only the currency it imports`, async (t) => {
    const bundled = await bundle([
      `import { toCurrencyIn } from ${src(`${code}.js`)}`,
      `import { KES } from ${src('en/currencies.js')}`,
      'export const spell = value => toCurrencyIn(value, KES)',
    ].join('\n'))
    t.deepEqual(nounsIn(bundled), ['shilling'])
  })
}
