/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zero point zero one'],
  [0.007, 'zero point zero zero seven'],
  [17.42, 'seventeen point forty-two'],
  [27.312, 'twenty-seven point three hundred and twelve'],
  [53.486, 'fifty-three point four hundred and eighty-six'],
  [300.42, 'three hundred point forty-two'],
  [4196.42, 'four thousand one hundred and ninety-six point forty-two'],

  [-17.42, 'minus seventeen point forty-two'],
  [-1, 'minus one'],
  [-20, 'minus twenty'],

  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [5.5, 'five point five'],
  [11, 'eleven'],
  [12, 'twelve'],
  [16, 'sixteen'],
  [19, 'nineteen'],
  [20, 'twenty'],
  [21, 'twenty-one'],
  [26, 'twenty-six'],
  [28, 'twenty-eight'],
  [30, 'thirty'],
  [31, 'thirty-one'],
  [40, 'forty'],
  [44, 'forty-four'],
  [50, 'fifty'],
  [55, 'fifty-five'],
  [60, 'sixty'],
  [67, 'sixty-seven'],
  [70, 'seventy'],
  [79, 'seventy-nine'],
  [89, 'eighty-nine'],
  [95, 'ninety-five'],
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [199, 'one hundred and ninety-nine'],
  [203, 'two hundred and three'],
  [287, 'two hundred and eighty-seven'],
  [356, 'three hundred and fifty-six'],
  [400, 'four hundred'],
  [434, 'four hundred and thirty-four'],
  [578, 'five hundred and seventy-eight'],
  [689, 'six hundred and eighty-nine'],
  [729, 'seven hundred and twenty-nine'],
  [894, 'eight hundred and ninety-four'],
  [999, 'nine hundred and ninety-nine'],
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [1097, 'one thousand and ninety-seven'],
  [1104, 'one thousand one hundred and four'],
  [1243, 'one thousand two hundred and forty-three'],
  [2385, 'two thousand three hundred and eighty-five'],
  [3766, 'three thousand seven hundred and sixty-six'],
  [4196, 'four thousand one hundred and ninety-six'],
  [5846, 'five thousand eight hundred and forty-six'],
  [6459, 'six thousand four hundred and fifty-nine'],
  [7232, 'seven thousand two hundred and thirty-two'],
  [8569, 'eight thousand five hundred and sixty-nine'],
  [9539, 'nine thousand five hundred and thirty-nine'],
  [1_000_000, 'one million'],
  [1_000_001, 'one million and one'],
  [4_000_000, 'four million'],
  [10_000_000_000_000, 'ten trillion'],
  [100_000_000_000_000, 'one hundred trillion'],
  [9_007_199_254_740_995n, 'nine quadrillion seven trillion one hundred and ninety-nine billion two hundred and fifty-four million seven hundred and forty thousand nine hundred and ninety-five'],
  [1_000_000_000_000_000_000n, 'one quintillion'],
  [1_000_000_000_000_000_000_000n, 'one sextillion'],
  [10_000_000_000_000_000_000_000_000n, 'ten septillion'],

  // Extended scales (10^27 to 10^63)
  [1_000_000_000_000_000_000_000_000_000n, 'one octillion'],
  [1_000_000_000_000_000_000_000_000_000_000n, 'one nonillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000n, 'one decillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000n, 'one undecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one duodecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one tredecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one quattuordecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one quindecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one sexdecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one septendecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one octodecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one novemdecillion'],
  [1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n, 'one vigintillion'],

  // Combined large number test
  [
    999_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n +
    123_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n,
    'nine hundred and ninety-nine vigintillion one hundred and twenty-three novemdecillion'
  ]
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
  [23, 'twenty-third'],
  [24, 'twenty-fourth'],
  [32, 'thirty-second'],
  [42, 'forty-second'],
  [53, 'fifty-third'],
  [67, 'sixty-seventh'],
  [88, 'eighty-eighth'],
  [99, 'ninety-ninth'],

  // Hundreds
  [100, 'one hundredth'],
  [101, 'one hundred first'],
  [102, 'one hundred second'],
  [103, 'one hundred third'],
  [110, 'one hundred tenth'],
  [111, 'one hundred eleventh'],
  [112, 'one hundred twelfth'],
  [120, 'one hundred twentieth'],
  [121, 'one hundred twenty-first'],
  [200, 'two hundredth'],
  [300, 'three hundredth'],
  [500, 'five hundredth'],
  [999, 'nine hundred ninety-ninth'],

  // Thousands
  [1000, 'one thousandth'],
  [1001, 'one thousand first'],
  [1010, 'one thousand tenth'],
  [1100, 'one thousand one hundredth'],
  [1111, 'one thousand one hundred eleventh'],
  [2000, 'two thousandth'],
  [5000, 'five thousandth'],
  [10000, 'ten thousandth'],
  [12345, 'twelve thousand three hundred forty-fifth'],
  [99999, 'ninety-nine thousand nine hundred ninety-ninth'],

  // Larger scales
  [1_000_000, 'one millionth'],
  [1_000_001, 'one million first'],
  [2_000_000, 'two millionth'],
  [1_000_000_000, 'one billionth'],
  [1_000_000_000_000, 'one trillionth'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'one quintillionth'],
  [1_000_000_000_000_000_000_000n, 'one sextillionth']
]

/**
 * Currency test cases (British Pound Sterling)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero pounds'],

  // Whole pounds (singular/plural)
  [1, 'one pound'],
  [2, 'two pounds'],
  [10, 'ten pounds'],
  [100, 'one hundred pounds'],
  [1000, 'one thousand pounds'],
  [1000000, 'one million pounds'],

  // Pence only (singular/plural)
  [0.01, 'one penny'],
  [0.02, 'two pence'],
  [0.10, 'ten pence'],
  [0.50, 'fifty pence'],
  [0.99, 'ninety-nine pence'],

  // Pounds and pence
  [1.01, 'one pound and one penny'],
  [1.50, 'one pound and fifty pence'],
  [2.02, 'two pounds and two pence'],
  [42.50, 'forty-two pounds and fifty pence'],
  [100.99, 'one hundred pounds and ninety-nine pence'],
  [1000.01, 'one thousand pounds and one penny'],
  [1000000.01, 'one million pounds and one penny'],

  // Negative amounts
  [-1, 'minus one pound'],
  [-0.50, 'minus fifty pence'],
  [-42.50, 'minus forty-two pounds and fifty pence'],

  // Without "and" option
  [42.50, 'forty-two pounds fifty pence', { and: false }],
  [1.01, 'one pound one penny', { and: false }],

  // Edge cases: .00 pence should show pounds only
  [5.00, 'five pounds'],
  ['5.00', 'five pounds'],
  [100.00, 'one hundred pounds'],

  // String inputs
  ['42.50', 'forty-two pounds and fifty pence'],
  ['0.99', 'ninety-nine pence'],

  // BigInt (whole pounds only)
  [1000000000000n, 'one trillion pounds']
]
