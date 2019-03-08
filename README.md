# num2words

[![Build Status](https://travis-ci.org/forzagreen/num2words.svg?branch=master)](https://travis-ci.org/forzagreen/num2words)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/num2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/num2words?branch=master)

js module to convert numbers to words

## Install

```
npm install forzagreen/num2words
```

## Usage

```js
var num2words = require('num2words')

num2words(123)                 // 'one hundred and twenty-three'

num2words(123, {lang: 'en'})   // 'one hundred and twenty-three'
num2words(123, {lang: 'fr'})   // 'cent vingt-trois'
num2words(123, {lang: 'es'})   // 'ciento veintitrés'

```

### Supported Languages:

- `en` (English, default)
- `es` (Spanish)
- `fr` (French)

