#!/usr/bin/env node

/**
 * Interactive script to add a new language to n2words
 *
 * Usage: node scripts/add-language.js
 *
 * This script will:
 * 1. Prompt for language details (code, name, base class)
 * 2. Generate language implementation boilerplate
 * 3. Generate test file boilerplate
 * 4. Update lib/n2words.js with imports and registration
 * 5. Provide next steps for implementation
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = createInterface({ input, output });

console.log('='.repeat(60));
console.log('n2words - Add New Language');
console.log('='.repeat(60));
console.log();

// Prompt for language details
const langCode = await rl.question(
  'Language code (e.g., "ja", "sv", "fr-CA"): ',
);
const langName = await rl.question(
  'Language name (e.g., "Japanese", "Swedish"): ',
);
console.log('\nBase class options:');
console.log(
  '  1. CardMatchLanguage (most languages: en, de, fr, es, pt, etc.)',
);
console.log('  2. SlavicLanguage (Slavic languages: ru, pl, cz, uk, etc.)');
console.log('  3. ScandinavianLanguage (Nordic languages: no, dk)');
console.log('  4. TurkicLanguage (Turkish languages: tr, az)');
console.log('  5. AbstractLanguage (custom implementations: ar, vi, ro, etc.)');
const baseClassChoice =
  (await rl.question('Choose base class (1-5) [1]: ')) || '1';
const baseClassMap = {
  1: 'CardMatchLanguage',
  2: 'SlavicLanguage',
  3: 'ScandinavianLanguage',
  4: 'TurkicLanguage',
  5: 'AbstractLanguage',
};
const baseClass = baseClassMap[baseClassChoice] || 'CardMatchLanguage';
const negativeWord =
  (await rl.question(
    'Word for negative numbers (e.g., "minus", "negative") [minus]: ',
  )) || 'minus';
const separatorWord =
  (await rl.question(
    'Word for decimal point (e.g., "point", "dot") [point]: ',
  )) || 'point';
const zeroWord = (await rl.question('Word for zero [zero]: ')) || 'zero';

rl.close();

console.log();
console.log('Generating files...');

// Validate inputs
if (!langCode || !langCode.match(/^[a-z]{2}(-[A-Z]{2})?$/)) {
  console.error('Error: Invalid language code. Use format "xx" or "xx-YY"');
  process.exit(1);
}

const fileName = langCode;
// Create consistent class name: just uppercase language code (e.g., EN, FRBE)
const className = langCode.toUpperCase().replace('-', '');
const constName = langCode.replace('-', '');

// Check if language already exists
if (existsSync(`lib/i18n/${fileName}.js`)) {
  console.error(`Error: Language file lib/i18n/${fileName}.js already exists`);
  process.exit(1);
}

// Generate language implementation
const languageTemplate = `import ${baseClass} from '../classes/${baseClass.toLowerCase().replace('language', '-language')}.js'

/**
 * ${langName} language implementation
 * Converts numeric values to written ${langName}.
 *
 * @example
 * floatToCardinal(42) // => TODO: Add example output
 * floatToCardinal(1000) // => TODO: Add example output
 */
export default function floatToCardinal (value, options = {}) {
  return new ${className}(options).floatToCardinal(value)
}

/**
 * ${langName} number-to-words converter
 */
class ${className} extends ${baseClass} {
  /**
   * Initialize ${langName} converter with language-specific settings
   */
  constructor (options) {
    super(Object.assign({
      negativeWord: '${negativeWord}',
      separatorWord: '${separatorWord}',
      zero: '${zeroWord}'
    }, options), [
      // TODO: Define cards array in DESCENDING order
      // Format: [value_as_BigInt, 'word']
      // Example:
      // [1000000n, 'million'],
      // [1000n, 'thousand'],
      // [100n, 'hundred'],
      // [90n, 'ninety'],
      // [80n, 'eighty'],
      // [70n, 'seventy'],
      // [60n, 'sixty'],
      // [50n, 'fifty'],
      // [40n, 'forty'],
      // [30n, 'thirty'],
      // [20n, 'twenty'],
      // [19n, 'nineteen'],
      // ... (continue with all numbers)
      // [1n, 'one']
    ])
  }

  /**
   * Merge two word sets according to ${langName} grammar rules
   *
   * @param {Object} leftWordSet - Left word set { word: value }
   * @param {Object} rightWordSet - Right word set { word: value }
   * @returns {Object} Merged word set
   *
   * @example
   * // For English: merge({ 'twenty': 20n }, { 'one': 1n }) => { 'twenty-one': 21n }
   * // For French: merge({ 'vingt': 20n }, { 'et': 0n }, { 'un': 1n }) => { 'vingt et un': 21n }
   * // Implement according to ${langName} grammar rules
   */
  merge (leftWordSet, rightWordSet) {
    // TODO: Implement merge logic for ${langName}
    // Basic template (customize for your language):
    const leftWords = Object.keys(leftWordSet)
    const rightWords = Object.keys(rightWordSet)
    const leftValue = Object.values(leftWordSet)[0]
    const rightValue = Object.values(rightWordSet)[0]

    // Example: Simple space-separated concatenation
    // Modify this according to ${langName} grammar rules
    const merged = {}
    merged[leftWords.join(' ') + ' ' + rightWords.join(' ')] = leftValue + rightValue
    return merged
  }
}
`;

// Generate test file
const testTemplate = `/**
 * ${langName} (${langCode}) language tests
 *
 * Test cases for ${langName} number-to-words conversion
 */

export default [
  // Basic numbers
  [0, '${zeroWord}'],
  [1, 'TODO'], // Add ${langName} word for "one"
  [2, 'TODO'], // Add ${langName} word for "two"
  [10, 'TODO'], // Add ${langName} word for "ten"
  [11, 'TODO'],
  [19, 'TODO'],
  [20, 'TODO'],
  [21, 'TODO'],
  [99, 'TODO'],
  [100, 'TODO'],
  [101, 'TODO'],
  [200, 'TODO'],
  [999, 'TODO'],

  // Thousands
  [1000, 'TODO'],
  [1001, 'TODO'],
  [2000, 'TODO'],
  [12345, 'TODO'],

  // Millions
  [1000000, 'TODO'],

  // Negative numbers
  [-5, '${negativeWord} TODO'], // Combine negative word with number

  // Decimals
  ['3.14', 'TODO ${separatorWord} TODO'], // "three point one four" or equivalent
  ['0.5', 'TODO ${separatorWord} TODO']

  // TODO: Add more test cases covering:
  // - Edge cases specific to ${langName}
  // - Large numbers
  // - Special grammar rules
  // - Decimal numbers with leading zeros (e.g., '3.005')
]
`;

// Write language file
writeFileSync(`lib/i18n/${fileName}.js`, languageTemplate);
console.log(`✓ Created lib/i18n/${fileName}.js`);

// Write test file
writeFileSync(`test/i18n/${fileName}.js`, testTemplate);
console.log(`✓ Created test/i18n/${fileName}.js`);

// Update lib/n2words.js
const n2wordsPath = 'lib/n2words.js';
let n2wordsContent = readFileSync(n2wordsPath, 'utf8');

// Find the last import and add new import after it
const lastImportMatch = n2wordsContent.match(
  /import \w+ from '.\/i18n\/[^']+\.js'\n/g,
);
if (lastImportMatch) {
  const lastImport = lastImportMatch[lastImportMatch.length - 1];
  const importStatement = `import ${constName} from './i18n/${fileName}.js'\n`;
  n2wordsContent = n2wordsContent.replace(
    lastImport,
    lastImport + importStatement,
  );
  console.log('✓ Added import to lib/n2words.js');
}

// Add to dict (find last entry and add new one)
const dictMatch = n2wordsContent.match(/const dict = \{[\s\S]*?\n\}/m);
if (dictMatch) {
  const dictBlock = dictMatch[0];
  // Find the last line before closing brace
  const lines = dictBlock.split('\n');
  const closingBraceIndex = lines.length - 1;

  // Determine if we need quoted key or not
  const dictEntry = langCode.includes('-')
    ? `  '${langCode}': ${constName},`
    : `  ${constName},`;

  lines.splice(closingBraceIndex, 0, dictEntry);
  const newDictBlock = lines.join('\n');
  n2wordsContent = n2wordsContent.replace(dictBlock, newDictBlock);
  console.log(`✓ Added '${langCode}' to dict in lib/n2words.js`);
}

writeFileSync(n2wordsPath, n2wordsContent);

console.log();
console.log('='.repeat(60));
console.log('✓ Language boilerplate created successfully!');
console.log('='.repeat(60));
console.log();
console.log('Next steps:');
console.log();
console.log(`1. Edit lib/i18n/${fileName}.js:`);
console.log(
  '   - Fill in the cards array with number words in DESCENDING order',
);
console.log('   - Implement the merge() method according to language grammar');
console.log('   - Add any language-specific methods if needed');
console.log();
console.log(`2. Edit test/i18n/${fileName}.js:`);
console.log('   - Replace "TODO" with actual expected outputs');
console.log('   - Add comprehensive test cases');
console.log();
console.log('3. Test your implementation:');
console.log('   npm test');
console.log();
console.log('4. Run the linter:');
console.log('   npm run lint:js');
console.log();
console.log('5. Build and verify:');
console.log('   npm run build:web');
console.log();
console.log('Reference implementations:');
console.log('   - Simple: lib/i18n/en.js');
console.log('   - Complex: lib/i18n/pt.js, lib/i18n/fr.js');
console.log();
