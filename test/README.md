# Test Suite

## Test Responsibilities

Each test file has a focused responsibility. This prevents overlap and ensures clear coverage.

| Test File                                     | Tests                                         | Does NOT Test          |
| --------------------------------------------- | --------------------------------------------- | ---------------------- |
| `unit/utils/*.test.js`                        | Utility functions in isolation                | Conversion logic       |
| `unit/api.test.js`                            | Module structure, exports, alphabetical order | Conversion correctness |
| `integration/languages.test.js`               | Language implementations via fixtures         | API-layer validation   |
| `integration/commonjs-compatibility.test.cjs` | CJS require() pattern works                   | Conversion correctness |
| `types/n2words.test-d.ts`                     | TypeScript type declarations                  | Runtime behavior       |
| `umd/umd-build.test.js`                       | Bundle structure, exports, source maps        | Conversion correctness |
| `browsers/browsers.test.js`                   | UMD bundle loads in browsers                  | Conversion correctness |

### Conversion Correctness

All conversion correctness testing is centralized in `integration/languages.test.js` using fixtures from `fixtures/languages/`. Other tests verify their specific layer works correctly without duplicating conversion tests.

## Test Organization

```text
test/
├── unit/
│   ├── utils/         # Utility unit tests
│   └── api.test.js    # Public API tests
├── integration/       # Integration tests using language fixtures
├── umd/               # UMD bundle validation
├── types/             # TypeScript declaration tests (tsd)
├── browsers/          # Browser tests (Playwright)
├── fixtures/
│   └── languages/     # Test data per language
└── utils/             # Shared test utilities
```

### Unit Tests (`test/unit/`)

**Utilities** (`test/unit/utils/`):

- `parse-numeric.test.js` - Input parsing, validation, scientific notation
- `is-plain-object.test.js` - Plain object detection utility

**API** (`test/unit/`):

- `api.test.js` - Converter exports, options, module structure

### Integration Tests (`test/integration/`)

- `languages.test.js` - Language-specific tests using fixtures

### UMD Tests (`test/umd/`)

- `umd-build.test.js` - Bundle structure, exports, source maps

### Type Tests (`test/types/`)

- `n2words.test-d.ts` - Type declaration tests using tsd

### Browser Tests (`test/browsers/`)

- `browsers.test.js` - Multi-browser testing (Chromium, Firefox, WebKit)

### Test Utilities (`test/utils/`)

Shared utilities used by tests and scripts:

- `language-helpers.js` - Language file/module inspection utilities
- `language-naming.js` - CLDR/BCP 47 naming conventions
- `stringify.js` - Safe stringification for test output

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
// test/unit/utils/example.test.js
import test from 'ava'
import { someUtility } from '../../../lib/utils/some-utility.js'

test('handles expected input', t => {
  t.is(someUtility(42), 'expected result')
})

test('throws on invalid input', t => {
  t.throws(() => someUtility(null), { instanceOf: TypeError })
})
```

### Type Test Pattern

```typescript
import { expectType } from 'tsd'
import { en, ar, zhHans } from '../../lib/n2words.js'

expectType<string>(en(42))
expectType<string>(ar(42, { gender: 'feminine' }))
expectType<string>(zhHans(42, { formal: true }))
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
