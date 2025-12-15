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
6. Provides clear next steps for completing the implementation

The script guides you to choose from five base classes:

- **CardMatchLanguage** - For most languages (English, Spanish, French, German, etc.)
- **SlavicLanguage** - For Slavic/Baltic languages (Russian, Polish, Czech, etc.)
- **ScandinavianLanguage** - For Scandinavian languages (Norwegian, Danish)
- **TurkicLanguage** - For Turkic languages (Turkish, Azerbaijani)
- **AbstractLanguage** - For custom implementations (Arabic, Vietnamese, Romanian, etc.)

**After running:**

- Fill in the `cards` array with number words
- Implement the `merge()` method
- Complete test cases with expected outputs
- Run `npm run lang:validate xx` to check your work

## validate-language.js

Validates that a language implementation is complete and follows best practices.

**Usage:**

```bash
npm run lang:validate <language-code>
# or
node scripts/validate-language.js <language-code>
```

**Example:**

```bash
npm run lang:validate en
npm run lang:validate fr-BE
```

**What it checks:**

- ✓ Language file exists with proper structure
- ✓ Default export function is present
- ✓ Uses BigInt literals in number definitions
- ✓ Has merge() method OR toCardinal() override (for CardMatchLanguage)
- ✓ Extends one of five base classes (CardMatchLanguage, SlavicLanguage, ScandinavianLanguage, TurkicLanguage, or AbstractLanguage) or another language class
- ✓ Test file exists with comprehensive cases (20+ recommended)
- ✓ Tests cover: zero, negatives, decimals, large numbers
- ✓ Language is correctly imported in lib/n2words.js
- ✓ Language is registered in the dict object
- ⚠ Warns about TODO comments (implementation may be incomplete)

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

# Check all languages (manual loop in PowerShell)
Get-ChildItem lib/i18n/*.js | ForEach-Object {
  $lang = $_.BaseName
  Write-Host "Checking $lang..."
  npm run lang:validate $lang
}
```

## See Also

- [LANGUAGE_GUIDE.md](../LANGUAGE_GUIDE.md) - Comprehensive language implementation guide
- [BIGINT-GUIDE.md](../BIGINT-GUIDE.md) - BigInt usage guide for language developers
- [CONTRIBUTING.md](../CONTRIBUTING.md) - General contribution guidelines
