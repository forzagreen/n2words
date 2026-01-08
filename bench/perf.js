/**
 * Performance benchmark script for n2words library.
 *
 * Benchmarks conversion speed across all languages or specific ones.
 * Measures operations per second (ops/sec) for toWords() calls.
 * Supports saving results, comparing with previous runs, and viewing history.
 *
 * Usage:
 *   npm run bench:perf                     # Benchmark all languages
 *   npm run bench:perf -- --lang en        # Benchmark English only
 *   npm run bench:perf -- --lang en,fr,de  # Benchmark multiple languages
 *   npm run bench:perf -- --save --compare # Track performance changes
 *   npm run bench:perf -- --lang en --history # Show performance history
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import chalk from 'chalk'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const suite = new Benchmark.Suite()

// Store results in project directory (gitignored)
const __dirname = dirname(fileURLToPath(import.meta.url))
const benchDir = join(__dirname, '.results')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'perf-results.json')

// ============================================================================
// Converter Loading
// ============================================================================

/**
 * Loads a converter by language code.
 *
 * Imports the toWords function directly from the language module.
 *
 * @param {string} langCode Language code (e.g., 'en', 'fr', 'zh-Hans')
 * @returns {Promise<{name: string, toWords: Function} | null>}
 */
async function loadConverter (langCode) {
  try {
    const module = await import(`../lib/languages/${langCode}.js`)
    if (module.toWords) {
      return { name: langCode, toWords: module.toWords }
    }
  } catch {
    // Not found
  }

  return null
}

/**
 * Gets all available language codes.
 *
 * @returns {string[]} Language codes
 */
function getLanguageCodes () {
  try {
    return readdirSync('./lib/languages')
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

const requestedLanguages = []
let value = Number.MAX_SAFE_INTEGER
let saveResults = false
let compareResults = false
let showHistory = false
let fullMode = false
let previousResults = null

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    const lang = arguments_[index + 1]
    if (lang) {
      // Support comma-separated: --lang en,es,fr
      const codes = lang.split(',').map(l => l.trim()).filter(Boolean)
      requestedLanguages.push(...codes)
    }
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  } else if (arguments_[index] === '--save') {
    saveResults = true
  } else if (arguments_[index] === '--compare') {
    compareResults = true
  } else if (arguments_[index] === '--history') {
    showHistory = true
  } else if (arguments_[index] === '--full') {
    fullMode = true
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
  if (requestedLanguages.length !== 1) {
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
      const langBench = run.benchmarks.find(b => b.name === requestedLanguages[0])
      return langBench !== undefined
    }).slice(-10) // Last 10 runs

    if (langHistory.length === 0) {
      console.error(chalk.red(`✗ No history found for: ${requestedLanguages[0]}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`📈 Performance History for ${requestedLanguages[0]} (last 10 runs):\n`))
    console.log(chalk.gray('Date'.padEnd(20)) + ' │ ' + chalk.gray('ops/sec'.padStart(12)) + ' │ ' + chalk.gray('Change'.padStart(10)))
    console.log(chalk.gray('─'.repeat(50)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const langBench = run.benchmarks.find(b => b.name === requestedLanguages[0])
      const date = new Date(run.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const hz = langBench.hz.toLocaleString('en-US', { maximumFractionDigits: 0 })

      let changePart = ''
      if (i > 0) {
        const prevBench = langHistory[i - 1].benchmarks.find(b => b.name === requestedLanguages[0])
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

// Determine which languages to benchmark (default: all)
const languageCodes = requestedLanguages.length > 0
  ? requestedLanguages
  : getLanguageCodes()

// Load all requested converters
const converters = []
for (const code of languageCodes) {
  const converter = await loadConverter(code)
  if (converter) {
    converters.push(converter)
  } else {
    console.error(chalk.red(`✗ Language not found: ${code}`))
    console.error(chalk.gray(`  Checked: lib/languages/${code}.js`))
    process.exit(1)
  }
}

// Display what we're benchmarking
if (requestedLanguages.length > 0) {
  console.log(chalk.gray(`Benchmarking: ${converters.map(c => c.name).join(', ')}`))
} else {
  console.log(chalk.gray(`Testing ${converters.length} languages`))
}
console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
if (fullMode) {
  console.log(chalk.cyan('Full mode: maximum iterations for highest accuracy'))
}
console.log()

// Benchmark options - default uses fast mode, --full for thorough benchmarks
const benchOptions = fullMode
  ? {} // Benchmark.js defaults: minSamples=5, maxTime=5
  : { minSamples: 10, maxTime: 0.5 } // Fast mode: ~4x faster, ±3% accuracy

// Add benchmarks - all converters now accept raw value input
for (const converter of converters) {
  suite.add(converter.name, () => {
    converter.toWords(value)
  }, benchOptions)
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

    // Only show fastest/slowest/range when testing multiple converters
    if (this.length > 1) {
      const fastest = this.filter('fastest')
      const slowest = this.filter('slowest')

      console.log(chalk.green('Fastest: ' + fastest.map('name').join(', ')))
      console.log(chalk.red('Slowest: ' + slowest.map('name').join(', ')))

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
      console.log(chalk.blue('\n✓ Results saved to bench/.results/perf-results.json'))
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
  console.log('  ' + chalk.yellow('--lang') + ' <code>       Benchmark language(s) (e.g., en, fr, zh-Hans)')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--save') + '              Save results to bench/.results/perf-results.json')
  console.log('  ' + chalk.yellow('--compare') + '           Compare with previous saved results')
  console.log('  ' + chalk.yellow('--history') + '           Show performance history (single language only)')
  console.log('  ' + chalk.yellow('--full') + '              Full mode with maximum iterations (slower, more accurate)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:perf                     # All languages'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en        # English only'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en,fr,de  # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --save --compare # Track performance changes'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en --history # Show history\n'))
}
