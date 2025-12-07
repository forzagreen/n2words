import Benchmark from 'benchmark'
import { existsSync, readdirSync } from 'node:fs'
import chalk from 'chalk'

const suite = new Benchmark.Suite()

// Parse CLI arguments
const arguments_ = process.argv
arguments_.slice(2)

// Default argument values
let i18n
let value = Number.MAX_SAFE_INTEGER

// Look for matching CLI arguments
for (let index = 1; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    i18n = arguments_[index + 1]
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  }
}

// If language is defined
if (i18n) {
  // Check if language file exists
  if (existsSync('./lib/i18n/' + i18n + '.js')) {
    // Queue specific language benchmark
    await benchFile('i18n/' + i18n)
  } else {
    // Log error to console
    console.error(chalk.red('\ni18n language file does not exist: ' + i18n + '.js\n'))
  }
} else {
  // Load all files in language directory
  const files = readdirSync('./lib/i18n')

  // Loop through files
  for (const file of files) {
    // Make sure file is JavaScript
    if (file.includes('.js')) {
      // Queue language file benchmark
      await benchFile('i18n/' + file.replace('.js', ''))
    }
  }
}

// Log output to console and run queued benchmarks
suite
  .on('cycle', event => {
    console.log(String(event.target))
  })
  .run()

/**
 * Queue language test file for benchmarking.
 * @param {string} file Library file.
 * @param {object} options Options for language file.
 */
async function benchFile (file, options) {
  const { default: n2words } = await import('./lib/' + file + '.js')

  suite.add(file, async () => {
    n2words(value, options)
  })
}
