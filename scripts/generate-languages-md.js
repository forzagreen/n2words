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
  return content.includes('toOrdinal') && content.includes('export {')
}

/**
 * Check if a language has currency support.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language exports toCurrency
 */
function hasCurrency (code) {
  const content = readFileSync(`./src/${code}.js`, 'utf-8')
  return content.includes('toCurrency') && content.includes('export {')
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

  // Find function position first
  const funcPattern = new RegExp(`function\\s+${functionName}\\s*\\(`)
  const funcMatch = funcPattern.exec(content)
  if (!funcMatch) return []

  // Get content before function and find the LAST JSDoc (closest one)
  const beforeFunc = content.substring(0, funcMatch.index)
  const jsdocPattern = /\/\*\*[\s\S]*?\*\//g
  let jsdocBlock = null
  let match
  while ((match = jsdocPattern.exec(beforeFunc)) !== null) {
    jsdocBlock = match[0]
  }

  if (!jsdocBlock) return []

  // Match: @param {type} [options.name=default] - description
  const optionRegex = /@param\s+\{([^}]+)\}\s+\[options\.(\w+)(?:=([^\]]+))?\]\s+-\s+(.+)/g

  const options = []
  let optionMatch

  while ((optionMatch = optionRegex.exec(jsdocBlock)) !== null) {
    const formMap = {
      toCardinal: 'cardinal',
      toOrdinal: 'ordinal',
      toCurrency: 'currency'
    }
    options.push({
      name: optionMatch[2],
      type: optionMatch[1],
      defaultValue: optionMatch[3] || undefined,
      description: optionMatch[4].trim(),
      form: formMap[functionName] || functionName
    })
  }

  return options
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
 * Check if a language has currency options.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language has currency options
 */
function hasCurrencyOptions (code) {
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
function formatType (type) {
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
function collectOptionsByLanguage (codes) {
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
        currencyOptions
      })
    }
  }

  // Sort by language name
  return result.sort((a, b) => a.language.localeCompare(b.language))
}

/**
 * Format an option as a markdown list item.
 *
 * @param {OptionInfo} opt Option info
 * @returns {string} Markdown list item
 */
function formatOptionItem (opt) {
  const defaultStr = opt.defaultValue ? `, default: \`${opt.defaultValue}\`` : ''
  return `- \`${opt.name}\` (${formatType(opt.type)}${defaultStr}) — ${opt.description}`
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
  const codesWithCurrency = codes.filter(hasCurrency)
  const currencyCount = codesWithCurrency.length
  const optionsByLang = collectOptionsByLanguage(codes)
  const optionsCount = optionsByLang.length

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

    // Currency column - only if implemented, superscript if has options
    let currencyCol = ''
    if (hasCurrency(code)) {
      currencyCol = hasCurrencyOptions(code) ? '✓¹' : '✓'
    }

    return `|\`${code}\`|${exportCol}|${name}|${cardinalCol}|${ordinalCol}|${currencyCol}|`
  })

  // Generate per-language options sections
  const optionSections = optionsByLang.map(lang => {
    const lines = [`### ${lang.language} (\`${lang.code}\`)`]

    if (lang.cardinalOptions.length > 0) {
      lines.push('')
      lines.push('**Cardinal options:**')
      lines.push('')
      for (const opt of lang.cardinalOptions) {
        lines.push(formatOptionItem(opt))
      }
    }

    if (lang.ordinalOptions.length > 0) {
      lines.push('')
      lines.push('**Ordinal options:**')
      lines.push('')
      for (const opt of lang.ordinalOptions) {
        lines.push(formatOptionItem(opt))
      }
    }

    if (lang.currencyOptions.length > 0) {
      lines.push('')
      lines.push('**Currency options:**')
      lines.push('')
      for (const opt of lang.currencyOptions) {
        lines.push(formatOptionItem(opt))
      }
    }

    return lines.join('\n')
  })

  return `# Supported Languages

> **Auto-generated** — Do not edit manually. Run \`npm run docs:languages\` to update.

n2words supports **${languageCount} languages** with cardinal number conversion, ${ordinalCount} with ordinal support, ${currencyCount} with currency support.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Cardinal|Ordinal|Currency|
|----|------|--------|:------:|:-----:|:------:|
${langRows.join('\n')}

¹ Has options — see [Language Options](#language-options) section.

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

Import paths use BCP 47 language codes: \`n2words/en-US\`, \`n2words/zh-Hans\`, \`n2words/fr-BE\`

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

function main () {
  const codes = getLanguageCodes()
  const markdown = generateMarkdown(codes)

  writeFileSync('./LANGUAGES.md', markdown)
  console.log(`✓ Generated LANGUAGES.md (${codes.length} languages)`)
}

main()
