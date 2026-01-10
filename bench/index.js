/**
 * Benchmark script for n2words library.
 *
 * Measures performance (ops/sec) and memory (bytes/iter) for each language.
 * Results stream line-by-line as each language completes.
 *
 * Usage:
 *   npm run bench                          # All languages
 *   npm run bench -- en                    # Single language
 *   npm run bench -- en,fr,de              # Multiple languages
 *   npm run bench -- --save --compare      # Track changes over time
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync, renameSync } from 'node:fs'
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

  // History per language
  maxHistoryPerLang: 10
}

// ============================================================================
// Paths
// ============================================================================

// Store results in project directory (gitignored)
const __dirname = dirname(fileURLToPath(import.meta.url))
const resultsFile = join(__dirname, 'results.json')

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

/**
 * Parse comma-separated language codes.
 * @param {string} input - Comma-separated codes (e.g., 'en,fr,de')
 * @returns {string[]} Array of trimmed, non-empty codes
 */
function parseLanguageCodes (input) {
  return input.split(',').map(l => l.trim()).filter(Boolean)
}

const arguments_ = process.argv.slice(2)

const requestedLanguages = []
let value = config.defaultValue
let saveResults = false
let compareResults = false
let showHistory = false
let fullMode = false
let removeId = null
let previousResults = null

for (let index = 0; index < arguments_.length; index++) {
  const arg = arguments_[index]

  // Skip values that follow flags
  if (index > 0) {
    const prevArg = arguments_[index - 1]
    if (prevArg === '--lang' || prevArg === '--language' || prevArg === '--value' || prevArg === '--remove') {
      continue
    }
  }

  if (arg === '--lang' || arg === '--language') {
    const lang = arguments_[index + 1]
    if (lang) {
      requestedLanguages.push(...parseLanguageCodes(lang))
    }
  } else if (arg === '--value') {
    value = arguments_[index + 1]
  } else if (arg === '--save') {
    saveResults = true
  } else if (arg === '--compare') {
    compareResults = true
  } else if (arg === '--history') {
    showHistory = true
  } else if (arg === '--full') {
    fullMode = true
  } else if (arg === '--remove') {
    removeId = arguments_[index + 1]
  } else if (arg === '--help') {
    displayHelp()
    process.exit(0)
  } else if (!arg.startsWith('-')) {
    // Positional argument: treat as language code(s)
    requestedLanguages.push(...parseLanguageCodes(arg))
  }
}

// Load previous results if comparing
if (compareResults) {
  const data = loadResultsData()
  if (!data) {
    console.log(chalk.yellow('⚠ No previous results found. Run with --save first.\n'))
    compareResults = false
  } else {
    // Build previousResults map: { langName: latestEntry }
    previousResults = {}
    const languages = data.languages || {}
    for (const [lang, entries] of Object.entries(languages)) {
      // Find most recent entry with matching test value
      const matching = entries.filter(e => e.value === value)
      if (matching.length > 0) {
        previousResults[lang] = matching[matching.length - 1]
      }
    }
    if (Object.keys(previousResults).length === 0) {
      console.log(chalk.yellow(`⚠ No previous results found for value ${value.toLocaleString()}.\n`))
      compareResults = false
    }
  }
}

// ============================================================================
// History Display & Remove
// ============================================================================

/**
 * Load results data from file.
 * Format: { nextId: N, languages: { en: [...], fr: [...] } }
 */
function loadResultsData () {
  if (!existsSync(resultsFile)) return null
  try {
    return JSON.parse(readFileSync(resultsFile, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Format test value for display.
 */
function formatTestValue (val) {
  if (val === config.defaultValue) return 'MAX_SAFE'
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(0) + 'B'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(0) + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K'
  return String(val)
}

/**
 * Format timestamp for display.
 */
function formatDateTime (timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle --remove (accepts single ID or comma-separated IDs)
if (removeId) {
  const data = loadResultsData()
  if (!data) {
    console.error(chalk.red('No history found.\n'))
    process.exit(1)
  }

  const idsToRemove = removeId.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))

  if (idsToRemove.length === 0) {
    console.error(chalk.red('Invalid ID format. Use numeric IDs (e.g., --remove 5 or --remove 1,2,3)\n'))
    process.exit(1)
  }

  let totalRemoved = 0
  const notFound = []
  const languages = data.languages || {}

  for (const id of idsToRemove) {
    let found = false

    for (const [lang, entries] of Object.entries(languages)) {
      const before = entries.length
      languages[lang] = entries.filter(e => e.id !== id)
      if (languages[lang].length < before) {
        found = true
        totalRemoved++
      }

      // Remove language if empty
      if (languages[lang].length === 0) {
        delete languages[lang]
      }
    }

    if (!found) notFound.push(id)
  }

  if (totalRemoved === 0) {
    console.error(chalk.red(`No entries found matching IDs: ${idsToRemove.join(', ')}\n`))
    process.exit(1)
  }

  // Save
  const tempFile = resultsFile + '.tmp'
  writeFileSync(tempFile, JSON.stringify(data, null, 2))
  renameSync(tempFile, resultsFile)

  if (totalRemoved === 1) {
    console.log(chalk.green('✓ Removed 1 entry'))
  } else {
    console.log(chalk.green(`✓ Removed ${totalRemoved} entries`))
  }

  if (notFound.length > 0) {
    console.log(chalk.yellow(`⚠ Not found: ${notFound.join(', ')}`))
  }
  console.log()
  process.exit(0)
}

if (showHistory) {
  const data = loadResultsData()
  if (!data) {
    console.error(chalk.red('No history found. Run with --save first.\n'))
    process.exit(1)
  }

  const languages = data.languages || {}

  // Single language history
  if (requestedLanguages.length === 1) {
    const langCode = requestedLanguages[0]
    const entries = languages[langCode] || []

    if (entries.length === 0) {
      console.error(chalk.red(`No history found for: ${langCode}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`\n History for ${langCode}:\n`))
    console.log(
      chalk.gray('ID'.padStart(4)) + ' | ' +
      chalk.gray('Date & Time'.padEnd(18)) + ' | ' +
      chalk.gray('Value'.padStart(10)) + ' | ' +
      chalk.gray('ops/sec'.padStart(10)) + ' | ' +
      chalk.gray('Memory/iter'.padStart(12))
    )
    console.log(chalk.gray('-'.repeat(66)))

    for (const entry of entries) {
      const hz = entry.hz ? formatOps(entry.hz) : '-'
      const mem = entry.bytes ? formatBytes(entry.bytes) : '-'

      console.log(
        chalk.yellow(String(entry.id).padStart(4)) + ' | ' +
        chalk.gray(formatDateTime(entry.timestamp).padEnd(18)) + ' | ' +
        chalk.gray(formatTestValue(entry.value).padStart(10)) + ' | ' +
        chalk.white(hz.padStart(10)) + ' | ' +
        chalk.gray(mem.padStart(12))
      )
    }
    console.log()
  } else {
    // Multi-language or all languages summary - show latest for each
    const langCodes = requestedLanguages.length > 0
      ? requestedLanguages.filter(lang => languages[lang])
      : Object.keys(languages).sort()

    if (langCodes.length === 0) {
      console.error(chalk.red('No history found.\n'))
      process.exit(1)
    }

    // Get latest entry for each language (with entry count)
    const summaries = []
    for (const lang of langCodes) {
      const entries = languages[lang]
      if (entries && entries.length > 0) {
        const latest = entries[entries.length - 1]
        summaries.push({ name: lang, count: entries.length, ...latest })
      }
    }

    console.log(chalk.cyan.bold('\n Saved Results Summary\n'))
    console.log(
      chalk.gray('Language'.padEnd(12)) + ' | ' +
      chalk.gray('ID'.padStart(4)) + ' | ' +
      chalk.gray('Runs'.padStart(4)) + ' | ' +
      chalk.gray('ops/sec'.padStart(10)) + ' | ' +
      chalk.gray('Memory/iter'.padStart(12)) + ' | ' +
      chalk.gray('Last Run'.padStart(18))
    )
    console.log(chalk.gray('-'.repeat(73)))

    for (const entry of summaries) {
      const hz = entry.hz ? formatOps(entry.hz) : '-'
      const mem = entry.bytes ? formatBytes(entry.bytes) : '-'

      console.log(
        chalk.gray(entry.name.padEnd(12)) + ' | ' +
        chalk.yellow(String(entry.id).padStart(4)) + ' | ' +
        chalk.gray(String(entry.count).padStart(4)) + ' | ' +
        chalk.white(hz.padStart(10)) + ' | ' +
        chalk.gray(mem.padStart(12)) + ' | ' +
        chalk.gray(formatDateTime(entry.timestamp).padStart(18))
      )
    }

    // Summary stats
    console.log(chalk.gray('-'.repeat(73)))
    const withHz = summaries.filter(e => e.hz)
    const withMem = summaries.filter(e => e.bytes)

    if (withHz.length > 0) {
      const fastest = withHz.reduce((max, e) => e.hz > max.hz ? e : max)
      const slowest = withHz.reduce((min, e) => e.hz < min.hz ? e : min)
      console.log(chalk.green(`Fastest: ${fastest.name} (${formatOps(fastest.hz)})`))
      console.log(chalk.yellow(`Slowest: ${slowest.name} (${formatOps(slowest.hz)})`))
    }
    if (withMem.length > 0) {
      const lowestMem = withMem.reduce((min, e) => e.bytes < min.bytes ? e : min)
      const highestMem = withMem.reduce((max, e) => e.bytes > max.bytes ? e : max)
      console.log(chalk.green(`Lowest memory: ${lowestMem.name} (${formatBytes(lowestMem.bytes)})`))
      console.log(chalk.yellow(`Highest memory: ${highestMem.name} (${formatBytes(highestMem.bytes)})`))
    }
    console.log()
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

// Warn if GC is not exposed (memory measurements will be unreliable)
if (!global.gc) {
  console.log(chalk.yellow('⚠ Memory measurements require --expose-gc flag'))
  console.log(chalk.gray('  Run: node --expose-gc bench/index.js\n'))
}

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
const header = chalk.cyan.bold('Converter'.padEnd(12)) +
  ' │ ' + chalk.cyan.bold('ops/sec'.padStart(compareResults ? 25 : 14)) +
  ' │ ' + chalk.cyan.bold('Memory/iter'.padStart(compareResults ? 21 : 12))

console.log(header)
const separatorLength = 12 + (compareResults ? 28 : 17) + (compareResults ? 24 : 15)
console.log(chalk.gray('─'.repeat(separatorLength)))

// ============================================================================
// Benchmark Execution
// ============================================================================

// Track timestamp for incremental saves
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
  console.log(chalk.green('Fastest: ' + fastest.name))
  const lowestMem = results.reduce((min, r) => r.memoryPerIter < min.memoryPerIter ? r : min)
  console.log(chalk.green('Lowest memory: ' + lowestMem.name))
}

saveResultsIfNeeded()
console.log()

// ============================================================================
// Benchmark Functions
// ============================================================================

/**
 * Benchmark a single language (perf and memory).
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
  let line = chalk.gray(result.name.padEnd(12))

  const prev = previousResults?.[result.name]

  // ops/sec column (with optional change)
  const hz = formatOps(result.hz)
  const rme = `(±${result.rme.toFixed(1)}%)`

  if (compareResults && previousResults) {
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
  const mem = formatBytes(result.memoryPerIter)

  if (compareResults && previousResults) {
    if (prev && prev.bytes) {
      const memDiff = ((result.memoryPerIter - prev.bytes) / prev.bytes) * 100
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
 * Format: { nextId: N, languages: { en: [...], fr: [...] } }
 */
function saveResultIncremental (result) {
  // Load or initialize data
  let data = { nextId: 1, languages: {} }
  if (existsSync(resultsFile)) {
    try {
      data = JSON.parse(readFileSync(resultsFile, 'utf8'))
      if (!data.languages) data.languages = {}
      if (!data.nextId) data.nextId = 1
    } catch {
      // Corrupted file, start fresh
    }
  }

  const langName = result.name

  // Initialize language array if needed
  if (!data.languages[langName]) {
    data.languages[langName] = []
  }

  // Add new entry with both perf and memory
  data.languages[langName].push({
    id: data.nextId++,
    timestamp: runTimestamp,
    value,
    hz: result.hz,
    rme: result.rme,
    bytes: result.memoryPerIter
  })

  // Prune old entries
  if (data.languages[langName].length > config.maxHistoryPerLang) {
    data.languages[langName] = data.languages[langName].slice(-config.maxHistoryPerLang)
  }

  // Write atomically
  const tempFile = resultsFile + '.tmp'
  writeFileSync(tempFile, JSON.stringify(data, null, 2))
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
  console.log('  ' + chalk.yellow('npm run bench') + ' [languages] [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('<lang>') + '              Language code(s) as positional args (e.g., en fr,de)')
  console.log('  ' + chalk.yellow('--lang') + ' <code>       Language(s) to benchmark (alternative syntax)')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--full') + '              Full mode with max iterations (slower, more accurate)')
  console.log('  ' + chalk.yellow('--save') + '              Save results to history')
  console.log('  ' + chalk.yellow('--compare') + '           Compare with previous run')
  console.log('  ' + chalk.yellow('--history') + '           Show saved results (all or single language)')
  console.log('  ' + chalk.yellow('--remove') + ' <id>       Remove history entry by ID (comma-separated for multiple)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench                     # All languages'))
  console.log('  ' + chalk.gray('npm run bench -- en               # English only'))
  console.log('  ' + chalk.gray('npm run bench -- en,fr,de         # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench -- --full           # Full accuracy mode'))
  console.log('  ' + chalk.gray('npm run bench -- --save --compare # Track changes'))
  console.log('  ' + chalk.gray('npm run bench -- --history        # Summary of all saved'))
  console.log('  ' + chalk.gray('npm run bench -- en --history     # History for one lang'))
  console.log('  ' + chalk.gray('npm run bench -- --remove 5       # Remove entry by ID'))
  console.log('  ' + chalk.gray('npm run bench -- --remove 1,2,3   # Remove multiple\n'))
}
