/**
 * Memory usage benchmark script for n2words library.
 *
 * Measures memory allocation across all languages or specific languages.
 * Tracks heap usage, external memory, and per-iteration overhead.
 * Requires --expose-gc flag for accurate garbage collection measurements.
 *
 * Usage:
 *   npm run bench:memory                                   # Benchmark all languages
 *   npm run bench:memory -- --lang en                      # Benchmark English only
 *   npm run bench:memory -- --lang en,es,fr                # Multiple languages (comma-separated)
 *   npm run bench:memory -- --save --compare               # Track memory changes
 *   npm run bench:memory -- --lang en --history            # Show memory history for English
 *   npm run bench:memory -- --iterations 10000 --value 42  # Custom test
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'
import { homedir } from 'node:os'
import * as n2words from '../lib/n2words.js'
import { getConvertersByCode } from '../test/utils/language-helpers.js'

// Store results in persistent location outside project
const benchDir = join(homedir(), '.n2words-bench')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'memory-results.json')

// Build converter map keyed by language code
const converters = getConvertersByCode(n2words)

const arguments_ = process.argv.slice(2)

const languages = []
let value = Number.MAX_SAFE_INTEGER
let iterations = 1000
let saveResults = false
let compareResults = false
let showHistory = false
let previousResults = null

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    const lang = arguments_[index + 1]?.toLowerCase()
    if (lang) {
      // Support comma-separated languages: --lang en,es,fr
      const langs = lang.split(',').map(l => l.trim()).filter(Boolean)
      languages.push(...langs)
    }
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  } else if (arguments_[index] === '--iterations') {
    iterations = Number(arguments_[index + 1])
  } else if (arguments_[index] === '--save') {
    saveResults = true
  } else if (arguments_[index] === '--compare') {
    compareResults = true
  } else if (arguments_[index] === '--history') {
    showHistory = true
  } else if (arguments_[index] === '--help') {
    displayHelp()
    process.exit(0)
  }
}

// Load previous results if comparing
if (compareResults) {
  if (!existsSync(resultsFile)) {
    console.log(chalk.yellow('⚠ No previous results found. Run with --save first to enable comparison.\n'))
    compareResults = false
  } else {
    try {
      const historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
      if (historyData.history && historyData.history.length > 0) {
        previousResults = historyData.history[historyData.history.length - 1]
      } else {
        console.log(chalk.yellow('⚠ No previous results found. Run with --save first to enable comparison.\n'))
        compareResults = false
      }
    } catch {
      console.log(chalk.yellow('⚠ Could not read previous results for comparison\n'))
      compareResults = false
    }
  }
}

const results = []

// Display header
console.log(chalk.cyan.bold('\nMemory Benchmark\n'))

// Show history only (skip benchmarking)
if (showHistory) {
  if (languages.length !== 1) {
    console.error(chalk.red('✗ --history requires exactly one language (use --lang <code>)\n'))
    process.exit(1)
  }

  if (!existsSync(resultsFile)) {
    console.error(chalk.red('✗ No history found. Run with --save to start tracking history.\n'))
    process.exit(1)
  }

  try {
    const historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
    const history = historyData.history || []
    const langHistory = history.filter(run => {
      const langResult = run.results.find(r => r.name === languages[0])
      return langResult !== undefined
    }).slice(-10) // Last 10 runs

    if (langHistory.length === 0) {
      console.error(chalk.red(`✗ No history found for language: ${languages[0]}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`📈 Memory History for ${languages[0]} (last 10 runs):\n`))
    console.log(chalk.gray('Date'.padEnd(20)) + ' │ ' + chalk.gray('Total'.padStart(12)) + ' │ ' + chalk.gray('Per Iteration'.padStart(12)) + ' │ ' + chalk.gray('Change'.padStart(10)))
    console.log(chalk.gray('─'.repeat(70)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const langResult = run.results.find(r => r.name === languages[0])
      const date = new Date(run.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const total = formatBytes(langResult.totalAllocated)
      const perIter = formatBytes(langResult.perIteration)

      let changePart = ''
      if (i > 0) {
        const prevResult = langHistory[i - 1].results.find(r => r.name === languages[0])
        const diff = ((langResult.totalAllocated - prevResult.totalAllocated) / prevResult.totalAllocated) * 100
        const symbol = diff < 0 ? '↓' : diff > 0 ? '↑' : '='
        const diffColor = diff < 0 ? chalk.green : diff > 0 ? chalk.red : chalk.gray
        const diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`
        changePart = diffColor(`${symbol} ${diffText}`.padStart(10))
      } else {
        changePart = chalk.gray('baseline'.padStart(10))
      }

      console.log(
        chalk.gray(date.padEnd(20)) +
        ' │ ' +
        chalk.white(total.padStart(12)) +
        ' │ ' +
        chalk.gray(perIter.padStart(12)) +
        ' │ ' +
        changePart
      )
    }
    console.log()
  } catch (error) {
    console.error(chalk.red('✗ Error reading history file\n'))
    process.exit(1)
  }
  process.exit(0)
}

// Get language codes to benchmark
const allCodes = Object.keys(converters)
const codesToBenchmark = languages.length > 0 ? languages : allCodes

if (languages.length > 0) {
  // Validate requested languages exist
  for (const code of languages) {
    if (!converters[code]) {
      console.error(chalk.red(`✗ Language not found: ${code}`))
      process.exit(1)
    }
  }
  console.log(chalk.gray(`Benchmarking: ${languages.join(', ')}`))
} else {
  console.log(chalk.gray(`Testing ${allCodes.length} languages`))
}
console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
console.log(chalk.gray(`Iterations: ${iterations.toLocaleString()}${languages.length === 0 ? ' per language' : ''}\n`))

for (const code of codesToBenchmark) {
  await benchMemory(code)
}

displayResults()

if (saveResults) {
  const currentRun = {
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

  // Load existing history or create new
  let historyData = { history: [] }
  if (existsSync(resultsFile)) {
    try {
      historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
    } catch {
      // Start fresh if file is corrupted
    }
  }

  // Add current run to history
  historyData.history.push(currentRun)

  // Keep last 100 runs
  if (historyData.history.length > 100) {
    historyData.history = historyData.history.slice(-100)
  }

  writeFileSync(resultsFile, JSON.stringify(historyData, null, 2))
  console.log(chalk.blue('\n✓ Results saved to ~/.n2words-bench/memory-results.json'))
}

console.log() // Final newline

/**
 * Benchmark memory usage for a specific language converter.
 *
 * Measures memory allocation by:
 * 1. Running garbage collection (if available)
 * 2. Taking baseline memory measurement
 * 3. Running N iterations of converter function
 * 4. Measuring memory delta
 *
 * @param {string} code Language code (e.g., 'en', 'es', 'zh-Hans').
 */
async function benchMemory (code) {
  const converter = converters[code]

  // Force garbage collection for more accurate baseline
  if (global.gc) {
    global.gc()
  }

  // Allow GC to complete
  await new Promise(resolve => setTimeout(resolve, 100))

  const baseline = process.memoryUsage()

  // Run conversions and collect outputs (prevents optimization)
  const outputs = []
  for (let index = 0; index < iterations; index++) {
    outputs.push(converter(value))
  }

  const afterTest = process.memoryUsage()

  // Calculate memory deltas
  const heapUsed = afterTest.heapUsed - baseline.heapUsed
  const external = afterTest.external - baseline.external
  const arrayBuffers = afterTest.arrayBuffers - baseline.arrayBuffers
  const totalAllocated = heapUsed + external
  const perIteration = totalAllocated / iterations

  results.push({
    name: code,
    heapUsed,
    external,
    arrayBuffers,
    totalAllocated,
    perIteration,
    iterations
  })

  // Sanity check
  if (outputs.length !== iterations) {
    console.error(chalk.red(`✗ Warning: Unexpected output count for ${code}`))
  }
}

/**
 * Display benchmark results.
 */
function displayResults () {
  results.sort((a, b) => a.name.localeCompare(b.name))
  const best = results.reduce((min, curr) => curr.totalAllocated < min.totalAllocated ? curr : min)
  const worst = results.reduce((max, curr) => curr.totalAllocated > max.totalAllocated ? curr : max)

  // Print table header
  if (compareResults && previousResults) {
    console.log(
      chalk.cyan.bold('Language'.padEnd(15)) +
      ' │ ' +
      chalk.cyan.bold('Total'.padStart(12)) +
      ' │ ' +
      chalk.cyan.bold('Per Iteration'.padStart(12)) +
      ' │ ' +
      chalk.cyan.bold('Change'.padStart(10))
    )
    console.log(chalk.gray('─'.repeat(70)))
  } else {
    console.log(
      chalk.cyan.bold('Language'.padEnd(15)) +
      ' │ ' +
      chalk.cyan.bold('Total'.padStart(12)) +
      ' │ ' +
      chalk.cyan.bold('Per Iteration'.padStart(12))
    )
    console.log(chalk.gray('─'.repeat(60)))
  }

  for (const result of results) {
    const isBest = result === best && results.length > 1
    const nameColor = isBest ? chalk.green.bold : chalk.gray
    const sizeColor = isBest ? chalk.green : chalk.white

    let changePart = ''
    if (compareResults && previousResults) {
      const previous = previousResults.results.find(r => r.name === result.name)
      if (previous) {
        const diff = ((result.totalAllocated - previous.totalAllocated) / previous.totalAllocated) * 100
        const symbol = diff < 0 ? '↓' : diff > 0 ? '↑' : '='
        const diffColor = diff < 0 ? chalk.green : diff > 0 ? chalk.red : chalk.gray
        const diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`
        changePart = ' │ ' + diffColor(`${symbol} ${diffText}`.padStart(10))
      } else {
        changePart = ' │ ' + chalk.gray('new'.padStart(10))
      }
    }

    console.log(
      nameColor(result.name.padEnd(15)) +
      ' │ ' +
      sizeColor(formatBytes(result.totalAllocated).padStart(12)) +
      ' │ ' +
      chalk.gray(formatBytes(result.perIteration).padStart(12)) +
      changePart
    )
  }

  const separatorLength = compareResults && previousResults ? 70 : 60
  console.log(chalk.gray('─'.repeat(separatorLength)))

  // Only show lowest memory and range when testing multiple languages
  if (results.length > 1) {
    console.log(chalk.green('Lowest memory: ' + best.name))

    const increase = ((worst.totalAllocated - best.totalAllocated) / best.totalAllocated) * 100
    console.log(chalk.gray(`Range: ${formatBytes(best.totalAllocated)} to ${formatBytes(worst.totalAllocated)} (+${increase.toFixed(1)}%)`))
  }
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
    return sign + absBytes.toFixed(2) + ' B'
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
  console.log(chalk.cyan.bold('\nMemory Benchmark Usage\n'))
  console.log('  ' + chalk.yellow('npm run bench:memory') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--iterations') + ' <number>        Number of iterations (default: 1000)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to ~/.n2words-bench/memory-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--history') + '                    Show memory history (single language only)')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:memory                                   # Benchmark all languages'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en                      # Benchmark English only'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en --history            # Show memory history for English'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en,es,fr                # Multiple languages (comma-separated)'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en --lang es --lang fr  # Multiple languages (repeated flag)'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --value 42 --iterations 10000  # Custom test'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --save --compare               # Track changes over time\n'))
  console.log(chalk.yellow.bold('Note: ') + chalk.gray('Requires --expose-gc flag (automatically set via npm script)'))
  console.log()
}
