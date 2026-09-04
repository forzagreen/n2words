# Changelog

## [6.1.2](https://github.com/forzagreen/n2words/compare/v6.1.1...v6.1.2) (2026-09-04)


### Bug Fixes

* **es-ES,es-US:** apocopate "uno" before a noun — 21000 is "veintiún mil" ([#447](https://github.com/forzagreen/n2words/issues/447)) ([db113df](https://github.com/forzagreen/n2words/commit/db113df9cdf714b9c81b8042d94f200db84354c7))

## [6.1.1](https://github.com/forzagreen/n2words/compare/v6.1.0...v6.1.1) (2026-09-04)


### Bug Fixes

* **es-ES,es-US:** "ciento" is invariable, so 101 feminine is "ciento una" ([5483819](https://github.com/forzagreen/n2words/commit/54838190bdc0fbce554d9df1e9585438c5d42f58))
* **scripts:** stage the site build, and stop two crashes in its tooling ([c3afca0](https://github.com/forzagreen/n2words/commit/c3afca0d3138db67a7ed15440254158abbeadfd1))
* **site:** make the demo agree with itself across async and currency states ([5696999](https://github.com/forzagreen/n2words/commit/569699965eae7a2d9d811a5d6229f579116860c5))

## [6.1.0](https://github.com/forzagreen/n2words/compare/v6.0.1...v6.1.0) (2026-09-04)


### Features

* **cli:** add a shipped n2words command ([#442](https://github.com/forzagreen/n2words/issues/442)) ([249fd22](https://github.com/forzagreen/n2words/commit/249fd2264a3e405c8f6bd7eca6f37c0a2736d82b))

## [6.0.1](https://github.com/forzagreen/n2words/compare/v6.0.0...v6.0.1) (2026-09-02)


## [6.0.0](https://github.com/forzagreen/n2words/compare/v5.2.0...v6.0.0) (2026-09-02)


### ⚠ BREAKING CHANGES

* **core:** `toCurrency`'s `currency` option changes in three ways. Whole
amounts in a language's own currency are unaffected everywhere, and `toCardinal`
and `toOrdinal` are untouched. The zero-subunit guard that an earlier revision of
this footer declared here shipped separately as a fix and is not re-declared.

1. The `currency` option is now validated in the 41 languages that previously
declared `toCurrency(value)` with no options parameter and so discarded it
silently. Passing `{ currency: 'USD' }` to hi-IN returned `पाँच रुपये` ("five
rupees") on 5.1.2 and now throws RangeError naming the accepted set. Affected
languages — am-ET, am-Latn-ET, ar-SA, az-AZ, bn-BD, cs-CZ, da-DK, el-GR,
fa-IR, fi-FI, fil-PH, gu-IN, ha-NG, hbo-IL, he-IL, hi-IN, hr-HR, hu-HU, id-ID,
ja-JP, ka-GE, kn-IN, ko-KR, lt-LT, lv-LV, mr-IN, ms-MY, nb-NO, pa-IN, pl-PL,
ro-RO, sv-SE, sw-KE, ta-IN, te-IN, th-TH, tr-TR, uk-UA, ur-PK, vi-VN, yo-NG.

2. In the 30 languages that already took an options object, an unsupported
`currency` value changes error type from TypeError to RangeError, because
`currency` is now a known key and an out-of-set value is a range problem
rather than a type problem. Callers matching on `instanceof TypeError` must
catch RangeError too. Affected languages — de-DE, en-AU, en-BD, en-CA, en-GB,
en-GH, en-IE, en-IN, en-KE, en-MY, en-NG, en-NZ, en-PH, en-PK, en-SG, en-US,
en-ZA, es-ES, es-MX, es-US, fr-BE, fr-FR, it-IT, nl-NL, pt-PT, ru-RU,
sr-Cyrl-RS, sr-Latn-RS, zh-Hans-CN, zh-Hant-TW. Passing a language's own code
now succeeds where it used to throw, so `toCurrency(5, { currency: 'USD' })`
on en-US returns "five dollars".

3. pt-BR's `currency` option changed from a free-form string to a validated
enum, so three previously-accepted inputs now throw RangeError. `{ currency:
'' }` was the previous documented default and auto-detected BRL; the default is
now the literal `BRL`. `{ currency: 'brl' }` worked because lowercase codes
were uppercased. Any code pt-BR has no words for, such as `{ currency: 'CAD' }`,
was a documented fallback that spelled the bare ISO code, e.g. "cinco CAD".
The currencies pt-BR can name are listed in its exported
`currencyValues.currency`.
* **core:** toCurrency() called through a bare-tag entry point
(n2words/en, n2words/fr, n2words/es, ...) now throws TypeError unless the
`currency` option names a currency. Pass one, or import the region-qualified
entry point (n2words/en-US) to keep a default.

### Features

* **core:** stop bare tags from inheriting a country's default currency ([#436](https://github.com/forzagreen/n2words/issues/436)) ([0788681](https://github.com/forzagreen/n2words/commit/0788681aadc3f5ddac489cf134c30ac64c96f642))
* **core:** separate numerals, currency words, and locale defaults into three layers ([2c76559](https://github.com/forzagreen/n2words/commit/2c76559f696cf85b301714424a7aec97d8e07c23))
* **ar-SA,en-US,fr-BE,fr-FR:** name the Moroccan dirham ([2391ed4](https://github.com/forzagreen/n2words/commit/2391ed4a4974032ff18f132925d11a0194830cfb))
* **core:** name currencies whose minor unit is a thousandth ([db15b83](https://github.com/forzagreen/n2words/commit/db15b83460ff4800f880af99a4847babd045d6f9))
* **core:** generate a currency coverage table in LANGUAGES.md ([ecb48c8](https://github.com/forzagreen/n2words/commit/ecb48c854393df9fbd8fa85899db73afc6b9b0ca))
* **az-AZ,el-GR,fil-PH,ha-NG,hu-HU,ms-MY,sw-KE,th-TH,tr-TR,yo-NG:** migrate to shared currency vocab ([f4c2837](https://github.com/forzagreen/n2words/commit/f4c283702d49670170d1206892246f37e6983e25))
* **da-DK,de-DE,fi-FI,nb-NO,nl-NL,sv-SE,it-IT,ro-RO,pt-PT:** migrate to shared currency vocab ([b326451](https://github.com/forzagreen/n2words/commit/b326451bbdeacd07030aa53c1e528e7b7096fb20))
* **hr-HR,lt-LT,lv-LV,pl-PL,ru-RU,uk-UA:** migrate to shared currency vocab ([83ae697](https://github.com/forzagreen/n2words/commit/83ae69746625eae2483e32f5086f68e2acf3bf90))
* **am-ET,am-Latn-ET,sr-Cyrl-RS,sr-Latn-RS,zh-Hans-CN,zh-Hant-TW,ar-SA,hbo-IL,he-IL,ka-GE:** migrate to shared currency vocab ([7968d8f](https://github.com/forzagreen/n2words/commit/7968d8fd6413bd70b3cda1a025c1d4f587183779))
* **bn-BD,gu-IN,hi-IN,kn-IN,mr-IN,pa-IN,ta-IN,te-IN,ur-PK:** migrate to shared currency vocab ([340992b](https://github.com/forzagreen/n2words/commit/340992bc93e96380a0f308ca85f19ab1d69a6112))
* **en-BD,en-GH,en-IE,en-IN,en-KE,en-MY,en-NG,en-NZ,en-PH,en-PK,en-SG,en-ZA:** migrate to shared currency vocab ([df657a9](https://github.com/forzagreen/n2words/commit/df657a97a4d455b0a14dbf3f47746b272d7fde15))
* **cs-CZ:** migrate to shared currency vocab ([bcbc1cf](https://github.com/forzagreen/n2words/commit/bcbc1cfc19189e56fd0ef3b2b9c8b3e9977f2c29))
* **es-ES,es-MX,es-US:** migrate to shared currency vocab ([fb5dab0](https://github.com/forzagreen/n2words/commit/fb5dab041737ad5ee235105d6afd9aeb514c9c73))
* **fr-FR,fr-BE:** migrate to shared currency vocab ([7f2c825](https://github.com/forzagreen/n2words/commit/7f2c825757f89ed03af538b5c5f7a87ad9aa36f0))
* **en-US,en-CA,en-AU,en-GB:** migrate to shared currency vocab ([5313372](https://github.com/forzagreen/n2words/commit/531337208a3a50c194a2503f167853ab41fe2245))
* **core:** add shared currency-vocab matrix and pt-BR migration ([873c878](https://github.com/forzagreen/n2words/commit/873c87880a66b90a97bc46921ee2840bf0fd4c62))

### Bug Fixes

* **core:** collapse currency coverage to importable bare tags only ([c29e2e5](https://github.com/forzagreen/n2words/commit/c29e2e5b94ebb7ac5995916c7adf754bded91453))
* **types:** stop widening the currency matrix keys to string ([f8e28f6](https://github.com/forzagreen/n2words/commit/f8e28f60be9951a28e9395c5d2023dd9673778a0))
* **core:** drop the (default) marker for single-variant families ([be3411c](https://github.com/forzagreen/n2words/commit/be3411c8043ec3b37b8325794c71e5b019ccc71d))
* **core:** scope the currency-exponent contract to what the parser represents ([421db6e](https://github.com/forzagreen/n2words/commit/421db6ec31dcaf836ba02e289a68271624d55582))
* **core:** narrow minor's nullable type at point of use, not at destructure ([de9b73b](https://github.com/forzagreen/n2words/commit/de9b73b0f98ecd07d9ec54bbc025adad88c01982))
* **core:** narrow minor's nullable type at point of use ([dcb2729](https://github.com/forzagreen/n2words/commit/dcb27293a298704577925f7803b1a1090d72a619))
* **fa-IR,id-ID:** reject fractional amounts for zero-exponent currencies ([349e0bb](https://github.com/forzagreen/n2words/commit/349e0bb57099302c0dd1914e097cc54c8a95d8fb))
* **ja-JP,ko-KR,vi-VN:** reject fractional amounts for zero-exponent currencies ([f50e927](https://github.com/forzagreen/n2words/commit/f50e92742f9b08c0976d5bc18d8a0b048a2af6b3))

## [5.2.0](https://github.com/forzagreen/n2words/compare/v5.1.3...v5.2.0) (2026-09-02)


### Features

* **core:** group LANGUAGES.md by language family, not variant ([5db933a](https://github.com/forzagreen/n2words/commit/5db933a7e99fba553df6129d420c6281463428ef))
* **core:** auto-scaffold bare-tag aliases for new single-variant languages ([f55cdb7](https://github.com/forzagreen/n2words/commit/f55cdb7e7406824e975f857c7344e61b69cc1bde))
* **core:** backfill bare-tag aliases for every single-variant language ([91402dc](https://github.com/forzagreen/n2words/commit/91402dc0d1ff3c3ba3d0f8a60da4af57b87e90ff))
* **core:** refuse to scaffold onto a bare-tag alias file ([a1b8e9a](https://github.com/forzagreen/n2words/commit/a1b8e9a11bdc2ce2e50517f1c8b62e3726362169))
* **core:** exclude bare-tag aliases from LANGUAGES.md's language count ([d5dfd36](https://github.com/forzagreen/n2words/commit/d5dfd3624d496354fd43d5cb2186383456ce991e))
* **core:** add bare-tag language aliases (en, fr, ar, es) ([f19377e](https://github.com/forzagreen/n2words/commit/f19377e8d253a2c5786dd7155a2c9deb543fa223))

## [5.1.3](https://github.com/forzagreen/n2words/compare/v5.1.2...v5.1.3) (2026-09-02)


### Bug Fixes

* **core:** migrate generate-languages-md.js to typescript@7's new compiler API ([1fe4e02](https://github.com/forzagreen/n2words/commit/1fe4e0285f16bc77d24fe9e537298448fa69fbfa))
* **fa-IR,id-ID,ja-JP,ko-KR,vi-VN:** reject fractional amounts for currencies with no minor unit ([ec5d941](https://github.com/forzagreen/n2words/commit/ec5d941f65f9249c258cc5f1678ad44591ebdcb1))

## [5.1.2](https://github.com/forzagreen/n2words/compare/v5.1.1...v5.1.2) (2026-07-14)


### Bug Fixes

* **hr-HR:** feminine number words before -arda scale words ([#414](https://github.com/forzagreen/n2words/issues/414)) ([99c424e](https://github.com/forzagreen/n2words/commit/99c424ed0e9fdcd5139156331df05598fc22c5f4))

## [5.1.1](https://github.com/forzagreen/n2words/compare/v5.1.0...v5.1.1) (2026-07-02)


### Bug Fixes

* **sr-Cyrl-RS,sr-Latn-RS:** feminine number words before -arda scale words ([#413](https://github.com/forzagreen/n2words/issues/413)) ([075ae2e](https://github.com/forzagreen/n2words/commit/075ae2ed531823225403aedf1629e14ac9f1956e))

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
