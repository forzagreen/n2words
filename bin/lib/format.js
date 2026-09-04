/**
 * Output rendering for the CLI: help, `--list`, and the effective-options view.
 *
 * Everything here is derived from a module's own exports — `<form>Defaults`,
 * `<form>Values`, `<form>Max` — so help text can't drift from behavior. Those
 * exports are guaranteed present by the contract gates (see
 * docs/options-contract.md and docs/range-contract.md).
 *
 * @module cli/format
 */

import { toFlag } from './args.js'
import { FORMS, describeKind, exportedForms } from './languages.js'

/**
 * Renders a form's ceiling the way `checkMax` does — `10^N - 1` for an exact
 * power of ten, the raw maximum otherwise. Duplicated rather than shared
 * because `src/utils/*` is deliberately unreachable from outside the package.
 *
 * @param {bigint | null | undefined} max A form's `<form>Max`
 * @returns {string | null} The largest supported value, or null when unbounded
 */
export function formatMax(max) {
  if (max === null || max === undefined) return null
  const exponent = String(max).length - 1
  return max === 10n ** BigInt(exponent) ? `10^${exponent} - 1` : String(max - 1n)
}

/**
 * The options one form of one language declares.
 *
 * @param {Record<string, unknown>} mod An imported language module
 * @param {string} form One of FORMS
 * @returns {Array<{name: string, flag: string, type: string, default: unknown, values: string[] | null}>}
 */
export function formOptions(mod, form) {
  const defaults = mod[`${form}Defaults`]
  if (defaults === undefined) return []
  const values = mod[`${form}Values`] ?? {}

  return Object.entries(defaults).map(([name, value]) => ({
    name,
    flag: toFlag(name),
    type: typeof value,
    default: value,
    values: Object.hasOwn(values, name) ? [...values[name]] : null,
  }))
}

/**
 * A language's English display name, when Intl knows one.
 *
 * @param {string} code A canonical language code
 * @returns {string | null} The display name, or null if it's just the code back
 */
export function displayName(code) {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code)
    return name === code ? null : name
  }
  catch {
    return null
  }
}

/**
 * Everything `--list` reports about one entry point.
 *
 * @param {string} code The language code
 * @param {Record<string, unknown>} mod Its imported module
 * @returns {object} A JSON-serializable summary
 */
export function summarize(code, mod) {
  const { kind, target } = describeKind(mod)
  /** @type {Record<string, object>} */
  const forms = {}

  for (const form of exportedForms(mod)) {
    forms[form] = {
      max: formatMax(/** @type {bigint | null} */ (mod[`${form}Max`])),
      options: formOptions(mod, form).map(option => ({
        name: option.name,
        flag: `--${option.flag}`,
        type: option.type,
        default: option.default,
        values: option.values,
      })),
    }
  }

  return { code, name: displayName(code), kind, target, forms }
}

/**
 * The plain-text `--list` table.
 *
 * @param {object[]} summaries Output of summarize(), in display order
 * @returns {string} The rendered table
 */
export function renderList(summaries) {
  const width = Math.max(...summaries.map(summary => summary.code.length))

  return summaries
    .map((summary) => {
      const kind = summary.target === null ? summary.kind : `${summary.kind} of ${summary.target}`
      return `${summary.code.padEnd(width)}  ${kind.padEnd(22)}  ${Object.keys(summary.forms).join(', ')}`
    })
    .join('\n')
}

/**
 * The general help screen.
 *
 * @param {string} version The package version
 * @returns {string} The rendered help
 */
export function renderHelp(version) {
  return `n2words ${version} — convert numbers to words

Usage:
  n2words <value>... --lang <code> [options]
  echo 42 | n2words --lang <code>

Options:
  -l, --lang <code>     Language entry point, e.g. en, en-GB, zh-Hans-CN (required)
  -f, --form <form>     Conversion form: ${FORMS.join(', ')} (default: cardinal)
      --cardinal        Shorthand for --form cardinal
      --ordinal         Shorthand for --form ordinal
      --currency <CODE> Convert as currency in an ISO 4217 code, e.g. EUR
                        (use --form currency for the locale's own default)
      --option k=value  Set a language option by its declared name
  -j, --json            Emit one JSON object per input instead of plain text
      --list            List every language entry point and the forms it exports
  -h, --help            Show this help; add --lang <code> for that language's options
  -v, --version         Print the version

Each language declares its own options; run --help --lang <code> to see them.
Values are read as text, so precision is never lost — 12345678901234567890 works.
A value starting with "-" is fine as long as no value-taking flag precedes it.

Examples:
  n2words 42 --lang en
  n2words 42 -l fr-FR --ordinal
  n2words 42.50 -l en-US --currency EUR
  n2words 101 -l es-ES --gender feminine
  printf '1\\n2\\n' | n2words -l de --json

Exit codes: 0 success, 1 usage error, 2 a value could not be converted.`
}

/**
 * The per-language help screen, built from the module's own exports.
 *
 * @param {string} code The canonical language code
 * @param {Record<string, unknown>} mod Its imported module
 * @returns {string} The rendered help
 */
export function renderLanguageHelp(code, mod) {
  const name = displayName(code)
  const { kind, target } = describeKind(mod)
  const lines = [`n2words --lang ${code}${name === null ? '' : ` — ${name}`}`]

  if (target !== null) {
    lines.push(`${kind === 'alias' ? 'Bare-tag alias for' : 'Locale profile of'} ${target}.`)
  }

  const forms = exportedForms(mod)
  lines.push('', 'Forms:')
  for (const form of forms) {
    const max = formatMax(/** @type {bigint | null} */ (mod[`${form}Max`]))
    const range = max === null ? 'no upper limit' : `up to ${max}`
    lines.push(`  --${form.padEnd(18)}${range}${form === 'cardinal' ? '  (default)' : ''}`)
  }

  for (const form of forms) {
    const options = formOptions(mod, form)
    if (options.length === 0) continue

    const flags = options.map(option => option.type === 'boolean'
      ? `--${option.flag} / --no-${option.flag}`
      : `--${option.flag} <value>`)
    const width = Math.max(...flags.map(flag => flag.length)) + 2

    lines.push('', `Options for --${form}:`)
    for (const [position, option] of options.entries()) {
      const allowed = option.values === null ? '' : `  one of: ${option.values.join(', ')}`
      lines.push(`  ${flags[position].padEnd(width)}default: ${option.default}${allowed}`)
    }
  }

  if (forms.includes('currency') && mod.currencyDefaults?.currency === undefined) {
    lines.push('', `A bare tag names a language, not a country, so ${code} has no default`,
      'currency: pass --currency <CODE>, or use a region-qualified --lang.')
  }

  return lines.join('\n')
}
