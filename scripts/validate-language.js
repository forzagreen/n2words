#!/usr/bin/env node

/**
 * Language Implementation Validator
 *
 * This script validates that language implementations follow all required patterns
 * and strategies used in the n2words library. It checks:
 *
 * - File naming conventions (IETF BCP 47 codes)
 * - Class structure and inheritance
 * - Required properties (negativeWord, zeroWord, etc.)
 * - Scale word ordering and format
 * - Method implementations
 * - Export consistency with n2words.js
 * - Test fixture existence
 * - JSDoc documentation
 *
 * Usage:
 *   npm run lang:validate                    # Validate all languages
 *   npm run lang:validate -- en es fr        # Validate specific languages
 *   npm run lang:validate -- --verbose       # Show detailed validation info
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import chalk from 'chalk'

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {string[]} info - Array of informational messages
 */

/**
 * Main validator class
 */
class LanguageValidator {
  constructor (options = {}) {
    this.verbose = options.verbose || false
    this.languageDir = './lib/languages'
    this.classDir = './lib/classes'
    this.testFixtureDir = './test/fixtures/languages'
    this.n2wordsPath = './lib/n2words.js'
  }

  /**
   * Get expected class name from BCP 47 code using CLDR as source of truth
   * @param {string} languageCode - BCP 47 language code
   * @returns {string|null} Expected PascalCase class name
   */
  getExpectedClassName (languageCode) {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
      const cldrName = displayNames.of(languageCode)

      if (!cldrName) {
        return null
      }

      // Convert CLDR display name to PascalCase
      // e.g., "Norwegian Bokmål" -> "NorwegianBokmal"
      const className = cldrName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^A-Za-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')

      return className
    } catch (error) {
      return null
    }
  }

  /**
   * Validate a single language implementation
   * @param {string} languageCode - IETF language code (e.g., 'en', 'fr-BE')
   * @returns {ValidationResult}
   */
  async validateLanguage (languageCode) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      info: []
    }

    const languageFile = join(this.languageDir, `${languageCode}.js`)

    // Check if file exists
    if (!existsSync(languageFile)) {
      result.errors.push(`Language file not found: ${languageFile}`)
      result.valid = false
      return result
    }

    // Validate file naming (IETF BCP 47)
    this.validateFileNaming(languageCode, result)

    // Get expected class name from CLDR (source of truth)
    const expectedClassName = this.getExpectedClassName(languageCode)

    if (!expectedClassName) {
      result.errors.push(`Could not determine CLDR display name for ${languageCode}`)
      result.valid = false
      return result
    }

    result.info.push(`✓ CLDR expected class name: ${expectedClassName}`)

    // Load and validate the language class
    try {
      const languageModule = await import(pathToFileURL(languageFile).href)
      const LanguageClass = languageModule[expectedClassName]

      if (!LanguageClass) {
        result.errors.push(`Expected class ${expectedClassName} not exported from ${languageFile}`)
        result.valid = false
        return result
      }

      // Validate class structure
      this.validateClassStructure(LanguageClass, expectedClassName, languageCode, result)

      // Validate instance properties and methods
      const instance = new LanguageClass()
      this.validateRequiredProperties(instance, languageCode, result)
      this.validateMethods(instance, languageCode, result)

      // Validate base class
      this.validateInheritance(LanguageClass, languageCode, result)

      // Validate scale words if applicable
      this.validateScaleWords(instance, languageCode, result)

      // Validate file content and documentation
      const fileContent = readFileSync(languageFile, 'utf8')
      this.validateDocumentation(fileContent, expectedClassName, result)
      this.validateImports(fileContent, result)

      // Validate test fixture exists
      this.validateTestFixture(languageCode, result)

      // Validate export in n2words.js
      this.validateN2wordsExport(languageCode, expectedClassName, result)
    } catch (error) {
      result.errors.push(`Failed to load language module: ${error.message}`)
      result.valid = false
    }

    result.valid = result.errors.length === 0

    return result
  }

  /**
   * Validate IETF BCP 47 naming convention using Intl.getCanonicalLocales()
   */
  validateFileNaming (languageCode, result) {
    try {
      // Attempt to canonicalize the locale - will throw if invalid BCP 47
      const canonical = Intl.getCanonicalLocales(languageCode)

      if (canonical.length === 0) {
        result.errors.push(`Invalid BCP 47 language tag: ${languageCode}`)
        return
      }

      const canonicalTag = canonical[0]

      // Check if our code matches the canonical form (case-insensitive comparison)
      if (canonicalTag.toLowerCase() !== languageCode.toLowerCase()) {
        result.warnings.push(
          `Language code "${languageCode}" should use canonical form: ${canonicalTag}`
        )
      }

      result.info.push(`✓ Valid BCP 47 tag: ${languageCode} (canonical: ${canonicalTag})`)
    } catch (error) {
      result.errors.push(
        `Invalid BCP 47 language tag: ${languageCode} (${error.message})`
      )
    }
  }

  /**
   * Validate class structure and CLDR naming
   */
  validateClassStructure (LanguageClass, expectedClassName, languageCode, result) {
    if (typeof LanguageClass !== 'function') {
      result.errors.push(`${expectedClassName} is not a class/constructor function`)
      return
    }

    // Check if it's actually a class (has prototype)
    if (!LanguageClass.prototype) {
      result.errors.push(`${expectedClassName} doesn't have a prototype (not a proper class)`)
      return
    }

    result.info.push(`✓ Class ${expectedClassName} properly defined`)

    // Validate class name follows CLDR conventions
    this.validateCLDRClassName(expectedClassName, languageCode, result)
  }
   * The expectedClassName parameter already comes from CLDR (source of truth)
   */
  validateCLDRClassName (className, languageCode, result) {
    // Check for forbidden suffixes
    if (className.endsWith('Converter') ||
        className.endsWith('Language') ||
        className.endsWith('NumberConverter')) {
      result.errors.push(
        `Class name "${className}" should not have suffix (use CLDR name only)`
      )
    }

    // Get CLDR display name for informational purposes
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
      const cldrName = displayNames.of(languageCode)
      if (cldrName) {
        result.info.push(`✓ Class name derived from CLDR: "${cldrName}"`)
      }
    } catch (error) {
      // Non-critical     `Could not validate CLDR class name: ${error.message}`
      )
    }
  }

  /**
   * Validate required properties
   */
  validateRequiredProperties (instance, languageCode, result) {
    const requiredProps = {
      negativeWord: 'string',
      zeroWord: 'string',
      decimalSeparatorWord: 'string',
      wordSeparator: 'string'
    }

    for (const [prop, type] of Object.entries(requiredProps)) {
      if (!(prop in instance)) {
        result.errors.push(`Missing required property: ${prop}`)
        continue
      }

      const actualType = typeof instance[prop]
      if (actualType !== type) {
        result.errors.push(`Property ${prop} should be ${type}, got ${actualType}`)
      } else if (type === 'string' && instance[prop] === '') {
        result.warnings.push(`Property ${prop} is empty string (may be intentional)`)
      } else {
        result.info.push(`✓ Property ${prop}: "${instance[prop]}"`)
      }
    }

    // Check optional boolean flag
    if ('convertDecimalsPerDigit' in instance) {
      if (typeof instance.convertDecimalsPerDigit !== 'boolean') {
        result.errors.push('convertDecimalsPerDigit should be boolean')
      } else {
        result.info.push(`✓ convertDecimalsPerDigit: ${instance.convertDecimalsPerDigit}`)
      }
    }
  }

  /**
   * Validate required methods
   */
  validateMethods (instance, languageCode, result) {
    // Check convertWholePart exists and is not the abstract version
    if (typeof instance.convertWholePart !== 'function') {
      result.errors.push('Missing convertWholePart() method')
      return
    }

    // Try to call it with 0 to ensure it's implemented
    try {
      const testResult = instance.convertWholePart(0n)
      if (typeof testResult !== 'string') {
        result.errors.push(`convertWholePart(0n) returned ${typeof testResult}, expected string`)
      } else if (testResult === '') {
        result.warnings.push('convertWholePart(0n) returned empty string')
      } else {
        result.info.push(`✓ convertWholePart(0n) returns: "${testResult}"`)
      }
    } catch (error) {
      if (error.message.includes('must be implemented by subclass')) {
        result.errors.push('convertWholePart() not implemented (still abstract)')
      } else {
        result.errors.push(`convertWholePart(0n) threw error: ${error.message}`)
      }
    }

    // Check if convertToWords is available (inherited)
    if (typeof instance.convertToWords !== 'function') {
      result.errors.push('Missing convertToWords() method (should be inherited from AbstractLanguage)')
    }
  }

  /**
   * Validate inheritance chain
   */
  validateInheritance (LanguageClass, languageCode, result) {
    const validBaseClasses = [
      'AbstractLanguage',
      'GreedyScaleLanguage',
      'SlavicLanguage',
      'SouthAsianLanguage',
      'TurkicLanguage'
    ]

    const proto = Object.getPrototypeOf(LanguageClass)
    const baseClassName = proto?.name

    if (!baseClassName) {
      result.errors.push('Could not determine base class')
      return
    }

    if (!validBaseClasses.includes(baseClassName)) {
      result.errors.push(`Unknown base class: ${baseClassName}. Expected one of: ${validBaseClasses.join(', ')}`)
    } else {
      result.info.push(`✓ Extends ${baseClassName}`)
    }

    return baseClassName
  }

  /**
   * Validate scale words (for GreedyScaleLanguage and TurkicLanguage)
   */
  validateScaleWords (instance, languageCode, result) {
    if (!('scaleWordPairs' in instance)) {
      return // Not applicable for this language type
    }

    const scaleWords = instance.scaleWordPairs

    if (!Array.isArray(scaleWords)) {
      result.errors.push('scaleWordPairs should be an array')
      return
    }

    if (scaleWords.length === 0) {
      result.errors.push('scaleWordPairs is empty')
      return
    }

    // Validate structure: [[bigint, string], ...]
    let previousValue = Infinity
    let hasOrderingError = false

    for (let i = 0; i < scaleWords.length; i++) {
      const pair = scaleWords[i]

      if (!Array.isArray(pair) || pair.length !== 2) {
        result.errors.push(`scaleWordPairs[${i}] should be [bigint, string] pair`)
        continue
      }

      const [value, word] = pair

      if (typeof value !== 'bigint') {
        result.errors.push(`scaleWordPairs[${i}][0] should be bigint, got ${typeof value}`)
      }

      if (typeof word !== 'string') {
        result.errors.push(`scaleWordPairs[${i}][1] should be string, got ${typeof word}`)
      }

      // Check descending order
      if (Number(value) >= previousValue && !hasOrderingError) {
        result.errors.push(`scaleWordPairs not in descending order at index ${i}: ${value} >= ${previousValue}`)
        hasOrderingError = true
      }

      previousValue = Number(value)
    }

    if (!hasOrderingError) {
      result.info.push(`✓ scaleWordPairs properly ordered (${scaleWords.length} entries)`)
    }

    // Check for required scale word for '1'
    const hasOne = scaleWords.some(pair => pair[0] === 1n)
    if (!hasOne) {
      result.warnings.push('scaleWordPairs missing entry for 1n (may cause issues in decomposition)')
    }
  }

  /**
   * Validate JSDoc documentation
   */
  validateDocumentation (fileContent, className, result) {
    // Check for class JSDoc
    const hasClassDoc = fileContent.includes(`/**\n * ${className}`) ||
                        fileContent.includes('/**\n * @typedef') ||
                        fileContent.match(/\/\*\*[\s\S]*?language converter/i)

    if (!hasClassDoc) {
      result.warnings.push('Missing or incomplete JSDoc class documentation')
    } else {
      result.info.push('✓ Has class documentation')
    }

    // Check for mergeScales documentation (if it exists in file)
    if (fileContent.includes('mergeScales')) {
      const hasMergeScalesDoc = fileContent.match(/\/\*\*[\s\S]*?mergeScales[\s\S]*?\*\//i)
      if (!hasMergeScalesDoc) {
        result.warnings.push('mergeScales() method lacks JSDoc documentation')
      } else {
        result.info.push('✓ Has mergeScales() documentation')
      }
    }
  }

  /**
   * Validate imports
   */
  validateImports (fileContent, result) {
    const hasImport = fileContent.match(/^import\s+{[^}]+}\s+from\s+['"]\.\.\/classes\//m)

    if (!hasImport) {
      result.errors.push('Missing import statement from base class')
    } else {
      result.info.push('✓ Has proper import statement')
    }

    // Check for relative imports
    const hasRelativePath = fileContent.match(/from\s+['"]\.\.\//g)
    if (hasRelativePath) {
      result.info.push('✓ Uses relative imports')
    }
  }

  /**
   * Validate test fixture exists
   */
  validateTestFixture (languageCode, result) {
    const fixtureFile = join(this.testFixtureDir, `${languageCode}.js`)

    if (!existsSync(fixtureFile)) {
      result.warnings.push(`Missing test fixture: ${fixtureFile}`)
    } else {
      // Validate fixture structure
      try {
        const fixtureContent = readFileSync(fixtureFile, 'utf8')

        if (!fixtureContent.includes('export default')) {
          result.warnings.push('Test fixture should use "export default" for test cases array')
        }

        // Check if it exports an array
        if (!fixtureContent.match(/export default\s*\[/)) {
          result.warnings.push('Test fixture should export an array of test cases')
        } else {
          result.info.push('✓ Has test fixture file')
        }
      } catch (error) {
        result.warnings.push(`Could not read test fixture: ${error.message}`)
      }
    }
  }

  /**
   * Validate export in n2words.js
   */
  validateN2wordsExport (languageCode, className, result) {
    const n2wordsContent = readFileSync(this.n2wordsPath, 'utf8')

    // Check for import
    const importPattern = new RegExp(`import\\s+{\\s*${className}\\s*}\\s+from\\s+['"]\\./languages/${languageCode}\\.js['"]`)
    if (!importPattern.test(n2wordsContent)) {
      result.errors.push(`Not imported in ${this.n2wordsPath}`)
    }

    // Check for converter creation
    const converterName = `${className}Converter`
    const converterPattern = new RegExp(`const\\s+${converterName}\\s*=\\s*makeConverter\\(${className}\\)`)
    if (!converterPattern.test(n2wordsContent)) {
      result.errors.push(`${converterName} not created with makeConverter() in ${this.n2wordsPath}`)
    }

    // Check for export
    const exportPattern = new RegExp(`${converterName}`)
    const exportSection = n2wordsContent.match(/export\s*{[\s\S]*?}/)?.[0]
    if (!exportSection || !exportPattern.test(exportSection)) {
      result.errors.push(`${converterName} not exported from ${this.n2wordsPath}`)
    }

    if (importPattern.test(n2wordsContent) &&
        converterPattern.test(n2wordsContent) &&
        exportSection && exportPattern.test(exportSection)) {
      result.info.push(`✓ Properly registered in n2words.js as ${converterName}`)
    }
  }

  /**
   * Format and display validation results
   */
  displayResults (languageCode, result) {
    const header = result.valid
      ? chalk.green(`✓ ${languageCode}`)
      : chalk.red(`✗ ${languageCode}`)

    console.log(`\n${chalk.bold(header)}`)

    if (result.errors.length > 0) {
      console.log(chalk.red('  Errors:'))
      result.errors.forEach(err => console.log(`    ${chalk.red('✗')} ${err}`))
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow('  Warnings:'))
      result.warnings.forEach(warn => console.log(`    ${chalk.yellow('⚠')} ${warn}`))
    }

    if (this.verbose && result.info.length > 0) {
      console.log(chalk.gray('  Info:'))
      result.info.forEach(info => console.log(`    ${chalk.gray(info)}`))
    }
  }

  /**
   * Run validation for specified languages or all languages
   */
  async run (languageCodes = []) {
    console.log(chalk.cyan.bold('n2words Language Validator') + '\n')

    // If no specific languages provided, validate all
    if (languageCodes.length === 0) {
      const files = readdirSync(this.languageDir)
      languageCodes = files
        .filter(file => file.endsWith('.js'))
        .map(file => basename(file, '.js'))
        .sort()
    }

    const results = {}
    let totalValid = 0
    let totalInvalid = 0

    for (const code of languageCodes) {
      const result = await this.validateLanguage(code)
      results[code] = result

      if (result.valid) {
        totalValid++
      } else {
        totalInvalid++
      }

      this.displayResults(code, result)
    }

    // Summary
    console.log('\n' + chalk.bold('Summary:'))
    console.log('  ' + chalk.green(`Valid: ${totalValid}`))
    if (totalInvalid > 0) {
      console.log('  ' + chalk.red(`Invalid: ${totalInvalid}`))
    }
    console.log(`  Total: ${languageCodes.length}`)

    // Exit with error code if any validation failed
    if (totalInvalid > 0) {
      process.exit(1)
    }
  }
}

// Parse command-line arguments
const args = process.argv.slice(2)
const verbose = args.includes('--verbose') || args.includes('-v')
const languages = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'))

// Run validator
const validator = new LanguageValidator({ verbose })
validator.run(languages).catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})
