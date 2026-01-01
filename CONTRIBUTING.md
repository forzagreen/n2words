# Contributing to n2words

Thank you for your interest in contributing to n2words! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Contributing to n2words](#contributing-to-n2words)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Git Hooks (Optional for Contributors)](#git-hooks-optional-for-contributors)
      - [For Contributors (No Setup Required)](#for-contributors-no-setup-required)
      - [For Maintainers (Opt-In)](#for-maintainers-opt-in)
    - [Development Setup](#development-setup)
  - [Contributing Workflow](#contributing-workflow)
    - [Pull Request Process](#pull-request-process)
      - [Pull Request Guidelines](#pull-request-guidelines)
      - [Git Workflow](#git-workflow)
    - [Commit Message Guidelines](#commit-message-guidelines)
    - [Code Review Process](#code-review-process)
      - [What to Expect](#what-to-expect)
      - [What Reviewers Look For](#what-reviewers-look-for)
      - [Addressing Feedback](#addressing-feedback)
      - [After Approval](#after-approval)
  - [Adding a New Language](#adding-a-new-language)
    - [Quick Start](#quick-start)
    - [Base Class Decision Tree](#base-class-decision-tree)
    - [Implementation Steps](#implementation-steps)
    - [Language Naming Convention](#language-naming-convention)
    - [Adding Language Options](#adding-language-options)
  - [Code Quality](#code-quality)
    - [Code Style](#code-style)
      - [JavaScript Style](#javascript-style)
      - [Markdown Style](#markdown-style)
      - [JSDoc Documentation](#jsdoc-documentation)
    - [Testing](#testing)
      - [Running Tests](#running-tests)
      - [Writing Tests](#writing-tests)
      - [Type Testing](#type-testing)
      - [Test Coverage](#test-coverage)
    - [Language Validation](#language-validation)
  - [Advanced Topics](#advanced-topics)
    - [Regional Language Variants](#regional-language-variants)
    - [Modifying Base Classes](#modifying-base-classes)
      - [Adding Helper Methods to Base Classes](#adding-helper-methods-to-base-classes)
    - [Building and Testing UMD Bundles](#building-and-testing-umd-bundles)
    - [Browser Compatibility](#browser-compatibility)
    - [CI Testing Strategy](#ci-testing-strategy)
    - [Performance Improvements](#performance-improvements)
      - [Performance Best Practices](#performance-best-practices)
  - [Project Information](#project-information)
    - [Project Structure](#project-structure)
    - [Continuous Integration](#continuous-integration)
      - [CI Workflow Overview](#ci-workflow-overview)
      - [Viewing CI Results](#viewing-ci-results)
      - [Running CI Checks Locally](#running-ci-checks-locally)
      - [Testing with Act (Local GitHub Actions)](#testing-with-act-local-github-actions)
    - [Release Process](#release-process)
      - [Versioning](#versioning)
      - [Creating a Release](#creating-a-release)
      - [Release Checklist](#release-checklist)
    - [Security](#security)
      - [Reporting Security Issues](#reporting-security-issues)
      - [Security Practices](#security-practices)
      - [Dependency Security](#dependency-security)
    - [Community Guidelines](#community-guidelines)
      - [Code of Conduct](#code-of-conduct)
      - [Communication Channels](#communication-channels)
      - [First-Time Contributors](#first-time-contributors)
      - [Recognition](#recognition)
      - [Types of Contributions](#types-of-contributions)
        - [Bug Reports](#bug-reports)
        - [Feature Requests](#feature-requests)
        - [Documentation](#documentation)
  - [Help \& Support](#help--support)
    - [Troubleshooting](#troubleshooting)
      - [Common Issues](#common-issues)
        - [Node Version Mismatch](#node-version-mismatch)
        - [Windows Path Issues](#windows-path-issues)
        - [Character Encoding Issues](#character-encoding-issues)
        - [Test Timeouts](#test-timeouts)
        - [BigInt Support](#bigint-support)
        - [Validation Errors](#validation-errors)
        - [Commit Message Errors](#commit-message-errors)
        - [Build Failures](#build-failures)
        - [Browser Test Issues](#browser-test-issues)
        - [Import/Export Errors](#importexport-errors)
      - [Quick Reference: Common Validation Errors](#quick-reference-common-validation-errors)
    - [Getting Help](#getting-help)
    - [Questions](#questions)
  - [License](#license)

## Getting Started

### Prerequisites

- Node.js (>=20)
- npm, yarn, pnpm, or bun
- Git

> **⚠️ IMPORTANT**: Before running `npm install`, please read the [Git Hooks](#git-hooks-optional-for-contributors) section below to understand how commit validation works in this project.

### Git Hooks (Optional for Contributors)

This project uses [Husky](https://typicode.github.io/husky/) for git hooks that validate code quality and ensure all commits pass CI workflows. **Git hooks are completely optional for contributors** - the same validations run in CI when you create a pull request.

#### For Contributors (No Setup Required)

When you run `npm install`, git hooks are **not** automatically installed. You can commit and push freely without any local validation:

```bash
npm install
git commit -m "your message"  # No hooks run, commits freely
git push                      # No pre-push tests run
```

Your commit messages and code will be validated by CI when you create a pull request, so there's no need to worry about the format locally.

#### For Maintainers (Opt-In)

If you're a maintainer and want to enable local validation before commits and pushes:

```bash
# After npm install, explicitly set up git hooks
npm run prepare:husky
```

This will install three git hooks:

1. **commit-msg**: Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
2. **pre-commit**: Runs linters on staged files (JavaScript and Markdown via lint-staged)
3. **pre-push**: Runs full test suite (`npm test`) to ensure all commits pass CI workflows before pushing

**Why pre-push?** The pre-push hook runs the complete test suite before allowing a push to the remote. This catches issues early and ensures you don't push broken code that will fail CI, saving time and maintaining a clean commit history on the remote.

**To disable hooks later:**

```bash
# Remove the .husky directory
rm -rf .husky
```

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

## Contributing Workflow

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

4. **Commit your changes** following [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git add .
   git commit -m "feat(lang): add Korean language support"
   ```

   See [Commit Message Guidelines](#commit-message-guidelines) for detailed format.

5. **Push to your fork**:

   ```bash
   git push origin feature/add-korean-language
   ```

6. **Open a Pull Request** on GitHub:
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all CI checks pass

#### Pull Request Guidelines

- **One feature per PR**: Keep PRs focused on a single change
- **Test coverage**: Include tests for new features
- **Documentation**: Update docs for API changes
- **Validation**: Ensure `npm run lang:validate` passes for language changes
- **Backwards compatibility**: Avoid breaking changes when possible
- **Target branch**: Submit PRs to the `main` branch (default)
- **Draft PRs**: Use draft PRs for work-in-progress to get early feedback

#### Git Workflow

**Keeping your fork in sync:**

```bash
# Add upstream remote (one-time setup)
git remote add upstream https://github.com/forzagreen/n2words.git

# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

**Branch naming conventions:**

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation updates
- `refactor/<description>` - Code refactoring

Examples: `feature/add-korean`, `fix/french-plurals`, `docs/contributing-guide`

### Commit Message Guidelines

**Commit message format:**

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring (no functional changes)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build, etc.)
- `perf:` - Performance improvements
- `style:` - Code style changes (formatting, semicolons, etc.)
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `revert:` - Revert previous commit
- `lang:` - Language implementation changes

**Scopes (optional):**

- `lang` - Language implementations
- `core` - Core/base classes
- `build` - Build system
- `ci` - CI/CD changes
- `deps` - Dependencies
- `docs` - Documentation
- `test` - Tests
- `types` - TypeScript types

**Examples:**

```bash
feat(lang): add Korean language support
fix(lang): correct French plural forms for numbers ending in 1
docs: update CONTRIBUTING.md with commit conventions
refactor(core): improve BigInt handling in AbstractLanguage
test(lang): add edge cases for Japanese group-by-4 pattern
chore(deps): update AVA to v6.0.0
```

**Guidelines:**

- Use present tense ("Add" not "Added")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Don't capitalize first letter of description
- No period at the end of description
- Reference issues in footer: `Closes #123` or `Fixes #456`

### Code Review Process

#### What to Expect

1. **Automated Checks**: CI must pass before review begins
   - All tests (unit, integration, type checking)
   - Linting (JavaScript and Markdown)
   - Language validation (if applicable)
   - Build verification
   - Coverage report generation

2. **Review Timeline**: Most PRs are reviewed within 2-3 business days

3. **Reviewers**: Core maintainers review all PRs

4. **Approval Requirements**: At least one approval from a maintainer

#### What Reviewers Look For

- **Code quality**: Follows project style and patterns
- **Test coverage**: Adequate tests for new code
- **Documentation**: Clear JSDoc comments and updated guides
- **Breaking changes**: Avoided when possible, clearly documented when necessary
- **Performance**: No significant performance regressions
- **Backwards compatibility**: Existing code continues to work

#### Addressing Feedback

- Respond to all review comments
- Push additional commits to address feedback
- Mark conversations as resolved when addressed
- Request re-review when ready

#### After Approval

- Maintainers will merge your PR (squash merge for multi-commit PRs)
- Your contribution will be included in the next release
- You'll be added to the contributors list if it's your first contribution

## Adding a New Language

Adding a new language is one of the most valuable contributions you can make! We've created tooling to make this process straightforward.

### Quick Start

The scaffolding tool supports **interactive mode** (recommended) or **command-line mode**:

**Interactive Mode (Recommended):**

```bash
npm run lang:add -- <code>

# Example: Add Korean
npm run lang:add -- ko
```

You'll be prompted to select a base class. See the decision tree below to choose the right one.

**Command-Line Mode:**

```bash
npm run lang:add -- <code> --base=<base-class>

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

### Base Class Decision Tree

```text
┌─ Does your language use lakh/crore (Indian numbering)?
│  └─ YES → SouthAsianLanguage
│           (Hindi, Bengali, Gujarati, Kannada, Marathi, Punjabi, Urdu)
│
├─ Does your language have three-form pluralization? (singular/few/many)
│  └─ YES → SlavicLanguage
│           (Russian, Polish, Czech, Croatian, Serbian, Ukrainian, Lithuanian, Latvian)
│
├─ Does your language omit "one" before certain scales? (like Turkish "yüz" not "bir yüz")
│  └─ YES → TurkicLanguage
│           (Turkish, Azerbaijani)
│
├─ Does your language have unique number structure that doesn't fit patterns?
│  └─ YES → AbstractLanguage (advanced - requires full custom implementation)
│           (Arabic, Japanese, Italian, etc.)
│
└─ Otherwise → GreedyScaleLanguage (default - most common)
               (English, Spanish, French, German, Portuguese, Chinese, Korean, etc.)
```

**Base Classes:**

- **GreedyScaleLanguage** (default) - Most common, scale-based decomposition
- **SlavicLanguage** - Three-form pluralization (Slavic languages)
- **SouthAsianLanguage** - Indian numbering system (lakh, crore)
- **TurkicLanguage** - Turkish-style implicit "bir" rules
- **AbstractLanguage** - Direct implementation (advanced)

### Implementation Steps

```text
┌───────────────────────────────────────────────────────────┐
│ 1. Scaffold Language                                      │
│    npm run lang:add -- <code>                             │
│    - Creates lib/languages/<code>.js                      │
│    - Creates test/fixtures/languages/<code>.js            │
│    - Registers in lib/n2words.js                          │
└────────────────────┬──────────────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────────────┐
│ 2. Implement Language Class                               │
│    Edit lib/languages/<code>.js                           │
│    ✓ Replace placeholder words (negativeWord, zeroWord)   │
│    ✓ Complete base-class-specific implementation:         │
│      - Greedy/Turkic: scaleWords + combineWordSets()      │
│      - Slavic: ones/tens/hundreds + pluralForms           │
│        (+ scaleGenders for per-scale gender control)      │
│      - SouthAsian: belowHundred + scaleWords              │
│      - Abstract: integerToWords() from scratch          │
│    ✓ Add options if needed (gender, formal, etc.)         │
│    ✓ Write comprehensive JSDoc with examples              │
└────────────────────┬──────────────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────────────┐
│ 3. Add Test Cases                                         │
│    Edit test/fixtures/languages/<code>.js                 │
│    ✓ Basic numbers (0-20)                                 │
│    ✓ Teens, tens, hundreds, thousands, millions           │
│    ✓ Negative numbers and decimals                        │
│    ✓ BigInt examples                                      │
│    ✓ Language-specific options and features               │
└────────────────────┬──────────────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────────────┐
│ 4. Validate Implementation                                │
│    npm run lang:validate -- <code> --verbose              │
│    ✓ IETF BCP 47 naming                                   │
│    ✓ Class structure and inheritance                      │
│    ✓ Required properties and methods                      │
│    ✓ Scale word ordering (descending)                     │
│    ✓ Options pattern (if applicable)                      │
│    ✓ JSDoc documentation                                  │
│    ✓ Registration in lib/n2words.js                       │
└────────────────────┬──────────────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────────────┐
│ 5. Run Tests                                              │
│    npm test                                               │
│    ✓ Unit tests pass                                      │
│    ✓ Integration tests pass                               │
│    ✓ Type tests pass                                      │
│    ✓ No linting errors                                    │
└────────────────────┬──────────────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────────────┐
│ 6. Submit Pull Request                                    │
│    git checkout -b feature/add-<language>                 │
│    git commit -m "feat(lang): add <Language> support"     │
│    git push origin feature/add-<language>                 │
└───────────────────────────────────────────────────────────┘
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
     this.setOptions({
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

## Code Quality

### Code Style

#### JavaScript Style

We use [StandardJS](https://standardjs.com/) for code style:

```bash
# Check for style issues
npm run lint:js

# Automatically fix style issues (also available via npm run lint:fix)
npm run lint:js -- --fix
```

Key conventions:

- Use ES6+ features (classes, arrow functions, destructuring)
- 2-space indentation
- No semicolons
- Single quotes for strings
- Use `const` and `let`, never `var`

#### Markdown Style

We use [markdownlint](https://github.com/DavidAnson/markdownlint) for markdown files:

```bash
# Check markdown files
npm run lint:md

# Automatically fix markdown issues (also available via npm run lint:fix)
npm run lint:md -- --fix
```

#### JSDoc Documentation

All classes and public methods should have JSDoc comments:

```javascript
/**
 * Converts numbers to words in English.
 * Supports integers, decimals, negatives, and BigInt values.
 *
 * @extends GreedyScaleLanguage
 * @example
 * import { EnglishConverter } from 'n2words'
 * EnglishConverter(42) // 'forty-two'
 */
export class English extends GreedyScaleLanguage {
  // ...
}
```

### Testing

#### Running Tests

```bash
# Run all tests (language validation + unit + integration + type checking)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run all type tests (build declarations + tsd + attw)
npm run test:types

# Run individual type test suites
npm run build:types       # Generate .d.ts files (validates JSDoc)
npm run test:types:tsd    # Test TypeScript declarations work
npm run test:types:attw   # Validate package.json exports

# Run all tests including browser tests
npm run test:all

# Run browser/web tests only (automatically builds via pretest:web hook)
npm run test:web
```

#### Writing Tests

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

#### Type Testing

The project uses a two-layer type testing strategy:

**1. Declaration Generation (`build:types`)**

Generates TypeScript declaration files from JSDoc annotations:

- Uses TypeScript compiler (`tsc --declaration --emitDeclarationOnly`)
- Configuration in [tsconfig.build.json](tsconfig.build.json)
- **Validates JSDoc automatically** - if JSDoc has errors, `.d.ts` generation fails
- Outputs `.d.ts` files to `lib/` (ignored by git, included in npm package)

**2. tsd Type Declaration Tests (`test:types:tsd`)**

Tests that generated TypeScript declarations work correctly:

- Located in [test/types/n2words.test-d.ts](test/types/n2words.test-d.ts)
- Uses [tsd](https://github.com/tsdjs/tsd) with `expectType`, `expectError`, `expectAssignable`
- Validates all converters have correct type signatures
- Ensures options are properly typed (gender, formal, etc.)
- Tests that invalid usage produces type errors

Example tsd test:

```typescript
import { expectType, expectError } from 'tsd'
import { EnglishConverter, ArabicConverter } from '../../lib/n2words.js'

// Valid usage
expectType<string>(EnglishConverter(42))
expectType<string>(ArabicConverter(42, { gender: 'feminine' }))

// Should produce type errors
expectError(EnglishConverter(42, { invalidOption: true }))
expectError(ArabicConverter(42, { gender: 'invalid' }))
```

**3. attw Package Validation (`test:types:attw`)**

Validates package.json exports for different module systems:

- Uses [@arethetypeswrong/cli](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
- Checks node10, node16 (CJS/ESM), and bundler resolution
- Ensures TypeScript declarations resolve correctly across all module systems
- Configuration in [.attw.json](.attw.json)

**Why this approach?**

1. **`build:types`** - Validates JSDoc → `.d.ts` conversion works (catches JSDoc errors)
2. **`test:types:tsd`** - Validates generated declarations provide correct types to consumers
3. **`test:types:attw`** - Validates package.json is correctly configured for all module systems

Together they ensure:

- All `lib/` files have valid JSDoc that can emit TypeScript declarations
- Generated typings work correctly for TypeScript consumers
- Package is correctly configured for Node.js and bundlers

#### Test Coverage

Generate coverage reports:

```bash
npm run coverage
```

Coverage reports will be in the `coverage/` directory and displayed in the terminal.

### Language Validation

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

## Advanced Topics

### Regional Language Variants

To create a regional variant of an existing language (e.g., Belgian French):

1. **Extend the base language**:

   ```javascript
   // lib/languages/fr-BE.js
   import { French } from './fr.js'

   export class FrenchBelgium extends French {
     constructor(options = {}) {
       super(options)

       // Modify specific scale words
       const pairs = [...this.scaleWords]
       const idx80 = pairs.findIndex(pair => pair[0] === 80n)
       if (idx80 !== -1) pairs.splice(idx80, 0, [90n, 'nonante'])
       const idx60 = pairs.findIndex(pair => pair[0] === 60n)
       if (idx60 !== -1) pairs.splice(idx60, 0, [70n, 'septante'])
       this.scaleWords = pairs
     }
   }
   ```

2. **Register in n2words.js** following alphabetical order

3. **Add comprehensive tests** covering regional differences

### Modifying Base Classes

**⚠️ WARNING**: Changes to base classes affect ALL languages that inherit from them.

**Base classes:**

- `AbstractLanguage` - Used by all languages (12 directly, others via subclasses)
- `GreedyScaleLanguage` - Used by 15 languages
- `SlavicLanguage` - Used by 11 languages
- `SouthAsianLanguage` - Used by 7 languages
- `TurkicLanguage` - Used by 2 languages

**Before modifying a base class:**

1. **Understand the impact**: Run all tests to see which languages are affected
2. **Preserve backwards compatibility**: Existing behavior should continue to work
3. **Test thoroughly**: Run full test suite including all language tests
4. **Document changes**: Update JSDoc and CLAUDE.md
5. **Consider alternatives**: Can this be a language-specific implementation instead?

**Testing after base class changes:**

```bash
# Run all tests
npm test

# Run validation for all languages
npm run lang:validate

# Check for performance regressions
npm run bench:perf -- --compare
```

#### Adding Helper Methods to Base Classes

When adding new helper methods to base classes:

```javascript
/**
 * Helper method description.
 *
 * @param {bigint} value - Parameter description
 * @returns {string} Return value description
 * @example
 * const result = this.helperMethod(100n)
 */
helperMethod(value) {
  // Implementation
}
```

Update CLAUDE.md with documentation of the new helper method.

### Building and Testing UMD Bundles

The project generates two build targets:

1. **ESM source** (`lib/`) - For modern bundlers and Node.js
2. **UMD bundles** (`dist/`) - For direct browser use via CDN

**When to test UMD bundles:**

- Changes to build configuration (`rollup.config.js`)
- Changes to export structure (`lib/n2words.js`)
- Before releases

**Testing UMD bundles:**

```bash
# Build all bundles
npm run build

# Run browser tests
npm run test:web

# Test specific bundle sizes
ls -lh dist/

# Verify bundle compatibility
npm run compat:web
```

**Bundle outputs:**

- `dist/n2words.js` - Main bundle (~92KB, ~23KB gzipped) with all converters
- `dist/<Language>Converter.js` - Individual converter bundles (~4-6KB each)
- `dist/*.js.map` - Source maps for debugging

### Browser Compatibility

**Target browsers:**

- Chrome 67+
- Firefox 68+
- Safari 14+
- Edge 79+

**Configuration**: `.browserslistrc`

```text
defaults and supports bigint
```

This targets ~86% of global users while requiring BigInt support (non-polyfillable).

**Testing browser compatibility:**

1. Run Playwright tests: `npm run test:web` (automatically builds via `pretest:web` hook)
2. Verify in target browsers manually if needed

**Note**: Browser tests run against `dist/` bundles (not `lib/` source) in Chromium, Firefox, and WebKit.

### CI Testing Strategy

Our CI pipeline runs tests across multiple platforms with an optimized strategy:

**Core Tests** (unit, integration, types):

- ✅ Ubuntu: Node 20, 22, 24, 25
- ✅ Windows: Node 24 (LTS)
- ✅ macOS: Node 24 (LTS)

**Browser Tests** (Playwright):

- ✅ Ubuntu only: Node 20, 22, 24, 25
- ❌ Windows/macOS: Not run

**Why browser tests on Ubuntu only?**

Browser engines (Chromium, Firefox, WebKit) are cross-platform and behave identically on all operating systems. Since we're testing UMD JavaScript bundles (not OS-specific native code), running browser tests on a single OS provides complete coverage while optimizing CI time and cost. This is the industry-standard approach for JavaScript libraries.

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

#### Performance Best Practices

If your contribution introduces performance regressions:

1. **Profile before optimizing**:

   ```bash
   npm run bench:perf -- --lang <your-language>
   npm run bench:memory -- --lang <your-language>
   ```

2. **Common performance pitfalls**:
   - Avoid string concatenation in loops (use array join)
   - Use BigInt arithmetic instead of string manipulation
   - Cache expensive calculations
   - Minimize object allocations

3. **Compare with baseline**:

   ```bash
   # Save baseline
   npm run bench:perf -- --save

   # Make your changes

   # Compare
   npm run bench:perf -- --compare
   ```

## Project Information

### Project Structure

```text
n2words/
├── lib/
│   ├── classes/              # Base language classes
│   │   ├── abstract-language.js          # Abstract base (all languages inherit)
│   │   ├── greedy-scale-language.js      # Scale-based decomposition (most common)
│   │   ├── slavic-language.js            # Three-form pluralization (Slavic)
│   │   ├── south-asian-language.js       # Indian numbering (lakh, crore)
│   │   └── turkic-language.js            # Turkish-style "bir" rules
│   ├── languages/            # Language implementations
│   │   ├── ar.js            # Arabic
│   │   ├── en.js            # English
│   │   ├── es.js            # Spanish
│   │   ├── zh-Hans.js       # Simplified Chinese
│   │   └── ...              # (44 more languages)
│   └── n2words.js            # Main entry point (exports all converters)
├── test/
│   ├── fixtures/
│   │   └── languages/        # Test data for each language
│   ├── unit/                 # Unit tests (base classes)
│   ├── integration/          # Integration tests (language converters)
│   ├── types/                # TypeScript type checking tests
│   └── web/                  # Browser/UMD bundle tests
├── scripts/
│   ├── add-language.js       # Language scaffolding tool
│   ├── validate-language.js  # Language validation tool
│   └── README.md             # Scripts documentation
├── bench/
│   ├── perf.js               # Performance benchmark script
│   └── memory.js             # Memory usage benchmark script
├── dist/                     # Built UMD browser bundles
│   ├── n2words.js            # Main bundle with all converters (~91KB, ~23KB gzipped)
│   ├── n2words.js.map        # Source map for main bundle
│   ├── {LanguageName}Converter.js  # Individual converter UMD files
│   └── {LanguageName}Converter.js.map  # Source maps for each converter
├── CLAUDE.md                 # AI assistant context (project patterns)
└── CONTRIBUTING.md           # This file
```

### Continuous Integration

All pull requests run through comprehensive CI checks using GitHub Actions.

#### CI Workflow Overview

The project uses a unified CI workflow (`ci.yml`) that combines linting, building, and testing in a single job for better efficiency.

**Job Matrix:**

Tests run on multiple environments:

- **Node.js versions**: 20, 22, 24, 25
- **Operating systems**:
  - Ubuntu (all Node versions)
  - Windows (Node 24 LTS only)
  - macOS (Node 24 LTS only)

**What the CI job does:**

1. **Linting** - JavaScript (StandardJS) and Markdown
2. **Building** - All UMD bundles (`dist/`)
3. **Testing** - Language validation, unit, integration, type checking, browser tests
4. **Coverage** - Generated and uploaded conditionally (PRs and main branch only)
5. **Security** - Package audit (`npm audit`)

**Coverage Strategy:**

Coverage is only uploaded on:

- Pull requests
- Pushes to `master`/`main` branch
- Ubuntu + Node 24 job only

This prevents coverage spam from feature branches while maintaining visibility where it matters.

#### Viewing CI Results

- Check the "Checks" tab on your pull request
- All checks must pass (green checkmark) before merge
- Click on failed checks to see detailed logs
- Re-run failed checks if you suspect a flaky test

#### Running CI Checks Locally

Before pushing, run the same checks locally:

```bash
# Run all checks
npm run lint         # Linting
npm test             # Full test suite
npm run build        # Build UMD bundles
npm audit --audit-level=high  # Security audit (matches CI)

# Optional: Run browser tests (pretest:web hook builds automatically)
npm run test:web
```

#### Testing with Act (Local GitHub Actions)

You can test the actual CI workflow locally using [Act](https://github.com/nektos/act):

```bash
# Quick validation (1-2 min)
act -W .github/workflows/ci.yml --matrix node:24 --matrix os:ubuntu-latest

# Full validation (10-15 min)
act -W .github/workflows/ci.yml
```

The project includes an `.actrc` configuration file with sensible defaults.

### Release Process

#### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features (backwards compatible)
- **Patch** (0.0.X): Bug fixes (backwards compatible)

#### Creating a Release

**For maintainers only:**

1. **Update version** in `package.json`:

   ```bash
   npm version major|minor|patch
   # Example: npm version minor
   ```

2. **Create and push tag**:

   ```bash
   git push && git push --tags
   ```

3. **Automated process** (via GitHub Actions):
   - Waits for CI workflow to complete successfully
   - Version validation (ensures package.json matches tag)
   - Build all dist/ bundles
   - Publish to npm with provenance
   - Create GitHub Release with auto-generated notes
   - Upload dist/ files as release artifacts

**Note**: The publish workflow (`publish.yml`) waits for the CI workflow to pass before publishing, ensuring all tests pass on all platforms before releasing.

#### Release Checklist

- [ ] All tests passing on `main`
- [ ] CHANGELOG.md updated (if exists)
- [ ] Version bumped appropriately
- [ ] Tag matches package.json version (format: `vX.Y.Z`)
- [ ] No uncommitted changes

### Security

#### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Instead, please email security concerns to the maintainers privately:

- Report via GitHub Security Advisories
- Or contact maintainers directly through GitHub

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

#### Security Practices

- Dependencies are audited in CI (`npm audit`)
- No credentials or secrets in code
- Input validation in AbstractLanguage
- Safe BigInt arithmetic (no eval or Function constructor)
- Provenance attestation on npm releases

#### Dependency Security

- Keep dependencies up to date
- Run `npm audit` before submitting PRs
- Fix security vulnerabilities before adding features
- Use `npm audit fix` for automated fixes

### Community Guidelines

#### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md) that all contributors are expected to follow. By participating, you agree to maintain a respectful, professional, and inclusive environment.

**In brief, we expect all participants to:**

- Be respectful and collaborative
- Help newcomers and be patient with mistakes
- Keep discussions focused and productive
- Give credit to others' contributions

For the full Code of Conduct, including reporting procedures and enforcement policies, please see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

#### Communication Channels

- **GitHub Issues**: Bug reports, feature requests, questions
- **Pull Requests**: Code contributions and technical discussions
- **GitHub Discussions**: General questions and community support

#### First-Time Contributors

We welcome first-time contributors! Look for issues labeled:

- `good first issue` - Well-defined, small scope, good for beginners
- `help wanted` - We're looking for contributors
- `documentation` - Documentation improvements

**Tips for first-time contributors:**

1. Start small - fix a typo, improve documentation, add tests
2. Ask questions - if anything is unclear, just ask
3. Read existing code - learn from existing language implementations
4. Run tests locally - ensure everything works before submitting
5. Be patient - maintainers will help guide you through the process

#### Recognition

Contributors are recognized in several ways:

- **package.json contributors list** - Added after your first merged PR
- **Git history** - Your commits are permanently recorded
- **Release notes** - Notable contributions mentioned in releases
- **GitHub contributors page** - Automatically tracked by GitHub

#### Types of Contributions

##### Bug Reports

When reporting bugs, please include:

- Node.js version
- n2words version
- Clear description of the issue
- Minimal code to reproduce the problem
- Expected vs actual behavior

##### Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Describe the use case
- Provide examples of the desired API
- Consider backwards compatibility

##### Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples
- Improve API documentation
- Translate documentation

## Help & Support

### Troubleshooting

#### Common Issues

##### Node Version Mismatch

**Problem**: Tests fail with syntax errors or BigInt not supported

**Solution**:

```bash
# Check your Node version
node --version

# Should be >= 20

# Use nvm to install correct version
nvm install lts/*
nvm use lts/*

# Or use fnm
fnm install lts-latest
fnm use lts-latest
```

##### Windows Path Issues

**Problem**: Tests fail on Windows with path separator errors

**Solution**: The project uses POSIX paths internally. Most issues are already handled, but if you encounter problems:

- Use forward slashes `/` in code, even on Windows
- Git will handle line endings automatically (`.gitattributes`)
- Run tests in Git Bash or WSL for better compatibility

##### Character Encoding Issues

**Problem**: Non-Latin characters display incorrectly

**Solution**:

- Ensure your editor uses UTF-8 encoding
- Check `.editorconfig` is being respected by your editor
- Install EditorConfig extension for your editor

##### Test Timeouts

**Problem**: Tests timeout, especially browser tests

**Solution**:

```bash
# Increase timeout for specific test
npm run test:web -- --timeout=60s

# Or increase globally in package.json ava.timeout
```

##### BigInt Support

**Problem**: BigInt literal syntax errors

**Solution**:

- BigInt requires Node.js >= 10.4.0 (project requires >= 20)
- Use `BigInt('123')` constructor for dynamic values
- Use `123n` literal syntax for static values
- Never use `parseInt()` or `Number()` on BigInt values

##### Validation Errors

**Problem**: `npm run lang:validate` reports errors

**Common validation errors and fixes:**

1. **"Scale words not in descending order"**

   ```javascript
   // Wrong order
   scaleWords = [
     [100n, 'hundred'],
     [1000n, 'thousand']  // ❌ Should come before 100
   ]

   // Correct order
   scaleWords = [
     [1000n, 'thousand'],  // ✅ Largest first
     [100n, 'hundred']
   ]
   ```

2. **"Not imported in n2words.js"**

   Ensure three entries in `lib/n2words.js`:
   - Import statement (alphabetically in Language Imports section)
   - Converter declaration (alphabetically in Language Converters section)
   - Export statement (alphabetically in Exports section)

3. **"Gender option must use enum type"**

   ```javascript
   // Wrong
   @property {string} [gender='masculine']

   // Correct
   @property {('masculine'|'feminine')} [gender='masculine']
   ```

##### Commit Message Errors

**Problem**: Git commit fails with commitlint validation error

**Common commit message errors:**

1. **Invalid commit type**

   ```bash
   # ❌ Wrong
   git commit -m "updated the README"
   git commit -m "Add: new feature"
   git commit -m "feature: add something"

   # ✅ Correct
   git commit -m "docs: update README"
   git commit -m "feat: add new feature"
   ```

2. **Capitalized subject**

   ```bash
   # ❌ Wrong
   git commit -m "feat: Add new language"

   # ✅ Correct
   git commit -m "feat: add new language"
   ```

3. **Period at end of subject**

   ```bash
   # ❌ Wrong
   git commit -m "fix: resolve bug."

   # ✅ Correct
   git commit -m "fix: resolve bug"
   ```

4. **Invalid scope**

   ```bash
   # ❌ Wrong
   git commit -m "feat(language): add Korean"

   # ✅ Correct (scope is "lang" not "language")
   git commit -m "feat(lang): add Korean"
   ```

**Solutions:**

```bash
# Option 1: View detailed error messages
# The Husky hook will show exactly what's wrong with your message

# Option 2: Skip the hook temporarily (not recommended)
git commit --no-verify -m "your message"

# Option 3: Amend your last commit message
git commit --amend
```

**Valid commit types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test changes
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Other changes (dependencies, etc.)
- `revert` - Revert previous commit
- `lang` - Language implementation changes

**Valid scopes (optional):**

- `deps`, `ci`, `docs`, `test`, `build`, `lang`, `core`, `types`

##### Build Failures

**Problem**: `npm run build` fails

**Solution**:

```bash
# Clean dist and node_modules
rm -rf dist/ node_modules/
npm install
npm run build

# Check for syntax errors
npm run lint
```

##### Browser Test Issues

**Problem**: Browser tests fail to start

**Solution**:

1. Browser builds are automatically generated via `pretest:web` lifecycle hook
2. Ensure Playwright browsers are installed: `npm run playwright:install`
3. Check for errors in the test output
4. Verify `dist/n2words.js` bundle exists after build

##### Import/Export Errors

**Problem**: `Cannot find module` or `SyntaxError: Unexpected token export`

**Solution**:

- Project uses ES modules (`"type": "module"` in package.json)
- Use `.js` extensions in import statements: `import { French } from './fr.js'`
- Don't use `require()`, use `import` instead
- Run with Node.js >= 20

#### Quick Reference: Common Validation Errors

| Error Message                              | Cause                                    | Fix                                           |
| ------------------------------------------ | ---------------------------------------- | --------------------------------------------- |
| "Missing required property: negativeWord"  | Property not defined in class            | Add `negativeWord = 'minus'` to class         |
| "scaleWords not in descending order"       | Scale values not sorted largest→smallest | Reorder array from largest to smallest        |
| "integerToWords() not implemented"         | Method is abstract/missing               | Implement `integerToWords(n)` method          |
| "Not imported in lib/n2words.js"           | Missing registration                     | Add import, converter, export (alphabetically)|
| "Missing test fixture"                     | No test file exists                      | Create `test/fixtures/languages/<code>.js`    |
| "Gender option must use enum type"         | Wrong JSDoc type                         | Use `('masculine'\|'feminine')` not `string`  |
| "Class name doesn't match CLDR"            | Wrong class name                         | Use `Intl.DisplayNames` to get correct name   |
| "File doesn't follow IETF BCP 47"          | Invalid language code                    | Use valid BCP 47 code (e.g., `en`, `zh-Hans`) |

### Getting Help

If you're stuck:

1. **Check existing documentation**:
   - This CONTRIBUTING.md
   - [CLAUDE.md](CLAUDE.md) for detailed patterns
   - [scripts/README.md](scripts/README.md) for tooling docs
   - [bench/README.md](bench/README.md) for benchmarking

2. **Search existing issues**: Someone may have had the same problem

3. **Ask for help**:
   - Open an issue with the "question" label
   - Provide full context (Node version, OS, error messages)
   - Include steps to reproduce the issue

### Questions

If you have questions:

- Check existing issues on [GitHub](https://github.com/forzagreen/n2words/issues)
- Check [CLAUDE.md](CLAUDE.md) for detailed project patterns
- Check [scripts/README.md](scripts/README.md) for tooling documentation
- Open a new issue with the "question" label

## License

By contributing to n2words, you agree that your contributions will be licensed under the MIT License.
