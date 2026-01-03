/**
 * Test fixtures for Finnish (fi) language
 *
 * Format: [input, expected_output]
 * - input: number, bigint, or string to convert
 * - expected_output: expected string result
 */
export default [
  // Basic numbers (0-10)
  [0, 'nolla'],
  [1, 'yksi'],
  [2, 'kaksi'],
  [3, 'kolme'],
  [4, 'neljä'],
  [5, 'viisi'],
  [6, 'kuusi'],
  [7, 'seitsemän'],
  [8, 'kahdeksan'],
  [9, 'yhdeksän'],
  [10, 'kymmenen'],

  // Teens (11-19) - use "-toista" suffix
  [11, 'yksitoista'],
  [12, 'kaksitoista'],
  [13, 'kolmetoista'],
  [14, 'neljätoista'],
  [15, 'viisitoista'],
  [16, 'kuusitoista'],
  [17, 'seitsemäntoista'],
  [18, 'kahdeksantoista'],
  [19, 'yhdeksäntoista'],

  // Tens (20-90) - compound with units, no space
  [20, 'kaksikymmentä'],
  [21, 'kaksikymmentäyksi'],
  [22, 'kaksikymmentäkaksi'],
  [30, 'kolmekymmentä'],
  [42, 'neljäkymmentäkaksi'],
  [50, 'viisikymmentä'],
  [67, 'kuusikymmentäseitsemän'],
  [99, 'yhdeksänkymmentäyhdeksän'],

  // Hundreds - "yksi" omitted before sata
  [100, 'sata'],
  [101, 'sata yksi'],
  [110, 'sata kymmenen'],
  [111, 'sata yksitoista'],
  [123, 'sata kaksikymmentäkolme'],
  [200, 'kaksi sata'],
  [500, 'viisi sata'],
  [999, 'yhdeksän sata yhdeksänkymmentäyhdeksän'],

  // Thousands - "yksi" omitted before tuhat
  [1000, 'tuhat'],
  [1001, 'tuhat yksi'],
  [1100, 'tuhat sata'],
  [1234, 'tuhat kaksi sata kolmekymmentäneljä'],
  [2000, 'kaksi tuhat'],
  [10000, 'kymmenen tuhat'],
  [100000, 'sata tuhat'],

  // Millions - "yksi" kept before miljoona
  [1000000, 'yksi miljoona'],
  [2000000, 'kaksi miljoona'],
  [1000001, 'yksi miljoona yksi'],

  // Billions (miljardi)
  [1000000000, 'yksi miljardi'],

  // Negatives
  [-1, 'miinus yksi'],
  [-42, 'miinus neljäkymmentäkaksi'],

  // Decimals
  ['3.14', 'kolme pilkku yksi neljä'],
  ['0.5', 'nolla pilkku viisi'],

  // BigInt
  [BigInt(999), 'yhdeksän sata yhdeksänkymmentäyhdeksän']
]
