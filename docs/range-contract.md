# Range contract

Every conversion form declares the largest value it can spell, and a single gate
verifies that claim behaviourally. This is what lets `LANGUAGES.md` show each
language's range, lets the gate pin the exact ceiling, and makes the
silent-magnitude-collapse bug class structurally catchable — with no per-language
test code.

> Status: introduced as a proof on `en-US`, `it-IT`, `zh-Hans-CN`, `th-TH`
> (one of each structural kind). The remaining languages are migrated to it
> family by family, and the gate covers each one the moment it declares a `*Max`.

## The fact: a bigint `*Max` per form

Each language exports, per form, the smallest value it refuses — so the largest it
converts is that minus one — or `UNBOUNDED` for no fixed limit:

```js
export const cardinalMax = western(SCALES.length) // bigint, e.g. 10n ** 66n
export const ordinalMax  = bounded(9)             // bigint
export const currencyMax = UNBOUNDED              // null
```

Those three exports are the only declarations a language adds. The bigint is the
fact — base-agnostic and directly comparable; the `10^N` form is only a display,
derived where it's shown.

## Deriving the value: pure helpers (`src/utils/scale.js`)

Pure functions compute the bigint from the language's own scale-table size, so the
ceiling tracks the vocabulary and can't drift:

| helper          | grouping                        | value                |
| --------------- | ------------------------------- | -------------------- |
| `western(n)`    | 3-digit, array from "thousand"  | `10^((n + 1) * 3)`   |
| `myriad(n)`     | 4-digit (CJK)                   | `10^((n + 1) * 4)`   |
| `indian(n)`     | 3-2-2 South Asian               | `10^(3 + 2*(n - 1))` |
| `longScale(n)`  | long scale (es / fr / it)       | `10^(6 * (n + 1))`   |
| `bounded(e)`    | escape hatch (structural bound) | `10^e`               |
| `UNBOUNDED`     | recursive / compounding         | `null`               |

A language whose shape fits none of them declares a literal bigint or `bounded(e)`.
The helpers are pure — none of them throws.

## The guard: one call per form

```js
checkMax(integerPart, cardinalMax, decimalPart)
checkMax(integerPart, ordinalMax)
checkMax(dollars,     currencyMax)
```

`checkMax(value, max, fraction?)` (`src/utils/check-max.js`) is a throwing
precondition validator — the same family as `parseCardinalValue` /
`validateOptions`: the language calls it and it throws on a value past the
ceiling, owning the `RangeError` itself.

- a `max` of `null` (unbounded) never throws;
- pass `fraction` (the decimal digit string) **only** when the fraction is spelled
  via the scale builder (integer-spelled). Digit-by-digit forms and ordinal /
  currency omit it, so long fractions stay valid.

It runs at the entry point — an O(1) short-circuit before any building — and
allocates nothing on the in-range path. The message renders `10^N - 1` when the
ceiling is an exact power of ten, otherwise the raw maximum.

## The gate: behavioural, in CI (`test/range-contract.test.js`)

For each form that declares a `*Max`, three properties, with no knowledge of any
scale table:

- **well-formed** across the range;
- **injective** across the range — distinct magnitudes must spell distinctly, so a
  gap / drop / clamp (which collapses magnitude) is caught generically;
- **boundary** (finite max only) — `max` throws `RangeError`, `max - 1` is
  well-formed, pinning the exact ceiling in both directions.

Contiguity ("no missing in-between scale word") is therefore a *behavioural*
property the injectivity sweep enforces, not a structural assertion.

## Migrating a language

1. Export `cardinalMax` / `ordinalMax` / `currencyMax` — a helper, `bounded(e)`, or
   `UNBOUNDED`.
2. Guard each form with `checkMax(value, max, fraction?)`.
3. Run `npm test` — the gate picks the language up automatically.

## Why this shape

- **The value is a bigint, not an exponent** — base-agnostic, so it stays honest
  for a future non-decimal ceiling; the exponent is a display token only.
- **Helpers are pure; all checks live in the gate** — the runtime guard stays one
  precomputed bigint comparison (zero allocation), and verification is CI's job.
- **The fact is per form, not a combined object** — so the forms split cleanly
  into per-form files later, and a language may ship any subset.
