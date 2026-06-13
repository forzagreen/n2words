/**
 * Language Scaffolding Tool
 *
 * Generates boilerplate code for adding a new language to n2words.
 * Supports scaffolding multiple conversion forms (cardinal, ordinal, currency).
 *
 * Usage:
 *   npm run lang:add -- [language-code] [options]
 *
 * The `--` separates npm's own args from the script's. It is required
 * whenever you pass a flag (--cardinal etc.); without it npm swallows
 * the flag and warns. Use it in every invocation for consistency.
 *
 * Options:
 *   --cardinal    Scaffold cardinal number support
 *   --ordinal     Scaffold ordinal number support
 *   --currency    Scaffold currency support
 *
 * If no code provided, prompts interactively.
 * If no form options provided, prompts for form selection.
 *
 * Examples:
 *   npm run lang:add                                 # Fully interactive
 *   npm run lang:add -- ko-KR                        # Prompts for forms
 *   npm run lang:add -- ko-KR --cardinal             # Cardinal only
 *   npm run lang:add -- ko-KR --ordinal              # Ordinal only
 *   npm run lang:add -- ko-KR --currency             # Currency only
 *   npm run lang:add -- ko-KR --cardinal --ordinal   # Multiple forms
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as readline from 'node:readline/promises'
import chalk from 'chalk'
import { getExportedForms } from '../test/helpers/language-helpers.js'
import { getCanonicalCode, getLanguageName, isValidLanguageCode, normalizeCode } from '../test/helpers/language-naming.js'

// ============================================================================
// CLI Argument Parsing
// ============================================================================

/**
 * Parse CLI arguments.
 *
 * @param {string[]} args Command line arguments
 * @returns {{code: string|null, forms: Set<string>, help: boolean}}
 */
function parseArgs(args) {
  const result = {
    code: null,
    forms: new Set(),
    help: false,
  }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      result.help = true
    }
    else if (arg === '--cardinal') {
      result.forms.add('cardinal')
    }
    else if (arg === '--ordinal') {
      result.forms.add('ordinal')
    }
    else if (arg === '--currency') {
      result.forms.add('currency')
    }
    else if (!arg.startsWith('-')) {
      result.code = arg
    }
  }

  return result
}

// ============================================================================
// Interactive Prompts
// ============================================================================

/**
 * Prompt user for language code.
 *
 * @returns {Promise<string|null>} Language code from user, or null if cancelled
 */
async function promptForLanguageCode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    console.log(chalk.cyan('\nEnter a BCP 47 language code'))
    console.log(chalk.gray('Examples: ko-KR, zh-Hans-CN, pt-BR, sr-Latn-RS\n'))

    const code = await rl.question(chalk.cyan('Language code: '))
    const trimmed = code.trim()

    if (!trimmed) {
      console.log(chalk.red('\nNo code provided. Aborting.'))
      return null
    }

    return trimmed
  }
  finally {
    rl.close()
  }
}

/**
 * Prompt user for language name when code is not in CLDR.
 *
 * @param {string} code Language code
 * @returns {Promise<string|null>} Language name from user, or null if cancelled
 */
async function promptForLanguageName(code) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    console.log(chalk.yellow(`\nNote: "${code}" is not in CLDR (language name unknown)`))
    console.log(chalk.gray('Valid BCP 47 codes may not be in Unicode CLDR (e.g., hbo = Biblical Hebrew)'))

    const name = await rl.question(chalk.cyan('\nEnter the language name: '))
    if (!name.trim()) {
      console.log(chalk.red('\nNo name provided. Aborting.'))
      return null
    }

    return name.trim()
  }
  finally {
    rl.close()
  }
}

/**
 * Prompt user to select which forms to scaffold.
 *
 * @param {Set<string>} existingForms Forms already implemented
 * @returns {Promise<Set<string>>} Selected forms
 */
async function promptForForms(existingForms) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const availableForms = ['cardinal', 'ordinal', 'currency'].filter(f => !existingForms.has(f))

  if (availableForms.length === 0) {
    console.log(chalk.yellow('\nAll forms are already implemented for this language.'))
    return new Set()
  }

  try {
    console.log(chalk.cyan('\nWhich forms do you want to scaffold?'))
    console.log(chalk.gray('Enter comma-separated numbers (e.g., 1,2) or press Enter for all\n'))

    availableForms.forEach((form, i) => {
      console.log(chalk.white(`  ${i + 1}. ${form} (to${form.charAt(0).toUpperCase() + form.slice(1)})`))
    })

    const answer = await rl.question(chalk.cyan('\nSelection: '))

    if (!answer.trim()) {
      // Default: all available forms
      return new Set(availableForms)
    }

    const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1)
    const selectedForms = new Set()

    for (const idx of indices) {
      if (idx >= 0 && idx < availableForms.length) {
        selectedForms.add(availableForms[idx])
      }
    }

    if (selectedForms.size === 0) {
      console.log(chalk.red('\nNo valid selection. Aborting.'))
      return new Set()
    }

    return selectedForms
  }
  finally {
    rl.close()
  }
}

// ============================================================================
// Template Generators
// ============================================================================

/**
 * Generate cardinal function template.
 *
 * @param {string} code Language code
 * @returns {string} Function template
 */
function generateCardinalFunction(code) {
  return `/**
 * Converts a numeric value to cardinal words.
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in words
 */
function toCardinal(value) {
  const { integerPart, decimalPart } = parseCardinalValue(value)
  checkMax(integerPart, cardinalMax, decimalPart) // drop decimalPart if decimals are spelled digit-by-digit

  // parseCardinalValue also returns isNegative — apply it when you build the words.
  // TODO: build the words from integerPart (bigint), the sign, and decimalPart
  throw new Error('${code} cardinal not yet implemented')
}`
}

/**
 * Generate ordinal function template.
 *
 * @param {string} code Language code
 * @returns {string} Function template
 */
function generateOrdinalFunction(code) {
  return `/**
 * Converts a positive integer to ordinal words.
 * @param {number | string | bigint} value - Positive integer to convert
 * @returns {string} The ordinal in words
 * @throws {RangeError} If value is not a positive integer
 */
function toOrdinal(value) {
  const integerPart = parseOrdinalValue(value)
  checkMax(integerPart, ordinalMax)

  // TODO: build and return the ordinal words for integerPart (positive integers only)
  throw new Error('${code} ordinal not yet implemented')
}`
}

/**
 * Generate currency function template.
 *
 * @param {string} code Language code
 * @returns {string} Function template
 */
function generateCurrencyFunction(code) {
  return `/**
 * Converts a numeric value to currency words.
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in currency words
 */
function toCurrency(value) {
  const { dollars } = parseCurrencyValue(value)
  checkMax(dollars, currencyMax)

  // parseCurrencyValue also returns isNegative and cents — use them when you build the words.
  // TODO: build the words from dollars (bigint) and cents, applying the sign
  // TODO: define this locale's currency vocabulary (major/minor unit names)
  // TODO: if this form takes options (e.g. an "and" joiner), declare the options
  //       contract — typedef + <form>Defaults export + resolveOptions — per
  //       CLAUDE.md's Options Pattern; the gate fails an undeclared options param.
  throw new Error('${code} currency not yet implemented')
}`
}

const FORM_ORDER = ['cardinal', 'ordinal', 'currency']

/**
 * Placeholder `*Max` declaration for a form — the smallest value it refuses.
 * Scaffolds to `UNBOUNDED` (no ceiling) so the form runs until the author derives
 * a real one from the scale table.
 *
 * @param {string} form Form name ('cardinal' | 'ordinal' | 'currency')
 * @returns {string} `export const <form>Max = UNBOUNDED`
 */
function generateMaxExport(form) {
  return `export const ${form}Max = UNBOUNDED`
}

const MAX_TODO_COMMENT = `// TODO: set each form's ceiling — the smallest value it refuses. Use a scale.js
// helper (western / myriad / indian / longScale / bounded) derived from your scale
// table, or keep UNBOUNDED for a recursive/compounding speller. The range gate
// (test/range-contract.test.js) verifies whatever you declare — see docs/range-contract.md.`

/**
 * The grouped `*Max` declaration block, with a TODO pointing at the scale.js
 * helpers. The comment is skipped when the target file already carries it
 * (adding a second form shouldn't duplicate the guidance).
 *
 * @param {Set<string>} forms Forms to include
 * @param {boolean} [withComment] Include the TODO comment (default true)
 * @returns {string} Comment + one export per scaffolded form
 */
function generateMaxExportsBlock(forms, withComment = true) {
  const exports = FORM_ORDER.filter(f => forms.has(f)).map(generateMaxExport)
  return withComment ? `${MAX_TODO_COMMENT}\n${exports.join('\n')}` : exports.join('\n')
}

/**
 * Generate language implementation file.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} forms Forms to include
 * @returns {string} File content
 */
function generateLanguageFile(code, name, forms) {
  const hasCardinal = forms.has('cardinal')
  const hasOrdinal = forms.has('ordinal')
  const hasCurrency = forms.has('currency')

  const importLines = []
  importLines.push('import { checkMax } from \'./utils/check-max.js\'')
  if (hasCardinal) {
    importLines.push('import { parseCardinalValue } from \'./utils/parse-cardinal.js\'')
  }
  if (hasCurrency) {
    importLines.push('import { parseCurrencyValue } from \'./utils/parse-currency.js\'')
  }
  if (hasOrdinal) {
    importLines.push('import { parseOrdinalValue } from \'./utils/parse-ordinal.js\'')
  }
  importLines.push('import { UNBOUNDED } from \'./utils/scale.js\'')
  const imports = importLines.join('\n')

  const header = `// TODO: Implement number-to-words conversion for ${name} (${code})
//
// Reference implementations by pattern:
//   Western scale: src/en-US.js, de-DE.js, fr-FR.js
//   South Asian:   src/hi-IN.js, bn-BD.js
//   East Asian:    src/ja-JP.js, ko-KR.js, zh-Hans-CN.js
//   Slavic:        src/ru-RU.js, pl-PL.js, uk-UA.js`

  const functions = []
  if (hasCardinal) functions.push(generateCardinalFunction(code))
  if (hasOrdinal) functions.push(generateOrdinalFunction(code))
  if (hasCurrency) functions.push(generateCurrencyFunction(code))

  const exports = []
  if (hasCardinal) exports.push('toCardinal')
  if (hasOrdinal) exports.push('toOrdinal')
  if (hasCurrency) exports.push('toCurrency')

  return `${imports}

${header}

${generateMaxExportsBlock(forms)}

${functions.join('\n\n')}

export { ${exports.join(', ')} }
`
}

/**
 * Generate test fixture file content.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} forms Forms to include
 * @returns {string} File content
 */
function generateTestFixture(code, name, forms) {
  const exports = []

  if (forms.has('cardinal')) {
    exports.push(`/**
 * Cardinal number test cases for ${name} (${code})
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // TODO: Add test cases
  // [0, 'zero'],
  // [1, 'one'],
  // [42, 'forty-two'],
]`)
  }

  if (forms.has('ordinal')) {
    exports.push(`/**
 * Ordinal number test cases for ${name} (${code})
 * Format: [input, expected_output]
 */
export const ordinal = [
  // TODO: Add test cases
  // [1, 'first'],
  // [2, 'second'],
  // [42, 'forty-second'],
]`)
  }

  if (forms.has('currency')) {
    exports.push(`/**
 * Currency test cases for ${name} (${code})
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // TODO: Add test cases
  // [0, 'zero dollars'],
  // [1, 'one dollar'],
  // [42.50, 'forty-two dollars and fifty cents'],
]`)
  }

  return exports.join('\n\n') + '\n'
}

// ============================================================================
// File Update Functions
// ============================================================================

/**
 * Add new forms to an existing language file.
 *
 * @param {string} code Language code
 * @param {Set<string>} newForms Forms to add
 */
function addFormsToExistingFile(code, newForms) {
  const filePath = `./src/${code}.js`
  let content = readFileSync(filePath, 'utf-8')

  // Add new functions before the export statement
  const exportMatch = content.match(/export \{[^}]+\}/)
  if (!exportMatch) {
    throw new Error(`Could not find export statement in ${filePath}`)
  }

  // Add missing imports
  const newImports = []
  if (newForms.has('cardinal') && !content.includes('parse-cardinal.js')) {
    newImports.push('import { parseCardinalValue } from \'./utils/parse-cardinal.js\'')
  }
  if (newForms.has('ordinal') && !content.includes('parse-ordinal.js')) {
    newImports.push('import { parseOrdinalValue } from \'./utils/parse-ordinal.js\'')
  }
  if (newForms.has('currency') && !content.includes('parse-currency.js')) {
    newImports.push('import { parseCurrencyValue } from \'./utils/parse-currency.js\'')
  }
  // Every scaffolded guard needs checkMax; every placeholder ceiling needs
  // UNBOUNDED. checkMax is its own module; UNBOUNDED shares scale.js, so fold it
  // into an existing scale.js import when there is one instead of duplicating it.
  if (!content.includes('check-max.js')) {
    newImports.push('import { checkMax } from \'./utils/check-max.js\'')
  }
  if (!/\bUNBOUNDED\b/.test(content)) {
    if (/from '\.\/utils\/scale\.js'/.test(content)) {
      content = content.replace(
        /import \{ ([^}]+) \} from '\.\/utils\/scale\.js'/,
        (_m, names) => `import { ${names}, UNBOUNDED } from './utils/scale.js'`,
      )
    }
    else {
      newImports.push('import { UNBOUNDED } from \'./utils/scale.js\'')
    }
  }

  if (newImports.length > 0) {
    // Insert after the last existing import
    const lastImportIdx = content.lastIndexOf('\nimport ')
    if (lastImportIdx !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIdx + 1)
      content = content.slice(0, endOfLine) + '\n' + newImports.join('\n') + content.slice(endOfLine)
    }
    else {
      // No existing imports — add at top
      content = newImports.join('\n') + '\n\n' + content
    }
  }

  const newFunctions = []
  const newExports = []

  if (newForms.has('cardinal')) {
    newFunctions.push(generateCardinalFunction(code))
    newExports.push('toCardinal')
  }

  if (newForms.has('ordinal')) {
    newFunctions.push(generateOrdinalFunction(code))
    newExports.push('toOrdinal')
  }

  if (newForms.has('currency')) {
    newFunctions.push(generateCurrencyFunction(code))
    newExports.push('toCurrency')
  }

  // Insert the new forms' *Max declarations + functions before the export
  // statement (re-find since content may have shifted).
  const updatedExportMatch = content.match(/export \{[^}]+\}/)
  const insertPos = content.indexOf(updatedExportMatch[0])
  const needsTodoComment = !content.includes('TODO: set each form')
  const insertion = `${generateMaxExportsBlock(newForms, needsTodoComment)}\n\n${newFunctions.join('\n\n')}\n\n`
  content = content.slice(0, insertPos) + insertion + content.slice(insertPos)

  // Update export statement
  const currentExports = updatedExportMatch[0].match(/\{ ([^}]+) \}/)?.[1].split(',').map(s => s.trim()) || []
  const allExports = [...currentExports, ...newExports]
  const newExportStatement = `export { ${allExports.join(', ')} }`
  content = content.replace(/export \{[^}]+\}/, newExportStatement)

  writeFileSync(filePath, content)
}

/**
 * Add new forms to an existing fixture file.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} newForms Forms to add
 */
function addFormsToExistingFixture(code, name, newForms) {
  const filePath = `./test/fixtures/${code}.js`
  let content = readFileSync(filePath, 'utf-8')

  const newExports = []

  if (newForms.has('cardinal')) {
    newExports.push(`
/**
 * Cardinal number test cases for ${name} (${code})
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // TODO: Add test cases
  // [0, 'zero'],
  // [1, 'one'],
  // [42, 'forty-two'],
]`)
  }

  if (newForms.has('ordinal')) {
    newExports.push(`
/**
 * Ordinal number test cases for ${name} (${code})
 * Format: [input, expected_output]
 */
export const ordinal = [
  // TODO: Add test cases
  // [1, 'first'],
  // [2, 'second'],
  // [42, 'forty-second'],
]`)
  }

  if (newForms.has('currency')) {
    newExports.push(`
/**
 * Currency test cases for ${name} (${code})
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // TODO: Add test cases
  // [0, 'zero dollars'],
  // [1, 'one dollar'],
  // [42.50, 'forty-two dollars and fifty cents'],
]`)
  }

  content = content.trimEnd() + '\n' + newExports.join('\n') + '\n'
  writeFileSync(filePath, content)
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const { code: cliCode, forms: cliFlags, help } = parseArgs(process.argv.slice(2))

  if (help) {
    console.log(chalk.cyan('Usage: npm run lang:add -- [language-code] [options]'))
    console.log()
    console.log(chalk.gray('The `--` separates npm args from the script. Required when passing'))
    console.log(chalk.gray('a flag; use it always for consistency.'))
    console.log()
    console.log(chalk.gray('Options:'))
    console.log(chalk.gray('  --cardinal    Scaffold cardinal number support'))
    console.log(chalk.gray('  --ordinal     Scaffold ordinal number support'))
    console.log(chalk.gray('  --currency    Scaffold currency support'))
    console.log()
    console.log(chalk.gray('If no code provided, prompts interactively.'))
    console.log(chalk.gray('If no form options provided, prompts for form selection.'))
    console.log()
    console.log(chalk.gray('Examples:'))
    console.log(chalk.gray('  npm run lang:add                                 # Fully interactive'))
    console.log(chalk.gray('  npm run lang:add -- ko-KR                        # Prompts for forms'))
    console.log(chalk.gray('  npm run lang:add -- ko-KR --cardinal             # Cardinal only'))
    console.log(chalk.gray('  npm run lang:add -- ko-KR --ordinal              # Ordinal only'))
    console.log(chalk.gray('  npm run lang:add -- ko-KR --currency             # Currency only'))
    console.log(chalk.gray('  npm run lang:add -- ko-KR --cardinal --ordinal   # Multiple forms'))
    return
  }

  // Get language code (from CLI or prompt)
  let code = cliCode
  if (!code) {
    code = await promptForLanguageCode()
    if (!code) {
      process.exitCode = 1
      return
    }
  }

  // Validate BCP 47 language code
  if (!isValidLanguageCode(code)) {
    console.error(chalk.red(`Error: Invalid BCP 47 language tag: ${code}`))
    console.log(chalk.gray('\nExamples: en-US, fr-FR, zh-Hans-CN, sr-Latn-RS, fr-BE'))
    process.exitCode = 1
    return
  }

  // Canonicalize the code (e.g. cy-gb -> cy-GB) so the filename, export
  // name, and import path all follow the project's BCP 47 convention.
  // Everything downstream uses `code`, so reassign it here.
  const canonical = getCanonicalCode(code)
  if (canonical && canonical !== code) {
    console.log(chalk.yellow(`Note: canonicalized "${code}" -> "${canonical}"`))
    code = canonical
  }

  const normalized = normalizeCode(code)
  const langFilePath = `./src/${code}.js`
  const fixtureFilePath = `./test/fixtures/${code}.js`

  // Check existing implementation (read from real exports, not source text).
  // "New language" means the FILE doesn't exist — never "the import returned no
  // forms": a work-in-progress file with a syntax error imports as zero forms,
  // and treating that as new would silently overwrite the contributor's work.
  const existingForms = await getExportedForms(code)
  const isNewLanguage = !existsSync(langFilePath)
  if (!isNewLanguage && existingForms.size === 0) {
    console.error(chalk.red(`${langFilePath} exists but exports no working forms — likely a syntax error or unfinished file.`))
    console.error(chalk.gray('Refusing to overwrite it. Fix (or delete) the file, then re-run.'))
    process.exitCode = 1
    return
  }
  if (isNewLanguage && existsSync(fixtureFilePath)) {
    console.error(chalk.red(`${fixtureFilePath} exists but ${langFilePath} doesn't.`))
    console.error(chalk.gray('Refusing to overwrite the fixture. Move it aside (or delete it), then re-run.'))
    process.exitCode = 1
    return
  }

  // Determine which forms to scaffold
  let formsToScaffold
  if (cliFlags.size > 0) {
    // CLI flags provided - use them directly
    formsToScaffold = new Set([...cliFlags].filter(f => !existingForms.has(f)))
    if (formsToScaffold.size === 0) {
      console.log(chalk.yellow('\nAll requested forms are already implemented.'))
      return
    }
  }
  else {
    // Interactive mode
    formsToScaffold = await promptForForms(existingForms)
    if (formsToScaffold.size === 0) {
      return
    }
  }

  // Get language name — CLDR or the LANGUAGE_NAME_OVERRIDES in
  // test/helpers/language-naming.js; prompt only when neither knows it.
  let languageName = getLanguageName(code)
  let nameNeedsOverride = false

  if (languageName === null) {
    const userProvidedName = await promptForLanguageName(code)
    if (userProvidedName === null) {
      process.exitCode = 1
      return
    }
    languageName = userProvidedName
    nameNeedsOverride = true
  }

  console.log(chalk.cyan(`\nAdding ${isNewLanguage ? 'language' : 'forms'}: ${languageName} (${code})`))
  console.log(chalk.gray(`Forms: ${[...formsToScaffold].join(', ')}`))
  console.log(chalk.gray(`Export name: ${normalized}`))

  if (isNewLanguage) {
    // Create new language file
    console.log(chalk.gray(`\nCreating ${langFilePath}...`))
    writeFileSync(langFilePath, generateLanguageFile(code, languageName, formsToScaffold))
    console.log(chalk.green('✓ Created language file'))

    // Create test fixture
    console.log(chalk.gray(`Creating ${fixtureFilePath}...`))
    const fixtureDir = './test/fixtures'
    if (!existsSync(fixtureDir)) {
      mkdirSync(fixtureDir, { recursive: true })
    }
    writeFileSync(fixtureFilePath, generateTestFixture(code, languageName, formsToScaffold))
    console.log(chalk.green('✓ Created test fixture'))
  }
  else {
    // Add forms to existing files
    console.log(chalk.gray(`\nUpdating ${langFilePath}...`))
    addFormsToExistingFile(code, formsToScaffold)
    console.log(chalk.green('✓ Updated language file'))

    console.log(chalk.gray(`Updating ${fixtureFilePath}...`))
    addFormsToExistingFixture(code, languageName, formsToScaffold)
    console.log(chalk.green('✓ Updated test fixture'))
  }

  // Regenerate LANGUAGES.md
  console.log(chalk.gray('Regenerating LANGUAGES.md...'))
  execSync('node scripts/generate-languages-md.js', { stdio: 'inherit' })

  // Success message
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} ${isNewLanguage ? 'language' : 'forms'}`))
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray(`1. Implement ${langFilePath} (replace the \`throw\` in each form)`))
  console.log(chalk.gray('2. Set each form\'s *Max ceiling (replace the UNBOUNDED placeholder) —'))
  console.log(chalk.gray('   a scale.js helper derived from your table, or UNBOUNDED; see docs/range-contract.md'))
  console.log(chalk.gray(`3. Add at least one case per form to ${fixtureFilePath}`))
  console.log(chalk.gray('   — the suite rejects empty fixtures, so it fails until you do'))
  console.log(chalk.gray('4. Run: npm test  (runs the suite and builds types)'))
  if (nameNeedsOverride) {
    console.log(chalk.yellow(`5. "${code}" isn't in CLDR: add it to LANGUAGE_NAME_OVERRIDES in`))
    console.log(chalk.yellow(`   test/helpers/language-naming.js ('${code}': '${languageName}')`))
    console.log(chalk.yellow('   so LANGUAGES.md shows the name instead of the code'))
  }
}

main().catch((err) => {
  console.error(chalk.red(err.message))
  process.exitCode = 1
})
