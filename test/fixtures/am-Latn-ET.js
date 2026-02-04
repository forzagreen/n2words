/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Basic numbers (0-10)
  [0, 'zero'],
  [1, 'and'],
  [2, 'hulet'],
  [3, 'sost'],
  [4, 'arat'],
  [5, 'amist'],
  [6, 'siddist'],
  [7, 'sebat'],
  [8, 'siment'],
  [9, 'zeteny'],
  [10, 'asir'],

  // Teens (11-19) - formed with asra + unit
  [11, 'asra and'],
  [12, 'asra hulet'],
  [13, 'asra sost'],
  [14, 'asra arat'],
  [15, 'asra amist'],
  [16, 'asra siddist'],
  [17, 'asra sebat'],
  [18, 'asra siment'],
  [19, 'asra zeteny'],

  // Tens (20-90)
  [20, 'haya'],
  [30, 'selasa'],
  [40, 'arba'],
  [50, 'hamsa'],
  [60, 'silsa'],
  [70, 'seba'],
  [80, 'semanya'],
  [90, 'zetena'],

  // Compound numbers (21-99)
  [21, 'haya and'],
  [35, 'selasa amist'],
  [42, 'arba hulet'],
  [99, 'zetena zeteny'],

  // Hundreds
  [100, 'and meto'],
  [101, 'and meto and'],
  [110, 'and meto asir'],
  [200, 'hulet meto'],
  [500, 'amist meto'],
  [999, 'zeteny meto zetena zeteny'],

  // Thousands
  [1000, 'and shi'],
  [1001, 'and shi and'],
  [2000, 'hulet shi'],
  [10000, 'asir shi'],
  [100000, 'and meto shi'],

  // Millions
  [1000000, 'and miliyon'],
  [2000000, 'hulet miliyon'],

  // Billions
  [1000000000, 'and billiyon'],

  // Negative numbers
  [-1, 'asitegna and'],
  [-5, 'asitegna amist'],
  [-42, 'asitegna arba hulet'],

  // Decimals
  ['3.14', 'sost netib and arat'],
  ['0.5', 'zero netib amist'],

  // BigInt
  [BigInt(999), 'zeteny meto zetena zeteny']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals
  [1, 'andenya'],
  [2, 'huletnya'],
  [3, 'sostnya'],
  [4, 'aratnya'],
  [5, 'amistnya'],
  [6, 'siddistnya'],
  [7, 'sebatnya'],
  [8, 'simentnya'],
  [9, 'zetenynya'],
  [10, 'asirnya'],

  // Teens
  [11, 'asra andnya'],
  [12, 'asra huletnya'],
  [19, 'asra zetenynya'],

  // Tens
  [20, 'hayanya'],
  [30, 'selasanya'],
  [42, 'arba huletnya'],
  [99, 'zetena zetenynya'],

  // Hundreds
  [100, 'and metonya'],
  [101, 'and meto andnya'],
  [200, 'hulet metonya'],

  // Thousands
  [1000, 'and shinya'],
  [1001, 'and shi andnya'],
  [2000, 'hulet shinya'],

  // Larger
  [1_000_000, 'and miliyonnya']
]

/**
 * Currency test cases (Ethiopian Birr)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero birr'],

  // Whole birr
  [1, 'and birr'],
  [2, 'hulet birr'],
  [10, 'asir birr'],
  [100, 'and meto birr'],
  [1000, 'and shi birr'],

  // Santim only
  [0.01, 'and santim'],
  [0.02, 'hulet santim'],
  [0.50, 'hamsa santim'],
  [0.99, 'zetena zeteny santim'],

  // Birr and santim
  [1.01, 'and birr and santim'],
  [42.50, 'arba hulet birr hamsa santim'],
  [1000.99, 'and shi birr zetena zeteny santim'],

  // Negative amounts
  [-1, 'asitegna and birr'],
  [-42.50, 'asitegna arba hulet birr hamsa santim'],

  // Edge cases
  [5.00, 'amist birr'],
  ['5.00', 'amist birr']
]
