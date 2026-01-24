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
