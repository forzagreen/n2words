# Test Suite Documentation

Comprehensive testing guide for the n2words project.

## Table of Contents

- [Test Organization](#test-organization)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Patterns](#test-patterns)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Test Organization

The test suite is organized into four categories:

```text
test/
├── unit/              # Unit tests for base classes and utilities
├── integration/       # Integration tests using language fixtures
├── types/             # TypeScript type declaration tests
├── web/               # Browser compatibility tests (Playwright)
└── fixtures/          # Test data for language converters
    └── languages/     # One fixture file per language
```

### Unit Tests (`test/unit/`)

Test individual classes and methods in isolation:

- **`abstract-language.test.js`** - Base class functionality
- **`api.test.js`** - Public API and input validation
- **`greedy-scale-language.test.js`** - Scale-based decomposition
- **`slavic-language.test.js`** - Slavic pluralization patterns
- **`south-asian-language.test.js`** - Indian numbering system
- **`turkic-language.test.js`** - Turkish-style implicit "bir"

### Integration Tests (`test/integration/`)

Test complete conversion workflows and module compatibility:

- **`languages.test.js`** - Comprehensive language-specific tests using fixtures
- **`umd-build.test.js`** - UMD bundle validation (structure, exports, functionality)
- **`commonjs-compatibility.test.cjs`** - CommonJS import compatibility

Each language has a corresponding fixture file in `test/fixtures/languages/`.

### Type Tests (`test/types/`)

Validate TypeScript declarations:

- **`n2words.test-d.ts`** - Type declaration tests using tsd

### Web Tests (`test/web/`)

Browser compatibility tests using Playwright:

- **`browsers.test.js`** - Multi-browser testing (Chromium, Firefox, WebKit)
- **`test-runner.html`** - HTML test runner for browser tests

## Running Tests

### All Tests

```bash
npm test                    # Run all tests (validation + unit + integration + types)
npm run test:all            # Include browser tests
```

### Specific Test Categories

```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:types          # TypeScript type tests only
npm run test:web            # Browser tests only (requires build first)
```

### With Coverage

```bash
npm run coverage            # Run tests with code coverage report
```

### Watch Mode

```bash
npx ava --watch             # Run tests in watch mode
```

## Writing Tests

### Unit Test Pattern

```javascript
import test from 'ava'
import { ClassName } from '../../lib/classes/class-name.js'

/**
 * Unit Tests for ClassName
 *
 * Brief description of what this test suite covers
 */

// Create test implementation if testing abstract class
class TestClass extends ClassName {
  // Implement required abstract methods
}

test('descriptive test name', t => {
  const instance = new TestClass()
  t.is(instance.method(), 'expected')
})
```

### Integration Test Pattern

Add test cases to `test/fixtures/languages/{code}.js`:

```javascript
export default [
  // [input, expectedOutput]
  [0, 'zero'],
  [42, 'forty-two'],

  // [input, expectedOutput, options]
  [1, 'feminine form', { gender: 'feminine' }],

  // BigInt literals
  [1000000n, 'one million'],

  // Edge cases
  [-42, 'minus forty-two'],
  [3.14, 'three point fourteen']
]
```

### Type Test Pattern

Add to `test/types/n2words.test-d.ts`:

```typescript
import { expectType, expectError } from 'tsd'
import { ConverterName } from '../../lib/n2words.js'

// Valid usage
expectType<string>(ConverterName(42))
expectType<string>(ConverterName(42, { option: 'value' }))

// Invalid usage should error
expectError(ConverterName(null))
expectError(ConverterName(42, { invalidOption: true }))
```

## Test Patterns

### Testing Abstract Classes

Create a concrete test implementation:

```javascript
class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  zeroWord = 'zero'
  decimalSeparatorWord = 'point'

  integerToWords (n) {
    return `number-${n}`
  }
}
```

### Testing Options

```javascript
test('constructor accepts gender option', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.options.gender, 'feminine')
})

test('options affect output', t => {
  const masc = converter(1, { gender: 'masculine' })
  const fem = converter(1, { gender: 'feminine' })
  t.not(masc, fem)
})
```

### Testing Edge Cases

Always test:

- Zero (`0`, `0n`, `'0'`)
- Negative numbers (`-1`, `-42`)
- Decimals (`3.14`, `0.5`)
- BigInt values (`1000000n`)
- String input (`'42'`, `' 42 '`)
- Invalid input (should throw)

### Testing Error Conditions

```javascript
test('throws on invalid input', t => {
  const error = t.throws(() => converter(null), { instanceOf: TypeError })
  t.is(error.message, 'Expected error message')
})
```

## Coverage

### Viewing Coverage

```bash
npm run coverage            # Generate coverage report
open coverage/index.html    # Open HTML report (macOS)
```

### Coverage Configuration

Configuration in `package.json`:

```json
{
  "c8": {
    "all": true,
    "include": ["lib/"],
    "reporter": ["lcov", "text"]
  }
}
```

### Coverage Goals

- **Lines**: >95%
- **Branches**: >90%
- **Functions**: >95%
- **Statements**: >95%

## Troubleshooting

### Browser Tests Fail

**Problem**: `npx playwright install` not run

**Solution**:

```bash
npm run playwright:install
npm run test:web
```

### Type Tests Fail

**Problem**: TypeScript declarations not generated

**Solution**:

```bash
npm run build:types
npm run test:types
```

### Tests Timeout

**Problem**: Tests take too long on slow machines

**Solution**: Increase timeout in `package.json`:

```json
{
  "ava": {
    "timeout": "60s"
  }
}
```

### Coverage Not Generated

**Problem**: c8 not installed or coverage directory missing

**Solution**:

```bash
npm ci
npm run coverage
```

## Best Practices

### ✅ Do

- Write descriptive test names
- Test both happy path and edge cases
- Use appropriate assertions (`t.is`, `t.deepEqual`, `t.throws`)
- Group related tests with comments
- Add JSDoc headers to test files
- Test error messages, not just that errors are thrown

### ❌ Don't

- Write tests that depend on other tests
- Use magic numbers without explanation
- Skip edge case testing
- Test implementation details (test behavior)
- Commit coverage artifacts

## Continuous Integration

All tests run automatically on:

- Every push to `master`, `main`, `develop`, or version branches
- Every pull request
- Before publishing to npm (via tag)

CI runs tests on:

- **Node.js**: 20, 22, 24, 25
- **OS**: Ubuntu (all versions), Windows (LTS), macOS (LTS)
- **Browsers**: Chromium, Firefox, WebKit (Ubuntu only)

## Performance Testing

Performance tests are separate from the main test suite:

```bash
npm run bench:perf          # Performance benchmarks
npm run bench:memory        # Memory usage benchmarks
```

See [bench/README.md](../bench/README.md) for details.

## Contributing

When adding a new language:

1. Create fixture file: `test/fixtures/languages/{code}.js`
2. Add comprehensive test cases (50-200 cases recommended)
3. Run tests: `npm test`
4. Verify coverage: `npm run coverage`

See [CLAUDE.md](../CLAUDE.md) for complete contribution guidelines.
