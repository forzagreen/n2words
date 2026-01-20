# Contributing to n2words

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/n2words.git
cd n2words
npm install
npm test
```

**Requirements:** Node.js >=20, Git

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/add-korean`
2. Make changes, then run `npm run lint && npm test`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat(lang): add Korean"`
4. Push and open PR targeting `main`

**Common commit formats:**

- `feat(lang): add Korean` — new language
- `fix(en): correct thousand handling` — language-specific fix
- `perf(ja): optimize BigInt handling` — performance improvement
- `refactor(core): simplify exports` — code refactoring
- `docs: update README` — documentation

See [.commitlintrc.mjs](.commitlintrc.mjs) for the full list of types and scopes.

## Adding a New Language

```bash
npm run lang:add <code>   # e.g., ko, sr-Cyrl, fr-BE
```

This scaffolds all required files. Then:

1. Implement `toWords(value)` in `src/<code>.js`
2. Add test cases to `test/fixtures/<code>.js`
3. Run `npm test`

## Code Style

- **JavaScript:** [StandardJS](https://standardjs.com/) — `npm run lint:fix`
- **Markdown:** [markdownlint](https://github.com/DavidAnson/markdownlint) — `npm run lint:md -- --fix`

## Testing

```bash
npm test              # Run all tests
npm run test:all      # Full suite (types, UMD, browsers)
npm run coverage      # With coverage report
```

## Release Process (Maintainers)

Releases are automated via [release-please](https://github.com/googleapis/release-please):

1. Push commits to `main` using Conventional Commits
2. Release-please creates/updates a Release PR with changelog
3. Merge the Release PR → creates tag + GitHub Release → npm publish

**Version bumps:** `feat:` → minor, `fix:`/`perf:` → patch, `feat!:` → major

## Security

Report vulnerabilities via [GitHub Security Advisories](https://github.com/forzagreen/n2words/security/advisories), not public issues. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree to license your contributions under the MIT License.
