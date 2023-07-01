/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/no-nodejs-modules */
import Benchmark from 'benchmark';
import * as fs from 'fs';
import chalk from 'chalk';

const suite = new Benchmark.Suite();

// Parse CLI arguments
const args = process.argv;
args.slice(2);

// Default argument values
let i18n;
let value = Number.MAX_SAFE_INTEGER;

// Look for matching CLI arguments
for (let i = 1; i < args.length; i++) {
  if (args[i] == '--lang' || args[i] == '--language') {
    i18n = args[i + 1];
  } else if (args[i] == '--value') {
    value = args[i + 1];
  }
}

// If language is defined
if (i18n) {
  // Check if language file exists
  if (fs.existsSync('./lib/i18n/' + i18n + '.js')) {
    // Queue specific language benchmark
    await benchLanguage(i18n);
  } else {
    // Log error to console
    console.error(chalk.red('\ni18n language file does not exist: ' + i18n + '.js\n'));
  }
} else {
  // Load all files in language directory
  const files = fs.readdirSync('./lib/i18n');

  // Loop through files
  for (let i = 0; i < files.length; i++) {
    // Make sure file is JavaScript
    if (files[i].includes('.js')) {
      // Queue language file benchmark
      await benchLanguage(files[i].replace('.js', ''));
    }
  }
}

// Log output to console and run queued benchmarks
suite
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .run();


/**
 * Queue language test file for benchmarking.
 * @param {string} i18n Language identifier.
 */
async function benchLanguage(i18n) {
  const { default: language } = await import('./lib/i18n/' + i18n + '.js');

  suite.add(i18n, () => {
    language(value);
  });
}
