/**
 * English (India) test cases - Indian numbering system
 * Format: [input, expected_output, options?]
 *
 * Indian numbering uses lakh (10^5) and crore (10^7) instead of million/billion:
 * - 1,00,000 = one lakh (not one hundred thousand)
 * - 10,00,000 = ten lakh (not one million)
 * - 1,00,00,000 = one crore (not ten million)
 */
export const cardinal = [
  // Decimals
  [0.01, 'zero point zero one'],
  [0.007, 'zero point zero zero seven'],
  [5.5, 'five point five'],
  [17.42, 'seventeen point forty-two'],
  [27.312, 'twenty-seven point three hundred and twelve'],
  [53.486, 'fifty-three point four hundred and eighty-six'],

  // Negatives
  [-1, 'minus one'],
  [-17.42, 'minus seventeen point forty-two'],
  [-100000, 'minus one lakh'],

  // Basic numbers (same as en-GB)
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [5, 'five'],
  [11, 'eleven'],
  [12, 'twelve'],
  [16, 'sixteen'],
  [19, 'nineteen'],
  [20, 'twenty'],
  [21, 'twenty-one'],
  [30, 'thirty'],
  [42, 'forty-two'],
  [50, 'fifty'],
  [67, 'sixty-seven'],
  [89, 'eighty-nine'],
  [99, 'ninety-nine'],

  // Hundreds (British-style "and")
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [110, 'one hundred and ten'],
  [111, 'one hundred and eleven'],
  [199, 'one hundred and ninety-nine'],
  [200, 'two hundred'],
  [287, 'two hundred and eighty-seven'],
  [500, 'five hundred'],
  [999, 'nine hundred and ninety-nine'],

  // Thousands (Western-style, same as en-GB up to 99,999)
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [1010, 'one thousand and ten'],
  [1100, 'one thousand one hundred'],
  [1101, 'one thousand one hundred and one'],
  [1234, 'one thousand two hundred and thirty-four'],
  [2000, 'two thousand'],
  [5000, 'five thousand'],
  [10000, 'ten thousand'],
  [12345, 'twelve thousand three hundred and forty-five'],
  [50000, 'fifty thousand'],
  [99999, 'ninety-nine thousand nine hundred and ninety-nine'],

  // Lakhs (10^5 = 100,000)
  [100000, 'one lakh'],
  [100001, 'one lakh and one'],
  [100100, 'one lakh one hundred'],
  [100101, 'one lakh one hundred and one'],
  [110000, 'one lakh ten thousand'],
  [123456, 'one lakh twenty-three thousand four hundred and fifty-six'],
  [200000, 'two lakh'],
  [500000, 'five lakh'],
  [999999, 'nine lakh ninety-nine thousand nine hundred and ninety-nine'],

  // Ten lakhs (10^6 = 1,000,000)
  [1000000, 'ten lakh'],
  [1000001, 'ten lakh and one'],
  [1234567, 'twelve lakh thirty-four thousand five hundred and sixty-seven'],
  [5000000, 'fifty lakh'],
  [9999999, 'ninety-nine lakh ninety-nine thousand nine hundred and ninety-nine'],

  // Crores (10^7 = 10,000,000)
  [10000000, 'one crore'],
  [10000001, 'one crore and one'],
  [10100000, 'one crore one lakh'],
  [12345678, 'one crore twenty-three lakh forty-five thousand six hundred and seventy-eight'],
  [50000000, 'five crore'],
  [99999999, 'nine crore ninety-nine lakh ninety-nine thousand nine hundred and ninety-nine'],

  // Ten crores (10^8 = 100,000,000)
  [100000000, 'ten crore'],
  [123456789, 'twelve crore thirty-four lakh fifty-six thousand seven hundred and eighty-nine'],

  // Arabs (10^9 = 1,000,000,000)
  [1000000000, 'one arab'],
  [1000000001, 'one arab and one'],
  [1234567890, 'one arab twenty-three crore forty-five lakh sixty-seven thousand eight hundred and ninety'],

  // Ten arabs (10^10)
  [10000000000, 'ten arab'],

  // Kharabs (10^11)
  [100000000000, 'one kharab'],
  [100000000001n, 'one kharab and one'],

  // BigInt large numbers
  [1000000000000n, 'ten kharab'],
  [10000000000000n, 'one neel'],
  [100000000000000n, 'ten neel'],
  [1000000000000000n, 'one padma'],
  [10000000000000000n, 'ten padma'],
  [100000000000000000n, 'one shankh']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Basic ones
  [1, 'first'],
  [2, 'second'],
  [3, 'third'],
  [4, 'fourth'],
  [5, 'fifth'],
  [6, 'sixth'],
  [7, 'seventh'],
  [8, 'eighth'],
  [9, 'ninth'],

  // Teens
  [10, 'tenth'],
  [11, 'eleventh'],
  [12, 'twelfth'],
  [13, 'thirteenth'],
  [14, 'fourteenth'],
  [15, 'fifteenth'],
  [16, 'sixteenth'],
  [17, 'seventeenth'],
  [18, 'eighteenth'],
  [19, 'nineteenth'],

  // Tens
  [20, 'twentieth'],
  [30, 'thirtieth'],
  [40, 'fortieth'],
  [50, 'fiftieth'],
  [60, 'sixtieth'],
  [70, 'seventieth'],
  [80, 'eightieth'],
  [90, 'ninetieth'],

  // Compound tens-ones
  [21, 'twenty-first'],
  [22, 'twenty-second'],
  [42, 'forty-second'],
  [99, 'ninety-ninth'],

  // Hundreds
  [100, 'one hundredth'],
  [101, 'one hundred first'],
  [110, 'one hundred tenth'],
  [121, 'one hundred twenty-first'],
  [200, 'two hundredth'],
  [999, 'nine hundred ninety-ninth'],

  // Thousands
  [1000, 'one thousandth'],
  [1001, 'one thousand first'],
  [1100, 'one thousand one hundredth'],
  [2000, 'two thousandth'],
  [10000, 'ten thousandth'],
  [99999, 'ninety-nine thousand nine hundred ninety-ninth'],

  // Lakhs
  [100000, 'one lakhth'],
  [100001, 'one lakh first'],
  [100100, 'one lakh one hundredth'],
  [200000, 'two lakhth'],

  // Ten lakhs
  [1000000, 'ten lakhth'],
  [1000001, 'ten lakh first'],

  // Crores
  [10000000, 'one croreth'],
  [10000001, 'one crore first'],
  [10100000, 'one crore one lakhth'],

  // Arabs
  [1000000000, 'one arabth'],
  [1000000001, 'one arab first']
]

/**
 * Currency test cases (Indian Rupee)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero rupees'],

  // Whole rupees (singular/plural)
  [1, 'one rupee'],
  [2, 'two rupees'],
  [10, 'ten rupees'],
  [100, 'one hundred rupees'],
  [1000, 'one thousand rupees'],

  // Indian scale rupees
  [100000, 'one lakh rupees'],
  [1000000, 'ten lakh rupees'],
  [10000000, 'one crore rupees'],
  [1000000000, 'one arab rupees'],

  // Paise only (singular/plural)
  [0.01, 'one paisa'],
  [0.02, 'two paise'],
  [0.10, 'ten paise'],
  [0.50, 'fifty paise'],
  [0.99, 'ninety-nine paise'],

  // Rupees and paise
  [1.01, 'one rupee and one paisa'],
  [1.50, 'one rupee and fifty paise'],
  [2.02, 'two rupees and two paise'],
  [42.50, 'forty-two rupees and fifty paise'],
  [100.99, 'one hundred rupees and ninety-nine paise'],
  [1000.01, 'one thousand rupees and one paisa'],

  // Large amounts
  [100000.50, 'one lakh rupees and fifty paise'],
  [10000000.01, 'one crore rupees and one paisa'],

  // Negative amounts
  [-1, 'minus one rupee'],
  [-0.50, 'minus fifty paise'],
  [-42.50, 'minus forty-two rupees and fifty paise'],

  // Without "and" option
  [42.50, 'forty-two rupees fifty paise', { and: false }],
  [1.01, 'one rupee one paisa', { and: false }],

  // Edge cases: .00 paise should show rupees only
  [5.00, 'five rupees'],
  ['5.00', 'five rupees'],
  [100.00, 'one hundred rupees'],

  // String inputs
  ['42.50', 'forty-two rupees and fifty paise'],
  ['0.99', 'ninety-nine paise'],

  // BigInt (whole rupees only)
  [100000000000n, 'one kharab rupees']
]
