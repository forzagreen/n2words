/**
 * Memory usage benchmark script for n2words library.
 *
 * Measures memory allocation across all languages or specific ones.
 * Tracks heap usage, external memory, and per-iteration overhead.
 * Requires --expose-gc flag for accurate garbage collection measurements.
 *
 * Usage:
 *   npm run bench:memory                     # All languages
 *   npm run bench:memory -- --lang en        # English only
 *   npm run bench:memory -- --lang en,fr,de  # Multiple languages
 *   npm run bench:memory -- --save --compare # Track memory changes
 *   npm run bench:memory -- --lang en --history # Show memory history
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import chalk from 'chalk'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Store results in project directory (gitignored)
const __dirname = dirname(fileURLToPath(import.meta.url))
const benchDir = join(__dirname, '.results')
if (!existsSync(benchDir)) {
  mkdirSync(benchDir, { recursive: true })
}
const resultsFile = join(benchDir, 'memory-results.json')

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
    const module = await import(`../src/${langCode}.js`)
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
    return readdirSync('./src')
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
let iterations = 10000 // Higher count for more accurate per-iteration measurements
let saveResults = false
let compareResults = false
let showHistory = false
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
  if (requestedLanguages.length !== 1) {
    console.error(chalk.red('✗ --history requires exactly one language (use --lang <code>)\n'))
    process.exit(1)
  }

  const historyName = requestedLanguages[0]

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
    console.error(chalk.gray(`  Checked: src/${code}.js`))
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
console.log(chalk.gray(`Iterations: ${iterations.toLocaleString()}${converters.length > 1 ? ' per converter' : ''}\n`))

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
  console.log(chalk.blue('\n✓ Results saved to bench/.results/memory-results.json'))
}

console.log() // Final newline

/**
 * Benchmark memory allocation for a specific converter.
 *
 * Strategy: Run iterations in a tight loop without collecting outputs,
 * measure heap growth immediately after. Use multiple runs and take
 * the maximum to capture worst-case allocation (avoids GC interference).
 *
 * @param {Object} converter Loaded converter object
 */
async function benchMemory (converter) {
  // Warmup phase - let V8 JIT optimize the code
  for (let i = 0; i < 1000; i++) {
    converter.toWords(value)
  }

  // Run multiple measurement rounds and take maximum (worst case)
  // Maximum is more representative than median because GC can make
  // measurements artificially low
  const measurements = []
  const runsPerMeasurement = 5

  for (let run = 0; run < runsPerMeasurement; run++) {
    // Force garbage collection for clean baseline
    if (global.gc) {
      global.gc()
      global.gc()
    }
    await new Promise(resolve => setTimeout(resolve, 20))

    const baseline = process.memoryUsage()
    let checksum = 0

    // Run iterations in tight loop
    for (let i = 0; i < iterations; i++) {
      const result = converter.toWords(value)
      checksum += result.length
    }

    // Measure immediately (don't wait for GC)
    const afterTest = process.memoryUsage()
    const heapDelta = afterTest.heapUsed - baseline.heapUsed

    measurements.push({ heapDelta, checksum })
  }

  // Take maximum measurement (captures allocation without GC interference)
  const maxMeasurement = measurements.reduce((max, curr) =>
    curr.heapDelta > max.heapDelta ? curr : max
  )

  const totalAllocated = Math.max(0, maxMeasurement.heapDelta)
  const perIteration = totalAllocated / iterations

  results.push({
    name: converter.name,
    heapUsed: totalAllocated,
    external: 0,
    arrayBuffers: 0,
    totalAllocated,
    perIteration,
    iterations,
    checksum: maxMeasurement.checksum
  })
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

  // Only show lowest/highest memory and range when testing multiple converters
  if (results.length > 1) {
    console.log(chalk.green('Lowest memory: ' + best.name))
    console.log(chalk.red('Highest memory: ' + worst.name))

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
  console.log('  ' + chalk.yellow('--lang') + ' <code>         Benchmark language(s) (e.g., en, fr, zh-Hans)')
  console.log('  ' + chalk.yellow('--value') + ' <number>      Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--iterations') + ' <number> Number of iterations (default: 1000)')
  console.log('  ' + chalk.yellow('--save') + '                Save results to bench/.results/memory-results.json')
  console.log('  ' + chalk.yellow('--compare') + '             Compare with previous saved results')
  console.log('  ' + chalk.yellow('--history') + '             Show memory history (single language only)')
  console.log('  ' + chalk.yellow('--help') + '                Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:memory                        # All languages'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en           # English only'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --lang en,fr,de     # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --iterations 10000  # Custom iteration count'))
  console.log('  ' + chalk.gray('npm run bench:memory -- --save --compare    # Track memory changes\n'))
  console.log(chalk.yellow.bold('Note: ') + chalk.gray('Requires --expose-gc flag (automatically set via npm script)'))
  console.log()
}
