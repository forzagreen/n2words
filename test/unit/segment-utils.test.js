import test from 'ava'
import {
  groupByThrees,
  groupByThreeThenTwos,
  placeValues,
  slavicPlural
} from '../../lib/utils/segment-utils.js'

/**
 * Unit Tests for segment-utils.js
 *
 * Tests all utility functions for number segmentation and pluralization.
 */

// ============================================================================
// groupByThrees Tests (Western 3-digit grouping)
// ============================================================================

test('groupByThrees handles single digit', t => {
  t.deepEqual(groupByThrees('5'), [5n])
})

test('groupByThrees handles two digits', t => {
  t.deepEqual(groupByThrees('42'), [42n])
})

test('groupByThrees handles three digits', t => {
  t.deepEqual(groupByThrees('123'), [123n])
})

test('groupByThrees handles four digits', t => {
  t.deepEqual(groupByThrees('1234'), [1n, 234n])
})

test('groupByThrees handles six digits', t => {
  t.deepEqual(groupByThrees('123456'), [123n, 456n])
})

test('groupByThrees handles seven digits', t => {
  t.deepEqual(groupByThrees('1234567'), [1n, 234n, 567n])
})

test('groupByThrees handles exact multiples of 3', t => {
  t.deepEqual(groupByThrees('123456789'), [123n, 456n, 789n])
})

test('groupByThrees handles very large numbers', t => {
  const result = groupByThrees('123456789012345')
  t.deepEqual(result, [123n, 456n, 789n, 12n, 345n])
})

test('groupByThrees handles zeros correctly', t => {
  t.deepEqual(groupByThrees('1000'), [1n, 0n])
  t.deepEqual(groupByThrees('1001'), [1n, 1n])
  t.deepEqual(groupByThrees('1000000'), [1n, 0n, 0n])
})

// ============================================================================
// groupByThreeThenTwos Tests (Indian 3-2-2-2 grouping)
// ============================================================================

test('groupByThreeThenTwos handles zero', t => {
  t.deepEqual(groupByThreeThenTwos(0n), [0])
})

test('groupByThreeThenTwos handles single digit', t => {
  t.deepEqual(groupByThreeThenTwos(5n), [5])
})

test('groupByThreeThenTwos handles two digits', t => {
  t.deepEqual(groupByThreeThenTwos(42n), [42])
})

test('groupByThreeThenTwos handles three digits', t => {
  t.deepEqual(groupByThreeThenTwos(123n), [123])
})

test('groupByThreeThenTwos handles four digits (thousands)', t => {
  // 1,234 → [1, 234]
  t.deepEqual(groupByThreeThenTwos(1234n), [1, 234])
})

test('groupByThreeThenTwos handles five digits', t => {
  // 12,345 → [12, 345]
  t.deepEqual(groupByThreeThenTwos(12345n), [12, 345])
})

test('groupByThreeThenTwos handles six digits (lakhs)', t => {
  // 1,23,456 → [1, 23, 456]
  t.deepEqual(groupByThreeThenTwos(123456n), [1, 23, 456])
})

test('groupByThreeThenTwos handles eight digits (crores)', t => {
  // 1,23,45,678 → [1, 23, 45, 678]
  t.deepEqual(groupByThreeThenTwos(12345678n), [1, 23, 45, 678])
})

test('groupByThreeThenTwos handles ten digits (arabs)', t => {
  // 1,23,45,67,890 → [1, 23, 45, 67, 890]
  t.deepEqual(groupByThreeThenTwos(1234567890n), [1, 23, 45, 67, 890])
})

test('groupByThreeThenTwos handles very large numbers', t => {
  // 9,87,65,43,210 → [9, 87, 65, 43, 210]
  t.deepEqual(groupByThreeThenTwos(9876543210n), [9, 87, 65, 43, 210])
})

test('groupByThreeThenTwos handles exact lakh (100000)', t => {
  // 1,00,000 → [1, 0, 0]
  t.deepEqual(groupByThreeThenTwos(100000n), [1, 0, 0])
})

test('groupByThreeThenTwos handles exact crore (10000000)', t => {
  // 1,00,00,000 → [1, 0, 0, 0]
  t.deepEqual(groupByThreeThenTwos(10000000n), [1, 0, 0, 0])
})

// ============================================================================
// placeValues Tests
// ============================================================================

test('placeValues extracts from zero', t => {
  t.deepEqual(placeValues(0n), [0n, 0n, 0n])
})

test('placeValues extracts from single digit', t => {
  t.deepEqual(placeValues(5n), [5n, 0n, 0n])
})

test('placeValues extracts from two digits', t => {
  t.deepEqual(placeValues(42n), [2n, 4n, 0n])
})

test('placeValues extracts from three digits', t => {
  t.deepEqual(placeValues(123n), [3n, 2n, 1n])
})

test('placeValues extracts from 456', t => {
  // ones=6, tens=5, hundreds=4
  t.deepEqual(placeValues(456n), [6n, 5n, 4n])
})

test('placeValues extracts from 999', t => {
  t.deepEqual(placeValues(999n), [9n, 9n, 9n])
})

test('placeValues extracts from 100', t => {
  t.deepEqual(placeValues(100n), [0n, 0n, 1n])
})

test('placeValues extracts from 010 (10)', t => {
  t.deepEqual(placeValues(10n), [0n, 1n, 0n])
})

// ============================================================================
// slavicPlural Tests
// ============================================================================

test('slavicPlural returns singular for 1', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(1n, forms), 'рубль')
})

test('slavicPlural returns singular for 21', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(21n, forms), 'рубль')
})

test('slavicPlural returns singular for 31', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(31n, forms), 'рубль')
})

test('slavicPlural returns singular for 101', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(101n, forms), 'рубль')
})

test('slavicPlural returns few for 2', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(2n, forms), 'рубля')
})

test('slavicPlural returns few for 3', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(3n, forms), 'рубля')
})

test('slavicPlural returns few for 4', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(4n, forms), 'рубля')
})

test('slavicPlural returns few for 22', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(22n, forms), 'рубля')
})

test('slavicPlural returns few for 34', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(34n, forms), 'рубля')
})

test('slavicPlural returns many for 0', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(0n, forms), 'рублей')
})

test('slavicPlural returns many for 5', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(5n, forms), 'рублей')
})

test('slavicPlural returns many for 10', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(10n, forms), 'рублей')
})

test('slavicPlural returns many for 11', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(11n, forms), 'рублей')
})

test('slavicPlural returns many for 12', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(12n, forms), 'рублей')
})

test('slavicPlural returns many for 13', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(13n, forms), 'рублей')
})

test('slavicPlural returns many for 14', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(14n, forms), 'рублей')
})

test('slavicPlural returns many for 19', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(19n, forms), 'рублей')
})

test('slavicPlural returns many for 20', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(20n, forms), 'рублей')
})

test('slavicPlural returns many for 25', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(25n, forms), 'рублей')
})

test('slavicPlural returns many for 111', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(111n, forms), 'рублей')
})

test('slavicPlural returns many for 112', t => {
  const forms = ['рубль', 'рубля', 'рублей']
  t.is(slavicPlural(112n, forms), 'рублей')
})

test('slavicPlural handles very large numbers ending in 1', t => {
  const forms = ['тысяча', 'тысячи', 'тысяч']
  t.is(slavicPlural(1000001n, forms), 'тысяча')
})

test('slavicPlural handles very large numbers ending in 2-4', t => {
  const forms = ['тысяча', 'тысячи', 'тысяч']
  t.is(slavicPlural(1000003n, forms), 'тысячи')
})

test('slavicPlural handles very large numbers ending in 11-19', t => {
  const forms = ['тысяча', 'тысячи', 'тысяч']
  t.is(slavicPlural(1000011n, forms), 'тысяч')
})
