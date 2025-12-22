# Contributing

This guide covers adding new languages and improving existing ones.

## Quick Start

```bash
npm run lang:add    # Automated language setup
npm run lang:validate xx  # Validate implementation
```

The automated script generates:

- `lib/languages/xx.js` - Implementation template
- `test/fixtures/languages/xx.js` - Test fixtures
- Updated `lib/n2words.js` - Language registration

**Then complete:**

1. Fill `scaleWordPairs` array with BigInt literals (`1000n`)
2. Implement `mergeScales()` method for grammar rules
3. Add comprehensive test cases

**Resources:**

- [LANGUAGE_GUIDE.md](./guides/LANGUAGE_GUIDE.md) - Implementation guide
- [BIGINT-GUIDE.md](./guides/BIGINT-GUIDE.md) - BigInt usage guide

## Manual Implementation

### 1. Create Language File (`lib/languages/xx.js`)

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

export class XxLanguage extends GreedyScaleLanguage {
  // Class properties for defaults
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  // CRITICAL: Use BigInt literals (n suffix)
  scaleWordPairs = [
    [1_000_000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [1n, 'one'],
    [0n, 'zero']
  ]

  // Constructor only for behavior options (optional)
  constructor(options = {}) {
    super()
    const { option = false } = options
    this.option = option
  }

  // Language-specific grammar rules
  mergeScales(left, right) {
    const leftWord = Object.keys(left)[0]
    const rightWord = Object.keys(right)[0]
    return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
  }
}

```

### 2. Choose Base Class

- **GreedyScaleLanguage** - Most languages (en, es, fr, de, it, pt, nl, ko, hu, zh, etc.)
- **SlavicLanguage** - Three-form pluralization (ru, cz, pl, uk, sr, hr, he, lt, lv)
- **TurkicLanguage** - Space-separated patterns (tr, az)
- **SouthAsianLanguage** - Indian-style grouping (hi, bn, ur, pa, mr, gu, kn)
- **AbstractLanguage** - Custom implementations (ar, fa, id, ro, vi)

### 3. Register Language (`lib/n2words.js`)

```javascript
// Add import
import xx from './languages/xx.js'

// Add to dict mapping
const dict = {
  // ... existing entries
  xx
}
```

### 4. Add Test Fixtures (`test/fixtures/languages/xx.js`)

```javascript
export default [
  [0, 'zero'],
  [42, 'forty-two'],
  [123456, 'one hundred twenty-three thousand four hundred fifty-six'],
  // Add comprehensive test cases
]
```

## Testing & Validation

```bash
npm run lang:validate xx  # Validate specific language
npm test                  # Run all tests
npm run lint             # Check code style
npm run web:build        # Build browser bundle
```

## Pull Request Checklist

- [ ] Language file created in `lib/languages/xx.js`
- [ ] Language registered in `lib/n2words.js` (import + dict entry)
- [ ] Test fixtures added to `test/fixtures/languages/xx.js`
- [ ] All tests pass (`npm test`)
- [ ] Code style passes (`npm run lint`)
- [ ] Language validation passes (`npm run lang:validate xx`)
- [ ] Regional variants handle fallback correctly (if applicable)

**Questions?** Open an issue for help or examples.
