/**
 * South African English test cases
 * Format: [input, expected_output, options?]
 *
 * South African English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - "and" before final segment: "one million and one"
 * - Short scale (billion = 10^9)
 * - Currency: South African Rand (ZAR) - "rand" is invariable (same singular/plural)
 */
export const cardinal = [
  // Decimals
  [0.01, 'zero point zero one'],
  [5.5, 'five point five'],
  [17.42, 'seventeen point forty-two'],

  // Negatives
  [-1, 'minus one'],
  [-1000000, 'minus one million'],

  // Basic numbers
  [0, 'zero'],
  [1, 'one'],
  [11, 'eleven'],
  [21, 'twenty-one'],
  [42, 'forty-two'],
  [99, 'ninety-nine'],

  // Hundreds (British-style "and")
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [999, 'nine hundred and ninety-nine'],

  // Thousands
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [12345, 'twelve thousand three hundred and forty-five'],

  // Millions
  [1000000, 'one million'],
  [1000001, 'one million and one'],

  // Billions
  [1000000000, 'one billion']
]

/**
 * Ordinal number test cases
 */
export const ordinal = [
  [1, 'first'],
  [2, 'second'],
  [3, 'third'],
  [10, 'tenth'],
  [21, 'twenty-first'],
  [42, 'forty-second'],
  [100, 'one hundredth'],
  [101, 'one hundred first'],
  [1000, 'one thousandth'],
  [1000000, 'one millionth']
]

/**
 * Currency test cases (South African Rand - ZAR)
 * Note: "rand" is invariable (same for singular and plural)
 */
export const currency = [
  // Zero
  [0, 'zero rand'],

  // Whole rand (invariable - no "rands")
  [1, 'one rand'],
  [2, 'two rand'],
  [100, 'one hundred rand'],
  [1000000, 'one million rand'],

  // Cents only (singular/plural)
  [0.01, 'one cent'],
  [0.02, 'two cents'],
  [0.50, 'fifty cents'],

  // Rand and cents
  [1.01, 'one rand and one cent'],
  [42.50, 'forty-two rand and fifty cents'],
  [1000.99, 'one thousand rand and ninety-nine cents'],

  // Negative amounts
  [-1, 'minus one rand'],
  [-42.50, 'minus forty-two rand and fifty cents'],

  // Without "and" option
  [42.50, 'forty-two rand fifty cents', { and: false }],

  // Edge cases
  [5.00, 'five rand'],
  ['5.00', 'five rand']
]
