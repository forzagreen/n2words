# n2words

[![Test](https://github.com/forzagreen/n2words/workflows/Test/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)

n2words is a library that converts a numerical number into a written number.

We have support for multiple languages (27 and growing) and our package is lightweight, modular and has no dependencies.

## How To

```js
n2words(123)   // 'one hundred and twenty-three'
n2words(-1.5)  // 'minus one point five'

n2words(123, {lang: 'fr'})  // 'cent vingt-trois'
n2words(123, {lang: 'es'})  // 'ciento veintitrés'
n2words(123, {lang: 'ar'})  // 'مائة و ثلاثة و عشرون'
```

## Install

```sh
npm install n2words
```

n2words is also available on [jsDelivr](https://jsdelivr.com/package/npm/n2words).

## Usage

### ESM

```js
import n2words from 'n2words'

// Individual languages (recommended)
import n2wordsEN from 'n2words/i18n/EN.js'
```

### CommonJS

```js
// Dynamic Import
import('n2words').then(n2words => {
    // Available via "default" method
    n2words.default(100)
})

// Individual languages
import('n2words/i18n/EN.js').then(n2wordsEN => {
    n2wordsEN.default(100)
})
```

### Browser

```html
<script src="dist/n2words.js"></script>
```

## Features

- Cardinal numbers
- Decimal numbers
- Negative numbers

## Supported Languages

- `en` (English, default)
- `ar` (Arabic)
- `az` (Azerbaijani)
- `cz` (Czech)
- `dk` (Danish)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `fa` (Farsi)
- `he` (Hebrew)
- `hr` (Croatian)
- `hu` (Hungarian)
- `id` (Indonesian)
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
- `vi` (Vietnamese)
- `zh` (Chinese)

## Contributing

You can help by adding new languages or by improving existing ones. Also, reporting issues, verifying the correctness of unit tests or adding more test cases is extremely helpful.

All help is welcome!

## License

MIT
