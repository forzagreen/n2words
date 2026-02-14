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

1. Create a feature branch: `git checkout -b feat/add-pt-BR`
2. Make changes, then run `npm run lint && npm test`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat(ko-KR): add Korean"`
4. Push and open PR targeting `main`

**Common commit formats:**

- `feat(pt-BR): add Brazilian Portuguese` — new language
- `fix(en-US): correct thousand handling` — language-specific fix
- `perf(ja-JP): optimize BigInt handling` — performance improvement
- `refactor(core): simplify exports` — code refactoring
- `docs: update README` — documentation

Scopes use BCP 47 language codes (`en-US`, `fr-BE`, `zh-Hans-CN`) or project areas (`core`, `types`, `umd`). See [.commitlintrc.mjs](.commitlintrc.mjs) for details.

## Adding a New Language

```bash
npm run lang:add <code>   # e.g., ko-KR, sr-Cyrl-RS, fr-BE
```

This scaffolds all required files. Every language implements three **forms**:

| Form     | Function       | Example              |
| -------- | -------------- | -------------------- |
| Cardinal | `toCardinal()` | "forty-two"          |
| Ordinal  | `toOrdinal()`  | "forty-second"       |
| Currency | `toCurrency()` | "forty-two dollars"  |

Then:

1. Implement all three forms in `src/<code>.js`
2. Add test cases to `test/fixtures/<code>.js`
3. Run `npm test`

## Code Style

- **JavaScript:** [StandardJS](https://standardjs.com/) — `npm run lint:fix`
- **Markdown:** [markdownlint](https://github.com/DavidAnson/markdownlint) — `npm run lint:md -- --fix`

## Testing

```bash
npm test              # Run unit tests + build types
npm run coverage      # With coverage report
npm run bench         # Performance benchmarks
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
