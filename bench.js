/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/no-nodejs-modules */
import Benchmark from 'benchmark';

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
  await benchLanguage(i18n);
} else {
  const { default: fs } = await import('fs/promises');

  const files = await fs.readdir('./lib/i18n');

  for (let i = 0; i < files.length; i++) {
    await benchLanguage(files[i].replace('.js', ''));
  }
}

suite
  .on('cycle', event => {
    // Output benchmark result by converting benchmark result to string
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
