import test from 'ava'
import n2words from '../lib/n2words.js'

/**
 * Options and Parameters Tests
 *
 * Tests for language-specific options and configuration:
 * - Custom negative word
 * - Hyphen separator
 * - Feminine/gender options
 * - Decimal separators
 */

// Language-specific parameter configuration
test('custom negative word (Arabic)', t => {
  t.is(n2words(-100, {
    lang: 'ar',
    negativeWord: 'سالب'
  }), 'سالب مائة')
})

test('hyphen separator (French)', t => {
  t.is(n2words(2824, {
    lang: 'fr',
    withHyphenSeparator: true
  }), 'deux-mille-huit-cent-vingt-quatre')
  t.is(n2words(21_602, {
    lang: 'fr',
    withHyphenSeparator: true
  }), 'vingt-et-un-mille-six-cent-deux')
})

test('hyphen separator with decimals (French)', t => {
  t.is(n2words(142.61, {
    lang: 'fr',
    withHyphenSeparator: true
  }), 'cent-quarante-deux-virgule-soixante-et-un')
})
