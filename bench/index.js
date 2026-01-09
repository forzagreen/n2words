/**
 * Benchmark script for n2words library.
 *
 * Measures performance (ops/sec) and memory (bytes/iter) for each language.
 * Results stream line-by-line as each language completes.
 *
 * Usage:
 *   npm run bench                          # All languages
 *   npm run bench -- --lang en             # Single language
 *   npm run bench -- --lang en,fr,de       # Multiple languages
 *   npm run bench -- --save --compare      # Track changes over time
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync, mkdirSync, renameSync } from 'node:fs'
import chalk from 'chalk'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getLanguageCodes } from '../test/helpers/language-helpers.js'

// ============================================================================
// Benchmark Configuration
// ============================================================================

const config = {
  // Default test value (can be overridden with --value)
  defaultValue: Number.MAX_SAFE_INTEGER,

  // Performance benchmark (Benchmark.js)
  // See: https://benchmarkjs.com/docs#options
  perf: {
    async: false, // Run async
    defer: false, // Benchmark is deferred (async via deferred.resolve())
    delay: 0.005, // Delay between test cycles (seconds)
    initCount: 1, // Initial iterations per cycle
    maxTime: 0.5, // Max time per benchmark (seconds) [default: 5]
    minSamples: 10, // Minimum sample runs [default: 5]
    minTime: 0 // Min time to reduce uncertainty to 1% (seconds)
  },

  // Performance benchmark --full mode (Benchmark.js defaults)
  perfFull: {
    async: false, // Run async
    defer: false, // Benchmark is deferred (async via deferred.resolve())
    delay: 0.005, // Delay between test cycles (seconds)
    initCount: 1, // Initial iterations per cycle
    maxTime: 5, // Max time per benchmark (seconds) [default]
    minSamples: 5, // Minimum sample runs [default]
    minTime: 0 // Min time to reduce uncertainty to 1% (seconds)
  },

  // Memory benchmark
  memory: {
    iterations: 20000, // Iterations per measurement round
    rounds: 15, // Measurement rounds (median taken)
    warmupRounds: 3, // Throwaway rounds to stabilize heap
    warmupIterations: 2000 // Initial warmup iterations
  },

  // Memory benchmark --full mode
  memoryFull: {
    iterations: 50000, // More iterations per round
    rounds: 25, // More measurement rounds
    warmupRounds: 5, // More warmup rounds
    warmupIterations: 5000 // More initial warmup
  },

  // History (per language, filtered by test value)
  maxHistoryPerLanguage: 10
}

// ============================================================================
// Paths
// ============================================================================

// Store results in project directory (gitignored)
const __dirname = dirname(fileURLToPath(import.meta.url))
const benchDir = join(__dirname, '.results')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'results.json')

// ============================================================================
// Converter Loading
// ============================================================================

/**
 * Loads a converter by language code.
 *
 * @param {string} langCode Language code (e.g., 'en', 'fr', 'zh-Hans')
 * @returns {Promise<{name: string, toWords: Function} | null>}
 */
async function loadConverter (langCode) {
  try {
    const module = await import(`../src/${langCode}.js`)
    if (module.toWords) {
      return { name: langCode, toWords: module.toWords }
    }
  } catch {
    // Not found
  }

  return null
}

// ============================================================================
// Argument Parsing
// ============================================================================

const arguments_ = process.argv.slice(2)

const requestedLanguages = []
let value = config.defaultValue
let saveResults = false
let compareResults = false
let showHistory = false
let fullMode = false
let previousResults = null

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    const lang = arguments_[index + 1]
    if (lang) {
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

// Load previous results if comparing (filtered by same test value)
if (compareResults) {
  if (!existsSync(resultsFile)) {
    console.log(chalk.yellow('⚠ No previous results found. Run with --save first.\n'))
    compareResults = false
  } else {
    try {
      const historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
      // Filter to runs with same test value
      const matchingRuns = (historyData.history || []).filter(run => run.value === value)
      if (matchingRuns.length > 0) {
        previousResults = matchingRuns[matchingRuns.length - 1]
      } else {
        console.log(chalk.yellow(`⚠ No previous results found for value ${value.toLocaleString()}.\n`))
        compareResults = false
      }
    } catch {
      console.log(chalk.yellow('⚠ Could not read previous results.\n'))
      compareResults = false
    }
  }
}

// ============================================================================
// History Display
// ============================================================================

if (showHistory) {
  if (requestedLanguages.length !== 1) {
    console.error(chalk.red('--history requires exactly one language (use --lang <code>)\n'))
    process.exit(1)
  }

  if (!existsSync(resultsFile)) {
    console.error(chalk.red('No history found. Run with --save first.\n'))
    process.exit(1)
  }

  try {
    const historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
    const history = historyData.history || []
    // Filter by language only (show all values)
    const langHistory = history.filter(run => {
      const result = run.results.find(r => r.name === requestedLanguages[0])
      return result !== undefined
    }).slice(-config.maxHistoryPerLanguage)

    if (langHistory.length === 0) {
      console.error(chalk.red(`No history found for: ${requestedLanguages[0]}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`\n📈 History for ${requestedLanguages[0]}:\n`))
    console.log(
      chalk.gray('Date'.padEnd(18)) + ' │ ' +
      chalk.gray('Value'.padStart(10)) + ' │ ' +
      chalk.gray('ops/sec'.padStart(10)) + ' │ ' +
      chalk.gray('Memory/iter'.padStart(12))
    )
    console.log(chalk.gray('─'.repeat(60)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const result = run.results.find(r => r.name === requestedLanguages[0])
      const date = new Date(run.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const testValue = run.value === config.defaultValue
        ? 'MAX_SAFE'
        : run.value >= 1_000_000_000
          ? (run.value / 1_000_000_000).toFixed(0) + 'B'
          : run.value >= 1_000_000
            ? (run.value / 1_000_000).toFixed(0) + 'M'
            : run.value >= 1_000
              ? (run.value / 1_000).toFixed(0) + 'K'
              : String(run.value)
      const hz = result.hz ? formatOps(result.hz) : '-'
      const mem = result.memoryPerIter ? formatBytes(result.memoryPerIter) : '-'

      console.log(
        chalk.gray(date.padEnd(18)) + ' │ ' +
        chalk.gray(testValue.padStart(10)) + ' │ ' +
        chalk.white(hz.padStart(10)) + ' │ ' +
        chalk.gray(mem.padStart(12))
      )
    }
    console.log()
  } catch {
    console.error(chalk.red('Error reading history file\n'))
    process.exit(1)
  }
  process.exit(0)
}

// ============================================================================
// Load Converters
// ============================================================================

const languageCodes = requestedLanguages.length > 0
  ? requestedLanguages
  : getLanguageCodes()

const converters = []
for (const code of languageCodes) {
  const converter = await loadConverter(code)
  if (converter) {
    converters.push(converter)
  } else {
    console.error(chalk.red(`Language not found: ${code}`))
    console.error(chalk.gray(`  Checked: src/${code}.js`))
    process.exit(1)
  }
}

// ============================================================================
// Display Header
// ============================================================================

console.log(chalk.cyan.bold('\nBenchmark\n'))

if (requestedLanguages.length > 0) {
  console.log(chalk.gray(`Languages: ${converters.map(c => c.name).join(', ')}`))
} else {
  console.log(chalk.gray(`Testing ${converters.length} languages`))
}
console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
if (fullMode) {
  console.log(chalk.cyan('Full mode: maximum iterations'))
}
console.log()

// Print table header
let header = chalk.cyan.bold('Converter'.padEnd(12))
header += ' │ ' + chalk.cyan.bold('ops/sec'.padStart(compareResults ? 25 : 14))
header += ' │ ' + chalk.cyan.bold('Memory/iter'.padStart(compareResults ? 21 : 12))

console.log(header)
const separatorLength = compareResults ? 66 : 46
console.log(chalk.gray('─'.repeat(separatorLength)))

// ============================================================================
// Benchmark Execution
// ============================================================================

// Track current run for incremental saves
let currentRunData = null
const runTimestamp = new Date().toISOString()

const results = []

for (const converter of converters) {
  const result = await benchmarkLanguage(converter)
  results.push(result)
  printResultLine(result)
  if (saveResults) {
    saveResultIncremental(result)
  }
}

// Print footer
console.log(chalk.gray('─'.repeat(separatorLength)))

// Summary
if (results.length > 1) {
  const fastest = results.reduce((max, r) => r.hz > max.hz ? r : max)
  const lowestMem = results.reduce((min, r) => r.memoryPerIter < min.memoryPerIter ? r : min)
  console.log(chalk.green('Fastest: ' + fastest.name))
  console.log(chalk.green('Lowest memory: ' + lowestMem.name))
}

saveResultsIfNeeded()
console.log()

// ============================================================================
// Benchmark Functions
// ============================================================================

/**
 * Benchmark a single language (perf + memory).
 *
 * @param {Object} converter Converter object with name and toWords
 * @returns {Promise<Object>} Result with hz, rme, memoryPerIter
 */
async function benchmarkLanguage (converter) {
  // Run performance benchmark
  const perfResult = await runPerfBenchmark(converter)

  // Run memory benchmark
  const memoryPerIter = measureMemory(converter)

  return {
    name: converter.name,
    hz: perfResult.hz,
    rme: perfResult.rme,
    runs: perfResult.runs,
    memoryPerIter
  }
}

/**
 * Run Benchmark.js performance test for a single converter.
 */
function runPerfBenchmark (converter) {
  return new Promise((resolve) => {
    const suite = new Benchmark.Suite()

    const benchOptions = fullMode ? config.perfFull : config.perf

    suite.add(converter.name, () => {
      converter.toWords(value)
    }, benchOptions)

    suite
      .on('complete', function () {
        const bench = this[0]
        resolve({
          hz: bench.hz,
          rme: bench.stats.rme,
          runs: bench.stats.sample.length
        })
      })
      .run()
  })
}

/**
 * Measure memory usage for a converter.
 *
 * Strategy for accuracy:
 * - High iteration count per round (amortizes overhead)
 * - Multiple measurement rounds (median taken for stability)
 * - Triple GC between rounds (thorough cleanup)
 * - Warmup rounds (stabilize heap before measuring)
 */
function measureMemory (converter) {
  const memConfig = fullMode ? config.memoryFull : config.memory
  const { iterations, rounds, warmupRounds, warmupIterations } = memConfig

  // Warmup: stabilize JIT and heap
  for (let i = 0; i < warmupIterations; i++) {
    converter.toWords(value)
  }

  // Warmup rounds (thrown away) - stabilizes GC behavior
  for (let warmup = 0; warmup < warmupRounds; warmup++) {
    if (global.gc) {
      global.gc()
      global.gc()
    }
    for (let i = 0; i < iterations; i++) {
      converter.toWords(value)
    }
  }

  // Measurement rounds
  const measurements = []
  for (let run = 0; run < rounds; run++) {
    // Triple GC for thorough cleanup
    if (global.gc) {
      global.gc()
      global.gc()
      global.gc()
    }

    const baseline = process.memoryUsage().heapUsed
    let checksum = 0

    for (let i = 0; i < iterations; i++) {
      const result = converter.toWords(value)
      checksum += result.length
    }

    const after = process.memoryUsage().heapUsed
    measurements.push(after - baseline)

    // Prevent checksum optimization
    if (checksum < 0) console.log(checksum)
  }

  // Use median for stability (robust to outliers)
  measurements.sort((a, b) => a - b)
  const median = measurements[Math.floor(measurements.length / 2)]

  return Math.max(0, median) / iterations
}

/**
 * Print a single result line.
 */
function printResultLine (result) {
  const hz = formatOps(result.hz)
  const rme = `(±${result.rme.toFixed(1)}%)`
  const mem = formatBytes(result.memoryPerIter)

  let line = chalk.gray(result.name.padEnd(12))

  // ops/sec column (with optional change)
  if (compareResults && previousResults) {
    const prev = previousResults.results.find(r => r.name === result.name)
    const hzBase = `${hz} ${rme}`
    if (prev && prev.hz) {
      const hzDiff = ((result.hz - prev.hz) / prev.hz) * 100
      const hzChange = formatChange(hzDiff)
      line += ' │ ' + hzBase.padStart(16) + ' ' + hzChange
    } else {
      line += ' │ ' + hzBase.padStart(16) + ' ' + chalk.gray('(new)'.padStart(8))
    }
  } else {
    line += ' │ ' + chalk.white(`${hz} ${rme}`.padStart(14))
  }

  // Memory column (with optional change)
  if (compareResults && previousResults) {
    const prev = previousResults.results.find(r => r.name === result.name)
    if (prev && prev.memoryPerIter) {
      const memDiff = ((result.memoryPerIter - prev.memoryPerIter) / prev.memoryPerIter) * 100
      const memChange = formatChange(memDiff, true) // inverted: negative is good for memory
      line += ' │ ' + mem.padStart(12) + ' ' + memChange
    } else {
      line += ' │ ' + mem.padStart(12) + ' ' + chalk.gray('(new)'.padStart(8))
    }
  } else {
    line += ' │ ' + chalk.gray(mem.padStart(12))
  }

  console.log(line)
}

/**
 * Format a percentage change with color.
 * @param {number} diff Percentage change
 * @param {boolean} inverted If true, negative is good (for memory)
 * @param {number} width Minimum width for alignment (default 8)
 */
function formatChange (diff, inverted = false, width = 8) {
  const sign = diff > 0 ? '+' : ''
  const text = `(${sign}${diff.toFixed(1)}%)`.padStart(width)

  if (Math.abs(diff) < 0.5) {
    return chalk.gray(text)
  }

  const isGood = inverted ? diff < 0 : diff > 0
  return isGood ? chalk.green(text) : chalk.red(text)
}

/**
 * Save a single result incrementally (allows killing script early).
 */
function saveResultIncremental (result) {
  // Load or initialize history
  let historyData = { history: [] }
  if (existsSync(resultsFile)) {
    try {
      historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
    } catch {
      // Corrupted file, start fresh
    }
  }

  // Find or create current run
  if (!currentRunData) {
    currentRunData = {
      timestamp: runTimestamp,
      value,
      results: []
    }
    historyData.history.push(currentRunData)
  } else {
    // Update reference in history
    const runIndex = historyData.history.findIndex(r => r.timestamp === runTimestamp)
    if (runIndex >= 0) {
      currentRunData = historyData.history[runIndex]
    }
  }

  // Add result
  currentRunData.results.push({
    name: result.name,
    hz: result.hz,
    rme: result.rme,
    memoryPerIter: result.memoryPerIter
  })

  // Prune old runs per language (keep maxHistoryPerLanguage per language+value combo)
  const langName = result.name
  const runsWithLang = historyData.history.filter(run =>
    run.value === value && run.results.some(r => r.name === langName)
  )
  if (runsWithLang.length > config.maxHistoryPerLanguage) {
    // Find oldest runs with this language to remove
    const toRemove = runsWithLang.slice(0, runsWithLang.length - config.maxHistoryPerLanguage)
    for (const run of toRemove) {
      // Remove language result from run, or entire run if it only has this language
      if (run.results.length === 1) {
        const idx = historyData.history.indexOf(run)
        if (idx >= 0) historyData.history.splice(idx, 1)
      } else {
        run.results = run.results.filter(r => r.name !== langName)
      }
    }
  }

  // Write atomically
  const tempFile = resultsFile + '.tmp'
  writeFileSync(tempFile, JSON.stringify(historyData, null, 2))
  renameSync(tempFile, resultsFile)
}

function saveResultsIfNeeded () {
  if (!saveResults) return
  // Results already saved incrementally
  console.log(chalk.blue('✓ Results saved'))
}

// ============================================================================
// Utilities
// ============================================================================

function formatOps (hz) {
  if (hz >= 1_000_000) return (hz / 1_000_000).toFixed(1) + 'M'
  if (hz >= 1_000) return (hz / 1_000).toFixed(0) + 'K'
  return hz.toFixed(0)
}

function formatBytes (bytes) {
  const abs = Math.abs(bytes)
  const sign = bytes < 0 ? '-' : ''

  if (abs < 1024) return sign + abs.toFixed(1) + ' B'
  if (abs < 1024 * 1024) return sign + (abs / 1024).toFixed(1) + ' KB'
  return sign + (abs / (1024 * 1024)).toFixed(2) + ' MB'
}

function displayHelp () {
  console.log(chalk.cyan.bold('\nBenchmark Usage\n'))
  console.log('  ' + chalk.yellow('npm run bench') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang') + ' <code>       Language(s) to benchmark (e.g., en, fr, zh-Hans)')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--full') + '              Full mode with max iterations (slower, more accurate)')
  console.log('  ' + chalk.yellow('--save') + '              Save results to history')
  console.log('  ' + chalk.yellow('--compare') + '           Compare with previous run')
  console.log('  ' + chalk.yellow('--history') + '           Show history (single language)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench                     # All languages'))
  console.log('  ' + chalk.gray('npm run bench -- --lang en        # English only'))
  console.log('  ' + chalk.gray('npm run bench -- --lang en,fr,de  # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench -- --save --compare # Track changes\n'))
}
