# n2words Development Scripts

This directory contains development and maintenance scripts for the n2words library.

## add-language.js

Scaffolding tool for quickly setting up a new language implementation with all required boilerplate.

### What it creates

- **Language implementation file** (`lib/languages/{code}.js`)
  - Class extending the selected base class (GreedyScaleLanguage by default)
  - Placeholder properties (negativeWord, zeroWord, decimalSeparatorWord)
  - Base-class-specific structure (scaleWords, pluralForms, belowHundredWords, etc.)
  - Skeleton methods with TODO comments
  - Comprehensive JSDoc documentation

- **Test fixture file** (`test/fixtures/languages/{code}.js`)
  - Test case array with example inputs and expected outputs
  - Covers basic numbers, teens, tens, hundreds, thousands, millions
  - Includes negatives, decimals, and BigInt examples
  - TODO comments for language-specific test cases

- **Updates lib/n2words.js**
  - Adds import statement in the Language Imports section (alphabetically)
  - Creates converter using `makeConverter()` with type annotation in Language Converters section (alphabetically)
  - Adds to export statement in Exports section (alphabetically)

- **Updates test/types/n2words.test-d.ts**
  - Adds the new converter to the import block (alphabetically)
  - Adds a basic type test for the converter

### Usage

#### Interactive Mode (Recommended)

Simply provide the language code and you'll be prompted to select a base class:

```bash
npm run lang:add -- <code>

# Example
npm run lang:add -- ko
```

You'll see an interactive prompt:

```text
Select a base class for your language:

  1. GreedyScaleLanguage (default)
     Scale-based decomposition (most common)

  2. SlavicLanguage
     Three-form pluralization (Slavic languages)

  3. SouthAsianLanguage
     Indian numbering system (lakh, crore)

  4. TurkicLanguage
     Turkish-style implicit "bir" rules

  5. AbstractLanguage
     Direct implementation (advanced)

Enter your choice (1-5) [1]:
```

Press Enter for the default (GreedyScaleLanguage) or enter 1-5 to select a specific base class.

#### Command-Line Mode

If you already know which base class you need, you can skip the prompt:

```bash
npm run lang:add -- <code> --base=<base-class>

# Examples
npm run lang:add -- ko                          # Uses default (greedy-scale)
npm run lang:add -- sr-Cyrl --base=slavic      # Serbian Cyrillic (SlavicLanguage)
npm run lang:add -- hi --base=south-asian      # Hindi (SouthAsianLanguage)
npm run lang:add -- az --base=turkic           # Azerbaijani (TurkicLanguage)
npm run lang:add -- custom-lang --base=abstract # Advanced: Direct implementation
```

**Base Classes:**

- `greedy-scale` - GreedyScaleLanguage (default): Most common pattern, scale-based decomposition
- `slavic` - SlavicLanguage: Three-form pluralization (singular/few/many)
- `south-asian` - SouthAsianLanguage: Indian numbering system (lakh, crore)
- `turkic` - TurkicLanguage: Turkish-style implicit "bir" rules
- `abstract` - AbstractLanguage: Direct implementation (advanced, requires implementing integerToWords from scratch)

### Validation

The script validates that:

- Language code follows IETF BCP 47 format (e.g., `en`, `zh-Hans`, `fr-BE`)
- Language doesn't already exist
- Creates all required files successfully

### Next steps after scaffolding

1. Edit `lib/languages/{code}.js`:
   - Replace placeholder words (`negativeWord`, `zeroWord`, `decimalSeparatorWord`)
   - Complete base-class-specific requirements:
     - **GreedyScaleLanguage/TurkicLanguage**: Add `scaleWords` array, implement `combineWordSets()`
     - **SlavicLanguage**: Define `onesWords`, `onesFeminineWords`, `teensWords`, `twentiesWords`, `hundredsWords`, `pluralForms` (optionally `scaleGenders = { 1: true }` for feminine thousands, `omitOneBeforeScale` to skip "one" before scale words)
     - **SouthAsianLanguage**: Complete `belowHundredWords` array (0-99), define `scaleWords`
     - **AbstractLanguage**: Implement `integerToWords()` from scratch

2. Edit `test/fixtures/languages/{code}.js`:
   - Replace English words with actual language equivalents
   - Add comprehensive test cases
   - Include edge cases and language-specific features

3. Run tests:

   ```bash
   npm test
   ```

## Validation

Language implementations are validated through the test suite (`npm test`). The integration tests in `test/integration/languages.test.js` verify:

- IETF BCP 47 language code validity
- Class structure and inheritance from valid base classes
- Required properties (`negativeWord`, `zeroWord`, `decimalSeparatorWord`)
- `integerToWords()` method functionality
- Registration in `n2words.js` (import, converter, export)
- Test fixture existence
- Scale words ordering (for GreedyScaleLanguage/TurkicLanguage)
- Alphabetical ordering of imports and exports in `n2words.js`
