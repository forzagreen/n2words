# Developer Guide

This guide covers development workflows, testing, and architecture for the n2words codebase.

## Contents

1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing](#testing)
5. [Language Implementation](#language-implementation)
6. [Performance & Debugging](#performance--debugging)

## Setup

**Prerequisites:** Node.js `^20 || ^22 || >=24`, npm v8+

```bash
git clone https://github.com/forzagreen/n2words.git
cd n2words
npm install
npm test  # Verify setup
```

## Project Structure

```text
n2words/
├── lib/
│   ├── n2words.js              # Main entry & language registry
│   ├── classes/                # Base classes
│   │   ├── abstract-language.js
│   │   ├── greedy-scale-language.js  # Most languages
│   │   ├── slavic-language.js        # Slavic/Baltic
│   │   ├── turkic-language.js        # Turkish, Azerbaijani
│   │   └── south-asian-language.js   # Indian grouping
│   └── languages/              # 47 language implementations
├── test/
│   ├── unit/                   # Core API tests
│   ├── integration/            # Language & coverage tests
│   ├── typescript/             # TS validation
│   ├── web/                    # Browser tests
│   └── fixtures/languages/     # Test data files
├── guides/                     # Documentation
├── examples/                   # Usage examples
├── scripts/                    # Development tools
├── dist/                       # Browser builds (generated)
└── typings/                    # TS definitions (generated)
```

### Architecture

**Flow:** `Input → n2words() → Language Registry → Language Class → Output`

**Base Classes:**

- `AbstractLanguage` - Core validation & decimal handling
- `GreedyScaleLanguage` - Scale-based conversion (25 languages)
- `SlavicLanguage` - Three-form pluralization (11 languages)
- `TurkicLanguage` - Space-separated patterns (2 languages)
- `SouthAsianLanguage` - Indian-style grouping (7 languages)

## Development Workflow

### Language Implementation Concepts

**Class Properties (Defaults):** Use class properties for language defaults:

```javascript
export default class EnglishLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  scaleWordPairs = [[1n, 'one'], [1000n, 'thousand'], ...]
}
```

**Constructor Parameters:** Only for behavior-changing options:

```javascript
constructor(options = {}) {
  options = {
    ...{
      genderStem: 'o'
    },
    ...options
  }

  super()
  this.genderStem = options.genderStem  // Affects behavior
}
```

**BigInt Literals:** Always use `1000n` not `1000` for scale values

### Workflow Steps

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes & test frequently
npm test                 # All tests
npm run lint             # Code style

# 3. Build & test
npm run web:build        # Browser bundle
npm run web:test         # Browser tests

# 4. Generate types & validate
npm run types:build      # Generate TypeScript definitions
npm run types:validate   # TypeScript validation

# 5. Submit
git push origin feature/my-feature
```

### Code Standards

- **ESM modules:** `export default`, not `module.exports`
- **Linting:** Standard.js (auto-fix with `npm run lint:js -- --fix`)
- **BigInt:** Use `1000n` literals for large numbers
- **Zero dependencies:** No external dependencies allowed

## Testing

### Test Commands

| Command                      | Purpose                      |
|------------------------------|------------------------------|
| `npm test`                   | All unit & integration tests |
| `npm run test:unit`          | Core API tests               |
| `npm run test:integration`   | Language & coverage tests    |
| `npm run types:validate`     | TypeScript validation        |
| `npm run web:test`           | Browser compatibility        |
| `npm run coverage:generate`  | Coverage report              |

### Writing Tests

**Unit Test:**

```javascript
// test/unit/my-feature.js
import test from 'ava'
import n2words from '../../lib/n2words.js'

test('converts number correctly', t => {
  t.is(n2words(42, { lang: 'en' }), 'forty-two')
})
```

**Language Fixture:**

```javascript
// test/fixtures/languages/en.js
export default [
  [0, 'zero'],
  [42, 'forty-two'],
  [123456, 'one hundred and twenty-three thousand, four hundred and fifty-six']
]
```

## Language Implementation

### Quick Start

```bash
npm run lang:add    # Automated setup
npm run lang:validate xx  # Validate implementation
```

### Manual Implementation

1. **Choose Base Class:**
   - `GreedyScaleLanguage` - Most languages (scale-based)
   - `SlavicLanguage` - Slavic/Baltic (three-form pluralization)
   - `TurkicLanguage` - Turkish, Azerbaijani (space patterns)
   - `SouthAsianLanguage` - Indian grouping (Hindi, Bengali, etc.)
   - `AbstractLanguage` - Custom implementations (rare)

2. **Create Language File** (`lib/languages/xx.js`):

```javascript
import GreedyScaleLanguage from '../classes/greedy-scale-language.js'

export default class GermanLanguage extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'Komma'
  zeroWord = 'null'
  scaleWordPairs = [[1n, 'eins'], [2n, 'zwei'], ...]

  // Constructor only for behavior options (optional)
  constructor(options = {}) {
    options = {
      ...{
        option: false
      },
      ...options
    }

    super()
    this.option = options.option
  }

  mergeScales(left, right) {
    // Language-specific grammar rules
    return right ? `${left} ${right}` : left
  }
}

```

1. **Add Test Fixtures** (`test/fixtures/languages/xx.js`):

```javascript
export default [
  [0, 'null'],
  [42, 'zweiundvierzig'],
  // Comprehensive test cases
]
```

1. **Register Language** in `lib/n2words.js`:

```javascript
import xx from './languages/xx.js'
const dict = { en: en, xx: xx, ... }
```

See [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md) for comprehensive guidance.

## Performance & Debugging

### Performance Tools

```bash
npm run bench:perf    # Operations per second
npm run bench:memory  # Memory profiling
```

### Optimization Patterns

**Cache Regex:** Create once, use many times

```javascript
const CLEAN_REGEX = /\s+/g

class MyLanguage extends GreedyScaleLanguage {
  convertToWords(value) {
    // Implementation here
    return result.replace(CLEAN_REGEX, ' ')  // ✅
    // return result.replace(/\s+/g, ' ')    // ❌ Creates new regex each call
  }
}
```

**Early Returns:** Avoid unnecessary work

```javascript
class MyLanguage extends GreedyScaleLanguage {
  mergeScales(left, right) {
    if (!right) return left        // ✅ Early return
    return `${left} ${right}`
  }
}
```

**Zero Dependencies:** No external packages (intentional design)

### Debugging Tips

**Print Intermediate Values:**

```javascript
class MyLanguage extends GreedyScaleLanguage {
  convertToWords(value) {
    console.log('Input:', value)
    const result = super.convertToWords(value)
    console.log('Result:', result)
    return result
  }
}
```

**Test Specific Cases:**

```javascript
import { English } from './lib/languages/en.js'
console.log(English(0))     // Zero handling
console.log(English(1000))  // Scale words
console.log(English('3.14')) // Decimals
```

**Coverage Gaps:**

```bash
npm run coverage:generate
open coverage/index.html  # View uncovered lines
```

---

**Resources:**

- [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md) - Implementation guide
- [LANGUAGE_OPTIONS.md](LANGUAGE_OPTIONS.md) - User options
- [TYPESCRIPT_GUIDE.md](TYPESCRIPT_GUIDE.md) - TypeScript usage
- [GitHub Issues](https://github.com/forzagreen/n2words/issues) - Support
