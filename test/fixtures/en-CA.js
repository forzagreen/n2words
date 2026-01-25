/**
 * Canadian English test cases
 * Format: [input, expected_output, options?]
 *
 * Canadian English generally follows American English conventions:
 * - No "and" after hundreds by default
 * - Short scale (billion = 10^9)
 * - Currency: Canadian Dollar (CAD) - dollar/dollars, cent/cents
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

  // Hundreds (American-style, no "and" by default)
  [100, 'one hundred'],
  [101, 'one hundred one'],
  [999, 'nine hundred ninety-nine'],

  // Thousands
  [1000, 'one thousand'],
  [1001, 'one thousand one'],
  [12345, 'twelve thousand three hundred forty-five'],

  // Millions
  [1000000, 'one million'],
  [1000001, 'one million one'],

  // Billions
  [1000000000, 'one billion'],

  // With "and" option (informal Canadian style)
  [101, 'one hundred and one', { and: true }],
  [1001, 'one thousand and one', { and: true }],
  [1000001, 'one million and one', { and: true }],

  // Hundred-pairing (colloquial)
  [1500, 'fifteen hundred', { hundredPairing: true }],
  [1900, 'nineteen hundred', { hundredPairing: true }],
  [2300, 'twenty-three hundred', { hundredPairing: true }],

  // Note: Round thousands outside 1100-9999 range use standard form
  [1000, 'one thousand', { hundredPairing: true }],
  [10000, 'ten thousand', { hundredPairing: true }]
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
 * Currency test cases (Canadian Dollar - CAD)
 */
export const currency = [
  // Zero
  [0, 'zero dollars'],

  // Whole dollars (singular/plural)
  [1, 'one dollar'],
  [2, 'two dollars'],
  [100, 'one hundred dollars'],
  [1000000, 'one million dollars'],

  // Cents only (singular/plural)
  [0.01, 'one cent'],
  [0.02, 'two cents'],
  [0.50, 'fifty cents'],

  // Dollars and cents
  [1.01, 'one dollar and one cent'],
  [42.50, 'forty-two dollars and fifty cents'],
  [1000.99, 'one thousand dollars and ninety-nine cents'],

  // Negative amounts
  [-1, 'minus one dollar'],
  [-42.50, 'minus forty-two dollars and fifty cents'],

  // Without "and" option
  [42.50, 'forty-two dollars fifty cents', { and: false }],

  // Edge cases
  [5.00, 'five dollars'],
  ['5.00', 'five dollars']
]
