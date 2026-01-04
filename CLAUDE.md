# CLAUDE.md

n2words: Number to words converter. ESM + UMD, Node >=20, zero dependencies.

## Critical Patterns

**IMPORTANT**: These patterns MUST be followed:

1. **Alphabetical ordering** - All imports, converters, and exports in `lib/n2words.js` MUST be alphabetically sorted
2. **IETF BCP 47 codes** - Language codes: `en`, `zh-Hans`, `fr-BE`
3. **CLDR class naming** - Use `Intl.DisplayNames` for class names: `SimplifiedChinese`, `FrenchBelgium`

## Essential Commands

```bash
npm run lang:add <code>           # Scaffold new language
npm test                          # Run test suite
npm run build                     # Build UMD bundles
npm run lint:fix                  # Fix linting issues
```

## Architecture

**5 base classes** in `lib/classes/`:

| Class                     | Use For                                    | Key Feature                              |
| ------------------------- | ------------------------------------------ | ---------------------------------------- |
| `ScaleLanguage`           | Western, Romance, Slavic, Baltic languages | Segment-based, compound scale, inflection|
| `HebrewLanguage`          | Hebrew, Biblical Hebrew                    | Dual forms, construct state              |
| `MyriadLanguage`          | East Asian languages                       | Myriad-based grouping                    |
| `SouthAsianLanguage`      | Hindi, Bengali, etc.                       | Lakh/crore system                        |
| `AbstractLanguage`        | Unique patterns                            | Custom implementation                    |

**Entry point**: `lib/n2words.js` - imports, type definitions, converter factory, exports (all alphabetically sorted)

**File naming**:

- Language: `lib/languages/{code}.js` (e.g., `en.js`, `zh-Hans.js`)
- Fixture: `test/fixtures/languages/{code}.js`

## Adding a Language

1. Run `npm run lang:add <code>` - scaffolds files and updates n2words.js
2. Edit `lib/languages/{code}.js` - implement required properties/methods
3. Edit `test/fixtures/languages/{code}.js` - add test cases
4. Run `npm test` - verify all tests pass

**Base class requirements**:

- **ScaleLanguage**: `onesWords`, `teensWords`, `tensWords`, `hundredWord`/`hundredsWords`, `scaleWords`. For compound scale (long scale), add `useCompoundScale = true`, `thousandWord`, and override `pluralizeScaleWord()`. For inflection (Slavic/Baltic), add `pluralForms`, `onesFeminineWords`, and optionally `scaleGenders`.
- **HebrewLanguage**: `onesWords`, `teensWords`, `twentiesWords`, `hundredsWords`, `pluralForms`, `scale`, `scalePlural`
- **SouthAsianLanguage**: `belowHundredWords` (100 entries) + `scaleWords`
- **AbstractLanguage**: Implement `integerToWords()` from scratch

## Options Pattern

Languages with options need:

1. Constructor with `this.setOptions(defaults, options)`
2. Typedef in `lib/n2words.js` (alphabetically sorted)
3. Type annotation on converter: `/** @type {(value: NumericValue, options?: MyOptions) => string} */`
4. Test cases with options in fixture file

## Validation Checklist

The test suite (`npm test`) validates:

- IETF BCP 47 naming
- Class structure and inheritance
- Required properties/methods
- Registration in n2words.js (import, converter, export)
- Test fixture exists
- Alphabetical ordering in n2words.js

## Reference Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed patterns, examples, edge cases
- [scripts/README.md](scripts/README.md) - Script usage details
- [bench/README.md](bench/README.md) - Benchmarking guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup, PR process, code style

---

**Version**: 2.0.0 | **52 languages** | [GitHub](https://github.com/forzagreen/n2words)
