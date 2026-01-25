/**
 * Irish English test cases
 * Format: [input, expected_output, options?]
 *
 * Irish English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - "and" before final segment: "one million and one"
 * - Short scale (billion = 10^9)
 * - Currency: Euro (EUR) - "euro" is invariable (same singular/plural in Irish English)
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
 * Currency test cases (Euro - EUR)
 * Note: In Irish English, "euro" is typically invariable (same for singular and plural)
 */
export const currency = [
  // Zero
  [0, 'zero euro'],

  // Whole euro (invariable - no "euros")
  [1, 'one euro'],
  [2, 'two euro'],
  [100, 'one hundred euro'],
  [1000000, 'one million euro'],

  // Cents only (singular/plural)
  [0.01, 'one cent'],
  [0.02, 'two cents'],
  [0.50, 'fifty cents'],

  // Euro and cents
  [1.01, 'one euro and one cent'],
  [42.50, 'forty-two euro and fifty cents'],
  [1000.99, 'one thousand euro and ninety-nine cents'],

  // Negative amounts
  [-1, 'minus one euro'],
  [-42.50, 'minus forty-two euro and fifty cents'],

  // Without "and" option
  [42.50, 'forty-two euro fifty cents', { and: false }],

  // Edge cases
  [5.00, 'five euro'],
  ['5.00', 'five euro']
]
