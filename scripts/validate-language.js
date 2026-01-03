#!/usr/bin/env node

/**
 * Language Implementation Validator
 *
 * Validates language implementations follow required patterns:
 * - File naming (IETF BCP 47)
 * - Class structure and inheritance
 * - Required properties and methods
 * - Scale word ordering
 * - n2words.js registration
 * - Test fixture existence
 * - JSDoc documentation
 * - Options pattern (when applicable)
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

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get expected class name from BCP 47 code using CLDR
 * @param {string} languageCode BCP 47 language code
 * @returns {string|null} Expected PascalCase class name
 */
export function getExpectedClassName (languageCode) {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const cldrName = displayNames.of(languageCode)

    // CLDR doesn't recognize this code
    if (!cldrName || cldrName === languageCode) {
      return null
    }

    // Convert "Norwegian Bokmål" -> "NorwegianBokmal"
    return cldrName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^A-Za-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  } catch {
    return null
  }
}

/**
 * Validate IETF BCP 47 language code
 * @param {string} languageCode Language code to validate
 * @returns {{ valid: boolean, canonical: string|null, error: string|null }}
 */
export function validateLanguageCode (languageCode) {
  try {
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

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate file naming convention
 */
function validateFileNaming (languageCode, result) {
  const validation = validateLanguageCode(languageCode)

  if (!validation.valid) {
    result.errors.push(validation.error)
    return
  }

  const canonical = validation.canonical
  if (canonical.toLowerCase() !== languageCode.toLowerCase()) {
    result.warnings.push(`Language code "${languageCode}" should use canonical form: ${canonical}`)
  }

  result.info.push(`✓ Valid BCP 47 tag: ${languageCode} (canonical: ${canonical})`)
}

/**
 * Validate class structure
 */
function validateClassStructure (LanguageClass, expectedClassName, result) {
  if (typeof LanguageClass !== 'function' || !LanguageClass.prototype) {
    result.errors.push(`${expectedClassName} is not a valid class`)
    return
  }

  // Check for forbidden suffixes
  if (/(Converter|Language|NumberConverter)$/.test(expectedClassName)) {
    result.errors.push(`Class name "${expectedClassName}" should not have suffix (use CLDR name only)`)
  }

  result.info.push(`✓ Class ${expectedClassName} properly defined`)
}

/**
 * Validate required properties
 */
function validateRequiredProperties (instance, result) {
  // Truly required properties (no defaults in AbstractLanguage)
  const required = {
    negativeWord: 'string',
    zeroWord: 'string',
    decimalSeparatorWord: 'string'
  }

  for (const [prop, type] of Object.entries(required)) {
    if (!(prop in instance)) {
      result.errors.push(`Missing required property: ${prop}`)
    } else if (typeof instance[prop] !== type) { // eslint-disable-line valid-typeof
      result.errors.push(`Property ${prop} should be ${type}, got ${typeof instance[prop]}`)
    } else if (instance[prop] === '') {
      result.warnings.push(`Property ${prop} is empty string (may be intentional)`)
    } else {
      result.info.push(`✓ Property ${prop}: "${instance[prop]}"`)
    }
  }

  // Optional property with default (wordSeparator defaults to ' ')
  if ('wordSeparator' in instance) {
    if (typeof instance.wordSeparator !== 'string') {
      result.errors.push(`Property wordSeparator should be string, got ${typeof instance.wordSeparator}`)
    } else if (instance.wordSeparator === '') {
      result.warnings.push('Property wordSeparator is empty string (may be intentional)')
    } else {
      result.info.push(`✓ Property wordSeparator: "${instance.wordSeparator}"`)
    }
  }

  // Check optional flag
  if ('usePerDigitDecimals' in instance) {
    if (typeof instance.usePerDigitDecimals !== 'boolean') {
      result.errors.push('usePerDigitDecimals should be boolean')
    } else {
      result.info.push(`✓ usePerDigitDecimals: ${instance.usePerDigitDecimals}`)
    }
  }
}

/**
 * Validate required methods
 */
function validateMethods (instance, result) {
  if (typeof instance.integerToWords !== 'function') {
    result.errors.push('Missing integerToWords() method')
    return
  }

  // Test implementation
  try {
    const testResult = instance.integerToWords(0n)
    if (typeof testResult !== 'string') {
      result.errors.push(`integerToWords(0n) returned ${typeof testResult}, expected string`)
    } else if (testResult === '') {
      result.warnings.push('integerToWords(0n) returned empty string')
    } else {
      result.info.push(`✓ integerToWords(0n) returns: "${testResult}"`)
    }
  } catch (error) {
    if (error.message.includes('must be implemented by subclass')) {
      result.errors.push('integerToWords() not implemented (still abstract)')
    } else {
      result.errors.push(`integerToWords(0n) threw error: ${error.message}`)
    }
  }

  if (typeof instance.toWords !== 'function') {
    result.errors.push('Missing toWords() method (should be inherited)')
  }
}

/**
 * Validate inheritance chain
 */
function validateInheritance (LanguageClass, result) {
  const validBaseClasses = [
    'AbstractLanguage',
    'GreedyScaleLanguage',
    'HebrewLanguage',
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

  // Direct inheritance
  if (validBaseClasses.includes(baseClassName)) {
    result.info.push(`✓ Extends ${baseClassName}`)
    return
  }

  // Regional variant (e.g., fr-BE extends fr)
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentClassName = grandProto?.name

  if (grandParentClassName && validBaseClasses.includes(grandParentClassName)) {
    result.info.push(`✓ Extends ${baseClassName} (which extends ${grandParentClassName})`)
    return
  }

  result.errors.push(`Unknown base class: ${baseClassName}`)
}

/**
 * Validate scale words (for GreedyScaleLanguage/TurkicLanguage)
 * This validates the scale words array structure and ordering.
 * Note: SouthAsianLanguage also has scaleWords but in a different format.
 */
function validateScaleWords (instance, LanguageClass, result) {
  // Only validate for GreedyScaleLanguage/TurkicLanguage
  const baseClass = getBaseClassName(LanguageClass)
  if (baseClass !== 'GreedyScaleLanguage' && baseClass !== 'TurkicLanguage') return
  if (!('scaleWords' in instance)) return

  const scaleWords = instance.scaleWords

  if (!Array.isArray(scaleWords) || scaleWords.length === 0) {
    result.errors.push('scaleWords should be non-empty array')
    return
  }

  let previousValue = Infinity
  let hasOrderingError = false

  for (let i = 0; i < scaleWords.length; i++) {
    const pair = scaleWords[i]

    if (!Array.isArray(pair) || pair.length !== 2) {
      result.errors.push(`scaleWords[${i}] should be [bigint, string] pair`)
      continue
    }

    const [value, word] = pair

    if (typeof value !== 'bigint') {
      result.errors.push(`scaleWords[${i}][0] should be bigint`)
    }

    if (typeof word !== 'string') {
      result.errors.push(`scaleWords[${i}][1] should be string`)
    }

    // Check descending order
    if (Number(value) >= previousValue && !hasOrderingError) {
      result.errors.push(`scaleWords not in descending order at index ${i}`)
      hasOrderingError = true
    }

    previousValue = Number(value)
  }

  if (!hasOrderingError) {
    result.info.push(`✓ scaleWords properly ordered (${scaleWords.length} entries)`)
  }

  if (!scaleWords.some(pair => pair[0] === 1n)) {
    result.warnings.push('scaleWords missing entry for 1n')
  }
}

/**
 * Get the base class name for a language class
 */
function getBaseClassName (LanguageClass) {
  const proto = Object.getPrototypeOf(LanguageClass)
  const baseClassName = proto?.name

  // Check for regional variants (e.g., fr-BE extends French which extends GreedyScaleLanguage)
  const validBaseClasses = ['AbstractLanguage', 'GreedyScaleLanguage', 'HebrewLanguage', 'SlavicLanguage', 'SouthAsianLanguage', 'TurkicLanguage']
  if (validBaseClasses.includes(baseClassName)) {
    return baseClassName
  }

  // Check grandparent for regional variants
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentClassName = grandProto?.name
  if (validBaseClasses.includes(grandParentClassName)) {
    return grandParentClassName
  }

  return baseClassName
}

/**
 * Validate base-class-specific requirements
 */
function validateBaseClassRequirements (instance, LanguageClass, result) {
  const baseClass = getBaseClassName(LanguageClass)

  switch (baseClass) {
    case 'GreedyScaleLanguage':
    case 'TurkicLanguage': {
      // Must have scaleWords
      if (!('scaleWords' in instance)) {
        result.errors.push(`${baseClass} requires scaleWords array`)
      } else if (!Array.isArray(instance.scaleWords) || instance.scaleWords.length === 0) {
        result.errors.push('scaleWords must be a non-empty array')
      } else {
        result.info.push(`✓ Has scaleWords (${instance.scaleWords.length} entries)`)
      }

      // Check if class overrides integerToWords (allows skipping combineWordSets)
      const hasCustomIntegerToWords = Object.prototype.hasOwnProperty.call(
        LanguageClass.prototype, 'integerToWords'
      )

      if (hasCustomIntegerToWords) {
        // Check if it's an enhancement (calls super) vs full replacement
        const methodSource = LanguageClass.prototype.integerToWords.toString()
        const callsSuper = methodSource.includes('super.integerToWords')

        if (callsSuper) {
          // Enhancement pattern - adds pre/post processing but uses parent algorithm
          result.info.push('✓ Enhances integerToWords() (calls super)')
        } else {
          // Full replacement - doesn't use parent algorithm at all
          result.warnings.push('Overrides integerToWords() - consider AbstractLanguage instead')
        }
        result.info.push('✓ Has custom integerToWords() (combineWordSets validation skipped)')
      } else {
        // Must have combineWordSets method (inherited is ok)
        if (typeof instance.combineWordSets !== 'function') {
          result.errors.push(`${baseClass} requires combineWordSets() method`)
        } else {
          // Smoke test: try combining two simple word-sets
          try {
            const testResult = instance.combineWordSets({ twenty: 20n }, { one: 1n })
            if (typeof testResult !== 'object' || testResult === null) {
              result.errors.push('combineWordSets() must return an object')
            } else {
              const keys = Object.keys(testResult)
              const values = Object.values(testResult)
              if (keys.length !== 1 || typeof values[0] !== 'bigint') {
                result.errors.push('combineWordSets() must return { word: bigint } object')
              } else {
                result.info.push('✓ Has combineWordSets() method (tested)')
              }
            }
          } catch (error) {
            if (error.message.includes('must be implemented by subclass')) {
              result.errors.push('combineWordSets() not implemented (still abstract)')
            } else {
              result.errors.push(`combineWordSets() threw error: ${error.message}`)
            }
          }
        }
      }
      break
    }

    case 'SlavicLanguage': {
      // Check if class overrides integerToWords (allows custom structure)
      const hasCustomIntegerToWords = Object.prototype.hasOwnProperty.call(
        LanguageClass.prototype, 'integerToWords'
      )

      if (hasCustomIntegerToWords) {
        // Custom implementation bypasses base class logic
        // This is common for Hebrew/Biblical Hebrew which use different structures
        result.warnings.push('Overrides integerToWords() - may not need SlavicLanguage base class')
        result.info.push('✓ Has custom integerToWords() (relaxed validation)')

        // Still require onesWords at minimum
        if (!('onesWords' in instance) || typeof instance.onesWords !== 'object') {
          result.errors.push('SlavicLanguage requires onesWords object')
        } else if (Object.keys(instance.onesWords).length === 0) {
          result.errors.push('onesWords must be non-empty')
        } else {
          result.info.push(`✓ Has onesWords (${Object.keys(instance.onesWords).length} entries)`)
        }

        // Validate other properties exist but don't enforce structure
        for (const prop of ['teensWords', 'twentiesWords', 'hundredsWords', 'pluralForms']) {
          if (prop in instance && typeof instance[prop] === 'object') {
            result.info.push(`✓ Has ${prop} (${Object.keys(instance[prop]).length} entries)`)
          }
        }
      } else {
        // Standard SlavicLanguage - enforce full structure
        const requiredDicts = {
          onesWords: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9], desc: 'ones (1-9)' },
          teensWords: { keys: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], desc: 'teens (10-19)' },
          twentiesWords: { keys: [2, 3, 4, 5, 6, 7, 8, 9], desc: 'twenties (20-90)' },
          hundredsWords: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9], desc: 'hundreds (100-900)' }
        }

        for (const [prop, { keys, desc }] of Object.entries(requiredDicts)) {
          if (!(prop in instance)) {
            result.errors.push(`SlavicLanguage requires ${prop} object`)
          } else if (typeof instance[prop] !== 'object') {
            result.errors.push(`${prop} must be an object`)
          } else {
            const missing = keys.filter(k => !(k in instance[prop]))
            if (missing.length > 0) {
              result.errors.push(`${prop} missing keys: ${missing.join(', ')}`)
            } else {
              result.info.push(`✓ Has ${prop} (${desc})`)
            }
          }
        }

        // Optional: onesFeminineWords (only if gender-aware)
        if ('onesFeminineWords' in instance) {
          const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(k => !(k in instance.onesFeminineWords))
          if (missing.length > 0) {
            result.warnings.push(`onesFeminineWords missing keys: ${missing.join(', ')}`)
          } else {
            result.info.push('✓ Has onesFeminineWords (gender support)')
          }
        }

        // pluralForms validation - must be [singular, few, many] triplets
        if (!('pluralForms' in instance)) {
          result.errors.push('SlavicLanguage requires pluralForms object')
        } else if (typeof instance.pluralForms !== 'object') {
          result.errors.push('pluralForms must be an object')
        } else {
          const scales = Object.keys(instance.pluralForms)
          if (scales.length === 0) {
            result.errors.push('pluralForms must be non-empty')
          } else {
            let hasError = false
            for (const scale of scales) {
              const forms = instance.pluralForms[scale]
              if (!Array.isArray(forms) || forms.length !== 3) {
                result.errors.push(`pluralForms[${scale}] must be [singular, few, many] array`)
                hasError = true
              }
            }
            if (!hasError) {
              result.info.push(`✓ Has pluralForms (${scales.length} scale levels)`)
            }
          }
        }
      }
      break
    }

    case 'SouthAsianLanguage': {
      // belowHundredWords validation
      if (!('belowHundredWords' in instance)) {
        result.errors.push('SouthAsianLanguage requires belowHundredWords array')
      } else if (!Array.isArray(instance.belowHundredWords)) {
        result.errors.push('belowHundredWords must be an array')
      } else if (instance.belowHundredWords.length !== 100) {
        result.errors.push(`belowHundredWords must have exactly 100 entries (has ${instance.belowHundredWords.length})`)
      } else {
        // Validate all entries are non-empty strings
        const emptyIndices = instance.belowHundredWords
          .map((w, i) => (typeof w !== 'string' || w === '') ? i : -1)
          .filter(i => i !== -1)
        if (emptyIndices.length > 0) {
          const shown = emptyIndices.slice(0, 5).join(', ')
          const suffix = emptyIndices.length > 5 ? '...' : ''
          result.errors.push(`belowHundredWords has empty/invalid entries at indices: ${shown}${suffix}`)
        } else {
          result.info.push('✓ Has belowHundredWords (100 entries)')
        }
      }

      // hundredWord validation
      if (!('hundredWord' in instance)) {
        result.errors.push('SouthAsianLanguage requires hundredWord property')
      } else if (typeof instance.hundredWord !== 'string' || instance.hundredWord === '') {
        result.errors.push('hundredWord must be a non-empty string')
      } else {
        result.info.push(`✓ Has hundredWord: "${instance.hundredWord}"`)
      }

      // scaleWords validation (different format than GreedyScaleLanguage)
      if (!('scaleWords' in instance)) {
        result.errors.push('SouthAsianLanguage requires scaleWords array')
      } else if (!Array.isArray(instance.scaleWords)) {
        result.errors.push('scaleWords must be an array')
      } else if (instance.scaleWords.length < 2) {
        result.errors.push('scaleWords must have at least 2 entries (empty + thousands)')
      } else {
        result.info.push(`✓ Has scaleWords (${instance.scaleWords.length} scale levels)`)
      }
      break
    }

    case 'HebrewLanguage': {
      // Validate Hebrew-specific properties
      const requiredDicts = ['onesWords', 'teensWords', 'twentiesWords', 'hundredsWords', 'pluralForms', 'scale', 'scalePlural']
      for (const prop of requiredDicts) {
        if (!(prop in instance)) {
          result.errors.push(`HebrewLanguage requires ${prop} property`)
        } else if (typeof instance[prop] !== 'object') {
          result.errors.push(`${prop} must be an object`)
        } else {
          result.info.push(`✓ Has ${prop} (${Object.keys(instance[prop]).length} entries)`)
        }
      }
      break
    }

    case 'AbstractLanguage': {
      // AbstractLanguage just needs integerToWords (already validated elsewhere)
      result.info.push('✓ Direct AbstractLanguage implementation')
      break
    }
  }
}

/**
 * Validate JSDoc documentation
 */
function validateDocumentation (fileContent, className, result) {
  const hasClassDoc = fileContent.includes(`/**\n * ${className}`) ||
                      fileContent.match(/\/\*\*[\s\S]*?language converter/i)

  if (!hasClassDoc) {
    result.warnings.push('Missing class JSDoc documentation')
  } else {
    result.info.push('✓ Has class documentation')
  }

  // Note: combineWordSets() is documented in the abstract base class (GreedyScaleLanguage)
  // Individual implementations don't need to repeat full JSDoc documentation
}

/**
 * Validate imports
 */
function validateImports (fileContent, result) {
  const hasBaseClassImport = fileContent.match(/^import\s+{[^}]+}\s+from\s+['"]\.\.\/classes\//m)
  const languageImportMatch = fileContent.match(/^import\s+{([^}]+)}\s+from\s+['"]\.\/([^'"]+)\.js['"]/m)

  if (!hasBaseClassImport && !languageImportMatch) {
    result.errors.push('Missing import statement from base class or parent language')
    return
  }

  if (hasBaseClassImport) {
    result.info.push('✓ Has proper base class import statement')
  } else if (languageImportMatch) {
    result.info.push('✓ Has proper language import statement (regional variant)')

    // Validate parent language exists
    const parentCode = languageImportMatch[2]
    const parentClass = languageImportMatch[1].trim()

    if (!existsSync(`./lib/languages/${parentCode}.js`)) {
      result.errors.push(`Parent language file not found: ${parentCode}.js`)
    } else {
      result.info.push(`✓ Parent language file exists: ${parentCode}.js`)
    }

    // Validate extends matches import
    const extendsMatch = fileContent.match(/extends\s+(\w+)/)
    if (extendsMatch && extendsMatch[1] !== parentClass) {
      result.warnings.push(`Imports ${parentClass} but extends ${extendsMatch[1]}`)
    } else if (extendsMatch) {
      result.info.push(`✓ Correctly extends ${parentClass}`)
    }
  }

  if (fileContent.match(/from\s+['"](\.\.|\.)\//)) {
    result.info.push('✓ Uses relative imports')
  }
}

/**
 * Validate test fixture exists and tests options if applicable
 */
function validateTestFixture (languageCode, hasOptions, optionProperties, result) {
  const fixtureFile = join('./test/fixtures/languages', `${languageCode}.js`)

  if (!existsSync(fixtureFile)) {
    result.warnings.push(`Missing test fixture: ${fixtureFile}`)
    return
  }

  try {
    const content = readFileSync(fixtureFile, 'utf8')

    if (!content.match(/export default\s*\[/)) {
      result.warnings.push('Test fixture should export default array')
      return
    }

    result.info.push('✓ Has test fixture file')

    // If language has options, verify options are tested in fixtures
    if (hasOptions && optionProperties.length > 0) {
      // Check each option property is tested (dynamically based on typedef)
      const testedOptions = []
      const untestedOptions = []

      for (const prop of optionProperties) {
        if (content.includes(`${prop.name}:`)) {
          testedOptions.push(prop.name)
        } else {
          untestedOptions.push(prop)
        }
      }

      if (testedOptions.length === 0) {
        result.warnings.push('Test fixture has no test cases with options')
        result.warnings.push(`  Add tests like: [1, 'expected', { ${optionProperties[0].name}: ${getExampleValue(optionProperties[0])} }]`)
      } else if (untestedOptions.length > 0) {
        for (const prop of untestedOptions) {
          result.warnings.push(`Option "${prop.name}" not tested in fixture file`)
        }
        result.info.push(`✓ Test fixture includes options tests (${testedOptions.join(', ')})`)
      } else {
        result.info.push('✓ Test fixture includes options tests')
      }
    }
  } catch (error) {
    result.warnings.push(`Could not read test fixture: ${error.message}`)
  }
}

/**
 * Validate type test file includes the converter and tests options if applicable
 */
function validateTypeTest (className, hasOptions, optionProperties, result) {
  const typeTestFile = './test/types/n2words.test-d.ts'
  const converterName = `${className}Converter`

  if (!existsSync(typeTestFile)) {
    result.warnings.push(`Type test file not found: ${typeTestFile}`)
    return
  }

  try {
    const content = readFileSync(typeTestFile, 'utf8')

    // Check if converter is imported
    if (!content.includes(converterName)) {
      result.errors.push(`${converterName} not imported in type test file (${typeTestFile})`)
      return
    }

    result.info.push(`✓ ${converterName} included in type tests`)

    // If language has options, verify options are tested
    if (hasOptions && optionProperties.length > 0) {
      const hasOptionsTest = content.includes(`${converterName}(42, {`) ||
                             content.includes(`${converterName}(42,{`)

      if (!hasOptionsTest) {
        result.warnings.push(`${converterName} has options but no options tests in type test file`)
        result.warnings.push(`  Add tests like: expectType<string>(${converterName}(42, { ${optionProperties[0].name}: ${getExampleValue(optionProperties[0])} }))`)
      } else {
        // Check each option property is tested
        for (const prop of optionProperties) {
          if (!content.includes(`${prop.name}:`)) {
            result.warnings.push(`Option "${prop.name}" not tested in type test file`)
          }
        }
        result.info.push(`✓ ${converterName} options are tested`)
      }
    }
  } catch (error) {
    result.warnings.push(`Could not read type test file: ${error.message}`)
  }
}

/**
 * Get example value for an option property for documentation
 */
function getExampleValue (prop) {
  if (prop.type.includes('masculine') || prop.type.includes('feminine')) {
    return "'masculine'"
  }
  if (prop.type === 'boolean') {
    return 'true'
  }
  if (prop.type === 'string') {
    return "'example'"
  }
  return "'value'"
}

/**
 * Extract typedef from n2words.js
 */
function extractTypedef (className, n2wordsContent) {
  const typedefName = `${className}Options`
  const start = n2wordsContent.indexOf(`@typedef {Object} ${typedefName}`)

  if (start === -1) {
    return { exists: false, properties: [] }
  }

  const end = n2wordsContent.indexOf('*/', start)
  if (end === -1) return { exists: false, properties: [] }

  const typedef = n2wordsContent.substring(start, end)
  const properties = []
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
 * Validate options pattern
 */
function validateOptionsPattern (instance, LanguageClass, className, fileContent, n2wordsContent, result) {
  const hasConstructor = fileContent.includes('constructor')

  // No constructor - check if base class handles options
  if (!hasConstructor) {
    const typedef = extractTypedef(className, n2wordsContent)

    if (typedef.exists) {
      result.info.push('✓ Options handled by base class')
      validateGenderOption(typedef, result)
    }
    return
  }

  // Parse constructor
  const constructorMatch = fileContent.match(/constructor\s*\(([^)]*)\)\s*{([\s\S]*?)(?:\n {2}}\s*(?:\n|$)|\n\}\s*(?:\n|$))/)
  if (!constructorMatch) {
    result.warnings.push('Could not parse constructor')
    return
  }

  const [, params, body] = constructorMatch

  // Check if accepts options
  if (!/options\s*=/.test(params)) {
    return // No options support
  }

  result.info.push('✓ Constructor accepts options parameter')

  if (!body.includes('super(')) {
    result.errors.push('Constructor missing super() call')
    return
  }

  const hasSuperOptions = body.includes('super(options)')
  const hasSetOptions = body.includes('this.setOptions(')

  // Hybrid pattern: passes options to super AND has own setOptions
  if (hasSuperOptions && hasSetOptions) {
    result.info.push('✓ Constructor passes options to super() and adds own options')
    validateOptionsTypedef(className, body, n2wordsContent, result)
    return
  }

  // Regional variant pattern: only passes options to super
  if (hasSuperOptions) {
    result.info.push('✓ Constructor passes options to super() (regional variant)')

    if (body.includes('this.scaleWords')) {
      result.info.push('✓ Constructor mutates scaleWords')
      validateScaleWords(instance, LanguageClass, result) // Re-validate after mutation
    }
    return
  }

  result.info.push('✓ Constructor calls super()')

  // Standard options pattern: only uses setOptions
  if (!hasSetOptions) {
    result.errors.push('Constructor should call this.setOptions() or pass options to super()')
    return
  }

  result.info.push('✓ Constructor uses setOptions()')
  validateOptionsTypedef(className, body, n2wordsContent, result)
}

/**
 * Validate gender option type
 */
function validateGenderOption (typedef, result) {
  const genderProp = typedef.properties.find(p => p.name === 'gender')
  if (!genderProp) return

  const hasEnumType = genderProp.type.includes('masculine') && genderProp.type.includes('feminine')

  if (genderProp.type === 'boolean') {
    result.errors.push('Gender option should use enum type "(\'masculine\'|\'feminine\')", not boolean')
  } else if (!hasEnumType) {
    result.warnings.push('Gender option type should use enum: "(\'masculine\'|\'feminine\')"')
  } else {
    result.info.push('✓ Gender option uses correct enum type')
  }
}

/**
 * Generate typedef snippet for missing options
 */
function generateTypedefSnippet (className, defaults) {
  const lines = [
    '/**',
    ` * @typedef {Object} ${className}Options`
  ]

  for (const def of defaults) {
    const type = inferTypeFromDefault(def.name, def.value)
    const description = inferDescriptionFromName(def.name)
    lines.push(` * @property {${type}} [${def.name}=${def.value}] ${description}`)
  }

  lines.push(' */')
  return lines
}

/**
 * Infer JSDoc type from option name and default value
 */
function inferTypeFromDefault (name, value) {
  if (name === 'gender') {
    return "('masculine'|'feminine')"
  }
  if (value === 'true' || value === 'false') {
    return 'boolean'
  }
  if (value.startsWith("'") || value.startsWith('"')) {
    return 'string'
  }
  return 'string'
}

/**
 * Infer description from option name
 */
function inferDescriptionFromName (name) {
  const descriptions = {
    gender: 'Grammatical gender for number forms',
    negativeWord: 'Word for negative numbers',
    andWord: 'Conjunction word/character',
    formal: 'Use formal/financial numerals',
    ordFlag: 'Enable ordinal number conversion',
    includeOptionalAnd: 'Include optional "and" separator',
    noHundredPairing: 'Disable hundred-pairing (e.g., "twelve hundred")',
    accentOne: 'Use accented form for one',
    withHyphenSeparator: 'Use hyphens instead of spaces',
    dropSpaces: 'Remove spaces between words'
  }
  return descriptions[name] || `Configuration for ${name}`
}

/**
 * Validate options typedef and defaults
 */
function validateOptionsTypedef (className, constructorBody, n2wordsContent, result) {
  // Extract default options from setOptions()
  const mergeMatch = constructorBody.match(/this\.setOptions\(\s*{([^}]*)}/)
  if (!mergeMatch) return

  const defaults = []
  const optionPattern = /(\w+):\s*([^,\n]+)/g
  let match

  while ((match = optionPattern.exec(mergeMatch[1])) !== null) {
    defaults.push({
      name: match[1].trim(),
      value: match[2].trim().replace(/['"]/g, '')
    })
  }

  if (defaults.length === 0) return

  result.info.push(`✓ Default options: ${defaults.map(d => d.name).join(', ')}`)

  // Validate typedef exists
  const typedef = extractTypedef(className, n2wordsContent)

  if (!typedef.exists) {
    result.errors.push(`typedef ${className}Options missing from n2words.js`)
    // Provide actionable snippet
    const snippetLines = generateTypedefSnippet(className, defaults)
    result.errors.push('  Add this typedef to lib/n2words.js (Type Definitions section):')
    snippetLines.forEach(line => result.errors.push(`    ${line}`))
    return
  }

  result.info.push(`✓ Typedef ${className}Options exists`)

  // Extract options accessed in constructor (e.g., options.propertyName)
  const accessedOptions = new Set()
  const accessPattern = /options\.(\w+)/g
  while ((match = accessPattern.exec(constructorBody)) !== null) {
    accessedOptions.add(match[1])
  }

  // Validate options match typedef
  for (const def of defaults) {
    const typedefProp = typedef.properties.find(p => p.name === def.name)

    if (!typedefProp) {
      result.warnings.push(`Option "${def.name}" in constructor but not in typedef`)
      continue
    }

    // Validate gender option
    if (def.name === 'gender') {
      validateGenderOption(typedef, result)

      if (def.value !== 'masculine' && def.value !== 'feminine') {
        result.warnings.push(`Gender default "${def.value}" should be 'masculine' or 'feminine'`)
      }
    }

    // Validate boolean options
    const booleanOptions = ['formal', 'ordFlag', 'includeOptionalAnd', 'noHundredPairing', 'accentOne', 'withHyphenSeparator', 'dropSpaces']
    if (booleanOptions.includes(def.name)) {
      if (typedefProp.type !== 'boolean') {
        result.warnings.push(`Option "${def.name}" should have boolean type`)
      }
      if (def.value !== 'true' && def.value !== 'false') {
        result.warnings.push(`Boolean option "${def.name}" default should be 'true' or 'false'`)
      }
    }

    // Validate string options
    if (['negativeWord', 'andWord'].includes(def.name) && typedefProp.type !== 'string') {
      result.warnings.push(`Option "${def.name}" should have string type`)
    }
  }

  // Check for typedef properties not handled in constructor
  for (const prop of typedef.properties) {
    const inDefaults = defaults.find(d => d.name === prop.name)
    const isAccessed = accessedOptions.has(prop.name)

    if (!inDefaults && !isAccessed) {
      result.warnings.push(`Option "${prop.name}" in typedef but not used in constructor`)
    }
  }

  // Validate converter type annotation
  const converterName = `${className}Converter`
  const pattern = new RegExp(
    `const\\s+${converterName}\\s*=\\s*\\/\\*\\*\\s*@type\\s*{\\(value: NumericValue, options\\?: ${className}Options\\) => string}\\s*\\*\\/`
  )

  if (!pattern.test(n2wordsContent)) {
    result.errors.push(`${converterName} missing type annotation with options`)
    result.errors.push('  Update converter declaration in lib/n2words.js (Language Converters section):')
    result.errors.push(`    const ${converterName} = /** @type {(value: NumericValue, options?: ${className}Options) => string} */ (makeConverter(${className}))`)
  } else {
    result.info.push(`✓ ${converterName} has correct type annotation`)
  }
}

/**
 * Validate n2words.js registration
 */
function validateN2wordsExport (languageCode, className, n2wordsContent, result) {
  const converterName = `${className}Converter`

  // Check import
  const importPattern = new RegExp(`import\\s+{\\s*${className}\\s*}\\s+from\\s+['"]\\./languages/${languageCode}\\.js['"]`)
  if (!importPattern.test(n2wordsContent)) {
    result.errors.push('Not imported in n2words.js')
  }

  // Check converter creation
  const converterPattern = new RegExp(
    `const\\s+${converterName}\\s*=\\s*\\/\\*\\*\\s*@type\\s*{[^}]+}\\s*\\*\\/\\s*\\(\\s*makeConverter\\(${className}\\)\\s*\\)`
  )
  if (!converterPattern.test(n2wordsContent)) {
    result.errors.push(`${converterName} not created with makeConverter()`)
  }

  // Check export
  const exportSection = n2wordsContent.match(/export\s*{[\s\S]*?}/)?.[0]
  if (!exportSection || !exportSection.includes(converterName)) {
    result.errors.push(`${converterName} not exported`)
  }

  if (importPattern.test(n2wordsContent) && converterPattern.test(n2wordsContent) && exportSection?.includes(converterName)) {
    result.info.push(`✓ Properly registered in n2words.js as ${converterName}`)
  }
}

/**
 * Perform all validations for a language
 */
async function performValidations (languageCode, className, LanguageClass, fileContent, n2wordsContent, result) {
  validateClassStructure(LanguageClass, className, result)

  const instance = new LanguageClass()
  validateRequiredProperties(instance, result)
  validateMethods(instance, result)
  validateInheritance(LanguageClass, result)
  validateScaleWords(instance, LanguageClass, result)
  validateBaseClassRequirements(instance, LanguageClass, result)
  validateDocumentation(fileContent, className, result)
  validateImports(fileContent, result)
  validateOptionsPattern(instance, LanguageClass, className, fileContent, n2wordsContent, result)

  // Extract options info for fixture and type test validation
  const typedef = extractTypedef(className, n2wordsContent)
  validateTestFixture(languageCode, typedef.exists, typedef.properties, result)
  validateTypeTest(className, typedef.exists, typedef.properties, result)

  validateN2wordsExport(languageCode, className, n2wordsContent, result)
}

/**
 * Validate a single language implementation
 * @param {string} languageCode IETF language code (e.g., 'en', 'fr-BE')
 * @returns {Promise<ValidationResult>}
 */
export async function validateLanguage (languageCode) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  }

  const languageFile = join('./lib/languages', `${languageCode}.js`)

  if (!existsSync(languageFile)) {
    result.errors.push(`Language file not found: ${languageFile}`)
    result.valid = false
    return result
  }

  validateFileNaming(languageCode, result)

  const expectedClassName = getExpectedClassName(languageCode)
  const fileContent = readFileSync(languageFile, 'utf8')
  const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')

  try {
    const languageModule = await import(pathToFileURL(languageFile).href)

    // Determine class name (CLDR or first exported class)
    let className = expectedClassName
    let LanguageClass = languageModule[className]

    if (!className || !LanguageClass) {
      const exportedClasses = Object.keys(languageModule).filter(key =>
        typeof languageModule[key] === 'function' && languageModule[key].prototype
      )

      if (exportedClasses.length === 0) {
        result.errors.push('No class exported from file')
        result.valid = false
        return result
      }

      className = exportedClasses[0]
      LanguageClass = languageModule[className]

      if (!expectedClassName) {
        result.warnings.push(`CLDR does not provide display name for ${languageCode}`)
        result.info.push(`✓ Found class: ${className} (descriptive name for rare language)`)
      }
    } else {
      result.info.push(`✓ CLDR expected class name: ${className}`)
    }

    await performValidations(languageCode, className, LanguageClass, fileContent, n2wordsContent, result)
  } catch (error) {
    result.errors.push(`Failed to load language module: ${error.message}`)
    result.valid = false
  }

  result.valid = result.errors.length === 0
  return result
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Display validation results
 * @param {string} languageCode Language code being validated
 * @param {object} result Validation result object
 * @param {boolean} verbose Show detailed info messages
 * @param {boolean} showAll Show all results including clean passes (default: true)
 * @returns {boolean} Whether output was displayed
 */
export function displayResults (languageCode, result, verbose = false, showAll = true) {
  // Skip display if clean pass and not showing all
  if (!showAll && result.valid && result.warnings.length === 0) {
    return false
  }

  const header = result.valid
    ? (result.warnings.length > 0 ? chalk.yellow(`⚠ ${languageCode}`) : chalk.green(`✓ ${languageCode}`))
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

  return true
}

/**
 * Run validation for specified languages
 */
export async function runValidation (languageCodes = [], verbose = false) {
  console.log(chalk.cyan.bold('n2words Language Validator'))

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
  let totalWarnings = 0

  for (const code of languageCodes) {
    const result = await validateLanguage(code)
    results[code] = result

    if (result.valid) {
      totalValid++
      if (result.warnings.length > 0) {
        totalWarnings++
      }
    } else {
      totalInvalid++
    }

    // In default mode, only show failures/warnings; in verbose mode, show all
    displayResults(code, result, verbose, verbose)
  }

  // Summary
  console.log('\n' + chalk.bold('Summary:'))
  console.log('  ' + chalk.green(`Valid: ${totalValid}`))
  if (totalWarnings > 0) {
    console.log('  ' + chalk.yellow(`With warnings: ${totalWarnings}`))
  }
  if (totalInvalid > 0) {
    console.log('  ' + chalk.red(`Invalid: ${totalInvalid}`))
  }
  console.log(`  Total: ${languageCodes.length}`)

  // Success message when all pass with no warnings
  if (totalInvalid === 0 && totalWarnings === 0) {
    console.log(chalk.green('\nAll languages valid ✓'))
  }

  return { results, totalValid, totalInvalid, totalWarnings }
}

// Only run CLI if executed directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))

if (isMainModule) {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose') || args.includes('-v')
  const languages = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'))

  runValidation(languages, verbose).then(({ totalInvalid }) => {
    if (totalInvalid > 0) {
      process.exit(1)
    }
  }).catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}
