# Test Suite

## Test Organization

```text
test/
├── unit/              # Unit tests for base classes and utilities
├── integration/       # Integration tests using language fixtures
├── umd/               # UMD bundle validation
├── types/             # TypeScript declaration tests (tsd)
├── browsers/          # Browser tests (Playwright)
└── fixtures/
    └── languages/     # Test data per language
```

### Unit Tests (`test/unit/`)

- `abstract-language.test.js` - Base class functionality, sign/decimal handling
- `api.test.js` - Public API, input validation, module structure
- `greedy-scale-language.test.js` - Scale-based decomposition algorithm
- `segment-utils.test.js` - Number segmentation utilities
- `slavic-language.test.js` - Slavic pluralization patterns
- `south-asian-language.test.js` - Indian numbering system (lakh/crore)
- `turkic-language.test.js` - Turkish-style implicit "bir" rules

### Integration Tests (`test/integration/`)

- `languages.test.js` - Language-specific tests using fixtures

### UMD Tests (`test/umd/`)

- `umd-build.test.js` - Bundle structure, exports, source maps

### Type Tests (`test/types/`)

- `n2words.test-d.ts` - Type declaration tests using tsd

### Browser Tests (`test/browsers/`)

- `browsers.test.js` - Multi-browser testing (Chromium, Firefox, WebKit)

## Running Tests

```bash
npm test                    # Core tests (unit + integration)
npm run test:all            # Full suite (core + types + build + browser)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:umd            # UMD bundle tests (builds first)
npm run test:types          # TypeScript declaration tests (builds first)
npm run test:exports        # Package exports validation
npm run test:browsers       # Browser tests (builds first)
npm run coverage            # Tests with coverage report
npx ava --watch             # Watch mode
```

## Writing Tests

### Test Fixture Format

```javascript
// test/fixtures/languages/{code}.js
export default [
  [0, 'zero'],                              // [input, expected]
  [42, 'forty-two'],
  [-1, 'minus one'],
  [3.14, 'three point one four'],
  [1000000n, 'one million'],                // BigInt
  [1, 'una', { gender: 'feminine' }]        // With options
]
```

### Unit Test Pattern

```javascript
import test from 'ava'
import { AbstractLanguage } from '../../lib/classes/abstract-language.js'

class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'
  integerToWords(n) { return n === 0n ? this.zeroWord : String(n) }
}

test('handles negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 42n), 'minus 42')
})
```

### Type Test Pattern

```typescript
import { expectType, expectError } from 'tsd'
import { EnglishConverter, ArabicConverter } from '../../lib/n2words.js'

expectType<string>(EnglishConverter(42))
expectType<string>(ArabicConverter(42, { gender: 'feminine' }))
expectError(EnglishConverter(null))
```

## Test Coverage

### Always Test

- Zero (`0`, `0n`, `'0'`)
- Negative numbers (`-1`, `-42`)
- Decimals (`3.14`, `0.5`)
- BigInt values (`1000000n`)
- String input (`'42'`, `' 42 '`)
- Invalid input (should throw)
- All option combinations (for languages with options)

### Generating Coverage Reports

```bash
npm run coverage
# Reports in coverage/ directory
```

## Adding a New Language

1. Create fixture: `test/fixtures/languages/{code}.js`
2. Add comprehensive test cases (50-200 recommended)
3. Run tests: `npm test`
4. Verify coverage: `npm run coverage`

See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete guidelines.
