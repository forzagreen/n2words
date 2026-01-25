/**
 * Malaysian English test cases
 * Format: [input, expected_output, options?]
 *
 * Malaysian English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - Short scale (billion = 10^9)
 * - Currency: Malaysian Ringgit (MYR) - ringgit and sen are invariable
 */
export const cardinal = [
  [0, 'zero'],
  [1, 'one'],
  [21, 'twenty-one'],
  [42, 'forty-two'],
  [100, 'one hundred'],
  [101, 'one hundred and one'],
  [1000, 'one thousand'],
  [1001, 'one thousand and one'],
  [1000000, 'one million'],
  [-42, 'minus forty-two'],
  [3.14, 'three point fourteen']
]

export const ordinal = [
  [1, 'first'],
  [2, 'second'],
  [3, 'third'],
  [21, 'twenty-first'],
  [42, 'forty-second'],
  [100, 'one hundredth'],
  [101, 'one hundred first'],
  [1000, 'one thousandth']
]

/**
 * Currency test cases (Malaysian Ringgit - MYR)
 * Note: Both "ringgit" and "sen" are invariable (same for singular and plural)
 */
export const currency = [
  [0, 'zero ringgit'],
  [1, 'one ringgit'],
  [2, 'two ringgit'],
  [0.01, 'one sen'],
  [0.02, 'two sen'],
  [0.50, 'fifty sen'],
  [1.01, 'one ringgit and one sen'],
  [42.50, 'forty-two ringgit and fifty sen'],
  [-42.50, 'minus forty-two ringgit and fifty sen'],
  [42.50, 'forty-two ringgit fifty sen', { and: false }],
  [5.00, 'five ringgit']
]
