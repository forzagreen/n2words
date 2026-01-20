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
// Options Extraction
// ============================================================================

/**
 * @typedef {Object} OptionInfo
 * @property {string} name - Option name (e.g., 'gender')
 * @property {string} type - Type string (e.g., 'boolean', "'masculine'|'feminine'")
 * @property {string} [defaultValue] - Default value if specified
 * @property {string} description - Description from JSDoc
 */

/**
 * Parse options from a language file's JSDoc.
 *
 * @param {string} code Language code
 * @returns {OptionInfo[]} Array of option info objects
 */
function getOptions (code) {
  const content = readFileSync(`./src/${code}.js`, 'utf-8')

  // Match: @param {type} [options.name=default] - description
  // or:    @param {type} [options.name] - description
  const optionRegex = /@param\s+\{([^}]+)\}\s+\[options\.(\w+)(?:=([^\]]+))?\]\s+-\s+(.+)/g

  const options = []
  let match

  while ((match = optionRegex.exec(content)) !== null) {
    options.push({
      name: match[2],
      type: match[1],
      defaultValue: match[3] || undefined,
      description: match[4].trim()
    })
  }

  return options
}

/**
 * Check if a language has options.
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
  const codesWithOptions = codes.filter(hasOptions)
  const optionsCount = codesWithOptions.length
  const allOptions = collectAllOptions(codes)

  const langRows = codes.map(code => {
    const normalized = normalizeCode(code)
    const name = getDisplayName(code)
    const options = hasOptions(code) ? '✓' : ''
    const exportCol = code !== normalized ? `\`${normalized}\`` : ''

    return `|\`${code}\`|${exportCol}|${name}|${options}|`
  })

  const optionRows = allOptions.map(o => {
    const def = o.option.defaultValue ? `\`${o.option.defaultValue}\`` : ''
    return `|${o.language}|\`${o.option.name}\`|${formatType(o.option.type)}|${def}|${o.option.description}|`
  })

  return `# Supported Languages

> **Auto-generated** — Do not edit manually. Run \`npm run docs:languages\` to update.

n2words supports **${languageCount} languages**, ${optionsCount} of which have additional options.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Options|
|----|------|--------|:-----:|
${langRows.join('\n')}

## Usage

\`\`\`js
// Named imports (tree-shakable)
import { en, zhHans, frBE } from 'n2words'

// Subpath imports (smallest bundle)
import { toCardinal } from 'n2words/en'
import { toCardinal as zhHans } from 'n2words/zh-Hans'
\`\`\`

### Import Names

- Simple codes import directly: \`en\`, \`fr\`, \`de\`
- Hyphenated codes use camelCase: \`zh-Hans\` → \`zhHans\`, \`fr-BE\` → \`frBE\`

## Language Options

${optionsCount} languages support additional options via a second parameter:

\`\`\`js
toCardinal(value, options)
\`\`\`

|Language|Option|Type|Default|Description|
|--------|------|----|-------|-----------|
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
