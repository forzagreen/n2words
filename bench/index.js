/**
 * Benchmark script for n2words library.
 *
 * Measures performance (ops/sec) and memory (bytes/iter) for each language.
 * Results stream line-by-line as each language completes.
 *
 * Usage:
 *   npm run bench                          # All languages, all forms
 *   npm run bench -- en                    # Single language
 *   npm run bench -- en,fr,de              # Multiple languages
 *   npm run bench -- --form cardinal       # Cardinal only
 *   npm run bench -- --form ordinal        # Ordinal only
 *   npm run bench -- --save --compare      # Track changes over time
 */
import Benchmark from 'benchmark'
import { existsSync, writeFileSync, readFileSync, renameSync } from 'node:fs'
import chalk from 'chalk'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getLanguageCodes } from '../test/helpers/language-helpers.js'

// ============================================================================
// Form Configuration
// ============================================================================

/**
 * Known conversion forms with display names.
 * Add new forms here as they're implemented.
 */
const FORMS = {
  cardinal: { name: 'Cardinal', fn: 'toCardinal' },
  ordinal: { name: 'Ordinal', fn: 'toOrdinal' }
  // Future: currency: { name: 'Currency', fn: 'toCurrency' }
}

const ALL_FORM_KEYS = Object.keys(FORMS)

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
 * Loads a converter by language code, returning all available forms.
 *
 * @param {string} langCode Language code (e.g., 'en', 'fr', 'zh-Hans')
 * @param {string[]} requestedForms Forms to include (filters available forms)
 * @returns {Promise<{name: string, forms: Object<string, Function>} | null>}
 */
async function loadConverter (langCode, requestedForms) {
  try {
    const module = await import(`../src/${langCode}.js`)

    // Collect available forms that match requested forms
    const forms = {}
    for (const formKey of requestedForms) {
      const formConfig = FORMS[formKey]
      if (formConfig && module[formConfig.fn]) {
        forms[formKey] = module[formConfig.fn]
      }
    }

    // Return null if no matching forms found
    if (Object.keys(forms).length === 0) {
      return null
    }

    return { name: langCode, forms }
  } catch {
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
function parseCommaSeparated (input) {
  return input.split(',').map(s => s.trim()).filter(Boolean)
}

const arguments_ = process.argv.slice(2)

const requestedLanguages = []
let requestedForms = [] // Empty = all forms
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
    if (['--lang', '--language', '--value', '--remove', '--form', '--forms'].includes(prevArg)) {
      continue
    }
  }

  if (arg === '--lang' || arg === '--language') {
    const lang = arguments_[index + 1]
    if (lang) {
      requestedLanguages.push(...parseCommaSeparated(lang))
    }
  } else if (arg === '--form' || arg === '--forms') {
    const forms = arguments_[index + 1]
    if (forms) {
      const parsed = parseCommaSeparated(forms)
      // Validate form names
      for (const form of parsed) {
        if (!FORMS[form]) {
          console.error(chalk.red(`Unknown form: ${form}`))
          console.error(chalk.gray(`Available forms: ${ALL_FORM_KEYS.join(', ')}`))
          process.exit(1)
        }
      }
      requestedForms.push(...parsed)
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
    requestedLanguages.push(...parseCommaSeparated(arg))
  }
}

// Default to all forms if none specified
if (requestedForms.length === 0) {
  requestedForms = [...ALL_FORM_KEYS]
}

// Load previous results if comparing
if (compareResults) {
  const data = loadResultsData()
  if (!data) {
    console.log(chalk.yellow('⚠ No previous results found. Run with --save first.\n'))
    compareResults = false
  } else {
    // Build previousResults map: { langName: { formKey: latestEntry } }
    previousResults = {}
    const languages = data.languages || {}
    for (const [lang, entries] of Object.entries(languages)) {
      // Find most recent entry with matching test value
      const matching = entries.filter(e => e.value === value)
      if (matching.length > 0) {
        const latest = matching[matching.length - 1]
        previousResults[lang] = latest.forms || {}
        // Backward compatibility: old format stored hz/bytes directly
        if (!latest.forms && latest.hz) {
          previousResults[lang] = { cardinal: { hz: latest.hz, bytes: latest.bytes } }
        }
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

    // Build header based on forms in data
    const formKeys = new Set()
    for (const entry of entries) {
      if (entry.forms) {
        Object.keys(entry.forms).forEach(k => formKeys.add(k))
      } else if (entry.hz) {
        formKeys.add('cardinal') // Backward compatibility
      }
    }

    let headerLine = chalk.gray('ID'.padStart(4)) + ' | ' +
      chalk.gray('Date & Time'.padEnd(18)) + ' | ' +
      chalk.gray('Value'.padStart(10))

    for (const formKey of formKeys) {
      headerLine += ' | ' + chalk.gray(`${FORMS[formKey]?.name || formKey} ops/s`.padStart(12))
    }
    headerLine += ' | ' + chalk.gray('Memory'.padStart(10))

    console.log(headerLine)
    console.log(chalk.gray('-'.repeat(66 + formKeys.size * 15)))

    for (const entry of entries) {
      let line = chalk.yellow(String(entry.id).padStart(4)) + ' | ' +
        chalk.gray(formatDateTime(entry.timestamp).padEnd(18)) + ' | ' +
        chalk.gray(formatTestValue(entry.value).padStart(10))

      // Get forms data (with backward compatibility)
      const formsData = entry.forms || (entry.hz ? { cardinal: { hz: entry.hz, bytes: entry.bytes } } : {})

      for (const formKey of formKeys) {
        const formData = formsData[formKey]
        const hz = formData?.hz ? formatOps(formData.hz) : '-'
        line += ' | ' + chalk.white(hz.padStart(12))
      }

      // Show memory from first available form
      const firstForm = Object.values(formsData)[0]
      const mem = firstForm?.bytes ? formatBytes(firstForm.bytes) : '-'
      line += ' | ' + chalk.gray(mem.padStart(10))

      console.log(line)
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
      chalk.gray('Cardinal'.padStart(10)) + ' | ' +
      chalk.gray('Ordinal'.padStart(10)) + ' | ' +
      chalk.gray('Last Run'.padStart(18))
    )
    console.log(chalk.gray('-'.repeat(75)))

    for (const entry of summaries) {
      // Get forms data (with backward compatibility)
      const formsData = entry.forms || (entry.hz ? { cardinal: { hz: entry.hz } } : {})
      const cardinalHz = formsData.cardinal?.hz ? formatOps(formsData.cardinal.hz) : '-'
      const ordinalHz = formsData.ordinal?.hz ? formatOps(formsData.ordinal.hz) : '-'

      console.log(
        chalk.gray(entry.name.padEnd(12)) + ' | ' +
        chalk.yellow(String(entry.id).padStart(4)) + ' | ' +
        chalk.gray(String(entry.count).padStart(4)) + ' | ' +
        chalk.white(cardinalHz.padStart(10)) + ' | ' +
        chalk.white(ordinalHz.padStart(10)) + ' | ' +
        chalk.gray(formatDateTime(entry.timestamp).padStart(18))
      )
    }

    // Summary stats
    console.log(chalk.gray('-'.repeat(75)))
    const withCardinal = summaries.filter(e => e.forms?.cardinal?.hz || e.hz)

    if (withCardinal.length > 0) {
      const getHz = (e) => e.forms?.cardinal?.hz || e.hz
      const fastest = withCardinal.reduce((max, e) => getHz(e) > getHz(max) ? e : max)
      const slowest = withCardinal.reduce((min, e) => getHz(e) < getHz(min) ? e : min)
      console.log(chalk.green(`Fastest cardinal: ${fastest.name} (${formatOps(getHz(fastest))})`))
      console.log(chalk.yellow(`Slowest cardinal: ${slowest.name} (${formatOps(getHz(slowest))})`))
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
  const converter = await loadConverter(code, requestedForms)
  if (converter) {
    converters.push(converter)
  } else {
    // Check if language exists but has no matching forms
    const allFormsConverter = await loadConverter(code, ALL_FORM_KEYS)
    if (allFormsConverter) {
      console.error(chalk.yellow(`Language ${code} has no ${requestedForms.join('/')} support, skipping`))
    } else {
      console.error(chalk.red(`Language not found: ${code}`))
      console.error(chalk.gray(`  Checked: src/${code}.js`))
      process.exit(1)
    }
  }
}

if (converters.length === 0) {
  console.error(chalk.red('No languages found with requested forms'))
  process.exit(1)
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
console.log(chalk.gray(`Forms: ${requestedForms.map(f => FORMS[f].name).join(', ')}`))
console.log(chalk.gray(`Test value: ${value.toLocaleString()}`))
if (fullMode) {
  console.log(chalk.cyan('Full mode: maximum iterations'))
}
console.log()

// Determine which form columns to show (based on what's actually available)
const availableForms = new Set()
for (const converter of converters) {
  Object.keys(converter.forms).forEach(f => availableForms.add(f))
}
const displayForms = requestedForms.filter(f => availableForms.has(f))

// Print table header
let header = chalk.cyan.bold('Language'.padEnd(12))
for (const formKey of displayForms) {
  const colWidth = compareResults ? 25 : 14
  header += ' │ ' + chalk.cyan.bold(`${FORMS[formKey].name} ops/s`.padStart(colWidth))
}
header += ' │ ' + chalk.cyan.bold('Memory/iter'.padStart(compareResults ? 21 : 12))

console.log(header)
const separatorLength = 12 + displayForms.length * (compareResults ? 28 : 17) + (compareResults ? 24 : 15)
console.log(chalk.gray('─'.repeat(separatorLength)))

// ============================================================================
// Benchmark Execution
// ============================================================================

// Track timestamp for incremental saves
const runTimestamp = new Date().toISOString()

const results = []

for (const converter of converters) {
  const result = await benchmarkLanguage(converter, displayForms)
  results.push(result)
  printResultLine(result, displayForms)
  if (saveResults) {
    saveResultIncremental(result)
  }
}

// Print footer
console.log(chalk.gray('─'.repeat(separatorLength)))

// Summary
if (results.length > 1) {
  // Find fastest for each form
  for (const formKey of displayForms) {
    const withForm = results.filter(r => r.forms[formKey]?.hz)
    if (withForm.length > 0) {
      const fastest = withForm.reduce((max, r) => r.forms[formKey].hz > max.forms[formKey].hz ? r : max)
      console.log(chalk.green(`Fastest ${FORMS[formKey].name.toLowerCase()}: ${fastest.name}`))
    }
  }

  // Find lowest memory (use first available form's memory)
  const withMemory = results.filter(r => {
    const firstForm = Object.values(r.forms)[0]
    return firstForm?.memoryPerIter !== undefined
  })
  if (withMemory.length > 0) {
    const lowestMem = withMemory.reduce((min, r) => {
      const minMem = Object.values(min.forms)[0]?.memoryPerIter || Infinity
      const rMem = Object.values(r.forms)[0]?.memoryPerIter || Infinity
      return rMem < minMem ? r : min
    })
    console.log(chalk.green(`Lowest memory: ${lowestMem.name}`))
  }
}

saveResultsIfNeeded()
console.log()

// ============================================================================
// Benchmark Functions
// ============================================================================

/**
 * Benchmark a single language (all requested forms).
 *
 * @param {Object} converter Converter object with name and forms
 * @param {string[]} formsToRun Forms to benchmark
 * @returns {Promise<Object>} Result with forms: { cardinal: { hz, rme, memoryPerIter }, ... }
 */
async function benchmarkLanguage (converter, formsToRun) {
  const formResults = {}

  for (const formKey of formsToRun) {
    const fn = converter.forms[formKey]
    if (!fn) {
      formResults[formKey] = null
      continue
    }

    // Run performance benchmark
    const perfResult = await runPerfBenchmark(fn, converter.name, formKey)

    // Run memory benchmark
    const memoryPerIter = measureMemory(fn)

    formResults[formKey] = {
      hz: perfResult.hz,
      rme: perfResult.rme,
      runs: perfResult.runs,
      memoryPerIter
    }
  }

  return {
    name: converter.name,
    forms: formResults
  }
}

/**
 * Run Benchmark.js performance test for a single function.
 */
function runPerfBenchmark (fn, langName, formKey) {
  return new Promise((resolve) => {
    const suite = new Benchmark.Suite()

    const benchOptions = fullMode ? config.perfFull : config.perf

    suite.add(`${langName}.${formKey}`, () => {
      fn(value)
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
 * Measure memory usage for a function.
 *
 * Strategy for accuracy:
 * - High iteration count per round (amortizes overhead)
 * - Multiple measurement rounds (median taken for stability)
 * - Triple GC between rounds (thorough cleanup)
 * - Warmup rounds (stabilize heap before measuring)
 */
function measureMemory (fn) {
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
 * Print a single result line.
 */
function printResultLine (result, displayForms) {
  let line = chalk.gray(result.name.padEnd(12))

  const prev = previousResults?.[result.name]

  // Form columns
  for (const formKey of displayForms) {
    const formResult = result.forms[formKey]

    if (!formResult) {
      // Form not available for this language
      const colWidth = compareResults ? 25 : 14
      line += ' │ ' + chalk.gray('-'.padStart(colWidth))
      continue
    }

    const hz = formatOps(formResult.hz)
    const rme = `(±${formResult.rme.toFixed(1)}%)`

    if (compareResults && previousResults) {
      const hzBase = `${hz} ${rme}`
      const prevForm = prev?.[formKey]
      if (prevForm?.hz) {
        const hzDiff = ((formResult.hz - prevForm.hz) / prevForm.hz) * 100
        const hzChange = formatChange(hzDiff)
        line += ' │ ' + hzBase.padStart(16) + ' ' + hzChange
      } else {
        line += ' │ ' + hzBase.padStart(16) + ' ' + chalk.gray('(new)'.padStart(8))
      }
    } else {
      line += ' │ ' + chalk.white(`${hz} ${rme}`.padStart(14))
    }
  }

  // Memory column (use first available form's memory)
  const firstFormResult = Object.values(result.forms).find(f => f?.memoryPerIter !== undefined)
  const mem = firstFormResult ? formatBytes(firstFormResult.memoryPerIter) : '-'

  if (compareResults && previousResults) {
    const prevFirstForm = prev ? Object.values(prev)[0] : null
    if (prevFirstForm?.bytes) {
      const memDiff = ((firstFormResult.memoryPerIter - prevFirstForm.bytes) / prevFirstForm.bytes) * 100
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

  // Build forms data for storage
  const formsData = {}
  for (const [formKey, formResult] of Object.entries(result.forms)) {
    if (formResult) {
      formsData[formKey] = {
        hz: formResult.hz,
        rme: formResult.rme,
        bytes: formResult.memoryPerIter
      }
    }
  }

  // Add new entry
  data.languages[langName].push({
    id: data.nextId++,
    timestamp: runTimestamp,
    value,
    forms: formsData
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
  console.log('  ' + chalk.yellow('--form') + ' <form>       Form(s) to benchmark: ' + ALL_FORM_KEYS.join(', ') + ' (default: all)')
  console.log('  ' + chalk.yellow('--value') + ' <number>    Test value (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--full') + '              Full mode with max iterations (slower, more accurate)')
  console.log('  ' + chalk.yellow('--save') + '              Save results to history')
  console.log('  ' + chalk.yellow('--compare') + '           Compare with previous run')
  console.log('  ' + chalk.yellow('--history') + '           Show saved results (all or single language)')
  console.log('  ' + chalk.yellow('--remove') + ' <id>       Remove history entry by ID (comma-separated for multiple)')
  console.log('  ' + chalk.yellow('--help') + '              Display this help\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench                          # All languages, all forms'))
  console.log('  ' + chalk.gray('npm run bench -- en                    # English only'))
  console.log('  ' + chalk.gray('npm run bench -- en,fr,de              # Multiple languages'))
  console.log('  ' + chalk.gray('npm run bench -- --form cardinal       # Cardinal form only'))
  console.log('  ' + chalk.gray('npm run bench -- --form ordinal        # Ordinal form only'))
  console.log('  ' + chalk.gray('npm run bench -- en --form cardinal    # Single lang, single form'))
  console.log('  ' + chalk.gray('npm run bench -- --full                # Full accuracy mode'))
  console.log('  ' + chalk.gray('npm run bench -- --save --compare      # Track changes'))
  console.log('  ' + chalk.gray('npm run bench -- --history             # Summary of all saved'))
  console.log('  ' + chalk.gray('npm run bench -- en --history          # History for one lang'))
  console.log('  ' + chalk.gray('npm run bench -- --remove 5            # Remove entry by ID'))
  console.log('  ' + chalk.gray('npm run bench -- --remove 1,2,3        # Remove multiple\n'))
}
