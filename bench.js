/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/no-nodejs-modules */
import Benchmark from 'benchmark';
import * as fs from 'fs';
import chalk from 'chalk';

const suite = new Benchmark.Suite();

const args = process.argv;
args.slice(2);

let i18n;
let value = 9007199254740991;

for (let i = 1; i < args.length; i++) {
  if (args[i] == '--lang' || args[i] == '--language') {
    i18n = args[i + 1];
  } else if (args[i] == '--value') {
    value = args[i + 1];
  }
}

if (i18n) {
  if (fs.existsSync('./lib/i18n/' + i18n + '.js')) {
    await benchLanguage(i18n);
  } else {
    console.error(chalk.red('\ni18n language file does not exist: ' + i18n + '.js\n'));
  }
} else {
  const files = fs.readdirSync('./lib/i18n');

  for (let i = 0; i < files.length; i++) {
    if (files[i].includes('.js')) {
      await benchLanguage(files[i].replace('.js', ''));
    }
  }
}

suite
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .run();


/**
 * Benchmark language
 * @param {string} i18n Language identifier.
 */
async function benchLanguage(i18n) {
  const { default: language } = await import('./lib/i18n/' + i18n + '.js');

  suite.add(i18n, () => {
    language(value);
  });
}
