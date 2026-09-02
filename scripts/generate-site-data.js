/**
 * GitHub Pages Site Data Generator
 *
 * Emits the single JSON manifest the demo site is driven by: every variant,
 * the forms it exports, the options contract of each form (names, types,
 * descriptions, defaults, allowed sets), each form's declared ceiling, and
 * the size of the dist bundle the browser will actually fetch for it.
 *
 * Nothing about a language is hardcoded in the site: adding one to `src/`
 * makes it appear in the picker, with its own options panel, on the next
 * deploy. The options half is read by `./lib/options-index.js`, the same
 * extraction LANGUAGES.md uses, so the site and the docs can't disagree.
 *
 * Usage:
 *   node scripts/generate-site-data.js [outFile]
 *
 * Output:
 *   _site/languages.json (default) — see build-site.js, which calls this.
 */

import { writeFileSync, statSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { getLanguageCodes, getExportedForms, FORM_EXPORTS } from '../test/helpers/language-helpers.js'
import { getLanguageName } from '../test/helpers/language-naming.js'
import { buildOptionsIndex } from './lib/options-index.js'

const FORMS = /** @type {const} */ (['cardinal', 'ordinal', 'currency'])

// Scripts written right-to-left. `Intl.Locale.prototype.getTextInfo` answers
// this natively but is too new to rely on across the Node versions this repo
// supports, so it's tried first and this list is the fallback.
const RTL_PRIMARIES = new Set(['ar', 'fa', 'he', 'hbo', 'ur'])

/**
 * Text direction for a BCP 47 code.
 *
 * @param {string} code Language code
 * @returns {'ltr' | 'rtl'} Direction to set on rendered output
 */
function textDirection(code) {
  try {
    // @ts-expect-error -- getTextInfo is newer than the bundled lib types
    const direction = new Intl.Locale(code).getTextInfo?.().direction
    if (direction === 'ltr' || direction === 'rtl') return direction
  }
  catch { /* fall through to the static list */ }
  return RTL_PRIMARIES.has(code.split('-')[0]) ? 'rtl' : 'ltr'
}

/**
 * The language's own name for itself, when ICU knows one. Falls back to the
 * English display name — a picker row is worse blank than monolingual.
 *
 * @param {string} code Language code
 * @param {string} fallback English display name
 * @returns {string} Endonym, or the fallback
 */
function endonym(code, fallback) {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code)
    // ICU echoes the subtag back when it has no data for a language — either
    // alone ("hbo") or inside an otherwise-translated name ("hbo (Israel)").
    // A word-boundary match catches both without touching a real endonym,
    // since no endonym contains its own subtag as a standalone word.
    const echoesCode = name && new RegExp(`\\b${code.split('-')[0]}\\b`).test(name)
    return name && !echoesCode ? name : fallback
  }
  catch {
    return fallback
  }
}

/**
 * Human-readable label for a form's ceiling. A `*Max` is the smallest value
 * the form refuses, and every helper-derived one lands on a round power of
 * ten, so "10^33" is both accurate and far easier to read than the 34-digit
 * literal. Anything that isn't an exact power falls back to a digit count.
 *
 * @param {bigint | null} max The form's declared ceiling (null = UNBOUNDED)
 * @returns {string | null} Label, or null when unbounded
 */
function maxLabel(max) {
  if (max === null) return null
  const digits = max.toString()
  return /^10*$/.test(digits) ? `10^${digits.length - 1}` : `${digits.length} digits`
}

/**
 * Raw and gzipped size of one built bundle, or null when it doesn't exist
 * (a language exporting two forms has no third per-form bundle).
 *
 * @param {string} path Path to a dist file
 * @returns {{ raw: number, gzip: number } | null} Byte sizes
 */
function bundleSize(path) {
  try {
    if (!statSync(path).isFile()) return null
    return { raw: statSync(path).size, gzip: gzipSync(readFileSync(path)).length }
  }
  catch {
    return null
  }
}

/**
 * Every currency any language can name, mapped to its English display name,
 * so the demo's currency picker can label a code without shipping its own
 * copy of that table.
 *
 * @param {Map<string, Record<string, any>>} mods Code -> module namespace
 * @returns {Record<string, string>} ISO 4217 code -> English name
 */
function currencyNames(mods) {
  const names = new Intl.DisplayNames(['en'], { type: 'currency' })
  const all = new Set()
  for (const mod of mods.values()) {
    for (const code of mod.currencyValues?.currency ?? []) all.add(code)
  }
  return Object.fromEntries(
    [...all].sort().map(code => [code, names.of(code) ?? code]),
  )
}

/**
 * Build one variant's entry.
 *
 * @param {string} code Language code
 * @param {Record<string, any>} mod Its module namespace
 * @param {Set<string>} forms Forms it exports
 * @param {Map<string, import('./lib/options-index.js').OptionInfo[]>} options Function name -> options
 * @param {string | undefined} bareTag Its family's bare-tag entry point, if this variant is the target
 * @returns {object} Manifest entry
 */
function buildVariant(code, mod, forms, options, bareTag) {
  const name = getLanguageName(code) || code

  return {
    code,
    name,
    native: endonym(code, name),
    primary: code.split('-')[0],
    dir: textDirection(code),
    // What an import statement for this variant should say. The bare tag is
    // the documented primary entry point where one resolves here; everything
    // else has to name its region or script.
    entry: bareTag ?? code,
    bareTag: bareTag ?? null,
    // A locale profile is a numeral-identical clone of another variant that
    // overrides only its default currency (docs/language-layers.md).
    variantOf: mod.variantOf ?? null,
    defaultCurrency: mod.currencyDefaults?.currency ?? null,
    forms: Object.fromEntries(FORMS.filter(form => forms.has(form)).map((form) => {
      const max = mod[`${form}Max`] ?? null
      return [form, {
        max: max === null ? null : max.toString(),
        maxLabel: maxLabel(max),
        options: (options.get(FORM_EXPORTS[form]) ?? []).map(option => ({
          name: option.name,
          type: option.type,
          description: option.description,
          default: option.defaultValue ?? null,
          // Enum options declare their accepted set; boolean and free-string
          // ones don't, and the site renders a checkbox/field for those.
          values: mod[`${form}Values`]?.[option.name] ?? null,
        })),
        bundle: bundleSize(`dist/${code}/${form}.js`),
      }]
    })),
    bundle: bundleSize(`dist/${code}.js`),
  }
}

async function main() {
  const outFile = process.argv[2] ?? '_site/languages.json'
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

  const allCodes = getLanguageCodes().sort((a, b) => a.localeCompare(b))
  const allMods = new Map(
    await Promise.all(allCodes.map(async code => /** @type {const} */ ([code, await import(`../src/${code}.js`)]))),
  )

  // Same split as the LANGUAGES.md generator: an alias file is a re-export,
  // not a language of its own. Aliases never become picker rows — they show
  // up as the `entry` of the variant they point at, which is what the demo's
  // code snippets should tell a reader to import.
  const codes = allCodes.filter(code => allMods.get(code).aliasOf === undefined)
  const bareTagFor = new Map(
    allCodes
      .filter(code => allMods.get(code).aliasOf !== undefined)
      .map(code => [allMods.get(code).aliasOf, code]),
  )
  const mods = new Map(codes.map(code => [code, allMods.get(code)]))

  const forms = new Map(
    await Promise.all(codes.map(async code => /** @type {const} */ ([code, await getExportedForms(code)]))),
  )
  const optionsIndex = buildOptionsIndex(codes, mods)

  const variants = codes.map(code => buildVariant(
    code,
    mods.get(code),
    forms.get(code),
    optionsIndex.get(code) ?? new Map(),
    bareTagFor.get(code),
  ))

  // One row per BCP 47 primary subtag — the sense in which n2words supports
  // "50 languages" (see CLAUDE.md and docs/bare-tag-aliases.md).
  const families = [...new Set(variants.map(v => v.primary))]
    .map((primary) => {
      const members = variants.filter(v => v.primary === primary)
      // An alias code is always its family's primary subtag by construction,
      // so a family has an entry point exactly when one of its variants is an
      // alias target.
      const target = members.find(v => v.bareTag)
      return {
        primary,
        name: getLanguageName(primary) || primary,
        entry: target ? target.bareTag : null,
        default: target?.code ?? null,
        variants: members.map(v => v.code),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const manifest = {
    version: pkg.version,
    repository: 'https://github.com/forzagreen/n2words',
    counts: {
      languages: families.length,
      variants: variants.length,
      entryPoints: bareTagFor.size,
    },
    currencies: currencyNames(mods),
    families,
    variants,
  }

  writeFileSync(outFile, `${JSON.stringify(manifest)}\n`)
  console.log(`✓ Generated ${outFile} (${families.length} languages, ${variants.length} variants)`)
}

main()
