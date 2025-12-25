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

```bash
# Scaffold a new language implementation
npm run lang:add <language-code>

# Example: Add Korean
npm run lang:add ko

# Example: Add Canadian French
npm run lang:add fr-CA
```

This will create:

- Language implementation file: `lib/languages/<code>.js`
- Test fixture file: `test/fixtures/languages/<code>.js`
- Automatic registration in `lib/n2words.js`

### Implementation Steps

1. **Run the scaffolding tool** as shown above

2. **Implement the language class** in `lib/languages/<code>.js`:
   - Replace placeholder words with actual translations
   - Add complete `scaleWordPairs` array (ordered largest to smallest)
   - Implement `mergeScales()` with language-specific rules
   - Add JSDoc documentation

3. **Add comprehensive tests** in `test/fixtures/languages/<code>.js`:
   - Cover basic numbers (0-20)
   - Include teens, tens, hundreds
   - Test thousands, millions, billions
   - Add negative numbers and decimals
   - Include BigInt examples
   - Add edge cases and language-specific features

4. **Validate your implementation**:

   ```bash
   npm run lang:validate -- <code> --verbose
   ```

5. **Run all tests**:

   ```bash
   npm test
   ```

### Language Implementation Guide

For detailed guidance on implementing a new language, see [docs/guides/LANGUAGE_DEVELOPMENT.md](docs/guides/LANGUAGE_DEVELOPMENT.md).

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
# Run all tests (validation + unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run web/browser tests
npm run web:test

# Run all tests including web
npm run test:all
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
  [1000000n, 'one million']
]
```

### Test Coverage

Generate coverage reports:

```bash
npm run coverage:generate
```

Coverage reports will be in the `coverage/` directory.

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
│   ├── classes/           # Base language classes
│   │   ├── abstract-language.js
│   │   ├── greedy-scale-language.js
│   │   ├── slavic-language.js
│   │   ├── south-asian-language.js
│   │   └── turkic-language.js
│   ├── languages/         # Language implementations
│   │   ├── en.js
│   │   ├── es.js
│   │   └── ...
│   └── n2words.js         # Main export file
├── test/
│   ├── fixtures/
│   │   └── languages/     # Test data for each language
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── web/               # Browser tests
├── scripts/
│   ├── add-language.js    # Language scaffolding tool
│   └── validate-language.js  # Language validation tool
├── dist/                  # Built browser bundles
└── docs/                  # Documentation
    ├── guides/            # Development guides
    ├── API.md
    ├── MIGRATION.md
    └── EXAMPLES.md
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

- Include benchmark results
- Ensure tests still pass
- Consider memory usage as well as speed

## Questions?

If you have questions:

- Check existing issues on GitHub
- Read the [guides](guides/) documentation
- Open a new issue with the "question" label

## License

By contributing to n2words, you agree that your contributions will be licensed under the MIT License.
