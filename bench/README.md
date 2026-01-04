# Benchmark Suite

Comprehensive performance and memory benchmarking tools for the n2words library.

## Overview

The benchmark suite provides two specialized tools for measuring the performance characteristics of all language converters:

- **`perf.js`** - Performance benchmarking (operations per second)
- **`memory.js`** - Memory usage profiling (heap allocation, GC analysis)

## Performance Benchmarks

### Quick Start

```bash
# Benchmark all languages
npm run bench:perf

# Benchmark specific language
npm run bench:perf -- --lang en

# Save results for tracking
npm run bench:perf -- --save

# Compare with previous run
npm run bench:perf -- --compare
```

### Features

- **Accurate Measurements**: Uses [benchmark.js](https://benchmarkjs.com/) for statistically rigorous performance testing
- **Operations/Second**: Reports ops/sec with confidence intervals
- **Historical Tracking**: Save results to `bench/perf-results.json` and compare over time
- **Custom Test Values**: Test with different numbers using `--value`
- **Per-Language Testing**: Focus on specific languages for targeted optimization

### Usage

```bash
npm run bench:perf [options]
```

**Options:**

| Option | Description | Example |
| ------ | ----------- | ------- |
| `--lang <code>` | Benchmark specific language(s) | `--lang en` or `--lang en,es,fr` |
| `--value <number>` | Custom test value (default: `Number.MAX_SAFE_INTEGER`) | `--value 42` |
| `--save` | Save results to `~/.n2words-bench/perf-results.json` | `--save` |
| `--compare` | Compare with previous saved results (inline) | `--compare` |
| `--history` | Show performance history (single language only) | `--history` |
| `--help` | Display help message | `--help` |

**Examples:**

```bash
# Test English only
npm run bench:perf -- --lang en

# Test multiple languages (comma-separated)
npm run bench:perf -- --lang en,es,fr

# Test multiple languages (repeated flag)
npm run bench:perf -- --lang en --lang es --lang fr

# Save results with custom value
npm run bench:perf -- --value 999999 --save

# Track performance changes over time
npm run bench:perf -- --save --compare

# View historical performance for a language
npm run bench:perf -- --lang en --history

# Test large numbers
npm run bench:perf -- --value 999999999999999
```

### Performance Output

**Single Language:**

```text
Language        │      ops/sec │    Error │       Runs
────────────────────────────────────────────────────────────
en              │       20,183 │   ±3.49% │  (72 runs)
────────────────────────────────────────────────────────────
```

**Multiple Languages:**

```text
Language        │      ops/sec │    Error │       Runs
────────────────────────────────────────────────────────────
en              │       23,338 │   ±3.58% │  (77 runs)
es              │       24,165 │   ±2.40% │  (72 runs)
────────────────────────────────────────────────────────────
Fastest: es, en
Range: 23,338 to 24,165 ops/sec (+3.5%)
```

**With --compare:**

```text
Language        │      ops/sec │    Error │       Runs │     Change
──────────────────────────────────────────────────────────────────────
en              │       23,338 │   ±3.58% │  (77 runs) │   ↑ +9.66%
es              │       24,165 │   ±2.40% │  (72 runs) │  ↑ +11.31%
──────────────────────────────────────────────────────────────────────
Fastest: es, en
Range: 23,338 to 24,165 ops/sec (+3.5%)

✓ Results saved to bench/perf-results.json
```

**With --history:**

```text
📈 Performance History for en (last 10 runs):

Date                 │      ops/sec │     Change
──────────────────────────────────────────────────
Dec 27, 05:51 PM     │       19,122 │   baseline
Dec 27, 05:51 PM     │       20,477 │   ↑ +7.09%
Dec 27, 05:51 PM     │       19,985 │   ↓ -2.40%
Dec 27, 05:58 PM     │       20,483 │   ↑ +2.49%
Dec 27, 05:58 PM     │       21,625 │   ↑ +5.57%
```

## Memory Benchmarks

### Memory Quick Start

```bash
# Benchmark all languages
npm run bench:memory

# Benchmark specific language
npm run bench:memory -- --lang en

# Custom iterations
npm run bench:memory -- --iterations 10000

# Save and compare
npm run bench:memory -- --save --compare
```

### Memory Features

- **Comprehensive Metrics**: Tracks heap usage, external memory, and array buffers
- **Garbage Collection**: Properly handles GC with `--expose-gc` flag (automatically set in npm script)
- **Per-Iteration Overhead**: Calculates memory cost per conversion
- **Accurate Baselines**: Waits for GC to complete before measurements
- **Anti-Optimization**: Collects outputs to prevent dead code elimination
- **Historical Tracking**: Save and compare memory usage over time

### Memory Usage

```bash
npm run bench:memory [options]
```

**Options:**

| Option | Description | Example |
| ------ | ----------- | ------- |
| `--lang <code>` | Benchmark specific language(s) | `--lang en` or `--lang en,es,fr` |
| `--value <number>` | Custom test value (default: `Number.MAX_SAFE_INTEGER`) | `--value 42` |
| `--iterations <n>` | Number of iterations (default: 1000) | `--iterations 5000` |
| `--save` | Save results to `bench/memory-results.json` | `--save` |
| `--compare` | Compare with previous saved results (inline) | `--compare` |
| `--history` | Show memory history (single language only) | `--history` |
| `--help` | Display help message | `--help` |

**Examples:**

```bash
# Test English only
npm run bench:memory -- --lang en

# Test multiple languages (comma-separated)
npm run bench:memory -- --lang en,es,fr

# Test multiple languages (repeated flag)
npm run bench:memory -- --lang en --lang es --lang fr

# High-precision test with more iterations
npm run bench:memory -- --iterations 10000

# Track memory changes over time
npm run bench:memory -- --save --compare

# View historical memory usage for a language
npm run bench:memory -- --lang en --history

# Custom value with tracking
npm run bench:memory -- --value 42 --iterations 5000 --save
```

### Memory Output

**Single Language:**

```text
Language        │        Total │ Per Iteration
────────────────────────────────────────────────────────────
en              │    568.30 KB │     581.94 B
────────────────────────────────────────────────────────────
```

**Multiple Languages:**

```text
Language        │        Total │ Per Iteration
────────────────────────────────────────────────────────────
ar              │    675.26 KB │     691.59 B
en              │    568.30 KB │     581.94 B
es              │    451.66 KB │     462.50 B
────────────────────────────────────────────────────────────
Lowest memory: es
Range: 451.66 KB to 675.26 KB (+49.5%)
```

**With --compare:**

```text
Language        │        Total │ Per Iteration │     Change
──────────────────────────────────────────────────────────────────────
en              │    707.91 KB │     724.90 B │   ↓ -0.61%
es              │    451.66 KB │     462.50 B │        new
──────────────────────────────────────────────────────────────────────
Lowest memory: es
Range: 451.66 KB to 707.91 KB (+56.7%)

✓ Results saved to bench/memory-results.json
```

**With --history:**

```text
📈 Memory History for en (last 10 runs):

Date                 │        Total │ Per Iteration │     Change
──────────────────────────────────────────────────────────────────────
Dec 27, 05:51 PM     │    122.20 KB │      1.22 KB │   baseline
Dec 27, 05:51 PM     │    154.61 KB │      1.55 KB │  ↑ +26.53%
Dec 27, 05:51 PM     │    128.00 KB │      1.28 KB │  ↓ -17.21%
Dec 27, 06:11 PM     │    712.26 KB │     729.35 B │ ↑ +456.45%
Dec 27, 06:11 PM     │    707.91 KB │     724.90 B │   ↓ -0.61%
```

## Implementation Details

### Performance Benchmark Architecture

The performance benchmark (`perf.js`):

1. **Public API Usage**: Imports converters from n2words public API
2. **Converter Mapping**: Builds map of all converters on startup
3. **Dynamic Lookup**: Finds converter by matching language class name
4. **Benchmark Suite**: Uses benchmark.js for statistical sampling
5. **Synchronous Execution**: Direct converter calls for accurate timing
6. **Result Persistence**: JSON storage for historical comparison

**Key Metrics:**

- Operations per second (ops/sec)
- Standard deviation (statistical confidence)
- Sample size (number of test runs)
- Mean execution time

### Memory Benchmark Architecture

The memory benchmark (`memory.js`):

1. **Public API Usage**: Imports converters from n2words public API
2. **Converter Mapping**: Builds map of all converters on startup
3. **GC Control**: Forces garbage collection before baseline measurement
4. **Baseline Capture**: Records memory state before test
5. **Iteration Loop**: Runs N converter calls, collecting outputs
6. **Delta Calculation**: Computes memory increase from baseline

**Key Metrics:**

- Heap Used: V8 heap memory allocation
- External: Memory outside V8 heap (C++ addons, buffers)
- Array Buffers: Typed array buffer memory
- Total Allocated: Heap + External
- Per-Iteration: Average memory cost per conversion

**Architecture Benefits:**

Both benchmarks use the n2words public API, which provides:

- **Real-world Performance**: Measures actual user-facing API
- **Consistent Interface**: Tests the same converters users import
- **Better Isolation**: Converters are pre-loaded, reducing noise
- **Accurate Measurement**: No class instantiation overhead per iteration

**Anti-Optimization Techniques:**

The memory benchmark prevents V8 optimizations that would make measurements inaccurate:

- Collects all outputs in an array (prevents dead code elimination)
- Verifies output count matches iteration count
- Uses actual returned values (not discarded)
- Tests converter functions, not class instantiation

## Tips for Accurate Benchmarking

### Performance Testing

1. **Close Background Apps**: Minimize CPU noise from other processes
2. **Multiple Runs**: Run benchmarks several times and average results
3. **Consistent Environment**: Use same Node.js version and system state
4. **Warm-Up**: First run may be slower due to V8 optimization
5. **Save Results**: Track trends over time with `--save --compare`

### Memory Testing

1. **Use `--expose-gc`**: Already configured in `npm run bench:memory`
2. **Higher Iterations**: More iterations = more accurate per-iteration measurements
3. **Monitor System Memory**: Ensure enough free RAM for accurate results
4. **Consistent Values**: Use same test value when comparing across runs
5. **Wait Between Runs**: Allow GC to complete between tests

## Result Files

### `bench/perf-results.json` (Performance)

```json
{
  "timestamp": "2025-12-26T10:30:00.000Z",
  "value": 9007199254740991,
  "benchmarks": [
    {
      "name": "languages/en",
      "hz": 123456.789,
      "stats": {
        "mean": 0.0000081,
        "deviation": 0.0000001,
        "variance": 0.00000000001,
        "sample": 89
      }
    }
  ]
}
```

### `bench/memory-results.json` (Memory)

```json
{
  "timestamp": "2025-12-26T10:30:00.000Z",
  "value": 9007199254740991,
  "iterations": 1000,
  "results": [
    {
      "name": "en",
      "heapUsed": 2075648,
      "external": 0,
      "arrayBuffers": 0,
      "totalAllocated": 2075648,
      "perIteration": 2075.648
    }
  ]
}
```

## Interpreting Results

### Performance Results

- **Higher ops/sec = Better**: More operations per second means faster execution
- **Lower deviation = Better**: Smaller standard deviation indicates consistent performance
- **Sample size**: Higher sample size (more runs) = more confidence in results

**What to look for:**

- Regressions: Significant drops in ops/sec (>10%) may indicate performance issues
- Outliers: Languages that perform significantly differently may have implementation issues
- Trends: Historical comparison shows if changes improved or degraded performance

### Memory Results

- **Lower memory = Better**: Less memory allocation means more efficient implementation
- **Consistent per-iteration = Good**: Stable per-iteration cost indicates no memory leaks
- **Heap vs External**: Most languages use only heap; external indicates C++ addons

**What to look for:**

- Memory leaks: Increasing per-iteration cost over multiple runs
- Outliers: Languages with significantly higher memory usage
- Overhead: Module import costs vs per-iteration costs

## Troubleshooting

### Performance Benchmark Issues

**Issue:** "Language file does not exist"

- **Solution:** Check language code spelling (case-sensitive)
- **Verify:** `ls lib/languages/<code>.js`

**Issue:** Inconsistent results

- **Solution:** Close background apps, run multiple times
- **Verify:** Check standard deviation in output

### Memory Benchmark Issues

**Issue:** "Cannot find global.gc"

- **Solution:** Use `npm run bench:memory` (includes `--expose-gc` flag)
- **Alternative:** Run manually: `node --expose-gc bench/memory.js`

**Issue:** Negative memory values

- **Solution:** Normal for small differences; GC may reclaim memory during test
- **Note:** Run with higher `--iterations` for more accurate results

## Development

### Adding New Metrics

To add new metrics to benchmarks:

1. **Performance**: Modify `benchFile()` function to track additional data
2. **Memory**: Add new properties to `process.memoryUsage()` tracking
3. **Update JSON schema**: Ensure saved results include new metrics
4. **Update display**: Format new metrics in `displayResults()` or event handlers

### Dependencies

- **benchmark**: Statistical benchmarking library
- **chalk**: Terminal color output
- **Node.js built-ins**: `fs`, `path` (no external dependencies for core functionality)

## See Also

- [benchmark.js Documentation](https://benchmarkjs.com/)
- [Node.js process.memoryUsage()](https://nodejs.org/api/process.html#processmemoryusage)
- [V8 Garbage Collection](https://v8.dev/blog/trash-talk)
- [Performance Testing Best Practices](https://github.com/bestiejs/benchmark.js/wiki/Best-practices)

---

**Last Updated**: 2026-01-01
