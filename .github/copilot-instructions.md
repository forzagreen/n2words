## n2words — Copilot / AI agent instructions

This file gives targeted, actionable guidance for AI coding agents working in this repository.

- **Big picture:** `n2words` converts numeric values into written words across ~28 languages. The public API is the default export in `lib/n2words.js` (ESM). Language implementations live in `lib/i18n/*.js` and typically export a default function with the signature `(value, options)` that returns a string.

- **Core components:**
  - `lib/n2words.js`: language registry and export. Uses `dict[lang]` to dispatch.
  - `lib/i18n/*.js`: per-language implementations. Most use `BaseLanguage` or `AbstractLanguage` from `lib/classes/`.
  - `lib/classes/abstract-language.js`: decimal handling and input validation. Decimal part is treated as a string; leading zeros become the word for zero.
  - `lib/classes/base-language.js`: common highest-matching-word algorithm; languages define `cards` arrays of `[value, word]` (use BigInt literals).

- **Patterns & conventions** (follow these exactly):
  - Files are ESM (`package.json` includes `type: "module"`). Use `export default function floatToCardinal(value, options={})` when creating languages.
  - Use `BigInt` literals in `cards` (e.g. `100n`, `1_000n`) not plain numbers for large values.
  - Decimal processing: languages should rely on `AbstractLanguage.decimalToCardinal()` for consistent behavior when extending `AbstractLanguage`.
  - The default language code is `en`; fallbacks are handled in `lib/n2words.js` by progressively stripping suffixes (e.g. `fr-BE` -> `fr`).

- **How to add a language (example):**
  - Create `lib/i18n/xx.js`.
  - Import `BaseLanguage` or `AbstractLanguage` depending on pattern used by similar languages.
  - Export a default function: `export default function floatToCardinal(value, options = {}) { return new MyLang(options).floatToCardinal(value); }`
  - Add the language import and mapping entry in `lib/n2words.js`.

- **Build / test / lint workflows** (explicit commands):
  - Run tests: `npm test` (uses `ava`).
  - Run only core tests: `npm run test:core`.
  - Run i18n tests: `npm run test:i18n`.
  - Build browser bundle: `npm run build` (uses `webpack`).
  - Generate type declarations: `npm run build:types`.
  - Lint JS: `npm run lint:js`; full lint: `npm run lint`.

- **Important implementation notes:**
  - Input types: functions accept `number | string | bigint`. `AbstractLanguage.floatToCardinal` validates inputs and converts to `BigInt` for whole numbers.
  - Negative numbers: `AbstractLanguage` prepends `negativeWord` (languages set this via options).
  - Decimal handling: decimal digits are converted individually except leading zeros, which are translated to the language's `zero` word.

- **Files to inspect for examples:**
  - `lib/i18n/en.js` — canonical use of `BaseLanguage` and `cards` + `merge()` implementation.
  - `lib/classes/base-language.js` and `lib/classes/abstract-language.js` — essential algorithms.
  - `test/i18n.js` and `test/core.js` — test expectations and example inputs/outputs.

- **Environment / runtime:**
  - Node supported versions are declared in `package.json` (`node: ^20 || ^22 || >=24`). Tests may rely on modern Node features such as BigInt and numeric separators.

- **When editing:**
  - Keep exports and filenames consistent with `lib/` layout.
  - Preserve `type: module` semantics; avoid CommonJS `module.exports`.
  - Update `lib/n2words.js` and `exports` in `package.json` if adding new public entrypoints.

- **When unsure, look at these concrete examples:**
  - `lib/i18n/en.js` shows `BaseLanguage` usage and `merge()` details.
  - `lib/n2words.js` shows how languages are registered and fallback logic.

If anything above is unclear or you'd like more examples (e.g., a minimal new-language PR), tell me where to expand and I will iterate.
