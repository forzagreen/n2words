# n2words Development Scripts

This directory contains development and maintenance scripts for the n2words library.

## add-language.js

Scaffolding tool for quickly setting up a new language implementation with all required boilerplate.

### What it creates

- **Language implementation file** (`lib/languages/{code}.js`)
  - Functional implementation stub with `toWords()` export
  - `parseNumericValue()` import for input handling
  - TODO comments with reference implementations by pattern

- **Test fixture file** (`test/fixtures/languages/{code}.js`)
  - Test case array with example format
  - TODO comments for adding test cases

- **Updates lib/n2words.js**
  - Adds import statement (alphabetically ordered)
  - Adds to named exports (alphabetically ordered)

- **Updates test/types/n2words.test-d.ts**
  - Adds the new converter to the import block (alphabetically)
  - Adds a basic type test for the converter

### Usage

```bash
npm run lang:add <code>

# Examples
npm run lang:add ko        # Korean
npm run lang:add sr-Cyrl   # Serbian Cyrillic
npm run lang:add ta        # Tamil
```

### Validation

The script validates that:

- Language code follows IETF BCP 47 format (e.g., `en`, `zh-Hans`, `fr-BE`)
- Language doesn't already exist
- Creates all required files successfully

### Next steps after scaffolding

1. Edit `lib/languages/{code}.js`:
   - Implement the `toWords(value)` function
   - Use `parseNumericValue(value)` to get `isNegative`, `integerPart`, and `decimalPart`
   - See reference implementations in the generated TODO comments

2. Edit `test/fixtures/languages/{code}.js`:
   - Add comprehensive test cases `[input, expectedOutput, options?]`
   - Include edge cases: zero, negatives, decimals, large numbers

3. Run tests:

   ```bash
   npm test
   ```

### Reference implementations by pattern

When implementing a new language, refer to existing implementations:

| Pattern       | Reference Files                | Key Features                   |
| ------------- | ------------------------------ | ------------------------------ |
| Western scale | `en.js`, `de.js`, `fr.js`      | Short scale (million, billion) |
| South Asian   | `hi.js`, `bn.js`               | Lakh/crore system              |
| East Asian    | `ja.js`, `ko.js`, `zh-Hans.js` | Myriad-based grouping          |
| Slavic        | `ru.js`, `pl.js`, `uk.js`      | Complex pluralization          |

## Validation

Language implementations are validated through the test suite (`npm test`). The integration tests verify:

- IETF BCP 47 language code validity
- `toWords()` function exists and returns strings
- Registration in `n2words.js` (import and export)
- Test fixture exists
- Alphabetical ordering of imports and exports in `n2words.js`
