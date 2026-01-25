/**
 * English (Australia) test cases
 * Format: [input, expected_output, options?]
 *
 * Australian English uses British-style conventions:
 * - "and" after hundreds: "one hundred and one"
 * - Western numbering (million, billion)
 * - Currency: Australian Dollar (AUD)
 */
export const cardinal = [
  // Decimals
  [0.01, 'zero point zero one'],
  [5.5, 'five point five'],
  [17.42, 'seventeen point forty-two'],
  [27.312, 'twenty-seven point three hundred and twelve'],

  // Negatives
  [-1, 'minus one'],
  [-17.42, 'minus seventeen point forty-two'],

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
  [199, 'one hundred and ninety-nine'],
  [287, 'two hundred and eighty-seven'],
  [999, 'nine hundred and ninety-nine'],

  // Thousands
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [1100, 'one thousand one hundred'],
  [1243, 'one thousand two hundred and forty-three'],
  [12345, 'twelve thousand three hundred and forty-five'],

  // Millions (Western scale)
  [1000000, 'one million'],
  [1000001, 'one million and one'],
  [1234567, 'one million two hundred and thirty-four thousand five hundred and sixty-seven'],

  // Billions
  [1000000000, 'one billion'],
  [1000000001, 'one billion and one'],

  // Trillions
  [1000000000000, 'one trillion']
]

/**
 * Ordinal number test cases
 */
export const ordinal = [
  [1, 'first'],
  [2, 'second'],
  [3, 'third'],
  [10, 'tenth'],
  [11, 'eleventh'],
  [21, 'twenty-first'],
  [42, 'forty-second'],
  [100, 'one hundredth'],
  [101, 'one hundred first'],
  [1000, 'one thousandth'],
  [1001, 'one thousand first'],
  [1000000, 'one millionth'],
  [1000000000, 'one billionth']
]

/**
 * Currency test cases (Australian Dollar)
 */
export const currency = [
  // Zero
  [0, 'zero dollars'],

  // Whole dollars
  [1, 'one dollar'],
  [2, 'two dollars'],
  [100, 'one hundred dollars'],
  [1000, 'one thousand dollars'],
  [1000000, 'one million dollars'],

  // Cents only
  [0.01, 'one cent'],
  [0.02, 'two cents'],
  [0.50, 'fifty cents'],
  [0.99, 'ninety-nine cents'],

  // Dollars and cents
  [1.01, 'one dollar and one cent'],
  [1.50, 'one dollar and fifty cents'],
  [42.50, 'forty-two dollars and fifty cents'],
  [100.99, 'one hundred dollars and ninety-nine cents'],

  // Negative amounts
  [-1, 'minus one dollar'],
  [-42.50, 'minus forty-two dollars and fifty cents'],

  // Without "and" option
  [42.50, 'forty-two dollars fifty cents', { and: false }],

  // Edge cases
  [5.00, 'five dollars'],
  ['5.00', 'five dollars']
]
