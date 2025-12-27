# Contributing to n2words

Thank you for your interest in contributing to n2words! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding a New Language](#adding-a-new-language)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Continuous Integration](#continuous-integration)
- [Advanced Contributions](#advanced-contributions)
- [Release Process](#release-process)
- [Security](#security)
- [Project Structure](#project-structure)
- [Community Guidelines](#community-guidelines)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js (>=20)
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

# Automatically fix style issues (also available via npm run lint:fix)
npm run lint:js -- --fix
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

# Automatically fix markdown issues (also available via npm run lint:fix)
npm run lint:md -- --fix
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

# Run all tests including browser tests
npm run test:all

# Run browser/web tests only (automatically builds via pretest:web hook)
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

4. **Commit your changes** following [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git add .
   git commit -m "feat(lang): add Korean language support"
   ```

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

   **Scopes (optional):**
   - `lang` - Language implementations
   - `core` - Core/base classes
   - `build` - Build system
   - `ci` - CI/CD changes
   - `deps` - Dependencies

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
- **Target branch**: Submit PRs to the `main` branch (default)
- **Draft PRs**: Use draft PRs for work-in-progress to get early feedback

### Git Workflow

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

## Code Review Process

### What to Expect

1. **Automated Checks**: CI must pass before review begins
   - All tests (unit, integration, type checking)
   - Linting (JavaScript and Markdown)
   - Language validation (if applicable)
   - Build verification
   - Coverage report generation

2. **Review Timeline**: Most PRs are reviewed within 2-3 business days

3. **Reviewers**: Core maintainers review all PRs

4. **Approval Requirements**: At least one approval from a maintainer

### What Reviewers Look For

- **Code quality**: Follows project style and patterns
- **Test coverage**: Adequate tests for new code
- **Documentation**: Clear JSDoc comments and updated guides
- **Breaking changes**: Avoided when possible, clearly documented when necessary
- **Performance**: No significant performance regressions
- **Backwards compatibility**: Existing code continues to work

### Addressing Feedback

- Respond to all review comments
- Push additional commits to address feedback
- Mark conversations as resolved when addressed
- Request re-review when ready

### After Approval

- Maintainers will merge your PR (squash merge for multi-commit PRs)
- Your contribution will be included in the next release
- You'll be added to the contributors list if it's your first contribution

## Continuous Integration

All pull requests run through comprehensive CI checks using GitHub Actions.

### CI Workflow Overview

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

### Viewing CI Results

- Check the "Checks" tab on your pull request
- All checks must pass (green checkmark) before merge
- Click on failed checks to see detailed logs
- Re-run failed checks if you suspect a flaky test

### Running CI Checks Locally

Before pushing, run the same checks locally:

```bash
# Run all checks
npm run lint         # Linting
npm test             # Full test suite
npm run build        # Build UMD bundles
npm audit --production --audit-level=moderate  # Security audit

# Optional: Run browser tests (requires build first)
npm run build
npm run test:web
```

### Testing with Act (Local GitHub Actions)

You can test the actual CI workflow locally using [Act](https://github.com/nektos/act):

```bash
# Quick validation (1-2 min)
act -W .github/workflows/ci.yml --matrix node:24 --matrix os:ubuntu-latest

# Full validation (10-15 min)
act -W .github/workflows/ci.yml
```

The project includes an `.actrc` configuration file with sensible defaults.

## Advanced Contributions

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
       const pairs = [...this.scaleWordPairs]
       const idx80 = pairs.findIndex(pair => pair[0] === 80n)
       if (idx80 !== -1) pairs.splice(idx80, 0, [90n, 'nonante'])
       const idx60 = pairs.findIndex(pair => pair[0] === 60n)
       if (idx60 !== -1) pairs.splice(idx60, 0, [70n, 'septante'])
       this.scaleWordPairs = pairs
     }
   }
   ```

2. **Register in n2words.js** following alphabetical order

3. **Add comprehensive tests** covering regional differences

### Modifying Base Classes

**⚠️ WARNING**: Changes to base classes affect ALL languages that inherit from them.

**Base classes:**

- `AbstractLanguage` - Used by all 48 languages
- `GreedyScaleLanguage` - Used by 24+ languages
- `SlavicLanguage` - Used by 8 languages
- `SouthAsianLanguage` - Used by 9 languages
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

### Adding Helper Methods to Base Classes

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

- `dist/n2words.js` - Main bundle (~92KB, ~23KB gzipped) with all 48 converters
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

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features (backwards compatible)
- **Patch** (0.0.X): Bug fixes (backwards compatible)

### Creating a Release

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

### Release Checklist

- [ ] All tests passing on `main`
- [ ] CHANGELOG.md updated (if exists)
- [ ] Version bumped appropriately
- [ ] Tag matches package.json version (format: `vX.Y.Z`)
- [ ] No uncommitted changes

## Security

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Instead, please email security concerns to the maintainers privately:

- Report via GitHub Security Advisories
- Or contact maintainers directly through GitHub

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Practices

- Dependencies are audited in CI (`npm audit`)
- No credentials or secrets in code
- Input validation in AbstractLanguage
- Safe BigInt arithmetic (no eval or Function constructor)
- Provenance attestation on npm releases

### Dependency Security

- Keep dependencies up to date
- Run `npm audit` before submitting PRs
- Fix security vulnerabilities before adding features
- Use `npm audit fix` for automated fixes

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
├── bench/
│   ├── perf.js               # Performance benchmark script
│   └── memory.js             # Memory usage benchmark script
├── dist/                     # Built UMD browser bundles
│   ├── n2words.js            # Main bundle with all converters (~91KB, ~23KB gzipped)
│   ├── n2words.js.map        # Source map for main bundle
│   ├── {LanguageName}Converter.js  # Individual converter UMD files (48 files)
│   └── {LanguageName}Converter.js.map  # Source maps for each converter
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

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- **Be respectful**: Treat everyone with respect and consideration
- **Be collaborative**: Work together constructively
- **Be patient**: Help newcomers and be understanding of mistakes
- **Be professional**: Keep discussions focused and productive
- **Give credit**: Acknowledge others' contributions

**Unacceptable behavior includes:**

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or off-topic discussions
- Disclosing others' private information
- Any conduct that would be inappropriate in a professional setting

**Enforcement**: Violations may result in warnings, temporary bans, or permanent removal from the project.

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests, questions
- **Pull Requests**: Code contributions and technical discussions
- **GitHub Discussions**: General questions and community support

### First-Time Contributors

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

### Recognition

Contributors are recognized in several ways:

- **package.json contributors list** - Added after your first merged PR
- **Git history** - Your commits are permanently recorded
- **Release notes** - Notable contributions mentioned in releases
- **GitHub contributors page** - Automatically tracked by GitHub

## Troubleshooting

### Common Issues

#### Node Version Mismatch

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

#### Windows Path Issues

**Problem**: Tests fail on Windows with path separator errors

**Solution**: The project uses POSIX paths internally. Most issues are already handled, but if you encounter problems:

- Use forward slashes `/` in code, even on Windows
- Git will handle line endings automatically (`.gitattributes`)
- Run tests in Git Bash or WSL for better compatibility

#### Character Encoding Issues

**Problem**: Non-Latin characters display incorrectly

**Solution**:

- Ensure your editor uses UTF-8 encoding
- Check `.editorconfig` is being respected by your editor
- Install EditorConfig extension for your editor

#### Test Timeouts

**Problem**: Tests timeout, especially browser tests

**Solution**:

```bash
# Increase timeout for specific test
npm run test:web -- --timeout=60s

# Or increase globally in package.json ava.timeout
```

#### BigInt Support

**Problem**: BigInt literal syntax errors

**Solution**:

- BigInt requires Node.js >= 10.4.0 (project requires >= 20)
- Use `BigInt('123')` constructor for dynamic values
- Use `123n` literal syntax for static values
- Never use `parseInt()` or `Number()` on BigInt values

#### Validation Errors

**Problem**: `npm run lang:validate` reports errors

**Common validation errors and fixes:**

1. **"Scale words not in descending order"**

   ```javascript
   // Wrong order
   scaleWordPairs = [
     [100n, 'hundred'],
     [1000n, 'thousand']  // ❌ Should come before 100
   ]

   // Correct order
   scaleWordPairs = [
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

#### Build Failures

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

#### Browser Test Issues

**Problem**: Browser tests fail to start

**Solution**:

1. Browser builds are automatically generated via `pretest:web` lifecycle hook
2. Ensure Playwright browsers are installed: `npm run playwright:install`
3. Check for errors in the test output
4. Verify `dist/n2words.js` bundle exists after build

#### Import/Export Errors

**Problem**: `Cannot find module` or `SyntaxError: Unexpected token export`

**Solution**:

- Project uses ES modules (`"type": "module"` in package.json)
- Use `.js` extensions in import statements: `import { French } from './fr.js'`
- Don't use `require()`, use `import` instead
- Run with Node.js >= 20

### Performance Issues

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
- Check [CLAUDE.md](CLAUDE.md) for detailed project patterns
- Check [scripts/README.md](scripts/README.md) for tooling documentation
- Open a new issue with the "question" label

## License

By contributing to n2words, you agree that your contributions will be licensed under the MIT License.
