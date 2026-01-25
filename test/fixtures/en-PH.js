/**
 * Philippine English test cases
 * Format: [input, expected_output, options?]
 *
 * Philippine English follows British English conventions:
 * - "and" after hundreds: "one hundred and twenty-three"
 * - Short scale (billion = 10^9)
 * - Currency: Philippine Peso (PHP) - peso/pesos, centavo/centavos
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
  [0, 'zero pesos'],
  [1, 'one peso'],
  [2, 'two pesos'],
  [0.01, 'one centavo'],
  [0.02, 'two centavos'],
  [0.50, 'fifty centavos'],
  [1.01, 'one peso and one centavo'],
  [42.50, 'forty-two pesos and fifty centavos'],
  [-42.50, 'minus forty-two pesos and fifty centavos'],
  [42.50, 'forty-two pesos fifty centavos', { and: false }],
  [5.00, 'five pesos']
]
