import Benchmark from 'benchmark';
import n2words from './lib/i18n/EN.mjs';

const suite = new Benchmark.Suite();

suite
  .add('9007199254740991', () => {
    n2words(9007199254740991);
  })
  .on('cycle', event => {
    // Output benchmark result by converting benchmark result to string
    console.log(String(event.target));
  })
  .run();
