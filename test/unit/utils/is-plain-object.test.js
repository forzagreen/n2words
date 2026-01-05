import test from 'ava'
import { isPlainObject } from '../../../lib/utils/is-plain-object.js'

/**
 * Unit Tests for is-plain-object.js
 *
 * Tests the isPlainObject utility which checks if a value is a plain object
 * (created by object literal or Object.create(null)).
 */

// ============================================================================
// Plain Objects (should return true)
// ============================================================================

test('returns true for empty object literal', t => {
  t.true(isPlainObject({}))
})

test('returns true for object with properties', t => {
  t.true(isPlainObject({ a: 1, b: 2 }))
})

test('returns true for nested object', t => {
  t.true(isPlainObject({ nested: { deep: true } }))
})

test('returns true for Object.create(null)', t => {
  t.true(isPlainObject(Object.create(null)))
})

test('returns true for Object.create(Object.prototype)', t => {
  t.true(isPlainObject(Object.create(Object.prototype)))
})

// ============================================================================
// Non-Plain Objects (should return false)
// ============================================================================

test('returns false for null', t => {
  t.false(isPlainObject(null))
})

test('returns false for undefined', t => {
  t.false(isPlainObject(undefined))
})

test('returns false for array', t => {
  t.false(isPlainObject([]))
  t.false(isPlainObject([1, 2, 3]))
})

test('returns false for function', t => {
  t.false(isPlainObject(() => {}))
  t.false(isPlainObject(function () {}))
})

test('returns false for class instance', t => {
  class MyClass {}
  t.false(isPlainObject(new MyClass()))
})

test('returns false for Date', t => {
  t.false(isPlainObject(new Date()))
})

test('returns false for RegExp', t => {
  t.false(isPlainObject(/test/))
})

test('returns false for Map', t => {
  t.false(isPlainObject(new Map()))
})

test('returns false for Set', t => {
  t.false(isPlainObject(new Set()))
})

test('returns false for Error', t => {
  t.false(isPlainObject(new Error('test')))
})

// ============================================================================
// Primitives (should return false)
// ============================================================================

test('returns false for number', t => {
  t.false(isPlainObject(42))
  t.false(isPlainObject(0))
  t.false(isPlainObject(NaN))
})

test('returns false for string', t => {
  t.false(isPlainObject(''))
  t.false(isPlainObject('hello'))
})

test('returns false for boolean', t => {
  t.false(isPlainObject(true))
  t.false(isPlainObject(false))
})

test('returns false for bigint', t => {
  t.false(isPlainObject(42n))
})

test('returns false for symbol', t => {
  t.false(isPlainObject(Symbol('test')))
})
