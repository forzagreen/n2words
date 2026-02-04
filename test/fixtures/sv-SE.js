/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0, 'noll'],
  [1, 'ett'],
  [2, 'två'],
  [10, 'tio'],
  [11, 'elva'],
  [14, 'fjorton'],
  [20, 'tjugo'],
  [21, 'tjugo-ett'],
  [99, 'nittio-nio'],
  [100, 'hundra'],
  [101, 'hundra och ett'],
  [115, 'hundra och femton'],
  [200, 'två hundra'],
  [1000, 'tusen'],
  [1234, 'tusen två hundra och trettio-fyra'],
  [2000, 'två tusen'],
  [1000000, 'en miljon'],
  [-5, 'minus fem'],
  ['3.05', 'tre komma noll fem']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms 1-12
  [1, 'första'],
  [2, 'andra'],
  [3, 'tredje'],
  [4, 'fjärde'],
  [5, 'femte'],
  [6, 'sjätte'],
  [7, 'sjunde'],
  [8, 'åttonde'],
  [9, 'nionde'],
  [10, 'tionde'],
  [11, 'elfte'],
  [12, 'tolfte'],

  // Regular forms (cardinal + de)
  [13, 'trettonde'],
  [14, 'fjortonde'],
  [15, 'femtonde'],
  [19, 'nittonde'],
  [20, 'tjugode'],
  [21, 'tjugo-ettde'],
  [30, 'trettiode'],
  [42, 'fyrtio-tvåde'],
  [99, 'nittio-niode'],

  // Hundreds
  [100, 'hundrade'],
  [101, 'hundra och ettde'],
  [200, 'två hundrade'],

  // Thousands
  [1000, 'tusende'],
  [1001, 'tusen och ettde']
]

/**
 * Currency test cases (Swedish Krona)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'noll kronor'],

  // Whole kronor
  [1, 'en krona'],
  [2, 'två kronor'],
  [5, 'fem kronor'],
  [10, 'tio kronor'],
  [21, 'tjugo-ett kronor'],
  [42, 'fyrtio-två kronor'],
  [100, 'hundra kronor'],
  [1000, 'tusen kronor'],

  // Öre only
  [0.01, 'ett öre'],
  [0.25, 'tjugo-fem öre'],
  [0.50, 'femtio öre'],
  [0.99, 'nittio-nio öre'],

  // Kronor and öre
  [1.01, 'en krona och ett öre'],
  [1.50, 'en krona och femtio öre'],
  [42.50, 'fyrtio-två kronor och femtio öre'],
  [100.99, 'hundra kronor och nittio-nio öre'],

  // Negative amounts
  [-1, 'minus en krona'],
  [-42.50, 'minus fyrtio-två kronor och femtio öre'],

  // Edge cases
  [5.00, 'fem kronor'],
  ['5.00', 'fem kronor']
]
