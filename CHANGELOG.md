# Changelog

## [3.0.0](https://github.com/forzagreen/n2words/compare/n2words-v2.0.0...n2words-v3.0.0) (2026-01-07)


### ⚠ BREAKING CHANGES

* v3.0.0 - functional architecture with major performance gains ([#206](https://github.com/forzagreen/n2words/issues/206))
* **test:** Test file locations changed (unit tests now in subdirectories)
* npm run lang:validate no longer exists. Use npm test.
* Dutch option `noHundredPairs` renamed to `noHundredPairing`

### Features

* add support for fr-BE ([#126](https://github.com/forzagreen/n2words/issues/126)) ([743fdf6](https://github.com/forzagreen/n2words/commit/743fdf6c0b5bd053637756d131ff6197cf0ab46b))
* **lang:** add Amharic language support (am, am-Latn) ([#198](https://github.com/forzagreen/n2words/issues/198)) ([04e9852](https://github.com/forzagreen/n2words/commit/04e98521449a64255ef56807137754a33f64db23))
* **lang:** add Finnish language support ([#197](https://github.com/forzagreen/n2words/issues/197)) ([2dc13a8](https://github.com/forzagreen/n2words/commit/2dc13a8c2a50bee64c2f2135d8435e6d689b50d4))
* **lang:** add Hausa language support (ha) ([#199](https://github.com/forzagreen/n2words/issues/199)) ([26cff70](https://github.com/forzagreen/n2words/commit/26cff70f5534920a6634ffad11b19c2fb2181a9e))
* v3.0.0 - functional architecture with major performance gains ([#206](https://github.com/forzagreen/n2words/issues/206)) ([f335859](https://github.com/forzagreen/n2words/commit/f335859c26c6451df83ac4e86c6b10c69295ca24))


### Bug Fixes

* 2 German capital letters ([2faa220](https://github.com/forzagreen/n2words/commit/2faa2205fb856d32b140921e75aeca316035499d))
* 3 ([a378643](https://github.com/forzagreen/n2words/commit/a3786437c458afd3521ed4b89e157a68ad518682))
* **ci:** remove duplicate Node 24 test run ([#210](https://github.com/forzagreen/n2words/issues/210)) ([4875a61](https://github.com/forzagreen/n2words/commit/4875a61822789a48480290386572d8cf5c3bd6cb))
* coverage badge ([#164](https://github.com/forzagreen/n2words/issues/164)) ([280198e](https://github.com/forzagreen/n2words/commit/280198eba4b2d872a00bf1e49efb9d69f00d89a7))
* Czech variable separator word ([#75](https://github.com/forzagreen/n2words/issues/75)) ([bab3b84](https://github.com/forzagreen/n2words/commit/bab3b8471447ed47d06e16873353b66d76960e62))
* fix & improve AR ([#137](https://github.com/forzagreen/n2words/issues/137)) ([ee45900](https://github.com/forzagreen/n2words/commit/ee45900d3b56efa6f9297944c18e992b8a3a8569))
* refactor input handling and validation in language converters ([#192](https://github.com/forzagreen/n2words/issues/192)) ([b869582](https://github.com/forzagreen/n2words/commit/b86958264e03304529fe4aad9915aec379a7a751))
* remove console.log ([aea1b3e](https://github.com/forzagreen/n2words/commit/aea1b3ecded7c9e841e09efa2f66d15c4a230f16))
* Update Polish translation ([#49](https://github.com/forzagreen/n2words/issues/49)) ([24e3031](https://github.com/forzagreen/n2words/commit/24e30313ae916282cbcd8d09cca8e833d9c7cc0e))


### Performance Improvements

* add segment-based ScaleLanguage for 10x faster conversion ([#205](https://github.com/forzagreen/n2words/issues/205)) ([3520bcd](https://github.com/forzagreen/n2words/commit/3520bcdc381f7f9ffbbecc239b5e09ad5e1c7364))


### Code Refactoring

* consolidate test suite and replace validation script ([#202](https://github.com/forzagreen/n2words/issues/202)) ([11d3051](https://github.com/forzagreen/n2words/commit/11d30513bcbe9344e1654c7f15852d75d7d353db))
* improve naming consistency and documentation accuracy ([#194](https://github.com/forzagreen/n2words/issues/194)) ([8d48709](https://github.com/forzagreen/n2words/commit/8d48709736bba3fc37a8310ea1c65d4d45b47ab2))
* **test:** implement file-level testing architecture ([#203](https://github.com/forzagreen/n2words/issues/203)) ([4b9a4f9](https://github.com/forzagreen/n2words/commit/4b9a4f984bacd9937028d1d93c0e4398269638cc))
