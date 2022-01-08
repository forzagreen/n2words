# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.11.0] - 2022-01-08

### Added
- New language: `hr` Croatian [#61](https://github.com/forzagreen/n2words/pull/61). Thanks to [@lagavuliner](https://github.com/lagavuliner) !

### Fixed
- Fix translations for Serbian [#60](https://github.com/forzagreen/n2words/pull/60) [#61](https://github.com/forzagreen/n2words/pull/61). Thanks to [@lagavuliner](https://github.com/lagavuliner) !


## [1.10.1] - 2021-10-31

### Fixed
- Correct translation of number 18 for NL.mjs [#59](https://github.com/forzagreen/n2words/pull/59). Thanks to [@K4CZP3R](https://github.com/K4CZP3R) !
- Update dev dependencies.


## [1.10.0] - 2021-08-22
### Added
- New language: `id` Indonesian [#58](https://github.com/forzagreen/n2words/pull/58).

### Changed
- Migrate to ES6 classes [#55](https://github.com/forzagreen/n2words/pull/55). Thanks to [@TylerVigario](https://github.com/TylerVigario) !

### Fixed
- Accept numbers as string [#57](https://github.com/forzagreen/n2words/pull/57).


## [1.9.1] - 2021-08-14
### Changed
- Configs: update dependencies, linting, camelCase [#51](https://github.com/forzagreen/n2words/pull/51). Thanks to [@TylerVigario](https://github.com/TylerVigario) !

### Fixed
- Fix Polish translation [#49](https://github.com/forzagreen/n2words/pull/49). Thanks to [@krzyhan](https://github.com/krzyhan) !

## [1.9.0] - 2020-12-19
### Added
- New language: `zh` Chinese [#43](https://github.com/forzagreen/n2words/pull/43). Thanks to [@ljinke](https://github.com/ljinke) !
- New language: `hu` Hungarian [#44](https://github.com/forzagreen/n2words/pull/44).
- Support for negative numbers [#42](https://github.com/forzagreen/n2words/pull/42).

### Changed
- Turkish: added spaces between words, and added `dropSpaces` option [#41](https://github.com/forzagreen/n2words/pull/41).
- Improved linting [#45](https://github.com/forzagreen/n2words/pull/45).


## [1.8.0] - 2020-11-11
### Added
- Support for decimal numbers [#34](https://github.com/forzagreen/n2words/pull/34), [#39](https://github.com/forzagreen/n2words/pull/39). Thanks to [@dylandoamaral](https://github.com/dylandoamaral) !
- New language: `fa` Farsi/Persian [#38](https://github.com/forzagreen/n2words/pull/38). Thanks to [@omarius](https://github.com/omarius) !

### Changed
- Update dev dependencies, move src/ to lib/ [#36](https://github.com/forzagreen/n2words/pull/36). Thanks to [@TylerVigario](https://github.com/TylerVigario) !


## [1.7.1] - 2020-07-10
### Changed
- Dutch (`nl`) Improvements [#31](https://github.com/forzagreen/n2words/issues/31) and [#32](https://github.com/forzagreen/n2words/pull/32).
- Normalize line endings and improve linting [#30](https://github.com/forzagreen/n2words/pull/30).

## [1.7.0] - 2020-04-03
### Added
- New language: `nl` Dutch [#27](https://github.com/forzagreen/n2words/pull/27). Thanks to [@jvanaert](https://github.com/jvanaert) !
- New language: `sr` Serbian [#29](https://github.com/forzagreen/n2words/pull/29)


## [1.6.2] - 2020-03-15

### Changed
- Improve CI/CD: drop TravisCI, use Coveralls from Github Actions [#24](https://github.com/forzagreen/n2words/issues/24), [#25](https://github.com/forzagreen/n2words/issues/25)
- Rename source ES Modules with .mjs extension [#26](https://github.com/forzagreen/n2words/issues/26)


## [1.6.1] - 2020-03-09

### Fixed
- Include src/ in npm publish: [#21](https://github.com/forzagreen/n2words/issues/21)


## [1.6.0] - 2020-03-08
### Added
- Compatibility: CommonJS, ES6, Browser.
- New language: `ar` Arabic [#15](https://github.com/forzagreen/n2words/pull/15)
- New language: `ko` Korean [#18](https://github.com/forzagreen/n2words/pull/18)
- New language: `he` Hebrew [#17](https://github.com/forzagreen/n2words/pull/17)

### Changed
- Refactor project structure. Thanks to [@MeekLogic](https://github.com/MeekLogic) ! [#16](https://github.com/forzagreen/n2words/pull/16) [#19](https://github.com/forzagreen/n2words/pull/19)
  - Build with [webpack](https://webpack.js.org)
  - Unit tests with [ava](https://github.com/avajs/ava)
  - Coverage migrated to [c8](https://github.com/bcoe/c8) : [#20](https://github.com/forzagreen/n2words/pull/20)
  - Linter: [ESLint](https://eslint.org)
  - Modules



## [1.5.0] - 2020-03-01
### Added
- Add browser compatibility, using Babel and Grunt.
- New language: `lv` Latvian [#14](https://github.com/forzagreen/n2words/pull/14)
- New language: `lt` Lithuanian [#13](https://github.com/forzagreen/n2words/pull/13)
- New language: `uk` Ukrainian [#12](https://github.com/forzagreen/n2words/pull/12)
- New language: `pl` Polish [#11](https://github.com/forzagreen/n2words/pull/11)


## [1.4.1] - 2020-02-25
### Added
- New language: `dk` Danish [#9](https://github.com/forzagreen/n2words/pull/9)
- New language: `no` Norwegian [#8](https://github.com/forzagreen/n2words/pull/8)
- New language: `cz` Czech [#7](https://github.com/forzagreen/n2words/pull/7)
- New language: `ru` Russian [#6](https://github.com/forzagreen/n2words/pull/6)

### Changed
- CI/CD: use a fake NPM_TOKEN

### Fixed
- Fix 21 in italian : [#4](https://github.com/forzagreen/n2words/issues/4) , [#5](https://github.com/forzagreen/n2words/pull/5)

## [1.3.2] - 2020-02-14
### Fixed
- Capital letter in German: [#2](https://github.com/forzagreen/n2words/issues/2)
- Replace `eval` with `if else` : [#1](https://github.com/forzagreen/n2words/issues/1)
### Changed
- Update `mochajs` test package to `v7.0.1`

## [1.3.1] - 2019-12-28
### Added
- Support for new language: `tr`.
- CI/CD with GitHub Actions.
- `.npmignore`, `.npmrc`, and publish from CI/CD.
### Changed
- Split tests to one file per language
- Update dev packages

## [1.2.0] - 2019-03-23
### Added
- Support for language: `it`.

## [1.1.0] - 2019-03-18
### Added
- Support for languages: `de`, `pt`.

## [1.0.0] - 2019-03-08
### Added
- Started the n2words project.
- Support for languages: `en`, `fr`, `es`.
- Unit test with Mocha and nyc
- Coverage with coveralls and nyc

