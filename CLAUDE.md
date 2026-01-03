# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Critical Patterns

**IMPORTANT**: These patterns MUST be followed:

1. **Alphabetical ordering** - All imports, converters, and exports in `lib/n2words.js` MUST be alphabetically sorted
2. **IETF BCP 47 codes** - Language codes: `en`, `zh-Hans`, `fr-BE`
3. **CLDR class naming** - Use `Intl.DisplayNames` for class names: `SimplifiedChinese`, `FrenchBelgium`
4. **Descending scale order** - `scaleWords` arrays: largest to smallest (1000000n before 1000n)

## Essential Commands

```bash
npm run lang:add <code>           # Scaffold new language
npm run lang:validate -- <code>   # Validate implementation
npm test                          # Run test suite
npm run build                     # Build UMD bundles
npm run lint:fix                  # Fix linting issues
```

## Architecture

**6 base classes** in `lib/classes/`:

| Class                  | Use For                      | Key Feature                 |
| ---------------------- | ---------------------------- | --------------------------- |
| `GreedyScaleLanguage`  | Most Western languages       | Scale-based decomposition   |
| `HebrewLanguage`       | Hebrew, Biblical Hebrew      | Dual forms, construct state |
| `SlavicLanguage`       | Russian, Polish, Czech, etc. | Three-form pluralization    |
| `SouthAsianLanguage`   | Hindi, Bengali, etc.         | Lakh/crore system           |
| `TurkicLanguage`       | Turkish, Azerbaijani         | Implicit "bir" rules        |
| `AbstractLanguage`     | Unique patterns              | Custom implementation       |

**Entry point**: `lib/n2words.js` - imports, type definitions, converter factory, exports (all alphabetically sorted)

**File naming**:

- Language: `lib/languages/{code}.js` (e.g., `en.js`, `zh-Hans.js`)
- Fixture: `test/fixtures/languages/{code}.js`

## Adding a Language

1. Run `npm run lang:add <code>` - scaffolds files and updates n2words.js
2. Edit `lib/languages/{code}.js` - implement required properties/methods
3. Edit `test/fixtures/languages/{code}.js` - add test cases
4. Run `npm run lang:validate -- <code> --verbose` - check implementation
5. Run `npm test` - verify all tests pass

**Base class requirements**:

- **GreedyScaleLanguage**: `scaleWords` array + `combineWordSets()` method
- **HebrewLanguage**: `onesWords`, `teensWords`, `twentiesWords`, `hundredsWords`, `pluralForms`, `scale`, `scalePlural`
- **SlavicLanguage**: `onesWords`, `teensWords`, `twentiesWords`, `hundredsWords`, `pluralForms`
- **SouthAsianLanguage**: `belowHundredWords` (100 entries) + `scaleWords`
- **AbstractLanguage**: Implement `integerToWords()` from scratch

## Options Pattern

Languages with options need:

1. Constructor with `this.setOptions(defaults, options)`
2. Typedef in `lib/n2words.js` (alphabetically sorted)
3. Type annotation on converter: `/** @type {(value: NumericValue, options?: MyOptions) => string} */`
4. Test cases with options in fixture file

## Validation Checklist

The validator (`npm run lang:validate`) checks:

- IETF BCP 47 naming
- Class structure and inheritance
- Required properties/methods
- Scale word ordering
- Registration in n2words.js (import, converter, export)
- Test fixture exists
- JSDoc documentation

## Reference Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed patterns, examples, edge cases
- [scripts/README.md](scripts/README.md) - Script usage details
- [bench/README.md](bench/README.md) - Benchmarking guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup, PR process, code style

---

**Version**: 2.0.0 | **52 languages** | [GitHub](https://github.com/forzagreen/n2words)
