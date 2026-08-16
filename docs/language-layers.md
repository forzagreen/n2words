# Language layers

A BCP 47 code like `en-KE` used to encode three independent facts at once:
which numeral grammar to use, which currencies are nameable, and which
currency is the default. Measuring the actual English variants showed those
facts don't vary together — 16 files carried only **3** distinct numeral
behaviours, with the other 13 differing only in which currency they
defaulted to. n2words now names each fact separately:

| Layer | Varies by | Lives in | Example |
| ----- | --------- | -------- | ------- |
| 1. Numerals | language variety | a full `src/{code}.js` implementation | `en-GB`'s "and after hundreds" |
| 2. Currency words | language (or its script/orthography) | `src/utils/currency-vocab.js`, keyed by language | `en`'s `{ GBP: {...}, KES: {...} }` |
| 3. Locale profile | country | a thin `src/{code}.js` file with `variantOf` | `en-AU` defaults to AUD |

```mermaid
flowchart TB
    subgraph L1["Layer 1 · Numerals — full src/{code}.js implementations"]
        enUS["en-US<br/>own default: USD"]
        enGB["en-GB<br/>own default: GBP"]
    end

    subgraph L2["Layer 2 · Currency words — currency-vocab.js, keyed by language"]
        enVocab["en → USD · GBP · KES · AUD · NZD … (24 currencies)"]
    end

    subgraph L3["Layer 3 · Locale profiles — variantOf + own currencyDefaults"]
        enAU["en-AU<br/>variantOf: en-GB<br/>default: AUD"]
        enKE["en-KE<br/>variantOf: en-GB<br/>default: KES"]
    end

    enAU -. numerals .-> enGB
    enKE -. numerals .-> enGB

    enUS -. currency words .-> enVocab
    enGB -. currency words .-> enVocab
    enAU -. currency words .-> enVocab
    enKE -. currency words .-> enVocab
```

Every layer-3 entry point — base or profile — draws from the *same* layer-2
matrix. That's the whole point made visible: `en-GB` and `en-KE` used to each
hardcode their own single currency's words, so neither could name the
other's. Now both point at one `en` matrix that has words for both, so
`en-GB` can render KES and `en-KE` can render GBP — a capability that used to
require either duplicating the vocabulary into both files or forking a
third. Layer 1 stays untouched by any of this: `en-AU` and `en-KE` borrow
`en-GB`'s numeral grammar unconditionally, so adding a currency or a country
never risks the numeral logic that's actually hard to get right.

> Status: adopted for every language with a behaviourally-identical
> numeral clone (English, Spanish) — see
> [bare-tag-aliases.md](./bare-tag-aliases.md) for which multi-variant
> families this does and doesn't apply to, and
> [currency-vocab.md](./currency-vocab.md) for the matrix layer's own
> contract in full.

## Why layer 3 exists

`en-AU` and `en-SG`'s numeral code differed by zero lines of logic before
this — the entire diff between the two files was doc comments. Before the
matrix was keyed by language (layer 2), that duplication was load-bearing:
each locale's `toCurrency` closed over its own hardcoded currency words, so
there was no way to ask `en-GB` for KES or `en-KE` for GBP even though both
would use identical English words — the two locales just happened to each
know one currency. Layer 2 removes that constraint; layer 3 removes the
duplication it was propping up.

A locale profile is `export *` from its base plus a `toCurrency` wrapper:

```js
// src/en-AU.js
import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyValues } from './en-GB.js'

export * from './en-GB.js'
export const variantOf = 'en-GB'

export const currencyDefaults = { and: true, currency: 'AUD' }

function toCurrency(value, options) {
  return toCurrencyBase(value, resolveOptions(options, currencyDefaults, currencyValues))
}

export { toCurrency }
```

`toCardinal`/`toOrdinal` inherit unchanged via `export *` — a profile makes
no numeral claims of its own. `currencyDefaults` and `toCurrency` are
declared locally, which legally shadows the star-exported bindings of the
same name (ES modules resolve a local export before a re-export); this is
flagged and suppressed with a comment at each occurrence, not silently
allowed, since the codebase's own gates depend on `import-x/export`
elsewhere.

**A pure `export *` profile would be silently wrong.** Shadowing
`currencyDefaults` alone does nothing: the base's `toCurrency` closes over
the base's *own* module-scope `currencyDefaults`, so `en-AU` would report
`currencyDefaults.currency === 'AUD'` while every call with no options still
returned pounds. That's a well-formed, confident, wrong answer — exactly
the failure class this project refuses to ship silently. The wrapper —
apply the profile's own defaults via `resolveOptions`, *then* call the
base — is what actually threads the override through.
[`variant-profile-contract.test.js`](../test/variant-profile-contract.test.js)
exists specifically to catch a profile that regresses to the pure-`export *`
shape: it asserts `profile.toCurrency(v)` with no options matches
`base.toCurrency(v, { currency: profileDefault })` explicitly, for every
profile in `src/`.

## `variantOf` vs `aliasOf`

Both are thin `export *` files, and both are excluded from the fuzz suites
in `contract.test.js`, `range-contract.test.js`, and
`options-contract.test.js` for the same reason: their behaviour is proven by
reference-identity to something already covered, not by re-running the fuzz
suite against a copy.

| | `aliasOf` (bare-tag) | `variantOf` (locale profile) |
| - | - | - |
| Points from | a bare primary subtag (`en`) | a region-qualified code (`en-AU`) |
| Points to | one variant *within its own family* | any full implementation, same language |
| Overrides anything? | No — pure `export *`, nothing shadowed | Yes — `currencyDefaults`/`toCurrency` |
| Gate | `bare-tag-contract.test.js` | `variant-profile-contract.test.js` |

A bare tag never resolves to a profile — `bare-tag-contract.test.js`
excludes any file with `variantOf` set from being treated as a family's
"canonical" variant, the same way it already excludes `aliasOf` files. A
profile never points at another profile or alias either
(`variant-profile-contract.test.js` checks this directly): the numerals a
profile inherits should be one `export *` away, not a chain to walk.

## When a candidate turns out not to be a clean profile

Two real counterexamples surfaced while collapsing English's clones, worth
knowing before adding a new one:

- **An extra option only some variants expose.** `en-CA` supports
  `hundredPairing` ("fifteen hundred" vs "one thousand five hundred"), which
  no other English variant does. A default-value probe across ~1,300 numbers
  can't see this — with `hundredPairing: false` (the default), `en-CA`'s
  output is byte-identical to `en-GB`'s. But the *option itself* is part of
  the public API, and collapsing `en-CA` into a profile would delete it
  silently. `en-CA` stays a full implementation.
- **An invariable-noun currency the base's generic pluralizer can't
  handle.** `taka` (BDT), `ringgit`/`sen` (MYR), `naira`/`kobo` (NGN), and
  `rand` (ZAR) don't pluralize — a single-element word-form array, not the
  usual `[singular, plural]` pair. A base written as
  `count === 1n ? major[0] : major[1]` reads `major[1]` on any count past 1
  and gets `undefined`. The fix generalizes cleanly —
  `count === 1n || major.length < 2 ? major[0] : major[1]` handles both
  shapes — but it has to be applied in the base a profile delegates to
  (`en-GB`, `en-IN`, and `en-US`/`en-CA` directly, since they don't
  delegate), not worked around per profile.

Both were caught by the same mechanism: a full-tree behavioural diff against
a pre-refactor snapshot (every `toCardinal`/`toOrdinal`/`toCurrency` output
across ~1,300 probe values, per code) run after every structural change, not
just at the end. A diff against defaults alone would have missed the first;
a diff that didn't probe every currency a widened matrix newly makes
reachable would have missed the second.

## Adding a new code under this model

- **New country, existing numerals, existing language matrix key.** Write a
  profile (see the `en-AU` example above). Confirm first that the base
  really is a byte-identical clone under default options *and* that its
  currency-building logic is arity-safe for every currency the shared
  matrix might hand it — not just the new profile's own default.
- **New currency, existing language.** One entry in that language's
  `currency-vocab.js` export. See
  [currency-vocab.md](./currency-vocab.md#adding-a-currency-to-a-language).
  No `src/` file changes at all unless the currency needs a new country
  entry point too (previous bullet).
- **New numeral grammar, or the same grammar but genuinely different
  currency-noun grammar** (a gender-sensitive language whose existing
  hardcoded gender wouldn't extend correctly — see
  [currency-vocab.md](./currency-vocab.md#grammatical-gender)). Write a
  full `src/{code}.js` implementation per the normal
  [Language File Pattern](../CLAUDE.md#language-file-pattern).
