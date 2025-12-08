## n2words — Copilot / AI agent instructions

This file gives targeted, actionable guidance for AI coding agents working in this repository.

- **Big picture:** `n2words` converts numeric values into written words across 29 languages with zero dependencies. The public API is the default export in `lib/n2words.js` (ESM). Language implementations live in `lib/i18n/*.js` and typically export a default function with the signature `(value, options)` that returns a string.

- **Core components:**
  - `lib/n2words.js`: language registry and export. Uses `dict[lang]` to dispatch.
  - `lib/i18n/*.js`: per-language implementations (29 total). Most use `BaseLanguage`, `SlavicLanguage`, or `AbstractLanguage` from `lib/classes/`.
  - `lib/classes/abstract-language.js`: decimal handling and input validation. Decimal part is treated as a string; leading zeros become the word for zero.
  - `lib/classes/base-language.js`: common highest-matching-word algorithm; languages define `cards` arrays of `[value, word]` (use BigInt literals).
  - `lib/classes/slavic-language.js`: specialized base for Slavic/Baltic languages with three-form pluralization (Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian).

- **Patterns & conventions** (follow these exactly):
  - Files are ESM (`package.json` includes `type: "module"`). Use `export default function floatToCardinal(value, options={})` when creating languages.
  - Use `BigInt` literals in `cards` (e.g. `100n`, `1_000n`) not plain numbers for large values.
  - Choose appropriate base class:
    - `BaseLanguage` for simple card-based systems (English, French, Spanish, etc.)
    - `SlavicLanguage` for three-form pluralization languages (Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian)
    - `AbstractLanguage` for custom implementations (Arabic, Vietnamese, Romanian, Persian, Indonesian)
  - Decimal processing: languages should rely on `AbstractLanguage.decimalToCardinal()` for consistent behavior when extending `AbstractLanguage` or `SlavicLanguage`.
  - The default language code is `en`; fallbacks are handled in `lib/n2words.js` by progressively stripping suffixes (e.g. `fr-BE` -> `fr`).

- **How to add a language (recommended):**
  - Use automated script: `npm run lang:add` (generates boilerplate, updates registration).
  - Validate implementation: `npm run lang:validate xx` (checks completeness and best practices).
  - Manual process (alternative):
    - Create `lib/i18n/xx.js`.
    - Choose base class: `BaseLanguage` for card-based, `SlavicLanguage` for three-form pluralization, `AbstractLanguage` for custom logic.
    - Import appropriate base: `import BaseLanguage from '../classes/base-language.js'` (or `SlavicLanguage` or `AbstractLanguage`).
    - Export a default function: `export default function floatToCardinal(value, options = {}) { return new MyLang(options).floatToCardinal(value); }`
    - Add the language import and mapping entry in `lib/n2words.js`.
    - Add corresponding test file to `test/i18n/xx.js`.
  - See `LANGUAGE_GUIDE.md` for comprehensive implementation guidance.

- **Build / test / lint workflows** (explicit commands):
  - Run all tests: `npm test` (runs test:core + test:types).
  - Run core tests: `npm run test:core` (includes unit, integration, smoke, and i18n tests).
    - Unit tests: `npm run test:unit` (test/unit/*.js) — API, errors, validation, options.
    - Integration tests: `npm run test:integration` (test/integration/*.js) — targeted coverage.
    - Smoke tests: `npm run test:smoke` (test/smoke/*.js) — sanity checks for all 29 languages.
    - I18n tests: `npm run test:i18n` (test/i18n.js) — comprehensive language-specific tests.
  - Run coverage: `npm run coverage` (runs test:core with c8 instrumentation).
  - Build browser bundle: `npm run build:web` (uses `webpack`).
  - Generate type declarations: `npm run build:types`.
  - Lint JS: `npm run lint:js`; full lint: `npm run lint`.
  - Language tools: `npm run lang:add` (generate boilerplate), `npm run lang:validate xx` (validate implementation).

- **Test organization:**
  - `test/unit/` — Core API unit tests (4 files: api.js, errors.js, validation.js, options.js).
  - `test/integration/` — Integration tests (1 file: targeted-coverage.js).
  - `test/smoke/` — Smoke/sanity tests (1 file: smoke-i18n.js).
  - `test/i18n.js` — Main comprehensive i18n test suite.
  - `test/i18n/` — Per-language test fixtures (29 files, one per language).
  - `test/web/` — Browser testing resources.
  - `test/web.js` — Browser compatibility tests (Chrome/Firefox).
  - `test/typescript-smoke.ts` — TypeScript validation tests.

- **Important implementation notes:**
  - Input types: functions accept `number | string | bigint`. `AbstractLanguage.floatToCardinal` validates inputs and converts to `BigInt` for whole numbers.
  - Negative numbers: `AbstractLanguage` prepends `negativeWord` (languages set this via options).
  - Decimal handling: decimal digits are converted individually except leading zeros, which are translated to the language's `zero` word.
  - Performance: Portuguese (pt.js) and English (en.js) are heavily optimized with cached regex and merge() optimizations.
- **Files to inspect for examples:**
  - `lib/i18n/en.js` — canonical use of `BaseLanguage` and `cards` + optimized `merge()` implementation.
  - `lib/i18n/pt.js` — advanced optimizations: pre-compiled regex, simplified merge() logic.
  - `lib/i18n/ru.js` — use of `SlavicLanguage` with three-form pluralization (shared by 8+ languages).
  - `lib/classes/base-language.js` — essential algorithms for card-based systems.
  - `lib/classes/slavic-language.js` — reusable base for Slavic/Baltic languages with complex pluralization.
  - `lib/classes/abstract-language.js` — essential algorithms and optimizations.
  - `test/unit/api.js` — API and language fallback tests.
  - `test/i18n.js` — comprehensive language test cases.
  - `test/smoke/smoke-i18n.js` — quick sanity checks across all languages.
  - `scripts/add-language.js` — automated language boilerplate generator.
  - `scripts/validate-language.js` — implementation validation tool.
  - `LANGUAGE_GUIDE.md` — comprehensive guide for adding new languages.
  - `LANGUAGE_GUIDE.md` — comprehensive guide for adding new languages.

- **Environment / runtime:**
  - Node supported versions: `^20 || ^22 || >=24` (declared in `package.json`).
  - Tests may rely on modern Node features such as BigInt and numeric separators.
  - Browser support: Chrome and Firefox (via Selenium WebDriver).

- **When editing:**
  - Keep exports and filenames consistent with `lib/` layout.
  - Preserve `type: module` semantics; avoid CommonJS `module.exports`.
  - Update `lib/n2words.js` and `exports` in `package.json` if adding new public entrypoints.
  - When reorganizing test files, update import paths to reflect new subdirectory structure (e.g., `../lib` becomes `../../lib`).

- **Performance optimization notes:**
  - Use cached typeof checks and avoid repeated string operations.
  - Pre-compile regex patterns for repeated use (not in loop initializers).
  - Optimize Object.keys/values access by caching results when used multiple times.
  - The `merge()` method is performance-critical; use early returns and reduce branching.

- **When unsure, look at these concrete examples:**
  - `lib/i18n/en.js` shows `BaseLanguage` usage and `merge()` details.
  - `lib/n2words.js` shows how languages are registered and fallback logic.

If anything above is unclear or you'd like more examples (e.g., a minimal new-language PR), tell me where to expand and I will iterate.
