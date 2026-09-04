/**
 * CLI tests.
 *
 * These spawn the real executable rather than importing its internals: the
 * things worth pinning down here — exit codes, stdin streaming, how argv
 * survives parsing — only exist at the process boundary.
 */

import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'ava'
import { toCardinal } from '../src/en-US.js'
import { getLanguageCodes } from './helpers/language-helpers.js'

const CLI = fileURLToPath(new URL('../bin/n2words.js', import.meta.url))

/**
 * Runs the CLI in a child process.
 *
 * @param {string[]} args Arguments after the executable
 * @param {string} [input] Text to write to stdin (always closed, so the CLI
 *   never sees a TTY)
 * @returns {Promise<{stdout: string, stderr: string, code: number}>} The result
 */
function run(args, input) {
  return new Promise((resolve) => {
    const child = execFile(process.execPath, [CLI, ...args], (error, stdout, stderr) => {
      resolve({ stdout, stderr, code: typeof error?.code === 'number' ? error.code : 0 })
    })
    child.stdin.end(input ?? '')
  })
}

/**
 * Runs the CLI and returns its trimmed stdout, asserting it succeeded.
 *
 * @param {import('ava').ExecutionContext} t The AVA context
 * @param {string[]} args Arguments after the executable
 * @param {string} [input] Text to write to stdin
 * @returns {Promise<string>} Trimmed stdout
 */
async function output(t, args, input) {
  const result = await run(args, input)
  t.is(result.code, 0, result.stderr)
  return result.stdout.trim()
}

// ============================================================================
// Forms
// ============================================================================

test('converts cardinals by default', async (t) => {
  t.is(await output(t, ['42', '--lang', 'en']), 'forty-two')
})

test('converts ordinals with --ordinal', async (t) => {
  t.is(await output(t, ['42', '-l', 'fr-FR', '--ordinal']), 'quarante-deuxième')
})

test('--currency selects the form and the currency at once', async (t) => {
  t.is(await output(t, ['42.50', '-l', 'en-US', '--currency', 'EUR']), 'forty-two euro and fifty cents')
})

test('--form currency uses the locale default currency', async (t) => {
  t.is(await output(t, ['42.50', '-l', 'en-US', '--form', 'currency']), 'forty-two dollars and fifty cents')
})

test('rejects contradictory form selectors', async (t) => {
  const result = await run(['42', '-l', 'en', '--cardinal', '--ordinal'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Conflicting forms/)
})

// ============================================================================
// Options derived from the language's own declarations
// ============================================================================

test('accepts an enum option as a flag', async (t) => {
  t.is(await output(t, ['1', '-l', 'es-ES', '--gender', 'feminine']), 'una')
})

test('negates a boolean option with --no-', async (t) => {
  t.is(await output(t, ['105', '-l', 'en-CA', '--no-and']), 'one hundred five')
})

test('accepts --flag=false for a boolean option', async (t) => {
  t.is(await output(t, ['105', '-l', 'en-CA', '--and=false']), 'one hundred five')
})

test('accepts a free-string option', async (t) => {
  const custom = await output(t, ['21', '-l', 'he-IL', '--and-word', 'X'])
  const standard = await output(t, ['21', '-l', 'he-IL'])
  t.not(custom, standard)
})

test('--option reaches an option by its declared name', async (t) => {
  t.is(await output(t, ['1', '-l', 'es-ES', '--option', 'gender=feminine']), 'una')
})

test('rejects an option flag the language does not declare', async (t) => {
  const result = await run(['42', '-l', 'en', '--gender', 'feminine'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Options for this language and form/)
})

test('rejects contradictory boolean flags', async (t) => {
  const result = await run(['42', '-l', 'en-CA', '--and', '--no-and'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Contradictory flags/)
})

// ============================================================================
// Value parsing
// ============================================================================

test('reads a negative value as a value, not as short flags', async (t) => {
  t.is(await output(t, ['-42', '-l', 'en']), 'minus forty-two')
})

test('reads a negative value after the -- escape', async (t) => {
  t.is(await output(t, ['-l', 'en', '--', '-42']), 'minus forty-two')
})

test('does not mistake a flag value for a negative number', async (t) => {
  const result = await run(['42', '-l', '-9'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Unknown language: -9/)
})

test('expands scientific notation', async (t) => {
  t.is(await output(t, ['1e6', '-l', 'en']), 'one million')
})

test('keeps full precision on values beyond Number.MAX_SAFE_INTEGER', async (t) => {
  const value = '12345678901234567890'
  t.is(await output(t, [value, '-l', 'en']), toCardinal(value))
})

test('converts several values, one line each', async (t) => {
  t.is(await output(t, ['1', '2', '3', '-l', 'en']), 'one\ntwo\nthree')
})

// ============================================================================
// stdin
// ============================================================================

test('reads values from stdin', async (t) => {
  t.is(await output(t, ['-l', 'en'], '1\n2\n'), 'one\ntwo')
})

test('reads stdin for an explicit - positional', async (t) => {
  t.is(await output(t, ['-l', 'en', '-'], '7\n'), 'seven')
})

test('keeps blank stdin lines aligned with their output', async (t) => {
  const result = await run(['-l', 'en'], '1\n\n3\n')
  t.is(result.code, 0)
  t.is(result.stdout, 'one\n\nthree\n')
})

test('converts the remaining lines when one fails, and exits 2', async (t) => {
  const result = await run(['-l', 'en'], '1\nzzz\n3\n')
  t.is(result.code, 2)
  t.is(result.stdout, 'one\nthree\n')
  t.regex(result.stderr, /Invalid number format/)
})

// ============================================================================
// Errors
// ============================================================================

test('exits 1 on an unknown language, suggesting near matches', async (t) => {
  const result = await run(['42', '-l', 'enn'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Unknown language: enn/)
  t.regex(result.stderr, /Did you mean: .*\ben-GB\b/)
})

test('exits 1 when --lang is missing', async (t) => {
  const result = await run(['42'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Missing --lang/)
})

test('exits 2 with the library message when a value is out of range', async (t) => {
  const result = await run(['1e400', '-l', 'en'])
  t.is(result.code, 2)
  t.regex(result.stderr, /largest supported value is 10\^66 - 1/)
})

test('exits 2 listing the allowed set for an out-of-set enum value', async (t) => {
  const result = await run(['1', '-l', 'es-ES', '--gender', 'nonsense'])
  t.is(result.code, 2)
  t.regex(result.stderr, /must be one of: masculine, feminine/)
})

test('exits 2 with the bare-tag hint when a currency is required', async (t) => {
  const result = await run(['42.50', '-l', 'en', '--form', 'currency'])
  t.is(result.code, 2)
  t.regex(result.stderr, /names a language, not a locale/)
})

test('a bare tag converts currency once given an explicit code', async (t) => {
  t.is(await output(t, ['42.50', '-l', 'en', '--currency', 'USD']), 'forty-two dollars and fifty cents')
})

// ============================================================================
// Introspection
// ============================================================================

test('--list covers exactly the shipped entry points', async (t) => {
  const listed = JSON.parse(await output(t, ['--list', '--json']))
  t.deepEqual(listed.map(entry => entry.code).sort(), getLanguageCodes().sort())
})

test('--list reports each entry point kind', async (t) => {
  const listed = JSON.parse(await output(t, ['--list', '--json']))
  t.is(listed.find(entry => entry.code === 'en').kind, 'alias')
  t.is(listed.find(entry => entry.code === 'en-AU').kind, 'profile')
  t.is(listed.find(entry => entry.code === 'en-US').kind, 'implementation')
})

test('--help --lang shows that language options and ceilings', async (t) => {
  const help = await output(t, ['--help', '--lang', 'es-ES'])
  t.regex(help, /--gender/)
  t.regex(help, /masculine, feminine/)
  t.regex(help, /10\^9 - 1/)
})

test('--help alone shows usage', async (t) => {
  t.regex(await output(t, ['--help']), /Usage:/)
})

test('--version prints the package version', async (t) => {
  t.regex(await output(t, ['--version']), /^\d+\.\d+\.\d+/)
})

test('--json reports the input, output and effective options', async (t) => {
  const record = JSON.parse(await output(t, ['1234', '-l', 'en', '--json']))
  t.is(record.input, '1234')
  t.is(record.output, 'one thousand two hundred thirty-four')
  t.is(record.lang, 'en')
  t.is(record.form, 'cardinal')
  t.deepEqual(record.options, { hundredPairing: false, and: false })
})

test('--json reports a failure as a record rather than plain text', async (t) => {
  const result = await run(['zzz', '-l', 'en', '--json'])
  t.is(result.code, 2)
  t.is(JSON.parse(result.stdout).error.name, 'RangeError')
})

// ============================================================================
// Language codes
// ============================================================================

test('accepts a language code in any casing', async (t) => {
  t.is(await output(t, ['1', '-l', 'EN-us']), 'one')
})

test('refuses a code that could escape the source directory', async (t) => {
  const result = await run(['1', '-l', '../../etc/passwd'])
  t.is(result.code, 1)
  t.regex(result.stderr, /Unknown language/)
})
