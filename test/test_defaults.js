const test = require('ava');
import n2words from '../dist/n2words';

test('should set English as default language', t => {
  t.is(n2words(12), 'twelve');
  t.is(n2words(356), 'three hundred and fifty-six');
});

test('should throw an error for unsupported languages', t => {
  t.throws(() => {
		n2words(2, { lang: 'aaa' });
	}, {instanceOf: Error});
});
