# Developer Guide

Welcome to the n2words development guide! This document covers everything you need to know to work on the n2words codebase, including setup, architecture, testing, and contributing guidelines.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Building](#building)
7. [Code Style & Conventions](#code-style--conventions)
8. [Language Implementation](#language-implementation)
9. [Performance Optimization](#performance-optimization)
10. [Debugging Tips](#debugging-tips)

## Getting Started

### Prerequisites

- **Node.js** `^20 || ^22 || >=24` (as specified in package.json)
- **npm** v8+ (comes with Node.js)
- **Git** for version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/forzagreen/n2words.git
cd n2words

# Install dependencies
npm install

# Verify installation
npm test
```

### Verify Your Setup

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:smoke         # Smoke tests (all 38 languages)
npm run test:i18n          # Language-specific tests

# Check code quality
npm run lint               # Lint JS and Markdown
npm run lint:js            # Lint JS only
npm run lint:md            # Lint Markdown only

# Build outputs
npm run build              # Build browser bundle and types
npm run build:web          # Webpack bundle
npm run build:types        # TypeScript definitions
```

If all tests pass, you're ready to develop!

## Project Structure

```text
n2words/
├── lib/                          # Source code (ESM modules)
│   ├── n2words.js               # Main entry point & language registry
│   ├── classes/                 # Base classes for language implementations
│   │   ├── abstract-language.js # Core base class
│   │   ├── greedy-scale-language.js
│   │   ├── slavic-language.js   # For Slavic/Baltic languages
│   │   └── turkic-language.js   # For Turkic languages
│   └── i18n/                    # Language implementations (38 total)
│       ├── en.js, es.js, fr.js, ... (one per language)
│
├── test/                         # Test files
│   ├── unit/                    # Unit tests (API, validation, errors)
│   ├── integration/             # Integration tests (coverage gaps)
│   ├── smoke/                   # Sanity tests (all 38 languages)
│   ├── i18n/                    # Language-specific test fixtures
│   │   └── *.js (one per language)
│   ├── web/                     # Browser testing resources
│   ├── i18n.js                  # Main i18n test runner
│   ├── typescript-smoke.ts      # TypeScript validation
│   └── web.js                   # Browser compatibility tests
│
├── typings/                     # TypeScript definitions (auto-generated)
│   ├── n2words.d.ts
│   ├── classes/
│   └── i18n/
│
├── scripts/                     # Development utilities
│   ├── add-language.js          # Generate language boilerplate
│   └── validate-language.js     # Validate language implementation
│
├── examples/                    # Usage examples
│   ├── typescript.ts            # TypeScript examples
│   └── node-dynamic-import.js   # Node.js dynamic import example
│
├── dist/                        # Browser builds (generated)
├── docs/                        # JSDoc output (generated)
├── coverage/                    # Test coverage (generated)
│
├── package.json                 # Project metadata and scripts
├── tsconfig.json                # TypeScript configuration
├── webpack.config.js            # Webpack configuration for browser build
├── conf.json                    # JSDoc configuration
│
├── README.md                    # Quick start and overview
├── CONTRIBUTING.md              # Contributing guidelines
├── LANGUAGE_GUIDE.md            # Guide for implementing languages
├── LANGUAGE_OPTIONS.md          # Language-specific options
├── TYPESCRIPT_GUIDE.md          # TypeScript usage guide
├── BIGINT-GUIDE.md              # BigInt usage details
└── .github/copilot-instructions.md  # AI agent guidance
```

## Architecture Overview

### Core Design

**n2words** converts numbers to words using a modular, language-specific architecture:

```text
User Input (number/string/bigint)
    ↓
n2words() [lib/n2words.js]
    ↓
Language Registry Lookup
    ↓
Language Implementation [lib/i18n/*.js]
    ↓
Output (string)
```

### Class Hierarchy

n2words uses inheritance to share common patterns:

```text
AbstractLanguage (core validation & decimal handling)
    ↓
    ├─→ GreedyScaleLanguage (23 languages)
    │   ├── English, Spanish, French, German, Italian, Portuguese,
    │   ├── Dutch, Korean, Hungarian, Chinese, and more
    │   └── Uses "highest-matching-scale" algorithm
    │
    ├─→ SlavicLanguage (9 languages)
    │   ├── Russian, Czech, Polish, Ukrainian, Serbian, Croatian,
    │   ├── Hebrew, Lithuanian, Latvian
    │   └── Implements three-form pluralization
    │
    ├─→ TurkicLanguage (2 languages)
    │   ├── Turkish, Azerbaijani
    │   └── Implements space-separated patterns
    │
    └─→ SouthAsianLanguage (4 languages)
        ├── Hindi, Bengali, Urdu, Punjabi
        └── Implements Indian-style digit grouping
```

### Key Concepts

#### 1. Class Properties (Defaults)

Every language defines default values as **class properties**:

```javascript
export default class EnglishLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'      // How to represent negative numbers
  decimalSeparatorWord = 'point'     // Decimal separator word
  zeroWord = 'zero'               // How to represent zero
  scaleWordPairs = [                   // Number-to-word mapping
    [0n, 'zero'],
    [1n, 'one'],
    [2n, 'two'],
    // ... up to largest supported number
  ]
  // Additional language-specific properties...
}
```

#### 2. Constructor Parameters (Behavior Options)

Only behavior-changing options are constructor parameters:

```javascript
export default class SpanishLanguage extends GreedyScaleLanguage {
  // Constructor accepts ONLY options that affect behavior
  constructor({ genderStem = 'one' } = {}) {
    super()
    this.genderStem = genderStem  // Affects merge behavior
  }
  // Class properties for defaults...
}
```

**NOT** all class properties should be in the constructor. Only those that change behavior.

#### 3. Merge Function

Each language implements `mergeScales()` to handle grammar rules:

```javascript
mergeScales(leftWordSet, rightWordSet) {
  // Combine two number groups with language-specific grammar
  // Examples:
  // English: "one hundred" + "twenty-three" → "one hundred and twenty-three"
  // Spanish: "ciento" + "veintitrés" → "ciento veintitrés"
  // French:  "cent" + "quarante-deux" → "cent quarante-deux"
}
```

### Input Processing

```javascript
convertToWords(value, options = {})
```

1. **Validation** - Check input is number, string, or bigint
2. **Parsing** - Convert to BigInt and decimal parts
3. **Conversion** - Recursively convert whole number part
4. **Decimal Handling** - Convert decimal digits or read as groups
5. **Assembly** - Join whole and decimal parts

## Development Workflow

### 1. Start a New Feature Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Keep synchronized with main
git fetch origin
git rebase origin/main
```

### 2. Make Changes

Edit files in the `lib/` or `test/` directories:

```bash
# lib/ - Source code
# test/ - Tests (must have corresponding tests!)
```

### 3. Run Tests While Developing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:unit
npm run test:i18n
npm run test:smoke

# Run tests in watch mode (if needed)
npm test -- --watch
```

### 4. Check Code Quality

```bash
# Lint code
npm run lint

# Auto-fix some lint issues
npm run lint:fix
```

### 5. Build & Verify

```bash
# Build browser bundle and TypeScript definitions
npm run build

# Check TypeScript definitions
npm run test:types
```

### 6. Create a Pull Request

```bash
# Push your feature branch
git push origin feature/your-feature-name

# Open PR on GitHub
```

## Testing

### Test Organization

| Folder | Purpose | Run With |
| --- | --- | --- |
| `test/unit/` | Core API, errors, validation | `npm run test:unit` |
| `test/integration/` | Targeted coverage for complex code paths | `npm run test:integration` |
| `test/smoke/` | Sanity check all 38 languages | `npm run test:smoke` |
| `test/i18n/` | Language-specific fixtures & expected outputs | `npm run test:i18n` |
| `test/web/` | Browser compatibility | `npm run test:web` |
| `test/typescript-smoke.ts` | TypeScript validation | `npm run test:types` |

### Writing Tests

#### Unit Test Example

```javascript
// test/unit/my-feature.js
import test from 'ava'
import n2words from '../../lib/n2words.js'

test('my feature works correctly', (t) => {
  const result = n2words(42, { lang: 'en' })
  t.is(result, 'forty-two')
})

test('handles edge cases', (t) => {
  const result = n2words(0, { lang: 'en' })
  t.is(result, 'zero')
})
```

#### Language Test Fixture Example

```javascript
// test/i18n/en.js
import test from 'ava'
import en from '../../lib/i18n/en.js'

const fixtures = [
  [0, 'zero'],
  [1, 'one'],
  [42, 'forty-two'],
  [123456789, 'one hundred and twenty-three million, ...'],
  // ... more test cases
]

fixtures.forEach(([input, expected]) => {
  test(`en: ${input} → ${expected}`, (t) => {
    const result = en(input)
    t.is(result, expected)
  })
})
```

### Running Tests with Coverage

```bash
# Generate coverage report
npm run coverage

# View coverage in browser (if available)
open coverage/index.html
```

## Building

### Browser Bundle

```bash
# Build webpack bundle for browsers
npm run build:web

# Output: dist/n2words.js
```

**Uses:**

- Webpack for bundling
- Tree-shaking to exclude unused languages
- Minification for production

### TypeScript Definitions

```bash
# Generate .d.ts files from JSDoc
npm run build:types

# Output: typings/*.d.ts
```

**Notes:**

- Generated from JSDoc comments
- Keep JSDoc comments accurate!
- Only document actual parameters in constructor JSDoc

### Full Build

```bash
npm run build  # Runs both build:web and build:types
```

## Code Style & Conventions

### ESM Modules

All code is **ECMAScript Modules (ESM)**:

```javascript
// ✅ Correct: ESM exports
export default function convertToWords(value, options = {}) {
  return new MyLanguage(options).convertToWords(value)
}

// ❌ Wrong: CommonJS
module.exports = convertToWords
```

### Class Properties for Defaults

```javascript
// ✅ Correct: Use class properties
export default class EnglishLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  scaleWordPairs = [...]
}

// ❌ Wrong: Don't use constructor for class property defaults
constructor() {
  this.negativeWord = 'minus'  // Should be class property
}
```

### BigInt Literals

Always use **BigInt literals** for scale word pair values:

```javascript
// ✅ Correct: BigInt
scaleWordPairs = [
  [1n, 'one'],
  [1_000n, 'thousand'],
  [1_000_000n, 'million'],
]

// ❌ Wrong: Plain numbers (lose precision at large values)
scaleWordPairs = [
  [1, 'one'],
  [1000, 'thousand'],
  [1000000, 'million'],
]
```

### Naming Conventions

- **Functions**: `camelCase` - `convertToWords`, `normalizeInput`
- **Classes**: `PascalCase` - `EnglishLanguage`, `SlavicLanguage`
- **Constants**: `UPPER_SNAKE_CASE` - `MAX_SAFE_INTEGER`
- **Private methods**: Prefix with `_` - `_normalizeCard`

### Linting

```bash
# Check code style (ESLint via Standard)
npm run lint:js

# Auto-fix style issues
npm run lint:fix

# Check Markdown
npm run lint:md
```

Standard is configured; no manual style discussions needed.

## Language Implementation

### Quick Start: Add a Language

```bash
# Automated script generates boilerplate
npm run lang:add

# Follow prompts:
# - Language name: (e.g., "German")
# - Language code: (e.g., "de")
# - Base class: (e.g., "GreedyScaleLanguage")
```

This creates:

- `lib/i18n/de.js` - Implementation
- `test/i18n/de.js` - Test fixtures
- Updated `lib/n2words.js` - Language registration

### Manual Implementation

1. **Choose base class** based on language characteristics:

    - `GreedyScaleLanguage` - Most languages (highest-matching-scale algorithm)
    - `SlavicLanguage` - Slavic/Baltic with 3-form pluralization
    - `TurkicLanguage` - Turkish, Azerbaijani with space-separated patterns
    - `AbstractLanguage` - Custom implementations (rare)

2. **Implement language file** (`lib/i18n/xx.js`):

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

export default class GermanLanguage extends GreedyScaleLanguage {
  // Class properties for defaults
  negativeWord = 'minus'
  decimalSeparatorWord = 'Komma'
  zeroWord = 'null'
  scaleWordPairs = [
    [1n, 'eins'],
    [2n, 'zwei'],
    // ... more pairs
  ]

  // Constructor for behavior-changing options (if needed)
  constructor({ someOption = false } = {}) {
    super()
    this.someOption = someOption
  }

  // Merge language-specific grammar
  mergeScales(left, right) {
    if (left.endsWith('hundert') && right) {
      return `${left} ${right}`
    }
    return right ? `${left}${right}` : left
  }
}

// Export default function
export default function convertToWords(value, options = {}) {
  return new GermanLanguage(options).convertToWords(value)
}
```

1. **Add test fixtures** (`test/i18n/xx.js`):

```javascript
import test from 'ava'
import xx from '../../lib/i18n/xx.js'

const fixtures = [
  [0, 'null'],
  [1, 'eins'],
  [42, 'zweiundvierzig'],
  // ... comprehensive test cases
]

fixtures.forEach(([input, expected]) => {
  test(`xx: ${input}`, (t) => {
    t.is(xx(input), expected)
  })
})
```

1. **Register language** in `lib/n2words.js`:

```javascript
import xx from './i18n/xx.js'
// ... other imports

const dict = {
  en: en,
  xx: xx,
  // ... other languages
}
```

1. **Validate implementation**:

```bash
npm run lang:validate xx

# Checks:
# - File exists
# - Proper exports
# - Test fixtures complete
# - JSDoc accurate
```

1. **Run tests**:

```bash
npm run test:smoke  # Should show ✓ xx
npm run test:i18n   # Should show ✓ xx
```

For detailed guidance, see [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md).

## Performance Optimization

### Profiling

```bash
# Run benchmarks
npm run bench

# Measure memory usage
npm run bench:memory
```

**Output:**

- Operations per second (ops/sec)
- Memory usage statistics
- Comparisons with baseline

### Common Optimizations

#### 1. Cached Regex Patterns

Instead of creating regex in every method call:

```javascript
// ✅ Correct: Cache at class level
const POST_CLEAN_REGEX = /\s+/g

export default class PortugueseLanguage extends GreedyScaleLanguage {
  convertToWords(value) {
    const result = this._convert(value)
    return result.replace(POST_CLEAN_REGEX, ' ')
  }
}

// ❌ Wrong: Recreates regex every call
convertToWords(value) {
  return this._convert(value).replace(/\s+/g, ' ')
}
```

#### 2. Early Returns in Merge

```javascript
// ✅ Correct: Return early
mergeScales(left, right) {
  if (!right) return left
  if (left.endsWith('and')) return `${left} ${right}`
  return `${left}, ${right}`
}

// ❌ Wrong: Unnecessary nested conditions
mergeScales(left, right) {
  if (right) {
    if (left.endsWith('and')) {
      return `${left} ${right}`
    } else {
      return `${left}, ${right}`
    }
  } else {
    return left
  }
}
```

#### 3. Avoid Repeated Object Access

```javascript
// ✅ Correct: Cache object keys
const keys = Object.keys(this.scaleWordPairs)
for (const key of keys) {
  // ... use key
}

// ❌ Wrong: Repeated access
for (const key of Object.keys(this.scaleWordPairs)) {
  // Object.keys() called every iteration
}
```

### Bundle Size

The library supports tree-shaking:

```javascript
// Only English is bundled
import n2words from 'n2words'

// More languages = larger bundle
import { default as en } from 'n2words/i18n/en'
import { default as fr } from 'n2words/i18n/fr'
```

### Zero Dependencies

✅ Intentional design - no external dependencies means:

- Smaller bundle
- Faster installation
- No supply-chain risk
- Maximum compatibility

Do **not** add dependencies without explicit discussion.

## Debugging Tips

### 1. Print Intermediate Values

```javascript
export default class DebugLanguage extends GreedyScaleLanguage {
  convertToWords(value) {
    console.log('Input:', value)
    const result = super.convertToWords(value)
    console.log('Cached whole number:', this.cachedWholeNumber)
    console.log('Result:', result)
    return result
  }

  convertWholePart(wholeNumber) {
    console.log('Converting whole part:', wholeNumber)
    const result = super.convertWholePart(wholeNumber)
    console.log('Whole part result:', result)
    return result
  }
}
```

### 2. Use Node Debugger

```bash
# Run with debugger
node --inspect-brk lib/i18n/en.js

# Open chrome://inspect in Chrome
```

### 3. Test Specific Values

```javascript
import en from './lib/i18n/en.js'

console.log(en(0))           // Debug zero handling
console.log(en(42))          // Debug basic number
console.log(en(1000))        // Debug scale words
console.log(en('3.14'))      // Debug decimals
console.log(en(123456789n))  // Debug BigInt
console.log(en(-42))         // Debug negative
```

### 4. Check Class Properties

```javascript
import English from './lib/classes/greedy-scale-language.js'

const en = new English()
console.log(en.negativeWord)  // 'minus'
console.log(en.decimalSeparatorWord) // 'point'
console.log(en.zeroWord)          // 'zero'
console.log(en.scaleWordPairs.length)  // Number of scale word pair definitions
```

### 5. Trace Merge Calls

```javascript
mergeScales(left, right) {
  const result = super.mergeScales(left, right)
  console.log(`mergeScales("${left}", "${right}") → "${result}"`)
  return result
}
```

### 6. Test Coverage Gaps

```bash
# Generate coverage report
npm run coverage

# View which lines aren't covered
open coverage/index.html
```

## Resources

- **[README.md](README.md)** - Quick start and feature overview
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - PR guidelines and workflow
- **[LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md)** - Comprehensive language implementation guide
- **[LANGUAGE_OPTIONS.md](LANGUAGE_OPTIONS.md)** - Language-specific options
- **[TYPESCRIPT_GUIDE.md](TYPESCRIPT_GUIDE.md)** - TypeScript usage
- **[BIGINT-GUIDE.md](BIGINT-GUIDE.md)** - BigInt usage details
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI agent guidance

## Questions?

- Check [GitHub Issues](https://github.com/forzagreen/n2words/issues)
- Review existing language implementations for patterns
- Consult test files for usage examples
- Open a discussion on GitHub

---

**Happy coding!** 🚀
