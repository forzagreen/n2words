/**
 * Interactive CLI example for n2words with dynamic imports
 *
 * This script demonstrates how to use n2words with dynamic imports by:
 * 1. Prompting the user to select a language
 * 2. Dynamically importing the language-specific converter at runtime
 * 3. Converting a number to words in the selected language
 *
 * Benefits of dynamic imports:
 * - Only loads the selected language (reduces memory footprint)
 * - Useful for CLI tools, servers, and lazy-loading scenarios
 * - Allows runtime language selection without bundling all languages
 *
 * Usage: node examples/node-dynamic-import.js
 *
 * Example interaction:
 *   Language to use? en
 *   Value to convert? 123
 *   Output: one hundred and twenty-three
 */

import chalk from 'chalk'
import * as fs from 'node:fs'
import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline/promises'

// Create readline interface for user input
const rl = readline.createInterface({ input, output })

// Prompt user to select a language code (e.g., 'en', 'fr', 'de')
const lang = await rl.question(chalk.cyan('\nLanguage to use?\n') + chalk.gray('> '))

// Verify the language file exists before attempting to load it
if (fs.existsSync('./lib/languages/' + lang + '.js')) {
  // Prompt user for the numeric value to convert
  const value = await rl.question(chalk.cyan('\nValue to convert?\n') + chalk.gray('> '))

  // Dynamically import the main n2words module and use the factory pattern
  // This is more robust than importing individual language files directly
  const { default: n2words } = await import('../lib/n2words.js')

  // Convert the value to words using the selected language
  const result = n2words(value, { lang })

  // Display the result with bold formatting for emphasis
  console.log('\n' + chalk.green('✓') + ' ' + chalk.bold(result) + '\n')
} else {
  // Provide helpful error message if language file doesn't exist
  console.error(
    chalk.red('\n✗ Error: Language file does not exist: ') + chalk.yellow(lang + '.js') + '\n'
  )
}

// Clean up readline interface
rl.close()
