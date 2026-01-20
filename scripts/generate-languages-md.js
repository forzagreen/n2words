#!/usr/bin/env node

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

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { getLanguageName, normalizeCode } from '../test/helpers/language-naming.js'

// ============================================================================
// Language Discovery
// ============================================================================

// Manual overrides for languages not in CLDR
const LANGUAGE_NAME_OVERRIDES = {
  hbo: 'Biblical Hebrew'
}

/**
 * Get all language codes from src/ directory.
 *
 * @returns {string[]} Sorted array of language codes
 */
function getLanguageCodes () {
  const files = readdirSync('./src', { withFileTypes: true })

  return files
    .filter(f => f.isFile() && f.name.endsWith('.js') && !f.name.startsWith('utils'))
    .map(f => f.name.replace('.js', ''))
    .filter(code => !code.includes('/')) // Exclude utils subfolder
    .sort((a, b) => normalizeCode(a).localeCompare(normalizeCode(b)))
}

/**
 * Get display name for a language code.
 *
 * @param {string} code Language code
 * @returns {string} Human-readable language name
 */
function getDisplayName (code) {
  if (LANGUAGE_NAME_OVERRIDES[code]) {
    return LANGUAGE_NAME_OVERRIDES[code]
  }
  return getLanguageName(code) || code
}

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if a language has ordinal support.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language exports toOrdinal
 */
function hasOrdinal (code) {
  const content = readFileSync(`./src/${code}.js`, 'utf-8')
  return content.includes('export { toCardinal, toOrdinal }') ||
         content.includes('export { toOrdinal, toCardinal }')
}

// ============================================================================
// Options Extraction
// ============================================================================

/**
 * @typedef {Object} OptionInfo
 * @property {string} name - Option name (e.g., 'gender')
 * @property {string} type - Type string (e.g., 'boolean', "'masculine'|'feminine'")
 * @property {string} [defaultValue] - Default value if specified
 * @property {string} description - Description from JSDoc
 * @property {string} form - Which form this option applies to ('cardinal' or 'ordinal')
 */

/**
 * Parse options from a language file's JSDoc for a specific function.
 *
 * @param {string} code Language code
 * @param {string} functionName Function to extract options for
 * @returns {OptionInfo[]} Array of option info objects
 */
function getOptionsForFunction (code, functionName) {
  const content = readFileSync(`./src/${code}.js`, 'utf-8')

  // Find JSDoc block immediately preceding the function declaration
  // Pattern: /** ... */ followed by function name (capture the JSDoc)
  const pattern = new RegExp(
    `(/\\*\\*[\\s\\S]*?\\*/)\\s*function\\s+${functionName}\\s*\\(`,
    'g'
  )

  const match = pattern.exec(content)
  if (!match) return []

  const jsdocBlock = match[1]

  // Match: @param {type} [options.name=default] - description
  const optionRegex = /@param\s+\{([^}]+)\}\s+\[options\.(\w+)(?:=([^\]]+))?\]\s+-\s+(.+)/g

  const options = []
  let optionMatch

  while ((optionMatch = optionRegex.exec(jsdocBlock)) !== null) {
    options.push({
      name: optionMatch[2],
      type: optionMatch[1],
      defaultValue: optionMatch[3] || undefined,
      description: optionMatch[4].trim(),
      form: functionName === 'toCardinal' ? 'cardinal' : 'ordinal'
    })
  }

  return options
}

/**
 * Parse all options from a language file's JSDoc.
 *
 * @param {string} code Language code
 * @returns {OptionInfo[]} Array of option info objects
 */
function getOptions (code) {
  const cardinalOptions = getOptionsForFunction(code, 'toCardinal')
  const ordinalOptions = getOptionsForFunction(code, 'toOrdinal')
  return [...cardinalOptions, ...ordinalOptions]
}

/**
 * Check if a language has cardinal options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has cardinal options
 */
function hasCardinalOptions (code) {
  return getOptionsForFunction(code, 'toCardinal').length > 0
}

/**
 * Check if a language has ordinal options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has ordinal options
 */
function hasOrdinalOptions (code) {
  return getOptionsForFunction(code, 'toOrdinal').length > 0
}

/**
 * Check if a language has any options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has options
 */
function hasOptions (code) {
  return getOptions(code).length > 0
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
function formatType (type) {
  // Convert ('masculine'|'feminine') to 'masculine' \| 'feminine'
  if (type.startsWith('(') && type.endsWith(')')) {
    return type.slice(1, -1).replace(/\|/g, ' \\| ')
  }
  return `\`${type}\``
}

/**
 * Collect all options with language info.
 *
 * @param {string[]} codes Language codes
 * @returns {Array<{language: string, code: string, option: OptionInfo}>}
 */
function collectAllOptions (codes) {
  const allOptions = []

  for (const code of codes) {
    const options = getOptions(code)
    for (const option of options) {
      allOptions.push({
        language: getDisplayName(code),
        code,
        option
      })
    }
  }

  // Sort by language name, then option name
  return allOptions.sort((a, b) => {
    const langCmp = a.language.localeCompare(b.language)
    if (langCmp !== 0) return langCmp
    return a.option.name.localeCompare(b.option.name)
  })
}

/**
 * Generate the LANGUAGES.md content.
 *
 * @param {string[]} codes Array of language codes
 * @returns {string} Markdown content
 */
function generateMarkdown (codes) {
  const languageCount = codes.length
  const codesWithOrdinal = codes.filter(hasOrdinal)
  const ordinalCount = codesWithOrdinal.length
  const codesWithOptions = codes.filter(hasOptions)
  const optionsCount = codesWithOptions.length
  const allOptions = collectAllOptions(codes)

  const langRows = codes.map(code => {
    const normalized = normalizeCode(code)
    const name = getDisplayName(code)
    const exportCol = code !== normalized ? `\`${normalized}\`` : ''

    // Cardinal column - all languages have cardinal, superscript if has options
    const cardinalCol = hasCardinalOptions(code) ? '✓¹' : '✓'

    // Ordinal column - only if implemented, superscript if has options
    let ordinalCol = ''
    if (hasOrdinal(code)) {
      ordinalCol = hasOrdinalOptions(code) ? '✓¹' : '✓'
    }

    return `|\`${code}\`|${exportCol}|${name}|${cardinalCol}|${ordinalCol}|`
  })

  const optionRows = allOptions.map(o => {
    const def = o.option.defaultValue ? `\`${o.option.defaultValue}\`` : ''
    const formLabel = o.option.form === 'cardinal' ? 'Cardinal' : 'Ordinal'
    return `|${o.language}|${formLabel}|\`${o.option.name}\`|${formatType(o.option.type)}|${def}|${o.option.description}|`
  })

  return `# Supported Languages

> **Auto-generated** — Do not edit manually. Run \`npm run docs:languages\` to update.

n2words supports **${languageCount} languages** with cardinal number conversion, ${ordinalCount} with ordinal support.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Cardinal|Ordinal|
|----|------|--------|:------:|:-----:|
${langRows.join('\n')}

¹ Has options — see [Language Options](#language-options) section.

## Usage

\`\`\`js
// Named imports (tree-shakable)
import { enUS, zhHans, frBE } from 'n2words'

enUS.toCardinal(42)  // 'forty-two'
enUS.toOrdinal(42)   // 'forty-second' (if supported)

// Subpath imports (smallest bundle)
import { toCardinal, toOrdinal } from 'n2words/en-US'
\`\`\`

### Import Names

- Simple codes import directly: \`en\`, \`fr\`, \`de\`
- Hyphenated codes use camelCase: \`zh-Hans\` → \`zhHans\`, \`fr-BE\` → \`frBE\`

## Language Options

${optionsCount} languages support additional options via a second parameter:

\`\`\`js
toCardinal(value, options)
toOrdinal(value, options)
\`\`\`

|Language|Form|Option|Type|Default|Description|
|--------|----|----|-------|-------|-----------|
${optionRows.join('\n')}
`
}

// ============================================================================
// Main
// ============================================================================

function main () {
  const codes = getLanguageCodes()
  const markdown = generateMarkdown(codes)

  writeFileSync('./LANGUAGES.md', markdown)
  console.log(`✓ Generated LANGUAGES.md (${codes.length} languages)`)
}

main()
