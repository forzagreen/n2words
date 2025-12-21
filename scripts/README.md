# Scripts

Utility scripts for maintaining and extending n2words.

## add-language.js

Interactive script to generate boilerplate for new language implementations.

```bash
npm run lang:add
```

**Generates:**

- `lib/languages/xx.js` - Implementation template
- `test/fixtures/languages/xx.js` - Test fixtures
- Updates `lib/n2words.js` - Import and registration

**Base Class Selection:**

- **GreedyScaleLanguage** - Most languages (en, es, fr, de, it, etc.)
- **SlavicLanguage** - Slavic/Baltic (ru, pl, cs, uk, he, lt, lv)
- **TurkicLanguage** - Turkic languages (tr, az)
- **SouthAsianLanguage** - Indian grouping (hi, bn, ur, pa, mr, gu, kn)
- **AbstractLanguage** - Custom implementations (ar, vi, ro, etc.)

**Next Steps:**

- **GreedyScaleLanguage/TurkicLanguage:** Fill `scaleWordPairs` with BigInt literals (`1000n`), implement `mergeScales()`
- **SlavicLanguage:** Fill core maps (`ones`, `tens`, `hundreds`, `thousands`), handle pluralization
- **SouthAsianLanguage:** Fill `belowHundred` (0-99), set `hundredWord`, define `scaleWords` (lakh, crore)
- **AbstractLanguage:** Implement custom `convertWholePart()` method
- Complete test cases with expected outputs
- Run `npm run lang:validate xx`

## validate-language.js

Validates language implementations for completeness and best practices.

```bash
npm run lang:validate xx    # Specific language
npm run lang:validate       # All languages
```

**Validation Checks:**

- ✅ IETF BCP 47 language code format
- ✅ File structure and exports
- ✅ BigInt literals in number definitions
- ✅ Required methods (`mergeScales()` or `convertWholePart()`)
- ✅ Base class inheritance
- ✅ Test coverage (20+ cases recommended)
- ✅ Registration in `lib/n2words.js`
- ✅ Runtime functionality (smoke test)
- ⚠️  Warnings for TODOs or thin coverage

**Exit Codes:** `0` = passed, `1` = failed

## Workflow

```bash
# Add new language
npm run lang:add
# Edit lib/languages/xx.js and test/fixtures/languages/xx.js
npm run lang:validate xx
npm test
npm run lint

# Validate existing languages
npm run lang:validate        # All languages
npm run lang:validate fr     # Specific language
```

**Resources:**

- [LANGUAGE_GUIDE.md](../guides/LANGUAGE_GUIDE.md) - Implementation guide
- [BIGINT-GUIDE.md](../guides/BIGINT-GUIDE.md) - BigInt usage
- [CONTRIBUTING.md](../CONTRIBUTING.md) - General guidelines
