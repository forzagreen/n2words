---
applyTo: "src/*.js"
---

# TEMPORARY — scale-ceiling "fix-then-gate" series

> Remove this file once the fast-check scale-ceiling **gate** lands (the capstone
> of the in-progress series). It exists only to stop one recurring review comment.

## Context

Language files in `src/` are being hardened so that numbers beyond a language's
largest named scale word throw a `RangeError` (via the shared `tooLargeError`
helper, checked at the public `toCardinal` / `toOrdinal` / `toCurrency` entry
points) instead of emitting malformed output (`"undefined"`, double spaces, or a
raw `TypeError` crash).

## When reviewing these scale-ceiling guards

- **Do not request per-language regression tests** for the new throws — neither
  boundary tests (`10^N - 1` ok / `10^N` throws) nor "long decimals still
  accepted". Out-of-range enforcement is owned by a single **fast-check property
  gate** (the capstone of this series) that asserts the contract universally
  across all 72 languages: *in-range → well-formed string; out-of-range →
  `RangeError`*. A per-language error-fixture mechanism was deliberately tried
  and removed (PR #347) as redundant boilerplate — the same magic value
  copy-pasted per language. Per-language boundaries are verified with a
  fast-check probe during development.
- The `RangeError` is **not a new error type**: `parse-cardinal` /
  `parse-currency` / `parse-ordinal` already throw `RangeError` for `NaN` /
  `Infinity` / out-of-domain input; "too large" joins those existing conditions.
- Each ceiling is **derived from that language's own scale table** (so it can't
  drift) and the guard short-circuits at the entry point (O(1), before any
  segment decomposition).
- The decimal part is guarded **only** for languages that spell the fraction via
  `integerToWords` (the same scale builder). Digit-by-digit decimal spellers
  (e.g. CJK) intentionally have **no** decimal ceiling — do not flag the absence
  of a decimal guard there.

Still flag genuine issues: an incorrect ceiling derivation, a wrong-scoped or
missing guard, or logic errors in the number-building itself.
