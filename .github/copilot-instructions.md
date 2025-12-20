## n2words — Copilot / AI agent instructions

This file gives targeted, actionable guidance for AI coding agents working in this repository.

**Big picture:** `n2words` converts numeric values into written words across many languages with zero dependencies. The public API is the default export in `lib/n2words.js` (ESM). Language implementations live in `lib/languages/*.js` and typically export a default function with the signature `(value, options)` that returns a string.

- **Core components:**
  - `lib/n2words.js`: language registry and export. Uses `dict[lang]` to dispatch.
  - `lib/languages/*.js`: per-language implementations. Use one of five base classes from `lib/classes/`.
  - `lib/classes/abstract-language.js`: core base class providing decimal handling and input validation. Decimal part is treated as a string; leading zeros become the word for zero.
  - `lib/classes/greedy-scale-language.js`: extends `AbstractLanguage`; implements highest-matching-scale algorithm. Most languages use this. Languages define `scaleWordPairs` arrays of `[value, word]` (use BigInt literals). Used by: English, Spanish, French, German, Italian, Portuguese, Dutch, Korean, Hungarian, Chinese.
  - `lib/classes/slavic-language.js`: extends `AbstractLanguage`; specialized base for Slavic/Baltic languages with three-form pluralization (Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian).
  - `lib/classes/turkic-language.js`: extends `GreedyScaleLanguage`; specialized base for Turkic languages with space-separated combinations and implicit number patterns. Used by: Turkish, Azerbaijani.
  - `lib/classes/south-asian-language.js`: extends `AbstractLanguage`; specialized base for South Asian languages with Indian-style grouping (3 digits, then 2-2 from right). Provides `splitToGroups`, `convertBelowThousand`, and `convertWholePart`. Used by: Hindi, Bengali, Urdu, Punjabi, Marathi, Gujarati, Kannada.

- **Project structure:**
  - `dist/`: Browser bundles (webpack output: n2words.js, n2words.min.js)
  - `typings/`: TypeScript declarations (n2words.d.ts, classes/, languages/)
  - `docs/`: Generated JSDoc documentation (HTML format)
  - `examples/`: Usage examples (node-dynamic-import.js, typescript.ts)
  - `scripts/`: Development tools (add-language.js, validate-language.js)
  - `bench.js`, `bench-memory.js`: Performance benchmarking tools
  - `conf.json`: JSDoc configuration for documentation generation
  - `.editorconfig`, `.prettierignore`: Code formatting standards
  - `.markdownlint.mjs`: Markdown linting configuration

- **Documentation:**
  - `README.md`: Main project documentation and quick start
  - `TYPESCRIPT_GUIDE.md`: TypeScript usage, type annotations, examples
  - `LANGUAGE_GUIDE.md`: Comprehensive implementation guide for new languages
  - `LANGUAGE_OPTIONS.md`: End-user documentation of language-specific options
  - `DEVELOPER_GUIDE.md`: Development workflows, testing, architecture
  - `BIGINT-GUIDE.md`: BigInt usage patterns for language implementations
  - `CONTRIBUTING.md`: Contribution guidelines and automated workflows
  - `scripts/README.md`: Documentation for development scripts

- **Test organization:**
  - `test/unit/` — Core API unit tests (4 files: api.js, errors.js, validation.js, options.js).
  - `test/integration/` — Integration tests (3 files: commonjs.cjs, targeted-coverage.js, language-comprehensive.js).
  - `test/typescript/` — TypeScript validation tests (1 file: typescript-integration.ts).
  - `test/fixtures/languages/` — Per-language test fixtures (45 files, one per language).
  - `test/web/` — Browser compatibility tests (browser-compatibility.js, index.html).
  - `test/commonjs.cjs` — CommonJS compatibility tests.
  **Build / test / lint workflows** (explicit commands):


- **Patterns & conventions** (follow these exactly):
  - Files are ESM (`package.json` includes `type: "module"`). Language implementations export a default function: `export default function convertToWords(value, options={}) { return new XxLanguage(options).convertToWords(value); }`
  - Language classes extend a base class and use **class properties** for default values (`negativeWord`, `decimalSeparatorWord`, `zeroWord`, `scaleWordPairs`, etc.).
  - **Constructor parameters** should ONLY include options that actually affect behavior (not class properties). For example:
    - Chinese constructor accepts `formal` (affects scaleWordPairs array)
    - Spanish constructor accepts `genderStem` (affects merge behavior)
    - Czech and Hebrew accept special options
    - Most other languages don't need constructors at all
  - Use `BigInt` literals in `scaleWordPairs` (e.g. `100n`, `1_000n`) not plain numbers for large values.
  - Choose appropriate base class:
    - `GreedyScaleLanguage` for most languages with regular scale-based systems (English, Spanish, German, French, Italian, Portuguese, Dutch, Korean, Hungarian, Chinese)
    - `SlavicLanguage` for three-form pluralization languages (Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian)
    - `SouthAsianLanguage` for South Asian languages with Indian-style grouping (Hindi, Bengali, Urdu, Punjabi, Marathi, Gujarati, Kannada)
    - `TurkicLanguage` for Turkic languages with space-separated patterns (Turkish, Azerbaijani)
    - `AbstractLanguage` for custom implementations requiring full control (Arabic, Vietnamese, Romanian, Persian, Indonesian)
  - Decimal processing: languages should rely on `AbstractLanguage.decimalDigitsToWords()` for consistent behavior. For digit-by-digit decimal reading (Japanese, Thai, Tamil, Telugu, Filipino, Marathi, Gujarati, Kannada, Greek, Hebrew), set `convertDecimalsPerDigit = true` as a class property.
  - The default language code is `en`; fallbacks are handled in `lib/n2words.js` by progressively stripping suffixes (e.g. `fr-BE` -> `fr`).

- **How to add a language:**
  - Manual process (recommended for AI agents):
    - Create `lib/languages/xx.js` with a class extending the appropriate base class.
    - Define language defaults as class properties: `negativeWord`, `decimalSeparatorWord`, `zeroWord`, `scaleWordPairs` (for GreedyScaleLanguage) or `scaleWords` (for SouthAsianLanguage), etc.
    - If your language needs behavior customization via constructor options (rare), implement a constructor that accepts only those parameters.
    - Implement `mergeScales(leftWordSet, rightWordSet)` method with language-specific grammar rules.
    - Export default function: `export default function convertToWords(value, options = {}) { return new XxLanguage(options).convertToWords(value); }`
    - Add the language import and mapping entry in `lib/n2words.js`.
    - Add corresponding test file to `test/fixtures/languages/xx.js`.
    - Document constructor options (if any) in JSDoc, but ONLY document parameters actually accepted by the constructor, not class properties.
  - Alternative: Use automated script: `npm run lang:add` (generates boilerplate, updates registration).
  - Validate implementation: `npm run lang:validate xx` (checks completeness and best practices).
  - See `LANGUAGE_GUIDE.md` for comprehensive implementation guidance.

- **Build / test / lint workflows** (explicit commands):
  - Run all tests: `npm run test:all` (runs unit, integration, typescript, and web tests). **Requires `npm run build` and `npm run build:types` first.**
  - Run basic tests: `npm test` (runs unit and integration tests only).
    - Unit tests: `npm run test:unit` (test/unit/\*.js) — API, errors, validation, options.
    - Integration tests: `npm run test:integration` (test/integration/\*.js) — targeted coverage and CommonJS.
    - TypeScript tests: `npm run test:typescript` (test/typescript/typescript-integration.ts) — type validation. **Requires `npm run build:types` first.**
    - Web tests: `npm run test:web` (test/web.js) — browser compatibility (Chrome/Firefox). **Requires `npm run build` first.**
  - Run coverage: `npm run coverage` (runs npm test with c8 instrumentation).
  - Build browser bundle: `npm run build:web` (uses webpack, outputs to dist/).
  - Generate type declarations: `npm run build:types` (TypeScript compiler, outputs to typings/).
  - Full build: `npm run build` (runs build:web + build:types).
  - Lint JS: `npm run lint:js` (Standard.js); Lint markdown: `npm run lint:md` (markdownlint); Full lint: `npm run lint`.
  - Generate documentation: `npm run docs` (JSDoc, outputs to docs/).
  - Performance benchmarks: `npm run bench` (benchmark.js), `npm run bench:memory` (memory profiling).
  - Language tools: `npm run lang:add` (generate boilerplate), `npm run lang:validate xx` (validate implementation).

- **Test organization:**
  - `test/unit/` — Core API unit tests (4 files: api.js, errors.js, validation.js, options.js).
  - `test/integration/` — Integration tests (3 files: commonjs.cjs, targeted-coverage.js, language-comprehensive.js).
  - `test/typescript/` — TypeScript validation tests (1 file: typescript-integration.ts).
  - `test/fixtures/languages/` — Per-language test fixtures (45 files, one per language).
  - `test/web/` — Browser compatibility tests (browser-compatibility.js, index.html).

- **Important implementation notes:**
  - Input types: functions accept `number | string | bigint`. `AbstractLanguage.convertToWords` validates inputs and converts to `BigInt` for whole numbers.
  - Negative numbers: `AbstractLanguage` prepends `negativeWord` (defined as a class property in language implementations).
  - Decimal handling: By default, leading zeros are preserved as `zeroWord` words and remaining digits are grouped. Languages requiring per-digit decimal reading (ja, th, ta, te, he) set `convertDecimalsPerDigit = true` as a class property.
  - Class properties vs constructor parameters: Use class properties for defaults shared across all instances (negativeWord, decimalSeparatorWord, zeroWord, scaleWordPairs, etc.). Use constructor parameters ONLY for options that actually change behavior (e.g., formal style in Chinese, gender in Spanish).
  - JSDoc for constructors: Only document parameters actually accepted by the constructor, not inherited class properties. Class properties are documented in the class-level JSDoc comment.
  - TypeScript declarations: Generated automatically from JSDoc comments using `npm run build:types`. Follow JSDoc best practices for accurate type generation.
  - Performance: Portuguese (pt.js) and English (en.js) are heavily optimized with cached regex and mergeScales() optimizations.
  - Documentation: JSDoc comments generate both HTML docs (`npm run docs`) and TypeScript declarations. Use comprehensive JSDoc for all public methods and class properties.
- **Files to inspect for examples:**
  - `lib/languages/en.js` — canonical use of `GreedyScaleLanguage` and `scaleWordPairs` + optimized `mergeScales()` implementation.
  - `lib/languages/pt.js` — advanced optimizations: pre-compiled regex, simplified mergeScales() logic.
  - `lib/languages/ru.js` — use of `SlavicLanguage` with three-form pluralization (shared by 9 languages).
  - `lib/languages/nb.js` — inline `GreedyScaleLanguage` merge rules for the Norwegian "og" conjunction.
  - `lib/languages/tr.js` — use of `TurkicLanguage` with space-separated patterns (shared by Turkish and Azerbaijani).
  - `lib/languages/hi.js` — use of `SouthAsianLanguage` with Indian-style grouping (shared by Hindi, Bengali, Urdu, Punjabi, Marathi, Gujarati, Kannada).
  - `lib/languages/ar.js` — use of `AbstractLanguage` for custom implementation.
  - `lib/classes/greedy-scale-language.js` — essential algorithms for scale-based systems.
  - `lib/classes/slavic-language.js` — reusable base for Slavic/Baltic languages with complex pluralization.
  - `lib/classes/turkic-language.js` — reusable base for Turkic languages with space-separated patterns.
  - `lib/classes/south-asian-language.js` — reusable base for South Asian languages with Indian-style grouping.
  - `lib/classes/abstract-language.js` — essential algorithms and optimizations.
  - `test/unit/api.js` — API and language fallback tests.
  - `test/integration/language-comprehensive.js` — comprehensive language-specific tests.
  - `test/typescript/typescript-integration.ts` — TypeScript integration and validation tests.
  - `scripts/add-language.js` — automated language boilerplate generator.
  - `scripts/validate-language.js` — implementation validation tool.
  - `bench.js` — performance benchmarking tool using benchmark.js library.
  - `bench-memory.js` — memory usage profiling tool with garbage collection monitoring.
  - `examples/node-dynamic-import.js` — Node.js dynamic import example with language selection.
  - `examples/typescript.ts` — TypeScript usage examples with type annotations.
  - `LANGUAGE_GUIDE.md` — comprehensive guide for adding new languages.
  - `BIGINT-GUIDE.md` — detailed BigInt usage guide for language developers.
  - `TYPESCRIPT_GUIDE.md` — TypeScript integration and usage patterns.

- **Environment / runtime:**
  - Node supported versions: `^20 || ^22 || >=24` (declared in `package.json`).
  - Tests may rely on modern Node features such as BigInt and numeric separators.
  - Browser support: Defaults to `'defaults'` query (100% of browsers in-use, as defined by browserslist).
  - Browser tests: Chrome and Firefox (via Selenium WebDriver).
  - TypeScript: Full type definitions in `typings/` directory, generated from JSDoc comments.
  - ES Modules: All code uses `type: "module"` semantics; no CommonJS except `test/commonjs.cjs` for compatibility testing.
  - Build targets: Node.js (native ESM), browsers (webpack bundle in `dist/`), TypeScript projects (type definitions).
  - CDN support: Available via jsDelivr and unpkg with browser bundles and type definitions.

- **When editing:**
  - Keep exports and filenames consistent with `lib/` layout.
  - Preserve `type: module` semantics; avoid CommonJS `module.exports`.
  - Update `lib/n2words.js` and `exports` in `package.json` if adding new public entrypoints.
  - When reorganizing test files, update import paths to reflect new subdirectory structure (e.g., `../lib` becomes `../../lib`).
  - When updating JSDoc, run `npm run build:types` to regenerate TypeScript declarations.
  - When adding languages, use `npm run lang:add` script rather than manual file creation.
  - Always validate language implementations with `npm run lang:validate <code>` before committing.

- **Performance optimization notes:**
  - Use cached typeof checks and avoid repeated string operations.
  - Pre-compile regex patterns for repeated use (not in loop initializers).
  - Optimize Object.keys/values access by caching results when used multiple times.
  - The `mergeScales()` method is performance-critical; use early returns and reduce branching.

- **When unsure, look at these concrete examples:**
  - `lib/languages/en.js` shows `GreedyScaleLanguage` usage and `mergeScales()` details.
  - `lib/n2words.js` shows how languages are registered and fallback logic.

If anything above is unclear or you'd like more examples (e.g., a minimal new-language PR), tell me where to expand and I will iterate.
