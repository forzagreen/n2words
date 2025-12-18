import test from 'ava'
import n2words from '../../lib/n2words.js'

/**
 * Options and Parameters Tests
 *
 * Tests for language-specific options and configuration:
 * - Custom negative word
 */

// Language-specific parameter configuration
test('custom negative word (Arabic)', t => {
  t.is(n2words(-100, {
    lang: 'ar',
    negativeWord: 'سالب'
  }), 'سالب مائة')
})
