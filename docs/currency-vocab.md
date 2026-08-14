# Currency-vocab contract

Currency naming is inherently linguistic — pluralization, joining grammar,
which digit gets which word — so it stays owned by each language file, the
same as every other spelling decision. But the *word data* itself (what a
euro is called, what a fractional yen is called) is duplicated wherever more
than one file names the same currency, or wherever a language wants to name
a currency beyond its own region's default. This is what a shared,
per-language currency-name matrix exists to fix, without moving grammar out
of the language files that own it.

> Status: adopted by every `toCurrency`-exporting language, and **required**
> — a language that declares a `currency` enum option must have a matching
> entry in the shared matrix, verified behaviourally in CI.

## The fact: one named export per language, in `src/utils/currency-vocab.js`

```js
/** @type {Record<string, CurrencyWordForms>} */
export const enUS = { USD: { major: ['dollar', 'dollars'], minor: ['cent', 'cents'] } }
```

`CurrencyWordForms` is `{ major: string[], minor: string[] | null }`. The
arrays are plain word-form lists, not a fixed `[singular, plural]` tuple —
English needs 2 forms, Czech/Polish/Croatian/Lithuanian need 3
(`[singular, few, many]`), Japanese/Korean need exactly 1 (no plural
distinction). **Which index a given amount maps to is the language file's
own logic** (a ternary, or a local `pluralize(n, forms)` helper) — that's
real per-language grammar and it stays in the language file unchanged; only
the word-form *data* it consumes moves here. `minor: null` marks a currency
with no everyday subunit (see below).

## Why keyed by language, not by currency

The obvious shape — `{ USD: { 'en-US': {...}, 'fr-FR': {...} } }`, one entry
per currency holding every language's translation — is the wrong shape for
this codebase's build. `rollup.config.js` produces one self-contained bundle
per language with aggressive dead-code elimination (`toplevel: true`), and
Rollup/Terser eliminate unused *bindings*, not unused *properties* of an
object literal. Keying by currency would mean every language importing USD
silently accumulates every other language's USD translation into its own
bundle as the matrix grows — a real, compounding regression. Keying by
language first means a file imports only its own named export, so the
matrix can grow to any size without affecting any other language's bundle
size. `scale.js`'s split into `western`/`myriad`/`indian`/`longScale`/
`bounded` already established this same per-use-case export shape for the
same reason.

## Populated incrementally

Every language ships with just its own current default currency — a pure
data extraction from what the file already hardcoded, not new translation
work. A language naming an *additional* currency is a small, separate,
independently-reviewable addition to that one language's export — the same
growth model as `LANGUAGE_NAME_OVERRIDES` in
`test/helpers/language-naming.js`. "Any language can eventually name any
currency" is a structural capability of the shape, not a day-one
requirement.

## The `currency` option

Follows the existing `<form>Values` enum contract
([docs/options-contract.md](./options-contract.md)) exactly — no new
validation machinery:

```js
import { enUS as CURRENCY_VOCAB, assertCurrencyExponent } from './utils/currency-vocab.js'

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { currency: 'USD' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']> }} */
export const currencyValues = { currency: /** @type {...} */ (Object.keys(CURRENCY_VOCAB)) }

function toCurrency(value, options) {
  const { dollars, cents } = parseCurrencyValue(value)
  const { currency } = resolveOptions(options, currencyDefaults, currencyValues)
  assertCurrencyExponent(cents, currency)
  const { major, minor } = CURRENCY_VOCAB[currency]
  // build using major[n] / minor[n], exactly as before
}
```

`currencyValues.currency` is *derived* from the vocab export
(`Object.keys(...)`), so the enum can't structurally advertise a currency
with no translation behind it — the earlier free-string pattern (an
unmapped code silently printing the raw ISO code as a word) is what this
replaces. The default stays each file's current zero-config behavior; it's
now an explicit literal rather than an implicit hardcoded word choice.

## The guard: `assertCurrencyExponent`

Most currencies have 2 decimal places; a few (JPY, KRW, VND, IRR, IDR — see
`CURRENCY_EXPONENTS` in `currency-vocab.js`) have none in everyday use. A
fractional amount for one of those throws `RangeError` rather than spelling
a fictitious historical subunit or silently dropping the fraction — "loud
beats silent," the same philosophy `checkMax` and `resolveOptions` already
apply to their own preconditions. Call it right after resolving options,
before reading `major`/`minor`:

```js
assertCurrencyExponent(cents, currency)
```

`minor` is typed `string[] | null` (a currency may have no minor unit at
all). It's only ever read inside a `cents > 0n`-guarded block, which
`assertCurrencyExponent` already makes safe — so narrow it at the point of
use, not at the destructure site (narrowing at destructure would silently
stop type-checking a currency added later to that same file):

```js
if (cents > 0n) {
  const minorForms = /** @type {string[]} */ (minor)
  // ...
}
```

## The gate: `test/currency-vocab-contract.test.js`

For every language that declares `currencyValues.currency`:

- a named export exists in `currency-vocab.js` matching the language's code
  (`en-US` → `enUS`, via the same `normalizeCode` convention as UMD
  globals);
- every ISO code in the enum has a real entry in that export;
- for any zero-exponent currency in the enum, `toCurrency` rejects a
  fractional amount with `RangeError`.

Bare-tag alias files (`aliasOf` exported) are skipped — their
`currencyValues` is a live re-export of the target's, not a separate
declaration to re-verify under a different name.

## Adding a currency to a language

1. Add one ISO-4217-keyed entry to that language's export in
   `src/utils/currency-vocab.js`.
2. `currencyValues.currency` picks it up automatically (it's derived).
3. Add a fixture case in `test/fixtures/{code}.js` exercising the new
   `currency` value.
4. Run `npm test` — the gate verifies the declaration behaviourally.
