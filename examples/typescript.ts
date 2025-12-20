/**
 * TypeScript Examples for n2words
 *
 * This file demonstrates proper TypeScript usage of the n2words library,
 * including type annotations and language-specific options.
 */

import n2words from 'n2words';
import type { N2WordsOptions } from 'n2words';

// Basic usage with type inference
const basic: string = n2words(42);
console.log(basic); // 'forty-two'

// With explicit options
const withOptions: string = n2words(42, { lang: 'en' });
console.log(withOptions); // 'forty-two'

// Different languages
const english: string = n2words(100, { lang: 'en' });
const french: string = n2words(100, { lang: 'fr' });
const spanish: string = n2words(100, { lang: 'es' });
const german: string = n2words(100, { lang: 'de' });

console.log(english); // 'one hundred'
console.log(french); // 'cent'
console.log(spanish); // 'cien'
console.log(german); // 'einhundert'

// Decimal numbers
const decimal: string = n2words('3.14159', { lang: 'en' });
console.log(decimal); // 'three point one four one five nine'

// BigInt support
const bigint: string = n2words(123456789n, { lang: 'en' });
console.log(bigint);
// 'one hundred and twenty-three million, four hundred and fifty-six thousand, seven hundred and eighty-nine'

// Language fallback with regional variants
const frenchBelgian: string = n2words(70, { lang: 'fr-BE' });
const frenchFallback: string = n2words(70, { lang: 'fr-XX' });

console.log(frenchBelgian); // 'septante'
console.log(frenchFallback); // 'soixante-dix' (falls back to 'fr')

// Language-specific options
const withHyphens: string = n2words(2824, {
  lang: 'fr',
  withHyphenSeparator: true,
});
console.log(withHyphens); // 'deux-mille-huit-cent-vingt-quatre'

// Negative numbers
const negative: string = n2words(-42, { lang: 'en' });
console.log(negative); // 'minus forty-two'

// Custom negative word (language-specific)
const customNegative: string = n2words(-100, {
  lang: 'ar',
  negativeWord: 'سالب',
});
console.log(customNegative); // 'سالب مائة'

// Type-safe function wrapper
function convertNumber(
  value: number | string | bigint,
  language: string = 'en',
): string {
  const options: N2WordsOptions = { lang: language };
  return n2words(value, options);
}

// Usage of wrapper
const converted1: string = convertNumber(42);
const converted2: string = convertNumber(100, 'fr');
const converted3: string = convertNumber('3.14', 'en');

console.log(converted1); // 'forty-two'
console.log(converted2); // 'cent'
console.log(converted3); // 'three point one four'

// Error handling
try {
  // This will throw an error for unsupported language
  n2words(42, { lang: 'unknown-lang' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}

// Empty options object (uses default English)
const withDefaults: string = n2words(42, {});
console.log(withDefaults); // 'forty-two'

// Supported languages (for reference)
/**
 * Example language selection.
 * In a real app, you might get available languages from the library's metadata
 * or check the lib/i18n directory for all available language codes.
 */
const exampleLanguages = ['en', 'es', 'fr', 'de', 'zh'];

console.log('Example languages:', exampleLanguages.join(', '));
