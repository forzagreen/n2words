/**
 * Argument parsing for the CLI.
 *
 * The full flag set isn't knowable until the language and form are: option
 * flags are derived from the selected module's own `<form>Defaults`, so a
 * language gaining an option gains a flag with no edit here. That forces two
 * passes over argv — a lenient one to find `--lang`/`--form`, then a strict one
 * once the derived flags are known.
 *
 * Validation of option *values* stays the library's job: this module builds a
 * plain options object and hands it over, so `resolveOptions` produces the
 * errors (which already name the offending key and the allowed set).
 *
 * @module cli/args
 */

import { parseArgs } from 'node:util'
import { FORMS } from './languages.js'

/** An error in how the CLI was invoked, as opposed to a conversion failure. */
export class UsageError extends Error {
  /**
   * @param {string} message What went wrong
   * @param {string} [hint] An optional second line suggesting the fix
   */
  constructor(message, hint) {
    super(message)
    this.name = 'UsageError'
    this.hint = hint
  }
}

/**
 * Flags the CLI owns. These are reserved: a language option of the same name is
 * reachable only through `--option key=value`.
 */
export const BUILTIN_OPTIONS = {
  lang: { type: 'string', short: 'l' },
  form: { type: 'string', short: 'f' },
  cardinal: { type: 'boolean' },
  ordinal: { type: 'boolean' },
  currency: { type: 'string' },
  option: { type: 'string', multiple: true },
  json: { type: 'boolean', short: 'j' },
  list: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
}

// Wrapper for negative numbers, which would otherwise parse as short-option
// groups (`-42` -> `-4 -2`). Substitution is bounds-checked against what was
// actually shielded, so this prefix is inert unless the run produced it.
const SHIELD = 'n2words:negative:'

/**
 * camelCase option key -> kebab-case flag (`hundredPairing` -> `hundred-pairing`).
 *
 * @param {string} key An option key as declared in `<form>Defaults`
 * @returns {string} The flag name, without leading dashes
 */
export function toFlag(key) {
  return key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)
}

/**
 * Derives the parseArgs config for one form's declared options.
 *
 * Booleans get a `--no-` companion (parseArgs has no negation of its own).
 * Note nl-NL declares an option literally named `noHundredPairing`, whose flag
 * is therefore `--no-hundred-pairing` and whose negation is
 * `--no-no-hundred-pairing`; that only reads as a collision with en-US's
 * `hundredPairing` in the abstract, since flags are derived per-language after
 * `--lang` resolves and no module declares both.
 *
 * @param {Record<string, unknown> | undefined} defaults The form's `<form>Defaults`
 * @returns {{options: object, byFlag: Map<string, {key: string, value?: boolean}>, byKey: Map<string, {on: string, off?: string}>}}
 */
export function buildFlagIndex(defaults) {
  /** @type {Record<string, {type: 'string' | 'boolean'}>} */
  const options = {}
  const byFlag = new Map()
  const byKey = new Map()

  for (const key of Object.keys(defaults ?? {})) {
    const flag = toFlag(key)
    // A built-in always wins. Today that's only `currency`, whose built-in
    // doubles as the form shorthand and feeds this very option (see resolveForm).
    if (Object.hasOwn(BUILTIN_OPTIONS, flag)) continue

    if (typeof defaults[key] === 'boolean') {
      const negated = `no-${flag}`
      options[flag] = { type: 'boolean' }
      byFlag.set(flag, { key, value: true })
      byKey.set(key, { on: flag })

      if (!Object.hasOwn(BUILTIN_OPTIONS, negated)) {
        options[negated] = { type: 'boolean' }
        byFlag.set(negated, { key, value: false })
        byKey.set(key, { on: flag, off: negated })
      }
    }
    else {
      options[flag] = { type: 'string' }
      byFlag.set(flag, { key })
      byKey.set(key, { on: flag })
    }
  }

  return { options, byFlag, byKey }
}

/**
 * The lenient first pass: enough to learn the language and form.
 *
 * Declaring the built-ins keeps `--lang en` from parsing as a boolean plus a
 * stray positional; everything not yet known is tolerated rather than rejected.
 *
 * @param {string[]} argv Raw arguments (process.argv.slice(2))
 * @returns {Record<string, unknown>} The built-in flag values found
 */
export function parseGlobals(argv) {
  const { values } = parseArgs({
    args: argv,
    options: BUILTIN_OPTIONS,
    strict: false,
    allowPositionals: true,
  })
  return values
}

/**
 * Picks the conversion form from the built-in selectors.
 *
 * `--currency <CODE>` means "as currency, in CODE" — the form and the option in
 * one flag. `--form currency` selects the form and leaves the locale's own
 * default currency in place.
 *
 * @param {Record<string, unknown>} values Built-in flag values
 * @returns {string} One of FORMS
 * @throws {UsageError} On an unknown or contradictory form
 */
export function resolveForm(values) {
  const selectors = []
  if (values.form !== undefined) selectors.push(String(values.form))
  if (values.cardinal === true) selectors.push('cardinal')
  if (values.ordinal === true) selectors.push('ordinal')
  if (values.currency !== undefined) selectors.push('currency')

  const unique = [...new Set(selectors)]
  if (unique.length > 1) {
    throw new UsageError(`Conflicting forms requested: ${unique.join(', ')}`, 'Pick one of --cardinal, --ordinal, --currency.')
  }

  const form = unique[0] ?? 'cardinal'
  if (!FORMS.includes(form)) {
    throw new UsageError(`Unknown form: ${form}`, `Known forms: ${FORMS.join(', ')}`)
  }
  return form
}

/**
 * Does this token consume the next one as its value?
 *
 * @param {string | undefined} token The preceding argv token
 * @param {Record<string, {type: string, short?: string}>} options The full parseArgs config
 * @returns {boolean} True when the following token is that flag's value
 */
function takesValue(token, options) {
  if (typeof token !== 'string' || !token.startsWith('-') || token === '-') return false

  if (token.startsWith('--')) {
    if (token.includes('=')) return false
    return options[token.slice(2)]?.type === 'string'
  }

  // Short groups (`-jl en`): only the last letter can take a value.
  const short = token.at(-1)
  return Object.values(options).some(option => option.short === short && option.type === 'string')
}

/**
 * Interprets `--flag=false` for boolean flags, which strict parseArgs rejects
 * outright ("does not take an argument").
 *
 * @param {string} text The text after the `=`
 * @param {string} flag The flag it came from, for the error message
 * @returns {boolean} The parsed boolean
 * @throws {UsageError} If the text isn't a boolean
 */
function parseBoolean(text, flag) {
  if (['true', '1', 'yes', 'on'].includes(text)) return true
  if (['false', '0', 'no', 'off'].includes(text)) return false
  throw new UsageError(`Option "${flag}" must be a boolean, got "${text}"`, 'Use true or false.')
}

/**
 * Rewrites `--flag=<bool>` into the canonical `--flag` / `--no-flag`, and wraps
 * negative numbers so they survive parsing as positionals.
 *
 * The negative-number rule is exact rather than a guess: a `-4…` token is a
 * value only when the preceding token is a flag that takes one, and the
 * complete option config is known by this point.
 *
 * @param {string[]} argv Raw arguments
 * @param {object} config The full parseArgs options config
 * @param {Map<string, {key: string, value?: boolean}>} byFlag Derived flag index
 * @param {Map<string, {on: string, off?: string}>} byKey Per-key flag names
 * @returns {{args: string[], shielded: string[]}} Rewritten argv and the originals it hid
 */
function rewriteArgs(argv, config, byFlag, byKey) {
  const args = []
  const shielded = []
  let literal = false

  for (const [position, token] of argv.entries()) {
    if (literal) {
      args.push(token)
      continue
    }
    if (token === '--') {
      literal = true
      args.push(token)
      continue
    }

    const assignment = /^--([^=]+)=([\s\S]*)$/.exec(token)
    const entry = assignment === null ? undefined : byFlag.get(assignment[1])
    if (entry !== undefined && typeof entry.value === 'boolean') {
      // `--no-and=true` means and=false, so fold the flag's own polarity in.
      const wanted = entry.value === parseBoolean(assignment[2], assignment[1])
      const flags = byKey.get(entry.key)
      if (!wanted && flags.off === undefined) {
        throw new UsageError(`Option "${assignment[1]}" cannot be negated`, `Use --option ${entry.key}=false instead.`)
      }
      args.push(`--${wanted ? flags.on : flags.off}`)
      continue
    }

    if (/^-\d/.test(token) && !takesValue(argv[position - 1], config)) {
      args.push(`${SHIELD}${shielded.length}`)
      shielded.push(token)
      continue
    }

    args.push(token)
  }

  return { args, shielded }
}

/**
 * Restores a shielded negative number, if that's what this positional is.
 *
 * @param {string} positional A parsed positional
 * @param {string[]} shielded The originals hidden by rewriteArgs
 * @returns {string} The original token
 */
function unshield(positional, shielded) {
  if (!positional.startsWith(SHIELD)) return positional
  const index = Number(positional.slice(SHIELD.length))
  return Number.isInteger(index) && index < shielded.length ? shielded[index] : positional
}

/**
 * The strict second pass, once the language's own option flags are known.
 *
 * @param {string[]} argv Raw arguments
 * @param {Record<string, unknown> | undefined} defaults The form's `<form>Defaults`
 * @returns {{values: Record<string, unknown>, positionals: string[], options: Map<string, unknown>}}
 * @throws {UsageError} On an unknown flag, a missing value, or contradictory flags
 */
export function parseInvocation(argv, defaults) {
  const { options: derived, byFlag, byKey } = buildFlagIndex(defaults)
  const config = { ...BUILTIN_OPTIONS, ...derived }
  const { args, shielded } = rewriteArgs(argv, config, byFlag, byKey)

  let parsed
  try {
    parsed = parseArgs({ args, options: config, strict: true, allowPositionals: true })
  }
  catch (error) {
    const supported = [...byFlag.keys()].filter(flag => !flag.startsWith('no-'))
    throw new UsageError(
      error.message,
      supported.length > 0
        ? `Options for this language and form: ${supported.map(flag => `--${flag}`).join(', ')}`
        : 'This language and form take no options.',
    )
  }

  /** @type {Map<string, unknown>} */
  const options = new Map()
  const setBy = new Map()

  for (const [flag, raw] of Object.entries(parsed.values)) {
    const entry = byFlag.get(flag)
    if (entry === undefined) continue // A built-in; the caller handles those.

    if (setBy.has(entry.key) && setBy.get(entry.key) !== flag) {
      throw new UsageError(`Contradictory flags: --${setBy.get(entry.key)} and --${flag}`)
    }
    setBy.set(entry.key, flag)
    options.set(entry.key, entry.value ?? raw)
  }

  for (const spec of /** @type {string[]} */ (parsed.values.option ?? [])) {
    const separator = spec.indexOf('=')
    if (separator < 1) {
      throw new UsageError(`--option expects key=value, got "${spec}"`, 'For example: --option gender=feminine')
    }
    const key = spec.slice(0, separator)
    const raw = spec.slice(separator + 1)
    const isBoolean = defaults !== undefined && Object.hasOwn(defaults, key) && typeof defaults[key] === 'boolean'
    options.set(key, isBoolean ? parseBoolean(raw, key) : raw)
  }

  return {
    values: parsed.values,
    positionals: parsed.positionals.map(positional => unshield(positional, shielded)),
    options,
  }
}
