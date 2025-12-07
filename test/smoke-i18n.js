import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Smoke Tests for All Language Implementations
 *
 * Runs a representative set of inputs across all language modules to verify
 * that each language can successfully convert numbers without errors.
 * This is a quick sanity check, not comprehensive language-specific testing.
 *
 * Test inputs are chosen to exercise different code paths:
 * - Zero and single digits (0, 1, 2)
 * - Teens and tens (10-21, 99)
 * - Hundreds (100, 200, 999)
 * - Thousands (1000, 1001, 2000, 12345)
 * - Decimals with leading zeros (3.005, 0.0001)
 * - Negative numbers (-5)
 */
const inputs = [
  0,
  1,
  2,
  10,
  11,
  19,
  20,
  21,
  99,
  100,
  101,
  200,
  999,
  1000,
  1001,
  2000,
  12345,
  '3.005',
  '0.0001',
  -5
]

const files = readdirSync('./lib/i18n')

for (const file of files) {
  if (!file.endsWith('.js')) continue

  const lang = file.replace('.js', '')

  test(`${lang}`, async t => {
    const module = await import('../lib/i18n/' + file)
    const converter = module.default || module

    for (const input of inputs) {
      const res = converter(input, {})
      t.true(typeof res === 'string')
      t.true(res.length > 0)
    }
  })
}
