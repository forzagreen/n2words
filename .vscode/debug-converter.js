#!/usr/bin/env node

/**
 * Debug harness for testing language converters.
 *
 * Usage (via launch.json):
 *   Select "Debug Language Converter" and enter language code when prompted
 *
 * Usage (command line):
 *   node .vscode/debug-converter.js en
 *   node .vscode/debug-converter.js zh-Hans
 *   node .vscode/debug-converter.js EnglishConverter  # Also accepts converter names
 */

import { pathToFileURL } from 'node:url'
import * as n2words from '../lib/n2words.js'

const input = process.argv[2] || 'en'
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

// Test cases - set breakpoints here to debug conversion logic
const testCases = [
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

for (const input of testCases) {
  const result = converter(input)
  console.log(`${String(input).padStart(20)} → ${result}`)
}

console.log('\nDebug complete. Set breakpoints in language files to step through conversion.')
