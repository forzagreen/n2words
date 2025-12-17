import Benchmark from 'benchmark'
import { existsSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import chalk from 'chalk'
import { join } from 'node:path'

const suite = new Benchmark.Suite()
const resultsFile = join('.', 'bench-results.json')

// Parse CLI arguments
const arguments_ = process.argv
arguments_.slice(2)

// Default argument values
let i18n
let value = Number.MAX_SAFE_INTEGER
let saveResults = false
let compareResults = false

// Look for matching CLI arguments
for (let index = 1; index < arguments_.length; index++) {
  if (arguments_[index] === '--lang' || arguments_[index] === '--language') {
    i18n = arguments_[index + 1].toLowerCase()
  } else if (arguments_[index] === '--value') {
    value = arguments_[index + 1]
  } else if (arguments_[index] === '--save') {
    saveResults = true
  } else if (arguments_[index] === '--compare') {
    compareResults = true
  }
}

// If language is defined
if (i18n) {
  // Check if language file exists
  if (existsSync('./lib/i18n/' + i18n + '.js')) {
    // Queue specific language benchmark
    await benchFile('i18n/' + i18n)
  } else {
    // Log error to console
    console.error(chalk.red('\ni18n language file does not exist: ' + i18n + '.js\n'))
  }
} else if (arguments_.includes('--help')) {
  displayHelp()
  process.exit(0)
} else {
  // Load all files in language directory
  const files = readdirSync('./lib/i18n')

  // Loop through files
  for (const file of files) {
    // Make sure file is JavaScript
    if (file.includes('.js')) {
      // Queue language file benchmark
      await benchFile('i18n/' + file.replace('.js', ''))
    }
  }
}

// Log output to console and run queued benchmarks
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
 * Queue language test file for benchmarking.
 * @param {string} file Library file.
 * @param {object} options Options for language file.
 */
async function benchFile (file, options) {
  const { default: n2words } = await import('./lib/' + file + '.js')

  suite.add(file, async () => {
    n2words(value, options)
  })
}

/**
 * Display benchmark script usage information.
 */
function displayHelp () {
  console.log(chalk.cyan.bold('Benchmark Script Usage:\n'))
  console.log('  ' + chalk.yellow('npm run bench') + ' [options]\n')
  console.log(chalk.cyan('Options:'))
  console.log('  ' + chalk.yellow('--lang, --language') + ' <code>    Benchmark specific language (e.g., en, fr)')
  console.log('  ' + chalk.yellow('--value') + ' <number>             Test value to convert (default: Number.MAX_SAFE_INTEGER)')
  console.log('  ' + chalk.yellow('--save') + '                       Save results to bench-results.json')
  console.log('  ' + chalk.yellow('--compare') + '                    Compare with previous results')
  console.log('  ' + chalk.yellow('--help') + '                       Display this help message\n')
  console.log(chalk.cyan('Examples:'))
  console.log('  ' + chalk.gray('npm run bench                            # Benchmark all languages'))
  console.log('  ' + chalk.gray('npm run bench -- --lang en               # Benchmark English only'))
  console.log('  ' + chalk.gray('npm run bench -- --value 42 --save       # Save results with custom value'))
  console.log('  ' + chalk.gray('npm run bench -- --compare               # Compare with previous run') + '\n')
}
