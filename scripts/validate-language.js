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
 * Get expected class name from BCP 47 code using CLDR as source of truth
 * Pure function - exported for reuse
 * @param {string} languageCode - BCP 47 language code
 * @returns {string|null} Expected PascalCase class name
 */
export function getExpectedClassName (languageCode) {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const cldrName = displayNames.of(languageCode)

    if (!cldrName) {
      return null
    }

    // If CLDR returns the code unchanged (not recognized), return null
    // This happens for rare/historical languages like 'hbo' (Biblical Hebrew)
    if (cldrName === languageCode) {
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
 * Validate that a language code is a valid IETF BCP 47 tag
 * Pure function - exported for reuse in other scripts
 * @param {string} languageCode - Language code to validate
 * @returns {{ valid: boolean, canonical: string|null, error: string|null }} Validation result
 */
export function validateLanguageCode (languageCode) {
  try {
    // Attempt to canonicalize the locale - will throw if invalid BCP 47
    const canonical = Intl.getCanonicalLocales(languageCode)

    if (canonical.length === 0) {
      return {
        valid: false,
        canonical: null,
        error: `Invalid BCP 47 language tag: ${languageCode}`
      }
    }

    return {
      valid: true,
      canonical: canonical[0],
      error: null
    }
  } catch (error) {
    return {
      valid: false,
      canonical: null,
      error: `Invalid BCP 47 language tag: ${languageCode} (${error.message})`
    }
  }
}

/**
 * Validate IETF BCP 47 naming convention
 * @param {string} languageCode - Language code to validate
 * @param {ValidationResult} result - Result object to populate
 */
function validateFileNaming (languageCode, result) {
  try {
    // Attempt to canonicalize the locale - will throw if invalid BCP 47
    const validation = validateLanguageCode(languageCode)

    if (validation.valid === false) {
      result.errors.push(validation.error)
      return
    }

    const canonicalTag = validation.canonical
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
 * @param {Function} LanguageClass - The language class constructor
 * @param {string} expectedClassName - Expected class name
 * @param {string} languageCode - Language code
 * @param {ValidationResult} result - Result object to populate
 */
function validateClassStructure (LanguageClass, expectedClassName, languageCode, result) {
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
  validateCLDRClassName(expectedClassName, languageCode, result)
}

/**
 * Validate that class name matches CLDR conventions
 * @param {string} className - Class name to validate
 * @param {string} languageCode - Language code
 * @param {ValidationResult} result - Result object to populate
 */
function validateCLDRClassName (className, languageCode, result) {
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
    // Non-critical - could not validate CLDR class name
  }
}

/**
 * Validate required properties
 * @param {Object} instance - Language class instance
 * @param {ValidationResult} result - Result object to populate
 */
function validateRequiredProperties (instance, result) {
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
 * @param {Object} instance - Language class instance
 * @param {ValidationResult} result - Result object to populate
 */
function validateMethods (instance, result) {
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
 * @param {Function} LanguageClass - The language class constructor
 * @param {ValidationResult} result - Result object to populate
 * @returns {string|undefined} Base class name
 */
function validateInheritance (LanguageClass, result) {
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

  // Check if it extends a valid base class directly
  if (validBaseClasses.includes(baseClassName)) {
    result.info.push(`✓ Extends ${baseClassName}`)
    return baseClassName
  }

  // Check if it extends another language (e.g., fr-BE extends fr)
  // This is valid for regional variants
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentClassName = grandProto?.name

  if (grandParentClassName && validBaseClasses.includes(grandParentClassName)) {
    result.info.push(`✓ Extends ${baseClassName} (which extends ${grandParentClassName})`)
    return baseClassName
  }

  // If neither direct parent nor grandparent is valid, it's an error
  result.errors.push(`Unknown base class: ${baseClassName}. Expected one of: ${validBaseClasses.join(', ')}, or a language that extends them`)

  return baseClassName
}

/**
 * Validate scale words (for GreedyScaleLanguage and TurkicLanguage)
 * @param {Object} instance - Language class instance
 * @param {ValidationResult} result - Result object to populate
 */
function validateScaleWords (instance, result) {
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
 * @param {string} fileContent - Language file content
 * @param {string} className - Class name
 * @param {ValidationResult} result - Result object to populate
 */
function validateDocumentation (fileContent, className, result) {
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
 * @param {string} fileContent - Language file content
 * @param {ValidationResult} result - Result object to populate
 */
function validateImports (fileContent, result) {
  // Check for import from base classes
  const hasBaseClassImport = fileContent.match(/^import\s+{[^}]+}\s+from\s+['"]\.\.\/classes\//m)

  // Check for import from other languages (for variants like fr-BE extending fr)
  const languageImportMatch = fileContent.match(/^import\s+{([^}]+)}\s+from\s+['"]\.\/([^'"]+)\.js['"]/m)

  if (!hasBaseClassImport && !languageImportMatch) {
    result.errors.push('Missing import statement from base class or parent language')
  } else if (hasBaseClassImport) {
    result.info.push('✓ Has proper base class import statement')
  } else if (languageImportMatch) {
    result.info.push('✓ Has proper language import statement (regional variant)')

    // Validate parent language file exists
    const parentLanguageCode = languageImportMatch[2]
    const parentLanguageClass = languageImportMatch[1].trim()
    const parentLanguagePath = `./lib/languages/${parentLanguageCode}.js`

    if (existsSync(parentLanguagePath)) {
      result.info.push(`✓ Parent language file exists: ${parentLanguageCode}.js`)
    } else {
      result.errors.push(`Parent language file not found: ${parentLanguagePath}`)
    }

    // Validate that the class actually extends the imported parent
    const extendsMatch = fileContent.match(/extends\s+(\w+)/)
    if (extendsMatch && extendsMatch[1] === parentLanguageClass) {
      result.info.push(`✓ Correctly extends ${parentLanguageClass}`)
    } else if (extendsMatch) {
      result.warnings.push(
        `Imports ${parentLanguageClass} but extends ${extendsMatch[1]}`
      )
    }
  }

  // Check for relative imports
  const hasRelativePath = fileContent.match(/from\s+['"]\.\.\//g) || fileContent.match(/from\s+['"].\//g)
  if (hasRelativePath) {
    result.info.push('✓ Uses relative imports')
  }
}

/**
 * Validate test fixture exists
 * @param {string} languageCode - Language code
 * @param {ValidationResult} result - Result object to populate
 */
function validateTestFixture (languageCode, result) {
  const fixtureFile = join('./test/fixtures/languages', `${languageCode}.js`)

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
 * Extract typedef information from n2words.js
 * @param {string} className - Class name
 * @param {string} n2wordsContent - Content of n2words.js
 * @returns {{ exists: boolean, properties: Array<{name: string, type: string, defaultValue: string|null}> }}
 */
function extractTypedef (className, n2wordsContent) {
  const typedefName = `${className}Options`

  // Find the exact typedef block - must start with /** and end with */
  // and have @typedef {Object} TypedefName on one line
  const typedefStart = n2wordsContent.indexOf(`@typedef {Object} ${typedefName}`)
  if (typedefStart === -1) {
    return { exists: false, properties: [] }
  }

  // Find the start of the comment block (go backwards to find /**)
  let commentStart = typedefStart
  while (commentStart > 0 && n2wordsContent.substring(commentStart - 3, commentStart) !== '/**') {
    commentStart--
  }
  commentStart -= 3 // Include the /**

  // Find the end of the comment block (find the next */)
  const commentEnd = n2wordsContent.indexOf('*/', typedefStart)
  if (commentEnd === -1) {
    return { exists: false, properties: [] }
  }

  const typedef = n2wordsContent.substring(commentStart, commentEnd + 2)
  const properties = []

  // Match @property lines: @property {type} [name=defaultValue] Description
  // or @property {type} [name] Description
  const propertyPattern = /@property\s*{([^}]+)}\s*\[(\w+)(?:=([^\]]+))?\]/g
  let match

  while ((match = propertyPattern.exec(typedef)) !== null) {
    properties.push({
      name: match[2],
      type: match[1].trim(),
      defaultValue: match[3] ? match[3].trim() : null
    })
  }

  return { exists: true, properties }
}

/**
 * Validate options pattern (constructor, typedef, converter annotation)
 * @param {Object} instance - Language class instance
 * @param {Function} LanguageClass - Language class constructor
 * @param {string} className - Class name
 * @param {string} fileContent - Language file content
 * @param {ValidationResult} result - Result object to populate
 */
function validateOptionsPattern (instance, LanguageClass, className, fileContent, result) {
  const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')
  const converterName = `${className}Converter`

  // Check if language has a constructor
  const hasConstructor = fileContent.includes('constructor')

  if (!hasConstructor) {
    // No constructor in this language file - check if base class handles options
    const typedef = extractTypedef(className, n2wordsContent)

    if (typedef.exists) {
      // Typedef exists, so converter should have options parameter
      // This is OK if base class handles options (e.g., SlavicLanguage, SouthAsianLanguage)
      const converterPattern = new RegExp(
        `const\\s+${converterName}\\s*=\\s*\\/\\*\\*\\s*@type\\s*{\\(value: NumericValue, options\\?: ${className}Options\\) => string}\\s*\\*\\/`
      )

      if (converterPattern.test(n2wordsContent)) {
        result.info.push(`✓ Options handled by base class (typedef ${className}Options exists, no local constructor)`)

        // Validate gender option type for base class options
        const genderProp = typedef.properties.find(p => p.name === 'gender')
        if (genderProp) {
          const hasEnumType = genderProp.type.includes('masculine') && genderProp.type.includes('feminine')
          const hasBooleanType = genderProp.type === 'boolean'

          if (hasBooleanType) {
            result.errors.push(
              'Gender option should use enum type "(\'masculine\'|\'feminine\')", not boolean'
            )
          } else if (!hasEnumType) {
            result.warnings.push(
              `Gender option type "${genderProp.type}" should use enum pattern: "('masculine'|'feminine')"`
            )
          } else {
            result.info.push('✓ Gender option uses correct enum type')
          }
        }
      } else {
        result.errors.push(`Typedef ${className}Options exists but ${converterName} missing options type annotation`)
      }
    }

    return
  }

  // Has constructor - check if it uses options
  // Match constructor with better multiline support
  const constructorMatch = fileContent.match(/constructor\s*\(([^)]*)\)\s*{([\s\S]*?)(?:\n {2}}\s*(?:\n|$)|\n\}\s*(?:\n|$))/)
  if (!constructorMatch) {
    result.warnings.push('Could not parse constructor (validation may be incomplete)')
    return
  }

  const constructorParams = constructorMatch[1].trim()
  const constructorBody = constructorMatch[2]

  // Check if constructor takes options parameter
  const hasOptionsParam = /options\s*=/.test(constructorParams)

  if (!hasOptionsParam) {
    // Constructor exists but doesn't take options
    return
  }

  // Constructor takes options - validate the full pattern
  result.info.push('✓ Constructor accepts options parameter')

  // 1. Validate super() call
  if (!constructorBody.includes('super(')) {
    result.errors.push('Constructor missing super() call')
  } else {
    // Check if passing options to super (regional variant pattern)
    if (constructorBody.includes('super(options)')) {
      result.info.push('✓ Constructor passes options to super() (regional variant pattern)')

      // Check if constructor mutates scaleWordPairs (common in regional variants and conditional options)
      if (constructorBody.includes('this.scaleWordPairs')) {
        result.info.push('✓ Constructor mutates scaleWordPairs (variant or conditional behavior)')

        // Validate that instance still has valid scaleWordPairs after construction
        try {
          if (instance.scaleWordPairs && Array.isArray(instance.scaleWordPairs)) {
            // Check ordering is still maintained
            let previousValue = Infinity
            let hasOrderingError = false

            for (let i = 0; i < instance.scaleWordPairs.length; i++) {
              const pair = instance.scaleWordPairs[i]
              if (Array.isArray(pair) && pair.length === 2) {
                const value = Number(pair[0])
                if (value >= previousValue && !hasOrderingError) {
                  result.warnings.push(
                    `scaleWordPairs still not in descending order after constructor mutation at index ${i}`
                  )
                  hasOrderingError = true
                }
                previousValue = value
              }
            }

            if (!hasOrderingError) {
              result.info.push('✓ Mutated scaleWordPairs still properly ordered')
            }
          }
        } catch (error) {
          result.warnings.push(`Could not validate mutated scaleWordPairs: ${error.message}`)
        }
      }

      // Regional variants don't need mergeOptions - parent handles it
      return
    }
    result.info.push('✓ Constructor calls super()')
  }

  // 2. Validate mergeOptions() call (only if not a regional variant)
  if (!constructorBody.includes('this.mergeOptions(')) {
    result.errors.push('Constructor with options should call this.mergeOptions() or pass options to super()')
  } else {
    result.info.push('✓ Constructor uses mergeOptions() pattern')

    // Extract default options from mergeOptions call
    const mergeOptionsMatch = constructorBody.match(/this\.mergeOptions\(\s*{([^}]*)}/)
    if (mergeOptionsMatch) {
      const defaultsStr = mergeOptionsMatch[1]
      const defaults = []

      // Parse default option properties
      const optionPattern = /(\w+):\s*([^,\n]+)/g
      let optMatch
      while ((optMatch = optionPattern.exec(defaultsStr)) !== null) {
        defaults.push({
          name: optMatch[1].trim(),
          value: optMatch[2].trim().replace(/['"]/g, '')
        })
      }

      if (defaults.length > 0) {
        result.info.push(`✓ Default options defined: ${defaults.map(d => d.name).join(', ')}`)

        // 3. Validate typedef exists in n2words.js
        const typedef = extractTypedef(className, n2wordsContent)

        if (!typedef.exists) {
          result.errors.push(`Constructor has options but typedef ${className}Options missing from n2words.js`)
        } else {
          result.info.push(`✓ Typedef ${className}Options exists in n2words.js`)

          // 4. Validate typedef properties match constructor defaults
          for (const def of defaults) {
            const typedefProp = typedef.properties.find(p => p.name === def.name)

            if (!typedefProp) {
              result.warnings.push(`Option "${def.name}" in constructor but not in ${className}Options typedef`)
            } else {
              // Validate default values match
              if (typedefProp.defaultValue) {
                const typedefDefault = typedefProp.defaultValue.replace(/['"]/g, '')
                if (typedefDefault !== def.value && typedefDefault !== String(def.value === 'true' || def.value === 'false')) {
                  result.warnings.push(
                    `Default value mismatch for "${def.name}": constructor="${def.value}", typedef="${typedefProp.defaultValue}"`
                  )
                }
              }

              // Special validation for gender option - must use enum type, not boolean
              if (def.name === 'gender') {
                const hasEnumType = typedefProp.type.includes('masculine') && typedefProp.type.includes('feminine')
                const hasBooleanType = typedefProp.type === 'boolean'

                if (hasBooleanType) {
                  result.errors.push(
                    'Gender option should use enum type "(\'masculine\'|\'feminine\')", not boolean'
                  )
                } else if (!hasEnumType) {
                  result.warnings.push(
                    `Gender option type "${typedefProp.type}" should use enum pattern: "('masculine'|'feminine')"`
                  )
                } else {
                  result.info.push('✓ Gender option uses correct enum type')
                }

                // Validate default value is 'masculine' or 'feminine'
                if (def.value !== 'masculine' && def.value !== 'feminine') {
                  result.warnings.push(
                    `Gender default value "${def.value}" should be 'masculine' or 'feminine'`
                  )
                }
              }

              // Validate boolean options have boolean type
              const booleanOptions = ['feminine', 'formal', 'ordFlag', 'includeOptionalAnd', 'noHundredPairs', 'accentOne', 'withHyphenSeparator', 'dropSpaces']
              if (booleanOptions.includes(def.name)) {
                if (typedefProp.type !== 'boolean') {
                  result.warnings.push(
                    `Option "${def.name}" should have boolean type, found: ${typedefProp.type}`
                  )
                }

                // Validate default value is 'true' or 'false'
                if (def.value !== 'true' && def.value !== 'false') {
                  result.warnings.push(
                    `Boolean option "${def.name}" default value "${def.value}" should be 'true' or 'false'`
                  )
                }
              }

              // Validate string options have string type
              const stringOptions = ['negativeWord', 'andWord']
              if (stringOptions.includes(def.name)) {
                if (typedefProp.type !== 'string') {
                  result.warnings.push(
                    `Option "${def.name}" should have string type, found: ${typedefProp.type}`
                  )
                }
              }
            }
          }

          // Check for typedef properties not in constructor
          for (const prop of typedef.properties) {
            const constructorDef = defaults.find(d => d.name === prop.name)
            if (!constructorDef) {
              result.warnings.push(`Option "${prop.name}" in typedef but not in constructor defaults`)
            }
          }
        }

        // 5. Validate converter type annotation includes options
        const converterWithOptionsPattern = new RegExp(
          `const\\s+${converterName}\\s*=\\s*\\/\\*\\*\\s*@type\\s*{\\(value: NumericValue, options\\?: ${className}Options\\) => string}\\s*\\*\\/`
        )

        if (!converterWithOptionsPattern.test(n2wordsContent)) {
          result.errors.push(`${converterName} should have type annotation with options?: ${className}Options`)
        } else {
          result.info.push(`✓ ${converterName} has correct type annotation with options`)
        }
      }
    }
  }
}

/**
 * Validate export in n2words.js
 * @param {string} languageCode - Language code
 * @param {string} className - Class name
 * @param {ValidationResult} result - Result object to populate
 */
function validateN2wordsExport (languageCode, className, result) {
  const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')

  // Check for import in Language Imports section
  const importPattern = new RegExp(`import\\s+{\\s*${className}\\s*}\\s+from\\s+['"]\\./languages/${languageCode}\\.js['"]`)
  if (!importPattern.test(n2wordsContent)) {
    result.errors.push('Not imported in ./lib/n2words.js (Language Imports section)')
  }

  // Check for converter creation in Language Converters section
  // Accept both patterns:
  // const XConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(X))
  // const XConverter = /** @type {(value: NumericValue, options?: XOptions) => string} */ (makeConverter(X))
  const converterName = `${className}Converter`
  const converterPattern = new RegExp(
    `const\\s+${converterName}\\s*=\\s*\\/\\*\\*\\s*@type\\s*{[^}]+}\\s*\\*\\/\\s*\\(\\s*makeConverter\\(${className}\\)\\s*\\)`
  )
  if (!converterPattern.test(n2wordsContent)) {
    result.errors.push(`${converterName} not created with makeConverter() and type annotation in ./lib/n2words.js`)
  }

  // Check for export in Exports section
  const exportPattern = new RegExp(`${converterName}`)
  const exportSection = n2wordsContent.match(/export\s*{[\s\S]*?}/)?.[0]
  if (!exportSection || !exportPattern.test(exportSection)) {
    result.errors.push(`${converterName} not exported from ./lib/n2words.js (Exports section)`)
  }

  if (importPattern.test(n2wordsContent) &&
      converterPattern.test(n2wordsContent) &&
      exportSection && exportPattern.test(exportSection)) {
    result.info.push(`✓ Properly registered in n2words.js as ${converterName}`)
  }
}

/**
 * Validate a single language implementation
 * Pure function - takes all dependencies as parameters
 * @param {string} languageCode - IETF language code (e.g., 'en', 'fr-BE')
 * @returns {Promise<ValidationResult>} Validation result
 */
export async function validateLanguage (languageCode) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  }

  const languageFile = join('./lib/languages', `${languageCode}.js`)

  // Check if file exists
  if (!existsSync(languageFile)) {
    result.errors.push(`Language file not found: ${languageFile}`)
    result.valid = false
    return result
  }

  // Validate file naming (IETF BCP 47)
  validateFileNaming(languageCode, result)

  // Get expected class name from CLDR (source of truth)
  const expectedClassName = getExpectedClassName(languageCode)

  if (!expectedClassName) {
    result.warnings.push(`CLDR does not provide display name for ${languageCode} (rare/historical language)`)
    result.info.push('⚠ Using descriptive class name instead of CLDR-derived name')

    // For languages not in CLDR, we'll validate that ANY class is exported
    // and skip CLDR-specific validation
    try {
      const languageModule = await import(pathToFileURL(languageFile).href)
      const exportedClasses = Object.keys(languageModule).filter(key =>
        typeof languageModule[key] === 'function' && languageModule[key].prototype
      )

      if (exportedClasses.length === 0) {
        result.errors.push(`No class exported from ${languageFile}`)
        result.valid = false
        return result
      }

      const LanguageClass = languageModule[exportedClasses[0]]
      result.info.push(`✓ Found class: ${exportedClasses[0]} (descriptive name for rare language)`)

      // Continue with standard validation
      validateClassStructure(LanguageClass, exportedClasses[0], languageCode, result)
      const instance = new LanguageClass()
      validateRequiredProperties(instance, result)
      validateMethods(instance, result)
      validateInheritance(LanguageClass, result)
      validateScaleWords(instance, result)

      const fileContent = readFileSync(languageFile, 'utf8')
      validateDocumentation(fileContent, exportedClasses[0], result)
      validateImports(fileContent, result)
      validateOptionsPattern(instance, LanguageClass, exportedClasses[0], fileContent, result)
      validateTestFixture(languageCode, result)
      validateN2wordsExport(languageCode, exportedClasses[0], result)
    } catch (error) {
      result.errors.push(`Failed to load language module: ${error.message}`)
      result.valid = false
    }

    result.valid = result.errors.length === 0
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
    validateClassStructure(LanguageClass, expectedClassName, languageCode, result)

    // Validate instance properties and methods
    const instance = new LanguageClass()
    validateRequiredProperties(instance, result)
    validateMethods(instance, result)

    // Validate base class
    validateInheritance(LanguageClass, result)

    // Validate scale words if applicable
    validateScaleWords(instance, result)

    // Validate file content and documentation
    const fileContent = readFileSync(languageFile, 'utf8')
    validateDocumentation(fileContent, expectedClassName, result)
    validateImports(fileContent, result)

    // Validate options pattern (constructor, typedef, converter annotation)
    validateOptionsPattern(instance, LanguageClass, expectedClassName, fileContent, result)

    // Validate test fixture exists
    validateTestFixture(languageCode, result)

    // Validate export in n2words.js
    validateN2wordsExport(languageCode, expectedClassName, result)
  } catch (error) {
    result.errors.push(`Failed to load language module: ${error.message}`)
    result.valid = false
  }

  result.valid = result.errors.length === 0

  return result
}

/**
 * Format and display validation results
 * Pure function - only side effect is console output
 * @param {string} languageCode - Language code
 * @param {ValidationResult} result - Validation result
 * @param {boolean} verbose - Show verbose output
 */
export function displayResults (languageCode, result, verbose = false) {
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

  if (verbose && result.info.length > 0) {
    console.log(chalk.gray('  Info:'))
    result.info.forEach(info => console.log(`    ${chalk.gray(info)}`))
  }
}

/**
 * Run validation for specified languages or all languages
 * Pure function - orchestrates validation flow
 * @param {string[]} languageCodes - Language codes to validate (empty = all)
 * @param {boolean} verbose - Show verbose output
 * @returns {Promise<{ results: Object<string, ValidationResult>, totalValid: number, totalInvalid: number }>}
 */
export async function runValidation (languageCodes = [], verbose = false) {
  console.log(chalk.cyan.bold('n2words Language Validator') + '\n')

  // If no specific languages provided, validate all
  if (languageCodes.length === 0) {
    const files = readdirSync('./lib/languages')
    languageCodes = files
      .filter(file => file.endsWith('.js'))
      .map(file => basename(file, '.js'))
      .sort()
  }

  const results = {}
  let totalValid = 0
  let totalInvalid = 0

  for (const code of languageCodes) {
    const result = await validateLanguage(code)
    results[code] = result

    if (result.valid) {
      totalValid++
    } else {
      totalInvalid++
    }

    displayResults(code, result, verbose)
  }

  // Summary
  console.log('\n' + chalk.bold('Summary:'))
  console.log('  ' + chalk.green(`Valid: ${totalValid}`))
  if (totalInvalid > 0) {
    console.log('  ' + chalk.red(`Invalid: ${totalInvalid}`))
  }
  console.log(`  Total: ${languageCodes.length}`)

  return { results, totalValid, totalInvalid }
}

// Only run CLI if this file is executed directly (not imported)
// Check if this is the main module by comparing resolved paths
const isMainModule = process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))

if (isMainModule) {
  // Parse command-line arguments
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose') || args.includes('-v')
  const languages = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'))

  // Run validator
  runValidation(languages, verbose).then(({ totalInvalid }) => {
    // Exit with error code if any validation failed
    if (totalInvalid > 0) {
      process.exit(1)
    }
  }).catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}
