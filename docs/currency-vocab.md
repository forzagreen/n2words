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

Because the source is keyed by language, how far that has actually got is not
readable from the file itself — you'd have to read all 72 exports to answer
"which languages can name EUR?". [LANGUAGES.md](../LANGUAGES.md)'s **Currency
Coverage** section is the generated inverse view: one row per ISO code, split
into the languages it's the default for and the languages that merely name it.
Run `npm run docs:languages` after editing this file so the two stay in step.

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
`CURRENCY_EXPONENTS` in `currency-vocab.js`) have none in everyday use, and
a few divide into 1000 instead (see below). A
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
  fractional amount with `RangeError`;
- for any 1000-subunit currency in the enum, the third decimal digit
  survives — `'1.500'` and `'1.050'` must not render alike, which they do
  the moment a language forgets `minorUnitDigits`.

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

## 1000-subunit currencies (millimes, fils)

Most currencies divide into 100. A few divide into 1000, and n2words names
them:

| Currency | Minor unit |
| -------- | ---------- |
| TND (Tunisian dinar) | millime |
| KWD, BHD, JOD, IQD (dinars) | fils |
| OMR (Omani rial) | baisa |
| LYD (Libyan dinar) | dirham |

These carry `3` in `CURRENCY_EXPONENTS`. Everything absent from that map is
2; only `0` and `3` may appear in it.

A language that names one **must** pass the currency's digit count to the
parser, which means resolving options *before* parsing:

```js
function toCurrency(value, options) {
  const { currency } = resolveOptions(options, currencyDefaults, currencyValues)
  const { isNegative, dollars, cents } = parseCurrencyValue(value, minorUnitDigits(currency))
  checkMax(dollars, currencyMax) // cents are <= 999, safe
  assertCurrencyExponent(cents, currency)
  // ...
}
```

Parsing a 1000-subunit currency at the default 2 digits is the failure this
guards against: `'1.500'` would arrive as **50** minor units and be spelled
"one dinar and fifty millimes" for an amount meaning five hundred — a
well-formed, confident, wrong answer. `currency-vocab-contract.test.js`
proves the round trip behaviourally for every 3-decimal currency a language
advertises, so forgetting the argument fails CI rather than shipping.

Note `minorUnitDigits` returns **2, not 0**, for a zero-exponent currency
like JPY. Parsing those at 0 digits would silently turn 1.5 yen into 1 yen;
keeping two digits is what leaves `assertCurrencyExponent` a fraction to
reject.

### Grammar the extra digits expose

A minor amount now reaches the language as 0-999 rather than 0-99, so
pluralization rules have to cover the whole range — a table keyed only to
1/2/few/many still works, but a language that special-cased "two digits"
would not. In Arabic the wider range also surfaces gender agreement that
100-subunit currencies never exercised: `ar-SA` inverts numeral gender for
3-10, so masculine فلس takes ثلاثة while feminine بيسة takes ثلاث. That
selection is grammar and lives in `ar-SA.js` (`MINOR_GENDER`), not in this
matrix — the matrix holds only the word forms.

## Missing minor-unit words

Adding a currency to a language needs no infrastructure, only vocabulary:
a language can only name a currency listed in its own export, so e.g.
`hi-IN` naming USD needs the Hindi words for "dollar" *and* "cent".

**A missing minor-unit translation cannot silently slip in.** `minor: null`
is not a placeholder for "we don't know the word yet" — the gate enforces
minor-words ⟺ nonzero exponent, so `minor: null` on a 2-decimal currency
fails CI with *"has `minor: null` but no `CURRENCY_EXPONENTS` entry, so
nothing stops a fractional amount from dereferencing it"*. If you don't
have the minor word, leave the currency out of that language's export
rather than nulling it — an absent currency throws a clear `RangeError`
naming the accepted set, which is the honest answer.
