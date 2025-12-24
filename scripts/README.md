# n2words Development Scripts

This directory contains development and maintenance scripts for the n2words library.

## add-language.js

Scaffolding tool for quickly setting up a new language implementation with all required boilerplate.

### What it creates

- **Language implementation file** (`lib/languages/{code}.js`)
  - Class extending `GreedyScaleLanguage` (most common pattern)
  - Placeholder properties (negativeWord, zeroWord, decimalSeparatorWord)
  - Placeholder scaleWordPairs array
  - Skeleton mergeScales() method with TODO comments
  - Comprehensive JSDoc documentation

- **Test fixture file** (`test/fixtures/languages/{code}.js`)
  - Test case array with example inputs and expected outputs
  - Covers basic numbers, teens, tens, hundreds, thousands, millions
  - Includes negatives, decimals, and BigInt examples
  - TODO comments for language-specific test cases

- **Updates lib/n2words.js**
  - Adds import statement for the new language class
  - Creates converter using `makeConverter()` factory
  - Adds to export statement

### Usage

```bash
# Add a new language by IETF BCP 47 code
npm run lang:add <language-code>

# Examples
npm run lang:add ko        # Korean
npm run lang:add zh-Hans   # Simplified Chinese
npm run lang:add fr-CA     # Canadian French
npm run lang:add sr-Latn   # Serbian (Latin script)
```

### Validation

The script validates that:

- Language code follows IETF BCP 47 format (e.g., `en`, `zh-Hans`, `fr-BE`)
- Language doesn't already exist
- Creates all required files successfully

### Next steps after scaffolding

1. Edit `lib/languages/{code}.js`:
   - Replace placeholder words with actual language words
   - Add complete scaleWordPairs array (largest to smallest)
   - Implement mergeScales() with language-specific rules

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
- **Export consistency**: Class exported and registered in `n2words.js`

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
- `decimalSeparatorWord` (string) - Word between whole and decimal parts
- `wordSeparator` (string) - Character(s) between words (typically space)
- `convertDecimalsPerDigit` (boolean, optional) - Per-digit vs grouped decimal conversion

#### ✅ Required Methods

- `convertWholePart(bigint)` - Must be implemented (not abstract)
- `convertToWords(value)` - Inherited from AbstractLanguage
- `mergeScales(left, right)` - Required for GreedyScaleLanguage subclasses

#### ✅ Scale Words Validation (for scale-based languages)

- **Array structure**: `[[bigint, string], ...]` format
- **Descending order**: Values must be ordered largest to smallest
- **Complete coverage**: Should include entry for `1n`
- **Type checking**: First element bigint, second element string

#### ✅ Documentation

- **Class JSDoc**: Description of language and conversion rules
- **Method documentation**: JSDoc for custom methods (especially `mergeScales`)
- **Examples**: Usage examples in comments

#### ✅ Testing

- **Test fixture exists**: File in `test/fixtures/languages/{code}.js`
- **Fixture format**: Exports array of `[input, expected, options]` tuples
- **Export structure**: Uses `export default [...]`

#### ✅ Integration

- **Import in n2words.js**: Language class imported
- **Converter creation**: `makeConverter()` wrapper created
- **Export**: Converter function exported (e.g., `EnglishConverter`)

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
    ✓ convertWholePart(0n) returns: "zero"
    ✓ Extends GreedyScaleLanguage
    ✓ scaleWordPairs properly ordered (60 entries)
    ✓ Has class documentation
    ✓ Has mergeScales() documentation
    ✓ Has proper import statement
    ✓ Has test fixture file
    ✓ Properly registered in n2words.js as EnglishConverter

✗ new-language
  Errors:
    ✗ Missing required property: negativeWord
    ✗ convertWholePart() not implemented (still abstract)
    ✗ Not imported in lib/n2words.js
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

### "scaleWordPairs not in descending order"

**Fix**: Ensure scale word pairs are ordered from largest to smallest:

```javascript
scaleWordPairs = [
  [1000000n, 'million'],  // ✓ Largest first
  [1000n, 'thousand'],
  [100n, 'hundred'],
  [1n, 'one']             // ✓ Smallest last
]
```

### "convertWholePart() not implemented (still abstract)"

**Fix**: Implement the `convertWholePart` method in your class:

```javascript
convertWholePart(wholeNumber) {
  if (wholeNumber === 0n) return this.zeroWord
  // Your implementation here
}
```

### "Not imported in lib/n2words.js"

**Fix**: Add import, converter creation, and export to `lib/n2words.js`:

```javascript
// 1. Import
import { MyLanguage } from './languages/my.js'

// 2. Create converter
const MyLanguageConverter = makeConverter(MyLanguage)

// 3. Export
export {
  // ... other exports
  MyLanguageConverter
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
