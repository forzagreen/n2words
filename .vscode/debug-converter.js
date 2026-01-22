#!/usr/bin/env node

/**
 * Debug harness for testing language converters.
 *
 * Usage (via VSCode launch.json):
 *   - "Debug Language Converter" - Uses default test cases
 *   - "Debug Language Converter (Custom Numbers)" - Prompts for custom numbers
 *
 * Usage (command line):
 *   node .vscode/debug-converter.js en-US                # Test with default cases
 *   node .vscode/debug-converter.js en-US 42             # Test specific number
 *   node .vscode/debug-converter.js en-US 42 -100 3.14   # Test multiple numbers
 *   node .vscode/debug-converter.js en-US "42 -100 3.14" # Space-separated string also works
 *   node .vscode/debug-converter.js zh-Hans
 */

import { getLanguageCodes } from '../test/helpers/language-helpers.js'

const langCode = process.argv[2] || 'en-US'
// Handle both command-line args and VSCode input (which may be a single space-separated string)
let customNumbers = process.argv.slice(3)
if (customNumbers.length === 1 && customNumbers[0].includes(' ')) {
  // Split space-separated string from VSCode prompt
  customNumbers = customNumbers[0].trim().split(/\s+/).filter(Boolean)
} else if (customNumbers.length === 1 && customNumbers[0] === '') {
  // Empty string from VSCode prompt - use default test cases
  customNumbers = []
}

// Load the language module dynamically
let module
try {
  module = await import(`../src/${langCode}.js`)
} catch {
  console.error(`Language not found: ${langCode}`)
  console.log('\nAvailable language codes:')
  const codes = getLanguageCodes().sort()
  codes.forEach(code => console.log(`  - ${code}`))
  process.exit(1)
}

// Get available functions
const functions = ['toCardinal', 'toOrdinal'].filter(fn => module[fn])

if (functions.length === 0) {
  console.error(`No converter functions found in ${langCode}`)
  process.exit(1)
}

console.log(`Testing ${langCode}`)
console.log(`Functions: ${functions.join(', ')}\n`)

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

// Test each function
for (const fnName of functions) {
  const fn = module[fnName]
  console.log(`--- ${fnName} ---`)

  for (const testCase of testCases) {
    // Skip invalid inputs for ordinal (negative, decimal)
    if (fnName === 'toOrdinal') {
      if (typeof testCase === 'number' && (testCase < 0 || !Number.isInteger(testCase))) {
        console.log(`${String(testCase).padStart(20)} → (skipped - ordinal requires positive integer)`)
        continue
      }
    }

    try {
      const result = fn(testCase)
      console.log(`${String(testCase).padStart(20)} → ${result}`)
    } catch (err) {
      console.log(`${String(testCase).padStart(20)} → Error: ${err.message}`)
    }
  }
  console.log()
}

console.log('Debug complete. Set breakpoints in language files to step through conversion.')
