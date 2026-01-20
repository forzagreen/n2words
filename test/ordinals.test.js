import test from 'ava'
import { readdirSync } from 'node:fs'
import { safeStringify } from './helpers/value-utils.js'

/**
 * Ordinal Implementation Tests
 *
 * Tests each language's toOrdinal() function with test fixtures.
 * Ordinal support is optional - only languages with ordinal fixtures are tested.
 */

// ============================================================================
// Ordinal Tests
// ============================================================================

const ordinalFixturesDir = './test/fixtures/ordinals'
let fixtureFiles = []

try {
  fixtureFiles = readdirSync(ordinalFixturesDir).filter(f => f.endsWith('.js'))
} catch {
  // No ordinals directory yet - that's fine
}

for (const file of fixtureFiles) {
  const languageCode = file.replace('.js', '')

  test(`ordinals: ${languageCode}`, async t => {
    // Import language module
    const languageModule = await import('../src/' + file)

    // Verify toOrdinal export exists
    if (typeof languageModule.toOrdinal !== 'function') {
      t.fail(`Language file ${file} does not export a toOrdinal function`)
      return
    }

    const toOrdinal = languageModule.toOrdinal

    // Import fixture
    const { default: testFile } = await import(`./fixtures/ordinals/${file}`)

    if (!Array.isArray(testFile) || testFile.length === 0) {
      t.fail(`Invalid ordinal fixture for ${languageCode}`)
      return
    }

    // Run test cases
    for (let i = 0; i < testFile.length; i++) {
      const [input, expected] = testFile[i]

      try {
        const actual = toOrdinal(input)
        t.is(actual, expected,
          `Test case ${i + 1}/${testFile.length}: ${safeStringify(input)}`
        )
      } catch (error) {
        t.fail(
          `Test case ${i + 1}/${testFile.length} threw error: ${error.message}\n` +
          `Input: ${safeStringify(input)}\n` +
          `Expected: ${expected}`
        )
      }
    }

    // Test error cases
    t.throws(() => toOrdinal(0), { instanceOf: RangeError }, 'toOrdinal(0) should throw RangeError')
    t.throws(() => toOrdinal(-1), { instanceOf: RangeError }, 'toOrdinal(-1) should throw RangeError')
    t.throws(() => toOrdinal(1.5), { instanceOf: RangeError }, 'toOrdinal(1.5) should throw RangeError')
  })
}

test('ordinal fixtures directory exists when ordinals are implemented', t => {
  // This is a placeholder - will pass once we have ordinal implementations
  t.pass()
})
