# n2words

[![Node CI](https://github.com/forzagreen/n2words/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://www.npmjs.com/package/n2words)

n2words converts numbers to words. It supports multiple languages.

n2words is a lightweight, easy to use package, with no dependencies. It works both in Node.js and in browsers.

## Install

```sh
npm install n2words
```

n2words is available on [jsDelivr](https://www.jsdelivr.com/package/npm/n2words).

## Usage

### CommonJS

```js
var n2words = require('n2words')
```

### ES6

```js
import n2words from 'n2words'
// or to import source ES Modules without bundle and polyfills
import n2words from 'n2words/lib/n2words.mjs'
```

### Browser

```html
<script src="n2words.min.js"></script>
```

## Example

```js
n2words(123)                 // 'one hundred and twenty-three'

n2words(123, {lang: 'en'})   // 'one hundred and twenty-three'
n2words(123, {lang: 'fr'})   // 'cent vingt-trois'
n2words(123, {lang: 'es'})   // 'ciento veintitrés'
```

## Supported Languages

- `en` (English, default)
- `ar` (Arabic)
- `cz` (Czech)
- `dk` (Danish)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `he` (Hebrew)
- `it` (Italian)
- `ko` (Korean)
- `lt` (Lithuanian)
- `lv` (Latvian)
- `nl` (Dutch)
- `no` (Norwegian)
- `pl` (Polish)
- `pt` (Portuguese)
- `ru` (Russian)
- `sr` (Serbian)
- `tr` (Turkish)
- `uk` (Ukrainian)

## License

MIT
