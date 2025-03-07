import n2words, { N2WordsOptions } from '../lib/n2words';

// Basic usage with default settings
console.log(n2words(123)); // "one hundred and twenty-three"

// Using language option
console.log(n2words(42, { lang: 'fr' })); // "quarante-deux"

// Using multiple options with types
const options: N2WordsOptions = {
  lang: 'de',
  negativeWord: 'minus',
  separatorWord: 'Komma',
  spaceSeparator: ' '
};

console.log(n2words(-42.5, options)); // "minus zweiundvierzig Komma fünf"

// Using named export
import { n2words as convertToWords } from '../lib/n2words';
console.log(convertToWords(7)); // "seven"

// All supported languages example
const languages = [
  'en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 
  'no', 'dk', 'pl', 'uk', 'lt', 'lv', 'ar', 'he', 'ko', 
  'nl', 'sr', 'fa', 'id', 'hu', 'vi', 'az', 'zh', 'hr'
];

for (const lang of languages) {
  console.log(`${lang}: ${n2words(42, { lang })}`);
}