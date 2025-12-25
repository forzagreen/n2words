# Browser Usage Guide

Complete guide for using n2words in web browsers.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
- [Usage Patterns](#usage-patterns)
- [Module Formats](#module-formats)
- [Browser Compatibility](#browser-compatibility)
- [Bundle Optimization](#bundle-optimization)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

### CDN (Easiest)

```html
<!DOCTYPE html>
<html>
<head>
  <title>n2words Example</title>
</head>
<body>
  <h1>Number to Words</h1>
  <input type="number" id="numberInput" value="42">
  <button onclick="convert()">Convert</button>
  <p id="output"></p>

  <script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
  <script>
    function convert() {
      const num = document.getElementById('numberInput').value
      const words = n2words.EnglishConverter(parseInt(num))
      document.getElementById('output').textContent = words
    }
  </script>
</body>
</html>
```

## Installation Methods

### 1. CDN (jsdelivr)

Latest version:

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
```

Specific version:

```html
<script src="https://cdn.jsdelivr.net/npm/n2words@2.0.0/dist/n2words.js"></script>
```

### 2. CDN (unpkg)

```html
<script src="https://unpkg.com/n2words/dist/n2words.js"></script>
```

### 3. NPM + Bundler

```bash
npm install n2words
```

Then use with a bundler (Webpack, Rollup, Vite, Parcel, esbuild):

```javascript
// Import only what you need for smaller bundles
import { EnglishConverter, SpanishConverter } from 'n2words'

document.getElementById('btn').onclick = () => {
  const result = EnglishConverter(42)
  console.log(result)  // 'forty-two'
}
```

### 4. ES Modules in Browser

Modern browsers support ES modules directly:

```html
<script type="module">
  import { EnglishConverter } from 'https://cdn.jsdelivr.net/npm/n2words/+esm'

  console.log(EnglishConverter(42))  // 'forty-two'
</script>
```

## Usage Patterns

### Global UMD Build

When loaded via CDN, n2words is available as a global object:

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  // All converters available under n2words namespace
  console.log(n2words.EnglishConverter(42))
  console.log(n2words.SpanishConverter(42))
  console.log(n2words.FrenchConverter(42))
  console.log(n2words.GermanConverter(42))
  console.log(n2words.JapaneseConverter(42))
</script>
```

### ES Modules

Modern bundlers and browsers support ES modules:

```javascript
import { EnglishConverter, SpanishConverter } from 'n2words'

// Use converters
const english = EnglishConverter(123)
const spanish = SpanishConverter(123)
```

### Dynamic Language Selection

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  const converters = {
    en: n2words.EnglishConverter,
    es: n2words.SpanishConverter,
    fr: n2words.FrenchConverter,
    de: n2words.GermanConverter,
    ja: n2words.JapaneseConverter
  }

  function convertWithLanguage(number, lang) {
    const converter = converters[lang]
    if (!converter) {
      throw new Error(`Language '${lang}' not supported`)
    }
    return converter(number)
  }

  // Usage
  console.log(convertWithLanguage(42, 'en'))  // 'forty-two'
  console.log(convertWithLanguage(42, 'es'))  // 'cuarenta y dos'
</script>
```

## Module Formats

### UMD (Universal Module Definition)

The browser build (`dist/n2words.js`) uses UMD format, which works:

- As a global variable (`window.n2words`)
- With AMD loaders (RequireJS)
- With CommonJS (Node.js)

```html
<script src="n2words.js"></script>
<script>
  // Available as global
  window.n2words.EnglishConverter(42)

  // Or just
  n2words.EnglishConverter(42)
</script>
```

### ESM (ES Modules)

Use with modern bundlers or native browser support:

```javascript
// Node.js / Bundlers
import { EnglishConverter } from 'n2words'

// Browser (via CDN with ESM support)
import { EnglishConverter } from 'https://cdn.jsdelivr.net/npm/n2words/+esm'
```

## Browser Compatibility

### Minimum Requirements

n2words works in all modern browsers with ES6+ support:

- ✅ Chrome 51+
- ✅ Firefox 54+
- ✅ Safari 10+
- ✅ Edge 79+ (Chromium-based)
- ✅ Opera 38+

### Required Features

- ES6 Classes
- BigInt support (for large numbers)
- Template literals
- Arrow functions
- Spread operator

### Polyfills

For older browsers, you may need polyfills:

```html
<!-- BigInt polyfill for IE11/older browsers -->
<script src="https://cdn.jsdelivr.net/npm/jsbi@3/dist/jsbi-umd.js"></script>

<!-- Core-js for other ES6+ features -->
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle@3/minified.js"></script>

<!-- Then load n2words -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
```

## Bundle Optimization

### Tree-Shaking

When using bundlers, import only what you need:

```javascript
// ✓ Good: Only includes English and Spanish in bundle
import { EnglishConverter, SpanishConverter } from 'n2words'

// ✗ Bad: Includes all languages
import * as n2words from 'n2words'
```

### Bundle Size Estimates

Approximate gzipped sizes:

- **Full library** (all 47 languages): ~45 KB gzipped
- **Single language**: ~2-5 KB gzipped
- **3-5 languages**: ~10-15 KB gzipped

### Lazy Loading

Load languages on demand for optimal performance:

```javascript
// Load converter only when needed
async function loadConverter(lang) {
  switch (lang) {
    case 'en':
      const { EnglishConverter } = await import('n2words')
      return EnglishConverter
    case 'es':
      const { SpanishConverter } = await import('n2words')
      return SpanishConverter
    // ... other languages
  }
}

// Usage
const converter = await loadConverter('en')
console.log(converter(42))
```

### Code Splitting

With Webpack:

```javascript
// Automatically splits n2words into separate chunk
const loadN2words = () => import(/* webpackChunkName: "n2words" */ 'n2words')

button.addEventListener('click', async () => {
  const { EnglishConverter } = await loadN2words()
  const result = EnglishConverter(123)
  display.textContent = result
})
```

## Examples

### Example 1: Simple Number Input

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Number to Words</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    input {
      font-size: 18px;
      padding: 10px;
      width: 100%;
      box-sizing: border-box;
    }
    .output {
      margin-top: 20px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 5px;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <h1>Number to Words Converter</h1>
  <input type="number" id="number" placeholder="Enter a number" value="42">
  <div class="output" id="output">forty-two</div>

  <script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
  <script>
    const input = document.getElementById('number')
    const output = document.getElementById('output')

    input.addEventListener('input', (e) => {
      const num = parseFloat(e.target.value)
      if (!isNaN(num)) {
        output.textContent = n2words.EnglishConverter(num)
      } else {
        output.textContent = 'Please enter a valid number'
      }
    })
  </script>
</body>
</html>
```

### Example 2: Multi-Language Converter

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Multi-Language Number Converter</title>
</head>
<body>
  <h1>Multi-Language Number to Words</h1>

  <input type="number" id="number" value="42">

  <select id="language">
    <option value="en">English</option>
    <option value="es">Spanish</option>
    <option value="fr">French</option>
    <option value="de">German</option>
    <option value="ja">Japanese</option>
    <option value="zh-Hans">Chinese (Simplified)</option>
    <option value="ar">Arabic</option>
  </select>

  <div id="output"></div>

  <script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
  <script>
    const converters = {
      en: n2words.EnglishConverter,
      es: n2words.SpanishConverter,
      fr: n2words.FrenchConverter,
      de: n2words.GermanConverter,
      ja: n2words.JapaneseConverter,
      'zh-Hans': n2words.SimplifiedChineseConverter,
      ar: n2words.ArabicConverter
    }

    function update() {
      const num = parseFloat(document.getElementById('number').value)
      const lang = document.getElementById('language').value
      const converter = converters[lang]

      if (!isNaN(num) && converter) {
        document.getElementById('output').textContent = converter(num)
      }
    }

    document.getElementById('number').addEventListener('input', update)
    document.getElementById('language').addEventListener('change', update)

    update()  // Initial conversion
  </script>
</body>
</html>
```

### Example 3: Invoice Generator

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice Generator</title>
  <style>
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border: 1px solid #ddd;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
    }
    .words {
      font-style: italic;
      color: #666;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <h1>Invoice</h1>
    <div>
      <label>Amount: $</label>
      <input type="number" id="amount" value="1234.56" step="0.01">
    </div>
    <div class="amount">
      Total: $<span id="total">1234.56</span>
    </div>
    <div class="words">
      Amount in words: <span id="words"></span> dollars
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
  <script>
    function updateInvoice() {
      const amount = parseFloat(document.getElementById('amount').value)
      document.getElementById('total').textContent = amount.toFixed(2)

      // Convert to words
      const dollars = Math.floor(amount)
      const cents = Math.round((amount - dollars) * 100)

      let words = n2words.EnglishConverter(dollars)
      if (cents > 0) {
        words += ' and ' + n2words.EnglishConverter(cents) + ' cents'
      }

      document.getElementById('words').textContent = words
    }

    document.getElementById('amount').addEventListener('input', updateInvoice)
    updateInvoice()
  </script>
</body>
</html>
```

### Example 4: React Component

```jsx
import React, { useState } from 'react'
import { EnglishConverter, SpanishConverter, FrenchConverter } from 'n2words'

function NumberToWords() {
  const [number, setNumber] = useState(42)
  const [language, setLanguage] = useState('en')

  const converters = {
    en: EnglishConverter,
    es: SpanishConverter,
    fr: FrenchConverter
  }

  const words = converters[language](number)

  return (
    <div>
      <h1>Number to Words</h1>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseFloat(e.target.value))}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
      <p>{words}</p>
    </div>
  )
}

export default NumberToWords
```

### Example 5: Vue Component

```vue
<template>
  <div>
    <h1>Number to Words</h1>
    <input v-model.number="number" type="number">
    <select v-model="language">
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
    </select>
    <p>{{ words }}</p>
  </div>
</template>

<script>
import { EnglishConverter, SpanishConverter, FrenchConverter } from 'n2words'

export default {
  data() {
    return {
      number: 42,
      language: 'en',
      converters: {
        en: EnglishConverter,
        es: SpanishConverter,
        fr: FrenchConverter
      }
    }
  },
  computed: {
    words() {
      return this.converters[this.language](this.number)
    }
  }
}
</script>
```

## Troubleshooting

### Issue: "n2words is not defined"

**Solution:** Make sure the script is loaded before using:

```html
<!-- ✓ Correct order -->
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  console.log(n2words.EnglishConverter(42))
</script>

<!-- ✗ Wrong: script runs before n2words loads -->
<script>
  console.log(n2words.EnglishConverter(42))  // Error!
</script>
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
```

### Issue: Large bundle size

**Solution:** Import only needed converters:

```javascript
// ✓ Tree-shakeable (small bundle)
import { EnglishConverter } from 'n2words'

// ✗ Includes everything (large bundle)
import * as n2words from 'n2words'
```

### Issue: BigInt not supported in old browsers

**Solution:** Add BigInt polyfill or avoid BigInt:

```javascript
// Use regular numbers for older browsers
n2words.EnglishConverter(123456)  // Works in all browsers

// BigInt only works in modern browsers
n2words.EnglishConverter(123456n)  // Requires BigInt support
```

### Issue: Module not found in browser

**Solution:** Use the correct import path:

```html
<!-- ✓ Correct: Use full CDN URL -->
<script type="module">
  import { EnglishConverter } from 'https://cdn.jsdelivr.net/npm/n2words/+esm'
</script>

<!-- ✗ Wrong: Can't resolve node_modules in browser -->
<script type="module">
  import { EnglishConverter } from 'n2words'  // Error!
</script>
```

## Best Practices

1. **Use CDN for simple pages**, bundlers for complex apps
2. **Import only needed languages** to reduce bundle size
3. **Cache the CDN script** by using versioned URLs
4. **Lazy load** converters for languages not immediately needed
5. **Consider bundle size** when supporting many languages
6. **Use code splitting** for large applications
7. **Test in target browsers** to ensure compatibility

## See Also

- [API Reference](../API.md) - Complete API documentation
- [Examples](../EXAMPLES.md) - More real-world examples
- [Performance Guide](PERFORMANCE.md) - Optimization tips
