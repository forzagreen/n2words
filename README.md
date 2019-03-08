# n2words

[![Build Status](https://travis-ci.org/forzagreen/n2words.svg?branch=master)](https://travis-ci.org/forzagreen/n2words)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)

js module to convert numbers to words

## Install

```
npm install forzagreen/n2words
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
- `es` (Spanish)
- `fr` (French)

