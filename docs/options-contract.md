# Options contract

Every form that accepts options declares them as data — a typedef, an exported
defaults map, and (for enum options) an exported allowed-set map. The runtime
applies the declaration, the docs generator imports it, strict checkJs pins it
to the typedef, and a single gate verifies the behaviour. No JSDoc scraping, no
defaults hidden in function bodies, no silent fallbacks.

> Status: adopted by every options-taking language, and **required** — the gate
> fails any form that accepts an options parameter without declaring its
> contract, so a new language can't skip it and pass CI.

## The shape

```js
import { resolveOptions } from './utils/resolve-options.js'

/**
 * @typedef {object} CardinalOptions
 * @property {('masculine'|'feminine')} [gender] - Grammatical gender of the number
 */

/** @type {Required<CardinalOptions>} */
export const cardinalDefaults = { gender: 'masculine' }

/** @type {{ gender: ReadonlyArray<Required<CardinalOptions>['gender']> }} */
export const cardinalValues = { gender: ['masculine', 'feminine'] } // enum options only

/** @param {CardinalOptions} [options] */
function toCardinal(value, options) {
  const { gender } = resolveOptions(options, cardinalDefaults, cardinalValues)
}
```

Each fact has exactly one home:

| fact | home | held by |
| --- | --- | --- |
| type + description | the `@typedef` (`@property` per option) | lint (`require-property-description`) + the checker feeds `LANGUAGES.md` |
| default | the exported `<form>Defaults` map | runtime applies it; generator imports it; `Required<...Options>` makes checkJs fail drift in either direction |
| allowed set (enums) | the exported `<form>Values` map | runtime throws past it; element type ties it to the typedef union; the gate proves each value works |

## The error taxonomy

`resolveOptions(options, defaults, values?)` owns options validation:

- **`TypeError`** — a malformed options argument: non-object, unknown key,
  wrong-typed value, or an inherited key (`__proto__` is rejected before it can
  pollute). `{ key: undefined }` is not an error — it means "use the default",
  matching `key?: T`.
- **`RangeError`** — a known enum option whose value is outside its declared
  set: right kind of value, out of range — the same family as `checkMax`.

## The gate (`test/options-contract.test.js`)

Options-taking is detected by arity: every options-taking form's signature is
`(value, options)` with no default parameter (forms without options are
`(value)` only), so a form cannot accept options without declaring the
contract. For each options-taking form:

- `<form>Defaults` exists, is a plain object, and is non-empty;
- the declared defaults **round-trip**: `fn(x, { ...defaults })` equals `fn(x)`;
- `{ key: undefined }` falls back to the default;
- unknown keys, wrong-typed values, and inherited keys throw `TypeError`;
- for each `<form>Values` entry: the key is a declared option, the default is in
  the set, every declared value is accepted, and an out-of-set probe (derived
  from the option's own typeof) throws `RangeError`.

## Declaring a form's options

1. Write the `@typedef` — one `@property {type} [name] - description` per
   option; never an inline `@param {{...}}` (it has nowhere for descriptions).
2. Export `<form>Defaults` annotated `@type {Required<...Options>}`.
3. Enum options: export `<form>Values` with the allowed set, typed against the
   typedef union.
4. Resolve in the body: `resolveOptions(options, <form>Defaults[, <form>Values])`
   — no inline destructure defaults; the export is the single source.
5. Run `npm test` — the gate verifies the declaration behaviourally.

## Why this shape

- **Exports, not conventions** — the generator imports the facts instead of
  scraping JSDoc or reading destructures out of the AST, so the docs can't
  drift from the runtime.
- **The typecheck holds the seams** — the typedef↔defaults tie and the
  values↔union tie both fail `checkJs` when they drift; the gate holds the
  declaration↔behaviour tie.
- **Loud beats silent** — an invalid enum value used to fall back silently
  (`gender: 'garbage'` converted as masculine for years); under the contract it
  throws with the allowed set in the message.
