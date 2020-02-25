# n2words

[![Node CI](https://github.com/forzagreen/n2words/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://www.npmjs.com/package/n2words)

Convert numbers to words, in multiple languages

## Install

```
npm install --save n2words
```

## Usage

```js
var n2words = require('n2words')

n2words(123)                 // 'one hundred and twenty-three'

n2words(123, {lang: 'en'})   // 'one hundred and twenty-three'
n2words(123, {lang: 'fr'})   // 'cent vingt-trois'
n2words(123, {lang: 'es'})   // 'ciento veintitrés'

```

### Supported Languages:

- `en` (English, default)
- `cz` (Czech)
- `dk` (Danish)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `it` (Italian)
- `no` (Norwegian)
- `pt` (Portuguese)
- `ru` (Russian)
- `tr` (Turkish)
