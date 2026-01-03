# Contributing to n2words

Thank you for your interest in contributing! This guide covers everything you need to start contributing.

## Getting Started

### Prerequisites

- Node.js (>=20) - use `nvm use` or `fnm use` with provided `.nvmrc`
- npm, yarn, pnpm, or bun
- Git

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/n2words.git
cd n2words
npm install
npm test
```

### Git Hooks (Optional)

Git hooks are **not** automatically installed. Your commits will be validated by CI.

**For maintainers** who want local validation:

```bash
npm run prepare:husky  # Installs commit-msg, pre-commit, pre-push hooks
```

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/add-korean`

2. **Make changes** following code style guidelines

3. **Validate and test**:

   ```bash
   npm run lint
   npm test
   ```

4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat(lang): add Korean language support"
   ```

5. **Push and open PR**: Target `main` branch

### PR Guidelines

- One feature per PR
- Include tests for new features
- Update docs for API changes
- Ensure `npm test` passes for language changes

### Keeping Fork in Sync

```bash
git remote add upstream https://github.com/forzagreen/n2words.git
git fetch upstream && git checkout main && git merge upstream/main
```

## Commit Message Guidelines

```text
<type>(<scope>): <description>

[optional body]
[optional footer: Closes #123]
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`, `build`, `ci`, `revert`, `lang`

**Scopes** (optional):

- Project areas: `bench`, `build`, `ci`, `core`, `deps`, `docs`, `lang`, `release`, `scripts`, `test`, `types`, `utils`
- Language codes: Any valid BCP 47 code (e.g., `en`, `fr-BE`, `zh-Hans`)

**Examples**:

```bash
feat(lang): add Korean language support
fix(lang): correct French plural forms for numbers ending in 1
docs: update CONTRIBUTING.md
refactor(core): improve BigInt handling in AbstractLanguage
```

**Rules**: Present tense, imperative mood, no capital first letter, no period at end.

## Code Review Process

1. **CI must pass** before review (tests, linting, validation)
2. **Review timeline**: 2-3 business days
3. **Approval**: At least one maintainer approval required
4. **After approval**: Maintainers merge (squash merge for multi-commit PRs)

**Reviewers check**: Code quality, test coverage, documentation, backwards compatibility.

## Adding a New Language

Use the scaffolding tool:

```bash
npm run lang:add -- <code>              # Interactive mode (recommended)
npm run lang:add -- ko --base=greedy-scale    # Command-line mode
```

**Base class options**: `greedy-scale` (default), `slavic`, `south-asian`, `turkic`, `abstract`

This creates:

- `lib/languages/<code>.js` - Language implementation
- `test/fixtures/languages/<code>.js` - Test fixture
- Updates to `lib/n2words.js` - Registration

**After scaffolding**:

1. Edit language file - replace placeholders, implement base-class requirements
2. Edit test fixture - add comprehensive test cases
3. Test: `npm test`

For detailed implementation patterns and base class selection, see [scripts/README.md](scripts/README.md).

### Language Naming

Use **IETF BCP 47** format:

- Base: `en`, `fr`, `es`
- With script: `zh-Hans`, `sr-Latn`
- With region: `fr-BE`, `en-US`

## Code Style

### JavaScript

[StandardJS](https://standardjs.com/) - 2 spaces, no semicolons, single quotes.

```bash
npm run lint:js          # Check
npm run lint:js -- --fix # Fix
```

### Markdown

[markdownlint](https://github.com/DavidAnson/markdownlint):

```bash
npm run lint:md          # Check
npm run lint:md -- --fix # Fix
```

### JSDoc

All classes and public methods require JSDoc comments with `@example` tags.

## Testing

```bash
npm test              # Core tests (validation + unit + integration)
npm run test:unit     # Unit tests only
npm run test:types    # TypeScript declaration tests
npm run test:browsers # Browser tests (Playwright)
npm run test:all      # Everything
npm run coverage      # With coverage report
```

**Fixture format** (`test/fixtures/languages/<code>.js`):

```javascript
export default [
  [0, 'zero'],
  [42, 'forty-two'],
  [-5, 'minus five'],
  [1, 'una', { gender: 'feminine' }]  // With options
]
```

For detailed testing patterns, see [test/README.md](test/README.md).

## Advanced Topics

### Regional Variants

Extend the base language and modify specific scale words:

```javascript
import { French } from './fr.js'

export class FrenchBelgium extends French {
  constructor(options = {}) {
    super(options)
    // Modify scaleWords for regional differences
  }
}
```

### Modifying Base Classes

**Warning**: Changes affect ALL inheriting languages.

Before modifying:

1. Run full test suite: `npm test`
2. Check performance: `npm run bench:perf -- --compare`

For architecture details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Building UMD Bundles

```bash
npm run build         # Generate dist/ bundles
npm run test:umd      # Validate bundles
npm run test:browsers # Test in real browsers
```

For browser compatibility details, see [COMPATIBILITY.md](COMPATIBILITY.md).

### Performance

```bash
npm run bench:perf              # Performance benchmarks
npm run bench:memory            # Memory benchmarks
npm run bench:perf -- --compare # Compare with baseline
```

For benchmarking details, see [bench/README.md](bench/README.md).

## Release Process (Maintainers)

We follow [Semantic Versioning](https://semver.org/).

```bash
npm version patch|minor|major
git push && git push --tags
```

Automated via GitHub Actions:

- CI passes on tag
- Publishes to npm with provenance
- Creates GitHub Release

## Security

**Do NOT open public issues for security vulnerabilities.**

Report via GitHub Security Advisories or contact maintainers privately.

See [SECURITY.md](SECURITY.md) for full policy.

## Community

- **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Issues**: Bug reports, feature requests, questions
- **First-time contributors**: Look for `good first issue` labels

### Types of Contributions

- **Bug reports**: Include Node version, n2words version, reproduction steps
- **Feature requests**: Describe use case and desired API
- **Documentation**: Fix typos, add examples, improve clarity
- **New languages**: Most valuable contribution!

## Reference Documentation

| Topic                             | Document                                     |
| --------------------------------- | -------------------------------------------- |
| Architecture & patterns           | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Language scaffolding & validation | [scripts/README.md](scripts/README.md)       |
| Testing infrastructure            | [test/README.md](test/README.md)             |
| Browser compatibility             | [COMPATIBILITY.md](COMPATIBILITY.md)         |
| Benchmarking                      | [bench/README.md](bench/README.md)           |
| Security policy                   | [SECURITY.md](SECURITY.md)                   |
| Code of conduct                   | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)     |

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
