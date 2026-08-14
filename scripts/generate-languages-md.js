/**
 * LANGUAGES.md Generator
 *
 * Auto-generates a comprehensive language reference from source files.
 * Extracts language codes, export names, display names, and options from JSDoc.
 *
 * Usage:
 *   npm run docs:languages
 *   node scripts/generate-languages-md.js
 *
 * Output:
 *   LANGUAGES.md - Complete language reference table
 */

import { writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { API } from 'typescript/unstable/sync'
import { isFunctionDeclaration, isIdentifier } from 'typescript/unstable/ast'
import { getExportedForms } from '../test/helpers/language-helpers.js'
import { getLanguageName } from '../test/helpers/language-naming.js'

// ============================================================================
// Language Discovery
// ============================================================================

/**
 * Get all language codes from src/ directory — canonical languages and
 * bare-tag aliases alike. Callers that need just one or the other partition
 * this list themselves once each module is imported (see main()); a plain
 * directory scan can't tell an alias from a canonical file without reading
 * its `aliasOf` export.
 *
 * @returns {string[]} Sorted array of language codes
 */
function getLanguageCodes() {
  const files = readdirSync('./src', { withFileTypes: true })

  return files
    .filter(f => f.isFile() && f.name.endsWith('.js') && !f.name.startsWith('utils'))
    .map(f => f.name.replace('.js', ''))
    .filter(code => !code.includes('/')) // Exclude utils subfolder
    .sort((a, b) => a.localeCompare(b))
}

/**
 * Get display name for a language code (non-CLDR overrides live in
 * test/helpers/language-naming.js, the single source for naming).
 *
 * @param {string} code Language code
 * @returns {string} Human-readable language name
 */
function getDisplayName(code) {
  return getLanguageName(code) || code
}

// ============================================================================
// Feature Detection
// ============================================================================

// Form support (ordinal/currency) is read from each module's real exports
// via getExportedForms — see main(), which passes a `forms` map down.

// ============================================================================
// Options Extraction
// ============================================================================

/**
 * @typedef {Object} OptionInfo
 * @property {string} name - Option name (e.g., 'gender')
 * @property {string} type - JSDoc-style type ('boolean', "('masculine'|'feminine')")
 * @property {string} [defaultValue] - Default value if specified
 * @property {string} description - Description from JSDoc
 * @property {string} form - Which form this option applies to ('cardinal' etc.)
 */

const FORM_FUNCTIONS = { toCardinal: 'cardinal', toOrdinal: 'ordinal', toCurrency: 'currency' }

// code -> (functionName -> OptionInfo[]); populated by buildOptionsIndex() in
// main() before any markdown is generated.
let optionsIndex = new Map()

/**
 * Render a property's resolved type back into the JSDoc-style string the
 * markdown renderer expects: a string-literal union becomes
 * `('a'|'b')`, everything else uses its plain type name (`boolean`, `string`).
 *
 * @param {import('typescript/unstable/sync').Checker} checker
 * @param {import('typescript/unstable/sync').Type} propType
 * @returns {string}
 */
function toDocType(checker, propType) {
  // Optional props arrive as `T | undefined`; drop the undefined first.
  const type = checker.getNonNullableType(propType) ?? propType
  const parts = type.isUnionType() ? (type.getTypes() ?? []) : [type]

  if (parts.length > 0 && parts.every(t => t.isStringLiteralType())) {
    const literals = parts.map(t => `'${t.value}'`)
    return parts.length > 1 ? `(${literals.join('|')})` : literals[0]
  }

  return checker.typeToString(type)
}

/**
 * Build code -> (functionName -> OptionInfo[]) by type-checking the language
 * sources once. Option names, types, and descriptions come straight from the
 * checker (the same view TypeScript exposes to consumers), so the docs can't
 * drift from comment formatting the way the old regex scrape could.
 *
 * Uses `typescript/unstable/sync`, the native-compiler ("tsgo") API that
 * replaced the classic `ts.createProgram` surface in typescript@7 — the
 * client spawns the bundled tsgo binary as a subprocess and talks to it
 * per-request, so the `API` instance is closed once extraction is done.
 *
 * @param {string[]} codes Language codes
 * @param {Map<string, object>} mods Code -> module namespace (for `<form>Defaults` exports)
 * @returns {Map<string, Map<string, OptionInfo[]>>}
 */
function buildOptionsIndex(codes, mods) {
  const api = new API({ cwd: process.cwd() })
  try {
    // src/tsconfig.json is the project this repo already maintains for
    // checkJs coverage of src/**/*.js (see that file's own comment) — reusing
    // it means compiler options can't drift between editor/CI type-checking
    // and this doc generator.
    const configFileName = resolve('src/tsconfig.json')
    api.parseConfigFile(configFileName)
    const openFiles = codes.map(code => resolve('src', `${code}.js`))
    const snapshot = api.updateSnapshot({ openFiles })
    const project = snapshot.getProject(configFileName)
    if (!project) {
      throw new Error(`Could not load project "${configFileName}" — cannot extract options`)
    }
    const checker = project.checker
    const index = new Map()

    for (const code of codes) {
      const sourceFile = project.program.getSourceFile(resolve('src', `${code}.js`))
      if (!sourceFile) {
        throw new Error(`Could not load source for "${code}" (src/${code}.js) — cannot extract options`)
      }
      const byFunction = new Map()

      for (const node of sourceFile.statements) {
        if (!isFunctionDeclaration(node) || !node.name) continue
        const fnName = node.name.text
        if (!(fnName in FORM_FUNCTIONS)) continue

        const optionsParam = node.parameters.find(
          p => isIdentifier(p.name) && p.name.text === 'options',
        )
        if (!optionsParam) continue

        const rawType = checker.getTypeAtLocation(optionsParam)
        const type = (rawType && checker.getNonNullableType(rawType)) ?? rawType

        // Defaults come from the options contract's `<form>Defaults` export —
        // imported, the single source of truth. A form taking options without it
        // is a contract violation (the gate enforces this too), so fail loudly
        // rather than scrape JSDoc or the function body.
        const formDefaults = /** @type {Record<string, unknown> | undefined} */ (
          mods.get(code)?.[`${FORM_FUNCTIONS[fnName]}Defaults`]
        )
        if (formDefaults === undefined) {
          throw new Error(`${code} ${fnName}() accepts options but doesn't export ${FORM_FUNCTIONS[fnName]}Defaults — every options-taking form must declare its contract`)
        }
        const options = checker.getPropertiesOfType(type).map((prop) => {
          const name = prop.name
          const description = prop
            .getDocumentationComment(checker)
            .trim()
            .replace(/^-\s*/, '')
            .trim()
          return {
            name,
            type: toDocType(checker, checker.getTypeOfSymbolAtLocation(prop, optionsParam)),
            defaultValue: Object.hasOwn(formDefaults, name) ? String(formDefaults[name]) : undefined,
            description,
            form: FORM_FUNCTIONS[fnName],
          }
        })

        if (options.length > 0) byFunction.set(fnName, options)
      }

      index.set(code, byFunction)
    }

    return index
  }
  finally {
    api.close()
  }
}

/**
 * Look up the options for one form of one language from the prebuilt index.
 *
 * @param {string} code Language code
 * @param {string} functionName Function to get options for
 * @returns {OptionInfo[]} Array of option info objects
 */
function getOptionsForFunction(code, functionName) {
  return optionsIndex.get(code)?.get(functionName) ?? []
}

/**
 * Check if a language has cardinal options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has cardinal options
 */
function hasCardinalOptions(code) {
  return getOptionsForFunction(code, 'toCardinal').length > 0
}

/**
 * Check if a language has ordinal options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has ordinal options
 */
function hasOrdinalOptions(code) {
  return getOptionsForFunction(code, 'toOrdinal').length > 0
}

/**
 * Check if a language has currency options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has currency options
 */
function hasCurrencyOptions(code) {
  return getOptionsForFunction(code, 'toCurrency').length > 0
}

// ============================================================================
// Markdown Generation
// ============================================================================

/**
 * Format type for display.
 *
 * @param {string} type JSDoc type
 * @returns {string} Formatted type
 */
function formatType(type) {
  // Convert ('masculine'|'feminine') to 'masculine' \| 'feminine'
  if (type.startsWith('(') && type.endsWith(')')) {
    return type.slice(1, -1).replace(/\|/g, ' \\| ')
  }
  return `\`${type}\``
}

/**
 * Collect options grouped by language.
 *
 * @param {string[]} codes Language codes
 * @returns {Array<{language: string, code: string, cardinalOptions: OptionInfo[], ordinalOptions: OptionInfo[], currencyOptions: OptionInfo[]}>}
 */
function collectOptionsByLanguage(codes) {
  const result = []

  for (const code of codes) {
    const cardinalOptions = getOptionsForFunction(code, 'toCardinal')
    const ordinalOptions = getOptionsForFunction(code, 'toOrdinal')
    const currencyOptions = getOptionsForFunction(code, 'toCurrency')

    if (cardinalOptions.length > 0 || ordinalOptions.length > 0 || currencyOptions.length > 0) {
      result.push({
        language: getDisplayName(code),
        code,
        cardinalOptions,
        ordinalOptions,
        currencyOptions,
      })
    }
  }

  // Sort by language name
  return result.sort((a, b) => a.language.localeCompare(b.language))
}

/**
 * Generate a GitHub-compatible heading anchor from a language name and code.
 *
 * @param {string} language Display name
 * @param {string} code Language code
 * @returns {string} Anchor string (without #)
 */
function getAnchor(language, code) {
  // Match GitHub's heading anchor algorithm:
  // lowercase, keep alphanumeric/unicode/hyphens/spaces, spaces to hyphens
  return `${language} (${code})`
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

/**
 * Format options as a compact markdown table.
 *
 * @param {OptionInfo[]} options Array of option info
 * @returns {string} Markdown table
 */
function formatOptionsTable(options) {
  const lines = [
    '|Option|Form|Type|Default|Description|',
    '|------|----|----|-------|-----------|',
  ]
  for (const opt of options) {
    const defaultStr = opt.defaultValue ? `\`${opt.defaultValue}\`` : '—'
    lines.push(`|\`${opt.name}\`|${opt.form}|${formatType(opt.type)}|${defaultStr}|${opt.description}|`)
  }
  return lines.join('\n')
}

/**
 * Group canonical (non-alias) codes by BCP 47 primary language subtag, e.g.
 * en-US/en-CA/... all group under "en", zh-Hans-CN/zh-Hant-TW under "zh".
 * This is what "language" means for the headline count and the family
 * table below — a regional/script variant isn't counted as its own
 * language (see docs/bare-tag-aliases.md).
 *
 * @param {string[]} codes Canonical (non-alias) codes
 * @returns {Map<string, string[]>} Primary subtag -> sorted variant codes
 */
function groupByFamily(codes) {
  const families = new Map()
  for (const code of codes) {
    const primary = code.split('-')[0]
    if (!families.has(primary)) families.set(primary, [])
    families.get(primary).push(code)
  }
  for (const variants of families.values()) variants.sort((a, b) => a.localeCompare(b))
  return families
}

/**
 * Format the family-level summary table — one row per language family, the
 * primary place a reader sees "how many languages" n2words supports. A
 * family's `Entry point` is its bare-tag alias when one exists (see
 * docs/bare-tag-aliases.md for why some families don't get one — script or
 * core numbering grammar genuinely diverges between their variants);
 * `Variants` links each actual regional/script code to its detail section
 * further down. An alias code (e.g. `en`) is always the same string as its
 * family's primary subtag by construction, so `aliases.get(primary)` finds
 * a family's alias directly with no extra lookup table.
 *
 * @param {Map<string, string[]>} families Primary subtag -> variant codes
 * @param {Map<string, string>} aliases Alias code -> target code
 * @param {Map<string, string>} optionAnchors Code -> anchor (only entries with options)
 * @param {(code: string) => string} displayName Code -> human-readable name
 * @returns {string} Markdown table
 */
function formatFamilyTable(families, aliases, optionAnchors, displayName) {
  const lines = [
    '|Entry point|Language|Variants|',
    '|-----------|--------|--------|',
  ]
  // `label` is the visible code text; `anchorCode` is whose anchor it links
  // to — for the entry-point cell these differ (the bare alias's own code
  // has no detail section of its own; it links to its target's).
  const ref = (label, anchorCode = label) => {
    const anchor = optionAnchors.get(anchorCode)
    return anchor ? `[\`${label}\`](#${anchor})` : `\`${label}\``
  }
  const sortedPrimaries = [...families.keys()].sort((a, b) => displayName(a).localeCompare(displayName(b)))
  for (const primary of sortedPrimaries) {
    const variants = families.get(primary)
    const entryTarget = aliases.get(primary)
    const entryCell = entryTarget ? ref(primary, entryTarget) : '—'
    // `(default)` only means something when there's more than one variant to
    // be the default *among* — marking the sole variant of a single-variant
    // family would contradict the note printed under the table.
    const markDefault = variants.length > 1
    const variantCells = variants.map(v => markDefault && v === entryTarget ? `${ref(v)} (default)` : ref(v))
    lines.push(`|${entryCell}|${displayName(primary)}|${variantCells.join(', ')}|`)
  }
  return lines.join('\n')
}

/**
 * Generate the LANGUAGES.md content.
 *
 * @param {string[]} codes Array of canonical (non-alias) language codes
 * @param {Map<string, Set<string>>} forms Code -> set of exported forms
 * @param {Map<string, Record<string, bigint|null|undefined>>} mods Code -> module namespace (for the *Max range exports)
 * @param {Map<string, string>} aliases Alias code -> target code
 * @returns {string} Markdown content
 */
function generateMarkdown(codes, forms, mods, aliases) {
  const hasOrdinal = code => forms.get(code).has('ordinal')
  const hasCurrency = code => forms.get(code).has('currency')

  // "Language" means BCP 47 primary subtag, not regional/script variant —
  // en-US/en-CA/... are one language (English) with 16 variants, not 16
  // languages. See docs/bare-tag-aliases.md.
  const families = groupByFamily(codes)
  const familyCount = families.size
  const variantCount = codes.length
  const bareTagFamilyCount = aliases.size
  const noEntryPointFamilyCount = familyCount - bareTagFamilyCount

  const codesWithOrdinal = codes.filter(hasOrdinal)
  const ordinalCount = codesWithOrdinal.length
  const codesWithCurrency = codes.filter(hasCurrency)
  const currencyCount = codesWithCurrency.length
  const optionsByLang = collectOptionsByLanguage(codes)
  const optionsCount = optionsByLang.length

  // Build a set of codes that have options for quick anchor lookup
  const optionAnchors = new Map()
  for (const lang of optionsByLang) {
    optionAnchors.set(lang.code, getAnchor(lang.language, lang.code))
  }

  const langRows = codes.map((code) => {
    const name = getDisplayName(code)
    const anchor = optionAnchors.get(code)
    const mod = mods.get(code)

    // Each form column shows that form's ceiling — the largest value it converts,
    // or `∞` when unbounded. A trailing * links to the language's options. Mirrors
    // checkMax: `10^N - 1` only when the ceiling is an exact power of ten, else the
    // raw `max - 1`. A missing *Max for an exported form is a contract violation,
    // so fail loudly rather than paper over it with a check mark.
    const cell = (max, hasOpts, form) => {
      let range
      if (max === null) {
        range = '∞'
      }
      else if (typeof max === 'bigint') {
        const exponent = max.toString().length - 1
        range = max === 10n ** BigInt(exponent) ? `10^${exponent} - 1` : `${max - 1n}`
      }
      else {
        throw new Error(`${code} exports ${form} but not ${form}Max — every form must declare its ceiling`)
      }
      return hasOpts ? `${range} [*](#${anchor})` : range
    }

    const cardinalCol = cell(mod.cardinalMax, hasCardinalOptions(code), 'cardinal')
    const ordinalCol = hasOrdinal(code) ? cell(mod.ordinalMax, hasOrdinalOptions(code), 'ordinal') : ''
    const currencyCol = hasCurrency(code) ? cell(mod.currencyMax, hasCurrencyOptions(code), 'currency') : ''

    return `|\`${code}\`|${name}|${cardinalCol}|${ordinalCol}|${currencyCol}|`
  })

  // Generate per-language options sections with compact tables
  const optionSections = optionsByLang.map((lang) => {
    const allOptions = [
      ...lang.cardinalOptions,
      ...lang.ordinalOptions,
      ...lang.currencyOptions,
    ]

    return `### ${lang.language} (\`${lang.code}\`)\n\n${formatOptionsTable(allOptions)}`
  })

  return `# Supported Languages

> **Auto-generated** — Do not edit manually. Run \`npm run docs:languages\` to update.

n2words supports **${familyCount} languages** (${variantCount} regional/script variants total) with
cardinal number conversion, ${ordinalCount} variants with ordinal support, ${currencyCount} variants
with currency support.

${bareTagFamilyCount} languages have a **bare-tag entry point** that resolves without a region
subtag (e.g. \`n2words/de\`) — this is the primary, recommended way to import
them. The other ${noEntryPointFamilyCount} require picking a specific variant explicitly, because
their variants genuinely diverge in script or core numbering grammar, not
just vocabulary — see [docs/bare-tag-aliases.md](docs/bare-tag-aliases.md).

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## Languages

${formatFamilyTable(families, aliases, optionAnchors, getDisplayName)}

\`Entry point\` is \`—\` for the ${noEntryPointFamilyCount} languages with no safe default variant.
Where a family has more than one variant, \`(default)\` marks the one its
entry point resolves to.

## Usage

\`\`\`js
// Most languages: import via their bare-tag entry point
import { toCardinal } from 'n2words/de'
import { toCardinal, toOrdinal, toCurrency } from 'n2words/de'

toCardinal(42)     // 'zweiundvierzig'
toOrdinal(42)      // 'zweiundvierzigste' (if supported)
toCurrency(42.50)  // 'zweiundvierzig Euro und fünfzig Cent' (if supported)

// Need a specific regional/script variant, or one of the 4 languages with
// no single default? Import the full BCP 47 code instead
import { toCardinal } from 'n2words/en-GB'
\`\`\`

### Import Paths

Bare-tag entry points (\`n2words/de\`, \`n2words/en\`, ...) resolve without a region
subtag for every language with a linked \`Entry point\` above. Full BCP 47 codes
always work too (\`n2words/en-GB\`, \`n2words/fr-BE\`, ...), and are required for
the ${noEntryPointFamilyCount} languages with no entry point (\`—\` above) — e.g. \`n2words/pt-BR\`,
\`n2words/zh-Hans-CN\`.

## All Regional Variants

Per-variant detail — the largest value each form converts, and per-variant
options where declared. Grouped by language above; this is the flat
reference.

|Code|Language|Cardinal|Ordinal|Currency|
|----|--------|:------:|:-----:|:------:|
${langRows.join('\n')}

Each form column shows the largest value it converts (\`10^N - 1\`), \`∞\` when unbounded, or blank when the form isn't supported.

\\* Has options — click to jump to that language's options.

## Language Options

${optionsCount} variants support options via a second parameter. Options are passed as an object:

\`\`\`js
toCardinal(value, { optionName: value })
toCurrency(value, { optionName: value })
\`\`\`

${optionSections.join('\n\n')}
`
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const allCodes = getLanguageCodes()
  const allMods = new Map(
    await Promise.all(allCodes.map(async code => [code, await import(`../src/${code}.js`)])),
  )

  // Bare-tag alias files (aliasOf exported) are re-exports, not their own
  // language: excluded from the variant table/count/options so they can't
  // inflate "n2words supports N languages", and surfaced instead via the
  // family table's Entry point column (see formatFamilyTable).
  const codes = allCodes.filter(code => allMods.get(code).aliasOf === undefined)
  const aliases = new Map(
    allCodes
      .filter(code => allMods.get(code).aliasOf !== undefined)
      .map(code => [code, allMods.get(code).aliasOf]),
  )
  const mods = new Map(codes.map(code => [code, allMods.get(code)]))

  const forms = new Map(
    await Promise.all(codes.map(async code => [code, await getExportedForms(code)])),
  )
  optionsIndex = buildOptionsIndex(codes, mods)
  const markdown = generateMarkdown(codes, forms, mods, aliases)

  writeFileSync('./LANGUAGES.md', markdown)
  const familyCount = new Set(codes.map(code => code.split('-')[0])).size
  console.log(`✓ Generated LANGUAGES.md (${familyCount} languages, ${codes.length} variants, ${aliases.size} bare-tag entry points)`)
}

main()
