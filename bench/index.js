/**
 * Benchmark script for n2words library.
 *
 * Measures performance (ops/sec) and memory (bytes/iter) for each language.
 * Results stream line-by-line as each language completes.
 *
 * Usage:
 *   npm run bench                              # All languages, all functions
 *   npm run bench -- en-US                     # Single language
 *   npm run bench -- en-US,fr-FR,de-DE         # Multiple languages
 *   npm run bench -- --fn toCardinal           # toCardinal only
 *   npm run bench -- --fn toOrdinal            # toOrdinal only
 *   npm run bench -- --full                    # Full accuracy mode
 */
import { Bench } from 'tinybench'
import { parseArgs } from 'node:util'
import chalk from 'chalk'
import { getLanguageCodes } from '../test/helpers/language-helpers.js'

// ============================================================================
// Function Configuration
// ============================================================================

/**
 * Known converter functions.
 * These are the standard export names from language modules.
 */
const KNOWN_FUNCTIONS = ['toCardinal', 'toOrdinal', 'toCurrency']

// ============================================================================
// Benchmark Configuration
// ============================================================================

const config = {
  // Default test value (can be overridden with --value)
  defaultValue: Number.MAX_SAFE_INTEGER,

  // Performance benchmark (tinybench)
  // See: https://github.com/tinylibs/tinybench
  // `time` is in milliseconds; `iterations` is the minimum run count.
  perf: {
    time: 500, // Max time per benchmark (ms)
    iterations: 10, // Minimum sample runs
  },

  // Performance benchmark --full mode (run longer / more iterations)
  perfFull: {
    time: 5000, // Max time per benchmark (ms)
    iterations: 100, // Minimum sample runs
  },

  // Memory benchmark
  memory: {
    iterations: 20000, // Iterations per measurement round
    rounds: 15, // Measurement rounds (median taken)
    warmupRounds: 3, // Throwaway rounds to stabilize heap
    warmupIterations: 2000, // Initial warmup iterations
  },

  // Memory benchmark --full mode
  memoryFull: {
    iterations: 50000, // More iterations per round
    rounds: 25, // More measurement rounds
    warmupRounds: 5, // More warmup rounds
    warmupIterations: 5000, // More initial warmup
  },
}

// ============================================================================
// Converter Loading
// ============================================================================

/**
 * Loads a converter by language code, returning all available functions.
 *
 * @param {string} langCode Language code (e.g., 'en-US', 'fr', 'zh-Hans-CN')
 * @param {string[]} requestedFunctions Function names to include (e.g., ['toCardinal', 'toOrdinal'])
 * @returns {Promise<{name: string, functions: Object<string, Function>} | null>}
 */
async function loadConverter(langCode, requestedFunctions) {
  try {
    const module = await import(`../src/${langCode}.js`)

    // Collect available functions that match requested functions
    const functions = {}
    for (const fnName of requestedFunctions) {
      if (module[fnName]) {
        functions[fnName] = module[fnName]
      }
    }

    // Return null if no matching functions found
    if (Object.keys(functions).length === 0) {
      return null
    }

    return { name: langCode, functions }
  }
  catch {
    // Not found
  }

  return null
}

// ============================================================================
// Argument Parsing
// ============================================================================

/**
 * Parse comma-separated values.
 * @param {string} input - Comma-separated values
 * @returns {string[]} Array of trimmed, non-empty values
 */
function parseCommaSeparated(input) {
  return input.split(',').map(s => s.trim()).filter(Boolean)
}

const { values: flags, positionals } = parseArgs({
  options: {
    lang: { type: 'string', multiple: true },
    language: { type: 'string', multiple: true },
    function: { type: 'string', multiple: true },
    fn: { type: 'string', multiple: true },
    value: { type: 'string' },
    full: { type: 'boolean' },
    help: { type: 'boolean' },
  },
  allowPositionals: true,
  strict: true,
})

// ============================================================================
// Benchmark Functions
// ============================================================================

/**
 * Benchmark a single language (all requested forms).
 *
 * @param {Object} converter Converter object with name and forms
 * @param {string[]} functionsToRun Forms to benchmark
 * @returns {Promise<Object>} Result with functions: { cardinal: { hz, rme, memoryPerIter }, ... }
 */
async function benchmarkLanguage(converter, functionsToRun) {
  const fnResults = {}

  for (const fnName of functionsToRun) {
    const fn = converter.functions[fnName]
    if (!fn) {
      fnResults[fnName] = null
      continue
    }

    // Run performance benchmark
    const perfResult = await runPerfBenchmark(fn, converter.name, fnName)

    // Run memory benchmark
    const memoryPerIter = measureMemory(fn)

    fnResults[fnName] = {
      hz: perfResult.hz,
      rme: perfResult.rme,
      runs: perfResult.runs,
      memoryPerIter,
    }
  }

  return {
    name: converter.name,
    functions: fnResults,
  }
}

/**
 * Run tinybench performance test for a single function.
 */
async function runPerfBenchmark(fn, langName, fnName) {
  const benchOptions = fullMode ? config.perfFull : config.perf

  const b = new Bench(benchOptions)

  b.add(`${langName}.${fnName}`, () => {
    fn(value)
  })

  await b.run()

  // tinybench exposes per-task stats under `throughput` (ops/sec) and `latency`.
  const r = b.tasks[0].result
  return {
    hz: r.throughput.mean,
    rme: r.throughput.rme,
    runs: r.throughput.samplesCount,
  }
}

/**
 * Measure memory usage for a function.
 *
 * Strategy for accuracy:
 * - High iteration count per round (amortizes overhead)
 * - Multiple measurement rounds (median taken for stability)
 * - Triple GC between rounds (thorough cleanup)
 * - Warmup rounds (stabilize heap before measuring)
 */
function measureMemory(fn) {
  const memConfig = fullMode ? config.memoryFull : config.memory
  const { iterations, rounds, warmupRounds, warmupIterations } = memConfig

  // Warmup: stabilize JIT and heap
  for (let i = 0; i < warmupIterations; i++) {
    fn(value)
  }

  // Warmup rounds (thrown away) - stabilizes GC behavior
  for (let warmup = 0; warmup < warmupRounds; warmup++) {
    if (global.gc) {
      global.gc()
      global.gc()
    }
    for (let i = 0; i < iterations; i++) {
      fn(value)
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
      const result = fn(value)
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
 * Print result lines (one row per form).
 */
function printResultLine(result, displayFunctions) {
  const opsColWidth = 14
  const memColWidth = 10

  let isFirstRow = true

  for (const fnName of displayFunctions) {
    const fnResult = result.functions[fnName]

    if (!fnResult) {
      // Skip forms this language doesn't support
      continue
    }

    // Language name (only on first row, blank on subsequent)
    const langCol = isFirstRow ? chalk.gray(result.name.padEnd(12)) : ' '.repeat(12)
    isFirstRow = false

    // Function name (e.g., toCardinal, toOrdinal)
    const fnCol = chalk.cyan(fnName.padEnd(12))

    // ops/sec
    const hz = formatOps(fnResult.hz)
    const rme = `(±${fnResult.rme.toFixed(1)}%)`
    const opsCol = chalk.white(`${hz} ${rme}`.padStart(opsColWidth))

    // Memory
    const mem = formatBytes(fnResult.memoryPerIter)
    const memCol = chalk.gray(mem.padStart(memColWidth))

    console.log(`${langCol} │ ${fnCol} │ ${opsCol} │ ${memCol}`)
  }
}

// ============================================================================
// Utilities
// ============================================================================

function formatOps(hz) {
  if (hz >= 1_000_000) return (hz / 1_000_000).toFixed(1) + 'M'
  if (hz >= 1_000) return (hz / 1_000).toFixed(0) + 'K'
  return hz.toFixed(0)
}

function formatBytes(bytes) {
  const abs = Math.abs(bytes)
  const sign = bytes < 0 ? '-' : ''

  if (abs < 1024) return sign + abs.toFixed(1) + ' B'
  if (abs < 1024 * 1024) return sign + (abs / 1024).toFixed(1) + ' KB'
  return sign + (abs / (1024 * 1024)).toFixed(2) + ' MB'
}

function displayHelp() {
  console.log(chalk.cyan.bold('\nBenchmark Usage\n'))
  console.log('  ' + chalk.yellow('npm run bench') + ' [languages] [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('<lang>') + '              Language code(s) as positional args (e.g., en fr,de)')
  console.log('  ' + chalk.yellow('--lang') + ' <code>       Language(s) to benchmark (alternative syntax)')
  console.log('  ' + chalk.yellow('--function') + ' <fn>     Function(s) to benchmark: ' + KNOWN_FUNCTIONS.join(', ') + ' (default: all)')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--full') + '              Full mode with max iterations (slower, more accurate)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench                                   # All languages, all functions'))
  console.log('  ' + chalk.gray('npm run bench -- en-US                          # Single language'))
  console.log('  ' + chalk.gray('npm run bench -- en-US,fr-FR,de-DE              # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench -- --fn toCardinal                # toCardinal only'))
  console.log('  ' + chalk.gray('npm run bench -- --fn toOrdinal                 # toOrdinal only'))
  console.log('  ' + chalk.gray('npm run bench -- en-US --function toCardinal    # Single lang, single fn'))
  console.log('  ' + chalk.gray('npm run bench -- --full                         # Full accuracy mode\n'))
}

// ============================================================================
// Shared State
// ============================================================================
//
// Declared at module scope so the helper functions defined above (which are
// invoked from main()) can close over them. Assigned inside main().
let value
let fullMode

// ============================================================================
// Orchestration
// ============================================================================

async function main() {
  if (flags.help) {
    displayHelp()
    return
  }

  // `--lang` / `--language` are aliases; positionals also feed languages.
  // Each occurrence may itself be comma-separated, so flatten through parseCommaSeparated.
  const requestedLanguages = [
    ...(flags.lang ?? []),
    ...(flags.language ?? []),
    ...positionals,
  ].flatMap(parseCommaSeparated)

  const functionInputs = [
    ...(flags.function ?? []),
    ...(flags.fn ?? []),
  ].flatMap(parseCommaSeparated)

  for (const fn of functionInputs) {
    if (!KNOWN_FUNCTIONS.includes(fn)) {
      console.error(chalk.red(`Unknown function: ${fn}`))
      console.error(chalk.gray(`Known functions: ${KNOWN_FUNCTIONS.join(', ')}`))
      process.exitCode = 1
      return
    }
  }

  const requestedFunctions = functionInputs.length > 0 ? functionInputs : [...KNOWN_FUNCTIONS]
  value = flags.value ?? config.defaultValue
  fullMode = flags.full ?? false

  // ==========================================================================
  // Load Converters
  // ==========================================================================

  const languageCodes = requestedLanguages.length > 0
    ? requestedLanguages
    : getLanguageCodes()

  const converters = []
  for (const code of languageCodes) {
    const converter = await loadConverter(code, requestedFunctions)
    if (converter) {
      converters.push(converter)
    }
    else {
      // Check if language exists but has no matching forms
      const allFnsConverter = await loadConverter(code, KNOWN_FUNCTIONS)
      if (allFnsConverter) {
        console.error(chalk.yellow(`Language ${code} has no ${requestedFunctions.join('/')} support, skipping`))
      }
      else {
        console.error(chalk.red(`Language not found: ${code}`))
        console.error(chalk.gray(`  Checked: src/${code}.js`))
        process.exitCode = 1
        return
      }
    }
  }

  if (converters.length === 0) {
    console.error(chalk.red('No languages found with requested functions'))
    process.exitCode = 1
    return
  }

  // ==========================================================================
  // Display Header
  // ==========================================================================

  // Warn if GC is not exposed (memory measurements will be unreliable)
  if (!global.gc) {
    console.log(chalk.yellow('⚠ Memory measurements require --expose-gc flag'))
    console.log(chalk.gray('  Run: node --expose-gc bench/index.js\n'))
  }

  console.log(chalk.cyan.bold('\nBenchmark\n'))

  if (requestedLanguages.length > 0) {
    console.log(chalk.gray(`Languages: ${converters.map(c => c.name).join(', ')}`))
  }
  else {
    console.log(chalk.gray(`Testing ${converters.length} languages`))
  }
  console.log(chalk.gray(`Functions: ${requestedFunctions.join(', ')}`))
  console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
  if (fullMode) {
    console.log(chalk.cyan('Full mode: maximum iterations'))
  }
  console.log()

  // Determine which functions to show (based on what's actually available)
  const availableFunctions = new Set()
  for (const converter of converters) {
    Object.keys(converter.functions).forEach(f => availableFunctions.add(f))
  }
  const displayFunctions = requestedFunctions.filter(f => availableFunctions.has(f))

  // Print table header (row-per-function layout)
  const opsColWidth = 14
  const memColWidth = 10
  const header = chalk.cyan.bold('Language'.padEnd(12))
    + ' │ ' + chalk.cyan.bold('Function'.padEnd(12))
    + ' │ ' + chalk.cyan.bold('ops/sec'.padStart(opsColWidth))
    + ' │ ' + chalk.cyan.bold('Memory'.padStart(memColWidth))

  console.log(header)
  const separatorLength = 12 + 15 + opsColWidth + 3 + memColWidth + 3
  console.log(chalk.gray('─'.repeat(separatorLength)))

  // ==========================================================================
  // Benchmark Execution
  // ==========================================================================

  const results = []

  for (const converter of converters) {
    const result = await benchmarkLanguage(converter, displayFunctions)
    results.push(result)
    printResultLine(result, displayFunctions)
  }

  // Print footer
  console.log(chalk.gray('─'.repeat(separatorLength)))

  // Summary
  if (results.length > 1) {
    // Find fastest and lowest memory for each function
    for (const fnName of displayFunctions) {
      const withFn = results.filter(r => r.functions[fnName]?.hz)
      if (withFn.length > 0) {
        const fastest = withFn.reduce((max, r) => r.functions[fnName].hz > max.functions[fnName].hz ? r : max)
        const lowestMem = withFn.reduce((min, r) =>
          r.functions[fnName].memoryPerIter < min.functions[fnName].memoryPerIter ? r : min,
        )
        console.log(chalk.green(`${fnName}: fastest ${fastest.name}, lowest mem ${lowestMem.name}`))
      }
    }
  }

  console.log()
}

await main()
