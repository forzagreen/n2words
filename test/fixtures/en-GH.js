/**
 * Ghanaian English test cases
 * Format: [input, expected_output, options?]
 *
 * Ghanaian English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - Short scale (billion = 10^9)
 * - Currency: Ghanaian Cedi (GHS) - cedi/cedis, pesewa/pesewas
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

export const currency = [
  [0, 'zero cedis'],
  [1, 'one cedi'],
  [2, 'two cedis'],
  [0.01, 'one pesewa'],
  [0.02, 'two pesewas'],
  [0.50, 'fifty pesewas'],
  [1.01, 'one cedi and one pesewa'],
  [42.50, 'forty-two cedis and fifty pesewas'],
  [-42.50, 'minus forty-two cedis and fifty pesewas'],
  [42.50, 'forty-two cedis fifty pesewas', { and: false }],
  [5.00, 'five cedis']
]
