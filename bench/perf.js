/**
 * Performance benchmark script for n2words library.
 *
 * Benchmarks conversion speed across all languages or specific languages.
 * Measures operations per second (ops/sec) for converter function calls.
 * Supports saving results, comparing with previous runs, and viewing history.
 *
 * Usage:
 *   npm run bench:perf                            # Benchmark all languages
 *   npm run bench:perf -- --lang en               # Benchmark English only
 *   npm run bench:perf -- --lang en,es,fr         # Multiple languages (comma-separated)
 *   npm run bench:perf -- --save --compare        # Track performance changes
 *   npm run bench:perf -- --lang en --history     # Show performance history for English
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'
import * as n2words from '../lib/n2words.js'
import { getConverters, getLanguageMetadata } from '../test/utils/language-helpers.js'

const suite = new Benchmark.Suite()
const resultsFile = join(import.meta.dirname, 'perf-results.json')

// Build converter map from n2words exports
const converters = getConverters(n2words)

const arguments_ = process.argv.slice(2)

const languages = []
let value = Number.MAX_SAFE_INTEGER
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
      const langBench = run.benchmarks.find(b => b.name === languages[0])
      return langBench !== undefined
    }).slice(-10) // Last 10 runs

    if (langHistory.length === 0) {
      console.error(chalk.red(`✗ No history found for language: ${languages[0]}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`📈 Performance History for ${languages[0]} (last 10 runs):\n`))
    console.log(chalk.gray('Date'.padEnd(20)) + ' │ ' + chalk.gray('ops/sec'.padStart(12)) + ' │ ' + chalk.gray('Change'.padStart(10)))
    console.log(chalk.gray('─'.repeat(50)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const langBench = run.benchmarks.find(b => b.name === languages[0])
      const date = new Date(run.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const hz = langBench.hz.toLocaleString('en-US', { maximumFractionDigits: 0 })

      let changePart = ''
      if (i > 0) {
        const prevBench = langHistory[i - 1].benchmarks.find(b => b.name === languages[0])
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

// Get all language metadata (code → className mapping)
const allLanguages = getLanguageMetadata()
const languageMap = Object.fromEntries(allLanguages.map(l => [l.code, l.className]))

if (languages.length > 0) {
  // Benchmark specific languages
  console.log(chalk.gray(`Benchmarking: ${languages.join(', ')}`))
  console.log(chalk.gray(`Test value: ${value.toLocaleString()}\n`))

  for (const code of languages) {
    const className = languageMap[code]
    if (!className) {
      console.error(chalk.red(`✗ Language not found: ${code}`))
      process.exit(1)
    }
    addBenchmark(code, className)
  }
} else {
  // Benchmark all languages
  console.log(chalk.gray(`Testing ${allLanguages.length} languages`))
  console.log(chalk.gray(`Test value: ${value.toLocaleString()}\n`))

  for (const lang of allLanguages) {
    addBenchmark(lang.code, lang.className)
  }
}

// Print table header
if (compareResults && previousResults) {
  console.log(
    chalk.cyan.bold('Language'.padEnd(15)) +
    ' │ ' +
    chalk.cyan.bold('ops/sec'.padStart(12)) +
    ' │ ' +
    chalk.cyan.bold('Error'.padStart(8)) +
    ' │ ' +
    chalk.cyan.bold('Runs'.padStart(10)) +
    ' │ ' +
    chalk.cyan.bold('Change'.padStart(10))
  )
  console.log(chalk.gray('─'.repeat(70)))
} else {
  console.log(
    chalk.cyan.bold('Language'.padEnd(15)) +
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
    const name = target.name.padEnd(15)
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
    const separatorLength = compareResults && previousResults ? 70 : 60
    console.log(chalk.gray('─'.repeat(separatorLength)))

    // Only show fastest/range when testing multiple languages
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
      console.log(chalk.blue('\n✓ Results saved to bench/perf-results.json'))
    }

    console.log() // Final newline
  })
  .run()

/**
 * Add a language converter to the benchmark suite.
 *
 * @param {string} code Language code (e.g., 'en', 'zh-Hans')
 * @param {string} className Class name (e.g., 'English', 'SimplifiedChinese')
 * @param {Object} [options] Options to pass to the converter
 */
function addBenchmark (code, className, options) {
  const converterName = `${className}Converter`
  const converter = converters[converterName]

  if (!converter) {
    throw new Error(`Converter not found: ${converterName}`)
  }

  suite.add(code, () => {
    converter(value, options)
  })
}

/**
 * Display benchmark script usage information.
 */
function displayHelp () {
  console.log(chalk.cyan.bold('\nPerformance Benchmark Usage\n'))
  console.log('  ' + chalk.yellow('npm run bench:perf') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to bench/perf-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--history') + '                    Show performance history (single language only)')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:perf                             # Benchmark all languages'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en                # Benchmark English only'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en --history      # Show performance history for English'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en,es,fr          # Multiple languages (comma-separated)'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en --lang es --lang fr  # Multiple languages (repeated flag)'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --value 42 --save        # Save results with custom value'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --save --compare         # Compare with previous run\n'))
}
