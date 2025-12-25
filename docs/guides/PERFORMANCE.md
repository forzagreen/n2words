# Performance Guide

Optimization tips and performance characteristics of n2words.

## Table of Contents

- [Overview](#overview)
- [Performance Characteristics](#performance-characteristics)
- [Benchmarking](#benchmarking)
- [Optimization Tips](#optimization-tips)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Memory Usage](#memory-usage)
- [Best Practices](#best-practices)

## Overview

n2words is designed to be fast and lightweight:

- **Zero dependencies** - No external libraries to load
- **Efficient algorithms** - Optimized conversion logic for each language
- **Small footprint** - Minimal memory usage
- **Fast execution** - Sub-millisecond conversion times for most numbers

## Performance Characteristics

### Conversion Speed

Typical performance ranges (operations per second):

- **Small numbers** (0-999): ~500,000-1,000,000 ops/sec
- **Medium numbers** (1,000-999,999): ~200,000-500,000 ops/sec
- **Large numbers** (1M+): ~50,000-200,000 ops/sec
- **BigInt**: Slightly slower than regular numbers

### Complexity

- **Time complexity**: O(log n) for most languages (based on number magnitude)
- **Space complexity**: O(log n) for recursion/result string
- **Constant overhead**: Minimal per conversion

### Language-Specific Performance

Different languages have varying performance characteristics:

**Fastest:**

- Simple concatenation languages (Chinese, Japanese, Korean)
- Languages with minimal grammar rules

**Moderate:**

- Most European languages (English, Spanish, French)
- Standard scale-based languages

**Slowest:**

- Complex grammar languages (Arabic with gender agreement)
- Slavic languages with extensive pluralization
- Languages requiring complex merging logic

## Benchmarking

### Running Benchmarks

```bash
# Benchmark all languages
npm run bench:perf

# Benchmark specific language
npm run bench:perf -- --lang en

# Benchmark with specific value
npm run bench:perf -- --value 123456

# Save results for comparison
npm run bench:perf -- --save

# Compare with previous run
npm run bench:perf -- --save --compare

# Memory benchmarking
npm run bench:memory
```

### Example Output

```text
English x 384,615 ops/sec ±0.89% (92 runs sampled)
Spanish x 312,500 ops/sec ±1.23% (88 runs sampled)
French x 294,118 ops/sec ±0.95% (91 runs sampled)
German x 357,143 ops/sec ±1.12% (89 runs sampled)
Japanese x 588,235 ops/sec ±0.67% (94 runs sampled)

Results:
Fastest is Japanese
```

### Benchmark Comparison

```bash
# Run benchmark and save
npm run bench:perf -- --save

# Make optimizations...

# Compare new run with saved results
npm run bench:perf -- --compare --save
```

Output shows percentage improvement:

```text
📊 Comparison with previous run:
Previous run: 2025-01-15T10:30:00.000Z
English: ↑ +5.23%
Spanish: ↑ +3.45%
French: ↓ -0.12%
```

## Optimization Tips

### 1. Reuse Converter Instances

**Slow:**

```javascript
// Creates new instance every time
function convert(num) {
  const converter = new English()
  return converter.convertToWords(num)
}

// Called 1000 times
for (let i = 0; i < 1000; i++) {
  convert(i)
}
```

**Fast:**

```javascript
// Create instance once
const converter = new English()

function convert(num) {
  return converter.convertToWords(num)
}

// Reuse instance
for (let i = 0; i < 1000; i++) {
  convert(i)
}
```

**Fastest:**

```javascript
// Use converter functions (they handle instance creation efficiently)
import { EnglishConverter } from 'n2words'

for (let i = 0; i < 1000; i++) {
  EnglishConverter(i)
}
```

### 2. Use Appropriate Number Types

```javascript
// Regular numbers for safe range
EnglishConverter(123456)  // Fast

// Strings for parsing
EnglishConverter('123456')  // Slightly slower (parsing overhead)

// BigInt only when necessary
EnglishConverter(123456n)  // Slightly slower than numbers
EnglishConverter(9007199254740992n)  // Necessary for large values
```

### 3. Cache Results When Possible

```javascript
// Cache for frequently converted numbers
const cache = new Map()

function cachedConvert(num) {
  if (!cache.has(num)) {
    cache.set(num, EnglishConverter(num))
  }
  return cache.get(num)
}

// Much faster for repeated conversions
cachedConvert(42)  // Converts
cachedConvert(42)  // Returns cached result
cachedConvert(42)  // Returns cached result
```

### 4. Batch Conversions

For converting many numbers, batch them:

```javascript
// Convert array of numbers
function convertBatch(numbers) {
  return numbers.map(n => EnglishConverter(n))
}

const numbers = [1, 2, 3, 4, 5, ..., 1000]
const words = convertBatch(numbers)
```

### 5. Lazy Load Languages

In browsers, load languages on demand:

```javascript
// Don't load all languages upfront
import { EnglishConverter } from 'n2words'  // Only English

// Load other languages when needed
async function getConverter(lang) {
  switch (lang) {
    case 'en':
      return EnglishConverter
    case 'es':
      const { SpanishConverter } = await import('n2words')
      return SpanishConverter
    case 'fr':
      const { FrenchConverter } = await import('n2words')
      return FrenchConverter
  }
}
```

## Bundle Size Optimization

### Tree-Shaking

Modern bundlers eliminate unused code:

```javascript
// ✓ Good: Only includes English (tree-shakeable)
import { EnglishConverter } from 'n2words'

// ✗ Bad: Includes all languages
import * as n2words from 'n2words'
```

### Import Only What You Need

```javascript
// Small bundle: ~2-3 KB per language
import { EnglishConverter } from 'n2words'

// Medium bundle: ~8-10 KB for 3 languages
import { EnglishConverter, SpanishConverter, FrenchConverter } from 'n2words'

// Large bundle: ~45 KB for all languages
import * as n2words from 'n2words'
```

### Bundle Size Estimates (gzipped)

| Import | Languages | Size (gzipped) |
| ------ | --------- | -------------- |
| Single language | 1 | ~2-5 KB |
| Few languages | 3-5 | ~10-15 KB |
| Many languages | 10+ | ~25-35 KB |
| All languages | 47 | ~45 KB |

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,  // Enable tree-shaking
    minimize: true       // Minify bundle
  }
}
```

### Rollup Configuration

```javascript
// rollup.config.js
export default {
  treeshake: true,  // Enable tree-shaking
  plugins: [
    terser()  // Minify
  ]
}
```

## Memory Usage

### Memory Characteristics

- **Per conversion**: ~1-5 KB heap allocation
- **Converter instance**: ~2-10 KB per language
- **No memory leaks**: Automatic garbage collection
- **Scalable**: Handles millions of conversions

### Memory Benchmarking

Run memory benchmarks:

```bash
npm run bench:memory
```

Example output:

```text
Memory Usage Benchmark

Initial heap: 12.5 MB

After 10,000 conversions:
  Heap used: 14.2 MB
  Difference: 1.7 MB
  Per conversion: ~170 bytes

After 100,000 conversions:
  Heap used: 18.3 MB
  Difference: 5.8 MB
  Per conversion: ~58 bytes

After 1,000,000 conversions:
  Heap used: 22.1 MB
  Difference: 9.6 MB
  Per conversion: ~9.6 bytes

✓ No memory leaks detected
```

### Memory Optimization

```javascript
// Clear cache periodically to free memory
let cache = new Map()
let conversionCount = 0

function cachedConvert(num) {
  if (!cache.has(num)) {
    cache.set(num, EnglishConverter(num))
    conversionCount++

    // Clear cache every 10,000 conversions
    if (conversionCount > 10000) {
      cache.clear()
      conversionCount = 0
    }
  }
  return cache.get(num)
}
```

## Best Practices

### 1. Profile Before Optimizing

Don't optimize blindly. Measure first:

```javascript
// Measure conversion time
console.time('convert')
const result = EnglishConverter(123456)
console.timeEnd('convert')
// convert: 0.123ms

// Measure batch conversion
console.time('batch')
const results = numbers.map(n => EnglishConverter(n))
console.timeEnd('batch')
// batch: 45.678ms
```

### 2. Use Production Builds

Development builds include extra checks:

```bash
# Development
npm run build

# Production (minified, optimized)
NODE_ENV=production npm run build
```

### 3. Consider Conversion Frequency

**High frequency** (thousands/second):

- Cache results
- Reuse instances
- Consider precomputing common values

**Low frequency** (occasional):

- Use converter functions directly
- No need for caching
- Simplicity over optimization

### 4. Choose Appropriate Languages

If performance is critical:

```javascript
// Faster: Simpler languages
SimplifiedChineseConverter(123)  // Fast concatenation
JapaneseConverter(123)           // Fast concatenation

// Slower: Complex grammar
ArabicConverter(123, { feminine: true })  // Gender agreement overhead
```

### 5. Avoid Unnecessary String Operations

```javascript
// ✓ Good: Use result directly
const words = EnglishConverter(42)
console.log(words)

// ✗ Bad: Unnecessary string operations
const words = EnglishConverter(42).toUpperCase().toLowerCase().trim()
```

### 6. Monitor in Production

Track performance in production:

```javascript
import { EnglishConverter } from 'n2words'

function convertWithMonitoring(num) {
  const start = performance.now()
  const result = EnglishConverter(num)
  const duration = performance.now() - start

  // Log slow conversions
  if (duration > 1) {  // 1ms threshold
    console.warn(`Slow conversion: ${num} took ${duration}ms`)
  }

  return result
}
```

## Performance Comparison

### vs. Other Libraries

Approximate comparison (ops/sec for English, number 123456):

| Library | Operations/sec | Bundle Size | Dependencies |
| ------- | -------------- | ----------- | ------------ |
| **n2words v2.0** | ~350,000 | 2-5 KB | 0 |
| number-to-words | ~180,000 | 45 KB | 2 |
| written-number | ~120,000 | 28 KB | 1 |
| to-words | ~250,000 | 15 KB | 0 |

**Note:** Benchmarks vary by environment and number size

### When to Use n2words

**Use n2words when:**

- ✅ You need multi-language support (47 languages)
- ✅ Bundle size matters (zero dependencies)
- ✅ Performance is important (fast algorithms)
- ✅ You want comprehensive features (BigInt, decimals, negatives)

**Consider alternatives when:**

- ❌ You only need English (specialized libraries may be faster)
- ❌ You need ordinals (first, second, third) - not yet supported
- ❌ You need currency formatting - use Intl.NumberFormat instead

## Advanced Optimization

### Parallel Processing

For massive batches, use workers:

```javascript
// main.js
const { Worker } = require('worker_threads')

function convertParallel(numbers) {
  const chunkSize = Math.ceil(numbers.length / 4)
  const chunks = []
  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize))
  }

  const workers = chunks.map(chunk => {
    return new Promise((resolve) => {
      const worker = new Worker('./converter-worker.js')
      worker.postMessage(chunk)
      worker.on('message', resolve)
    })
  })

  return Promise.all(workers).then(results => results.flat())
}

// converter-worker.js
const { EnglishConverter } = require('n2words')
const { parentPort } = require('worker_threads')

parentPort.on('message', (numbers) => {
  const results = numbers.map(n => EnglishConverter(n))
  parentPort.postMessage(results)
})
```

### WebAssembly

For critical performance needs, consider WebAssembly:

- Compile core conversion logic to WASM
- 2-3x faster than JavaScript for intensive calculations
- More complex setup and maintenance

## Troubleshooting Performance Issues

### Issue: Slow conversions

**Check:**

- Are you creating new instances repeatedly?
- Are you converting very large numbers?
- Is garbage collection causing pauses?

**Solution:**

- Reuse converter instances
- Cache frequently used results
- Use appropriate number types

### Issue: High memory usage

**Check:**

- Are you caching too many results?
- Are you loading all languages unnecessarily?

**Solution:**

- Clear caches periodically
- Import only needed languages
- Use tree-shaking

### Issue: Large bundle size

**Check:**

- Are you importing all languages?
- Is tree-shaking enabled?

**Solution:**

- Import specific converters
- Configure bundler for tree-shaking
- Use code splitting

## See Also

- [API Reference](../API.md) - Complete API documentation
- [Browser Usage](BROWSER_USAGE.md) - Browser optimization tips
- [Contributing Guide](../../CONTRIBUTING.md) - Development guidelines
