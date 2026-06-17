# Changelog

## [5.1.0](https://github.com/forzagreen/n2words/compare/v5.0.0...v5.1.0) (2026-06-17)


### Features

* **core:** prove the options contract on en-US ([#390](https://github.com/forzagreen/n2words/issues/390)) ([141fe04](https://github.com/forzagreen/n2words/commit/141fe049e3b55c2a31c4cca43d0296926590cf74))
* **core:** scaffold the range contract in lang:add ([#389](https://github.com/forzagreen/n2words/issues/389)) ([b90ed05](https://github.com/forzagreen/n2words/commit/b90ed05ad7cbfffb972fb41baaf76b5c9c90eb04))
* **core:** prove the range-contract shape on four representative languages ([#372](https://github.com/forzagreen/n2words/issues/372)) ([04c3e46](https://github.com/forzagreen/n2words/commit/04c3e4690400e1623b6078a6920df8b00bedfbba))

### Bug Fixes

* **ro-RO:** insert "de" before the currency unit for 20+ ([#404](https://github.com/forzagreen/n2words/issues/404)) ([c420c82](https://github.com/forzagreen/n2words/commit/c420c8240d4ecc3473e8f87321d5016ac0a21581))
* **scripts:** stop lang:add overwriting work-in-progress files ([#400](https://github.com/forzagreen/n2words/issues/400)) ([24cb02c](https://github.com/forzagreen/n2words/commit/24cb02c2573afce4ea6db2b1aad980b57f443b42))
* **vi-VN:** correct large-scale vocabulary and migrate to the range contract ([#386](https://github.com/forzagreen/n2words/issues/386)) ([073e4c1](https://github.com/forzagreen/n2words/commit/073e4c14cee100be87e603db5a2eb37be4ee82f0))
* **core:** repoint the western batch's exceedsMax import to exceeds-max.js ([#376](https://github.com/forzagreen/n2words/issues/376)) ([ca80dc7](https://github.com/forzagreen/n2words/commit/ca80dc7b3b2c2b576593bc9764e8a186a0b82576))
* **ka-GE:** guard scale ceiling ([#371](https://github.com/forzagreen/n2words/issues/371)) ([3362118](https://github.com/forzagreen/n2words/commit/3362118f9ecde17c870b198315f494816f7c5c21))
* **bn-BD,gu-IN,hi-IN,kn-IN,mr-IN,pa-IN,ta-IN,te-IN,ur-PK:** guard scale ceilings ([#370](https://github.com/forzagreen/n2words/issues/370)) ([8968c52](https://github.com/forzagreen/n2words/commit/8968c52d314de59fe7b3f2fff012bd74bd04b734))
* **core:** gate only the conversion forms a language exports ([#367](https://github.com/forzagreen/n2words/issues/367)) ([1a3b225](https://github.com/forzagreen/n2words/commit/1a3b2251aa18ba91c3f756c1ecb40cdae9e5ac29))
* **en:** guard scale ceilings across the en-* family ([#363](https://github.com/forzagreen/n2words/issues/363)) ([cb06f2d](https://github.com/forzagreen/n2words/commit/cb06f2dd51a826b5b2108bdbaf7ea14aefc11e9f))
* **it-IT,ja-JP,vi-VN,cs-CZ,ro-RO:** guard scale ceilings ([#364](https://github.com/forzagreen/n2words/issues/364)) ([c0cf69f](https://github.com/forzagreen/n2words/commit/c0cf69f54a508c1f7e4fb5fef6b3fdbdee7590bc))
* **el-GR,ar-SA,ha-NG,fil-PH,ms-MY,sw-KE,id-ID,ko-KR:** guard scale ceilings ([#362](https://github.com/forzagreen/n2words/issues/362)) ([76c1034](https://github.com/forzagreen/n2words/commit/76c103464788b9c03ab5a0881d63919803aa42bf))
* **nb-NO,sv-SE,fi-FI:** guard scale ceilings in the Nordic group ([#361](https://github.com/forzagreen/n2words/issues/361)) ([02cd569](https://github.com/forzagreen/n2words/commit/02cd569084057032ccb5176b71a62ebbb4c4bcd4))
* **ru-RU,uk-UA,pl-PL,hr-HR:** guard scale ceilings in the Slavic group ([#360](https://github.com/forzagreen/n2words/issues/360)) ([2a759c0](https://github.com/forzagreen/n2words/commit/2a759c0bf3e072b04873447fa19fcf4e93fb5633))
* **lt-LT,lv-LV:** guard scale ceilings in the Baltic pair ([#359](https://github.com/forzagreen/n2words/issues/359)) ([2207d12](https://github.com/forzagreen/n2words/commit/2207d121104ec562fec66194e237f223d733afa7))
* **de-DE,nl-NL:** guard scale ceilings in the Germanic pair ([#358](https://github.com/forzagreen/n2words/issues/358)) ([e8c16cf](https://github.com/forzagreen/n2words/commit/e8c16cfb7d7062af55c4c7e439ab634c078b745b))
* **az-AZ,tr-TR:** guard scale ceiling in az-AZ, tr-TR ([#357](https://github.com/forzagreen/n2words/issues/357)) ([9d73897](https://github.com/forzagreen/n2words/commit/9d7389743fffefa02908936b62c0ea0a922614ff))
* **he:** guard scale ceilings in he-IL, hbo-IL ([#356](https://github.com/forzagreen/n2words/issues/356)) ([c401e6c](https://github.com/forzagreen/n2words/commit/c401e6c7e3d92a826e116cdf346d71e49605369d))
* **am:** guard scale ceiling in am-ET, am-Latn-ET ([#355](https://github.com/forzagreen/n2words/issues/355)) ([77d9083](https://github.com/forzagreen/n2words/commit/77d90830593626a798ba309aff8d92305e98450b))
* **zh:** guard scale ceiling in zh-Hans-CN, zh-Hant-TW ([#353](https://github.com/forzagreen/n2words/issues/353)) ([4bb2b90](https://github.com/forzagreen/n2words/commit/4bb2b901763e0d1eeb1e149d3f6bee3a2b9497ac))
* **sr:** guard scale ceilings in sr-Cyrl-RS, sr-Latn-RS ([#352](https://github.com/forzagreen/n2words/issues/352)) ([93a86d2](https://github.com/forzagreen/n2words/commit/93a86d25ec479ddd0a49168829da2d2becf1fcd9))
* **pt:** guard scale ceilings in pt-BR, pt-PT ([#351](https://github.com/forzagreen/n2words/issues/351)) ([02d28cd](https://github.com/forzagreen/n2words/commit/02d28cd01b8c2ce48bcd78713925b1ca2516379d))
* **fr:** guard scale ceilings in fr-FR, fr-BE (+ retrofit da-DK to entry-point guards) ([#349](https://github.com/forzagreen/n2words/issues/349)) ([498537b](https://github.com/forzagreen/n2words/commit/498537bfea36110d0610ad754bdab190cf9380c5))
* **es:** guard the decimal part against the scale ceiling ([#350](https://github.com/forzagreen/n2words/issues/350)) ([52b738e](https://github.com/forzagreen/n2words/commit/52b738ebbd1d89a05aa4a92a7260be7b00cfe506))
* **es:** guard scale ceilings in es-ES, es-MX, es-US ([#348](https://github.com/forzagreen/n2words/issues/348)) ([1b1bf3f](https://github.com/forzagreen/n2words/commit/1b1bf3f64bf97c62434cb3bf1400d22927373197))
* **da-DK:** correct scale-group joining and guard the scale ceiling ([#347](https://github.com/forzagreen/n2words/issues/347)) ([e8bd4c6](https://github.com/forzagreen/n2words/commit/e8bd4c63baf1c30275554c4559bab7b8b5b19c39))
* **core:** declare @types/node devDependency ([#317](https://github.com/forzagreen/n2words/issues/317)) ([2db4796](https://github.com/forzagreen/n2words/commit/2db47962d5069c97faac7276e09442ab8285dee0))
* **scripts:** make lang:add output lint-clean and canonicalize the code ([#312](https://github.com/forzagreen/n2words/issues/312)) ([8dfc52e](https://github.com/forzagreen/n2words/commit/8dfc52e1df2947a0ad266b69181555d38ff0706b))

## [5.0.0](https://github.com/forzagreen/n2words/compare/v4.0.0...v5.0.0) (2026-05-30)


### ⚠ BREAKING CHANGES

* require Node.js >=22, drop EOL Node 20 ([#287](https://github.com/forzagreen/n2words/issues/287))

### Features

* add Brazilian Portuguese (pt-BR) support ([#275](https://github.com/forzagreen/n2words/issues/275))

### Bug Fixes

* **types:** add typesVersions to support CommonJS imports in TypeScript ([#301](https://github.com/forzagreen/n2words/issues/301))

## [4.0.0](https://github.com/forzagreen/n2words/compare/v3.1.0...v4.0.0) (2026-03-05)


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

* **core:** pre-v4 audit fixes for parsers and exports ([#262](https://github.com/forzagreen/n2words/issues/262)) ([33d257b](https://github.com/forzagreen/n2words/commit/33d257be6cd3d62b3ae4e62a0551fb5d12ad637e))
* **core:** pre-v4 audit fixes for parsers and exports ([#264](https://github.com/forzagreen/n2words/issues/264)) ([0268988](https://github.com/forzagreen/n2words/commit/0268988871154133f8cb88ab8e399d1d4a9a64f3))
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
