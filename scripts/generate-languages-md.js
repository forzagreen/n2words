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
import ts from 'typescript'
import { getExportedForms } from '../test/helpers/language-helpers.js'
import { getLanguageName } from '../test/helpers/language-naming.js'

// ============================================================================
// Language Discovery
// ============================================================================

/**
 * Get all language codes from src/ directory.
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
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Type} propType
 * @returns {string}
 */
function toDocType(checker, propType) {
  // Optional props arrive as `T | undefined`; drop the undefined first.
  const type = propType.getNonNullableType()
  const parts = type.isUnion() ? type.types : [type]

  if (parts.length > 0 && parts.every(t => t.isStringLiteral())) {
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
 * @param {string[]} codes Language codes
 * @param {Map<string, object>} mods Code -> module namespace (for `<form>Defaults` exports)
 * @returns {Map<string, Map<string, OptionInfo[]>>}
 */
function buildOptionsIndex(codes, mods) {
  const program = ts.createProgram(
    codes.map(code => `./src/${code}.js`),
    {
      allowJs: true,
      checkJs: false,
      noEmit: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
  )
  const checker = program.getTypeChecker()
  const index = new Map()

  for (const code of codes) {
    const sourceFile = program.getSourceFile(`./src/${code}.js`)
    if (!sourceFile) {
      throw new Error(`Could not load source for "${code}" (./src/${code}.js) — cannot extract options`)
    }
    const byFunction = new Map()

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isFunctionDeclaration(node) || !node.name) return
      const fnName = node.name.text
      if (!(fnName in FORM_FUNCTIONS)) return

      const optionsParam = node.parameters.find(
        p => ts.isIdentifier(p.name) && p.name.text === 'options',
      )
      if (!optionsParam) return

      let type = checker.getTypeAtLocation(optionsParam)
      if (type.isUnion()) {
        type = type.types.find(t => !(t.flags & ts.TypeFlags.Undefined)) ?? type
      }

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
      const options = (type.getProperties?.() ?? []).map((prop) => {
        const name = prop.getName()
        const description = ts
          .displayPartsToString(prop.getDocumentationComment(checker))
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
    })

    index.set(code, byFunction)
  }

  return index
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
 * Generate the LANGUAGES.md content.
 *
 * @param {string[]} codes Array of language codes
 * @param {Map<string, Set<string>>} forms Code -> set of exported forms
 * @param {Map<string, Record<string, bigint|null|undefined>>} mods Code -> module namespace (for the *Max range exports)
 * @returns {string} Markdown content
 */
function generateMarkdown(codes, forms, mods) {
  const hasOrdinal = code => forms.get(code).has('ordinal')
  const hasCurrency = code => forms.get(code).has('currency')

  const languageCount = codes.length
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

n2words supports **${languageCount} languages** with cardinal number conversion, ${ordinalCount} with ordinal support, ${currencyCount} with currency support.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Language|Cardinal|Ordinal|Currency|
|----|--------|:------:|:-----:|:------:|
${langRows.join('\n')}

Each form column shows the largest value it converts (\`10^N - 1\`), \`∞\` when unbounded, or blank when the form isn't supported.

\\* Has options — click to jump to that language's options.

## Usage

\`\`\`js
// Import language modules directly
import { toCardinal } from 'n2words/en-US'
import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'

toCardinal(42)     // 'forty-two'
toOrdinal(42)      // 'forty-second' (if supported)
toCurrency(42.50)  // 'forty-two dollars and fifty cents' (if supported)
\`\`\`

### Import Paths

Import paths use BCP 47 language codes: \`n2words/en-US\`, \`n2words/zh-Hans-CN\`, \`n2words/fr-BE\`

## Language Options

${optionsCount} languages support options via a second parameter. Options are passed as an object:

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
  const codes = getLanguageCodes()
  const forms = new Map(
    await Promise.all(codes.map(async code => [code, await getExportedForms(code)])),
  )
  const mods = new Map(
    await Promise.all(codes.map(async code => [code, await import(`../src/${code}.js`)])),
  )
  optionsIndex = buildOptionsIndex(codes, mods)
  const markdown = generateMarkdown(codes, forms, mods)

  writeFileSync('./LANGUAGES.md', markdown)
  console.log(`✓ Generated LANGUAGES.md (${codes.length} languages)`)
}

main()
