# n2words

[![Node CI](https://github.com/forzagreen/n2words/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://www.npmjs.com/package/n2words)

n2words onverts numbers to words. It supports multiple languages.

n2words is a lightweight, easy to use package, with no dependencies. It works both in Node.js and in browsers.

## Usage

```js
var n2words = require('n2words')

n2words(123)                 // 'one hundred and twenty-three'

n2words(123, {lang: 'en'})   // 'one hundred and twenty-three'
n2words(123, {lang: 'fr'})   // 'cent vingt-trois'
n2words(123, {lang: 'es'})   // 'ciento veintitrés'

```

## Install

### Node.js

```sh
npm install n2words
```

### Browser:

```html
<script src="n2words.min.js"></script>
```
n2words is available on [jsDelivr](https://www.jsdelivr.com/package/npm/n2words).

## Supported Languages:

- `en` (English, default)
- `cz` (Czech)
- `dk` (Danish)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `it` (Italian)
- `no` (Norwegian)
- `pl` (Polish)
- `pt` (Portuguese)
- `ru` (Russian)
- `tr` (Turkish)

## License

MIT
