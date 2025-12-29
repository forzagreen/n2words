#!/usr/bin/env node

/**
 * Debug harness for testing language converters.
 *
 * Usage (via VSCode launch.json):
 *   - "Debug Language Converter" - Uses default test cases
 *   - "Debug Language Converter (Custom Numbers)" - Prompts for custom numbers
 *
 * Usage (command line):
 *   node .vscode/debug-converter.js en                 # Test with default cases
 *   node .vscode/debug-converter.js en 42              # Test specific number
 *   node .vscode/debug-converter.js en 42 -100 3.14    # Test multiple numbers
 *   node .vscode/debug-converter.js en "42 -100 3.14"  # Space-separated string also works
 *   node .vscode/debug-converter.js zh-Hans
 *   node .vscode/debug-converter.js EnglishConverter   # Also accepts converter names
 */

import { pathToFileURL } from 'node:url'
import * as n2words from '../lib/n2words.js'

const input = process.argv[2] || 'en'
// Handle both command-line args and VSCode input (which may be a single space-separated string)
let customNumbers = process.argv.slice(3)
if (customNumbers.length === 1 && customNumbers[0].includes(' ')) {
  // Split space-separated string from VSCode prompt
  customNumbers = customNumbers[0].trim().split(/\s+/).filter(Boolean)
} else if (customNumbers.length === 1 && customNumbers[0] === '') {
  // Empty string from VSCode prompt - use default test cases
  customNumbers = []
}
let converterName = input
let converter = n2words[converterName]

// If not found directly, try to resolve from language code
if (!converter) {
  try {
    // Import the language file to get the class name
    const languageModule = await import(pathToFileURL(`./lib/languages/${input}.js`).href)
    const LanguageClass = Object.values(languageModule)[0]

    if (LanguageClass && typeof LanguageClass === 'function') {
      converterName = `${LanguageClass.name}Converter`
      converter = n2words[converterName]
    }
  } catch (error) {
    // File doesn't exist or other error
  }
}

if (!converter) {
  console.error(`Converter not found: ${input}`)
  console.log('\nAvailable language codes:')
  const fs = await import('node:fs')
  const files = fs.readdirSync('./lib/languages')
    .filter(f => f.endsWith('.js') && !f.endsWith('.d.ts'))
    .map(f => f.replace('.js', ''))
    .sort()

  files.forEach(code => console.log(`  - ${code}`))

  console.log('\nOr use converter names directly:')
  Object.keys(n2words)
    .filter(key => key.endsWith('Converter'))
    .sort()
    .slice(0, 5)
    .forEach(name => console.log(`  - ${name}`))
  console.log(`  ... and ${Object.keys(n2words).filter(key => key.endsWith('Converter')).length - 5} more`)

  process.exit(1)
}

console.log(`Testing ${converterName}\n`)

// Parse custom numbers or use default test cases
let testCases
if (customNumbers.length > 0) {
  testCases = customNumbers.map(num => {
    // Try to parse as BigInt if it looks like a BigInt literal or very large number
    if (num.toLowerCase().endsWith('n')) {
      return BigInt(num.slice(0, -1))
    }

    // Check if it's a valid number
    const parsed = Number(num)
    if (isNaN(parsed)) {
      console.warn(`Warning: "${num}" is not a valid number, using as string`)
      return num
    }

    // Use BigInt for integers outside safe integer range
    if (Number.isInteger(parsed) && Math.abs(parsed) > Number.MAX_SAFE_INTEGER) {
      return BigInt(Math.trunc(parsed))
    }

    return parsed
  })
  console.log('Testing custom numbers...\n')
} else {
  // Default test cases - set breakpoints here to debug conversion logic
  testCases = [
    0,
    1,
    42,
    100,
    1234,
    1000000,
    -42,
    3.14,
    BigInt('9007199254740992')
  ]
  console.log('Testing default cases...\n')
}

for (const testCase of testCases) {
  const result = converter(testCase)
  console.log(`${String(testCase).padStart(20)} → ${result}`)
}

console.log('\nDebug complete. Set breakpoints in language files to step through conversion.')
