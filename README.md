# n2words

[![Test](https://github.com/forzagreen/n2words/workflows/Test/badge.svg?branch=master)](https://github.com/forzagreen/n2words/actions)
[![Coverage Status](https://coveralls.io/repos/github/forzagreen/n2words/badge.svg?branch=master)](https://coveralls.io/github/forzagreen/n2words?branch=master)
[![npm](https://img.shields.io/npm/v/n2words.svg)](https://npmjs.com/package/n2words)
[![npm](https://img.shields.io/npm/dw/n2words)](https://npmjs.com/package/n2words)
[![](https://data.jsdelivr.com/v1/package/npm/n2words/badge)](https://www.jsdelivr.com/package/npm/n2words)

__n2words__ converts a numerical number into a written one. We support [27 languages](https://github.com/forzagreen/n2words#supported-languages) (and growing) while having zero dependencies.

## Example

```js
n2words(123)   // 'one hundred and twenty-three'
n2words(-1.5)  // 'minus one point five'

n2words(123, {lang: 'fr'})  // 'cent vingt-trois'
n2words(123, {lang: 'es'})  // 'ciento veintitrés'
n2words(123, {lang: 'ar'})  // 'مائة و ثلاثة و عشرون'
```

See the [Wiki](https://github.com/forzagreen/n2words/wiki) for examples and advanced usage.

## Install

```sh
npm install n2words
```

n2words is also available on [jsDelivr](https://jsdelivr.com/package/npm/n2words).

## Usage

### ESM

```js
import n2words from 'n2words'
```

### CommonJS

```js
// Dynamic Import
import('n2words').then(n2words => {
    // Available via "default" method
    n2words.default(100)
})
```

### Browser

```html
<script src="n2words.js"></script>
<script>
    n2words(100)
</script>
```

You can also [import only specific languages](https://github.com/forzagreen/n2words/wiki/Importing-only-specific-languages) if you don't need all of them.

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

__This library is in active development.__ We are looking to improve the design and process for language contributors as well as add more languages.
## License

[MIT](https://github.com/forzagreen/n2words/blob/master/LICENSE)
