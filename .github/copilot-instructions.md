# Copilot Instructions for n2words

## Project Overview
- **n2words** converts numbers to words in 47 languages, supporting Node.js, browsers, ESM, CommonJS, and TypeScript.
- Language modules are in `lib/languages/`, each file named with a BCP 47 code (e.g., `fr-BE.js`).
- Each language class name is derived from CLDR (e.g., `French`, `BelgianFrench`).
- Main entry point is `lib/n2words.js`, which registers all language converters and exports them as `ClassNameConverter` (e.g., `EnglishConverter`).

## Key Architectural Patterns
- **Base Classes:** All language classes extend one of: `AbstractLanguage`, `GreedyScaleLanguage`, `SlavicLanguage`, `SouthAsianLanguage`, or `TurkicLanguage` (see `lib/classes/`).
- **Factory Pattern:** `makeConverter(Class)` wraps each language class for export.
- **Validation:** Use `scripts/validate-language.js` to enforce:
  - File naming (BCP 47)
  - Class naming (CLDR)
  - Required properties/methods
  - Proper registration in `n2words.js`
  - Test fixture presence in `test/fixtures/languages/`

## Developer Workflows
- **Add a Language:**
  1. Run `npm run lang:add <code>` to scaffold a new language.
  2. Implement the class in `lib/languages/`.
  3. Add test cases in `test/fixtures/languages/<code>.js`.
  4. Register in `lib/n2words.js` (import, makeConverter, export).
  5. Validate with `npm run lang:validate <code>`.
- **Testing:**
  - Run all tests: `npm test`
  - Integration (CommonJS): see `test/integration/commonjs.cjs`
- **Validation:**
  - `npm run lang:validate` (all languages)
  - `npm run lang:validate -- <code>` (specific language)

## Project-Specific Conventions
- **File Naming:** Language files must use canonical BCP 47 codes.
- **Class Naming:** Must match CLDR-derived PascalCase (no suffixes like `Language` or `Converter`).
- **Export Pattern:** All converters are exported as `ClassNameConverter` in `lib/n2words.js`.
- **Test Fixtures:** Each language must have a test fixture exporting an array of `[input, expected, options]`.
- **Documentation:** JSDoc required for all language classes and custom methods.

## Key Files & Directories
- `lib/languages/` — Language implementations
- `lib/classes/` — Base classes
- `lib/n2words.js` — Main registry/factory
- `scripts/validate-language.js` — Language implementation validator
- `test/fixtures/languages/` — Test cases per language
- `test/integration/commonjs.cjs` — CommonJS integration test

## Integration & External
- No runtime dependencies; all logic is in-repo.
- TypeScript types in `typings/`.
- CI runs validation and tests on every PR.

---

For more, see `README.md`, `scripts/README.md`, and `guides/`.
