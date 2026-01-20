/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zero point zero one'],
  [0.007, 'zero point zero zero seven'],
  [17.42, 'seventeen point forty-two'],
  [27.312, 'twenty-seven point three hundred twelve'],
  [53.486, 'fifty-three point four hundred eighty-six'],
  [300.42, 'three hundred point forty-two'],
  [4196.42, 'four thousand one hundred ninety-six point forty-two'],

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
  [101, 'one hundred one'],
  [199, 'one hundred ninety-nine'],
  [203, 'two hundred three'],
  [287, 'two hundred eighty-seven'],
  [356, 'three hundred fifty-six'],
  [400, 'four hundred'],
  [434, 'four hundred thirty-four'],
  [578, 'five hundred seventy-eight'],
  [689, 'six hundred eighty-nine'],
  [729, 'seven hundred twenty-nine'],
  [894, 'eight hundred ninety-four'],
  [999, 'nine hundred ninety-nine'],
  [1000, 'one thousand'],
  [1001, 'one thousand one'],
  [1097, 'one thousand ninety-seven'],
  [1104, 'one thousand one hundred four'],
  [1243, 'one thousand two hundred forty-three'],
  [2385, 'two thousand three hundred eighty-five'],
  [3766, 'three thousand seven hundred sixty-six'],
  [4196, 'four thousand one hundred ninety-six'],
  [5846, 'five thousand eight hundred forty-six'],
  [6459, 'six thousand four hundred fifty-nine'],
  [7232, 'seven thousand two hundred thirty-two'],
  [8569, 'eight thousand five hundred sixty-nine'],
  [9539, 'nine thousand five hundred thirty-nine'],
  [1_000_000, 'one million'],
  [1_000_001, 'one million one'],
  [4_000_000, 'four million'],
  [10_000_000_000_000, 'ten trillion'],
  [100_000_000_000_000, 'one hundred trillion'],
  [9_007_199_254_740_995n, 'nine quadrillion seven trillion one hundred ninety-nine billion two hundred fifty-four million seven hundred forty thousand nine hundred ninety-five'],
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
    'nine hundred ninety-nine vigintillion one hundred twenty-three novemdecillion'
  ],

  // Hundred-pairing option (colloquial American English)
  [1100, 'eleven hundred', { hundredPairing: true }],
  [1500, 'fifteen hundred', { hundredPairing: true }],
  [1999, 'nineteen hundred ninety-nine', { hundredPairing: true }],
  [2300, 'twenty-three hundred', { hundredPairing: true }],
  [5050, 'fifty hundred fifty', { hundredPairing: true }],
  [9900, 'ninety-nine hundred', { hundredPairing: true }],
  [9999, 'ninety-nine hundred ninety-nine', { hundredPairing: true }],

  // Hundred-pairing edge cases (should NOT apply)
  [1000, 'one thousand', { hundredPairing: true }],
  [1099, 'one thousand ninety-nine', { hundredPairing: true }],
  [10000, 'ten thousand', { hundredPairing: true }],

  // "and" option (informal American English, matches British style)
  [101, 'one hundred and one', { and: true }],
  [123, 'one hundred and twenty-three', { and: true }],
  [1001, 'one thousand and one', { and: true }],
  [1100, 'one thousand one hundred', { and: true }],
  [1101, 'one thousand one hundred and one', { and: true }],
  [2020, 'two thousand and twenty', { and: true }],
  [1000001, 'one million and one', { and: true }],
  [1001001, 'one million one thousand and one', { and: true }],
  [1000000001, 'one billion and one', { and: true }],

  // Combined "and" with hundred-pairing
  [1501, 'fifteen hundred and one', { and: true, hundredPairing: true }],
  [1523, 'fifteen hundred and twenty-three', { and: true, hundredPairing: true }]
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
