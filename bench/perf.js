/**
 * Performance benchmark script for n2words library.
 *
 * Benchmarks conversion speed across all 48 languages or specific languages.
 * Measures operations per second (ops/sec) for converter function calls.
 * Supports saving results and comparing with previous runs.
 *
 * Usage:
 *   npm run bench:perf                       # Benchmark all languages
 *   npm run bench:perf -- --lang en          # Benchmark English only
 *   npm run bench:perf -- --save --compare   # Track performance changes
 */
import Benchmark from 'benchmark'
import { existsSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'
import * as n2words from '../lib/n2words.js'

const suite = new Benchmark.Suite()
const resultsFile = join(import.meta.dirname, 'perf-results.json')

// Build converter map from n2words exports
const converters = {}
for (const [key, value] of Object.entries(n2words)) {
  if (key.endsWith('Converter')) {
    converters[key] = value
  }
}

const arguments_ = process.argv.slice(2)

let language
let value = Number.MAX_SAFE_INTEGER
let saveResults = false
let compareResults = false

for (let index = 0; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    language = arguments_[index + 1]?.toLowerCase()
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  } else if (arguments_[index] === '--save') {
    saveResults = true
  } else if (arguments_[index] === '--compare') {
    compareResults = true
  }
}

if (language) {
  if (existsSync('./lib/languages/' + language + '.js')) {
    await benchConverter(language)
  } else {
    console.error(chalk.red('\nLanguage file does not exist: ' + language + '.js\n'))
    process.exit(1)
  }
} else if (arguments_.includes('--help')) {
  displayHelp()
  process.exit(0)
} else {
  const files = readdirSync('./lib/languages')

  for (const file of files) {
    if (file.endsWith('.js')) {
      await benchConverter(file.replace('.js', ''))
    }
  }
}

suite
  .on('cycle', event => {
    console.log(chalk.gray(String(event.target)))
  })
  .on('complete', function () {
    console.log('\n' + chalk.cyan.bold('Results:'))
    console.log('Fastest is ' + chalk.green(this.filter('fastest').map('name').join(', ')))

    if (saveResults) {
      const results = {
        timestamp: new Date().toISOString(),
        value,
        benchmarks: this.map(benchmark => ({
          name: benchmark.name,
          hz: benchmark.hz,
          stats: {
            mean: benchmark.stats.mean,
            deviation: benchmark.stats.deviation,
            variance: benchmark.stats.variance,
            sample: benchmark.stats.sample.length
          }
        }))
      }

      writeFileSync(resultsFile, JSON.stringify(results, null, 2))
      console.log(chalk.blue('\n✓ Results saved to bench-results.json'))
    }

    if (compareResults && existsSync(resultsFile)) {
      try {
        const previousResults = JSON.parse(readFileSync(resultsFile, 'utf8'))
        console.log(chalk.cyan.bold('\n📊 Comparison with previous run:'))
        console.log(chalk.gray(`Previous run: ${previousResults.timestamp}`))

        this.forEach(current => {
          const previous = previousResults.benchmarks.find(b => b.name === current.name)
          if (previous) {
            const diff = ((current.hz - previous.hz) / previous.hz) * 100
            const symbol = diff > 0 ? chalk.green('↑') : chalk.red('↓')
            const diffColor = diff > 0 ? chalk.green : chalk.red
            console.log(`${chalk.gray(current.name)}: ${symbol} ${diffColor(`${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`)}`)
          }
        })
      } catch {
        console.error(chalk.red('✗ Could not read previous results'))
      }
    }
  })
  .run()

/**
 * Queue a language converter for benchmarking.
 *
 * Finds the appropriate converter from n2words exports and adds it to the benchmark suite.
 * Each benchmark measures the time to call the converter function.
 *
 * @param {string} languageCode Language code (e.g., 'en', 'es', 'zh-Hans').
 * @param {Object} [options] Options to pass to the converter function.
 * @throws {Error} If converter cannot be found for the language code.
 */
async function benchConverter (languageCode, options) {
  // Import the language module to get the class name
  const languageModule = await import(`../lib/languages/${languageCode}.js`)
  const LanguageClass = Object.values(languageModule)[0]

  if (!LanguageClass || typeof LanguageClass !== 'function') {
    throw new Error(`Language class not found for: ${languageCode}`)
  }

  // Find the matching converter by class name
  const className = LanguageClass.name
  const converterName = `${className}Converter`
  const converter = converters[converterName]

  if (!converter) {
    throw new Error(`Converter not found for: ${className} (expected ${converterName})`)
  }

  suite.add(languageCode, () => {
    converter(value, options)
  })
}

/**
 * Display benchmark script usage information.
 */
function displayHelp () {
  console.log(chalk.cyan.bold('Benchmark Script Usage:\n'))
  console.log('  ' + chalk.yellow('npm run bench:perf') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to bench-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench:perf                       # Benchmark all languages'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --lang en          # Benchmark English only'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --value 42 --save  # Save results with custom value'))
  console.log('  ' + chalk.gray('npm run bench:perf -- --compare          # Compare with previous run') + '\n')
}
