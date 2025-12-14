import CardMatchLanguage from '../classes/card-match-language.js'

/**
 * English language converter.
 *
 * Converts numbers to English words, supporting:
 * - Negative numbers (prepended with "minus")
 * - Decimal numbers (word "point" between whole and fractional parts)
 * - Numbers up to octillions
 *
 * Merge rules:
 * - Hyphenated for compound tens (e.g., "twenty-three")
 * - "and" after hundreds (e.g., "one hundred and one")
 * - Space-separated for larger composites (e.g., "one thousand twenty-three")
 */
export class EN extends CardMatchLanguage {
  /**
   * Initializes the English converter with language-specific options.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='minus'] Word for negative numbers.
   * @param {string} [options.separatorWord='point'] Word separating whole and decimal parts.
   * @param {string} [options.zero='zero'] Word for the digit 0.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'point',
      zero: 'zero'
    }, options)

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'octillion'],
      [1_000_000_000_000_000_000_000_000n, 'septillion'],
      [1_000_000_000_000_000_000_000n, 'sextillion'],
      [1_000_000_000_000_000_000n, 'quintillion'],
      [1_000_000_000_000_000n, 'quadrillion'],
      [1_000_000_000_000n, 'trillion'],
      [1_000_000_000n, 'billion'],
      [1_000_000n, 'million'],
      [1000n, 'thousand'],
      [100n, 'hundred'],
      [90n, 'ninety'],
      [80n, 'eighty'],
      [70n, 'seventy'],
      [60n, 'sixty'],
      [50n, 'fifty'],
      [40n, 'forty'],
      [30n, 'thirty'],
      [20n, 'twenty'],
      [19n, 'nineteen'],
      [18n, 'eighteen'],
      [17n, 'seventeen'],
      [16n, 'sixteen'],
      [15n, 'fifteen'],
      [14n, 'fourteen'],
      [13n, 'thirteen'],
      [12n, 'twelve'],
      [11n, 'eleven'],
      [10n, 'ten'],
      [9n, 'nine'],
      [8n, 'eight'],
      [7n, 'seven'],
      [6n, 'six'],
      [5n, 'five'],
      [4n, 'four'],
      [3n, 'three'],
      [2n, 'two'],
      [1n, 'one'],
      [0n, 'zero']
    ])
  }

  /**
   * Merges two adjacent word-number pairs according to English grammar rules.
   *
   * English-specific rules:
   * - Implicit "one": `merge({ 'one': 1n }, { 'hundred': 100n })` → `{ 'one hundred': 100n }`
   * - Hyphenated compounds: `merge({ 'twenty': 20n }, { 'three': 3n })` → `{ 'twenty-three': 23n }`
   * - "and" after hundreds: `merge({ 'one hundred': 100n }, { 'one': 1n })` → `{ 'one hundred and one': 101n }`
   * - Multiplication: `merge({ 'one': 1n }, { 'thousand': 1000n })` → `{ 'one thousand': 1000n }`
   *
   * @param {Object} leftPair Left word-set as `{ word: BigInt }`.
   * @param {Object} rightPair Right word-set as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * merge({ 'one': 1n }, { 'hundred': 100n }); // { 'one hundred': 100n }
   * merge({ 'twenty': 20n }, { 'three': 3n }); // { 'twenty-three': 23n }
   */
  merge (leftPair, rightPair) {
    // Extract words and numeric values from object pairs
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = Object.values(leftPair)[0] // Always BigInt from cards
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = Object.values(rightPair)[0] // Always BigInt from cards

    // Rule 1: Implicit "one" - omit when multiplying ("one hundred" → "hundred")
    if (leftNumber === 1n && rightNumber < 100n) {
      return { [rightWord]: rightNumber }
    }
    // Rule 2: Hyphenate compounds under 100 ("twenty-three")
    if (leftNumber < 100n && leftNumber > rightNumber) {
      return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    }
    // Rule 3: Add "and" before units after hundreds ("one hundred and one")
    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} and ${rightWord}`]: leftNumber + rightNumber }
    }
    // Rule 4: Multiply when right > left ("one thousand")
    if (rightNumber > leftNumber) {
      return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    }

    // Default: Add with space ("one thousand twenty-three")
    return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
  }
}

/**
 * Converts a number to English cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see English class options).
 * @returns {string} The number expressed in English words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42); // 'forty-two'
 * floatToCardinal('1.5'); // 'one point five'
 */
export default function floatToCardinal (value, options = {}) {
  return new EN(options).floatToCardinal(value)
}
