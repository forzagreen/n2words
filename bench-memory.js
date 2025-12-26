/**
 * Memory usage benchmark script for n2words library.
 *
 * Measures memory allocation across all 48 languages or specific languages.
 * Tracks heap usage, external memory, and per-iteration overhead.
 * Requires --expose-gc flag for accurate garbage collection measurements.
 *
 * Usage:
 *   npm run bench:memory                                   # Benchmark all languages
 *   npm run bench:memory -- --lang en                      # Benchmark English only
 *   npm run bench:memory -- --save --compare               # Track memory changes
 *   npm run bench:memory -- --iterations 10000 --value 42  # Custom test
 */
import { existsSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'

const resultsFile = join('.', 'bench-memory-results.json')
const arguments_ = process.argv.slice(2)

let language
let value = Number.MAX_SAFE_INTEGER
let iterations = 1000
let saveResults = false
let compareResults = false

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    language = arguments_[index + 1]?.toLowerCase()
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  } else if (arguments_[index] === '--iterations') {
    iterations = Number(arguments_[index + 1])
  } else if (arguments_[index] === '--save') {
    saveResults = true
  } else if (arguments_[index] === '--compare') {
    compareResults = true
  } else if (arguments_[index] === '--help') {
    displayHelp()
    process.exit(0)
  }
}

const results = []

if (language) {
  if (existsSync('./lib/languages/' + language + '.js')) {
    await benchMemory('languages/' + language, language)
  } else {
    console.error(chalk.red('\n✗ Language file does not exist: ' + language + '.js\n'))
    process.exit(1)
  }
} else {
  const files = readdirSync('./lib/languages')

  console.log(chalk.cyan.bold('Memory Benchmark\n'))
  console.log(chalk.gray(`Testing ${files.length} languages with ${iterations} iterations each...`))
  console.log(chalk.gray(`Value: ${value}\n`))

  for (const file of files) {
    if (file.endsWith('.js')) {
      await benchMemory('languages/' + file.replace('.js', ''), file.replace('.js', ''))
    }
  }
}

displayResults()

if (saveResults) {
  const output = {
    timestamp: new Date().toISOString(),
    value,
    iterations,
    results: results.map(r => ({
      name: r.name,
      heapUsed: r.heapUsed,
      external: r.external,
      arrayBuffers: r.arrayBuffers,
      totalAllocated: r.totalAllocated,
      perIteration: r.perIteration
    }))
  }

  writeFileSync(resultsFile, JSON.stringify(output, null, 2))
  console.log(chalk.blue('\n✓ Results saved to bench-memory-results.json'))
}

if (compareResults && existsSync(resultsFile)) {
  try {
    const previousResults = JSON.parse(readFileSync(resultsFile, 'utf8'))
    console.log(chalk.cyan.bold('\n📊 Comparison with previous run:'))
    console.log(chalk.gray(`Previous run: ${previousResults.timestamp}`))
    console.log()

    for (const current of results) {
      const previous = previousResults.results.find(r => r.name === current.name)
      if (previous) {
        const diff = ((current.totalAllocated - previous.totalAllocated) / previous.totalAllocated) * 100
        const symbol = diff < 0 ? chalk.green('↓') : chalk.red('↑')
        const diffColor = diff < 0 ? chalk.green : chalk.red
        const diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`
        console.log(`${chalk.gray(current.name.padEnd(15))} ${symbol} ${diffColor(diffText.padStart(8))} (${formatBytes(current.totalAllocated - previous.totalAllocated)})`)
      }
    }
  } catch {
    console.error(chalk.red('\n✗ Could not read previous results'))
  }
}

/**
 * Benchmark memory usage for a specific language converter.
 *
 * Measures memory allocation by:
 * 1. Running garbage collection (if available)
 * 2. Taking baseline memory measurement
 * 3. Importing language module
 * 4. Running N iterations of conversion
 * 5. Measuring memory delta
 *
 * @param {string} file Library file path (relative to lib/).
 * @param {string} name Display name for the language.
 * @throws {Error} If language class cannot be found in the module.
 */
async function benchMemory (file, name) {
  // Force garbage collection for more accurate baseline
  if (global.gc) {
    global.gc()
  }

  // Allow GC to complete
  await new Promise(resolve => setTimeout(resolve, 100))

  const baseline = process.memoryUsage()
  const languageModule = await import('./lib/' + file + '.js')

  // Get the first exported class from the module
  // Language files export a single class (e.g., export class English)
  const LanguageClass = Object.values(languageModule)[0]

  if (!LanguageClass || typeof LanguageClass !== 'function') {
    throw new Error(`Language class not found for file: ${file}`)
  }

  // Run conversions and collect outputs (prevents optimization)
  const outputs = []
  for (let index = 0; index < iterations; index++) {
    const converter = new LanguageClass()
    outputs.push(converter.convertToWords(value))
  }

  const afterTest = process.memoryUsage()

  // Calculate memory deltas
  const heapUsed = afterTest.heapUsed - baseline.heapUsed
  const external = afterTest.external - baseline.external
  const arrayBuffers = afterTest.arrayBuffers - baseline.arrayBuffers
  const totalAllocated = heapUsed + external
  const perIteration = totalAllocated / iterations

  results.push({
    name,
    heapUsed,
    external,
    arrayBuffers,
    totalAllocated,
    perIteration,
    iterations
  })

  // Sanity check
  if (outputs.length !== iterations) {
    console.error(chalk.red(`✗ Warning: Unexpected output count for ${name}`))
  }
}

/**
 * Display benchmark results.
 */
function displayResults () {
  console.log(chalk.cyan.bold('\nMemory Usage Results:\n'))

  results.sort((a, b) => a.name.localeCompare(b.name))
  const best = results.reduce((min, curr) => curr.totalAllocated < min.totalAllocated ? curr : min)

  for (const result of results) {
    const isBest = result === best
    const nameColor = isBest ? chalk.green.bold : chalk.gray
    const sizeColor = isBest ? chalk.green : chalk.white

    console.log(
      nameColor(result.name.padEnd(15)) +
      ' │ ' +
      sizeColor(formatBytes(result.totalAllocated).padStart(12)) +
      chalk.gray(' total') +
      ' │ ' +
      chalk.gray(formatBytes(result.perIteration).padStart(10)) +
      chalk.gray(' per iteration')
    )
  }

  console.log(chalk.gray('\n' + '─'.repeat(65)))
  console.log(chalk.green('Lowest memory: ' + best.name))

  const worst = results[results.length - 1]
  const increase = ((worst.totalAllocated - best.totalAllocated) / best.totalAllocated) * 100
  console.log(chalk.gray(`Range: ${formatBytes(best.totalAllocated)} to ${formatBytes(worst.totalAllocated)} (+${increase.toFixed(1)}%)`))
}

/**
 * Format bytes to human-readable string with appropriate units.
 *
 * @param {number} bytes Number of bytes (can be negative).
 * @returns {string} Formatted string with units (B, KB, MB, GB).
 */
function formatBytes (bytes) {
  const absBytes = Math.abs(bytes)
  const sign = bytes < 0 ? '-' : ''

  if (absBytes < 1024) {
    return sign + absBytes + ' B'
  } else if (absBytes < 1024 * 1024) {
    return sign + (absBytes / 1024).toFixed(2) + ' KB'
  } else if (absBytes < 1024 * 1024 * 1024) {
    return sign + (absBytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return sign + (absBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

/**
 * Display benchmark script usage information.
 */
function displayHelp () {
  console.log(chalk.cyan.bold('Memory Benchmark Script Usage:\n'))
  console.log('  ' + chalk.yellow('npm run bench:memory') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--iterations') + ' <number>        Number of iterations (default: 1000)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to bench-memory-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:memory                                   # Benchmark all languages'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en                      # Benchmark English only'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --value 42 --iterations 10000  # Custom test'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --save --compare               # Track changes over time'))
  console.log()
  console.log(chalk.yellow.bold('Note:') + chalk.gray(' For more accurate results, run with: ') + chalk.cyan('node --expose-gc bench-memory.js'))
  console.log()
}
