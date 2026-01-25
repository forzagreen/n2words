/**
 * Nigerian English test cases
 * Format: [input, expected_output, options?]
 *
 * Nigerian English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - "and" before final segment: "one million and one"
 * - Short scale (billion = 10^9)
 * - Currency: Nigerian Naira (NGN) - "naira" and "kobo" are invariable (same singular/plural)
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
 * Currency test cases (Nigerian Naira - NGN)
 * Note: Both "naira" and "kobo" are invariable (same for singular and plural)
 */
export const currency = [
  // Zero
  [0, 'zero naira'],

  // Whole naira (invariable - no "nairas")
  [1, 'one naira'],
  [2, 'two naira'],
  [100, 'one hundred naira'],
  [1000000, 'one million naira'],

  // Kobo only (invariable - no "kobos")
  [0.01, 'one kobo'],
  [0.02, 'two kobo'],
  [0.50, 'fifty kobo'],

  // Naira and kobo
  [1.01, 'one naira and one kobo'],
  [42.50, 'forty-two naira and fifty kobo'],
  [1000.99, 'one thousand naira and ninety-nine kobo'],

  // Negative amounts
  [-1, 'minus one naira'],
  [-42.50, 'minus forty-two naira and fifty kobo'],

  // Without "and" option
  [42.50, 'forty-two naira fifty kobo', { and: false }],

  // Edge cases
  [5.00, 'five naira'],
  ['5.00', 'five naira']
]
