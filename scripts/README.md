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
npm run lang:add -- ko                          # Uses default (greedy)
npm run lang:add -- sr-Cyrl --base=slavic      # Serbian Cyrillic (SlavicLanguage)
npm run lang:add -- hi --base=south-asian      # Hindi (SouthAsianLanguage)
npm run lang:add -- az --base=turkic           # Azerbaijani (TurkicLanguage)
npm run lang:add -- custom-lang --base=abstract # Advanced: Direct implementation
```

**Base Classes:**

- `greedy` - GreedyScaleLanguage (default): Most common pattern, scale-based decomposition
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

3. Validate:

   ```bash
   npm run lang:validate -- {code} --verbose
   ```

4. Run tests:

   ```bash
   npm test
   ```

## validate-language.js

Comprehensive validator for language implementations to ensure they follow all required patterns and conventions.

### What it validates

#### ✅ File Structure

- **IETF BCP 47 naming**: Files named with standard language codes (`en.js`, `fr-BE.js`, `zh-Hans.js`)
- **Proper imports**: Relative imports from base classes
- **Export consistency**: Class exported and registered in `n2words.js` with proper:
  - Import in Language Imports section
  - Converter creation with type annotation in Language Converters section
  - Export in Exports section

#### ✅ Class Structure

- **Inheritance**: Extends one of the valid base classes:
  - `AbstractLanguage` - Direct implementation
  - `GreedyScaleLanguage` - Scale-based decomposition
  - `SlavicLanguage` - Three-form pluralization
  - `SouthAsianLanguage` - Indian numbering system
  - `TurkicLanguage` - Turkish-style implicit "bir" rules
- **Class definition**: Proper ES6 class with prototype

#### ✅ Required Properties

- `negativeWord` (string) - Word for negative numbers (e.g., "minus")
- `zeroWord` (string) - Word for zero
- `decimalSeparatorWord` (string) - Word between integer and decimal parts
- `wordSeparator` (string) - Character(s) between words (typically space)
- `usePerDigitDecimals` (boolean, optional) - Per-digit vs grouped decimal conversion

#### ✅ Required Methods

- `integerToWords(bigint)` - Must be implemented (not abstract)
- `toWords(isNegative, integerPart, decimalPart)` - Inherited from AbstractLanguage
- `combineWordSets(preceding, following)` - Required for GreedyScaleLanguage subclasses

#### ✅ Scale Words Validation (for scale-based languages)

- **Array structure**: `[[bigint, string], ...]` format
- **Descending order**: Values must be ordered largest to smallest
- **Complete coverage**: Should include entry for `1n`
- **Type checking**: First element bigint, second element string

#### ✅ Options Pattern (for languages with options)

- **Constructor pattern**: Languages with options must have:
  - Constructor that accepts `options` parameter
  - Call to `super()` or `super(options)`
  - Call to `this.setOptions()` (unless passing options to super)
- **Typedef exists**: Matching `{LanguageName}Options` typedef in `n2words.js`
- **Typedef properties match**: Option properties in typedef match constructor defaults
- **Default values match**: Default values in constructor match typedef defaults
- **Converter type annotation**: Converter includes `options?: {LanguageName}Options` parameter
- **Regional variants**: Languages that extend other languages (e.g., `fr-BE extends fr`) can pass options to super without setOptions
  - Parent language file must exist
  - Class must correctly extend the imported parent
  - Constructor mutations to `scaleWords` are validated for ordering
- **Base class options**: Languages without constructors can use base class options (e.g., Slavic languages inherit from `SlavicLanguage`)
- **Option type validation**:
  - `gender` option must use enum type `('masculine'|'feminine')`, not boolean
  - Boolean options (`formal`, `ordFlag`, `dropSpaces`, etc.) must have `boolean` type
  - String options (`negativeWord`, `andWord`) must have `string` type
  - Default values must match expected types

#### ✅ Documentation

- **Class JSDoc**: Description of language and conversion rules
- **Method documentation**: JSDoc for custom methods (especially `combineWordSets`)
- **Examples**: Usage examples in comments

#### ✅ Testing

- **Test fixture exists**: File in `test/fixtures/languages/{code}.js`
- **Fixture format**: Exports array of `[input, expected, options]` tuples
- **Export structure**: Uses `export default [...]`
- **Options coverage**: For languages with options, verifies that options are tested in fixtures

#### ✅ Type Tests

- **Type test registration**: Converter is imported in `test/types/n2words.test-d.ts`
- **Options coverage**: For languages with options, verifies that option types are tested

#### ✅ Integration

- **Import in n2words.js**: Language class imported in Language Imports section
- **Converter creation**: `makeConverter()` wrapper created with type annotation in Language Converters section
- **Export**: Converter function exported in Exports section (e.g., `EnglishConverter`)

### Validation Usage

```bash
# Validate all languages
npm run lang:validate

# Validate specific languages by code
npm run lang:validate -- en es fr de

# Show detailed validation info
npm run lang:validate -- --verbose

# Validate specific language with details
npm run lang:validate -- en --verbose
```

### Output Format

The validator provides color-coded output:

- 🟢 **Green ✓**: Language passes all validations
- 🔴 **Red ✗**: Language has errors (blocking issues)
- 🟡 **Yellow ⚠**: Warnings (non-blocking but should be addressed)
- ⚪ **Gray**: Informational messages (with `--verbose`)

### Exit Codes

- **0**: All validations passed
- **1**: One or more languages have validation errors

### Example Output

```text
n2words Language Validator

✓ en
  Info:
    ✓ File naming follows IETF BCP 47 convention
    ✓ Class English properly defined
    ✓ Property negativeWord: "minus"
    ✓ Property zeroWord: "zero"
    ✓ Property decimalSeparatorWord: "point"
    ✓ integerToWords(0n) returns: "zero"
    ✓ Extends GreedyScaleLanguage
    ✓ scaleWords properly ordered (60 entries)
    ✓ Has class documentation
    ✓ Has combineWordSets() method
    ✓ Has proper import statement
    ✓ Has test fixture file
    ✓ Properly registered in n2words.js as EnglishConverter
    ✓ EnglishConverter included in type tests

✗ new-language
  Errors:
    ✗ Missing required property: negativeWord
    ✗ integerToWords() not implemented (still abstract)
    ✗ Not imported in lib/n2words.js
    ✗ NewLanguageConverter not imported in type test file (test/types/n2words.test-d.ts)
  Warnings:
    ⚠ Missing test fixture: test/fixtures/languages/new-language.js

Summary:
  Valid: 1
  Invalid: 1
  Total: 2
```

## When to Use validate-language.js

### During Development

Run the validator while implementing a new language to ensure you haven't missed any requirements:

```bash
npm run lang:validate -- your-language-code --verbose
```

### Before Committing

Validate your changes before creating a pull request:

```bash
npm run lang:validate
```

### CI/CD Integration

The validator is designed to be used in continuous integration:

```bash
npm run lang:validate || exit 1
```

## Common Issues and Fixes

### "Missing required property: negativeWord"

**Fix**: Add the property to your class:

```javascript
export class MyLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  // ...
}
```

### "scaleWords not in descending order"

**Fix**: Ensure scale words are ordered from largest to smallest:

```javascript
scaleWords = [
  [1000000n, 'million'],  // ✓ Largest first
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']             // ✓ Smallest last
]
```

### "integerToWords() not implemented (still abstract)"

**Fix**: Implement the `integerToWords` method in your class:

```javascript
integerToWords(integerPart) {
  if (integerPart === 0n) return this.zeroWord
  // Your implementation here
}
```

### "Not imported in lib/n2words.js"

**Fix**: Add import, converter creation, and export to `lib/n2words.js` in their respective sections:

```javascript
// ============================================================================
// Language Imports
// ============================================================================

import { MyLanguage } from './languages/my.js'
// ... other imports (alphabetically sorted)

// ============================================================================
// Language Converters
// ============================================================================

const MyLanguageConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(MyLanguage))
// ... other converters (alphabetically sorted)

// ============================================================================
// Exports
// ============================================================================

export {
  // ... other exports
  MyLanguageConverter,
  // ... (alphabetically sorted)
}
```

### "Missing test fixture"

**Fix**: Create a test fixture file at `test/fixtures/languages/{code}.js`:

```javascript
export default [
  [1, 'one'],
  [42, 'forty-two'],
  [100, 'one hundred'],
  // ... more test cases
]
```

### "Converter not imported in type test file"

**Fix**: Add the converter to `test/types/n2words.test-d.ts`:

Add to the import block (alphabetically sorted):

```typescript
import {
  // ... other converters
  MyLanguageConverter,
  // ... other converters
} from '../../lib/n2words.js'
```

Add a basic type test:

```typescript
expectType<string>(MyLanguageConverter(42))
```

If the language has options, add options tests:

```typescript
expectType<string>(MyLanguageConverter(42, { gender: 'feminine' }))
```

**Note**: If you use `npm run lang:add`, this is done automatically.
