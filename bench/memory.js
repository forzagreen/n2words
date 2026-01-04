/**
 * Memory usage benchmark script for n2words library.
 *
 * Measures memory allocation across all converters or specific ones.
 * Tracks heap usage, external memory, and per-iteration overhead.
 * Requires --expose-gc flag for accurate garbage collection measurements.
 *
 * Converters can be:
 * - Stable language codes (e.g., 'en', 'fr', 'zh-Hans')
 * - Experimental converters (e.g., 'en-functional' from lib/experimental/)
 *
 * Usage:
 *   npm run bench:memory                                   # All stable languages
 *   npm run bench:memory -- --lang en                      # English only
 *   npm run bench:memory -- --lang en --exp en-functional  # Compare stable vs experimental
 *   npm run bench:memory -- --save --compare               # Track memory changes
 *   npm run bench:memory -- --lang en --history            # Show memory history
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'
import { homedir } from 'node:os'

// Store results in persistent location outside project
const benchDir = join(homedir(), '.n2words-bench')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'memory-results.json')

// ============================================================================
// Converter Loading
// ============================================================================

/**
 * Loads a converter by name.
 *
 * Checks experimental directory first, then falls back to stable languages.
 * Returns a unified interface: { name, toWords(isNegative, integerPart, decimalPart) }
 *
 * @param {string} name Converter name (e.g., 'en', 'en-functional')
 * @returns {Promise<{name: string, toWords: Function, type: string}>}
 */
async function loadConverter (name) {
  // Try experimental first
  try {
    const module = await import(`../lib/experimental/${name}.js`)
    if (module.toWords) {
      return { name, toWords: module.toWords, type: 'experimental' }
    }
  } catch {
    // Not an experimental converter, try stable
  }

  // Try stable language
  try {
    const module = await import(`../lib/languages/${name}.js`)
    const className = Object.keys(module)[0]
    const LanguageClass = module[className]
    const instance = new LanguageClass()
    return {
      name,
      toWords: (isNegative, integerPart, decimalPart) =>
        instance.toWords(isNegative, integerPart, decimalPart),
      type: 'stable'
    }
  } catch {
    return null
  }
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
let iterations = 1000
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
  if (requestedConverters.length + requestedExperimental.length !== 1) {
    console.error(chalk.red('✗ --history requires exactly one converter (use --lang or --exp)\n'))
    process.exit(1)
  }

  const historyName = requestedConverters[0] || requestedExperimental[0]

  if (!existsSync(resultsFile)) {
    console.error(chalk.red('✗ No history found. Run with --save to start tracking history.\n'))
    process.exit(1)
  }

  try {
    const historyData = JSON.parse(readFileSync(resultsFile, 'utf8'))
    const history = historyData.history || []
    const langHistory = history.filter(run => {
      const langResult = run.results.find(r => r.name === historyName)
      return langResult !== undefined
    }).slice(-10) // Last 10 runs

    if (langHistory.length === 0) {
      console.error(chalk.red(`✗ No history found for: ${historyName}\n`))
      process.exit(1)
    }

    console.log(chalk.cyan.bold(`📈 Memory History for ${historyName} (last 10 runs):\n`))
    console.log(chalk.gray('Date'.padEnd(20)) + ' │ ' + chalk.gray('Total'.padStart(12)) + ' │ ' + chalk.gray('Per Iteration'.padStart(12)) + ' │ ' + chalk.gray('Change'.padStart(10)))
    console.log(chalk.gray('─'.repeat(70)))

    for (let i = 0; i < langHistory.length; i++) {
      const run = langHistory[i]
      const langResult = run.results.find(r => r.name === historyName)
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
        const prevResult = langHistory[i - 1].results.find(r => r.name === historyName)
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
console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
console.log(chalk.gray(`Iterations: ${iterations.toLocaleString()}${converters.length > 1 ? ' per converter' : ''}\n`))

// Prepare test value
const isNegative = value < 0
const integerPart = BigInt(Math.abs(value))

for (const converter of converters) {
  await benchMemory(converter)
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
 * Benchmark memory usage for a specific converter.
 *
 * Measures memory allocation by:
 * 1. Running garbage collection (if available)
 * 2. Taking baseline memory measurement
 * 3. Running N iterations of converter function
 * 4. Measuring memory delta
 *
 * @param {Object} converter Loaded converter object
 */
async function benchMemory (converter) {
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
    outputs.push(converter.toWords(isNegative, integerPart, undefined))
  }

  const afterTest = process.memoryUsage()

  // Calculate memory deltas
  const heapUsed = afterTest.heapUsed - baseline.heapUsed
  const external = afterTest.external - baseline.external
  const arrayBuffers = afterTest.arrayBuffers - baseline.arrayBuffers
  const totalAllocated = heapUsed + external
  const perIteration = totalAllocated / iterations

  results.push({
    name: converter.name,
    heapUsed,
    external,
    arrayBuffers,
    totalAllocated,
    perIteration,
    iterations
  })

  // Sanity check
  if (outputs.length !== iterations) {
    console.error(chalk.red(`✗ Warning: Unexpected output count for ${converter.name}`))
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
      chalk.cyan.bold('Converter'.padEnd(20)) +
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
      chalk.cyan.bold('Converter'.padEnd(20)) +
      ' │ ' +
      chalk.cyan.bold('Total'.padStart(12)) +
      ' │ ' +
      chalk.cyan.bold('Per Iteration'.padStart(12))
    )
    console.log(chalk.gray('─'.repeat(55)))
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
      nameColor(result.name.padEnd(20)) +
      ' │ ' +
      sizeColor(formatBytes(result.totalAllocated).padStart(12)) +
      ' │ ' +
      chalk.gray(formatBytes(result.perIteration).padStart(12)) +
      changePart
    )
  }

  const separatorLength = compareResults && previousResults ? 70 : 55
  console.log(chalk.gray('─'.repeat(separatorLength)))

  // Only show lowest memory and range when testing multiple converters
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
  console.log('  ' + chalk.yellow('--lang') + ' <name>         Benchmark stable language(s) (e.g., en, fr, zh-Hans)')
  console.log('  ' + chalk.yellow('--exp') + ' [name]          Add experimental converter(s), or all if no name given')
  console.log('  ' + chalk.yellow('--value') + ' <number>      Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--iterations') + ' <number> Number of iterations (default: 1000)')
  console.log('  ' + chalk.yellow('--save') + '                Save results to ~/.n2words-bench/memory-results.json')
  console.log('  ' + chalk.yellow('--compare') + '             Compare with previous saved results')
  console.log('  ' + chalk.yellow('--history') + '             Show memory history (single converter only)')
  console.log('  ' + chalk.yellow('--help') + '                Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:memory                                  # All stable languages'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en                     # English only'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en --exp en-functional # Compare stable vs experimental'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --exp                         # All experimental converters'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --iterations 10000            # Custom iteration count'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --save --compare              # Track memory changes\n'))
  console.log(chalk.yellow.bold('Note: ') + chalk.gray('Requires --expose-gc flag (automatically set via npm script)'))
  console.log()
}
