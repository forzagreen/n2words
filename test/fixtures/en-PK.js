/**
 * English (Pakistan) test cases - Indian numbering system
 * Format: [input, expected_output, options?]
 *
 * Pakistani English uses the same lakh/crore system as Indian English.
 * Currency is Pakistani Rupee (PKR), same singular/plural as INR.
 */
export const cardinal = [
  // Decimals
  [0.01, 'zero point zero one'],
  [5.5, 'five point five'],
  [17.42, 'seventeen point forty-two'],

  // Negatives
  [-1, 'minus one'],
  [-100000, 'minus one lakh'],

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

  // Lakhs
  [100000, 'one lakh'],
  [100001, 'one lakh and one'],
  [123456, 'one lakh twenty-three thousand four hundred and fifty-six'],

  // Crores
  [10000000, 'one crore'],
  [12345678, 'one crore twenty-three lakh forty-five thousand six hundred and seventy-eight'],

  // Arabs
  [1000000000, 'one arab'],

  // Kharabs
  [100000000000, 'one kharab']
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
  [100000, 'one lakhth'],
  [100001, 'one lakh first'],
  [10000000, 'one croreth'],
  [1000000000, 'one arabth']
]

/**
 * Currency test cases (Pakistani Rupee)
 */
export const currency = [
  // Zero
  [0, 'zero rupees'],

  // Whole rupees
  [1, 'one rupee'],
  [2, 'two rupees'],
  [100, 'one hundred rupees'],
  [100000, 'one lakh rupees'],
  [10000000, 'one crore rupees'],

  // Paise only
  [0.01, 'one paisa'],
  [0.02, 'two paise'],
  [0.50, 'fifty paise'],

  // Rupees and paise
  [1.01, 'one rupee and one paisa'],
  [42.50, 'forty-two rupees and fifty paise'],
  [100000.50, 'one lakh rupees and fifty paise'],

  // Negative amounts
  [-1, 'minus one rupee'],
  [-42.50, 'minus forty-two rupees and fifty paise'],

  // Without "and" option
  [42.50, 'forty-two rupees fifty paise', { and: false }],

  // Edge cases
  [5.00, 'five rupees'],
  ['5.00', 'five rupees']
]
