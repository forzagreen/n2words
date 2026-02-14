# Changelog

## [4.0.0](https://github.com/forzagreen/n2words/compare/v3.1.0...v4.0.0) (2026-02-14)


### ⚠ BREAKING CHANGES

* rename all generic language codes to BCP 47 locale-specific codes ([#242](https://github.com/forzagreen/n2words/issues/242))
* **es:** split Spanish into locale-specific variants ([#241](https://github.com/forzagreen/n2words/issues/241))
* remove index.js barrel, use subpath exports only ([#235](https://github.com/forzagreen/n2words/issues/235))
* rename toWords to toCardinal, form-agnostic architecture ([#234](https://github.com/forzagreen/n2words/issues/234))
* **lang:** split English into en-GB and en-US with extended scales and options ([#232](https://github.com/forzagreen/n2words/issues/232))
* ESM-first browser bundles ([#225](https://github.com/forzagreen/n2words/issues/225))

### Features

* add 14 English locale variants ([#255](https://github.com/forzagreen/n2words/issues/255)) ([1b87dd9](https://github.com/forzagreen/n2words/commit/1b87dd949e531f23e3865e318469c58dd24ae811))
* add toOrdinal and toCurrency to 44 languages ([#256](https://github.com/forzagreen/n2words/issues/256)) ([35bdc9b](https://github.com/forzagreen/n2words/commit/35bdc9bfd17d783221252a6a8ab3d7a3652dda12))
* **de-DE:** add toOrdinal and toCurrency functions ([#245](https://github.com/forzagreen/n2words/issues/245)) ([59d13fb](https://github.com/forzagreen/n2words/commit/59d13fbe0f68e5902e008611d1edd0bffba17243))
* **en-GB:** add toOrdinal and toCurrency functions ([#243](https://github.com/forzagreen/n2words/issues/243)) ([c651780](https://github.com/forzagreen/n2words/commit/c651780d1d17c0efe238cc1d1d86fb6ad1d8e115))
* **en-US:** add toCurrency function for currency words ([#237](https://github.com/forzagreen/n2words/issues/237)) ([44243b7](https://github.com/forzagreen/n2words/commit/44243b7e0dc69ad5c6075fca9ff9f25ab4e84ce6))
* **en-US:** add toOrdinal function for ordinal number words ([#233](https://github.com/forzagreen/n2words/issues/233)) ([4db67bf](https://github.com/forzagreen/n2words/commit/4db67bffe89607c5142420f9e137364b471b6fcb))
* ESM-first browser bundles ([#225](https://github.com/forzagreen/n2words/issues/225)) ([e97d895](https://github.com/forzagreen/n2words/commit/e97d89594c5cd516751d186e92f37fb06bb0d4bd))
* **es:** split Spanish into locale-specific variants ([#241](https://github.com/forzagreen/n2words/issues/241)) ([d301733](https://github.com/forzagreen/n2words/commit/d30173371f560967259235e3bc21595a72e53847))
* **fr-FR:** add toOrdinal and toCurrency functions ([#246](https://github.com/forzagreen/n2words/issues/246)) ([b95e513](https://github.com/forzagreen/n2words/commit/b95e5130259209af5c453c17402542500e7bf911))
* **it-IT:** add toOrdinal and toCurrency functions ([#247](https://github.com/forzagreen/n2words/issues/247)) ([93ea3eb](https://github.com/forzagreen/n2words/commit/93ea3eb76b7c8056f36f924b4c08639158ff469c))
* **lang:** split English into en-GB and en-US with extended scales and options ([#232](https://github.com/forzagreen/n2words/issues/232)) ([8e4a0df](https://github.com/forzagreen/n2words/commit/8e4a0dfc3cdd46dd3c7a9ced5419177c86dbf77a))
* **nl-NL:** add toOrdinal and toCurrency functions ([#249](https://github.com/forzagreen/n2words/issues/249)) ([abcac65](https://github.com/forzagreen/n2words/commit/abcac65fce57481e8c3827afc3f439958bdec717))
* **pt-PT:** add toOrdinal and toCurrency functions ([#248](https://github.com/forzagreen/n2words/issues/248)) ([0d7d972](https://github.com/forzagreen/n2words/commit/0d7d97218a904d2408eba56b08db4dc41a96407a))
* **ru-RU:** add toOrdinal and toCurrency functions ([#244](https://github.com/forzagreen/n2words/issues/244)) ([86ad7a3](https://github.com/forzagreen/n2words/commit/86ad7a3858e42580b12177d9d507929c15cba475))


### Bug Fixes

* **deps-dev:** update dependencies to resolve tar vulnerability ([#230](https://github.com/forzagreen/n2words/issues/230)) ([1f86240](https://github.com/forzagreen/n2words/commit/1f862409abc42a3393187b0380eb3dc52f12e681))
* **es-MX,fa-IR:** correct number scale implementations ([#250](https://github.com/forzagreen/n2words/issues/250)) ([ab05310](https://github.com/forzagreen/n2words/commit/ab05310d1fa847c86da493a0ea09ea31e51781ae))


### Code Refactoring

* remove index.js barrel, use subpath exports only ([#235](https://github.com/forzagreen/n2words/issues/235)) ([782768b](https://github.com/forzagreen/n2words/commit/782768b29b27c0b0932e88408187c76c378baa44))
* rename all generic language codes to BCP 47 locale-specific codes ([#242](https://github.com/forzagreen/n2words/issues/242)) ([8a8328d](https://github.com/forzagreen/n2words/commit/8a8328dea0d3bc09789192e2092c388f4878e6d3))
* rename toWords to toCardinal, form-agnostic architecture ([#234](https://github.com/forzagreen/n2words/issues/234)) ([1648e1a](https://github.com/forzagreen/n2words/commit/1648e1a423621be183cd92b68a485c0bc2e2a684))

## [3.1.0](https://github.com/forzagreen/n2words/compare/v3.0.0...v3.1.0) (2026-01-08)


### Features

* **ka:** add Georgian language support ([#218](https://github.com/forzagreen/n2words/issues/218)) ([a7c5142](https://github.com/forzagreen/n2words/commit/a7c5142f6cc08a237e6e3f803f1b8298621c70f1))
* **yo:** add Yoruba language support ([#221](https://github.com/forzagreen/n2words/issues/221)) ([60680b0](https://github.com/forzagreen/n2words/commit/60680b09aebe8a04cb841eff9a874a08bc955c67))


### Bug Fixes

* **lang:** remove precomputed lookup tables from all languages ([#224](https://github.com/forzagreen/n2words/issues/224)) ([fbe0c7b](https://github.com/forzagreen/n2words/commit/fbe0c7b7115e5a3e63a92945e865b75ff919ebb0))

## 3.0.0 - Functional Architecture

Complete rewrite from class-based to functional architecture with major performance improvements.

### ⚠ BREAKING CHANGES

**Migration required** - API has changed:

#### From v1.x (default export)

> **Note:** v1 bundled all languages into a single wrapper function with runtime language selection via `{ lang: 'es' }`. v3 requires explicit language imports for tree-shaking—only the languages you import are included in your bundle.

| Context | v1 | v3 |
|---------|----|----|
| **Import (all)** | `import n2words from 'n2words'` | `import { en, es } from 'n2words'` |
| **Import (single)** | `import es from 'n2words/languages/es'` | `import { toWords } from 'n2words/es'` |
| **Usage** | `n2words(42, { lang: 'es' })` | `es(42)` or `toWords(42)` |
| **Browser** | `n2words(42, { lang: 'es' })` | `n2words.es(42)` |
| **CDN (single)** | `.../dist/languages/es.js` | `.../dist/languages/es.js` (unchanged) |

#### From v2.x (class-based)

| Context | v2 | v3 |
|---------|----|----|
| **Import (all)** | `import { EnglishConverter } from 'n2words'` | `import { en } from 'n2words'` |
| **Import (single)** | `import { EnglishConverter } from 'n2words/en'` | `import { toWords } from 'n2words/en'` |
| **Usage** | `EnglishConverter(42)` | `en(42)` or `toWords(42)` |
| **Browser** | `n2words.EnglishConverter(42)` | `n2words.en(42)` |
| **CDN (single)** | `.../dist/EnglishConverter.js` | `.../dist/languages/en.js` |

### Highlights

- **3x-85x faster** conversion across languages
- **70-96% less memory** per conversion
- **75-92% smaller** per-language bundles
- **52 languages** - all self-contained, tree-shakeable modules

### New Languages

`am` (Amharic), `am-Latn` (Amharic Latin), `fi` (Finnish), `ha` (Hausa), `hbo` (Biblical Hebrew), `sr-Cyrl` (Serbian Cyrillic), `zh-Hant` (Traditional Chinese)

### Performance Improvements

- Precomputed lookup tables (en, pt, he, hbo)
- BigInt modulo instead of string slicing (ja, sw)
- Eliminated class instantiation overhead

---
See [#206](https://github.com/forzagreen/n2words/pull/206) for full details.
