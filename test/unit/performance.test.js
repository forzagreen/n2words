import test from 'ava'
import { EnglishConverter } from '../../lib/n2words.js'

/**
 * Performance Regression Tests
 *
 * These tests ensure that conversions complete within reasonable timeframes.
 * They serve as smoke tests to catch severe performance regressions.
 *
 * Note: These are NOT precise benchmarks - use bench/perf.js for that.
 * These tests use generous thresholds to avoid flaky failures while still
 * catching severe regressions.
 */

test('simple number conversion completes quickly', t => {
  const start = performance.now()

  // Convert 1000 simple numbers
  for (let i = 0; i < 1000; i++) {
    EnglishConverter(42)
  }

  const duration = performance.now() - start

  // Should complete in under 100ms (very generous threshold)
  t.true(duration < 100, `1000 conversions took ${duration}ms, expected <100ms`)
})

test('large number conversion completes quickly', t => {
  const start = performance.now()

  // Convert 100 large numbers
  for (let i = 0; i < 100; i++) {
    EnglishConverter(123456789)
  }

  const duration = performance.now() - start

  // Should complete in under 50ms
  t.true(duration < 50, `100 large conversions took ${duration}ms, expected <50ms`)
})

test('BigInt conversion does not leak memory', t => {
  // Force GC before test (if available)
  if (global.gc) global.gc()

  const initialMemory = process.memoryUsage().heapUsed

  // Convert 10000 BigInt values
  for (let i = 0; i < 10000; i++) {
    EnglishConverter(BigInt(i))
  }

  // Force GC after test
  if (global.gc) global.gc()

  const finalMemory = process.memoryUsage().heapUsed
  const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

  // Memory increase should be minimal (< 10MB for 10k conversions)
  t.true(memoryIncrease < 10, `Memory increased by ${memoryIncrease.toFixed(2)}MB, expected <10MB`)
})
