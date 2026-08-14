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
Indian lakh/crore grouping rather than Western grouping, and `es-MX`/`es-US`
diverge from `es-ES` in default currency and cardinal ceiling. Neither
threatens the alias, because a bare-tag alias is a **fixed pointer to one
variant**, not a dispatcher that tries to speak for the whole family — `en`
resolving to `en-US` makes no claim about what `en-IN` does.

Picking the default itself is a one-time human judgment call (documented in
each alias file's own comment) — most-used variant for `en`, conventional
default for bare `es`/`fr` across BCP-47 tooling generally. This part isn't
mechanically checkable and the gate doesn't try.

## The gate: `test/bare-tag-contract.test.js`

Two things, both mechanical:

- **Completeness** — every BCP 47 primary subtag with exactly one variant in
  `src/` must have a matching alias file. This is what keeps "must exist for
  every non-diverging language" true over time instead of being a one-time
  cleanup.
- **Fidelity** — every alias's re-exported bindings (`toCardinal`,
  `cardinalMax`, `currencyDefaults`, ...) are reference-identical (`===`) to
  its target's, proving `export *` is forwarding live bindings rather than a
  stale copy.

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
