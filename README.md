# n2words

[![Node CI](https://github.com/forzagreen/n2words/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![Gitter](https://img.shields.io/gitter/room/forzagreen/n2words)](https://gitter.im/forzagreen/n2words)

n2words converts numbers to words. It supports multiple languages.

n2words is a lightweight, easy to use package, with no dependencies. It works both in Node.js and in browsers.

## Install

```sh
npm install n2words
```

n2words is available on [jsDelivr](https://jsdelivr.com/package/npm/n2words).

## Usage

### CommonJS

```js
var n2words = require('n2words')

// Dynamic Import (source files)
import('n2words/lib/n2words.mjs').then(n2words => {
    // Available via "default" method
    n2words.default(100)
})

// Individual languages
import('n2words/lib/i18n/EN.mjs').then(n2wordsEN => {
    n2wordsEN.default(100)
})
```

### ESM

```js
import n2words from 'n2words'

// ES6+
import n2words from 'n2words/lib/n2words.mjs'

// Individual languages
import n2wordsEN from 'n2words/lib/i18n/EN.mjs'
```

### Browser

```html
<script src="n2words.js"></script>
```

## Example

```js
n2words(123)   // 'one hundred and twenty-three'
n2words(-1.5)  // 'minus one point five'

n2words(123, {lang: 'en'})  // 'one hundred and twenty-three'
n2words(123, {lang: 'fr'})  // 'cent vingt-trois'
n2words(123, {lang: 'es'})  // 'ciento veintitrés'
```

## Features

- Cardinal numbers
- Decimal numbers
- Negative numbers

## Supported Languages

- `en` (English, default)
- `ar` (Arabic)
- `cz` (Czech)
- `dk` (Danish)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `fa` (Farsi)
- `he` (Hebrew)
- `hu` (Hungarian)
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
- `zh` (Chinese)


## Contributing

You can help by adding a new language, or by imporving existing languages (report issues, verify the correctness of unit tests, add more test cases...).

All help is welcome !

## License

MIT
