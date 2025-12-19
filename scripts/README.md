# Scripts

Utility scripts for maintaining and extending n2words.

## add-language.js

Interactive script to generate boilerplate for a new language implementation.

**Usage:**

```bash
npm run lang:add
# or
node scripts/add-language.js
```

**What it does:**

1. Prompts for language details (code, name, base class selection, etc.)
2. Generates `lib/i18n/xx.js` with implementation template
3. Generates `test/i18n/xx.js` with test case template
4. Updates `lib/n2words.js` with import statement and dict registration
5. Ensures proper comma placement in dict (StandardJS style)
6. Derives the class name from the language name (PascalCase), not the code token
7. Provides clear next steps for completing the implementation

The script guides you to choose from five base classes:

- **GreedyScaleLanguage** - For most languages (English, Spanish, French, German, etc.)
- **SlavicLanguage** - For Slavic/Baltic languages (Russian, Polish, Czech, etc.)
- **TurkicLanguage** - For Turkic languages (Turkish, Azerbaijani)
- **AbstractLanguage** - For custom implementations (Arabic, Vietnamese, Romanian, etc.)

**After running:**

- Fill in the `scaleWordPairs` array with number words
- Implement the `mergeScales()` method
- Complete test cases with expected outputs
- Run `npm run lang:validate xx` to check your work

## validate-language.js

Validates that a language implementation is complete and follows best practices.

**Usage:**

```bash
npm run lang:validate <language-code>
# or
node scripts/validate-language.js <language-code>

# Validate all languages
npm run lang:validate
node scripts/validate-language.js
```

**Example:**

```bash
npm run lang:validate en
npm run lang:validate fr-BE
```

**What it checks:**

- ✓ Language code matches ISO 639-1 (optional region suffix)
- ✓ Language file exists with proper structure
- ✓ Default export function is present and instantiates the declared class
- ✓ Class name looks like the language name (not the code token)
- ✓ Uses BigInt literals in number definitions
- ✓ Has mergeScales() method OR convertWholePart() override (for GreedyScaleLanguage)
- ✓ Extends a recognized base class (GreedyScaleLanguage, SlavicLanguage, TurkicLanguage, AbstractLanguage) or another language class
- ✓ Test file exists with comprehensive cases (20+ recommended)
- ✓ Tests cover: zero, negatives, decimals, large numbers (includes 1_000_000-style literals)
- ✓ Language is correctly imported in lib/n2words.js and registered in the dict
- ✓ Default export produces non-empty strings for sample inputs (runtime smoke test)
- ⚠ Warns about TODO comments or thin test coverage

**Exit codes:**

- `0` - Validation passed (may have warnings)
- `1` - Validation failed with errors

## Development Workflow

### Adding a New Language

```bash
# 1. Generate boilerplate
npm run lang:add

# 2. Implement the language
# - Edit lib/i18n/xx.js
# - Edit test/i18n/xx.js

# 3. Validate implementation
npm run lang:validate xx

# 4. Run tests
npm test

# 5. Lint code
npm run lint

# 6. Build
npm run build:web
```

### Validating Existing Languages

```bash
# Check a specific language
npm run lang:validate fr

# Check all languages
npm run lang:validate
```

## See Also

- [LANGUAGE_GUIDE.md](../LANGUAGE_GUIDE.md) - Comprehensive language implementation guide
- [BIGINT-GUIDE.md](../BIGINT-GUIDE.md) - BigInt usage guide for language developers
- [CONTRIBUTING.md](../CONTRIBUTING.md) - General contribution guidelines
