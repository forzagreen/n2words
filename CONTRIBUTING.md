# Contributing to n2words

Thank you for your interest in contributing to n2words! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding a New Language](#adding-a-new-language)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)

## Getting Started

### Prerequisites

- Node.js (^20 || ^22 || >=24)
- npm, yarn, pnpm, or bun
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/n2words.git
   cd n2words
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run tests to ensure everything is working:

   ```bash
   npm test
   ```

## Adding a New Language

Adding a new language is one of the most valuable contributions you can make! We've created tooling to make this process straightforward.

### Quick Start

The scaffolding tool supports **interactive mode** (recommended) or **command-line mode**:

**Interactive Mode (Recommended):**

```bash
npm run lang:add -- <language-code>

# Example: Add Korean
npm run lang:add -- ko
```

You'll be prompted to select a base class:

- **GreedyScaleLanguage** (default) - Most common, scale-based decomposition
- **SlavicLanguage** - Three-form pluralization (Slavic languages)
- **SouthAsianLanguage** - Indian numbering system (lakh, crore)
- **TurkicLanguage** - Turkish-style implicit "bir" rules
- **AbstractLanguage** - Direct implementation (advanced)

**Command-Line Mode:**

```bash
npm run lang:add -- <language-code> --base=<base-class>

# Examples:
npm run lang:add -- ko                      # Uses default (greedy)
npm run lang:add -- pl --base=slavic        # Polish (SlavicLanguage)
npm run lang:add -- hi --base=south-asian   # Hindi (SouthAsianLanguage)
npm run lang:add -- tr --base=turkic        # Turkish (TurkicLanguage)
```

This will create:

- Language implementation file: `lib/languages/<code>.js`
- Test fixture file: `test/fixtures/languages/<code>.js`
- Automatic registration in `lib/n2words.js` (import, converter, export)

### Implementation Steps

1. **Run the scaffolding tool** as shown above

2. **Implement the language class** in `lib/languages/<code>.js`:
   - Replace placeholder words with actual translations
   - Add complete `scaleWordPairs` array (ordered largest to smallest)
   - Implement `mergeScales()` with language-specific rules
   - Add options if needed (e.g., `gender`, `formal`, custom separators)
   - Add comprehensive JSDoc documentation with examples

3. **Add comprehensive tests** in `test/fixtures/languages/<code>.js`:
   - Cover basic numbers (0-20)
   - Include teens, tens, hundreds
   - Test thousands, millions, billions
   - Add negative numbers and decimals
   - Include BigInt examples
   - Test language-specific options (if applicable)
   - Add edge cases and language-specific features

4. **Validate your implementation**:

   ```bash
   npm run lang:validate -- <code> --verbose
   ```

   The validator checks:
   - IETF BCP 47 naming convention
   - Class structure and inheritance
   - Required properties and methods
   - Scale word ordering (descending)
   - Options pattern (constructor, typedef, type annotations)
   - JSDoc documentation
   - Test fixture exists and is valid
   - Registration in `lib/n2words.js`

5. **Run all tests**:

   ```bash
   npm test
   ```

### Language Naming Convention

Language codes must follow **IETF BCP 47** format:

- Base language: `en`, `fr`, `es` (2-3 lowercase letters)
- With script: `zh-Hans`, `sr-Latn` (language-Script)
- With region: `fr-BE`, `en-US` (language-REGION)

Examples:

- ✓ `en` (English)
- ✓ `zh-Hans` (Simplified Chinese)
- ✓ `fr-BE` (Belgian French)
- ✗ `en_US` (use `en-US`)
- ✗ `chinese` (use `zh-Hans` or `zh-Hant`)

### Adding Language Options

If your language requires options (e.g., gender, formal style), follow this pattern:

1. **Add constructor** in language file:

   ```javascript
   constructor(options = {}) {
     super()
     this.options = this.mergeOptions({
       gender: 'masculine'  // default value
     }, options)
   }
   ```

2. **Add typedef** in `lib/n2words.js`:

   ```javascript
   /**
    * @typedef {Object} PolishOptions
    * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender
    */
   ```

3. **Update converter** type annotation in `lib/n2words.js`:

   ```javascript
   const PolishConverter = /** @type {(value: NumericValue, options?: PolishOptions) => string} */ (makeConverter(Polish))
   ```

## Code Style

### JavaScript Style

We use [StandardJS](https://standardjs.com/) for code style:

```bash
# Check for style issues
npm run lint:js

# Automatically fix style issues
npm run lint:js:fix
```

Key conventions:

- Use ES6+ features (classes, arrow functions, destructuring)
- 2-space indentation
- No semicolons
- Single quotes for strings
- Use `const` and `let`, never `var`

### Markdown Style

We use [markdownlint](https://github.com/DavidAnson/markdownlint) for markdown files:

```bash
# Check markdown files
npm run lint:md

# Automatically fix markdown issues
npm run lint:md:fix
```

### JSDoc Documentation

All classes and public methods should have JSDoc comments:

```javascript
/**
 * Converts numbers to words in English.
 * Supports integers, decimals, negatives, and BigInt values.
 *
 * @extends GreedyScaleLanguage
 * @example
 * const converter = new English()
 * converter.convertToWords(42) // 'forty-two'
 */
export class English extends GreedyScaleLanguage {
  // ...
}
```

## Testing

### Running Tests

```bash
# Run all tests (language validation + unit + integration + type checking)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run type checking tests
npm run test:types

# Run minimal tests (unit + integration, no validation)
npm run test:minimal

# Run all tests including browser tests
npm run test:all

# Run browser/web tests only
npm run test:web
```

### Writing Tests

Tests use [AVA](https://github.com/avajs/ava) test framework. Language tests are defined in fixture files:

```javascript
// test/fixtures/languages/en.js
export default [
  [0, 'zero'],
  [1, 'one'],
  [42, 'forty-two'],
  [-5, 'minus five'],
  [3.14, 'three point one four'],
  [1000000n, 'one million'],

  // With options (if language supports them)
  [1, 'una', { gender: 'feminine' }]
]
```

**Test fixture format:**

- `[input, expected]` - Basic test case
- `[input, expected, options]` - Test case with options

### Test Coverage

Generate coverage reports:

```bash
npm run coverage
```

Coverage reports will be in the `coverage/` directory and displayed in the terminal.

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/add-korean-language
   ```

2. **Make your changes** following the code style guidelines

3. **Validate and test**:

   ```bash
   npm run lint
   npm test
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Add Korean language support"
   ```

   Good commit messages:
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issues when applicable

5. **Push to your fork**:

   ```bash
   git push origin feature/add-korean-language
   ```

6. **Open a Pull Request** on GitHub:
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all CI checks pass

### Pull Request Guidelines

- **One feature per PR**: Keep PRs focused on a single change
- **Test coverage**: Include tests for new features
- **Documentation**: Update docs for API changes
- **Validation**: Ensure `npm run lang:validate` passes for language changes
- **Backwards compatibility**: Avoid breaking changes when possible

## Project Structure

```text
n2words/
├── lib/
│   ├── classes/              # Base language classes
│   │   ├── abstract-language.js          # Abstract base (all languages inherit)
│   │   ├── greedy-scale-language.js      # Scale-based decomposition (most common)
│   │   ├── slavic-language.js            # Three-form pluralization (Slavic)
│   │   ├── south-asian-language.js       # Indian numbering (lakh, crore)
│   │   └── turkic-language.js            # Turkish-style "bir" rules
│   ├── languages/            # 48 language implementations
│   │   ├── ar.js            # Arabic
│   │   ├── en.js            # English
│   │   ├── es.js            # Spanish
│   │   ├── zh-Hans.js       # Simplified Chinese
│   │   └── ...              # (44 more languages)
│   └── n2words.js            # Main entry point (exports all converters)
├── test/
│   ├── fixtures/
│   │   └── languages/        # Test data for each language (48 files)
│   ├── unit/                 # Unit tests (base classes)
│   ├── integration/          # Integration tests (language converters)
│   ├── types/                # TypeScript type checking tests
│   └── web/                  # Browser/UMD bundle tests
├── scripts/
│   ├── add-language.js       # Language scaffolding tool
│   ├── validate-language.js  # Language validation tool
│   └── README.md             # Scripts documentation
├── bench.js                  # Performance benchmark script
├── bench-memory.js           # Memory usage benchmark script
├── dist/                     # Built UMD browser bundle
│   ├── n2words.js            # Minified UMD bundle (~91KB, ~23KB gzipped)
│   └── n2words.js.map        # Source map
├── docs/
│   ├── API.md                # Complete API documentation
│   ├── MIGRATION.md          # v1.x to v2.0 migration guide
│   └── EXAMPLES.md           # Usage examples
├── CLAUDE.md                 # AI assistant context (project patterns)
└── CONTRIBUTING.md           # This file
```

## Types of Contributions

### Bug Reports

When reporting bugs, please include:

- Node.js version
- n2words version
- Clear description of the issue
- Minimal code to reproduce the problem
- Expected vs actual behavior

### Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Describe the use case
- Provide examples of the desired API
- Consider backwards compatibility

### Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples
- Improve API documentation
- Translate documentation

### Performance Improvements

If proposing performance improvements:

- Run benchmarks before and after your changes
- Include benchmark results in your PR
- Ensure tests still pass
- Consider memory usage as well as speed

**Running benchmarks:**

```bash
# Performance benchmarks (operations per second)
npm run bench:perf                    # All languages
npm run bench:perf -- --lang en       # Specific language
npm run bench:perf -- --save          # Save results for comparison
npm run bench:perf -- --compare       # Compare with previous run

# Memory benchmarks
npm run bench:memory                  # All languages
npm run bench:memory -- --lang en     # Specific language
npm run bench:memory -- --save --compare  # Track memory changes
```

## Language Validation

The validation tool ensures language implementations follow project standards:

```bash
# Validate all languages
npm run lang:validate

# Validate specific languages
npm run lang:validate -- en es fr

# Verbose output with detailed checks
npm run lang:validate -- en --verbose
```

**What gets validated:**

- IETF BCP 47 naming convention (e.g., `en`, `zh-Hans`, `fr-BE`)
- Class structure and proper inheritance
- Required properties (`negativeWord`, `zeroWord`, etc.)
- Method implementations (not abstract)
- Scale words properly ordered (descending)
- Options pattern (constructor, typedef, type annotations)
- Gender option uses enum type (`'masculine'|'feminine'`)
- JSDoc documentation present
- Test fixture exists and is valid
- Proper registration in `lib/n2words.js` (import, converter, export)

## Questions?

If you have questions:

- Check existing issues on [GitHub](https://github.com/forzagreen/n2words/issues)
- Read the documentation in the [docs/](docs/) directory
- Check [CLAUDE.md](CLAUDE.md) for detailed project patterns
- Open a new issue with the "question" label

## License

By contributing to n2words, you agree that your contributions will be licensed under the MIT License.
