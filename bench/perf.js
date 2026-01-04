/**
 * Performance benchmark script for n2words library.
 *
 * Benchmarks conversion speed across all languages or specific converters.
 * Measures operations per second (ops/sec) for toWords() calls.
 * Supports saving results, comparing with previous runs, and viewing history.
 *
 * Converters can be:
 * - Stable language codes (e.g., 'en', 'fr', 'zh-Hans')
 * - Experimental converters (e.g., 'en-functional' from lib/experimental/)
 *
 * Usage:
 *   npm run bench:perf                            # Benchmark all stable languages
 *   npm run bench:perf -- --lang en               # Benchmark English only
 *   npm run bench:perf -- --lang en,en-functional # Compare stable vs experimental
 *   npm run bench:perf -- --save --compare        # Track performance changes
 *   npm run bench:perf -- --lang en --history     # Show performance history for English
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'
import { homedir } from 'node:os'

const suite = new Benchmark.Suite()

// Store results in persistent location outside project
const benchDir = join(homedir(), '.n2words-bench')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'perf-results.json')

// ============================================================================
// Converter Loading
// ============================================================================

/**
 * Loads a converter by name.
 *
 * Checks experimental directory first, then falls back to stable languages
 * via n2words.js exports (includes gating logic for fair comparison).
 *
 * @param {string} name Converter name (e.g., 'en', 'en-functional')
 * @returns {Promise<{name: string, toWords: Function, type: string}>}
 */
async function loadConverter (name) {
  // Try experimental first - uses raw value input (number/string/bigint)
  try {
    const module = await import(`../lib/experimental/${name}.js`)
    if (module.toWords) {
      return { name, toWords: module.toWords, type: 'experimental' }
    }
  } catch {
    // Not an experimental converter, try stable
  }

  // Try stable language via n2words.js exports (includes gating logic)
  try {
    const n2words = await import('../lib/n2words.js')
    // Get class name from language file to build converter name
    const langModule = await import(`../lib/languages/${name}.js`)
    const className = Object.keys(langModule)[0]
    const converterName = `${className}Converter`
    const converter = n2words[converterName]
    if (converter) {
      return { name, toWords: converter, type: 'stable' }
    }
  } catch {
    // Not found
  }

  return null
}

/**
 * Gets all available stable language codes.
 *
 * @returns {string[]} Language codes
 */
function getStableLanguageCodes () {
  try {
    return readdirSync('./lib/languages')
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''))
  } catch {
    return []
  }
}

/**
 * Gets all available experimental converter names.
 *
 * @returns {string[]} Experimental converter names
 */
function getExperimentalConverterNames () {
  try {
    return readdirSync('./lib/experimental')
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''))
  } catch {
    return []
  }
}

// ============================================================================
// Argument Parsing
// ============================================================================

const arguments_ = process.argv.slice(2)

const requestedConverters = []
const requestedExperimental = []
let value = Number.MAX_SAFE_INTEGER
let saveResults = false
let compareResults = false
let showHistory = false
let addAllExperimental = false
let previousResults = null

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    const lang = arguments_[index + 1]
    if (lang) {
      // Support comma-separated: --lang en,es,fr
      const names = lang.split(',').map(l => l.trim()).filter(Boolean)
      requestedConverters.push(...names)
    }
  } else if (arguments_[index] === '--exp' || arguments_[index] === '--experimental') {
    const exp = arguments_[index + 1]
    if (exp && !exp.startsWith('--')) {
      // Specific experimental converters: --exp en-functional,fr-functional
      const names = exp.split(',').map(e => e.trim()).filter(Boolean)
      requestedExperimental.push(...names)
    } else {
      // No argument: add all experimental converters
      addAllExperimental = true
    }
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
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

// Display header
console.log(chalk.cyan.bold('\nPerformance Benchmark\n'))

// Show history only (skip benchmarking)
if (showHistory) {
  if (requestedConverters.length !== 1) {
    console.error(chalk.red('✗ --history requires exactly one converter (use --lang <name>)\n'))
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
      const langBench = run.benchmarks.find(b => b.name === requestedConverters[0])
      return langBench !== undefined
    }).slice(-10) // Last 10 runs

    if (langHistory.length === 0) {
      console.error(chalk.red(`✗ No history found for: ${requestedConverters[0]}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`📈 Performance History for ${requestedConverters[0]} (last 10 runs):\n`))
    console.log(chalk.gray('Date'.padEnd(20)) + ' │ ' + chalk.gray('ops/sec'.padStart(12)) + ' │ ' + chalk.gray('Change'.padStart(10)))
    console.log(chalk.gray('─'.repeat(50)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const langBench = run.benchmarks.find(b => b.name === requestedConverters[0])
      const date = new Date(run.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const hz = langBench.hz.toLocaleString('en-US', { maximumFractionDigits: 0 })

      let changePart = ''
      if (i > 0) {
        const prevBench = langHistory[i - 1].benchmarks.find(b => b.name === requestedConverters[0])
        const diff = ((langBench.hz - prevBench.hz) / prevBench.hz) * 100
        const symbol = diff > 0 ? '↑' : diff < 0 ? '↓' : '='
        const diffColor = diff > 0 ? chalk.green : diff < 0 ? chalk.red : chalk.gray
        const diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`
        changePart = diffColor(`${symbol} ${diffText}`.padStart(10))
      } else {
        changePart = chalk.gray('baseline'.padStart(10))
      }

      console.log(
        chalk.gray(date.padEnd(20)) +
        ' │ ' +
        chalk.white(hz.padStart(12)) +
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

// ============================================================================
// Load Converters
// ============================================================================

// Determine which converters to benchmark
let converterNames = [...requestedConverters]

// Add experimental converters
if (addAllExperimental) {
  converterNames.push(...getExperimentalConverterNames())
} else if (requestedExperimental.length > 0) {
  converterNames.push(...requestedExperimental)
}

// Default: all stable languages if nothing specified
if (converterNames.length === 0) {
  converterNames = getStableLanguageCodes()
}

// Load all requested converters
const converters = []
for (const name of converterNames) {
  const converter = await loadConverter(name)
  if (converter) {
    converters.push(converter)
  } else {
    console.error(chalk.red(`✗ Converter not found: ${name}`))
    console.error(chalk.gray(`  Checked: lib/languages/${name}.js and lib/experimental/${name}.js`))
    process.exit(1)
  }
}

// Display what we're benchmarking
if (requestedConverters.length > 0 || requestedExperimental.length > 0 || addAllExperimental) {
  const stableCount = converters.filter(c => c.type === 'stable').length
  const expCount = converters.filter(c => c.type === 'experimental').length
  const parts = []
  if (stableCount > 0) parts.push(`${stableCount} stable`)
  if (expCount > 0) parts.push(`${expCount} experimental`)
  console.log(chalk.gray(`Benchmarking: ${converters.map(c => c.name).join(', ')} (${parts.join(', ')})`))
} else {
  console.log(chalk.gray(`Testing ${converters.length} converters`))
}
console.log(chalk.gray(`Test value: ${value.toLocaleString()}\n`))

// Add benchmarks - all converters now accept raw value input
for (const converter of converters) {
  suite.add(converter.name, () => {
    converter.toWords(value)
  })
}

// Print table header
if (compareResults && previousResults) {
  console.log(
    chalk.cyan.bold('Converter'.padEnd(20)) +
    ' │ ' +
    chalk.cyan.bold('ops/sec'.padStart(12)) +
    ' │ ' +
    chalk.cyan.bold('Error'.padStart(8)) +
    ' │ ' +
    chalk.cyan.bold('Runs'.padStart(10)) +
    ' │ ' +
    chalk.cyan.bold('Change'.padStart(10))
  )
  console.log(chalk.gray('─'.repeat(75)))
} else {
  console.log(
    chalk.cyan.bold('Converter'.padEnd(20)) +
    ' │ ' +
    chalk.cyan.bold('ops/sec'.padStart(12)) +
    ' │ ' +
    chalk.cyan.bold('Error'.padStart(8)) +
    ' │ ' +
    chalk.cyan.bold('Runs'.padStart(10))
  )
  console.log(chalk.gray('─'.repeat(60)))
}

suite
  .on('cycle', event => {
    const target = event.target
    const name = target.name.padEnd(20)
    const hz = target.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }).padStart(12)
    const rme = `±${target.stats.rme.toFixed(2)}%`.padStart(8)
    const runs = `(${target.stats.sample.length} runs)`.padStart(10)

    let changePart = ''
    if (compareResults && previousResults) {
      const previous = previousResults.benchmarks.find(b => b.name === target.name)
      if (previous) {
        const diff = ((target.hz - previous.hz) / previous.hz) * 100
        const symbol = diff > 0 ? '↑' : diff < 0 ? '↓' : '='
        const diffColor = diff > 0 ? chalk.green : diff < 0 ? chalk.red : chalk.gray
        const diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`
        changePart = ' │ ' + diffColor(`${symbol} ${diffText}`.padStart(10))
      } else {
        changePart = ' │ ' + chalk.gray('new'.padStart(10))
      }
    }

    console.log(
      chalk.gray(name) +
      ' │ ' +
      chalk.white(hz) +
      ' │ ' +
      chalk.yellow(rme) +
      ' │ ' +
      chalk.gray(runs) +
      changePart
    )
  })
  .on('complete', function () {
    const separatorLength = compareResults && previousResults ? 75 : 60
    console.log(chalk.gray('─'.repeat(separatorLength)))

    // Only show fastest/range when testing multiple converters
    if (this.length > 1) {
      const fastest = this.filter('fastest')
      const slowest = this.filter('slowest')

      console.log(chalk.green('Fastest: ' + fastest.map('name').join(', ')))

      if (fastest.length > 0 && slowest.length > 0) {
        const fastestHz = fastest[0].hz
        const slowestHz = slowest[0].hz
        const diff = ((fastestHz - slowestHz) / slowestHz * 100).toFixed(1)
        const fastestFormatted = fastestHz.toLocaleString('en-US', { maximumFractionDigits: 0 })
        const slowestFormatted = slowestHz.toLocaleString('en-US', { maximumFractionDigits: 0 })
        console.log(chalk.gray(`Range: ${slowestFormatted} to ${fastestFormatted} ops/sec (+${diff}%)`))
      }
    }

    if (saveResults) {
      const currentRun = {
        timestamp: new Date().toISOString(),
        value,
        benchmarks: this.map(benchmark => ({
          name: benchmark.name,
          hz: benchmark.hz,
          stats: {
            mean: benchmark.stats.mean,
            deviation: benchmark.stats.deviation,
            variance: benchmark.stats.variance,
            rme: benchmark.stats.rme,
            sample: benchmark.stats.sample.length
          }
        }))
      }

      // Load existing history or create new
      let historyData = { history: [] }
      if (existsSync(resultsFile)) {
        try {
          historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
        } catch (error) {
          // Backup corrupted file before overwriting
          const backupFile = resultsFile.replace('.json', `-corrupted-${Date.now()}.json`)
          try {
            const corruptedContent = readFileSync(resultsFile, 'utf8')
            writeFileSync(backupFile, corruptedContent)
            console.log(chalk.yellow(`⚠ Results file corrupted, backed up to ${backupFile}`))
          } catch {
            console.log(chalk.yellow(`⚠ Results file corrupted and could not be backed up: ${error.message}`))
          }
        }
      }

      // Add current run to history
      historyData.history.push(currentRun)

      // Keep last 100 runs
      if (historyData.history.length > 100) {
        historyData.history = historyData.history.slice(-100)
      }

      // Write to temp file first, then rename (atomic on most systems)
      const tempFile = resultsFile + '.tmp'
      writeFileSync(tempFile, JSON.stringify(historyData, null, 2))
      renameSync(tempFile, resultsFile)
      console.log(chalk.blue('\n✓ Results saved to ~/.n2words-bench/perf-results.json'))
    }

    console.log() // Final newline
  })
  .run()

/**
 * Display benchmark script usage information.
 */
function displayHelp () {
  console.log(chalk.cyan.bold('\nPerformance Benchmark Usage\n'))
  console.log('  ' + chalk.yellow('npm run bench:perf') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang') + ' <name>       Benchmark stable language(s) (e.g., en, fr, zh-Hans)')
  console.log('  ' + chalk.yellow('--exp') + ' [name]        Add experimental converter(s), or all if no name given')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--save') + '              Save results to ~/.n2words-bench/perf-results.json')
  console.log('  ' + chalk.yellow('--compare') + '           Compare with previous saved results')
  console.log('  ' + chalk.yellow('--history') + '           Show performance history (single converter only)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:perf                                  # All stable languages'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en                     # English only'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en --exp en-functional # Compare en vs en-functional'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --exp                         # All experimental converters'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en --exp               # English + all experimental'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --save --compare              # Track performance changes\n'))
}
