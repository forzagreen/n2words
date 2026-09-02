# Bare-tag alias contract

n2words counts *languages*, not regional or script variants — English is one
language with 16 regional variants, not 16 languages. A bare BCP 47 tag
(`en`, `de`, `ja`, ...) is the primary way to import a language: it resolves
without forcing a region subtag, defaulting to one specific, documented
variant. A region-qualified code (`en-GB`, `fr-BE`) always still works, for
when you need precision or the language has no single safe default.

> Status: every language whose variants aren't "very different" (see below)
> has a bare-tag alias, and the completeness half of that rule is enforced
> in CI.

## The fact: one alias file per single-variant family

A family with exactly one regional/script variant today has **no room for
ambiguity** — there's nothing to pick a default *among* — so its bare tag
must exist:

```js
// src/de.js
export * from './de-DE.js'
export const aliasOf = 'de-DE'
```

Thin, `export *`-based, identical in shape to every other language file in
`src/`. Nothing about it is language-specific. The current list is generated,
not maintained by hand: see the `Entry point` column of
[LANGUAGES.md](../LANGUAGES.md)'s "Languages" table.

## The "very different" test

A family with **two or more** variants gets a bare-tag alias only when one
variant can serve as a safe, unsurprising default for the whole family. The
test is deliberately narrow — it's about the *shape* of the output, not how
much vocabulary differs:

- **Different script.** `zh-Hans-CN` vs `zh-Hant-TW`, `sr-Cyrl-RS` vs
  `sr-Latn-RS`, `am-ET` vs `am-Latn-ET` — diffing the actual source for each
  pair shows identical grammar and identical words, just transliterated into
  a different Unicode script. A bare tag would silently choose a script for
  the caller. No alias.
- **Different core numbering grammar.** `pt-BR` vs `pt-PT` — diffing the
  source shows more than vocabulary drift: short scale (`bilhão` = 10⁹) vs
  long scale (`bilião` = 10¹², `mil milhões` = 10⁹), different teen words
  (`dezesseis` vs `dezasseis`), different "e"-insertion rules. This is a
  different numbering system, not a dialect difference — the same category
  as a script split, even though currency (BRL vs EUR) also differs. No
  alias, and it would stay excluded even if the two used the same currency.

Neither test is about currency, and neither is about how many words differ —
`en-US` vs `en-GB` differ in plenty of words too. The question is narrowly
"would defaulting silently produce a different *shape* of output than the
caller expects" (a different script, a different scale system) — not "do
these variants sound different."

## Multi-variant families that do get an entry point

`en` (→ `en-US`), `es` (→ `es-ES`), `fr` (→ `fr-FR`) all have multiple
variants but pass the test above: same script, same core numbering grammar
(short-scale Western grouping) across every variant in each family. Note
that this holds even though some variants in these families diverge in
other ways that don't matter for the test — `en-IN`/`en-BD`/`en-PK` use
Indian lakh/crore grouping rather than Western grouping (`en-IN` spells
10⁷ as `one crore`, `en-US` as `ten million`); `es-MX` and `es-US` differ
from `es-ES` in default currency (MXN and USD vs EUR); and `es-US` also
stops lower, at a cardinal ceiling of 10²¹ against `es-ES`'s 10³⁰. None of
this threatens the alias, because a bare-tag alias is a **fixed pointer to
one variant**, not a dispatcher that tries to speak for the whole family —
`en` resolving to `en-US` makes no claim about what `en-IN` does.

Picking the default itself is a one-time human judgment call (documented in
each alias file's own comment) — most-used variant for `en`, conventional
default for bare `es`/`fr` across BCP-47 tooling generally. This part isn't
mechanically checkable and the gate doesn't try.

## Bare tags carry no default currency

Everything above is about *numerals*, where an alias forwards its target's
bindings untouched. `toCurrency` is the one exception, and it falls out of the
layer model rather than being a special case: **a bare tag names a language,
and a default currency belongs to a country.**

`en-US` defaults to USD because a locale has a country and a country has a
currency. `en` has no country. Inheriting `en-US`'s default would mean
`n2words/en`'s `toCurrency(42.50)` quietly returns dollars to a caller who
asked only for English — and English is official in sixteen of this package's
variants, spanning USD, GBP, INR, KES, NGN, ZAR and more. So an alias strips
the key and requires the caller to name one:

```js
import { toCurrency } from 'n2words/en'

toCurrency(42.50)                      // TypeError: names a language, not a locale
toCurrency(42.50, { currency: 'GBP' }) // 'forty-two pounds and fifty pence'

import { toCurrency as toCurrencyUS } from 'n2words/en-US'
toCurrencyUS(42.50)                    // 'forty-two dollars and fifty cents'
```

This applies to every alias, not only the families whose variants visibly
disagree. `de` looks safe because de-DE is the only German variant here, but
German is also spoken in Austria and Switzerland, and CHF is not EUR — the
rule holds because of what a language tag *is*, not because of which variants
happen to be implemented today.

The shape, in each alias file:

```js
import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './de-DE.js'

// eslint-disable-next-line import-x/export -- deliberate shadow
export * from './de-DE.js'
export const aliasOf = 'de-DE'

// eslint-disable-next-line no-unused-vars -- named only so the rest excludes it
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults
// eslint-disable-next-line import-x/export -- deliberate shadow
export const currencyDefaults = baseDefaultsWithoutCurrency

function toCurrency(value, options) {
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/de names a language, not a locale: ...')
  }
  return toCurrencyBase(value, options)
}
// eslint-disable-next-line import-x/export -- deliberate shadow
export { toCurrency }
```

Three details worth keeping:

- **`currencyDefaults` is derived, not hand-listed.** Every option other than
  `currency` keeps the target's default, so an option added to the target
  later can't silently go missing from the bare tag.
- **The target's options contract runs first.** `resolveOptions` is called
  before the missing-currency check so a typo'd key reports itself
  (`Unknown option "currencey"`) instead of being masked by the
  missing-currency error. `TypeError` is right for both: `resolve-options.js`
  reserves `TypeError` for shape errors and `RangeError` for values outside a
  declared set, and an absent required option is a shape error.
- **Only `toCurrency` and `currencyDefaults` are shadowed.** `currencyValues`,
  `currencyMax` and both other forms stay reference-identical to the target's,
  and the gate still asserts that.

A language that names one hardcoded currency has no `currency` option and so
has nothing to strip — its alias stays a plain `export *`. The gate keys off
exactly that condition, so the wrapper becomes mandatory the moment such a
language gains the option.

## `aliasOf` vs `variantOf`

A bare-tag alias is one of two thin, `export *`-based file shapes in
`src/` — the other is a locale profile (`variantOf`, see
[language-layers.md](./language-layers.md)), which points a
region-qualified code like `en-AU` at a full implementation like `en-GB`
whose numerals it shares, then overrides just the default currency. The two
solve different problems (which single variant should a bare tag mean, vs.
collapsing behaviourally-identical locale clones) and neither substitutes
for the other: `bare-tag-contract.test.js` excludes any `variantOf` file
from counting as a family's "canonical" variant, so a bare tag can never
resolve to a profile instead of the full implementation it delegates to.

## The gate: `test/bare-tag-contract.test.js`

Two things, both mechanical:

- **Completeness** — every BCP 47 primary subtag with exactly one variant in
  `src/` must have a matching alias file. This is what keeps "must exist for
  every non-diverging language" true over time instead of being a one-time
  cleanup.
- **Fidelity** — every alias's forwarded bindings (`toCardinal`,
  `cardinalMax`, `currencyValues`, ...) are reference-identical (`===`) to
  its target's, proving `export *` is forwarding live bindings rather than a
  stale copy.
- **No inherited currency** — for a family whose target declares a `currency`
  option, the alias must wrap `toCurrency` and strip the default (see above):
  the wrapper is a distinct function, `currencyDefaults` has no `currency`
  key, calling it without one throws `TypeError`, every *other* default is
  kept, and naming the target's own currency reproduces the target's output
  exactly.

Because fidelity is covered here, `contract.test.js`, `range-contract.test.js`,
and `options-contract.test.js` skip alias files entirely (an `aliasOf`
check) rather than re-running their fuzz suites against what's already
proven to be the exact same function.

The "very different" judgment itself is *not* in this gate — a family with
two or more variants is simply not asserted either way. That call belongs to
a human, same as which scale words a language uses isn't something a
contract can derive on its own.

## Adding a language

Run `npm run lang:add -- <code>` as usual. If the new code is the **first**
variant in its family, its bare-tag alias is scaffolded automatically —
`lang:add` refuses a bare (no region/script subtag) code outright, since
that namespace is reserved for these auto-generated files.

If the new code joins an **existing** family, nothing is automated: the tool
prints a note pointing here, and it's a human call whether the family is
still close enough to share its existing default (usually yes — most
additions are close, like `en`'s many variants) or different enough that the
alias needs revisiting (rare — matches the test above).
