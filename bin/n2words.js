#!/usr/bin/env node
/**
 * n2words command-line interface.
 *
 * Nothing about a language is hardcoded here. Flags, help text and validation
 * are derived at runtime from each module's own declarations — `<form>Defaults`,
 * `<form>Values`, `<form>Max` — so adding a language or an option to src/ gives
 * the CLI a new flag with no edit in bin/.
 *
 * Ships in the published package, so it imports only node: builtins and src/.
 */

import { createInterface } from 'node:readline'
import { readFileSync } from 'node:fs'
import { UsageError, parseGlobals, parseInvocation, resolveForm } from './lib/args.js'
import { FORM_EXPORTS, canonicalCode, exportedForms, importLanguage, listCodes, suggestCodes } from './lib/languages.js'
import { renderHelp, renderLanguageHelp, renderList, summarize } from './lib/format.js'

const EXIT_USAGE = 1
const EXIT_CONVERSION = 2

/**
 * The package version, read from the manifest rather than duplicated here.
 *
 * @returns {string} The version string
 */
function version() {
  return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
}

/**
 * Resolves a user-supplied code to a canonical one and imports it.
 *
 * The membership check against the real directory listing is what turns a typo
 * into a helpful message instead of a raw ERR_MODULE_NOT_FOUND.
 *
 * @param {string} input The code as typed
 * @returns {Promise<{code: string, mod: Record<string, unknown>}>} The canonical code and its module
 * @throws {UsageError} If no such entry point exists
 */
async function loadLanguage(input) {
  const code = canonicalCode(input)
  const codes = listCodes()

  if (code === null || !codes.includes(code)) {
    const suggestions = suggestCodes(input, codes)
    throw new UsageError(
      `Unknown language: ${input}`,
      suggestions.length > 0
        ? `Did you mean: ${suggestions.join(', ')}`
        : 'Run n2words --list to see every language code.',
    )
  }

  return { code, mod: await importLanguage(code) }
}

/**
 * Turns a parseArgs failure into a usage error, so a missing flag value reads
 * as advice rather than as a stack trace.
 *
 * @param {string[]} argv Raw arguments
 * @returns {Record<string, unknown>} The built-in flag values
 * @throws {UsageError} On a malformed invocation
 */
function readGlobals(argv) {
  try {
    return parseGlobals(argv)
  }
  catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      throw new UsageError(error.message)
    }
    throw error
  }
}

/**
 * Prints every entry point and the forms it exports.
 *
 * @param {boolean} json Emit JSON instead of a table
 * @returns {Promise<void>} Resolves once printed
 */
async function printList(json) {
  const summaries = []
  for (const code of listCodes()) {
    summaries.push(summarize(code, await importLanguage(code)))
  }
  console.log(json ? JSON.stringify(summaries, null, 2) : renderList(summaries))
}

/**
 * Runs the CLI.
 *
 * @param {string[]} argv Raw arguments (process.argv.slice(2))
 * @returns {Promise<number>} The process exit code
 * @throws {UsageError} On a malformed invocation
 */
async function main(argv) {
  const globals = readGlobals(argv)
  const json = globals.json === true

  if (globals.version === true) {
    console.log(version())
    return 0
  }

  if (globals.list === true) {
    await printList(json)
    return 0
  }

  if (globals.help === true) {
    if (globals.lang === undefined) {
      console.log(renderHelp(version()))
    }
    else {
      const { code, mod } = await loadLanguage(String(globals.lang))
      console.log(renderLanguageHelp(code, mod))
    }
    return 0
  }

  if (globals.lang === undefined) {
    throw new UsageError('Missing --lang', 'For example: n2words 42 --lang en. Run n2words --list for every code.')
  }

  const { code, mod } = await loadLanguage(String(globals.lang))
  const form = resolveForm(globals)
  const convert = mod[FORM_EXPORTS[form]]

  if (typeof convert !== 'function') {
    throw new UsageError(
      `${code} has no ${form} form`,
      `It supports: ${exportedForms(mod).map(supported => `--${supported}`).join(', ')}`,
    )
  }

  const defaults = /** @type {Record<string, unknown> | undefined} */ (mod[`${form}Defaults`])
  const { values, positionals, options } = parseInvocation(argv, defaults)

  // `--currency CODE` is both the form shorthand and the option value. Forward
  // it even when the module's own defaults omit `currency`: the 46 bare-tag
  // aliases deliberately carry no default currency and require an explicit one
  // (see src/en.js and docs/bare-tag-aliases.md).
  if (form === 'currency' && typeof values.currency === 'string') {
    options.set('currency', values.currency)
  }

  // Object.fromEntries builds genuine own properties, so a key like `__proto__`
  // reaches resolveOptions as an unknown option (a clear TypeError) instead of
  // mutating a prototype or vanishing silently.
  const resolved = options.size > 0 ? Object.fromEntries(options) : undefined
  const effective = { ...defaults, ...Object.fromEntries(options) }
  let failed = false

  /**
   * Converts one value and prints the result or the failure.
   *
   * @param {string} input The value as typed — passed through as text, never
   *   through Number(), so precision survives
   */
  const write = (input) => {
    let output
    try {
      output = convert(input, resolved)
    }
    catch (error) {
      failed = true
      if (json) {
        console.log(JSON.stringify({ input, lang: code, form, error: { name: error.name, message: error.message } }))
      }
      else {
        console.error(`n2words: ${input}: ${error.message}`)
      }
      return
    }
    console.log(json ? JSON.stringify({ input, output, lang: code, form, options: effective }) : output)
  }

  const fromStdin = positionals.length === 0 || (positionals.length === 1 && positionals[0] === '-')

  if (fromStdin) {
    if (process.stdin.isTTY) {
      throw new UsageError('No values to convert', 'Pass a value, or pipe them in: echo 42 | n2words -l en')
    }
    // Streaming keeps a long pipe responsive and bounded in memory.
    for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
      const value = line.trim()
      if (value === '') {
        // Keep output lined up with input in text mode; a blank line has no
        // JSON representation, so JSONL simply skips it.
        if (!json) console.log('')
        continue
      }
      write(value)
    }
  }
  else {
    for (const positional of positionals) write(positional)
  }

  return failed ? EXIT_CONVERSION : 0
}

// A CLI that feeds `head` or `grep -q` gets its stdout closed mid-write; that's
// a normal end, not a crash.
process.stdout.on('error', (error) => {
  // eslint-disable-next-line n/no-process-exit -- a closed stdout is a normal end for a pipe consumer (`| head`), and there is nothing left to unwind
  if (error.code === 'EPIPE') process.exit(0)
  throw error
})

try {
  process.exitCode = await main(process.argv.slice(2))
}
catch (error) {
  if (!(error instanceof UsageError)) throw error
  console.error(`n2words: ${error.message}`)
  if (error.hint !== undefined) console.error(error.hint)
  process.exitCode = EXIT_USAGE
}
