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
import { createHash } from 'node:crypto'
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
    // since no endonym contains its own subtag as a standalone word. The
    // boundary has to be Unicode-aware: `\b` is defined against `\w`, which is
    // ASCII, so it fires between "az" and "ə" and discards Azerbaijani's real
    // endonym ("azərbaycan"). Letter lookarounds test the actual condition.
    const subtag = code.split('-')[0]
    const echoesCode = name && new RegExp(`(?<!\\p{L})${subtag}(?!\\p{L})`, 'u').test(name)
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

// Values chosen to exercise the places variants actually diverge: the "and"
// after hundreds (en-GB vs en-US), vigesimal/septante forms (fr-BE vs fr-FR),
// scale-word boundaries, decimals and negatives.
const PROBE_VALUES = [
  '0', '1', '7', '11', '16', '21', '42', '71', '80', '91', '100', '101', '111',
  '999', '1000', '1500', '2001', '100000', '1000000', '123456789',
  '1000000000000', '-42', '3.14',
]

/**
 * A fingerprint of how one variant spells numbers, across every form it
 * exports. Two variants with the same fingerprint are word-for-word identical
 * over the probe set and differ only in their default currency.
 *
 * This is the distinction the site has to make legible. `en-AU` and `en-GB`
 * spell every number the same way; `en-US` is the one that says "one hundred
 * one"; `en-IN` groups in lakh and crore. Grouping by measured output says
 * that in one number ("16 regions, 4 spellings") where a flat list of 16 codes
 * says nothing. `variantOf` in the source marks deliberate clones, but not
 * every identical pair is a declared clone — en-AU is a full implementation
 * that happens to agree with en-GB — so this probes the real functions rather
 * than trusting the declaration. It earns that: en-CA lands in a group of its
 * own because it takes British cardinals ("one hundred and one") with American
 * ordinals ("...seven hundred eighty-ninth"), which no declaration records.
 *
 * Currency is excluded on purpose: a differing default currency is exactly
 * what we want to report separately from differing words.
 *
 * @param {Record<string, any>} mod The variant's module namespace
 * @returns {string} Stable fingerprint of this variant's number words
 */
function spellingSignature(mod) {
  const rendered = []

  for (const exportName of ['toCardinal', 'toOrdinal']) {
    const convert = mod[exportName]
    if (typeof convert !== 'function') {
      rendered.push(`${exportName}:absent`)
      continue
    }
    for (const value of PROBE_VALUES) {
      try {
        rendered.push(convert(value))
      }
      catch (error) {
        // A different ceiling is itself a spelling difference worth capturing.
        rendered.push(`<${error.name}>`)
      }
    }
  }

  return createHash('sha1').update(rendered.join('\u0000')).digest('hex').slice(0, 12)
}

/**
 * Partition a family's variants into spelling groups.
 *
 * The group containing the family's default variant comes first (it's the one
 * the bare tag resolves to); the rest follow by descending size, so the most
 * widely-shared spelling outranks a one-off.
 *
 * A group's representative is the family default when it's in the group, else
 * the member that is a full implementation rather than a locale profile — the
 * base its siblings were cloned from. That's why the eleven-strong English
 * group is represented by `en-GB` and not by `en-AU`, which merely sorts first.
 *
 * @param {string[]} codes The family's variant codes
 * @param {Map<string, string>} signatures Code -> spelling signature
 * @param {Map<string, string | null>} profileOf Code -> the variant it clones, or null if it's a full implementation
 * @param {string | null} defaultCode The variant the family's bare tag resolves to
 * @returns {Array<{representative: string, codes: string[]}>} Groups, most significant first
 */
function spellingGroups(codes, signatures, profileOf, defaultCode) {
  const bySignature = new Map()
  for (const code of codes) {
    const signature = signatures.get(code)
    if (!bySignature.has(signature)) bySignature.set(signature, [])
    bySignature.get(signature).push(code)
  }

  return [...bySignature.values()]
    .map(group => ({
      representative: group.includes(defaultCode)
        ? defaultCode
        : group.find(code => profileOf.get(code) === null) ?? group[0],
      codes: group,
    }))
    .sort((a, b) => {
      if (a.representative === defaultCode) return -1
      if (b.representative === defaultCode) return 1
      return b.codes.length - a.codes.length || a.representative.localeCompare(b.representative)
    })
}

/**
 * Pick the probe value that best separates a family's spelling groups, and
 * render each group's version of it.
 *
 * The languages page and the demo's region list both need to *show* what a
 * spelling difference actually is — "one hundred one" beside "one hundred and
 * one" — rather than assert one exists. Not every value distinguishes every
 * group (101 separates en-US from en-GB but not en-GB from en-IN), so this
 * picks whichever probe yields the most distinct renderings, preferring the
 * smallest such value so the example stays easy to read.
 *
 * @param {Array<{representative: string, codes: string[]}>} groups The family's spelling groups
 * @param {Map<string, Record<string, any>>} mods Code -> module namespace
 * @returns {{value: string, texts: Record<string, string>} | null} The example, or null for a single-group family
 */
function groupSample(groups, mods) {
  if (groups.length < 2) return null

  let best = null

  for (const value of PROBE_VALUES) {
    const texts = {}
    for (const group of groups) {
      const convert = mods.get(group.representative)?.toCardinal
      if (typeof convert !== 'function') continue
      try {
        texts[group.representative] = convert(value)
      }
      catch { /* out of this variant's range; it just won't be shown */ }
    }
    const distinct = new Set(Object.values(texts)).size
    if (Object.keys(texts).length === groups.length && (best === null || distinct > best.distinct)) {
      best = { value, texts, distinct }
    }
    if (best?.distinct === groups.length) break
  }

  if (best === null) return null

  // Two groups can render the chosen value identically and still be different
  // spellings — en-GB and en-CA agree on every cardinal and part company only
  // in ordinals. Flag those so the UI can say so instead of showing two
  // identical lines and looking wrong.
  const counts = new Map()
  for (const text of Object.values(best.texts)) counts.set(text, (counts.get(text) ?? 0) + 1)
  const tied = Object.fromEntries(
    Object.entries(best.texts).map(([code, text]) => [code, counts.get(text) > 1]),
  )

  return { value: best.value, texts: best.texts, tied }
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
    // Fingerprint of this variant's number words; siblings sharing it are
    // word-for-word identical and differ only in default currency. Resolved
    // into a `spelling` (the representative code of its group) once every
    // variant is built — see main().
    signature: spellingSignature(mod),
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
  const signatures = new Map(variants.map(v => [v.code, v.signature]))
  const profileOf = new Map(variants.map(v => [v.code, v.variantOf]))

  const families = [...new Set(variants.map(v => v.primary))]
    .map((primary) => {
      const members = variants.filter(v => v.primary === primary)
      // An alias code is always its family's primary subtag by construction,
      // so a family has an entry point exactly when one of its variants is an
      // alias target.
      const target = members.find(v => v.bareTag)
      const groups = spellingGroups(members.map(v => v.code), signatures, profileOf, target?.code ?? null)

      // Stamp each variant with the group it belongs to, so a variant row can
      // say "spells like en-GB" without re-deriving the partition.
      for (const group of groups) {
        for (const code of group.codes) {
          const member = members.find(v => v.code === code)
          member.spelling = group.representative
          member.spellingShared = group.codes.length
        }
      }

      // The variant a reader lands on for this language: what the bare tag
      // resolves to, or the first variant when there is no bare tag.
      const landing = target ?? members[0]
      const familyName = getLanguageName(primary) || primary

      return {
        primary,
        name: familyName,
        // The language's own name for itself, asked of the primary subtag —
        // "français", not "français (France)".
        native: endonym(primary, familyName),
        dir: textDirection(primary),
        entry: target ? target.bareTag : null,
        default: target?.code ?? null,
        // What to import and convert with when no region is chosen.
        landing: landing.code,
        variants: members.map(v => v.code),
        spellings: groups,
        sample: groupSample(groups, mods),
        // Currency words are a per-LANGUAGE fact (docs/currency-vocab.md), so
        // the site states them once per language instead of repeating the same
        // list on all sixteen English rows.
        currencies: mods.get(landing.code)?.currencyValues?.currency ?? [],
        // Sizes of the bundle the Import column actually names. An alias
        // bundle is not its target's: dist/en/currency.js carries the
        // missing-currency guard that dist/en-US/currency.js has no need for.
        bundle: bundleSize(`dist/${target ? target.bareTag : landing.code}.js`),
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
