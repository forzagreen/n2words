import { existsSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'

const resultsFile = join('.', 'bench-memory-results.json')

// Parse CLI arguments
const arguments_ = process.argv.slice(2)

// Default argument values
let i18n
let value = Number.MAX_SAFE_INTEGER
let iterations = 1000
let saveResults = false
let compareResults = false

// Look for matching CLI arguments
for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    i18n = arguments_[index + 1]?.toLowerCase()
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

// If language is defined
if (i18n) {
  // Check if language file exists
  if (existsSync('./lib/i18n/' + i18n + '.js')) {
    // Test specific language
    await benchMemory('i18n/' + i18n, i18n)
  } else {
    // Log error to console
    console.error(chalk.red('\n✗ i18n language file does not exist: ' + i18n + '.js\n'))
    process.exit(1)
  }
} else {
  // Load all files in language directory
  const files = readdirSync('./lib/i18n')

  console.log(chalk.cyan.bold('Memory Benchmark\n'))
  console.log(chalk.gray(`Testing ${files.length} languages with ${iterations} iterations each...`))
  console.log(chalk.gray(`Value: ${value}\n`))

  // Loop through files
  for (const file of files) {
    // Make sure file is JavaScript
    if (file.endsWith('.js')) {
      // Test language file
      await benchMemory('i18n/' + file.replace('.js', ''), file.replace('.js', ''))
    }
  }
}

// Display results
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
 * Benchmark memory usage for a language file.
 * @param {string} file Library file path.
 * @param {string} name Display name.
 */
async function benchMemory (file, name) {
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }

  // Small delay to stabilize
  await new Promise(resolve => setTimeout(resolve, 100))

  // Capture baseline memory
  const baseline = process.memoryUsage()

  // Import the language converter
  const { default: n2words } = await import('./lib/' + file + '.js')

  // Run iterations
  const outputs = []
  for (let index = 0; index < iterations; index++) {
    outputs.push(n2words(value))
  }

  // Capture after-test memory
  const afterTest = process.memoryUsage()

  // Calculate differences
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

  // Prevent optimization from eliminating the loop
  if (outputs.length !== iterations) {
    console.error('Unexpected output count')
  }
}

/**
 * Display benchmark results.
 */
function displayResults () {
  console.log(chalk.cyan.bold('\nMemory Usage Results:\n'))

  // Sort alphabetically by name
  results.sort((a, b) => a.name.localeCompare(b.name))

  // Find the best (lowest memory)
  const best = results.reduce((min, curr) => curr.totalAllocated < min.totalAllocated ? curr : min)

  // Display results
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

  // Calculate worst
  const worst = results[results.length - 1]
  const increase = ((worst.totalAllocated - best.totalAllocated) / best.totalAllocated) * 100
  console.log(chalk.gray(`Range: ${formatBytes(best.totalAllocated)} to ${formatBytes(worst.totalAllocated)} (+${increase.toFixed(1)}%)`))
}

/**
 * Format bytes to human-readable string.
 * @param {number} bytes Number of bytes.
 * @returns {string} Formatted string.
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
  console.log('  ' + chalk.yellow('node bench-memory.js') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--iterations') + ' <number>        Number of iterations (default: 1000)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to bench-memory-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('node bench-memory.js                                # Benchmark all languages'))
  console.log('  ' + chalk.gray('node bench-memory.js --lang en                      # Benchmark English only'))
  console.log('  ' + chalk.gray('node bench-memory.js --value 42 --iterations 10000  # Custom test'))
  console.log('  ' + chalk.gray('node bench-memory.js --save --compare               # Track changes over time'))
  console.log()
  console.log(chalk.yellow.bold('Note:') + chalk.gray(' For more accurate results, run with: ') + chalk.cyan('node --expose-gc bench-memory.js'))
  console.log()
}
